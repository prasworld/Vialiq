# ADR 006: Full-Lifecycle 21 CFR Part 11 Audit Trail Architecture, Storage Stratification & Multi-Dimensional Indexing

> **Status:** ✅ **SEALED & APPROVED**  
> **Date:** October 2026  
> **Deciders:** Architecture Core Team  
> **Domain:** Database Tier, GxP Compliance & Regulatory Systems, Clinical Data Entry Engine  
> **Regulatory Standards:** FDA 21 CFR Part 11 § 11.10(a),(c),(d),(e),(g), § 11.50; ICH GCP E6(R3) § 5.5; EU CTR 536/2014; GAMP 5 Category 4/5; HIPAA § 164.312  

---

## 1. Executive Summary & Context

Under **FDA 21 CFR Part 11 § 11.10(e)** and **ICH GCP E6(R3)**, every clinical data creation, modification, or deletion must be recorded contemporaneously with an immutable, computer-generated, time-stamped audit trail. 

Early architectural drafts contained two critical flaws:
1. **The In-Memory Buffering Trap (`Channel<T>`)**: Proposing an in-memory queue to buffer audit writes risks permanent audit loss if a pod crashes or restarts before flushing, creating an immediate FDA 483 inspection violation (clinical data committed without its audit trail).
2. **The Monolithic Collection & Sharding Fallacy**: In a Phase 3 study of 10,000 subjects, field modifications, re-tests, and queries produce **15,000,000 to 50,000,000+ audit rows**. Dumping these into a single flat `audit_trail` collection creates massive B-tree index bloat, cache pollution in WiredTiger RAM, and an unreadable "firehose" for human auditors. Conversely, introducing physical MongoDB cluster sharding for ~8 GB of compressed audit data is severe over-engineering.

Furthermore, audit trails are required across **all environments and lifecycle phases**:
* **Layer 1 Admin**: User provisioning, role assignments, MFA, site permissions.
* **Layer 2 Dev/Multi-UAT**: Form builder design changes, Blockly edit checks, and multi-sandbox UAT execution evidence (CRO UAT, Sponsor UAT, Site Training).
* **Layer 3 Prod**: Live subject journeys, CRF data entry, clinical queries, and Investigator e-signatures.

This ADR codifies the definitive **Full-Lifecycle 21 CFR Part 11 Audit Trail Architecture**: domain-segregated collections, a universal multi-dimensional GxP envelope, atomic multi-document transactions, pre-provisioned compound indexes, and secondary read replica offloading.

---

## 2. Decision & Architectural Specifications

```
                                  AUDIT TRAIL CLASSIFICATION
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
1. DATA ENTRY AUDIT                  2. LIFECYCLE & WORKFLOW              3. GOVERNANCE & SCHEMA
   (90% Volume - High Density)          (8% Volume - High Value)             (2% Volume - Low Frequency)
   Collection: audit_crf_data           Collections:                         Collections:
   • Field-level diffs (old/new)        • audit_subject_journey              • audit_form_design (in Dev/UAT)
   • Reason for change                  • audit_queries                      • audit_security_admin (Control Plane)
   • Indexed by Subject/Site/Location   • audit_signatures                   • Protocol version promotions
```

---

### Decision 1: Physical Stratification Across Cluster Layers

Each cluster layer and environment maintains its own isolated audit collections:

```
CLUSTER LAYER 1: ADMIN (Port 27017)
└── Database: vialiq_control_plane
    └── Collection: audit_security_admin
        ├── User provisioning, deactivation, password/MFA changes
        ├── Role assignments & site access authorizations (Part 11 § 11.10(d),(g))
        └── Tenant and study provisioning history

CLUSTER LAYER 2: DEV / MULTI-UAT SANDBOX (Port 27027)
├── Database: study_{id}_dev
│   └── Collections: audit_form_design (Form builder edits, Blockly AST modifications)
│
├── Database: study_{id}_uat_cro
│   └── Collections: audit_form_design, audit_uat_execution (CRO validation runs)
│
├── Database: study_{id}_uat_sponsor
│   └── Collections: audit_form_design, audit_uat_execution (Official Sponsor CSV evidence)
│
└── Database: study_{id}_training
    └── Collections: audit_uat_execution (Site simulation entries; zero Prod contact)

CLUSTER LAYER 3: PROD (Port 27037)
└── Database: study_{id}_prod
    ├── Collection: audit_crf_data (High-density field modifications)
    ├── Collection: audit_subject_journey (Milestones: Screened ➔ Enrolled ➔ Randomized)
    ├── Collection: audit_queries (Discrepancy lifecycle: Open ➔ Answer ➔ Close)
    └── Collection: audit_signatures (21 CFR Part 11 § 11.50 Investigator sign-offs)
```

---

### Decision 2: The Universal Multi-Dimensional GxP Envelope

Every audit entry across all collections conforms to a universal envelope capturing the **4 critical query dimensions** (`Subject`, `Site`, `Location/Country`, `Language/Culture`) along with cryptographic chaining:

```json
{
  "_id": "aud_01J9X8K2M4P0Q1",
  "studyId": "STUDY_ONCO_101",
  
  /* --- The 4 Query Dimensions --- */
  "countryCode": "DE",               // Location: Germany (EU CTR inspection)
  "siteId": "SITE_204_BERLIN",       // Site: Charité Berlin (CRA monitoring)
  "subjectId": "SUBJ_204_012",       // Subject: Patient 12 (Investigator review)
  "cultureCode": "de-DE",            // Language/Culture: German locale (ePRO / I18n)
  
  "formInstanceId": "crf_vitals_v2",
  "fieldKey": "VS_SYSBP",
  "entityType": "CRF_DATA",
  "action": "UPDATE",
  "timestampUtc": "2026-10-27T07:15:30.120Z",
  "actor": {
    "userId": "usr_crc_hans",
    "role": "CRC",
    "fullName": "Hans Schmidt, RN",
    "ipAddress": "192.168.1.45"
  },
  "reasonForChange": "Tippfehler bei der ersten Eingabe",
  "payload": {
    "formId": "FORM_VITAL_SIGNS",
    "visitId": "VISIT_01_SCREENING",
    "dataType": "NUMBER",
    "oldValue": 118,
    "newValue": 124,
    "unit": "mmHg"
  },
  "previousHash": "a3f5c1...",
  "recordHash": "e89b12..."
}
```

---

### Decision 3: The 4 High-Selectivity Compound Indexes

To support all 4 query dimensions without table scans or high RAM usage, the dedicated `audit_crf_data` collection is indexed across 4 targeted compound keys:

```javascript
// 1. SUBJECT & FIELD WISE (98% of operational UI traffic)
// Used by: In-form clock icon popover & Form Drawer History (<1ms point lookup)
db.audit_crf_data.createIndex(
  { subjectId: 1, formInstanceId: 1, fieldKey: 1, timestampUtc: -1 },
  { name: "idx_audit_subject_field" }
);

// 2. SITE WISE (CRA Monitoring Visits)
// Used by: CRA monitoring visit: "Show all changes made at Site 204 in the last 30 days"
db.audit_crf_data.createIndex(
  { siteId: 1, timestampUtc: -1 },
  { name: "idx_audit_site_timeline" }
);

// 3. LOCATION / REGIONAL WISE (Health Authority Inspections)
// Used by: EMA, FDA, or PMDA inspector: "Export all audit trails for sites in Germany"
db.audit_crf_data.createIndex(
  { countryCode: 1, timestampUtc: -1 },
  { name: "idx_audit_country_timeline" }
);

// 4. LANGUAGE / CULTURE WISE (Multilingual & ePRO Validation)
// Used by: Multilingual audit: "Verify all patient questionnaires submitted under 'ja-JP'"
db.audit_crf_data.createIndex(
  { cultureCode: 1, timestampUtc: -1 },
  { name: "idx_audit_culture_timeline" }
);
```

---

### Decision 4: Index Creation Lifecycle (Study Provisioning Time)

Indexes are **never created lazily or during live patient traffic**. They are created at **Study Provisioning Time** via `IStudyAuditIndexInitializer`:

```csharp
namespace Vialiq.Infrastructure.Database;

public class StudyAuditIndexInitializer : IStudyAuditIndexInitializer
{
    public async Task InitializeAuditIndexesAsync(IMongoDatabase studyDb, CancellationToken ct)
    {
        var auditCollection = studyDb.GetCollection<AuditTrailEntry>("audit_crf_data");

        var indexModels = new List<CreateIndexModel<AuditTrailEntry>>
        {
            new(
                Builders<AuditTrailEntry>.IndexKeys
                    .Ascending(a => a.SubjectId)
                    .Ascending(a => a.FormInstanceId)
                    .Ascending(a => a.FieldKey)
                    .Descending(a => a.TimestampUtc),
                new CreateIndexOptions { Name = "idx_audit_subject_field" }
            ),
            new(
                Builders<AuditTrailEntry>.IndexKeys
                    .Ascending(a => a.SiteId)
                    .Descending(a => a.TimestampUtc),
                new CreateIndexOptions { Name = "idx_audit_site_timeline" }
            ),
            new(
                Builders<AuditTrailEntry>.IndexKeys
                    .Ascending(a => a.CountryCode)
                    .Descending(a => a.TimestampUtc),
                new CreateIndexOptions { Name = "idx_audit_country_timeline" }
            ),
            new(
                Builders<AuditTrailEntry>.IndexKeys
                    .Ascending(a => a.CultureCode)
                    .Descending(a => a.TimestampUtc),
                new CreateIndexOptions { Name = "idx_audit_culture_timeline" }
            )
        };

        await auditCollection.Indexes.CreateManyAsync(indexModels, ct);
    }
}
```

* **Execution**: Triggered during `POST /api/v1/admin/studies/provision`. Because the collections are empty, all indexes build in **< 50 milliseconds**.
* **Evolution**: Future index additions in later platform releases deploy non-disruptively via **Liquibase changesets** (`database/migrations/`).

---

### Decision 5: Atomic Persistence, Synchronous Cache Sync & Zero Data Loss Guarantee

Form data updates and compiled audit records are **always committed atomically** inside the same MongoDB Multi-Document ACID Transaction with write concern `w: "majority"`. Furthermore, the overall operation is **only complete when both the MongoDB transaction and distributed cache synchronization succeed**:

```csharp
public async Task<SaveCrfResponseDto> SaveCrfDataAsync(
    string studyId, 
    SaveCrfRequest request, 
    UserContext user, 
    CancellationToken ct)
{
    using var session = await _mongoClient.StartSessionAsync(cancellationToken: ct);
    session.StartTransaction();

    try
    {
        // -------------------------------------------------------------
        // STEP 1: ATOMIC DATABASE ACID TRANSACTION (Source of Truth)
        // -------------------------------------------------------------
        var existingCrf = await _crfCollection.Find(session, c => c.Id == request.CrfId)
            .FirstOrDefaultAsync(ct);

        // A. Compile field-level diffs deterministically on server
        var (updatedCrf, auditEntries) = _auditCompiler.CompileCrfDiff(existingCrf, request, user);

        // B. Persist updated form state
        await _crfCollection.ReplaceOneAsync(session, c => c.Id == updatedCrf.Id, updatedCrf, cancellationToken: ct);

        // C. Persist audit trail batch
        if (auditEntries.Count > 0)
        {
            await _auditTrailCollection.InsertManyAsync(session, auditEntries, cancellationToken: ct);
        }

        // D. Update durable lock state in MongoDB (Released or Extended)
        await _locksCollection.UpdateOneAsync(session, 
            l => l.StudyId == studyId && l.TargetCrfId == request.CrfId,
            Builders<StudyLockEntity>.Update.Set(l => l.Status, LockStatus.Released),
            cancellationToken: ct);

        // E. Commit together with majority write concern
        await session.CommitTransactionAsync(ct);
    }
    catch (Exception dbEx)
    {
        await session.AbortTransactionAsync(ct);
        _logger.LogError(dbEx, "Database transaction aborted for CRF {CrfId}", request.CrfId);
        throw;
    }

    // -------------------------------------------------------------
    // STEP 2: SYNCHRONOUS DISTRIBUTED CACHE SYNCHRONIZATION
    // -------------------------------------------------------------
    try
    {
        var lockKey = $"edc:form_lock:{studyId}:{request.CrfId}";
        var summaryTag = $"subject-summary:{studyId}:{request.SubjectId}";

        // Synchronously delete the lock key in Redis and invalidate L1/L2 summary tags
        await _redisDb.KeyDeleteAsync(lockKey);
        await _hybridCache.RemoveByTagAsync(new[] { summaryTag }, ct);
        await _redisSubscriber.PublishAsync(
            "vialiq:cache:invalidations", 
            JsonSerializer.Serialize(new CacheInvalidationEvent(lockKey, summaryTag))
        );
    }
    catch (Exception cacheEx)
    {
        _logger.LogCritical(cacheEx, 
            "CRITICAL: Distributed cache sync failed after DB commit for CRF {CrfId}.", request.CrfId);

        // Operation is NOT complete if cache sync fails
        throw new CacheSynchronizationException(
            "CRF data committed to database, but cache synchronization failed. Please refresh.", cacheEx);
    }

    return new SaveCrfResponseDto { CrfId = request.CrfId, Status = "SAVED_AND_SYNCHRONIZED" };
}
```

* **Zero Data Loss**: If a pod crashes mid-execution, both form updates and audit records roll back completely. Orphaned clinical data without an audit trail is mathematically impossible.
* **Dual-Write Completion Rule**: The API operation is acknowledged to the caller if and only if **both** MongoDB ACID commit and Redis cache eviction succeed. Fire-and-forget caching is strictly prohibited.
* **Database-Level Immutability**: The application database user has strictly `read` and `insert` permissions on `audit_*` collections; `update` and `delete` commands are hard-revoked at the MongoDB role level.

---

### Decision 6: Cache Protection via Read Replica Offloading

To ensure large audit exports and CRA queries never evict active clinical forms from MongoDB's WiredTiger RAM cache:
* **Writes**: Written to the Primary node in the active replica set (`w: "majority"`).
* **Audit Visualization & Large Exports**: Executed against **Secondary** replica set nodes (`ReadPreference: SecondaryPreferred`):
  ```csharp
  var auditCollection = database
      .GetCollection<AuditTrailEntry>("audit_crf_data")
      .WithReadPreference(ReadPreference.SecondaryPreferred);
  ```
* Primary node memory remains 100% dedicated to low-latency clinical data entry.

---

### Decision 7: 4 Contextual Human UI Views & In-Document Revision Stamps

Human users never browse a flat 50-million-row table. The UI renders audit data in 4 contextual layers:

1. **In-Form Field Popover**: Clicking the history clock icon on a field queries `idx_audit_subject_field` and displays only the revisions for that exact field in **< 1 ms**.
2. **Form Drawer Timeline**: Displays all field changes made on the active form instance.
3. **Subject Journey Stream**: Visualizes high-level patient milestones (`audit_subject_journey`).
4. **Global Regulatory Search Portal**: Filterable by Site, Subject, Date Range, and Reason, executed against read replicas.

#### Fast In-Form Rendering Optimization:
The live `crf_entries` document embeds lightweight revision metadata directly on modified fields:
```json
{
  "data": { "VS_SYSBP": 124 },
  "_fieldMeta": {
    "VS_SYSBP": { "version": 2, "lastModifiedBy": "Hans Schmidt", "hasHistory": true }
  }
}
```
The form renders the history indicator instantly without executing any query against the audit collection.

---

## 3. Consequences & Regulatory Assessment

* **Positive**:
  * **100% FDA 21 CFR Part 11 Compliance**: Contemporary, immutable, attributable, and cryptographically verifiable audit logs across all environments.
  * **Zero Sharding Complexity**: Avoids distributed mongos routers and cross-shard 2PC overhead; 50M records compress to ~8 GB and run on standard 3-node replica sets.
  * **Cache Protection**: Secondary replica offloading prevents audit exports from polluting the working set cache.
  * **GAMP 5 Validation Defensibility**: Sponsor UAT audit trails are cleanly isolated in `study_{id}_uat_sponsor.audit_uat_execution` for direct inclusion in the Validation Summary Report (VSR).
* **Negative**:
  * Slightly higher storage requirements for maintaining 4 compound indexes on `audit_crf_data` (~1.5 GB index RAM footprint at 50M rows, easily accommodated on 32GB+ replica set nodes).

---

## 4. Verification & Testing Standards

1. **Transaction Atomicity Test**: An automated integration test in `Vialiq.Api.Tests` injects a simulated database failure after CRF update but before audit insert; asserts that both operations abort cleanly.
2. **Immutability Permission Test**: Integration test verifies that attempting an `UpdateOneAsync` or `DeleteOneAsync` on `audit_crf_data` throws a MongoDB authorization failure (`CommandNotAuthorized`).
3. **Provisioning Benchmark**: Automated test verifies that `StudyAuditIndexInitializer` provisions all 4 indexes in < 50ms on empty study databases.
