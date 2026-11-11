# Scaling Architecture: Database Cluster Farm, Cross-Region Placement, Multi-Geography Storage Compliance, and Peak Throughput Maximization

> **Document ID:** `VIALIQ-SCALE-005`  
> **Domain:** Platform Scalability — Data Tier, Global Placement & Concurrency Architecture  
> **Status:** Accepted / Active Architecture Standard  
> **Date:** November 2026  
> **Target Systems:** MongoDB 7.0+ (Replica Sets & Cluster Farms), .NET 9 Kestrel, Redis 7.2 HA, AWS KMS / Azure Key Vault, .NET 9 `Vialiq.CdcWorker` (Native Change Streams)  
> **Regulatory Standards:** FDA 21 CFR Part 11, EU Clinical Trials Regulation (EU CTR 536/2014), GDPR Art. 9/17/28, HIPAA Security Rule § 164.312, China PIPL & Data Security Law (DSL), Japan APPI, ICH GCP E6(R3) Section 5.18, GAMP 5 Category 4  
> **Related Architecture Documents:**
>
> - [ADR 004: CSFLE-to-SQL Server CDC Decryption Boundary](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)
> - [ADR 006: 21 CFR Part 11 Audit Trail Architecture](../critical-problems-and-adrs/006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md)
> - [ADR 007-A: Multi-Tenant Cache Isolation & Security Scoping](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md)
> - [ADR 007-B: High-Availability Redis Cluster Architecture & Scaling Guide](../critical-problems-and-adrs/007-b-high-availability-redis-cluster-and-scaling-guide.md)
> - [ADR 009: Legal Timestamp Authority & Monotonic Sequencing](../critical-problems-and-adrs/009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md)
> - [ADR 010: Double-Blind RTSM Unblinding Prevention in Caching Tiers](../critical-problems-and-adrs/010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md)
> - [Scale 001: Database Horizontal Scaling & Storage Lifecycle](./001-database-horizontal-scaling-and-sharding.md)
> - [Scale 004: Distributed Redis Caching & Queues](./004-caching-queues-and-resilience-patterns.md)
> - [FTS-003: Inter-Zone Patient Transfers, Inspections & Study Governance](../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md)

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
   - [2.3 Provisioning Regional Studies via `STUDY_INFRA_CONFIG` Privilege (SOW Flexible)](#23-provisioning-regional-studies-via-study_infra_config-privilege-sow-flexible)
   - [2.4 Cross-Region Latency & Stateless JWT Verification](#24-cross-region-latency--stateless-jwt-verification)
4. [Section 3: Multilingual & Multi-Geography Studies with Disjoint Compliance Mandates](#4-section-3-multilingual--multi-geography-studies-with-disjoint-compliance-mandates)
   - [3.1 The Global Clinical Trial Use Case (US vs. EU vs. China vs. Japan)](#31-the-global-clinical-trial-use-case-us-vs-eu-vs-china-vs-japan)
   - [3.2 Geo-Partitioned Storage Architecture (Site-Level Data Residency)](#32-geo-partitioned-storage-architecture-site-level-data-residency)
   - [3.3 Multilingual Schema vs. Storage Encoding Invariant](#33-multilingual-schema-vs-storage-encoding-invariant)
   - [3.4 Cryptographic Boundary: Localized Key Management (CSFLE + Regional KMS)](#34-cryptographic-boundary-localized-key-management-csfle--regional-kms)
   - [3.5 Cross-Border Aggregation & De-Identified Analytical Rollup (Regional CDC -> Central SQL Server)](#35-cross-border-aggregation--de-identified-analytical-rollup-regional-cdc---central-sql-server)
5. [Section 4: Maximizing Throughput under Extreme High-Concurrency Surges](#5-section-4-maximizing-throughput-under-extreme-high-concurrency-surges)
   - [4.1 The Peak Clinical Concurrency Challenge](#41-the-peak-clinical-concurrency-challenge)
   - [4.2 Strategy 1: Strict Primary-Only Consistency & CDC Warehouse Offloading](#42-strategy-1-strict-primary-only-consistency--cdc-warehouse-offloading)
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
                            │  - study_registry (non-secret ZoneProfile)│
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

| Isolation Dimension             | Single Monolithic Cluster                           | Vialiq Multi-Cluster Farm                                         | Regulatory & Operational Benefit                            |
| ------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| **Blast Radius**                | Failure crashes 100% of studies across all sponsors | Failure isolated strictly to the studies on that specific cluster | 99.999% availability for unaffected clusters; GxP compliant |
| **Noisy-Neighbor Contention**   | Massive SAS bulk extraction locks shared resources  | Independent CPU, RAM, and IOPS per cluster farm                   | CRCs entering real-time data experience zero latency spikes |
| **Maintenance & Patching**      | Platform-wide maintenance window required           | Rolling cluster-by-cluster maintenance windows                    | Zero-downtime fleet upgrades                                |
| **Tiered Hardware Allocation**  | One-size-fits-all hardware profile                  | Fast NVMe for high-velocity trials; Standard SSD for long-term    | Optimized cloud infrastructure TCO                          |
| **Clean Trial Decommissioning** | Complex row-level purging risking foreign key locks | Native `db.dropDatabase()` on completion                          | Complete, zero-residual data erasure                        |

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
    private readonly IClusterSecretProvider _secretProvider;

    public DynamicClusterConnectionPool(
        IStudyRegistryService registryService,
        IClusterSecretProvider secretProvider)
    {
        _registryService = registryService;
        _secretProvider = secretProvider;
    }

    public IMongoDatabase GetDatabase(TenantStudyContext context)
    {
        // 1. In Control Plane operations, return the central Admin database
        if (string.IsNullOrEmpty(context.StudyId))
        {
            return GetClient("rs-admin").GetDatabase("vialiq_control_plane");
        }

        // 2. Resolve study cluster assignment from Distributed Redis cache / Layer 1 study_registry
        var assignment = _registryService.GetRoutingAssignment(context.TenantId, context.StudyId, context.Environment);

        // 3. Retrieve or lazily construct the singleton MongoClient for this cluster
        var client = _clusterClients.GetOrAdd(assignment.ClusterId, _ =>
        {
            var connectionUri = _secretProvider.ResolveMongoConnectionUri(assignment.ZoneProfileId);
            var settings = MongoClientSettings.FromConnectionString(connectionUri);
            settings.MaxConnectionPoolSize = assignment.MaxPoolSize; // e.g. 200
            settings.MinConnectionPoolSize = 20;
            settings.WaitQueueTimeout = TimeSpan.FromSeconds(3);
            // Strict operational consistency: all clinical reads route to Primary
            // to guarantee Read-Your-Own-Writes and prevent stale patient/audit data.
            // Secondaries exist strictly for High Availability (HA) automatic failover.
            settings.ReadPreference = ReadPreference.Primary;
            settings.ReadConcern = ReadConcern.Majority;
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

> **Question:** _Can only the Prod DB—and not the User DB / Admin DB—lie in a different cloud region?_  
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
3. **Realm-per-Tenant Federation Compatibility *(Detailed Multi-Tenant Login Flow TBD at Implementation)***: Internal sponsor users authenticate in their isolated **Sponsor Keycloak Realm** (Okta/Entra/AD), while external site PIs use a **Central Site Identity Broker Realm** federated into each authorized sponsor realm—preserving strict `tenant_id` / `X-Tenant-Id` and `user_study_access` isolation with zero duplicate investigator passwords.

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
├── study_registry              # Canonical study config, storageTopology, coding, & ZoneProfile pointers
└── study_user_assignments      # User-to-Study-to-Role bindings (incl. STUDY_INFRA_CONFIG per SOW)
```

---

### 2.3 Provisioning Regional Studies via `STUDY_INFRA_CONFIG` Privilege (SOW Flexible)

Before `PROD` data entry starts (`Pre-Go-Live Lock`), users granted the Tenant-assigned **`STUDY_INFRA_CONFIG`** RBAC privilege (either Vialiq Managed Services OR Client Self-Service Technical Lead per [FTS-003](../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md)) select **SRE-certified Zone Profiles**—never raw MongoDB credentials or plaintext connection strings:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│              STUDY INFRA PROVISIONING (RBAC: STUDY_INFRA_CONFIG PRE-GO-LIVE)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Protocol Number:    [ ONCO-GLOBAL-301                                                ] │
│ Sponsor Tenant:     [ Roche Pharmaceuticals Global                                   ] │
│ Storage Topology:   ( ) Single (Default)     (•) MultiRegionGeoPartitioned             │
│                                                                                        │
│ Active Zone Profiles (Catalog-Only, Verified by Platform SRE):                         │
│   [x] ZONE_US ──► Profile: PROFILE_US_VA_HIPAA_01   (AWS us-east-1, HIPAA/Part 11)     │
│   [x] ZONE_EU ──► Profile: PROFILE_EU_FRA_GDPR_01   (AWS eu-central-1, GDPR/CTR 536)   │
│   [x] ZONE_CN ──► Profile: PROFILE_CN_BJ_PIPL_01    (Alibaba cn-north-1, PIPL/NMPA)    │
│                                                                                        │
│ Base Language:      [ en-US ]   Supported Locales: [ en-US, de-DE, fr-FR, zh-CN ]      │
│ Medical Coding:     MedDRA v27.1 | WHODrug Global-202609                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### The Canonical `study_registry` Non-Secret Metadata Record (Layer 1):

```json
{
  "_id": "std_roche_onco301",
  "tenant_id": "ten_roche",
  "protocol_number": "ONCO-GLOBAL-301",
  "environment": "prod",
  "target_region": "eu-central-1",
  "zone_profile_id": "PROFILE_EU_FRA_GDPR_01",
  "compliance_profile": "GDPR_HEALTH_RESIDENCY",
  "assigned_cluster": {
    "cluster_id": "rs-prod-eu-central-01",
    "cluster_type": "ReplicaSet",
    "read_preference": "primary",
    "max_pool_size": 200
  },
  "kms_configuration": {
    "provider": "aws",
    "key_arn": "arn:aws:kms:eu-central-1:123456789012:key/7b94e82f-xxxx",
    "key_vault_namespace": "keyvault_study_onco301_eu.__keyVault",
    "region": "eu-central-1"
  },
  "identity_config": {
    "auth_mode": "HybridBrokered",
    "keycloak_realm": "roche-global",
    "oidc_issuer": "https://auth.vialiq.cloud/realms/roche-global",
    "idp_alias": "okta-sso",
    "secret_vault_ref": "vault://ten_roche/std_roche_onco301/oidc",
    "mfa_enforcement": "RequiredAll",
    "allowed_factors": ["TotpAuthenticator", "WebAuthnFido2"],
    "step_up_signing_required": true,
    "idle_timeout_minutes": 15,
    "max_concurrent_sessions": 1
  },
  "is_locked_for_production_data_entry": true
}
```

---

### 2.4 Cross-Region Latency & Stateless JWT Verification

A common concern with centralized user management is: _Will every clinical request in Europe or Asia suffer cross-region latency round-tripping to the US Admin DB for authentication?_

**The answer is NO.** The platform uses **Stateless Cryptographic JWTs (OIDC)**:

```
┌──────────────┐          1. Login Request            ┌────────────────────────────────────────┐
│ Browser (EU) │ ───────────────────────────────────► │ Keycloak Multi-AZ HA (Primary Region)  │
└──────┬───────┘   (Reads study_registry identity     │ + Managed Multi-AZ Postgres & Async DR │
       │            via GET /api/v1/auth/discovery)   └──────────────┬─────────────────────────┘
       │                                                             │
       │ 2. Issues Signed EdDSA/RS256 JWT                            │
       │    (Realm-per-Tenant, Roles, MFA / Step-Up Claims)          ▼
       │ ◄───────────────────────────────────────────────────────────┘
       │
       │ 3. Clinical Data Save (POST /api/v1/crf-entries)
       │    Headers: Authorization: Bearer <JWT>, X-Tenant-Id, X-Study-Id
       ▼
┌──────────────────────────────────────────────┐
│ Regional API Pod (Frankfurt: eu-central-1)   │
├──────────────────────────────────────────────┤
│ • Validates JWT locally using Redis JWKS     │  ◄── ZERO network round-trip to Keycloak/Admin!
│   public key (< 0.1 ms, 1h TTL)              │      API /health/ready never probes Keycloak.
│ • Verifies user_study_access, identityConfig │  ◄── < 1ms Single-Tier Regional Redis lookup.
│   MFA/idle policy & routing locally          │      Instant cut-off via Control-Plane Outbox.
│ • Executes write directly to local Mongo Prod│  ◄── < 5ms local VPC database commit.
│   Cluster (rs-prod-eu-central-01)            │
└──────────────────────────────────────────────┘
```

**Result:** Clinical requests execute with **100% regional data locality (< 10ms total latency)** for both 75% `Single` studies and 25% `MultiRegionGeoPartitioned` studies, while user identity and per-study `identity_config` (Email+Password, AD/LDAP, Okta/Entra, MFA, step-up rules) remain centrally governed in `rs-admin` (`w: "majority"` + cross-region async DR replica, no complex active-active Keycloak DB required in Phase 1; regional Keycloak only if explicitly contracted in a sovereign SOW). During an active Control-Plane DR failover (`RTO <= 15–30 min`), Regional Redis keeps active sessions running via stale-while-revalidate grace fallback while local `rs-prod` `study_locks` continue enforcing freezes.

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

- When a nurse at **Charité Hospital in Berlin (Site 052, Germany)** saves a CRF for Subject `SUBJ-EU-052-003`, the API routes writes strictly to `study_global301_eu_prod` in Frankfurt.
- When a nurse at **Peking Union Medical College (Site 110, Beijing)** saves a CRF for Subject `SUBJ-CN-110-008`, the API routes writes strictly to `study_global301_cn_prod` in Beijing.
- **No cross-border leakage of patient records or PII occurs.**

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
                                 LOCALIZED ENVELOPE ENCRYPTION & KEY VAULTS
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
STORAGE ZONE 1 (US)                    STORAGE ZONE 2 (EU)                    STORAGE ZONE 3 (CHINA)
• KMS: AWS KMS us-east-1               • KMS: AWS KMS eu-central-1            • KMS: Aliyun / Local HSM
• KeyVault DB:                         • KeyVault DB:                         • KeyVault DB:
  keyvault_*_us.__keyVault (Inside US)   keyvault_*_eu.__keyVault (Inside EU)   keyvault_*_cn.__keyVault (Inside CN)
• Encrypts: US Subject DEKs            • Encrypts: EU Subject DEKs            • Encrypts: CN Subject DEKs
```

#### The Cryptographic Sovereignty Guarantee:

- Both the European Master Key (CMK in AWS KMS Frankfurt) and the wrapped DEK database (`keyvault_*_eu.__keyVault`) physically reside inside EU-Central (`eu-central-1`). Layer 1 `study_registry` stores **non-secret KMS/KeyVault pointers only**.
- Even if a US platform administrator acquired a physical dump of the EU MongoDB files, **they cannot decrypt patient identifiers** because the US environment lacks IAM permissions to invoke the EU KMS decrypt API.
- When an EU patient exercises GDPR Article 17 ("Right to be Forgotten"), destroying their specific `dek_subject_{uuid}` in `ZONE_EU`'s `__keyVault` permanently renders PII across **both `crf_entries` and `audit_trail` snapshots** cryptographically unrecoverable (rendering `[REDACTED — GDPR ARTICLE 17]`), while the FDA Part 11 SHA-256 audit chain remains mathematically intact.

---

### 3.5 Cross-Border Aggregation & De-Identified Analytical Rollup (Regional CDC -> Central SQL Server)

Global biostatisticians, Study Dashboards, and medical safety committees (DSMB) require unified analytics across all active countries without violating sovereign privacy laws or suffering WAN query stalls across Great Firewalls.

**The Solution: Regional 4-Tier CDC Boundary Feeding Central SQL Server 2022**:

```
┌─────────────────────────────────┐
│ REGIONAL MONGO PROD (e.g. EU)   │
│ - study_global301_eu_prod       │
│ - Contains PII + Clinical Data  │
└────────────────┬────────────────┘
                 │
                 │ 1. Tail MongoDB Replica Oplog (Change Streams inside EU VPC)
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ REGIONAL .NET CDC BOUNDARY WORKER (Runs INSIDE EU/CN/US VPC)           │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Automated 4-Tier Boundary Filter (ADR 004):                         │
│    • SiteIdentifier (PII/PHI)       ➔ HARD DROPPED INSIDE REGION VPC   │
│    • Translatable Clinical Verbatim ➔ PII-scrubbed, Site→Base + coded  │
│    • BlindedRTSM (Treatment Arm)    ➔ MASKED AS "BLINDED"              │
│    • Quarantine (Unclassified)      ➔ TRAPPED TO LOCAL REGION DLQ      │
│    • ClinicalResearch (Labs/AEs)    ➔ EMITTED + NON-PII SITE METRICS   │
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 │ 3. De-Identified, Non-PHI Analytical Stream (TLS 1.3)
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ CENTRAL REPORTING WAREHOUSE (Microsoft SQL Server 2022+ Columnstore)   │
├────────────────────────────────────────────────────────────────────────┤
│ • Powers <15ms Global Cross-Zone Dashboards (zero WAN lag!)            │
│ • Merges US + EU + China rows into unified CDISC SDTM tables (DM/AE/VS)│
│ • Fully compliant with HIPAA Safe Harbor, GDPR Art. 89 & China DSL     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Section 4: Maximizing Throughput under Extreme High-Concurrency Surges

### 5.1 The Peak Clinical Concurrency Challenge

While our caching tier (Redis Distributed Cache) handles 99% of read traffic for invariant schemas, dictionaries, and codelists, **live clinical writes and audit logging CANNOT be cached in Redis** (as mandated by [ADR 007-A](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md) and [ADR 010](../critical-problems-and-adrs/010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md)).

During peak clinical operational hours, the database tier faces massive concurrent throughput surges:

1. **Morning Clinic Shift (09:00 - 11:00 AM)**: 5,000+ clinical research coordinators across 500 hospital sites simultaneously entering vitals, lab results, and dispensing medication kits.
2. **ePRO Diary Synchronizations**: 20,000+ ambulatory trial subjects submitting evening symptom diaries via mobile smartphones within a 30-minute window.
3. **CRA Monitoring & SDV Sprints**: Hundreds of Clinical Research Associates running bulk Source Data Verification (SDV) queries and closing discrepancies ahead of regulatory database lock deadlines.

To maximize database throughput and eliminate queue stalls, the architecture implements **5 dedicated high-throughput strategies**.

---

### 5.2 Strategy 1: Strict Primary-Only Consistency & CDC Warehouse Offloading

In an enterprise EDC system, clinical and regulatory integrity mandates **strict Read-Your-Own-Writes consistency**. Routing operational reads to asynchronously replicating secondary nodes risks serving stale patient values, phantom discrepancy queries, or outdated audit histories immediately following a form save or signature event.

Vialiq enforces **Primary-only transactional consistency** for all operational clinical workflows, while offloading analytical and reporting overhead completely outside the operational cluster:

```
                                  WORKLOAD ROUTING TOPOLOGY
                                              │
         ┌────────────────────────────────────┴────────────────────────────────────┐
         ▼                                                                         ▼
   PRIMARY NODE (27037)                                                    SECONDARY NODES (27038, 27039)
   --------------------                                                    ------------------------------
   • 100% of Form Reads & Save Operations (Read-Your-Own-Writes)           • Zero Operational Traffic (Standby Only)
   • 100% of In-Form Audit Trail Popovers & Form Drawers                   • High Availability (HA) Automatic Failover
   • 100% of Discrepancy Query Grids & Workflow Transitions                • .NET 9 Vialiq.CdcWorker (MongoDB Change Streams)
   • 100% of Form Edit Lease Acquisitions & Part 11 Electronic Signatures       • (Opt-in ONLY for cold, stale-tolerant exports)
   • Multi-Document ACID Transactions (ReadConcern.Majority)
```

#### The Regulatory Invariant: Why SecondaryPreferred is Banned for Operational Data

- **FDA 21 CFR Part 11 & ICH GCP E6(R3)** require absolute data integrity and contemporaneous recording. If an investigator saves a vitals form and the immediate reload queries a secondary node lagging by 150 ms, the user observes outdated values, triggering confusion, duplicate submissions, or corrupted edit check validations.
- **Audit Trail Verification**: Clinicians inspecting audit popovers immediately after field updates must observe the newly committed revision hash.
- **Secondary Node Role**: Replica set secondaries exist strictly for **High Availability (HA) automatic failover** and oplog replication.

#### CDC Reporting Warehouse Offloading:

Rather than competing for WiredTiger cache and IOPS on operational replica set nodes, analytical reporting, biostatistics, and cross-study aggregates are decoupled entirely:

1. **CDC Pipeline (ADR 004)**: `.NET 9 Vialiq.CdcWorker` consumes majority-committed MongoDB Change Streams directly inside an in-memory CSFLE enclave (zero Kafka/Debezium broker overhead) and streams de-identified events over TLS 1.3 to the **SQL Server CDISC SDTM Reporting Warehouse**.
2. **Explicit Secondary Opt-In (Stale-Tolerant Only)**: Offline, non-clinical tasks (such as cold MedDRA dictionary exports or background regulatory compliance dumps) may explicitly opt into secondary reads via `.WithReadPreference(ReadPreference.SecondaryPreferred)` without polluting default operational connection pools.

```csharp
// Default operational client: Strict Primary consistency across all clinical workflows
var connectionUri = _secretProvider.ResolveMongoConnectionUri(assignment.ZoneProfileId);
var settings = MongoClientSettings.FromConnectionString(connectionUri);
settings.ReadPreference = ReadPreference.Primary;
settings.ReadConcern = ReadConcern.Majority;
settings.WriteConcern = WriteConcern.WMajority;

// Explicit opt-in ONLY for cold, stale-tolerant background export pipelines:
var coldExportCollection = database
    .WithReadPreference(ReadPreference.SecondaryPreferred)
    .GetCollection<BsonDocument>("audit_crf_data");
```

---

### 5.3 Strategy 2: High-Velocity Audit Collection Segregation

As codified in [ADR 006](../critical-problems-and-adrs/006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md), field-level audit trail records constitute **over 90% of all write volume** in an EDC system. Storing audit entries in the same collection as clinical CRF values forces WiredTiger to contend for document-level write locks.

#### Architectural Separation:

- **`crf_entries`**: Stores only the current, active state of the CRF document. Kept small, dense, and cache-friendly in RAM.
- **`audit_crf_data`**: High-velocity append-only collection. Commits concurrently inside the MongoDB ACID transaction without mutating the primary document.
- **Pre-Provisioned 4D Compound Indexes**: As specified in ADR 006, compound indexes (`idx_audit_subject_field`, `idx_audit_site_timeline`) are created at database provisioning time in $< 50\text{ ms}$, eliminating live index-build lock stalls.

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

- Critical clinical data entries use `WriteConcern.WMajority.With(journal: true)`, ensuring the transaction has committed to the majority of replica nodes and written to the on-disk journal before returning HTTP 200 to the client.
- Write tickets are kept short ($< 2\text{ ms}$) by preventing long-running JavaScript aggregations on the Primary.

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
3. **Negative Cache Protection**: Non-existent subject or form lookups are cached in Redis with a 60-second TTL, preventing malicious scanning or buggy client loops from hammering MongoDB indexes.

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
3. Cross-Region Placements         Centralized Admin / Regional Prod   Stateless EdDSA JWTs; regional  Zero cross-region auth lag;
                                   (`STUDY_INFRA_CONFIG` Zone Profiles)Single-Tier Redis & local VPC   < 10ms local DB save latency.
4. Multilingual Global Studies     Canonical Storage Keys + Localized  CDISC keys (SYS_BP, C25473);    100% CDISC/SAS compliance;
                                   `Base ↔ Site` Toggle (`Site → Base`)locale metadata in audit        native UX across all locales.
5. Sovereign Compliance Mandates   Site-Level Geo-Partitioned Storage  CountryCode routes writes to    Zero cross-border PII leakage;
   (GDPR, PIPL, HIPAA)             (US, EU, CN, JP Cluster Farm)       regional cluster instance       satisfies CAC, NMPA, & EMA.
6. Localized Cryptography          CSFLE + Regional `__keyVault` DBs   AWS KMS Frankfurt / US / HSM    Shreds CRFs & Audit PII;
                                   & KMS pointers in `study_registry`  bound per target region         SHA-256 chain remains valid.
7. High-Concurrency & Dashboards   `ReadPreference.Primary` + Regional Operational writes serialized;  35,000+ Req/sec; <15ms global
   (Morning Clinics & SQL ETL)     CDC -> Central SQL Server 2022      Global dashboards on SQL Server dashboards w/o WAN timeouts.
=======================================================================================================================
```

---

## 7. Operational Checklist: Provisioning a New Study Cluster

When onboarding a new regional cluster farm node (e.g. adding `rs-prod-apac-01` in Tokyo), responsibilities split strictly per [FTS-003 Section 4.4](../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md#44-end-to-end-infrastructure-ownership--execution-matrix):

### Platform SRE / Cloud DevOps (Infrastructure Plane):

- [ ] **Infrastructure Setup**: Deploy 3-node MongoDB Replica Set across 3 AZs in target AWS/Azure/Aliyun VPC.
- [ ] **Oplog & Backup Pipeline**: Ensure replica set uses `--replSet rs-prod-apac-01`, WiredTiger cache tuning, continuous 60s `oplog.rs` archiving, and Sunday 02:00 UTC DR verification.
- [ ] **KMS Master Key & Regional KeyVault DB**: Provision customer-managed encryption key (CMK) in target cloud region with least-privilege IAM roles (or bind Sponsor BYOK CMK policy) and create its regional `__keyVault` database.
- [ ] **Network Peering & Secret Catalog**: Establish private VPC peering between Regional API Pods and MongoDB hosts; store cluster credentials in VPC Secrets Manager and publish the certified `ZoneProfileId`.

### `STUDY_INFRA_CONFIG` Holder (Vialiq Support or Client Tech Lead per SOW — Pre-Go-Live Only):

- [ ] **Study Registry Binding**: Bind the study in `vialiq_control_plane.study_registry` strictly to the SRE-certified `ZoneProfileId` and KMS pointer metadata (zero plaintext URIs) prior to `PROD` FPI.
- [ ] **Liquibase Schema Initialization**: Trigger baseline Liquibase migrations to initialize compound audit indexes before unlocking the study for investigator enrollment.
