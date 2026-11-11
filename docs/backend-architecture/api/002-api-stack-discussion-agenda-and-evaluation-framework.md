# API Stack: Proposed Discussion Agenda & Framework Evaluation

> **Document ID:** `VIALIQ-ARCH-API-002`  
> **Domain:** Backend Architecture — API Layer  
> **Status:** Closed / Decided (Consensus Reached on ASP.NET Core 9.0 in ADR 001 & ADR 005)  
> **Date:** October 19, 2026 (Closed: October 20, 2026)  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Decision:** Finalizing the Core API Stack, Framework Selection, Data Access, and Regulatory Interceptors  
> **Related Documents:**
> - [001: EDC API Architecture ADR](./001-api-architecture-adr.md)
> - [API Specification & Endpoint Contracts](./api-specification-and-contracts.md)
> - [Database Specification](../database/database-architecture-specification.md)
> - [002: 3-Cluster & Flexible Tenancy Architecture](../database/002-3-cluster-and-flexible-tenancy-architecture.md)
> - [010: Docker Compose Environments Guide](../database/010-docker-compose-3layer-vs-mongo-cluster-guide.md)

---

## 1. Executive Summary & Context

With the **Database Architecture tier 100% sealed** (3-cluster physical isolation, dynamic database-per-study tenancy, CSFLE encryption, and 21 CFR Part 11 operational pillars), we now establish the formal discussion agenda to finalize the **Vialiq EDC API Stack**.

The API layer serves as the single secure bridge between:
1. **The Frontend Layer**: Angular 21 (Signals) and Lit 3 Web Components (`<vi-*>`) in an Nx TypeScript monorepo.
2. **The Database Layer**: 3 physical MongoDB clusters (Layer 1 Admin on `27017`, Layer 2 Dev on `27027`, Layer 3 Prod on `27037`).
3. **The Regulatory Perimeter**: Strict adherence to FDA 21 CFR Part 11, ICH GCP E6(R3), EU Annex 11, and HIPAA § 164.312.

> [!NOTE]  
> **Evaluation Outcome: DECIDED in ADR 001 & ADR 005**  
> The framework evaluation concluded on October 20, 2026, establishing **ASP.NET Core 9.0 (.NET 9 C#)** as the accepted platform API stack based on multi-threaded throughput, native CSFLE multi-cluster driver support, SignalR real-time scaling, and enterprise GxP requirements. This document remains preserved as the historical evaluation framework and criteria record.

---

## 2. Pillar 1: The Core Framework Decision (NestJS vs. .NET Standard / ASP.NET Core)

The foundational choice that determines developer workflow, type safety, regulatory validation, and performance.

```
                                  CORE FRAMEWORK EVALUATION
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
            Candidate A: NestJS                               Candidate B: ASP.NET Core
       (Node.js 20+ LTS / TypeScript)                         (.NET 8/9 LTS / C# Clean Arch)
```

### Key Evaluation Criteria for Discussion:

1. **Validation Parity & Code Sharing**:
   - The Form Builder authoring engine outputs dynamic validation logic (`json-logic-js` and Google Blockly AST).
   - *NestJS:* Direct, zero-overhead sharing of validation libraries and DTOs between Angular and backend via the Nx monorepo.
   - *.NET:* Requires a C# `json-logic` interpreter port or WebAssembly/V8 JavaScript host inside .NET, or maintaining parallel validation engines. Risk of floating-point/truthiness drift.
2. **Regulatory Computer System Validation (CSV)**:
   - GAMP 5 Category 4/5 software validation: Does maintaining dual-language models (C# backend + TS frontend) double the verification burden during regulatory audits?
3. **Throughput, CPU-Intensive Tasks & Concurrency**:
   - Clinical trials involve burst tasks: 100,000-page CDISC ODM-XML exports, PDF/A patient book generation, and complex retrospective edit checks.
   - *NestJS:* Single-threaded event loop requires delegating heavy compute to BullMQ worker threads.
   - *.NET:* High-performance multi-threaded runtime with superior throughput and native parallel processing.
4. **Dynamic Multi-Cluster MongoDB Routing & CSFLE Support**:
   - Official MongoDB Node.js driver vs. official `MongoDB.Driver` in .NET.
   - Client-Side Field-Level Encryption (CSFLE / Queryable Encryption) SDK maturity and ergonomics in both ecosystems.
5. **Team Velocity, Talent & Long-Term Maintenance**:
   - Monorepo full-stack synergy (single language across frontend/backend) vs. enterprise C# maturity, LINQ, and established enterprise patterns.

---

## 3. Pillar 2: Architectural Patterns & Domain Boundaries

Regardless of framework, the API must implement clean, decoupled domain boundaries:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       VIALIQ EDC DOMAIN MODULE BOUNDARIES                   │
├───────────────────────┬─────────────────────────────┬───────────────────────┤
│ 1. Auth & Identity    │ 2. Tenant & Study Registry  │ 3. Form Definition    │
│    Keycloak OIDC,     │    Control plane (Layer 1), │    JSON schema CRUD,  │
│    Session Inactivity │    study metadata & routing │    draft/publish cycle│
├───────────────────────┼─────────────────────────────┼───────────────────────┤
│ 4. Clinical Data      │ 5. Validation Engine        │ 6. Query Discrepancy  │
│    Auto-save debounce,│    json-logic-js runner,    │    Auto-generated &   │
│    formal submit      │    Blockly AST execution    │    manual CRA queries │
├───────────────────────┼─────────────────────────────┼───────────────────────┤
│ 7. Part 11 Audit Trail│ 8. Electronic Signature     │ 9. Locking & Freezing │
│    Append-only ledger,│    Dual-auth (§ 11.50/200), │    4-layer hierarchy, │
│    SHA-256 chaining   │    crypto document signing  │    form-level locks   │
├───────────────────────┴─────────────────────────────┴───────────────────────┤
│ 10. Background Processing & CDISC Export (BullMQ / Hangfire)                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Topics for Discussion:
- **Modular Monolith vs. Microservices**: Confirming the Modular Monolith approach to avoid distributed transaction overhead while keeping strict module isolation.
- **Transactional Consistency Boundaries**: Ensuring that a data submission atomically updates `crf_entries`, appends to `audit_trail`, and triggers edit checks in a single multi-document ACID transaction.

---

## 4. Pillar 3: Communication Protocols & Real-Time Collaboration

Clinical trial monitoring requires hybrid synchronous and real-time communication:

| Protocol | Technology Options | EDC Use Case |
|---|---|---|
| **RESTful HTTP** | OpenAPI 3.0 / Swagger | CRUD operations, formal CRF submission, study setup, audit lookups |
| **Real-Time WebSockets** | Socket.io (NestJS) vs. SignalR (.NET) + Redis Backplane | Single-editor form lock status announcements (`ADR 003`), monitor presence, real-time query popups |
| **Server-Sent Events / Change Streams** | MongoDB Change Streams $\rightarrow$ SSE Gateway | Real-time safety alerts (e.g. 24h Serious Adverse Event / SAE alerts to Safety Monitor) |

### Key Topics for Discussion:
- **Idempotency & Network Resilience**: Enforcing `Idempotency-Key` headers on all formal clinical data submissions to prevent duplicate records during poor clinical site connectivity.
- **Error Standard**: Adopting RFC 7807 (`application/problem+json`) for standardized API error contracts across all endpoints.

---

## 5. Pillar 4: Dynamic Multi-Cluster Data Access Layer

How the API interacts with the 3 physical MongoDB clusters:

```
                                  API DATA ACCESS LAYER
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
Layer 1: Admin (27017)             Layer 2: Dev (27027)                Layer 3: Prod (27037)
• vialiq_control_plane             • study_oncology_101_dev            • study_oncology_101_prod
• keycloak_auth                    • study_cardio_202_dev              • study_cardio_202_prod
• audit_config                     • study_sandbox_uat                 • study_vaccine_303_prod
```

### Key Topics for Discussion:
- **ORM / ODM Strategy**:
  - *If Node.js/NestJS:* Native MongoDB Driver (`mongodb` v6) vs. Mongoose. (In multi-tenant database-per-study architectures, native driver or lightweight dynamic Mongoose connection multiplexing).
  - *If .NET:* Official `MongoDB.Driver` vs. EF Core MongoDB Provider.
- **Connection Pool Multiplexing & LRU Eviction**:
  - Architecture of the `ConnectionPoolManager` to dynamically maintain active connection pools across 500+ study databases without socket exhaustion.
- **Client-Side Field-Level Encryption (CSFLE)**:
  - Placement of encryption/decryption keys: Trust boundary strictly on the API tier, transparently decrypting PHI/PII for authorized roles.

---

## 6. Pillar 5: Regulatory Compliance, Security & Middleware (21 CFR Part 11)

Clinical trials have non-negotiable legal requirements that must be enforced at the API middleware level:

1. **Session Inactivity Timeout Guard (§ 11.10(a))**:
   - Strict 15-minute sliding inactivity window.
   - Redis-backed session TTL invalidating tokens upon idle timeout.
2. **Reason-for-Change Interceptor (§ 11.10(e))**:
   - Any modification (`PUT`, `PATCH`, `POST`) to previously submitted clinical data must require a mandatory, non-empty `reasonForChange`.
   - Automatic recording into the immutable audit trail with SHA-256 hash chaining.
3. **Dual-Authentication E-Signature Guard (§ 11.50 & § 11.200)**:
   - Requiring both primary password and dedicated signature PIN / MFA code before executing an electronic signature mutation.
   - Cryptographic manifest generation binding the user identity, timestamp, meaning, and exact BSON snapshot of data signed.
4. **Form-Level Concurrency Locking Guard ([ADR 003](../../critical-problems-and-adrs/003-realtime-signalr-reconnection-and-field-lease-reconciliation-adr.md))**:
   - Single-Editor / Multi-Reader form lock (15-minute TTL synced across MongoDB `study_edit_leases` + Redis, gated by regulatory `study_locks`) ensuring exclusive form edit rights and zero race conditions between site coordinators.

---

## 7. Immediate Next Step: The NestJS vs. .NET Architectural Debate

To resolve the core framework decision, we will evaluate:

1. **Architecture & Monorepo Fit**: How each aligns with the current Nx monorepo (Angular 21 + Lit 3 Web Components).
2. **Validation Engine Portability**: Exact parity of `json-logic-js` on browser and server.
3. **Performance & Compute Heavy Tasks**: CDISC exports, SDTM mapping, and batch processing.
4. **Regulatory CSV Overhead**: 21 CFR Part 11 validation protocol complexity.
5. **Detailed Scoring Matrix**: Objective criteria to make the definitive selection.
