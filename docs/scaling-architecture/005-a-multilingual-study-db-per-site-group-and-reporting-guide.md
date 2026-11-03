# Architectural Guide & Specification: Multilingual Global Studies with Disjoint Compliance, Site-Group Database Partitioning & Federated Reporting

> **Document ID:** `VIALIQ-SCALE-005A`  
> **Domain:** Platform Scalability — Global Data Sovereignty, Site-Group Database Partitioning, Multilingual Data Invariance & Federated Reporting  
> **Status:** Accepted / Active Architecture Standard  
> **Date:** November 2026  
> **Version:** 1.0.0  
> **Target Systems:** MongoDB 7.0+ Replica Set Farm, .NET 9 Kestrel, Debezium / Apache Kafka CDC, SQL Server 2022+ Columnstore / Snowflake, AWS KMS / Azure Key Vault / Regional Cloud HSMs  
> **Regulatory Standards:** FDA 21 CFR Part 11, EU Clinical Trials Regulation (EU CTR 536/2014), GDPR Art. 9/17/28/89, HIPAA Security Rule § 164.312, China Personal Information Protection Law (PIPL) & Data Security Law (DSL), Japan Act on the Protection of Personal Information (APPI), ICH GCP E6(R3) Section 5.18, CDISC SDTM v2.0  
> **Related Architecture Documents:**
> - [ADR 004: CSFLE-to-SQL Server CDC Decryption Boundary](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)
> - [ADR 006: 21 CFR Part 11 Audit Trail Architecture](../critical-problems-and-adrs/006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md)
> - [ADR 007-A: Multi-Tenant Cache Isolation & Security Scoping](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md)
> - [ADR 009: Legal Timestamp Authority & Monotonic Sequencing](../critical-problems-and-adrs/009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md)
> - [ADR 010: Double-Blind RTSM Unblinding Prevention in Caching Tiers](../critical-problems-and-adrs/010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md)
> - [Scale 001: Database Horizontal Scaling & Storage Lifecycle](./001-database-horizontal-scaling-and-sharding.md)
> - [Scale 005: Database Cluster Farm & Throughput Scaling](./005-database-cluster-farm-regional-compliance-and-throughput-scaling.md)

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
   - [4.7 Unified Aggregate Executor (`IClinicalAggregateExecutor`) for Reporting](#47-unified-aggregate-executor-iclinicalaggregateexecutor-for-reporting)
   - [4.8 Turnkey Developer Ergonomics: In-Memory & Local Testing](#48-turnkey-developer-ergonomics-in-memory--local-testing)
5. [Multilingual Data Invariance (Functional Boundaries)](#5-multilingual-data-invariance-functional-boundaries)
   - [5.1 Decoupling: UI i18n vs. Protocol-Specific Translations](#51-decoupling-ui-i18n-vs-protocol-specific-translations)
   - [5.2 The Invariant Storage Principle (Canonical CDISC Encoding)](#52-the-invariant-storage-principle-canonical-cdisc-encoding)
   - [5.3 Runtime Localized Presentation & Audit Metadata Binding](#53-runtime-localized-presentation--audit-metadata-binding)
6. [Cryptographic Privacy & Localized Key Management (CSFLE + Regional KMS)](#6-cryptographic-privacy--localized-key-management-csfle--regional-kms)
   - [6.1 The Sovereign Envelope Encryption Topology](#61-the-sovereign-envelope-encryption-topology)
   - [6.2 Cross-Region Decryption Prevention Guarantee](#62-cross-region-decryption-prevention-guarantee)
   - [6.3 GDPR Article 17 Crypto-Shredding without Audit Invalidation](#63-gdpr-article-17-crypto-shredding-without-audit-invalidation)
7. [Exhaustive Global Reporting Architecture Across Disjoint Physical Locations](#7-exhaustive-global-reporting-architecture-across-disjoint-physical-locations)
   - [7.1 The 3-Tier Clinical Reporting Taxonomy](#71-the-3-tier-clinical-reporting-taxonomy)
   - [7.2 Tier 1: Local Operational & Monitoring Reporting](#72-tier-1-local-operational--monitoring-reporting)
   - [7.3 Tier 2: Real-Time Global Executive Dashboards (Federated Push-Down Math)](#73-tier-2-real-time-global-executive-dashboards-federated-push-down-math)
   - [7.4 Tier 3: Global Biostatistics & CDISC Submission Data Lake (CDC De-Identification)](#74-tier-3-global-biostatistics--cdisc-submission-data-lake-cdc-de-identification)
8. [Edge Cases, Patient Transfers & Inspection Readiness](#8-edge-cases-patient-transfers--inspection-readiness)
   - [8.1 Inter-Site Subject Relocation Across Storage Zones](#81-inter-site-subject-relocation-across-storage-zones)
   - [8.2 Multi-National Health Authority Inspection Readiness (FDA vs. EMA vs. NMPA)](#82-multi-national-health-authority-inspection-readiness-fda-vs-ema-vs-nmpa)
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

### 4.2 Polymorphic Storage Topology Contracts in `Vialiq.Core`

The core domain contracts define storage topology as an immutable, polymorphic contract:

```csharp
namespace Vialiq.Core.Models;

using System.Collections.Generic;

public enum StorageTopologyMode
{
    SingleZone = 1,
    MultiRegionGeoPartitioned = 2
}

public sealed record StorageZoneConfig(
    string ZoneId,
    string Name,
    string TargetRegion,
    string ClusterId,
    string ConnectionUri,
    string DatabaseName,
    string ComplianceProfile,
    string KmsKeyArn,
    int MaxPoolSize = 200);

public sealed record SiteRoutingRule(
    string RuleId,
    int Priority,
    string Expression,
    string TargetZoneId);

public sealed record StorageTopologyManifest(
    StorageTopologyMode Mode,
    IReadOnlyList<StorageZoneConfig> Zones,
    string DefaultZoneId,
    IReadOnlyList<SiteRoutingRule>? RoutingRules = null)
{
    public bool IsSingleZone => Mode == StorageTopologyMode.SingleZone || Zones.Count <= 1;
}
```

---

### 4.3 Declarative Manifests: Single-Zone vs. Multi-Zone

Both configurations live side-by-side in `vialiq_control_plane.study_registry`, parsed by the exact same JSON schema:

#### Example A: Standard Single-Zone Study (Phase 1 Oncology: `ONCO-101`)
```json
{
  "_id": "std_roche_onco101",
  "protocolNumber": "ONCO-101",
  "storageTopology": {
    "mode": "SingleZone",
    "zones": [
      {
        "zoneId": "ZONE_PRIMARY",
        "name": "US Commercial Prod Cluster",
        "targetRegion": "us-east-1",
        "clusterId": "rs-prod-us-01",
        "connectionUri": "mongodb://node1.us.vialiq:27037/?replicaSet=rs-prod-us",
        "databaseName": "study_onco101_prod",
        "complianceProfile": "HIPAA_FDA_PART11",
        "kmsKeyArn": "arn:aws:kms:us-east-1:123456789012:key/us-cmk-01"
      }
    ],
    "defaultZoneId": "ZONE_PRIMARY"
    // No routingRules needed — all sites route to ZONE_PRIMARY
  }
}
```

#### Example B: Global Multi-Zone Study (Phase 3 Pivotal: `GLOBAL-ONCO-301`)
```json
{
  "_id": "std_roche_global301",
  "protocolNumber": "GLOBAL-ONCO-301",
  "storageTopology": {
    "mode": "MultiRegionGeoPartitioned",
    "zones": [
      {
        "zoneId": "ZONE_US",
        "name": "North America Storage Zone",
        "targetRegion": "us-east-1",
        "clusterId": "rs-prod-us-01",
        "connectionUri": "mongodb://node1.us.vialiq.internal:27037,node2.us.vialiq.internal:27037/?replicaSet=rs-prod-us-01",
        "databaseName": "study_global301_us_prod",
        "complianceProfile": "HIPAA_FDA_PART11",
        "kmsKeyArn": "arn:aws:kms:us-east-1:123456789012:key/us-cmk-01",
        "readPreference": "secondaryPreferred",
        "maxPoolSize": 200
      },
      {
        "zoneId": "ZONE_EU",
        "name": "European Economic Area Storage Zone",
        "targetRegion": "eu-central-1",
        "clusterId": "rs-prod-eu-01",
        "connectionUri": "mongodb://node1.eu.vialiq.internal:27037,node2.eu.vialiq.internal:27037/?replicaSet=rs-prod-eu-01",
        "databaseName": "study_global301_eu_prod",
        "complianceProfile": "GDPR_EU_CTR_536",
        "kmsKeyArn": "arn:aws:kms:eu-central-1:123456789012:key/eu-cmk-01",
        "readPreference": "secondaryPreferred",
        "maxPoolSize": 200
      },
      {
        "zoneId": "ZONE_CN",
        "name": "Mainland China Sovereign Storage Zone",
        "targetRegion": "cn-north-1",
        "clusterId": "rs-prod-cn-01",
        "connectionUri": "mongodb://node1.cn.vialiq.internal:27037,node2.cn.vialiq.internal:27037/?replicaSet=rs-prod-cn-01",
        "databaseName": "study_global301_cn_prod",
        "complianceProfile": "CHINA_PIPL_DSL_GENETIC",
        "kmsKeyArn": "arn:aliyun:kms:cn-north-1:123456789012:key/cn-hsm-01",
        "readPreference": "secondaryPreferred",
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

---

### 4.4 Dynamic Site Assignment Rule Engine & Overrides

When clinical sites are created or synchronized from CTMS:
1. For **`SingleZone`** studies: The rule engine short-circuits instantly ($O(1)$) and stamps `ResolvedZoneId = DefaultZoneId`.
2. For **`MultiRegionGeoPartitioned`** studies: The rule engine evaluates the site's geopolitical attributes (`CountryCode`) against the prioritized expressions.
3. **Manual Overrides**: If a Swiss site (`SITE-042`) requires storage in `ZONE_EU` under a bilateral treaty, the Lead CRA sets `IsZoneOverridden = true` with a mandatory Part 11 audit justification.

---

### 4.5 The Unified Database Provider (`DynamicClinicalDatabaseResolver`)

In `Vialiq.Infrastructure`, the C# database resolver provides a single, high-performance interface consumed by all services:

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
    /// Used by the federated aggregation engine for global cross-zone dashboards.
    /// </summary>
    Task<IReadOnlyList<IMongoDatabase>> GetAllZoneDatabasesAsync(CancellationToken ct = default);
}

public sealed class DynamicClinicalDatabaseResolver : IClinicalDatabaseProvider
{
    private readonly ConcurrentDictionary<string, IMongoClient> _clusterClients = new();
    private readonly ITenantStudyContextAccessor _contextAccessor;
    private readonly IStudyRegistryService _studyRegistry;
    private readonly ISiteRegistryCache _siteCache;
    
    // Request-scoped cache: database resolution happens at most ONCE per HTTP request
    private IMongoDatabase? _scopedDatabase;

    public DynamicClinicalDatabaseResolver(
        ITenantStudyContextAccessor contextAccessor,
        IStudyRegistryService studyRegistry,
        ISiteRegistryCache siteCache)
    {
        _contextAccessor = contextAccessor;
        _studyRegistry = studyRegistry;
        _siteCache = siteCache;
    }

    public async Task<IMongoDatabase> GetDatabaseAsync(CancellationToken ct = default)
    {
        if (_scopedDatabase != null)
            return _scopedDatabase;

        var context = _contextAccessor.GetCurrentContext()
            ?? throw new InvalidOperationException("No active TenantStudyContext resolved for the current request.");

        var topology = await _studyRegistry.GetTopologyAsync(context.TenantId, context.StudyId, ct).ConfigureAwait(false)
            ?? throw new ConfigurationException($"Storage topology missing for study '{context.StudyId}'.");

        // 1. FAST-PATH: Single-Zone Studies (85% of traffic)
        // If the study is SingleZone, immediately return its one assigned database with zero site evaluation
        if (topology.IsSingleZone)
        {
            var singleZone = topology.Zones[0];
            _scopedDatabase = GetMongoDatabase(singleZone);
            return _scopedDatabase;
        }

        // 2. DYNAMIC PATH: Multi-Zone Studies (15% of traffic)
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
            var settings = MongoClientSettings.FromConnectionString(zone.ConnectionUri);
            settings.MaxConnectionPoolSize = zone.MaxPoolSize;
            settings.MinConnectionPoolSize = 10;
            settings.WaitQueueTimeout = TimeSpan.FromSeconds(3);
            settings.ReadPreference = ReadPreference.SecondaryPreferred;
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

### 4.7 Unified Aggregate Executor (`IClinicalAggregateExecutor`) for Reporting

To keep cross-study dashboards and reporting code clean, we provide a unified aggregate executor:

```csharp
namespace Vialiq.Infrastructure.Reporting;

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using Vialiq.Infrastructure.Data;

public interface IClinicalAggregateExecutor
{
    /// <summary>
    /// Executes an aggregation pipeline. For single-zone studies, executes once.
    /// For multi-zone studies, executes push-down queries in parallel across all zones and merges numerical counts.
    /// </summary>
    Task<Dictionary<string, int>> ExecuteCountAggregateAsync(
        string collectionName,
        BsonDocument[] pipeline,
        string groupKeyField = "_id",
        string countField = "total",
        CancellationToken ct = default);
}

public sealed class ClinicalAggregateExecutor : IClinicalAggregateExecutor
{
    private readonly IClinicalDatabaseProvider _dbProvider;

    public ClinicalAggregateExecutor(IClinicalDatabaseProvider dbProvider)
    {
        _dbProvider = dbProvider;
    }

    public async Task<Dictionary<string, int>> ExecuteCountAggregateAsync(
        string collectionName,
        BsonDocument[] pipeline,
        string groupKeyField = "_id",
        string countField = "total",
        CancellationToken ct = default)
    {
        // 1. Retrieve all participating databases (1 for single-zone, N for multi-zone)
        var databases = await _dbProvider.GetAllZoneDatabasesAsync(ct).ConfigureAwait(false);

        // 2. Dispatch queries in parallel across all physical clusters
        var queryTasks = databases.Select(async db =>
        {
            var collection = db.GetCollection<BsonDocument>(collectionName);
            using var cursor = await collection.AggregateAsync<BsonDocument>(pipeline, cancellationToken: ct).ConfigureAwait(false);
            return await cursor.ToListAsync(ct).ConfigureAwait(false);
        });

        var resultsByZone = await Task.WhenAll(queryTasks).ConfigureAwait(false);

        // 3. Merge counts transparently
        var mergedTotals = new Dictionary<string, int>();

        foreach (var docList in resultsByZone)
        {
            foreach (var doc in docList)
            {
                var key = doc[groupKeyField].ToString() ?? "Unknown";
                var count = doc[countField].AsInt32;

                if (!mergedTotals.ContainsKey(key))
                    mergedTotals[key] = 0;

                mergedTotals[key] += count;
            }
        }

        return mergedTotals;
    }
}
```

* **Why this is a core design strength:**  
  A developer writing a dashboard for *"Total Subject Screening Failures"* writes the MongoDB `$match` and `$group` pipeline **exactly once**. Whether the study has 1 site in Ohio or 200 sites across US, Germany, and China, the exact same method executes safely and efficiently!

---

### 4.8 Turnkey Developer Ergonomics: In-Memory & Local Testing

In local developer environments (Mac workstations, CI pipelines) or automated integration test suites:
* Developers run single-instance MongoDB locally (e.g. `vialiq-mongo-layer3-prod` on `localhost:27037`).
* In `appsettings.Development.json`, both `ZONE_US`, `ZONE_EU`, and `ZONE_CN` connection strings simply point to `mongodb://localhost:27037` with different database names (`study_test_us_prod`, `study_test_eu_prod`).
* `InMemoryClinicalDatabaseProvider` enables 100% offline, lightning-fast xUnit test execution with zero external Docker dependencies.

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

### 5.2 The Invariant Storage Principle (Canonical CDISC Encoding)

> **The Architectural Golden Rule:**  
> Translated human strings must **NEVER** be stored as dictionary keys, field identifiers, or coded categorical answers in the operational database.

Regardless of whether the form was filled out by a German nurse in Berlin, a French doctor in Lyon, or a Chinese coordinator in Beijing, **the database record is 100% invariant, uniform, and CDISC SDTM compliant**:

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

### 5.3 Runtime Localized Presentation & Audit Metadata Binding

When the Angular 21 form engine renders the CRF:
1. It requests the **Published Form Schema** (`vialiq:study:roche:global301:v1.0:form:vs:schema`).
2. It requests the **Culture-Specific Translation Bundle** from the Study Translation Cache (`vialiq:study:roche:global301:v1.0:lang:de-DE`).
3. The renderer matches:
   - Variable `SYSBP` $\rightarrow$ Label: *"Systolischer Blutdruck (mmHg)"*
   - Concept `C25473` $\rightarrow$ Dropdown Text: *"Leicht"*
4. When saved, the value sent over the wire is strictly `"C25473"`, and the audit trail preserves `cultureCode: "de-DE"`.

**The Result:** Perfect local clinician usability with zero statistical downstream corruption.

---

## 6. Cryptographic Privacy & Localized Key Management (CSFLE + Regional KMS)

### 6.1 The Sovereign Envelope Encryption Topology

To guarantee that European or Chinese patient data cannot be decrypted by unauthorized personnel, patient PII (`SiteIdentifier` classification from [ADR 004](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)) is encrypted using **MongoDB Client-Side Field-Level Encryption (CSFLE)** with dedicated regional Key Encryption Keys (KEKs):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              LOCALIZED ENVELOPE ENCRYPTION                             │
├──────────────────────────────┬──────────────────────────────┬──────────────────────────┤
│ ZONE_US (N. Virginia)        │ ZONE_EU (Frankfurt)          │ ZONE_CN (Beijing)        │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────┤
│ AWS KMS: us-east-1           │ AWS KMS: eu-central-1        │ Local Cloud HSM: Beijing │
│ Key: arn:aws:kms:us-east-1.. │ Key: arn:aws:kms:eu-cent..   │ Key: hsm-cn-bj-master    │
│                              │                              │                          │
│ Wraps DEKs for:              │ Wraps DEKs for:              │ Wraps DEKs for:          │
│ • US Subject Names           │ • EU Subject Names           │ • CN Subject Names       │
│ • US National IDs            │ • EU Health Insurance Nos    │ • CN Resident IDs        │
│ • US Medical Record Nos      │ • EU Patient Initials & DOB  │ • CN Hospital Record Nos │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────┘
```

---

### 6.2 Cross-Region Decryption Prevention Guarantee

* **Physical Isolation:** The European Master Key resides strictly inside the Hardware Security Modules (HSMs) of AWS Frankfurt (`eu-central-1`).
* **IAM Policy Guard:** IAM roles in the United States or Asia **explicitly lack `kms:Decrypt` permissions** on the European CMK.
* **The Forensic Guarantee:** Even if an attacker or rogue administrator acquires a complete physical database dump (`mongodump`) of `study_onco301_eu_prod`, the patient PII fields are ciphertext. Because the decrypt API cannot be invoked outside Frankfurt, European patient privacy remains 100% mathematically protected.

---

### 6.3 GDPR Article 17 Crypto-Shredding without Audit Invalidation

In European clinical sites, a participant may withdraw consent and exercise their **GDPR Article 17 Right to Erasure**.

#### The Problem:
Deleting the patient's records from `crf_entries` or `audit_crf_data` violates **FDA 21 CFR Part 11 § 11.10(e)** and destroys the SHA-256 cryptographic audit chain.

#### The Vialiq Solution (Cryptographic Erasure):
1. Every subject has an isolated, individual **Data Encryption Key (DEK)** stored in the regional Key Vault.
2. When Patient `SUBJ-052-001` exercises Article 17:
   - The platform securely destroys Patient 001's specific DEK in the European vault.
3. **The Outcome:**
   - The audit log records and clinical records remain intact in the database.
   - However, the patient's name, initials, and identifying metadata become permanently unrecoverable mathematical entropy (garbage bytes).
   - **GDPR Article 17 is 100% satisfied** while **FDA 21 CFR Part 11 audit integrity remains intact**.

---

## 7. Exhaustive Global Reporting Architecture Across Disjoint Physical Locations

### 7.1 The 3-Tier Clinical Reporting Taxonomy

When data is physically stored in three different sovereign clouds across the globe, how do we run reports?

```
=======================================================================================================================
THE 3-TIER CLINICAL REPORTING ENGINE
=======================================================================================================================
Reporting Tier          Primary Audience              Target Datastore         Data Transferred Across Borders
-----------------------------------------------------------------------------------------------------------------------
Tier 1: Local Operational Local CRAs, Monitors, PIs   Local Regional Mongo DB  ZERO (100% local inside region)
Tier 2: Global Dashboards Executive Sponsors, DSMB    Federated Virtual Engine ZERO PII (Only mathematical sums/counts)
Tier 3: Biostatistics/FDA SAS Programmers, Regulators Central Reporting DWH   ZERO PII (CDC De-Identified Research Data)
=======================================================================================================================
```

---

### 7.2 Tier 1: Local Operational & Monitoring Reporting

* **Scope:** Single-site or single-country monitoring.
  - *"Show all unverified forms at Charité Berlin."*
  - *"List all open discrepancy queries for Site 052."*
  - *"Display the full Part 11 audit trail for Patient 052-003."*
* **Architecture:** The query routes directly to the regional cluster (`rs-prod-eu-01`) using `ReadPreference.SecondaryPreferred`.
* **Latency:** $< 10\text{ ms}$. Full patient identifying metadata is available to authorized local investigators. Zero cross-border data transfer.

---

### 7.3 Tier 2: Real-Time Global Executive Dashboards (Federated Push-Down Math)

* **Scope:** Real-time operational metrics across all global sites.
  - *"What is our total worldwide patient enrollment today?"*
  - *"Show total Serious Adverse Events (SAEs) broken down by Grade (1 to 5) across all 25 countries."*
  - *"What percentage of forms have been verified globally?"*

#### The Legal Dilemma:
Transferring raw Chinese or European patient records to a central US server just to count them violates cross-border data privacy laws.

#### The Architectural Solution: Federated Push-Down Aggregations
The central reporting engine dispatches **push-down aggregation pipelines** to each regional cluster in parallel:

```
                            GLOBAL EXECUTIVE MONITORING DASHBOARD (US)
                       Query: "Count Serious Adverse Events Grouped by Grade"
                                                 │
                 ┌───────────────────────────────┼───────────────────────────────┐
                 │ 1. Dispatch Local Aggregation │ 1. Dispatch Local Aggregation │ 1. Dispatch Local Aggregation
                 ▼                               ▼                               ▼
      US CLUSTER (rs-prod-us)         EU CLUSTER (rs-prod-eu)         CHINA CLUSTER (rs-prod-cn)
      db.crf_entries.aggregate([      db.crf_entries.aggregate([      db.crf_entries.aggregate([
        { $match: { isSAE: true } },    { $match: { isSAE: true } },    { $match: { isSAE: true } },
        { $group: {                     { $group: {                     { $group: {
            _id: "$grade",                  _id: "$grade",                  _id: "$grade",
            count: { $sum: 1 }              count: { $sum: 1 }              count: { $sum: 1 }
        }}                              }}                              }}
      ])                              ])                              ])
                 │                               │                               │
                 │ Returns:                      │ Returns:                      │ Returns:
                 │ Grade 3: 14                   │ Grade 3: 20                   │ Grade 3: 8
                 │ Grade 4: 2                    │ Grade 4: 3                    │ Grade 4: 1
                 ▼                               ▼                               ▼
                 └───────────────────────────────┼───────────────────────────────┘
                                                 │
                                                 ▼
                             2. Central Aggregator Sums Numerical Results:
                                - Grade 3 SAEs Worldwide: 42
                                - Grade 4 SAEs Worldwide: 6
```

#### C# Implementation of the Federated Push-Down Engine:

```csharp
namespace Vialiq.Infrastructure.Reporting;

using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

public sealed class FederatedDashboardAggregator : IFederatedReportingService
{
    private readonly ISiteStorageResolver _storageResolver;
    private readonly IStudyRegistryService _studyRegistry;

    public FederatedDashboardAggregator(
        ISiteStorageResolver storageResolver,
        IStudyRegistryService studyRegistry)
    {
        _storageResolver = storageResolver;
        _studyRegistry = studyRegistry;
    }

    public async Task<Dictionary<int, int>> GetGlobalSaeCountsByGradeAsync(string tenantId, string studyId)
    {
        var topology = await _studyRegistry.GetTopologyAsync(tenantId, studyId).ConfigureAwait(false);

        // 1. Prepare parallel query tasks across all regional storage zones
        var tasks = topology.Zones.Select(async zone =>
        {
            var database = await _storageResolver.GetDatabaseByZoneAsync(zone).ConfigureAwait(false);
            var collection = database.GetCollection<BsonDocument>("crf_entries");

            // Local aggregation pipeline: zero patient rows leave the regional cluster!
            var pipeline = new[]
            {
                new BsonDocument("$match", new BsonDocument("isSAE", true)),
                new BsonDocument("$group", new BsonDocument
                {
                    { "_id", "$clinicalData.AE_GRADE" },
                    { "total", new BsonDocument("$sum", 1) }
                })
            };

            var results = await collection.AggregateAsync<BsonDocument>(pipeline).ConfigureAwait(false);
            return await results.ToListAsync().ConfigureAwait(false);
        });

        // 2. Execute all regional queries concurrently
        var regionalResults = await Task.WhenAll(tasks).ConfigureAwait(false);

        // 3. Roll up pure numbers into global totals
        var globalTotals = new Dictionary<int, int>();

        foreach (var zoneList in regionalResults)
        {
            foreach (var doc in zoneList)
            {
                int grade = doc["_id"].AsInt32;
                int count = doc["total"].AsInt32;

                if (!globalTotals.ContainsKey(grade))
                    globalTotals[grade] = 0;

                globalTotals[grade] += count;
            }
        }

        return globalTotals;
    }
}
```

* **Why This is Legally Unassailable:**  
  **No personal health data, no patient records, and no free-text notes cross sovereign borders.** Only anonymous, grouped mathematical numbers (`Grade 3: 42`) are transmitted. This complies with **100% of international data sovereignty laws**.

---

### 7.4 Tier 3: Global Biostatistics & CDISC Submission Data Lake (CDC De-Identification)

* **Scope:** Primary statistical endpoint analysis for FDA NDA / EMA MAA drug approval filings.
  - *"Did the investigational arm achieve a statistically significant 6-month Progression-Free Survival (PFS) compared to placebo across the global cohort?"*
* **The Architecture:** Powered by our sealed [**ADR 004 (CSFLE-to-SQL Server CDC Boundary)**](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md).

```
┌─────────────────────────────────┐
│ REGIONAL MONGO PROD (e.g. EU)   │
│ - Live patient data             │
│ - Name, SSN, medical notes      │
└────────────────┬────────────────┘
                 │
                 │ 1. MongoDB Change Streams (Kafka / Debezium)
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ REGIONAL CDC DE-IDENTIFICATION BOUNDARY (Runs inside EU VPC)           │
├────────────────────────────────────────────────────────────────────────┤
│ The Boundary Filter enforces ADR 004 Data Classifications:            │
│                                                                        │
│ ❌ SiteIdentifier (Name, MRN, Address, ID)  ➔ HARD-DROPPED AT BORDER   │
│ 🙈 BlindedRTSM (Treatment Arm, Drug Kit)    ➔ MASKED AS "BLINDED"      │
│ ✅ ClinicalResearch (Vitals, Lab Values, AEs)➔ EMITTED TO GLOBAL STREAM│
└────────────────┬───────────────────────────────────────────────────────┘
                 │
                 │ 2. De-Identified, Non-PHI Research Stream (Kafka TLS)
                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│ CENTRAL DATA WAREHOUSE (SQL Server 2022+ / Snowflake / Databricks)     │
├────────────────────────────────────────────────────────────────────────┤
│ • Normalized CDISC SDTM Domains (`LB`, `AE`, `VS`, `DM`)               │
│ • Patient is identified ONLY by Universal Pseudonym: `SUBJ-052-001`    │
│ • Zero PHI exists in the central warehouse                             │
│ • Powers SAS, R, and Python biostatistical efficacy models             │
└────────────────────────────────────────────────────────────────────────┘
```

#### Regulatory Compliance Status:
* **HIPAA Safe Harbor (§ 164.514(b))**: All 18 direct identifiers are purged at the regional CDC boundary.
* **GDPR Article 89(1)**: Processing for scientific research purposes is permitted under pseudonymization and technical safeguards.
* **China DSL / PIPL**: Scientific data stripped of personal biometric identity satisfies cross-border research exemptions.

---

## 8. Edge Cases, Patient Transfers & Inspection Readiness

### 8.1 Inter-Site Subject Relocation Across Storage Zones

In longitudinal trials lasting multiple years, a participant may relocate (e.g. a patient enrolled at **MD Anderson in Houston (Site 005, USA)** moves to London and transfers their ongoing care to **Guy's Hospital (Site 062, UK/EU)**).

#### The Protocol Relocation Workflow:
1. **The Origin Invariant:** Historical clinical visits (Visits 1 through 3) completed in the US **remain permanently in the US database** (`study_onco301_us_prod`), preserving the original legal jurisdiction and 21 CFR Part 11 audit records.
2. **Subject Pointer Linking:**
   - In the EU database (`study_onco301_eu_prod`), a subject record is created with `OriginalSubjectId: "SUBJ-005-012"` and `TransferStatus: "TransferredFrom_ZONE_US"`.
3. **Subsequent Visits (Visit 4 onward):**
   - New visits are entered by the London clinical team and saved strictly into the **European database**.
4. **Biostatistical Re-assembly:**
   - In the central reporting warehouse, the CDC pipeline reconciles the two halves of the subject's journey via the unique immutable `GlobalSubjectGuid`, presenting a seamless clinical timeline for SAS analysis while respecting regional storage laws.

---

### 8.2 Multi-National Health Authority Inspection Readiness (FDA vs. EMA vs. NMPA)

When regulatory health authorities perform on-site clinical audits:

| Health Authority | Inspection Scenario | Vialiq Inspection Strategy |
|---|---|---|
| **US FDA Investigator** | Inspecting a US clinical site | Inspects live records in `study_onco301_us_prod`. Audit trail displays local UTC and site local time. |
| **European EMA Inspector** | Performing GCP inspection in Paris | Inspects live records in `study_onco301_eu_prod`. Complete verification that all EU patient PII remained inside the EEA. |
| **China NMPA Inspector** | Auditing Shanghai clinical site | Inspects records in `study_onco301_cn_prod` hosted on local Chinese cloud infrastructure. Full genetic data sovereignty demonstrated. |

---

## 9. Summary Engineering Matrix & Implementation Checklist

```
=======================================================================================================================
SUMMARY ARCHITECTURAL MATRIX: MULTI-REGION & MULTILINGUAL EDC PLATFORM
=======================================================================================================================
Architectural Concern              Engineering Solution                Regulatory Standard           Key Benefit
-----------------------------------------------------------------------------------------------------------------------
1. Single Protocol vs Multi-Country "One Logical Study, Multi-DB Farm"  ICH GCP E6(R3) Section 5.18   Unified protocol build;
                                    (Site-Group Geo-Partitioning)                                    zero code duplication.
2. Cross-Border Sovereignty        Dynamic Site Storage Resolver       China PIPL/DSL, GDPR Art. 9,  Zero PII leaves legal
   (China, EU, US)                  (`countryCode -> TargetCluster`)    HIPAA Security Rule           country of origin.
3. Multilingual Representation     Canonical CDISC DB Keys +           CDISC SDTM v2.0,              100% SAS/FDA compliance;
                                    Dynamic Localized UI Presentation   ICH GCP E6(R3) Attribution    native UX in 30+ langs.
4. Cryptographic Sovereignty       MongoDB CSFLE + Local Regional KMS  GDPR Art. 17 (Right to Eras.) Remote US admins cannot
                                    (AWS Frankfurt / US / Aliyun HSM)   HIPAA Safe Harbor             decrypt foreign PII.
5. Local Operational Queries       Direct Regional Secondary Reads     FDA 21 CFR Part 11            < 10ms response time;
                                    (`ReadPreference.SecondaryPreferred`)                             full patient details.
6. Real-Time Global Dashboards     Federated Push-Down Math Engine     Cross-Border Exemption        Zero PII crosses wire;
                                    (Parallel Regional Aggregations)    (Pure numerical rollups)      live global totals.
7. Biostatistical Clinical Science  De-Identified CDC Boundary Pipeline HIPAA Safe Harbor,            Global SAS/R analysis on
                                    (Debezium / Kafka ➔ SQL Server DWH) GDPR Art. 89 (Scientific)     pooled 5,000 subjects.
=======================================================================================================================
```

### Developer Implementation Checklist:
- [ ] **Data Model:** Add `storageTopology` schema to `TenantStudyContext` and `study_registry`.
- [ ] **Site Entity:** Ensure `SiteEntity` includes `CountryCode`, `ResolvedZoneId`, and `IsZoneOverridden`.
- [ ] **Infrastructure Service:** Implement `DynamicSiteStorageResolver.cs` in `Vialiq.Infrastructure`.
- [ ] **Connection Pool:** Update `DynamicClusterConnectionPool` to cache connections per `ZoneId`.
- [ ] **CDC Pipeline:** Verify Debezium transforms drop `SiteIdentifier` fields at regional VPC boundaries.
- [ ] **Reporting Engine:** Deploy `FederatedDashboardAggregator.cs` for cross-zone executive dashboards.

