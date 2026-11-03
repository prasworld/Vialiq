# EDC Database Architecture & Schema Specification

> **Domain:** Backend Architecture — Database Layer  
> **Status:** Active Specification  
> **Date:** October 15, 2026  
> **Version:** 1.1.0  
> **Related Documents:**
> - [3-Cluster & Flexible Tenancy Architecture](./002-3-cluster-and-flexible-tenancy-architecture.md)
> - [Auth, Identity & Multi-Tenancy Architecture](../../auth-identity-multitenancy-clinical-edc.md)
> - [ADR: Database Selection (SQL Server vs MongoDB)](./001-database-selection-adr.md)
> - [Cluster Setup Guide (Docker & Atlas)](./mongodb-cluster-setup-guide.md)
> - [API Specification & Contracts](../api/api-specification-and-contracts.md)
> - [Form Builder Schema Specification](../../form-builder-schema.md)
> - [Field-Level Encryption Specification](../../field-level-encryption-clinical-edc.md)

---

## 1. Database Topology & Operational Setup

In compliance with **21 CFR Part 11, ICH E6(R3), and GDPR Art. 17**, the Vialiq EDC platform is **ALWAYS structured across 3 distinct MongoDB Atlas clusters** (or isolated local replica sets in development). All clusters run **MongoDB 7.0+** deployed as a minimum 3-node Replica Set (Primary-Secondary-Secondary) to guarantee high availability and support multi-document ACID transactions:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   FOUNDATIONAL 3-CLUSTER PLATFORM TOPOLOGY                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  CLUSTER 0: ADMIN LAYER / CONTROL PLANE                                          │
│  ┌────────────────────────────────────────────────────────────────────────────┐  │
│  │ MongoDB Atlas M10 (HA 3-Node Replica Set, Multi-Region)                    │  │
│  │ ├── tenants (organizations, tenant metadata, Keycloak realm mappings)      │  │
│  │ ├── users (global user identity catalog, credentials managed via Keycloak) │  │
│  │ ├── study_registry (master catalog of all clinical studies)                │  │
│  │ ├── study_user_assignments (user-to-study & site role assignments)         │  │
│  │ └── db_routing_registry (encrypted cluster URIs & database routing maps)   │  │
│  │ ⚠️ ZERO patient records | ZERO form builder schemas                       │  │
│  └────────────────────────────────────────────────────────────────────────────┘  │
│                                      │                                           │
│                 Routes application queries based on 3-Tuple:                     │
│                 [tenantId, studyId, environment: DEV | UAT | PROD]               │
│                                      │                                           │
│         ┌────────────────────────────┴─────────────────────────────┐             │
│         ▼                                                          ▼             │
│  CLUSTER 1: NOT-LIVE STUDY CLUSTER          CLUSTER 2: LIVE / PROD STUDY CLUSTER │
│  ┌─────────────────────────────────────┐    ┌──────────────────────────────────┐ │
│  │ MongoDB Atlas M10 (Replica Set)     │    │ MongoDB Atlas M10/M30 (Replica)  │ │
│  │ ├── study_{id}_dev (Form Builder,   │    │ ├── study_{id}_prod (Production  │ │
│  │ │   Blockly rules, draft schemas)   │    │ │   live EDC, real patient data, │ │
│  │ └── study_{id}_uat (Sponsor dry     │    │ │   sealed protocol manifests,   │ │
│  │     runs, mock test subjects)       │    │ │   21 CFR Part 11 audit trails, │ │
│  │ ⚠️ Zero real clinical patient data  │    │ │   investigator e-signatures)   │ │
│  └─────────────────────────────────────┘    └──────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 3-Cluster Database-per-Study Architecture Principles
1. **Database-per-Study Isolation**:
   - Every clinical study is provisioned into its own dedicated, isolated database namespace (`study_{id}_{env}`).
   - Non-production study databases (`study_{id}_dev`, `study_{id}_uat`) reside strictly on Cluster 1.
   - Live clinical study databases (`study_{id}_prod`) reside strictly on Cluster 2.
   - Eliminates cross-study data contamination by design at the database layer.
2. **Centralized User Management & Control Plane (Cluster 0)**:
   - Centralized authentication, Keycloak realms, user accounts, and study-user-site assignments exist solely in Cluster 0 (`vialiq_control_plane`).
   - Cluster 0 contains zero clinical trial patient data.
3. **Dynamic Connection Routing**:
   - When requests arrive with authenticated clinical user context, connections are resolved dynamically to the study's dedicated database on either Cluster 1 (if DEV/UAT) or Cluster 2 (if PROD).

### 1.2 Local Development Cluster Deployment ($0 Dev Cost)
To enable multi-document ACID transactions and Change Streams during local development without cloud costs, a local 3-node replica set is defined in [`tools/docker/docker-compose.mongo-cluster.yml`](../../tools/docker/docker-compose.mongo-cluster.yml):

```bash
# Start the local 3-node MongoDB Replica Set cluster
docker compose -f tools/docker/docker-compose.mongo-cluster.yml up -d

# Application connection string:
# mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs-edc
```

---

## 2. Collections Overview (Cluster Segregation)

Collections are cleanly partitioned across the 3 clusters:

```
CLUSTER 0: ADMIN LAYER (vialiq_control_plane)
├── tenants                   # Organization metadata, Keycloak realm mapping, tier
├── users                     # Global user profiles, system admin credentials
├── study_registry            # Master study registry, lifecycle status, sponsor ID
├── study_user_assignments    # User-to-study & site-level role bindings
└── db_routing_registry       # Encrypted cluster connection strings & tenancy mode

CLUSTER 1: NOT-LIVE STUDY CLUSTER (study_{studyId}_dev & study_{studyId}_uat)
├── form_definitions          # Draft & WIP CRF schemas (Form Builder designer)
├── rule_definitions          # Draft Blockly logic & JSON Logic edit checks
├── study_protocols           # Draft visit schedules, arm configurations, site mappings
├── subject_enrollments       # Mock/synthetic test patients for sponsor dry-runs
└── crf_entries               # Mock form responses for UAT validation

CLUSTER 2: LIVE / PROD STUDY CLUSTER (study_{studyId}_prod)
├── study_protocols           # Sealed, versioned protocol definition and site configurations
├── form_definitions          # Published, immutable CRF templates (status: ACTIVE / SUPERSEDED)
├── subject_enrollments       # Real screened and enrolled patient records
├── crf_entries               # Audited patient clinical data captured across visits
├── audit_trail               # Immutable 21 CFR Part 11 append-only chronological ledger
├── clinical_queries          # Discrepancy management (system edit checks & monitor queries)
└── electronic_signatures     # Investigator/CRA formal sign-offs (double authentication)
```

---

## 3. Detailed Collection Schemas

### 3.1 `form_definitions` Collection
Stores form schemas published from the Form Builder (matching `FormSchema` from `@vialiq/form-builder`):

```typescript
export interface FormDefinitionDocument {
  _id: string; // "form_def_" + UUID
  tenantId: string;
  studyId: string;
  formKey: string; // e.g. "VITAL_SIGNS", "DEMO", "ADVERSE_EVENTS"
  version: number; // Monotonically incrementing: 1, 2, 3...
  status: 'DRAFT' | 'ACTIVE' | 'SUPERSEDED' | 'RETIRED';
  title: string;
  description?: string;
  display: 'form' | 'wizard' | 'pdf';
  
  /** Component tree matching @vialiq/form-builder BaseComponentSchema[] */
  components: Array<Record<string, unknown>>;
  
  /** CDISC ODM-XML mapping metadata */
  cdiscMapping?: {
    itemGroupDefOid: string;
    domain: string; // e.g. "VS", "AE", "DM"
  };

  /** Form-level validation rules & edit checks (JSON Logic) */
  validationRules?: Array<{
    id: string;
    description: string;
    severity: 'ERROR' | 'WARNING';
    rule: Record<string, unknown>; // JSON Logic AST
    targetFieldKey: string;
    errorMessage: string;
  }>;

  effectiveDate: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

*Indexes:*
```javascript
db.form_definitions.createIndex({ studyId: 1, formKey: 1, version: -1 }, { unique: true });
db.form_definitions.createIndex({ studyId: 1, status: 1 });
```

---

### 3.2 `crf_entries` Collection
Stores captured patient data for a specific subject visit. Form values are stored in a flexible dictionary keyed by field identifier:

```typescript
export interface CrfEntryDocument {
  _id: string; // "crf_" + UUID
  tenantId: string;
  studyId: string;
  siteId: string;
  subjectId: string;
  visitId: string; // e.g. "VISIT_SCREENING", "VISIT_WEEK_4"
  formDefinitionId: string; // References form_definitions._id
  formKey: string;
  formVersion: number;
  
  /** Current state in the clinical review lifecycle */
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SIGNED' | 'LOCKED';
  
  /** Captured field values: { [fieldKey: string]: any } */
  data: Record<string, unknown>;

  /** Field keys protected by Field-Level Encryption */
  encryptedFields?: string[];

  /** Concurrency control & review locks */
  lockStatus: {
    isLocked: boolean;
    lockedBy?: string; // userId
    lockedAt?: Date;
    reason?: 'MONITOR_REVIEW' | 'DATABASE_FREEZE' | 'EDIT_IN_PROGRESS';
  };

  /** Source Data Verification (SDV) & Queries */
  sdvStatus: 'NOT_SDVED' | 'PARTIALLY_SDVED' | 'SDVED';
  openQueryCount: number;

  lastSavedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

*Indexes:*
```javascript
db.crf_entries.createIndex(
  { studyId: 1, siteId: 1, subjectId: 1, visitId: 1, formKey: 1 },
  { unique: true }
);
db.crf_entries.createIndex({ studyId: 1, status: 1 });
db.crf_entries.createIndex({ studyId: 1, openQueryCount: 1 });
```

---

### 3.3 `audit_trail` Collection (21 CFR Part 11 Compliant)
An immutable, append-only chronological log of all changes.

```typescript
export interface AuditTrailDocument {
  _id: string; // "audit_" + UUID
  tenantId: string;
  studyId: string;
  siteId: string;
  subjectId?: string;
  entityType: 'CRF_ENTRY' | 'QUERY' | 'SUBJECT' | 'SIGNATURE' | 'FORM_DEF';
  entityId: string;
  
  action: 'CREATE' | 'UPDATE' | 'QUERY_OPEN' | 'QUERY_CLOSE' | 'SIGN' | 'LOCK' | 'UNLOCK';
  
  /** Field-specific modification details */
  fieldKey?: string;
  oldValue: unknown; // null for newly initialized fields
  newValue: unknown;
  
  /** Mandatory Reason for Change (21 CFR Part 11 § 11.10(e)) */
  reasonForChange: string;
  
  /** Cryptographic chaining for tamper evidence (ALCOA+) */
  previousHash: string; // SHA-256 of the previous audit record for this entity
  recordHash: string;   // SHA-256(previousHash + timestamp + userId + oldValue + newValue + reason)

  /** User Execution Context */
  userContext: {
    userId: string;
    fullName: string;
    role: 'CRC' | 'CRA' | 'PI' | 'DM' | 'SYSTEM';
    ipAddress: string;
    userAgent: string;
  };

  timestamp: Date;
}
```

*Indexes:*
```javascript
db.audit_trail.createIndex({ entityId: 1, timestamp: -1 });
db.audit_trail.createIndex({ studyId: 1, subjectId: 1, timestamp: -1 });
db.audit_trail.createIndex({ studyId: 1, "userContext.userId": 1 });
```

> [!IMPORTANT]
> **Database Role Permissions**:
> The application database user must ONLY be granted `read` and `insert` permissions on `audit_trail`. `update` and `delete` permissions are revoked at the MongoDB role level.

---

### 3.4 `clinical_queries` Collection (Discrepancy Workflow)
Tracks data discrepancies, queries raised by automated edit checks or human reviewers (CRA/DM), and their resolutions.

```typescript
export interface ClinicalQueryDocument {
  _id: string; // "query_" + UUID
  tenantId: string;
  studyId: string;
  siteId: string;
  subjectId: string;
  crfEntryId: string;
  fieldKey: string;
  
  type: 'AUTO_SYSTEM' | 'MANUAL_CRA' | 'MANUAL_DM';
  status: 'OPEN' | 'ANSWERED' | 'CLOSED' | 'CANCELLED';
  
  queryText: string;
  suggestedAction?: string;
  
  /** Discussion thread */
  thread: Array<{
    authorId: string;
    authorRole: string;
    message: string;
    timestamp: Date;
  }>;

  openedBy: string;
  openedAt: Date;
  answeredBy?: string;
  answeredAt?: Date;
  closedBy?: string;
  closedAt?: Date;
}
```

*Indexes:*
```javascript
db.clinical_queries.createIndex({ studyId: 1, status: 1 });
db.clinical_queries.createIndex({ crfEntryId: 1, fieldKey: 1, status: 1 });
```

---

### 3.5 `electronic_signatures` Collection
Captures formal 21 CFR Part 11 signatures (requiring password + signature intent PIN verification).

```typescript
export interface ElectronicSignatureDocument {
  _id: string; // "sig_" + UUID
  tenantId: string;
  studyId: string;
  siteId: string;
  subjectId: string;
  crfEntryId: string;
  
  signerId: string;
  signerFullName: string;
  signerRole: 'INVESTIGATOR' | 'SUB_INVESTIGATOR' | 'SPONSOR_REPRESENTATIVE';
  meaning: 'AUTHORSHIP' | 'APPROVAL' | 'REVIEW' | 'VERIFICATION';
  
  /** Cryptographic manifestation */
  formSnapshotHash: string; // SHA-256 of the exact CRF data at the moment of signing
  signatureManifest: string; // Formatted legal text embedded in exports
  
  signedAt: Date;
  clientIp: string;
}
```

*Indexes:*
```javascript
db.electronic_signatures.createIndex({ crfEntryId: 1, signedAt: -1 });
db.electronic_signatures.createIndex({ studyId: 1, subjectId: 1 });
```

---

## 4. Multi-Document ACID Transactions

Whenever clinical data is submitted, multiple collection updates must be committed atomically:

```typescript
export async function submitCrfDataTransaction(
  mongoClient: MongoClient,
  crfId: string,
  newValues: Record<string, unknown>,
  reasonForChange: string,
  user: UserContext
): Promise<void> {
  const session = mongoClient.startSession();
  
  try {
    await session.withTransaction(async () => {
      const db = mongoClient.db('vialiq_edc');

      // 1. Fetch current CRF and verify lock status
      const existing = await db.collection<CrfEntryDocument>('crf_entries')
        .findOne({ _id: crfId }, { session });
      
      if (!existing) throw new NotFoundException('CRF record not found');
      if (existing.lockStatus?.isLocked && existing.lockStatus.lockedBy !== user.userId) {
        throw new ConflictException('Form is locked by another reviewer');
      }

      // 2. Compute field diffs and append audit trail
      const diffs = computeFieldDiffs(existing.data, newValues);
      let latestHash = await getLatestAuditHash(db, crfId, session);

      for (const diff of diffs) {
        const auditRecord: AuditTrailDocument = {
          _id: `audit_${crypto.randomUUID()}`,
          tenantId: existing.tenantId,
          studyId: existing.studyId,
          siteId: existing.siteId,
          subjectId: existing.subjectId,
          entityType: 'CRF_ENTRY',
          entityId: crfId,
          action: 'UPDATE',
          fieldKey: diff.fieldKey,
          oldValue: diff.oldValue,
          newValue: diff.newValue,
          reasonForChange,
          previousHash: latestHash,
          recordHash: computeRecordHash(latestHash, diff, reasonForChange, user),
          userContext: user,
          timestamp: new Date()
        };

        await db.collection('audit_trail').insertOne(auditRecord, { session });
        latestHash = auditRecord.recordHash;
      }

      // 3. Commit updated CRF entry
      await db.collection('crf_entries').updateOne(
        { _id: crfId },
        {
          $set: {
            data: newValues,
            status: 'COMPLETED',
            lastSavedBy: user.userId,
            updatedAt: new Date()
          }
        },
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
}
```

---

## 5. Field-Level Encryption (FLE) & Key Vault

To reconcile **GDPR Art. 17 (Right to Erasure)** with **21 CFR Part 11 (Audit Trail Immutability)**:
1. Subject PHI fields (e.g. Initials, Date of Birth) are encrypted using **AES-256-GCM envelope encryption** before write.
2. Each subject possesses a unique **Data Encryption Key (DEK)** encrypted with a master Key Encryption Key (KEK) stored in AWS KMS or Azure Key Vault.
3. If a patient revokes consent under GDPR, their DEK is destroyed (**Crypto-Shredding**). The ciphertext in MongoDB and audit logs becomes permanent noise, satisfying GDPR erasure while preserving the structural integrity and hash-chain validity of the trial database.

---

## 6. Asynchronous Tabular Projection (CDISC / SDTM)

For biostatisticians and CDISC SDTM exports:
- A NestJS background projection service listens to MongoDB **Change Streams** on `crf_entries`.
- Form payloads are unpacked and inserted into a normalized relational schema (PostgreSQL or SQL Server) mapped to CDISC domains (`DM`, `VS`, `AE`, `LB`).
- This decouples complex statistical analytical queries from the high-throughput operational data entry cluster.
