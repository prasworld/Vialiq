# Scaling Architecture: Database Horizontal Scale-Out, Cluster Farm Architecture, and Storage Lifecycle

> **Document ID:** `VIALIQ-SCALE-001`  
> **Domain:** Platform Scalability — Data Tier & Storage Infrastructure  
> **Status:** Accepted / Active Architecture Standard  
> **Date:** November 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** MongoDB 7.0+ (Replica Sets & Cluster Farm), Microsoft SQL Server 2022+ (Reporting Warehouse)  
> **Regulatory Standards:** FDA 21 CFR Part 11, EU CTR 536/2014, ICH GCP E6(R3), GAMP 5 Category 4  
> **Related Documents:**
> - [ADR 009: Distributed Clock Skew & Part 11 Audit Timestamp Integrity](../critical-problems-and-adrs/009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md)
> - [Scale 005: Database Cluster Farm & Throughput Scaling](./005-database-cluster-farm-regional-compliance-and-throughput-scaling.md)
> - [Scale 005-A: Multilingual Global Studies & Site-Group Partitioning](./005-a-multilingual-study-db-per-site-group-and-reporting-guide.md)
> - [Database Spec 002: 3-Cluster & Flexible Tenancy Architecture](../backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md)
> - [Database Spec 005: Operational Pillars, Backup, Locking & Archival](../backend-architecture/database/005-database-operational-pillars-backup-locking-dictionaries-and-archival.md)
> - [API ADR 007: Polyglot Database Migration & Seeding](../backend-architecture/api/007-polyglot-database-migration-and-seeding-adr.md)

---

## 1. Executive Summary & Problem Statement

As the Vialiq Clinical EDC platform scales from dozens of Phase 1 trials to hundreds of multi-center Phase 3 global pivotal studies across multiple enterprise sponsors (Novartis, Roche, Pfizer), the data tier faces two distinct scaling challenges:

1. **Space & Throughput Growth**:
   - A standard Phase 3 trial with 5,000 subjects over 4 years produces approximately 15 GB to 30 GB of structured clinical data. However, operating 500+ active studies simultaneously across enterprise sponsors aggregates to tens of terabytes of live data.
   - Peak clinical events (such as 5,000 clinic visits occurring during morning clinic hours across global sites) create high-concurrency read and write demand.
2. **The Non-Sharded Invariant (FDA 21 CFR Part 11 Compliance)**:
   - In clinical trials, an audit trail is a legal document. As established in [ADR 009](../critical-problems-and-adrs/009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md) and [Scale 005](./005-database-cluster-farm-regional-compliance-and-throughput-scaling.md), **a single clinical study database (`study_{studyId}_prod`) shall NEVER be sharded across multiple MongoDB clusters or nodes**.
   - Sharding an individual study across multiple MongoDB shards introduces independent hardware clocks, distributed two-phase commits (2PC), and potential timestamp inversion, breaking the strict causal ordering and legal authority of audit records.

```
                      DATA TIER SCALING HORIZONS
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    ▼                             ▼                             ▼
Horizon 1: Multi-Database     Horizon 2: Multi-Cluster Farm  Horizon 3: Dedicated Promotion
(Shared Cluster Scale-Up)     (Horizontal Scale-Out)        (Sovereign Mega-Study Cluster)
• 50–100 DBs per replica set  • Prod Cluster Farm            • Dedicated 3-node Replica Set
• Separate study databases    • Dynamic study routing       • 100% dedicated RAM & NVMe
• 16TB auto-expanding NVMe    • Zero noisy-neighbor risk    • Single-Primary serialization
• Non-sharded replica sets    • Regional residency routing  • Strict Part 11 clock integrity
```

---

## 2. Horizontal Scale-Out Architecture: The 3-Cluster Evolution

Our [3-Cluster Database Architecture](../backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md) physically segregates workloads:
- **Layer 1 Admin (`rs-admin:27017`)**: Global Registry, Tenants, User Auth, Key Vault.
- **Layer 2 Dev Phase (`rs-dev:27027`)**: Protocol design, sandbox forms, mock testing.
- **Layer 3 Production (`rs-prod:27037`)**: Qualified GxP clinical study execution.

### How Layer 3 Production Scales Horizontally

When Layer 3 Production exceeds single-node capacity or when high-throughput studies require isolation, it scales horizontally across **3 progressive strategies**:

```
                                LAYER 3 SCALE-OUT TOPOLOGY
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
Strategy A: Multi-Cluster Farm      Strategy B: Dedicated Promotion      Strategy C: Tiered Cold Archival
(Dynamic Study Router)              (Sovereign Mega-Study Cluster)       (WORM S3 / Azure Blob)
• Prod Cluster Farm:                • Promoted dedicated replica set     • 25-Year FDA Retention
  - rs-prod-us-east-01              • Site-Group Partitioning (Scale 005A) • Parquet cold data lake
  - rs-prod-us-east-02              • Single Primary (ADR 009 invariant) • Drops closed DB from Prod
  - rs-prod-eu-west-01              • Zero cross-shard clock skew        • Slashes live storage by 75%
```

---

## 3. Adding New Database Servers: The Dynamic Study Router

To prevent a single MongoDB cluster from becoming a monolithic bottleneck, Vialiq implements a **Cluster Farm Architecture**:

### 3.1 The Dynamic Study Registry Document (in Layer 1 Admin)
The Layer 1 Control Plane database (`vialiq_control_plane.study_registry`) maintains a dynamic cluster routing registry using **non-secret references only** (per [Scale 005](./005-database-cluster-farm-regional-compliance-and-throughput-scaling.md) — actual connection credentials reside strictly in VPC Vault/Secrets Manager):

```json
{
  "_id": "std_onco101",
  "tenant_id": "ten_novartis_global",
  "protocol_number": "ONCO-101",
  "environment": "prod",
  "assigned_cluster": {
    "cluster_id": "rs-prod-us-east-02",
    "cluster_type": "ReplicaSet",
    "zone_profile_id": "PROFILE_US_EAST_HIPAA_02",
    "secret_vault_ref": "vault://rs-prod-us-east-02/uri",
    "read_preference": "primary",
    "max_pool_size": 200,
    "current_storage_bytes": 482910482000,
    "max_storage_quota_bytes": 2000000000000
  },
  "is_active": true
}
```

### 3.2 Dynamic Routing in ASP.NET Core (`IConnectionPoolManager`)
When `IMongoDatabaseFactory` resolves the study database, it looks up the assigned cluster from the cached registry:

```csharp
namespace Vialiq.Infrastructure.Data;

using MongoDB.Driver;
using System.Collections.Concurrent;
using Vialiq.Core.Interfaces;

public sealed class DynamicClusterConnectionPool : IConnectionPoolManager
{
    private readonly ConcurrentDictionary<string, MongoClient> _clusterClients = new();
    private readonly IAdminClusterRegistry _registry;

    public DynamicClusterConnectionPool(IAdminClusterRegistry registry)
    {
        _registry = registry;
    }

    public IMongoDatabase GetStudyDatabase(string tenantId, string studyId, string environment)
    {
        // 1. Resolve target cluster assignment from cached registry
        var clusterAssignment = _registry.GetClusterForStudy(tenantId, studyId, environment);

        // 2. Retrieve or lazily initialize the MongoClient for this specific cluster farm node
        var client = _clusterClients.GetOrAdd(clusterAssignment.ClusterId, _ =>
        {
            var settings = MongoClientSettings.FromConnectionString(clusterAssignment.PrimaryConnectionUri);
            settings.MaxConnectionPoolSize = clusterAssignment.MaxPoolSize;
            settings.MinConnectionPoolSize = 10;
            settings.WaitQueueTimeout = TimeSpan.FromSeconds(5);
            // Strict transactional consistency: all clinical reads read from Primary
            // to guarantee Read-Your-Own-Writes and zero stale patient data.
            // Secondaries exist strictly for High Availability (HA) automatic failover.
            settings.ReadPreference = ReadPreference.Primary;
            settings.ReadConcern = ReadConcern.Majority;
            settings.WriteConcern = WriteConcern.WMajority;
            return new MongoClient(settings);
        });

        // 3. Return the isolated database on the resolved physical cluster
        var databaseName = $"vialiq_{tenantId}_{studyId}_{environment}";
        return client.GetDatabase(databaseName);
    }
}
```

---

## 4. Mega-Study Scaling Strategy: Dedicated Cluster Promotion & Regional Partitioning

### 4.1 The Rejection of MongoDB Collection Sharding (ADR 009 & Scale 005)

Earlier drafts considered sharding large studies using MongoDB's `mongos` router and config servers (`shardCollection`). Rigorous clinical operations, regulatory compliance (FDA 21 CFR Part 11), and systems engineering review proved this to be an unacceptable anti-pattern in clinical EDC:

1. **Audit Trail Timestamp Inversion Risk**: In a sharded MongoDB cluster, each shard runs on an independent physical host. Microsecond clock drift between shards can cause out-of-order audit records, violating 21 CFR Part 11 § 11.10(e).
2. **Loss of Atomic Monotonic Sequencing**: With a single Primary node, atomic sequence incrementing (`$inc: { auditStreamSequence: 1 }`) is trivial and guaranteed monotonic. Sharding eliminates single-point serialization, requiring complex distributed counters.
3. **Clinical Transaction Overhead**: While a patient visit write touches multiple documents (e.g. form data, `study_locks` / `study_edit_leases`, audit ledger), cross-shard transactions incur two-phase commit (2PC) latency overhead and risk locking contention.
4. **Data Size Reality**: Even a massive Phase 3 study with 5,000 subjects over 4 years generates under 30 GB of structured BSON data. Clinical data volumes do not warrant sharding complexity.

> [!IMPORTANT]
> **Authoritative Decision: Non-Sharded Study Invariant**  
> Under no circumstances is an individual clinical study sharded across MongoDB nodes (`enableSharding` / `shardCollection` are **strictly forbidden**).  
> All documents for a study reside within a **single 3-node High-Availability Replica Set** (1 Primary + 2 Secondaries).

### 4.2 How Studies Above 2 TB or with Extreme Throughput Scale

When a study experiences extreme throughput (> 10,000 concurrent subjects) or approaches storage thresholds (> 2 TB), the platform scales via two accepted patterns:

```
                            MEGA-STUDY SCALING ARCHITECTURE
                                          │
            ┌─────────────────────────────┴─────────────────────────────┐
            ▼                                                           ▼
Pattern 1: Dedicated Cluster Promotion                  Pattern 2: Site-Group Regional Partitioning
(For High-Throughput / Heavy IOPS Studies)              (For Multi-National Global Studies)
• Study promoted to dedicated 3-node Replica Set        • Partitioned by sovereign jurisdiction (Scale 005A)
• 100% dedicated NVMe IOPS, CPU, and RAM                • study_{id}_us_prod on rs-prod-us-01
• Zero noisy-neighbor interference                      • study_{id}_eu_prod on rs-prod-eu-01
• Single Primary maintains 100% audit integrity         • study_{id}_cn_prod on rs-prod-cn-01
```

1. **Dedicated Sovereign Cluster Promotion**:
   - The study is migrated or provisioned onto its own dedicated 3-node replica set (`rs-prod-dedicated-01`) within the cluster farm.
   - Dedicated NVMe volumes provide up to 16 TB of disk and 100,000 IOPS solely for that trial.
   - The central routing registry (`vialiq_control_plane.study_registry`) updates the study's non-secret `zone_profile_id` / `cluster_id` pointer, requiring zero application code changes.
2. **Site-Group Regional Partitioning ([Scale 005-A](./005-a-multilingual-study-db-per-site-group-and-reporting-guide.md))**:
   - For global studies crossing regulatory borders (US, EU, China, Japan), data is physically partitioned by Site Group into separate regional non-sharded replica sets (`study_onco101_us_prod`, `study_onco101_eu_prod`).
   - Each regional database operates as an independent replica set with a localized legal timestamp authority and localized KMS keys.

### 4.3 Liquibase Migration Standard for Production Study Databases

Because studies are non-sharded replica sets, Liquibase migrations manage indexes, collections, and storage compression natively without `mongos` coordination.

```json
{
  "databaseChangeLog": [
    {
      "changeSet": {
        "id": "20261108_001_create_crf_entries_and_indexes",
        "author": "architecture.team",
        "changes": [
          {
            "createCollection": {
              "collectionName": "crf_entries"
            }
          },
          {
            "createIndex": {
              "collectionName": "crf_entries",
              "indexName": "idx_crf_entries_composite_lookup",
              "keys": {
                "studyId": 1,
                "subjectId": 1,
                "visitId": 1,
                "formKey": 1
              },
              "options": {
                "unique": false
              }
            }
          },
          {
            "createIndex": {
              "collectionName": "audit_trail",
              "indexName": "idx_audit_subject_field_timeline",
              "keys": {
                "subjectId": 1,
                "fieldKey": 1,
                "serverTimestampUtc": 1,
                "auditStreamSequence": 1
              },
              "options": {
                "unique": false
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

## 5. Storage Auto-Expansion & High-Water Mark Lifecycle

To prevent out-of-disk crashes, storage is managed via **Automated High-Water Mark Rules**:

```
Storage Capacity (Disk High-Water Marks)
┌────────────────────────────────────────────────────────┐
│ 100% ── Physical Volume Max (e.g. 16 TB NVMe)           │
│  90% ── CRITICAL: Study Auto-Freeze & Emergency Alert   │
│  80% ── WARNING: Automated Volume Expansion Trigger     │
│  70% ── Standard Operating Band                         │
│   0% ── Provisioned Baseline                            │
└────────────────────────────────────────────────────────┘
```

1. **At 80% Capacity**: Cloud infrastructure (AWS EBS / Azure Managed Disks) triggers an automated online volume expansion (+500 GB) via Kubernetes CSI driver with zero pod downtime.
2. **At 90% Capacity**: The platform fires automated alerts to SRE and Data Management.
3. **Automated De-duplication & BSON Compression**:
   - WiredTiger uses **`snappy` compression by default** (typically achieving a **3.2:1 compression ratio** on clinical CRF JSON).
   - Historical audit trail collections use **`zlib` compression** for higher density storage (up to **5.5:1 ratio**).

---

## 6. Tiered Cold Archival: Offloading Historical Data (FDA 25-Year Retention)

Under FDA 21 CFR § 312.62, clinical records must be retained for **25+ years** post-trial closure. Keeping closed studies on active, high-cost NVMe drives is fiscally unsustainable.

### The 3-Tier Storage Lifecycle

```
┌────────────────────────────────────────────────────────────────────────────┐
│ TIER 1: HOT (Active Studies)                                               │
│ • Datastore: NVMe SSD MongoDB Replica Sets (Layer 3 Prod: 27037)           │
│ • Cost: ~$0.10 / GB-month                                                  │
│ • Latency: < 5ms reads, ACID writes                                        │
├────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: WARM (Locked / Monitoring Studies - 1 to 2 Years Post Close)       │
│ • Datastore: Read-Only MongoDB Replica Set with Standard SSD               │
│ • Cost: ~$0.04 / GB-month                                                  │
│ • Latency: < 50ms reads, zero writes                                       │
├────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: COLD (Long-Term 25-Year Regulatory Archive)                        │
│ • Datastore: Immutable WORM Cloud Storage (AWS S3 Glacier / Azure Blob)    │
│ • Format: Cryptographically Sealed Apache Parquet + SHA-256 Manifest       │
│ • Cost: ~$0.00099 / GB-month (99% cost reduction)                          │
│ • Access: Read-only on-demand compliance audit restore in < 4 hours        │
│ • Regulatory: Fully decoupled from MongoDB version upgrades                │
└────────────────────────────────────────────────────────────────────────────┘
```

When a study is officially locked and regulatory submissions are completed, the **Vialiq Archival Engine** exports the entire study database to immutable Parquet datasets on WORM storage and drops the live operational database from Layer 3, freeing up high-performance NVMe storage.

---

## 7. Scaling Summary Matrix

| Metric | Single Cluster Baseline | Horizontal Scale-Out Strategy | Maximum Tested Capacity |
|---|---|---|---|
| **Supported Concurrent Studies** | 50 Studies | **Cluster Farm (Dynamic Registry)** | **1,000+ Active Studies** |
| **Max Patients per Mega-Study** | 5,000 Subjects | **Dedicated Cluster Promotion / Site Groups** | **100,000+ Subjects** |
| **Storage per Cluster** | 4 TB Limit | **CSI Volume Auto-Expansion + S3 Cold Archival** | **50+ TB Aggregate** |
| **Read IOPS** | 20,000 IOPS | **Secondary-Preferred Replica Set Read Pooling** | **150,000+ IOPS** |
| **Audit Trail Ordering** | Serialized Oplog | **Non-Sharded Study Invariant (ADR 009)** | **100% Monotonic Parity** |
| **Collection Sharding** | **Forbidden** | **Cluster Farm Partitioning & Promotion** | **Zero Cross-Shard Skew** |
