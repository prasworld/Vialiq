# Database Security, Secrets Management & CI/CD Configuration Guide

> **Document ID:** `VIALIQ-DEPLOY-004`  
> **Status:** Approved / Active Architecture Standard  
> **Target Audience:** DevOps Engineers, Platform Architects, Security Auditors, Backend Engineers  
> **Target Systems:** Redis 7.2 Sentinel, MongoDB 7.0 (3-Layer GxP), ASP.NET Core 9 APIs  
> **Related Architecture Documents:**
> - [001: Web & API Enterprise Deployment Framework](./001-web-and-api-enterprise-deployment-framework.md)
> - [002: Load Balancer, Ingress & Traffic Routing Guide](./002-load-balancer-ingress-and-traffic-routing-guide.md)
> - [3-Layer MongoDB Docker Setup Guide](../backend-architecture/database/mongodb-3layer-docker-setup-guide.md)
> - [ADR 007-A: Multi-Tenant Cache Isolation & Security Scoping](../critical-problems-and-adrs/007-a-multitenant-cache-isolation-and-security-scoping-adr.md)

---

## 1. Executive Summary & Design Principles

In regulated clinical environments (FDA 21 CFR Part 11, HIPAA Security Rule § 164.312, GAMP 5 Cat 4, SOC 2 Type II), database credentials and infrastructure security must balance **two critical demands**:

1. **Zero-Overhead Local Turnaround**: Local engineering onboarding and automated test cycles must execute in seconds. Developers must never be bogged down by fragile local certificate authorities, keyfile file-permission errors (`chmod 400` quirks across macOS VirtioFS/Windows WSL2), or multi-step manual user creation scripts.
2. **Strict Production Compliance (12-Factor App)**: In CI/CD pipelines, staging, and production environments, **zero secrets are ever committed to Git or stored in static configuration files**. All credentials, replica-set cluster keys, and connection strings are injected at runtime from secure vaults.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             THE 12-FACTOR SECRETS MODEL                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   Local Dev (Turnaround Speed)          CI/CD & Production (Security & Simplicity│
│   ├── Safe local fallbacks              ├── Injected from Secret Managers        │
│   │   (${VAR:-DevDefault})              │   (AWS Secrets Mgr, Azure Key Vault,   │
│   ├── Bound to localhost loopback       │    Kubernetes Secrets)                 │
│   ├── Sub-3s startup / clean reset      ├── 100% Parameterized .NET Config       │
│   └── Zero file-permission friction     └── Strict Least-Privilege RBAC & TLS    │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Redis High-Availability Security Architecture

### 2.1 The Problem with Static Config Files
The Redis configuration parser (`redis-server /path/to/redis.conf`) **does not perform shell-style environment variable expansion** (`${VAR}`). Writing literal placeholders like `requirepass "${VIALIQ_REDIS_PASSWORD}"` into a `.conf` file causes Redis to treat the placeholder as the literal password, breaking authentication.

### 2.2 Local Development Architecture (`docker-compose.redis-dev.yml` & `docker-compose.redis-ha.yml`)
To guarantee instant local developer turnaround with zero setup steps, local Compose uses variable substitution with a default fallback:

```yaml
# tools/docker/docker-compose.redis-dev.yml (Standalone) & tools/docker/docker-compose.redis-ha.yml (HA)
redis:
  command: >
    redis-server
    --port 6379
    --requirepass ${VIALIQ_REDIS_PASSWORD:-VialiqDevSecret123!}
    --maxmemory 512mb
    --maxmemory-policy volatile-lru
    --appendonly yes
```

* **On Developer Laptops**: Running `npm run docker:redis:up` works immediately out of the box with zero required environment variables.
* **On CI/CD or Staging**: Supplying `export VIALIQ_REDIS_PASSWORD="<pipeline-secret>"` immediately overrides the fallback without touching code or Compose files.

### 2.2.1 Defense-in-Depth: Localhost Loopback Binding (`127.0.0.1`)
To prevent unauthorized network actors on the same LAN/Wi-Fi from connecting to local development containers:
* **All host port mappings explicitly bind to `127.0.0.1`** (e.g. `127.0.0.1:6379:6379` for Redis, `127.0.0.1:27017:27017` for MongoDB).
* Binding to `127.0.0.1` ensures that host network listeners are completely closed to external traffic on the local network, preventing adjacent network devices from attempting to authenticate with dev fallback credentials.
* In conjunction with `.gitignore` rules for `.env` files, developers can provide per-environment secrets via untracked `.env` files or CLI environment exports (`VIALIQ_REDIS_PASSWORD`) with zero risk of repository leakage.

### 2.2.2 Sentinel Control Plane Authentication (`requirepass` & `sentinel-pass`)
To prevent unauthorized or untrusted local processes from tampering with Sentinel monitors (`sentinel monitor`, `sentinel remove`, `sentinel set`):
* **Sentinel Control Ports Require Authentication**: Sentinels 1–3 enforce `requirepass ${VIALIQ_REDIS_PASSWORD:-VialiqDevSecret123!}` on their control ports (`26379`, `26380`, `26381`). Unauthenticated commands receive `NOAUTH Authentication required`.
* **Inter-Sentinel Communication**: Sentinels authenticate to each other during leader election and quorum voting via `sentinel sentinel-pass ${VIALIQ_REDIS_PASSWORD:-VialiqDevSecret123!}`.
* **Client Authentication**: Application and worker clients connect using Sentinel connection strings that provide the shared secret (e.g. `localhost:26379,localhost:26380,localhost:26381,serviceName=mymaster,password=<secret>`), allowing clients to authenticate against both Sentinel control endpoints and Redis primary/replica nodes.

### 2.3 Production Runtime Injection (`tools/docker/redis-prod.conf`)
For production cloud virtual machines, containers, or Kubernetes pods, the static configuration file (`redis-prod.conf`) omits all credentials. Credentials are fed via startup command-line arguments, which override any static directives:

```bash
# Production Container / VM Startup Command
# Note: Bind is explicitly expanded from the safe loopback default to include the private VPC interface
redis-server /etc/redis/redis-prod.conf \
  --bind <trusted-private-ip> 127.0.0.1 \
  --requirepass "$VIALIQ_REDIS_PASSWORD" \
  --masterauth "$VIALIQ_REDIS_PASSWORD"
```

### 2.4 Enterprise Production: Redis 7.2 ACLs (SHA-256 Hashes)
For high-security enterprise deployments, Redis Access Control Lists (ACLs) ensure that passwords are **never stored in plaintext**, even in memory dumps:

```text
# /etc/redis/users.acl (Mounted via Kubernetes Secret / Docker Secret with 0400 permissions)
user default off
user vialiq_api on #2bb80e5e7a9b6c4e09f58597400494cf8129a6e60b134d1b82 ~* +@all
user sentinel_monitor on #5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8 allchannels +ping +sentinel|*
```

### 2.5 Failover Durability & Monotonic Fencing Tokens (Mitigating Split-Brain Lock Loss)
In high-availability Redis topologies (Sentinel or Cloud Multi-AZ), streaming replication is asynchronous (`PSYNC`). Under theoretical edge conditions, if a Redis Primary crashes ungracefully before an acknowledged form-lock write reaches the replica, Sentinel promotes a replica that lacks the lock key.

As formalized in **ADR 003 Decision 7**, Vialiq EDC defends against data loss or concurrent overwrite through a **3-Tier Defense-in-Depth Architecture**:
1. **Clinical Domain Boundaries**: Case Report Forms (CRFs) are isolated by Subject, Visit, and Site, rendering concurrent edit attempts during sub-millisecond failovers statistically negligible ($P \ll 10^{-7}$).
2. **Tier 1 Canonical Authority (`study_edit_leases`)**: Redis is strictly a performance fast-path. Form leases are authoritatively recorded in MongoDB with a partial unique index on `{ studyId: 1, targetCrfId: 1 }`.
3. **Monotonic Fencing Tokens (OCC `_version`)**: Mutations to clinical entities enforce document-level Optimistic Concurrency Control (`_version: long`). If an editor attempts to commit with a stale version token, MongoDB atomically rejects the write with an `OptimisticConcurrencyException` (HTTP 409 Conflict). Stale or duplicate edits cannot corrupt trial data.
4. **Continuous AOF Fsync (`no-appendfsync-on-rewrite no`)**: In `redis-prod.conf`, fsync suppression during background rewrites is explicitly disabled. Redis continues issuing 1-second fsyncs even during `BGREWRITEAOF`, bounding crash loss to $\le 1$ second rather than 30 seconds of unwritten dirty OS page buffers.

---

## 3. MongoDB 3-Layer GxP Security Architecture

### 3.1 Local Development (Speed & Turnaround First)
In local development, the 3 MongoDB clusters (`rs-admin:27017`, `rs-dev:27027`, `rs-prod:27037`) run:
* **Isolated Container Networks**: Each layer runs on its own dedicated Docker bridge network (`vialiq-mongo-admin-net`, `vialiq-mongo-dev-net`, `vialiq-mongo-prod-net`). Containers on one layer cannot route or connect to other layers, preventing compromised dev/test containers from crossing into the admin or prod layers.
* **Loopback Bound**: Host port mappings explicitly bind to loopback (`127.0.0.1:27017`, `127.0.0.1:27027`, and `127.0.0.1:27037`), ensuring they are completely inaccessible to adjacent network actors.
* **Unauthenticated**: Zero `--auth` flags in dev.
* **Why this is critical for velocity**: MongoDB replica sets enforce authentication via shared `--keyFile` volumes requiring strict POSIX `chmod 400` permissions. macOS Docker Desktop mounts (VirtioFS / gRPC-FUSE) routinely fail POSIX permission checks, causing `mongod` crashloops that waste hours of engineering time.

### 3.2 Production & Staging Architecture (Managed Cloud / Operator)
In enterprise production (FDA 21 CFR Part 11 compliant), MongoDB is hosted via **Cloud Managed Clusters (MongoDB Atlas / AWS DocumentDB / Azure Cosmos DB)** or a **Kubernetes MongoDB Community/Enterprise Operator**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       PRODUCTION MONGODB SECURITY TIERS                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. Transport Security (TLS 1.3)                                            │
│     Enforced on all wire communication; unencrypted TCP is rejected.         │
│                                                                             │
│  2. Identity & Access Management (RBAC)                                     │
│     • root_admin: Cloud IAM managed; used strictly for schema migrations.   │
│     • vialiq_control_plane_user: readWrite on vialiq_control_plane ONLY.    │
│     • vialiq_study_user: readWrite on tenant study databases ONLY.          │
│                                                                             │
│  3. Data Isolation Invariant (GxP)                                          │
│     Layer 1 Admin (Cluster 0) has ZERO network routes or credentials to     │
│     Layer 3 Live Clinical Trials (Cluster 2).                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. ASP.NET Core 9 Configuration: 12-Factor Environment Overrides

The C# backend uses standard ASP.NET Core hierarchical configuration. In `Program.cs`, connection strings are loaded via `builder.Configuration.GetConnectionString("...")`.

### 4.1 Local Development (`appsettings.Development.json`)
Local development specifies clean `localhost` loopback URIs:
```json
{
  "ConnectionStrings": {
    "Redis": "localhost:6379,password=VialiqDevSecret123!",
    "RedisSentinel": "localhost:26379,localhost:26380,localhost:26381,serviceName=mymaster,password=VialiqDevSecret123!",
    "MongoAdmin": "mongodb://localhost:27017/?replicaSet=rs-admin",
    "MongoDev": "mongodb://localhost:27027/?replicaSet=rs-dev",
    "MongoProd": "mongodb://localhost:27037/?replicaSet=rs-prod"
  }
}
```

### 4.2 Production & CI/CD: Zero-Code Environment Overrides
In CI/CD, Staging, and Production, the .NET runtime automatically overrides the JSON values using environment variables formatted with double underscores (`__`):

| Target Configuration | Environment Variable to Set in Pipeline / K8s | Example Value |
|---|---|---|
| `ConnectionStrings:Redis` | `ConnectionStrings__Redis` | `prod-redis.internal:6379,password=<secret>,ssl=true` |
| `ConnectionStrings:RedisSentinel` | `ConnectionStrings__RedisSentinel` | `sentinel1:26379,sentinel2:26379,serviceName=mymaster,password=<secret>` |
| `ConnectionStrings:MongoAdmin` | `ConnectionStrings__MongoAdmin` | `mongodb+srv://admin_user:<secret>@cluster0.atlas.com/vialiq_control_plane?w=majority` |
| `ConnectionStrings:MongoDev` | `ConnectionStrings__MongoDev` | `mongodb+srv://dev_user:<secret>@cluster1.atlas.com/study_sandbox?w=majority` |
| `ConnectionStrings:MongoProd` | `ConnectionStrings__MongoProd` | `mongodb+srv://prod_user:<secret>@cluster2.atlas.com/study_prod?w=majority` |

> [!IMPORTANT]
> Because ASP.NET Core natively maps `ConnectionStrings__<Name>` to `ConnectionStrings:<Name>`, **zero application C# code changes** are required when promoting binaries from developer laptops to production.

---

## 5. CI/CD Pipeline Blueprint (GitHub Actions / GitLab CI)

Below is the standard, turnkey pipeline pattern for building, testing, and deploying the platform with clean secrets injection:

### 5.1 Pipeline Steps:
```yaml
# .github/workflows/ci.yml (Reference Blueprint)
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET 9 SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '9.0.x'

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      # ── Start ephemeral background infrastructure for integration tests ──
      - name: Start Ephemeral Infrastructure
        env:
          VIALIQ_REDIS_PASSWORD: ${{ secrets.CI_REDIS_PASSWORD || 'VialiqDevSecret123!' }}
        run: |
          npm run docker:mongo:all
          npm run docker:redis:up
          node tools/scripts/dev-doctor.mjs

      # ── Execute Full Solution Build & Tests ──
      - name: Build Backend Solution
        run: dotnet build backend/Vialiq.Platform.sln -c Release

      - name: Run Backend Architecture & Integration Tests
        env:
          ConnectionStrings__Redis: "localhost:6379,password=${{ secrets.CI_REDIS_PASSWORD || 'VialiqDevSecret123!' }}"
          ConnectionStrings__MongoAdmin: "mongodb://localhost:27017/?replicaSet=rs-admin"
          ConnectionStrings__MongoDev: "mongodb://localhost:27027/?replicaSet=rs-dev"
          ConnectionStrings__MongoProd: "mongodb://localhost:27037/?replicaSet=rs-prod"
        run: dotnet test backend/Vialiq.Platform.sln -c Release --no-build

      - name: Tear Down Ephemeral Infrastructure
        if: always()
        run: |
          npm run docker:mongo:clean
          npm run docker:redis:down
```

---

## 6. Summary: Quick Checklist for Future CI/CD Onboarding

When setting up new environments (UAT, Staging, Production), follow this 4-step checklist:

1. [ ] **Provision Managed Datastores**: Create MongoDB Atlas/DocumentDB clusters for Layer 1, 2, and 3. Provision Redis Sentinel or AWS ElastiCache for Redis.
2. [ ] **Configure Secret Manager**: Store Redis master password and MongoDB application connection strings in AWS Secrets Manager, Azure Key Vault, or Kubernetes Secrets.
3. [ ] **Inject via 12-Factor Environment Variables**: Map secrets to `ConnectionStrings__*` and `VIALIQ_REDIS_PASSWORD` in container manifests.
4. [ ] **Verify Parity with `dev-doctor.mjs`**: Ensure all service endpoints report healthy before initiating application traffic.

