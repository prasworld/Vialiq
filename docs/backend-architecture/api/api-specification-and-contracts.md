# EDC API Specification & Endpoint Contracts

> **Domain:** Backend Architecture — API Layer  
> **Status:** Active Specification (Aligned with ASP.NET Core 9.0 Clean Architecture)  
> **Date:** November 7, 2026  
> **Version:** 2.0.0  
> **Target Systems:** ASP.NET Core 9.0 (`backend/api/src/Vialiq.Api`), Angular 21 Host (`apps/shell/`), Form Renderer (`libs/form-renderer`)  
> **Related Documents:**
> - [ADR 001: EDC API Architecture & Technology Stack](./001-api-architecture-adr.md)
> - [ADR 003: DTO Architecture Strategy & Rejection of GraphQL](./003-dto-design-and-graphql-evaluation-adr.md)
> - [ADR 004: Unified Monorepo Architecture vs. Git Submodules](./004-repository-architecture-monorepo-vs-submodule-adr.md)
> - [ADR 005: Hybrid Context, GxP Override Engine, and Real-Time SignalR](./005-api-foundations-auth-override-engine-and-realtime-adr.md)
> - [ADR 006: API Controller Conventions, Seeding & Migration](./006-api-controller-conventions-seeding-and-migration-adr.md)
> - [Scale 003: TLS Wildcard Certificates & Custom Vanity Domains](../../scaling-architecture/003-tls-wildcard-certificates-and-custom-domains.md)
> - [Database Architecture: 3-Cluster & Flexible Tenancy](../database/002-3-cluster-and-flexible-tenancy-architecture.md)

---

## 1. API Architecture Overview

The Vialiq EDC API is built on **ASP.NET Core 9.0 (.NET 9 C#)** adhering to strict **Clean Architecture** patterns (`backend/api/src/Vialiq.Api`). It exposes a **RESTful OpenAPI 3.0** interface with IETF `QUERY` extensions for state operations and dual **SignalR Hubs** (`EdcCollaborationHub`, `PlatformNotificationHub`) backed by Redis Cluster for real-time query discrepancy updates, platform job notifications, and future form-level lock state announcements (`ADR 003`).

```
┌─────────────────────────────────────────────────────────────┐
│          Client Applications (Angular 21 / Lit 3)           │
│  - Reactive Signals & In-Memory Store                       │
│  - @vialiq/automapper Boundary Projection                   │
│  - SignalR TypeScript Client (/hubs/edc, /hubs/notifications)│
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / WSS (Zero Study in Hostname)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              ASP.NET Core 9 Pipeline & Middleware           │
│  - JWT Bearer Authentication & Cryptographic Signature Check│
│  - 21 CFR Part 11 Session Inactivity Timeout Guard (15 min) │
│  - Hybrid Context Resolution (X-Tenant-Id, X-Study-Id, Env) │
│  - GxP Challenge-Response Override Filter (HTTP 428)        │
│  - FluentValidation & Rate Limiting                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│              Vialiq Clean Architecture Solution              │
│                                                             │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Study & Site Module    │   │ Form Definition Module   │  │
│  │ - Sites, Investigators │   │ - Schema CRUD, Versioning│  │
│  └────────────────────────┘   └──────────────────────────┘  │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Clinical Data Module   │   │ Validation Engine Module │  │
│  │ - Auto-Save, Submit    │   │ - JsonLogic.Net runner   │  │
│  └────────────────────────┘   └──────────────────────────┘  │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Query (Discrepancy) Mod│   │ Audit Trail Ledger       │  │
│  │ - Raise, Answer, Close │   │ - 21 CFR Part 11 Chains  │  │
│  └────────────────────────┘   └──────────────────────────┘  │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ E-Signature Module     │   │ Real-Time SignalR Hubs   │  │
│  │ - Double-Auth Signing  │   │ - Redis HA Backplane     │  │
│  └────────────────────────┘   └──────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Data Access & Storage Tier                    │
│  - MongoDB 3-Cluster (Admin rs-admin, Dev rs-dev, Prod rs)  │
│  - Client-Side Field-Level Encryption (CSFLE via AWS KMS)   │
│  - Redis Cluster High-Availability (Form Locks & Pub/Sub)   │
│  - SQL Server CDC Warehouse (Relational Analytics Pipeline) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Security, Authentication & 21 CFR Part 11 Middleware

### 2.1 Hybrid Security & Context Resolution Engine
In alignment with [ADR 005](./005-api-foundations-auth-override-engine-and-realtime-adr.md) and [Scale 003](../../scaling-architecture/003-tls-wildcard-certificates-and-custom-domains.md):
- **Hostnames strictly identify the tenant**: `https://novartis.vialiq.com` or custom enterprise vanity `https://edc.novartis.com`. Under no circumstances does the clinical study identifier appear in the URL hostname or path.
- **JWT Bearer Token**: Provides user identity, roles, cryptographic tenancy signature, and security stamps.
- **Operational Headers**: Provide runtime scope without brittle path hierarchies:
  - `X-Tenant-Id`: Tenant boundary (validated against JWT claims).
  - `X-Study-Id`: Active clinical trial identifier (selected via in-app global switcher).
  - `X-Environment`: Execution environment (`prod`, `dev`, `uat`).
  - `X-Correlation-Id`: Distributed tracing GUID.

### 2.2 Role-Based Access Control (RBAC)
Every endpoint enforces granular role requirements via `[Authorize(Roles = "...")]`:
- `CRC`: Clinical Research Coordinator (Site data entry, auto-save, answer queries)
- `CRA`: Clinical Research Associate / Monitor (SDV verification, raise queries, freeze forms)
- `PI`: Principal Investigator (Electronic signature, answer clinical queries)
- `DM`: Data Manager (Edit checks, lock database, close queries, bulk operations)
- `AUDITOR`: Regulatory / Sponsor Auditor (Read-only access to subjects, forms, and audit trail ledgers)

### 2.3 Inactivity Session Timeout Guard (§ 11.10(a))
To comply with FDA 21 CFR Part 11:
- JWT access tokens have a short expiration window (15 minutes).
- Requests received after 15 minutes of user inactivity return `HTTP 401 Unauthorized` with error code `SESSION_TIMEOUT`.
- The Angular client initiates an in-place session lock modal prompting re-authentication without losing unsaved reactive form state.

### 2.4 GxP Challenge-Response Override Protocol (HTTP 428)
Per [ADR 005](./005-api-foundations-auth-override-engine-and-realtime-adr.md), when an action requires clinical justification, electronic re-authentication (§ 11.200), protocol deviation clearance, or dual authorization ("Four-Eyes Principle"):
1. API halts execution and returns `HTTP 428 Precondition Required` with an `OverrideChallengeDto`.
2. The Angular host intercepts the 428 status and dynamically slides out the corresponding GxP Sidepanel.
3. The user provides required credentials or justification, and re-dispatches the request with an `X-GxP-Override-Token` header.

---

## 3. REST API Endpoint Contracts

All clinical endpoints reside under `/api/v1/edc/` and operate within the scope of the caller's `X-Tenant-Id` and `X-Study-Id` context headers.

### 3.1 Form Definition Endpoints (`/api/v1/edc/forms`)

#### `GET /api/v1/edc/forms`
List all active form schemas for the active study.
- **Context Headers:** `X-Study-Id`, `X-Environment`
- **Roles:** All authenticated roles
- **Response:**
  ```json
  [
    {
      "id": "form_def_101",
      "formKey": "VITAL_SIGNS",
      "version": 2,
      "status": "ACTIVE",
      "title": "Vital Signs",
      "effectiveDate": "2026-06-01T00:00:00Z"
    }
  ]
  ```

#### `GET /api/v1/edc/forms/{formId}`
Fetch the complete Form Builder JSON schema.
- **Context Headers:** `X-Study-Id`
- **Roles:** All authenticated roles
- **Response:** Returns `FormDefinitionDocument` including `components` and `validationRules`.

#### `POST /api/v1/edc/forms`
Save a new draft form definition authored in the Form Builder.
- **Context Headers:** `X-Study-Id`
- **Roles:** `DM`, `ADMIN`
- **Request Body:** Form schema payload matching `FormSchema`.

#### `PUT /api/v1/edc/forms/{formId}/publish`
Publish a draft form version to make it active for subject data collection.
- **Context Headers:** `X-Study-Id`
- **Roles:** `DM`, `ADMIN`
- **Response:** `HTTP 200 OK` (monotonically increments active version).

---

### 3.2 Clinical Data Capture (`/api/v1/edc/data-capture`)

#### `GET /api/v1/edc/subjects/{subjectId}/visits/{visitId}/forms/{formKey}`
Fetch a subject's CRF entry data for a visit.
- **Roles:** `CRC`, `CRA`, `PI`, `DM`, `AUDITOR`
- **Response:**
  ```json
  {
    "crfId": "crf_789",
    "status": "IN_PROGRESS",
    "formVersion": 2,
    "data": {
      "systolic": 120,
      "diastolic": 80,
      "heartRate": 72
    },
    "lockStatus": { "isLocked": false },
    "openQueryCount": 0
  }
  ```

#### `PUT /api/v1/edc/crfs/{crfId}/auto-save`
Debounced background draft save while typing (does not trigger audit reason requirements).
- **Roles:** `CRC`
- **Request Body:**
  ```json
  {
    "delta": { "systolic": 122 }
  }
  ```
- **Response:** `HTTP 200 OK`

#### `POST /api/v1/edc/crfs/{crfId}/submit`
Formal clinical data submission. Enforces 21 CFR Part 11 audit reason and executes edit checks.
- **Roles:** `CRC`, `PI`
- **Request Body:**
  ```json
  {
    "data": {
      "systolic": 122,
      "diastolic": 82
    },
    "reasonForChange": "Corrected transcription error from source medical record"
  }
  ```
- **Response:**
  ```json
  {
    "status": "COMPLETED",
    "queriesRaised": 0,
    "auditEntryIds": ["audit_abc123"]
  }
  ```

#### `POST /api/v1/edc/crfs/{crfId}/lock`
Lock a form to prevent further site edits during monitor review or database freeze.
- **Roles:** `CRA`, `DM`, `ADMIN`
- **Request Body:** `{ "reason": "MONITOR_REVIEW" }`

---

### 3.3 Clinical Discrepancy (Query) Workflow (`/api/v1/edc/queries`)

#### `GET /api/v1/edc/crfs/{crfId}/queries`
List all queries associated with a CRF instance.
- **Roles:** `CRC`, `CRA`, `PI`, `DM`

#### `POST /api/v1/edc/queries`
Raise a manual discrepancy query against a specific field.
- **Roles:** `CRA`, `DM`
- **Request Body:**
  ```json
  {
    "crfId": "crf_789",
    "fieldKey": "systolic",
    "queryText": "Blood pressure exceeds protocol screening threshold. Please verify against source document."
  }
  ```

#### `PUT /api/v1/edc/queries/{queryId}/answer`
Site coordinator answers the query.
- **Roles:** `CRC`, `PI`
- **Request Body:**
  ```json
  {
    "message": "Verified against clinic chart. Subject was re-tested 15 minutes later and value confirmed."
  }
  ```

#### `PUT /api/v1/edc/queries/{queryId}/close`
Monitor or Data Manager closes the query after reviewing the answer.
- **Roles:** `CRA`, `DM`
- **Request Body:** `{ "resolution": "Query answered satisfactorily" }`

#### `[HttpQuery] /api/v1/edc/queries/search`
Per [ADR 006](./006-api-controller-conventions-seeding-and-migration-adr.md), searches queries using complex criteria without URL truncation or PHI leakage.
- **Roles:** `CRA`, `DM`, `AUDITOR`
- **Request Body:** `QueryFilterCriteriaDto`

---

### 3.4 Audit Trail Ledger (`/api/v1/edc/audit-trail`)

#### `GET /api/v1/edc/crfs/{crfId}/audit-trail`
Fetch chronological, field-level audit trail for a CRF.
- **Roles:** All authenticated roles
- **Response:**
  ```json
  [
    {
      "timestamp": "2026-10-15T08:30:00Z",
      "fieldKey": "systolic",
      "oldValue": 120,
      "newValue": 122,
      "reasonForChange": "Corrected transcription error",
      "userName": "Jane Doe, CRC",
      "recordHash": "a8f3b...89c"
    }
  ]
  ```

#### `[HttpQuery] /api/v1/edc/audit-trail/search`
Per [ADR 006](./006-api-controller-conventions-seeding-and-migration-adr.md), high-volume regulatory audit search with cryptographic verification.
- **Roles:** `DM`, `AUDITOR`
- **Request Body:** `AuditSearchCriteriaDto`

---

### 3.5 Electronic Signatures (`/api/v1/edc/signatures`)

#### `POST /api/v1/edc/crfs/{crfId}/sign`
Principal Investigator signs the Case Report Form (21 CFR Part 11 double-authentication).
- **Roles:** `PI`, `SUB_INVESTIGATOR`
- **Request Body:**
  ```json
  {
    "password": "UserPassword123!",
    "signaturePin": "9842",
    "meaning": "APPROVAL",
    "statement": "I certify that the information entered is accurate, complete, and verified."
  }
  ```
- **Response:**
  ```json
  {
    "signatureId": "sig_554",
    "signedAt": "2026-10-15T09:15:00Z",
    "status": "SIGNED"
  }
  ```

---

## 4. Real-Time SignalR Hub Architecture (`/hubs/edc`, `/hubs/notifications`)

Per [ADR 005](./005-api-foundations-auth-override-engine-and-realtime-adr.md), real-time collaboration is partitioned into two specialized ASP.NET Core SignalR hubs backed by a Redis Cluster backplane:

### 4.1 Topology

1. **`EdcCollaborationHub` (`/hubs/edc`)**:
   - Manages interactive CRF workspace notifications, real-time clinical query/discrepancy badges, and `[FUTURE TO-DO]` form-level lock state broadcasts (`FormLockStateChanged` per [ADR 003](../../critical-problems-and-adrs/003-realtime-signalr-reconnection-and-field-lease-reconciliation-adr.md); fine-grained field-level leases are explicitly rejected).
   - Room format: `tenant:{tenantId}:study:{studyId}:form:{formId}`
2. **`PlatformNotificationHub` (`/hubs/notifications`)**:
   - Pushes asynchronous system events, CDISC batch export status, discrepancy assignments, and regulatory broadcast alerts.
   - User group format: `tenant:{tenantId}:user:{userId}`

### 4.2 Events & Payloads

| Event Name | Hub | Direction | Payload | Description |
|---|---|---|---|---|
| `FormLockStateChanged` `[FUTURE TO-DO]` | Collaboration | Server ➔ Room | `{ crfId, status, lockedBy, expiresAt }` | Broadcasts form-level lock acquire/release/break transitions to refresh Clinical Workspace card badges without polling. |
| `QueryRaised` | Collaboration | Server ➔ Room | `{ queryId, fieldKey, queryText }` | Instantly highlights discrepancy warning icon. |
| `QueryResolved` | Collaboration | Server ➔ Room | `{ queryId, fieldKey }` | Removes discrepancy warning icon in real time. |
| `JobCompleted` | Notification | Server ➔ User | `{ jobId, downloadUrl, status }` | Alerts user when background CDISC ODM export completes. |

---

## 5. Validation Engine Execution Pipeline

The server-side validation pipeline executes `JsonLogic.Net` with custom clinical operator extensions in `backend/api/src/Vialiq.Validation/`, guaranteeing deterministic parity with the Angular client engine:

```csharp
namespace Vialiq.Validation.Services;

using JsonLogic.Net;
using Vialiq.Domain.Models;

public interface IValidationEngineService
{
    Task<IReadOnlyList<ValidationErrorDto>> ValidateCrfPayloadAsync(
        IEnumerable<FormRuleDescriptor> rules,
        Dictionary<string, object> data,
        CancellationToken cancellationToken = default);
}

public sealed class ValidationEngineService : IValidationEngineService
{
    private readonly JsonLogicEvaluator _evaluator;

    public ValidationEngineService(JsonLogicEvaluator evaluator)
    {
        _evaluator = evaluator;
    }

    public Task<IReadOnlyList<ValidationErrorDto>> ValidateCrfPayloadAsync(
        IEnumerable<FormRuleDescriptor> rules,
        Dictionary<string, object> data,
        CancellationToken cancellationToken = default)
    {
        var errors = new List<ValidationErrorDto>();

        foreach (var ruleDesc in rules)
        {
            var isValid = _evaluator.Apply(ruleDesc.RuleJson, data);
            if (isValid is false or null)
            {
                errors.Add(new ValidationErrorDto
                {
                    RuleId = ruleDesc.Id,
                    FieldKey = ruleDesc.TargetFieldKey,
                    Severity = ruleDesc.Severity,
                    Message = ruleDesc.ErrorMessage
                });
            }
        }

        return Task.FromResult<IReadOnlyList<ValidationErrorDto>>(errors);
    }
}
```
