# Comprehensive Setup Guide: 3-Layer MongoDB Cluster Topology in Docker (Apple Silicon M1 Pro & Mac Studio M5 Pro)

> **Document ID:** `VIALIQ-ARCH-DB-005`  
> **Status:** Approved / Active Architecture Standard  
> **Target Platforms:** Apple Silicon (macOS ARM64: M1 Pro / Max / Ultra, M2, M3, M4, and Mac Studio M5 Pro)  
> **Target Software:** Docker Desktop 24+ / Compose v2.20+, MongoDB Community 7.0 (Native ARM64)  
> **Related Architecture Documents:**
> - [002: 3-Cluster & Flexible Tenancy Architecture](./002-3-cluster-and-flexible-tenancy-architecture.md)
> - [003: Architecture Rating Scorecard & Compliance](./003-comprehensive-architecture-rating-scorecard.md)
> - [004: Background Jobs, Protocol Migration & Auto-Query Engine](./004-background-jobs-protocol-migration-and-auto-query-engine.md)
> - [Auth, Identity & Multi-Tenancy Specification](../auth-identity-multitenancy-clinical-edc.md)

---

## Table of Contents

1. [Executive Summary & 3-Layer Architecture Overview](#1-executive-summary--3-layer-architecture-overview)
2. [Hardware & Platform Optimization: Apple Silicon M1 Pro to M5 Pro](#2-hardware--platform-optimization-apple-silicon-m1-pro-to-m5-pro)
   - [2.1 Apple Silicon Architecture (ARM64 Native vs Rosetta 2)](#21-apple-silicon-architecture-arm64-native-vs-rosetta-2)
   - [2.2 macOS Docker Desktop Configuration (VirtioFS & Memory)](#22-macos-docker-desktop-configuration-virtiofs--memory)
   - [2.3 WiredTiger Memory Tuning (Preventing Contention)](#23-wiredtiger-memory-tuning-preventing-contention)
3. [Configuration Files & Architecture Breakdown](#3-configuration-files--architecture-breakdown)
   - [3.1 Multi-Layer Docker Compose Specification (`tools/docker/docker-compose.3layer.yml`)](#31-multi-layer-docker-compose-specification-toolsdockerdocker-compose3layeryml)
   - [3.2 Custom Production Dockerfile (`tools/docker/mongo/Dockerfile`)](#32-custom-production-dockerfile-toolsdockermongodockerfile)
   - [3.3 Custom mongod.conf Template](#33-custom-mongodconf-template)
4. [Step-by-Step Instructions: From Image to Running Locally](#4-step-by-step-instructions-from-image-to-running-locally)
   - [Step 0: Verify Local macOS Environment](#step-0-verify-local-macos-environment)
   - [Step 1: Pull the Native ARM64 MongoDB 7.0 Image](#step-1-pull-the-native-arm64-mongodb-70-image)
   - [Step 2: Phased Cluster Activation](#step-2-phased-cluster-activation)
     - [Phase 1: Layer 1 Only (Admin / Control Plane)](#phase-1-layer-1-only-admin--control-plane)
     - [Phase 2: Layer 1 + Layer 2 (Admin + Dev / UAT Sandbox)](#phase-2-layer-1--layer-2-admin--dev--uat-sandbox)
     - [Phase 3: Layer 3 Only (Production Isolation Test)](#phase-3-layer-3-only-production-isolation-test)
     - [Phase 4: Full Multi-Cluster Topology (All 3 Layers Simultaneously)](#phase-4-full-multi-cluster-topology-all-3-layers-simultaneously)
   - [Step 3: Verify Container Health & Status](#step-3-verify-container-health--status)
   - [Step 4: Connecting via MongoDB Compass (GUI)](#step-4-connecting-via-mongodb-compass-gui)
   - [Step 5: Connecting via Terminal Shell (`mongosh`)](#step-5-connecting-via-terminal-shell-mongosh)
   - [Step 6: Verifying Multi-Document ACID Transactions](#step-6-verifying-multi-document-acid-transactions)
   - [Step 7: Verifying Change Streams (Real-Time CDC)](#step-7-verifying-change-streams-real-time-cdc)
   - [Step 8: Lifecycle Management (Stop, Restart, Logs, and Clean Wipe)](#step-8-lifecycle-management-stop-restart-logs-and-clean-wipe)
5. [Developer Productivity: NPM Scripts & Shortcuts](#5-developer-productivity-npm-scripts--shortcuts)
6. [Troubleshooting & Gotchas on Apple Silicon macOS](#6-troubleshooting--gotchas-on-apple-silicon-macos)

---

## 1. Executive Summary & 3-Layer Architecture Overview

In a regulated Clinical Electronic Data Capture (EDC) platform subject to **FDA 21 CFR Part 11**, **EU Annex 11**, and **HIPAA Security Rule**, physical cluster separation is mandatory. Development or drafting activities must never share memory, disk, network, or compute resources with live clinical patient records.

The Vialiq EDC architecture establishes **3 distinct physical database layers**:

```
                                  VIALIQ EDC TOPOLOGY
                                  
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
│ Content:   Draft form designs,         │ │            real patient visits,  │ │
│            protocol amendment dry-runs,│ │            immutable audit trail,│ │
│            synthetic test subjects     │ │            PII / PHI encrypted   │ │
│ Isolation: 100% physically decoupled   │ │ Isolation: 100% physically locked│ │
│            from production             │ │            from dev sandboxes    │ │
└────────────────────────────────────────┘ └──────────────────────────────────┘ │
```

### Cluster Specifications Matrix

| Layer Attribute | Layer 1: Admin / Control Plane | Layer 2: Dev Environment | Layer 3: Production |
|:---|:---|:---|:---|
| **Service Name** | `mongo-layer1-admin` | `mongo-layer2-dev` | `mongo-layer3-prod` |
| **Container Name** | `vialiq-mongo-layer1-admin` | `vialiq-mongo-layer2-dev` | `vialiq-mongo-layer3-prod` |
| **Host Port** | **`27017`** | **`27027`** | **`27037`** |
| **Container Port** | `27017` | `27027` | `27037` |
| **Replica Set Name** | **`rs-admin`** | **`rs-dev`** | **`rs-prod`** |
| **Docker Volume** | `vialiq_mongo_admin_data` | `vialiq_mongo_dev_data` | `vialiq_mongo_prod_data` |
| **Compose Profiles** | `admin`, `dev-phase`, `all` | `dev`, `dev-phase`, `all` | `prod`, `all` |
| **Memory Limit (WT Cache)** | 512 MB (`0.5 GB`) | 512 MB (`0.5 GB`) | 512 MB (`0.5 GB`) |
| **Databases Housed** | `vialiq_control_plane`<br>`keycloak_auth`<br>`routing_registry` | `study_{uuid}_dev`<br>`study_{uuid}_uat`<br>`synthetic_subjects` | `study_{uuid}_prod`<br>`audit_trail_21cfr11`<br>`signature_manifests` |
| **ACID Transactions** | Enabled (`rs-admin`) | Enabled (`rs-dev`) | Enabled (`rs-prod`) |
| **Change Streams** | Enabled (`oplog.rs`) | Enabled (`oplog.rs`) | Enabled (`oplog.rs`) |

---

## 2. Hardware & Platform Optimization: Apple Silicon M1 Pro to M5 Pro

Local development across the Vialiq engineering team runs on Apple Silicon architecture:
- **Current Baseline:** Apple Silicon **M1 Pro** (8-core/10-core CPU, 16GB/32GB Unified Memory).
- **Upcoming Target:** **Mac Studio M5 Pro** (Next-generation Apple Silicon, 16+ CPU cores, 36GB-128GB Unified Memory with 300+ GB/s memory bandwidth).

Running 3 concurrent database instances on a workstation requires deliberate configuration to ensure low battery drain, near-instant query execution, and zero memory thrashing.

### 2.1 Apple Silicon Architecture (ARM64 Native vs Rosetta 2)

By default, Docker Desktop on macOS can run both `linux/amd64` (emulated via Rosetta 2 or QEMU) and `linux/arm64` (native).
- **CRITICAL:** Always run MongoDB with `platform: linux/arm64`.
- Under Rosetta 2 emulation (`linux/amd64`), MongoDB WiredTiger experiences memory bloat, high CPU cycles during page eviction, and slow sync-to-disk times.
- With native `linux/arm64`, MongoDB instructions execute directly on Apple Silicon CPU performance and efficiency cores with **zero emulation overhead**.

### 2.2 macOS Docker Desktop Configuration (VirtioFS & Memory)

Open **Docker Desktop -> Settings (Gear icon)** and verify the following settings:

1. **General Tab:**
   - [x] **Use Virtualization framework** (Checked — utilizes macOS hypervisor framework).
2. **Resources Tab -> Virtual Disk / File Sharing:**
   - Virtual disk limit: At least `32 GB`.
   - File sharing implementation: Select **VirtioFS** (Provides high-throughput disk I/O between the macOS APFS filesystem and Linux containers).
3. **Advanced Tab:**
   - [x] **Use Rosetta for x86/amd64 emulation on Apple Silicon** (Checked for legacy tools, but MongoDB containers will run native `arm64`).
4. **Memory Allocation:**
   - On a 16GB / 32GB Mac, allocate **4 GB to 8 GB RAM** and **4 to 6 vCPUs** to Docker Desktop.

### 2.3 WiredTiger Memory Tuning (Preventing Contention)

MongoDB's default WiredTiger storage engine allocates:
$$\text{Cache Size} = 0.5 \times (\text{Total RAM} - 1\,\text{GB})$$

If Docker has 8 GB allocated, a single unconstrained MongoDB instance will claim ~3.5 GB of RAM. If you start 3 layers without constraints, they will attempt to allocate $3.5 \times 3 = 10.5\,\text{GB}$, leading to Docker kernel OOM kills.

**The Vialiq Solution:** Every container command explicitly clamps the WiredTiger cache:
```bash
mongod --wiredTigerCacheSizeGB 0.5
```
With 512 MB cache per layer:
- Each running MongoDB layer consumes approximately **150 MB to 200 MB** resident RAM under standard local development workloads.
- All 3 layers running simultaneously consume only **~500 MB RAM total**, leaving plenty of headroom for your IDE, Node.js microservices, and Keycloak server.

---

## 3. Configuration Files & Architecture Breakdown

### 3.1 Multi-Layer Docker Compose Specification (`tools/docker/docker-compose.3layer.yml`)

The complete infrastructure is declared in [`tools/docker/docker-compose.3layer.yml`](../../../tools/docker/docker-compose.3layer.yml):

```yaml
version: '3.8'

services:
  # ============================================================================
  # LAYER 1: ADMIN LAYER (Cluster 0 — Centralized Control Plane)
  # ============================================================================
  mongo-layer1-admin:
    image: mongo:7.0
    container_name: vialiq-mongo-layer1-admin
    restart: unless-stopped
    platform: linux/arm64
    profiles: ["admin", "dev-phase", "all"]
    command: [
      "mongod",
      "--replSet", "rs-admin",
      "--bind_ip_all",
      "--port", "27017",
      "--wiredTigerCacheSizeGB", "0.5"
    ]
    ports:
      - "27017:27017"
    volumes:
      - mongo_admin_data:/data/db
    networks:
      - vialiq-3layer-net
    healthcheck:
      test: ["CMD", "mongosh", "--port", "27017", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s

  init-layer1-admin:
    image: mongo:7.0
    container_name: vialiq-init-layer1-admin
    restart: "no"
    platform: linux/arm64
    profiles: ["admin", "dev-phase", "all"]
    depends_on:
      mongo-layer1-admin:
        condition: service_healthy
    networks:
      - vialiq-3layer-net
    entrypoint: [ "bash", "-c", "
      mongosh --host mongo-layer1-admin:27017 --eval '
        try {
          rs.status();
          console.log(\"[Layer 1 Admin] Replica set rs-admin already initialized.\");
        } catch (e) {
          rs.initiate({
            _id: \"rs-admin\",
            members: [
              { _id: 0, host: \"mongo-layer1-admin:27017\" }
            ]
          });
          console.log(\"[Layer 1 Admin] Replica set rs-admin initialized successfully.\");
        }
      ';
    "]

  # ============================================================================
  # LAYER 2: DEV ENVIRONMENT (Cluster 1 — Not-Live DEV & UAT Study Databases)
  # ============================================================================
  mongo-layer2-dev:
    image: mongo:7.0
    container_name: vialiq-mongo-layer2-dev
    restart: unless-stopped
    platform: linux/arm64
    profiles: ["dev", "dev-phase", "all"]
    command: [
      "mongod",
      "--replSet", "rs-dev",
      "--bind_ip_all",
      "--port", "27027",
      "--wiredTigerCacheSizeGB", "0.5"
    ]
    ports:
      - "27027:27027"
    volumes:
      - mongo_dev_data:/data/db
    networks:
      - vialiq-3layer-net
    healthcheck:
      test: ["CMD", "mongosh", "--port", "27027", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s

  init-layer2-dev:
    image: mongo:7.0
    container_name: vialiq-init-layer2-dev
    restart: "no"
    platform: linux/arm64
    profiles: ["dev", "dev-phase", "all"]
    depends_on:
      mongo-layer2-dev:
        condition: service_healthy
    networks:
      - vialiq-3layer-net
    entrypoint: [ "bash", "-c", "
      mongosh --host mongo-layer2-dev:27027 --eval '
        try {
          rs.status();
          console.log(\"[Layer 2 Dev] Replica set rs-dev already initialized.\");
        } catch (e) {
          rs.initiate({
            _id: \"rs-dev\",
            members: [
              { _id: 0, host: \"mongo-layer2-dev:27027\" }
            ]
          });
          console.log(\"[Layer 2 Dev] Replica set rs-dev initialized successfully.\");
        }
      ';
    "]

  # ============================================================================
  # LAYER 3: PRODUCTION (Cluster 2 — Live Operational Clinical Trials)
  # ============================================================================
  mongo-layer3-prod:
    image: mongo:7.0
    container_name: vialiq-mongo-layer3-prod
    restart: unless-stopped
    platform: linux/arm64
    profiles: ["prod", "all"]
    command: [
      "mongod",
      "--replSet", "rs-prod",
      "--bind_ip_all",
      "--port", "27037",
      "--wiredTigerCacheSizeGB", "0.5"
    ]
    ports:
      - "27037:27037"
    volumes:
      - mongo_prod_data:/data/db
    networks:
      - vialiq-3layer-net
    healthcheck:
      test: ["CMD", "mongosh", "--port", "27037", "--eval", "db.adminCommand('ping')"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 5s

  init-layer3-prod:
    image: mongo:7.0
    container_name: vialiq-init-layer3-prod
    restart: "no"
    platform: linux/arm64
    profiles: ["prod", "all"]
    depends_on:
      mongo-layer3-prod:
        condition: service_healthy
    networks:
      - vialiq-3layer-net
    entrypoint: [ "bash", "-c", "
      mongosh --host mongo-layer3-prod:27037 --eval '
        try {
          rs.status();
          console.log(\"[Layer 3 Prod] Replica set rs-prod already initialized.\");
        } catch (e) {
          rs.initiate({
            _id: \"rs-prod\",
            members: [
              { _id: 0, host: \"mongo-layer3-prod:27037\" }
            ]
          });
          console.log(\"[Layer 3 Prod] Replica set rs-prod initialized successfully.\");
        }
      ';
    "]

networks:
  vialiq-3layer-net:
    name: vialiq-3layer-net
    driver: bridge

volumes:
  mongo_admin_data:
    name: vialiq_mongo_admin_data
  mongo_dev_data:
    name: vialiq_mongo_dev_data
  mongo_prod_data:
    name: vialiq_mongo_prod_data
```

### 3.2 Custom Production Dockerfile (`tools/docker/mongo/Dockerfile`)

For teams that prefer to build a custom enterprise image pre-packaged with diagnostic tools and custom templates:

[`tools/docker/mongo/Dockerfile`](../../../tools/docker/mongo/Dockerfile):
```dockerfile
FROM mongo:7.0

LABEL maintainer="Vialiq EDC Platform Engineering <devops@vialiq.health>"
LABEL description="Optimized MongoDB 7.0 container for Vialiq EDC 3-Layer Cluster"
LABEL architecture="arm64"

# Set default environment variables
ENV MONGO_REPLICA_SET_NAME="rs-admin" \
    MONGO_PORT=27017 \
    WIREDTIGER_CACHE_SIZE_GB=0.5

# Install diagnostic utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    procps \
    net-tools \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/mongo /docker-entrypoint-initdb.d
COPY mongod.conf /etc/mongo/mongod.conf
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

EXPOSE 27017

HEALTHCHECK --interval=5s --timeout=5s --retries=5 --start-period=10s \
    CMD /usr/local/bin/healthcheck.sh

CMD ["mongod", "--config", "/etc/mongo/mongod.conf"]
```

---

## 4. Step-by-Step Instructions: From Image to Running Locally

Follow these instructions in order. Do not skip any steps.

### Step 0: Verify Local macOS Environment

Open macOS Terminal (`zsh`) and run:

```bash
# 1. Verify you are running on Apple Silicon ARM64 architecture
uname -m
# Expected Output: arm64

# 2. Verify Docker daemon is running
docker --version
# Expected Output: Docker version 24.x or 27.x+

# 3. Verify Docker Compose v2 is available
docker compose version
# Expected Output: Docker Compose version v2.x+
```

---

### Step 1: Pull the Native ARM64 MongoDB 7.0 Image

Download the official image directly from Docker Hub:

```bash
docker pull --platform linux/arm64 mongo:7.0
```

To verify the downloaded image architecture:
```bash
docker inspect mongo:7.0 --format '{{.Architecture}}'
# Expected Output: arm64
```
*(If output is `arm64`, you are running natively with 0% Rosetta emulation overhead).*

---

### Step 2: Phased Cluster Activation

We support **4 distinct operational phases** using Docker Compose profiles. Run only the layers required for your current development task:

#### Phase 1: Layer 1 Only (Admin / Control Plane)
> **Use Case:** Working on tenant onboarding, Keycloak SSO integration, user authentication, or study metadata routing. Zero clinical data.

```bash
docker compose -f tools/docker/docker-compose.3layer.yml --profile admin up -d
```
*Starts `vialiq-mongo-layer1-admin` on port `27017` and executes auto-init for `rs-admin`.*

#### Phase 2: Layer 1 + Layer 2 (Admin + Dev / UAT Sandbox)
> **Use Case:** Building forms in the Form Designer, testing validation edit checks, simulating UAT trial data, and drafting protocols.

```bash
docker compose -f tools/docker/docker-compose.3layer.yml --profile dev-phase up -d
```
*Starts Layer 1 (`27017`) and Layer 2 (`27027`). Layer 3 remains completely turned off.*

#### Phase 3: Layer 3 Only (Production Isolation Test)
> **Use Case:** Testing live production migrations, 21 CFR Part 11 audit trail locking, or executing production performance benchmarks.

```bash
docker compose -f tools/docker/docker-compose.3layer.yml --profile prod up -d
```
*Starts `vialiq-mongo-layer3-prod` on port `27037`.*

#### Phase 4: Full Multi-Cluster Topology (All 3 Layers Simultaneously)
> **Use Case:** End-to-end integration testing, zero-downtime protocol promotion from Dev (Layer 2) to Prod (Layer 3), or full platform demonstrations.

```bash
docker compose -f tools/docker/docker-compose.3layer.yml --profile all up -d
```
*Starts all 3 independent layers across ports `27017`, `27027`, and `27037`.*

---

### Step 3: Verify Container Health & Status

Check the running containers and their health checks:

```bash
docker ps --filter "name=vialiq-mongo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

**Expected Output (when running Phase 4 - All Layers):**
```text
NAMES                       STATUS                    PORTS
vialiq-mongo-layer1-admin   Up 45 seconds (healthy)   0.0.0.0:27017->27017/tcp
vialiq-mongo-layer2-dev     Up 45 seconds (healthy)   0.0.0.0:27027->27027/tcp
vialiq-mongo-layer3-prod    Up 45 seconds (healthy)   0.0.0.0:27037->27037/tcp
```

Notice:
1. All three containers report `(healthy)`.
2. The `init-layer*` containers ran, initiated the replica sets, and cleanly exited with code 0 (they will not appear in `docker ps`, but in `docker ps -a` with `Exited (0)`).

---

### Step 4: Connecting via MongoDB Compass (GUI)

Download and open **[MongoDB Compass](https://www.mongodb.com/products/tools/compass)**.

#### Connecting to Layer 1 (Admin / Control Plane):
- **URI Connection String:**
  ```text
  mongodb://localhost:27017/?directConnection=true
  ```
- Click **Save & Connect**. Name the favorite: `Vialiq — Layer 1 (Admin)`.
- Compass displays replica set status `PRIMARY (rs-admin)`.

#### Connecting to Layer 2 (Dev Environment):
- **URI Connection String:**
  ```text
  mongodb://localhost:27027/?directConnection=true
  ```
- Click **Save & Connect**. Name the favorite: `Vialiq — Layer 2 (Dev Sandbox)`.
- Compass displays replica set status `PRIMARY (rs-dev)`.

#### Connecting to Layer 3 (Production):
- **URI Connection String:**
  ```text
  mongodb://localhost:27037/?directConnection=true
  ```
- Click **Save & Connect**. Name the favorite: `Vialiq — Layer 3 (Production)`.
- Compass displays replica set status `PRIMARY (rs-prod)`.

> [!NOTE]
> **Why `?directConnection=true`?**  
> When connecting to a single-node replica set from the host machine (macOS) through Docker port forwarding, `directConnection=true` tells the MongoDB driver to speak directly to `localhost:<port>` rather than trying to resolve the internal container hostnames (`mongo-layer1-admin`).

---

### Step 5: Connecting via Terminal Shell (`mongosh`)

You can connect directly from your macOS terminal using `docker exec` (no local mongosh installation required on macOS):

#### Open Layer 1 (Admin):
```bash
docker exec -it vialiq-mongo-layer1-admin mongosh --port 27017
```

#### Open Layer 2 (Dev):
```bash
docker exec -it vialiq-mongo-layer2-dev mongosh --port 27027
```

#### Open Layer 3 (Prod):
```bash
docker exec -it vialiq-mongo-layer3-prod mongosh --port 27037
```

Inside the prompt, verify replica set status:
```javascript
rs.status().ok
// Returns: 1

rs.status().set
// Returns: "rs-admin" (or "rs-dev" / "rs-prod")
```

---

### Step 6: Verifying Multi-Document ACID Transactions

Multi-document transactions are strictly required for clinical EDC audit trail compliance. Let's verify that transactions work seamlessly on each layer.

Run this script inside `mongosh` on **Layer 3 (Production)**:

```bash
docker exec -it vialiq-mongo-layer3-prod mongosh --port 27037 --eval '
  const session = db.getMongo().startSession();
  const studyDb = session.getDatabase("study_oncology_101_prod");
  
  session.startTransaction();
  try {
    // 1. Insert patient visit form record
    studyDb.subject_visits.insertOne({
      subjectId: "SUBJ-001",
      visitName: "Screening",
      systolicBP: 120,
      diastolicBP: 80,
      submittedAt: new Date()
    });

    // 2. Insert immutable 21 CFR Part 11 audit trail entry
    studyDb.audit_trail.insertOne({
      action: "FORM_SUBMIT",
      recordId: "SUBJ-001",
      userId: "crc_dr_smith",
      reason: "Initial baseline visit",
      timestamp: new Date()
    });

    // 3. Commit both writes atomically
    session.commitTransaction();
    console.log("✅ Multi-Document ACID Transaction committed successfully on Layer 3!");
  } catch (error) {
    session.abortTransaction();
    console.error("❌ Transaction failed and rolled back:", error);
  } finally {
    session.endSession();
  }
'
```

**Expected Console Output:**
```text
✅ Multi-Document ACID Transaction committed successfully on Layer 3!
```

---

### Step 7: Verifying Change Streams (Real-Time CDC)

Change Streams drive the event-driven background jobs and automated query engines. Test that Change Streams can listen to the oplog:

Open a terminal and run:
```bash
docker exec -it vialiq-mongo-layer3-prod mongosh --port 27037 --eval '
  const changeStream = db.getSiblingDB("study_oncology_101_prod").subject_visits.watch();
  console.log("📡 Change Stream active. Watching for live database mutations...");
  
  // Wait for the next inserted document
  if (changeStream.hasNext()) {
    console.log("🔔 Real-time event detected:", JSON.stringify(changeStream.next().operationType));
  }
'
```

---

### Step 8: Lifecycle Management (Stop, Restart, Logs, and Clean Wipe)

#### 1. Gracefully Stop Running Containers (Preserves All Data)
```bash
docker compose -f tools/docker/docker-compose.3layer.yml --profile all stop
```
*Data persists in Docker named volumes (`vialiq_mongo_*_data`).*

#### 2. Resume Stopped Containers
```bash
docker compose -f tools/docker/docker-compose.3layer.yml --profile all start
```

#### 3. View Real-Time Logs
```bash
# View Layer 1 Admin logs:
docker logs -f vialiq-mongo-layer1-admin

# View Layer 2 Dev logs:
docker logs -f vialiq-mongo-layer2-dev

# View Layer 3 Prod logs:
docker logs -f vialiq-mongo-layer3-prod
```

#### 4. Complete Teardown & Data Reset (Fresh Database Sandbox)
> [!WARNING]
> This command will permanently delete all local Docker volumes and test study data!

```bash
docker compose -f tools/docker/docker-compose.3layer.yml --profile all down -v
```

---

## 5. Developer Productivity: NPM Scripts & Shortcuts

To avoid typing long Docker Compose commands, add the following shortcuts to root [`package.json`](../../../package.json):

```json
"scripts": {
  "docker:mongo:admin": "docker compose -f tools/docker/docker-compose.3layer.yml --profile admin up -d",
  "docker:mongo:dev": "docker compose -f tools/docker/docker-compose.3layer.yml --profile dev-phase up -d",
  "docker:mongo:prod": "docker compose -f tools/docker/docker-compose.3layer.yml --profile prod up -d",
  "docker:mongo:all": "docker compose -f tools/docker/docker-compose.3layer.yml --profile all up -d",
  "docker:mongo:status": "docker ps --filter 'name=vialiq-mongo'",
  "docker:mongo:stop": "docker compose -f tools/docker/docker-compose.3layer.yml --profile all stop",
  "docker:mongo:down": "docker compose -f tools/docker/docker-compose.3layer.yml --profile all down",
  "docker:mongo:clean": "docker compose -f tools/docker/docker-compose.3layer.yml --profile all down -v"
}
```

Now you can simply run:
```bash
npm run docker:mongo:admin    # Launches Layer 1 Admin (27017)
npm run docker:mongo:dev      # Launches Admin + Dev layers (27017, 27027)
npm run docker:mongo:all      # Launches all 3 layers simultaneously
npm run docker:mongo:status   # Checks cluster health
npm run docker:mongo:stop     # Stops containers cleanly (preserves volumes)
npm run docker:mongo:down     # Shuts down containers and network
npm run docker:mongo:clean    # Complete reset (wipes volumes for clean DB)
```

---

## 6. Troubleshooting & Gotchas on Apple Silicon macOS

### 1. Port Conflict (`Bind for 0.0.0.0:27017 failed: port is already allocated`)
- **Cause:** macOS Homebrew might be running a background MongoDB service (`brew services start mongodb-community`).
- **Fix:** Stop Homebrew MongoDB service:
  ```bash
  brew services stop mongodb-community
  # Verify port 27017 is free:
  lsof -i :27017
  ```

### 2. High Memory or CPU Usage on M1 Pro / M5 Pro
- **Cause:** Docker Desktop may be running x86 emulation or Rosetta translation without VirtioFS.
- **Fix:**
  1. Verify container platform is `linux/arm64`:
     ```bash
     docker inspect vialiq-mongo-layer1-admin --format '{{.Platform}}'
     # Must return: linux/arm64
     ```
  2. In Docker Desktop Settings -> Resources -> Virtual disk: Ensure **VirtioFS** is selected.

### 3. Replica Set Not Recognized in MongoDB Compass
- **Symptoms:** Compass connects as standalone and throws `Transaction numbers are only allowed on a replica set member or mongos`.
- **Fix:** Append `?directConnection=true` to your connection string:
  ```text
  mongodb://localhost:27017/?directConnection=true
  ```
  Or connect with the replica set parameter:
  ```text
  mongodb://127.0.0.1:27017/?replicaSet=rs-admin&directConnection=true
  ```

---
*End of Setup Guide. You are now running the complete 3-Layer Vialiq EDC MongoDB cluster topology locally.*
