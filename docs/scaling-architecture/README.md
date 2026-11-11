# Vialiq EDC — Platform Scaling Architecture

This directory establishes the comprehensive enterprise scalability architecture for the Vialiq Electronic Data Capture (EDC) platform, detailing how the system scales across **Data Storage, Global Network Ingress, High-Concurrency Compute, Multi-Level Wildcard TLS, and Distributed Caching & Queuing**.

---

## Architecture Navigation & Document Catalog

```
docs/scaling-architecture/
├── README.md                                                     # You are here (Master Index & Capacity Scorecard)
│
├── 001-database-horizontal-scaling-and-sharding.md               # Scale 001: Data Tier Scale-Out & Sharding
├── 002-global-load-balancing-and-traffic-routing.md              # Scale 002: Ingress, Load Balancing & HPA/KEDA
├── 003-tls-wildcard-certificates-and-custom-domains.md          # Scale 003: Multi-Level Wildcard TLS & Subdomains
├── 004-caching-queues-and-resilience-patterns.md                 # Scale 004: Redis, RabbitMQ & Herd Mitigation
├── 005-database-cluster-farm-regional-compliance-and-throughput-scaling.md # Scale 005: Cluster Farm, Cross-Region, Multi-Geo Compliance & Throughput
├── 005-a-multilingual-study-db-per-site-group-and-reporting-guide.md # Scale 005-A: Multilingual Global Studies with Disjoint Compliance, Site Groups & Reporting
└── 006-post-mvp-event-streaming-kafka-and-central-lab-pipelines.md   # Scale 006 (Deferred Phase 2+): Post-MVP Kafka Fan-Out & Central Lab (LB) Pipelines
```

---

## 1. Document Summaries

### 📄 [001: Database Horizontal Scaling, Cluster Farm & Storage Lifecycle](./001-database-horizontal-scaling-and-sharding.md)
* **Problem Solved**: How the 3-Layer MongoDB architecture scales horizontally when space runs out and studies grow from dozens to thousands, while strictly enforcing 21 CFR Part 11 audit timestamp integrity.
* **Key Architectural Decisions**:
  * **Strict Non-Sharded Study Invariant (ADR 009 & Scale 005)**: A single clinical study database (`study_{id}_prod`) is never sharded across MongoDB nodes/clusters. 100% of writes serialize through a single Primary node, eliminating cross-shard clock skew and guaranteeing monotonic legal audit sequencing.
  * **Dynamic Cluster Farm Routing**: Non-secret registry in Layer 1 Control Plane (`vialiq_control_plane.study_registry`) dynamically routes tenants and studies across distinct physical MongoDB replica set clusters (`rs-prod-01`, `rs-prod-02`).
  * **Mega-Study Dedicated Cluster Promotion**: Studies exceeding 2 TB or experiencing extreme throughput are promoted to dedicated sovereign 3-node replica sets in the farm (or partitioned by Site Group per Scale 005-A) rather than sharded.
  * **CSI Storage Auto-Expansion**: Automated 80% volume expansion triggers.
  * **FDA 25-Year Tiered Archival**: Closed studies offloaded to immutable WORM Apache Parquet archives on S3 Glacier / Azure Blob, slashing live storage by 75% at a 99% cost reduction.

### 📄 [002: Global Load Balancing, Ingress & High-Concurrency Compute](./002-global-load-balancing-and-traffic-routing.md)
* **Problem Solved**: How the system supports 100,000+ concurrent clinical users during peak monitoring bursts without performance degradation.
* **Key Architectural Decisions**:
  * **4-Tier Ingress Topology**: Cloudflare Anycast Geo-DNS $\rightarrow$ Envoy / AWS ALB L7 Ingress $\rightarrow$ In-Cluster Service Mesh $\rightarrow$ Stateless .NET 9 Kestrel Pods.
  * **Weighted Least-Connections & P2C**: Power of Two Choices avoids the thundering herd effect across pods.
  * **Zero-Session Affinity (Stateless JWT)**: Pods hold zero session state; any pod can process any clinical request. Real-time WebSockets scale via the Redis backplane.
  * **Dual-Metric Autoscaling (KEDA + HPA)**: CPU/Memory + active HTTP request queue depth, active SignalR WebSocket connections (Prometheus scaler), and background export worker scaling on Redis queue depth (`edc:export:jobs:pending`).
  * **Zero-Downtime Rolling Updates**: 45-second graceful connection draining (`preStop` sleep 5s + Kestrel shutdown timeout 30s + 10s buffer, `terminationGracePeriodSeconds: 45`) ensures zero dropped transactions.

### 📄 [003: Multi-Tenant Ingress Routing, Wildcard TLS Certificates & Custom Domains](./003-tls-wildcard-certificates-and-custom-domains.md)
* **Problem Solved**: Architecting multi-tenant domain routing, TLS termination, and custom vanity domains while eliminating "study in the URL" anti-patterns.
* **Key Architectural Decisions**:
  * **Complete Exclusion of Study from Hostnames**: Studies and environments are never embedded in URLs (rejecting both `study.tenant.com` and `tenant-study.com`). The hostname strictly identifies the tenant (`novartis.vialiq.com`), while Study and Environment are chosen upon login and managed via in-app global switching, guaranteeing zero-reload CRA multi-study monitoring, unbroken Part 11 sessions, and stable WebSockets.
  * **Single Platform Wildcard Standard (`*.vialiq.com`)**: A single wildcard certificate (`*.vialiq.com` + `vialiq.com`) covers 100% of all tenants, studies, and environments with 0 ms provisioning time, completely eliminating RFC 6125 multi-level wildcard issues and dynamic per-tenant cert-manager automation.
  * **Enterprise Custom Vanity Domains**: Dedicated sponsor domains (`edc.novartis.com`) managed via Cloudflare SSL for SaaS / AWS ACM with automated 90-day renewal and fail-closed middleware binding verified tenant context to `ITenantStudyContextAccessor` and request headers.
  * **Universal API Contract (ADR 005)**: Enforces explicit, separate `X-Tenant-Id`, `X-Study-Id`, and `X-Environment` headers validated against cryptographically signed JWT claims for all operational transactions, restricting hostname resolution strictly to unauthenticated initial portal discovery (`GET /api/v1/auth/discovery`).

### 📄 [004: Caching Strategy, Message Queues & Cache Herd Resilience](./004-caching-queues-and-resilience-patterns.md)
* **Canonical Ownership**: Serves as the operational caching & messaging guide alongside [ADR 007-A](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md) and [ADR 007-B](../critical-problems-and-adrs/007-b-high-availability-redis-cluster-and-scaling-guide.md).
* **Problem Solved**: Protecting primary databases from high concurrency, eliminating the Cache Herd / Stampede problem, and offloading heavy batch compute.
* **Key Architectural Decisions**:
  * **Single-Tier Distributed Redis Caching (Zero `.NET IMemoryCache`)**: Sub-millisecond retrieval of invariant schemas, codelists, and dictionaries (< 1–2 ms) with zero multi-pod L1 stale state.
  * **Cache Herd / Stampede Elimination**: Native single-flight concurrency mutex (`SemaphoreSlim` per key) ensures that when a hot key expires, **exactly 1 thread queries MongoDB while all other 1,500 threads await the result**, completely preventing database collapse.
  * **Probabilistic Early Refresh (XFetch)**: Pre-emptively refreshes critical MedDRA and WHODrug dictionaries before expiration based on read frequency and computation time.
  * **Immediate Cluster-Wide Cache Coherence**: Deleting or rotating keys directly in Shared Redis (`KeyDeleteAsync` or Version Epoch Salt rotation per ADR 008) propagates instantly across all pods without managing pod-local cache invalidation storms.
  * **Asynchronous Queue Topology (RabbitMQ)**: Dedicated queues for 100k-page CDISC ODM exports, safety adverse event alerting, and PDF rendering with Dead Letter Exchanges (DLX), prefetch backpressure, and idempotent consumers.

### 📄 [005: Database Cluster Farm, Cross-Region Placement, Multi-Geography Storage Compliance & Throughput](./005-database-cluster-farm-regional-compliance-and-throughput-scaling.md)
* **Problem Solved**: Scaling MongoDB across hundreds of studies, housing Prod DBs regionally while centralizing User/Admin DB, resolving multi-geography compliance (GDPR vs HIPAA vs China PIPL), and maximizing write/read throughput under high concurrency.
* **Key Architectural Decisions**:
  * **Multi-Cluster Farm Architecture**: Database-per-study isolation distributed across a farm of independent 3-node Replica Sets (`rs-prod-us-01`, `rs-prod-eu-01`), guaranteeing zero noisy-neighbor blast radius.
  * **The Non-Sharded Invariant (ADR 009)**: Each study lives on a single replica set; writes serialize on the Primary node to guarantee FDA Part 11 legal timestamps without 2PC clock drift.
  * **Centralized User DB + Regional Prod DBs**: Users/Admins reside in central Layer 1; Prod DBs reside in local cloud regions. Stateless JWTs with OIDC JWKS validation enable local verification with **zero cross-region authentication round-trips**.
  * **SOW-Flexible Provisioning (`STUDY_INFRA_CONFIG`)**: Tenant-assigned role privilege grants Vialiq Managed Services OR Client Self-Service leads access to bind pre-certified Zone Profiles before Pre-Go-Live Lock at `PROD` FPI.
  * **Site-Level Geo-Partitioned Storage**: Global studies partition data across isolated regional replica sets (`study_global301_us_prod`, `_eu_prod`, `_cn_prod`) based on enrolling clinical site, satisfying local data sovereignty laws with zero cross-border PII leakage.
  * **Canonical CDISC Storage + `Base ↔ Site` UI Toggle**: Schemas store standardized CDISC terminology (`SYS_BP`, `C25473`); the UI loads in `BASE_LANGUAGE` by default, toggles `Base ↔ Site` on Data Entry, routes configured free-text strictly `Site → Base Language`, and captures `cultureCode` in audit metadata.
  * **High-Throughput Maximization**: Strict Primary-only operational consistency (`ReadPreference.Primary`, `ReadConcern.Majority`), high-velocity `audit_crf_data` collection segregation, WiredTiger 256 execution tickets, unordered `BulkWriteAsync` micro-batching for 20,000+ ePRO patient diary surges, and reporting offloading via regional CDC to SQL Server.

### 📄 [005-A: Multilingual Global Studies with Disjoint Compliance, Site Groups & Reporting](./005-a-multilingual-study-db-per-site-group-and-reporting-guide.md)
* **Problem Solved**: Running a single unified global clinical trial across mutually conflicting jurisdictions (US FDA/HIPAA, EU GDPR/CTR, China PIPL/DSL, Japan APPI), dynamically routing site writes to regional databases, maintaining multilingual data invariance, and executing global biostatistical reporting without violating cross-border data privacy laws.
* **Key Architectural Decisions**:
  * **Site-Group Geo-Partitioning**: Single logical `study_registry` manifest (`protocolNumber`, `storageTopology`, `translationConfig`, `medicalCoding`, KMS pointers) locked before `PROD` FPI; physical writes dynamically routed to dedicated regional replica sets (`rs-prod-us`, `rs-prod-eu`, `rs-prod-cn`).
  * **Dynamic Site Assignment Engine**: Declarative rules in `study_registry` (e.g., `Site.CountryCode == 'CN' -> ZONE_CN`) with Part 11-audited manual override support for sovereign exceptions (e.g. Switzerland).
  * **Multilingual `Site → Base` Invariance**: Studies default to `BASE_LANGUAGE`; Site workflows use `SITE_LANGUAGE` (immutable); Data Entry provides `Base ↔ Site` toggle and free-text translation exclusively `Site → Base` (preserving original local verbatims).
  * **Cryptographic Sovereignty (CSFLE + Regional `__keyVault` DBs)**: Actual wrapped DEKs stay physically inside regional cluster Key Vaults wrapped by regional HSMs (`study_registry` holds non-secret pointers only); GDPR Art. 17 crypto-shredding erases PII across both `crf_entries` and `audit_trail` snapshots (`[REDACTED — GDPR ARTICLE 17]`) without invalidating Part 11 audit chains.
  * **The 3-Tier Global Reporting Taxonomy**:
    1. *Local Operational Reports*: Direct primary reads on regional clusters ($<10\text{ ms}$) guaranteeing Read-Your-Own-Writes consistency.
    2. *Fast Cross-Zone Dashboards*: Powered by **Central SQL Server 2022 / Rollup Store** ($<15\text{ ms}$) using non-PII regional metric rollups—eliminating slow/brittle cross-WAN queries across Great Firewalls.
    3. *Global Biostatistics & SDTM*: Regional CDC boundary workers inside each VPC drop `SiteIdentifier` PII per ADR 004 before emitting pseudonymized `ClinicalResearch` rows and scrubbed/coded terms into Central SQL Server.
  * **Inter-Zone Transfers & Regulatory Audits**: Governed end-to-end by [**FTS-003**](../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md).

* **Phase 2+ Scope Note:** Multi-sink Kafka streaming (`SQL Server + Snowflake + AI/ML + Webhooks`) and high-volume Central Lab (`LB`) streaming are intentionally deferred post-MVP; see [`Scale 006`](./006-post-mvp-event-streaming-kafka-and-central-lab-pipelines.md).

---

## 2. Platform Production Capacity & SLA Targets

```
=============================================================================================================
VIALIQ PLATFORM PRODUCTION SCALING TARGETS
=============================================================================================================
Dimension                       Baseline (Single Node)        Scaled Target Topology          Operational Guarantee
-------------------------------------------------------------------------------------------------------------
Concurrent Clinical Users       1,500 Users                   100,000+ Active Users          Zero session drops
HTTP Request Throughput         1,200 Req/sec                 35,000+ Req/sec                p99 < 50ms latency
Concurrent WebSockets (SignalR) 2,000 Connections             80,000+ Connections             Redis Pub/Sub Sync
Active Concurrent Studies       50 Studies                    1,000+ Active Studies          Multi-Cluster Farm Partitioning
Patients per Mega-Study         5,000 Subjects                100,000+ Subjects              Compound Key {study, subj}
Storage Volume                  4 TB Single Disk              50+ TB Aggregate NVMe          Auto-Expanding CSI Disks
Hot Schema Cache Latency        45 ms (MongoDB Aggregation)   < 1–2 ms (Distributed Redis)   ~30x Faster, Zero Pod Drift
Cache Stampede Immunity         Vulnerable to Pool Collapse   100% Collapse Immune           Single-Flight Mutex
Heavy CDISC Export Processing   Crashes HTTP Threads (504)    Asynchronous Queue (HTTP 202)  Zero Web Latency Impact
Deployment Availability         99.5% (Downtime on rollout)   99.99% (Four Nines)            Zero-Downtime RollingUpdate
=============================================================================================================
```

---

## 3. Cross-System Architectural References & Canonical Ownership

* **Database Tier Architecture**: [`../backend-architecture/database/`](../backend-architecture/database/)
* **API Tier Architecture**: [`../backend-architecture/api/`](../backend-architecture/api/)
* **Canonical Distributed Caching Architecture**: [`004: Distributed Redis & RabbitMQ`](./004-caching-queues-and-resilience-patterns.md) · [`ADR 007-A: Security Scoping`](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md) · [`ADR 007-B: HA Redis Cluster`](../critical-problems-and-adrs/007-b-high-availability-redis-cluster-and-scaling-guide.md) · [`ADR 008: Pre-Warmed Amendments`](../critical-problems-and-adrs/008-protocol-amendment-cache-invalidation-and-epoch-rotation-adr.md)
* **Inter-Zone Transfers, Inspections & Study Governance**: [`FTS-003`](../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md)
* **Full-Stack Enterprise Evaluation & Readiness Analysis**: [`../enterprise-fullstack-architecture-evaluation-and-readiness.md`](../enterprise-fullstack-architecture-evaluation-and-readiness.md)
* **Regulatory Compliance Framework**: [`../backend-architecture/database/auth-identity-multitenancy-clinical-edc.md`](../backend-architecture/database/auth-identity-multitenancy-clinical-edc.md)

