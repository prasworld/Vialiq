# Scaling Architecture: Database Horizontal Scale-Out, Sharding, and Storage Lifecycle

> **Document ID:** `VIALIQ-SCALE-001`  
> **Domain:** Platform Scalability — Data Tier & Storage Infrastructure  
> **Status:** Accepted  
> **Date:** October 22, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** MongoDB 7.0+ (Replica Sets & Sharded Clusters), Microsoft SQL Server 2022+ (Reporting Warehouse), Azure Cosmos DB / AWS DocumentDB compatibility  
> **Related Documents:**
> - [Database Spec 002: 3-Cluster & Flexible Tenancy Architecture](../backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md)
> - [Database Spec 005: Operational Pillars, Backup, Locking & Archival](../backend-architecture/database/005-database-operational-pillars-backup-locking-dictionaries-and-archival.md)
> - [API ADR 007: Polyglot Database Migration & Seeding](../backend-architecture/api/007-polyglot-database-migration-and-seeding-adr.md)

---

## 1. Executive Summary & Problem Statement

As the Vialiq Clinical EDC platform scales from dozens of Phase 1 trials to hundreds of multi-center Phase 3 global studies across multiple enterprise sponsors (Novartis, Roche, Pfizer), the data tier faces two distinct scaling pressures:

1. **Space Exhaustion (Data Volume Growth)**:
   - A single Phase 3 oncology trial with 5,000 subjects over 3 years generates ~150 visits per subject, ~40 forms per visit, and ~50 audit trail events per form mutation, generating over **1.2 billion documents** and **1.8 TB of data** per mega-trial.
   - Operating hundreds of studies on a single database server inevitably exhausts local NVMe disk limits (typically 16 TB per volume) and degrades WiredTiger memory cache hit ratios.
2. **Throughput Bottlenecks (Concurrent IOPS & Write Locks)**:
   - Burst clinical events (e.g. 5,000 clinic visits happening between 09:00 and 11:00 AM across global clinical sites) saturate IOPS and trigger storage write lock contention on a single replica set.

```
                      DATA TIER SCALING HORIZONS
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    ▼                             ▼                             ▼
Horizon 1: Multi-Database     Horizon 2: Sharded Cluster    Horizon 3: Dedicated Cluster
(Shared Cluster Scale-Up)     (Horizontal Pod/Node Add)     (Sovereign High-Load Promotion)
• 100+ DBs per cluster        • Chunk distribution         • Isolated Atlas / K8s Cluster
• Separate study databases    • Shard Key: {study, subject} • Zero noisy-neighbor risk
• 16TB auto-expanding NVMe   • Zero cross-shard queries    • Dedicated KMS / BYOK
```

---

## 2. Horizontal Scale-Out Architecture: The 3-Cluster Evolution

Our [3-Cluster Database Architecture](../backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md) physically segregates workloads:
- **Layer 1 Admin (`rs-admin:27017`)**: Global Registry, Tenants, User Auth, Key Vault.
- **Layer 2 Dev Phase (`rs-dev:27027`)**: Protocol design, sandbox forms, mock testing.
- **Layer 3 Production (`rs-prod:27037`)**: Qualified GxP clinical study execution.

### How Layer 3 Production Scales Out Horizontally

When Layer 3 Production exceeds single-node storage or IOPS limits, it scales horizontally across **3 progressive dimensions**:

```
                                LAYER 3 SCALE-OUT TOPOLOGY
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
Strategy A: Multi-Cluster Farm      Strategy B: Sharded Replica Sets     Strategy C: Tiered Cold Archival
(Dynamic Study Router)              (Horizontal Shard Addition)          (WORM S3 / Azure Blob)
• Prod Cluster Farm:                • Mongo Config Servers + Mongos      • 25-Year FDA Retention
  - rs-prod-us-east-01              • Shard 1 (Subjects 0001 - 2500)     • Mongo Archive collection
  - rs-prod-us-east-02              • Shard 2 (Subjects 2501 - 5000)     • Parquet cold lake
  - rs-prod-eu-west-01              • Shard Key: {study_id, subject_id}  • Slashes live cluster size by 75%
```

---

## 3. Adding New Database Servers: The Dynamic Study Router

To prevent a single MongoDB cluster from becoming a monolithic bottleneck, Vialiq implements a **Cluster Farm Architecture**:

### 3.1 The Dynamic Study Registry Document (in Layer 1 Admin)
The Layer 1 Admin database (`vialiq_admin_control`) maintains a dynamic cluster routing registry:

```json
{
  "_id": "std_onco101",
  "tenant_id": "ten_novartis_global",
  "protocol_number": "ONCO-101",
  "environment": "prod",
  "assigned_cluster": {
    "cluster_id": "rs-prod-us-east-02",
    "cluster_type": "ReplicaSet",
    "primary_connection_uri": "mongodb://rs-prod-02-node1:27017,rs-prod-02-node2:27017,rs-prod-02-node3:27017/?replicaSet=rs-prod-02",
    "read_preference": "secondaryPreferred",
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
            settings.ReadPreference = ReadPreference.SecondaryPreferred;
            return new MongoClient(settings);
        });

        // 3. Return the isolated database on the resolved physical cluster
        var databaseName = $"vialiq_{tenantId}_{studyId}_{environment}";
        return client.GetDatabase(databaseName);
    }
}
```

---

## 4. Sharding Strategy: Horizontal Partitioning Inside Mega-Studies

When a single study's data exceeds 2 TB, horizontal sharding is activated.

### 4.1 Sharding Key Design: The Golden Life-Sciences Compound Key
Choosing the wrong sharding key causes **Scatter-Gather Queries** (where every single query must hit all shards), crippling throughput.

```
                              SHARD KEY ARCHITECTURE
                                         │
             ┌───────────────────────────┴───────────────────────────┐
             ▼                                                       ▼
      { study_id: 1, subject_id: 1 }                           { _id: "hashed" }
           (ACCEPTED)                                              (REJECTED)
• 100% Targeted Single-Shard Routing                 • Scatters queries across all shards
• All visits & forms for Subject 101 live together   • Breaks clinical transaction boundaries
• Fast ACID transactions within single subject       • Destroys performance under high concurrency
```

#### The Accepted Shard Key: `{ study_id: 1, subject_id: 1 }`
* **Why `{ study_id: 1, subject_id: 1 }`:**
  1. **Locality of Clinical Care**: 98% of EDC queries filter by a specific patient (`subject_id`) during clinic visits.
  2. **Targeted Shard Routing**: When the investigator submits Visit 2 for Subject `SUBJ-001`, the `mongos` router directs the write to the exact single shard hosting that patient.
  3. **Multi-Document ACID Transactions**: MongoDB supports multi-document ACID transactions across documents located on the same shard without distributed two-phase commit overhead.

### 4.2 Enabling Sharding via Liquibase

```json
{
  "databaseChangeLog": [
    {
      "changeSet": {
        "id": "20261022_001_enable_sharding_crf_entries",
        "author": "prashant.gupta",
        "changes": [
          {
            "runCommand": {
              "command": {
                "enableSharding": "vialiq_ten_novartis_global_std_onco101_prod"
              }
            }
          },
          {
            "runCommand": {
              "command": {
                "shardCollection": "vialiq_ten_novartis_global_std_onco101_prod.crf_entries",
                "key": {
                  "study_id": 1,
                  "subject_id": 1
                },
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
└────────────────────────────────────────────────────────────────────────────┘
```

When a study is officially locked and regulatory submissions are completed, the **Vialiq Archival Engine** exports the entire study database to immutable Parquet datasets on WORM storage and drops the live operational database from Layer 3, freeing up terabytes of high-performance NVMe storage.

---

## 7. Scaling Summary Matrix

| Metric | Single Cluster Baseline | Horizontal Scale-Out Strategy | Maximum Tested Capacity |
|---|---|---|---|
| **Supported Concurrent Studies** | 50 Studies | **Cluster Farm (Dynamic Registry)** | **1,000+ Active Studies** |
| **Max Patients per Mega-Study** | 5,000 Subjects | **Horizontal Sharding `{study, subject}`** | **100,000+ Subjects** |
| **Storage per Cluster** | 4 TB Limit | **CSI Volume Auto-Expansion + S3 Cold Archival** | **50+ TB Aggregate** |
| **Read IOPS** | 20,000 IOPS | **Secondary-Preferred Replica Set Read Pooling** | **150,000+ IOPS** |
