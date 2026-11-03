# ADR: EDC API Framework & Architecture Strategy

| Field | Value |
|---|---|
| **Status** | Under Active Evaluation (NestJS vs. ASP.NET Core) |
| **Date** | 2026-10-19 (Reopened for Evaluation) |
| **Author** | Architecture Team / Prashant Gupta |
| **Domain** | Backend Architecture / API Layer |
| **Related** | [Discussion Agenda & Evaluation Framework](./002-api-stack-discussion-agenda-and-evaluation-framework.md), [API Specification & Contracts](./api-specification-and-contracts.md), [Database Specification](../database/database-architecture-specification.md) |

---

## 1. Context & Problem Statement

The Vialiq EDC platform frontend is built using **Angular 21 (Signals)** and **Lit 3 Web Components** (`<vi-*>`) in a strict TypeScript monorepo (`nx`). The Form Builder creates dynamic form definitions with embedded validation logic (`json-logic-js` and Google Blockly AST).

We need an API architecture and backend framework that:
1. **Guarantees Client/Server Validation Parity**: Clinical validation rules and edit checks authored in the browser must execute identically on the backend during data submission.
2. **Eliminates Code & Type Duplication**: DTOs, form schemas, error contracts, and rule definitions should be shared between the frontend UI and backend API.
3. **Supports Real-Time Collaboration**: Clinical monitors and site coordinators require live discrepancy alerts and field-level concurrency locking.
4. **Maintains 21 CFR Part 11 Regulatory Compliance**: Strict user authentication, automatic session inactivity timeouts (§ 11.10), and tamper-resistant request tracing.

---

## 2. Alternatives Considered

### Option 1: ASP.NET Core (.NET 8/9 C#)
- **Strengths**:
  - High performance, mature enterprise ecosystem, and strong native support for Windows authentication and SQL Server.
- **Weaknesses**:
  - **Language Barrier & Code Duplication**: Requires maintaining duplicate models in C# and TypeScript.
  - **Validation Divergence Risk**: `json-logic` rule evaluation in C# (via ports or custom interpreters) often behaves subtly differently from JavaScript/TypeScript runtime evaluation (floating point precision, truthy/falsy coercion, date handling). This creates regulatory risk for Computer System Validation (CSV).
  - Increased context switching for the development team.

### Option 2: NestJS (Node.js & TypeScript Modular Monolith)
- **Strengths**:
  - **Single Language Full-Stack (TypeScript)**: Shares interfaces, Zod validation schemas, and DTOs directly from Nx monorepo libraries.
  - **Exact Runtime Validation Parity**: Uses `json-logic-js` natively on both the browser and server, guaranteeing 100% deterministic edit-check outcomes.
  - **Modular Architecture**: NestJS dependency injection, controllers, and modules mirror Angular's architectural idioms, minimizing the learning curve for the team.
  - **Native Real-Time Gateway**: First-class support for WebSockets (Socket.io) with room-based pub/sub for real-time CRF review locks.
- **Weaknesses**:
  - Single-threaded event loop requires offloading heavy CPU operations (e.g. large PDF generation or complex SDTM transformations) to worker threads or background queues.

---

## 3. Decision

We accept **Option 2: NestJS Modular Monolith**:

1. **Framework**: NestJS running on Node.js 20+ LTS with strict TypeScript (`strict: true`, zero `any`).
2. **Architecture Pattern**: **Modular Monolith**. All core EDC domains (`Study`, `FormDefinition`, `ClinicalData`, `Validation`, `Audit`, `Query`, `Signature`) live within structured NestJS modules in the Nx workspace. This avoids the deployment and distributed-transaction complexity of microservices while maintaining clean domain boundaries.
3. **Protocol Split**:
   - **REST (OpenAPI/Swagger 3.0)** for transactional CRUD operations and state transitions.
   - **WebSockets (Socket.io Gateway)** for field-level concurrency locking and real-time monitor discrepancy alerts.
4. **Shared Validation Engine**: Form schemas and edit check rules are executed by the same shared TypeScript validation library (`@vialiq/form-builder-validation`) on both client and server.

---

## 4. Consequences & Mitigations

### Positive Consequences
- **Zero Validation Drift**: The same rule AST evaluates identically in the browser on blur and on the API during submit.
- **High Developer Velocity**: Frontend and backend engineers share the same language, tooling, and types.
- **Streamlined Regulatory Audits**: Verifying one validation engine for both tiers drastically simplifies 21 CFR Part 11 validation scripts and IQ/OQ/PQ protocols.

### Negative Consequences & Mitigations
- **Heavy Compute Tasks**: Heavy operations (e.g. batch exports of 100,000 CRFs to CDISC ODM-XML) could block the event loop.
  - *Mitigation*: Offload long-running exports and batch transformations to BullMQ (Redis-backed job queues) running in worker threads.
