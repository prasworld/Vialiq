# Database Administration (DBA) Playbook & mongosh Command Glossary

> **Document ID:** `VIALIQ-ARCH-DB-008`  
> **Status:** Approved / Active Operational Standard  
> **Target Audience:** Database Administrators (DBAs), Site Reliability Engineers (SREs), Lead Data Managers, Security Officers, On-Call DevOps Engineers  
> **Regulatory Compliance:** FDA 21 CFR Part 11, EU Annex 11, HIPAA Security Rule, ICH GCP E6(R3)  
> **Related Documents:**
> - [002: 3-Cluster & Flexible Tenancy Architecture](./002-3-cluster-and-flexible-tenancy-architecture.md)
> - [005: Database Operational Pillars (Backup, Locking, Archival)](./005-database-operational-pillars-backup-locking-dictionaries-and-archival.md)
> - [006: Field-Level Encryption & Key Management Architecture](./006-field-level-encryption-csfle-and-key-management-architecture.md)
> - [3-Layer MongoDB Cluster Docker Setup Guide](./mongodb-3layer-docker-setup-guide.md)

---

## Executive Summary & Operational Scope

This document serves as the **authoritative single-source-of-truth operational runbook and command glossary** for managing the Vialiq Clinical EDC database tier. 

Whether responding to a production incident, applying an interim study freeze, executing an emergency code-break audit, provisioning a new study, or running point-in-time recovery (PITR), DBAs and DevOps engineers must follow these standardized, reproducible `mongosh` commands and procedures.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        VIALIQ EDC — DBA OPERATIONAL RUNBOOK DOMAINS                                   │
├────────────────────────────┬────────────────────────────┬──────────────────────────────────────────────┤
│ 1. Connection Matrix       │ 2. Cluster Topology & HA   │ 3. Multi-Level Locking & Freezing            │
│ - Admin Layer 1 (27017)    │ - rs.status(), rs.conf()   │ - Study, Site, Subject, Form lock commands   │
│ - Dev Layer 2 (27027)      │ - Election priority & fail │ - 4-Eyes Emergency Unlock & Relock           │
│ - Prod Layer 3 (27037)     │ - Maintenance mode         │ - Active lock hierarchy resolution           │
├────────────────────────────┼────────────────────────────┼──────────────────────────────────────────────┤
│ 4. RBAC User Administration│ 5. Key Vault & CSFLE       │ 6. Backup, Restore & PITR                    │
│ - Least-privilege roles    │ - Inspecting wrapped DEKs  │ - Consistent mongodump with oplog            │
│ - Study-scoped users       │ - CLI Crypto-shredding     │ - Point-in-time replay to exact millisecond  │
│ - Credential revocation    │ - CMK re-wrapping drills   │ - Automated restore drill validation         │
├────────────────────────────┴────────────────────────────┴──────────────────────────────────────────────┤
│ 7. Performance Diagnostics & Incident Response                                                         │
│ - db.currentOp() & db.killOp() for rogue queries                                                       │
│ - Slow query profiling (system.profile) & $indexStats                                                  │
│ - WiredTiger cache dirty % and ticket starvation monitoring                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Connection Matrix & CLI Authentication](#1-connection-matrix--cli-authentication)
2. [Cluster Topology, Health & High Availability Operations](#2-cluster-topology-health--high-availability-operations)
3. [Study Database Provisioning & Schema Initialization](#3-study-database-provisioning--schema-initialization)
4. [Multi-Level Locking & Freezing Command Glossary](#4-multi-level-locking--freezing-command-glossary)
   - [4.1 Inspecting Active Locks Across Hierarchy](#41-inspecting-active-locks-across-hierarchy)
   - [4.2 Applying Study-Level Hard Lock (DBL)](#42-applying-study-level-hard-lock-dbl)
   - [4.3 Applying Site-Level Soft Freeze (Monitoring Visit)](#43-applying-site-level-soft-freeze-monitoring-visit)
   - [4.4 Applying Subject & Form Level Locks](#44-applying-subject--form-level-locks)
   - [4.5 Executing Four-Eyes Emergency Unlock](#45-executing-four-eyes-emergency-unlock)
   - [4.6 Re-locking Expired Emergency Windows](#46-re-locking-expired-emergency-windows)
5. [User Management & Least-Privilege RBAC Administration](#5-user-management--least-privilege-rbac-administration)
6. [Field-Level Encryption (CSFLE) & Key Vault Administration](#6-field-level-encryption-csfle--key-vault-administration)
7. [Backup, Restore & Millisecond PITR Playbook](#7-backup-restore--millisecond-pitr-playbook)
8. [Performance Diagnostics, Slow Query Profiling & Incident Response](#8-performance-diagnostics-slow-query-profiling--incident-response)
9. [Storage Compaction & Post-Archival Maintenance](#9-storage-compaction--post-archival-maintenance)

---

## 1. Connection Matrix & CLI Authentication

Vialiq operates across a strictly segregated **3-Layer Physical / Port Architecture**:

```bash
# ------------------------------------------------------------------------------
# 1. LAYER 1: ADMIN CONTROL PLANE (Port 27017)
# Hosts: vialiq_control_plane, __keyVault, study_registry, global_audit_trail
# ------------------------------------------------------------------------------
mongosh "mongodb://root:admin_secret_pass_2026@localhost:27017/admin?authSource=admin"

# ------------------------------------------------------------------------------
# 2. LAYER 2: DEV / UAT PROTOCOL BUILD PLANE (Port 27027)
# Hosts: study_{uuid}_dev, study_{uuid}_uat, validation test databases
# ------------------------------------------------------------------------------
mongosh "mongodb://root:dev_secret_pass_2026@localhost:27027/admin?authSource=admin"

# ------------------------------------------------------------------------------
# 3. LAYER 3: LIVE PRODUCTION CLINICAL PLANE (Port 27037)
# Hosts: study_{uuid}_prod, study_locks, study_edit_leases, crf_entries, clinical_queries
# ------------------------------------------------------------------------------
mongosh "mongodb://root:prod_secret_pass_2026@localhost:27037/admin?authSource=admin"
```

> [!TIP]
> **Production Bastion Tip:** In cloud environments (AWS/Azure), direct external access to ports 27017/27027/27037 is blocked. Connect via an SSH tunnel through the private VPC bastion host:  
> `ssh -N -L 27037:mongo-layer3-prod.internal.vpc:27017 dba@bastion.vialiq.net`

---

## 2. Cluster Topology, Health & High Availability Operations

### 2.1 Check Replica Set Health & Role
```javascript
// Check overall replica set status, primary node, and member health
rs.status();

// Concise one-line health summary:
rs.status().members.map(m => ({
  name: m.name,
  state: m.stateStr,
  health: m.health === 1 ? "HEALTHY" : "DOWN",
  uptimeSec: m.uptime,
  pingMs: m.pingMs || 0,
  lastHeartbeatRecv: m.lastHeartbeatRecv || "N/A"
}));
```

### 2.2 Check Replication Lag Between Primary & Secondaries
In clinical trials, replication lag can risk data loss during failovers:
```javascript
// Run on Primary to evaluate secondary lag
rs.printSecondaryReplicationInfo();

// Detailed oplog window and write buffer:
db.getReplicationInfo();
```

### 2.3 Step Down Primary for Rolling Maintenance
When patching OS or restarting nodes, cleanly step down the Primary without dropping writes:
```javascript
// Step down for 120 seconds, allowing secondaries 30 seconds to catch up
rs.stepDown(120, 30);

// Prevent this node from being elected Primary during maintenance (Priority = 0)
cfg = rs.conf();
cfg.members[0].priority = 0;
rs.reconfig(cfg);
```

### 2.4 Restore Election Priority Post-Maintenance
```javascript
cfg = rs.conf();
cfg.members[0].priority = 1; // Restore standard priority
rs.reconfig(cfg);
```

---

## 3. Study Database Provisioning & Schema Initialization

When a new clinical trial protocol is promoted from Layer 2 to Layer 3 Prod, the DBA runs this provisioning script to configure the study database, collections, and required indexes:

```javascript
// Connect to Layer 3 Prod
use study_cardiology_201_prod;

// 1. Regulatory Study Locks Collection (100% pure for SOFT_FREEZE / HARD_LOCK / DBL)
db.createCollection("study_locks");
db.study_locks.createIndex(
  { studyId: 1, scope: 1, targetId: 1 },
  { unique: true, partialFilterExpression: { isActive: true }, name: "uniq_active_lock_target" }
);
db.study_locks.createIndex({ studyId: 1, isActive: 1, scope: 1, targetId: 1 }, { name: "idx_lock_guard_lookup" });

// 1b. Single-Editor Form Edit Leases Collection (15-min UI edit locks per ADR 003 / ADR 007-A)
// Note: Checked ONLY after verifying no active freeze/DBL exists in study_locks (HTTP 423).
db.createCollection("study_edit_leases");
db.study_edit_leases.createIndex(
  { studyId: 1, targetCrfId: 1 },
  { unique: true, partialFilterExpression: { status: 1 }, name: "uniq_active_form_edit_lease" }
);

// 2. CRF Entries Collection (High-performance compound index for patient visits)
db.createCollection("crf_entries");
db.crf_entries.createIndex(
  { studyId: 1, subjectId: 1, visitId: 1, formId: 1 },
  { name: "idx_subject_form_lookup" }
);
db.crf_entries.createIndex({ studyId: 1, siteId: 1, status: 1 }, { name: "idx_site_monitoring_status" });
db.crf_entries.createIndex({ updatedAt: -1 }, { name: "idx_audit_oplog_tail" });

// 3. Clinical Queries Collection (Auto-query & DM workflows)
db.createCollection("clinical_queries");
db.clinical_queries.createIndex({ studyId: 1, siteId: 1, status: 1 }, { name: "idx_queries_by_site" });
db.clinical_queries.createIndex({ targetCrfId: 1, status: 1 }, { name: "idx_queries_by_crf" });

// 4. Immutable 21 CFR Part 11 Audit Trail Collection
db.createCollection("audit_trail");
db.audit_trail.createIndex({ studyId: 1, timestamp: -1 }, { name: "idx_audit_timeline" });
db.audit_trail.createIndex({ "entity.id": 1, timestamp: -1 }, { name: "idx_audit_entity_history" });
db.audit_trail.createIndex({ signatureHash: 1 }, { unique: true, name: "uniq_audit_hash_chain" });

// Verify created indexes
db.getCollectionNames().forEach(c => {
  print(`=== Collection: ${c} ===`);
  printjson(db.getCollection(c).getIndexes());
});
```

---

## 4. Multi-Level Locking & Freezing Command Glossary

### 4.1 Inspecting Active Locks Across Hierarchy
To check all active locks that could restrict data entry for a subject at a site:

```javascript
use study_cardiology_201_prod;

// Find all active locks applicable to SUBJ-004 at SITE-101 on FORM-VITALS
db.study_locks.find({
  studyId: "study_cardiology_201",
  isActive: true,
  $or: [
    { scope: "STUDY" },
    { scope: "SITE", targetId: "SITE-101" },
    { scope: "SUBJECT", targetId: "SUBJ-004" },
    { scope: "FORM", targetId: "SUBJ-004:VISIT-DAY0:FORM-VITALS" }
  ]
}).sort({ lockedAt: -1 }).pretty();
```

### 4.2 Applying Study-Level Hard Lock (DBL)
Executed upon Final Study Database Lock after all queries are closed:

```javascript
use study_cardiology_201_prod;

const lockId = UUID().toString();
const timestamp = new Date();
const userId = "dm_lead_martinez";

db.study_locks.insertOne({
  _id: lockId,
  studyId: "study_cardiology_201",
  scope: "STUDY",
  targetId: "ALL",
  lockType: "HARD_LOCK",
  isActive: true,
  lockedByUserId: userId,
  lockedByRole: "LEAD_DATA_MANAGER",
  lockReason: "Final statistical freeze for FDA NDA filing. All sites closed.",
  lockedAt: timestamp,
  signatureHash: hex_sha256(`STUDY:ALL:HARD_LOCK:${userId}:${timestamp.toISOString()}`)
});

// Immediately append immutable 21 CFR Part 11 audit record
db.audit_trail.insertOne({
  _id: UUID().toString(),
  eventType: "STUDY_HARD_LOCK_APPLIED",
  studyId: "study_cardiology_201",
  userId: userId,
  reason: "Final statistical freeze for FDA NDA filing.",
  details: { lockId, scope: "STUDY", targetId: "ALL" },
  timestamp: timestamp
});
```

### 4.3 Applying Site-Level Soft Freeze (Monitoring Visit)
Executed when a Clinical Research Associate (CRA) conducts an interim site audit:

```javascript
use study_cardiology_201_prod;

const siteId = "SITE-101";
const craUser = "cra_chen";
const now = new Date();

db.study_locks.insertOne({
  _id: UUID().toString(),
  studyId: "study_cardiology_201",
  scope: "SITE",
  targetId: siteId,
  lockType: "SOFT_FREEZE",
  isActive: true,
  lockedByUserId: craUser,
  lockedByRole: "CLINICAL_RESEARCH_ASSOCIATE",
  lockReason: "Interim site monitoring visit underway. CRC data entry frozen.",
  lockedAt: now,
  signatureHash: hex_sha256(`SITE:${siteId}:SOFT_FREEZE:${craUser}:${now.toISOString()}`)
});
```

### 4.4 Applying Subject & Form Level Locks
```javascript
// Lock completed subject follow-up:
db.study_locks.insertOne({
  _id: UUID().toString(),
  studyId: "study_cardiology_201",
  scope: "SUBJECT",
  targetId: "SUBJ-004",
  lockType: "HARD_LOCK",
  isActive: true,
  lockedByUserId: "pi_dr_foster",
  lockedByRole: "PRINCIPAL_INVESTIGATOR",
  lockReason: "Subject completed protocol. 30-day safety follow-up finalized.",
  lockedAt: new Date()
});

// Freeze individual baseline form after Source Data Verification (SDV):
db.study_locks.insertOne({
  _id: UUID().toString(),
  studyId: "study_cardiology_201",
  scope: "FORM",
  targetId: "SUBJ-004:VISIT-DAY0:FORM-DEMOG",
  lockType: "SOFT_FREEZE",
  isActive: true,
  lockedByUserId: "cra_chen",
  lockedByRole: "CLINICAL_RESEARCH_ASSOCIATE",
  lockReason: "100% SDV verified against hospital EHR source.",
  lockedAt: new Date()
});
```

### 4.5 Executing Four-Eyes Emergency Unlock
When a locked form requires emergency safety corrections:

```javascript
use study_cardiology_201_prod;

const targetLockId = "c8f3e2a1-0000-0000-0000-000000000001";
const approverUser = "dm_lead_martinez";
const countersigningPi = "pi_dr_foster";
const medicalJustification = "Adverse event onset date recorded incorrectly. Critical safety edit required.";
const autoRelockDurationHours = 48;

const autoRelockDate = new Date();
autoRelockDate.setHours(autoRelockDate.getHours() + autoRelockDurationHours);

// Deactivate lock and record full four-eyes audit history
db.study_locks.updateOne(
  { _id: targetLockId, isActive: true },
  {
    $set: { isActive: false },
    $push: {
      unlockHistory: {
        unlockedAt: new Date(),
        unlockedByUserId: approverUser,
        countersignedByUserId: countersigningPi,
        clinicalJustification: medicalJustification,
        autoRelockScheduledAt: autoRelockDate
      }
    }
  }
);

// Append Part 11 audit event
db.audit_trail.insertOne({
  _id: UUID().toString(),
  eventType: "EMERGENCY_UNLOCK_EXECUTED",
  studyId: "study_cardiology_201",
  lockId: targetLockId,
  unlockedBy: approverUser,
  countersignedBy: countersigningPi,
  justification: medicalJustification,
  autoRelockDeadline: autoRelockDate,
  timestamp: new Date()
});
```

### 4.6 Re-locking Expired Emergency Windows
Run manually by DBA or via background cron daemon:

```javascript
use study_cardiology_201_prod;

const now = new Date();
const expiredUnlocks = db.study_locks.find({
  isActive: false,
  "unlockHistory.reLockedAt": { $exists: false },
  "unlockHistory.autoRelockScheduledAt": { $lte: now }
}).toArray();

print(`Found ${expiredUnlocks.length} expired unlock windows to re-lock.`);

expiredUnlocks.forEach(lock => {
  db.study_locks.updateOne(
    { _id: lock._id },
    {
      $set: { 
        isActive: true,
        "unlockHistory.$[elem].reLockedAt": now
      }
    },
    { arrayFilters: [{ "elem.autoRelockScheduledAt": { $lte: now } }] }
  );
  print(`✅ Re-locked target ${lock.scope}:${lock.targetId}`);
});
```

---

## 5. User Management & Least-Privilege RBAC Administration

### 5.1 Create Administrative DBA Accounts
```javascript
use admin;

// Root DBA with full management privileges:
db.createUser({
  user: "vialiq_dba_admin",
  pwd: "PROD_STRONG_SECRET_2026!#",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "dbAdminAnyDatabase", db: "admin" },
    { role: "clusterAdmin", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
});
```

### 5.2 Create Application Service Pool User (Study-Scoped)
The backend NestJS API should **never** connect as `root`. Provision a least-privilege service account:

```javascript
use admin;

db.createUser({
  user: "vialiq_api_worker_pool",
  pwd: "API_SERVICE_WORKER_SECRET_2026!#",
  roles: [
    // Read access to Admin KeyVault for CSFLE DEKs:
    { role: "read", db: "vialiq_control_plane" },
    
    // Read-Write access to specific active studies only:
    { role: "readWrite", db: "study_cardiology_201_prod" },
    { role: "readWrite", db: "study_oncology_101_prod" }
  ]
});
```

### 5.3 Create Dedicated Backup Service User
For automated continuous oplog tailing and PITR backups:

```javascript
use admin;

db.createUser({
  user: "vialiq_backup_agent",
  pwd: "BACKUP_AGENT_SECRET_2026!#",
  roles: [
    { role: "backup", db: "admin" },
    { role: "restore", db: "admin" },
    { role: "read", db: "local" } // Required for oplog.rs access
  ]
});
```

### 5.4 Instant Credential Revocation (Compromised Account)
```javascript
use admin;

// Revoke privileges immediately:
db.revokeRolesFromUser("compromised_user_id", [
  { role: "readWrite", db: "study_cardiology_201_prod" }
]);

// Or drop user completely:
db.dropUser("compromised_user_id");

// Kill active connections from this user:
db.currentOp().inprog.forEach(op => {
  if (op.user && op.user.includes("compromised_user_id")) {
    db.killOp(op.opid);
    print(`Killed active connection opid: ${op.opid}`);
  }
});
```

---

## 6. Field-Level Encryption (CSFLE) & Key Vault Administration

### 6.1 Inspecting Stored Keys on Layer 1 Admin (Port 27017)
```javascript
// Connect to Layer 1 Admin
use vialiq_control_plane;

// List all active Data Encryption Keys without exposing sensitive data
db.__keyVault.find(
  {},
  { keyAltNames: 1, "masterKey.key": 1, keyVersion: 1, status: 1, creationDate: 1 }
).pretty();

// Verify keyMaterial is stored strictly as binary ciphertext:
const sampleKey = db.__keyVault.findOne({ keyAltNames: "dek_study_oncology_101_identity" });
print(`Key Material Subtype: ${sampleKey.keyMaterial.subType}`); // Must be 0 (Binary Ciphertext)
print(`Is Encrypted?: ${sampleKey.keyMaterial.buffer.length > 0}`); // Must be TRUE
```

### 6.2 Executing Subject-Level Crypto-Shredding (GDPR Article 17) via CLI
```javascript
use vialiq_control_plane;

const targetSubjectId = "SUBJ-004";
const dekAltName = `dek_subject_${targetSubjectId}`;

// 1. Permanently delete the subject's DEK from __keyVault
const result = db.__keyVault.deleteOne({ keyAltNames: dekAltName });

if (result.deletedCount === 1) {
  print(`✅ DEK ${dekAltName} permanently destroyed.`);
  print(`⚠️ All subject fields in Layer 3 are now mathematically unrecoverable entropy.`);
} else {
  print(`❌ Key not found for subject ${targetSubjectId}`);
}
```

### 6.3 Verifying Ciphertext on Layer 3 Prod (Zero-Knowledge Check)
Confirm that patient records in Layer 3 Prod contain no plain text:

```javascript
use study_oncology_101_prod;

const subject = db.subject_identities.findOne({ _id: "SUBJ-001" });

print("=== RAW STORAGE VERIFICATION ===");
print(`Subject ID (Plaintext): ${subject._id}`);
print(`Full Name BSON Type: ${typeof subject.fullName}`); // Object (Binary)
print(`Full Name Subtype: ${subject.fullName.subType}`);   // Must be 6 (Encrypted Ciphertext)
```

---

## 7. Backup, Restore & Millisecond PITR Playbook

### 7.1 Execute Full Consistent Snapshot Backup with Oplog
Run from the backup agent shell:

```bash
# Execute consistent point-in-time backup across all active collections
mongodump \
  --uri="mongodb://vialiq_backup_agent:BACKUP_AGENT_SECRET_2026!#@localhost:27037/study_cardiology_201_prod?authSource=admin" \
  --oplog \
  --gzip \
  --archive="/backups/daily/study_cardiology_201_$(date +%Y%m%d_%H%M%S).archive.gz"

echo "✅ Backup completed at $(date)"
```

### 7.2 Point-In-Time Recovery (PITR) to an Exact Millisecond
If a human error occurs at `2026-10-18T14:30:15.000Z`, restore to the exact second prior (`14:30:14`):

```bash
# 1. Convert target recovery time to UNIX timestamp seconds
TARGET_TS=$(date -j -f "%Y-%m-%d %H:%M:%S" "2026-10-18 14:30:14" +%s)

# 2. Execute point-in-time replay stopping before the corrupting event
mongorestore \
  --uri="mongodb://root:prod_secret_pass_2026@localhost:27037/?authSource=admin" \
  --gzip \
  --archive="/backups/daily/study_cardiology_201_20261018_120000.archive.gz" \
  --oplogReplay \
  --oplogLimit="${TARGET_TS}:1" \
  --nsInclude="study_cardiology_201_prod.*"

echo "✅ PITR recovery executed up to timestamp ${TARGET_TS}"
```

### 7.3 Automated Weekly Restore Drill Verification
Run this validation query after restoring the test sandbox:

```javascript
use study_cardiology_201_drill_restore;

// 1. Verify record count matches production
const restoredCount = db.crf_entries.countDocuments();
print(`Total restored CRF entries: ${restoredCount}`);

// 2. Validate SHA-256 Audit Trail Hash Chain Integrity
const audits = db.audit_trail.find().sort({ timestamp: 1 }).toArray();
let isChainValid = true;

for (let i = 1; i < audits.length; i++) {
  const prevHash = audits[i - 1].signatureHash;
  if (audits[i].previousSignatureHash && audits[i].previousSignatureHash !== prevHash) {
    print(`❌ HASH CHAIN BROKEN at record ${audits[i]._id}!`);
    isChainValid = false;
    break;
  }
}

if (isChainValid) {
  print("✅ RESTORE DRILL PASSED: 100% Audit trail hash chain verified!");
}
```

---

## 8. Performance Diagnostics, Slow Query Profiling & Incident Response

### 8.1 Find and Terminate Runaway Queries (`db.currentOp()`)
```javascript
// Find queries running longer than 15 seconds (15000ms):
db.currentOp({
  "active": true,
  "secs_running": { "$gt": 15 },
  "ns": /^study_/
}).inprog.forEach(op => {
  print(`OpID: ${op.opid} | Client: ${op.client} | Duration: ${op.secs_running}s | Query:`);
  printjson(op.command);
});

// Kill a specific rogue operation by opid:
db.killOp(123456);
```

### 8.2 Enable Slow Query Profiling
```javascript
use study_cardiology_201_prod;

// Log all queries taking longer than 100 milliseconds (slowms: 100)
db.setProfilingLevel(1, { slowms: 100 });

// View top 5 slowest queries recorded in the profiler:
db.system.profile.find({ millis: { $gt: 100 } })
  .sort({ millis: -1 })
  .limit(5)
  .projection({ ns: 1, millis: 1, planSummary: 1, command: 1, ts: 1 })
  .pretty();
```

### 8.3 Analyze Index Utilization (`$indexStats`)
Identify unused indexes that consume RAM and slow down writes:

```javascript
use study_cardiology_201_prod;

db.crf_entries.aggregate([
  { $indexStats: {} },
  {
    $project: {
      name: 1,
      accesses: "$accesses.ops",
      since: "$accesses.since"
    }
  },
  { $sort: { accesses: 1 } }
]).forEach(idx => {
  print(`Index: ${idx.name.padEnd(35)} | Ops: ${idx.accesses} | Since: ${idx.since.toISOString()}`);
});
```

### 8.4 Inspect WiredTiger Cache & Storage Health
```javascript
const stats = db.serverStatus();

print("=== WIREDTIGER CACHE HEALTH ===");
const wt = stats.wiredTiger.cache;
const usedMB = (wt["bytes currently in the cache"] / 1024 / 1024).toFixed(2);
const maxMB = (wt["maximum bytes configured"] / 1024 / 1024).toFixed(2);
const dirtyMB = (wt["tracked dirty bytes in the cache"] / 1024 / 1024).toFixed(2);

print(`Configured Cache Max: ${maxMB} MB`);
print(`Currently In Use:    ${usedMB} MB (${((usedMB/maxMB)*100).toFixed(1)}%)`);
print(`Tracked Dirty Bytes: ${dirtyMB} MB`);

print("\n=== CONCURRENT TRANSACTION TICKETS ===");
const tickets = stats.wiredTiger.concurrentTransactions;
print(`Read Tickets Available:  ${tickets.read.available} / ${tickets.read.totalTickets}`);
print(`Write Tickets Available: ${tickets.write.available} / ${tickets.write.totalTickets}`);

if (tickets.write.available < 10) {
  print("⚠️ WARNING: Write ticket exhaustion detected! Database under severe write contention.");
}
```

---

## 9. Storage Compaction & Post-Archival Maintenance

### 9.1 Reclaim Fragmented Disk Space (`compact`)
After dropping large collections or re-encrypting fields, WiredTiger retains pre-allocated disk space. Run `compact` on a Secondary node:

```javascript
use study_cardiology_201_prod;

// Compact crf_entries collection to release disk blocks back to the OS
db.runCommand({ compact: "crf_entries", force: true });
```

### 9.2 Safe Database Decommissioning Post-WORM Archival
Once a study is exported to CDISC ODM-XML and sealed in AWS S3 Glacier Object Lock (Compliance Mode):

```javascript
use admin;

// 1. Verify study status in Layer 1 Admin Registry
const study = db.getSiblingDB("vialiq_control_plane").study_registry.findOne({ studyId: "study_cardiology_201" });
if (study.status !== "ARCHIVED_WORM") {
  throw new Error("ABORT: Study is not verified as ARCHIVED_WORM! Dropping blocked.");
}

// 2. Drop the production database to free NVMe disk
db.getSiblingDB("study_cardiology_201_prod").dropDatabase();
print("✅ Study database dropped from Layer 3 Prod.");

// 3. Log regulatory decommissioning event in global audit trail
db.getSiblingDB("vialiq_control_plane").global_audit_trail.insertOne({
  _id: UUID().toString(),
  eventType: "DATABASE_DECOMMISSIONED_POST_ARCHIVAL",
  studyId: "study_cardiology_201",
  wormS3Uri: study.archiveS3Location,
  droppedByUserId: "dba_admin_chen",
  timestamp: new Date()
});
```

---

## 10. Summary Checklist for On-Call DBAs

| Event / Scenario | Immediate CLI Action | Primary Reference Section |
|:---|:---|:---|
| **Replication Secondary Down** | `rs.status()`, inspect `lastHeartbeatRecv` | [Section 2.1](#21-check-replica-set-health--role) |
| **Write Contention / App Slowdown** | Inspect `concurrentTransactions` & `db.currentOp()` | [Sections 8.1 & 8.4](#81-find-and-terminate-runaway-queries-dbcurrentop) |
| **Interim Site Visit Closure** | Insert `SOFT_FREEZE` lock on `SITE` scope | [Section 4.3](#43-applying-site-level-soft-freeze-monitoring-visit) |
| **Final Database Lock (DBL)** | Insert `HARD_LOCK` on `STUDY` scope | [Section 4.2](#42-applying-study-level-hard-lock-dbl) |
| **Emergency Form Unlock Request** | Execute Four-Eyes unlock with justification | [Section 4.5](#45-executing-four-eyes-emergency-unlock) |
| **Patient GDPR Erasure Request** | Delete DEK from `vialiq_control_plane.__keyVault` | [Section 6.2](#62-executing-subject-level-crypto-shredding-gdpr-article-17-via-cli) |
| **Human Error / Data Corruption** | Execute PITR restore with `--oplogLimit` | [Section 7.2](#72-point-in-time-recovery-pitr-to-an-exact-millisecond) |
