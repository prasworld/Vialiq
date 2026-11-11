# ADR 009: Legal Timestamp Authority, Atomic Monotonic Sequencing & Non-Sharded Replica Set Ordering

> **Status:** ✅ **SEALED & APPROVED**  
> **Date:** October 2026  
> **Deciders:** Architecture Core Team  
> **Domain:** Audit Trail Integrity, Distributed Systems Timekeeping, Electronic Records & Signatures  
> **Regulatory Standards:** FDA 21 CFR Part 11 § 11.10(a),(e); EU Annex 11 § 9; ICH GCP E6(R3) Section 5.18; GAMP 5 Category 4  
> **Related Architecture Documents:**
> - [ADR 006: 21 CFR Part 11 Audit Trail Architecture](./006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md)
> - [ADR 007-A: Multi-Tenant Cache Isolation & Security Scoping](./007-a-multitenant-cache-isolation-and-security-scoping-adr.md)
> - [002: 3-Cluster & Flexible Tenancy Architecture](../backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md)

---

## 1. Executive Summary & Problem Context

In a regulated clinical EDC platform, electronic audit trails and electronic signatures must be legally defensible under **FDA 21 CFR Part 11 § 11.10(a),(e)** and **EU Annex 11 § 9**. Regulatory inspectors require an irrefutable, unambiguous chronological record of every clinical event:
* *Was an Adverse Event reported before or after the patient's drug dosage was increased?*
* *Did an automated discrepancy query fire in response to a data entry, or did it precede it?*
* *Did the Investigator sign the CRF before or after the Data Manager locked the visit?*

### The Theoretical Trap (The "Distributed Clock Skew" Fallacy)
In academic distributed systems, clock skew is treated as an intractable dilemma requiring atomic clocks (Google TrueTime), vector clocks, or complex Paxos consensus rounds across geographically distributed shards. 

### The Practical Clinical Reality
1. **Human Clinicians Do Not Race in Milliseconds**: Two human beings (e.g., an Investigator and a CRA) will **never** perform sequential actions on the exact same CRF within milliseconds. Human clinical workflows operate in minutes, hours, and days.
2. **Studies Are NEVER Sharded**: In our 3-layer architecture, each clinical protocol lives in an isolated database (`study_{studyId}_prod`). Even a massive Phase 3 global oncology trial with 5,000 subjects over 4 years produces **only 15 GB to 30 GB of data**. A standard MongoDB **Replica Set** handles this with ease. 
3. **Single Point of Serialization**: Because a study is never sharded across multiple clusters, **100% of all write operations for that study commit to the exact same single Primary MongoDB node of that replica set**.

The single Primary node already serializes every transaction through its Oplog. Therefore, the problem shrinks from an "impossible distributed systems dilemma" to **three simple, robust engineering rules**.

---

## 2. Core Architectural Decisions

```
                              THE 3-PILLAR TIMING ARCHITECTURE
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
DECISION 9.1: MONGO PRIMARY           DECISION 9.2: ATOMIC MONOTONIC        DECISION 9.3: ZERO CLIENT
IS LEGAL TIME AUTHORITY               SEQUENCE PER STREAM                   DEVICE TIME TRUST
---------------------------           ------------------------------        -------------------------
• Single Primary replica node         • In the ACID commit transaction,     • Browser/iPad time is PURELY
  assigns the legal audit               MongoDB atomically increments:        display metadata for the UI
  timestamp (`ServerTimestampUtc`)      `$inc: { "auditSequence": 1 }`        ("2:30 PM London Time").
  during the commit (`$$NOW`).        • Event A is Sequence 41,             • The legal regulatory timestamp
• Multi-pod K8s clock variations        Event B is Sequence 42.               is STRICTLY the server/db time.
  cannot invert transaction order.    • Mathematically guarantees           • Client device clock cannot
• Single node = zero clock skew.        strict causal ordering.               tamper with Part 11 records.
```

---

### Decision 9.1: The Non-Sharded Study Invariant & Primary Node Time Authority
* **Strict Rule**: A study database (`study_{studyId}_prod`) shall **never be sharded across multiple MongoDB clusters**.
* **Rationale**:
  * Eliminates cross-shard distributed transactions, two-phase commits, and cross-cluster clock drift.
  * Guarantees that every audit record and data entry for a study commits on the **exact same physical Primary database node**.
* **Legal Timestamp Generation & Anti-Skew Ban on `DateTime.UtcNow`**:
  * Application pod clock time (`DateTime.UtcNow`) is **strictly banned** for legal audit record timestamping because different API pods may experience slight clock offsets or scheduling latency, allowing application-generated timestamps to contradict database commit sequence order.
  * The regulatory timestamp (`ServerTimestampUtc`) is generated **strictly inside the MongoDB ACID transaction on the database Primary node** via `$currentDate` / `$$NOW`.
  * In MongoDB multi-document transactions, the commit cluster time (`clusterTime` from the Oplog) establishes absolute physical ordering across all database operations.

---

### Decision 9.2: Atomic Monotonic Sequence Numbers (`AuditSequence`)
* **The Problem**: What if two system actions (e.g. Investigator saves form + background engine fires auto-query) commit within the same wall-clock millisecond?
* **The Rule**: Every audit record within a Subject/CRF stream includes an atomically incremented 64-bit integer: **`AuditSequence`**.
* **Atomic Mechanism**:
  ```csharp
  // Inside the MongoDB ACID transaction on study_{id}_prod:
  var update = Builders<BsonDocument>.Update
      .Inc("auditSequence", 1L)
      .CurrentDate("commitTimestampUtc"); // Atomically assigns database Primary clock
  ```
* **Causal Ordering Guarantee**:
  * If Event $B$ is triggered by Event $A$, Event $B$ is guaranteed to receive:
    $$\text{AuditSequence}(B) > \text{AuditSequence}(A)$$
* **Deterministic Inspection Sorting**:
  * When an FDA inspector, Lead CRA, or Data Manager audits a patient's CRF history or exports CDISC ODM-XML data, the query sorts by:
    $$\text{ORDER BY AuditSequence ASC, ServerTimestampUtc ASC}$$
  * An automated query, monitor verification, or electronic signature can **never appear before the data entry that caused it**, even if wall clocks were identical.

---

### Decision 9.3: Zero Client Trust (Client Device Time is Display-Only Metadata)
* **Strict Rule**: Timestamps originating from client browsers, laptops, iPads, or mobile ePRO smartphones shall **NEVER** be used as the legal timestamp for audit trail records, e-signatures, or data entries.
* **The Attack / Failure Vector**:
  * Users can adjust their device clocks (e.g. setting clock back 2 days to appear compliant with a 24-hour protocol reporting deadline).
  * Devices travel across international time zones with misconfigured daylight saving offsets.
  * Dead CMOS batteries or drifting hardware RTC chips.
* **Metadata Separation**:
  * Client device time is captured strictly as contextual metadata:
    * `ClientReportedLocalTime`: For rendering *"Entered at 14:30 site local time"* on the web UI.
    * `ClientTimeZoneId`: e.g. `"America/New_York"`, `"Europe/Berlin"`, `"Asia/Tokyo"`.
  * The legal Part 11 audit timestamp is **always** `ServerTimestampUtc` sourced from the database Primary node.

---

### Decision 9.4: Standard Cloud Node Synchronization (Chrony / AWS Time Sync)
* **Standard Infrastructure Configuration**:
  * All Kubernetes worker nodes, API pods, and MongoDB replica set hosts run **Chrony** connected to the cloud provider's local Stratum 1 reference clock:
    * **AWS**: `169.254.169.123` (AWS Time Sync Service via PTP/NTP).
    * **Azure**: Azure Time Sync Service.
  * This guarantees node-to-node clock synchronization within **$< 1\text{ millisecond}$** with leap-second smoothing (no sudden backward clock steps).
* **Application Readiness Healthcheck**:
  * Each API pod checks its clock offset against the host reference. If physical drift exceeds **$100\text{ ms}$**, the `/health/ready` probe trips, taking the pod out of traffic until resynced.

---

### Decision 9.5: Cryptographic Hash Chaining (ADR 006 Tie-In)
* To guarantee complete ALCOA+ data integrity and satisfy 21 CFR Part 11 § 11.10(a), each audit entry is cryptographically bound to its predecessor:
  $$\text{CurrentHash} = \text{SHA256}\Big(\text{PreviousHash} + \text{AuditSequence} + \text{ServerTimestampUtc} + \text{UserId} + \text{EventType} + \text{FieldPayload}\Big)$$
* Any retroactive manipulation of a timestamp or sequence number breaks the SHA-256 hash chain immediately, failing regulatory verification checks.

---

## 3. Data Contract & Model Specification (.NET 9 C#)

The following immutable record models define the audit timestamping structure in `backend/api/src/Vialiq.Core`:

### 3.1 Audit Timestamp Metadata Model

```csharp
namespace Vialiq.Core.Models;

using System;

/// <summary>
/// Encapsulates regulatory Part 11 timestamp authority and monotonic causal ordering.
/// Conforms to FDA 21 CFR Part 11 § 11.10(a),(e) and EU Annex 11 § 9.
/// </summary>
public sealed record AuditTimestampMetadata(
    // 1. LEGAL REGULATORY AUTHORITY: Assigned strictly by database commit timestamp ($$NOW) inside the transaction
    DateTime ServerTimestampUtc,

    // 2. MONOTONIC CAUSAL SEQUENCE: Atomically incremented integer (1, 2, 3...)
    long AuditSequence,

    // 3. CONTEXTUAL METADATA (Reference Only): For site-local UI display
    DateTime? ClientReportedLocalTime = null,
    string? ClientTimeZoneId = null)
{
    /// <summary>
    /// Constructs regulatory metadata using the authoritative database commit timestamp 
    /// generated by the primary replica set node inside the ACID transaction.
    /// Application clock DateTime.UtcNow is strictly prohibited to prevent distributed clock skew inversion.
    /// </summary>
    public static AuditTimestampMetadata FromDatabaseCommit(
        DateTime databaseCommitTimestampUtc,
        long auditSequence,
        DateTime? clientLocalTime = null,
        string? clientTimeZoneId = null)
    {
        if (databaseCommitTimestampUtc.Kind != DateTimeKind.Utc)
        {
            databaseCommitTimestampUtc = DateTime.SpecifyKind(databaseCommitTimestampUtc, DateTimeKind.Utc);
        }

        return new AuditTimestampMetadata(
            ServerTimestampUtc: databaseCommitTimestampUtc,
            AuditSequence: auditSequence,
            ClientReportedLocalTime: clientLocalTime,
            ClientTimeZoneId: clientTimeZoneId);
    }
}
```

---

### 3.2 Clinical Audit Event Entity (MongoDB BSON Document)

```csharp
namespace Vialiq.Core.Entities;

using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using Vialiq.Core.Models;

public sealed class ClinicalAuditRecordEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public string TenantId { get; set; } = string.Empty;
    public string StudyId { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;
    public string TargetCrfId { get; set; } = string.Empty;

    // Legal Timestamp Authority & Monotonic Ordering (ADR 009)
    public AuditTimestampMetadata TimestampMeta { get; set; } = null!;

    // Cryptographic Chain (ADR 006)
    public string PreviousHash { get; set; } = string.Empty;
    public string CurrentHash { get; set; } = string.Empty;

    // Actor Information (21 CFR Part 11 § 11.50)
    public string UserId { get; set; } = string.Empty;
    public string UserFullName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;

    // Clinical Change Details
    public string EventType { get; set; } = string.Empty; // FormSave, ValueChange, QueryRaise, Signature
    public string? ReasonForChange { get; set; }
    public BsonDocument ChangedFields { get; set; } = new();
}
```

---

### 3.3 Transactional Persistence Pattern: Database-Generated Commit Timestamp (`$$NOW`)

```csharp
namespace Vialiq.Infrastructure.Services;

using System;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using Vialiq.Core.Entities;
using Vialiq.Core.Models;

public sealed class ClinicalAuditPersistenceService : IClinicalAuditPersistenceService
{
    public async Task<ClinicalAuditRecordEntity> InsertAuditRecordInTransactionAsync(
        IClientSessionHandle session,
        IMongoDatabase studyDb,
        ClinicalAuditRecordEntity record,
        DateTime? clientLocalTime,
        string? clientTimeZoneId,
        CancellationToken ct)
    {
        // 1. Atomically increment sequence AND capture database commit clock ($currentDate / $$NOW)
        // Guarantees legal timestamp is assigned by the single MongoDB Primary replica node,
        // eliminating multi-pod application clock drift.
        var sequenceColl = studyDb.GetCollection<BsonDocument>("study_audit_sequences");
        var sequenceKey = $"{record.SubjectId}_{record.TargetCrfId}";
        
        var update = Builders<BsonDocument>.Update
            .Inc("auditSequence", 1L)
            .CurrentDate("commitTimestampUtc"); // Primary node clock authority ($$NOW)

        var options = new FindOneAndUpdateOptions<BsonDocument>
        {
            ReturnDocument = ReturnDocument.After,
            IsUpsert = true
        };

        var sequenceDoc = await sequenceColl.FindOneAndUpdateAsync(
            session, 
            Builders<BsonDocument>.Filter.Eq("_id", sequenceKey), 
            update, 
            options, 
            ct);

        long sequence = sequenceDoc["auditSequence"].AsInt64;
        DateTime dbCommitTimestamp = sequenceDoc["commitTimestampUtc"].ToUniversalTime();

        // 2. Populate the audit entity strictly from the database commit timestamp
        record.TimestampMeta = AuditTimestampMetadata.FromDatabaseCommit(
            databaseCommitTimestampUtc: dbCommitTimestamp,
            auditSequence: sequence,
            clientLocalTime: clientLocalTime,
            clientTimeZoneId: clientTimeZoneId);

        // 3. Compute Part 11 cryptographic hash chain over post-CSFLE stored payload (BinData ciphertext
        //    for SiteIdentifier PII so GDPR crypto-shredding preserves chain verifiability forever)
        record.CurrentHash = ComputeSha256Hash(
            record.PreviousHash,
            record.TimestampMeta.AuditSequence,
            record.TimestampMeta.ServerTimestampUtc,
            record.UserId,
            record.EventType,
            record.ChangedFields);

        // 4. Insert into the canonical ADR 006 domain-segregated audit collection
        //    (e.g. audit_crf_data, audit_subject_journey, audit_queries, audit_signatures)
        var auditColl = studyDb.GetCollection<ClinicalAuditRecordEntity>(targetAuditCollection);
        await auditColl.InsertOneAsync(session, record, cancellationToken: ct);

        return record;
    }

    private static string ComputeSha256Hash(
        string previousHash, 
        long sequence, 
        DateTime timestampUtc, 
        string userId, 
        string eventType, 
        BsonDocument changedFields)
    {
        // ADR 006 SHA-256 hash chaining implementation
        var raw = $"{previousHash}|{sequence}|{timestampUtc:O}|{userId}|{eventType}|{changedFields.ToJson()}";
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = System.Text.Encoding.UTF8.GetBytes(raw);
        return Convert.ToHexString(sha.ComputeHash(bytes)).ToLowerInvariant();
    }
}
```

---

## 4. Summary of Regulatory & Technical Guarantees

| Concern / Threat | Naive Architecture Failure | Vialiq ADR 009 Architectural Guarantee |
|---|---|---|
| **Client Device Time Tampering** | User sets laptop back 2 days to meet reporting deadline | **Rejected**: Legal timestamp is generated *strictly by the server* |
| **Simultaneous Millisecond Events** | Two events in same millisecond have ambiguous order | **Guaranteed**: Monotonic `AuditSequence` establishes strict causal order |
| **Cross-Shard Clock Inversion** | Shard A clock drifts ahead of Shard B clock | **Eliminated**: Studies are *never sharded*; single Mongo Primary serializes all writes |
| **Audit Log Tampering / Insertion** | Malicious actor inserts retroactive record | **Detected**: Breaks SHA-256 cryptographic hash chain |
| **Site Local Time Display** | Server UTC time confuses local clinical coordinators | **Supported**: Preserves `ClientReportedLocalTime` and `ClientTimeZoneId` as reference metadata |
| **Cloud VM Clock Slew** | VM hypervisor pause causes backward clock jumps | **Protected**: AWS Time Sync / Chrony leap smoothing + 100ms drift circuit breaker |
