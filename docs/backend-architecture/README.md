# Vialiq EDC — Backend Architecture

This directory contains the architecture documentation for the Vialiq Electronic Data Capture (EDC) backend platform, segregated into two core architectural domains: **Database** and **API**.

---

## Architecture Navigation

```
docs/backend-architecture/
├── README.md                                  # You are here
│
├── database/                                  # Database Layer Architecture
│   ├── 001-database-selection-adr.md          # ADR: SQL Server vs. MongoDB Decision
│   ├── 002-3-cluster-and-flexible-tenancy-architecture.md # 3-Cluster Topology, Tenancy, Promotion & Peer Rating
│   ├── 003-comprehensive-architecture-rating-scorecard.md # Architecture Rating & Evaluation Scorecard (9.63/10)
│   ├── 004-background-jobs-protocol-migration-and-auto-query-engine.md # Background Jobs, Protocol Migration & Auto-Query Engine
│   ├── 005-database-operational-pillars-backup-locking-dictionaries-and-archival.md # 5 Operational Pillars: Backup, Locking, Blinding, 25-Yr Archival, Connection Pooling
│   ├── 006-field-level-encryption-csfle-and-key-management-architecture.md # Field-Level Encryption (CSFLE/QE), Multi-Tenant Key Vault Security, 3 Isolation Models, BYOK, 7-Phase Key Rotation & Local Dev Mode
│   ├── 007-database-administration-and-mongosh-command-glossary.md # DBA Operations Playbook & mongosh Command Glossary (Locking, RBAC, Diagnostics & DR)
│   ├── 008-architectural-benchmark-and-peer-comparison.md # Real-World Peer Benchmark & Industry Evaluation (vs. Medidata, Veeva, Oracle)
│   ├── 009-developer-3-cluster-setup-quickstart.md # Developer Quickstart: Minimal Theory, Copy-Paste CLI Setup from Scratch
│   ├── 010-docker-compose-3layer-vs-mongo-cluster-guide.md # Docker Environments: 3-Layer GxP Architecture vs. 3-Node HA Cluster
│   ├── database-architecture-specification.md # MongoDB Collections, ACID Transactions & Schemas
│   ├── mongodb-cluster-setup-guide.md         # Step-by-Step Cluster Guide: Docker ($0) & Atlas Cloud
│   └── mongodb-3layer-docker-setup-guide.md   # Phased 3-Layer Cluster Setup for Apple Silicon (M1 Pro / M5 Pro)
│
└── api/                                       # API Layer Architecture
    ├── 001-api-architecture-adr.md           # ADR: API Architecture Strategy
    ├── 002-api-stack-discussion-agenda-and-evaluation-framework.md # Discussion Agenda: Framework Evaluation, Data Access & 21 CFR Part 11
    ├── 003-dto-design-and-graphql-evaluation-adr.md # ADR: DTO Architecture Strategy & Rejection of GraphQL in Favor of REST + BFF
    ├── 004-repository-architecture-monorepo-vs-submodule-adr.md # ADR: Unified Monorepo Architecture vs. Git Submodule Strategy
    └── api-specification-and-contracts.md     # REST Contracts, WebSockets & Security Guards
```

---

## 1. [Database Architecture (`database/`)](./database/)

* **[001-database-selection-adr.md](./database/001-database-selection-adr.md)**:
  Detailed analysis comparing Microsoft SQL Server vs. MongoDB for clinical trial data collection. Outlines why MongoDB 7.0+ was selected as the primary operational data store (BSON document model matching Form Builder schemas, zero-downtime protocol amendments, cost-effective scaling) paired with an asynchronous tabular projection layer for CDISC SDTM biostatistical exports.
* **[002-3-cluster-and-flexible-tenancy-architecture.md](./database/002-3-cluster-and-flexible-tenancy-architecture.md)**:
  Comprehensive specification of the **3-Cluster Topology** (Admin Control Plane, Not-Live DEV/UAT Build Plane, Live/PROD Clinical Plane), **Database-per-Study Isolation**, Protocol Promotion Engine, Zero-Downtime Protocol Amendments, and Peer Comparison against Medidata/Veeva/Oracle.
* **[003-comprehensive-architecture-rating-scorecard.md](./database/003-comprehensive-architecture-rating-scorecard.md)**:
  Rigorous architectural scorecard rating the database design at **9.63 / 10 (Grade A+)** across EDC Requirements & Functional Compliance, Regulatory Requirements (21 CFR Part 11, ICH E6(R3), GDPR, HIPAA), Future Horizon Adaptability (DCT, FHIR R4/R5), and Audit & Inspection Readiness.
* **[004-background-jobs-protocol-migration-and-auto-query-engine.md](./database/004-background-jobs-protocol-migration-and-auto-query-engine.md)**:
  Comprehensive specification of the asynchronous processing tier: decoupled worker architecture (GAMP 5 compliant), study versioning engine, zero-downtime protocol amendment migration, retrospective subject data re-evaluation, high-throughput bulk auto-query generation, and real-time reactive Change Streams for 24h SAE safety alerts.
* **[005-database-operational-pillars-backup-locking-dictionaries-and-archival.md](./database/005-database-operational-pillars-backup-locking-dictionaries-and-archival.md)**:
  Authoritative specification of the **5 Core Operational & Infrastructure Pillars**: Continuous Oplog Point-In-Time Recovery (PITR, RPO $\le 5$m, RTO $\le 60$m) with automated weekly restoration drills; 5-tier progressive database locking (Form/Visit Freeze to Final Database Hard Lock) with dual-person emergency unlock workflows; Client-Side Field-Level Encryption (CSFLE) and Queryable Encryption (QE) with Envelope Key Management (AWS KMS / Vault), GDPR Crypto-Shredding (reconciling GDPR Art. 17 erasure with FDA 21 CFR Part 11 audit retention), and double-blind RTSM isolation; 25-year long-term study archival (EU CTR Art 58) using CDISC ODM-XML, PDF/A patient books, and AWS S3 Object Lock in WORM Compliance Mode; and high-performance Dynamic Connection Pool Multiplexing preventing socket exhaustion across 500+ active studies.
* **[006-field-level-encryption-csfle-and-key-management-architecture.md](./database/006-field-level-encryption-csfle-and-key-management-architecture.md)**:
  Definitive specification of the **Cryptographic Architecture & Key Management Tier**: Trust boundary enforcement (why keys never reach the browser UI), 5 configurable security tiers (Tier 0 Standard to Tier 4 Role-Blinded RTSM) with performance/query trade-offs; Multi-Tenant Key Vault security on Layer 1 Admin featuring 3 isolation models (Shared KeyVault with KMS IAM ARNs, Dedicated KeyVault Databases with MongoDB RBAC, and Bring Your Own Key / BYOK sovereign control); Subject-level Crypto-Shredding resolving the GDPR Article 17 vs. FDA 21 CFR Part 11 audit retention conflict; 7-Phase Resumable Key Rotation & Field Re-Encryption state machine with Redis cursor checkpointing and Optimistic Concurrency Control (OCC) protecting live CRC writes; and complete 100% offline Development Mode on Apple Silicon (macOS ARM64) with native `crypt_shared` dynamic shared library and turnkey local key seeding scripts.
* **[007-database-administration-and-mongosh-command-glossary.md](./database/007-database-administration-and-mongosh-command-glossary.md)**:
  Authoritative **DBA Operations Playbook & `mongosh` Command Glossary**: Complete operational CLI runbook covering 3-layer connection strings (ports 27017, 27027, 27037); replica set health and maintenance failovers (`rs.status()`, `rs.stepDown()`); study database provisioning and index initialization; multi-tier database locking and freezing commands (Study Hard Lock, Site Soft Freeze, Four-Eyes emergency unlock, and auto-relock sweeps); least-privilege RBAC management and emergency credential revocation; CSFLE key vault inspection and CLI crypto-shredding; point-in-time recovery (PITR) to exact milliseconds (`mongodump --oplog`, `mongorestore --oplogLimit`); performance diagnostics (`db.currentOp()`, `db.killOp()`, slow query profiler `system.profile`, `$indexStats`); and WiredTiger cache health monitoring.
* **[008-architectural-benchmark-and-peer-comparison.md](./database/008-architectural-benchmark-and-peer-comparison.md)**:
  Authoritative **Real-World Architectural Benchmark & Industry Peer Comparison**: Exhaustive technical and commercial evaluation comparing Vialiq EDC (**Composite Score: 9.78/10 — Grade A+**) against industry incumbents (**Medidata Rave EDC, Veeva Vault EDC, and Oracle Clinical One**). Features a 15-dimension capability matrix; 7 deep-dive clinical scenario walkthroughs (Phase 3 Adaptive Oncology Protocol Amendments, Multi-Sponsor BYOK Sovereign Isolation, GDPR Article 17 Crypto-Shredding vs. FDA 21 CFR Part 11 Audit Retention, 4-Layer Defense-in-Depth Locking, Double-Blind RTSM Treatment Arm Security, 25-Year WORM Archival Decommissioning, and Apple Silicon ARM64 local developer ergonomics); a 3-Year Enterprise TCO Model demonstrating an **88.4% cost reduction** across 100 concurrent trials; and an honest architect critique of technical trade-offs and mitigations.
* **[009-developer-3-cluster-setup-quickstart.md](./database/009-developer-3-cluster-setup-quickstart.md)**:
  Developer-first, minimal-theory **Local Setup Quickstart & CLI Runbook**: Pragmatic commands to spin up the 3-Layer MongoDB cluster topology from scratch via npm and Docker, one-line health checks, copy-paste `.env` and Compass connection strings, ACID transaction smoke tests, clean-slate reset commands, and an evolution roadmap as the backend matures.
* **[010-docker-compose-3layer-vs-mongo-cluster-guide.md](./database/010-docker-compose-3layer-vs-mongo-cluster-guide.md)**:
  Comparative architectural and operational guide: Detailed breakdown of **when and how** to use `docker-compose.3layer.yml` (multi-cluster GxP physical isolation, default for 95% of EDC development) versus `docker-compose.mongo-cluster.yml` (single-cluster 3-node HA failover & chaos testing), complete with connection strings, failover drill commands, and the port 27017 mutual exclusion rule.
* **[database-architecture-specification.md](./database/database-architecture-specification.md)**:
  Comprehensive data layer specification detailing:
  - Complete TypeScript document models for `study_protocols`, `form_definitions`, `crf_entries`, `audit_trail`, `clinical_queries`, and `electronic_signatures`.
  - Multi-document ACID transaction boundaries (`submitCrfDataTransaction`).
  - Cryptographic SHA-256 hash chaining for 21 CFR Part 11 and ALCOA+ compliance.
  - Field-Level Encryption (AES-256-GCM envelope encryption & GDPR crypto-shredding).
* **[mongodb-cluster-setup-guide.md](./database/mongodb-cluster-setup-guide.md)**:
  Beginner-friendly step-by-step tutorial explaining how to create multiple small MongoDB replica set clusters locally using Docker for $0, and online using MongoDB Atlas free/low-cost tiers. Includes commands, multi-tenant cluster isolation, and ACID transaction verification scripts.
* **[mongodb-3layer-docker-setup-guide.md](./database/mongodb-3layer-docker-setup-guide.md)**:
  Production-grade local orchestration guide for running the **3-Layer MongoDB Cluster Topology** on Apple Silicon (M1 Pro to Mac Studio M5 Pro) with native ARM64 performance, WiredTiger cache memory tuning, phased profile activation (`admin`, `dev-phase`, `prod`, `all`), automated replica set self-initialization, and ACID transaction verification.
* **[redis-setup-guide.md](./database/redis-setup-guide.md)**:
  Comprehensive local and cloud orchestration guide for running the **High-Availability Redis & Sentinel Cluster Topology** (Primary + Replica + 3 Sentinels) on Apple Silicon (M1 Pro to M5 Pro), with native ARM64 performance, GxP memory clamping (`volatile-lru`), automated chaos failover testing, turnkey npm scripts, and enterprise capacity scaling from 10 to 1,000+ active clinical trials.

---

## 2. [API Architecture (`api/`)](./api/)

* **[001-api-architecture-adr.md](./api/001-api-architecture-adr.md)**:
  Architecture Decision Record evaluating NestJS (TypeScript) vs. ASP.NET Core (.NET C#). Establishes architectural trade-offs, validation parity considerations, and framework selection criteria.
* **[002-api-stack-discussion-agenda-and-evaluation-framework.md](./api/002-api-stack-discussion-agenda-and-evaluation-framework.md)**:
  Authoritative **API Stack Discussion Agenda & Evaluation Framework**: Detailed structure covering the active framework evaluation (NestJS vs. ASP.NET Core .NET 8/9), 10 EDC domain module boundaries, dual-protocol communication (REST + WebSockets/SignalR), dynamic 3-cluster MongoDB data access multiplexing, and FDA 21 CFR Part 11 compliance interceptors.
* **[003-dto-design-and-graphql-evaluation-adr.md](./api/003-dto-design-and-graphql-evaluation-adr.md)**:
  Architecture Decision Record establishing the **3-Tier Model Decoupling Architecture** (UI View State $\ne$ Public Wire DTOs $\ne$ Internal BSON Entities) and the **formal rejection of GraphQL** in regulated clinical EDC. Features an exhaustive 5-failure-mode regulatory autopsy of GraphQL (audit trail collapse under 21 CFR Part 11 § 11.10(e), DoS query abuse, lost HTTP caching, binary streaming overhead, and GAMP 5 validation friction) paired with the accepted **Clean REST + BFF (Backend-For-Frontend)** pattern for Desktop Web EDC and Mobile ePRO (iOS/Android).
* **[004-repository-architecture-monorepo-vs-submodule-adr.md](./api/004-repository-architecture-monorepo-vs-submodule-adr.md)**:
  Architecture Decision Record establishing the **Unified Monorepo Architecture with Dedicated `backend/api/` Folder Structure** and formally rejecting Git submodules. Documents how path-filtered CI/CD workflows guarantee 100% decoupled frontend/backend deployments while enabling "shift-left" breaking contract detection, a shared golden validation parity test suite, single-command local developer onboarding, and single-SHA 21 CFR Part 11 regulatory release traceability.
* **[005-api-foundations-auth-override-engine-and-realtime-adr.md](./api/005-api-foundations-auth-override-engine-and-realtime-adr.md)**:
  Architecture Decision Record establishing the **Core API Operational Foundations**: (1) Hybrid Security & Context Resolution (cryptographic JWT claims + explicit HTTP routing headers `X-Tenant-Id`, `X-Study-Id`, `X-Environment`), (2) The GxP "Override Engine" (standardized HTTP 428 Precondition Required challenge-response protocol dynamically rendering Angular Sidepanels for 21 CFR Part 11 § 11.10(e) Reason for Change, § 11.200 e-Signatures, and Four-Eyes dual-authorizations), and (3) Unified Real-Time Foundation via ASP.NET Core SignalR (`EdcCollaborationHub` for OCC field locks and `PlatformNotificationHub` for asynchronous exports/alerts with hospital firewall resilience and Redis backplane scaling).
* **[006-api-controller-conventions-seeding-and-migration-adr.md](./api/006-api-controller-conventions-seeding-and-migration-adr.md)**:
  Architecture Decision Record establishing **API Architecture & Operational Standards**: (1) Pure Dependency Injection topology separating domain, infrastructure, and presentation, (2) Convention over Configuration Controller routing utilizing the Uniform Resource + Action Dispatcher pattern (`/actions/{actionName}`) to eliminate an explosion of 300+ fragmented routes down to ~10 clean controllers, (3) Formal adoption of the **IETF HTTP `QUERY` method** (`[HttpQuery]`) replacing `HttpGet` for complex clinical filtering to eliminate 2048-byte URL limits and prevent PHI/PII access log leakage, (4) Decoupled Wire Contracts with Symmetrical Dual AutoMapper ([`@vialiq/automapper`](file:///Users/prashantgupta/code/nx/libs/automapper) on Angular and AutoMapper on .NET), and (5) Initial Database Change Version Control & Seeding foundations.
* **[007-polyglot-database-migration-and-seeding-adr.md](./api/007-polyglot-database-migration-and-seeding-adr.md)**:
  Architecture Decision Record establishing **Enterprise Polyglot Database Migration, Version Control, Multi-Deployment, and Seeding Architecture**: (1) Selection of Liquibase as the unified polyglot migration standard managing both Primary NoSQL (MongoDB 7.0+ across 3 clusters) and Secondary RDBMS (SQL Server 2022+ CDISC SDTM reporting warehouse), (2) Elimination of in-house migration wheel re-invention by resolving the 8 known distributed migration failure modes (multi-pod race conditions, stale lock deadlocks, least-privilege DDL violations, GAMP 5 CSV burden), (3) Self-Healing, Fault-Tolerant Dedicated Deployments via the Kubernetes `initContainer` pattern with automated lock-lease recovery, (4) 3-Phase Expand-Contract zero-downtime rolling upgrades, and (5) 3-Tier Stratified Seeding with a hardcoded physical port guard blocking mock test data from Layer 3 Prod (`27037`).
* **[api-specification-and-contracts.md](./api/api-specification-and-contracts.md)**:
  Full API specification detailing:
  - Role-Based Access Control (RBAC) and 21 CFR Part 11 session inactivity timeout guards.
  - RESTful OpenAPI contracts for Form Definitions, Clinical Data Capture, Audit Trail lookups, Query Discrepancies, and E-Signatures.
  - Real-time WebSocket Gateway (`/ws/edc`) for field-level concurrency locking and live monitor notifications.
  - Shared server-side validation engine runner.

---

## Related System Documentation
- **[Platform Scaling Architecture](../scaling-architecture/README.md)** (Sharding, Load Balancing, Wildcard TLS & Caching)
- [Form Builder JSON Schema Specification](../form-builder-schema.md)
- [Form Builder Validation & Edit Checks](../form-builder-validation.md)
- [Field-Level Encryption (FLE) Specification](../field-level-encryption-clinical-edc.md)
- [Identity, Multi-Tenancy & Regulatory Compliance](./database/auth-identity-multitenancy-clinical-edc.md)

