# Comprehensive Setup Guide: High-Availability Redis & Sentinel Cluster in Docker (Apple Silicon M1 Pro to M5 Pro & Cross-Platform)

> **Document ID:** `VIALIQ-ARCH-CACHE-001`  
> **Status:** Approved / Active Architecture Standard  
> **Target Platforms:** Apple Silicon (macOS ARM64: M1 Pro / Max / Ultra, M2, M3, M4, and Mac Studio M5 Pro) & Linux/Windows Docker Desktop  
> **Target Software:** Docker Desktop 24+ / Compose v2.20+, Redis 7.2 Alpine (Native ARM64 / Multi-Arch), Redis Sentinel  
> **Related Architecture Documents:**
> - [ADR 007-A: Multi-Tenant Cache Isolation & Security Scoping](../../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md)
> - [ENG 007-B: High-Availability Redis Cluster Architecture & Scaling Guide](../../critical-problems-and-adrs/007-b-high-availability-redis-cluster-and-scaling-guide.md)
> - [ADR 003: Form Concurrency & Redis Lock Lifecycle](../../critical-problems-and-adrs/003-realtime-signalr-reconnection-and-field-lease-reconciliation-adr.md)
> - [ADR 006: Audit Trail Streaming Backpressure & Bulk Flushing](../../critical-problems-and-adrs/006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md)
> - [3-Layer MongoDB Cluster Docker Setup Guide](./mongodb-3layer-docker-setup-guide.md)

---

## Table of Contents

1. [Executive Summary & Redis Architecture Overview](#1-executive-summary--redis-architecture-overview)
   - [1.1 The Role of Redis in Vialiq EDC](#11-the-role-of-redis-in-vialiq-edc)
   - [1.2 The Strict GxP Data Boundary (Zero Patient Data in Cache)](#12-the-strict-gxp-data-boundary-zero-patient-data-in-cache)
   - [1.3 High-Availability Topology: Primary-Replica + 3-Sentinel Quorum](#13-high-availability-topology-primary-replica--3-sentinel-quorum)
   - [1.4 Cluster Components & Specifications Matrix](#14-cluster-components--specifications-matrix)
2. [Hardware & Platform Optimization: Apple Silicon M1 Pro to M5 Pro](#2-hardware--platform-optimization-apple-silicon-m1-pro-to-m5-pro)
   - [2.1 Apple Silicon Native ARM64 Performance vs Rosetta 2](#21-apple-silicon-native-arm64-performance-vs-rosetta-2)
   - [2.2 macOS Docker Desktop Configuration (Memory & VirtioFS)](#22-macos-docker-desktop-configuration-memory--virtiofs)
   - [2.3 Redis Memory Clamping & GxP Eviction Policy (`volatile-lru`)](#23-redis-memory-clamping--gxp-eviction-policy-volatile-lru)
   - [2.4 macOS Kernel Tuning (`vm.overcommit_memory = 1`)](#24-macos-kernel-tuning-vmovercommit_memory--1)
3. [Configuration Files & Architecture Breakdown](#3-configuration-files--architecture-breakdown)
   - [3.1 Developer Compose Specification (`tools/docker/docker-compose.redis-dev.yml`)](#31-developer-compose-specification-toolsdockerdocker-composeredis-devyml)
   - [3.2 Production Hardened Configuration (`tools/docker/redis-prod.conf`)](#32-production-hardened-configuration-toolsdockerredis-prodconf)
   - [3.3 Sentinel Quorum Mechanics & Failure Detection](#33-sentinel-quorum-mechanics--failure-detection)
4. [Step-by-Step Instructions: From Zero to Running Locally](#4-step-by-step-instructions-from-zero-to-running-locally)
   - [Step 0: Verify Local macOS / Docker Environment](#step-0-verify-local-macos--docker-environment)
   - [Step 1: Pull the Native ARM64 Redis 7.2 Image](#step-1-pull-the-native-arm64-redis-72-image)
   - [Step 2: Start the Cluster via Docker Compose](#step-2-start-the-cluster-via-docker-compose)
   - [Step 3: Verify Container Health, Ports & Replication Status](#step-3-verify-container-health-ports--replication-status)
   - [Step 4: Connecting via Terminal Shell (`redis-cli`)](#step-4-connecting-via-terminal-shell-redis-cli)
   - [Step 5: Connecting via GUI (Redis Insight)](#step-5-connecting-via-gui-redis-insight)
   - [Step 6: Executing the Automated Chaos Failover Drill](#step-6-executing-the-automated-chaos-failover-drill)
   - [Step 7: Verifying .NET 9 API Connectivity (`backend/api`)](#step-7-verifying-net-9-api-connectivity-backendapi)
   - [Step 8: Lifecycle Management (Stop, Restart, Logs, and Clean Wipe)](#step-8-lifecycle-management-stop-restart-logs-and-clean-wipe)
5. [Developer Productivity: NPM Scripts & Shortcuts](#5-developer-productivity-npm-scripts--shortcuts)
6. [Production Deployment & Cloud Environments](#6-production-deployment--cloud-environments)
   - [6.1 AWS ElastiCache for Redis (Multi-AZ)](#61-aws-elasticache-for-redis-multi-az)
   - [6.2 Azure Cache for Redis (Standard / Premium Zone Redundant)](#62-azure-cache-for-redis-standard--premium-zone-redundant)
   - [6.3 Self-Hosted Kubernetes StatefulSet with Sentinel Operator](#63-self-hosted-kubernetes-statefulset-with-sentinel-operator)
7. [Enterprise Capacity Planning & Scaling (As New Studies Pour In)](#7-enterprise-capacity-planning--scaling-as-new-studies-pour-in)
   - [7.1 Capacity Math (10 to 1,000+ Active Clinical Trials)](#71-capacity-math-10-to-1000-active-clinical-trials)
   - [7.2 Automated Study Lifecycle Memory Pruning](#72-automated-study-lifecycle-memory-pruning)
8. [Troubleshooting & Gotchas on Apple Silicon macOS](#8-troubleshooting--gotchas-on-apple-silicon-macos)

---

## 1. Executive Summary & Redis Architecture Overview

### 1.1 The Role of Redis in Vialiq EDC
In the Vialiq EDC clinical platform, Redis does **not** serve as a primary data store. Instead, it fulfills three specialized infrastructure responsibilities:
1. **Distributed Cache Layer**: Ultra-fast, sub-millisecond retrieval of invariant study form schemas, MessagePack validation AST rules, dropdown codelists, and medical dictionaries (MedDRA, WHODrug).
2. **Distributed Concurrency Lock Coordinator (ADR 003)**: Managing single-editor lease locks (`edc:form_lock:{studyId}:{crfId}`) with a strict 15-minute sliding TTL to eliminate multi-investigator write races while guaranteeing MongoDB remains the durable system of record.
3. **Cache Invalidation & Real-Time Backplane**: Relaying cluster-wide schema invalidations and SignalR real-time synchronization messages across horizontally scaled API pods.

---

### 1.2 The Strict GxP Data Boundary (Zero Patient Data in Cache)
Under **ADR 007-A**, live patient data is **100% prohibited from Redis**:
* **Strict Rule**: No patient CRF responses, adverse events, lab results, subject identifiers, or blinded RTSM treatment arms shall ever enter Redis memory or append-only files (AOF).
* **Source of Truth**: Patient clinical data is queried **strictly from MongoDB** inside the study database (`study_{id}_prod.crf_entries`) with Client-Side Field-Level Encryption (CSFLE) decrypted in pod RAM per request.
* **Non-Prod Isolation**: In Layer 1 (Control Plane) and Layer 2 (Dev/Multi-UAT sandboxes), caching is bypassed entirely. Fetching directly from MongoDB has zero load implications and prevents stale schema bugs during form authoring.

```
                              DATA BOUNDARY SEPARATION
                                          │
         ┌────────────────────────────────┴────────────────────────────────┐
         ▼                                                                 ▼
STRICTLY FORBIDDEN FROM REDIS                                   PERMITTED IN REDIS
-----------------------------                                   ------------------
• Patient clinical data & labs                                  • Form schemas & layout JSON
• Subject PII / CSFLE identifiers                               • MessagePack validation rule ASTs
• Double-blind RTSM treatment arms                              • MedDRA & WHODrug dictionaries
• Non-Prod draft form designs                                   • Protocol visit-form templates
                                                                • Form concurrency lock tokens (15m TTL)
                                                                • Auth claims & revocation blacklist
```

---

### 1.3 High-Availability Topology: Primary-Replica + 3-Sentinel Quorum

To ensure continuous 24/7/365 clinical trial operations with zero single points of failure, production deploys **Non-Clustered Sentinel HA (`1 Primary + 2 Replicas + 3 Sentinels`)** so losing one replica satisfies `min-replicas-to-write 1` without halting cache writes; the local Docker environment mirrors this topology leanly with `1 Primary + 1 Replica + 3 Sentinels`:

```
                                  HIGH-AVAILABILITY REDIS TOPOLOGY
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
┌───────────────────┐                  ┌───────────────────┐                  ┌───────────────────┐
│ REDIS SENTINEL 1  │                  │ REDIS SENTINEL 2  │                  │ REDIS SENTINEL 3  │
│ Port 26379        │ <==============> │ Port 26380        │ <==============> │ Port 26381        │
│ (Quorum = 2)      │                  │ (Quorum = 2)      │                  │ (Quorum = 2)      │
└─────────┬─────────┘                  └─────────┬─────────┘                  └─────────┬─────────┘
          │                                      │                                      │
          └──────────────────────────────────────┼──────────────────────────────────────┘
                                                 │ Continuous Heartbeat Monitoring
                                                 ▼
             ┌───────────────────────────────────────────────────────┐
             │                                                       │
             ▼                                                       ▼
  ┌─────────────────────┐       Asynchronous Streaming Replication    ┌─────────────────────┐
  │ REDIS PRIMARY (L2)  │ ══════════════════════════════════════════> │ REDIS REPLICA (L2)  │
  │ Port 6379           │                 (PSYNC)                     │ Port 6380           │
  │ • Write: Locks      │                                             │ • Read-Only Queries │
  │ • Publish Invalidate│                                             │ • Auto-Promote Ready│
  └─────────────────────┘                                             └─────────────────────┘
             │                                                                   │
             │ (If Primary Crashes)                                              │ (Promoted to Primary)
             ▼                                                                   ▼
  ┌─────────────────────┐                                             ┌─────────────────────┐
  │   OFFLINE / DOWN    │                                             │ NEW ACTIVE PRIMARY  │
  └─────────────────────┘                                             │ • Takes all writes  │
             │                                                        └──────────┬──────────┘
             │ (Old Primary Recovers and Restarts)                               │
             ▼                                                                   │
  ┌─────────────────────┐                Streaming Replication (PSYNC)           │
  │ REJOINS AS REPLICA! │ <──────────────────────────────────────────────────────┘
  │ • Auto-demotes to   │
  │   slaveof new node  │
  └─────────────────────┘
```

---

### 1.4 Cluster Components & Specifications Matrix

| Component | Container Name | Host Port | Internal Port | Role / Function | Memory Limit |
|---|---|---|---|---|---|
| **Redis Primary** | `vialiq-redis-primary` | **`6379`** | `6379` | Master node: Accepts writes, manages lock leases, broadcasts invalidations | 512 MB (Dev) / 2 GB (Prod) |
| **Redis Replica** | `vialiq-redis-replica` | **`6380`** | `6380` | Hot standby: Streaming replication (`PSYNC`), auto-promotes in < 2s | 512 MB (Dev) / 2 GB (Prod) |
| **Sentinel 1** | `vialiq-sentinel-1` | **`26379`** | `26379` | Quorum monitor 1: Heartbeat detection, failover authorization | 64 MB |
| **Sentinel 2** | `vialiq-sentinel-2` | **`26380`** | `26380` | Quorum monitor 2: Heartbeat detection, failover authorization | 64 MB |
| **Sentinel 3** | `vialiq-sentinel-3` | **`26381`** | `26381` | Quorum monitor 3: Heartbeat detection, failover authorization | 64 MB |

---

## 2. Hardware & Platform Optimization: Apple Silicon M1 Pro to M5 Pro

### 2.1 Apple Silicon Native ARM64 Performance vs Rosetta 2
Redis 7.2 on Apple Silicon is executed strictly as **ARM64 Native** using `redis:7.2-alpine`.
* **Zero Emulation Overhead**: Running via Rosetta 2 (`linux/amd64`) incurs a 15–25% CPU penalty during rapid socket multiplexing. The native ARM64 image eliminates translation layers.
* **Latency Profile**: Sub-100 microsecond ($< 0.1\text{ ms}$) response times for local lock queries on Apple Silicon unified memory.

### 2.2 macOS Docker Desktop Configuration (Memory & VirtioFS)
Ensure Docker Desktop on macOS is configured for optimal performance:
1. **Virtualization Framework**: Navigate to **Settings $\rightarrow$ General** and enable **"Use Virtualization framework"**.
2. **File Sharing Implementation**: Navigate to **Settings $\rightarrow$ Resources $\rightarrow$ Advanced** and select **VirtioFS**. VirtioFS delivers native host-to-VM file I/O speed for append-only files (AOF).
3. **Resource Clamping**: Allocate at least **4 CPUs** and **6 GB RAM** to Docker Desktop to comfortably run the 3-Layer MongoDB topology and the HA Redis cluster simultaneously.

### 2.3 Redis Memory Clamping & GxP Eviction Policy (`volatile-lru`)
In clinical EDC, cache eviction rules are governed by regulatory audit and stability requirements:
* **The GxP Compliance Rule**: NEVER configure `allkeys-lru` or `allkeys-random`. Under memory pressure, Redis must **never** evict invariant reference dictionaries (`MedDRA`, `WHODrug`), governance lock hashes (`vialiq:locks:*`), or study epoch counters.
* **The Configured Policy (`maxmemory-policy volatile-lru`)**:
  * **No TTL (Persistent / Non-Evictable):** Global reference dictionaries (`MedDRA`, `WHODrug`), governance freeze hashes (`vialiq:locks:{studyId}`), and `epoch` counters omit TTLs (replaced deterministically on dictionary version publish, XFetch background refresh, or `[RotateCacheKey]`).
  * **Explicit TTL (Evictable Pool):** Temporary `[Cached]` view responses (`1h`/`24h`), `60s` negative cache sentinels, `15m` form edit leases, and session revocations carry explicit TTLs, paired with a **75% memory high-water alert** (and scaled `maxmemory` tiers in `Scale 004`) so active leases never starve.

### 2.4 macOS Kernel Tuning (`vm.overcommit_memory = 1`)
When Redis saves background snapshots (BGSAVE) or rewrites the Append-Only File (AOF), the Linux kernel forks the process. Under macOS Docker Desktop:
```bash
# Verify overcommit memory inside the Redis container
docker exec -it vialiq-redis-primary sh -c "cat /proc/sys/vm/overcommit_memory"
```
The Docker VM image provided by Docker Desktop automatically manages memory overcommit. If warnings appear in the Redis log, set `--maxmemory` appropriately to prevent Docker container OOM kills.

---

## 3. Configuration Files & Architecture Breakdown

### 3.1 Developer Compose Specification (`tools/docker/docker-compose.redis-dev.yml`)

The developer environment is declared in [`tools/docker/docker-compose.redis-dev.yml`](../../../tools/docker/docker-compose.redis-dev.yml):

```yaml
version: '3.8'

services:
  # 1. Primary Redis Node
  redis-primary:
    image: redis:7.2-alpine
    container_name: vialiq-redis-primary
    command: >
      redis-server
      --port 6379
      --requirepass VialiqDevSecret123!
      --masterauth VialiqDevSecret123!
      --maxmemory 512mb
      --maxmemory-policy volatile-lru
      --appendonly yes
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "VialiqDevSecret123!", "ping"]
      interval: 3s
      timeout: 2s
      retries: 5
    networks:
      - vialiq-dev-net

  # 2. Secondary Redis Replica
  redis-replica:
    image: redis:7.2-alpine
    container_name: vialiq-redis-replica
    command: >
      redis-server
      --port 6380
      --replicaof redis-primary 6379
      --requirepass VialiqDevSecret123!
      --masterauth VialiqDevSecret123!
      --maxmemory 512mb
      --maxmemory-policy volatile-lru
    ports:
      - "6380:6380"
    depends_on:
      redis-primary:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "redis-cli", "-p", "6380", "-a", "VialiqDevSecret123!", "ping"]
      interval: 3s
      timeout: 2s
      retries: 5
    networks:
      - vialiq-dev-net

  # 3. Sentinel 1
  redis-sentinel-1:
    image: redis:7.2-alpine
    container_name: vialiq-sentinel-1
    command: >
      sh -c "echo 'port 26379' > /tmp/sentinel.conf &&
             echo 'sentinel monitor mymaster redis-primary 6379 2' >> /tmp/sentinel.conf &&
             echo 'sentinel auth-pass mymaster VialiqDevSecret123!' >> /tmp/sentinel.conf &&
             echo 'sentinel down-after-milliseconds mymaster 2000' >> /tmp/sentinel.conf &&
             echo 'sentinel failover-timeout mymaster 5000' >> /tmp/sentinel.conf &&
             echo 'sentinel parallel-syncs mymaster 1' >> /tmp/sentinel.conf &&
             redis-sentinel /tmp/sentinel.conf"
    ports:
      - "26379:26379"
    depends_on:
      - redis-primary
      - redis-replica
    networks:
      - vialiq-dev-net

  # 4. Sentinel 2
  redis-sentinel-2:
    image: redis:7.2-alpine
    container_name: vialiq-sentinel-2
    command: >
      sh -c "echo 'port 26380' > /tmp/sentinel.conf &&
             echo 'sentinel monitor mymaster redis-primary 6379 2' >> /tmp/sentinel.conf &&
             echo 'sentinel auth-pass mymaster VialiqDevSecret123!' >> /tmp/sentinel.conf &&
             echo 'sentinel down-after-milliseconds mymaster 2000' >> /tmp/sentinel.conf &&
             echo 'sentinel failover-timeout mymaster 5000' >> /tmp/sentinel.conf &&
             echo 'sentinel parallel-syncs mymaster 1' >> /tmp/sentinel.conf &&
             redis-sentinel /tmp/sentinel.conf"
    ports:
      - "26380:26380"
    depends_on:
      - redis-primary
      - redis-replica
    networks:
      - vialiq-dev-net

  # 5. Sentinel 3
  redis-sentinel-3:
    image: redis:7.2-alpine
    container_name: vialiq-sentinel-3
    command: >
      sh -c "echo 'port 26381' > /tmp/sentinel.conf &&
             echo 'sentinel monitor mymaster redis-primary 6379 2' >> /tmp/sentinel.conf &&
             echo 'sentinel auth-pass mymaster VialiqDevSecret123!' >> /tmp/sentinel.conf &&
             echo 'sentinel down-after-milliseconds mymaster 2000' >> /tmp/sentinel.conf &&
             echo 'sentinel failover-timeout mymaster 5000' >> /tmp/sentinel.conf &&
             echo 'sentinel parallel-syncs mymaster 1' >> /tmp/sentinel.conf &&
             redis-sentinel /tmp/sentinel.conf"
    ports:
      - "26381:26381"
    depends_on:
      - redis-primary
      - redis-replica
    networks:
      - vialiq-dev-net

networks:
  vialiq-dev-net:
    driver: bridge
```

---

### 3.2 Production Hardened Configuration (`tools/docker/redis-prod.conf`)

For cloud virtual machines or self-hosted bare metal deployments, the production parameters are codified in [`tools/docker/redis-prod.conf`](../../../tools/docker/redis-prod.conf):

```ini
# --- NETWORK & SECURITY ---
bind 0.0.0.0
protected-mode yes
port 6379
requirepass "${VIALIQ_REDIS_PASSWORD}"
masterauth "${VIALIQ_REDIS_PASSWORD}"
timeout 300
tcp-keepalive 60

# --- MEMORY LIMITS & GxP EVICTION ---
maxmemory 2147483648                  # Starter 2 GB baseline (scale to 4-64 GB non-clustered Sentinel HA per Scale 004; 75% RAM alert)
maxmemory-policy volatile-lru         # Evict ONLY TTL-bound ephemera; dictionaries/locks/epochs omit TTL

# --- REPLICATION & ANTI-SPLIT-BRAIN ---
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync yes
repl-diskless-sync-delay 5
repl-ping-replica-period 10
repl-timeout 60
repl-backlog-size 64mb
repl-backlog-ttl 3600

# Require at least 1 healthy connected replica with lag <= 10s to authorize writes
min-replicas-to-write 1
min-replicas-max-lag 10

# --- PERSISTENCE (AOF for Disaster Recovery) ---
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite yes
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
```

---

### 3.3 Sentinel Quorum Mechanics & Failure Detection

Sentinel nodes maintain consensus using the Raft-like algorithm built into Redis Sentinel:
1. **Heartbeat Monitoring**: Every Sentinel pings the Primary node every second.
2. **Subjective Down (`sdown`)**: If the Primary fails to respond for `2000ms` (`sentinel down-after-milliseconds 2000`), the Sentinel marks it as subjectively down.
3. **Objective Down (`odown`)**: When a quorum of **2 out of 3** Sentinels confirm the `sdown` state, the Primary is declared objectively down.
4. **Leader Election & Promotion**: The elected leader Sentinel promotes the Replica to Master (`SLAVEOF NO ONE`), assigns the new IP/port, reconfigures the remaining nodes, and notifies connected clients via Pub/Sub.

---

## 4. Step-by-Step Instructions: From Zero to Running Locally

### Step 0: Verify Local macOS / Docker Environment
Confirm Docker Desktop is running and supports native ARM64:
```bash
docker info | grep -E "Architecture|OSType"
# Expected output:
# Architecture: aarch64
# OSType: linux
```

---

### Step 1: Pull the Native ARM64 Redis 7.2 Image
```bash
docker pull redis:7.2-alpine
```

---

### Step 2: Start the Cluster via Docker Compose
Use either the npm script shortcut or the direct compose command:
```bash
# Option A: npm shortcut
npm run docker:redis:up

# Option B: Direct docker compose
docker compose -f tools/docker/docker-compose.redis-dev.yml up -d
```

---

### Step 3: Verify Container Health, Ports & Replication Status
Verify all 5 containers are running and healthy:
```bash
npm run docker:redis:status
# or:
docker ps --filter "name=vialiq-redis" --filter "name=vialiq-sentinel"
```
You should see all 5 containers in healthy/running state:
* `vialiq-redis-primary` (healthy) $\rightarrow$ `0.0.0.0:6379->6379/tcp`
* `vialiq-redis-replica` (healthy) $\rightarrow$ `0.0.0.0:6380->6380/tcp`
* `vialiq-sentinel-1` $\rightarrow$ `0.0.0.0:26379->26379/tcp`
* `vialiq-sentinel-2` $\rightarrow$ `0.0.0.0:26380->26380/tcp`
* `vialiq-sentinel-3` $\rightarrow$ `0.0.0.0:26381->26381/tcp`

---

### Step 4: Connecting via Terminal Shell (`redis-cli`)

#### Connect to Primary (Port 6379):
```bash
docker exec -it vialiq-redis-primary redis-cli -a VialiqDevSecret123!
```
Execute commands:
```text
127.0.0.1:6379> PING
PONG
127.0.0.1:6379> INFO replication
# Replication
role:master
connected_slaves:1
slave0:ip=172.18.0.3,port=6379,state=online,offset=1240,lag=0
```

#### Connect to Replica (Port 6380):
```bash
docker exec -it vialiq-redis-replica redis-cli -p 6380 -a VialiqDevSecret123!
```
Execute commands:
```text
127.0.0.1:6380> INFO replication
# Replication
role:slave
master_host:redis-primary
master_port:6379
master_link_status:up
```

#### Connect to Sentinel (Port 26379):
```bash
docker exec -it vialiq-sentinel-1 redis-cli -p 26379
```
Execute commands:
```text
127.0.0.1:26379> SENTINEL master mymaster
# Returns name, IP, port, flags:master, num-slaves:1, num-other-sentinels:2, quorum:2
```

---

### Step 5: Connecting via GUI (Redis Insight)
1. Download and launch **Redis Insight** (free from Redis official website).
2. Click **"Add Redis Database"**.
3. Enter Connection Details:
   * **Host**: `localhost`
   * **Port**: `6379`
   * **Database Alias**: `Vialiq Primary (Local)`
   * **Password**: `VialiqDevSecret123!`
4. Click **Connect**. You can now visualize active form locks (`edc:form_lock:*`), cache schemas, and monitor real-time command streams.

---

### Step 6: Executing the Automated Chaos Failover Drill
To prove high-availability and self-healing resilience, execute the turnkey automated drill:

```bash
npm run docker:redis:test-failover
```

#### Drill Execution Log:
```text
==================================================================
 [STEP 1/5] Verifying Initial Primary-Replica Topology...
==================================================================
Primary status: role:master
Replica status: role:slave

==================================================================
 [STEP 2/5] Simulating Primary Hardware Crash (Stopping Master)...
==================================================================
vialiq-redis-primary stopped. Waiting 3.5s for Sentinel quorum failover...

==================================================================
 [STEP 3/5] Verifying Automatic Secondary Promotion to Master...
==================================================================
Promoted node role: role:master
>> SUCCESS: Replica was automatically promoted to Master!

==================================================================
 [STEP 4/5] Rebooting Old Primary (Simulating Node Recovery)...
==================================================================
vialiq-redis-primary restarted. Waiting 3.0s for Sentinel re-configuration...

==================================================================
 [STEP 5/5] Verifying Self-Healing Reconnection & Demotion...
==================================================================
Recovered node role: role:slave
>> SUCCESS: Old primary auto-demoted to replica and rejoined cluster via PSYNC!

==================================================================
 Redis High-Availability Failover Drill Completed Successfully! 
==================================================================
```

---

### Step 7: Verifying .NET 9 API Connectivity (`backend/api`)

In `backend/api/src/Vialiq.Api/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "Redis": "localhost:6379,localhost:6380,password=VialiqDevSecret123!,abortConnect=false,connectRetry=5,connectTimeout=3000,syncTimeout=2000"
  }
}
```

When using Redis Sentinel in .NET 9:
```csharp
var configOptions = new ConfigurationOptions
{
    EndPoints = { { "localhost", 26379 }, { "localhost", 26380 }, { "localhost", 26381 } },
    ServiceName = "mymaster",
    Password = "VialiqDevSecret123!",
    AbortOnConnectFail = false
};
var redis = ConnectionMultiplexer.SentinelConnect(configOptions);
```

---

### Step 8: Lifecycle Management (Stop, Restart, Logs, and Clean Wipe)

```bash
# View live logs across all nodes
docker compose -f tools/docker/docker-compose.redis-dev.yml logs -f

# Temporarily stop all nodes (preserves keys and volumes)
npm run docker:redis:stop

# Resume stopped nodes
docker compose -f tools/docker/docker-compose.redis-dev.yml start

# Tear down containers (clean shutdown)
npm run docker:redis:down

# Clean reset: wipe all keys and volumes from scratch
docker compose -f tools/docker/docker-compose.redis-dev.yml down -v
```

---

## 5. Developer Productivity: NPM Scripts & Shortcuts

All Redis operational commands are unified under standard npm scripts in `package.json`:

| Task | npm Shortcut | Direct Command Equivalent |
|---|---|---|
| **Start HA Cluster** | `npm run docker:redis:up` | `docker compose -f tools/docker/docker-compose.redis-dev.yml up -d` |
| **Check Health & Status** | `npm run docker:redis:status` | `docker ps --filter 'name=vialiq-redis' --filter 'name=vialiq-sentinel'` |
| **Run Chaos Failover Drill** | `npm run docker:redis:test-failover` | `bash tools/scripts/test-redis-ha-failover.sh` |
| **Stop Nodes (Preserve Data)** | `npm run docker:redis:stop` | `docker compose -f tools/docker/docker-compose.redis-dev.yml stop` |
| **Tear Down Containers** | `npm run docker:redis:down` | `docker compose -f tools/docker/docker-compose.redis-dev.yml down` |

---

## 6. Production Deployment & Cloud Environments

### 6.1 AWS ElastiCache for Redis (Multi-AZ)
In AWS production environments:
* **Engine**: Valkey / Redis 7.1+.
* **Cluster Mode**: Disabled (avoids cross-slot hash tags `{study}` complexity for $< 3\text{ GB}$ datasets).
* **Multi-AZ**: Enabled with **Automatic Failover** across Availability Zones (e.g. `us-east-1a` and `us-east-1b`).
* **Node Type**: `cache.t4g.small` (2 vCPUs, 1.37 GB RAM) or `cache.m7g.large` (2 vCPUs, 6.76 GB RAM).
* **Encryption**: In-Transit Encryption (TLS 1.3 enabled) and At-Rest Encryption (AWS KMS Customer Managed Key).

### 6.2 Azure Cache for Redis (Standard / Premium Zone Redundant)
In Microsoft Azure production environments:
* **Tier**: **Standard C1** (1 GB) for up to 250 active clinical studies; **Standard C2** (2.5 GB) for up to 1,000 active clinical studies.
* **SLA**: Two-node Primary/Secondary architecture with automated 99.99% availability SLA.
* **Zone Redundancy**: For mission-critical Phase 3 global trials, choose **Premium P1** with Zone Redundancy across 3 availability zones.

### 6.3 Self-Hosted Kubernetes StatefulSet with Sentinel Operator
For on-premise pharmaceutical private clouds:
* Deploy using the **Redis Operator** (e.g., `Spotahome/redis-operator` or `OT-CONTAINER-KIT/redis-operator`).
* The operator deploys a 3-replica Redis StatefulSet alongside a 3-replica Sentinel Deployment.
* Kubernetes Headless Services manage direct node communication and pod IP re-registration upon failover.

---

## 7. Enterprise Capacity Planning & Scaling (As New Studies Pour In)

### 7.1 Capacity Math (10 to 1,000+ Active Clinical Trials)

Because live patient clinical responses are **100% excluded from cache**, memory consumption is strictly a function of the number of **active study protocols**, NOT patient population:

$$\text{Total Redis RAM} = \Big( N_{\text{studies}} \times N_{\text{forms}} \times \overline{\text{Size}}_{\text{schema}} \Big) + \text{Dicts} + \Big( N_{\text{locks}} \times 100\text{ bytes} \Big) + \text{Auth}$$

```
=============================================================================================================
VIALIQ CACHE CAPACITY & SCALING BENCHMARKS
=============================================================================================================
Active Studies   Active Sites   Active CRFs/day   Form Schemas RAM   Dictionaries RAM   Lock Tokens   Total Redis RAM
-------------------------------------------------------------------------------------------------------------
10 Studies       100 Sites      5,000 saves       ~25 MB             ~50 MB             ~10 KB        < 100 MB
50 Studies       1,000 Sites    50,000 saves      ~125 MB            ~50 MB             ~50 KB        ~250 MB
250 Studies      5,000 Sites    300,000 saves     ~625 MB            ~50 MB             ~250 KB       ~800 MB
1,000 Studies    25,000 Sites   1,500,000 saves   ~2.5 GB            ~50 MB             ~1 MB         ~3.0 GB
=============================================================================================================
```

#### Mathematical Takeaway:
* Even under enterprise conditions hosting **1,000 active concurrent clinical protocols**, total memory utilization is **only ~3.0 Gigabytes**.
* A standard 4 GB to 8 GB instance handles the entire global enterprise footprint without requiring cluster sharding.

---

### 7.2 Automated Study Lifecycle Memory Pruning

To keep Redis lean and prevent memory leaks as clinical trials run their multi-year lifecycle:
1. **Database Lock & Study Closeout**: When a study achieves final database lock, the platform issues an invalidation sweep for `vialiq:study:{tenant}:{study}:*`, purging all cached schemas.
2. **24-Hour Sliding TTL**: All cached form definitions carry a 24-hour sliding TTL. Inactive studies naturally age out of RAM and reload in $< 15\text{ ms}$ from MongoDB only when an auditor or coordinator opens a form.

---

## 8. Troubleshooting & Gotchas on Apple Silicon macOS

### Gotcha 1: `overcommit_memory is set to 0` Warning in Logs
* **Symptom**: Redis startup log prints `# WARNING Memory overcommit must be enabled! Without it, a background save or replication may fail under low memory condition to fix this issue add 'vm.overcommit_memory = 1' to /etc/sysctl.conf`.
* **Fix**: This is a harmless Linux kernel advisory inside Docker Desktop on macOS. Because our dev container is clamped to `512mb` and total host RAM is 16–32 GB, snapshot saves will not fail.

### Gotcha 2: Sentinel Port Conflicts (26379, 26380, 26381)
* **Symptom**: `Bind for 0.0.0.0:26379 failed: port is already allocated`.
* **Fix**: Check if a previous or system Redis instance is running locally:
  ```bash
  lsof -i :26379
  # Kill lingering processes or run:
  npm run docker:redis:down
  ```

### Gotcha 3: Split-Brain Mitigation (`min-replicas-to-write 1`)
* **Symptom**: In production, during an isolated network partition, an old master might continue accepting writes while Sentinel promotes a new master, creating split-brain data loss.
* **Fix**: In [`tools/docker/redis-prod.conf`](../../../tools/docker/redis-prod.conf), we enforce `min-replicas-to-write 1` and `min-replicas-max-lag 10`. If a primary loses connection to its replica, it **rejects all write commands**, preventing split-brain overwrites.

### Gotcha 4: Redis Insight Connection Issues with Protected Mode
* **Symptom**: Redis Insight reports `DENIED Redis is running in protected mode because protected mode is enabled and no password is configured`.
* **Fix**: Always specify the auth password `VialiqDevSecret123!` in Redis Insight. Protected mode is enabled by default to prevent unauthenticated access.
