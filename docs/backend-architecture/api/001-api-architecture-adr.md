# ADR: EDC API Framework & Architecture Strategy

| Field | Value |
|---|---|
| **Status** | **Accepted** (Consensus Reached: ASP.NET Core 9.0 / .NET 9 C#) |
| **Date** | 2026-10-20 (Consensus finalized following ADR 002–005 review) |
| **Author** | Architecture Team / Prashant Gupta |
| **Domain** | Backend Architecture / API Layer |
| **Target Systems** | ASP.NET Core 9.0 (.NET 9 C#), MongoDB 7.0+ (3 Clusters), Microsoft SQL Server 2022+, Redis 7.0+ Cluster, SignalR, Angular 21 (Nx Monorepo) |
| **Related** | [002: API Stack Discussion Agenda & Evaluation](./002-api-stack-discussion-agenda-and-evaluation-framework.md), [003: DTO Design & GraphQL Evaluation](./003-dto-design-and-graphql-evaluation-adr.md), [004: Monorepo Architecture](./004-repository-architecture-monorepo-vs-submodule-adr.md), [005: Core API Foundations & Realtime](./005-api-foundations-auth-override-engine-and-realtime-adr.md), [006: Controller Conventions & HTTP QUERY](./006-api-controller-conventions-seeding-and-migration-adr.md), [007: Polyglot Database Migration & Seeding](./007-polyglot-database-migration-and-seeding-adr.md) |

---

## 1. Context & Problem Statement

The Vialiq EDC platform frontend is built using **Angular 21 (Signals)** and **Lit 3 Web Components** (`<vi-*>`) in a strict TypeScript monorepo (`nx`). The Form Builder creates dynamic form definitions with embedded clinical validation logic (`json-logic-js` and Google Blockly AST).

To support global Phase 1–3 clinical trials with strict regulatory governance (FDA 21 CFR Part 11, ICH GCP E6(R3), EU Annex 11, HIPAA), the backend API requires:
1. **High Concurrency & Throughput**: Supporting 100,000+ concurrent clinical users and peak clinic shifts of 35,000+ req/sec without latency spikes.
2. **Deterministic Client/Server Validation Parity**: Clinical validation rules and edit checks authored in the browser must evaluate identically on the backend during data submission, with zero floating-point or truthiness drift.
3. **Multi-Threaded Batch Compute**: Generating 100,000-page CDISC ODM-XML exports, SAS transport datasets, and PDF/A patient books without blocking operational API transactions.
4. **Dynamic Polyglot Tenancy & CSFLE**: Native multiplexing across 3 physical MongoDB clusters (Layer 1 Admin on `27017`, Layer 2 Dev on `27027`, Layer 3 Prod on `27037`) with Client-Side Field-Level Encryption (CSFLE), alongside SQL Server 2022+ for analytical reporting.
5. **Real-Time Collaboration & Form Concurrency**: Sub-millisecond Single-Editor / Multi-Reader form locking (15-minute TTL in MongoDB + Redis per [ADR 003](../../critical-problems-and-adrs/003-realtime-signalr-reconnection-and-field-lease-reconciliation-adr.md)), real-time query/discrepancy notifications via SignalR, and audit trail streaming.

---

## 2. Alternatives Considered & Architectural Evaluation

### Option 1: ASP.NET Core (.NET 9 LTS / C# 13 Clean Architecture) — SELECTED

* **Strengths**:
  * **Exceptional Throughput & Low Latency**: .NET 9 Kestrel delivers industry-leading throughput (> 35,000 req/sec) with minimal memory footprint and zero garbage collection stalls on heavy workloads.
  * **Native Multi-Threading for Heavy Compute**: Offloads massive CDISC ODM-XML exports, SAS transport generation, and bulk PDF stamping to native background worker threads without event-loop starvation.
  * **Enterprise Data Tier Maturity**: Official, battle-tested `MongoDB.Driver 2.28+` with full CSFLE and Queryable Encryption SDK support, paired with `Microsoft.Data.SqlClient` and Dapper for secondary SQL Server reporting.
  * **Unified Real-Time Foundation (SignalR)**: Enterprise WebSocket protocol with native binary packing (MessagePack), seamless fallback to Server-Sent Events / Long Polling through hospital firewalls, and horizontal scaling via Redis Cluster backplane.
  * **Strict Type Safety & Immutability**: C# 13 records, pattern matching, non-nullable reference types (`<Nullable>enable</Nullable>`), and compile-time Roslyn analyzers minimize runtime exceptions.
* **Initial Concerns & Resolved Mitigations**:
  * *Concern:* Dual-language stack (C# backend vs TypeScript frontend).
  * *Resolution:* Resolved in [ADR 005 (Intentional Model Asymmetry)](../../critical-problems-and-adrs/005-model-decoupling-and-intentional-asymmetry-adr.md), [ADR 004](./004-repository-architecture-monorepo-vs-submodule-adr.md), and [ADR 006](./006-api-controller-conventions-seeding-and-migration-adr.md). DTO contracts are decoupled from internal database entities via stable transport envelopes, while Symmetrical Dual Mapping (`@vialiq/automapper` on Angular, `AutoMapper` / `Mapperly` on .NET) handles boundary projection without synthetic 1:1 parity or OpenAPI code-gen churn.
  * *Concern:* Validation rule drift between JavaScript `json-logic-js` and C#.
  * *Resolution:* Standardized via `JsonLogic.Net` verified by a shared golden test suite in CI (`tests/validation-parity/`), guaranteeing 100% identical AST evaluation outcomes.

---

### Option 2: NestJS (Node.js 20+ LTS / TypeScript Modular Monolith) — REJECTED

* **Strengths**:
  * Single-language full-stack (TypeScript across Angular and Node.js).
  * Native sharing of `json-logic-js` library between client and server.
* **Why Rejected for Regulated Clinical EDC**:
  * **Single-Threaded Event Loop Bottlenecks**: Heavy clinical operations (bulk CDISC ODM-XML exports, multi-megabyte audit trail parsing, crypto signature chaining) saturate the V8 event loop, causing unacceptably high p99 latency spikes for real-time CRF auto-save transactions.
  * **CSFLE & Multi-Cluster Driver Ergonomics**: While the Node.js MongoDB driver supports CSFLE, complex connection pooling across dozens of regional replica sets with dynamic AWS KMS key management is significantly less robust under Node.js memory constraints.
  * **GAMP 5 CSV & Long-Term LTS Governance**: Pharmaceutical enterprise IT departments and CSV audit boards overwhelmingly mandate enterprise runtimes (.NET LTS / JVM) with guaranteed multi-year vendor security support.

---

## 3. Decision

We accept **Option 1: ASP.NET Core 9.0 (.NET 9 C#) Clean Architecture** as the primary, authoritative backend API stack for the Vialiq EDC platform.

```
                         VIALIQ API CLEAN ARCHITECTURE TOPOLOGY
                                           │
    ┌──────────────────────────────────────┼──────────────────────────────────────┐
    ▼                                      ▼                                      ▼
Presentation Tier                      Core Domain Tier                       Infrastructure Tier
(Vialiq.Api)                           (Vialiq.Core)                          (Vialiq.Infrastructure)
-----------------                      -------------                          -----------------------
• ASP.NET Core 9.0 Kestrel             • Domain Entities & Value Objects      • MongoDB.Driver 2.28+ (CSFLE)
• REST (OpenAPI 3.0)                   • 21 CFR Part 11 Audit Trail Ledger    • 3-Cluster Tenant Routing Pool
• IETF HTTP QUERY ([HttpQuery])        • Clinical Edit Check AST Engine       • SQL Server CDC Reporting Warehouse
• SignalR (EdcCollaborationHub)        • Four-Eyes & Reason for Change Rules  • Redis Cluster HA Backplane
• GxP HTTP 428 Override Filter         • MediatR Commands & Queries           • Liquibase InitContainers
```

### Key Technical Specifications of the Selected Stack:

1. **Runtime & Framework**:
   * **.NET 9 LTS** running on Linux (Alpine / distroless container images).
   * **C# 13** with strict nullability (`<Nullable>enable</Nullable>`) and strict TreatWarningsAsErrors.
   * Central Package Management via `Directory.Packages.props`.

2. **Project Structure (`backend/api/`)**:
   * `backend/api/src/Vialiq.Api/`: ASP.NET Core controllers, middleware pipeline, SignalR hubs, and DI bootstrapping.
   * `backend/api/src/Vialiq.Core/`: Framework-agnostic clinical domain logic, MediatR commands, validators, and entities.
   * `backend/api/src/Vialiq.Infrastructure/`: Polyglot database repositories, MongoDB CSFLE driver multiplexing, Redis caching, and external service clients.

3. **Communication Protocols**:
   * **Transactional REST**: OpenAPI 3.0 with standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`).
   * **IETF HTTP `QUERY` Method**: As codified in [ADR 006](./006-api-controller-conventions-seeding-and-migration-adr.md), `[HttpQuery]` replaces query-string-heavy GET requests to eliminate 2048-byte URL limits and prevent PHI/PII leakage in access logs.
   * **Real-Time Collaboration**: ASP.NET Core SignalR (`EdcCollaborationHub`, `PlatformNotificationHub`) backed by Redis Cluster.

4. **Context & Tenancy Contract (ADR 005 & Scale 003)**:
   * Multi-tenancy is resolved strictly via cryptographically signed JWT claims coupled with explicit request headers (`X-Tenant-Id`, `X-Study-Id`, `X-Environment`).
   * **Zero study in the hostname**: Hostnames strictly represent the tenant (`https://novartis.vialiq.com`), while Study and Environment are managed via in-app global switching.

5. **Validation Parity Engine**:
   * Server-side edit checks execute via `JsonLogic.Net` with custom clinical operator extensions matching the frontend Angular engine.
   * A shared golden CI validation fixture (`tests/validation-parity/`) executes 100+ complex medical rule scenarios against both runtimes on every PR, ensuring zero drift.

---

## 4. Consequences & Mitigations

### Positive Consequences
* **Extreme Performance & Scalability**: Multi-threaded execution easily sustains 35,000+ req/sec and handles 100,000-page CDISC exports without impacting interactive API latency.
* **Regulatory Compliance (FDA 21 CFR Part 11)**: Strict compile-time typing, immutable audit trail chaining, and built-in GxP Challenge-Response override filters.
* **Direct Database Integration**: First-class CSFLE encryption and dynamic connection pooling across the 3 physical MongoDB clusters.
* **Unified Real-Time Architecture**: SignalR provides seamless fallback across WebSockets, SSE, and long polling, with Redis Cluster backplane scaling across 50+ pods.

### Negative Consequences & Mitigations
* **Dual-Language Monorepo (C# Backend + TypeScript Frontend)**:
  * *Mitigation:* In accordance with [ADR 005](../../critical-problems-and-adrs/005-model-decoupling-and-intentional-asymmetry-adr.md), the platform embraces intentional model asymmetry rather than synthetic 1:1 contract parity or fragile NSwag code generators. Dynamic clinical form payloads (`Record<string, unknown>`) are transported via stable envelope contracts, while [`@vialiq/automapper`](../../../libs/automapper) (frontend) and `AutoMapper` / `Mapperly` (backend) manage boundary transformations and prevent internal database keys or UI view state from leaking across the network.
* **Validation Parity Maintenance**:
  * *Mitigation:* The CI pipeline enforces automated parity validation testing between `json-logic-js` and `JsonLogic.Net`. Any divergence fails the build immediately.
