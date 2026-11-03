# ADR 007-A: Multi-Tenant Cache Isolation, Data Classification & Security Scoping

> **Status:** ✅ **SEALED & APPROVED**  
> **Date:** October 2026  
> **Deciders:** Architecture Core Team  
> **Domain:** Distributed Caching Tier (.NET 9 `HybridCache` L1 / Redis L2), Multi-Tenant Security, GxP Compliance  
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
* **Strict Rule**: Live patient CRF responses, subject records, medical histories, lab values, and adverse event narratives shall **NEVER** be stored in Redis (L2) or in-memory `HybridCache` (L1).
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
• MongoDB study_locks (Durable system of record)            • Redis Primary/Replica HA Pair (< 1-2 GB RAM)
• Zero data exists solely in cache                          • Sub-millisecond lock lookup (< 1ms)
• If Redis fails, system safely falls back to MongoDB       • .NET 9 HybridCache Single-Flight Mutex
```

---

### Decision 2.1: Canonical Source of Truth = Database (Zero Ephemeral-Only State)
* **Strict Rule**: **No data or locks shall ever exist solely in volatile cache memory.**
* **Lock Persistence Mechanics**:
  1. **Acquisition**: When a user locks a form, the lock is written atomically to MongoDB `study_locks` collection (`status: "ACTIVE"`, `userId`, `lockedAtUtc`, `expiresAtUtc`) with a unique index on `{ studyId: 1, targetCrfId: 1, isActive: 1 }`.
  2. **Cache Synchronization**: It is written-through to Redis key `edc:form_lock:{studyId}:{crfId}` with a 15-minute sliding TTL.
  3. **Release & Override**: When saved, closed, or broken, the status is updated in MongoDB (`status: "RELEASED"` or `"BROKEN"` with mandatory Part 11 reason) and evicted from Redis (`DEL`).
* **Failure Resilience**: If Redis restarts or is completely offline, the API does not fail; it catches the Redis connection exception and transparently queries MongoDB `study_locks` directly.

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
* **High Availability (HA) Clustering**: The distributed L2 cache is deployed as a **Primary-Secondary HA Pair with Automated Sentinel Failover** (detailed in ADR 007-B).

---

### Decision 2.3: Deterministic Multi-Tenant Namespacing & Fail-Closed Guard
To guarantee absolute multi-tenant isolation, cache keys adhere strictly to the 3-tier hierarchy established in [FTS-001](../functional-and-technical-specs/001-global-and-client-standards-library-specification.md):

```
vialiq:global:standards:{resource}:{id}                  # Global Library (Read-only for all)
vialiq:tenant:{tenantId}:lib:{resource}:{id}             # Client Library (Isolated strictly to TenantId)
vialiq:study:{tenantId}:{studyId}:{env}:{resource}:{id}  # Study Instance (Isolated to TenantId + StudyId)
```

#### Enforcement via `IScopedCacheService`:
Developers are strictly prohibited from formatting raw cache key strings. All caching calls flow through `IScopedCacheService`, which extracts authenticated tenant context from `ITenantStudyContextAccessor`:

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

    var fullyQualifiedKey = $"vialiq:study:{context.TenantId}:{context.StudyId}:{context.Environment}:{resource}:{key}";
    return await _hybridCache.GetOrCreateAsync(fullyQualifiedKey, factory, cancellationToken: ct);
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
DEFENSE 1: SINGLE-FLIGHT MUTEX (Native in .NET 9)               DEFENSE 2: NEGATIVE CACHING (Anti-Penetration)
HybridCache.GetOrCreateAsync                                    • Attacker queries fake IDs (/forms/fake-uuid-999)
• Request 1 acquires execution lock and queries MongoDB         • System caches NULL_RECORD for 60 seconds
• Requests 2 to 5,000 AWAIT Request 1's task                    • Subsequent attacker requests return 404 in 0ms
• Request 1 populates cache; 4,999 served from RAM in 0ms       • MongoDB is NEVER touched after the first check
• Database receives EXACTLY 1 query, not 5,000!                                  │
                                                                                 ▼
                                                                DEFENSE 3: RATE LIMITING (Sliding Window)
                                                                • Throttles abusive IPs/users with HTTP 429
```

1. **Defense 1: Single-Flight Concurrency Mutex (.NET 9 `HybridCache`)**:
   * Uses an internal asynchronous `SemaphoreSlim` per key.
   * When 5,000 requests hit simultaneously for a missing key, **Thread 1 executes the MongoDB query**.
   * Threads 2 through 5,000 pause asynchronously.
   * When Thread 1 finishes in 15ms, it populates L1/L2 and releases the lock. All 4,999 waiting requests are served **directly from memory in 0ms**.
   * **MongoDB receives exactly 1 query, not 5,000.**
2. **Defense 2: Negative Caching (Anti-Penetration against Random Attacker IDs)**:
   * When an attacker queries a non-existent form or asset ID (`/api/v1/forms/fake-uuid-999`), MongoDB returns `null`.
   * The backend caches a **Negative Sentinel Entry (`NULL_RECORD`)** with a 60-second TTL.
   * Subsequent requests for that fake ID return HTTP `404 Not Found` directly from cache in `< 1µs`, preventing repeated database scans.
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
• 21 CFR Part 11 audit records                               • Invalidate L1/L2 summary tags
• study_locks durable state                                  • Publish invalidation broadcast
• CommitTransactionAsync(w: "majority")                      • Await synchronous confirmation
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
  * If MongoDB commits successfully, but Redis throws a timeout or connection failure during cache synchronization:
  * The API **does not return HTTP 200**.
  * It returns **HTTP 503 Service Unavailable** with an explicit `CacheSynchronizationException`, prompting an immediate client refresh. The subsequent read hits MongoDB directly and self-heals the cache.

---

### Decision 3.2: Multi-Instance Invalidation via Redis Pub/Sub Backplane
When a running API instance updates a cached resource (such as a form schema or user role claim):
1. **Local L1 Eviction**: The initiating instance evicts the key from its local in-process `HybridCache`.
2. **Distributed L2 Eviction**: The initiating instance deletes the key from Redis (`KeyDeleteAsync` or `RemoveByTagAsync`).
3. **Cluster Broadcast**: The initiating instance publishes a lightweight invalidation message across the Redis backplane:
   ```json
   // Channel: vialiq:cache:invalidations
   {
     "tenantId": "novartis",
     "studyId": "STUDY_ONCO_101",
     "cacheKey": "vialiq:study:novartis:STUDY_ONCO_101:prod:schema:form_vitals",
     "tags": ["form-schemas:STUDY_ONCO_101"]
   }
   ```
4. **Peer Eviction**: All sibling API instances subscribing to the channel evict the matching key from their local L1 RAM in **< 5 milliseconds**.

---

### Decision 3.3: Protocol Amendment Mass Invalidation via Epoch Salt Key Rotation
When an IRB/Ethics Committee approves a formal **Protocol Amendment** (e.g. Protocol Version 2.0 modifying 40 forms across 50,000 subjects):
* Issuing mass `DEL` commands on tens of thousands of keys locks the Redis single-threaded execution loop.
* **Epoch Salt Rotation**:
  1. Every study cache key includes an active epoch token:  
     `vialiq:study:{tenant}:{study}:v{epoch}:...`
  2. The active epoch counter is stored in Redis: `epoch:{tenant}:{study}`.
  3. When Amendment Version 2 is approved, the system executes an atomic increment:  
     `INCR epoch:novartis:onco101` ($\rightarrow$ `v2`).
  4. **Instant Invalidation in < 1 ms**: All future lookups automatically target `v2`. The old `v1` cache entries age out naturally via Redis TTL without causing any Redis CPU spikes.

---

### Decision 3.4: Study Freeze & Database Lock Caching
When an interim analysis freeze or final clinical study closeout occurs:
1. The study status is updated in MongoDB to `LOCKED` / `FROZEN`.
2. A cached study status token `vialiq:study:{tenant}:{study}:status` is immediately set to `LOCKED`.
3. Subsequent form open and edit requests check this token in `< 1µs`:
   * Any attempt to acquire a lock or submit a CRF is immediately rejected at the controller gate with HTTP `423 Locked`, preventing unnecessary database load.

---

## 5. Step 4: Eviction Policy & Noisy-Neighbor Protection

```
                         EVICTION & MEMORY POLICY
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
REDIS L2 EVICTION POLICY                                  POD IN-PROCESS L1 RAM CEILING
------------------------                                  -----------------------------
• maxmemory 2gb (or 4gb)                                  • MaximumPayloadBytes = 10 MB
• maxmemory-policy volatile-lru                           • Max L1 memory = 512 MB per pod
• Protects persistent dictionaries                        • Evicts LRU entries to L2 Redis
• Evicts expired/cold TTL keys only                       • Runaway payload protection
```

---

### Decision 4.1: Redis Eviction Policy (`volatile-lru`)
* **Setting**: `maxmemory-policy volatile-lru`
* **Rationale**:
  * *Why NOT `allkeys-lru`?* `allkeys-lru` indiscriminately evicts any key. If memory was pressured, Redis might evict persistent reference dictionaries (like MedDRA or CDISC CT) or corporate client standards.
  * *Why NOT `noeviction`?* `noeviction` returns an OOM error on new writes, which would block new form locks from being acquired.
  * *Why `volatile-lru` wins*: It evicts **only keys that possess an explicit TTL** (e.g. old form locks, expired session tokens, or temporary query caches), while leaving long-lived reference dictionaries completely untouched.

---

### Decision 4.2: Pod In-Process L1 Memory Ceiling (.NET 9 `HybridCache`)
To prevent a single tenant with complex forms from consuming all RAM in an API pod:
* **Max Payload Cap**: `options.MaximumPayloadBytes = 10 * 1024 * 1024` (10 MB). Any attempt to cache an asset exceeding 10 MB is rejected, preventing rogue payloads from hogging RAM.
* **Pod Memory Budget**: Each API pod allocates a maximum of **512 MB** for L1 in-process cache. When L1 reaches 512 MB, least-recently-used items are dropped from local RAM; subsequent lookups retrieve them from L2 Redis in < 1ms.

---

## 6. Consequences & Regulatory Assessment

* **Positive**:
  * **100% HIPAA & GDPR Multi-Tenant Safety**: No clinical data in cache; strict 3-tier key namespacing; fail-closed `SecurityException` gates.
  * **Zero Ephemeral-Only State**: MongoDB `study_locks` is the canonical source of truth; if Redis dies, the system degrades safely to MongoDB.
  * **Dual-Write Consistency**: API operations are only complete when both DB and Cache acknowledge; zero phantom locks, zero stale workspace indicators.
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
