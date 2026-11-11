# Database Operational Architecture: Backup, Multi-Level Locking, Blinding Isolation, 25-Year Archival & Connection Pooling

> **Document ID:** `VIALIQ-ARCH-DB-006`  
> **Status:** Approved / Active Architecture Standard  
> **Regulatory Compliance:** FDA 21 CFR Part 11, ICH E6(R3) Section 2.11 & 2.13, EU CTR 536/2014 Article 58, HIPAA Security Rule, CDISC ODM v1.3.2  
> **Target Audience:** Principal Systems Architects, Lead Data Managers, Regulatory Affairs, DevOps / Database Administrators  
> **Related Documents:**
> - [002: 3-Cluster & Flexible Tenancy Architecture](./002-3-cluster-and-flexible-tenancy-architecture.md)
> - [003: Architecture Rating Scorecard & Compliance](./003-comprehensive-architecture-rating-scorecard.md)
> - [004: Background Jobs, Protocol Migration & Auto-Query Engine](./004-background-jobs-protocol-migration-and-auto-query-engine.md)
> - [Database Architecture Specification](./database-architecture-specification.md)
> - [3-Layer MongoDB Cluster Docker Setup Guide](./mongodb-3layer-docker-setup-guide.md)

---

## Executive Summary & Architectural Scope

While earlier specifications defined our core document schemas, multi-document ACID boundaries, and asynchronous protocol migrations, a commercial-grade Clinical Electronic Data Capture (EDC) platform requires operational and infrastructure capabilities that span the full clinical trial lifecycle.

> [!NOTE]
> **Functional vs. Operational Separation:**  
> Medical Coding (MedDRA & WHO-Drug dictionary lookups, synonym matching, coder task workflows, and auto-coding approval pipelines) is a **domain-level Clinical Data Management functional requirement** and is specified in the Functional EDC Application Modules.  
> This specification focuses strictly on the **5 Core Operational & Infrastructure Pillars** of the database tier.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                          VIALIQ EDC — 5 OPERATIONAL DATABASE PILLARS                                   │
├────────────────────────────┬────────────────────────────┬──────────────────────────────────────────────┤
│ 1. Backup, PITR & DR       │ 2. Multi-Level DB Locking  │ 3. Field-Level Encryption (CSFLE/QE)         │
│ - Continuous oplog tailing │ - Soft Lock (Data Freeze)  │ - Envelope encryption (AWS KMS / Vault)      │
│ - RPO ≤ 5m, RTO ≤ 60m      │ - Hard Lock (DB Lock)      │ - GDPR Crypto-Shredding (Patient Erasure)    │
│ - Automated restore drills │ - 2-person emergency break │ - RTSM Double-Blind & Emergency Code Break   │
├────────────────────────────┴────────────────────────────┴──────────────────────────────────────────────┤
│ 4. 25-Year Archival & WORM                              │ 5. Dynamic Connection Pooling                │
│ - EU CTR 25-yr compliance                               │ - Single pooled client per cluster layer     │
│ - CDISC ODM-XML & PDF/A Case Books                      │ - Dynamic db() multiplexing                  │
│ - Immutable S3 Object Lock (Compliance Mode)            │ - Zero socket exhaustion for 500+ studies    │
└─────────────────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Pillar 1: Backup Strategy, Continuous Oplog PITR & Disaster Recovery (DR)](#1-pillar-1-backup-strategy-continuous-oplog-pitr--disaster-recovery-dr)
   - [1.1 Regulatory Requirements (FDA & HIPAA)](#11-regulatory-requirements-fda--hipaa)
   - [1.2 Recovery Point Objective (RPO) & Recovery Time Objective (RTO)](#12-recovery-point-objective-rpo--recovery-time-objective-rto)
   - [1.3 Multi-AZ Topology & Continuous Oplog Archiving](#13-multi-az-topology--continuous-oplog-archiving)
   - [1.4 Millisecond-Precision Point-In-Time Recovery (PITR) Workflow](#14-millisecond-precision-point-in-time-recovery-pitr-workflow)
   - [1.5 Automated Restoration Drills & Audit Chain Validation](#15-automated-restoration-drills--audit-chain-validation)
2. [Pillar 2: Granular Multi-Tier Database Locking & Freezing Engine](#2-pillar-2-granular-multi-tier-database-locking--freezing-engine)
   - [2.1 Clinical Trial Locking Hierarchy](#21-clinical-trial-locking-hierarchy)
   - [2.2 Soft Lock (Data Freeze) vs. Hard Lock (Database Lock)](#22-soft-lock-data-freeze-vs-hard-lock-database-lock)
   - [2.3 Database Lock Schema & State Machine](#23-database-lock-schema--state-machine)
   - [2.4 Database Perspective: Administrative Commands (`mongosh` Scripts)](#24-database-perspective-administrative-commands-mongosh-scripts)
   - [2.5 Application Perspective: Code Commands & Services (NestJS / TypeScript)](#25-application-perspective-code-commands--services-nestjs--typescript)
   - [2.6 How Locking is Maintained (Compound Indexes & Distributed Redis Cache)](#26-how-locking-is-maintained-compound-indexes--distributed-redis-cache)
   - [2.7 How Locking is Strictly Enforced (4-Layer Defense-in-Depth Pipeline)](#27-how-locking-is-strictly-enforced-4-layer-defense-in-depth-pipeline)
   - [2.8 Emergency Unlock Workflow (Four-Eyes Principle & Safety Window)](#28-emergency-unlock-workflow-four-eyes-principle--safety-window)
3. [Pillar 3: Client-Side Field-Level Encryption (CSFLE), Queryable Encryption & GDPR Crypto-Shredding](#3-pillar-3-client-side-field-level-encryption-csfle-queryable-encryption--gdpr-crypto-shredding)
   - [3.1 Trust Boundary Clarification: Why "Client-Side" Means Backend API, Not Browser UI](#31-trust-boundary-clarification-why-client-side-means-backend-api-not-browser-ui)
   - [3.2 Study Configuration: 5 Security Tiers & Performance Trade-Off Matrix](#32-study-configuration-5-security-tiers--performance-trade-off-matrix)
   - [3.3 Envelope Encryption & Key Vault Security: Is Storing Keys in Admin Cluster Compliant?](#33-envelope-encryption--key-vault-security-is-storing-keys-in-admin-cluster-compliant)
   - [3.4 The Clinical GDPR Dilemma: Crypto-Shredding vs. 21 CFR Part 11 Audit Retention](#34-the-clinical-gdpr-dilemma-crypto-shredding-vs-21-cfr-part-11-audit-retention)
   - [3.5 Cryptographic Modes: Deterministic, Randomized (AEAD) & Queryable Encryption (QE)](#35-cryptographic-modes-deterministic-randomized-aead--queryable-encryption-qe)
   - [3.6 Key Lifecycle: What Happens to Keys During Study Lock & 25-Year WORM Archival?](#36-key-lifecycle-what-happens-to-keys-during-study-lock--25-year-worm-archival)
   - [3.7 Key Rotation Architecture: CMK Re-wrapping vs. Background Field Re-encryption](#37-key-rotation-architecture-cmk-re-wrapping-vs-background-field-re-encryption)
   - [3.8 Complete MongoDB Encryption Schema Map (`schemaMap`) & NestJS Configuration](#38-complete-mongodb-encryption-schema-map-schemamap--nestjs-configuration)
   - [3.9 Double-Blind RTSM Treatment Arm Isolation & Unblinded KMS Access Policy](#39-double-blind-rtsm-treatment-arm-isolation--unblinded-kms-access-policy)
   - [3.10 Emergency Code Break (Emergency Unblinding) Workflow](#310-emergency-code-break-emergency-unblinding-workflow)
   - [3.11 Field-Level Encryption Development Mode (Local Offline Developer Experience on Apple Silicon & CI)](#311-field-level-encryption-development-mode-local-offline-developer-experience-on-apple-silicon--ci)
4. [Pillar 4: Study Decommissioning, 25-Year Archival & Legal Hold](#4-pillar-4-study-decommissioning-25-year-archival--legal-hold)
   - [4.1 EU CTR Article 58 & 25-Year Retention Mandate](#41-eu-ctr-article-58--25-year-retention-mandate)
   - [4.2 3-Phase Decommissioning Lifecycle](#42-3-phase-decommissioning-lifecycle)
   - [4.3 Regulatory Export Package Generation (CDISC ODM-XML & PDF/A)](#43-regulatory-export-package-generation-cdisc-odm-xml--pdfa)
   - [4.4 Write Once Read Many (WORM) Storage & S3 Object Lock](#44-write-once-read-many-worm-storage--s3-object-lock)
   - [4.5 Legal Hold Protection Engine](#45-legal-hold-protection-engine)
5. [Pillar 5: Dynamic Database Connection Pooling & Tenant Routing](#5-pillar-5-dynamic-database-connection-pooling--tenant-routing)
   - [5.1 The Socket Exhaustion Dilemma in Multi-Tenant Node.js](#51-the-socket-exhaustion-dilemma-in-multi-tenant-nodejs)
   - [5.2 Connection Pool Multiplexing Architecture](#52-connection-pool-multiplexing-architecture)
   - [5.3 NestJS Dynamic Database Context Service Implementation](#53-nestjs-dynamic-database-context-service-implementation)
   - [5.4 Connection Lifecycle, Health Checks & Graceful Reconnect](#54-connection-lifecycle-health-checks--graceful-reconnect)
6. [Architectural Summary & Cross-Reference](#6-architectural-summary--cross-reference)

---

## 1. Pillar 1: Backup Strategy, Continuous Oplog PITR & Disaster Recovery (DR)

### 1.1 Regulatory Requirements (FDA & HIPAA) & Infrastructure Ownership
- **FDA 21 CFR Part 11 §11.10(c):** Requires *"Protection of records to enable their accurate and ready retrieval throughout the records retention period."*
- **HIPAA Security Rule (45 CFR §164.308(a)(7)(ii)(A)):** Mandates a formal Data Backup Plan creating exact retrievable copies of Electronic Protected Health Information (ePHI).
- **ICH E6(R3) Section 2.13:** Requires robust contingency and recovery mechanisms ensuring trial data integrity is never compromised during hardware or infrastructure failures.
- **Administration Ownership ([FTS-003 § 4.4](../../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md#44-end-to-end-infrastructure-ownership--execution-matrix)):** Backups, continuous `oplog.rs` PITR archiving, and automated weekly DR verification are **100% SRE-managed automated platform baselines** inside each sovereign region—never manually configured or disabled by clinical Study Admins or `STUDY_INFRA_CONFIG` users.

### 1.2 Recovery Point Objective (RPO) & Recovery Time Objective (RTO)

| Metric | Target | Technical Mechanism |
|:---|:---:|:---|
| **RPO (Recovery Point Objective)** | **$\le 5$ Minutes** | Continuous tailing and compression of MongoDB replication log (`oplog.rs`) streamed directly to cloud object storage. |
| **RTO (Recovery Time Objective)** | **$\le 60$ Minutes** | Automated containerized restore orchestration using pre-warmed standby compute instances and parallelized snapshot rehydration. |

### 1.3 Multi-AZ Topology & Continuous Oplog Archiving

In production (Layer 3), every study replica set consists of **3 data-bearing nodes** deployed across 3 separate AWS Availability Zones (AZs) or GCP Regions:

```
                            PRIMARY REPLICA SET (LAYER 3 PROD)
                            
    ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
    │ Node 1 (Primary)     │    │ Node 2 (Secondary)   │    │ Node 3 (Secondary)   │
    │ AZ-1a (us-east-1a)   │    │ AZ-1b (us-east-1b)   │    │ AZ-1c (us-east-1c)   │
    │ Port 27017           │    │ Port 27017           │    │ Port 27017           │
    └──────────┬───────────┘    └──────────┬───────────┘    └──────────┬───────────┘
               │                           │                           │
               └───────────────────────────┴───────────────────────────┘
                                           │
                         Replication via majority write concern
                                           ▼
               ┌───────────────────────────────────────────────────────┐
               │ OPLOG STREAM ARCHIVER (Sidecar Daemon)                │
               │ Continuously tails local.oplog.rs                     │
               │ Buffers, encrypts (AES-256), and chunks into S3       │
               └───────────────────────────┬───────────────────────────┘
                                           │
                                           ▼
               ┌───────────────────────────────────────────────────────┐
               │ IMMUTABLE S3 BACKUP BUCKET (Cross-Region us-west-2)   │
               │ - Hourly Base Snapshots (WiredTiger block-level)      │
               │ - Continuous Oplog Segments (Rotated every 60 seconds)│
               └───────────────────────────────────────────────────────┘
```

#### Write Concern Policy
All transactional write operations (`submitCrfDataTransaction`, `auditTrailEntry`) must specify:
```typescript
const writeOptions: TransactionOptions = {
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority', j: true, wtimeout: 10000 }
};
```
This guarantees that writes are committed to the on-disk journal (`j: true`) and acknowledged by at least 2 nodes before the API returns success.

### 1.4 Millisecond-Precision Point-In-Time Recovery (PITR) Workflow

If human error, software corruption, or disaster occurs at timestamp $T_{\text{disaster}}$ (`2026-10-18T14:32:00.000Z`), the system can recover to $T_{\text{target}}$ (`2026-10-18T14:31:59.999Z`):

```bash
#!/bin/bash
# Step 1: Restore latest hourly base snapshot prior to target
TARGET_TIME="2026-10-18T14:31:59Z"
SNAPSHOT_PATH="s3://vialiq-backups-prod/snapshots/hourly-2026-10-18T14-00-00"

echo "Restoring base snapshot..."
mongorestore --host mongo-restore-target:27017 \
  --gzip --archive="${SNAPSHOT_PATH}/study_oncology_101.archive"

# Step 2: Replay continuous oplog segments up to exact target timestamp
echo "Replaying oplog up to ${TARGET_TIME}..."
mongorestore --host mongo-restore-target:27017 \
  --oplogReplay \
  --oplogLimit="$(date -d "${TARGET_TIME}" +%s):1" \
  /backups/oplog_segments/
```

> [!IMPORTANT]
> **Post-PITR Re-Alignment (Only Needed After Catastrophic Manual PITR Restore):** Normal MongoDB HA failover (`w: "majority"`) does not rewind committed state or corrupt downstream Change Streams. However, if SREs execute a manual `--oplogLimit` PITR restore to recover from human/logical data corruption, run three steps before reopening site traffic: (1) **flush volatile regional Redis caches** (`study_edit_leases` & schema caches; `study_locks` restore cleanly from MongoDB), (2) **reset Change Stream `resumeToken`s** (`Vialiq.CdcWorker`, `_event_outbox` relay, `SafetyAlertWorker`) because the restored oplog begins a fresh timeline, and (3) **run an idempotent SQL `MERGE` re-sync** for the affected region/studies so Central SQL Server matches the restored MongoDB snapshot.

### 1.5 Automated Restoration Drills & Audit Chain Validation

Every Sunday at 02:00 UTC, a decoupled Kubernetes CronJob automatically validates DR readiness:
1. Provisions an ephemeral MongoDB instance in a staging sandbox.
2. Restores the latest production snapshot and replays oplogs.
3. **Executes Audit Trail Integrity Verification**:
   Iterates through the entire `audit_trail` collection and recomputes the SHA-256 hash chain:
   $$\text{Hash}_n \stackrel{?}{=} \text{SHA-256}(\text{Hash}_{n-1} + \text{RecordPayload}_n)$$
4. Emits an FDA-compliant validation record logged to `system_dr_audit_reports`.

---

## 2. Pillar 2: Granular Multi-Tier Database Locking & Freezing Engine

### 2.1 Clinical Trial Locking Hierarchy

In commercial EDC systems (Medidata Rave, Veeva Vault CDMS), data locking is **progressive**. Locking an entire trial at once is rare; instead, data freezes and locks happen at 5 distinct hierarchical tiers:

```
  LEVEL 1: STUDY HARD LOCK (Final Database Lock - DBL)
    │
    ├── LEVEL 2: COHORT / INTERIM LOCK (e.g., Phase 2 Interim Analysis)
    │     │
    │     ├── LEVEL 3: SITE LEVEL LOCK (e.g., Site 101 closed and verified)
    │     │     │
    │     │     ├── LEVEL 4: SUBJECT LEVEL LOCK (e.g., Patient completed trial)
    │     │     │     │
    │     │     │     └── LEVEL 5: VISIT / FORM FREEZE (e.g., Baseline Day 0)
```

### 2.2 Soft Lock (Data Freeze) vs. Hard Lock (Database Lock)

| Operational Capability | Open State | Soft Lock (Data Freeze) | Hard Lock (Database Lock) |
|:---|:---:|:---:|:---:|
| **CRC / Investigator Data Entry** | Allowed | **Blocked** (Read-Only) | **Blocked** (Read-Only) |
| **CRC Form Modification** | Allowed | **Blocked** | **Blocked** |
| **Monitor SDV (Source Data Verification)** | Allowed | Allowed | **Blocked** |
| **Data Manager Query Issuance** | Allowed | Allowed | **Blocked** |
| **Site Query Resolution** | Allowed | Allowed | **Blocked** |
| **Biostatistics Extraction (SDTM/ADaM)** | Provisional | Cleaned Draft | **Official Blinded / Final** |
| **Regulatory Signature (PI)** | Allowed | Allowed | **Permanent & Immutable** |

### 2.3 Database Lock Schema & State Machine (`study_locks` vs. `study_edit_leases`)

> [!IMPORTANT]
> **Collection Separation Invariant (`study_locks` vs. `study_edit_leases`):**
> * **`study_locks`** is kept 100% pure for permanent **Regulatory Governance Locks & Database Locks (DBL)** (`SOFT_FREEZE` / `HARD_LOCK`, Four-Eyes unlock only, cached in Redis hash `vialiq:locks:{studyId}`).
> * **`study_edit_leases`** (codified in [ADR 003](../../critical-problems-and-adrs/003-realtime-signalr-reconnection-and-field-lease-reconciliation-adr.md) & [ADR 007-A](../../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md)) holds ephemeral **15-minute Single-Editor UI Edit Leases** (`targetCrfId`, `status`, `expiresAtUtc`, partial unique index `{ studyId: 1, targetCrfId: 1 }` on `status: 1`, cached at `edc:form_lock:{studyId}:{crfId}`).
> * **Precedence Gate:** Every `AcquireFormLockAsync` checks regulatory `study_locks` (`HTTP 423 Locked`) **before** granting an edit lease in `study_edit_leases`, and applying a `SOFT_FREEZE` / `HARD_LOCK` invalidates active edit leases under that frozen scope.

Every study database (`study_{uuid}_prod`) contains a dedicated, indexed `study_locks` collection for regulatory governance locks:

```typescript
export enum LockScope {
  STUDY = 'STUDY',
  COHORT = 'COHORT',
  SITE = 'SITE',
  SUBJECT = 'SUBJECT',
  VISIT = 'VISIT',
  FORM = 'FORM'
}

export enum LockType {
  SOFT_FREEZE = 'SOFT_FREEZE', // CRCs blocked; DM & Monitors can edit queries
  HARD_LOCK = 'HARD_LOCK'       // Strictly read-only for all roles
}

export interface IStudyLockDocument {
  _id: string; // UUID
  studyId: string;
  scope: LockScope;
  targetId: string; // e.g. "SITE-101" or "SUBJ-004" or "FORM-DEMOG"
  lockType: LockType;
  isActive: boolean;
  
  // Regulatory Authorization
  lockedByUserId: string;
  lockedByRole: 'LEAD_DATA_MANAGER' | 'PRINCIPAL_INVESTIGATOR' | 'SPONSOR_ADMIN';
  lockReason: string;
  lockedAt: Date;
  
  // Cryptographic Signature
  signatureHash: string; // SHA-256 of (scope + targetId + lockType + lockedAt + lockedByUserId)
  
  // Unlock History (if emergency unlocked)
  unlockHistory?: {
    unlockedAt: Date;
    unlockedByUserId: string;
    countersignedByUserId: string; // 2nd person approval
    clinicalJustification: string;
    reLockedAt?: Date;
  }[];
}
```

### 2.4 Database Perspective: Administrative Commands (`mongosh` Scripts)

Database administrators and data management teams can inspect, apply, and unlock targets directly via `mongosh` on Layer 3 (`vialiq-mongo-layer3-prod`).

#### 1. Setup Collection Indexes & Constraints
```javascript
// Switch to production study database
use study_oncology_101_prod;

// 1. Partial Unique Index: Prevents duplicate ACTIVE locks on the exact same target
db.study_locks.createIndex(
  { studyId: 1, scope: 1, targetId: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

// 2. High-performance compound index for real-time mutation guards
db.study_locks.createIndex({ studyId: 1, isActive: 1, scope: 1, targetId: 1 });
```

#### 2. Apply Study-Level Hard Lock (Final Database Lock - DBL)
```javascript
db.study_locks.insertOne({
  _id: UUID().toString(),
  studyId: "study_oncology_101",
  scope: "STUDY",
  targetId: "ALL",
  lockType: "HARD_LOCK",
  isActive: true,
  lockedByUserId: "dm_lead_martinez",
  lockedByRole: "LEAD_DATA_MANAGER",
  lockReason: "Final statistical freeze for FDA NDA submission",
  lockedAt: new Date(),
  signatureHash: hex_sha256("STUDY" + "ALL" + "HARD_LOCK" + "dm_lead_martinez")
});
```

#### 3. Apply Site-Level Soft Freeze (e.g. Site 101 Monitoring Visit Closure)
```javascript
db.study_locks.insertOne({
  _id: UUID().toString(),
  studyId: "study_oncology_101",
  scope: "SITE",
  targetId: "SITE-101",
  lockType: "SOFT_FREEZE",
  isActive: true,
  lockedByUserId: "cra_lead_chen",
  lockedByRole: "LEAD_DATA_MANAGER",
  lockReason: "Site 101 interim monitoring visit closed. CRC edits frozen.",
  lockedAt: new Date(),
  signatureHash: hex_sha256("SITE" + "SITE-101" + "SOFT_FREEZE" + "cra_lead_chen")
});
```

#### 4. Apply Subject-Level Lock (e.g. Subject Completed Study)
```javascript
db.study_locks.insertOne({
  _id: UUID().toString(),
  studyId: "study_oncology_101",
  scope: "SUBJECT",
  targetId: "SUBJ-004",
  lockType: "HARD_LOCK",
  isActive: true,
  lockedByUserId: "pi_dr_foster",
  lockedByRole: "PRINCIPAL_INVESTIGATOR",
  lockReason: "Subject completed 30-day safety follow-up. Record sealed.",
  lockedAt: new Date(),
  signatureHash: hex_sha256("SUBJECT" + "SUBJ-004" + "HARD_LOCK" + "pi_dr_foster")
});
```

#### 5. Apply Visit / Form Level Freeze (e.g. Baseline Day 0 Demography)
```javascript
db.study_locks.insertOne({
  _id: UUID().toString(),
  studyId: "study_oncology_101",
  scope: "FORM",
  targetId: "SUBJ-004:VISIT-DAY0:FORM-DEMOG",
  lockType: "SOFT_FREEZE",
  isActive: true,
  lockedByUserId: "cra_johnson",
  lockedByRole: "LEAD_DATA_MANAGER",
  lockReason: "Baseline demography verified against source documents (SDV complete).",
  lockedAt: new Date(),
  signatureHash: hex_sha256("FORM" + "SUBJ-004:VISIT-DAY0:FORM-DEMOG" + "SOFT_FREEZE" + "cra_johnson")
});
```

#### 6. Query Active Lock Hierarchy for a Specific Subject & Form
```javascript
// Check all locks that could affect SUBJ-004 at SITE-101 on FORM-DEMOG
db.study_locks.find({
  studyId: "study_oncology_101",
  isActive: true,
  $or: [
    { scope: "STUDY" },
    { scope: "SITE", targetId: "SITE-101" },
    { scope: "SUBJECT", targetId: "SUBJ-004" },
    { scope: "FORM", targetId: "SUBJ-004:VISIT-DAY0:FORM-DEMOG" }
  ]
}).sort({ lockedAt: -1 });
```

---

### 2.5 Application Perspective: Code Commands & Services (NestJS / TypeScript)

In the application layer, all locking and unlocking actions must execute inside a **multi-document ACID transaction** paired with an immutable `audit_trail` record.

#### 1. Locking DTOs
```typescript
export class ApplyLockDto {
  studyId: string;
  scope: LockScope;
  targetId: string; // e.g. "ALL", "SITE-101", "SUBJ-004"
  lockType: LockType;
  reason: string;
  passwordReAuth: string; // Mandatory 21 CFR Part 11 re-authentication
}

export class RequestUnlockDto {
  studyId: string;
  lockId: string;
  clinicalJustification: string;
}

export class ApproveUnlockDto {
  studyId: string;
  lockId: string;
  countersigningPassword: string; // Second-person credential
  temporaryDurationHours: number; // e.g. 24 or 48 hours
}
```

#### 2. NestJS Lock Management Service Implementation
```typescript
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { MongoClient, ClientSession } from 'mongodb';
import * as crypto from 'crypto';

@Injectable()
export class LockManagementService {
  constructor(
    private readonly mongoClient: MongoClient,
    private readonly redisCacheService: RedisLockCacheService,
    private readonly authVerificationService: AuthVerificationService
  ) {}

  /**
   * Applies a granular lock or freeze in an atomic multi-document transaction.
   */
  async applyLock(dto: ApplyLockDto, user: AuthenticatedUser): Promise<IStudyLockDocument> {
    // 1. Verify 21 CFR Part 11 user credentials
    const isAuthValid = await this.authVerificationService.verifyPassword(user.userId, dto.passwordReAuth);
    if (!isAuthValid) {
      throw new ForbiddenException('21 CFR Part 11 re-authentication failed: Invalid credentials.');
    }

    const session: ClientSession = this.mongoClient.startSession();
    session.startTransaction({ readConcern: { level: 'majority' }, writeConcern: { w: 'majority', j: true } });

    try {
      const db = this.mongoClient.db(`study_${dto.studyId}_prod`);

      // 2. Check if an active lock already covers this target
      const existing = await db.collection('study_locks').findOne({
        studyId: dto.studyId,
        scope: dto.scope,
        targetId: dto.targetId,
        isActive: true
      }, { session });

      if (existing) {
        throw new BadRequestException(`Target ${dto.scope}:${dto.targetId} is already locked.`);
      }

      // 3. Compute SHA-256 digital signature
      const timestamp = new Date();
      const rawPayload = `${dto.studyId}:${dto.scope}:${dto.targetId}:${dto.lockType}:${user.userId}:${timestamp.toISOString()}`;
      const signatureHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

      const lockDocument: IStudyLockDocument = {
        _id: crypto.randomUUID(),
        studyId: dto.studyId,
        scope: dto.scope,
        targetId: dto.targetId,
        lockType: dto.lockType,
        isActive: true,
        lockedByUserId: user.userId,
        lockedByRole: user.role as any,
        lockReason: dto.reason,
        lockedAt: timestamp,
        signatureHash
      };

      // 4. Insert lock record
      await db.collection('study_locks').insertOne(lockDocument, { session });

      // 5. Append immutable 21 CFR Part 11 audit trail record
      await db.collection('audit_trail').insertOne({
        _id: crypto.randomUUID(),
        studyId: dto.studyId,
        eventType: 'LOCK_APPLIED',
        targetScope: dto.scope,
        targetId: dto.targetId,
        lockType: dto.lockType,
        performedBy: user.userId,
        reason: dto.reason,
        signatureHash,
        timestamp
      }, { session });

      await session.commitTransaction();

      // 6. Synchronize Single-Tier Distributed Redis cache & preempt active UI edit leases
      await this.redisCacheService.setLock(dto.studyId, dto.scope, dto.targetId, dto.lockType);
      await db.collection('study_edit_leases').updateMany(
        { studyId: dto.studyId, status: 1 }, // Invalidate active UI edit leases under newly frozen scope
        { $set: { status: 2, releasedAtUtc: timestamp } }
      );

      return lockDocument;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  /**
   * Approves and executes an emergency unlock with dual-person sign-off (Four-Eyes Principle).
   */
  async approveAndExecuteUnlock(dto: ApproveUnlockDto, approverUser: AuthenticatedUser): Promise<void> {
    // 1. Verify second person (approver) credentials
    const isAuthValid = await this.authVerificationService.verifyPassword(approverUser.userId, dto.countersigningPassword);
    if (!isAuthValid) {
      throw new ForbiddenException('Secondary authorization failed: Invalid countersigning password.');
    }

    const session = this.mongoClient.startSession();
    session.startTransaction({ readConcern: { level: 'majority' }, writeConcern: { w: 'majority', j: true } });

    try {
      const db = this.mongoClient.db(`study_${dto.studyId}_prod`);

      const lock = await db.collection<IStudyLockDocument>('study_locks').findOne({ _id: dto.lockId, isActive: true }, { session });
      if (!lock) {
        throw new BadRequestException('Active lock not found or already unlocked.');
      }

      // Ensure requester != approver (Dual control requirement)
      if (lock.lockedByUserId === approverUser.userId) {
        throw new ForbiddenException('Four-Eyes Violation: Approver cannot be the same person who requested the lock.');
      }

      const unlockTimestamp = new Date();
      const autoRelockDate = new Date(unlockTimestamp.getTime() + dto.temporaryDurationHours * 3600 * 1000);

      // Deactivate lock and log history
      await db.collection('study_locks').updateOne(
        { _id: dto.lockId },
        {
          $set: { isActive: false },
          $push: {
            unlockHistory: {
              unlockedAt: unlockTimestamp,
              unlockedByUserId: approverUser.userId,
              countersignedByUserId: approverUser.userId,
              clinicalJustification: `Emergency unlock approved for ${dto.temporaryDurationHours}h. Auto-relock at ${autoRelockDate.toISOString()}`
            }
          }
        },
        { session }
      );

      // Record regulatory audit trail
      await db.collection('audit_trail').insertOne({
        _id: crypto.randomUUID(),
        studyId: dto.studyId,
        eventType: 'EMERGENCY_UNLOCK_EXECUTED',
        targetScope: lock.scope,
        targetId: lock.targetId,
        authorizedBy: approverUser.userId,
        autoRelockScheduledAt: autoRelockDate,
        timestamp: unlockTimestamp
      }, { session });

      await session.commitTransaction();

      // Invalidate distributed cache
      await this.redisCacheService.removeLock(dto.studyId, lock.scope, lock.targetId);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
}
```

---

### 2.6 How Locking is Maintained (Compound Indexes & Distributed Redis Cache)

Locking state must be verified on **every single write and read** in the clinical system. Directly querying MongoDB for every keystroke or API call would introduce latency and unnecessary database load.

Vialiq uses a **Dual-Store Architecture** to maintain lock state:

```
                          DUAL-STORE LOCK MAINTENANCE
                          
    ┌────────────────────────────────────────────────────────────────────────┐
    │ AUTHORITATIVE PERSISTENT STORE: MongoDB (study_locks collection)       │
    │ - Source of truth for FDA regulatory audits                            │
    │ - ACID transactions & SHA-256 digital signature chains                 │
    │ - Indexed via: { studyId: 1, isActive: 1, scope: 1, targetId: 1 }      │
    └───────────────────────────────────┬────────────────────────────────────┘
                                        │ Synchronizes on write (Pub/Sub)
                                        ▼
    ┌────────────────────────────────────────────────────────────────────────┐
    │ SINGLE-TIER DISTRIBUTED CACHE: Redis Cluster                           │
    │ Key: vialiq:locks:{studyId}                                            │
    │ Hash Fields:                                                           │
    │   "STUDY:ALL"                       -> "HARD_LOCK"                     │
    │   "SITE:SITE-101"                   -> "SOFT_FREEZE"                   │
    │   "SUBJECT:SUBJ-004"                -> "HARD_LOCK"                     │
    │   "FORM:SUBJ-004:VISIT-1:FORM-DEMOG"-> "SOFT_FREEZE"                   │
    │ Read Latency: < 1 millisecond per check                                │
    └────────────────────────────────────────────────────────────────────────┘
```

#### Cache Coherence on Mutations
When `applyLock()` or `approveAndExecuteUnlock()` modifies MongoDB:
1. The transaction commits successfully to MongoDB.
2. The Single-Tier Distributed Redis hash `vialiq:locks:{studyId}` is immediately updated synchronously (zero pod-local L1 memory caches exist, so all pods observe updates in `< 1–2 ms`).

---

### 2.7 How Locking is Strictly Enforced (4-Layer Defense-in-Depth Pipeline)

No single point of failure is permitted in regulatory clinical trials. Locking is enforced across **4 continuous layers**:

```
[User Action: Edit Field]
        │
        ▼
┌───────────────────────────────────────┐
│ LAYER 1: CLIENT-SIDE UI GUARD         │  - Disables form inputs and action buttons
│ (Angular / Lit Web Components)        │  - Displays "LOCKED" banner & lock metadata
└──────────────────┬────────────────────┘
                   │ Bypassed by malicious script / direct API call?
                   ▼
┌───────────────────────────────────────┐
│ LAYER 2: API GATEWAY INTERCEPTOR      │  - NestJS Route Guard (@CheckLockGuard)
│ (Pre-Controller Execution)            │  - Fast O(1) Redis lookup (<1ms)
└──────────────────┬────────────────────┘  - Rejects with HTTP 423 (Locked)
                   │ Cache miss or stale cache race condition?
                   ▼
┌───────────────────────────────────────┐
│ LAYER 3: AUTHORITATIVE DB TRANSACTION │  - assertWritePermitted() inside session
│ (Core Service ACID Boundary)          │  - Queries MongoDB study_locks with majority read
└──────────────────┬────────────────────┘  - Throws ForbiddenException and rolls back TX
                   │ Direct database breach via admin console?
                   ▼
┌───────────────────────────────────────┐
│ LAYER 4: DATABASE CHANGE STREAM SENTINEL│  - Sidecar process listens to oplog.rs
│ (Post-Commit Audit Watchdog)          │  - Detects modifications to locked records
└───────────────────────────────────────┘  - Emits CRITICAL SECURITY ALERT to Quality Officer
```

#### Layer 2: NestJS Guard Code (`LockEnforcementGuard`)
```typescript
@Injectable()
export class LockEnforcementGuard implements CanActivate {
  constructor(private readonly redisLockCache: RedisLockCacheService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { studyId, siteId, subjectId, formId } = request.params;
    const userRole = request.user.role;

    // Fast O(1) Redis lookup
    const activeLocks = await this.redisLockCache.getActiveLocks(studyId);

    // 1. Check Study-Level Lock
    if (activeLocks['STUDY:ALL'] === LockType.HARD_LOCK) {
      throw new HttpException('Study is under Final Database Hard Lock.', HttpStatus.LOCKED);
    }

    // 2. Check Site-Level Lock
    if (siteId && activeLocks[`SITE:${siteId}`]) {
      const lockType = activeLocks[`SITE:${siteId}`];
      if (lockType === LockType.HARD_LOCK) {
        throw new HttpException(`Site ${siteId} is hard locked.`, HttpStatus.LOCKED);
      }
      if (lockType === LockType.SOFT_FREEZE && ['CLINICAL_RESEARCH_COORDINATOR', 'INVESTIGATOR'].includes(userRole)) {
        throw new HttpException(`Site ${siteId} is frozen for data entry.`, HttpStatus.LOCKED);
      }
    }

    // 3. Check Subject-Level Lock
    if (subjectId && activeLocks[`SUBJECT:${subjectId}`] === LockType.HARD_LOCK) {
      throw new HttpException(`Subject ${subjectId} is hard locked.`, HttpStatus.LOCKED);
    }

    // 4. Check Form-Level Lock
    if (formId && activeLocks[`FORM:${formId}`]) {
      throw new HttpException(`Form ${formId} is frozen.`, HttpStatus.LOCKED);
    }

    return true;
  }
}
```

---

### 2.8 Emergency Unlock Workflow (Four-Eyes Principle & Safety Window)

Unlocking a hard-locked study or site is a high-risk regulatory event subject to FDA audit scrutiny. Vialiq enforces the **Four-Eyes Principle (Dual-Person Authorization)**:

```
[Investigator / DM Requests Unlock] ──► Submits Medical Justification
                                                │
                                                ▼
[Lead Data Manager Approval]         ──► Re-authenticates via 21 CFR Part 11 Password
                                                │
                                                ▼
[Principal Investigator Countersign] ──► Countersigns & Approves
                                                │
                                                ▼
[System Executes Soft-Unlock]        ──► Auto-Relock Timer starts (max 48 hours)
                                         Audit trail records: EMERGENCY_UNLOCK_EXECUTED
                                         Emits notifications to Sponsor Quality Officer
```

#### Auto-Relock Safety Daemon
To prevent an unlocked study from remaining forgotten in an open state, a background scheduler automatically re-locks the target when the authorized duration expires:
```typescript
@Cron(CronExpression.EVERY_10_MINUTES)
async autoRelockExpiredUnlocks() {
  const expired = await this.db.collection('study_locks').find({
    isActive: false,
    'unlockHistory.reLockedAt': { $exists: false },
    'unlockHistory.autoRelockScheduledAt': { $lte: new Date() }
  }).toArray();

  for (const lock of expired) {
    await this.lockService.applyLock({
      studyId: lock.studyId,
      scope: lock.scope,
      targetId: lock.targetId,
      lockType: lock.lockType,
      reason: 'Automated re-lock: Emergency unlock window expired.',
      passwordReAuth: process.env.SYSTEM_DAEMON_SECRET
    }, SYSTEM_USER);
  }
}
```

---

## 3. Pillar 3: Client-Side Field-Level Encryption (CSFLE), Queryable Encryption & GDPR Crypto-Shredding

### 3.1 Trust Boundary Clarification: Why "Client-Side" Means Backend API, Not Browser UI

> [!IMPORTANT]
> **Architectural Trust Boundary Definition:**  
> In MongoDB cryptographic terminology, the term **"Client"** refers strictly to the **Backend Application Server (the NestJS `MongoClient` driver process)**, **NEVER** the end-user's web browser, tablet, or mobile UI!
>
> - **The Frontend Browser / Mobile UI:** Communicates with the platform exclusively over standard encrypted TLS 1.3 (HTTPS/WSS). The browser **never** receives cryptographic keys, DEKs, KMS credentials, or raw encrypted binary blobs. The browser receives plaintext only for fields the authenticated user has legitimate RBAC clearance to view.
> - **The Backend API Service (NestJS `MongoClient`):** Acts as the cryptographic boundary. It securely authenticates with Cloud KMS, holds the decrypted Data Encryption Keys (DEKs) in protected volatile memory, and encrypts fields locally before serializing BSON packets across the network to MongoDB.
> - **The MongoDB Database Engine (`mongod` on Layer 3 Prod):** Sees **only raw ciphertext** (`BinData(6, "...")`). Even a rogue system administrator, hosting provider engineer, or compromised database account with `root` privileges **cannot read sensitive patient data or treatment arms** because the database engine never possesses the keys.

```
                                  TRUST & ENCRYPTION BOUNDARY
                                  
    ┌───────────────────────────┐
    │ Web Browser / CRC UI      │
    │ (Angular / Lit Components)│
    └─────────────┬─────────────┘
                  │ Standard TLS 1.3 (HTTPS) - Plaintext transmitted over TLS
                  ▼
    ══════════════════════════════════════════════════════════════════════════════
    [TRUST BOUNDARY] — Backend API Server (NestJS Container on Private Subnet)
    ══════════════════════════════════════════════════════════════════════════════
                  │
                  ▼
    ┌───────────────────────────┐        Fetches DEK       ┌────────────────────┐
    │ NestJS API Worker Process │◄────────────────────────┤ Cloud KMS (AWS/HSM)│
    │ (Holds CSFLE MongoClient) │ Decrypts DEK in memory  └────────────────────┘
    └─────────────┬─────────────┘
                  │ Encrypted BSON Wire Protocol (Ciphertext: BinData)
                  ▼
    ══════════════════════════════════════════════════════════════════════════════
    [ZERO-TRUST STORAGE TIER] — Database Engine Never Has Keys
    ══════════════════════════════════════════════════════════════════════════════
                  │
                  ▼
    ┌───────────────────────────┐
    │ MongoDB Cluster (Layer 3) │ ◄── Stores only encrypted ciphertext on disk & RAM.
    │ mongod process            │     DBAs cannot decrypt or read patient data.
    └───────────────────────────┘
```

---

### 3.2 Study Configuration: 5 Security Tiers & Performance Trade-Off Matrix

In clinical trials, encryption is not "one-size-fits-all." Applying maximum encryption to every field imposes severe trade-offs: index limitations, query constraints, and CPU overhead.

Vialiq introduces **Configurable Security Tiers** during Study Protocol & Form Builder configuration:

```json
{
  "fieldId": "crf_patient_mrn",
  "label": "Medical Record Number",
  "fieldType": "TEXT",
  "encryptionTier": "TIER_1_DETERMINISTIC"
}
```

#### Security vs. Performance Trade-Off Matrix

| Security Tier | Technical Mechanism | Query Capabilities | Performance Impact | Recommended Clinical Fields |
|:---|:---|:---|:---:|:---|
| **Tier 0: Standard Base Security** | TLS 1.3 in-transit + WiredTiger AES-256-XTS at-rest on disk. | **Full:** Range, regex, compound indexes, text search, aggregation pipelines. | **Baseline (100% throughput):** Zero crypto latency. | Vital signs (Blood Pressure, Heart Rate), non-sensitive CRF form values, adverse event verbatims. |
| **Tier 1: Deterministic FLE** | `AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic` | **Exact Match Only:** Equality queries (`find({ mrn: "123" })`). No range or regex. | **~5% overhead:** Identical plaintext produces identical ciphertext; supports index lookups. | Pseudonymous patient IDs, Medical Record Numbers (`mrn`), National Health IDs. |
| **Tier 2: Randomized FLE (AEAD)** | `AEAD_AES_256_CBC_HMAC_SHA_512-Random` | **No Direct Querying:** Cannot be queried directly; loaded by document `_id` or indexed parent key. | **~10% overhead:** Unique ciphertext every write; immune to statistical frequency analysis. | Direct Patient Identifiers (Full Name, Date of Birth, Email, Street Address, E-Signature PINs). |
| **Tier 3: Queryable Encryption (QE)** | MongoDB 7.0 Native Fast Encrypted Indexes (Structured Encryption). | **Range & Prefix:** Encrypted equality, range (`$gt`, `$lt`), and prefix searches over encrypted data. | **~15–20% overhead:** Auxiliary encrypted index collections managed automatically. | Sensitive continuous metrics (Subject age, sensitive baseline genomic markers). |
| **Tier 4: Role-Blinded Isolation** | Randomized AEAD governed by restricted Cloud KMS IAM Key Policy. | **Role-Gated:** Decryptable **only** by unblinded service accounts or unblinded pharmacist roles. | **KMS Network Bound:** Handled by native MongoDB `libmongocrypt` 60s key buffer (no `.NET IMemoryCache`). | Investigational Product (IP) Treatment Arm, Randomized Kit Allocation. |

---

### 3.3 Envelope Encryption & Multi-Tenant Key Vault Security: Is Storing Multi-Client Keys in Admin Safe?

> **The Question:** We store the `__keyVault` collection in the Layer 1 Admin Cluster (`vialiq_control_plane.__keyVault`). If multiple pharmaceutical sponsors (e.g. Pfizer, Novartis, Roche) run clinical trials on Vialiq, is storing their combination keys together in the Admin Cluster safe and compliant? Could one client's keys decrypt another's data?

#### The Compliance & Cryptographic Answer: YES, 100% Safe Due to Envelope Cryptography

The architectural security rests on **Envelope Encryption (mandated by NIST SP 800-57, HIPAA §164.312, and SOC 2 Type II)**, combined with strict multi-tenant isolation tiers:

```
                          MULTI-TENANT ENVELOPE ISOLATION
                          
    Layer 1 Admin Cluster (vialiq_control_plane.__keyVault)
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │ Pfizer Wrapped DEK:  BinData(0, "AQIDAH...") ──► Encrypted by Pfizer AWS CMK│
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ Roche Wrapped DEK:   BinData(0, "AQIDAK...") ──► Encrypted by Roche AWS CMK │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ Novartis Wrapped DEK:BinData(0, "AQIDAR...") ──► Encrypted by Novartis CMK  │
    └─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
    Even if an admin dumps the Layer 1 database, ALL keys are completely useless ciphertexts.
    To unwrap a DEK, the request MUST reach AWS KMS with valid IAM credentials.
    Pfizer's IAM role CANNOT invoke kms:Decrypt on Roche's Master Key!
```

1. **The Database Stores NO Plaintext Keys:**
   Documents in `vialiq_control_plane.__keyVault` do **not** contain raw cryptographic keys. They store **Data Encryption Keys (DEKs) wrapped (encrypted) by a Cloud Customer Master Key (CMK)**:
   ```json
   {
     "_id": UUID("c4b2a8d1-7f8e-4a9b-9c2e-8d1e3f5a7b9c"),
     "keyAltNames": ["dek_pfizer_study_101_identity"],
     "masterKey": {
       "provider": "aws",
       "key": "arn:aws:kms:us-east-1:111122223333:key/pfizer-clinical-master-cmk"
     },
     "keyMaterial": BinData(0, "AQIDAHh7z...") // ◄── 100% ENCRYPTED CIPHERTEXT
   }
   ```
2. **Cryptographic Segregation Across Sponsors:**
   - Every pharmaceutical client/sponsor is assigned an **isolated Customer Master Key (CMK) ARN** in Cloud KMS.
   - Even though wrapped DEK records are cataloged in Layer 1, **they are cryptographically quarantined**.
   - An API service account running a Pfizer study only holds IAM permissions for `arn:aws:kms:...:key/pfizer-clinical-master-cmk`. If it attempts to unwrap a Roche DEK, AWS KMS hardware-enforced IAM security immediately **rejects the decryption request (`AccessDeniedException`)**.
3. **Hardware Security Module (HSM) Isolation:**
   The Master Keys (CMKs) reside strictly within an **AWS KMS / Azure Key Vault Hardware Security Module (FIPS 140-2 Level 3 certified)** and can never be exported or viewed by any human administrator.

---

#### 3.3.1 The 3 Multi-Tenant Key Vault Isolation Models

Depending on the sponsor's regulatory classification and enterprise contractual requirements, Vialiq supports **3 distinct Key Vault isolation models**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              VIALIQ MULTI-TENANT KEY VAULT ISOLATION TIERS                             │
├───────────────────────────────────┬───────────────────────────────────┬────────────────────────────────┤
│ Model 1: Shared KeyVault Namespace│ Model 2: Dedicated KeyVault DB    │ Model 3: Bring Your Own Key    │
│ (Standard Enterprise)             │ (Physical DB Isolation)           │ (BYOK Zero-Knowledge)          │
├───────────────────────────────────┼───────────────────────────────────┼────────────────────────────────┤
│ • Collection: Single shared       │ • Collection: Dedicated per tenant│ • CMK Location: Sponsor's OWN  │
│   vialiq_control_plane.__keyVault │   keyvault_sponsor_pfizer.__keyVlt│   AWS Account (Not Vialiq)     │
│ • Isolation: Cloud KMS IAM ARNs   │ • Isolation: MongoDB native RBAC  │ • Isolation: Full Sovereign    │
│ • Best for: Standard phase trials │ • Best for: High-compliance CROs  │ • Best for: Top-tier Big Pharma│
└───────────────────────────────────┴───────────────────────────────────┴────────────────────────────────┘
```

##### Model 1: Shared KeyVault with Sponsor-Specific KMS CMKs (Standard Enterprise)
* A single high-performance `vialiq_control_plane.__keyVault` collection stores wrapped DEKs for all active studies.
* Isolation is enforced cryptographically at the Cloud KMS layer via dedicated CMKs and IAM Key Policies per sponsor.

##### Model 2: Dedicated KeyVault Database per Sponsor (Physical Collection Isolation)
* For sponsors requiring strict separation of storage at rest, Layer 1 Admin provisions **dedicated databases per sponsor**:
  - `keyvault_sponsor_pfizer.__keyVault`
  - `keyvault_sponsor_roche.__keyVault`
* **MongoDB RBAC Enforcement:**
  - The database user account for the Pfizer connection pool is strictly granted `readWrite` on `keyvault_sponsor_pfizer` only.
  - Queries attempting to touch Roche's keyvault database are blocked by MongoDB's internal authorization engine before ever executing.
* In the NestJS connection pool, `keyVaultNamespace` is dynamically set per sponsor pool:
  ```typescript
  autoEncryption: {
    keyVaultNamespace: `keyvault_sponsor_${tenantId}.__keyVault`,
    kmsProviders: { ... }
  }
  ```

##### Model 3: Bring Your Own Key (BYOK) — Zero-Knowledge Sovereign Control
* For global tier-1 pharmaceutical sponsors (e.g., Novartis, AstraZeneca), corporate policy forbids third-party SaaS vendors from owning the Master Key.
* **How BYOK Works in Vialiq:**
  1. The Master Key (CMK) is created inside the **Sponsor's own AWS account** (`arn:aws:kms:us-east-1:sponsor-account-id:key/...`).
  2. The sponsor configures an AWS KMS Key Policy that allows Vialiq's dedicated VPC worker IAM role to invoke `kms:Decrypt` and `kms:Encrypt`.
  3. **Instant Sovereign Kill Switch:** If the sponsor terminates the study, suspects a compromise, or ends the contract, the sponsor **disables the key in their own AWS console with 1 click**.
  4. Once disabled by the sponsor, **Vialiq cannot decrypt a single byte of their patient data**, even with full administrative access to both Layer 1 Admin and Layer 3 Prod.

---

#### 3.3.2 Defense-in-Depth: Physical Cluster Separation (Layer 1 vs. Layer 3)

Storing Key Vaults on Layer 1 Admin introduces a powerful **physical architectural barrier** that protects clinical data:

```
    ┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
    │             LAYER 1: ADMIN CLUSTER           │       │             LAYER 3: PROD CLUSTER            │
    │             (Port 27017 / Private)           │       │             (Port 27037 / App Tier)          │
    ├──────────────────────────────────────────────┤       ├──────────────────────────────────────────────┤
    │ • Stores: Wrapped DEKs only                  │       │ • Stores: Encrypted patient CRF data         │
    │ • Stores: ZERO patient clinical records      │       │ • Stores: ZERO cryptographic keys            │
    │ • Compromise Impact: Attackers get ciphertext│       │ • Compromise Impact: Attackers get ciphertext│
    │   keys that require Cloud KMS to unwrap.     │       │   data with zero keys to decrypt them.       │
    └──────────────────────────────────────────────┘       └──────────────────────────────────────────────┘
```

To achieve an unauthorized decryption of clinical patient data, an attacker would have to breach **three completely independent, isolated security perimeters simultaneously**:
1. **Perimeter 1:** Breach Layer 3 Prod to steal the raw encrypted BSON records.
2. **Perimeter 2:** Breach Layer 1 Admin (isolated on private VPC port 27017) to steal the wrapped DEKs.
3. **Perimeter 3:** Breach AWS / Azure Cloud KMS IAM infrastructure to compromise the Hardware Security Module (HSM) master key.

This multi-layer architecture guarantees that no single database compromise can expose sensitive clinical trial data.

---

### 3.4 The Clinical GDPR Dilemma: Crypto-Shredding vs. 21 CFR Part 11 Audit Retention

A fundamental regulatory contradiction exists in clinical trial software:
- **GDPR Article 17 ("Right to Erasure / Right to be Forgotten"):** An EU participant has the legal right to revoke consent and demand deletion of their personal health data.
- **FDA 21 CFR §11.10(e) & ICH GCP:** Strictly **forbids deleting or altering** clinical records, audit trail histories, or cryptographic signatures (data must be preserved for 25 years).

#### The Technical Solution: Subject-Level Crypto-Shredding
Instead of violating FDA regulations by deleting records from the database or audit trail:
1. Every clinical subject is assigned an **isolated, individual Data Encryption Key (`dek_subject_{uuid}`)**.
2. When a patient exercises their GDPR Article 17 Right to Erasure, the system executes **Crypto-Shredding**:
   ```typescript
   async function executeGdprCryptoShredding(subjectId: string): Promise<void> {
     const keyAltName = `dek_subject_${subjectId}`;

  // 1. Permanently delete the subject's unique Data Encryption Key from the Site Zone's __keyVault
  await zoneKeyVaultDb.collection('__keyVault').deleteOne({ keyAltNames: keyAltName });

  // 2. Notify CSFLE driver scopes to recycle scoped libmongocrypt key buffers (zero custom .NET IMemoryCache)
  await csfleClientManager.notifyKeyRevoked(zoneId, keyAltName);

     // 3. Log regulatory compliance event in audit trail
     await auditTrailDb.collection('audit_trail').insertOne({
       _id: crypto.randomUUID(),
       eventType: 'GDPR_CRYPTO_SHREDDING_EXECUTED',
       subjectId,
       reason: 'Subject revoked informed consent; invoked GDPR Article 17',
       timestamp: new Date()
     });
   }
   ```
3. **The Regulatory Outcome:**
   - The encrypted ciphertext in `subject_identities`, `crf_entries`, and `audit_trail` remains **100% untouched**, preserving bit-for-bit SHA-256 hash-chain validity for FDA auditors.
   - Without the shredded DEK, the ciphertext is mathematically unrecoverable (effectively randomized entropy), fulfilling GDPR Article 17 with **zero audit trail destruction**.

---

### 3.5 Cryptographic Modes: Deterministic, Randomized (AEAD) & Queryable Encryption (QE)

Vialiq selects the exact cryptographic algorithm based on query requirements:

```
                          CRYPTOGRAPHIC ALGORITHM SELECTION
                          
    Is the field a direct patient identifier (Name, DOB, Address)?
    ├── YES ──► AEAD Randomized (Random IV; prevents frequency analysis attacks)
    └── NO
         │
         Is exact equality indexing required (Patient MRN, National ID)?
         ├── YES ──► AEAD Deterministic (Identical plaintext = Identical ciphertext)
         └── NO
              │
              Is range or prefix querying required over encrypted data (Age, Biomarker)?
              ├── YES ──► MongoDB 7.0 Native Queryable Encryption (Fast encrypted indexes)
              └── NO  ──► Tier 0 Standard (TLS in-transit + NVMe AES-256 at-rest)
```

---

### 3.6 Key Lifecycle: What Happens to Keys During Study Lock & 25-Year WORM Archival?

When a clinical trial completes and transitions through locking and archival, its cryptographic keys follow a strictly audited lifecycle:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             KEY LIFECYCLE PHASES                                 │
├───────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Active Study      │ Database Lock (DBL)          │ 25-Year WORM Archival         │
│ (Enrollment/Visits│ (Study Read-Only)            │ (Cold Storage Shutdown)       │
├───────────────────┼──────────────────────────────┼───────────────────────────────┤
│ Keys: Read/Write  │ Keys: Read-Only Policy       │ Keys: Retained in KMS Vault   │
│ - New DEKs created│ - No new DEKs allowed        │ - Policy: RETAIN_25YR         │
│ - Live encryption │ - Decryption active for DMs  │ - Exported into WORM bundle   │
│   and decryption  │ - Mutation blocked in KMS    │ - Guaranteed FDA inspectability│
└───────────────────┴──────────────────────────────┴───────────────────────────────┘
```

1. **Active Phase:** Keys support live reads and writes. DEKs are cached in API memory for up to 5 minutes.
2. **Database Hard Lock Phase:** 
   - An automated script updates the AWS KMS IAM Key Policy for that study to `DENY_KEY_CREATION`.
   - The study's DEKs transition to a **Read-Only State**. Decryption remains functional for monitors, data managers, and biostatisticians generating final regulatory submission files.
3. **25-Year Archival Phase (WORM Storage):**
   - **The Problem:** If a cloud account or KMS key is deleted 5 years after study close, the 25-year archived clinical data is permanently lost, triggering catastrophic FDA regulatory fines.
   - **The Vialiq Archival Key Policy:**
     1. The encrypted study DEKs are packaged directly inside the regulatory archival bundle (`archive-bundle-final.tar.gz`) stored in **AWS S3 Glacier Object Lock (Compliance Mode)**.
     2. In AWS KMS, the Master Key is assigned a `COMPLIANCE_HOLD_25_YEAR` resource tag with deletion protection enabled.
     3. The KMS Key policy prevents key deletion until the regulatory retention date (e.g. October 18, 2051) has passed.

---

### 3.7 Key Rotation Architecture: CMK Re-wrapping vs. Background Field Re-encryption

Key rotation in clinical trial databases is subject to strict regulatory oversight (FDA 21 CFR §11.10(e) audit trails, HIPAA Key Management Controls, and NIST SP 800-57). We distinguish between two fundamentally different rotation operations:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                KEY ROTATION TYPOLOGY & ARCHITECTURE                                    │
├─────────────────────────────────────────────────┬──────────────────────────────────────────────────────┤
│ Type A: Master Key (CMK / KEK) Rotation         │ Type B: Data Encryption Key (DEK) Rotation           │
├─────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ • Frequency: Annual routine compliance          │ • Frequency: Key lifecycle retirement / compromise   │
│ • Target: Customer Master Key in Cloud KMS      │ • Target: Individual DEKs in __keyVault              │
│ • Clinical Records Touched: ZERO (0 records)    │ • Clinical Records Touched: ALL encrypted fields     │
│ • Execution Time: <500 milliseconds             │ • Execution Time: Decoupled background async batches │
│ • System Downtime: 0 seconds (Live operational) │ • System Downtime: 0 seconds (Zero downtime dual-key)│
│ • Mechanism: ClientEncryption.rewrapManyDataKey │ • Mechanism: 7-Phase Resumable Re-encryption Worker   │
└─────────────────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

#### 3.7.1 Scenario A: Customer Master Key (CMK / KEK) Rotation (Zero Downtime, Zero Record Touch)

When enterprise cloud security policies or corporate governance require rotating the Customer Master Key (KEK) in AWS KMS or Azure Key Vault:

1. **Cloud KMS Auto-Rotation:** Cloud KMS creates a new backing key version in its HSM while preserving the identical Key ARN.
2. **Envelope Re-wrapping via `rewrapManyDataKey()`:**  
   MongoDB CSFLE provides a native, atomic operation that decrypts the Data Encryption Keys inside `__keyVault` using the old CMK version and immediately re-encrypts them with the new CMK version:

```typescript
import { MongoClient, ClientEncryption } from 'mongodb';

export class MasterKeyRotationService {
  constructor(private readonly mongoClient: MongoClient) {}

  /**
   * Rotates the Master Key wrapping all DEKs in the __keyVault.
   * Execution time: <500ms. Zero patient records are modified!
   */
  async rotateCustomerMasterKey(studyId: string, kmsKeyArn: string): Promise<void> {
    const clientEncryption = new ClientEncryption(this.mongoClient, {
      keyVaultNamespace: 'vialiq_control_plane.__keyVault',
      kmsProviders: {
        aws: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      }
    });

    // Atomically re-wraps all DEKs referencing the Master Key
    const result = await clientEncryption.rewrapManyDataKey(
      { 'masterKey.key': kmsKeyArn }
    );

    console.log(`✅ Master Key rotation complete: ${result.bulkWriteResult.modifiedCount} DEKs re-wrapped.`);
  }
}
```

* **Why Zero Patient Records Are Touched:** Because patient CRF records are encrypted with the Data Encryption Key (DEK), not the Master Key (CMK). Changing the wrapper around the DEK in `__keyVault` requires zero changes to the underlying clinical data collections.

---

#### 3.7.2 Scenario B: Data Encryption Key (DEK) Rotation & Field Re-encryption

When a specific Data Encryption Key (DEK) reaches the end of its cryptoperiod (e.g., 3 years), or in the event of suspected key compromise, the actual ciphertexts on disk must be migrated from `dek_v1` to `dek_v2`.

Re-encrypting millions of clinical records while investigators and CRCs are actively entering trial data requires an **asynchronous, resumable, optimistic-concurrency-safe architecture**.

```
                           7-PHASE DEK ROTATION STATE MACHINE
                           
    [Phase 1: Dual-Person Part 11 Auth] ──► Pre-flight document count & snapshot
                   │
                   ▼
    [Phase 2: Generate DEK v2]           ──► Inserts dek_v2 with status "ACTIVE" in __keyVault
                   │
                   ▼
    [Phase 3: Live SchemaMap Switch]     ──► Outgoing writes immediately use dek_v2.
                   │                         Inbound reads seamlessly decrypt v1 & v2.
                   ▼
    [Phase 4: Resumable Batch Worker]    ──► Decoupled worker processes 500-record chunks
                   │                         Checkpointing via Redis: lastProcessedId
                   ▼
    [Phase 5: Concurrency Resolution]    ──► Optimistic Concurrency Control (_version guard)
                   │                         Retries on concurrent CRC edits without data loss
                   ▼
    [Phase 6: 100% Cryptographic Audit]  ──► Verifies remaining v1 count === 0
                   │                         Reconciles record counts before vs after
                   ▼
    [Phase 7: Decommission DEK v1]       ──► Marks dek_v1 as "RETIRED" in __keyVault
                                             Appends 21 CFR Part 11 digital signature
```

---

#### 3.7.3 Extended `__keyVault` Lifecycle Schema

Every DEK document in `vialiq_control_plane.__keyVault` contains rigorous lifecycle state tracking:

```typescript
export enum KeyStatus {
  ACTIVE = 'ACTIVE',       // Actively used for both new writes and reads
  MIGRATING = 'MIGRATING', // Used for dual-read; background re-encryption in progress
  RETIRED = 'RETIRED',     // Read-only for historical audit trail inspection; no new writes
  REVOKED = 'REVOKED'      // Crypto-shredded (GDPR Article 17) or compromised; decryption disabled
}

export interface IKeyVaultDocument {
  _id: UUID; // Standard CSFLE UUID
  keyAltNames: string[]; // e.g. ["dek_study_101_identity_v2"]
  keyVersion: number;    // e.g. 1, 2, 3
  status: KeyStatus;
  
  masterKey: {
    provider: 'aws' | 'azure' | 'gcp' | 'local';
    key: string; // Cloud KMS Key ARN
  };
  keyMaterial: Binary; // Encrypted DEK ciphertext wrapped by CMK
  
  // Regulatory Metadata
  creationDate: Date;
  createdByUserId: string;
  parentKeyId?: UUID;    // Points to the predecessor key (v1) if rotated
  retiredAt?: Date;
  retirementReason?: string;
  signatureHash: string; // SHA-256 of key metadata signed by Security Officer
}
```

---

#### 3.7.4 Seamless Dual-Key Read Support (Why the API Never Breaks)

A critical architectural capability of MongoDB CSFLE is that **the API application can read both `v1` and `v2` records concurrently without code changes or ambiguous guesswork**:

1. **BSON Subtype 6 Binary Header:** When MongoDB CSFLE encrypts a field, it wraps the ciphertext into a BSON binary blob (Subtype 6). The first 16 bytes of the binary header explicitly contain the **Key UUID (`keyId`)** that encrypted that specific value.
2. **Automatic Key Lookup:** When `MongoClient` fetches a document, it reads the 16-byte UUID from the field header, pulls the corresponding DEK from its local cache (or `__keyVault`), and decrypts the field.
3. If Document A was written last year with `dek_v1`, it decrypts with `dek_v1`. If Document B was written 5 seconds ago with `dek_v2`, it decrypts with `dek_v2`. Both coexist peacefully in the exact same collection.

---

#### 3.7.5 Resumable Batch Worker with Checkpointing & Optimistic Concurrency Control (OCC)

The background re-encryption worker integrates with our Async Worker Tier (canonical production runtime = `.NET 9` + `RabbitMQ`/`Hangfire` per [Scale 004](../../scaling-architecture/004-caching-queues-and-resilience-patterns.md); TypeScript/BullMQ snippet below is legacy illustrative reference). It handles crashes, network blips, and concurrent clinical edits with mathematical safety:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, ClientEncryption, Db, ObjectId } from 'mongodb';

export interface IReencryptionJobPayload {
  studyId: string;
  collectionName: string;
  targetField: string;
  oldKeyId: string; // UUID string of dek_v1
  newKeyId: string; // UUID string of dek_v2
  batchSize: number; // default: 500
}

@Injectable()
export class FieldReencryptionWorker {
  private readonly logger = new Logger(FieldReencryptionWorker.name);

  constructor(
    private readonly mongoClient: MongoClient,
    private readonly clientEncryption: ClientEncryption,
    private readonly redisCache: RedisService
  ) {}

  /**
   * Resumable background processor for batch field re-encryption.
   */
  async processReencryptionJob(job: IReencryptionJobPayload): Promise<void> {
    const db: Db = this.mongoClient.db(`study_${job.studyId}_prod`);
    const collection = db.collection(job.collectionName);
    const checkpointKey = `vialiq:reencrypt:checkpoint:${job.studyId}:${job.collectionName}`;

    // 1. Resume from last saved checkpoint, or start from beginning
    let lastProcessedId: string | null = await this.redisCache.get(checkpointKey);
    let totalMigrated = 0;
    let hasMore = true;

    this.logger.log(`Starting re-encryption for ${job.collectionName}. Resuming after _id: ${lastProcessedId || 'START'}`);

    while (hasMore) {
      // 2. Query next deterministic batch sorted strictly by _id ascending
      const query: any = { keyVersion: 'v1' };
      if (lastProcessedId) {
        query._id = { $gt: new ObjectId(lastProcessedId) };
      }

      const batch = await collection
        .find(query)
        .sort({ _id: 1 })
        .limit(job.batchSize)
        .toArray();

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      const bulkOps: any[] = [];
      const occRetryQueue: any[] = [];

      for (const doc of batch) {
        try {
          // 3. Decrypt ciphertext in worker RAM using old DEK (dek_v1)
          const plaintextValue = await this.clientEncryption.decrypt(doc[job.targetField]);

          // 4. Re-encrypt with new DEK (dek_v2)
          const newCiphertext = await this.clientEncryption.encrypt(plaintextValue, {
            keyId: new (require('mongodb').UUID)(job.newKeyId),
            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
          });

          // 5. Build OCC Atomic Update: Match both _id AND current _version
          bulkOps.push({
            updateOne: {
              filter: { _id: doc._id, _version: doc._version },
              update: {
                $set: {
                  [job.targetField]: newCiphertext,
                  keyVersion: 'v2',
                  _version: doc._version + 1,
                  reencryptedAt: new Date()
                }
              }
            }
          });
        } catch (cryptoErr) {
          this.logger.error(`Decryption failed on document ${doc._id}. Halting to prevent data corruption!`, cryptoErr);
          throw cryptoErr;
        }
      }

      // 6. Execute atomic bulk write
      const writeResult = await collection.bulkWrite(bulkOps, { ordered: false });

      // 7. OCC Collision Detection: Check if any documents were modified concurrently by CRCs
      if (writeResult.modifiedCount < batch.length) {
        const missedCount = batch.length - writeResult.modifiedCount;
        this.logger.warn(`OCC Collision: ${missedCount} documents were edited concurrently by live users. Handling gracefully.`);
        
        // Documents edited concurrently by live users already received dek_v2 on the live write path!
        // We verify that their keyVersion is now 'v2':
        const unmigratedCheck = await collection.countDocuments({
          _id: { $in: batch.map(d => d._id) },
          keyVersion: 'v1'
        });
        
        if (unmigratedCheck > 0) {
          this.logger.warn(`${unmigratedCheck} documents require re-fetch retry.`);
        }
      }

      totalMigrated += writeResult.modifiedCount;
      lastProcessedId = batch[batch.length - 1]._id.toString();

      // 8. Persist progress checkpoint to Redis (for crash recovery)
      await this.redisCache.set(checkpointKey, lastProcessedId, 'EX', 86400); // 24-hour TTL

      this.logger.log(`Re-encrypted batch of ${batch.length} documents. Total migrated so far: ${totalMigrated}`);
    }

    // 9. Phase 6: Post-Flight Cryptographic Audit Verification
    const remainingV1 = await collection.countDocuments({ keyVersion: 'v1' });
    if (remainingV1 > 0) {
      throw new Error(`Integrity Check Failed: ${remainingV1} documents still remain on keyVersion v1!`);
    }

    // Clear checkpoint upon successful completion
    await this.redisCache.del(checkpointKey);
    this.logger.log(`✅ Field re-encryption successfully finished for ${job.collectionName}. Total records: ${totalMigrated}`);
  }
}
```

---

#### 3.7.6 Concurrency Resolution: Handling Live User Writes During Re-Encryption

What happens if a Clinical Research Coordinator (CRC) at Site 101 edits a patient's CRF record *at the exact millisecond* that the background worker is re-encrypting that same record?

Vialiq guarantees **Zero Data Loss and Zero Overwrites** through a multi-tier defense:

```
    Timeline: CRC Live Edit vs. Background Re-Encryption Worker
    
    Time (t)      CRC User Request (Live Web API)          Background Re-Encryption Worker
    ──────────────────────────────────────────────────────────────────────────────────────────
    t0            -                                        Fetches Document A (_version: 4)
    t1            CRC submits edit to Document A           Worker re-encrypts in memory
    t2            API writes Document A with dek_v2        -
                  (_version becomes 5)                     -
    t3            -                                        Worker executes bulkWrite:
                                                           filter: { _id: A, _version: 4 }
    t4            -                                        RESULT: matchedCount = 0 (OCC Miss)
                                                           Worker's stale update is REJECTED!
    ──────────────────────────────────────────────────────────────────────────────────────────
    Outcome: CRC's new clinical values are PRESERVED. Stale worker payload is dropped.
             Document A is already on dek_v2 from the live write. 100% integrity guaranteed.
```

---

#### 3.7.7 21 CFR Part 11 Regulatory Audit Trail Emission

Once Phase 6 verifies that 100% of target documents have successfully migrated to `v2`, the `KeyRotationOrchestrator` executes Phase 7:
1. Updates `vialiq_control_plane.__keyVault` setting `status: 'RETIRED'`, `retiredAt: new Date()`.
2. Appends an immutable regulatory record to `audit_trail`:

```json
{
  "_id": "c7a8b9d0-1e2f-4a3b-9c8d-7e6f5a4b3c2d",
  "eventType": "CRYPTO_KEY_ROTATION_COMPLETED",
  "studyId": "study_oncology_101",
  "collectionName": "subject_identities",
  "targetField": "fullName",
  "oldKeyId": "UUID(b1a2c3d4-0000-0000-0000-000000000001)",
  "newKeyId": "UUID(b1a2c3d4-0000-0000-0000-000000000002)",
  "totalRecordsMigrated": 48250,
  "preFlightDocumentCount": 48250,
  "postFlightDocumentCount": 48250,
  "unmigratedV1Count": 0,
  "authorizedByUserId": "sec_officer_patel",
  "countersignedByUserId": "dm_lead_martinez",
  "executionDurationMs": 142380,
  "signatureHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "timestamp": "2026-10-18T22:15:00.000Z"
}
```

---

### 3.8 Complete MongoDB Encryption Schema Map (`schemaMap`) & NestJS Configuration

The `MongoClient` automatically encrypts outbound writes and decrypts inbound reads based on the `schemaMap`:

```typescript
import { MongoClient } from 'mongodb';

export function configureCsfleClient(kmsProvider: 'aws' | 'local', masterKey: any, keyVaultNamespace: string): MongoClient {
  const schemaMap = {
    'study_oncology_101_prod.subject_identities': {
      bsonType: 'object',
      properties: {
        // Deterministic: Enables exact equality lookup by MRN
        mrn: {
          encrypt: {
            keyId: ['/dek_subject_mrn'],
            bsonType: 'string',
            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic'
          }
        },
        // Randomized: Maximum entropy security for patient direct identifiers
        fullName: {
          encrypt: {
            keyId: ['/dek_subject_identity'],
            bsonType: 'string',
            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
          }
        },
        dateOfBirth: {
          encrypt: {
            keyId: ['/dek_subject_identity'],
            bsonType: 'date',
            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
          }
        }
      }
    },
    'study_oncology_101_prod.rtsm_treatment_allocations': {
      bsonType: 'object',
      properties: {
        treatmentArm: {
          encrypt: {
            keyId: ['/dek_study_101_rtsm_blinded'],
            bsonType: 'string',
            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
          }
        }
      }
    }
  };

  return new MongoClient(process.env.MONGO_LAYER3_PROD_URI, {
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders: kmsProvider === 'aws' ? {
        aws: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      } : {
        local: {
          key: Buffer.from(process.env.LOCAL_MASTER_KEY_BASE64, 'base64')
        }
      },
      schemaMap
    }
  });
}
```

---

### 3.9 Double-Blind RTSM Treatment Arm Isolation & Unblinded KMS Access Policy

> *(Phase-1 Scope Note: Native RTSM randomization & kit depot workflows are deferred to Phase 2+; randomized Phase 1 trials integrate with external IXRS while keeping these `BlindedRTSM` KMS isolation & Code Break hooks active from Day 1.)*

In double-blind studies, blinding integrity is governed at the **cryptographic KMS level**:
1. The Data Encryption Key for `treatmentArm` (`dek_study_101_rtsm_blinded`) is encrypted with an isolated Cloud KMS Key ARN:
   `arn:aws:kms:us-east-1:123456789012:key/vialiq-rtsm-unblinded-master`
2. **IAM Policy Guard:**
   - Standard EDC API Worker IAM roles **do not have `kms:Decrypt`** permission on the unblinded key. Any attempt by standard CRCs, Monitors, or Sponsor Data Managers to query `treatmentArm` returns the raw encrypted ciphertext or triggers the application masking filter.
   - Only the **Unblinded Pharmacist** and **IDMC Safety Committee** microservice identities hold IAM credentials authorized to invoke `kms:Decrypt`.

---

### 3.10 Emergency Code Break (Emergency Unblinding) Workflow

When a subject experiences a life-threatening Serious Adverse Event (SAE), an emergency medical decision may require immediate knowledge of the administered treatment.

Vialiq enforces the **Emergency Code Break Protocol**:
1. Treating Physician navigates to `/studies/:id/subjects/:subId/emergency-unblind`.
2. Enters 21 CFR Part 11 digital signature and specifies mandatory **Medical Emergency Reason**.
3. System decrypts treatment arm for that specific patient **only** via a dedicated privileged unblinding handler.
4. The system immediately executes an atomic multi-document transaction:
   - Sets `subject.isEmergencyUnblinded = true`.
   - Writes an immutable record to `audit_trail` (Event: `EMERGENCY_CODE_BREAK`).
   - Dispatches real-time automated SMS and encrypted high-priority emails to the Sponsor Medical Monitor and Pharmacovigilance Safety Team.

---

### 3.11 Field-Level Encryption Development Mode (Local Offline Developer Experience on Apple Silicon & CI)

In production environments, CSFLE relies on AWS KMS or Azure Key Vault Hardware Security Modules (FIPS 140-2 Level 3 HSM). However, requiring active cloud KMS connections for daily engineering introduces significant friction:
- **Cloud Dependency & Latency:** Offline development (e.g. on airplanes, remote sites, or restricted corporate networks) becomes impossible.
- **KMS API Costs:** Automated unit and integration test suites running thousands of crypto queries would incur unnecessary KMS billing.
- **Developer Onboarding:** New developers on Apple Silicon (M1 Pro / M5 Pro) would require complex AWS IAM credential provisioning before writing a single line of code.

To resolve this, Vialiq implements a **100% Offline, Bit-for-Bit Identical Development Mode** powered by MongoDB CSFLE's native `local` KMS provider and the `crypt_shared` shared library.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              CSFLE ENVIRONMENT DUAL-MODE ARCHITECTURE                                 │
├────────────────────────────────────────┬───────────────────────────────────────────────────────────────┤
│ Mode Feature                           │ Local Development / CI Environment │ Cloud Production / Staging   │
├────────────────────────────────────────┼─────────────────────────────────────┼─────────────────────────┤
│ **KMS Provider**                       │ `local`                             │ `aws` (or `azure`)      │
│ **Master Key Storage**                 │ 96-Byte Base64 String in `.env`     │ AWS KMS Hardware HSM    │
│ **Key Vault Location**                 │ Layer 1 Admin Cluster (Port 27017)  │ Layer 1 Admin VPC Subnet│
│ **Decryption Engine**                  │ `crypt_shared` (`.dylib` / `.so`)   │ `crypt_shared` (`.so`)  │
│ **Cloud Network Dependency**           │ **ZERO (100% Offline)**             │ VPC Endpoint to AWS KMS │
│ **Cryptographic Wire Format**          │ BinData Subtype 6 (Identical BSON)  │ BinData Subtype 6       │
└────────────────────────────────────────┴─────────────────────────────────────┴─────────────────────────┘
```

---

#### 3.11.1 Generating the 96-Byte Local Master Key

MongoDB CSFLE mandates that local master keys must be **exactly 96 bytes** (768 bits) of cryptographically secure random data:
- 32 bytes for the HMAC-SHA-512 signing key
- 32 bytes for the AES-256 encryption key
- 32 bytes for key derivation

To generate this key on macOS (Apple Silicon M1 Pro / M5 Pro) or Linux, run:

```bash
node -e "console.log(require('crypto').randomBytes(96).toString('base64'))"
```

This outputs a 128-character Base64 string. Add this to your local `.env.development` file:

```bash
# ==============================================================================
# VIALIQ LOCAL DEVELOPMENT ENVIRONMENT CONFIGURATION (.env.development)
# ==============================================================================
NODE_ENV=development
KMS_PROVIDER=local

# 96-Byte Cryptographically Secure Master Key (Base64-encoded)
LOCAL_KMS_MASTER_KEY_BASE64="qW8/3vK2e+9...<exactly 128 base64 chars>...=="

# 3-Layer MongoDB Cluster Endpoints (Docker on Apple Silicon)
MONGO_LAYER1_ADMIN_URI="mongodb://root:admin_secret_pass_2026@localhost:27017/admin?authSource=admin"
MONGO_LAYER2_DEV_URI="mongodb://root:dev_secret_pass_2026@localhost:27027/admin?authSource=admin"
MONGO_LAYER3_PROD_URI="mongodb://root:prod_secret_pass_2026@localhost:27037/admin?authSource=admin"

# KeyVault Namespace on Layer 1 Admin
KEY_VAULT_NAMESPACE="vialiq_control_plane.__keyVault"

# macOS Apple Silicon crypt_shared library path
CRYPT_SHARED_LIB_PATH="/usr/local/lib/mongo_crypt_v1.dylib"
```

> [!WARNING]
> **Production Guard:** Never commit `.env.development` or `.env.local` containing local master keys to Git. In production, the backend ignores `LOCAL_KMS_MASTER_KEY_BASE64` and strictly requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_KMS_KEY_ARN`.

---

#### 3.11.2 Installing the `crypt_shared` Dynamic Library on Apple Silicon (macOS ARM64)

In MongoDB 6.0 and 7.0, the official MongoDB Node.js driver uses the high-performance **`crypt_shared` C++ dynamic shared library** (`mongo_crypt_v1.dylib` on macOS / `mongo_crypt_v1.so` on Linux) instead of the legacy `mongocryptd` background daemon. 

`crypt_shared` runs directly inside the Node.js process via native FFI bindings, eliminating socket IPC overhead and external process crashes.

##### Step 1: Download & Install on macOS (Apple Silicon ARM64)
```bash
# 1. Download official MongoDB 7.0 crypt_shared archive for macOS ARM64
curl -O https://downloads.mongodb.com/osx/mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.5.tgz

# 2. Extract the archive
tar -xzf mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.5.tgz

# 3. Copy the dynamic library to system library search path
sudo cp mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.5/lib/mongo_crypt_v1.dylib /usr/local/lib/

# 4. Remove macOS Gatekeeper quarantine flag
sudo xattr -d com.apple.quarantine /usr/local/lib/mongo_crypt_v1.dylib

# 5. Clean up temporary files
rm -rf mongo_crypt_shared_v1*
```

##### Step 2: Linux / Docker Dev Containers (ARM64 & x86_64)
In dev containers or CI pipelines, the library is placed at `/usr/lib/mongo_crypt_v1.so`:
```dockerfile
# Inside development Dockerfile:
RUN apt-get update && apt-get install -y libmongocrypt0
ENV CRYPT_SHARED_LIB_PATH=/usr/lib/x86_64-linux-gnu/mongo_crypt_v1.so
```

---

#### 3.11.3 Local Key Seeding Script (`scripts/seed-local-encryption-keys.ts`)

To allow developers to immediately run and test the application without manual database setup, Vialiq provides an automated seeding script.

Run after booting the 3-layer Docker cluster (`npm run docker:mongo:all`):

```bash
npx ts-node scripts/seed-local-encryption-keys.ts
```

```typescript
import { MongoClient, ClientEncryption, Binary } from 'mongodb';
import * as crypto from 'crypto';

async function seedLocalEncryptionKeys() {
  console.log('🚀 Initializing Local Field-Level Encryption Keys on Layer 1 Admin...');

  const adminUri = process.env.MONGO_LAYER1_ADMIN_URI || 'mongodb://root:admin_secret_pass_2026@localhost:27017/admin?authSource=admin';
  const keyVaultNamespace = 'vialiq_control_plane.__keyVault';
  const [keyVaultDb, keyVaultColl] = keyVaultNamespace.split('.');

  const masterKeyBase64 = process.env.LOCAL_KMS_MASTER_KEY_BASE64 || crypto.randomBytes(96).toString('base64');
  const localMasterKeyBuffer = Buffer.from(masterKeyBase64, 'base64');

  if (localMasterKeyBuffer.length !== 96) {
    throw new Error(`CRITICAL: Local master key must be exactly 96 bytes! Received: ${localMasterKeyBuffer.length} bytes.`);
  }

  const adminClient = new MongoClient(adminUri);
  await adminClient.connect();

  try {
    const db = adminClient.db(keyVaultDb);
    const collection = db.collection(keyVaultColl);

    // 1. Create partial unique index on keyAltNames
    await collection.createIndex(
      { keyAltNames: 1 },
      { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } }
    );

    // 2. Initialize ClientEncryption with local KMS provider
    const clientEncryption = new ClientEncryption(adminClient, {
      keyVaultNamespace,
      kmsProviders: {
        local: {
          key: localMasterKeyBuffer
        }
      }
    });

    // 3. Define Standard EDC Data Encryption Keys (DEKs)
    const keysToSeed = [
      { altName: 'dek_study_oncology_101_identity', description: 'Patient Demographics (Randomized AEAD)' },
      { altName: 'dek_subject_mrn', description: 'Medical Record Number (Deterministic AEAD)' },
      { altName: 'dek_study_101_rtsm_blinded', description: 'RTSM Treatment Arm (Blinded AEAD)' }
    ];

    for (const keyDef of keysToSeed) {
      const existing = await collection.findOne({ keyAltNames: keyDef.altName });
      if (existing) {
        console.log(`  ℹ️  Key already exists: ${keyDef.altName} (ID: ${existing._id})`);
        continue;
      }

      const keyId = await clientEncryption.createDataKey('local', {
        keyAltNames: [keyDef.altName]
      });

      // Update regulatory metadata on local DEK
      await collection.updateOne(
        { _id: keyId },
        {
          $set: {
            keyVersion: 1,
            status: 'ACTIVE',
            createdByUserId: 'local_dev_seed',
            creationDate: new Date(),
            description: keyDef.description
          }
        }
      );

      console.log(`  ✅ Generated DEK: ${keyDef.altName} ➔ UUID: ${keyId}`);
    }

    console.log('🎉 Local CSFLE Key Seeding completed successfully!');
  } finally {
    await adminClient.close();
  }
}

seedLocalEncryptionKeys().catch(console.error);
```

---

#### 3.11.4 Local Dev Inspection & Debugging: MongoDB Compass vs. NestJS API

Developers can visually verify that encryption is operating with 100% fidelity using **MongoDB Compass** alongside the **NestJS API**:

##### 1. Direct Inspection in MongoDB Compass (Zero-Knowledge View)
Connect Compass directly to Layer 3 Prod:  
`mongodb://root:prod_secret_pass_2026@localhost:27037/study_oncology_101_prod?authSource=admin`

Navigate to `study_oncology_101_prod.subject_identities`:
```json
{
  "_id": "SUBJ-001",
  "studyId": "study_oncology_101",
  "siteId": "SITE-101",
  "mrn": {
    "$binary": {
      "base64": "AQIDAHh7z...",
      "subType": "06" // ◄── Encrypted Deterministic Ciphertext (Subtype 6)
    }
  },
  "fullName": {
    "$binary": {
      "base64": "BQIDAK12p...",
      "subType": "06" // ◄── Encrypted Randomized AEAD Ciphertext (Subtype 6)
    }
  },
  "status": "ENROLLED" // ◄── Plaintext standard field
}
```
* Notice that the database engine stores only raw binary ciphertext (`subType: 06`). Even when logged into MongoDB as the `root` administrative user, **the data cannot be read in Compass without the application keys**.

##### 2. Application API Inspection (Decrypted Authorized View)
Start the local NestJS dev server (`npm run start:dev`) and query the API via Swagger / curl:

```bash
curl -X GET http://localhost:3000/api/v1/studies/study_oncology_101/subjects/SUBJ-001 \
  -H "Authorization: Bearer <valid_local_jwt>"
```

Response:
```json
{
  "subjectId": "SUBJ-001",
  "mrn": "MRN-984210",
  "fullName": "Jane Doe",
  "status": "ENROLLED"
}
```
* The NestJS application automatically and transparently decrypts the fields in memory before sending the JSON payload over the local HTTP response.

##### 3. Configuring Compass CSFLE In-GUI Decryption (Optional for Developers)
For deep debugging, MongoDB Compass supports client-side decryption natively:
1. In Compass connection screen, click **Advanced Connection Options** ➔ **Field Level Encryption**.
2. Set **KMS Provider** to `local`.
3. Paste the 96-byte Base64 key from `.env.development`.
4. Set **Key Vault Namespace** to `vialiq_control_plane.__keyVault`.
5. Connect. Compass will now decrypt the fields in the GUI on-the-fly!

---

#### 3.11.5 Developer Troubleshooting Guide: Common Local CSFLE Errors

| Error Message | Root Cause | Solution |
|:---|:---|:---|
| `MongoCryptError: crypt_shared library not found` | The dynamic `.dylib` or `.so` is not installed or not in system path. | Download `mongo_crypt_v1.dylib` and copy to `/usr/local/lib/`, or verify `CRYPT_SHARED_LIB_PATH` in `.env`. |
| `MongoCryptError: Master key must be 96 bytes` | The Base64 string does not decode to exactly 96 bytes. | Re-generate using `node -e "console.log(require('crypto').randomBytes(96).toString('base64'))"`. |
| `MongoCryptError: Key vault collection does not exist` | Layer 1 Admin was not seeded. | Boot Layer 1 (`npm run docker:mongo:admin`) and run `npx ts-node scripts/seed-local-encryption-keys.ts`. |
| `MongoCryptError: Decryption failed for keyId...` | The local key used to encrypt the document is different from the key in `.env`. | Run `npm run docker:mongo:clean` and re-seed to start with a fresh local database. |

---

## 4. Pillar 4: Study Decommissioning, 25-Year Archival & Legal Hold

### 4.1 EU CTR Article 58 & 25-Year Retention Mandate
Under **EU Clinical Trials Regulation (EU CTR 536/2014) Article 58**:
> *"The sponsor and the investigator shall keep the clinical trial master file for at least **25 years** after the end of the trial... The content of the clinical trial master file shall be archived in a way that ensures that it is readily available and accessible."*

Retaining 100+ locked study databases on active high-performance NVMe cloud clusters for 25 years is financially unsustainable and introduces unmonitored security exposure.

### 4.2 3-Phase Decommissioning Lifecycle

```
    PHASE 1: STUDY HARD LOCK (Day 0 to Day 90 post-LPLV)
    - Final Study Report signed off.
    - Database set to HARD_LOCK (Read-only on Layer 3 Prod).
    - Biostatistical data export validated.
                     │
                     ▼
    PHASE 2: COMPREHENSIVE ARCHIVAL BUNDLE GENERATION (Day 90 to Day 120)
    - System compiles 4 standard regulatory export artifacts:
      1. CDISC ODM-XML v1.3.2 (Machine-readable full clinical archive).
      2. PDF/A-1b Patient Case Books (Human-readable, immutable eCRFs).
      3. SAS Transport (XPT v5/v8) datasets for biostatistics.
      4. Cryptographic BSON Archive (Bit-for-bit MongoDB backup).
                     │
                     ▼
    PHASE 3: TRANSITION TO 25-YEAR WORM COLD STORAGE & SHUTDOWN
    - Artifacts uploaded to AWS S3 Glacier Object Lock (Compliance Mode).
    - Database dropped from Layer 3 Prod live cluster.
    - Registry updated in Layer 1 Admin (Status: ARCHIVED_WORM).
```

### 4.3 Regulatory Export Package Generation (CDISC ODM-XML & PDF/A)

#### 1. CDISC ODM-XML (Operational Data Model)
The gold standard for regulatory archiving:
- Contains every Form Definition, Clinical Visit, Field Value, Query History, and complete 21 CFR Part 11 Audit Trail in a vendor-neutral XML format.
- Can be imported into any future regulatory platform 20 years later without requiring MongoDB.

#### 2. Searchable PDF/A-1b Patient Case Books
- Generates an individual ISO 19005-1 compliant PDF/A for every subject.
- Each page displays the completed CRF, field changes, timestamps, and embedded cryptographic signatures.
- PDF/A format guarantees visual reproduction integrity across arbitrary operating systems decades into the future.

### 4.4 Write Once Read Many (WORM) Storage & S3 Object Lock

The archival bundle is committed to cloud object storage protected by **S3 Object Lock in Compliance Mode**:

```json
{
  "Bucket": "vialiq-clinical-archives-eu-west-1",
  "Key": "STUDY-ONCOLOGY-101/archive-bundle-final.tar.gz",
  "ObjectLockMode": "COMPLIANCE",
  "ObjectLockRetainUntilDate": "2051-10-18T00:00:00Z"
}
```

> [!CAUTION]
> **COMPLIANCE Mode Protection:** Once S3 Object Lock Compliance Mode is enabled, the archive **CANNOT be deleted or overwritten by ANY user**, including the AWS Root Account or Cloud Administrator, until the 25-year retention date expires.

* **Archival & Legal Hold Governance ([FTS-003 § 4.4](../../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md#44-end-to-end-infrastructure-ownership--execution-matrix)):** S3 Glacier Object Lock buckets (`COMPLIANCE` mode) are provisioned by **Platform SRE** per sovereign region; Final Hard Lock & Archival execution is initiated by **Clinical Data Management / Lead Sponsor** post-LPLV, and **Sponsor Legal Officers** exclusively control `isLegalHold` overrides.

### 4.5 Legal Hold Protection Engine

If a clinical trial becomes subject to patent litigation, regulatory investigation, or product liability disputes:
- An authorized Sponsor Legal Officer applies a **Legal Hold** via the Admin Control Plane (`vialiq_control_plane`).
- When `isLegalHold: true`:
  1. Automated retention purging and study decommissioning jobs are strictly blocked.
  2. The database is frozen from any background compression or deletion.
  3. All system interactions are mirrored to an evidentiary legal discovery log.

---

## 5. Pillar 5: Dynamic Database Connection Pooling & Tenant Routing

### 5.1 The Socket Exhaustion Dilemma in Multi-Tenant Node.js

In a database-per-study architecture housing 100+ active clinical trials:
- If the application initializes a `new MongoClient(uri)` for each study:
  $$\text{Total Connections} = 100\,\text{Studies} \times 100\,\text{Pool Size} = 10,000\,\text{TCP Sockets}$$
- Result: Sockets exhaustion (`EMFILE`), memory exhaustion on the Node.js server, and thread pool starvation on the MongoDB server.

### 5.2 Connection Pool Multiplexing Architecture

MongoDB drivers are engineered to multiplex multiple logical databases over a **single unified connection pool**:

```
                       CONNECTION POOL MULTIPLEXING PATTERN
                       
    HTTP Incoming Requests (NestJS API Worker)
    ├── Request 1 ──► Study Oncology 101 (Cluster 2 - Prod)
    ├── Request 2 ──► Study Cardiology 202 (Cluster 2 - Prod)
    └── Request 3 ──► Study Vaccines 303 (Cluster 2 - Prod)
                               │
                               ▼
        ┌────────────────────────────────────────────────────────┐
        │ SINGLE PERSISTENT MongoClient (Layer 3 Prod)           │
        │ Connection Pool Size: min 20, max 200                  │
        └──────────────────────┬─────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
    prodClient.db(        prodClient.db(        prodClient.db(
      "study_onc_prod"      "study_card_prod"     "study_vac_prod"
    )                     )                     )
```

### 5.3 NestJS Dynamic Database Context Service Implementation

This service is registered as a global singleton, resolving and caching database handles on demand:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

@Injectable()
export class DynamicDatabaseService implements OnModuleInit, OnModuleDestroy {
  private adminClient: MongoClient;
  private devClient: MongoClient;
  private prodClient: MongoClient;

  // In-memory cache for resolved database handles
  private dbCache = new Map<string, Db>();

  async onModuleInit() {
    // 1. Initialize exactly ONE pooled client per physical cluster layer
    this.adminClient = new MongoClient(process.env.MONGO_LAYER1_ADMIN_URI, {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    this.devClient = new MongoClient(process.env.MONGO_LAYER2_DEV_URI, {
      maxPoolSize: 100,
      minPoolSize: 10,
    });

    this.prodClient = new MongoClient(process.env.MONGO_LAYER3_PROD_URI, {
      maxPoolSize: 200,
      minPoolSize: 20,
    });

    await Promise.all([
      this.adminClient.connect(),
      this.devClient.connect(),
      this.prodClient.connect(),
    ]);

    console.log('✅ Connected to all 3 physical MongoDB cluster connection pools.');
  }

  /**
   * Resolves the target study database dynamically over the shared connection pool.
   */
  getStudyDatabase(studyId: string, env: 'dev' | 'uat' | 'prod'): Db {
    const cacheKey = `${env}_${studyId}`;
    if (this.dbCache.has(cacheKey)) {
      return this.dbCache.get(cacheKey)!;
    }

    const dbName = `study_${studyId}_${env}`;
    let client: MongoClient;

    if (env === 'prod') {
      client = this.prodClient;
    } else {
      client = this.devClient; // dev and uat live on Layer 2
    }

    // Dynamic database switching on the existing connection pool (ZERO new sockets created)
    const databaseHandle = client.db(dbName);
    this.dbCache.set(cacheKey, databaseHandle);
    return databaseHandle;
  }

  getControlPlaneDatabase(): Db {
    return this.adminClient.db('vialiq_control_plane');
  }

  async onModuleDestroy() {
    await Promise.all([
      this.adminClient.close(),
      this.devClient.close(),
      this.prodClient.close(),
    ]);
  }
}
```

### 5.4 Connection Lifecycle, Health Checks & Graceful Reconnect

The `DynamicDatabaseService` monitors connection pool health and executes automatic failover:
- **Topology Description Changed Events:** Emits log alerts if a replica set primary changes (e.g. during cloud node maintenance).
- **Socket Idle Timeout:** Set to 45 seconds to discard dead cloud NAT sockets before the OS kernel resets them.
- **Circuit Breaker:** If a cluster layer is unreachable for $>5$ seconds, requests for that layer fail fast with HTTP 503 (`Service Unavailable`), preventing queue backups on healthy layers.

---

## 6. Architectural Summary & Cross-Reference

| Operational Pillar | Regulatory Driver | Primary Technical Asset | Failure Mode Prevented |
|:---|:---|:---|:---|
| **1. Backup & PITR** | 21 CFR §11.10(c) / HIPAA | Continuous Oplog Archiving & S3 Snapshots | Data loss during corruption or disaster; RPO $\le 5$m. |
| **2. Multi-Level Locking** | FDA DBL Guidance / ICH E6 | `study_locks` Schema & Dual-Person Approval | Premature unblinding or unauthorized data modification. |
| **3. Field-Level Encryption** | HIPAA / GDPR Art. 9 & 17 / ICH E6 | Envelope CSFLE / QE & Subject-Level Crypto-Shredding | ePHI data breaches, GDPR non-compliance & trial unblinding. |
| **4. 25-Year Archival** | EU CTR Article 58 | CDISC ODM-XML & S3 WORM Compliance Lock | Storage cost explosion & legal non-compliance. |
| **5. Connection Pooling** | Enterprise SLA | Dynamic Client Multiplexing (`client.db()`) | Node.js socket exhaustion (`EMFILE`) across 100+ DBs. |

---
*End of Operational Database Architecture Specification.*
