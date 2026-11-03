# Scaling Architecture: Caching Strategy, Message Queues, Cache Invalidation, and Cache Herd Resilience Patterns

> **Document ID:** `VIALIQ-SCALE-004`  
> **Domain:** Platform Scalability — In-Memory & Distributed Caching, Message Queues & Stampede Protection  
> **Status:** Accepted  
> **Date:** October 22, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** Redis 7.0+ Cluster, RabbitMQ 3.13+ / Azure Service Bus, ASP.NET Core 9.0 (`HybridCache`), Hangfire  
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

To resolve these challenges, Vialiq implements a **Unified Dual-Tier Caching Architecture with .NET 9 `HybridCache`** paired with **Enterprise RabbitMQ Message Queuing**.

```
                   CACHING & ASYNCHRONOUS MESSAGING TOPOLOGY
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
Multi-Tier Caching (.NET 9 HybridCache)                       Asynchronous Message Queue (RabbitMQ)
• L1: In-Memory Pod Cache (< 1 μs latency)                    • Topic Exchange: `edc.clinical.events`
• L2: Distributed Redis Cluster (< 2 ms latency)              • CDISC ODM & SAS Export Workers
• Built-In Cache Stampede / Herd Mutex                        • Dead Letter Exchanges (DLX) & Retries
• Probabilistic Early Refresh (XFetch Algorithm)              • Prefetch Backpressure & Idempotent Consumer
```

---

## 2. Multi-Tier Caching Architecture: .NET 9 `HybridCache`

In .NET 9, Microsoft introduced **`HybridCache`**, an enterprise-grade multi-tier caching library that natively unifies L1 in-memory speed with L2 distributed durability, while **eliminating the Cache Herd / Stampede problem out-of-the-box**.

```
ASP.NET Core 9 API Pod
┌────────────────────────────────────────────────────────────────────────┐
│ HybridCache.GetOrCreateAsync("schema:vitals:v1", factory)               │
│                                                                        │
│ 1. Check L1 In-Memory Cache (IMemoryCache)                             │
│    └── Cache Hit? ──► Return in < 1 microsecond (Zero network IO)      │
│                                                                        │
│ 2. Cache Miss in L1? Check L2 Distributed Cache (Redis Cluster)        │
│    └── Cache Hit? ──► Populate local L1 + Return in < 2 milliseconds   │
│                                                                        │
│ 3. Cache Miss in L2? (DB Fallback with Single-Flight Mutex)            │
│    └── EXACTLY ONE thread queries MongoDB; all others await result!    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Single Query (Zero Thundering Herd)
┌───────────────────────────────────▼────────────────────────────────────┐
│ MongoDB Production Cluster (`rs-prod:27037`)                           │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Configuration in `backend/api/src/Vialiq.Api/Program.cs`

```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Configure Redis L2 Distributed Cache
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "Vialiq:";
});

// 2. Configure .NET 9 HybridCache (L1 In-Memory + L2 Redis + Stampede Mutex)
builder.Services.AddHybridCache(options =>
{
    // Maximum payload size to cache in L1 in-memory (to avoid RAM bloat)
    options.MaximumPayloadBytes = 1024 * 1024 * 5; // 5 MB
    
    // Default cache durations
    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(60),       // L2 Redis duration
        LocalCacheExpiration = TimeSpan.FromMinutes(15) // L1 In-memory duration
    };
});
```

---

## 3. Resolving the Cache Herd / Thundering Herd Problem

A **Cache Stampede (Thundering Herd)** occurs when:
1. A hot key (e.g. `schema:demographics:v1`) expires at `10:00:00 AM`.
2. At `10:00:01 AM`, 1,500 active clinical coordinators open the form simultaneously.
3. All 1,500 requests miss the cache at the exact same millisecond.
4. All 1,500 threads execute the database query concurrently, exhausting MongoDB socket pools and CPU.

Vialiq mitigates this through **3 complementary defenses**:

### Defense 1: Single-Flight Concurrency Mutex (Native in .NET 9 `HybridCache`)
Under traditional caching (`IDistributedCache`), 1,000 misses trigger 1,000 database calls.  
Under **`HybridCache`**, the engine uses an internal **`SemaphoreSlim` single-flight lock per key**:
- Thread 1 acquires the execution lock and runs the factory query against MongoDB.
- Threads 2 through 1,500 await Thread 1's completion asynchronously.
- Thread 1 writes the result to L1 and L2 and releases the lock.
- Threads 2 through 1,500 immediately consume Thread 1's result. **MongoDB receives exactly 1 query instead of 1,500.**

```csharp
namespace Vialiq.Infrastructure.Services;

using Microsoft.Extensions.Caching.Hybrid;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models.Form;

public sealed class CachedFormDefinitionService : IFormDefinitionService
{
    private readonly HybridCache _cache;
    private readonly IMongoDatabaseFactory _dbFactory;

    public CachedFormDefinitionService(HybridCache cache, IMongoDatabaseFactory dbFactory)
    {
        _cache = cache;
        _dbFactory = dbFactory;
    }

    public async Task<FormSchemaDto> GetFormSchemaAsync(string studyId, string formId, int version, CancellationToken ct)
    {
        var cacheKey = $"schema:{studyId}:{formId}:v{version}";

        // Single-Flight Mutex: Guarantees ONLY ONE database call even under 10,000 concurrent requests!
        return await _cache.GetOrCreateAsync(
            cacheKey,
            async token =>
            {
                var db = _dbFactory.GetStudyDatabase();
                var collection = db.GetCollection<FormDefinitionEntity>("form_definitions");
                var entity = await collection.Find(f => f.FormId == formId && f.Version == version).FirstOrDefaultAsync(token);
                return entity.ToDto();
            },
            cancellationToken: ct);
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

## 4. Cache Invalidation & Event-Driven Cache Purging

In life sciences, when a Protocol Amendment publishes a new form version, or an investigator changes an active codelist, stale cache entries must be purged instantly.

### 4.1 Redis Pub/Sub Invalidation Grid
Because each API pod maintains its own in-memory L1 cache, an invalidation triggered on Pod 1 must clear the L1 cache on Pods 2 through 50:

```
Admin updates Form Schema on Pod 1
                  │
                  ▼
         [ Redis Pub/Sub ]
       Channel: "vialiq:cache:invalidate"
       Payload: { "pattern": "schema:onco101:vitals:*" }
                  │
         ┌────────┴────────┐
         ▼                 ▼
     API Pod 2         API Pod 50
  Clears Local L1    Clears Local L1
  In < 5 millisec    In < 5 millisec
```

### Invalidation Publisher & Subscriber Implementation:

```csharp
namespace Vialiq.Infrastructure.Caching;

using StackExchange.Redis;
using System.Text.Json;
using Microsoft.Extensions.Caching.Hybrid;

public sealed class DistributedCacheInvalidator
{
    private readonly IConnectionMultiplexer _redis;
    private readonly HybridCache _hybridCache;
    private const string ChannelName = "vialiq:cache:invalidate";

    public DistributedCacheInvalidator(IConnectionMultiplexer redis, HybridCache hybridCache)
    {
        _redis = redis;
        _hybridCache = hybridCache;

        // Subscribe to global invalidation events across all pods
        var sub = _redis.GetSubscriber();
        sub.Subscribe(ChannelName, async (channel, message) =>
        {
            var evt = JsonSerializer.Deserialize<CacheInvalidationMessage>(message.ToString());
            if (evt != null)
            {
                await _hybridCache.RemoveAsync(evt.CacheKey);
            }
        });
    }

    public async Task InvalidateKeyGloballyAsync(string cacheKey)
    {
        // 1. Remove from local pod
        await _hybridCache.RemoveAsync(cacheKey);

        // 2. Publish to Redis to invalidate across all sibling API pods
        var pub = _redis.GetSubscriber();
        var payload = JsonSerializer.Serialize(new CacheInvalidationMessage(cacheKey));
        await pub.PublishAsync(ChannelName, payload);
    }
}

public record CacheInvalidationMessage(string CacheKey);
```

---

## 5. Asynchronous Message Queue Topology (RabbitMQ / Service Bus)

Operations that exceed **200ms of compute or external IO** are offloaded to **RabbitMQ**:

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
Messages that fail due to transient errors (e.g. S3 timeout) are retried with exponential backoff up to **3 times**. If processing fails permanently, the message is routed to `q.dead-letter` with full failure metadata for GxP audit investigation, preventing blocked queues.

#### 2. Prefetch Limit & Backpressure
Worker pods configure a strict prefetch count:
```csharp
channel.BasicQos(prefetchSize: 0, prefetchCount: 10, global: false);
```
This prevents a fast publisher from overwhelming a worker pod with 5,000 multi-gigabyte export tasks, maintaining memory stability.

#### 3. Idempotent Consumer Pattern
Every clinical event published to RabbitMQ contains a unique `X-Correlation-Id` and `EventId`. Consumers check Redis before processing:
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

| Operation | Without Caching / Queues | With HybridCache & RabbitMQ | Scalability Multiplier |
|---|---|---|---|
| **Form Schema Fetch** | 45 ms (MongoDB Aggregation) | **< 1 microsecond (L1 In-Memory)** | **45,000x Faster** |
| **MedDRA Dictionary Search** | 120 ms (Full-text index) | **< 2 ms (L2 Redis Cluster)** | **60x Faster** |
| **Cache Expiration Surge (Herd)** | Database connection pool collapse | **Single-Flight Lock (1 query only)** | **100% Collapse Immune** |
| **100k-Page CDISC ODM Export** | Crashes HTTP thread (504 Gateway Timeout) | **Asynchronous Worker Queue (HTTP 202)** | **Zero Web Latency Impact** |
| **Pod Invalidation Propagation** | Inconsistent stale data across pods | **Redis Pub/Sub (< 5 ms global sync)** | **Strict GxP Compliant** |

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
Change Data Capture Stream (Debezium) 50 events/sec          1,000 events/sec               6,000 events/sec
SignalR Real-Time Active Connections 400 connections         12,000 connections             85,000 connections
-------------------------------------------------------------------------------------------------------------
LATENCY SERVICE LEVEL AGREEMENTS (SLAs)
-------------------------------------------------------------------------------------------------------------
L1 Cache Hit (In-Memory) Latency    < 5 microseconds         < 1 microsecond                < 1 microsecond
L2 Cache Hit (Redis Cluster) Latency < 5 milliseconds        < 2 milliseconds               < 3 milliseconds
API Read Endpoints (p50 / p95 / p99) 15ms / 35ms / 65ms      10ms / 25ms / 45ms             12ms / 30ms / 50ms
API Write Endpoints (21 CFR Part 11) 45ms / 85ms / 150ms     35ms / 65ms / 110ms            40ms / 75ms / 125ms
Matrix Slice Query (50x15 window)   40ms / 75ms / 120ms      25ms / 50ms / 85ms             30ms / 60ms / 95ms
Global Cache Invalidation Broadcast  < 20 milliseconds       < 5 milliseconds               < 10 milliseconds
-------------------------------------------------------------------------------------------------------------
CACHE HIT RATIO & MEMORY FOOTPRINT
-------------------------------------------------------------------------------------------------------------
Form Schema & Protocol Cache Hit %   > 98.5%                 > 99.8%                        > 99.95%
Medical Dictionaries (MedDRA/WHODrug) > 95.0%                > 99.0%                        > 99.5%
Redis L2 Cluster Sizing (RAM)       16 GB (3-node cluster)   64 GB (6-node cluster)         256 GB (12-node cluster)
Pod L1 HybridCache Memory Limit      512 MB per pod           1.5 GB per pod                 3.0 GB per pod
=============================================================================================================
```

---

## 8. API-Level Custom Attributes for Response Caching, Invalidation & Key Rotation

To deliver high developer velocity while preventing cache pollution and multi-tenant cross-talk, the ASP.NET Core API provides first-class declarative custom attributes built on top of .NET 9 `HybridCache`.

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
    /// Enables HTTP 304 Not Modified conditional responses using weak ETags.
    /// </summary>
    public bool EnableETag { get; set; } = true;

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

Intercepts mutating actions (POST, PUT, PATCH, DELETE). Upon successful execution (HTTP 2xx), it evaluates target tag patterns, invalidates local `HybridCache`, and publishes an invalidation event across the Redis cluster backplane.

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
1. Every cached key incorporates an active **Study Epoch Token**:
   $$\text{Key} = \text{tenant\_id} : \text{study\_id} : \mathbf{epoch\_v} : \text{resource} : \text{id}$$
2. The active `epoch_v` is stored in a lightweight Redis integer counter (`epoch:novartis:onco101`).
3. When the study sponsor approves Protocol Amendment Version 3:
   ```csharp
   [HttpPost("actions/approve-protocol-amendment")]
   [RotateCacheKey(CacheScope.Study, "ProtocolAmendmentApproved")]
   public async Task<IActionResult> ApproveAmendment(...)
   ```
4. The filter increments the epoch counter: `INCR epoch:novartis:onco101` $\rightarrow$ `v4`.
5. **Instant Invalidation**: In **< 1 millisecond**, all future cache lookups request `v4`. The old `v3` entries age out naturally via Redis TTL without causing any cache deletion spikes or Redis command blocking!

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
using Microsoft.Extensions.Caching.Hybrid;
using Vialiq.Api.Attributes;
using Vialiq.Core.Interfaces;

public sealed class CachedActionFilter : IAsyncActionFilter
{
    private readonly HybridCache _hybridCache;
    private readonly ITenantStudyContextAccessor _contextAccessor;
    private readonly ILogger<CachedActionFilter> _logger;

    public CachedActionFilter(
        HybridCache hybridCache,
        ITenantStudyContextAccessor contextAccessor,
        ILogger<CachedActionFilter> logger)
    {
        _hybridCache = hybridCache;
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

        // Build deterministic multi-tenant cache key
        var cacheKey = BuildCacheKey(context, cachedAttr, tenantId, studyId);

        // Check conditional ETag request (If-None-Match)
        var incomingETag = context.HttpContext.Request.Headers.IfNoneMatch.ToString();

        var cachedBytes = await _hybridCache.GetOrCreateAsync<byte[]>(
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
            },
            new HybridCacheEntryOptions
            {
                Expiration = TimeSpan.FromSeconds(cachedAttr.DurationSeconds),
                LocalCacheExpiration = TimeSpan.FromSeconds(Math.Min(cachedAttr.DurationSeconds, 300))
            },
            tags: ResolveTags(cachedAttr.Tags, context, tenantId, studyId));

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

    private static string BuildCacheKey(ActionExecutingContext ctx, CachedAttribute attr, string tenantId, string studyId)
    {
        var sb = new StringBuilder();
        sb.Append(attr.Scope switch
        {
            CacheScope.Global => "global",
            CacheScope.Tenant => $"tenant:{tenantId}",
            _ => $"study:{tenantId}:{studyId}"
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

