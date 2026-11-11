# Vialiq EDC — Local Development Architecture & Setup Guide

> **Document ID:** `VIALIQ-DEV-001`  
> **Status:** Active & Maintained  
> **Target Audience:** Frontend, Backend, Full-Stack, and DevOps Engineers  
> **Prerequisites:** Node.js 20+, .NET 9 SDK, Docker Desktop  
> **Setup Time:** ~3 minutes

---

## 1. Local Development Mental Model (In 60 Seconds)

Vialiq EDC is a **modular monorepo** (`nx`) separating the user-facing web tier, the high-throughput clinical API, distributed in-memory caching/locks, and multi-cluster database storage:

```
                                [ DEVELOPER WORKSTATION ]
                                            │
               ┌────────────────────────────┴────────────────────────────┐
               ▼ (Port 4200)                                             ▼ (Port 5000)
    ┌──────────────────────┐                                  ┌──────────────────────┐
    │   Angular Web Shell  │                                  │  .NET 9 Web API Host │
    │   (nx serve shell)   │                                  │   (dotnet watch api) │
    │   - Webpack MF Host  │ ───────── HTTP / REST ─────────> │   - Controllers/Auth │
    │   - Lit 3 Components │                                  │   - Redis Cache      │
    └──────────────────────┘                                  └──────────┬───────────┘
                                                                         │
                        ┌────────────────────────────────────────────────┴────────┐
                        ▼                                                         ▼
         ┌───────────────────────────────┐                         ┌───────────────────────────────┐
         │  Redis 7.2 Sentinel HA Tier   │                         │  3-Layer MongoDB Farm (ACID)  │
         │  (tools/docker/redis-dev)     │                         │  (tools/docker/3layer)        │
         ├───────────────────────────────┤                         ├───────────────────────────────┤
         │ • Redis Primary:   :6379      │                         │ • Layer 1 Admin:   :27017     │
         │ • Redis Replica:   :6380      │                         │ • Layer 2 Dev:     :27027     │
         │ • Sentinel 1/2/3:  :26379-81  │                         │ • Layer 3 Prod:    :27037     │
         └───────────────────────────────┘                         └───────────────────────────────┘
```

### The 3 Local Layers:
1. **Frontend Tier (`apps/shell`, `apps/edc/remote1`):** Runs on the host via `nx serve shell` with instant TypeScript/SCSS hot module reloading at `http://localhost:4200`.
2. **Backend API Tier (`backend/api/src/Vialiq.Api`):** Runs on the host via `dotnet watch` with instant C# hot reloading at `http://localhost:5000` (Swagger UI at `/swagger`).
3. **Infrastructure Tier (Docker Compose):** Runs in the background with zero maintenance:
   - **3 Independent MongoDB Replica Sets:** Providing real-time Oplog Change Streams and multi-document ACID transactions.
   - **High-Availability Redis 7.2 Cluster:** 1 Primary, 1 Replica, and 3 Sentinels with automated failover for distributed clinical form locks.

---

## 2. Fast-Path Setup (3 Steps, Under 3 Minutes)

### Step 1: Install Dependencies
```bash
# Install frontend npm dependencies
npm install

# Restore .NET 9 solution packages
dotnet restore backend/api/Vialiq.Api.sln
```

### Step 2: Start Background Infrastructure (Mongo + Redis)
With our unified orchestrator script, spin up all 3 MongoDB replica sets and the Redis HA Sentinel cluster in one command:
```bash
npm run dev:infra
```
*(Containers will boot and run self-initializing replica set configurations in the background).*

### Step 3: Run the Environment Doctor
Verify that all ports and services are online and ready:
```bash
npm run dev:doctor
```
You should see green checkmarks across all services.

---

## 3. The 3 Development Workflows

Choose the workflow that matches the feature you are building:

### Workflow A: Full-Stack Hybrid (Recommended for 95% of Feature Work)
*Runs infrastructure in Docker while running the Web and API on your host machine for instant hot reload and native IDE debugging.*

1. **Terminal 1 (Infrastructure):**
   ```bash
   npm run dev:infra
   ```
2. **Terminal 2 (Backend API):**
   ```bash
   npm run dev:api
   # Launches https://localhost:5001 & http://localhost:5000 (Swagger at /swagger)
   ```
3. **Terminal 3 (Frontend Web):**
   ```bash
   npm run dev:web
   # Launches http://localhost:4200 (Angular Shell + Remote1)
   ```

---

### Workflow B: Frontend-Only / UI Component Work (Zero Docker Required)
*If you are authoring Lit Web Components (`<vi-*>`), SCSS design tokens, or Angular layouts, you do not need Docker or .NET running.*

* **Launch Web Components / Storybook:**
  ```bash
  npm run dev:web
  ```
* **Run Component Unit Tests:**
  ```bash
  npx nx test web-components
  ```

---

### Workflow C: Backend-Only / Database & API Work
*If you are working on MongoDB repositories, Redis locks, or clinical query controllers.*

1. **Start Databases & Cache:**
   ```bash
   npm run dev:infra
   ```
2. **Run API in Watch Mode:**
   ```bash
   npm run dev:api
   ```
3. **Run Backend Test Suite:**
   ```bash
   npm run api:test
   ```

---

## 4. Connection Strings, Ports & Credentials Reference

All connection strings are pre-configured in [`backend/api/src/Vialiq.Api/appsettings.Development.json`](../../backend/api/src/Vialiq.Api/appsettings.Development.json) — no manual editing is required.

| Service | Port | Replica Set / Name | Local Connection String / URL | Default DB Name |
|---|---|---|---|---|
| **Layer 1 Admin Mongo** | `27017` | `rs-admin` | `mongodb://localhost:27017/?replicaSet=rs-admin&directConnection=true` | `vialiq_control_plane` |
| **Layer 2 Dev Mongo** | `27027` | `rs-dev` | `mongodb://localhost:27027/?replicaSet=rs-dev&directConnection=true` | `vialiq_study_sandbox` |
| **Layer 3 Prod Mongo** | `27037` | `rs-prod` | `mongodb://localhost:27037/?replicaSet=rs-prod&directConnection=true` | `vialiq_study_prod` |
| **Redis Primary Cache** | `6379` | `mymaster` | `localhost:6379,password=VialiqDevSecret123!` | DB `0` (Cache/Locks) |
| **Redis Replica Cache** | `6380` | `mymaster` | `localhost:6380,password=VialiqDevSecret123!` | Read Replica |
| **Redis Sentinel Quorum**| `26379`–`26381` | Quorum = 2 | `localhost:26379,localhost:26380,localhost:26381` | N/A |
| **ASP.NET Core Web API** | `5000` / `5001` | N/A | `http://localhost:5000` (Swagger: `/swagger`) | N/A |
| **Angular Web Shell** | `4200` | N/A | `http://localhost:4200` | N/A |
| **Angular Remote 1** | `4201` | N/A | `http://localhost:4201` | N/A |

---

## 5. Daily CLI Command Cheat-Sheet

| Task | Command | Purpose |
|---|---|---|
| **Health Diagnostic** | `npm run dev:doctor` | Validates Node, .NET SDK, Docker daemon, and port bindings. |
| **Start All Infra** | `npm run dev:infra` | Boots Mongo 3-layer clusters and Redis HA Sentinel in background. |
| **Stop All Infra** | `npm run dev:infra:down` | Gracefully stops and shuts down all containers. |
| **Check Infra Status** | `npm run dev:infra:status` | Shows running containers, health states, and port maps. |
| **Clean Wipe Volumes** | `npm run dev:infra:clean` | Destroys local database volumes (resets to a fresh baseline). |
| **Test Redis Failover** | `npm run docker:redis:test-failover` | Simulates primary failure and verifies Sentinel automatic election. |
| **Start API** | `npm run dev:api` | Starts ASP.NET Core 9 in hot-reload watch mode. |
| **Start Web** | `npm run dev:web` | Starts Angular Shell with hot module reload. |
| **Run All .NET Tests** | `npm run api:test` | Executes all 13+ backend unit/integration tests. |
| **Run Frontend Tests** | `npm test` | Runs Angular / Vitest test suite. |

---

## 6. Troubleshooting Common Issues

### Issue 1: Port 27017 or 6379 is Already In Use
* **Cause:** A standalone local MongoDB (`brew services start mongodb-community`) or local Redis instance is already listening on the default port.
* **Fix (macOS):**
  ```bash
  # Check who is using the port
  lsof -i :27017 -i :6379
  # Stop Homebrew services if running
  brew services stop mongodb-community
  brew services stop redis
  ```
* **Fix (Windows):** Stop the `MongoDB Server` or `Redis` service in Windows Services (`services.msc`).

---

### Issue 2: Resetting Local Databases to Fresh State
If you want to clear out test clinical data and restart with a clean slate:
```bash
npm run dev:infra:clean
npm run dev:infra
```

---

### Issue 3: Testing Redis Automatic High-Availability Failover
To verify how the application survives a sudden Redis node crash:
```bash
npm run docker:redis:test-failover
```
This script pauses the primary Redis container, observes Sentinels elect the replica as the new master, and safely restores the cluster without developer intervention.

