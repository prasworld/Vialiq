# ADR 004: CSFLE-to-SQL Server CDC Ingress Boundary & Metadata-Driven Data Classification

> **Document ID:** `VIALIQ-ADR-CRIT-004`  
> **Status:** APPROVED & SEALED  
> **Date:** October 26, 2026  
> **Authors:** Architecture Review Board / Prashant Gupta  
> **Domain:** Data Security, Cryptographic Boundaries, Change Data Capture (CDC), CDISC SDTM Reporting Warehouse  
> **Compliance Standards:** HIPAA § 164.312(a)(2)(iv) & § 164.514(b) (Safe Harbor), EU GDPR Art. 9 & Recital 26, FDA 21 CFR Part 11, CDISC SDTM v3.3  

---

## 1. Context & Architectural Problem Statement

In the Vialiq EDC platform:
* **Primary Transactional Store (MongoDB 7.0+)**: Fast, schema-flexible document store managing dynamic Case Report Forms (CRFs), audit logs, and operational site workflows.
* **Secondary Reporting Warehouse (Microsoft SQL Server 2022+)**: Relational warehouse hosting CDISC SDTM/ADaM datasets queried by biostatisticians, SAS scripts, R statistical models, and regulatory submission pipelines.

To keep clinical reporting decoupled from live clinic operations, MongoDB changes stream to SQL Server via **Change Data Capture (CDC / Change Streams)**.

### 1.1 The Fundamental Security Dilemma
1. **The Trap of Whole-Field Decryption**: If sensitive patient fields are encrypted with Client-Side Field-Level Encryption (CSFLE) in MongoDB and then decrypted completely when replicated to SQL Server, **the security purpose of CSFLE is defeated**—an attacker or unauthorized analyst could bypass MongoDB security entirely by querying SQL Server.
2. **The Clinical Reporting Reality**: Real clinical trials **do not collect SSN, PAN, or national IDs** (prohibited by GCP and FDA guidelines). Instead, studies collect protocol-required fields: dates (Visit Dates, Onset Dates), demographics (Birth Date/Year, Sex, Race), and clinical measurements (Labs, Vitals, Adverse Events).
3. **The Calculation Dependency**: Statistical reports, FDA safety summaries, and CDISC SDTM tables **require these exact clinical fields for calculations** (e.g., Study Day `--DY = VisitDate - BaselineDate + 1`, derived `AGE`, change from baseline, survival analysis). If calculation fields remain encrypted as random ciphertext in SQL Server, **statistical mathematics is impossible** (`AVG`, `SUM`, `>`, `GROUP BY` fail on ciphertext).

---

## 2. Fundamental Architectural Decisions

```
=============================================================================================================
VIALIQ METADATA-DRIVEN CDC INGRESS & DATA CLASSIFICATION ARCHITECTURE
=============================================================================================================
Core Decision                      Technical Specification                   Security & Operational Benefit
-------------------------------------------------------------------------------------------------------------
1. 3-Tier Data Classification      Form Builder schema tags every field:     Eliminates guesswork; establishes
   (`dataClassification`)         `SiteIdentifier`, `ClinicalResearch`,      unambiguous field routing before
                                  or `BlindedRTSM`.                          a study is ever published.
-------------------------------------------------------------------------------------------------------------
2. Hard Drop of Site Identifiers   `SiteIdentifier` fields (MRN, Initials)   Zero patient identity leaks to SQL;
                                  are CSFLE in MongoDB and DROPPED by CDC.  CSFLE security purpose is preserved.
-------------------------------------------------------------------------------------------------------------
3. Queryable Clinical Research     `ClinicalResearch` fields (Dates, Labs,   SAS, R, and PowerBI run all report
   Data in SQL Server              Vitals) replicate as typed columns under  calculations with zero decryption
                                  SQL Server TDE (at rest) + TLS 1.3.       friction or performance penalties.
-------------------------------------------------------------------------------------------------------------
4. Treatment Arm Masking (RTSM)    `BlindedRTSM` fields are written as       Prevents double-blind trial spoilage
                                  `"BLINDED"` in SQL Server until Hard Lock. across the reporting tier.
-------------------------------------------------------------------------------------------------------------
5. In-Memory CDC Worker Enclave    .NET 9 worker processes change streams    Zero unencrypted disk spills during
                                  in RAM; executes clean transformations.   ingestion and relational projection.
=============================================================================================================
```

---

### Decision 1: Form Builder Metadata-Driven Field Classification

To eliminate brittle, hardcoded backend filtering rules that break with every protocol amendment, field classification is declared **at design time** inside the Form Builder schema ([`docs/form-builder-schema.md`](../form-builder-schema.md)):

```json
// Definition in Form Builder Component Schema
{
  "key": "hospital_mrn",
  "type": "text-input",
  "label": "Hospital Medical Record Number",
  "dataClassification": "SiteIdentifier" // 🔒 CSFLE in Mongo, DROPPED from SQL Server
}
```

```json
{
  "key": "visit_date",
  "type": "date",
  "label": "Date of Assessment",
  "dataClassification": "ClinicalResearch" // 📊 TDE at-rest, REPLICATED to SQL Server
}
```

```json
{
  "key": "randomized_treatment_arm",
  "type": "select",
  "label": "Assigned Cohort",
  "dataClassification": "BlindedRTSM" // 🙈 Masked as "BLINDED" in SQL Server
}
```

---

### Decision 2: The Three Clinical Data Tiers & Processing Rules

```
                               THE 3-TIER DATA PROCESSING BOUNDARY
                                                │
         ┌──────────────────────────────────────┼──────────────────────────────────────┐
         ▼                                      ▼                                      ▼
1. SiteIdentifier (Privacy Link)       2. ClinicalResearch (Reporting)       3. BlindedRTSM (Randomization)
• Examples: Hospital MRN, Patient      • Examples: Visit Dates, Birth Year,   • Examples: Treatment Arm,
  Initials, ePRO Contact Phone/Email.    Vitals, Chemistry Labs, Adverse Events.  Kit Number, Drug Allocation.
• In MongoDB: CSFLE (AES-256-GCM).     • In MongoDB: TDE + RBAC.              • In MongoDB: CSFLE / Role Filter.
• In CDC Pipeline: DROPPED COMPLETELY! • In CDC Pipeline: Replicated directly • In CDC Pipeline: Masked as
• In SQL Server: ❌ DOES NOT EXIST.     • In SQL Server: Typed SQL columns.       `"BLINDED"` until Hard Lock.
• Rationale: Statistical reports       • Rationale: Needed for `--DY`, age,   • Rationale: Preserves trial
  never calculate on initials or MRN.    and efficacy report calculations.      blinding for analysts.
```

#### Why This Resolves the Security Dilemma:
* **The "Hacker Dump" Test**: If a rogue user or attacker dumps the SQL Server database, **they cannot re-identify any patient** because `SiteIdentifier` fields (MRN, initials, contact data) were never replicated. Under **HIPAA § 164.514(b) (Safe Harbor Standard)** and **EU GDPR Recital 26**, SQL Server contains solely **De-Identified Research Data**.
* **The Reporting Utility Guarantee**: Because `ClinicalResearch` fields land as native typed columns (e.g., `DATETIME2`, `DECIMAL(10,2)`, `VARCHAR(50)`), biostatisticians and SAS programs can execute range filters (`AGE >= 65`), date arithmetic (`AVAL - BASE`), and survival models without decryption overhead.

---

### Decision 3: In-Memory CDC Worker Enclave (`Vialiq.CdcWorker`)

Replication from MongoDB to SQL Server executes via an isolated .NET 9 background worker service (`Vialiq.CdcWorker`):

```
┌────────────────────────────────────────────────────────────────────────┐
│ MongoDB Replica Set (`rs-prod:27037`)                                  │
│ Change Stream: `db.crf_entries.watch()` (Tail oplog.rs)                │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ BSON Change Event
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ .NET 9 CDC Ingress Worker (Secure In-Memory Enclave)                   │
│ 1. Parse Document Key & Study ID                                       │
│ 2. Lookup Form Schema Metadata (`dataClassification`)                  │
│ 3. Filter Fields:                                                      │
│    • Drop all fields where `dataClassification == SiteIdentifier`      │
│    • Transform `BlindedRTSM` fields -> "BLINDED"                       │
│    • Retain `ClinicalResearch` fields                                  │
│ 4. Map to CDISC SDTM Relational Model (`sdtm.DM`, `sdtm.VS`, etc.)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Relational Batch Insert (TDS / TLS 1.3)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Microsoft SQL Server 2022+ (CDISC SDTM Reporting Warehouse)            │
│ • Database encrypted at rest via TDE (Transparent Data Encryption)     │
│ • Queried by SAS, R, and PowerBI with standard SQL SELECT              │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Decision 4: Cryptographic Edit Check (EC) Bifurcation (Server-Side Execution)

Any validation rule or Edit Check (EC) referencing fields with `dataClassification: "SiteIdentifier"` (CSFLE) or `"BlindedRTSM"` (Treatment Allocation) is **automatically bifurcated and routed to the Server-Side Validation Pipeline (`IServerEditCheck`)**.

```
                              EDIT CHECK COMPILATION ROUTING
                                             │
                       Does the Edit Check depend on ANY field with:
                       • `dataClassification: "SiteIdentifier"` (CSFLE)
                       • `dataClassification: "BlindedRTSM"` (Encrypted / Blinded)
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
                     YES                                            NO
                      │                                             │
        ┌─────────────────────────────┐               ┌─────────────────────────────┐
        │  ROUTE TO SERVER-SIDE EC    │               │  ROUTE TO CLIENT-SIDE EC    │
        │  (`IServerEditCheck` in C#) │               │  (JsonLogic in Angular)     │
        ├─────────────────────────────┤               ├─────────────────────────────┤
        │ • Executed by .NET 9 API    │               │ • Executed by Form Renderer │
        │ • Accesses KeyVault in RAM  │               │ • Immediate field blur UI   │
        │ • 100% Zero Client Leak     │               │ • Fast & responsive         │
        │ • Excluded from JS bundle   │               │ • Clean non-PHI data only   │
        └─────────────────────────────┘               └─────────────────────────────┘
```

#### Regulatory & Security Rationale:
1. **KMS Trust Boundary Enforcement**: The browser or mobile client never holds the KMS Customer Master Key (CMK) or Data Encryption Keys (DEKs). Decrypting cross-record or historical values to evaluate an edit check must happen within the secure .NET 9 API memory enclave.
2. **Double-Blind Integrity Protection**: If an edit check evaluates blinded RTSM fields (e.g. validating dosage limits against active vs placebo treatment arms), shipping that check logic to the browser would expose the randomization code to DevTools inspection. Server-side execution preserves 100% double-blind trial integrity.

---

## 3. Concrete Implementation Specifications

### 3.1 Form Builder Schema Model Extension (`schema.ts`)

```typescript
// libs/form-builder/src/lib/types/schema.ts

export type DataClassification = 
  | 'SiteIdentifier'    // 🔒 Direct site-level PII (MRN, initials). CSFLE in Mongo, DROPPED from SQL.
  | 'ClinicalResearch'   // 📊 Protocol study data (Dates, vitals, labs). Replicated to SQL Server.
  | 'BlindedRTSM';       // 🙈 Randomization treatment arm. Masked as 'BLINDED' in SQL Server.

export interface BaseComponentSchema {
  id: string;
  key: string;
  type: string;
  label: string;
  
  /**
   * Data classification governing cryptographic isolation and CDC replication routing.
   * Default: 'ClinicalResearch'
   */
  dataClassification?: DataClassification;
  
  validation?: ValidationRule[];
}
```

### 3.2 CDC Ingress Transformation Engine (`CdcRecordTransformer.cs`)

```csharp
namespace Vialiq.CdcWorker.Services;

using System.Text.Json;
using Vialiq.Core.Entities;
using Vialiq.Core.Models;

public sealed class CdcRecordTransformer : ICdcRecordTransformer
{
    private readonly IFormSchemaRegistry _schemaRegistry;

    public CdcRecordTransformer(IFormSchemaRegistry schemaRegistry)
    {
        _schemaRegistry = schemaRegistry;
    }

    /// <summary>
    /// Transforms raw MongoDB CRF BSON document into a clean, de-identified SDTM record.
    /// Strictly drops SiteIdentifier fields and masks BlindedRTSM fields.
    /// </summary>
    public async Task<SdtmRecord> TransformAsync(
        string studyId, 
        string formId, 
        Dictionary<string, object?> rawFields, 
        CancellationToken ct)
    {
        var schema = await _schemaRegistry.GetFormSchemaAsync(studyId, formId, ct);
        var cleanFields = new Dictionary<string, object?>();

        foreach (var (fieldKey, value) in rawFields)
        {
            var fieldMeta = schema.FindField(fieldKey);
            var classification = fieldMeta?.DataClassification ?? DataClassification.ClinicalResearch;

            switch (classification)
            {
                case DataClassification.SiteIdentifier:
                    // HARD DROP: Never let site-level identifiers enter the reporting warehouse!
                    continue;

                case DataClassification.BlindedRTSM:
                    // MASK: Maintain double-blind state for all reporting analysts
                    cleanFields[fieldKey] = "BLINDED";
                    break;

                case DataClassification.ClinicalResearch:
                default:
                    // PASS-THROUGH: Retain queryable typed data for report calculations
                    cleanFields[fieldKey] = value;
                    break;
            }
        }

        return new SdtmRecord(
            StudyId: studyId,
            SubjectId: rawFields["subject_id"]?.ToString() ?? "UNKNOWN",
            FormId: formId,
            Fields: cleanFields,
            TransformedAtUtc: DateTime.UtcNow
        );
    }
}
```

### 3.3 Destination SQL Server Schema (`sdtm.DM` Demographics Example)

```sql
-- SQL Server 2022+ CDISC SDTM Demographics Domain Table
-- Protected by Transparent Data Encryption (TDE)
CREATE SCHEMA sdtm;
GO

CREATE TABLE sdtm.DM (
    STUDYID     VARCHAR(50)   NOT NULL,
    DOMAIN      VARCHAR(2)    NOT NULL DEFAULT 'DM',
    USUBJID     VARCHAR(100)  NOT NULL, -- Unique Subject ID (e.g. 'STUDY-SITE-1001')
    SUBJID      VARCHAR(50)   NOT NULL, -- Subject ID
    SITEID      VARCHAR(50)   NOT NULL,
    AGE         INT           NULL,     -- Clean integer for calculations (AGE >= 65)
    AGEU        VARCHAR(10)   NULL,     -- 'YEARS'
    SEX         VARCHAR(1)    NULL,     -- 'M' / 'F'
    RACE        VARCHAR(50)   NULL,
    ARM         VARCHAR(50)   NOT NULL, -- 'BLINDED' until unblinding ceremony
    RFSTDTC     DATETIME2     NULL,     -- Reference Start Date (for --DY calculations)
    CREATED_AT  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_sdtm_DM PRIMARY KEY CLUSTERED (STUDYID, USUBJID)
);
GO

-- Index supporting fast SAS and biostatistical queries
CREATE NONCLUSTERED INDEX IX_sdtm_DM_Study_Age_Arm 
ON sdtm.DM (STUDYID, AGE, ARM) 
INCLUDE (SEX, RFSTDTC);
GO
```

---

## 4. Multi-Layer Security Architecture Comparison

```
=============================================================================================================
SECURITY DEFENSE-IN-DEPTH MATRIX (MONGODB vs. SQL SERVER)
=============================================================================================================
Security Dimension             MongoDB (Primary Operational)      SQL Server (Reporting Warehouse)
-------------------------------------------------------------------------------------------------------------
Direct Patient Identifiers     Encrypted via CSFLE (AES-256-GCM)  DROPPED (Zero presence in database)
Clinical Calculation Fields    TDE at-rest + Field validation     TDE at-rest + Native typed relational columns
Double-Blind Treatment Arm     CSFLE / Restricted Key Access      Masked as 'BLINDED' until database lock
Disk Storage Encryption        FIPS 140-2 Level 3 HSM Keys        AES-256 Transparent Data Encryption (TDE)
Network In-Transit Security    TLS 1.3 Enforced                   TLS 1.3 Enforced
Access Permissions             Site Coordinators, Investigators   Biostatisticians, Data Managers, SAS/R
Legal Regulatory Status        Identified Clinical Records (PHI)  De-Identified Research Data (Safe Harbor)
=============================================================================================================
```

---

## 5. Decision Consequences

### Positive Consequences:
1. **Unbroken Reporting Calculations**: Biostatisticians and SAS scripts can freely compute study days, visit compliance, laboratory toxicity grades, and survival curves without colliding with ciphertext walls.
2. **True Patient Privacy Preservation**: Dropping `SiteIdentifier` fields at the CDC boundary ensures that even a complete compromise of the SQL Server reporting warehouse cannot re-identify patients.
3. **Zero Hardcoded Guesswork**: The Form Builder schema explicitly dictates field classification, providing clean forward-compatibility for protocol amendments and custom study forms.
4. **Preserved Double-Blind Integrity**: Blinded treatment arms are masked as `"BLINDED"`, preventing accidental unblinding of medical monitors or study statisticians prior to database lock.

### Trade-offs & Mitigations:
1. **Re-Identification Requires MongoDB Access**: If a safety emergency requires identifying a patient from an adverse event report, re-identification cannot be done in SQL Server.
   * *Mitigation:* This is an intended regulatory feature. Re-identification must follow formal GxP emergency unblinding workflows in the primary EDC system with full 21 CFR Part 11 audit logging.
