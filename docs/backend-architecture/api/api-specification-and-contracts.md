# EDC API Specification & Endpoint Contracts

> **Domain:** Backend Architecture — API Layer  
> **Status:** Active Specification  
> **Date:** October 15, 2026  
> **Version:** 1.0.0  
> **Related Documents:**
> - [ADR: API Framework & Architecture Strategy](./001-api-architecture-adr.md)
> - [Database Specification](../database/database-architecture-specification.md)
> - [Form Builder Validation & Edit Checks](../../form-builder-validation.md)
> - [Field-Level Encryption Specification](../../field-level-encryption-clinical-edc.md)

---

## 1. API Architecture Overview

The Vialiq EDC API is built with **NestJS** as a **Modular Monolith**. It exposes a **RESTful OpenAPI 3.0** interface for state operations and a **WebSocket Gateway** for real-time presence, field-locking, and live discrepancy monitoring.

```
┌─────────────────────────────────────────────────────────────┐
│                 Client Applications (Angular / Lit 3)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / WSS
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Gateway & Middleware Layer              │
│  - JWT & OAuth2 Bearer Auth                                 │
│  - 21 CFR Part 11 Session Inactivity Timeout Guard (15 min) │
│  - Tenant & Study Scope Guard                               │
│  - Global DTO Validation Pipe (class-validator / Zod)       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    NestJS Core EDC Modules                  │
│                                                             │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Study & Site Module    │   │ Form Definition Module   │  │
│  │ - Sites, Investigators │   │ - Schema CRUD, Versioning│  │
│  └────────────────────────┘   └──────────────────────────┘  │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Clinical Data Module   │   │ Validation Engine Module │  │
│  │ - Auto-Save, Submit    │   │ - json-logic-js runner   │  │
│  └────────────────────────┘   └──────────────────────────┘  │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ Query (Discrepancy) Mod│   │ Audit Trail Module       │  │
│  │ - Raise, Answer, Close │   │ - 21 CFR Part 11 Ledger  │  │
│  └────────────────────────┘   └──────────────────────────┘  │
│  ┌────────────────────────┐   ┌──────────────────────────┐  │
│  │ E-Signature Module     │   │ Export & CDISC Module    │  │
│  │ - Double-Auth Signing  │   │ - ODM-XML, SAS, CSV      │  │
│  └────────────────────────┘   └──────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
                  MongoDB Data Access Layer
```

---

## 2. Security, Authentication & 21 CFR Part 11 Middleware

### 2.1 Role-Based Access Control (RBAC)
Every endpoint is guarded by a role requirement:
- `CRC`: Clinical Research Coordinator (Site data entry, query answers)
- `CRA`: Clinical Research Associate / Monitor (SDV verification, raise queries, freeze forms)
- `PI`: Principal Investigator (Sign forms, answer clinical queries)
- `DM`: Data Manager (Edit checks, lock database, close queries, bulk operations)
- `AUDITOR`: Regulatory / Sponsor Auditor (Read-only access to subjects, forms, and audit logs)

### 2.2 Inactivity Session Timeout Guard (§ 11.10(a))
To comply with FDA 21 CFR Part 11:
- JWT access tokens have a short expiration window (15 minutes).
- Any request received after 15 minutes of user inactivity returns `HTTP 401 Unauthorized` with error code `SESSION_TIMEOUT`.
- The client UI initiates an automatic screen freeze prompting re-authentication.

---

## 3. REST API Endpoint Contracts

### 3.1 Form Definition Endpoints (`/api/v1/forms`)

#### `GET /api/v1/studies/:studyId/forms`
List all active form schemas for a study.
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

#### `GET /api/v1/forms/:formId`
Fetch the complete Form Builder JSON schema.
- **Roles:** All authenticated roles
- **Response:** Returns `FormDefinitionDocument` including `components` and `validationRules`.

#### `POST /api/v1/studies/:studyId/forms`
Save a new draft form definition authored in the Form Builder.
- **Roles:** `DM`, `ADMIN`
- **Request Body:** Form schema payload matching `FormSchema`.

#### `PUT /api/v1/forms/:formId/publish`
Publish a draft form version to make it active for subject data collection.
- **Roles:** `DM`, `ADMIN`
- **Response:** `HTTP 200 OK` (monotonically increments active version).

---

### 3.2 Clinical Data Capture (`/api/v1/data-capture`)

#### `GET /api/v1/subjects/:subjectId/visits/:visitId/forms/:formKey`
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

#### `PUT /api/v1/crf-entries/:crfId/auto-save`
Debounced background draft save while typing (does not trigger audit reason requirements).
- **Roles:** `CRC`
- **Request Body:**
  ```json
  {
    "delta": { "systolic": 122 }
  }
  ```
- **Response:** `HTTP 200 OK`

#### `POST /api/v1/crf-entries/:crfId/submit`
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

#### `POST /api/v1/crf-entries/:crfId/lock`
Lock a form to prevent further site edits during monitor review or database freeze.
- **Roles:** `CRA`, `DM`, `ADMIN`
- **Request Body:** `{ "reason": "MONITOR_REVIEW" }`

---

### 3.3 Clinical Discrepancy (Query) Workflow (`/api/v1/queries`)

#### `GET /api/v1/crf-entries/:crfId/queries`
List all queries (open and closed) associated with a CRF instance.
- **Roles:** `CRC`, `CRA`, `PI`, `DM`

#### `POST /api/v1/queries`
Raise a manual discrepancy query against a specific field.
- **Roles:** `CRA`, `DM`
- **Request Body:**
  ```json
  {
    "crfEntryId": "crf_789",
    "fieldKey": "systolic",
    "queryText": "Blood pressure exceeds protocol screening threshold. Please verify against source document."
  }
  ```

#### `PUT /api/v1/queries/:queryId/answer`
Site coordinator answers the query.
- **Roles:** `CRC`, `PI`
- **Request Body:**
  ```json
  {
    "message": "Verified against clinic chart. Subject was re-tested 15 minutes later and value confirmed."
  }
  ```

#### `PUT /api/v1/queries/:queryId/close`
Monitor or Data Manager closes the query after reviewing the answer.
- **Roles:** `CRA`, `DM`
- **Request Body:** `{ "resolution": "Query answered satisfactorily" }`

---

### 3.4 Audit Trail (`/api/v1/audit-trail`)

#### `GET /api/v1/crf-entries/:crfId/audit-trail`
Fetch the complete chronological, field-level audit trail for a CRF.
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

---

### 3.5 Electronic Signatures (`/api/v1/signatures`)

#### `POST /api/v1/crf-entries/:crfId/sign`
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

## 4. Real-Time WebSocket Gateway (`/ws/edc`)

The WebSocket Gateway is implemented with `@nestjs/websockets` (Socket.io) backed by a Redis pub/sub adapter:

### 4.1 Room Subscriptions
Clients join rooms scoped to the active form:
- Room format: `study:{studyId}:crf:{crfId}`

### 4.2 Events & Payloads

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `crf:acquire_lock` | Client ➔ Server | `{ crfId, userId }` | Requests an exclusive editing lease (5-min TTL in Redis). |
| `crf:lock_acquired` | Server ➔ Room | `{ crfId, lockedBy: "Dr. Smith", expiresAt }` | Broadcast to all clients viewing the form. |
| `crf:release_lock` | Client ➔ Server | `{ crfId }` | Releases the lock when user navigates away. |
| `query:created` | Server ➔ Room | `{ queryId, fieldKey, queryText }` | Instantly highlights the field on the active coordinator's screen. |
| `query:resolved` | Server ➔ Room | `{ queryId, fieldKey }` | Removes the discrepancy warning icon in real time. |

---

## 5. Validation Engine Execution Pipeline

The server-side validation pipeline executes `json-logic-js` edit checks identically to the client:

```typescript
@Injectable()
export class ValidationEngineService {
  /**
   * Executes form edit checks on candidate data submission
   */
  async validateCrfPayload(
    rules: FormRuleDescriptor[],
    data: Record<string, unknown>
  ): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (const ruleDesc of rules) {
      // Execute JSON Logic rule against form payload
      const isValid = jsonLogic.apply(ruleDesc.rule, data);
      
      if (!isValid) {
        errors.push({
          ruleId: ruleDesc.id,
          fieldKey: ruleDesc.targetFieldKey,
          severity: ruleDesc.severity,
          message: ruleDesc.errorMessage
        });
      }
    }

    return errors;
  }
}
```
