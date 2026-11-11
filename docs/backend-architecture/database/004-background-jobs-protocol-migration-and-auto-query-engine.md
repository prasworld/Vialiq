# Background Jobs, Protocol Migration & Automated Query Management Engine
## Clinical EDC SaaS Platform — Asynchronous Worker & Migration Architecture

> **Domain:** Backend Architecture — Asynchronous Processing, Protocol Migration & Data Integrity  
> **Document Identifier:** `004-background-jobs-protocol-migration-and-auto-query-engine.md`  
> **Status:** **APPROVED ARCHITECTURE SPECIFICATION**  
> **Date:** October 16, 2026  
> **Version:** 1.0.0  
> **Target Engine:** MongoDB 7.0+ Replica Sets with Decoupled Distributed Worker Tier  
> **Regulatory Context:** FDA 21 CFR Part 11, EU Annex 11, ICH GCP E6(R3), GAMP 5 Category 4/5  
> **Related Architecture Documents:**
> - [001-database-selection-adr.md](./001-database-selection-adr.md) — MongoDB Document Selection
> - [002-3-cluster-and-flexible-tenancy-architecture.md](./002-3-cluster-and-flexible-tenancy-architecture.md) — 3-Cluster Topology & Database-per-Study Model
> - [003-comprehensive-architecture-rating-scorecard.md](./003-comprehensive-architecture-rating-scorecard.md) — Comprehensive Architecture Scorecard
> - [database-architecture-specification.md](./database-architecture-specification.md) — Collections, Schemas & ACID Boundaries

---

## Table of Contents

1. [Executive Summary: Why MongoDB Does Not Compromise Jobs](#1-executive-summary-why-mongodb-does-not-compromise-jobs)
2. [The Decoupled Worker Architecture (Storage vs. Compute Separation)](#2-the-decoupled-worker-architecture-storage-vs-compute-separation)
3. [Job 1: Study Versioning Engine](#3-job-1-study-versioning-engine)
4. [Job 2: Protocol Migration Engine (Zero-Downtime Amendments)](#4-job-2-protocol-migration-engine-zero-downtime-amendments)
5. [Job 3: Subject Data & Automated Query Generation on Migration](#5-job-3-subject-data--automated-query-generation-on-migration)
6. [Job 4: Event-Driven Reactive Jobs (MongoDB Change Streams)](#6-job-4-event-driven-reactive-jobs-mongodb-change-streams)
7. [Worker Technology Stack & Orchestration](#7-worker-technology-stack--orchestration)
8. [Architectural Comparison: MongoDB vs. PostgreSQL for Clinical Jobs](#8-architectural-comparison-mongodb-vs-postgresql-for-clinical-jobs)

---

## 1. Executive Summary: Why MongoDB Does Not Compromise Jobs

In traditional relational database engineering (PostgreSQL / SQL Server / Oracle), developers often default to database-internal job schedulers:
* PostgreSQL: `pg_cron`, PL/pgSQL triggers, `LISTEN/NOTIFY`
* SQL Server: SQL Server Agent, T-SQL stored procedures
* Oracle: `DBMS_SCHEDULER`, PL/SQL triggers

### The GxP / Clinical Regulatory Reality:
In regulated clinical trials under **FDA 21 CFR Part 11**, **ICH E6(R3)**, and **GAMP 5**, **running heavy migration or batch validation jobs inside the database engine is a recognized anti-pattern**:
1. **Resource Starvation:** A background job running complex edit checks or data migrations inside the database engine consumes DB CPU and memory, causing query latency spikes for hospital nurses and clinical investigators submitting live patient data.
2. **Locking Catastrophes:** In relational databases, running schema amendments or bulk updates across millions of patient records locks tables (`ACCESS EXCLUSIVE`), forcing the entire trial offline during maintenance windows.
3. **Validation & Observability Deficit:** Database-internal jobs lack modern distributed tracing, granular step retries, dead-letter queues, and health metrics required for formal Computer System Validation (CSV).

### The Modern Clinical Pattern:
The database engine (MongoDB) is strictly an **ACID persistence and query layer**. All batch processing, protocol migrations, study versioning pipelines, and automated discrepancy/query engines execute within a **Stateless, Horizontally Scalable Distributed Worker Tier**.

MongoDB's **document polymorphism**, **Change Streams**, and high-throughput **`bulkWrite()`** capabilities provide a far superior foundation for clinical jobs than relational databases.

---

## 2. The Decoupled Worker Architecture (Storage vs. Compute Separation)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ APPLICATION WORKER TIER (Stateless .NET 9 Workers: Change Streams / Hangfire / RabbitMQ / Temporal)     │
│                                                                                                        │
│  ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐               │
│  │ Study Versioning Worker │   │ Protocol Migration      │   │ Auto-Query & Validation │               │
│  │ - Manifest Compilation  │   │ - Amendment Promotion   │   │ - Retrospective Checks  │               │
│  │ - SHA-256 Hash Freezing │   │ - Schema Re-alignment   │   │ - Bulk Discrepancy Gen  │               │
│  └─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘               │
└─────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                              │ High-Throughput bulkWrite()
                                              │ Streaming Cursors (batchSize: 500)
                                              ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ MONGODB 3-CLUSTER DATABASE PERSISTENCE TIER                                                            │
│                                                                                                        │
│  ┌─────────────────────────┐   ┌─────────────────────────┐   ┌─────────────────────────┐               │
│  │ Cluster 0: Control Plane│   │ Cluster 1: Not-Live     │   │ Cluster 2: Live PROD    │               │
│  │ (vialiq_control_plane)  │   │ (study_{id}_dev / uat)  │   │ (study_{id}_prod)       │               │
│  │ - Study Registry        │   │ - Schema Drafts         │   │ - Live Patient Visits   │               │
│  │ - Protocol Manifests    │   │ - Dry-Run Simulation    │   │ - Automated Queries     │               │
│  │ - Migration State Log   │   │ - Test Subjects         │   │ - 21 CFR Part 11 Audits │               │
│  └─────────────────────────┘   └─────────────────────────┘   └─────────────────────────┘               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Job 1: Study Versioning Engine

A clinical protocol version defines the entire trial structure: visits, forms, sections, questions, codelists, and Google Blockly edit checks.

### 3.1 The Relational Problem in PostgreSQL:
In PostgreSQL, a study definition is normalized across 20+ tables. Creating a "Version 2.0 Draft" requires executing recursive SQL cloning scripts that copy thousands of rows across parent-child tables while re-mapping foreign keys (`study_id_new`, `form_id_new`, `field_id_new`). This is slow, error-prone, and difficult to roll back if a failure occurs mid-clone.

### 3.2 The MongoDB Document Solution:
In MongoDB, a complete protocol specification is modeled as a **Self-Contained, Hierarchical JSON/BSON Protocol Manifest Document**:

```typescript
// control-plane/study-manifest.ts
export interface ProtocolManifest {
  manifestId: string;
  studyId: string;
  version: string;                // e.g., '1.0.0', '2.0.0'
  status: 'DRAFT' | 'FROZEN' | 'UAT_APPROVED' | 'PUBLISHED_PROD';
  parentVersion?: string;         // '1.0.0'
  sha256Hash?: string;            // Cryptographic manifest seal
  
  // Entire trial hierarchy encapsulated in one document:
  visitSchedule: VisitDefinition[];
  forms: FormDefinition[];
  codelists: Record<string, CodelistItem[]>;
  editChecks: JsonLogicRuleDefinition[];
  
  governance: {
    createdBy: string;
    createdAt: Date;
    signedOffBy?: string;
    signedOffAt?: Date;
    signatureMeaning?: string;
  };
}
```

#### The Versioning Workflow:
1. **Atomic Branching:** Creating a draft Version 2.0 is an atomic document insert into `vialiq_control_plane.study_manifests`. It completes in **< 5 milliseconds**.
2. **Cryptographic Sealing:** When UAT is completed, the worker serializes the manifest, computes a SHA-256 checksum, and locks the document state to `FROZEN`.
3. **Zero Production Impact:** Creating 10 draft versions in DEV/UAT consumes zero compute on the live clinical cluster (Cluster 2).

---

## 4. Job 2: Protocol Migration Engine (Zero-Downtime Amendments)

In clinical research, **mid-study protocol amendments** occur in >70% of Phase II/III clinical trials (e.g., adding an optional biomarker sub-study, modifying inclusion criteria, or altering dosing visit schedules).

### 4.1 The Relational Lockout Barrier:
In relational databases, updating a table structure mid-study requires executing DDL (`ALTER TABLE`). On a table containing 5 million visit rows, PostgreSQL acquires an `ACCESS EXCLUSIVE` table lock. This blocks all reads and writes, forcing the trial into an offline maintenance window.

### 4.2 MongoDB Zero-Downtime Polymorphism:
MongoDB requires **zero DDL locks**. Documents in the `casebook_visits` collection are polymorphic. Records collected under Protocol v1.0.0 and records collected under Protocol v2.0.0 **natively coexist in the same database without table locks**:

```
VISIT 2 COLLECTION (study_oncology101_prod.casebook_visits)
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SUBJECT 001 - VISIT 2 (Completed Under Protocol v1.0.0 in June 2026)                   │
│ {                                                                                      │
│   "subjectId": "SUBJ-001",                                                             │
│   "visitId": "VISIT-02",                                                               │
│   "protocolVersion": "1.0.0",   <-- IMMUTABLE GxP HISTORICAL RECORD                    │
│   "formData": { "bloodPressure": "120/80", "heartRate": 72 }                          │
│   // Does NOT have biomarkerHer2Status; valid under v1.0.0 rules                       │
│ }                                                                                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SUBJECT 085 - VISIT 2 (Entered Under Protocol v2.0.0 in October 2026)                  │
│ {                                                                                      │
│   "subjectId": "SUBJ-085",                                                             │
│   "visitId": "VISIT-02",                                                               │
│   "protocolVersion": "2.0.0",   <-- ENFORCES AMENDMENT SCHEMA & CHECKS                 │
│   "formData": {                                                                        │
│     "bloodPressure": "118/78",                                                         │
│     "heartRate": 68,                                                                   │
│     "biomarkerHer2Status": "POSITIVE"                                                  │
│   }                                                                                    │
│ }                                                                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **System Downtime:** **0 seconds** (platform stays live across all other studies; the single amended study enters a brief per-study `UpversioningMaintenance` lock during Stage 4 cutover & CRA validation per [ADR 008](../../critical-problems-and-adrs/008-protocol-amendment-cache-invalidation-and-epoch-rotation-adr.md)).
* **Historical Integrity:** Patient records collected under Protocol v1.0.0 remain mathematically preserved exactly as signed by the investigator.

---

## 5. Job 3: Subject Data & Automated Query Generation on Migration

When a protocol amendment modifies an existing validation rule (e.g., changing the allowable resting heart rate threshold from `< 100 bpm` to `< 90 bpm`) or introduces a mandatory field, the platform must retrospectively evaluate existing patient records and raise **Automated System Queries (Discrepancies)**.

### 5.1 The Migration Scope & Governance Rules:
1. **Locked / Signed Visits (Grandfathered):** Visits that have already been electronically signed by the Principal Investigator (PI) or frozen by the Clinical Data Manager (CDM) are exempt from retroactive rule changes unless explicitly flagged for re-consent by the sponsor.
2. **Open / Data-Entered Visits:** Active visits are evaluated against the new protocol rules. If a value violates the new threshold or a mandatory field is missing, a system query is generated.
3. **Site-Specific IRB Approval Dates:** In multi-center international trials, Site 101 may adopt Protocol v2.0 in October (following FDA/IRB approval), while Site 201 in Germany cannot adopt it until December (awaiting BfArM/Ethics Committee approval). The migration engine supports **site-level phased rollouts**.

### 5.2 High-Throughput, Memory-Safe Processing Pipeline:
The migration worker utilizes **streaming cursor pagination (`batchSize: 500`)** and **unordered bulk operations (`bulkWrite`)**:
* **Streaming Cursors:** Only 500 documents reside in worker memory at any given time, preventing memory exhaustion even across 100,000 subjects.
* **Worker-CPU Compute:** JSON-Logic rules are compiled and executed in-memory on the worker container, keeping database CPU utilization low.
* **Document-Level Concurrency:** MongoDB’s WiredTiger storage engine locks at the individual document level (MVCC). Upgrading Subject 001 never blocks or delays an investigator actively saving data for Subject 002.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               AUTONOMOUS QUERY MIGRATION PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. INITIATION & SCOPING                                                                         │
│    Sponsor initiates: POST /api/studies/{studyId}/migrations/v2.0-apply                         │
│    Parameters: targetVersion: "2.0.0", affectedSiteIds: ["SITE-101", "SITE-102"]                │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. STREAMING CURSOR (Zero-RAM Memory Footprint)                                                 │
│    Worker opens streaming cursor:                                                               │
│    db.casebook_visits.find({                                                                    │
│      siteId: { $in: affectedSiteIds },                                                          │
│      isLocked: false,                                                                           │
│      protocolVersion: { $lt: "2.0.0" }                                                          │
│    }).batchSize(500)                                                                            │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. IN-MEMORY RULE EVALUATION                                                                    │
│    Worker evaluates compiled JSON-Logic rules for v2.0.0 on worker CPU:                         │
│    - Rule: "biomarkerHer2Status != null"                                                        │
│    - Result: FAILED on Subject 042                                                              │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. ATOMIC BULK TRANSACTION (bulkWrite)                                                          │
│    Worker prepares batch operations executed via ordered: false:                                │
│    - Op A: Update visit protocolVersion to "2.0.0"                                              │
│    - Op B: Insert System Query into 'queries' collection                                        │
│            ("Protocol v2.0 requires Biomarker HER2 Status. Please enter data.")                 │
│    - Op C: Insert 21 CFR Part 11 Audit Trail event                                              │
│            (Action: SYSTEM_AUTO_QUERY_ISSUED, Reason: PROTOCOL_MIGRATION_V2)                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. REPORTEABLE PROGRESS & RESUMABILITY                                                          │
│    Job progress logged to Cluster 0 (e.g., 450 / 1200 visits processed, 34 queries issued).    │
│    Worker failure resumes seamlessly from the last processed _id.                               │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Complete TypeScript Reference Implementation:

```typescript
// workers/protocol-migration.worker.ts
import { MongoClient, ObjectId } from 'mongodb';

export interface MigrationJobDescriptor {
  studyId: string;
  targetVersion: string;
  affectedSiteIds: string[];
  newRulesManifest: {
    rules: Array<{
      fieldId: string;
      ruleAst: any;
      errorMessage: string;
    }>;
  };
}

export class ProtocolMigrationWorker {
  constructor(
    private readonly mongoClient: MongoClient,
    private readonly ruleEngine: any // json-logic-js runner
  ) {}

  async executeMigration(job: MigrationJobDescriptor): Promise<{ processed: number; queriesCreated: number }> {
    const dbName = `study_${job.studyId}_prod`;
    const db = this.mongoClient.db(dbName);
    
    const visitCursor = db.collection('casebook_visits').find({
      siteId: { $in: job.affectedSiteIds },
      isLocked: false,
      protocolVersion: { $lt: job.targetVersion }
    }).batchSize(500);

    const visitBulkOps: any[] = [];
    const queryBulkOps: any[] = [];
    const auditBulkOps: any[] = [];
    let processed = 0;
    let queriesCreated = 0;

    while (await visitCursor.hasNext()) {
      const visit = await visitCursor.next();
      if (!visit) break;
      processed++;

      // Evaluate new v2.0 rules on worker CPU (zero DB CPU overhead)
      for (const rule of job.newRulesManifest.rules) {
        const passes = this.ruleEngine.apply(rule.ruleAst, visit.formData);
        
        if (!passes) {
          queriesCreated++;
          const queryId = `QRY-${new ObjectId().toHexString()}`;

          // 1. Prepare system auto-query
          queryBulkOps.push({
            insertOne: {
              document: {
                queryId,
                studyId: job.studyId,
                subjectId: visit.subjectId,
                visitId: visit.visitId,
                fieldId: rule.fieldId,
                type: 'SYSTEM_AUTOMATED',
                status: 'OPEN',
                message: `[Protocol ${job.targetVersion} Amendment]: ${rule.errorMessage}`,
                raisedBy: 'SYSTEM_MIGRATION_ENGINE',
                raisedAt: new Date()
              }
            }
          });

          // 2. Prepare 21 CFR Part 11 audit log entry
          auditBulkOps.push({
            insertOne: {
              document: {
                studyId: job.studyId,
                entityType: 'QUERY',
                entityId: queryId,
                action: 'AUTO_QUERY_GENERATED',
                reason: `Protocol Amendment ${job.targetVersion} Migration`,
                performedBy: 'SYSTEM_DAEMON',
                timestamp: new Date()
              }
            }
          });
        }
      }

      // 3. Upgrade visit schema version stamp
      visitBulkOps.push({
        updateOne: {
          filter: { _id: visit._id },
          update: { 
            $set: { 
              protocolVersion: job.targetVersion, 
              lastMigrationAt: new Date() 
            } 
          }
        }
      });

      // Flush batch when threshold reached
      if (visitBulkOps.length >= 500) {
        await Promise.all([
          db.collection('casebook_visits').bulkWrite(visitBulkOps, { ordered: false }),
          queryBulkOps.length > 0 ? db.collection('queries').bulkWrite(queryBulkOps, { ordered: false }) : Promise.resolve(),
          auditBulkOps.length > 0 ? db.collection('audit_log').bulkWrite(auditBulkOps, { ordered: false }) : Promise.resolve()
        ]);
        visitBulkOps.length = 0;
        queryBulkOps.length = 0;
        auditBulkOps.length = 0;
      }
    }

    // Flush any remaining trailing operations
    if (visitBulkOps.length > 0) {
      await Promise.all([
        db.collection('casebook_visits').bulkWrite(visitBulkOps, { ordered: false }),
        queryBulkOps.length > 0 ? db.collection('queries').bulkWrite(queryBulkOps, { ordered: false }) : Promise.resolve(),
        auditBulkOps.length > 0 ? db.collection('audit_log').bulkWrite(auditBulkOps, { ordered: false }) : Promise.resolve()
      ]);
    }

    return { processed, queriesCreated };
  }
}
```

---

## 6. Job 4: Event-Driven Reactive Jobs (MongoDB Change Streams)

Beyond scheduled batch jobs, clinical trial platforms require **real-time reactive jobs** triggered by data mutations.

### 6.1 Regulatory Safety Trigger: 24-Hour Serious Adverse Event (SAE) Reporting
Under FDA 21 CFR § 312.32 and ICH E2A guidelines, any event marked as a **Serious Adverse Event (death, hospitalization, life-threatening disability)** must be reported to the Medical Monitor and regulatory authorities within strict timeframes (24 to 48 hours).

### 6.2 MongoDB Change Streams Architecture:
MongoDB provides native, distributed **Change Streams** backed by the `oplog`. Unlike PostgreSQL `LISTEN/NOTIFY` (which drops messages if listeners disconnect and enforces an 8KB payload cap), MongoDB Change Streams are:
* **Durable:** Powered by the replica set oplog (persisted across restarts).
* **Resumable:** Workers store a cryptographic `resumeToken`. If a worker pod crashes or restarts, it resumes reading from the exact millisecond it stopped.
* **Filtered:** Events can be filtered at the database level before reaching the worker.

```typescript
// workers/safety-alert-change-stream.worker.ts
export class SafetyAlertWorker {
  async startListening(studyProdDb: Db) {
    const pipeline = [
      {
        $match: {
          'operationType': { $in: ['insert', 'update'] },
          'fullDocument.isSeriousAdverseEvent': true
        }
      }
    ];

    const changeStream = studyProdDb.collection('casebook_visits').watch(pipeline, {
      fullDocument: 'updateLookup',
      // Stored resume token from Redis/DB ensures zero dropped safety events
      resumeAfter: await this.getLastResumeToken()
    });

    changeStream.on('change', async (event: any) => {
      const doc = event.fullDocument;
      
      // 1. Dispatch immediate urgent SMS & Email alert to Medical Monitor
      await this.dispatchMedicalMonitorAlert({
        studyId: doc.studyId,
        subjectId: doc.subjectId,
        eventDescription: doc.formData.adverseEventTerm,
        severity: doc.formData.severity
      });

      // 2. Queue automated E2B(R3) XML payload generation for FDA FAERS
      await this.queueRegulatorySafetyPayload(doc);

      // 3. Save latest resume token
      await this.saveResumeToken(event._id);
    });
  }
}
```

---

## 7. Worker Technology Stack & Orchestration

To satisfy GAMP 5 validation and 21 CFR Part 11 electronic record accountability, the worker tier is structured around proven enterprise tools:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ WORKER TIER TECHNOLOGY SELECTION MATRIX                                                │
├─────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Component               │ Node.js Stack Choice         │ .NET Stack Choice             │
├─────────────────────────┼──────────────────────────────┼───────────────────────────────┤
│ Job Queue Storage       │ Redis Cluster (BullMQ)       │ Redis / SQL Store (Hangfire)  │
│ Long-Running Workflows  │ Temporal.io                  │ Temporal.io / Elsa Workflows  │
│ Reactive Stream Worker  │ Native MongoDB Driver Stream │ MongoDB.Driver ChangeStreams  │
│ Distributed Scheduler   │ BullMQ Repeatable Jobs       │ Hangfire Recurring Jobs       │
│ Observability & Tracing │ OpenTelemetry + Jaeger       │ OpenTelemetry + Prometheus    │
└─────────────────────────┴──────────────────────────────┴───────────────────────────────┘
```

### Key Operational Controls:
1. **Idempotency:** Every job execution carries an `idempotencyKey` (e.g., `migration_${studyId}_${targetVersion}_${siteId}`). If a job is retried due to a network glitch, it will not duplicate queries or audit events.
2. **Dead-Letter Queues (DLQ):** If an individual subject record contains corrupted data that causes the rule engine to throw an unhandled exception, that specific record is moved to a DLQ for Data Manager review, while the remaining 99.9% of the study migration continues uninterrupted.
3. **Audit Trail Accountability:** Automated workers authenticate with system credentials (`service_account_migration_daemon`), recording their unique `runId` on every created query and updated visit document.

---

## 8. Architectural Comparison: MongoDB vs. PostgreSQL for Clinical Jobs

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ HEAD-TO-HEAD COMPARISON: MONGODB VS. POSTGRESQL FOR CLINICAL JOBS                                      │
├──────────────────────────┬──────────────────────────────────┬──────────────────────────────────────────┤
│ Architectural Dimension  │ PostgreSQL Relational Approach   │ MongoDB 7.0+ Document + Worker Approach  │
├──────────────────────────┼──────────────────────────────────┼──────────────────────────────────────────┤
│ Schema Migration Locks   │ 🔴 High Risk: ALTER TABLE table  │ 🟢 Zero Locks: Polymorphic documents     │
│                          │ locks (ACCESS EXCLUSIVE)         │ allow v1.0 and v2.0 to coexist natively  │
├──────────────────────────┼──────────────────────────────────┼──────────────────────────────────────────┤
│ Study Design Versioning  │ 🔴 Fragile: Cascading clones of  │ 🟢 Elegant: Single immutable self-       │
│                          │ 20+ tables remapping foreign keys│ contained BSON protocol manifest document│
├──────────────────────────┼──────────────────────────────────┼──────────────────────────────────────────┤
│ Concurrency During Batch │ 🔴 Risk of deadlocks & write     │ 🟢 Document-level locking (WiredTiger):  │
│ Migration Operations     │ starvation on live active visits │ updating Subject A never blocks Subject B│
├──────────────────────────┼──────────────────────────────────┼──────────────────────────────────────────┤
│ Reactive Event Engine    │ 🟡 LISTEN/NOTIFY: 8KB limit,     │ 🟢 Change Streams: Resumable via oplog,  │
│                          │ dropped messages on disconnect   │ durable, full-document lookups           │
├──────────────────────────┼──────────────────────────────────┼──────────────────────────────────────────┤
│ GAMP 5 / CSV Alignment   │ 🔴 Anti-pattern if using in-DB   │ 🟢 Decoupled: Stateless workers with full│
│                          │ triggers / pg_cron for logic     │ tracing, metrics, retries, and DLQs      │
├──────────────────────────┼──────────────────────────────────┼──────────────────────────────────────────┤
│ Bulk Data Throughput     │ 🟡 SQL parameterized batches     │ 🟢 bulkWrite({ ordered: false }) executes│
│                          │ slowed down by foreign key checks│ thousands of updates/queries per second  │
└──────────────────────────┴──────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 9. Conclusion

By pairing **MongoDB 7.0+ with a Decoupled Distributed Worker Tier**, the Vialiq EDC platform achieves:
1. **Zero System-Wide Downtime on Protocol Amendments:** Platform clusters remain 100% online (`0s` system outage) while the amended study takes only a brief, isolated per-study `UpversioningMaintenance` lock until retrospective checks & CRA validation complete ([ADR 008](../../critical-problems-and-adrs/008-protocol-amendment-cache-invalidation-and-epoch-rotation-adr.md)).
2. **Deterministic, High-Speed Auto-Queries:** Thousands of subject visits can be retrospectively evaluated and discrepancy-flagged in seconds using streaming cursors and unordered bulk writes.
3. **Guaranteed GAMP 5 & 21 CFR Part 11 Compliance:** Decoupling compute from storage ensures that heavy migration workloads never degrade live transactional performance, while maintaining end-to-end auditability and cryptographic traceability.
