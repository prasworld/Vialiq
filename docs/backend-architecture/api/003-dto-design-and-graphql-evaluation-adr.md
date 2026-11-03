# ADR: DTO Architecture Strategy & Rejection of GraphQL in Favor of REST + BFF

> **Document ID:** `VIALIQ-ARCH-API-003`  
> **Domain:** Backend Architecture — API Layer  
> **Status:** Accepted  
> **Date:** October 19, 2026  
> **Author:** Architecture Team / Prashant Gupta  
> **Target Systems:** ASP.NET Core 8/9 LTS Web API, Angular 21 Host, Mobile ePRO (iOS/Android)  
> **Related Documents:**
> - [001: EDC API Architecture ADR](./001-api-architecture-adr.md)
> - [002: API Stack Discussion Agenda & Framework Evaluation](./002-api-stack-discussion-agenda-and-evaluation-framework.md)
> - [API Specification & Endpoint Contracts](./api-specification-and-contracts.md)
> - [005: Database Operational Pillars](../database/005-database-operational-pillars-backup-locking-dictionaries-and-archival.md)
> - [006: Field-Level Encryption & Key Management](../database/006-field-level-encryption-csfle-and-key-management-architecture.md)

---

## 1. Context & Problem Statement

As the Vialiq Clinical EDC platform architecture evolves, two foundational architectural questions have emerged regarding data contracts and API communication protocols:

### Question 1: DTO Symmetry vs. Multi-Tier Model Decoupling
> *"C# DTOs may or may not always match frontend models, as there will be properties not required at the backend and vice-versa. How should data models be structured to prevent leakage and bloat?"*

In enterprise software, assuming that a C# backend model must directly mirror an Angular UI component model is a common anti-pattern. The frontend requires ephemeral UI view state (`isExpanded`, `isFocused`, `isDirty`, `clientValidationErrors`), while the backend requires internal security, tenant routing, and cryptographic metadata (`tenantId`, `encryptionKeyArn`, `auditHashChain`, `concurrencyStamp`).

### Question 2: Multi-Client Evolution & The GraphQL Question
> *"As the Vialiq product suite expands, we will introduce an ePRO (electronic Patient Reported Outcomes) mobile app (iOS/Android), eConsent tablet apps, and wearable integrations. These clients require vastly different payloads than the desktop EDC web portal. Should we implement a GraphQL layer (e.g., via Hot Chocolate in .NET) to allow dynamic querying?"*

We must evaluate whether GraphQL is appropriate for an **FDA 21 CFR Part 11, GAMP 5, and ICH GCP E6(R3)** regulated life-sciences platform.

---

## 2. Decision Summary

1. **Adopt a Strict 3-Tier Model Architecture**: We reject naive 1:1 DTO mirroring. We enforce clean decoupling between **Frontend UI View State**, **Public Wire DTOs**, and **Internal Domain/BSON Entities**.
2. **Definitively Reject GraphQL**: We will **NOT** implement a GraphQL layer for clinical trial data transactions.
3. **Adopt Clean REST with the BFF (Backend-For-Frontend) Pattern**: We will expose tailored, strongly-typed RESTful endpoints for each client profile (`/api/v1/edc/...` for Web Desktop EDC, `/api/v1/epro/...` for Mobile ePRO, and `/api/v1/econsent/...` for Tablets), backed by a shared `Vialiq.Core` domain engine.

---

## 3. Pillar 1: The 3-Tier Model Architecture

To ensure strict data boundaries, high performance, and security, models are divided into three distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Frontend UI View State (Angular 21 Signals & Lit)        │
│    Properties: isExpanded, isFocused, isDirty, activeTab,   │
│                clientValidationErrors, monitorHighlight     │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mapped by Angular Data Service
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Public Wire DTOs (C# Contracts -> Generated TypeScript)  │
│    Properties: Strictly what travels over the network       │
│    Examples:   SubmitCrfRequestDto, CrfSummaryResponseDto   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Handled by ASP.NET Core Controller
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Internal Domain & BSON Entities (MongoDB 7.0 & C# Core)  │
│    Properties: tenantId, encryptionKeyArn, auditHashChain,  │
│                concurrencyStamp, isEncrypted, bForKeyVault  │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Concrete Example: The Lifecycle of a CRF Entry

#### Tier 3: Internal C# Domain & BSON Entity (`Vialiq.Core`)
Contains sensitive database identifiers, tenant partition keys, and cryptographic audit hash chains that **must never leak over the network**:

```csharp
// apps/api/src/Vialiq.Core/Entities/CrfEntryEntity.cs
public class CrfEntryEntity
{
    [BsonId]
    public ObjectId Id { get; set; }
    
    // Internal multi-tenancy & routing (never exposed to client)
    public string TenantId { get; set; } = string.Empty;
    public string StudyId { get; set; } = string.Empty;
    public string InternalSubjectGuid { get; set; } = string.Empty;
    
    public int FormVersion { get; set; }
    public Dictionary<string, object> FormValues { get; set; } = new();
    
    // 21 CFR Part 11 Cryptographic Audit Trail fields
    public string LastAuditHash { get; set; } = string.Empty;
    public string ConcurrencyStamp { get; set; } = string.Empty;
    
    // Client-Side Field-Level Encryption (CSFLE) metadata
    public string KmsKeyId { get; set; } = string.Empty;
    public bool IsEncrypted { get; set; }
}
```

#### Tier 2: Public Wire DTOs (`Vialiq.Api.Contracts`)
Tailored contracts representing explicit network requests and responses. These are fed to **NSwag** to generate TypeScript interfaces into `libs/edc-contracts`:

```csharp
// Request DTO: Submitted by the Coordinator
public class SubmitCrfRequestDto
{
    [Required]
    public Dictionary<string, object> Data { get; set; } = new();
    
    [Required]
    [StringLength(500, MinimumLength = 5)]
    public string ReasonForChange { get; set; } = string.Empty;
    
    public string? ElectronicSignaturePin { get; set; }
}

// Response DTO: Returned to the Web Desktop UI (Dense)
public class CrfDetailResponseDto
{
    public string CrfId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int FormVersion { get; set; }
    public Dictionary<string, object> Data { get; set; } = new();
    public int OpenQueryCount { get; set; }
    public bool IsLocked { get; set; }
    public DateTime LastModifiedAt { get; set; }
}
```

#### Tier 1: Frontend UI View State (`libs/form-renderer`)
Holds interactive UI state and reactive Angular Signals that **must never be sent to the backend**:

```typescript
// libs/form-renderer/src/lib/models/crf-form-state.ts
export interface CrfFormUiState {
  // Wire data received from API
  crfId: string;
  data: Record<string, any>;
  isLocked: boolean;
  
  // UI-ONLY EPHEMERAL PROPERTIES (Never sent to backend)
  isDirty: boolean;
  isSubmitting: boolean;
  activeFieldKey: string | null;
  expandedAccordions: Set<string>;
  clientValidationErrors: Map<string, string>;
  isHighlightedByMonitor: boolean;
}
```

---

### 3.2 Dual-Tier AutoMapper Architecture: `@vialiq/automapper` (Frontend) & `AutoMapper` (Backend)

To seamlessly bridge these three layers without writing tedious, error-prone manual assignment code on either tier, the platform employs a symmetrical **Dual-Tier AutoMapper Architecture**:

```
┌─────────────────────────────────┐
│     1. UI View State (Angular)  │
└────────────────┬────────────────┘
                 │
                 │ @vialiq/automapper (libs/automapper)
                 │ • Strips UI flags (isExpanded, isDirty, activeTab)
                 │ • Formats field deltas & submission payloads
                 ▼
┌─────────────────────────────────┐
│     2. Public Wire DTOs         │  <-- 100% Pure Network Contract
└────────────────┬────────────────┘
                 │
                 │ .NET AutoMapper / Mapperly (C# Backend)
                 │ • Strips internal security (tenantId, encryptionKeyArn)
                 │ • Flattens BSON nested documents for client consumption
                 ▼
┌─────────────────────────────────┐
│     3. MongoDB BSON Entities    │
└─────────────────────────────────┘
```

#### A. Frontend Mapping with `@vialiq/automapper` (`libs/automapper`)
Our workspace includes a high-performance, type-safe mapper library: [`@vialiq/automapper`](file:///Users/prashantgupta/code/nx/libs/automapper).

In the Angular application, mapping profiles explicitly define the transformation between interactive UI state and public wire DTOs:

```typescript
// apps/shell/src/app/mappings/crf-mapping.profile.ts
import { createMapper, addProfile, forMember, mapFrom, ignore } from '@vialiq/automapper';
import { CrfFormUiState } from '@vialiq/form-renderer';
import { SubmitCrfRequestDto, CrfDetailResponseDto } from '@vialiq/edc-contracts';

export const crfMapper = createMapper();

// 1. Map UI State -> Outgoing Wire DTO (Submitting Form)
addProfile<CrfFormUiState, SubmitCrfRequestDto>(crfMapper, 'CrfUiStateToSubmitDto', (rule) => {
  rule.forMember('data', mapFrom((src) => src.data));
  rule.forMember('reasonForChange', mapFrom((src) => src.reasonForChange || 'Data Entry'));
  // Ephemeral UI state (isExpanded, isDirty, activeFieldKey) is automatically omitted
});

// 2. Map Incoming Wire DTO -> Internal UI State (Loading Form)
addProfile<CrfDetailResponseDto, CrfFormUiState>(crfMapper, 'CrfDetailDtoToUiState', (rule) => {
  rule.forMember('crfId', mapFrom((src) => src.crfId));
  rule.forMember('data', mapFrom((src) => src.data));
  rule.forMember('isLocked', mapFrom((src) => src.isLocked));
  
  // Initialize UI-specific signals
  rule.forMember('isDirty', mapFrom(() => false));
  rule.forMember('isSubmitting', mapFrom(() => false));
  rule.forMember('activeFieldKey', mapFrom(() => null));
  rule.forMember('expandedAccordions', mapFrom(() => new Set<string>()));
  rule.forMember('clientValidationErrors', mapFrom(() => new Map<string, string>()));
});
```

#### B. Backend Mapping with C# `AutoMapper` / `Mapperly` (`Vialiq.Api`)
On the ASP.NET Core tier, C# mapping profiles ensure domain entities never leak internal database or cryptographic keys to the wire:

```csharp
// apps/api/src/Vialiq.Api/Mappings/CrfMappingProfile.cs
using AutoMapper;
using Vialiq.Core.Entities;
using Vialiq.Api.Contracts.Edc;

public class CrfMappingProfile : Profile
{
    public CrfMappingProfile()
    {
        // 1. Map MongoDB Entity -> Public Web EDC DTO
        CreateMap<CrfEntryEntity, WebEdcCrfDetailDto>()
            .ForMember(dest => dest.CrfId, opt => opt.MapFrom(src => src.Id.ToString()))
            .ForMember(dest => dest.FieldValues, opt => opt.MapFrom(src => src.FormValues))
            // Security: tenantId, internalSubjectGuid, KmsKeyId, LastAuditHash are NEVER mapped!
            .ForMember(dest => dest.OpenQueries, opt => opt.Ignore())
            .ForMember(dest => dest.LockState, opt => opt.Ignore());

        // 2. Map Incoming Submission DTO -> MongoDB Entity Update
        CreateMap<SubmitCrfRequestDto, CrfEntryEntity>()
            .ForMember(dest => dest.FormValues, opt => opt.MapFrom(src => src.Data))
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.TenantId, opt => opt.Ignore()); // Injected from Auth Context
    }
}
```

### 3.3 Benefits of the Symmetrical Mapper Pattern
1. **Zero State Pollution**: The wire contract remains 100% clean, predictable, and immune to UI redesigns or database schema updates.
2. **Type-Safe Refactoring**: Renaming a field in TypeScript or C# immediately breaks the mapping profile at compile time, eliminating silent runtime bugs.
3. **Single Responsibility**: Components handle user interaction; controllers handle HTTP requests; mappers handle data shaping.

---

## 4. Pillar 2: Exhaustive Evaluation & Rejection of GraphQL

While GraphQL is widely praised in consumer technology for flexible field selection, an objective analysis reveals that **GraphQL is fundamentally antithetical to the compliance, security, and operational requirements of regulated clinical trials**.

```
                           GRAPHQL COMPLIANCE EVALUATION
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
Theoretical Promise                                              Regulatory & Technical Reality
• Query exact fields                                             ❌ 21 CFR Part 11 Audit Trail Collapse
• Single /graphql endpoint                                       ❌ Opaque SIEM & WAF Network Logs
• Avoid over-fetching on mobile                                  ❌ DoS Vulnerability via Recursive Queries
                                                                 ❌ Zero Native HTTP Caching / CDN Support
                                                                 ❌ Inefficient Binary Streaming (PDFs/ECGs)
```

---

### Why GraphQL Was Rejected: 5 Failure Modes

### Failure Mode 1: Collapse of 21 CFR Part 11 Audit Trail & Request Tracing (§ 11.10(e))
The FDA mandates that an electronic data capture system must maintain a computer-generated, time-stamped audit trail that independently records the date, time, user, and exact action taken on any record.

* **In REST**: Every mutation is an unambiguous, auditable HTTP verb and URL:
  ```http
  POST /api/v1/crf-entries/SUBJ-001/submit HTTP/1.1
  Host: api.vialiq.com
  Authorization: Bearer <jwt>
  X-Reason-For-Change: Corrected screening blood pressure
  ```
  Every network appliance, WAF, API gateway (Kong/Envoy), and SIEM audit logger records the exact operation `POST /api/v1/crf-entries/SUBJ-001/submit` with HTTP 200/400.
* **In GraphQL**: **Every single request is an identical HTTP POST to `/graphql`**:
  ```http
  POST /graphql HTTP/1.1
  Host: api.vialiq.com
  
  {"query": "mutation { submitData(id: \"SUBJ-001\", val: 120) }"}
  ```
  To any firewall, proxy, or regulatory auditor, all 50,000 requests per day look like `POST /graphql`. If an unauthorized mutation occurs, reconstructing the forensic audit trail requires deep payload inspection of arbitrary GraphQL AST bodies. This creates an unacceptably high risk during FDA and sponsor QA inspections.

---

### Failure Mode 2: Denial-of-Service (DoS) via Recursive Cyclic Queries
In clinical trials, data relationships are deeply interconnected:
`Study` $\rightarrow$ `Subjects` $\rightarrow$ `Visits` $\rightarrow$ `CRFs` $\rightarrow$ `AuditTrail` $\rightarrow$ `User` $\rightarrow$ `Site` $\rightarrow$ `Subjects`...

In GraphQL, a malicious actor or a poorly written client query can easily trigger an **exponential circular query explosion**:

```graphql
# Malicious / Accidental Exponential Explosion
query CyclicDosAttack {
  study(id: "ONCOLOGY-101") {
    subjects {
      visits {
        crfs {
          auditTrail {
            performedByUser {
              assignedSites {
                subjects {
                  crfs {
                    auditTrail {
                      recordHash # 1 single query requests 10,000,000 DB operations!
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

To mitigate this in .NET (Hot Chocolate), you must implement:
- Dynamic Query Complexity Analyzers
- Depth Limiting Middleware
- Persisted Queries (APQ)

This adds immense architectural complexity just to prevent the API from crashing its own MongoDB connection pools. In REST, endpoint resource depth is **strictly hardcoded, indexed, and bounded by design**.

---

### Failure Mode 3: Inefficiency in Binary Medical File Streaming
Clinical trials involve heavy binary artifacts:
- 50MB – 200MB DICOM radiological scans (CT/MRI)
- High-resolution 12-lead ECG telemetry streams
- 10,000-page regulatory Patient Casebooks in PDF/A-1b format
- Electronic Informed Consent signature videos

GraphQL has no native binary streaming specification. Uploading files requires the GraphQL Multipart Request Specification (base64 string encoding inside JSON), which adds **33% payload overhead** and exhausts container memory buffers. REST handles binary streams natively via standard HTTP chunked transfer and `multipart/form-data`.

---

### Failure Mode 4: Total Loss of Standard HTTP Caching & Edge CDNs
In clinical trials, reference data (CDISC CT medical dictionaries, MedDRA adverse event codes, WHO Drug dictionaries, and published form schemas) is read millions of times by clinical monitors:
- In **REST**, endpoints like `GET /api/v1/forms/VITAL_SIGNS/v2` return standard `Cache-Control: public, max-age=86400` with `ETag`. Browsers and Cloudflare edge caches serve requests instantly in **<5ms** without hitting the .NET backend or MongoDB.
- In **GraphQL**, because all queries use `POST /graphql`, standard HTTP caches and CDNs **cannot cache responses** without complex proprietary GraphQL caching layers.

---

### Failure Mode 5: Computer System Validation (CSV) & GAMP 5 Category 4/5 Overhead
Under GAMP 5 guidelines, every software component that governs clinical trial data must be formally verified through Installation Qualification (IQ), Operational Qualification (OQ), and Performance Qualification (PQ):
- **REST**: Verifying 40 discrete REST endpoints is straightforward. Each endpoint has a fixed input schema, output schema, status codes, and test assertions.
- **GraphQL**: The combinatorial explosion of possible query field permutations makes exhaustive regulatory test coverage mathematically impossible. Qualifying a GraphQL schema for 21 CFR Part 11 requires validating arbitrary field combinations, exponentially increasing CSV validation costs.

---

## 5. Pillar 3: The Accepted Architecture — Clean REST with the BFF Pattern

To solve the multi-client problem (Desktop Web EDC vs. Mobile ePRO vs. Tablets) without the pitfalls of GraphQL, we adopt the **BFF (Backend-For-Frontend)** architectural pattern.

### 5.1 BFF Architectural Layout

```
                                  CLIENT ECOSYSTEM
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  Desktop Web EDC                  Mobile ePRO App                  eConsent Tablet
(Angular 21 + Lit 3)            (iOS Swift / Android)               (iPadOS / Web)
  Dense UI, Monitors,             Patients, Questionnaires,         Informed Consent,
  Investigator Signatures         Cellular Data, Battery            Biometric Signing
        │                                │                                │
        │ HTTPS                          │ HTTPS                          │ HTTPS
        ▼                                ▼                                ▼
┌───────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐
│  /api/v1/edc/...      │  │   /api/v1/epro/...        │  │   /api/v1/econsent/...    │
│  Desktop Controllers  │  │   Mobile Controllers      │  │   Tablet Controllers      │
│  (Full Dense DTOs)    │  │   (Ultra-Lean DTOs)       │  │   (PDF / Biometrics)      │
└───────────┬───────────┘  └─────────────┬─────────────┘  └─────────────┬─────────────┘
            │                            │                              │
            └────────────────────────────┼──────────────────────────────┘
                                         ▼
                        ┌─────────────────────────────────┐
                        │       Shared Vialiq.Core        │
                        │ • C# JsonLogic Validation Engine│
                        │ • 21 CFR Part 11 Audit Ledger   │
                        │ • MongoDB 3-Cluster Data Access │
                        │ • CSFLE Encryption Service      │
                        └─────────────────────────────────┘
```

---

### 5.2 Concrete Example: Web EDC vs. Mobile ePRO DTO Comparison

When fetching an Adverse Event or Patient Diary form, notice the stark difference in contract design:

#### 1. Desktop Web EDC Endpoint & DTO (`/api/v1/edc/forms/:id`)
Tailored for clinical research coordinators (CRCs) and monitors on 1080p/4K displays. Returns full audit history, discrepancy query badges, lock state, and all form controls:

```csharp
// Dense Web DTO: ~12 KB payload
public class WebEdcCrfDetailDto
{
    public string CrfId { get; set; } = string.Empty;
    public string SubjectNumber { get; set; } = string.Empty;
    public string SiteCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // DRAFT, COMPLETED, SIGNED, LOCKED
    public int FormVersion { get; set; }
    public Dictionary<string, object> FieldValues { get; set; } = new();
    
    // Monitor & Data Manager Specific Metadata
    public List<ClinicalDiscrepancySummaryDto> OpenQueries { get; set; } = new();
    public SourceDataVerificationStatus SdvStatus { get; set; }
    public FormLockStateDto LockState { get; set; } = new();
    public ElectronicSignatureAuditDto? SignatureAudit { get; set; }
}
```

#### 2. Mobile ePRO Endpoint & DTO (`/api/v1/epro/diary/today`)
Tailored for a cancer patient on an iPhone entering a daily nausea diary on cellular data. Returns **only** the 3 visual questions needed for today's entry:

```csharp
// Ultra-Lean Mobile DTO: ~480 Bytes payload (96% bandwidth reduction!)
public class EproDailyDiaryDto
{
    public string TaskId { get; set; } = string.Empty;
    public string Title { get; set; } = "Daily Symptom Check";
    public List<EproQuestionDto> Questions { get; set; } = new()
    {
        new EproQuestionDto 
        { 
            FieldKey = "nausea_level", 
            Prompt = "Rate your nausea today (0 to 10)", 
            Type = "SLIDER", 
            MinValue = 0, 
            MaxValue = 10 
        }
    };
    public DateTime ExpiresAt { get; set; }
}
```

---

## 6. Summary Comparison Matrix

| Evaluation Dimension | Traditional REST | GraphQL (Hot Chocolate) | Accepted: REST + BFF Pattern |
|---|:---:|:---:|:---:|
| **21 CFR Part 11 Audit Trail Integrity** | **High** | **Low (Opaque `/graphql`)** | **Highest (Explicit URLs per action)** |
| **Mobile ePRO Bandwidth Efficiency** | Low (Over-fetching) | High | **Highest (Micro-tailored DTOs)** |
| **Network & CDN Caching** | Native | Complex / Non-standard | **Native HTTP GET / ETag** |
| **Security & DoS Surface Area** | Bounded | High (Cyclic query attacks) | **Bounded & Strictly Indexed** |
| **Binary Medical File Streaming** | Native HTTP | Poor (Base64 encoding) | **Native HTTP Multipart / Streams** |
| **GAMP 5 Validation Simplicity** | Predictable | Complex combinatorial tests | **Predictable, Automated Test Suites** |
| **Code & Domain Sharing** | High | High | **100% Shared `Vialiq.Core` Domain** |

---

## 7. Consequences & Action Plan

### Positive Consequences
1. **Unassailable Regulatory Position**: During FDA or sponsor inspections, every electronic record mutation maps to an explicit, audited HTTP route with mandatory `reasonForChange`.
2. **Zero Mobile Over-Fetching**: Mobile ePRO receives purpose-built DTOs that conserve battery life and cellular bandwidth.
3. **No Query Abuse**: Eliminates the risk of database cluster denial-of-service from unindexed, arbitrary client-crafted queries.
4. **Complete Separation of Concerns**: Angular UI developers can freely manipulate ephemeral view state without risking database pollution.

### Implementation Action Plan
1. **Domain Layer**: Centralize all business logic, edit checks, and multi-cluster MongoDB access in `apps/api/src/Vialiq.Core/`.
2. **Controller Separation**:
   - `apps/api/src/Vialiq.Api/Controllers/Edc/` $\rightarrow$ Web Desktop endpoints.
   - `apps/api/src/Vialiq.Api/Controllers/Epro/` $\rightarrow$ Mobile patient endpoints.
3. **Automated Contracts**: NSwag will generate typed TypeScript contracts in `libs/edc-contracts` for the Angular app, and OpenAPI specs for future Swift/Kotlin mobile clients.
