# Architectural Guide & Specification: Multilingual Global Studies with Disjoint Compliance, Site-Group Database Partitioning & Federated Reporting

> **Document ID:** `VIALIQ-SCALE-005A`  
> **Domain:** Platform Scalability — Global Data Sovereignty, Site-Group Database Partitioning, Multilingual Data Invariance & Federated Reporting  
> **Status:** Accepted / Active Architecture Standard  
> **Date:** November 2026  
> **Version:** 1.0.0  
> **Target Systems:** MongoDB 7.0+ Replica Set Farm, .NET 9 Kestrel, .NET 9 `Vialiq.CdcWorker` (Native MongoDB Change Streams), SQL Server 2022+ Columnstore / Snowflake, AWS KMS / Azure Key Vault / Regional Cloud HSMs  
> **Regulatory Standards:** FDA 21 CFR Part 11, EU Clinical Trials Regulation (EU CTR 536/2014), GDPR Art. 9/17/28/89, HIPAA Security Rule § 164.312, China Personal Information Protection Law (PIPL) & Data Security Law (DSL), Japan Act on the Protection of Personal Information (APPI), ICH GCP E6(R3) Section 5.18, CDISC SDTM v2.0  
> **Related Architecture Documents:**
> - [ADR 004: CSFLE-to-SQL Server CDC Decryption Boundary](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)
> - [ADR 006: 21 CFR Part 11 Audit Trail Architecture](../critical-problems-and-adrs/006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md)
> - [ADR 007-A: Multi-Tenant Cache Isolation & Security Scoping](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md)
> - [ADR 009: Legal Timestamp Authority & Monotonic Sequencing](../critical-problems-and-adrs/009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md)
> - [ADR 010: Double-Blind RTSM Unblinding Prevention in Caching Tiers](../critical-problems-and-adrs/010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md)
> - [Scale 001: Database Horizontal Scaling & Storage Lifecycle](./001-database-horizontal-scaling-and-sharding.md)
> - [Scale 004: Distributed Redis Caching & Queues](./004-caching-queues-and-resilience-patterns.md)
> - [Scale 005: Database Cluster Farm & Throughput Scaling](./005-database-cluster-farm-regional-compliance-and-throughput-scaling.md)
> - [FTS-003: Inter-Zone Patient Transfers, Inspections & Study Governance](../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md)

---

## Table of Contents

1. [Executive Summary & The Global Trial Archetype](#1-executive-summary--the-global-trial-archetype)
2. [The Core Architectural Dilemma: Single Protocol vs. Sovereign Borders](#2-the-core-architectural-dilemma-single-protocol-vs-sovereign-borders)
3. [The Site-Group Database Partitioning Architecture](#3-the-site-group-database-partitioning-architecture)
   - [3.1 Logical Study vs. Physical Partitioned Datastores](#31-logical-study-vs-physical-partitioned-datastores)
   - [3.2 The Non-Sharded Replica Set Invariant within Site Groups](#32-the-non-sharded-replica-set-invariant-within-site-groups)
4. [Unified C# API Framework: Coexisting Single-Zone and Multi-Zone Studies](#4-unified-c-api-framework-coexisting-single-zone-and-multi-zone-studies)
   - [4.1 The Core Design Imperative: Single-Zone and Multi-Zone Coexistence](#41-the-core-design-imperative-single-zone-and-multi-zone-coexistence)
   - [4.2 Polymorphic Storage Topology Contracts in `Vialiq.Core`](#42-polymorphic-storage-topology-contracts-in-vialiqcore)
   - [4.3 Declarative Manifests: Single-Zone vs. Multi-Zone](#43-declarative-manifests-single-zone-vs-multi-zone)
   - [4.4 Dynamic Site Assignment Rule Engine & Overrides](#44-dynamic-site-assignment-rule-engine--overrides)
   - [4.5 The Unified Database Provider (`DynamicClinicalDatabaseResolver`)](#45-the-unified-database-provider-dynamicclinicaldatabaseresolver)
   - [4.6 Clean Architecture Invariant: Zero Controller & Service Pollution](#46-clean-architecture-invariant-zero-controller--service-pollution)
   - [4.7 Operational vs. Global Reporting Aggregation](#47-operational-vs-global-reporting-aggregation)
   - [4.8 Turnkey Developer Ergonomics & xUnit Test Doubles](#48-turnkey-developer-ergonomics--xunit-test-doubles)
5. [Multilingual Data Invariance (Functional Boundaries)](#5-multilingual-data-invariance-functional-boundaries)
   - [5.1 Decoupling: UI i18n vs. Protocol-Specific Translations](#51-decoupling-ui-i18n-vs-protocol-specific-translations)
   - [5.2 Study & Site Language Rules (`Base ↔ Site` Toggle & Free-Text Translation)](#52-study--site-language-rules-base--site-toggle--free-text-translation)
   - [5.3 The Invariant Storage Principle (Canonical CDISC Encoding)](#53-the-invariant-storage-principle-canonical-cdisc-encoding)
   - [5.4 Runtime Localized Presentation & Audit Metadata Binding](#54-runtime-localized-presentation--audit-metadata-binding)
6. [Cryptographic Privacy & Localized Key Management (CSFLE + Regional KMS)](#6-cryptographic-privacy--localized-key-management-csfle--regional-kms)
   - [6.1 The Sovereign Envelope Encryption Topology](#61-the-sovereign-envelope-encryption-topology)
   - [6.2 Cross-Region Decryption Prevention Guarantee](#62-cross-region-decryption-prevention-guarantee)
   - [6.3 GDPR Article 17 Crypto-Shredding Across CRFs & Audit Trails](#63-gdpr-article-17-crypto-shredding-across-crfs--audit-trails)
7. [Exhaustive Global Reporting Architecture Across Disjoint Physical Locations](#7-exhaustive-global-reporting-architecture-across-disjoint-physical-locations)
   - [7.1 The 3-Tier Clinical Reporting Taxonomy](#71-the-3-tier-clinical-reporting-taxonomy)
   - [7.2 Tier 1: Local Operational & Monitoring Reporting](#72-tier-1-local-operational--monitoring-reporting)
   - [7.3 Tier 2: Fast Global Executive Dashboards (SQL Server Rollup Store)](#73-tier-2-fast-global-executive-dashboards-sql-server-rollup-store)
   - [7.4 Tier 3: Global Biostatistics, SDTM Datasets & SQL Server ETL (Regional CDC Boundary)](#74-tier-3-global-biostatistics-sdtm-datasets--sql-server-etl-regional-cdc-boundary)
8. [Edge Cases, Patient Transfers, Regulatory Inspections & SOW Governance](#8-edge-cases-patient-transfers-regulatory-inspections--sow-governance)
9. [Summary Engineering Matrix & Implementation Checklist](#9-summary-engineering-matrix--implementation-checklist)

---

## 1. Executive Summary & The Global Trial Archetype

In global pharmaceutical drug development, pivotal Phase 3 clinical trials rarely run within a single country. A representative oncology, immunology, or rare disease trial (e.g., protocol **`GLOBAL-ONCO-301`**, sponsored by Roche, Novartis, or Pfizer) is conducted concurrently across dozens of sovereign jurisdictions:

```
                                GLOBAL CLINICAL TRIAL PROTOCOL: GLOBAL-ONCO-301
                                                (Unified Protocol)
                                                        │
         ┌──────────────────────┬───────────────────────┼───────────────────────┐
         ▼                      ▼                       ▼                       ▼
   UNITED STATES          EUROPEAN UNION              CHINA                   JAPAN
   -------------          --------------              -----                   -----
 • 40 Hospital Sites    • 55 Hospital Sites         • 20 Medical Centers    • 15 University Sites
 • FDA 21 CFR Part 11   • EU CTR 536/2014 & GDPR    • NMPA / China DSL/PIPL • PMDA / Japan APPI
 • HIPAA Safe Harbor    • Patient Right to Erasure  • Core Genetic Law Ban  • Japanese MOHW
 • Language: English    • Languages: DE, FR, IT, PL • Language: Zh-CN       • Language: Japanese
```

### The Architectural Mandate:
The clinical platform must enable trial sponsors to run **one unified protocol** with centralized clinical design, unified visit matrices, and global statistical endpoints, while **physically segregating the clinical data storage across regional site groups** to comply with mutually incompatible data protection laws.

---

## 2. The Core Architectural Dilemma: Single Protocol vs. Sovereign Borders

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE FUNDAMENTAL REGULATORY CONFLICT                                    │
├──────────────────────────────────────┬─────────────────────────────────────────────────────────────────┤
│ 🇨🇳 China Data Security Law (DSL) &    │ Strictly forbids the cross-border transfer of health, clinical, │
│    Personal Information Protection    │ and human genetic resource data outside mainland China.         │
│    Law (PIPL Art. 38-40)              │ Storage MUST physically reside inside mainland China servers.   │
├──────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 🇪🇺 EU General Data Protection         │ Special category health data (Art. 9) cannot be transferred out │
│    Regulation (GDPR) & EU CTR        │ of the EEA to non-adequate nations without strict legal rails.  │
│    Regulation 536/2014                │ Patients retain the legal Right to Erasure (Art. 17).           │
├──────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 🇺🇸 US FDA 21 CFR Part 11 &           │ Electronic audit records must be retained immutably for 25+     │
│    HIPAA Security Rule § 164.312      │ years without alteration or deletion. Full inspection access.   │
├──────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
│ 🌐 Global Biostatisticians & FDA     │ Must analyze the entire trial cohort (all 5,000 subjects) as a  │
│    Submission Teams                   │ single unified dataset to prove statistical efficacy & safety.  │
└──────────────────────────────────────┴─────────────────────────────────────────────────────────────────┘
```

### The Naive Architecture Traps:
1. **The Single Central Database Trap:** Storing all global patient records in a central US AWS data center triggers criminal liability and trial shutdown in China, and catastrophic non-compliance under EU GDPR.
2. **The Fragmented Study Trap:** Creating three separate studies (`ONCO-301-US`, `ONCO-301-EU`, `ONCO-301-CN`) fragments protocol versioning, multiplies study build costs by 3x, and forces biostatisticians into manual, error-prone offline spreadsheet merges.
3. **The Translated Database Trap:** Storing localized field names (`"Blutdruck"` in Germany, `"Tension"` in France) breaks CDISC SDTM standardization and corrupts downstream statistical code.

---

## 3. The Site-Group Database Partitioning Architecture

### 3.1 Logical Study vs. Physical Partitioned Datastores

Vialiq resolves this conflict by separating the **Logical Study Domain** from the **Physical Datastore Placement**:

```
                         LOGICAL DOMAIN: GLOBAL-ONCO-301 (One Single Study)
                         - Unified Form Schemas (Form Builder)
                         - Unified Visit Matrix & Codelists
                         - Unified User Access & Security Roles (Layer 1 Control Plane)
                                                  │
                 ┌────────────────────────────────┼────────────────────────────────┐
                 ▼                                ▼                                ▼
         SITE GROUP: US                   SITE GROUP: EU                   SITE GROUP: CHINA
         (Zone: ZONE_US)                  (Zone: ZONE_EU)                  (Zone: ZONE_CN)
         ├──────────────────────────────┐ ├──────────────────────────────┐ ├──────────────────────────────┐
         │ Sites: SITE-001 to SITE-040  │ │ Sites: SITE-041 to SITE-095  │ │ Sites: SITE-096 to SITE-115  │
         │ Region: AWS us-east-1 (VA)   │ │ Region: AWS eu-central-1 (DE)│ │ Region: Alibaba cn-north-1   │
         │ Cluster: rs-prod-us-01       │ │ Cluster: rs-prod-eu-01       │ │ Cluster: rs-prod-cn-01       │
         │ Database:                    │ │ Database:                    │ │ Database:                    │
         │ study_onco301_us_prod        │ │ study_onco301_eu_prod        │ │ study_onco301_cn_prod        │
         └──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

### 3.2 The Non-Sharded Replica Set Invariant within Site Groups

Building upon [ADR 009](../critical-problems-and-adrs/009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md):
* **Within each regional Site Group:** The database is **never sharded across multiple nodes**. It lives on a standard 3-node High-Availability MongoDB Replica Set (1 Primary + 2 Secondaries).
* **Guarantees:**
  - 100% of patient writes for that site group commit to the **single regional Primary node**.
  - The regional Primary node acts as the legal time authority (`ServerTimestampUtc`).
  - Monotonic sequence numbers (`$inc: { auditStreamSequence: 1 }`) guarantee deterministic causal ordering with zero distributed clock skew.

---

## 4. Unified C# API Framework: Coexisting Single-Zone and Multi-Zone Studies

### 4.1 The Core Design Imperative: Single-Zone and Multi-Zone Coexistence

In a commercial clinical SaaS platform, the vast majority of studies are **NOT** multi-national Phase 3 trials:
* **~80% to 85% of Clinical Trials**: Phase 1 first-in-human trials, Phase 2 proof-of-concept studies, or domestic Phase 3 trials running within a single regulatory jurisdiction (e.g. US-only or Japan-only). These require **only 1 Storage Zone and 1 Production Database** (`SingleZone`).
* **~15% to 20% of Clinical Trials**: Global mega-trials running across disparate sovereign territories (US, EU, China) requiring **multiple regional Production Databases** (`MultiRegionGeoPartitioned`).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE C# FRAMEWORK DESIGN RULE                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ❌ THE ANTI-PATTERN: Leaking storage topology into controllers, services, or checks.  │
│    `if (study.IsMultiZone) { ... } else { ... }` scattered across 200 services.        │
│                                                                                        │
│ ✅ THE VIALIQ PATTERN: Polymorphic, unified, transparent storage abstraction.          │
│    • `SingleZone` is treated as a standard 1-zone topology with zero routing rules.    │
│    • `MultiZone` is treated as an N-zone topology with site routing rules.             │
│    • Controllers, Domain Services, and Repositories share 100% of their C# code.       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Polymorphic Storage Topology & Study Registry Contracts in `Vialiq.Core`

The core domain contracts define study storage topology, multilingual configuration, and medical coding bindings inside a single immutable manifest per study in `vialiq_control_plane.study_registry`:

```csharp
namespace Vialiq.Core.Models;

using System.Collections.Generic;

public enum StorageTopologyMode
{
    Single = 1,                    // Default for ~85% of studies
    MultiRegionGeoPartitioned = 2  // Dynamic per-site regional zones
}

public sealed record StorageZoneConfig(
    string ZoneId,
    string ZoneProfileId,          // Catalog pointer to SRE-certified infrastructure profile
    string Name,
    string TargetRegion,
    string ClusterId,
    string DatabaseName,
    string ComplianceProfile,
    string KmsProvider,            // e.g. "aws", "azure", "aliyun"
    string KmsKeyArn,              // Pointer ONLY — wrapped DEKs live inside zone cluster DB
    string KeyVaultNamespace,      // e.g. "keyvault_study_global301_eu.__keyVault"
    int MaxPoolSize = 200);

public sealed record SiteRoutingRule(
    string RuleId,
    int Priority,
    string Expression,
    string TargetZoneId);

public sealed record TranslationConfig(
    string BaseLocale,             // Study default language (need not be English, e.g. "ja-JP", "en-US")
    IReadOnlyList<string> SupportedLocales,
    bool PreserveOriginalVerbatim = true);

public sealed record MedicalCodingConfig(
    string MeddraVersion,
    string WhoddVersion,
    string DictionaryDatabaseRef);

public sealed record StorageTopologyManifest(
    StorageTopologyMode Mode,
    IReadOnlyList<StorageZoneConfig> Zones,
    string DefaultZoneId,
    bool IsLockedForProductionDataEntry,
    IReadOnlyList<SiteRoutingRule>? RoutingRules = null)
{
    public bool IsSingleZone => Mode == StorageTopologyMode.Single || Zones.Count <= 1;
}
```

---

### 4.3 Canonical `study_registry` Manifest & Pre-Go-Live Locking

Both single-zone and multi-zone studies share the exact same canonical schema inside `vialiq_control_plane.study_registry` (containing **non-secret references ONLY**—connection credentials live strictly in VPC Vault/Secrets Manager, and wrapped DEKs live inside their regional Key Vault DBs):

#### Example A: Standard Single-Zone Study (Domestic Japan Study: `ONCO-101-JP`)
```json
{
  "_id": "std_takeda_onco101jp",
  "protocolNumber": "ONCO-101-JP",
  "translationConfig": {
    "baseLocale": "ja-JP",
    "supportedLocales": ["ja-JP"],
    "preserveOriginalVerbatim": true
  },
  "medicalCoding": {
    "meddraVersion": "27.1-J",
    "whoddVersion": "Global-202609",
    "dictionaryDatabaseRef": "vialiq_coding_dictionaries_jp"
  },
  "storageTopology": {
    "mode": "Single",
    "isLockedForProductionDataEntry": true,
    "zones": [
      {
        "zoneId": "ZONE_PRIMARY",
        "zoneProfileId": "PROFILE_JP_TOKYO_APPI_01",
        "name": "Japan Domestic Prod Cluster",
        "targetRegion": "ap-northeast-1",
        "clusterId": "rs-prod-jp-01",
        "databaseName": "study_onco101jp_prod",
        "complianceProfile": "JAPAN_APPI_PMDA",
        "kmsProvider": "aws",
        "kmsKeyArn": "arn:aws:kms:ap-northeast-1:123456789012:key/jp-cmk-01",
        "keyVaultNamespace": "keyvault_study_onco101jp.__keyVault"
      }
    ],
    "defaultZoneId": "ZONE_PRIMARY"
  },
  "identityConfig": {
    "authMode": "EmailPassword",
    "keycloakRealm": "jp-pharma-domestic",
    "oidcIssuer": "https://auth.vialiq.cloud/realms/jp-pharma-domestic",
    "idpAlias": null,
    "secretVaultRef": null,
    "mfaPolicy": {
      "enforcement": "RequiredAll",
      "allowedFactors": ["TotpAuthenticator", "WebAuthnFido2"],
      "stepUpSigningRequired": true
    },
    "sessionAndPasswordPolicy": {
      "idleTimeoutMinutes": 15,
      "maxConcurrentSessions": 1,
      "lockoutAttempts": 5
    }
  }
}
```

#### Example B: Global Multi-Zone Study (Phase 3 Pivotal: `GLOBAL-ONCO-301`)
```json
{
  "_id": "std_roche_global301",
  "protocolNumber": "GLOBAL-ONCO-301",
  "identityConfig": {
    "authMode": "HybridBrokered",
    "keycloakRealm": "roche-global",
    "oidcIssuer": "https://auth.vialiq.cloud/realms/roche-global",
    "idpAlias": "okta-sso",
    "secretVaultRef": "vault://ten_roche/std_roche_global301/oidc",
    "mfaPolicy": {
      "enforcement": "RequiredAll",
      "allowedFactors": ["TotpAuthenticator", "WebAuthnFido2", "HardwareToken"],
      "stepUpSigningRequired": true
    },
    "sessionAndPasswordPolicy": {
      "idleTimeoutMinutes": 15,
      "maxConcurrentSessions": 1,
      "lockoutAttempts": 5
    }
  },
  "translationConfig": {
    "baseLocale": "en-US",
    "supportedLocales": ["en-US", "de-DE", "fr-FR", "zh-CN", "pt-BR"],
    "preserveOriginalVerbatim": true
  },
  "medicalCoding": {
    "meddraVersion": "27.1",
    "whoddVersion": "Global-202609",
    "dictionaryDatabaseRef": "vialiq_coding_dictionaries"
  },
  "storageTopology": {
    "mode": "MultiRegionGeoPartitioned",
    "isLockedForProductionDataEntry": true,
    "zones": [
      {
        "zoneId": "ZONE_US",
        "zoneProfileId": "PROFILE_US_VA_HIPAA_01",
        "name": "North America Storage Zone",
        "targetRegion": "us-east-1",
        "clusterId": "rs-prod-us-01",
        "databaseName": "study_global301_us_prod",
        "complianceProfile": "HIPAA_FDA_PART11",
        "kmsProvider": "aws",
        "kmsKeyArn": "arn:aws:kms:us-east-1:123456789012:key/us-cmk-01",
        "keyVaultNamespace": "keyvault_study_global301_us.__keyVault",
        "maxPoolSize": 200
      },
      {
        "zoneId": "ZONE_EU",
        "zoneProfileId": "PROFILE_EU_FRA_GDPR_01",
        "name": "European Economic Area Storage Zone",
        "targetRegion": "eu-central-1",
        "clusterId": "rs-prod-eu-01",
        "databaseName": "study_global301_eu_prod",
        "complianceProfile": "GDPR_EU_CTR_536",
        "kmsProvider": "aws",
        "kmsKeyArn": "arn:aws:kms:eu-central-1:123456789012:key/eu-cmk-01",
        "keyVaultNamespace": "keyvault_study_global301_eu.__keyVault",
        "maxPoolSize": 200
      },
      {
        "zoneId": "ZONE_CN",
        "zoneProfileId": "PROFILE_CN_BJ_PIPL_01",
        "name": "Mainland China Sovereign Storage Zone",
        "targetRegion": "cn-north-1",
        "clusterId": "rs-prod-cn-01",
        "databaseName": "study_global301_cn_prod",
        "complianceProfile": "CHINA_PIPL_DSL_GENETIC",
        "kmsProvider": "aliyun",
        "kmsKeyArn": "arn:aliyun:kms:cn-north-1:123456789012:key/cn-hsm-01",
        "keyVaultNamespace": "keyvault_study_global301_cn.__keyVault",
        "maxPoolSize": 150
      }
    ],
    "defaultZoneId": "ZONE_US",
    "routingRules": [
      { "priority": 1, "expression": "Site.CountryCode == 'CN'", "targetZoneId": "ZONE_CN" },
      { "priority": 2, "expression": "['DE','FR','IT','ES','PL'].Contains(Site.CountryCode)", "targetZoneId": "ZONE_EU" },
      { "priority": 3, "expression": "['US','CA'].Contains(Site.CountryCode)", "targetZoneId": "ZONE_US" }
    ]
  }
}
```

> **Pre-Go-Live Configuration Lock (Real-World Clinical Reality):**
> Country feasibility, ethics approvals, and clinical site selection happen *before* protocol database build. `storageTopology`, `baseLocale`, and active `supportedLocales` are configured prior to Go-Live (by holders of the SOW-governed **`STUDY_INFRA_CONFIG`** RBAC privilege per [FTS-003](../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md#4-part-c-study-configuration-governance-pre-go-live-locking--sow-rbac)) and **permanently locked** once `PROD` data entry begins (`IsLockedForProductionDataEntry = true`). Any extraordinary mid-study expansion (adding an additive new zone when already in `MultiRegionGeoPartitioned`, or adding a new `locale`) requires a formal GxP Amendment and controlled DBA/engineering change-control procedure.

---

### 4.4 Dynamic Site Assignment Rule Engine, Overrides & Redis Resolution

When clinical sites are registered or synchronized from CTMS:
1. For **`Single`** mode studies: The rule engine short-circuits instantly ($O(1)$) and stamps `ResolvedZoneId = DefaultZoneId`.
2. For **`MultiRegionGeoPartitioned`** studies: The rule engine evaluates the site's geopolitical attributes (`CountryCode`) against the prioritized expressions.
3. **Manual Overrides**: If a Swiss site (`SITE-042`) requires storage in `ZONE_EU` under a bilateral treaty, the Study Admin sets `IsZoneOverridden = true` with a mandatory Part 11 e-signature & audit justification.
4. **Single-Tier Distributed Redis Lookup (`Single` = 100% Local; `Multi-Zone` = Targeted Control-Plane Relay)**: Per the platform's canonical caching standard ([ADR 007-A](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md) & [Scale 004](./004-caching-queues-and-resilience-patterns.md)), `IStudyRegistryService` and `ISiteRegistryCache` cache topology manifests and site routing maps strictly inside **Single-Tier Distributed Redis** (**no `.NET IMemoryCache` / pod L1 RAM caches**). For the ~75–85% `Single` studies, invalidations execute directly against local Regional Redis with zero cross-region overhead; for `MultiRegionGeoPartitioned` studies, Control-Plane Outbox relays `study_registry`/epoch/revocation invalidations only to the study's registered `Zones[]` (with bounded 5–15m routing/claim TTLs), while patient writes and `edc:form_lock:*` leases remain 100% inside their origin regional VPC.

---

### 4.5 The Unified Database Provider (`DynamicClinicalDatabaseResolver`)

In `Vialiq.Infrastructure`, the C# database resolver provides a single, high-performance interface consumed by all services (HTTP requests, SignalR hubs, and background CDC/Outbox workers resolving synthetic `TenantStudyContext` scopes), resolving warm cluster secrets internally from VPC Secrets Manager by `ZoneProfileId`:

```csharp
namespace Vialiq.Infrastructure.Data;

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using Vialiq.Core.Exceptions;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

public interface IClinicalDatabaseProvider
{
    /// <summary>
    /// Resolves the specific target MongoDB database for the active request context.
    /// Fast-paths single-zone studies in O(1) and dynamically routes multi-zone sites.
    /// </summary>
    Task<IMongoDatabase> GetDatabaseAsync(CancellationToken ct = default);

    /// <summary>
    /// Resolves all physical databases participating in the study (1 for single-zone, N for multi-zone).
    /// Used strictly by asynchronous background sweeps and cross-zone administrative reconciliation.
    /// </summary>
    Task<IReadOnlyList<IMongoDatabase>> GetAllZoneDatabasesAsync(CancellationToken ct = default);
}

public sealed class DynamicClinicalDatabaseResolver : IClinicalDatabaseProvider
{
    private readonly ConcurrentDictionary<string, IMongoClient> _clusterClients = new();
    private readonly ITenantStudyContextAccessor _contextAccessor;
    private readonly IStudyRegistryService _studyRegistry;
    private readonly ISiteRegistryCache _siteCache;
    private readonly IClusterSecretProvider _secretProvider;
    
    // Request-scoped resolution handle (scoped per HTTP/worker execution, never cross-request RAM cache)
    private IMongoDatabase? _scopedDatabase;

    public DynamicClinicalDatabaseResolver(
        ITenantStudyContextAccessor contextAccessor,
        IStudyRegistryService studyRegistry,
        ISiteRegistryCache siteCache,
        IClusterSecretProvider secretProvider)
    {
        _contextAccessor = contextAccessor;
        _studyRegistry = studyRegistry;
        _siteCache = siteCache;
        _secretProvider = secretProvider;
    }

    public async Task<IMongoDatabase> GetDatabaseAsync(CancellationToken ct = default)
    {
        if (_scopedDatabase != null)
            return _scopedDatabase;

        var context = _contextAccessor.GetCurrentContext()
            ?? throw new InvalidOperationException("No active TenantStudyContext resolved for the current request.");

        var topology = await _studyRegistry.GetTopologyAsync(context.TenantId, context.StudyId, ct).ConfigureAwait(false)
            ?? throw new ConfigurationException($"Storage topology missing for study '{context.StudyId}'.");

        // 1. FAST-PATH: Single-Zone Studies (~85% of traffic)
        // If mode is Single, immediately return its one assigned database with zero site evaluation
        if (topology.IsSingleZone)
        {
            var singleZone = topology.Zones[0];
            _scopedDatabase = GetMongoDatabase(singleZone);
            return _scopedDatabase;
        }

        // 2. DYNAMIC PATH: Multi-Zone Studies (~15% of traffic)
        // Requires SiteId from the context to resolve geopolitical partition
        if (string.IsNullOrEmpty(context.SiteId))
        {
            // Default zone fallback if siteId is omitted (e.g. general study settings query)
            var defaultZone = topology.Zones.Find(z => z.ZoneId == topology.DefaultZoneId) ?? topology.Zones[0];
            _scopedDatabase = GetMongoDatabase(defaultZone);
            return _scopedDatabase;
        }

        var site = await _siteCache.GetSiteAsync(context.TenantId, context.StudyId, context.SiteId, ct).ConfigureAwait(false)
            ?? throw new ClinicalEntityNotFoundException($"Site '{context.SiteId}' not found in study '{context.StudyId}'.");

        var targetZoneId = site.ResolvedZoneId ?? topology.DefaultZoneId;
        var targetZone = topology.Zones.Find(z => z.ZoneId == targetZoneId)
            ?? throw new ConfigurationException($"Target zone '{targetZoneId}' not configured in study topology.");

        _scopedDatabase = GetMongoDatabase(targetZone);
        return _scopedDatabase;
    }

    public async Task<IReadOnlyList<IMongoDatabase>> GetAllZoneDatabasesAsync(CancellationToken ct = default)
    {
        var context = _contextAccessor.GetCurrentContext()
            ?? throw new InvalidOperationException("No active TenantStudyContext.");

        var topology = await _studyRegistry.GetTopologyAsync(context.TenantId, context.StudyId, ct).ConfigureAwait(false);
        var databases = new List<IMongoDatabase>(topology.Zones.Count);

        foreach (var zone in topology.Zones)
        {
            databases.Add(GetMongoDatabase(zone));
        }

        return databases;
    }

    private IMongoDatabase GetMongoDatabase(StorageZoneConfig zone)
    {
        var client = _clusterClients.GetOrAdd(zone.ClusterId, _ =>
        {
            // Secrets resolved purely from internal VPC Secrets Manager by SRE-certified ZoneProfileId
            var connectionUri = _secretProvider.ResolveMongoConnectionUri(zone.ZoneProfileId);
            var settings = MongoClientSettings.FromConnectionString(connectionUri);
            settings.MaxConnectionPoolSize = zone.MaxPoolSize;
            settings.MinConnectionPoolSize = 10;
            settings.WaitQueueTimeout = TimeSpan.FromSeconds(3);
            // Operational clinical reads require strict Read-Your-Own-Writes consistency.
            // All clinical operational queries route to Primary. Secondaries provide HA failover.
            settings.ReadPreference = ReadPreference.Primary;
            settings.ReadConcern = ReadConcern.Majority;
            settings.WriteConcern = WriteConcern.WMajority;
            return new MongoClient(settings);
        });

        return client.GetDatabase(zone.DatabaseName);
    }
}
```

---

### 4.6 Clean Architecture Invariant: Zero Controller & Service Pollution

Because of the polymorphic abstraction in `DynamicClinicalDatabaseResolver`, **business logic code in `Vialiq.Api` and `Vialiq.Core` is 100% decoupled from storage topology**:

```csharp
namespace Vialiq.Infrastructure.Services;

using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using Vialiq.Core.Entities;
using Vialiq.Core.Interfaces;
using Vialiq.Infrastructure.Data;

public sealed class CrfEntryService : ICrfEntryService
{
    private readonly IClinicalDatabaseProvider _dbProvider;
    private readonly IAuditTrailService _auditTrail;

    public CrfEntryService(
        IClinicalDatabaseProvider dbProvider,
        IAuditTrailService auditTrail)
    {
        _dbProvider = dbProvider;
        _auditTrail = auditTrail;
    }

    public async Task SaveCrfEntryAsync(CrfEntryEntity entry, CancellationToken ct = default)
    {
        // LOOK: ZERO if/else zone checks!
        // The provider automatically yields study_onco101_prod (SingleZone)
        // OR study_global301_eu_prod (MultiZone EU site)
        var database = await _dbProvider.GetDatabaseAsync(ct).ConfigureAwait(false);
        var collection = database.GetCollection<CrfEntryEntity>("crf_entries");

        await collection.ReplaceOneAsync(
            x => x.Id == entry.Id, 
            entry, 
            new ReplaceOptions { IsUpsert = true }, 
            ct).ConfigureAwait(false);

        await _auditTrail.LogMutationAsync(entry, ct).ConfigureAwait(false);
    }
}
```

* **The Developer Benefit:** A backend engineer writing clinical features, validation logic, or query resolution **never** writes boilerplate zone routing code.

---

### 4.7 Operational vs. Global Reporting Aggregation

* **Regional Operational Reporting (Same-Zone):** For single-zone studies or single-country monitors inspecting sites in their local zone, queries run directly against the regional MongoDB Primary (`ReadPreference.Primary`) via `IClinicalDatabaseProvider` ($< 10\text{ ms}$ latency).
* **Cross-Zone Executive Dashboards (Avoid WAN Lag):** Synchronously dispatching live `Task.WhenAll` MongoDB `aggregate()` queries over WAN across the US, EU, and Mainland China (`180–350 ms+` RTT and Great Firewall TCP jitter) introduces brittle latency spikes and partial dashboard failures. Instead, global cross-zone executive and CRA study dashboards query the **Central SQL Server 2022 Reporting Warehouse / Rollup Store** ($< 15\text{ ms}$), which is continuously updated by regional CDC / metric streams (see [Section 7.3](#73-tier-2-fast-global-executive-dashboards-sql-server-rollup-store)). Batch reconciliation jobs can optionally use `IClinicalDatabaseProvider.GetAllZoneDatabasesAsync()` asynchronously.

---

### 4.8 Turnkey Developer Ergonomics & xUnit Test Doubles

In local developer environments (Mac workstations, CI pipelines) or automated unit test suites:
* Developers run single-instance MongoDB locally (e.g. `vialiq-mongo-layer3-prod` on `localhost:27037`).
* In `appsettings.Development.json`, `ZONE_US`, `ZONE_EU`, and `ZONE_CN` test profiles point to `mongodb://localhost:27037` with isolated database names (`study_test_us_prod`, `study_test_eu_prod`).
* Automated unit tests substitute an `IClinicalDatabaseProvider` xUnit test double (`FakeClinicalDatabaseProvider`) for fast offline CI verification (note: there is no application `.NET IMemoryCache` tier in runtime).

---

---

## 5. Multilingual Data Invariance (Functional Boundaries)

### 5.1 Decoupling: UI i18n vs. Protocol-Specific Translations

It is critical to distinguish the **System UI Localization** from the **Clinical Protocol Translation Module**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. SYSTEM UI i18n FRAMEWORK (General Application Shell)                                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Controls buttons, system modals, date picker formatting, menu items.                 │
│ • "Save", "Submit", "Sign", "Cancel", "Audit History", "Filter".                       │
│ • Handled via static frontend localization files (`@vialiq/i18n`).                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. STUDY TRANSLATION MODULE (Clinical Protocol Domain Requirement)                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ • Study-specific, versioned translation matrix managed per Protocol Version.           │
│ • CRF Form Titles: "Vital Signs" ➔ "Signes Vitaux" ➔ "生命体征"                          │
│ • Field Prompts: "Was the patient fasting?" ➔ "Le patient était-il à jeun?"            │
│ • Dynamic Codelist Options: "Mild / Moderate / Severe" ➔ "Leicht / Mäßig / Schwer"     │
│ • ePRO Patient Survey Questionnaires and Instructions.                                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 Study & Site Language Rules (`Base ↔ Site` Toggle & Free-Text Translation)

Vialiq follows industry-proven multilingual workflows (aligned with Medidata Rave & Veeva Vault EDC), eliminating complex $N \times N$ foreign-to-foreign language translation matrices:

1. **Study Default Loads in `BASE_LANGUAGE`:**
   - Upon opening a study, the application defaults to the study's configured `baseLocale` (note: `baseLocale` is not required to be English—e.g. a domestic Japanese PMDA study runs in `ja-JP` as its `baseLocale`).
   - Once a user enters Site-level operational workflows (Subject Matrix / Site View / Data Entry), the active clinical context automatically engages that Site's assigned **`SITE_LANGUAGE`**.
2. **User Preferences Governance:**
   - A user can switch or override their viewing preference for `BASE_LANGUAGE` in **User Preferences** (e.g., global CRA/Data Manager UI review), **but can NEVER override a Site's configured `SITE_LANGUAGE`**.
3. **In-Page `Base ↔ Site` Language Toggle:**
   - Every Data Entry (DE) and inspection page provides a quick `Base ↔ Site` language toggle allowing Site Admins, CRAs, and Auditors to flip labels, dropdown displays, and translated verbatims cleanly.
4. **Hub-and-Spoke Free-Text Translation (`Site Language → Base Language` ONLY):**
   - Free-text inputs (`text-input`, `textarea`) explicitly marked `isTranslatable: true` in Form Builder (e.g., `AE.AETERM`, `MH.MHTERM`, `CM.CMTRT`) participate in the **`Site Language → Base Language`** translation workflow.
   - The original investigator entry (e.g., `"Dor de cabeça severa"` in `pt-BR`) is **preserved verbatim** alongside its translated `BaseLanguage` equivalent (`"Severe headache"`).
   - **No Cross-Site Foreign Matrix:** Translating directly between non-base site languages (e.g., Portuguese $\rightarrow$ Chinese for a Chinese site admin) is **explicitly not supported** (Chinese site personnel have zero RBAC access to Brazilian sites under GCP).

---

### 5.3 The Invariant Storage Principle (Canonical CDISC Encoding)

> **The Architectural Golden Rule:**  
> Translated human strings must **NEVER** be stored as dictionary keys, field identifiers, or coded categorical answers in the operational database.

Regardless of whether the form was filled out by a German nurse in Berlin, a French doctor in Lyon, or a Chinese coordinator in Beijing, **the structured database record is 100% invariant, uniform, and CDISC SDTM compliant**:

```json
{
  "_id": { "$oid": "6727658f8b0123456789abcd" },
  "tenantId": "ten_roche_global",
  "studyId": "GLOBAL-ONCO-301",
  "siteId": "SITE-052",
  "subjectId": "SUBJ-052-001",
  "formKey": "FORM_VS",
  "visitKey": "VISIT_02",
  
  // INVARIANT CLINICAL VALUES: Universal CDISC Keys & Concept Identifiers
  "clinicalData": {
    "SYSBP": 122,                                       // CDISC SDTM Variable for Systolic BP
    "DIABP": 82,                                        // CDISC SDTM Variable for Diastolic BP
    "TEMP": 37.1,
    "PULSE": 74,
    "AE_SEVERITY": "C25473"                             // CDISC NCI Concept Code for "Mild"
  },
  
  // REGULATORY AUDIT ATTRIBUTION (FDA Part 11 & ICH GCP E6 R3)
  "auditMeta": {
    "serverTimestampUtc": { "$date": "2026-11-03T08:30:00.000Z" },
    "auditSequence": 1042,
    "performedByUserId": "usr_dr_mueller_052",
    "performedByRole": "Investigator",
    "cultureCode": "de-DE",                             // Language used during data entry
    "clientTimeZoneId": "Europe/Berlin",
    "clientReportedLocalTime": { "$date": "2026-11-03T09:30:00.000Z" }
  }
}
```

---

### 5.4 Runtime Localized Presentation & Audit Metadata Binding

When the Angular 21 form engine renders the CRF:
1. It requests the **Published Form Schema** (`vialiq:study:roche:global301:prod:ep1:blinded:de-DE:form:vs:schema`) from Distributed Redis ([ADR 007-A](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md) & [ADR 010](../critical-problems-and-adrs/010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md)).
2. It requests the **Culture-Specific Translation Bundle** from Distributed Redis (`vialiq:study:roche:global301:prod:ep1:std:de-DE:lang:bundle`).
3. The renderer matches:
   - Variable `SYSBP` $\rightarrow$ Label: *"Systolischer Blutdruck (mmHg)"*
   - Concept `C25473` $\rightarrow$ Dropdown Text: *"Leicht"*
4. When saved, the value sent over the wire is strictly `"C25473"`, and the audit trail preserves `cultureCode: "de-DE"`.

**The Result:** Perfect local clinician usability with zero statistical downstream corruption.

---

## 6. Cryptographic Privacy & Localized Key Management (CSFLE + Regional KMS)

### 6.1 The Sovereign Envelope Encryption Topology

To guarantee that European or Chinese patient data and cryptographic keys remain physically and legally quarantined within their origin countries, patient PII (`SiteIdentifier` classification from [ADR 004](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)) is encrypted using **MongoDB Client-Side Field-Level Encryption (CSFLE)** with **regional KMS keys AND regional `__keyVault` storage**:

* **`study_registry` (Layer 1 Control Plane) stores pointers ONLY:** It persists non-secret KMS configuration (`kmsProvider`, `kmsKeyArn`, `keyVaultNamespace`) per storage zone—**never raw DEK secrets**.
* **Sovereign Key Vault Residency:** Actual wrapped Data Encryption Keys (`__keyVault` collection) physically reside in an isolated database **inside each regional cluster** (`keyvault_study_global301_eu.__keyVault` on `rs-prod-eu-01`; `keyvault_study_global301_cn.__keyVault` on `rs-prod-cn-01`) wrapped by that region's local KMS/HSM (detail codified in [`006-field-level-encryption-csfle-and-key-management-architecture.md`](../backend-architecture/database/006-field-level-encryption-csfle-and-key-management-architecture.md)).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     LOCALIZED ENVELOPE ENCRYPTION & SOVEREIGN KEY VAULTS               │
├──────────────────────────────┬──────────────────────────────┬──────────────────────────┤
│ ZONE_US (N. Virginia)        │ ZONE_EU (Frankfurt)          │ ZONE_CN (Beijing)        │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────┤
│ AWS KMS: us-east-1           │ AWS KMS: eu-central-1        │ Local Cloud HSM: Beijing │
│ Vault: keyvault_*_us.__keyVlt│ Vault: keyvault_*_eu.__keyVlt│ Vault: keyvault_*_cn..   │
│                              │                              │                          │
│ Wraps DEKs inside US VPC:    │ Wraps DEKs inside EU VPC:    │ Wraps DEKs inside CN VPC:│
│ • US Subject Names & MRNs    │ • EU Subject Names & DOB     │ • CN Subject Names & IDs │
│ • US Audit PII Snapshots     │ • EU Audit PII Snapshots     │ • CN Audit PII Snapshots │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────┘
```

---

### 6.2 Cross-Region Decryption Prevention Guarantee

* **Physical & Key Isolation:** Both the European Master Key (AWS Frankfurt KMS HSM) and Europe's wrapped DEK collection (`__keyVault`) reside exclusively inside `eu-central-1`.
* **IAM Policy Guard:** IAM roles in the United States or Asia **explicitly lack `kms:Decrypt` permissions** on the European CMK and DB RBAC access to `keyvault_*_eu`.
* **The Forensic Guarantee:** Even if an attacker or rogue administrator acquires a complete physical database dump (`mongodump`) of `study_onco301_eu_prod`, the patient PII fields are ciphertext and neither the DEKs nor the decrypt API are reachable outside Frankfurt.

---

### 6.3 GDPR Article 17 Crypto-Shredding Across CRFs & Audit Trails

In European clinical sites, a participant may withdraw consent and exercise their **GDPR Article 17 Right to Erasure**.

#### The Problem:
1. Deleting records from `crf_entries` or `audit_crf_data` violates **FDA 21 CFR Part 11 § 11.10(e)** and destroys the SHA-256 cryptographic audit chain.
2. Leaving plaintext PII in historical audit trail `oldValue` / `newValue` snapshots violates GDPR Article 17 even if the live CRF is erased.

#### The Vialiq Solution (Unified Zone-Local Cryptographic Erasure):
1. Every subject has an isolated, individual **Data Encryption Key (`dek_subject_{uuid}`)** stored in their **Site Zone's `__keyVault`**.
2. Both live `crf_entries` PII and `audit_trail` `oldValue`/`newValue` `SiteIdentifier` snapshots are encrypted with that subject's `dek_subject_{uuid}`.
3. When Patient `SUBJ-052-001` exercises Article 17:
   - The platform securely deletes/revokes Patient 001's specific DEK inside **`ZONE_EU`'s `__keyVault`**, logs an unencrypted structural compliance event (`GDPR_CRYPTO_SHREDDING_EXECUTED`), and respects native MongoDB `libmongocrypt` driver key expiration (see [`006-csfle`](../backend-architecture/database/006-field-level-encryption-csfle-and-key-management-architecture.md)).
4. **The Outcome:**
   - The clinical records and SHA-256 chained `audit_trail` (`auditSequence`, `serverTimestampUtc`, `performedByUserId`, `reasonForChange`, `signatureHash`) remain **100% intact**.
   - Patient PII across both live forms and historical audit logs permanently collapses into unrecoverable ciphertext, rendering cleanly in the UI/exports as **`[REDACTED — GDPR ARTICLE 17 ERASURE EXECUTED]`**.

---

## 7. Exhaustive Global Reporting Architecture Across Disjoint Physical Locations

### 7.1 The 3-Tier Clinical Reporting Taxonomy

When operational data is physically partitioned across US, EU, and China clusters, reporting separates strictly into 3 latency-safe, legally compliant tiers:

```
=======================================================================================================================
THE 3-TIER CLINICAL REPORTING ENGINE
=======================================================================================================================
Reporting Tier          Primary Audience              Target Datastore         Data Transferred Across Borders
-----------------------------------------------------------------------------------------------------------------------
Tier 1: Local Operational Local CRAs, Monitors, PIs   Local Regional Mongo DB  ZERO (100% local inside region VPC)
Tier 2: Global Dashboards Executive Sponsors, Study   Central SQL Server 2022  ZERO PII (Pre-rolled site/study metrics
                          Admins, Global CRAs         / Rollup Metrics Store   pushed out via regional CDC workers)
Tier 3: Biostatistics/FDA SAS Programmers, Coders,    Central Reporting DWH    ZERO PII (SiteIdentifier dropped in-region;
                          Regulators (SDTM/ADaM)      (SQL Server Columnstore) pseudonymized ClinicalResearch + safe coded terms)
=======================================================================================================================
```

---

### 7.2 Tier 1: Local Operational & Monitoring Reporting

* **Scope:** Single-site or single-country monitoring within a single zone.
  - *"Show all unverified forms at Charité Berlin."*
  - *"List all open discrepancy queries for Site 052."*
  - *"Display the full Part 11 audit trail for Patient 052-003."*
* **Architecture:** The query routes directly to the regional cluster (`rs-prod-eu-01`) Primary node using `ReadPreference.Primary` and `ReadConcern.Majority` to guarantee strict Read-Your-Own-Writes consistency for newly entered forms, discrepancy queries, and audit trails.
* **Latency:** $< 10\text{ ms}$. Full patient identifying metadata is available locally to authorized investigators. Zero cross-border data transfer.

---

### 7.3 Tier 2: Fast Global Executive Dashboards (SQL Server Rollup Store)

* **Scope:** Interactive cross-country monitoring dashboards for Study Administrators, Global CRAs, and Sponsor Leads across all participating zones.
  - *"What is our total worldwide patient enrollment today?"*
  - *"Show open discrepancy query aging and SDV completion rates across US, Germany, and China sites."*

#### Why Live Synchronous Cross-WAN Mongo Queries Are Rejected:
Firing real-time `Task.WhenAll` MongoDB aggregations across `us-east-1`, `eu-central-1`, and Mainland China (`cn-north-1`) on every page load suffers **180–350 ms+ cross-continental WAN latency** and **Great Firewall TCP inspection stalls**, causing sluggish dashboards whenever any remote link blips.

#### The Production Solution: Central SQL Server Rollup Store (< 15 ms)
1. **Local Aggregation Inside Each Zone:** Lightweight regional CDC / metric workers maintain real-time site/study summary counters (`enrolledCount`, `openQueriesCount`, `sdvCompletedPct`, `saeGradeCounts`) inside each regional VPC.
2. **Non-PII Metric Sync:** Only anonymous, aggregated site KPI counts (zero patient records, zero free text) replicate continuously to the **Central SQL Server 2022 Reporting Database** over TLS 1.3.
3. **Instant Global Dashboards:** When a global CRA or Study Admin opens the study dashboard, ASP.NET Core 9 queries Central SQL Server in **$< 15\text{ ms}$**, completely immune to cross-ocean MongoDB WAN latency or China firewall stalls.

---

### 7.4 Tier 3: Global Biostatistics, SDTM Datasets & SQL Server ETL (Regional CDC Boundary)

* **Scope:** Pooled global clinical efficacy/safety analysis, MedDRA/WHODrug medical coding, and FDA NDA / EMA MAA **CDISC SDTM/ADaM** submission dataset generation across all 5,000 subjects worldwide.
* **The Architecture:** Powered by [**ADR 004 (CSFLE-to-SQL Server CDC Boundary)**](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md) deployed symmetrically inside each region's VPC:

```
┌───────────────────────────────────────────┐
│ REGIONAL MONGO PROD (US / EU / CN VPC)    │
│ - Live clinical + PII (`SiteIdentifier`)  │
│ - Subject Identity keys stay in-region    │
└─────────────────────┬─────────────────────┘
                      │ 1. Local MongoDB Change Stream
                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│ REGIONAL CDC BOUNDARY WORKER (.NET 9 Worker INSIDE Regional VPC)       │
├────────────────────────────────────────────────────────────────────────┤
│ Enforces ADR 004 4-Tier Classification BEFORE leaving region:         │
│                                                                        │
│ ❌ SiteIdentifier (Name, MRN, National ID)  ➔ HARD-DROPPED AT BORDER   │
│ ❌ Unscrubbed Raw Free-Text Notes           ➔ BLOCKED IN-REGION        │
│ 🛡️ Translatable AE/Med Verbatims            ➔ PII-scrubbed, translated │
│                                                Site → Base + MedDRA    │
│ 🙈 BlindedRTSM (Treatment Arm, Drug Kit)    ➔ MASKED AS "BLINDED"      │
│ ⛔ Quarantine (Unregistered/Missing Schema) ➔ ROUTED TO LOCAL ZONE DLQ │
│ ✅ ClinicalResearch (Labs, Vitals, Dates)   ➔ EMITTED OVER TLS 1.3     │
└─────────────────────┬──────────────────────────────────────────────────┘
                      │ 2. De-Identified Pseudonymous Stream (`GlobalSubjectGuid` / `SUBJ-052-001`)
                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│ CENTRAL REPORTING WAREHOUSE (Microsoft SQL Server 2022+ Columnstore)   │
├────────────────────────────────────────────────────────────────────────┤
│ • Merges US + EU + China rows cleanly into CDISC SDTM tables:          │
│   `sdtm.DM`, `sdtm.VS`, `sdtm.LB`, `sdtm.AE`, `sdtm.DS`, `sdtm.CM`     │
│ • Zero Direct Patient PII exists in SQL Server (HIPAA Safe Harbor)     │
│ • Drives unified SAS/R/Python statistical analysis & Tier 2 Dashboards │
└────────────────────────────────────────────────────────────────────────┘
```

#### Regulatory & Compliance Safeguards:
* **Zero Direct PII or Raw Unscrubbed Notes Cross Borders:** Any direct patient identifiers (`SiteIdentifier`) and any unclassified (`Quarantine`) fields never leave the regional cluster's VPC. Clinical verbatims needed for SDTM (`AETERM`, `CMTRT`) pass through PII scrubbing + controlled `Site → Base` translation / MedDRA coding in-region (and China PIPL/HGRAC transfer approvals cover pseudonymized safety/endpoint tables).
* **HIPAA Safe Harbor (§ 164.514(b)) & GDPR Art. 89(1):** SQL Server operates strictly on pseudonymized research data (`GlobalSubjectGuid`).
* **Single SQL Server ETL Target:** Existing SQL Server SDTM/ADaM transformations require zero multi-dialect duplication—every region pushes normalized, schema-verified research rows into one central SQL Server reporting schema.

---

## 8. Edge Cases, Patient Transfers, Regulatory Inspections & SOW Governance

Because cross-border subject transfers, multi-national health authority inspections, and client SOW role governance span both operational workflows and infrastructure policies, their exhaustive functional and technical specification is maintained in a dedicated companion document:

> 👉 **[FTS-003: Inter-Zone Patient Transfers, Multi-National Health Authority Inspections & Study Governance](../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md)**

Summary highlights governed by **FTS-003**:
1. **Inter-Zone Subject Relocation:** Origin visits (`ZONE_US`) remain immutably locked (`TRANSFERRED_OUT`); destination sites (`ZONE_EU`) capture local re-consent and enroll a linked subject referencing `GlobalSubjectGuid`. Central SQL Server merges both chronological segments cleanly into SDTM `DM`/`DS`.
2. **Multi-National Inspections (FDA, EMA, NMPA):** Scoped read-only Inspector credentials route strictly to their jurisdiction's replica set, rendering UTC + Local TZ, `Base ↔ Site` toggles with preserved original verbatims, bookmarked certified PDF/A packets, and EMA-mandated dynamic XML/CSV audit exports.
3. **SOW-Flexible Configuration Governance (`STUDY_INFRA_CONFIG`):** Tenant Admins assign `STUDY_INFRA_CONFIG` per client SOW (either to Vialiq Managed Services OR Client Self-Service Technical Lead), restricted strictly to pre-certified Zone Profiles (zero raw DB connection strings) and locked pre-Go-Live once `PROD` FPI begins.

---

## 9. Summary Engineering Matrix & Implementation Checklist

```
=======================================================================================================================
SUMMARY ARCHITECTURAL MATRIX: MULTI-REGION & MULTILINGUAL EDC PLATFORM
=======================================================================================================================
Architectural Concern              Engineering Solution                Regulatory Standard           Key Benefit
-----------------------------------------------------------------------------------------------------------------------
1. Single Protocol vs Multi-Country "One Logical Study, Multi-DB Farm"  ICH GCP E6(R3) Section 5.18   Unified protocol build;
                                    (Site-Group Geo-Partitioning)                                    locked before PROD FPI.
2. Cross-Border Sovereignty        Dynamic Site Storage Resolver       China PIPL/DSL, GDPR Art. 9,  Zero PII leaves legal
   (China, EU, US)                  (`CountryCode` / Override Rules)    HIPAA Security Rule           country of origin.
3. Multilingual Representation     Canonical CDISC DB Keys +           CDISC SDTM v3.4,              Base default + User override
                                    `Base ↔ Site` Toggle (`Site → Base`) ICH GCP E6(R3) Attribution  (Site language immutable).
4. Cryptographic Sovereignty       CSFLE + Regional `__keyVault` DBs   GDPR Art. 17 (Right to Eras.) Shreds CRFs + Audit PII;
                                    & KMS pointers in `study_registry`  FDA 21 CFR Part 11 § 11.10   SHA-256 chain stays intact.
5. Local Operational Queries       Direct Regional Primary Reads       FDA 21 CFR Part 11            < 10ms response time;
                                    (`ReadPreference.Primary`)                                         strict Read-Your-Own-Writes.
6. Fast Cross-Zone Dashboards      Central SQL Server Rollup Store     Non-PII Site KPI Rollups      < 15ms UI; zero China/EU
                                    (No slow live WAN Mongo queries)                                 WAN latency failures.
7. Biostatistical Clinical Science  Regional CDC Boundary Workers      HIPAA Safe Harbor,            Unified global SDTM/ADaM
                                    (In-Region De-ID ➔ Central SQL)     GDPR Art. 89 (Scientific)     across 5,000+ subjects.
8. Transfers, Audits & SOW Roles   Origin Custody + GlobalGuid Join    FDA BIMO / EMA / NMPA /       FTS-003 unified governance
                                    + `STUDY_INFRA_CONFIG` Catalog      SOC 2 Separation of Duties    & SOW flexibility.
=======================================================================================================================
```

### Developer Implementation Checklist:
- [ ] **Data Model:** Add canonical `storageTopology`, `translationConfig`, `medicalCoding`, and zone KMS pointers to `study_registry` (with pre-Go-Live lock enforcement once `PROD` subjects exist).
- [ ] **Site Entity:** Ensure `SiteEntity` includes `CountryCode`, immutable `SiteLanguage`, `ResolvedZoneId`, and `IsZoneOverridden`.
- [ ] **Infrastructure Service:** Implement `DynamicClinicalDatabaseResolver.cs` resolving secrets by `ZoneProfileId` using Single-Tier Distributed Redis caching (no `.NET IMemoryCache`).
- [ ] **Key Vault Topology:** Provision per-region `__keyVault` databases inside `rs-prod-us`, `rs-prod-eu`, and `rs-prod-cn`, enforcing GDPR crypto-shredding across both `crf_entries` and `audit_trail` snapshots.
- [ ] **Regional CDC & SQL Server:** Deploy regional `.NET CDC Boundary Workers` inside each zone VPC to strip `SiteIdentifier` PII and emit de-identified `ClinicalResearch` + non-PII KPIs to Central SQL Server 2022.
- [ ] **FTS-003 Compliance:** Implement `TRANSFERRED_OUT` / re-consent linkage workflows, read-only scoped Inspector views (PDF/A & CSV/XML), and `STUDY_INFRA_CONFIG` RBAC catalog bindings.

