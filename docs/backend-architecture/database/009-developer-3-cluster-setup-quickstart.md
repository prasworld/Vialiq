# Developer Quickstart: 3-Cluster MongoDB Setup from Scratch

> **Audience:** Developers (Backend, Frontend, Full-Stack)  
> **Purpose:** Pragmatic, copy-paste CLI commands with minimal theory to spin up, verify, seed, and manage the 3-Layer MongoDB cluster locally.  
> **Hardware:** Mac (Apple Silicon), Windows (WSL2/Hyper-V), or Linux.  
> **Related Files:**
> - [tools/docker/docker-compose.3layer.yml](file:///Users/prashantgupta/code/nx/tools/docker/docker-compose.3layer.yml)
> - [docs/backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md](file:///Users/prashantgupta/code/nx/docs/backend-architecture/database/002-3-cluster-and-flexible-tenancy-architecture.md)
> - [docs/backend-architecture/database/007-database-administration-and-mongosh-command-glossary.md](file:///Users/prashantgupta/code/nx/docs/backend-architecture/database/007-database-administration-and-mongosh-command-glossary.md)

---

## 1. 30-Second Architecture Overview

Vialiq EDC isolates clinical trials across **3 independent physical MongoDB clusters** (enforcing 21 CFR Part 11 & GxP separation):

| Layer | Port | Replica Set | Purpose | Data Contained |
|---|---|---|---|---|
| **Layer 1: Admin** | `27017` | `rs-admin` | Control Plane & Auth | Tenants, study routing, platform licenses (ZERO clinical data) |
| **Layer 2: Dev/UAT** | `27027` | `rs-dev` | Build & Test Sandbox | Non-live study databases (`study_{id}_dev`, `study_{id}_uat`) |
| **Layer 3: Prod** | `27037` | `rs-prod` | Live Production Trials | Live patient records & GxP audit logs (`study_{id}_prod`) |

Each cluster runs as a **single-node Replica Set**, enabling **multi-document ACID transactions** and **Change Streams** locally at $0 cost.

---

## 2. Prerequisites Check (10 Seconds)

Ensure Docker Desktop is running and the 3 ports (`27017`, `27027`, `27037`) are not occupied:

```bash
# Verify Docker daemon is alive
docker info > /dev/null 2>&1 && echo "Docker is running" || echo "Please start Docker Desktop"

# Check if required ports are free (should return empty)
lsof -i :27017 -i :27027 -i :27037
```

> **Tip:** If port `27017` is occupied by a previously installed local MongoDB instance, run:  
> `brew services stop mongodb-community` (macOS) or stop the `MongoDB Server` service (Windows Services).

---

## 3. Spin Up Clusters (From Scratch)

From the workspace root (`/Users/prashantgupta/code/nx`), choose your launch profile:

### Option A: Full Environment (All 3 Layers) — *Recommended*
```bash
npm run docker:mongo:all
# Or directly via docker compose:
# docker compose -f tools/docker/docker-compose.3layer.yml --profile all up -d
```

### Option B: Dev-Only Work (Layer 1 Admin + Layer 2 Dev Sandbox)
Saves memory if you only need the control plane and study dev databases:
```bash
npm run docker:mongo:dev
# Or directly:
# docker compose -f tools/docker/docker-compose.3layer.yml --profile dev-phase up -d
```

### Option C: Admin Only (Control Plane / Auth Development)
```bash
npm run docker:mongo:admin
# Or directly:
# docker compose -f tools/docker/docker-compose.3layer.yml --profile admin up -d
```

---

## 4. Verification One-Liners

### 4.1 Check Container Status
```bash
npm run docker:mongo:status
```
Expected output: 3 running mongo containers (`vialiq-mongo-layer1-admin`, `vialiq-mongo-layer2-dev`, `vialiq-mongo-layer3-prod`) with `(healthy)` status.

### 4.2 Single-Line Health Check (Ping All 3 Clusters)
Run this bash one-liner to verify all three replica sets are active and responding:

```bash
for port in 27017 27027 27037; do \
  echo "--- Testing Port $port ---"; \
  mongosh --port $port --eval "rs.status().ok" --quiet 2>/dev/null && echo "✅ Port $port ONLINE" || echo "❌ Port $port OFFLINE"; \
done
```

If you do not have `mongosh` installed locally, run it inside the Docker container:
```bash
docker exec -it vialiq-mongo-layer1-admin mongosh --eval "rs.status().ok"
docker exec -it vialiq-mongo-layer2-dev mongosh --port 27027 --eval "rs.status().ok"
docker exec -it vialiq-mongo-layer3-prod mongosh --port 27037 --eval "rs.status().ok"
```

---

## 5. Copy-Paste Connection Strings

### 5.1 Environment Variables (`.env` or `environment.ts`)

```env
# Layer 1: Admin / Control Plane
MONGODB_URI_ADMIN="mongodb://localhost:27017/vialiq_control_plane?replicaSet=rs-admin&directConnection=true"

# Layer 2: Dev & UAT Study Sandbox
MONGODB_URI_DEV="mongodb://localhost:27027/study_dev_sandbox?replicaSet=rs-dev&directConnection=true"

# Layer 3: Production Isolation (Simulated)
MONGODB_URI_PROD="mongodb://localhost:27037/study_prod_sandbox?replicaSet=rs-prod&directConnection=true"
```

### 5.2 MongoDB Compass (GUI)
Copy-paste these connection URIs into MongoDB Compass:
- **Layer 1 (Admin):** `mongodb://localhost:27017/?replicaSet=rs-admin&directConnection=true`
- **Layer 2 (Dev):** `mongodb://localhost:27027/?replicaSet=rs-dev&directConnection=true`
- **Layer 3 (Prod):** `mongodb://localhost:27037/?replicaSet=rs-prod&directConnection=true`

---

## 6. Smoke Test: ACID Transaction & Seed Data

Test that Layer 1 Admin and Layer 2 Dev accept multi-document ACID transactions:

### Step 1: Seed a Tenant in Layer 1 Admin
```bash
mongosh "mongodb://localhost:27017/vialiq_control_plane?replicaSet=rs-admin&directConnection=true" --quiet --eval '
  db.tenants.updateOne(
    { tenantId: "sponsor-astra" },
    {
      $set: {
        name: "Astra Clinical Research",
        tier: "ENTERPRISE",
        createdAt: new Date(),
        activeStudies: ["study_oncology_101"]
      }
    },
    { upsert: true }
  );
  print("✅ Tenant seeded on Layer 1 Admin:", JSON.stringify(db.tenants.findOne({ tenantId: "sponsor-astra" })));
'
```

### Step 2: Run an ACID Transaction in Layer 2 Dev
Verify that session transactions work on the replica set:
```bash
mongosh "mongodb://localhost:27027/study_oncology_101_dev?replicaSet=rs-dev&directConnection=true" --quiet --eval '
  const session = db.getMongo().startSession();
  session.startTransaction();
  try {
    const studyDb = session.getDatabase("study_oncology_101_dev");
    
    // Write 1: Subject enrollment
    studyDb.subjects.insertOne({
      subjectId: "SUBJ-001",
      siteId: "SITE-101",
      status: "SCREENED",
      enrolledAt: new Date()
    });

    // Write 2: Audit entry
    studyDb.audit_trail.insertOne({
      action: "SUBJECT_ENROLLED",
      subjectId: "SUBJ-001",
      performedBy: "CRC_USER_1",
      timestamp: new Date()
    });

    session.commitTransaction();
    print("✅ ACID Transaction committed successfully on Layer 2 Dev!");
  } catch (err) {
    session.abortTransaction();
    print("❌ Transaction aborted:", err.message);
  } finally {
    session.endSession();
  }
'
```

---

## 7. Daily Developer Lifecycle Commands

| Action | NPM Script | Equivalent Docker Compose Command |
|---|---|---|
| **Start All Clusters** | `npm run docker:mongo:all` | `docker compose -f tools/docker/docker-compose.3layer.yml --profile all up -d` |
| **Start Dev Phase Only** | `npm run docker:mongo:dev` | `docker compose -f tools/docker/docker-compose.3layer.yml --profile dev-phase up -d` |
| **Check Cluster Status** | `npm run docker:mongo:status` | `docker ps --filter 'name=vialiq-mongo'` |
| **Stop Clusters (Preserve Data)** | `npm run docker:mongo:stop` | `docker compose -f tools/docker/docker-compose.3layer.yml --profile all stop` |
| **Resume Stopped Clusters** | *(restart)* | `docker compose -f tools/docker/docker-compose.3layer.yml --profile all start` |
| **Tear Down Containers** | `npm run docker:mongo:down` | `docker compose -f tools/docker/docker-compose.3layer.yml --profile all down` |
| **Clean Wipe / Reset from Scratch** | `npm run docker:mongo:clean` | `docker compose -f tools/docker/docker-compose.3layer.yml --profile all down -v` |

> **Pro Tip (Clean Slate):** If a local test corrupts data or you want a fresh start, run:  
> `npm run docker:mongo:clean && npm run docker:mongo:all`  
> This destroys all Docker volumes and automatically re-initializes all 3 replica sets cleanly within 10 seconds.

---

## 8. Viewing Live Cluster Logs

```bash
# Follow logs for all 3 clusters
docker compose -f tools/docker/docker-compose.3layer.yml logs -f

# Follow logs for a specific cluster
docker logs -f vialiq-mongo-layer1-admin
docker logs -f vialiq-mongo-layer2-dev
docker logs -f vialiq-mongo-layer3-prod
```

---

## 9. Common Developer Gotchas & Troubleshooting

### 1. `MongoServerSelectionError: connect ECONNREFUSED`
- **Cause:** Containers are still booting or Docker Desktop paused.
- **Fix:** Wait 5 seconds for healthchecks to turn green. Run `npm run docker:mongo:status` to verify containers say `(healthy)`.

### 2. `NotWritablePrimary` or `Cannot run command against a replica set member in state SECONDARY`
- **Cause:** Missing `directConnection=true` or replica set initialization in progress.
- **Fix:** Ensure your connection URI includes `?replicaSet=rs-admin&directConnection=true` when connecting to localhost.

### 3. Port Already Allocated (`bind: address already in use`)
- **Fix:** Kill the process holding the port:
  ```bash
  # macOS / Linux
  sudo lsof -i :27017 | awk 'NR>1 {print $2}' | xargs kill -9
  
  # Windows PowerShell (Run as Administrator)
  Get-Process -Id (Get-NetTCPConnection -LocalPort 27017).OwningProcess | Stop-Process
  ```

### 4. Memory Optimization on Developer Laptops
- By default, each cluster in [docker-compose.3layer.yml](file:///Users/prashantgupta/code/nx/tools/docker/docker-compose.3layer.yml) clamps the WiredTiger cache to `512MB` (`--wiredTigerCacheSizeGB 0.5`).
- All 3 clusters running simultaneously consume **under 2.0 GB RAM total**, making them safe to run alongside frontend builds (`nx serve shell`).

---

## 10. Future Evolution Roadmap (As Architecture Evolves)

This document is the minimal developer baseline. As backend development progresses, this guide will expand with:
1. **Mock Seed Generator:** CLI script (`npm run db:seed:mock`) to seed 5 synthetic Phase 3 studies with 100 subjects each.
2. **Local CSFLE Keys:** Turnkey script to seed local AES-256 Master Keys and Data Encryption Keys (DEKs) for client-side field-level encryption.
3. **Keycloak DB Link:** Pre-configured Keycloak realm sync on Layer 1 Admin for 21 CFR Part 11 authentication testing.
