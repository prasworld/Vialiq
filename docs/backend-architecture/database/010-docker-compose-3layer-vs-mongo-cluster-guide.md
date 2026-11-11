# Docker Compose Environments Guide: 3-Layer GxP Architecture vs. 3-Node HA Cluster

> **Document ID:** `VIALIQ-ARCH-DB-010`  
> **Status:** Approved / Active Architecture Standard  
> **Target Audience:** Backend, Frontend, DevOps, and QA Engineers  
> **Target Files:**
> - [tools/docker/docker-compose.3layer.yml](../../../tools/docker/docker-compose.3layer.yml)
> - [tools/docker/docker-compose.mongo-cluster.yml](../../../tools/docker/docker-compose.mongo-cluster.yml)
> - [tools/docker/mongo/mongod.conf](../../../tools/docker/mongo/mongod.conf)
> **Related Architecture Documents:**
> - [002: 3-Cluster & Flexible Tenancy Architecture](./002-3-cluster-and-flexible-tenancy-architecture.md)
> - [007: Database Administration & mongosh Command Glossary](./007-database-administration-and-mongosh-command-glossary.md)
> - [009: Developer 3-Cluster Setup Quickstart](./009-developer-3-cluster-setup-quickstart.md)

---

## 1. Quick Decision Tree: Which File Do I Use?

```
                          What are you building or testing?
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
Developing Features, APIs, or UI                               Testing Resilience or Failover
(Forms, Studies, Patients, Auth, Promotion)                   (Node crashes, HA elections, Driver auto-reconnect)
        │                                                                 │
        ▼                                                                 ▼
Use: docker-compose.3layer.yml                                 Use: docker-compose.mongo-cluster.yml
Command: npm run docker:mongo:all                              Command: docker compose -f ...mongo-cluster.yml up -d
(Default for 95% of daily work)                                (Specialized Infrastructure Testing)
```

---

## 2. Side-by-Side Architectural Comparison

| Dimension | `docker-compose.3layer.yml` (Primary EDC Setup) | `docker-compose.mongo-cluster.yml` (HA Sandbox) |
|---|---|---|
| **Core Concept** | **3 Independent Physical Clusters** (1 node per cluster) | **1 Single Cluster** (3 nodes in a single replica set) |
| **Topological Role** | GxP Tiered Isolation (Admin vs. Dev vs. Live Prod) | High Availability, Primary Elections, & Failover |
| **Replica Sets** | 3 distinct sets: `rs-admin`, `rs-dev`, `rs-prod` | 1 shared set: `rs-edc` |
| **Port Mappings** | • Layer 1: `27017:27017`<br>• Layer 2: `27027:27027`<br>• Layer 3: `27037:27037` | • Node 1: `27017:27017`<br>• Node 2: `27018:27018`<br>• Node 3: `27019:27019` |
| **Data Isolation** | **Strict physical isolation** between Control Plane, Dev, and Prod | Single logical cluster with shared data across 3 replicas |
| **ACID & Change Streams** | Supported in all 3 layers via single-node replica sets | Supported across the 3-node replica set |
| **Memory Optimization** | Clamped to 512MB per layer (`wiredTigerCacheSizeGB: 0.5`) | Default WiredTiger allocation |
| **Target OS / Architecture** | Optimized for Apple Silicon (`platform: linux/arm64`) | Cross-platform (Windows WSL2/Hyper-V, Linux, macOS) |
| **NPM Script Integration** | Fully integrated (`npm run docker:mongo:*`) | Direct Docker Compose CLI invocation |

---

## 3. Deep Dive: `docker-compose.3layer.yml` (The EDC Standard)

### 3.1 Architectural Layout

```
                                  VIALIQ EDC 3-LAYER TOPOLOGY
                                  
     ┌───────────────────────────────────────────────────────────────────────────┐
     │ LAYER 1: ADMIN & CONTROL PLANE (Port 27017 | Replica Set: rs-admin)       │
     │ Databases: vialiq_control_plane, keycloak_auth, audit_config              │
     │ Content:   Tenant registry, study routing, platform licenses, Keycloak DB │
     │ PHI/PII:   STRICTLY ZERO clinical trial or patient health data            │
     └───────────────────────────────────────────────────────────────────────────┘
                                         │
                          Routes requests & authenticates
                                         ▼
     ┌────────────────────────────────────────┬──────────────────────────────────┐
     │                                        │                                  │
     ▼                                        ▼                                  │
 ┌────────────────────────────────────────┐ ┌──────────────────────────────────┐ │
 │ LAYER 2: DEV ENVIRONMENT               │ │ LAYER 3: PRODUCTION              │ │
 │ (Port 27027 | Replica Set: rs-dev)     │ │ (Port 27037 | Replica Set: rs-prod│ │
 │ Databases: study_{id}_dev,             │ │ Databases: study_{id}_prod       │ │
 │            study_{id}_uat              │ │ Content:   Live clinical trials, │ │
 │ Content:   Draft form schemas, test    │ │            production audit logs,│ │
 │            subjects, validation rules  │ │            electronically signed │ │
 └────────────────────────────────────────┘ └──────────────────────────────────┘ │
```

### 3.2 When to Use It
Use this file for **almost all day-to-day engineering**:
1. **Full-Stack Feature Development**: Developing ASP.NET Core 9 backend services (`Vialiq.Api`, `Vialiq.Core`, `Vialiq.Validation`) and Angular / Lit UI components.
2. **Dynamic Multi-Cluster Connection Pooling**: Testing how the backend dynamically directs tenant queries to Layer 1, and clinical trial transactions to Layer 2 or Layer 3.
3. **Study Promotion Pipeline**: Designing a study schema in Layer 2 (Dev), conducting UAT sign-off, and executing the promotion engine to clone it into Layer 3 (Prod).
4. **21 CFR Part 11 Regulatory Compliance Verification**: Verifying that Layer 1 Admin remains free of patient data, and that sandbox testing never pollutes production audit trails.

### 3.3 How to Run It

#### Phased Cluster Activation (NPM Scripts)
```bash
# Option 1: Full Environment (All 3 Layers) — Standard for full-stack work
npm run docker:mongo:all

# Option 2: Dev Phase Only (Layer 1 Admin on 27017 + Layer 2 Dev on 27027)
# Ideal for laptops with limited RAM when production simulation is unneeded
npm run docker:mongo:dev

# Option 3: Admin Only (Layer 1 Admin on 27017)
# For authentication, Keycloak, or tenant provisioning work
npm run docker:mongo:admin
```

#### Connection Strings
```env
# Layer 1 Admin (Control Plane & Auth)
MONGODB_URI_ADMIN="mongodb://localhost:27017/vialiq_control_plane?replicaSet=rs-admin&directConnection=true"

# Layer 2 Dev (Study Sandbox & UAT)
MONGODB_URI_DEV="mongodb://localhost:27027/study_dev_sandbox?replicaSet=rs-dev&directConnection=true"

# Layer 3 Prod (Live GxP Production Simulation)
MONGODB_URI_PROD="mongodb://localhost:27037/study_prod_sandbox?replicaSet=rs-prod&directConnection=true"
```

#### Lifecycle Commands
```bash
# Check status of the 3 cluster containers
npm run docker:mongo:status

# Stop containers without losing data
npm run docker:mongo:stop

# Resume stopped containers
docker compose -f tools/docker/docker-compose.3layer.yml --profile all start

# Factory Reset (wipe volumes and re-initialize all 3 clusters in 10s)
npm run docker:mongo:clean && npm run docker:mongo:all
```

---

## 4. Deep Dive: `docker-compose.mongo-cluster.yml` (The HA Sandbox)

### 4.1 Architectural Layout

```
                        SINGLE CLUSTER 3-NODE REPLICA SET (rs-edc)
                        
                   ┌───────────────────────────────────────────────┐
                   │               mongo1:27017                    │
                   │            PRIMARY (Read / Write)             │
                   └───────┬───────────────────────────────┬───────┘
                           │                               │
                Oplog Sync │                               │ Oplog Sync
                           ▼                               ▼
            ┌──────────────────────────────┐ ┌──────────────────────────────┐
            │         mongo2:27018         │ │         mongo3:27019         │
            │     SECONDARY (Read-Only)    │ │     SECONDARY (Read-Only)    │
            └──────────────────────────────┘ └──────────────────────────────┘
```

### 4.2 When to Use It
Use this file for **infrastructure validation, chaos drills, and high-availability testing**:
1. **Driver Auto-Reconnect & Failover Validation**: Confirming that when the primary node crashes, the .NET MongoDB driver (`MongoDB.Driver`) detects the new primary and queues/retries in-flight clinical data writes without throwing unhandled exceptions.
2. **Write Concern (`w: "majority"`) Testing**: Verifying that 21 CFR Part 11 audit records are safely replicated across a quorum of nodes before the server acknowledges the transaction.
3. **Read Preference Routing**: Validating that heavy analytical reports or CDISC ODM exports can be directed to secondary nodes (`readPreference: "secondaryPreferred"`), offloading the primary write path.
4. **Cross-Platform Compatibility**: A lightweight, platform-agnostic MongoDB replica set that runs seamlessly on Windows (WSL2/Hyper-V) without Apple Silicon specific flags.

### 4.3 How to Run It

#### Starting the Cluster
```bash
docker compose -f tools/docker/docker-compose.mongo-cluster.yml up -d
```

#### Multi-Node Connection String
Always specify all three hosts so the client driver can discover cluster topology and handle failovers automatically:
```env
MONGODB_URI_HA="mongodb://localhost:27017,localhost:27018,localhost:27019/vialiq_edc?replicaSet=rs-edc"
```

#### Hands-On Failover Drill (Testing Primary Election)
Run this test to watch the cluster elect a new primary node in real time:

```bash
# Step 1: Inspect cluster status (mongo1 is primary)
mongosh "mongodb://localhost:27017/?replicaSet=rs-edc" --quiet --eval '
  rs.status().members.forEach(m => print(m.name + " -> " + m.stateStr));
'

# Step 2: Simulate a crash by abruptly stopping the primary node
docker stop edc-mongo1

# Step 3: Check cluster status via node 2 (port 27018)
# Notice: mongo2 or mongo3 has now automatically been promoted to PRIMARY!
mongosh "mongodb://localhost:27018/?replicaSet=rs-edc" --quiet --eval '
  rs.status().members.forEach(m => print(m.name + " -> " + m.stateStr));
'

# Step 4: Revive node 1
# Notice: mongo1 rejoins the cluster cleanly as a SECONDARY member
docker start edc-mongo1
```

#### Stopping and Cleaning Up
```bash
docker compose -f tools/docker/docker-compose.mongo-cluster.yml down -v
```

---

## 5. Critical Rule: Never Run Both at the Same Time!

> [!CAUTION]  
> Both compose files bind host port **`27017`** (`mongo-layer1-admin` in `3layer.yml` and `mongo1` in `mongo-cluster.yml`).  
> Attempting to run both concurrently will result in a fatal Docker error:  
> `listen tcp 0.0.0.0:27017: bind: address already in use`

### Switching Between Environments

#### To switch from `3layer.yml` $\rightarrow$ `mongo-cluster.yml`:
```bash
npm run docker:mongo:down
docker compose -f tools/docker/docker-compose.mongo-cluster.yml up -d
```

#### To switch from `mongo-cluster.yml` $\rightarrow$ `3layer.yml` (Back to Default):
```bash
docker compose -f tools/docker/docker-compose.mongo-cluster.yml down
npm run docker:mongo:all
```

---

## 6. Summary Reference Table

| Goal | Command | Active Containers |
|---|---|---|
| **Daily Full EDC Work** | `npm run docker:mongo:all` | `vialiq-mongo-layer1-admin`, `vialiq-mongo-layer2-dev`, `vialiq-mongo-layer3-prod` |
| **Low-RAM Laptop Dev** | `npm run docker:mongo:dev` | `vialiq-mongo-layer1-admin`, `vialiq-mongo-layer2-dev` |
| **Auth / Control Plane Dev** | `npm run docker:mongo:admin` | `vialiq-mongo-layer1-admin` |
| **Failover / HA Testing** | `docker compose -f tools/docker/docker-compose.mongo-cluster.yml up -d` | `edc-mongo1`, `edc-mongo2`, `edc-mongo3` |
| **Tear Down All** | `npm run docker:mongo:clean` | None (Volumes wiped, clean slate) |
