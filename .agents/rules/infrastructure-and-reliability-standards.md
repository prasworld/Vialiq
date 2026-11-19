---
description: Mandatory engineering standards for infrastructure, Docker Compose, distributed clusters, databases, and operational reliability. Prevents environment bias, process-vs-cluster readiness confusion, dynamic config wiping, and GxP data-loss defaults.
---

# Infrastructure, Distributed Systems & Operational Reliability Standards

This rule enforces strict architectural and operational standards for all container configurations, database clusters, deployment topologies, and verification harnesses across the repository.

---

## 1. Zero Host/Architecture Bias (Cross-Platform Portability)
- **Directive**: Never assume the target runtime is Apple Silicon macOS or any single CPU architecture.
- **Action**: Never hardcode host-specific CPU architectures (e.g., `platform: linux/arm64` or `platform: linux/amd64`) in Docker Compose files, container commands, or build scripts unless building a hardware-specific bare-metal image.
- **Requirement**: Standard container images (MongoDB, Redis, Node.js, PostgreSQL) publish multi-architecture manifests. Omitting the `platform:` field allows Docker to automatically negotiate native execution with zero emulation overhead across:
  - Apple Silicon Macs (M1–M5 native `arm64`)
  - Linux x86-64 workstations and CI/CD runners (native `amd64`)
  - Windows WSL2 environments (Intel & AMD)
  - Cloud ARM servers (AWS Graviton, Ampere)

---

## 2. Liveness vs. Readiness (Quorum & Writable Primary Gate)
- **Directive**: Never equate process liveness (e.g., an open TCP port or responding to `ping`) with cluster readiness.
- **Action**:
  - In distributed systems, replica sets, and clustered databases (e.g., MongoDB, Redis Sentinel, PostgreSQL HA, Kafka), healthchecks and doctor scripts MUST assert **cluster consensus and writable state**, not just daemon uptime.
  - For MongoDB: Healthchecks must evaluate `db.hello().isWritablePrimary === true` (or equivalent `db.runCommand({ isMaster: 1 })`). An open port 27017 responding to `ping` while stuck in `STARTUP2` or `RECOVERING` is **NOT healthy**.
  - For Redis Sentinel: Quorum discovery (`sentinel get-master-addr-by-name <master>`) must return a valid, reachable master.
  - Startup dependencies (`depends_on`) must account for bootstrap initializers, and initializers must be monitored for non-zero exit codes.

---

## 3. Dynamic State & Configuration Persistence
- **Directive**: Daemons that mutate their own configuration or state at runtime must never have their state wiped on restart.
- **Action**:
  - Redis Sentinel, Raft engines, and clustered services dynamically rewrite configuration files (epochs, failover counters, elected master IPs).
  - Always mount dynamic configuration files from **persistent named volumes** (e.g., `sentinel_data:/etc/redis`).
  - Container bootstrap commands must **conditionally initialize** configs (`if [ ! -f /etc/redis/sentinel.conf ]; then ...; fi`) rather than unconditionally overwriting them on boot. Overwriting wipes failover topology and reverts clusters to stale states.

---

## 4. GxP / Regulated Durability & Zero Silent Data Loss
- **Directive**: In Clinical EDC, healthcare, and audit-regulated environments (FDA 21 CFR Part 11, EU Annex 11, HIPAA), crash durability and data consistency always take precedence over micro-latency optimizations.
- **Action**:
  - **Redis Durability**: Set `no-appendfsync-on-rewrite no`. Disabling fsync during background AOF rewrites risks losing audit hashes and governance leases if a crash occurs during rewrite.
  - **Cache Eviction**: Use `maxmemory-policy volatile-lru` (or `noeviction`) so un-expiring governance state, locks, and persistent dictionary records cannot be silently evicted under memory pressure.
  - **Transaction Support**: All databases must support multi-document ACID transactions across collections inside sessions.

---

## 5. Network Boundary & Tiered Isolation Enforcement
- **Directive**: Multi-tier logical separation must be physically enforced at the container network layer.
- **Action**:
  - Separate security zones (e.g., Control Plane/Admin, Dev/Staging, Live Production) must use dedicated bridge networks (`vialiq-mongo-admin-net`, `vialiq-mongo-dev-net`, `vialiq-mongo-prod-net`).
  - Probes and integration tests must actively verify that isolated containers cannot establish IP routes or reach ports across segregated network boundaries.

---

## 6. Mandatory Automated Infrastructure Verification Harness (Infra TDD)
- **Directive**: Never consider an infrastructure or Docker change complete based on static code review or simple `docker compose up` alone.
- **Action**: Every infrastructure setup must be backed by an automated verification script (e.g., `tools/scripts/test-docker-infra.mjs`) that exercises:
  1. **Socket Reachability**: Localhost and internal port reachability.
  2. **Quorum & Election**: Node election to `PRIMARY` with matching replica set names.
  3. **ACID Transactions**: Atomic commit and rollback across multiple collections in a session.
  4. **Security & Auth Gates**: Explicit rejection of unauthenticated commands (`NOAUTH`) and acceptance with credentials.
  5. **Network Boundaries**: Negative routing tests between isolated tiers.
  6. **Disaster Recovery**: Static blueprint compliance and restart survivability.
