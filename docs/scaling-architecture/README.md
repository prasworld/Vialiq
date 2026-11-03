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
├── 004-caching-queues-and-resilience-patterns.md                 # Scale 004: HybridCache, RabbitMQ & Herd Mitigation
├── 005-database-cluster-farm-regional-compliance-and-throughput-scaling.md # Scale 005: Cluster Farm, Cross-Region, Multi-Geo Compliance & Throughput
└── 005-a-multilingual-study-db-per-site-group-and-reporting-guide.md # Scale 005-A: Multilingual Global Studies with Disjoint Compliance, Site Groups & Reporting
```

---

## 1. Document Summaries

### 📄 [001: Database Horizontal Scaling, Sharding & Storage Lifecycle](./001-database-horizontal-scaling-and-sharding.md)
* **Problem Solved**: How the 3-Layer MongoDB architecture scales out when space runs out and studies grow from dozens to thousands.
* **Key Architectural Decisions**:
  * **Dynamic Cluster Farm Routing**: Registry in Layer 1 Admin (`vialiq_admin_control`) dynamically routes tenants and studies across distinct physical MongoDB replica set clusters (`rs-prod-01`, `rs-prod-02`).
  * **Mega-Trial Sharding Strategy**: Compound sharding key `{ study_id: 1, subject_id: 1 }` guarantees single-shard targeted routing and high-performance ACID transactions within patient visits, eliminating scatter-gather queries.
  * **CSI Storage Auto-Expansion**: Automated 80% volume expansion triggers.
  * **FDA 25-Year Tiered Archival**: Closed studies offloaded to immutable WORM Apache Parquet archives on S3 Glacier / Azure Blob, slashing live storage by 75% at a 99% cost reduction.

### 📄 [002: Global Load Balancing, Ingress & High-Concurrency Compute](./002-global-load-balancing-and-traffic-routing.md)
* **Problem Solved**: How the system supports 100,000+ concurrent clinical users during peak monitoring bursts without performance degradation.
* **Key Architectural Decisions**:
  * **4-Tier Ingress Topology**: Cloudflare Anycast Geo-DNS $\rightarrow$ Envoy / AWS ALB L7 Ingress $\rightarrow$ In-Cluster Service Mesh $\rightarrow$ Stateless .NET 9 Kestrel Pods.
  * **Weighted Least-Connections & P2C**: Power of Two Choices avoids the thundering herd effect across pods.
  * **Zero-Session Affinity (Stateless JWT)**: Pods hold zero session state; any pod can process any clinical request. Real-time WebSockets scale via the Redis backplane.
  * **Dual-Metric Autoscaling (HPA + KEDA)**: CPU/Memory + active HTTP request queue depth (scaling from 3 to 50+ pods in 15 seconds).
  * **Zero-Downtime Rolling Updates**: 30-second graceful connection draining (`preStop` sleep 5s + Kestrel shutdown timeout 30s) ensures zero dropped transactions.

### 📄 [003: Multi-Level Wildcard TLS Certificates & Custom Domains](./003-tls-wildcard-certificates-and-custom-domains.md)
* **Problem Solved**: How to support `*.vialiq.com`, nested `*.*.vialiq.com` (`study.client.vialiq.com`), and client vanity domains (`edc.novartis.com`).
* **Key Architectural Decisions**:
  * **RFC 6125 TLS Constraint Solved**: Wildcard certificates (`*`) only match a single domain label; CAs prohibit `*.*.vialiq.com`.
  * **Pattern 1 (Default Industry Standard)**: Single-level hyphenated subdomains (`novartis-onco101.vialiq.com`) matching a single `*.vialiq.com` wildcard with 100% turnkey speed and zero cert maintenance.
  * **Pattern 2 (Nested Subdomains)**: Dynamic per-tenant wildcard certificates (`*.novartis.vialiq.com`) automated via Kubernetes `cert-manager` with ACME DNS-01 challenges and dynamic SNI resolution in Envoy Ingress.
  * **Pattern 3 (Enterprise Custom Vanity)**: Dedicated sponsor domains (`edc.novartis.com`) managed via Cloudflare SSL for SaaS / AWS ACM with automated 90-day renewal.
  * **ASP.NET Core Subdomain Middleware**: Automatically parses incoming `Host` headers into `X-Tenant-Id` and `X-Study-Id` context.

### 📄 [004: Caching Strategy, Message Queues & Cache Herd Resilience](./004-caching-queues-and-resilience-patterns.md)
* **Problem Solved**: Protecting primary databases from high concurrency, eliminating the Cache Herd / Stampede problem, and offloading heavy batch compute.
* **Key Architectural Decisions**:
  * **Multi-Tier .NET 9 `HybridCache`**: Unifies L1 In-Memory (< 1 microsecond) with L2 Redis Cluster (< 2 ms).
  * **Cache Herd / Stampede Elimination**: Native single-flight concurrency mutex (`SemaphoreSlim` per key) ensures that when a hot key expires, **exactly 1 thread queries MongoDB while all other 1,500 threads await the result**, completely preventing database collapse.
  * **Probabilistic Early Refresh (XFetch)**: Pre-emptively refreshes critical MedDRA and WHODrug dictionaries before expiration based on read frequency and computation time.
  * **Event-Driven Cache Invalidation**: Redis Pub/Sub invalidates L1 caches across all 50 API pods in < 5 ms when a Form Schema or Codelist is published.
  * **Asynchronous Queue Topology (RabbitMQ)**: Dedicated queues for 100k-page CDISC ODM exports, safety adverse event alerting, and PDF rendering with Dead Letter Exchanges (DLX), prefetch backpressure, and idempotent consumers.

### 📄 [005: Database Cluster Farm, Cross-Region Placement, Multi-Geography Storage Compliance & Throughput](./005-database-cluster-farm-regional-compliance-and-throughput-scaling.md)
* **Problem Solved**: Scaling MongoDB across hundreds of studies, housing Prod DBs regionally while centralizing User/Admin DB, resolving multi-geography compliance (GDPR vs HIPAA vs China PIPL), and maximizing write/read throughput under high concurrency.
* **Key Architectural Decisions**:
  * **Multi-Cluster Farm Architecture**: Database-per-study isolation distributed across a farm of independent 3-node Replica Sets (`rs-prod-us-01`, `rs-prod-eu-01`), guaranteeing zero noisy-neighbor blast radius.
  * **The Non-Sharded Invariant (ADR 009)**: Each study lives on a single replica set; writes serialize on the Primary node to guarantee FDA Part 11 legal timestamps without 2PC clock drift.
  * **Centralized User DB + Regional Prod DBs**: Users/Admins reside in central Layer 1; Prod DBs reside in local cloud regions. Stateless JWTs with cached JWKS public keys enable local validation with **zero cross-region authentication round-trips**.
  * **Study Admin Provisioning Wizard**: Sponsor admins configure target storage region, compliance profile, and KMS key directly during study creation.
  * **Site-Level Geo-Partitioned Storage**: Global studies partition data across regional cluster shards (`study_global301_us`, `_eu`, `_cn`) based on enrolling clinical site, satisfying local data sovereignty laws with zero cross-border PII leakage.
  * **Canonical CDISC Storage + Localized Presentation**: Schemas store standardized CDISC terminology (`SYS_BP`, `C25473`) while the UI renders native localized text and captures `cultureCode` in audit metadata.
  * **High-Throughput Maximization**: Workload bifurcation (`ReadPreference.SecondaryPreferred`), high-velocity `audit_crf_data` collection segregation, WiredTiger 256 execution tickets, and unordered `BulkWriteAsync` micro-batching for 20,000+ ePRO patient diary surges.

### 📄 [005-A: Multilingual Global Studies with Disjoint Compliance, Site Groups & Reporting](./005-a-multilingual-study-db-per-site-group-and-reporting-guide.md)
* **Problem Solved**: Running a single unified global clinical trial across mutually conflicting jurisdictions (US FDA/HIPAA, EU GDPR/CTR, China PIPL/DSL, Japan APPI), dynamically routing site writes to regional databases, maintaining multilingual data invariance, and executing global biostatistical reporting without violating cross-border data privacy laws.
* **Key Architectural Decisions**:
  * **Site-Group Geo-Partitioning**: Single logical study manifest in Layer 1; physical writes dynamically routed to dedicated regional replica sets (`rs-prod-us`, `rs-prod-eu`, `rs-prod-cn`) based on the enrolling site.
  * **Dynamic Site Assignment Engine**: Declarative rules in `study_registry` (e.g., `Site.CountryCode == 'CN' -> ZONE_CN`) with manual partition override support for unique sovereign sites (e.g. Switzerland).
  * **Canonical CDISC Data Invariance**: Databases store immutable universal CDISC concept codes (`SYSBP`, `C25473`); the UI renders localized terms dynamically and records entry `cultureCode` in the Part 11 audit trail.
  * **Cryptographic Sovereignty (CSFLE + Regional KMS)**: European and Chinese patient DEKs are protected by local regional KMS/HSMs, preventing foreign administrators from decrypting patient PII even with physical disk access; enables GDPR Article 17 crypto-shredding without invalidating Part 11 audit trails.
  * **The 3-Tier Global Reporting Taxonomy**:
    1. *Local Operational Reports*: Direct secondary reads on regional clusters ($<10\text{ ms}$).
    2. *Global Executive Dashboards*: Federated Push-Down Aggregations where only mathematical sums/counts leave sovereign borders (zero PII crosses the wire).
    3. *Global Biostatistics & FDA Submission*: De-identified CDC pipeline (ADR 004) streaming sanitized research data into the central SQL Server / Snowflake reporting warehouse.

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
Concurrent WebSockets (SignalR) 2,000 Connections             80,000+ Concurrent Leases       Redis Pub/Sub Sync
Active Concurrent Studies       50 Studies                    1,000+ Active Studies          Cluster Farm Sharding
Patients per Mega-Study         5,000 Subjects                100,000+ Subjects              Compound Key {study, subj}
Storage Volume                  4 TB Single Disk              50+ TB Aggregate NVMe          Auto-Expanding CSI Disks
Hot Schema Cache Latency        45 ms (MongoDB Aggregation)   < 1 microsecond (L1 In-Memory) 45,000x Speedup
Cache Stampede Immunity         Vulnerable to Pool Collapse   100% Collapse Immune           Single-Flight Mutex
Heavy CDISC Export Processing   Crashes HTTP Threads (504)    Asynchronous Queue (HTTP 202)  Zero Web Latency Impact
Deployment Availability         99.5% (Downtime on rollout)   99.99% (Four Nines)            Zero-Downtime RollingUpdate
=============================================================================================================
```

---

## 3. Cross-System Architectural References

* **Database Tier Architecture**: [`../backend-architecture/database/`](file:///Users/prashantgupta/code/nx/docs/backend-architecture/database/)
* **API Tier Architecture**: [`../backend-architecture/api/`](file:///Users/prashantgupta/code/nx/docs/backend-architecture/api/)
* **Full-Stack Enterprise Evaluation & Readiness Analysis**: [`../enterprise-fullstack-architecture-evaluation-and-readiness.md`](file:///Users/prashantgupta/code/nx/docs/enterprise-fullstack-architecture-evaluation-and-readiness.md)
* **Regulatory Compliance Framework**: [`../backend-architecture/database/auth-identity-multitenancy-clinical-edc.md`](file:///Users/prashantgupta/code/nx/docs/backend-architecture/database/auth-identity-multitenancy-clinical-edc.md)

