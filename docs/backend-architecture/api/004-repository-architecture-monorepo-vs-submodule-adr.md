# ADR: Unified Monorepo Architecture vs. Git Submodule Strategy

> **Document ID:** `VIALIQ-ARCH-API-004`  
> **Domain:** Backend Architecture — Repository & Solution Structure  
> **Status:** Accepted  
> **Date:** October 20, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** ASP.NET Core 9.0 LTS Web API (`backend/api/`), Angular 21 Host (`apps/shell/`), Nx Monorepo  
> **Related Documents:**
> - [001: EDC API Architecture ADR](./001-api-architecture-adr.md)
> - [002: API Stack Discussion Agenda & Framework Evaluation](./002-api-stack-discussion-agenda-and-evaluation-framework.md)
> - [003: DTO Architecture Strategy & Rejection of GraphQL](./003-dto-design-and-graphql-evaluation-adr.md)
> - [002: 3-Cluster & Flexible Tenancy Architecture](../database/002-3-cluster-and-flexible-tenancy-architecture.md)
> - [010: Docker Compose Environments Guide](../database/010-docker-compose-3layer-vs-mongo-cluster-guide.md)

---

## 1. Context & Problem Statement

Following the architectural decision to build the core EDC API using **ASP.NET Core 9.0 (.NET 9 LTS)** alongside the **Angular 21 (Signals)** frontend in our Nx workspace, we evaluated how to manage source code, Git repositories, team workflows, and regulatory documentation:

### The Architectural Dilemma:
Should the .NET backend API live as:
1. **Option A: A Git Submodule** (a separate Git repository linked via a Git commit pointer into the parent workspace), OR
2. **Option B: A Dedicated Top-Level Folder (`backend/api/`)** within a **Unified Monorepo**?

### Real-World Team & Operational Context:
Our architectural evaluation explicitly accounts for the following real-world organizational realities:
- **Team Specialization**: Backend engineers and frontend engineers may be separate team members working in different IDEs (Visual Studio/Rider vs. VS Code).
- **Independent Deployments**: UI releases (e.g. static bundles to Cloudflare CDN/S3) and API releases (e.g. Docker containers to Kubernetes) deploy on independent schedules; pushing a UI bug fix must never trigger an API redeployment, and vice-versa.
- **Independent CI/CD Pipelines**: Automated test and build pipelines for .NET must run independently of npm/Angular build pipelines.

---

## 2. Decision Summary

We **accept Option B: Unified Monorepo with a Dedicated `backend/` Folder Hierarchy**, and **reject Git Submodules**.

Specifically:
1. **The .NET API Solution is located at `backend/api/Vialiq.Api.sln`**: We place the solution in `backend/api/` (rather than under `apps/`) to provide room for future backend solutions (e.g., `backend/workers/` for CDISC exports, `backend/ai-engine/`).
2. **Independent CI/CD via Path Filtering**: We implement path-filtered CI/CD workflows so that frontend and backend builds, tests, and deployments remain 100% decoupled.
3. **Intentional Model Asymmetry & `@vialiq/automapper` Boundary Projection**: 
   - In accordance with [ADR 005 (Intentional Model Asymmetry)](../../critical-problems-and-adrs/005-model-decoupling-and-intentional-asymmetry-adr.md), **we formally reject NSwag, code-generation drift tooling, and synthetic 1:1 contract parity**.
   - Clinical EDC payloads are metadata-driven (`formData: Record<string, unknown>`). The wire contract between Kestrel and Angular consists exclusively of stable, minimal transport envelopes (`FormSubmissionDto`, `FormLockDto`, `AuditQueryDto`).
   - **Boundary Mapping via `@vialiq/automapper`**: We authored our own in-house mapping engine ([`@vialiq/automapper`](../../../libs/automapper)) to bridge interactive UI View Models (Tier 1) and transport envelopes (Tier 2). Internal Angular component state and reactive signals remain completely decoupled from wire payloads.

---

## 3. Why Git Submodules Were Evaluated & Rejected

Git submodules are frequently considered by teams with separate frontend and backend developers to maintain isolated Git histories. However, a rigorous engineering and regulatory analysis reveals that **Git submodules introduce high synchronization friction, developer traps, and audit overhead** with zero functional benefit.

```
                         SUBMODULE VS. MONOREPO COMPARISON
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
Git Submodule (Rejected)                                         Unified Monorepo (Accepted)
• 2 Repositories + 1 Pointer SHA                                 • 1 Repository with backend/api/
• Unpushed Submodule Trap ("reference is not a tree")            • Atomic Breaking Change Detection
• Detached HEAD commits                                          • Shared Golden Validation Parity Suite
• Two-PR Dance for every DTO change                              • Single Immutable SHA for 21 CFR Part 11
• Fragmented Documentation in 2 places                           • Single Source of Truth in docs/
```

---

### Detailed Analysis: The 5 Failure Modes of Git Submodules

#### 1. The "Unpushed Submodule" Trap (The #1 CI/CD Killer)
* **How Git Submodules Work Under the Hood**: The parent repo (`nx`) does not store files from the child repo. It stores a single 20-byte SHA-1 hash (`gitlink` mode `160000`).
* **The Failure Mode**: A backend developer commits a fix in `backend/` (`commit SHA: 8a9b1c`). In the parent repo, Git records the new pointer. The developer pushes the parent repo, but **forgets to push the submodule repo first**.
* **The Consequence**: When CI/CD or another developer pulls the parent repo, Git attempts to check out commit `8a9b1c` from the remote backend repository. Because it was never pushed to the remote, the build crashes fatally with:  
  `fatal: reference is not a tree: 8a9b1c`

#### 2. The "Detached HEAD" Hazard
* When developers clone a repository with submodules or switch branches in the parent repo, Git checks out the submodule at the recorded commit hash.
* In Git, checking out a raw commit hash automatically places the repository in **Detached HEAD** state.
* If a developer begins writing code in `backend/` without explicitly running `git checkout main`, their commits are orphaned on a detached commit. Subsequent parent branch checkouts or `git submodule update` commands cause those commits to disappear from standard `git log` view, leading to lost work and developer frustration.

#### 3. The "Two-PR Dance" (Killing Cross-Team Velocity)
Consider a common clinical EDC feature: *Adding an `investigatorNpiNumber` to the Principal Investigator sign-off flow.*
* **With a Submodule (2 Repos)**:
  1. Backend dev creates branch `feature/npi` in the backend repo $\rightarrow$ commits $\rightarrow$ opens **PR #1 (Backend Repo)**.
  2. Team reviews, approves, and merges PR #1 into `main` of the backend repo.
  3. Frontend dev opens parent repo $\rightarrow$ runs `git submodule update --remote` to advance the commit pointer.
  4. Regenerates TypeScript contracts in the parent repo.
  5. Updates Angular UI component.
  6. Commits UI changes + submodule pointer bump $\rightarrow$ opens **PR #2 (Parent Repo)**.
  7. Team reviews and merges PR #2.
  *Result:* A simple contract update requires coordinating two separate Pull Requests, two review cycles, and careful merge order synchronization.
* **With a Monorepo (`backend/api/`)**:
  1. Backend DTO + Angular UI component + `@vialiq/automapper` profile are updated in **1 single branch**.
  2. **1 Pull Request $\rightarrow$ 1 Review $\rightarrow$ Atomic Merge.** Zero cross-repo coordination.

#### 4. The 21 CFR Part 11 & GAMP 5 Regulatory Traceability Penalty
In pharmaceutical clinical trials, the FDA, EMA, and Sponsor QA auditors inspect **Software Qualification Traceability**:
> *"Show us the exact, immutable system snapshot that was qualified and used to collect patient data for Study ONCOLOGY-101."*

* **In a Submodule Architecture**: You must audit and defend two separate Git repositories with two independent commit histories, prove that the parent repo pointer correctly matched the child repo commit, and demonstrate that the child repository's Git history was never rebased or altered independently.
* **In a Unified Monorepo**: **One single Git Commit SHA** (e.g. `sha: 4a8f9b2`) cryptographically locks down the exact MongoDB 3-layer cluster schema, the exact .NET API code, the exact Angular UI, and the exact validation test suite that ran the trial.

#### 5. Documentation & Knowledge Fragmentation ("The 2 Places Problem")
When repositories are split, documentation inevitably splits. Backend engineers maintain architecture notes in the backend repo or a wiki; frontend engineers maintain theirs in the frontend repo. Over time, database connection guides, locking protocols, and API endpoint contracts drift apart. In our monorepo, **`docs/` is the single source of truth** for all engineering disciplines.

---

## 4. The 5 Decisive Justifications for the Unified Monorepo

Even with separate team members, independent CI/CD, and decoupled deployments, the Unified Monorepo is decisively superior for the following reasons:

### Justification 1: "Shift-Left" Breaking Contract Detection via `@vialiq/automapper`
* In separate repos, if a backend engineer renames a property or changes an enum in a wire payload (e.g. `QueryStatus.OPEN` to `QueryStatus.UNRESOLVED`), their backend CI pipeline passes with flying colors. The breakage is only discovered later when the frontend team pulls the changes or when QA encounters a runtime crash.
* In our unified monorepo, both the backend endpoints and frontend mapping profiles live together. When a backend transport envelope is updated, the Angular application's strongly-typed [`@vialiq/automapper`](../../../libs/automapper) profiles immediately flag the type mismatch during PR compilation:
  ```typescript
  // Type error caught immediately in CI if backend renames 'reasonForChange' -> 'auditReason'
  addProfile<CrfFormUiState, FormSubmissionDto>(crfMapper, 'CrfUiStateToSubmitDto', (rule) => {
    rule.forMember('reasonForChange', mapFrom(src => src.reasonForChange)); 
    // TS2345: Property 'reasonForChange' does not exist on type 'FormSubmissionDto'!
  });
  ```
  The TypeScript compiler catches breaking contract changes at the mapping boundary before PRs are ever merged or deployed, without requiring fragile NSwag code generators or synthetic contract drift tooling ([ADR 005](../../critical-problems-and-adrs/005-model-decoupling-and-intentional-asymmetry-adr.md)).

### Justification 2: The Golden Parity Test Suite (`parity-tests.json`)
* In [003-dto-design-and-graphql-evaluation-adr.md](./003-dto-design-and-graphql-evaluation-adr.md), we established a shared test suite of 500+ clinical edit-check rules (`parity-tests.json`).
* Both the **Angular Vitest suite** (`libs/form-builder-validation`) and the **.NET xUnit suite** (`backend/api/tests/Vialiq.Validation.Tests`) must execute this *exact same file*.
* In a monorepo, `parity-tests.json` lives in a shared location that both test runners execute on every commit, guaranteeing 100% mathematical parity without copying files across repos.

### Justification 3: Shared Infrastructure & Single-Command Onboarding
* Our local 3-Layer MongoDB Cluster ([docker-compose.3layer.yml](../../../tools/docker/docker-compose.3layer.yml)) lives in `tools/docker/`.
* Any new developer—whether backend, frontend, or QA—clones one repository, runs `npm run docker:mongo:all`, and has the entire database tier, API, and UI operational in minutes.

### Justification 4: Independent CI/CD is Native in Monorepos (Path Filtering)
A monorepo does **not** mean monolithic deployments. We configure modern CI/CD path filters to ensure complete deployment independence:

```yaml
# .github/workflows/api-deploy.yml (Deploys API to Kubernetes / Docker)
name: Deploy Backend API
on:
  push:
    branches: [main]
    paths:
      - 'backend/api/**' # Only redeploys if API code changes

# .github/workflows/ui-deploy.yml (Deploys UI to Cloudflare / S3 CDN)
name: Deploy Frontend UI
on:
  push:
    branches: [main]
    paths:
      - 'apps/**'
      - 'libs/form-renderer/**'
      - 'libs/web-components/**' # Only redeploys if UI code changes
```

* Pushing a UI CSS fix **never** triggers an API build or deployment.
* Pushing an API performance fix **never** triggers a frontend build or deployment.

### Justification 5: Future-Proof Multi-Solution Backend Hierarchy (`backend/api/`)
By creating a dedicated `backend/api/` folder (rather than putting the API under `apps/`), the repository provides clean room for future backend services:
- `backend/api/` $\rightarrow$ Core transactional Web API (`Vialiq.Api.sln`).
- `backend/workers/` $\rightarrow$ Background BullMQ / Hangfire worker for CDISC ODM batch exports.
- `backend/ai-engine/` $\rightarrow$ AI anomaly detection and clinical query auto-generation service.

---

## 5. Resulting Repository Structure

```
/Users/prashantgupta/code/nx/
├── apps/                                  # Frontend Applications (Angular 21 / Lit 3)
│   ├── shell/                             # Angular Host Application
│   └── form-builder/                      # Angular Form Builder UI
│
├── backend/                               # Dedicated Backend Tier (Multi-Solution Ready)
│   └── api/                               # Core Web API Solution Root
│       ├── Vialiq.Api.sln                 # Visual Studio / Rider Solution File
│       ├── Directory.Build.props          # Central TargetFramework net9.0 & Analyzer Rules
│       ├── Directory.Packages.props       # Central Package Management (CPM)
│       ├── src/
│       │   ├── Vialiq.Core/               # Domain Models, Aggregates, Enums, Interfaces
│       │   ├── Vialiq.Validation/         # C# JsonLogic Engine & AST Evaluator
│       │   ├── Vialiq.Infrastructure/     # MongoDB 3-Layer Drivers, CSFLE, Key Vault
│       │   ├── Vialiq.Caching/            # Redis Cluster HA, Mutex & Scoped Caching Tier
│       │   └── Vialiq.Api/                # Host Web API (Controllers, Kestrel, SignalR)
│       └── tests/
│           ├── Vialiq.Validation.Tests/   # Golden Parity Test Suite (json-logic parity)
│           ├── Vialiq.Caching.Tests/      # Redis Sentinel Failover & Stampede Mutex Tests
│           └── Vialiq.Api.Tests/          # WebApplicationFactory Integration Tests
│
├── libs/                                  # Shared Libraries
│   ├── automapper/                        # @vialiq/automapper (TypeScript Model & Envelope Mapper)
│   ├── form-renderer/                     # Angular Form Renderer Component
│   ├── form-builder/                      # Angular Form Builder Component & Palette
│   └── web-components/                    # Lit 3 Core UI Components (<vi-*>)
│
├── docs/                                  # Single Source of Truth
│   ├── backend-architecture/
│   │   ├── database/                      # 10 Database Architecture Specs & Docker Guides
│   │   └── api/                           # API ADRs, Swagger Specs & .NET Blueprints
│   └── compliance/                        # 21 CFR Part 11, GAMP 5, and ICH E6(R3)
│
└── tools/
    └── docker/                            # docker-compose.3layer.yml & redis-dev.yml
```

---

## 6. Verification & Build Status

The `backend/api/Vialiq.Api.sln` solution and all 8 projects have been initialized, linked, and verified on Apple Silicon (macOS ARM64):

```bash
dotnet build backend/api/Vialiq.Api.sln
```
* **Target Framework:** .NET 9.0 LTS (`net9.0`)
* **Projects Compiled:** 8 of 8 (`Vialiq.Core`, `Vialiq.Validation`, `Vialiq.Infrastructure`, `Vialiq.Caching`, `Vialiq.Api`, `Vialiq.Validation.Tests`, `Vialiq.Caching.Tests`, `Vialiq.Api.Tests`)
* **Build Result:** ✅ **0 Warning(s), 0 Error(s)**
