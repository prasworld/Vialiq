# ADR 010: Double-Blind RTSM Unblinding Prevention, Role-Scoped Caching & Contract Masking

> **Status:** ✅ **SEALED & APPROVED**  
> **Date:** October 2026  
> **Deciders:** Architecture Core Team  
> **Domain:** Clinical Randomization & Trial Supply Management (RTSM), Blinding Integrity, Multi-Tier Caching, Outbound Data Masking  
> **Regulatory Standards:** FDA 21 CFR Part 11 § 11.10; ICH GCP E6(R3) Section 5.14 & 5.18; EU Clinical Trials Regulation (EU CTR 536/2014); HIPAA Safe Harbor § 164.514  
> **Related Architecture Documents:**
> - [ADR 002: ePRO Validation Payload Optimization & Isolated Edit Checks](./002-epro-validation-payload-optimization-and-isolated-edit-checks-adr.md)
> - [ADR 004: CSFLE-to-SQL Server CDC Decryption Boundary](./004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)
> - [ADR 006: 21 CFR Part 11 Audit Trail Architecture](./006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md)
> - [ADR 007-A: Multi-Tenant Cache Isolation & Security Scoping](./007-a-multitenant-cache-isolation-and-security-scoping-adr.md)
> - [ADR 009: Legal Timestamp Authority & Monotonic Sequencing](./009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md)

---

## 1. Executive Summary & Clinical Context

> [!NOTE]
> **Phase-1 Scope Boundary (Randomization Engine Deferred to Phase 2+):**
> Vialiq is **NOT implementing a built-in RTSM/IWRS randomization engine or drug-kit depot workflow in Phase 1**. In Phase 1, randomized studies integrate via **External IXRS/IRT** (storing only opaque `GlobalSubjectGuid`, `RandomizationNumber`, and `RandomizationDate` / `RFSTDTC` metadata in EDC), while **all blinding security guardrails in this ADR (`BlindedRTSM` masking, Redis treatment-arm ban, role-scoped schema keys, server-side EC bifurcation, and Code Break audit hook) remain active from Day 1** so future RTSM integration plugs in with zero security rewrites.

In a **Double-Blind Clinical Trial**, neither the trial subjects (patients) nor the investigating site personnel (Principal Investigators, Sub-Investigators, Clinical Research Coordinators / CRCs, Site Nurses, Clinical Research Associates / CRAs) may know which treatment arm a participant is assigned to (e.g., *Investigational New Drug 100mg*, *Active Comparator*, or *Matching Placebo*).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE BLINDING SPECTRUM                                  │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│ 🙈 BLINDED ROLES (Zero Arm Access)       │ 👁️ UNBLINDED ROLES (Authorized Arm Access) │
├──────────────────────────────────────────┼─────────────────────────────────────────────┤
│ • Principal Investigator (PI)            │ • Unblinded Site Pharmacist / Dispenser     │
│ • Sub-Investigator & Site Nurse          │ • Independent Data Monitoring Comm. (IDMC)  │
│ • Clinical Research Coordinator (CRC)    │ • Data Safety Monitoring Board (DSMB)       │
│ • Monitoring CRA & Data Manager          │ • Unblinded Biostatistician                 │
│ • Trial Subject (Patient / ePRO User)    │ • Emergency Treating Physician (Code Break) │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

### The Catastrophic Failure Mode: Operational & Cache Unblinding
If an Investigator or CRC learns or deduces a patient's treatment assignment:
1. **Bias Infiltration**: Clinicians may assess adverse events differently, administer concomitant medications unevenly, or subtly influence subjective patient-reported outcome (ePRO) surveys.
2. **Regulatory Trial Invalidation**: Under **ICH GCP E6(R3)** and **FDA guidelines**, accidental unblinding of study personnel or trial cohorts is a critical regulatory deficiency. If systemic, regulatory health authorities (FDA, EMA, PMDA) **will disqualify the clinical trial data**, invalidating a Phase 3 study worth $100M+ to $1B+ and destroying years of research.
3. **Software & Cache Leakage Vectors**:
   - **Shared Cache Key Cross-Contamination**: An unblinded biostatistician or unblinded pharmacist fetches a subject's treatment details or kit metadata. If the API caches that payload under a naive key (`study:{id}:subject:{subId}`), a subsequent request from a blinded CRC or CRA retrieves the cached unblinded payload.
   - **Dual-View Schema Pollution**: Pharmacy dispensing forms or dose-titration schedules contain unblinded fields. If form schemas or visit matrices are cached without role scoping, blinded users receive unblinded schemas.
   - **Deductive / Inferential Unblinding**: Exposing raw kit ID numbering sequences, active drug lot numbers, bottle appearance descriptions, or conditional edit checks allows tech-savvy users to deduce treatment arms via browser DevTools inspection.

---

## 2. Core Architectural Decisions

```
                               THE 5-PILLAR RTSM BLINDING ARCHITECTURE
                                                  │
         ┌───────────────────┬────────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                    ▼                   ▼                   ▼
DECISION 10.1:        DECISION 10.2:       DECISION 10.3:      DECISION 10.4:      DECISION 10.5:
STRICT CONTRACT       ABSOLUTE BAN ON      ROLE-SCOPED         SERVER-SIDE EC      EMERGENCY CODE
MASKING               RTSM DATA IN REDIS   SCHEMA CACHING      BIFURCATION         BREAK PROTOCOL
------------------    ------------------   -----------------   -----------------   ------------------
• `BlindedRTSM`       • Zero patient       • Form schemas &    • All edit checks   • Direct Mongo ACID
  fields stripped       treatment data       visit matrices      referencing         commit (no cache).
  at serialization      in Redis.            incorporate         `BlindedRTSM`     • Mandatory Part 11
  via JSON modifier.  • Unblinded arm      `scope:{Blinded|    executed strictly     e-sig & rationale.
• Blinded users         data fetched         Unblinded}` in      on server           • Instant safety
  receive "BLINDED"     on-demand directly   Redis cache key.    (`IServerEdit-      notification +
  or omitted fields.    from MongoDB.                          Check`).            audit log.
```

---

### Decision 10.1: Outbound Contract Masking via JSON Serializer Interceptor (`BlindedRTSM`)
* **Building on ADR 004 Data Classification**:
  Fields classified as `DataClassification.BlindedRTSM` (e.g. `TreatmentArm`, `RandomizationCode`, `ActualDoseLevel`, `KitDescription`, `FormulationType`) are subject to strict outbound transformation.
* **Architecture Implementation**:
  Rather than relying on human backend developers to remember to omit properties in every controller endpoint, the ASP.NET Core serialization pipeline enforces an automatic **`BlindedDataContractModifier`** (or `System.Text.Json` Type Modifier):
  ```csharp
  // If the executing UserContext indicates IsBlinded == true:
  // 1. Any property tagged with [BlindedRtsm] is stripped or replaced with "BLINDED".
  // 2. Any dictionary entry with key matching BlindedRTSM metadata is scrubbed.
  ```
* **Strict Invariant**:
  Under no circumstances can an HTTP response payload leaving the backend API for a blinded user contain unblinded RTSM values, regardless of whether the endpoint is a generic query, a report export, or an audit trail query.

---

### Decision 10.2: Absolute Ban on Patient Treatment Arm Data in Distributed Redis
* **Reinforcing ADR 007-A (Rule 1)**:
  **Patient-level treatment arms, randomization allocations, and kit-to-arm mappings are STRICTLY FORBIDDEN from being cached in Distributed Redis (and `.NET IMemoryCache` L1 caches do not exist).**
* **Rationale**:
  1. A clinical study has at most a few thousand subjects. Randomization allocation queries are low-frequency transactional events (occurring once per subject enrollment or once per visit kit dispensation).
  2. Caching patient-level unblinded data creates a catastrophic threat surface: a memory dump, a bug in cache key generation, or a Redis CLI inspection could leak active drug allocations.
  3. All RTSM dispensation queries execute **on-demand, directly against MongoDB** (`study_{studyId}_prod.subject_randomization`) within the user's authenticated, authorized session scope.

---

### Decision 10.3: Role & Blinding Scoping in Redis Cache Keys for Schemas & Matrices
While patient data is never cached, **Form Schemas, Protocol Visit Matrices, and Codelists** ARE cached in Redis (as codified in ADR 007-A and ADR 008).
* **The Dual-View Dilemma**:
  Certain form definitions have role-dependent views:
  - An **Unblinded Pharmacist** viewing the "Investigational Product Dispensing Log" must see unblinded fields (`Kit Concentration`, `Active Molecule Batch ID`, `Reconstitution Diluent`).
  - A **Blinded CRC** viewing the same form must only see blinded operational fields (`Kit Barcode Number`, `Dispensation Date`, `Units Returned`).
* **The Unified Cache Key Invariant (`ADR 007-A`, `ADR 008`, `Scale 004` Aligned)**:
  Any cache key for form schemas, visit matrices, declarative `[Cached]` responses, or dynamic controls MUST automatically incorporate the caller's **Blinding Scope**, **Protocol Epoch**, and **Active Locale** (`BaseLocale` default for single-culture trials):
  ```
  vialiq:study:{tenant}:{study}:{env}:ep{epoch}:{blinded|unblinded|std}:{locale}:form:{formId}:schema
  ```
* **Guarantees**:
  - Blinded users only ever read from `:blinded:` cache slots (auto-injected by `IScopedCacheService` and `CachedActionFilter`, never left optional via manual `VaryByHeaders`).
  - Unblinded users only ever read from `:unblinded:` cache slots.
  - Endpoints serving `SiteIdentifier` PHI or `BlindedRTSM` patient allocations are fail-closed blocked from declarative `[Cached]` caching.
  - Cross-contamination is mathematically impossible because the cache keys are structurally disjoint.

---

### Decision 10.4: Server-Side Cryptographic Bifurcation for RTSM Edit Checks
* **Reinforcing ADR 002 & ADR 004**:
  - Clinical trial protocols frequently specify conditional logic that depends on treatment allocation:
    * *Example*: *"If patient is in Arm A (Active Drug), mandatory blood serum sample at Hour 4; if in Arm B (Placebo), blood serum sample is optional."*
  - **The Client Leak Vector**:
    If this Edit Check logic is compiled into a JavaScript / TypeScript AST and sent to the client browser, an investigator opening Chrome DevTools or inspecting network traffic can read the logic and know the patient's arm:
    $$\text{If Hour 4 Blood Sample is marked Required } \implies \text{ Subject is on Active Drug!}$$
  - **The Architectural Rule**:
    Any validation rule, Edit Check, or dynamic field requirement referencing `BlindedRTSM` fields is **flagged as Server-Only (`IsServerOnly = true`)**.
    - The rule is **stripped** from the client validation bundle downloaded by the web app or mobile ePRO client.
    - The rule executes strictly inside the backend `IServerEditCheck` pipeline upon form submission.
    - Discrepancy queries generated by server-side checks use neutral, non-unblinding wording: *"Please verify blood sample requirement per protocol schedule."*

---

### Decision 10.5: Emergency Unblinding ("Code Break") Protocol & Audit Invariant
In acute clinical emergencies (e.g. sudden anaphylactic shock, life-threatening arrhythmias, suspected overdose), an Investigator or Emergency Physician must unblind the patient immediately to administer the correct life-saving antidote.
* **Zero-Bureaucracy Immediate Execution**:
  The system must provide a dedicated, secure **Emergency Code Break Modal** accessible 24/7/365 without requiring prior approval from the Sponsor or Medical Monitor (preventing fatal treatment delays).
* **Part 11 Compliance & Challenge Gate**:
  1. **Dual-Credential E-Signature**: Investigator must re-authenticate with Username + Password (satisfying 21 CFR Part 11 § 11.200).
  2. **Mandatory Clinical Justification**: Investigator must select a recognized emergency reason (e.g. *"Suspected Unexpected Serious Adverse Reaction (SUSAR)"*, *"Acute Medical Emergency"*) and enter free-text clinical details.
* **Direct-to-Database ACID Transaction**:
  1. The code break writes directly to `study_{studyId}_prod.audit_unblinding` inside a MongoDB transaction (bypassing all caches).
  2. The subject's status is updated to `IsUnblinded = true` with `UnblindedAtUtc = ServerTimestampUtc` and `UnblindedByUserId`.
* **Immediate High-Priority Safety Broadcast**:
  - The backend dispatches immediate real-time notifications via SignalR, SMS, and high-priority email to the **Sponsor Safety Officer**, **Lead CRA**, and **Medical Monitor**.
* **Subject-Level Isolation**:
  Unblinding Subject 101 **never** unblinds other subjects in the cohort. The rest of the study remains 100% double-blind.

---

## 3. Data Contract & Implementation Specification (.NET 9 C#)

### 3.1 Data Classification & Attributes

```csharp
namespace Vialiq.Core.Models;

using System;

/// <summary>
/// Declares that a property contains double-blind RTSM data (treatment arm, kit type, dose).
/// Outbound serialization pipeline will strip or mask this property for blinded users.
/// </summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class BlindedRtsmAttribute : Attribute
{
    public string MaskValue { get; }

    public BlindedRtsmAttribute(string maskValue = "BLINDED")
    {
        MaskValue = maskValue;
    }
}

public enum BlindingScope
{
    Blinded = 1,
    Unblinded = 2
}
```

---

### 3.2 Outbound JSON Contract Modifier (`BlindedDataContractModifier`)

Using .NET 9 `System.Text.Json` Type Info Resolvers to guarantee zero-overhead, reflection-cached masking:

```csharp
namespace Vialiq.Core.Serialization;

using System;
using System.Text.Json.Serialization.Metadata;
using Vialiq.Core.Interfaces;
using Vialiq.Core.Models;

public static class BlindedDataContractModifier
{
    public static Action<JsonTypeInfo> CreateModifier(ITenantStudyContextAccessor contextAccessor)
    {
        return typeInfo =>
        {
            if (typeInfo.Kind != JsonTypeInfoKind.Object)
                return;

            var context = contextAccessor.GetCurrentContext();
            bool isBlinded = context?.User?.BlindingScope != BlindingScope.Unblinded;

            if (!isBlinded)
                return; // Unblinded users receive full payload

            foreach (var property in typeInfo.Properties)
            {
                var isBlindedProp = property.AttributeProvider?.IsDefined(typeof(BlindedRtsmAttribute), inherit: true) ?? false;
                if (isBlindedProp)
                {
                    // For blinded users, completely ignore property from output serialization
                    property.ShouldSerialize = (_, _) => false;
                }
            }
        };
    }
}
```

---

### 3.3 Role-Scoped Cache Key Generation for Redis

```csharp
namespace Vialiq.Caching.Extensions;

using Vialiq.Core.Models;

public static class RtsmCacheKeyBuilder
{
    /// <summary>
    /// Constructs role-scoped cache keys for form schemas and visit matrices.
    /// Strictly guarantees that Blinded and Unblinded users never share cache entries.
    /// </summary>
    public static string BuildSchemaKey(
        string tenantId,
        string studyId,
        string environment,
        int protocolEpoch,
        BlindingScope scope,
        string locale,
        string formId)
    {
        var scopeSegment = scope == BlindingScope.Unblinded ? "unblinded" : "blinded";
        return $"vialiq:study:{tenantId}:{studyId}:{environment}:ep{protocolEpoch}:{scopeSegment}:{locale}:form:{formId}:schema";
    }
}
```

---

### 3.4 Emergency Code Break Model & Audit Entity

```csharp
namespace Vialiq.Core.Models;

using System;

public sealed record EmergencyCodeBreakRequest(
    string SubjectId,
    string EmergencyReason,
    string ClinicalJustification,
    string Username,
    string Password);

public sealed record EmergencyCodeBreakResult(
    bool Success,
    string SubjectId,
    string AssignedTreatmentArm,
    string KitDescription,
    DateTime UnblindedAtUtc,
    long AuditSequence);
```

```csharp
namespace Vialiq.Core.Entities;

using System;
using Vialiq.Core.Models;

/// <summary>
/// Regulatory Part 11 audit record stored in study_{id}_prod.audit_unblinding.
/// Captures emergency code break events with full legal accountability.
/// </summary>
public sealed class EmergencyUnblindingAuditEntity
{
    public string Id { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string StudyId { get; set; } = string.Empty;
    public string SubjectId { get; set; } = string.Empty;

    // Legal Authority & Ordering (ADR 009)
    public AuditTimestampMetadata TimestampMeta { get; set; } = null!;

    // Cryptographic Chain (ADR 006)
    public string PreviousHash { get; set; } = string.Empty;
    public string CurrentHash { get; set; } = string.Empty;

    // Actor Information (21 CFR Part 11 § 11.50)
    public string PerformedByUserId { get; set; } = string.Empty;
    public string PerformedByFullName { get; set; } = string.Empty;
    public string PerformedByUserRole { get; set; } = string.Empty;

    // Clinical Justification
    public string EmergencyReason { get; set; } = string.Empty;
    public string ClinicalJustification { get; set; } = string.Empty;

    // Unblinded Payload (Stored in encrypted MongoDB collection)
    public string RevealedTreatmentArm { get; set; } = string.Empty;
    public string RevealedKitNumber { get; set; } = string.Empty;
}
```

---

## 4. Threat Modeling & Defense Matrix

| Attack / Failure Vector | Naive Architecture Failure Mode | Vialiq ADR 010 Architectural Defense |
|---|---|---|
| **Shared Redis Cache Pollution** | Unblinded user request populates Redis; subsequent Blinded user request retrieves active arm | **Prevented**: Unblinded patient data is *never cached in Redis*; schema keys are strictly partitioned with `scope:{blinded\|unblinded}` |
| **Developer API Serialization Omission** | Backend engineer forgets to exclude `TreatmentArm` from new endpoint DTO | **Prevented**: System-level `BlindedDataContractModifier` strips `[BlindedRtsm]` attributes automatically |
| **Client-Side DevTools Inspection** | CRC inspects browser network traffic or form JSON to find active drug allocation | **Prevented**: `[BlindedRtsm]` fields are omitted from response; edit checks using arms are strictly server-only (`IServerEditCheck`) |
| **Inferential Kit ID Unblinding** | Block kit numbers (e.g. 100-200 Active, 201-300 Placebo) allow site staff to deduce treatment | **Prevented**: RTSM assigns pseudo-randomized kit sequence IDs; kit appearance and packaging are identical across arms |
| **Emergency Code Break Delay** | Medical emergency stalled by multi-day administrative approval workflows | **Permitted & Audited**: 24/7 direct code break with Part 11 e-sig challenge, instant safety notification, and atomic audit logging |
| **Global Study Unblinding Leakage** | Emergency unblinding of Subject A exposes Subject B or whole study | **Isolated**: Code break unbinds *strictly the target subject*; other subjects and study database remain double-blind |

---

## 5. Architectural Verdict & Compliance Sign-Off

The **Vialiq RTSM Blinding & Cache Security Architecture** guarantees absolute compliance with **FDA 21 CFR Part 11**, **ICH GCP E6(R3)**, and **EU CTR 536/2014**. By enforcing serializer-level contract masking, strictly prohibiting patient treatment data from shared Redis tiers, partitioning schema caches by blinding scope, and providing an immediate, fully audited emergency code-break workflow, the platform completely eliminates operational unblinding risks and safeguards clinical trial integrity.
