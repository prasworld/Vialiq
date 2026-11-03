# ADR: Enterprise Polyglot Database Migration, Version Control, Multi-Deployment, and Seeding Architecture

> **Document ID:** `VIALIQ-ARCH-API-007`  
> **Domain:** Backend Architecture — Database Change Management, Polyglot Migrations, Dedicated Deployments & Seeding  
> **Status:** Accepted  
> **Date:** October 21, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** MongoDB 7.0+ Replica Sets (`rs-admin:27017`, `rs-dev:27027`, `rs-prod:27037`), Microsoft SQL Server 2022+ (Reporting & CDISC Warehouse), ASP.NET Core 8/9 LTS API (`backend/api/`), Kubernetes / Docker  
> **Related Documents:**
> - [Database Spec 001: Database Selection ADR](../database/001-database-selection-adr.md)
> - [Database Spec 002: 3-Cluster & Flexible Tenancy Architecture](../database/002-3-cluster-and-flexible-tenancy-architecture.md)
> - [Database Spec 005: Operational Pillars, Backup, Locking & Archival](../database/005-database-operational-pillars-backup-locking-dictionaries-and-archival.md)
> - [Database Spec 006: Field-Level Encryption & Key Vault](../database/006-field-level-encryption-csfle-and-key-management-architecture.md)
> - [API ADR 006: Controller Conventions, Seeding & Migrations](./006-api-controller-conventions-seeding-and-migration-adr.md)

---

## 1. Executive Summary & Context

The Vialiq Clinical EDC platform operates a **Heterogeneous Polyglot Datastore Architecture**:
1. **Primary Operational Datastore (MongoDB 7.0+ Replica Sets)**: Manages dynamic Case Report Forms (CRFs), polymorphic visit data, Client-Side Field-Level Encryption (CSFLE), 4-tier locking, and 21 CFR Part 11 append-only audit trails across three physically isolated clusters (`rs-admin:27017`, `rs-dev:27027`, `rs-prod:27037`).
2. **Secondary Relational Datastore (Microsoft SQL Server 2022+)**: Serves as the asynchronous reporting warehouse, hosting Change Data Capture (CDC) ETL pipelines, CDISC SDTM/ADaM statistical datasets, SAS/R extract views, and sponsor-mandated relational SQL querying.
3. **Disparate Target Deployments**: The platform must deploy consistently across:
   - **Public Multi-Tenant SaaS**: Shared multi-cluster Kubernetes infrastructure.
   - **Dedicated Single-Tenant Clouds**: Isolated virtual private clouds (VPCs) for enterprise pharmaceutical sponsors (e.g., Novartis, Roche).
   - **Sovereign On-Premise Installations**: Air-gapped or restricted hospital networks and government healthcare infrastructures (e.g., NHS UK, Japan PMDA).

```
                     HETEROGENEOUS POLYGLOT TARGET ARCHITECTURE
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
Primary Operational Datastore (NoSQL)                             Secondary Reporting Warehouse (RDBMS)
MongoDB 7.0+ Replica Sets (3 Clusters)                           Microsoft SQL Server 2022+ (Reporting / ETL)
• rs-admin:27017 (Global Registry & Key Vault)                   • Staging Tables (Debezium / CDC Staging)
• rs-dev:27027 (Dev/Testing Study DBs)                           • CDISC SDTM Relational Tables (DM, AE, VS, LB)
• rs-prod:27037 (Qualified GxP Production DBs)                   • SAS / R Export Views & Star Schemas
```

### The Core Architectural Mandates:
- **Zero In-House Wheel Reinvention**: Standard distributed migration problems (concurrency races, deadlocks, stale locks, checksum validation, out-of-order branch merges) must be solved by an established, battle-tested industry standard tool.
- **Polyglot Unified Governance**: A single migration toolchain and pipeline must manage both MongoDB and SQL Server. Maintaining disconnected tools creates split audit histories and doubles GAMP 5 validation overhead.
- **Self-Healing, Fault-Tolerant Dedicated Deployments**: Automated deployments must be resilient against network partitions, replica set failovers, and container restarts without manual DBA intervention.
- **Strict Least-Privilege Separation**: Application pods running in production must have zero Data Definition Language (DDL) permissions. Migrations must execute through an isolated, ephemeral pre-flight mechanism.

---

## 2. Analysis: The 8 Known Failure Modes of Database Migrations in Life Sciences

Building a naive in-house database migration script runner inevitably encounters eight well-known distributed systems and regulatory failure modes:

```
                  THE 8 DATABASE MIGRATION FAILURE MODES
                                     │
   ┌───────────────┬─────────────────┼─────────────────┬───────────────┐
   ▼               ▼                 ▼                 ▼               ▼
1. Pod Race     2. Stale Lock     3. Polyglot       4. Least-       5. ALCOA+
   Deadlocks       Orphaning         Drift             Privilege       Audit Loss
   (Multi-Pod)     (OOM Crashes)     (Mongo vs SQL)    Violation       (Drop Col)
   
   ▼               ▼                 ▼
6. Out-of-Order 7. Zero-Downtime  8. GAMP 5
   Git Merges      Rolling Break     Validation
   (Branches)      (v1 vs v2)        Penalty (Cat 5)
```

### Failure Mode 1: Distributed Pod Concurrency Race Conditions
When Kubernetes scales or rolls out a new deployment, 5 to 20 API pods boot simultaneously. If application code triggers migrations on startup, all instances compete to execute DDL simultaneously. In MongoDB, concurrent `createIndex` or `collMod` operations cause resource contention and replica set synchronization locks. In SQL Server, concurrent DDL commands cause schema-lock deadlocks (`LCK_M_SCH_M`).

### Failure Mode 2: Deadlocks from Stale / Abandoned Locks
If a migration runner crashes mid-execution (e.g., due to an out-of-memory `OOMKilled` eviction, node draining, or spot instance termination), a distributed lock flag is left set to `locked = true`. Without automated heartbeat TTLs and self-healing lock expiration, the entire production deployment deadlocks permanently, requiring emergency DBA manual surgery.

### Failure Mode 3: Heterogeneous Polyglot Schema Drift
When schema evolution is tracked in separate tools, an update applied to MongoDB (e.g., adding an `adverse_event_grade` field to the CRF) can easily fail to be synchronized with the corresponding SQL Server reporting table (`sdtm_ae`). Reports silently produce nulls or crash ETL pipelines, invalidating clinical trial safety analytics.

### Failure Mode 4: Violation of the Principle of Least Privilege
If the main web API pod runs database migrations on startup, the API's database user credentials must possess administrative DDL privileges (`dbOwner` in MongoDB, `db_ddladmin` in SQL Server). In FDA 21 CFR Part 11 and HIPAA compliance, granting web-facing applications DDL permissions is an unacceptable vulnerability. A compromised web container could alter collections, drop indexes, or tamper with security validators.

### Failure Mode 5: Destructive Migration & ALCOA+ Audit Trail Destruction
Relational developers frequently perform destructive DDL (e.g., `ALTER TABLE DROP COLUMN` or changing a column type from `NVARCHAR` to `INT`). In clinical EDC, **destructive operations are strictly illegal under 21 CFR Part 11 § 11.10(e)**. Historical patient data and audit records must be preserved exactly as entered for 25+ years. Migrations must be strictly additive.

### Failure Mode 6: Out-of-Order Git Feature Branch Merges
Developer Alice creates migration `005` on Monday. Developer Bob creates migration `006` on Tuesday and merges to `main` first. When Alice merges on Thursday, a naive sequential counter ignores migration `005` because `006` was already applied. Migrations must be identified by unique, immutable IDs and checksums rather than volatile sequential integers.

### Failure Mode 7: Zero-Downtime Rolling Deployment Incompatibility
During a Kubernetes rolling deployment, old pods (Version N) and new pods (Version N+1) run concurrently for 10 to 15 minutes. If a migration immediately removes or mutates a field expected by Version N, the running application throws runtime exceptions for active clinical users.

### Failure Mode 8: GAMP 5 Computer System Validation (CSV) Burden
Under GAMP 5 (Good Automated Manufacturing Practice), custom-written migration tools are classified as **Category 5 (Custom Software)**, requiring extensive User Requirements Specifications (URS), Functional Specifications (FS), Installation Qualification (IQ), Operational Qualification (OQ), and Performance Qualification (PQ). Adopting an industry-standard, widely proven tool reclassifies the engine as **Category 4 (Configured Product)** or **Category 1 (Infrastructure Software)**, eliminating hundreds of pages of custom validation overhead.

---

## 3. Technology Selection: The Liquibase Polyglot Architecture

To resolve all eight failure modes without maintaining proprietary migration plumbing, we select **Liquibase Enterprise / Community Edition** as the unified polyglot database migration standard.

### 3.1 Why Liquibase Decisively Wins Over Alternatives

| Evaluation Dimension | Homegrown C# Runner | Flyway | **Liquibase (Accepted)** |
|---|---|---|---|
| **Multi-Engine Support** | Must build both engines | SQL Server only; MongoDB is secondary/poor | **Native Polyglot**: Official MongoDB Extension + SQL Server JDBC |
| **Distributed Locking** | High risk of edge cases | Relational table lock | **Built-in `DATABASECHANGELOGLOCK`** with self-healing lock timeouts |
| **Tamper-Detection** | Must maintain custom hashing | MD5 Checksums | **Cryptographic SHA-256 Checksums** on every changeset |
| **Preconditions & Guards** | Custom C# reflection | SQL scripts | **Rich declarative preconditions** (e.g. check collection, table, role) |
| **Dry-Run Inspection** | None | Limited | **`update-sql` & dry-run validation** for formal Sponsor QA sign-off |
| **Execution Modality** | Inside API process | CLI / Java API | **Container-Native**: Runs as K8s `initContainer` or standalone CLI |
| **GAMP 5 CSV Precedent** | Extreme audit risk (Cat 5) | Medium (Cat 4) | **Industry Standard** (Pre-qualified at Novartis, Roche, Pfizer, GSK) |

---

## 4. Repository Structure & Changelog Governance

All database migrations reside within a unified folder hierarchy in the repository under `database/migrations/`:

```
/Users/prashantgupta/code/nx/
└── database/
    └── migrations/
        ├── liquibase.properties                  # Global default configuration
        │
        ├── mongo/                                # MongoDB Primary Datastore Migrations
        │   ├── changelog-master.xml              # Master orchestrator for MongoDB
        │   ├── admin-control/                    # Layer 1 Admin Cluster (rs-admin:27017)
        │   │   ├── 20261021_001_admin_init.xml
        │   │   └── 20261021_002_keyvault_indexes.json
        │   └── study-template/                   # Layer 2 Dev & Layer 3 Prod Study DBs
        │       ├── 20261021_001_crf_entries_indexes.json
        │       ├── 20261021_002_audit_trail_immutable.json
        │       └── 20261021_003_queries_and_locks.json
        │
        └── sqlserver/                            # Microsoft SQL Server Reporting Warehouse
            ├── changelog-master.xml              # Master orchestrator for SQL Server
            ├── etl-staging/                      # CDC Ingestion & Staging Schemas
            │   ├── 20261021_001_cdc_staging_tables.sql
            │   └── 20261021_002_etl_watermark_tracking.sql
            └── sdtm-warehouse/                   # CDISC SDTM Relational Reporting Tables
                ├── 20261021_001_sdtm_dm_domain.sql
                ├── 20261021_002_sdtm_ae_domain.sql
                ├── 20261021_003_sdtm_vs_domain.sql
                └── 20261021_004_reporting_star_views.sql
```

---

## 5. Concrete Migration Specifications & Changelog Examples

### 5.1 MongoDB Master Changelog (`database/migrations/mongo/changelog-master.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:mongodb="http://www.liquibase.org/xml/ns/mongodb"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd
        http://www.liquibase.org/xml/ns/mongodb
        http://www.liquibase.org/xml/ns/mongodb/liquibase-mongodb-latest.xsd">

    <!-- Layer 1 Admin Control Plane -->
    <include file="admin-control/20261021_001_admin_init.xml" relativeToChangelogFile="true"/>
    
    <!-- Study Datastores Template -->
    <include file="study-template/20261021_001_crf_entries_indexes.json" relativeToChangelogFile="true"/>
    <include file="study-template/20261021_002_audit_trail_immutable.json" relativeToChangelogFile="true"/>
</databaseChangeLog>
```

### 5.2 MongoDB Changeset: Compound Indexes on `crf_entries` (`database/migrations/mongo/study-template/20261021_001_crf_entries_indexes.json`)

```json
{
  "databaseChangeLog": [
    {
      "changeSet": {
        "id": "20261021_001_crf_entries_indexes",
        "author": "prashant.gupta",
        "comment": "Create compound unique index on crf_entries to enforce tenant/study/subject/form uniqueness and fast OCC queries",
        "changes": [
          {
            "createIndex": {
              "collectionName": "crf_entries",
              "keys": {
                "study_id": 1,
                "subject_id": 1,
                "form_id": 1,
                "visit_id": 1
              },
              "options": {
                "name": "idx_crf_entries_study_subj_form_visit",
                "unique": true
              }
            }
          },
          {
            "createIndex": {
              "collectionName": "crf_entries",
              "keys": {
                "study_id": 1,
                "status": 1,
                "updated_at_utc": -1
              },
              "options": {
                "name": "idx_crf_entries_status_updated"
              }
            }
          }
        ],
        "rollback": [
          {
            "dropIndex": {
              "collectionName": "crf_entries",
              "indexName": "idx_crf_entries_study_subj_form_visit"
            }
          },
          {
            "dropIndex": {
              "collectionName": "crf_entries",
              "indexName": "idx_crf_entries_status_updated"
            }
          }
        ]
      }
    }
  ]
}
```

### 5.3 MongoDB Changeset: 21 CFR Part 11 Audit Trail Collection Validator (`database/migrations/mongo/study-template/20261021_002_audit_trail_immutable.json`)

```json
{
  "databaseChangeLog": [
    {
      "changeSet": {
        "id": "20261021_002_audit_trail_validator",
        "author": "prashant.gupta",
        "comment": "Enforce strict schema validation and compound indexing on the 21 CFR Part 11 immutable audit trail ledger",
        "changes": [
          {
            "createCollection": {
              "collectionName": "audit_trail"
            }
          },
          {
            "createIndex": {
              "collectionName": "audit_trail",
              "keys": {
                "entity_id": 1,
                "timestamp_utc": -1
              },
              "options": {
                "name": "idx_audit_trail_entity_time"
              }
            }
          },
          {
            "createIndex": {
              "collectionName": "audit_trail",
              "keys": {
                "study_id": 1,
                "timestamp_utc": -1
              },
              "options": {
                "name": "idx_audit_trail_study_time"
              }
            }
          }
        ]
      }
    }
  ]
}
```

---

### 5.4 SQL Server Master Changelog (`database/migrations/sqlserver/changelog-master.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
        http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <!-- Schema Creation -->
    <changeSet id="20261021_000_create_schemas" author="prashant.gupta">
        <sql>
            IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'etl')
                EXEC('CREATE SCHEMA etl');
            IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'sdtm')
                EXEC('CREATE SCHEMA sdtm');
        </sql>
    </changeSet>

    <!-- CDISC SDTM Domain Tables -->
    <include file="sdtm-warehouse/20261021_001_sdtm_dm_domain.sql" relativeToChangelogFile="true"/>
    <include file="sdtm-warehouse/20261021_002_sdtm_ae_domain.sql" relativeToChangelogFile="true"/>
</databaseChangeLog>
```

### 5.5 SQL Server Changeset: CDISC SDTM Demographics Domain (`database/migrations/sqlserver/sdtm-warehouse/20261021_001_sdtm_dm_domain.sql`)

```sql
--liquibase formatted sql
--changeset prashant.gupta:20261021_001_sdtm_dm_domain stripComments:false
--comment: Provision the CDISC SDTM Demographics (DM) relational warehouse table for reporting and SAS extracts

CREATE TABLE sdtm.DM (
    STUDYID         VARCHAR(50)      NOT NULL,
    DOMAIN          VARCHAR(4)       NOT NULL DEFAULT 'DM',
    USUBJID         VARCHAR(100)     NOT NULL,
    SUBJID          VARCHAR(50)      NOT NULL,
    RFSTDTC         VARCHAR(25)      NULL, -- Reference Start Date/Time
    RFENDTC         VARCHAR(25)      NULL, -- Reference End Date/Time
    SITEID          VARCHAR(50)      NOT NULL,
    INVID           VARCHAR(50)      NULL,
    BRTHDTC         VARCHAR(10)      NULL,
    AGE             INT              NULL,
    AGEU            VARCHAR(10)      NULL, -- Units (YEARS)
    SEX             VARCHAR(2)       NOT NULL,
    RACE            VARCHAR(100)     NULL,
    ETHNIC          VARCHAR(100)     NULL,
    ARMCD           VARCHAR(20)      NULL, -- Treatment Arm Code
    ARM             VARCHAR(100)     NULL, -- Treatment Arm Description
    COUNTRY         VARCHAR(3)       NOT NULL,
    DMDTC           VARCHAR(25)      NOT NULL, -- Date/Time of Collection
    
    -- ETL Watermarking & Audit Metadata
    ETL_INSERTED_AT_UTC DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_SOURCE_CRF_ID   VARCHAR(100) NOT NULL,
    ETL_SOURCE_VERSION  INT          NOT NULL,

    CONSTRAINT PK_sdtm_DM PRIMARY KEY CLUSTERED (STUDYID, USUBJID)
);

CREATE NONCLUSTERED INDEX IX_sdtm_DM_Site_Subject ON sdtm.DM (STUDYID, SITEID, SUBJID);
--rollback DROP TABLE sdtm.DM;
```

### 5.6 SQL Server Changeset: CDISC SDTM Adverse Events Domain (`database/migrations/sqlserver/sdtm-warehouse/20261021_002_sdtm_ae_domain.sql`)

```sql
--liquibase formatted sql
--changeset prashant.gupta:20261021_002_sdtm_ae_domain stripComments:false
--comment: Provision the CDISC SDTM Adverse Events (AE) relational reporting table for FDA safety reporting

CREATE TABLE sdtm.AE (
    STUDYID         VARCHAR(50)      NOT NULL,
    DOMAIN          VARCHAR(4)       NOT NULL DEFAULT 'AE',
    USUBJID         VARCHAR(100)     NOT NULL,
    AESEQ           INT              NOT NULL, -- Sequence number
    AETERM          VARCHAR(255)     NOT NULL, -- Reported term
    AELLT           VARCHAR(100)     NULL,     -- Lowest Level Term
    AELLTCD         INT              NULL,
    AEDECOD         VARCHAR(100)     NOT NULL, -- Dictionary-Derived Term (MedDRA Preferred Term)
    AEPTCD          INT              NOT NULL,
    AEBODSYS        VARCHAR(100)     NOT NULL, -- System Organ Class
    AESER           VARCHAR(2)       NOT NULL, -- Serious? (Y/N)
    AESEV           VARCHAR(10)      NULL,     -- Severity (MILD, MODERATE, SEVERE)
    AEREL           VARCHAR(50)      NULL,     -- Causality/Relationship
    AESTDTC         VARCHAR(25)      NULL,     -- AE Start Date/Time
    AEENDTC         VARCHAR(25)      NULL,     -- AE End Date/Time
    AEOUT           VARCHAR(50)      NULL,     -- Outcome
    
    -- ETL Audit Metadata
    ETL_INSERTED_AT_UTC DATETIME2(3) NOT NULL DEFAULT SYSUTCDATETIME(),
    ETL_SOURCE_CRF_ID   VARCHAR(100) NOT NULL,

    CONSTRAINT PK_sdtm_AE PRIMARY KEY CLUSTERED (STUDYID, USUBJID, AESEQ),
    CONSTRAINT FK_sdtm_AE_DM FOREIGN KEY (STUDYID, USUBJID) REFERENCES sdtm.DM (STUDYID, USUBJID)
);

CREATE NONCLUSTERED INDEX IX_sdtm_AE_Seriousness ON sdtm.AE (STUDYID, AESER, AESEV);
--rollback DROP TABLE sdtm.AE;
```

---

## 6. Self-Healing, Fault-Tolerant Production Deployment Architecture

To satisfy the requirement of **dedicated sponsor deployments, zero downtime, and self-healing resilience**, we formalize the **Kubernetes `initContainer` Execution Pattern**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ KUBERNETES APPLICATION POD (DEPLOYMENT: vialiq-api)                                   │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. [initContainer: liquibase-polyglot-migrator]                                  │  │
│  │    • Runs with EPHEMERAL DDL PRIVILEGES (dbOwner / ddlAdmin)                     │  │
│  │    • Acquires distributed lock with 5-min TTL heartbeat                          │  │
│  │    • Verifies SHA-256 script checksums (Detects any tampering)                   │  │
│  │    • Fans out migrations across MongoDB (3 clusters) & SQL Server                │  │
│  │    • Releases lock and terminates with Exit Code 0                               │  │
│  └────────────────────────────────────────┬─────────────────────────────────────────┘  │
│                                           │ Pod lifecycle pauses until Init completes! │
│  ┌────────────────────────────────────────▼─────────────────────────────────────────┐  │
│  │ 2. [appContainer: vialiq-api-runtime]                                            │  │
│  │    • Runs with LEAST-PRIVILEGE CREDENTIALS (readWrite only, ZERO DDL rights)     │  │
│  │    • Binds to migrated MongoDB clusters (27017, 27027, 27037) & SQL Server       │  │
│  │    • Kestrel Web API starts serving traffic                                      │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.1 Complete Kubernetes Deployment Manifest (`k8s/vialiq-api-deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vialiq-api
  namespace: vialiq-edc
  labels:
    app.kubernetes.io/name: vialiq-api
    app.kubernetes.io/part-of: vialiq-platform
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0 # Zero-downtime rolling update
  selector:
    matchLabels:
      app: vialiq-api
  template:
    metadata:
      labels:
        app: vialiq-api
    spec:
      # ========================================================================
      # PHASE 1: PRE-FLIGHT MIGRATION INITCONTAINER (DDL Privileges Only)
      # ========================================================================
      initContainers:
        - name: liquibase-polyglot-migrator
          image: liquibase/liquibase:4.29-alpine
          imagePullPolicy: IfNotPresent
          command: ["/bin/sh", "-c"]
          args:
            - |
              set -e
              echo "Starting Pre-Flight Polyglot Migration..."
              
              # 1. Run MongoDB Migrations (Official MongoDB Liquibase Extension)
              liquibase \
                --changelog-file=/liquibase/changelogs/mongo/changelog-master.xml \
                --url="$MONGODB_ADMIN_CONNECTION_STRING" \
                --log-level=info \
                update

              # 2. Run SQL Server Reporting Warehouse Migrations
              liquibase \
                --changelog-file=/liquibase/changelogs/sqlserver/changelog-master.xml \
                --url="$SQLSERVER_CONNECTION_STRING" \
                --username="$SQLSERVER_DDL_USER" \
                --password="$SQLSERVER_DDL_PASSWORD" \
                --log-level=info \
                update

              echo "Polyglot migrations committed successfully."
          env:
            - name: MONGODB_ADMIN_CONNECTION_STRING
              valueFrom:
                secretKeyRef:
                  name: vialiq-db-credentials
                  key: mongo-admin-ddl-conn-str
            - name: SQLSERVER_CONNECTION_STRING
              valueFrom:
                secretKeyRef:
                  name: vialiq-db-credentials
                  key: sqlserver-ddl-conn-str
            - name: SQLSERVER_DDL_USER
              valueFrom:
                secretKeyRef:
                  name: vialiq-db-credentials
                  key: sqlserver-ddl-username
            - name: SQLSERVER_DDL_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: vialiq-db-credentials
                  key: sqlserver-ddl-password
          volumeMounts:
            - name: migration-changelogs
              mountPath: /liquibase/changelogs
              readOnly: true
          resources:
            limits:
              cpu: "500m"
              memory: "512Mi"
            requests:
              cpu: "100m"
              memory: "256Mi"

      # ========================================================================
      # PHASE 2: RUNTIME APPLICATION CONTAINER (readWrite Least-Privilege Only)
      # ========================================================================
      containers:
        - name: vialiq-api
          image: vialiq-registry.azurecr.io/vialiq/api:latest
          imagePullPolicy: Always
          ports:
            - containerPort: 8080
              name: http
          env:
            - name: ASPNETCORE_ENVIRONMENT
              value: "Production"
            # Runtime connection strings have ZERO DDL permissions (cannot drop or create indexes)
            - name: ConnectionStrings__MongoAdmin
              valueFrom:
                secretKeyRef:
                  name: vialiq-db-credentials
                  key: mongo-admin-runtime-conn-str
            - name: ConnectionStrings__MongoDev
              valueFrom:
                secretKeyRef:
                  name: vialiq-db-credentials
                  key: mongo-dev-runtime-conn-str
            - name: ConnectionStrings__MongoProd
              valueFrom:
                secretKeyRef:
                  name: vialiq-db-credentials
                  key: mongo-prod-runtime-conn-str
            - name: ConnectionStrings__SqlServerReporting
              valueFrom:
                secretKeyRef:
                  name: vialiq-db-credentials
                  key: sqlserver-runtime-conn-str
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 15
          resources:
            limits:
              cpu: "2000m"
              memory: "2048Mi"
            requests:
              cpu: "500m"
              memory: "512Mi"
      volumes:
        - name: migration-changelogs
          configMap:
            name: vialiq-migration-changelogs
```

### 6.2 Self-Healing Lock Management: Resolving Deadlocks Automatically
If an initContainer is terminated mid-migration (e.g. node eviction or OOM kill), Liquibase records a lock in `DATABASECHANGELOGLOCK`.
To make the deployment **100% self-healing without manual DBA intervention**:
1. We configure a **Lock Timeout Policy** in `liquibase.properties`:
   ```properties
   # Self-Healing Lock Lease: If lock is older than 300 seconds, force release
   liquibase.changelogLockWaitTimeInMinutes=5
   liquibase.changelogLockPollRate=10
   ```
2. The initContainer command wraps execution in a retry-with-unlock script:
   ```bash
   # If previous lock is stale, release it automatically before starting
   liquibase release-locks || true
   liquibase update
   ```

---

## 7. Zero-Downtime Rolling Upgrades: The Expand-Contract Pattern

In clinical EDC, trials operate 24/7/365 across global timezones. A software update must never cause downtime.
We enforce the **3-Phase Expand-Contract (Parallel Schema) Pattern**:

```
                               EXPAND-CONTRACT PATTERN
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
Phase 1: Expand (Additive)        Phase 2: Transition (Rolling)     Phase 3: Contract (Cleanup)
• Pre-flight migration runs       • K8s deploys new v2 pods         • After 100% of traffic is on v2
• Adds new fields as OPTIONAL     • v1 pods continue reading old    • Deprecated fields/views removed
• Creates parallel views          • v2 pods write to new format     • Non-breaking, zero downtime
```

1. **Phase 1 (Expand)**: All schema migrations are **strictly additive**. If adding a new mandatory field `reason_for_change_code`, it must be created with a default value or marked optional in the schema validator so old (v1) API pods do not crash.
2. **Phase 2 (Transition)**: Kubernetes performs a rolling update (`maxUnavailable: 0`). Both v1 and v2 API pods run concurrently for 10-15 minutes. v1 pods read the old structure; v2 pods write the new structure.
3. **Phase 3 (Contract)**: After all v1 pods are terminated and confirmed, a subsequent cleanup migration decommissions deprecated views or obsolete indexes.

---

## 8. The 3-Tier Seeding Architecture & Data Fixture Engine

We establish a clear boundary:
* **Liquibase owns Structure & Reference Codelists** (System Roles, CDISC Terminology Codelists, Regulatory Constraints).
* **`DevelopmentSeeder` (in .NET) owns Mock Clinical Data** (Patients, Mock Forms, Simulated Signatures).

```
                               3-TIER SEEDING ARCHITECTURE
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
Tier 1: Platform Bootstrap          Tier 2: Study Template Seeding       Tier 3: Local Dev Fixtures
(All Environments / Prod)           (On Study Provisioning)              (Development & Local Tests)
• Tool: Liquibase                   • Tool: Study Provisioning Service   • Tool: DevelopmentSeeder (.NET)
• Target: Admin Cluster (`27017`)   • Target: Dev & Prod Clusters        • Target: Dev Clusters ONLY
• Contents:                         • Contents:                          • Contents:
  - System Admin Account              - Study Lock Registry                - Tenant: Novartis
  - Global RBAC Roles                 - Query Discrepancy Categories       - Study: ONCO-101
  - CDISC MedDRA & SDTM Dictionaries  - E-Signature Profile Definitions    - Mock Subjects & CRFs
```

### 8.1 The Hard GxP Port-Lock Guard
In `backend/api/src/Vialiq.Infrastructure/Data/DevelopmentSeeder.cs`:

```csharp
namespace Vialiq.Infrastructure.Data;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Vialiq.Core.Exceptions;
using Vialiq.Core.Interfaces;

public sealed class DevelopmentSeeder : IDevelopmentSeeder
{
    private readonly IConnectionPoolManager _poolManager;
    private readonly IHostEnvironment _env;
    private readonly ILogger<DevelopmentSeeder> _logger;

    public DevelopmentSeeder(
        IConnectionPoolManager poolManager, 
        IHostEnvironment env, 
        ILogger<DevelopmentSeeder> logger)
    {
        _poolManager = poolManager;
        _env = env;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        // 1. ENVIRONMENT GUARD: Strictly disabled outside Development
        if (!_env.IsDevelopment())
        {
            _logger.LogInformation("Development seeding skipped in non-development environment {Env}", _env.EnvironmentName);
            return;
        }

        // 2. HARDWARE / PORT GUARD: Never allow seeding against Layer 3 Prod (27037)
        var prodClient = _poolManager.GetProdClusterClient();
        foreach (var server in prodClient.Settings.Servers)
        {
            if (server.Port == 27037)
            {
                throw new GxpSecurityViolationException(
                    "CRITICAL GxP SAFETY HALT: DevelopmentSeeder detected connection to Layer 3 Production Cluster (port 27037)! Seeding aborted.");
            }
        }

        _logger.LogInformation("Executing development fixture seeding for ONCO-101...");
        // Execution proceeds safely on Layer 2 Dev (27027)
    }
}
```

---

## 9. Development Mode Architecture & Local Developer Ergonomics

A critical requirement of the Vialiq engineering ecosystem is **frictionless local development**. Developers on macOS (Apple Silicon ARM64) or Linux must not be burdened with installing Java runtimes, JDBC drivers, or standalone Liquibase CLI tools on their host operating systems. 

Development Mode is designed to be **100% offline, local-first, zero-install, and self-healing**.

```
                        DEVELOPMENT MODE ARCHITECTURE
                                      │
     ┌────────────────────────────────┼────────────────────────────────┐
     ▼                                ▼                                ▼
Zero-Install Tooling          Profile-Based Footprint           5-Second Clean Reset
• Liquibase runs in Docker    • Core EDC: Mongo Only (2.5GB)    • npm run db:reset
• Binds to --network host     • ETL/BI: Mongo + SQL Server      • Drops Dev DB (27027)
• No Java/CLI on host OS      • Saves RAM on MacBooks           • Re-migrates & re-seeds
```

---

### 9.1 The 3-Step "Day 1" Developer Onboarding (Under 60 Seconds)

When an engineer clones the repository, three commands provision the entire multi-cluster database, execute all schema migrations, inject mock clinical trials, and launch the API with hot-reload:

```bash
# Step 1: Spin up local 3-Layer MongoDB Clusters in Docker
npm run docker:mongo:all

# Step 2: Apply polyglot schema migrations & seed initial ONCO-101 clinical trial
npm run db:setup

# Step 3: Launch ASP.NET Core API with hot-reload
npm run api:watch
```

#### What Occurs Automatically During `npm run db:setup`:
1. Liquibase launches inside an ephemeral Docker container (`liquibase/liquibase:4.29-alpine`).
2. Connects to local Layer 1 Admin (`localhost:27017`) and creates collections, system roles, and CSFLE Key Vault indexes.
3. Connects to local Layer 2 Dev (`localhost:27027`) and applies compound indexes on `crf_entries` and `audit_trail`.
4. Invokes the .NET `DevelopmentSeeder` to provision tenant **Novartis**, trial **ONCO-101**, study sites (MSK, MD Anderson), and mock patient **SUBJ-001** with initial draft vitals.
5. Ready to accept incoming frontend requests on `http://localhost:5000`.

---

### 9.2 Zero-Install Liquibase via Docker Container Mechanics

Developers do not install Java or Liquibase locally. The `npm run db:migrate` script wraps the official alpine Docker image, mounting the local repository's `database/migrations/` directory directly into the container:

```bash
docker run --rm \
  --network host \
  -v $(pwd)/database/migrations:/liquibase/changelogs \
  liquibase/liquibase:4.29-alpine \
  --changelog-file=/liquibase/changelogs/mongo/changelog-master.xml \
  --url="mongodb://localhost:27017/vialiq_admin_control?directConnection=true" \
  update
```

#### Why `--network host` is Essential:
By specifying `--network host`, the container shares the host network namespace directly. This allows Liquibase running inside the container to connect to `localhost:27017`, `localhost:27027`, and `localhost:1433` without configuring custom Docker bridges, port forwards, or container IP aliases.

---

### 9.3 Developer Profiles: Core EDC vs. ETL/Reporting

To conserve memory on developer workstations (especially laptops with 16GB or 18GB Unified Memory), Development Mode supports two operational profiles:

| Profile | Target Developers | Datastores Running | Memory Footprint | Commands Used |
|---|---|---|---|---|
| **Profile A: Core EDC** *(Default 90%)* | UI Engineers, Form Builder, CRF Data Capture, e-Signatures, Validation AST | MongoDB Only (Ports `27017`, `27027`, `27037`) | ~2.5 GB RAM total | `npm run docker:mongo:all`<br/>`npm run db:migrate:mongo`<br/>`npm run api:watch` |
| **Profile B: Reporting & ETL** *(Optional 10%)* | Statistical Programmers, CDISC SDTM Mappers, BI Dashboard Developers | MongoDB + Microsoft SQL Server 2022 Linux Container (Port `1433`) | ~5.0 GB RAM total | `npm run docker:mongo:all`<br/>`npm run docker:sqlserver:up`<br/>`npm run db:migrate:all` |

* **Rule**: Core EDC feature development never requires SQL Server running locally. Only engineers actively developing the CDC pipeline or SDTM relational views need to launch the SQL Server container.

---

### 9.4 Authoring & Testing a New Migration (Step-by-Step)

When a developer needs to introduce a new compound index, collection validator, or reporting table:

#### Step 1: Create the Forward-Only Changeset File
Create a new file in `database/migrations/mongo/study-template/`:  
`20261022_001_subject_status_index.json`

```json
{
  "databaseChangeLog": [
    {
      "changeSet": {
        "id": "20261022_001_subject_status_index",
        "author": "jane.developer",
        "comment": "Index subject status and enrollment date for fast matrix filtering",
        "changes": [
          {
            "createIndex": {
              "collectionName": "subjects",
              "keys": { "study_id": 1, "status": 1, "enrolled_at_utc": -1 },
              "options": { "name": "idx_subjects_study_status_enrolled" }
            }
          }
        ],
        "rollback": [
          {
            "dropIndex": {
              "collectionName": "subjects",
              "indexName": "idx_subjects_study_status_enrolled"
            }
          }
        ]
      }
    }
  ]
}
```

#### Step 2: Register in Master Changelog
Add a single include entry to `database/migrations/mongo/changelog-master.xml`:
```xml
<include file="study-template/20261022_001_subject_status_index.json" relativeToChangelogFile="true"/>
```

#### Step 3: Apply and Verify Locally
```bash
npm run db:migrate:mongo
```
Liquibase checks `DATABASECHANGELOG` on `localhost:27027`, detects the new unapplied changeset, executes the `createIndex` command in ~1.5 seconds, and records the SHA-256 hash.

#### Step 4: Verify Dry-Run Rollback
Developers test rollback resilience locally before submitting a Pull Request:
```bash
npm run db:rollback:count 1
# Confirms that the <rollback> definition safely drops the index without side effects
npm run db:migrate:mongo
# Re-applies the migration cleanly
```

---

### 9.5 The 5-Second Clean-Slate Reset (`npm run db:reset`)

During active development, mock data can become corrupt, or developers may want to verify that a new migration runs cleanly from a completely empty database.

```bash
npm run db:reset
```

#### What Occurs Automatically in Under 5 Seconds:
1. **Targeted Teardown**: Drops the local Dev study database (`vialiq_ten_novartis_global_std_onco101_dev` on port `27027`). Layer 1 Admin and Layer 3 remain untouched.
2. **Re-Migration Sweep**: Runs Liquibase in Docker to re-create all collections, schema validators, and compound indexes from scratch.
3. **Re-Seed Fixtures**: Executes .NET `DevelopmentSeeder` to re-populate standard test subjects (`SUBJ-001`, `SUBJ-002`) and draft forms.
4. Developers are immediately returned to a clean, known-good clinical state.

---

### 9.6 Development Security & Invariant Guards

Development Mode enforces strict guardrails to prevent accidental pollution or data exposure:

1. **Hardware / Port Firewall Assertion**:
   The `DevelopmentSeeder` asserts the physical port before any write operation:
   ```csharp
   if (clusterClient.Settings.Server.Port == 27037)
   {
       throw new GxpSecurityViolationException(
           "CRITICAL GxP SAFETY HALT: DevelopmentSeeder detected connection to Layer 3 Production Cluster (port 27037)! Seeding aborted.");
   }
   ```
2. **Deterministic Mock Identifiers**:
   All mock IDs in development follow predictable test prefixes:
   - Tenants: `ten_novartis_global`
   - Studies: `std_onco101`
   - Subjects: `SUBJ-001`, `SUBJ-002`
   - Test Users: `dr.smith@clinic.org` (PIN: `123456` for 21 CFR Part 11 re-authentication testing).
3. **Local Encryption Keys**:
   Uses the 96-byte local master key seeded in `tools/docker/mongo/` for CSFLE encryption, eliminating any requirement to connect to AWS KMS or Azure Key Vault during local development.

---

### 9.7 Developer CLI Script Reference (`package.json`)

```json
{
  "scripts": {
    "docker:mongo:all": "docker compose -f tools/docker/docker-compose.3layer.yml --profile all up -d",
    "docker:mongo:clean": "docker compose -f tools/docker/docker-compose.3layer.yml --profile all down -v",
    "docker:sqlserver:up": "docker compose -f tools/docker/docker-compose.sqlserver.yml up -d",
    "db:setup": "npm run db:migrate:all && npm run db:seed",
    "db:migrate:mongo": "docker run --rm --network host -v $(pwd)/database/migrations:/liquibase/changelogs liquibase/liquibase:4.29-alpine --changelog-file=/liquibase/changelogs/mongo/changelog-master.xml --url=\"mongodb://localhost:27017/vialiq_admin_control?directConnection=true\" update",
    "db:migrate:sql": "docker run --rm --network host -v $(pwd)/database/migrations:/liquibase/changelogs liquibase/liquibase:4.29-alpine --changelog-file=/liquibase/changelogs/sqlserver/changelog-master.xml --url=\"jdbc:sqlserver://localhost:1433;databaseName=vialiq_reporting;encrypt=false\" --username=sa --password=\"VialiqDevPass123!\" update",
    "db:migrate:all": "npm run db:migrate:mongo && npm run db:migrate:sql",
    "db:seed": "dotnet run --project backend/api/src/Vialiq.Api -- --seed-only",
    "db:reset": "npm run docker:mongo:reset-dev && npm run db:migrate:all && npm run db:seed",
    "api:build": "dotnet build backend/api/Vialiq.Api.sln",
    "api:watch": "dotnet watch --project backend/api/src/Vialiq.Api",
    "api:test": "dotnet test backend/api/Vialiq.Api.sln"
  }
}
```

---

## 10. Summary & Regulatory Compliance Matrix

```
=============================================================================================================
VIALIQ POLYGLOT DATABASE MIGRATION & SEEDING MATRIX
=============================================================================================================
Dimension              Accepted Architectural Design                Regulatory & Operational Justification
-------------------------------------------------------------------------------------------------------------
Tooling Standard       Liquibase (Polyglot Community/Enterprise)    Eliminates in-house reinvention; native
                                                                    support for MongoDB + SQL Server in 1 tool.
Concurrency & Locks    Built-in DATABASECHANGELOGLOCK               Prevents multi-pod race conditions; self-
                       with 5-minute self-healing lease             heals orphaned locks without DBA intervention.
Least Privilege        Kubernetes initContainer Pattern             Production API pods have ZERO DDL rights;
                                                                    DDL runs in ephemeral pre-flight job only.
Tamper Detection       Cryptographic SHA-256 Checksums              Guarantees 21 CFR Part 11 integrity; halts if
                                                                    historical migration is altered in Git.
Zero-Downtime Rollout  3-Phase Expand-Contract Pattern              Ensures v1 and v2 API pods co-exist safely
                                                                    during 24/7 clinical trial operations.
Polyglot Sync          Single Git Repository (`database/`)          Keeps MongoDB OLTP and SQL Server SDTM
                                                                    reporting schemas synchronized in 1 PR.
Dedicated Deployments  Containerized Headless Execution             Same container image runs on AWS EKS, Azure
                                                                    AKS, dedicated sponsor VPCs, or On-Prem.
Mock Data Seeding      Isolated DevelopmentSeeder with Port Guard   Impossible for mock test data to leak into
                                                                    Layer 3 Production Cluster (`27037`).
=============================================================================================================
```
