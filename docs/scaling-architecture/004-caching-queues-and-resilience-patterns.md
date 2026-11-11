# Scaling Architecture: Caching Strategy, Message Queues, Cache Invalidation, and Cache Herd Resilience Patterns

> **Document ID:** `VIALIQ-SCALE-004`  
> **Domain:** Platform Scalability — Single-Tier Distributed Redis Caching, Message Queues & Stampede Protection  
> **Canonical Caching Structure:** Works together with [ADR 007-A (Security & Isolation)](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md), [ADR 007-B (HA Redis Cluster)](../critical-problems-and-adrs/007-b-high-availability-redis-cluster-and-scaling-guide.md), and [ADR 008 (Amendment Cache Warming)](../critical-problems-and-adrs/008-protocol-amendment-cache-invalidation-and-epoch-rotation-adr.md)  
> **Status:** Accepted  
> **Date:** October 22, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** Redis 7.2+ Sentinel HA (Non-Clustered: 1 Primary + 2 Replicas + 3 Sentinels in Prod), RabbitMQ 3.13+ / Azure Service Bus, ASP.NET Core 9.0 (`StackExchange.Redis`), Hangfire  
> **Related Documents:**
> - [Scale 001: Database Horizontal Scaling & Sharding](./001-database-horizontal-scaling-and-sharding.md)
> - [Scale 002: Global Load Balancing & Ingress Routing](./002-global-load-balancing-and-traffic-routing.md)
> - [API ADR 005: Foundations, Auth & SignalR Real-Time](../backend-architecture/api/005-api-foundations-auth-override-engine-and-realtime-adr.md)
> - [Database Spec 005: Operational Pillars, Backup, Locking & Archival](../backend-architecture/database/005-database-operational-pillars-backup-locking-dictionaries-and-archival.md)

---

## 1. Executive Summary & Problem Statement

In a life-sciences EDC platform, caching and asynchronous queues present a delicate architectural tension:
1. **Strict GxP Data Consistency vs. High-Throughput Caching**:
   - Patient safety data, e-signatures, and audit trails must be **strongly consistent (ACID)**. Serving stale clinical data could lead an investigator to administer a dangerous dose based on outdated lab results.
   - Conversely, querying complex JSON Form Schemas, CDISC MedDRA dictionaries (over 80,000 medical terms), and tenant metadata directly from MongoDB on every click collapses database throughput.
2. **The Cache Herd / Thundering Herd Vulnerability**:
   - When a heavily queried clinical cache key expires (e.g. `form_schema:vital_signs:v1`), hundreds of concurrent investigators simultaneously experience a cache miss, collectively slamming the MongoDB primary cluster with identical expensive aggregation queries, precipitating a cascading connection pool collapse.
3. **Burst Heavy Processing**:
   - 100,000-page CDISC ODM-XML exports and Serious Adverse Event (SAE) regulatory notifications must be offloaded from Kestrel HTTP threads to a resilient, backpressure-controlled message queue.

To resolve these challenges, Vialiq implements a **Distributed Redis Caching Tier** paired with **Enterprise RabbitMQ Message Queuing**.

```
                   CACHING & ASYNCHRONOUS MESSAGING TOPOLOGY
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
Distributed Redis Cache (StackExchange.Redis)                 Asynchronous Message Queue (RabbitMQ)
• Sub-millisecond schema & codelist lookup (< 1 ms)           • Topic Exchange: `edc.clinical.events`
• Form concurrency single-editor locking                      • CDISC ODM & SAS Export Workers
• Cluster backplane for cross-pod invalidation                • Dead Letter Exchanges (DLX) & Retries
• Probabilistic Early Refresh (XFetch Algorithm)              • Prefetch Backpressure & Idempotent Consumer
```

---

## 2. Single-Tier Distributed Caching Architecture: High-Availability Redis

> **Architectural Standard (Zero `.NET IMemoryCache` / Zero Pod-Local L1 Cache):**  
> Vialiq enforces a **Single-Tier Distributed Redis Cache** across all API instances. Pod-local `.NET IMemoryCache` L1 caches are **intentionally eliminated** to prevent multi-pod stale state, race conditions, and complex L1 eviction broadcasts.

Redis provides sub-millisecond (`< 1–2 ms`) distributed caching across all API instances inside each region's VPC, eliminating database load for invariant clinical definitions:

```
ASP.NET Core 9 API Pod
┌────────────────────────────────────────────────────────────────────────┐
│ IScopedCacheService.GetOrCreateStudyAsync("schema:vitals:v1", factory) │
│                                                                        │
│ 1. Check Redis Distributed Cache (StackExchange.Redis)                 │
│    └── Cache Hit? ──► Deserialize JSON & Return in < 1 millisecond     │
│                                                                        │
│ 2. Cache Miss (or 0.001% Total HA Outage Circuit Breaker)?             │
│    └── Query MongoDB Primary ──► Sync to Redis (if active) & Return    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Canonical Read Query
┌───────────────────────────────────▼────────────────────────────────────┐
│ MongoDB Production Cluster (`rs-prod:27037`)                           │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Configuration in `backend/api/src/Vialiq.Api/Program.cs`

```csharp
var builder = WebApplication.CreateBuilder(args);

// Register Redis Connection Multiplexer & Scoped Cache Services
builder.Services.AddVialiqCaching(builder.Configuration);
```
```

---

## 3. Resolving the Cache Herd / Thundering Herd Problem

A **Cache Stampede (Thundering Herd)** occurs when:
1. A hot key (e.g. `schema:demographics:v1`) expires at `10:00:00 AM`.
2. At `10:00:01 AM`, 1,500 active clinical coordinators open the form simultaneously.
3. All 1,500 requests miss the cache at the exact same millisecond.
4. All 1,500 threads execute the database query concurrently, exhausting MongoDB socket pools and CPU.

Vialiq mitigates this through **3 complementary defenses**:

### Defense 1: Redis Fast-Path, Total-Outage Redirect & SemaphoreSlim Protection
Under distributed Redis caching, queries check Redis memory in $< 1\text{ ms}$:
- On hit, the deserialized schema is returned immediately with zero database round-trips.
- On miss (when Redis is healthy), a single-flight database factory queries MongoDB Primary and synchronously populates Redis with an explicit TTL (consistent with the strict DB + Cache model in `ADR 007-A`; in the `~0.001%` total HA outage where both Primary and Replica are unavailable, a single session circuit-breaker check redirects directly to MongoDB).

```csharp
namespace Vialiq.Infrastructure.Services;

using Vialiq.Caching.Abstractions;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Form;

public sealed class CachedFormDefinitionService : IFormDefinitionService
{
    private readonly IScopedCacheService _cache;
    private readonly IMongoDatabaseFactory _dbFactory;

    public CachedFormDefinitionService(IScopedCacheService cache, IMongoDatabaseFactory dbFactory)
    {
        _cache = cache;
        _dbFactory = dbFactory;
    }

    public async Task<FormSchemaDto> GetFormSchemaAsync(string studyId, string formId, int version, CancellationToken ct)
    {
        return await _cache.GetOrCreateStudyAsync(
            "schema",
            $"{formId}:v{version}",
            async token =>
            {
                var db = _dbFactory.GetStudyDatabase();
                var collection = db.GetCollection<FormDefinitionEntity>("form_definitions");
                var entity = await collection.Find(f => f.FormId == formId && f.Version == version).FirstOrDefaultAsync(token);
                return entity.ToDto();
            },
            ct);
    }
}
```

### Defense 2: Probabilistic Early Expiration (The XFetch Algorithm)
For ultra-critical reference dictionaries (e.g. MedDRA and WHODrug), we prevent expiration entirely using the **XFetch probabilistic early refresh algorithm**:

$$\Delta t - \beta \cdot \ln(\text{rand}()) \cdot \delta > \text{TTL}$$

Where:
* $\Delta t$: Remaining time to live.
* $\beta$: Aggressiveness multiplier ($\beta > 0$).
* $\delta$: Time taken to compute the value from the database.
* $\text{rand}()$: Random float between 0 and 1.

As the key nears expiration, incoming read requests calculate the probability of being the designated background refresher. A request probabilistically triggers an asynchronous background database fetch to refresh the key **before it ever expires**, ensuring the cache hit ratio for hot dictionaries remains **99.99%**.

### Defense 3: Jittered Expiration (Preventing Simultaneous Mass Expiry)
When caching large collections of items (e.g., all 50 site configurations for a study), setting a fixed 1-hour expiration guarantees that all 50 keys expire at the exact same second.  
We add **randomized jitter ($\pm 15\%$)** to all expirations:
```csharp
var jitterSeconds = Random.Shared.Next(-300, 300); // +/- 5 minutes
var expiration = TimeSpan.FromHours(1).Add(TimeSpan.FromSeconds(jitterSeconds));
```

---

## 4. Cache Invalidation & Instant Cluster-Wide Consistency

In life sciences, when a Protocol Amendment publishes a new form version, or an investigator changes an active codelist, stale cache entries must disappear immediately across every API pod.

### 4.1 Instant Redis Point Eviction (No Pod L1 Synchronization Needed)
Because the platform uses **Single-Tier Distributed Redis** with **zero pod-local `.NET IMemoryCache` instances**, deleting or replacing a key directly in Redis immediately makes the updated state visible to Pods 1 through 50 without per-pod L1 memory purging:

```
Admin updates Codelist / Lock on Pod 1
                  │
                  ▼
       [ Direct Redis Mutation ]
       KeyDeleteAsync / StringSetAsync
       on Shared Distributed Redis HA
                  │
         ┌────────┴────────┐
         ▼                 ▼
     API Pod 2         API Pod 50
  Reads Shared Redis  Reads Shared Redis
  (< 1–2 ms coherent) (< 1–2 ms coherent)
```

*(Note: For formal multi-form Protocol Amendments, see [ADR 008](../critical-problems-and-adrs/008-protocol-amendment-cache-invalidation-and-epoch-rotation-adr.md) for version-scoped pre-warmed cache builds inside the maintenance window. For ~75–85% `Single` zone studies, invalidation executes 100% against local Redis; for ~15–25% `MultiRegionGeoPartitioned` studies, Control-Plane Outbox fans out metadata epochs, role/blinding updates, and JWT revocations across all registered regional `Zones[]`.)*

### Distributed Cache Invalidator Implementation:

```csharp
namespace Vialiq.Infrastructure.Caching;

using StackExchange.Redis;
using System.Threading.Tasks;

public sealed class DistributedCacheInvalidator
{
    private readonly IConnectionMultiplexer _redis;
    private const string AuditEventChannel = "vialiq:cache:audit-events";

    public DistributedCacheInvalidator(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task InvalidateKeyGloballyAsync(string cacheKey)
    {
        // Delete key directly in Shared Distributed Redis (synchronous dual-write per ADR 007-A)
        // Because zero pod-local IMemoryCache exists, all 50 API pods see the eviction immediately.
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync(cacheKey).ConfigureAwait(false);

        // Optional lightweight event broadcast for observability/SignalR notifications
        var pub = _redis.GetSubscriber();
        await pub.PublishAsync(RedisChannel.Literal(AuditEventChannel), cacheKey).ConfigureAwait(false);
    }
}
```

---

## 5. Asynchronous Message Queue Topology (RabbitMQ / Service Bus)

Unlike relational engines (which rely on internal DB triggers or SQL Server Agent jobs), **MongoDB has no built-in database job scheduler**. Keeping MongoDB strictly for ACID persistence & queries avoids starving clinical API traffic ([Database Spec 004](../backend-architecture/database/004-background-jobs-protocol-migration-and-auto-query-engine.md#1-executive-summary-why-mongodb-does-not-compromise-jobs)). Instead, event-driven EDC reactions and tasks exceeding **200ms of compute or external IO** run via stateless `.NET 9` workers + **RabbitMQ** (plus MongoDB Change Streams & Hangfire):

```
                               RABBITMQ TOPOLOGY
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
Exchange: `edc.clinical.events` (Topic)                       Exchange: `edc.jobs.direct` (Direct)
• Routing Key: `study.export.odm`                             • Routing Key: `job.export.cdisc`
• Routing Key: `subject.safety.adverse_event`                 • Routing Key: `job.audit.archival`
        │                                                             │
        ├──────────────────────────────┐                              ├──────────────────────────────┐
        ▼                              ▼                              ▼                              ▼
Queue: `q.exports.cdisc`      Queue: `q.safety.alerts`        Queue: `q.pdf.patient-book`    Queue: `q.dead-letter`
(Workers stream ODM-XML)      (Workers send email/SMS)        (Workers compile PDF/A)        (Poison message DLX)
```

### 5.1 RabbitMQ Resilience Rules

#### 1. Dead Letter Exchange (DLX) & Retry Topology
Messages that fail due to transient errors (e.g. S3 timeout) are retried with exponential backoff up to **3 times**. If processing fails permanently, only non-PHI metadata (`correlationId`, `traceparent`, `eventId`, `studyId`, `errorCode`) is emitted to telemetry/SIEM, while full dead-letter payloads (`q.dead-letter` / `cdc_quarantine_records`) remain encrypted at rest inside the origin regional boundary for GxP triage.

#### 2. Prefetch Limit & Backpressure
Worker pods configure a strict prefetch count:
```csharp
channel.BasicQos(prefetchSize: 0, prefetchCount: 10, global: false);
```
This prevents a fast publisher from overwhelming a worker pod with 5,000 multi-gigabyte export tasks, maintaining memory stability.

#### 3. Idempotent Consumer & Distributed Trace Continuity
API handlers **never dual-write** critical domain events to MongoDB and RabbitMQ separately: writes commit atomically in MongoDB (`w: "majority"`) via collection **Change Streams** or an in-transaction **`_event_outbox`** collection tailed by regional `.NET 9` workers (zero extra infra for 75% `Single` studies). Every clinical event propagates both OpenTelemetry W3C `traceparent` and `X-Correlation-Id` alongside `EventId` so traces link seamlessly from API request $\rightarrow$ worker $\rightarrow$ `Vialiq.CdcWorker`. Consumers treat Redis as a fast Level-1 short-circuit, backed by a **durable DB idempotency guard** (`_processed_events` unique index in MongoDB or SQL `MERGE`) so retries past the 7-day TTL or during Redis failover never duplicate work:
```csharp
var isProcessed = await _redisDb.StringSetAsync(
    $"processed:{eventId}", "1", TimeSpan.FromDays(7), When.NotExists);

if (!isProcessed)
{
    // Duplicate message detected; acknowledge and skip
    channel.BasicAck(ea.DeliveryTag, multiple: false);
    return;
}
```

---

## 6. Caching & Messaging SLA Scorecard

| Operation | Without Caching / Queues | With Single-Tier Redis & RabbitMQ | Scalability Multiplier |
|---|---|---|---|
| **Form Schema Fetch** | 45 ms (MongoDB Aggregation) | **< 1–2 ms (Distributed Redis)** | **25x–45x Faster** |
| **MedDRA Dictionary Search** | 120 ms (Full-text index) | **< 2 ms (Distributed Redis)** | **60x Faster** |
| **Cache Expiration Surge (Herd)** | Database connection pool collapse | **Single-Flight Lock (1 query only)** | **100% Collapse Immune** |
| **100k-Page CDISC ODM Export** | Crashes HTTP thread (504 Gateway Timeout) | **Asynchronous Worker Queue (HTTP 202)** | **Zero Web Latency Impact** |
| **Pod Cache Coherence** | Stale L1 pod memory drift | **Immediate Shared Redis Consistency** | **Zero Pod Stale Reads** |

---

## 7. Production Scale Targets & Sizing Benchmarks

To ensure the caching, queuing, and API tiers withstand large-scale global trials, the platform adheres to quantified production scale targets:

```
=============================================================================================================
VIALIQ PRODUCTION CAPACITY & PERFORMANCE SCALE TARGETS
=============================================================================================================
Dimension / Metric                  Baseline (Pilot Study)   Global Scale (Tier 1 Phase 3)  Peak Enterprise Burst
-------------------------------------------------------------------------------------------------------------
Concurrent Active Studies           10 studies               250 studies                    1,000+ studies
Active Clinical Sites               100 sites                5,000 sites                    25,000 sites
Total Registered Subjects           5,000 subjects           250,000 subjects               1,500,000 subjects
Concurrent Active Web/ePRO Users    500 users                15,000 users                   100,000 users
Total Matrix Cells per Study        2,500 cells              50,000 cells                   250,000+ cells
-------------------------------------------------------------------------------------------------------------
THROUGHPUT & TRAFFIC TARGETS
-------------------------------------------------------------------------------------------------------------
Average Read Throughput             250 req/sec              5,000 req/sec                  35,000 req/sec
Peak Write Throughput (Audit + CRF) 50 req/sec               1,200 req/sec                  8,500 req/sec
Message Queue Ingestion (RabbitMQ)  100 msgs/sec             2,500 msgs/sec                 15,000 msgs/sec
CDC Stream (Vialiq.CdcWorker)        50 events/sec          1,000 events/sec               6,000 events/sec
SignalR Real-Time Active Connections 400 connections         12,000 connections             85,000 connections
-------------------------------------------------------------------------------------------------------------
LATENCY SERVICE LEVEL AGREEMENTS (SLAs)
-------------------------------------------------------------------------------------------------------------
Distributed Redis Cache Hit Latency < 2 milliseconds         < 1 millisecond                < 2 milliseconds
API Read Endpoints (p50 / p95 / p99) 15ms / 35ms / 65ms      10ms / 25ms / 45ms             12ms / 30ms / 50ms
API Write Endpoints (21 CFR Part 11) 45ms / 85ms / 150ms     35ms / 65ms / 110ms            40ms / 75ms / 125ms
Matrix Slice Query (50x15 window)   40ms / 75ms / 120ms      25ms / 50ms / 85ms             30ms / 60ms / 95ms
Global Cache Invalidation Broadcast  < 20 milliseconds       < 5 milliseconds               < 10 milliseconds
-------------------------------------------------------------------------------------------------------------
CACHE HIT RATIO & MEMORY FOOTPRINT
-------------------------------------------------------------------------------------------------------------
Form Schema & Protocol Cache Hit %   > 98.5%                 > 99.8%                        > 99.95%
Medical Dictionaries (MedDRA/WHODrug) > 95.0%                > 99.0%                        > 99.5%
Redis Sentinel HA RAM (Non-Clustered) 2–4 GB (1P+2R Sentinel)       8–16 GB (1P+2R Sentinel)       32–64 GB (1P+2R Sentinel)
=============================================================================================================
```

---

## 8. API-Level Custom Attributes for Response Caching, Invalidation & Key Rotation

To deliver high developer velocity while preventing cache pollution and multi-tenant cross-talk, the ASP.NET Core API provides first-class declarative custom attributes built on top of the Redis distributed caching tier.

```
                        API CUSTOM ATTRIBUTE CACHE LIFECYCLE
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [Cached(...)]                  [InvalidateCache(...)]           [RotateCacheKey(...)]
  • Generates scoped key          • Intercepts successful POST/PUT • Increments study epoch/salt
  • Injects Tenant + Study ID     • Extracts Route/Header tags     • Instantly invalidates entire
  • Evaluates ETag / HTTP 304     • Emits Redis Pub/Sub broadcast  • study cache without deleting keys
```

### 8.1 Attribute 1: `[Cached]` Declarative Response Caching

Applies declarative caching to controller query actions with automatic multi-tenant salt injection, conditional HTTP `304 Not Modified` ETag handling, and tag registration.

```csharp
namespace Vialiq.Api.Attributes;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false, Inherited = true)]
public sealed class CachedAttribute : Attribute
{
    /// <summary>
    /// Cache Time-To-Live in seconds.
    /// </summary>
    public int DurationSeconds { get; }

    /// <summary>
    /// Scope of the cache key: Study, Tenant, or Global.
    /// </summary>
    public CacheScope Scope { get; set; } = CacheScope.Study;

    /// <summary>
    /// Dynamic cache tags for multi-key tag-based invalidation (e.g. "form-schemas:{studyId}").
    /// Supports route token replacement: {studyId}, {tenantId}, {formId}.
    /// </summary>
    public string[] Tags { get; set; } = Array.Empty<string>();

    /// <summary>
    /// Comma-separated HTTP request headers to vary the cache by (e.g. "Accept-Language,X-User-Role").
    /// </summary>
    public string VaryByHeaders { get; set; } = string.Empty;

    /// <summary>
    /// Fail-closed guard: Prevents accidental [Cached] attachment on routes handling
    /// Patient PHI (SiteIdentifier) or RTSM randomization data (ADR 007-A / ADR 010).
    /// </summary>
    public bool AllowResponseCaching { get; set; } = true;

    public CachedAttribute(int durationSeconds)
    {
        DurationSeconds = durationSeconds;
    }
}

public enum CacheScope
{
    /// <summary>Isolated by TenantId and StudyId (Default for Clinical Data).</summary>
    Study,
    /// <summary>Isolated by TenantId across all studies (e.g., Tenant Custom Dictionaries).</summary>
    Tenant,
    /// <summary>Shared globally across all tenants (e.g., WHODrug, MedDRA global dictionaries).</summary>
    Global
}
```

#### Usage in Clinical Controllers:
```csharp
[ApiController]
[Route("api/v1/edc/form-schemas")]
public class FormSchemasController : ControllerBase
{
    // CachedActionFilter automatically injects ProtocolEpoch, BlindingScope, and ActiveLocale into the Redis key.
    [HttpGet("{formId}")]
    [Cached(DurationSeconds = 3600, Scope = CacheScope.Study, Tags = new[] { "form-schemas:{studyId}", "form:{studyId}:{formId}" })]
    public async Task<ActionResult<FormSchemaDto>> GetSchema(
        [FromRoute] string formId,
        CancellationToken cancellationToken)
    {
        var schema = await _schemaService.GetByIdAsync(formId, cancellationToken);
        return Ok(schema);
    }
}
```

---

### 8.2 Attribute 2: `[InvalidateCache]` Declarative Invalidation

Intercepts mutating actions (POST, PUT, PATCH, DELETE). Under **Dual-Write Synchronous Completion (`ADR 007-A Decision 3.1`)**, upon successful MongoDB commit it synchronously deletes the target keys in Shared Distributed Redis (failing with HTTP `503 CacheSynchronizationException` on transient sync failure while Redis HA is active) and optionally publishes a lightweight notification event across the Redis backplane.

```csharp
namespace Vialiq.Api.Attributes;

[AttributeUsage(AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public sealed class InvalidateCacheAttribute : Attribute
{
    /// <summary>
    /// Array of cache tags to invalidate upon action success.
    /// Supports route replacement tokens: {studyId}, {subjectId}, {formId}.
    /// Example: "subject-matrix:{studyId}", "crf-entries:{studyId}:{subjectId}"
    /// </summary>
    public string[] Tags { get; }

    /// <summary>
    /// Scope of the invalidation.
    /// </summary>
    public CacheScope Scope { get; set; } = CacheScope.Study;

    public InvalidateCacheAttribute(params string[] tags)
    {
        Tags = tags ?? throw new ArgumentNullException(nameof(tags));
    }
}
```

#### Usage on Regulated Mutation Endpoints:
```csharp
[HttpPost("{id}/actions/save-crf")]
[InvalidateCache("subject-matrix:{studyId}", "crf-entries:{studyId}:{subjectId}")]
public async Task<ActionResult<CrfEntryDto>> SaveCrf(
    [FromRoute] string id,
    [FromBody] SaveCrfCommand command,
    CancellationToken cancellationToken)
{
    var result = await _mediator.Send(command, cancellationToken);
    return Ok(result);
}
```

---

### 8.3 Attribute 3: `[RotateCacheKey]` Epoch/Salt Key Rotation

When a major regulatory event occurs (such as a **Formal Protocol Amendment** approved by the IRB/Ethics Committee), thousands of cached form schemas, calculations, and visits must be invalidated simultaneously. Deleting 50,000 keys from Redis in a single command causes a CPU freeze. 

The `[RotateCacheKey]` attribute implements **Epoch-Based Key Salt Rotation**:

```csharp
namespace Vialiq.Api.Attributes;

[AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class RotateCacheKeyAttribute : Attribute
{
    /// <summary>
    /// The cache scope to rotate.
    /// </summary>
    public CacheScope Scope { get; }

    /// <summary>
    /// Event name triggering the rotation (e.g., "ProtocolAmended", "SiteTransferred").
    /// </summary>
    public string EventReason { get; }

    public RotateCacheKeyAttribute(CacheScope scope, string eventReason)
    {
        Scope = scope;
        EventReason = eventReason;
    }
}
```

#### How Epoch Salt Rotation Works:
1. Every cached key uses the unified polymorphic study envelope (auto-resolved by `IScopedCacheService` / `CachedActionFilter`):
   $$\text{Key} = \text{vialiq:study}:\text{tenant}:\text{study}:\text{env}:\mathbf{\text{ep}\{\text{epoch}\}}:\text{scope}:\text{locale}:\text{resource}:\text{id}$$
2. The active `epoch` counter is stored in Redis without TTL (`epoch:novartis:onco101`).
3. When the study sponsor approves Protocol Amendment Version 3:
   ```csharp
   [HttpPost("actions/approve-protocol-amendment")]
   [RotateCacheKey(CacheScope.Study, "ProtocolAmendmentApproved")]
   public async Task<IActionResult> ApproveAmendment(...)
   ```
4. The filter increments the epoch counter: `INCR epoch:novartis:onco101` $\rightarrow$ `ep4`. For ~75–85% `StorageTopologyMode.Single` studies, this hits the single home Redis directly; for ~15–25% `MultiRegionGeoPartitioned` studies, Control-Plane Outbox fans the epoch increment out to every zone in `manifest.Zones` during the `ADR 008` Stage 4 Maintenance Lock.
5. **Instant Invalidation**: In **< 1 millisecond**, all future cache lookups request `ep4`. Old `ep3` entries age out naturally via Redis TTL without causing cache deletion spikes or blocking!

---

### 8.4 ASP.NET Core Action Filter Implementation (`CachedActionFilter`)

The following production filter executes the caching logic, enforces multi-tenant header isolation, computes cryptographic weak ETags, and short-circuits HTTP 304 responses:

```csharp
namespace Vialiq.Api.Filters;

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Vialiq.Api.Attributes;
using Vialiq.Core.Interfaces;

public sealed class CachedActionFilter : IAsyncActionFilter
{
    private readonly IScopedCacheService _cacheService;
    private readonly ITenantStudyContextAccessor _contextAccessor;
    private readonly ILogger<CachedActionFilter> _logger;

    public CachedActionFilter(
        IScopedCacheService cacheService,
        ITenantStudyContextAccessor contextAccessor,
        ILogger<CachedActionFilter> logger)
    {
        _cacheService = cacheService;
        _contextAccessor = contextAccessor;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var endpoint = context.HttpContext.GetEndpoint();
        var cachedAttr = endpoint?.Metadata.GetMetadata<CachedAttribute>();

        if (cachedAttr == null || context.HttpContext.Request.Method != HttpMethods.Get)
        {
            await next();
            return;
        }

        var tenantId = _contextAccessor.CurrentTenantId;
        var studyId = _contextAccessor.CurrentStudyId;

        // Fail-closed guard: Never allow declarative response caching on endpoints flagged as PHI or RTSM
        if (!cachedAttr.AllowResponseCaching || _contextAccessor.IsPhiOrRtsmEndpoint(context))
        {
            await next();
            return;
        }

        // Build deterministic multi-tenant cache key (auto-injects Epoch, BlindingScope, & Locale — zero developer boilerplate)
        var cacheKey = BuildCacheKey(context, cachedAttr, _contextAccessor);

        // Check conditional ETag request (If-None-Match)
        var incomingETag = context.HttpContext.Request.Headers.IfNoneMatch.ToString();

        var cachedBytes = await _cacheService.GetOrCreateStudyAsync<byte[]>(
            "action-cache",
            cacheKey,
            async cancel =>
            {
                // Cache miss: execute action
                var executedContext = await next();

                if (executedContext.Result is ObjectResult objectResult && objectResult.Value != null)
                {
                    return JsonSerializer.SerializeToUtf8Bytes(objectResult.Value);
                }

                return Array.Empty<byte>();
            });

        if (cachedBytes.Length == 0) return;

        // Compute weak ETag from payload hash
        var etag = ComputeWeakETag(cachedBytes);

        if (cachedAttr.EnableETag && !string.IsNullOrEmpty(incomingETag) && incomingETag == etag)
        {
            // Short-circuit with HTTP 304 Not Modified
            context.Result = new StatusCodeResult(StatusCodes.Status304NotModified);
            context.HttpContext.Response.Headers.ETag = etag;
            return;
        }

        context.HttpContext.Response.Headers.ETag = etag;
        context.HttpContext.Response.ContentType = "application/json";
        context.Result = new FileContentResult(cachedBytes, "application/json");
    }

    private static string BuildCacheKey(ActionExecutingContext ctx, CachedAttribute attr, ITenantStudyContextAccessor accessor)
    {
        var context = accessor.CurrentContext;
        var sb = new StringBuilder();
        sb.Append(attr.Scope switch
        {
            CacheScope.Global => "global",
            CacheScope.Tenant => $"tenant:{context.TenantId}",
            // Automatically enforces Epoch (ADR 008), BlindingScope (ADR 010), & Locale (Scale 005-A)
            // Single-culture studies resolve to BaseLocale (1 key copy, zero overhead).
            _ => $"study:{context.TenantId}:{context.StudyId}:{context.Environment}:ep{context.ProtocolEpoch}:{context.BlindingScopeSegment}:{context.ActiveLocale}"
        });

        sb.Append(':').Append(ctx.HttpContext.Request.Path.Value?.Trim('/'));

        if (!string.IsNullOrEmpty(attr.VaryByHeaders))
        {
            foreach (var header in attr.VaryByHeaders.Split(','))
            {
                var h = header.Trim();
                if (ctx.HttpContext.Request.Headers.TryGetValue(h, out var val))
                {
                    sb.Append(':').Append(h).Append('=').Append(val);
                }
            }
        }

        return sb.ToString();
    }

    private static string ComputeWeakETag(byte[] payload)
    {
        var hash = SHA256.HashData(payload);
        return $"W/\"{Convert.ToHexString(hash)[..16]}\"";
    }

    private static IReadOnlyCollection<string> ResolveTags(
        string[] rawTags,
        ActionExecutingContext ctx,
        string tenantId,
        string studyId)
    {
        var resolved = new List<string>(rawTags.Length);
        foreach (var tag in rawTags)
        {
            var replaced = tag
                .Replace("{tenantId}", tenantId, StringComparison.OrdinalIgnoreCase)
                .Replace("{studyId}", studyId, StringComparison.OrdinalIgnoreCase);

            foreach (var (k, v) in ctx.RouteData.Values)
            {
                if (v != null)
                {
                    replaced = replaced.Replace($"{{{k}}}", v.ToString(), StringComparison.OrdinalIgnoreCase);
                }
            }
            resolved.Add(replaced);
        }
        return resolved;
    }
}
```

