# Scaling Architecture: Database Cluster Farm, Cross-Region Placement, Multi-Geography Storage Compliance, and Peak Throughput Maximization

> **Document ID:** `VIALIQ-SCALE-005`  
> **Domain:** Platform Scalability — Data Tier, Global Placement & Concurrency Architecture  
> **Status:** Accepted / Active Architecture Standard  
> **Date:** November 2026  
> **Target Systems:** MongoDB 7.0+ (Replica Sets & Cluster Farms), .NET 9 Kestrel, Redis 7.2 HA, AWS KMS / Azure Key Vault, Kafka CDC  
> **Regulatory Standards:** FDA 21 CFR Part 11, EU Clinical Trials Regulation (EU CTR 536/2014), GDPR Art. 9/17/28, HIPAA Security Rule § 164.312, China PIPL & Data Security Law (DSL), Japan APPI, ICH GCP E6(R3) Section 5.18, GAMP 5 Category 4  
> **Related Architecture Documents:**
> - [ADR 004: CSFLE-to-SQL Server CDC Decryption Boundary](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)
> - [ADR 006: 21 CFR Part 11 Audit Trail Architecture](../critical-problems-and-adrs/006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md)
> - [ADR 007-A: Multi-Tenant Cache Isolation & Security Scoping](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md)
> - [ADR 007-B: High-Availability Redis Cluster Architecture & Scaling Guide](../critical-problems-and-adrs/007-b-high-availability-redis-cluster-and-scaling-guide.md)
> - [ADR 009: Legal Timestamp Authority & Monotonic Sequencing](../critical-problems-and-adrs/009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md)
> - [ADR 010: Double-Blind RTSM Unblinding Prevention in Caching Tiers](../critical-problems-and-adrs/010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md)
> - [Scale 001: Database Horizontal Scaling & Storage Lifecycle](./001-database-horizontal-scaling-and-sharding.md)
> - [Scale 004: Caching Strategy, Message Queues & Cache Herd Resilience](./004-caching-queues-and-resilience-patterns.md)

---

## Table of Contents

1. [Executive Summary & Problem Context](#1-executive-summary--problem-context)
2. [Section 1: Multi-Cluster Farm Architecture (Database-per-Study Scaling)](#2-section-1-multi-cluster-farm-architecture-database-per-study-scaling)
   - [1.1 The Multi-Cluster Farm Topology](#11-the-multi-cluster-farm-topology)
   - [1.2 The Non-Sharded Study Invariant (ADR 009 Tie-In)](#12-the-non-sharded-study-invariant-adr-009-tie-in)
   - [1.3 Failure Domain & Blast Radius Isolation](#13-failure-domain--blast-radius-isolation)
   - [1.4 Dynamic Connection Pool Routing in C# (.NET 9)](#14-dynamic-connection-pool-routing-in-c-net-9)
3. [Section 2: Cross-Region Deployment (Regional Prod DBs vs. Centralized Admin / User DB)](#3-section-2-cross-region-deployment-regional-prod-dbs-vs-centralized-admin--user-db)
   - [2.1 Architectural Answer: Can ONLY the Prod DB Be Regionalized?](#21-architectural-answer-can-only-the-prod-db-be-regionalized)
   - [2.2 Centralized User Management & Identity Control Plane](#22-centralized-user-management--identity-control-plane)
   - [2.3 Study Admin Configuration: Provisioning Regional Studies](#23-study-admin-configuration-provisioning-regional-studies)
   - [2.4 Cross-Region Latency & Stateless JWT Verification](#24-cross-region-latency--stateless-jwt-verification)
4. [Section 3: Multilingual & Multi-Geography Studies with Disjoint Compliance Mandates](#4-section-3-multilingual--multi-geography-studies-with-disjoint-compliance-mandates)
   - [3.1 The Global Clinical Trial Use Case (US vs. EU vs. China vs. Japan)](#31-the-global-clinical-trial-use-case-us-vs-eu-vs-china-vs-japan)
   - [3.2 Geo-Partitioned Storage Architecture (Site-Level Data Residency)](#32-geo-partitioned-storage-architecture-site-level-data-residency)
   - [3.3 Multilingual Schema vs. Storage Encoding Invariant](#33-multilingual-schema-vs-storage-encoding-invariant)
   - [3.4 Cryptographic Boundary: Localized Key Management (CSFLE + Regional KMS)](#34-cryptographic-boundary-localized-key-management-csfle--regional-kms)
   - [3.5 Cross-Border Aggregation & De-Identified Analytical Rollup (Kafka CDC)](#35-cross-border-aggregation--de-identified-analytical-rollup-kafka-cdc)
5. [Section 4: Maximizing Throughput under Extreme High-Concurrency Surges](#5-section-4-maximizing-throughput-under-extreme-high-concurrency-surges)
   - [4.1 The Peak Clinical Concurrency Challenge](#41-the-peak-clinical-concurrency-challenge)
   - [4.2 Strategy 1: Read/Write Workload Bifurcation (`SecondaryPreferred`)](#42-strategy-1-readwrite-workload-bifurcation-secondarypreferred)
   - [4.3 Strategy 2: High-Velocity Audit Collection Segregation](#43-strategy-2-high-velocity-audit-collection-segregation)
   - [4.4 Strategy 3: WiredTiger Memory, Ticket & IOPS Tuning](#44-strategy-3-wiredtiger-memory-ticket--iops-tuning)
   - [4.5 Strategy 4: High-Velocity ePRO Bulk Ingestion & Micro-Batching](#45-strategy-4-high-velocity-epro-bulk-ingestion--micro-batching)
   - [4.6 Strategy 5: ASP.NET Core Kestrel Zero-Allocation Pipeline](#46-strategy-5-aspnet-core-kestrel-zero-allocation-pipeline)
6. [Summary Architecture Matrix & Capacity Guarantees](#6-summary-architecture-matrix--capacity-guarantees)
7. [Operational Checklist: Provisioning a New Study Cluster](#7-operational-checklist-provisioning-a-new-study-cluster)

---

## 1. Executive Summary & Problem Context

As the Vialiq Clinical EDC platform expands from domestic Phase 1 safety trials to massive multi-center, multi-national Phase 3 global pivotal studies, the data tier must accommodate four complex architectural challenges:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 4 PILLARS OF DATABASE SCALING & GOVERNANCE                           │
├────────────────────────────────────┬───────────────────────────────────────────────────────────────────┤
│ 1. Multi-Cluster Scaling           │ Scaling from 10 to 1,000+ studies without single-cluster collapse│
│ 2. Cross-Region Placements         │ Housing Prod DBs in regional clouds while centralizing user auth │
│ 3. Multi-Geography Compliance      │ Resolving disjoint sovereignty laws (GDPR, HIPAA, China PIPL)     │
│ 4. Peak Concurrency Throughput     │ Maximizing write & read IOPS during global morning clinic surges  │
└────────────────────────────────────┴───────────────────────────────────────────────────────────────────┘
```

This specification provides the authoritative, engineering-grade implementation blueprint for dynamic cluster routing, regional data residency provisioning, localized envelope encryption, and non-blocking high-throughput database operations.

---

## 2. Section 1: Multi-Cluster Farm Architecture (Database-per-Study Scaling)

### 1.1 The Multi-Cluster Farm Topology

In traditional monolithic EDC architectures, all studies are hosted on a single database cluster. In a clinical SaaS platform with 500+ active clinical trials, this leads to **noisy-neighbor degradation** (e.g. an automated biostatistics extract in an oncology trial consuming IOPS and stalling vital sign entry in a cardiology trial), index cache eviction, and an catastrophic blast radius if the cluster fails.

To solve this, Vialiq implements a **Multi-Cluster Farm Architecture**:

```
                                  CENTRAL CONTROL PLANE (LAYER 1)
                            ┌───────────────────────────────────────────┐
                            │  vialiq_control_plane (Port 27017: Admin) │
                            │  - Global Tenants & User Identity (OIDC)  │
                            │  - db_routing_registry                    │
                            └─────────────────────┬─────────────────────┘
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
   PROD CLUSTER FARM 01             PROD CLUSTER FARM 02             PROD CLUSTER FARM 03
   (Replica Set: rs-prod-us-01)     (Replica Set: rs-prod-us-02)     (Replica Set: rs-prod-eu-01)
   ├──────────────────────────┤     ├──────────────────────────┤     ├──────────────────────────┤
   │ Primary + 2 Secondaries  │     │ Primary + 2 Secondaries  │     │ Primary + 2 Secondaries  │
   │ Standard Multi-Study Tier│     │ Standard Multi-Study Tier│     │ Dedicated EU Pharma Tier │
   │                          │     │                          │     │                          │
   │ • study_onc101_prod      │     │ • study_neuro201_prod    │     │ • study_roche_pivotal    │
   │ • study_card202_prod     │     │ • study_metab302_prod    │     │   (Single-Tenant Clust.) │
   │ • study_derm105_prod     │     │ • study_rare404_prod     │     │ • study_novartis_immuno  │
   └──────────────────────────┘     └──────────────────────────┘     └──────────────────────────┘
```

### 1.2 The Non-Sharded Study Invariant (ADR 009 Tie-In)

A foundational architectural rule established in [ADR 009](../critical-problems-and-adrs/009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md) is the **Non-Sharded Study Invariant**:

> **Rule:** A single clinical study database (`study_{studyId}_prod`) shall **NEVER be sharded across multiple MongoDB clusters**.

#### Why Studies Are Kept Non-Sharded Within a Replica Set:
1. **Size Realities of Clinical Data**: A large Phase 3 trial with 5,000 subjects over 4 years produces approximately 15 GB to 30 GB of clinical data. A standard 3-node MongoDB Replica Set on modern NVMe drives handles this effortlessly.
2. **Legal Regulatory Timestamp Authority**: Because 100% of write operations for a study commit to the exact same **single Primary MongoDB node**, writes are serialized through the single node's Oplog.
3. **Zero Distributed Clock Skew**: Eliminates cross-shard distributed transactions (two-phase commit / 2PC), vector clocks, and clock-drift race hazards. Every audit record receives an unambiguous legal timestamp (`ServerTimestampUtc`) and an atomic monotonic sequence number (`$inc: { auditStreamSequence: 1 }`).

#### Horizontal Scaling via Cluster Partitioning:
While an individual study is never sharded across clusters, **the platform as a whole scales infinitely by assigning different studies to different physical replica set clusters** in the farm.

### 1.3 Failure Domain & Blast Radius Isolation

| Isolation Dimension | Single Monolithic Cluster | Vialiq Multi-Cluster Farm | Regulatory & Operational Benefit |
|---|---|---|---|
| **Blast Radius** | Failure crashes 100% of studies across all sponsors | Failure isolated strictly to the studies on that specific cluster | 99.999% availability for unaffected clusters; GxP compliant |
| **Noisy-Neighbor Contention** | Massive SAS bulk extraction locks shared resources | Independent CPU, RAM, and IOPS per cluster farm | CRCs entering real-time data experience zero latency spikes |
| **Maintenance & Patching** | Platform-wide maintenance window required | Rolling cluster-by-cluster maintenance windows | Zero-downtime fleet upgrades |
| **Tiered Hardware Allocation** | One-size-fits-all hardware profile | Fast NVMe for high-velocity trials; Standard SSD for long-term | Optimized cloud infrastructure TCO |
| **Clean Trial Decommissioning** | Complex row-level purging risking foreign key locks | Native `db.dropDatabase()` on completion | Complete, zero-residual data erasure |

---

### 1.4 Dynamic Connection Pool Routing in C# (.NET 9)

In `Vialiq.Infrastructure`, connection pooling is handled dynamically via `DynamicClusterConnectionPool`. The factory maintains singleton `MongoClient` instances mapped to physical cluster endpoints, while resolving the specific database context per request:

```csharp
namespace Vialiq.Infrastructure.Data;

using System;
using System.Collections.Concurrent;
using MongoDB.Driver;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

public sealed class DynamicClusterConnectionPool : IConnectionPoolManager
{
    private readonly ConcurrentDictionary<string, IMongoClient> _clusterClients = new();
    private readonly IStudyRegistryService _registryService;

    public DynamicClusterConnectionPool(IStudyRegistryService registryService)
    {
        _registryService = registryService;
    }

    public IMongoDatabase GetDatabase(TenantStudyContext context)
    {
        // 1. In Control Plane operations, return the central Admin database
        if (string.IsNullOrEmpty(context.StudyId))
        {
            return GetClient("rs-admin").GetDatabase("vialiq_control_plane");
        }

        // 2. Resolve study cluster assignment from cached registry in Layer 1
        var assignment = _registryService.GetRoutingAssignment(context.TenantId, context.StudyId, context.Environment);

        // 3. Retrieve or lazily construct the singleton MongoClient for this cluster
        var client = _clusterClients.GetOrAdd(assignment.ClusterId, _ =>
        {
            var settings = MongoClientSettings.FromConnectionString(assignment.ConnectionUri);
            settings.MaxConnectionPoolSize = assignment.MaxPoolSize; // e.g. 200
            settings.MinConnectionPoolSize = 20;
            settings.WaitQueueTimeout = TimeSpan.FromSeconds(3);
            settings.ReadPreference = ReadPreference.SecondaryPreferred;
            settings.WriteConcern = WriteConcern.WMajority;
            return new MongoClient(settings);
        });

        // 4. Return the isolated database on the resolved physical cluster
        return client.GetDatabase(assignment.DatabaseName);
    }

    private IMongoClient GetClient(string clusterId)
    {
        // Internal lookup for control plane client
        return _clusterClients.GetOrAdd(clusterId, _ => new MongoClient("mongodb://localhost:27017/?replicaSet=rs-admin"));
    }
}
```

---

## 3. Section 2: Cross-Region Deployment (Regional Prod DBs vs. Centralized Admin / User DB)

### 2.1 Architectural Answer: Can ONLY the Prod DB Be Regionalized?

> **Question:** *Can only the Prod DB—and not the User DB / Admin DB—lie in a different cloud region?*  
> **Verdict:** **YES, ABSOLUTELY.** This is not only possible, but is the **optimal, recommended architectural topology** for global clinical trials SaaS.

```
                              CENTRALIZED CONTROL PLANE vs. REGIONAL PROD DBS
                                                     │
                             ┌───────────────────────┴───────────────────────┐
                             ▼                                               ▼
               CENTRALIZED LAYER 1 (ADMIN)                         REGIONALIZED LAYER 3 (PROD)
               ---------------------------                         ---------------------------
               • Global User Accounts & Credentials                • Patient Clinical Records (CRFs)
               • SSO / IdP Federation (Keycloak / Okta)            • Protected Health Information (PHI)
               • Tenant Subscriptions & Role Mappings              • 21 CFR Part 11 Audit Trail Logs
               • Study Catalog & Routing Registry                  • Double-Blind RTSM Allocations
               • ZERO Patient Clinical Data                        • Regional Data Sovereignty Mandate
```

#### Why User Management Must Remain Centralized:
1. **Global Clinical Investigator Persona**: A Principal Investigator (e.g. Dr. Jane Doe) frequently conducts multiple clinical studies simultaneously—for instance, an oncology study sponsored by a US pharma and a rare disease study sponsored by an EU biotech.
2. **Single Identity, Multi-Tenant Role Mapping**: Centralized user identity allows a single user identity (`users` in Layer 1) to hold cryptographically verifiable roles across multiple studies without duplicate accounts, password synchronization issues, or fragmented credential audits.

#### Why Production Databases Must Be Regionalized:
1. **Data Sovereignty Compliance**: Legal frameworks (EU GDPR Chapter V, China PIPL, Russian Federal Law No. 242-FZ) strictly regulate or prohibit the export of citizen medical data.
2. **Sub-Millisecond Clinical Ingestion**: Site staff entering 200-field CRFs require snappy response times ($< 50\text{ ms}$). Placing the database close to the hospital site eliminates transatlantic fiber round-trip latency.

---

### 2.2 Centralized User Management & Identity Control Plane

The centralized control plane (`vialiq_control_plane` in Layer 1) manages users, tenants, and studies, but contains **zero clinical records**:

```
vialiq_control_plane
├── tenants                     # Client/Sponsor metadata (Novartis, Roche, Pfizer)
├── users                       # Global user identities, email, MFA secrets
├── study_registry              # Catalog of all clinical studies & protocol metadata
├── study_user_assignments      # User-to-Study-to-Role bindings (Dr. Smith -> PI in ONCO-101)
└── db_routing_registry         # Cluster connection strings & target regions
```

---

### 2.3 Study Admin Configuration: Provisioning Regional Studies

During study provisioning in the Study Admin UI or via the Admin API (`POST /api/v1/admin/studies`), the Sponsor Administrator selects the **Storage Region** and **Data Sovereignty Policy**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STUDY PROVISIONING: STORAGE & REGION WIZARD                    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Protocol Number:    [ ONCO-GLOBAL-301                                                ] │
│ Sponsor Tenant:     [ Roche Pharmaceuticals Global                                   ] │
│ Primary Region:     (•) EU (Frankfurt - eu-central-1)                                  │
│                     ( ) US (N. Virginia - us-east-1)                                   │
│                     ( ) APAC (Tokyo - ap-northeast-1)                                  │
│                     ( ) China (Beijing - cn-north-1)                                   │
│                                                                                        │
│ Compliance Profile: [ EU CTR 536/2014 + GDPR Article 9 (Health Data Residency)       ▼] │
│ Cluster Deployment: (•) Shared High-Performance Cluster Farm (rs-prod-eu-01)          │
│                     ( ) Dedicated Single-Tenant Cluster (Sponsor BYOK KMS)             │
│ CSFLE KMS Provider: [ AWS KMS Frankfurt (arn:aws:kms:eu-central-1:123456789:key/eu)  ▼] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### The Routing Registry Record (`db_routing_registry` in Layer 1):
```json
{
  "_id": "std_roche_onco301",
  "tenant_id": "ten_roche",
  "protocol_number": "ONCO-GLOBAL-301",
  "environment": "prod",
  "target_region": "eu-central-1",
  "compliance_profile": "GDPR_HEALTH_RESIDENCY",
  "assigned_cluster": {
    "cluster_id": "rs-prod-eu-central-01",
    "cluster_type": "ReplicaSet",
    "primary_connection_uri": "mongodb://node1.eu.vialiq.internal:27037,node2.eu.vialiq.internal:27037/?replicaSet=rs-prod-eu",
    "read_preference": "secondaryPreferred",
    "max_pool_size": 200
  },
  "kms_configuration": {
    "provider": "aws-kms",
    "key_arn": "arn:aws:kms:eu-central-1:123456789012:key/7b94e82f-xxxx",
    "region": "eu-central-1"
  },
  "is_active": true
}
```

---

### 2.4 Cross-Region Latency & Stateless JWT Verification

A common concern with centralized user management is: *Will every clinical request in Europe or Asia suffer cross-region latency round-tripping to the US Admin DB for authentication?*

**The answer is NO.** The platform uses **Stateless Cryptographic JWTs (OIDC)**:

```
┌──────────────┐          1. Login Request            ┌───────────────────────────────┐
│ Browser (EU) │ ───────────────────────────────────► │ Keycloak Auth (Primary Region)│
└──────┬───────┘                                      └──────────────┬────────────────┘
       │                                                             │
       │ 2. Issues Signed EdDSA/RS256 JWT                            │
       │    (Contains TenantId, StudyId, Roles, Permissions)         ▼
       │ ◄───────────────────────────────────────────────────────────┘
       │
       │ 3. Clinical Data Save (POST /api/v1/crf-entries)
       │    Headers: Authorization: Bearer <JWT>
       ▼
┌──────────────────────────────────────────────┐
│ Regional API Pod (Frankfurt: eu-central-1)   │
├──────────────────────────────────────────────┤
│ • Validates JWT locally using cached JWKS    │  ◄── ZERO network round-trip to Admin!
│   public key (< 0.1 ms execution time)       │      Token validated in-memory in pod RAM.
│ • Reads study routing from local Redis L2    │  ◄── < 1ms local cache lookup.
│ • Executes write directly to local Mongo Prod│  ◄── < 5ms local VPC database commit.
│   Cluster (rs-prod-eu-central-01)            │
└──────────────────────────────────────────────┘
```

**Result:** Clinical requests execute with **100% regional data locality (< 10ms total latency)**, while user identity and tenant contracts remain globally centralized.

---

## 4. Section 3: Multilingual & Multi-Geography Studies with Disjoint Compliance Mandates

### 3.1 The Global Clinical Trial Use Case (US vs. EU vs. China vs. Japan)

In high-stakes pharmaceutical research, a single clinical protocol (e.g., Phase 3 Oncology `GLOBAL-301`) is executed concurrently across 25+ nations:

```
                                GLOBAL CLINICAL TRIAL PROTOCOL: GLOBAL-301
                                                     │
         ┌───────────────────┬───────────────────────┼───────────────────────┐
         ▼                   ▼                       ▼                       ▼
    UNITED STATES         EUROPEAN UNION           CHINA                   JAPAN
    -------------         --------------           -----                   -----
  • 45 Sites            • 60 Sites (DE, FR, IT)  • 25 Sites (Shanghai, BJ) • 20 Sites (Tokyo, Osaka)
  • FDA 21 CFR Part 11  • EU CTR 536/2014        • NMPA / China DSL / PIPL • PMDA / Japan APPI
  • HIPAA Safe Harbor   • GDPR Art. 9 & 17       • Strict Cross-Border Ban • Japanese MOHW
  • Language: English,  • Languages: German,     • Language: Simplified    • Language: Japanese
    Spanish               French, Italian          Chinese
```

#### The Conflicting Regulatory Matrix:
1. **EU CTR & GDPR Article 9 & 17**: Special category health data cannot be transferred out of the EEA without standard contractual clauses (SCC) or adequacy decisions. Patients retain the "Right to Erasure" (crypto-shredding).
2. **China Data Security Law (DSL) & Personal Information Protection Law (PIPL)**: Medical and genomic data generated from Chinese citizens is classified as **"Core Human Genetic Resources"** and **strictly prohibited from leaving mainland China** without CAC security assessment.
3. **FDA 21 CFR Part 11**: All audit entries must be immutable and permanently retained for 25+ years.

---

### 3.2 Geo-Partitioned Storage Architecture (Site-Level Data Residency)

To satisfy disjoint sovereign laws while preserving a unified clinical protocol, Vialiq implements **Site-Level Geo-Partitioned Storage**:

```
                               GLOBAL PROTOCOL DEFINITION (PUBLISHED MANIFEST)
                              (Identical Form Schema, Visit Schedule & CDISC Keys)
                                                       │
                     ┌─────────────────────────────────┼─────────────────────────────────┐
                     ▼                                 ▼                                 ▼
         STORAGE ZONE 1: US               STORAGE ZONE 2: EU                STORAGE ZONE 3: CHINA
      (rs-prod-us-east: N. Virginia)   (rs-prod-eu-west: Frankfurt)       (rs-prod-cn-north: Beijing)
      ├────────────────────────────┤   ├────────────────────────────┤     ├────────────────────────────┤
      │ • US Sites (001 - 045)     │   │ • EU Sites (046 - 105)     │     │ • CN Sites (106 - 130)     │
      │ • All US Subject Records   │   │ • All EU Subject Records   │     │ • All CN Subject Records   │
      │ • Encrypted via AWS US KMS │   │ • Encrypted via AWS EU KMS │     │ • Encrypted via Local HSM  │
      │ • Database:                │   │ • Database:                │     │ • Database:                │
      │   study_global301_us_prod  │   │   study_global301_eu_prod  │     │   study_global301_cn_prod  │
      └────────────────────────────┘   └────────────────────────────┘     └────────────────────────────┘
```

#### Dynamic Site-to-Zone Resolution Rule:
Every clinical trial site in the system is assigned a `StorageZoneId` during site setup:

$$\text{Subject Storage Location} = f(\text{EnrollingSiteId}) \implies \text{Target Regional Cluster}$$

* When a nurse at **Charité Hospital in Berlin (Site 052, Germany)** saves a CRF for Subject `SUBJ-EU-052-003`, the API routes writes strictly to `study_global301_eu_prod` in Frankfurt.
* When a nurse at **Peking Union Medical College (Site 110, Beijing)** saves a CRF for Subject `SUBJ-CN-110-008`, the API routes writes strictly to `study_global301_cn_prod` in Beijing.
* **No cross-border leakage of patient records or PII occurs.**

---

### 3.3 Multilingual Schema vs. Storage Encoding Invariant

A common architectural trap in multilingual EDC platforms is translating the database column names or storing localized text as field keys (e.g. storing `"Blutdruck"` in German sites and `"TensionArtérielle"` in French sites). This destroys CDISC SDTM compliance and breaks downstream SAS aggregation.

#### The Vialiq Invariant: Canonical Storage Keys + Localized Presentation

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. THE INVARIANT STORAGE RECORD (Stored identically in MongoDB across all regions)     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ {                                                                                      │
│   "studyId": "GLOBAL-301",                                                             │
│   "subjectId": "SUBJ-EU-052-003",                                                      │
│   "siteId": "SITE-052",                                                                │
│   "formKey": "VITAL_SIGNS",                                                            │
│   "data": {                                                                            │
│     "SYS_BP": 120,                                     // Standard CDISC Field Key     │
│     "DIAS_BP": 80,                                     // Standard CDISC Field Key     │
│     "SEVERITY": "C25473"                               // CDISC Codelist Concept ID    │
│   },                                                                                   │
│   "auditMeta": {                                                                       │
│     "cultureCode": "de-DE",                            // Locale metadata for audit    │
│     "clientTimeZoneId": "Europe/Berlin"                                                │
│   }                                                                                    │
│ }                                                                                      │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. DYNAMIC UI PRESENTATION ENGINE (Angular 21 + Web Components)                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • In Berlin (de-DE):   Renders "Systolischer Blutdruck", "Schweregrad: Mild"          │
│ • In Paris (fr-FR):    Renders "Tension Systolique", "Gravité: Légère"                 │
│ • In Tokyo (ja-JP):    Renders "収縮期血圧", "重症度: 軽度"                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

**Guarantees:**
1. Downstream biostatistics and FDA/EMA submissions always query standardized CDISC terminology (`SYS_BP`, `C25473`).
2. Site coordinators and ePRO patients interact 100% in their native language.
3. The Part 11 audit trail captures the exact `cultureCode` in effect at the moment of data entry, satisfying ICH GCP E6(R3) attribution requirements.

---

### 3.4 Cryptographic Boundary: Localized Key Management (CSFLE + Regional KMS)

Building upon [ADR 004](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md), patient PII is protected via **MongoDB Client-Side Field Level Encryption (CSFLE)** using **AES-256-GCM** with an envelope encryption pattern:

```
                                 LOCALIZED ENVELOPE ENCRYPTION
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
STORAGE ZONE 1 (US)                    STORAGE ZONE 2 (EU)                    STORAGE ZONE 3 (CHINA)
• Key Vault: AWS KMS us-east-1         • Key Vault: AWS KMS eu-central-1      • Key Vault: Dedicated Local HSM
• CMK ARN:                             • CMK ARN:                             • Key ID:
  arn:aws:kms:us-east-1:.../cmk-us       arn:aws:kms:eu-central-1:.../cmk-eu    hsm-cn-bj-master-01
• Encrypts: US Subject DEKs            • Encrypts: EU Subject DEKs            • Encrypts: CN Subject DEKs
```

#### The Cryptographic Sovereignty Guarantee:
- The Master Key (CMK) for European patients physically resides inside AWS KMS Frankfurt (`eu-central-1`) and **cannot be exported or invoked outside that region**.
- Even if a US platform super-administrator downloaded a physical backup of the European MongoDB database files, **they cannot decrypt patient identifiers** because the US environment lacks IAM permissions to invoke the EU KMS decrypt API.
- When an EU patient exercises GDPR Article 17 ("Right to be Forgotten"), destroying their specific DEK in the European vault permanently renders their identifying data cryptographically unrecoverable, while the US FDA Part 11 audit ledger remains mathematically valid.

---

### 3.5 Cross-Border Aggregation & De-Identified Analytical Rollup (Kafka CDC)

Global biostatisticians and medical safety committees (DSMB) require cross-study analytics across all 25 countries to detect drug safety signals. 

How can safety monitors analyze global data without violating Chinese or European cross-border privacy laws?

**The Solution: The De-Identification CDC Boundary**:

```
┌─────────────────────────────────┐
│ REGIONAL MONGO PROD (e.g. EU)   │
│ - study_global301_eu_prod       │
│ - Contains PII + Clinical Data  │
└────────────────┬────────────────┘
                 │
                 │ 1. Tail MongoDB Replica Oplog (Change Streams)
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ REGIONAL DEBEZIUM / KAFKA CONNECTOR (Runs inside EU VPC)               │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Automated 3-Tier Boundary Filter (ADR 004):                         │
│    • SiteIdentifier (PII/PHI)      ➔ HARD DROPPED AT INGRESS          │
│    • BlindedRTSM (Treatment Arm)   ➔ MASKED AS "BLINDED"               │
│    • ClinicalResearch (Labs/AEs)   ➔ EMITTED AS PSEUDONYMIZED STREAM   │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 │ 3. De-Identified, Non-PHI Analytical Stream
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ CENTRAL DATA WAREHOUSE (SQL Server 2022+ / Snowflake)                  │
├────────────────────────────────────────────────────────────────────────┤
│ • Normalized CDISC SDTM Tables (LB, AE, VS, DM)                        │
│ • Fully compliant with EU-US Data Privacy Framework & China DSL        │
│ • Powers SAS, R, and Spotfire Safety Analytics across all 25 countries │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Section 4: Maximizing Throughput under Extreme High-Concurrency Surges

### 5.1 The Peak Clinical Concurrency Challenge

While our caching tier (.NET 9 `HybridCache` + Redis) handles 99% of read traffic for invariant schemas, dictionaries, and codelists, **live clinical writes and audit logging CANNOT be cached in Redis** (as mandated by [ADR 007-A](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md) and [ADR 010](../critical-problems-and-adrs/010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md)).

During peak clinical operational hours, the database tier faces massive concurrent throughput surges:
1. **Morning Clinic Shift (09:00 - 11:00 AM)**: 5,000+ clinical research coordinators across 500 hospital sites simultaneously entering vitals, lab results, and dispensing medication kits.
2. **ePRO Diary Synchronizations**: 20,000+ ambulatory trial subjects submitting evening symptom diaries via mobile smartphones within a 30-minute window.
3. **CRA Monitoring & SDV Sprints**: Hundreds of Clinical Research Associates running bulk Source Data Verification (SDV) queries and closing discrepancies ahead of regulatory database lock deadlines.

To maximize database throughput and eliminate queue stalls, the architecture implements **5 dedicated high-throughput strategies**.

---

### 5.2 Strategy 1: Read/Write Workload Bifurcation (`SecondaryPreferred`)

In a standard 3-node MongoDB Replica Set, directing all reads and writes to the Primary node saturates the Primary's WiredTiger execution queue.

Vialiq enforces **strict workload bifurcation** in the connection pool:

```
                                  WORKLOAD ROUTING TOPOLOGY
                                              │
         ┌────────────────────────────────────┴────────────────────────────────────┐
         ▼                                                                         ▼
   PRIMARY NODE (27037)                                                    SECONDARY NODES (27038, 27039)
   --------------------                                                    ------------------------------
   • 100% of Form Save Operations                                          • 100% of Audit Trail History Views
   • 100% of Field Lock Acquisitions                                       • 100% of CRA Monitoring Matrix Queries
   • 100% of Electronic Signatures                                         • 100% of Discrepancy Query Grids
   • Multi-Document ACID Transactions                                      • 100% of CDISC ODM/PDF Bulk Exports
```

#### C# Driver Configuration:
```csharp
// Read-heavy reporting queries route to Secondaries, preserving 100% of Primary IOPS for writes
var readPreference = ReadPreference.SecondaryPreferred;
var collection = database.WithReadPreference(readPreference).GetCollection<BsonDocument>("crf_entries");
```

**Capacity Multiplier:** Offloading reads to the 2 Secondary nodes **triples the effective IOPS of the cluster**, keeping Primary CPU utilization below 35% even during peak morning clinic hours.

---

### 5.3 Strategy 2: High-Velocity Audit Collection Segregation

As codified in [ADR 006](../critical-problems-and-adrs/006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md), field-level audit trail records constitute **over 90% of all write volume** in an EDC system. Storing audit entries in the same collection as clinical CRF values forces WiredTiger to contend for document-level write locks.

#### Architectural Separation:
* **`crf_entries`**: Stores only the current, active state of the CRF document. Kept small, dense, and cache-friendly in RAM.
* **`audit_crf_data`**: High-velocity append-only collection. Commits concurrently inside the MongoDB ACID transaction without mutating the primary document.
* **Pre-Provisioned 4D Compound Indexes**: As specified in ADR 006, compound indexes (`idx_audit_subject_field`, `idx_audit_site_timeline`) are created at database provisioning time in $< 50\text{ ms}$, eliminating live index-build lock stalls.

---

### 5.4 Strategy 3: WiredTiger Memory, Ticket & IOPS Tuning

In production environments (`tools/docker/redis-prod.conf` and cloud MongoDB clusters), WiredTiger engine parameters are tuned specifically for high-throughput concurrency:

```ini
# --- WIREDTIGER ENGINE TUNING (mongod.conf) ---

# Allocate 60% of physical host RAM to WiredTiger Cache
wiredTigerCacheSizeGB: 32

# Concurrency Execution Tickets (Default 128 is increased to prevent micro-queue stalls)
wiredTigerConcurrentWriteTransactions: 256
wiredTigerConcurrentReadTransactions: 256

# Block Manager Compression:
# Active collections use snappy (optimal CPU vs compression trade-off)
# Audit collections use zlib (5.5:1 compression, saving terabytes of NVMe IOPS)
```

#### Write Concern & Journal Optimization:
* Critical clinical data entries use `WriteConcern.WMajority.With(journal: true)`, ensuring the transaction has committed to the majority of replica nodes and written to the on-disk journal before returning HTTP 200 to the client.
* Write tickets are kept short ($< 2\text{ ms}$) by preventing long-running JavaScript aggregations on the Primary.

---

### 5.5 Strategy 4: High-Velocity ePRO Bulk Ingestion & Micro-Batching

When 20,000 mobile ePRO patients synchronize their daily pain and medication compliance surveys, processing 20,000 individual single-document writes triggers thread pool starvation.

The ePRO ingestion endpoint implements **Unordered Bulk Writes with Micro-Batching**:

```csharp
namespace Vialiq.Infrastructure.Data;

using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using Vialiq.Core.Entities;

public sealed class EProBulkIngestionService
{
    private readonly IMongoCollection<EProEntryEntity> _eProCollection;

    public EProBulkIngestionService(IMongoDatabase database)
    {
        _eProCollection = database.GetCollection<EProEntryEntity>("epro_entries");
    }

    public async Task BulkIngestSurveysAsync(IEnumerable<EProEntryEntity> surveys)
    {
        var writes = new List<WriteModel<EProEntryEntity>>();

        foreach (var survey in surveys)
        {
            // Insert or update survey response idempotently
            var filter = Builders<EProEntryEntity>.Filter.Where(x => 
                x.StudyId == survey.StudyId && 
                x.SubjectId == survey.SubjectId && 
                x.SurveyId == survey.SurveyId);

            writes.Add(new ReplaceOneModel<EProEntryEntity>(filter, survey) { IsUpsert = true });
        }

        // Unordered execution allows MongoDB to process batches in parallel across internal cores
        var options = new BulkWriteOptions { IsOrdered = false };
        await _eProCollection.BulkWriteAsync(writes, options).ConfigureAwait(false);
    }
}
```

**Performance Gain:** Slashes database round-trip network hops by **98%** (from 20,000 network round-trips to ~20 bulk requests), absorbing massive ePRO evening spikes in $< 1.5\text{ seconds}$.

---

### 5.6 Strategy 5: ASP.NET Core Kestrel Zero-Allocation Pipeline

Database throughput is only as fast as the web application feeding it. If API pods spend CPU cycles collecting garbage during high concurrency, database connections sit idle in wait queues.

To maintain maximum throughput in `.NET 9`:
1. **Zero Synchronous Blocking**: Every database call in `Vialiq.Infrastructure` utilizes non-blocking `await ... .ConfigureAwait(false)`.
2. **Buffer Pooling (`ArrayPool<byte>`)**: High-payload submissions (e.g. 50-field repeating labs) reuse memory buffers from `ArrayPool`, reducing Gen 2 GC pauses to virtually zero.
3. **Negative Cache Protection**: Non-existent subject or form lookups are cached in `HybridCache` with a 60-second TTL, preventing malicious scanning or buggy client loops from hammering MongoDB indexes.

---

## 6. Summary Architecture Matrix & Capacity Guarantees

```
=======================================================================================================================
VIALIQ DATABASE SCALING & REGIONAL GOVERNANCE MATRIX
=======================================================================================================================
Scaling Challenge                  Architectural Pattern               Technical Mechanism           SLA / Guarantee
-----------------------------------------------------------------------------------------------------------------------
1. Platform Study Scaling (1,000+) Multi-Cluster Farm Architecture     Dynamic connection pool in    Zero noisy-neighbor impact;
                                   (Database-per-Study)                C#; Layer 1 routing registry  isolated blast radius.
2. Non-Sharded Invariant           Single Replica Set per Study        Writes serialize on single    100% elimination of 2PC
                                   (ADR 009)                           Primary Oplog; monotonic seq  clock drift; Part 11 proof.
3. Cross-Region Placements         Centralized Admin / Regional Prod   Stateless EdDSA JWTs; cached  Zero cross-region auth lag;
                                   (Configured in Study Admin Wizard)  JWKS; local VPC connections   < 10ms local DB save latency.
4. Multilingual Global Studies     Canonical Storage Keys + Localized  CDISC keys (SYS_BP, C25473);  100% CDISC/SAS compliance;
                                   Dynamic UI Presentation             locale metadata in audit      native UI in 30+ languages.
5. Sovereign Compliance Mandates   Site-Level Geo-Partitioned Storage  CountryCode routes writes to  Zero cross-border PII leakage;
   (GDPR, PIPL, HIPAA)             (US, EU, CN, JP Cluster Shards)     regional cluster instance     satisfies CAC, NMPA, & EMA.
6. Localized Cryptography          CSFLE with Regional Cloud KMS       AWS KMS Frankfurt / US / HSM  Sovereign key isolation;
                                   (Envelope Encryption AES-256-GCM)   bound per target region       GDPR Art. 17 crypto-shredding.
7. High-Concurrency Surges         Workload Bifurcation + Bulk ePRO    ReadPreference.Secondary-     35,000+ Req/sec throughput;
   (Morning Clinic Visits & ePRO)  Ingestion + WiredTiger 256 Tickets  Preferred; BulkWriteAsync     p99 write latency < 25ms.
=======================================================================================================================
```

---

## 7. Operational Checklist: Provisioning a New Study Cluster

When onboarding a new regional cluster farm node (e.g. adding `rs-prod-apac-01` in Tokyo):

- [ ] **Infrastructure Setup**: Deploy 3-node MongoDB Replica Set in target AWS/Azure VPC.
- [ ] **Oplog Verification**: Ensure replica set is initialized with `--replSet rs-prod-apac-01` and `wiredTigerCacheSizeGB` configured.
- [ ] **KMS Master Key Binding**: Provision customer-managed encryption key (CMK) in target cloud region with least-privilege IAM roles.
- [ ] **Network Peering**: Establish private VPC peering / AWS Transit Gateway between Regional API Pods and MongoDB hosts.
- [ ] **Registry Registration**: Insert routing document into `vialiq_control_plane.db_routing_registry` with `cluster_id`, `connection_uri`, and `target_region`.
- [ ] **Liquibase Schema Initialization**: Run baseline migrations to create compound audit indexes before unlocking the study for investigator enrollment.

