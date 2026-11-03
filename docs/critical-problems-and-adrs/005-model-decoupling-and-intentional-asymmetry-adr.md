# ADR 005: Intentional Model Asymmetry & Client-Server Decoupling

> **Status:** ✅ **SEALED & APPROVED**  
> **Date:** October 2026  
> **Deciders:** Architecture Core Team  
> **Domain:** Full-Stack Data Contracts, API & BFF Tier  
> **Regulatory Context:** FDA 21 CFR Part 11, GAMP 5 Category 4/5, Decoupled Architecture  

---

## 1. Context & The False Dilemma of "Contract Parity"

In early architecture reviews, a failure mode was proposed around "BFF Contract Drift Testing" — postulating that automated parity tests, NSwag code generators, or dual-tier AutoMapper validation were required to ensure C# DTOs and TypeScript models match 1:1.

This premise was **formally rejected** as fundamentally incompatible with the architecture of Vialiq:

1. **Client and Server Models Are Decoupled by Design**:
   - The TypeScript Form Engine (`libs/form-builder`, `libs/form-renderer`, `libs/state-fp`) operates on dynamic UI schema definitions, token-injected component configs, layout trees, and client-side reactivity graphs.
   - The C# Backend (`Vialiq.Core`, `Vialiq.Infrastructure`, `Vialiq.Api`) operates on canonical BSON aggregates, 21 CFR Part 11 immutable audit logs, relational CDC projections, and cryptographic enclaves.
2. **Clinical Payloads are Metadata-Driven, Not Rigid DTO Trees**:
   - In clinical trials, 90% of data entry consists of dynamic form values (`formData: Record<string, unknown>`) governed by the JSON `FormDefinition` schema.
   - The system does not maintain 500 bespoke C# and TypeScript classes for every lab test or vital sign; it uses generic domain envelopes (`SubjectRecord`, `FormInstance`, `AuditEntry`).
3. **They Will Never Match 1:1 — Nor Should They**:
   - Forcing C# server-side entities/DTOs to mirror TypeScript client-side models introduces severe artificial coupling, leaks UI presentation concerns into the core domain, and violates Clean Architecture.

---

## 2. Decision & Architectural Principles

### Decision 1: Formal Acceptance of Model Asymmetry
The platform formally adopts **Intentional Model Asymmetry**:
* C# backend models and TypeScript frontend models have distinct lifecycles, representations, and concerns.
* No tool, linter, or CI gate shall attempt to enforce 1:1 property or structural reflection between C# DTOs and TypeScript models.

### Decision 2: Minimal Generic Transport Envelopes
The wire contract between .NET 9 Kestrel and the Angular frontend consists exclusively of stable, minimal transport envelopes:
* `FormSubmissionDto`: Contains `StudyId`, `SiteId`, `SubjectId`, `FormId`, `FormVersion`, `Data` (`Dictionary<string, object>`), and `ClientAuditMeta`.
* `SubjectSummaryDto`: Lightweight search/workspace projections.
* `FormLockDto`: Concurrency status tokens.
* `AuditQueryDto`: Historical audit logs.

### Decision 3: Zero-Bloat Contract Verification
* **OpenAPI Documentation**: .NET 9 built-in `Microsoft.AspNetCore.OpenApi` provides live API schemas for documentation and debugging.
* **Standard Monorepo Type Safety**: TypeScript interfaces in consuming applications/libraries typed against the wire envelope provide compile-time safety.
* **No Contract Drift Tooling**: Eliminates code-generation build steps, NSwag complexity, and synthetic parity test suites.

---

## 3. Consequences

* **Positive**:
  * Eliminates over-engineered CI/CD contract drift pipelines and AST analyzers.
  * Developers can evolve frontend UI components and backend domain aggregates independently without breaking synthetic parity rules.
  * Preserves clean separation between dynamic UI schema structures and immutable backend BSON records.
* **Negative**:
  * Developers must maintain basic TypeScript wire interfaces manually when envelope endpoints change (an infrequent event across ~15 stable domain envelopes).

---

## 4. Verification & Governance

* **CI Enforcement**: Standard `dotnet test` on backend and `nx run-many -t build,test` on frontend. If an envelope endpoint signature changes, consuming tests catch it naturally during normal PR validation.
