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
1. 4-Tier Zero-Trust Data          Form Builder schema tags every field:     Eliminates guesswork; establishes
   Classification                  `SiteIdentifier`, `ClinicalResearch`,     unambiguous field routing before
   (`dataClassification`)         `BlindedRTSM`, or `Quarantine`.           a study is ever published.
-------------------------------------------------------------------------------------------------------------
2. Hard Drop of Patient PII        `SiteIdentifier` fields (MRN, Initials)   Zero patient identity leaks to SQL;
   (Site-Held Patient Linkage)     are CSFLE in MongoDB and DROPPED by CDC.  CSFLE security purpose is preserved.
                                   (Note: Distinct from study center SITEID)
-------------------------------------------------------------------------------------------------------------
3. Fail-Closed Zero-Trust Guard    Fields missing schema metadata or         Completely prevents fail-open leaks;
   (Quarantine Boundary)           unclassified default to `Quarantine`      unregistered/misspelled fields are
                                  and are routed to CDC DLQ, NOT to SQL.    never exposed to reporting warehouse.
-------------------------------------------------------------------------------------------------------------
4. Queryable Clinical Research     `ClinicalResearch` fields (Dates, Labs,   SAS, R, and PowerBI run all report
   Data in SQL Server              Vitals) replicate as typed columns under  calculations with zero decryption
                                  SQL Server TDE (at rest) + TLS 1.3.       friction or performance penalties.
-------------------------------------------------------------------------------------------------------------
5. Treatment Arm Masking (RTSM)    `BlindedRTSM` fields are written as       Prevents double-blind trial spoilage
                                  `"BLINDED"` in SQL Server until Hard Lock. across the reporting tier.
-------------------------------------------------------------------------------------------------------------
6. In-Memory CDC Worker Enclave    .NET 9 worker processes change streams    Zero unencrypted disk spills during
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
  "dataClassification": "SiteIdentifier" // 🔒 Patient PII: CSFLE in Mongo, DROPPED from SQL (Not study center SITEID)
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

### Decision 2: The Four Clinical Data Tiers & Fail-Closed Processing Rules

```
                               THE 4-TIER DATA PROCESSING BOUNDARY
                                                │
         ┌──────────────────┬───────────────────┴───────────────────┬──────────────────┐
         ▼                  ▼                                       ▼                  ▼
1. SiteIdentifier    2. ClinicalResearch                     3. BlindedRTSM     4. Quarantine / Unknown
• Examples: Hospital • Examples: Visit Dates, Birth Year,    • Examples: Cohort • Examples: Missing schema,
  MRN, Initials,       Vitals, Chemistry Labs, Adverse         Treatment Arm,     misspelled keys, dynamic/
  Patient Contact.     Events, Concomitant Medications.        Kit Number.        unregistered form fields.
• In MongoDB:        • In MongoDB:                           • In MongoDB:      • In MongoDB:
  CSFLE (AES-256).     TDE at-rest + RBAC.                     CSFLE / Role.      TDE / Schema validator.
• In CDC Pipeline:   • In CDC Pipeline:                      • In CDC Pipeline: • In CDC Pipeline:
  DROPPED COMPLETELY!  Replicated directly to SQL Server.      Masked as          FAIL-CLOSED HARD DROP!
• In SQL Server:     • In SQL Server:                          "BLINDED".         Routed to CDC Dead-Letter.
  ❌ DOES NOT EXIST.   Typed SQL columns (sdtm.DM, etc.).   • In SQL Server:   • In SQL Server:
• Rationale: PII     • Rationale: Needed for --DY, age, and    Masked string.     ❌ NEVER WRITTEN.
  must never reach     efficacy report calculations.         • Rationale: Trial • Rationale: Prevents fail-
  reporting tier.                                              blinding safe.     open PII/unblinding leaks.
```

#### Why This Resolves the Security Dilemma:
* **The "Hacker Dump" Test**: If a rogue user or attacker dumps the SQL Server database, **they cannot re-identify any patient** because `SiteIdentifier` fields (MRN, initials, contact data) were never replicated. Under **HIPAA § 164.514(b) (Safe Harbor Standard)** and **EU GDPR Recital 26**, SQL Server contains solely **De-Identified Research Data**.
* **The Fail-Closed Zero-Trust Guarantee**: Defaulting unclassified, unregistered, or misspelled fields to `Quarantine` ensures the boundary **fails closed**. If an unapproved or dynamic field (e.g., `national_id` or `patient_cell`) appears in MongoDB, it is automatically blocked and quarantined—never passing through to the SQL Server reporting warehouse.
* **The Reporting Utility Guarantee**: Because verified `ClinicalResearch` fields land as native typed columns (e.g., `DATETIME2`, `DECIMAL(10,2)`, `VARCHAR(50)`), biostatisticians and SAS programs can execute range filters (`AGE >= 65`), date arithmetic (`AVAL - BASE`), and survival models without decryption overhead.

#### Regulatory Rationale: Why a "Separate Pseudonym" Is Not Required for `SubjectId`
A common question in cryptographic reviews is whether the CDC boundary should derive an additional, secondary pseudonym for `SubjectId` before inserting records into SQL Server. Deriving a secondary pseudonym is **unnecessary and actively harmful** in clinical EDC architectures for three reasons:

1. **`SubjectId` Is Already an Approved Pseudonym by Clinical Design**:
   Under **ICH GCP E6(R2)** and **FDA 21 CFR Part 11**, clinical EDC platforms are legally prohibited from using direct patient identifiers (such as national ID, SSN, or hospital medical record numbers) as the subject key. When a patient is screened or enrolled, the EDC generates a synthetic protocol identifier (e.g., `1001-004`, indicating Site 1001, Subject 4). The re-identification key linking that number to the actual human patient exists solely in the Investigator's Confidential Subject Identification Code List maintained at the physical investigative site, and inside MongoDB `SiteIdentifier` fields (which are CSFLE-encrypted and dropped by the CDC worker).
2. **CDISC SDTM Relational Integrity (`USUBJID`) & Regulatory Submission**:
   Regulatory agencies (FDA, EMA, PMDA) require all submission datasets across all clinical domains (`DM` Demographics, `AE` Adverse Events, `VS` Vitals, `LB` Labs, etc.) to share the exact same Unique Subject Identifier (`USUBJID = CONCAT(STUDYID, '-', SUBJID)`). Deriving a secondary or hashed pseudonym at the CDC boundary would destroy relational joins across analytical domains and break end-to-end data lineage back to the primary 21 CFR Part 11 EDC audit trail.
3. **Fail-Closed Enforcement Over Dummy Fallbacks**:
   While `SubjectId` does not need secondary hashing, it **must never fall back to `"UNKNOWN"`**. If a MongoDB change event lacks a valid `subject_id`, it indicates a corrupted BSON payload. The CDC boundary strictly rejects the record and routes it to the Dead-Letter Quarantine (`RecordQuarantinedRecordAsync`), preventing orphan reporting rows in SQL Server.

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
│    • Retain verified `ClinicalResearch` fields                         │
│    • FAIL-CLOSED: Route unmapped/missing fields (`Quarantine`)        │
│      to CDC Dead-Letter Quarantine & alert CDM (Zero SQL Leak)         │
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

* **Global Multi-Region VPC Placement ([Scale 005-A](../scaling-architecture/005-a-multilingual-study-db-per-site-group-and-reporting-guide.md)):** For `MultiRegionGeoPartitioned` trials, `Vialiq.CdcWorker` deploys symmetrically **inside each regional VPC** (`ZONE_US`, `ZONE_EU`, `ZONE_CN`), ensuring `SiteIdentifier` PII is hard-dropped inside its origin country before pseudonymized `ClinicalResearch` records (plus PII-scrubbed, `Site → Base` translated / MedDRA-coded terms and regional KPI rollups) stream over TLS 1.3 into the Central SQL Server 2022 reporting warehouse.
* **Single Canonical CDC Engine & Disaster Recovery Guard:** All deployments (`Single` and `MultiRegionGeoPartitioned`) standardize strictly on `.NET 9 Vialiq.CdcWorker` native MongoDB Change Streams (`readConcern: "majority"`) — **zero Apache Kafka or Debezium clusters**. Normal MongoDB HA failover handles Primary $\rightarrow$ Secondary promotion without SQL drift because Change Streams stream majority-committed writes only; in the rare catastrophic event SREs execute a manual PITR restore (`mongorestore --oplogLimit`), ops resets `Vialiq.CdcWorker` `resumeToken`s, flushes regional Redis volatile caches, and runs a zone-scoped SQL `MERGE` re-sync pass so Central SQL Server matches the restored database.

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
  | 'ClinicalResearch'  // 📊 Protocol study data (Dates, vitals, labs). Replicated to SQL Server.
  | 'BlindedRTSM'       // 🙈 Randomization treatment arm. Masked as 'BLINDED' in SQL Server.
  | 'Quarantine';       // ⚠️ Zero-Trust Fail-Closed: Unknown/unclassified fields quarantined, NEVER replicated to SQL.

export interface BaseComponentSchema {
  id: string;
  key: string;
  type: string;
  label: string;
  
  /**
   * Data classification governing cryptographic isolation and CDC replication routing.
   * Required for production study forms. Unclassified or missing metadata strictly evaluates
   * to 'Quarantine' at the CDC ingestion boundary (Fail-Closed).
   */
  dataClassification: DataClassification;
  
  validation?: ValidationRule[];
}
```

### 3.2 CDC Ingress Transformation Engine (`CdcRecordTransformer.cs`)

```csharp
namespace Vialiq.CdcWorker.Services;

using Microsoft.Extensions.Logging;
using System.Text.Json;
using Vialiq.Core.Entities;
using Vialiq.Core.Enums;
using Vialiq.Core.Models;

public sealed class CdcRecordTransformer : ICdcRecordTransformer
{
    private readonly IFormSchemaRegistry _schemaRegistry;
    private readonly ICdcQuarantineService _quarantineService;
    private readonly ILogger<CdcRecordTransformer> _logger;

    public CdcRecordTransformer(
        IFormSchemaRegistry schemaRegistry,
        ICdcQuarantineService quarantineService,
        ILogger<CdcRecordTransformer> logger)
    {
        _schemaRegistry = schemaRegistry;
        _quarantineService = quarantineService;
        _logger = logger;
    }

    /// <summary>
    /// Transforms raw MongoDB CRF BSON document into a clean, de-identified SDTM record.
    /// Strictly enforces a zero-trust FAIL-CLOSED cryptographic boundary:
    /// - Drops SiteIdentifier fields (MRN, initials).
    /// - Masks BlindedRTSM fields to 'BLINDED'.
    /// - Passes through explicitly verified ClinicalResearch fields.
    /// - Quarantines and drops any unclassified, misspelled, or unregistered fields.
    /// </summary>
    public async Task<SdtmRecord?> TransformAsync(
        string studyId, 
        string formId, 
        Dictionary<string, object?> rawFields, 
        CancellationToken ct)
    {
        // 1. Mandatory Primary Key Validation (Fail-Closed)
        // In clinical trials, subject_id is already an FDA/GCP-compliant pseudonym (e.g. '1001-004').
        // If subject_id is missing or empty, the record is corrupted and rejected from entering SQL Server.
        // A fallback like "UNKNOWN" is strictly prohibited to prevent orphan reporting records.
        if (!rawFields.TryGetValue("subject_id", out var rawSubId) || 
            rawSubId is null || 
            string.IsNullOrWhiteSpace(rawSubId.ToString()))
        {
            _logger.LogError(
                "CDC Ingress Boundary: CRF entry in Study '{StudyId}', Form '{FormId}' lacks mandatory subject_id. Rejecting record to Dead-Letter Quarantine.",
                studyId, formId);

            await _quarantineService.RecordQuarantinedRecordAsync(
                studyId, formId, "Missing mandatory subject_id", ct);
            return null;
        }

        var subjectId = rawSubId.ToString()!;
        var schema = await _schemaRegistry.GetFormSchemaAsync(studyId, formId, ct);
        var cleanFields = new Dictionary<string, object?>();

        foreach (var (fieldKey, value) in rawFields)
        {
            var fieldMeta = schema?.FindField(fieldKey);

            // FAIL-CLOSED ZERO-TRUST BOUNDARY:
            // If the field is missing from the schema registry, misspelled, or lacks metadata,
            // strictly default to Quarantine. NEVER fail-open to ClinicalResearch!
            var classification = fieldMeta?.DataClassification ?? DataClassification.Quarantine;

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
                    // PASS-THROUGH: Retain queryable typed data for report calculations
                    cleanFields[fieldKey] = value;
                    break;

                case DataClassification.Quarantine:
                default:
                    // FAIL-CLOSED HARD DROP & AUDIT QUARANTINE:
                    // A field that is unregistered, misspelled, or unclassified must NEVER enter SQL Server.
                    _logger.LogWarning(
                        "CDC Ingress Boundary: Field '{FieldKey}' in Study '{StudyId}', Form '{FormId}' has missing or invalid classification metadata. Quarantining field.",
                        fieldKey, studyId, formId);

                    await _quarantineService.RecordQuarantinedFieldAsync(new QuarantinedFieldEntry(
                        StudyId: studyId,
                        FormId: formId,
                        SubjectId: subjectId,
                        FieldKey: fieldKey,
                        ValueDigestSha256: ComputeSha256Digest(value), // Zero plaintext PII stored in quarantine
                        Reason: fieldMeta == null 
                            ? "Field key not found in registered form schema" 
                            : "Field metadata lacks valid DataClassification",
                        QuarantinedAtUtc: DateTime.UtcNow
                    ), ct);

                    // Strictly dropped from cleanFields to preserve privacy and blinding
                    continue;
            }
        }

        return new SdtmRecord(
            StudyId: studyId,
            SubjectId: subjectId,
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

#### 3.3.1 Disambiguation: Why `SITEID` & `USUBJID` Exist in SQL Despite Dropping Patient Identifiers

A common review question is why `sdtm.DM` retains `SITEID` and `USUBJID` if "SiteIdentifier" fields are dropped at the CDC boundary. This is intentional, mathematically safe, and required by global regulatory frameworks:

```
=============================================================================================================
CLINICAL TRIAL DISAMBIGUATION: STUDY SITE CODES vs. PATIENT DIRECT IDENTIFIERS
=============================================================================================================
Concept                      Entity Identified        SQL Server Status        Regulatory & GxP Rationale
-------------------------------------------------------------------------------------------------------------
`SITEID`                     Clinical Trial Center    MANDATORY COLUMN         Required by CDISC SDTM v3.3 &
(e.g., '101', 'SITE-MAYOC')  (Clinic / Hospital)      (Retained in sdtm.DM)    ICH E9 multi-center effect tests.
                                                                               Identifies the institution, NOT
                                                                               the human subject (Safe Harbor).
-------------------------------------------------------------------------------------------------------------
`USUBJID`                    De-Identified Subject    PRIMARY KEY              Required primary key across ALL
(e.g., 'STUDY-101-0004')     Trial Pseudonym          (Retained in sdtm.DM)    CDISC tables (DM, AE, VS, LB).
                                                                               Protocol-assigned synthetic key
                                                                               with zero direct patient PHI.
-------------------------------------------------------------------------------------------------------------
`SiteIdentifier`             Human Patient Identity   HARD DROPPED (0 presence) HIPAA § 164.514(b) Direct
(e.g., Hospital MRN,         (Direct PHI/PII held     NEVER written to SQL     Identifiers. Statistical reports
Patient Initials, Phone)     at local hospital site)                           never compute on patient PII.
=============================================================================================================
```

> [!IMPORTANT]
> **CDISC & Pinnacle 21 Compliance:**  
> Removing `SITEID` or `USUBJID` from `sdtm.DM` would trigger an immediate fatal rejection (`SD0001: Required variable not present`) during regulatory submission to the FDA, EMA, or PMDA. In clinical research, an investigative site code (`SITEID`) is administrative operational metadata, **not** Protected Health Information (PHI).

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
Missing / Unclassified Fields  Document Field (or Mongo Validator) QUARANTINED & DROPPED (Dead-letter log)
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
3. **Fail-Closed Zero-Trust Pipeline**: Misspelled, unapproved, or unclassified form fields cannot leak patient PII or unblinded study data through omission; unknown fields are automatically routed to dead-letter quarantine rather than failing open.
4. **Zero Hardcoded Guesswork**: The Form Builder schema explicitly dictates field classification, providing clean forward-compatibility for protocol amendments and custom study forms.
5. **Preserved Double-Blind Integrity**: Blinded treatment arms are masked as `"BLINDED"`, preventing accidental unblinding of medical monitors or study statisticians prior to database lock.

### Trade-offs & Mitigations:
1. **Re-Identification Requires MongoDB Access**: If a safety emergency requires identifying a patient from an adverse event report, re-identification cannot be done in SQL Server.
   * *Mitigation:* This is an intended regulatory feature. Re-identification must follow formal GxP emergency unblinding workflows in the primary EDC system with full 21 CFR Part 11 audit logging.
2. **Unregistered Form Fields Excluded From Reports Until Schema Approval**: If a form developer adds a field in MongoDB without registering it in Form Builder, biostatisticians will not see it in SQL Server immediately.
   * *Mitigation:* The CDC worker writes to a dead-letter quarantine log (`cdc_quarantine_records`) and triggers an alert for Clinical Data Managers. Once the schema amendment is officially published, a replay job projects the historical records into SQL Server without data loss.
