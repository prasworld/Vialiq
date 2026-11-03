# ADR: EDC Database Finalization — MongoDB Operational Primary with Polyglot Projections

| Field | Value |
|---|---|
| **Status** | **Accepted / Finalized** |
| **Date** | 2026-10-15 |
| **Author** | Architecture Team / Prashant Gupta |
| **Domain** | Backend Architecture / Database Layer |
| **Decision** | **MongoDB 7.0+ as Operational Primary Datastore** with Asynchronous Relational/Tabular Reporting Projections |
| **Related Documents** | [Cluster Setup Guide](./mongodb-cluster-setup-guide.md), [Previous Decision Deep-Dive](../../final-database-decision-mssql-vs-mongodb.md), [Database Architecture Specification](./database-architecture-specification.md), [API Architecture ADR](../api/001-api-architecture-adr.md), [Form Builder Schema](../../form-builder-schema.md), [Field-Level Encryption](../../field-level-encryption-clinical-edc.md) |

---

## 1. Context & Problem Statement

Building an **Electronic Data Capture (EDC)** platform for clinical trials introduces a fundamental architectural tension:

1. **Relational Protocol Hierarchy**: The governance structure of clinical research is relational:
   $$\text{Tenant / Sponsor} \longrightarrow \text{Study} \longrightarrow \text{Site} \longrightarrow \text{Subject} \longrightarrow \text{Visit / Event} \longrightarrow \text{Form (CRF)}$$
2. **Dynamic, Semi-Structured Clinical Data**: The clinical data collected within each Case Report Form (CRF) is dynamic:
   - Field definitions, repeaters, nested layouts, and validation rules are configured dynamically in the Form Builder without hardcoded database tables.
   - Protocol amendments mid-study alter form definitions without downtime or schema locking.
   - Form instances must support arbitrary nesting (repeating groups, lab panels, adverse event logs).
3. **Strict Regulatory Compliance (FDA 21 CFR Part 11, ICH GCP & ALCOA+)**:
   - Every single field mutation requires an immutable audit record capturing: old value, new value, timestamp, user identity, and mandatory reason for change.
   - The system must guarantee zero data loss, verifiable tamper-evidence, and strict data isolation.
4. **Startup MVP Financial Reality**:
   - As an early-stage product, we must achieve **$0 or minimal development cost** (including running clusters for transactions) while ensuring seamless scalability, high availability, and enterprise credibility when onboarding clinical sponsors.

---

## 2. Alternatives Evaluated

### Option 1: Microsoft SQL Server (Pure Relational)
- **Strengths**:
  - Decades of established regulatory pedigree in clinical trials and enterprise pharma.
  - Native Temporal Tables (system-versioned) and Ledger for cryptographically verifiable audit logs.
  - Mature integrated enterprise suite: SQL Server Agent (scheduled jobs), Database Mail, and SQL Server Reporting Services (SSRS) for CDISC SDTM/SAS statistical reporting.
- **Weaknesses**:
  - Dynamic CRFs force either an **Entity-Attribute-Value (EAV)** schema (notoriously slow and fragile) or storing data in `JSON` columns with `OPENJSON` / `JSON_VALUE`, forfeiting relational advantages while retaining relational rigidity.
  - Mid-study protocol amendments requiring DDL alterations risk database locks and study downtime.
  - **The Production Licensing Trap**: Express Edition is limited to a fatal 10GB database size (insufficient for clinical audit trails). Developer Edition is free in dev/test but strictly prohibited in production. Launching requires Standard (~$7,600/year for 4 vCPU) or Enterprise (~$60,000/year for Always On HA).
  - High Availability (Always On Availability Groups) requires Windows Server Failover Clustering (WSFC) and Enterprise licenses.

### Option 2: MongoDB (Pure Document)
- **Strengths**:
  - Native BSON document model maps directly 1:1 to JSON Form Builder schemas (`FormSchema`) and captured CRF payloads.
  - Effortless support for nested repeaters, dynamic layouts, and polymorphic schemas (v1 and v2 forms coexist seamlessly without DDL migrations).
  - Native 3-node Replica Sets provide automatic sub-30s failover and High Availability out-of-the-box at a fraction of the infrastructure cost.
  - Multi-document ACID transactions across collections supported since MongoDB 4.0+.
  - Cost-effective scaling: Free Community Edition / local Docker replica sets for $0 development cost, scaling smoothly to Atlas M10 ($57/mo) and M30 ($180/mo) with automated backups and HA.
- **Weaknesses**:
  - Cross-form tabular clinical reporting (e.g. CDISC SDTM domains) requires multi-stage aggregation pipelines or an asynchronous tabular projection.
  - Historically viewed as "newer" by traditional clinical data management auditors compared to SQL Server.

---

## 3. Comprehensive Decision Matrix

The scoring below synthesizes the detailed criteria and weights from Section 12.1 of [`docs/final-database-decision-mssql-vs-mongodb.md`](../../final-database-decision-mssql-vs-mongodb.md):

| Evaluation Criteria | Weight | SQL Server Score | MongoDB Score | Winner | Rationale |
|:---|:---:|:---:|:---:|:---:|:---|
| **Cost & Licensing** | 18% | 3 / 10 | **10 / 10** | 🏆 **MongoDB** | Standard Edition is $7.6K–$15.2K/yr; Enterprise is $60K/yr. MongoDB is $0 (Community/Docker/M0) to $2.1K/yr (Atlas M30). |
| **Dynamic Form Schema** | 18% | 6 / 10 | **10 / 10** | 🏆 **MongoDB** | Native BSON documents eliminate EAV complexity and impedance mismatch with the Form Builder JSON. |
| **Team Expertise** | 14% | 10 / 10 | 10 / 10 | ⚖️ **Tie** | Engineering team has verified 10/10 expert proficiency in both SQL Server and MongoDB ecosystems. |
| **High Availability & DR** | 12% | 9 / 10 | **10 / 10** | 🏆 **MongoDB** | MongoDB replica sets provide automatic 10–30s failover out of the box ($2,160/yr Atlas vs $60,000/yr SQL Server Always On). |
| **Enterprise Features** | 10% | **10 / 10** | 6 / 10 | 🏆 **SQL Server** | SQL Server has built-in SQL Agent, Database Mail, and SSRS. MongoDB uses application-layer equivalents. |
| **Data Capture Performance** | 10% | 7 / 10 | **10 / 10** | 🏆 **MongoDB** | Writing/reading complete nested CRF documents is native in BSON; SQL Server JSON parsing adds latency. |
| **Horizontal Scaling & Growth** | 8% | 2 / 10 | **10 / 10** | 🏆 **MongoDB** | Native sharding and non-disruptive tier scaling in MongoDB; SQL Server lacks native sharding. |
| **Regulatory Trust & Pedigree** | 6% | **10 / 10** | 7 / 10 | 🏆 **SQL Server** | SQL Server has a 30-year FDA regulatory track record. MongoDB requires explicit validation documentation. |
| **Cloud-Native Deployment** | 4% | 6 / 10 | **10 / 10** | 🏆 **MongoDB** | MongoDB Atlas is fully multi-cloud native (AWS, Azure, GCP); Azure SQL is good but AWS RDS SQL Server is costly. |

### Mathematical Weighted Total
$$\text{Score}_{\text{SQL Server}} = (3 \times 0.18) + (6 \times 0.18) + (10 \times 0.14) + (9 \times 0.12) + (10 \times 0.10) + (7 \times 0.10) + (2 \times 0.08) + (10 \times 0.06) + (6 \times 0.04) = \mathbf{7.42 / 10}$$

$$\text{Score}_{\text{MongoDB}} = (10 \times 0.18) + (10 \times 0.18) + (10 \times 0.14) + (10 \times 0.12) + (6 \times 0.10) + (10 \times 0.10) + (10 \times 0.08) + (7 \times 0.06) + (10 \times 0.04) = \mathbf{9.14 / 10}$$

**Decision Matrix Winner: MongoDB (9.14 / 10)** ✅

---

## 4. The 5 Core Contention Points — In-Depth Rationale for MongoDB

Our finalization of MongoDB as the operational database is grounded in the thorough evaluation of the 5 primary contention areas:

### 4.1 Contention 1: Cost — Development-Time Clusters ($0) to Scalable Production
* **Development Phase ($0 Hard Requirement)**:
  * In MongoDB, multi-document ACID transactions and Change Streams require a **Replica Set**. 
  * Using **Docker and Docker Compose**, developers can run single-node (`mongod --replSet rs0`) or full 3-node replica sets locally at **$0 cost** with a memory footprint of just ~150MB to 500MB RAM.
  * Developers can spin up multiple isolated clusters on demand for multi-tenancy testing, study isolation, or integration tests without cloud infrastructure or license keys.
  * MongoDB Atlas also provides a permanent **M0 Free Tier** (512MB shared cluster) for cloud QA.
* **Production Phase (The SQL Server Licensing Trap Avoided)**:
  * While SQL Server Developer Edition is free in dev, it is **legally barred from production**. Transitioning to production requires an upfront commitment of **$7,600/year (Standard per 4-cores)** or **$28,000–$60,000/year (Enterprise for Always On HA)**.
  * SQL Server Express is free, but capped at a **10GB database size** (a single clinical trial's audit trail and CRFs exceed 10GB in weeks).
  * MongoDB enables an affordable, smooth transition: launch production on MongoDB Atlas M10 (**~$57/month = $684/year**) with automated 3-node HA, daily snapshots, and zero upfront license fees, scaling to M30 ($180/mo) as study enrollment grows.

### 4.2 Contention 2: Reporting — Decoupled Operational vs. Analytical Workloads
* **The Reality of Clinical Reporting**:
  * Biostatisticians, monitors, and regulatory agencies require tabular datasets, cross-tabulations, and CDISC SDTM/SAS extracts.
  * SQL Server natively excels at tabular SQL joins, but *only if data is stored in static relational tables*. When form data is dynamic (requiring JSON columns or EAV in SQL Server), SQL Server's reporting advantage degrades significantly.
* **The MongoDB Dual-Tier Reporting Solution**:
  * MongoDB serves as the high-throughput, low-latency operational data capture store.
  * To satisfy statistical and CDISC SDTM reporting needs without overloading the operational database or writing tortuous aggregation pipelines, we utilize **asynchronous read projections**.
  * A background projection worker consumes MongoDB **Change Streams** to project finalized clinical data into flat relational reporting tables (PostgreSQL or SQL Server) or flat columnar files (DuckDB/Parquet). This provides the best of both worlds: uninhibited operational form capture + native tabular SQL tools for biostatisticians.

### 4.3 Contention 3: Adaptability to Protocol Evolution — Zero-Downtime Polymorphism
* **The Clinical Trial Protocol Reality**:
  * Clinical protocols continuously evolve throughout a trial (v1.0 ➔ v2.0 ➔ v3.0). New fields are introduced, visit windows are adjusted, and units change mid-study.
  * Existing patient data collected under v1.0 must remain valid and untouched, while new patient visits collect data under v2.0.
* **Why MongoDB Dominates Here**:
  * MongoDB's native BSON document model is **polymorphic**. A single collection can store version 1 and version 2 records side-by-side:
    ```json
    // Subject 001 - Collected under Protocol v1
    { "subjectId": "SUBJ-001", "formVersion": 1, "data": { "dose": 10 } }

    // Subject 002 - Collected under Protocol v2 Amendment
    { "subjectId": "SUBJ-002", "formVersion": 2, "data": { "dose": 10, "unit": "mg", "route": "oral" } }
    ```
  * **Zero database migrations, zero table locks, zero study downtime**. In contrast, executing `ALTER TABLE` migrations on relational databases during an active multi-site trial carries severe operational risk and requires nullable column sprawl or complex version-table mapping.

### 4.4 Contention 4: Future Requirements — Polyglot / Multi-Database Architecture
* **Roadmap Alignment**:
  * The platform roadmap explicitly anticipates a multi-database architecture (e.g. specialized stores for full-text medical coding dictionaries, time-series wearable data, and relational analytical projections).
* **MongoDB as the Ideal Operational Engine in a Polyglot Stack**:
  * MongoDB's native **Change Streams (built on the oplog)** provide real-time, non-blocking Change Data Capture (CDC).
  * Any insert, update, or status change on `crf_entries` or `clinical_queries` is emitted as a stream event. Application workers can route these events downstream to:
    1. **Relational Reporting Store** (PostgreSQL or SQL Server) for CDISC SDTM/SAS.
    2. **Search Engine** (Elasticsearch / OpenSearch) for MedDRA / WHO Drug dictionary auto-complete.
    3. **Audit Cold Storage** (S3 Glacier / Azure Blob Archive) for long-term 15-year trial archival.
  * If SQL Server were the primary store, CDC is heavier, tightly coupled to SQL Server Agent, and increases transaction log IO.

### 4.5 Contention 5: Security, Compliance & Liability
* **Regulatory Rigor (FDA 21 CFR Part 11 & GxP/ALCOA+)**:
  * **Multi-Document ACID Transactions**: Enforced on all CRF save operations to guarantee atomic execution across form data and audit trail updates.
  * **Database-Level Immutability**: The application database user is strictly granted `read` and `insert` privileges on the `audit_trail` collection; `update` and `delete` are completely revoked at the MongoDB role level.
  * **Cryptographic Chaining (ALCOA+)**: Each audit record computes a SHA-256 hash incorporating the previous record's hash, generating a tamper-evident blockchain-style ledger.
* **Resolving the 21 CFR Part 11 vs. GDPR Art. 17 Conflict**:
  * Clinical trials face a legal paradox: 21 CFR Part 11 mandates *never deleting audit records*, while GDPR Art. 17 gives patients the *right to erasure*.
  * With MongoDB Client-Side Field-Level Encryption (CSFLE), subject PHI fields are encrypted with a per-subject Data Encryption Key (DEK). When a patient requests erasure, their DEK is destroyed (**Crypto-Shredding**). The ciphertext in MongoDB and audit logs becomes permanently unrecoverable, satisfying GDPR erasure while leaving the clinical trial's audit chain valid for FDA inspection.

---

## 5. Local Development Multi-Cluster Architecture (Docker Compose)

To support local multi-cluster development at **$0 cost** with full multi-document ACID transactions and Change Streams, developers use the following 3-node replica set configuration:

```yaml
# tools/docker/docker-compose.mongo-cluster.yml
version: '3.8'

services:
  mongo1:
    image: mongo:7.0
    container_name: edc-mongo1
    restart: always
    command: ["mongod", "--replSet", "rs-edc", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27017:27017"
    volumes:
      - mongo1_data:/data/db
    networks:
      - edc-net

  mongo2:
    image: mongo:7.0
    container_name: edc-mongo2
    restart: always
    command: ["mongod", "--replSet", "rs-edc", "--bind_ip_all", "--port", "27018"]
    ports:
      - "27018:27018"
    volumes:
      - mongo2_data:/data/db
    networks:
      - edc-net

  mongo3:
    image: mongo:7.0
    container_name: edc-mongo3
    restart: always
    command: ["mongod", "--replSet", "rs-edc", "--bind_ip_all", "--port", "27019"]
    ports:
      - "27019:27019"
    volumes:
      - mongo3_data:/data/db
    networks:
      - edc-net

  # Auto-initializer: Joins nodes into a replica set and exits cleanly
  mongo-init:
    image: mongo:7.0
    depends_on:
      - mongo1
      - mongo2
      - mongo3
    networks:
      - edc-net
    restart: "no"
    entrypoint: [ "bash", "-c", "
      sleep 3;
      mongosh --host mongo1:27017 --eval '
        rs.initiate({
          _id: \"rs-edc\",
          members: [
            { _id: 0, host: \"mongo1:27017\" },
            { _id: 1, host: \"mongo2:27018\" },
            { _id: 2, host: \"mongo3:27019\" }
          ]
        });
      ';
    "]

networks:
  edc-net:
    driver: bridge

volumes:
  mongo1_data:
  mongo2_data:
  mongo3_data:
```

### Running Multiple Isolated Clusters Simultaneously
Developers can run multiple independent clusters for different studies or tenants on the same machine:
```bash
# Start Cluster for Study A (Project isolation)
docker compose -p edc-study-a -f tools/docker/docker-compose.mongo-cluster.yml up -d

# Start Cluster for Study B (Using alternative port mapping)
docker compose -p edc-study-b -f tools/docker/docker-compose.mongo-cluster.study-b.yml up -d
```

---

## 6. Formal Architectural Decision

We adopt the **MongoDB Operational Primary with Polyglot Projections** architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                      EDC PLATFORM ARCHITECTURE                  │
│                     (OPERATIONAL + PROJECTIONS)                 │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────────┐
                         │   API Gateway    │
                         │(Application Tier)│
                         └────────┬─────────┘
                                  │
               ┌──────────────────┼──────────────────┐
               │                  │                  │
       ┌───────▼────────┐  ┌──────▼──────┐  ┌──────▼──────────┐
       │   MongoDB      │  │  Redis      │  │ Relational DB   │
       │  (OPERATIONAL) │  │  (Cache)    │  │ (REPORTING/BI)  │
       │                │  │             │  │ (Postgres/MSSQL)│
       │ - form_defs    │  │ - Sessions  │  │                 │
       │ - crf_entries  │  │ - Locks     │  │ Read-only flat  │
       │ - queries      │  │ - Debounce  │  │ tables for CDISC│
       │ - audit_trail  │  │             │  │ SDTM & SAS/R    │
       └───────┬────────┘  └─────────────┘  └────────▲────────┘
               │                                     │
               └────────── Change Streams ───────────┘
```

1. **Primary Operational Datastore: MongoDB 7.0+ (Replica Set)**:
   - Manages all transactional form submissions, dynamic CRF data, clinical queries, electronic signatures, and immutable audit logs.
   - Preserves 1:1 fidelity with the Form Builder JSON schemas without translation overhead.
   - Multi-document ACID transactions guarantee atomicity across CRF updates and audit records.
2. **Asynchronous Tabular Reporting Projections**:
   - Background worker processes MongoDB Change Streams to project finalized clinical data into relational tables (PostgreSQL or SQL Server) solely for biostatisticians and CDISC SDTM/ODM-XML exports.
   - Fully decouples compute-heavy statistical reporting from live clinical data entry.

---

## 7. Consequences & Risk Mitigations

| Identified Risk | Severity | Mitigation Strategy |
|:---|:---:|:---|
| **No Native Foreign Keys** | Medium | Application domain services enforce referential integrity within transactional repository boundaries. |
| **Complex Cross-Form Clinical Queries** | Medium | Handled via the asynchronous tabular projection pipeline rather than executing massive `$lookup` pipelines in production. |
| **Auditor Unfamiliarity with NoSQL** | Low | Provide FDA inspectors with the Computer System Validation (CSV) package, showcasing cryptographically verifiable hash-chaining, DB-level role restrictions, and multi-document ACID transactions. |
| **Unbounded Document Growth** | Low | Audit records and queries are stored in dedicated collections referencing the CRF ID, preventing individual CRF documents from approaching the 16MB BSON limit. |

---

## 8. Comprehensive Infrastructure Costing & TCO Analysis

To satisfy Contention 1 (achieving $0 to minimal dev cost while providing clear financial projections into production), this section provides a transparent Bill of Materials (BOM) and multi-year Total Cost of Ownership (TCO) model.

### 8.1 Four-Stage Lifecycle Cost Trajectory

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE COST LIFECYCLE SUMMARY                           │
├─────────────────────┬───────────────────┬─────────────────────────┬────────────────────┤
│ Lifecycle Stage     │ Workload Scope    │ Total Monthly Cost      │ Cost per Study/Mo  │
├─────────────────────┼───────────────────┼─────────────────────────┼────────────────────┤
│ 1. Local Dev        │ Dev & Unit Tests  │ $0.00                   │ $0.00              │
│ 2. Cloud Staging    │ Team QA & Demo    │ $0.00 – $45.00          │ Negligible         │
│ 3. Production MVP   │ 1–10 Studies      │ $195.00 – $275.00       │ $19.50 – $27.50    │
│ 4. Enterprise Scale │ 50+ Studies       │ $850.00 – $1,400.00     │ $10.00 – $18.00    │
└─────────────────────┴───────────────────┴─────────────────────────┴────────────────────┘
```

### 8.2 Production MVP Bill of Materials (1 to 10 Active Clinical Trials)

Physical segregation across the 3 clusters with 99.95% SLA, point-in-time recovery (PITR), and 21 CFR Part 11 immutable audit logs:

| Component | Architecture Role | Tier / Specification | Monthly Cost | Annual Cost |
|:---|:---|:---|:---:|:---:|
| **Cluster 0: Admin Layer** | Control plane (users, roles, routing) | MongoDB Atlas M10 (2 GB RAM, 10 GB SSD, 3-node HA) | $57 / mo | $684 / yr |
| **Cluster 1: Not-Live** | Form Builder DEV drafts & UAT mock tests | MongoDB Atlas M10 (2 GB RAM, 10 GB SSD, 3-node HA) | $57 / mo | $684 / yr |
| **Cluster 2: Live / PROD** | Live clinical trials (Database-per-Study) | MongoDB Atlas M10 + Continuous Cloud Backups (PITR) | $68 / mo | $816 / yr |
| **Identity & Access** | Multi-tenant OIDC (1 realm/client) | AWS ECS Fargate (1 vCPU/2 GB) + RDS Postgres (db.t4g.micro) | $45 / mo | $540 / yr |
| **Regulatory Archival** | Immutable cold storage (FDA 25-yr retention) | AWS S3 Glacier Flexible Retrieval with Object Lock | $2 / mo | $24 / yr |
| **Total Production MVP** | **Full 3-Cluster Stack + Identity + Archival** | **Enterprise High Availability & Compliance** | **~$229 / mo** | **~$2,748 / yr** |

### 8.3 Scale-Out Economics of the 3-Cluster Database-per-Study Architecture

* **Cluster 2 (Live PROD) Scale-Out Trajectory**:
  - Cluster 2 scales from Atlas M10 ($68/mo) for 1–10 studies to M30 ($280/mo) for 30–50 studies, and M40/M50 ($540–$1,100/mo) for 100+ active clinical trials.
  - Marginal infrastructure cost drops to **~$7 to $12 per active study/month** as volume increases.
  - Software gross margins exceed **85%** while maintaining complete regulatory segregation (each study has its own dedicated database).
* **Cluster 1 (Not-Live) and Cluster 0 (Control Plane)**:
  - Cluster 0 remains extremely lightweight ($57/mo to $140/mo) because it stores strictly centralized identity and routing metadata with zero clinical data.
  - Cluster 1 independently handles non-production drafts, UAT qualification, and training without ever consuming resources from or threatening live trials on Cluster 2.

### 8.4 3-Year Total Cost of Ownership (TCO) Benchmark vs. Competitors

| Evaluation Dimension | Vialiq EDC (MongoDB Document + 3-Cluster) | Microsoft SQL Server Enterprise | Medidata Rave EDC | Veeva Vault EDC |
|:---|:---:|:---:|:---:|:---:|
| **Development Time License** | **$0.00** (Local Docker Replica Sets) | $0 Developer Edition (Prod Prohibited) | N/A (Closed Cloud) | N/A (Closed Cloud) |
| **Year 1 Total Infra / Licensing** | **~$2,750** | **$18,000 – $45,000** (Core licenses + RDS) | **$80,000 – $250,000+** | **$100,000 – $300,000+** |
| **3-Year Cumulative TCO** | **~$12,500 – $25,000** (Full scale) | **$75,000 – $180,000** | **$250,000 – $800,000+** | **$350,000 – $1,000,000+** |
| **Identity Provider Cost** | **$45 / mo** (Keycloak self-hosted) | Auth0 B2B ($2,700/mo = $32.4k/yr) | Bundled proprietary | Bundled proprietary |
| **Protocol Amendment Cost** | **$0** (Zero-downtime document model) | High (DBA migration hours + downtime) | High (Study amendment fees) | Moderate (Vault formula work) |
| **Startup Viability** | 🟢 **Optimal ($0 dev, smooth ramp)** | 🔴 **High initial barrier ($7.6k+ prod)** | 🔴 **Enterprise-only lockout** | 🔴 **Enterprise-only lockout** |
