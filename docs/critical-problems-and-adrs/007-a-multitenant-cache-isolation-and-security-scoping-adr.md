# ADR 007-A: Multi-Tenant Cache Isolation, Data Classification & Security Scoping

> **Status:** ✅ **SEALED & APPROVED**  
> **Date:** October 2026  
> **Deciders:** Architecture Core Team  
> **Domain:** Distributed Caching Tier (Redis HA Cluster), Multi-Tenant Security, GxP Compliance  
> **Regulatory Standards:** HIPAA § 164.312(a)(1), GDPR Article 32, FDA 21 CFR Part 11 § 11.10(d),(g), GAMP 5 Category 4  
> **Companion Engineering Guide:** [ADR 007-B: High-Availability Redis Cluster Architecture, Dev/Prod Setup & Scaling Guide](./007-b-high-availability-redis-cluster-and-scaling-guide.md)  
> **Operational Setup Guide:** [Redis High-Availability Cluster Setup Guide (Docker)](../backend-architecture/database/redis-setup-guide.md)  
> **Related Specifications:** [FTS-001: Standards Library Specification](../functional-and-technical-specs/001-global-and-client-standards-library-specification.md), [ADR 003: Form Concurrency & Redis Lock](./003-realtime-signalr-reconnection-and-field-lease-reconciliation-adr.md), [ADR 006: Audit Trail Architecture](./006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md)  

---

## 1. Executive Summary & Problem Context

In a multi-tenant clinical SaaS platform (hosting multiple pharmaceutical sponsors, CROs, and active clinical protocols across shared infrastructure), caching represents an intersection of **Performance**, **Data Security**, and **Consistency**:

1. **The Cross-Tenant Breach Hazard**: If cache keys fail to enforce rigorous multi-tenant scoping, Tenant A (e.g. Novartis) could load proprietary form definitions, confidential visit schedules, or restricted clinical data belonging to Tenant B (e.g. Roche), violating HIPAA § 164.312 and sponsor confidentiality agreements.
2. **The Cryptographic CSFLE Bypass**: Under ADR 004, patient identifiers (`SiteIdentifier`) are encrypted with MongoDB Client-Side Field-Level Encryption (CSFLE). If clinical records enter Redis or in-process RAM in plaintext, the cryptographic boundary is breached.
3. **The Multi-Step Resolution Strategy**: Because of the complexity and regulatory gravity, this decision is codified systematically across 4 deliberate steps:
   * **Step 1: Data Classification & Cache Eligibility (What can be cached vs. what is strictly banned)**
   * **Step 2: Cache Topology, Multi-Tenant Boundaries & Anti-Stampede Protections**
   * **Step 3: Consistency, Invalidation & Dual-Write Synchronous Completion**
   * **Step 4: Eviction & Noisy-Neighbor Protection**

---

## 2. Step 1: Data Classification & Cache Eligibility

```
                               CACHE ELIGIBILITY BOUNDARY
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
STRICTLY FORBIDDEN FROM CACHE                                    PERMITTED IN PRODUCTION CACHE
------------------------------------                             -----------------------------
• Patient Clinical Data (CRF field values, labs)                 1. Approved Form Schemas & Rules AST
• Protected Health Information (MRN, initials)                   2. Medical Dictionaries (MedDRA/WHODrug)
• Double-blind treatment arm assignments                         3. Codelists & Protocol Visit Matrix
• Non-Prod / Design-Time Draft Schemas                           4. Form Concurrency Locks (ADR 003)
                                                                 5. Login Tokens, Claims & Revocations
```

---

### Decision 1.1: Absolute Ban on Patient & Clinical Data in Cache
* **Strict Rule**: Live patient CRF responses, subject records, medical histories, lab values, and adverse event narratives shall **NEVER** be stored in the distributed Redis cache.
* **Rationale**:
  * Prevents plaintext PHI exposure in Redis memory dumps or cluster memory sweeps.
  * Preserves 100% of MongoDB Client-Side Field-Level Encryption (CSFLE) guarantees.
  * Eliminates stale patient data bugs and accidental double-blind treatment arm unblinding in the caching tier.
* **Access Pattern**: Patient data is **always fetched directly from MongoDB** inside the study database (`study_{id}_prod.crf_entries`) with per-request CSFLE decryption performed securely in pod RAM.

---

### Decision 1.2: Design-Time (Non-Prod) Cache Bypass
* **Strict Rule**: In non-production environments (Layer 1 Control Plane and Layer 2 Dev/Multi-UAT sandboxes), caching is **disabled by design**.
* **Rationale**:
  * User volume in Dev, CRO UAT, Sponsor UAT, and Training is minimal (10 to 50 concurrent designers/testers). Fetching directly from MongoDB has **zero performance or load implications**.
  * Eliminates "stale schema" defects where a clinical programmer alters a field label or Blockly edit check on the canvas and sees stale cached definitions.
  * **Caching is strictly an operational concern for PRODUCTION (`PROD`)**.

---

### Decision 1.3: The 5 Permitted Production Cache Categories

Caching in production is restricted strictly to invariant structural metadata, medical reference dictionaries, concurrency tokens, and authentication snapshots:

| Category | Description | Data Sensitivity | Mutability / TTL |
|---|---|---|---|
| **1. Approved Form Schemas & Edit Check ASTs** | UI layout grid, control types, field tokens, MessagePack binary AST rules. | Structural (Zero patient data) | Immutable per protocol version. Invalidated only on formal amendment. |
| **2. Medical & Regulatory Dictionaries** | **MedDRA** (~80k Preferred Terms), **WHODrug Global**, CDISC Controlled Terminology. | Public / Licensed Reference | Static read-only reference data. Long-term cache (days/weeks). |
| **3. Codelists & Protocol Visit Templates** | Dropdown option sets, visit navigation roadmap (*Visit 1 contains Forms [DM, VS, MH]*). | Structural Template | Immutable per approved protocol version. |
| **4. Form Concurrency Locks (ADR 003)** | Single-Editor lock token: `edc:form_lock:{studyId}:{crfId}`. | Coordination Token (`userId`, `expiresAtUtc`) | Dynamic; strict 15-minute sliding TTL. Cleared on form Save/Close. |
| **5. Identity, Claims & Revocation Blacklist** | Active token validity, role-to-site grants (e.g. *User 42 is CRC for Site 101*), token kill-switch. | Authentication Claims | Short TTL (5–15 mins). Evicted immediately on admin role change. |

---

### Decision 1.4: End-to-End Subject Form Rendering Lifecycle

When an Investigator, CRC, or CRA opens a form for data entry on an enrolled subject (e.g. Subject 1001, Visit 1, Vital Signs), the system executes a clean, decoupled 4-step pipeline:

```
CLIENT OPENS FORM (Subject 1001, Visit 1, Vital Signs)
  │
  ├── 1. Form-Visit Navigation Matrix ────── [Served from Cache: < 1ms]
  │      └── Fetched once per subject session; renders the visit/form roadmap.
  │
  ├── 2. Form Schema + Edit Check Logic ─── [Served from Cache: < 1ms]
  │      └── Invariant JSON layout + MessagePack rule AST. Zero DB overhead.
  │
  ├── 3. Concurrency Lock State ──────────── [Served from Redis: < 1ms (ADR 003)]
  │      └── Checks edc:form_lock:{studyId}:{crfId}.
  │          • Free ➔ Acquired by user ➔ Opens in EDIT MODE.
  │          • Held by Dr. Smith ➔ Opens in READ-ONLY MODE with banner.
  │
  └── 4. Patient Clinical Values & Flags ─── [Fetched from MongoDB: ~15ms]
         └── Reads study_{id}_prod.crf_entries:
             • Injects live patient values (CSFLE decrypted in pod memory).
             • Injects open Clinical Query discrepancy dots (red/amber flags).
             • Injects field revision metadata (_fieldMeta) for history clocks.
```

---

## 3. Step 2: Cache Topology, Multi-Tenant Boundaries & Anti-Stampede Protections

```
                       CANONICAL SOURCE OF TRUTH VS. CACHE
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
DATABASE = SOURCE OF TRUTH                                  DISTRIBUTED CACHE = SPEED & COORDINATION
--------------------------                                  ----------------------------------------
• MongoDB `study_locks` (Regulatory Freeze / DBL)           • Redis Primary/Replica HA Pair (< 1-2 GB RAM)
• MongoDB `study_edit_leases` (15m Form Edit Leases)        • Sub-millisecond lock & schema lookup (< 1ms)
• Zero data exists solely in cache                          • Single-flight concurrency protection
• 0.001% total HA outage check -> redirects to MongoDB
```

---

### Decision 2.1: Canonical Source of Truth = Database (Zero Ephemeral-Only State)
* **Strict Rule**: **No data or locks shall ever exist solely in volatile cache memory.**
* **Collection Separation (`study_locks` vs. `study_edit_leases`)**:
  * **`study_locks`** remains strictly dedicated to permanent **Regulatory Data Freeze / DBL Locks** (`STUDY`, `COHORT`, `SITE`, `SUBJECT`, `VISIT`, `FORM` — `SOFT_FREEZE` / `HARD_LOCK` unlocked only via Four-Eyes Dual Control; cached in Redis hash `vialiq:locks:{studyId}`).
  * **`study_edit_leases`** stores short-lived **15-minute Single-Editor Form Edit Leases** (`ADR 003`), isolated from governance freeze ledgers.
* **Lock Persistence Mechanics (Synchronous DB + Cache Completion)**:
  1. **Governance Pre-Check & Acquisition**: Before granting an edit lease, `AcquireFormLockAsync` evaluates regulatory `study_locks` (`vialiq:locks:{studyId}` / `study_locks`) and rejects immediately with **HTTP `423 Locked`** if frozen/hard-locked. Otherwise, it writes atomically to `study_edit_leases` (`status: 1` / `Active`, `lockedByUserId`, `lockedAtUtc`, `expiresAtUtc`) enforced by partial unique index `{ studyId: 1, targetCrfId: 1 }` with `partialFilterExpression: { status: 1 }`.
  2. **Cache Synchronization**: Under normal HA operation, the edit lease is synchronously written-through to Redis key `edc:form_lock:{studyId}:{crfId}` with a 15-minute sliding TTL before the API returns success (`Decision 3.1`).
  3. **Release & Override**: When saved, closed, or broken, the status is updated in `study_edit_leases` (`status: Released` or `Broken` with mandatory Part 11 reason) and synchronously evicted from Redis (`DEL`).
* **Catastrophic Total-Outage Circuit Breaker (~0.001% Edge Case)**: If *both* the Redis HA Primary and Replica become unavailable simultaneously, a single session/outage circuit-breaker check detects Redis unavailability and redirects read/lock lookups directly to canonical MongoDB (`study_locks` + `study_edit_leases` / Primary `ReadConcern.Majority`) until Redis recovers—avoiding per-request timeout loops. Partial/transient sync failures while Redis is active must never silently degrade (see Decision 3.1).

---

### Decision 2.2: Lean Cache Footprint & Infrastructure-Agnostic Topology
* **Lean Footprint Reality**: Because patient data is 100% excluded from cache (Decision 1.1), the total platform cache footprint across 100 active clinical studies is **less than 1 Gigabyte RAM**:
  * Form Schemas & Rules: ~250 MB
  * Dictionaries (MedDRA/WHODrug): ~50 MB
  * Codelists & Protocol Templates: ~20 MB
  * Active Form Locks (~1,000 concurrent): ~100 KB
  * Auth & Revocation: ~10 MB
  * **Total: ~350 MB to 1 GB RAM.**
* **No Hard Kubernetes Dependency**: The architecture is container- and orchestrator-agnostic. It runs identically in Azure Container Apps, AWS ECS/Fargate, standard Docker Compose on Linux VMs, or Kubernetes if required by enterprise IT.
* **High Availability (HA) Clustering**: The **Single-Tier Distributed Redis Cache** (with zero pod-local `.NET IMemoryCache` L1 memory caching) is deployed as a **Primary-Secondary HA Pair with Automated Sentinel Failover** (detailed in ADR 007-B and operationalized in [Scale 004](../scaling-architecture/004-caching-queues-and-resilience-patterns.md)).

---

### Decision 2.3: Unified Polymorphic Cache Key Invariant & Fail-Closed Guard
To guarantee absolute multi-tenant, blinding, protocol-version, and locale isolation without developer boilerplate or overhead on single-region studies, cache keys adhere strictly to the 3-tier hierarchy ([FTS-001](../functional-and-technical-specs/001-global-and-client-standards-library-specification.md), [ADR 008](./008-protocol-amendment-cache-invalidation-and-epoch-rotation-adr.md), [ADR 010](./010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md), [Scale 005-A](../scaling-architecture/005-a-multilingual-study-db-per-site-group-and-reporting-guide.md)):

```
vialiq:global:standards:{resource}:{id}                                                 # Global Reference Dictionaries (No TTL; persistent under volatile-lru)
vialiq:tenant:{tenantId}:lib:{resource}:{id}                                            # Client Standards Library (Isolated strictly to TenantId)
vialiq:study:{tenantId}:{studyId}:{env}:ep{epoch}:{scope}:{locale}:{resource}:{id}      # Study Instance (Auto-resolved from TenantStudyContext)
```

* **Zero Overhead for the ~75–85% Single-Culture / Single-Region Studies (`StorageTopologyMode.Single`):** All context segments (`ep{epoch}`, `{scope}` = `std` | `blinded` | `unblinded`, `{locale}` = study `BaseLocale`) resolve automatically from `TenantStudyContext` / `UserContext`. Single-culture trials store **only 1 key copy** in Redis with zero extra headers or config.
* **Automatic Protection for 25% Multilingual & Double-Blind Trials:** Multi-language bundles (`de-DE`, `zh-CN`), blinded vs. unblinded schemas (`ADR 010`), and amended protocol epochs (`ADR 008`) are structurally disjoint—preventing unblinding or cross-locale leakage even if a controller omits manual header flags.

#### Enforcement via `IScopedCacheService`:
Developers are strictly prohibited from formatting raw cache key strings. All caching calls flow through `IScopedCacheService`, which extracts authenticated tenant, study, epoch, blinding scope, and locale context from `ITenantStudyContextAccessor` (and declarative `[Cached]` filters fail closed against `SiteIdentifier` PHI / `BlindedRTSM` patient endpoints):

```csharp
public async ValueTask<T> GetOrCreateStudyAsync<T>(
    string resource,
    string key,
    Func<CancellationToken, ValueTask<T>> factory,
    CancellationToken ct)
{
    var context = _contextAccessor.CurrentContext;

    // FAIL-CLOSED: Absolute barrier against unauthenticated or missing tenant calls
    if (string.IsNullOrWhiteSpace(context?.TenantId) || string.IsNullOrWhiteSpace(context?.StudyId))
    {
        throw new SecurityException("Security Violation: Attempted to access Study cache without authenticated Tenant and Study context.");
    }

    var scope = context.BlindingScopeSegment; // "blinded" | "unblinded" | "std"
    var locale = context.ActiveLocale;        // Defaults to BaseLocale for single-culture trials
    var fullyQualifiedKey = $"vialiq:study:{context.TenantId}:{context.StudyId}:{context.Environment}:ep{context.ProtocolEpoch}:{scope}:{locale}:{resource}:{key}";
    return await GetOrCreateInternalAsync(fullyQualifiedKey, factory, DefaultTtl, ct);
}
```

---

### Decision 2.4: 4-Tier Anti-Stampede & Anti-Attacker Misuse Shield

A **Cache Stampede (Cache Herd Attack)** occurs when an attacker (or 5,000 nurses arriving at 9:00 AM) requests a cold, expired, or non-existent key simultaneously. We prevent database exhaustion through 4 complementary defenses:

```
                         INCOMING REQUEST SPIKE (5,000 REQS)
                                         │
 ┌───────────────────────────────────────┴───────────────────────────────────────┐
 │                                                                               │
 ▼                                                                               ▼
DEFENSE 1: ATOMIC REDIS FAST-PATH                               DEFENSE 2: NEGATIVE CACHING (Anti-Penetration)
redis.StringGetAsync / StringSetAsync                            • Attacker queries fake IDs (/forms/fake-uuid-999)
• Direct sub-millisecond retrieval from Redis                   • System caches NULL_RECORD for 60 seconds
• Hydrates from MongoDB on miss; 0.001% total outage -> MongoDB • Subsequent attacker requests return 404 in 0ms
• Populates Redis with explicit TTL                             • MongoDB is NEVER touched after the first check
• Single-flight concurrency handles cold lookups                                  │
                                                                                 ▼
                                                                DEFENSE 3: RATE LIMITING (Sliding Window)
                                                                • Throttles abusive IPs/users with HTTP 429
```

1. **Defense 1: Direct Redis Fast-Path & Cache-Miss Self-Healing**:
   * Uses direct `StackExchange.Redis` `StringGetAsync` with JSON deserialization for sub-millisecond reads (`< 1 ms`).
   * On a cache miss, queries MongoDB (canonical source) and populates Redis synchronously with explicit TTL; in the `~0.001%` event both Redis HA Primary and Replica are unreachable, a single session circuit-breaker check redirects directly to MongoDB until Sentinel restores Redis.
   * **MongoDB receives read queries only on cache misses (or active total-outage circuit-breaker redirect).**
2. **Defense 2: Negative Caching (Anti-Penetration against Random Attacker IDs)**:
   * When an attacker queries a non-existent form or asset ID (`/api/v1/forms/fake-uuid-999`), MongoDB returns `null`.
   * The backend caches a **Negative Sentinel Entry (`NULL_RECORD`)** with a 60-second TTL.
   * Subsequent requests for that fake ID return HTTP `404 Not Found` directly from Redis in `< 1 ms`, preventing repeated database scans.
3. **Defense 3: TTL Jitter (Probabilistic Expiration)**:
   * To prevent synchronized expiration storms, all cache TTLs apply **$\pm 10\%$ randomized jitter** (e.g. a 60-minute TTL expires between 54 and 66 minutes).
4. **Defense 4: ASP.NET Core Sliding-Window Rate Limiting**:
   * Rate limits incoming requests per authenticated `tenantId` and client IP (e.g. 100 req/sec).
   * Bursts exceeding the quota are rejected at the Kestrel edge with HTTP `429 Too Many Requests` before touching cache or database layers.

---

## 4. Step 3: Consistency, Invalidation & Dual-Write Synchronous Completion

```
                         DUAL-WRITE SYNCHRONOUS COMPLETION
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
PHASE 1: ATOMIC DATABASE WRITE                               PHASE 2: SYNCHRONOUS CACHE UPDATE
------------------------------                               ---------------------------------
• Form updates & field values                                • Delete / Renew lock in Redis
• 21 CFR Part 11 audit records                               • Invalidate / evict Redis keys
• study_locks & study_edit_leases durable state              • Await synchronous Redis confirmation
• CommitTransactionAsync(w: "majority")                      • Zero pod-local L1 memory skew
        │                                                                 │
        └────────────────────────────────┬────────────────────────────────┘
                                         ▼
                 TRANSACTION COMPLETE ONLY WHEN BOTH SUCCEED
                 (HTTP 200 OK returned; fire-and-forget BANNED)
```

---

### Decision 3.1: The Dual-Write Synchronous Completion Principle
* **Strict Rule**: **A mutation transaction is ONLY acknowledged as complete when BOTH the backend database commit AND the cache update/eviction succeed.**
  $$\text{Operation Complete} \iff \text{Success}(\text{MongoDB ACID Write}) \ \land \ \text{Success}(\text{Cache Synchronous Update})$$
* **Prohibition of Fire-and-Forget Caching**:
  * Executing cache updates in detached background tasks (`Task.Run`) is **strictly forbidden**.
  * If a background cache task fails silently, Redis retains stale locks or out-of-date workspace status indicators, causing phantom lockouts.
* **Fail-Closed Synchronization Failure**:
  * Under normal HA operation, if MongoDB commits successfully, but Redis throws a timeout or connection failure during cache synchronization:
  * The API **does not return HTTP 200**.
  * It returns **HTTP 503 Service Unavailable** with an explicit `CacheSynchronizationException`, prompting an immediate client refresh. (In the `~0.001%` catastrophic event where *both* Redis HA Primary and Replica are completely unavailable, the session circuit breaker redirects directly to canonical MongoDB per Decision 2.1.)

---

### Decision 3.2: Cluster-Wide & Multi-Region Cache Coherence (`Single` Local vs. `MultiRegionGeoPartitioned` Relay)
Because Vialiq runs **zero pod-local `.NET IMemoryCache` L1 caches**, single-region coherence is immediate across all API pods (`< 1–2 ms` in Shared Redis). To protect the ~75–85% single-region studies from cross-region overhead while keeping ~15–25% multi-region studies coherent ([Scale 005](../scaling-architecture/005-database-cluster-farm-regional-compliance-and-throughput-scaling.md)):
1. **75% `StorageTopologyMode.Single` (Zero Cross-Region Overhead):** The initiating pod executes direct synchronous `KeyDeleteAsync`, `INCR epoch`, or `StringSetAsync` on its single local Regional Redis cluster—zero cross-region hops.
2. **25% `StorageTopologyMode.MultiRegionGeoPartitioned` (Targeted Control-Plane Outbox Relay):**
   * Patient data & 15m form edit leases (`edc:form_lock:*`) stay **100% regional** inside their origin VPC (never replicated cross-border).
   * Control-Plane metadata invalidations (epoch increments, `study_registry` site/zone transfers, `BlindingScope` / `CanUnlockForms` changes, and session JWT revocations) publish to a **Control-Plane Outbox $\rightarrow$ Regional Cache Relay** targeting only the study's registered `Zones[]` (`ZONE_US`, `ZONE_EU`, `ZONE_CN`), backed by bounded `5–15 min` TTLs on regional auth/routing entries as a fail-safe against transient WAN blips.
3. **Optional Event Notification:** Lightweight Redis Pub/Sub events (`vialiq:cache:invalidations`) notify SignalR hubs (`PlatformNotificationHub`) if active UI clients require live workspace notifications.

---

### Decision 3.3: Protocol Amendment Mass Invalidation via Epoch Salt Key Rotation
When an IRB/Ethics Committee approves a formal **Protocol Amendment** (e.g. Protocol Version 2.0 modifying 40 forms across 50,000 subjects):
* Issuing mass `DEL` commands on tens of thousands of keys locks the Redis single-threaded execution loop.
* **Epoch Salt Rotation**:
  1. Every study cache key includes the active epoch token inside the unified envelope:  
     `vialiq:study:{tenant}:{study}:{env}:ep{epoch}:{scope}:{locale}:{resource}:{id}`
  2. The active epoch counter is stored in Redis (no TTL): `epoch:{tenant}:{study}`.
  3. When Amendment Version 2 is approved, the system executes an atomic increment:  
     `INCR epoch:novartis:onco101` ($\rightarrow$ `ep2`) — locally for `Single` trials, or fanned out across registered `Zones[]` during the `ADR 008` Stage 4 Maintenance Lock for multi-region trials.
  4. **Instant Invalidation in < 1 ms**: All future lookups automatically target `ep2`. Old `ep1` cache entries age out naturally via Redis TTL without causing Redis CPU spikes.

---

### Decision 3.4: Study Freeze & Database Lock Caching
When an interim analysis freeze or final clinical study closeout occurs:
1. The study status is updated in MongoDB (`study_locks`) to `LOCKED` / `FROZEN`.
2. A persistent (no-TTL) Redis governance hash/token (`vialiq:locks:{studyId}` / `vialiq:study:{tenant}:{study}:status`) is immediately updated synchronously (and any active `study_edit_leases` / `edc:form_lock:*` under that frozen scope are evicted).
3. Subsequent form open and edit requests check this token in `< 1 ms`:
   * Any attempt to acquire an edit lease or submit a CRF is immediately rejected at the controller gate with HTTP `423 Locked`, preventing unnecessary database load.

---

## 5. Step 4: Eviction Policy & Memory Budget

```
                         EVICTION & MEMORY POLICY
                                    │
                        REDIS EVICTION POLICY
                        ---------------------
                        • maxmemory 2gb baseline -> 16-256gb (Scale 004)
                        • maxmemory-policy volatile-lru + 75% alert
                        • NO TTL: Dictionaries, governance locks, epochs
                        • WITH TTL: [Cached] views, schemas, 15m edit leases
```

---

### Decision 4.1: Redis Eviction Policy (`volatile-lru`) & No-TTL Protection Rule
* **Setting**: `maxmemory-policy volatile-lru` (paired with `75%` memory high-water alert and tier-scaled `maxmemory`).
* **Rationale**:
  * *Why NOT `allkeys-lru`?* `allkeys-lru` indiscriminately evicts any key, risking silent drops of MedDRA/WHODrug dictionaries or governance freeze state under pressure.
  * *Why NOT `noeviction`?* `noeviction` fails new writes (blocking new form edit leases or revocations) when temporary response caches fill RAM.
  * *How `volatile-lru` works cleanly as designed*: Invariant **Reference Dictionaries** (`MedDRA`, `WHODrug`, global standards), **Governance Freeze Hashes** (`vialiq:locks:*`), and **Study `epoch` Counters** carry **no TTL** (replaced deterministically on new version publish, XFetch background refresh, or `[RotateCacheKey]`). Meanwhile, `[Cached]` views (`1h`), idle schemas (`24h`), `60s` negative sentinels, and `15m` form edit leases/revocations carry TTLs—so `volatile-lru` can never touch persistent reference/governance state, while `75%` RAM alerting protects active `15m` leases from memory pressure.

---

## 6. Consequences & Regulatory Assessment

* **Positive**:
  * **100% HIPAA & GDPR Multi-Tenant Safety**: No clinical data in cache; strict 3-tier key namespacing; fail-closed `SecurityException` gates.
  * **Zero Ephemeral-Only State & Total-Outage Resilience**: MongoDB (`study_locks` for regulatory freeze/DBL and `study_edit_leases` for 15-minute UI edit leases) is the canonical source of truth; in the `~0.001%` event both Redis HA Primary and Replica are simultaneously unavailable, a single session circuit-breaker check redirects directly to MongoDB until Sentinel recovers.
  * **Dual-Write Consistency**: Under normal HA operation, API mutations, lock transitions, and invalidations are complete only when both DB and Cache acknowledge synchronously; zero phantom locks, zero stale workspace indicators.
  * **Anti-Stampede & Anti-Attacker Protection**: Single-flight mutex guarantees exactly 1 DB query per concurrent miss; negative caching shields against scanner probes.
  * **High Availability with Auto-Recovery**: Redis primary-secondary failover with automatic re-sync (`PSYNC`) detailed in companion guide ADR 007-B.
* **Negative**:
  * If Redis experiences a rare transient blip during the cache synchronization step, the API returns HTTP 503 instead of 200, requiring a client retry. This is a deliberate, necessary tradeoff to guarantee 100% consistency over loose eventual consistency.

---

## 7. Verification & Testing Standards

1. **Dual-Write Completion Integration Test**: Simulates a Redis network timeout during `SaveCrfDataAsync`; asserts that API returns HTTP 503 and does not falsely report success to caller.
2. **Single-Flight Stampede Test**: Fires 200 parallel concurrent tasks requesting an unpopulated form schema; asserts that the underlying MongoDB repository is invoked exactly 1 time.
3. **Negative Caching Test**: Requests a non-existent asset ID; asserts that second request returns 404 in < 1ms without calling MongoDB.
4. **Fail-Closed Security Test**: Calls `GetOrCreateStudyAsync` without JWT claims; asserts immediate `SecurityException`.
