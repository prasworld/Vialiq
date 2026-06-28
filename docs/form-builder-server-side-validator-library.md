# Form Builder — Server-Side Validator Library

> **Status:** Active — Architecture & Catalog  
> **Date:** 2026-05-30  
> **Purpose:** Pre-built, configurable server-side edit check library for study designers  
> Related docs: [server-side implementation](./form-builder-custom-programming-server-side.md) · [client-side implementation](./form-builder-custom-programming-implementation.md) · [use cases](./form-builder-custom-programming-use-cases.md)

---

## 1. Overview

### 1.1 The Problem

Server-side validation patterns are **common across studies** but require:
- Cross-visit database access (baseline consistency, visit windows)
- Medical coding services (MedDRA/WHODrug validation)
- Regulatory timeline enforcement (SAE 24-hour rule, SUSAR reporting)
- Complex eligibility gating

Without a library, every client must:
1. Write custom C# validators for common patterns
2. Test and validate their code
3. Maintain across platform updates
4. Re-implement the same checks per study

This is inefficient, error-prone, and creates regulatory risk.

### 1.2 The Solution: Configurable Validator Library

Provide a **catalog of pre-built server-side validators** that study designers can:

1. **Select** from Form Builder UI (no coding required)
2. **Configure** parameters via form inputs
3. **Save** configuration in study schema
4. **Execute** automatically at runtime with parameter extraction from patient data

**Example:** Instead of writing C# code for "visit must occur within ±3 days of Day 28", the study designer:
- Selects "Visit Window Compliance" validator from catalog
- Configures: `baselineVisit: "SCREENING"`, `targetDay: 28`, `windowDays: 3`
- Platform executes this check server-side for all subjects

### 1.3 Hybrid Model

| Validator Type | Who Creates | Configuration | Use Case |
|----------------|-------------|---------------|----------|
| **Library Validators** | Platform team | Study designer via UI | 80% of server-side checks — common patterns |
| **Custom Validators** | Client developers | C# code in extension package | 20% — truly unique study-specific logic |

Both types execute in the same validation pipeline. Library validators are preferred for maintainability and regulatory compliance.

---

## 2. Architecture

### 2.1 Components

```
┌─────────────────────────────────────────────────────────────┐
│ Form Builder UI (Study Designer)                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Server-Side Validation Configuration                    │ │
│ │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │ │
│ │ │ Select Check │→ │ Configure    │→ │ Save to      │  │ │
│ │ │ from Catalog │  │ Parameters   │  │ Form Schema  │  │ │
│ │ └──────────────┘  └──────────────┘  └──────────────┘  │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ (saves JSON)
┌─────────────────────────────────────────────────────────────┐
│ Study Schema (Database / JSON)                              │
│ {                                                           │
│   "formId": "VS_DAY28",                                     │
│   "serverValidations": [                                    │
│     {                                                       │
│       "checkId": "visit-window-compliance",                 │
│       "parameters": {                                       │
│         "baselineVisitId": "SCREENING",                     │
│         "targetDay": 28,                                    │
│         "windowDays": 3                                     │
│       },                                                    │
│       "severity": "warning"                                 │
│     }                                                       │
│   ]                                                         │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓ (runtime execution)
┌─────────────────────────────────────────────────────────────┐
│ Server-Side Validation Pipeline                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Validator Execution Engine                              │ │
│ │ 1. Read form schema serverValidations[]                 │ │
│ │ 2. For each checkId, resolve IServerEditCheck           │ │
│ │ 3. Extract parameters from patient data                 │ │
│ │ 4. Execute validator with ValidationContext             │ │
│ │ 5. Aggregate results → QueryGeneration                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Validator Library (Platform-Provided)                  │  │
│ │ • VisitWindowComplianceValidator                       │  │
│ │ • BaselineConsistencyValidator                         │  │
│ │ • SaeNotificationTimelineValidator                     │  │
│ │ • MedDRAPTValidationValidator                          │  │
│ │ • SUSARDetectionValidator                              │  │
│ │ • EligibilityCriteriaValidator                         │  │
│ │ • ... (catalog below)                                  │  │
│ └────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Validator Interface

All validators implement `IServerEditCheck`:

```csharp
public interface IServerEditCheck
{
    /// <summary>Unique identifier for catalog lookup</summary>
    string CheckId { get; }
    
    /// <summary>Metadata for Form Builder UI</summary>
    ValidatorMetadata Metadata { get; }
    
    /// <summary>Execute validation with runtime context</summary>
    Task<Result> Execute(ValidationContext context, Dictionary<string, object> parameters);
}

public record ValidatorMetadata
{
    public string Name { get; init; }              // "Visit Window Compliance"
    public string Category { get; init; }          // "Cross-Visit Validation"
    public string Description { get; init; }       // Long description for UI
    public ValidatorParameter[] Parameters { get; init; }
    public string[] RequiredRoles { get; init; }   // ["data-manager", "safety-reviewer"]
    public bool RequiresDatabase { get; init; }    // true = needs cross-visit data
    public string[] Tags { get; init; }            // ["gcp", "oncology", "safety"]
}

public record ValidatorParameter
{
    public string Key { get; init; }               // "baselineVisitId"
    public string Label { get; init; }             // "Baseline Visit"
    public ParameterType Type { get; init; }       // VisitReference, FieldReference, Integer, etc.
    public object? DefaultValue { get; init; }
    public bool Required { get; init; } = true;
    public string? HelpText { get; init; }
}

public enum ParameterType
{
    FieldReference,      // Select field from form schema
    VisitReference,      // Select visit from study schedule
    FormReference,       // Select form from study
    Integer,
    Decimal,
    String,
    Boolean,
    Date,
    TimeSpan,
    EnumValue,           // Dropdown with options
    MedDRAVersion,       // MedDRA version selector
    CTCAEVersion         // CTCAE version selector
}
```

### 2.3 Study Schema Format

Server-side validations are stored in `FormSchema.serverValidations[]`:

```typescript
interface FormSchema {
  formId: string;
  fields: FieldSchema[];
  
  // Client-side validations (existing)
  validations?: ValidationRule[];
  
  // Server-side validations (NEW)
  serverValidations?: ServerValidationRule[];
}

interface ServerValidationRule {
  checkId: string;                        // Maps to IServerEditCheck.CheckId
  parameters: Record<string, unknown>;    // Configured by study designer
  severity: 'error' | 'warning';
  queryTemplate?: string;                 // Query text template
  enabled?: boolean;                      // Can disable without deleting
  description?: string;                   // Study-specific notes
}
```

**Example:**

```json
{
  "formId": "AE_SAE_FORM",
  "serverValidations": [
    {
      "checkId": "sae-notification-timeline",
      "parameters": {
        "aeOnsetField": "AESTDTC",
        "notificationDateField": "SAENOTDT",
        "maxHours": 24
      },
      "severity": "error",
      "queryTemplate": "SAE notification delayed beyond 24-hour GCP requirement (actual: {{actualHours}}h)",
      "description": "ICH-GCP E2A requires notification within 24 hours of awareness"
    },
    {
      "checkId": "meddra-pt-validation",
      "parameters": {
        "ptCodeField": "AEDECOD_PT",
        "socCodeField": "AESOC",
        "meddraVersion": "26.1"
      },
      "severity": "error",
      "queryTemplate": "Invalid MedDRA PT code or SOC inconsistency"
    }
  ]
}
```

### 2.4 Execution Engine

The validation pipeline reads `serverValidations[]` and executes validators:

```csharp
public class ServerValidationEngine
{
    private readonly IServerEditCheckRegistry _registry;
    private readonly IFormRepository _formRepo;
    
    public async Task<ValidationResult> ValidateForm(
        string studyId,
        string formId,
        FormData formData,
        CancellationToken ct)
    {
        var schema = await _formRepo.GetFormSchema(studyId, formId, ct);
        var results = new List<Result>();
        
        foreach (var rule in schema.ServerValidations ?? [])
        {
            if (rule.Enabled == false) continue;
            
            // Resolve validator from registry
            var validator = _registry.GetValidator(rule.CheckId);
            if (validator == null)
            {
                results.Add(Result.Fail($"Unknown validator: {rule.CheckId}"));
                continue;
            }
            
            // Build validation context
            var context = new ValidationContext<FormData>(
                formData,
                schema,
                _formRepo,
                studyId,
                formId
            );
            
            // Execute with configured parameters
            var result = await validator.Execute(context, rule.Parameters);
            
            // Apply severity override
            if (rule.Severity == "warning" && result.IsFailure)
                result = result.ToWarning();
            
            results.Add(result);
        }
        
        return new ValidationResult(results);
    }
}
```

---

## 3. Validator Catalog

### 3.1 Category: Cross-Visit Validation

#### **3.1.1 Visit Window Compliance**

**CheckId:** `visit-window-compliance`

**Purpose:** Validate that visit occurred within protocol-defined window relative to baseline.

**Parameters:**

| Key | Type | Description | Required | Default |
|-----|------|-------------|----------|---------|
| `baselineVisitId` | VisitReference | Visit to calculate from | Yes | - |
| `targetDay` | Integer | Target day from baseline | Yes | - |
| `windowDays` | Integer | Allowed deviation ± days | Yes | - |
| `visitDateField` | FieldReference | Field containing visit date | Yes | - |
| `severity` | Enum | `error` or `warning` | No | `warning` |

**Example:**

```json
{
  "checkId": "visit-window-compliance",
  "parameters": {
    "baselineVisitId": "SCREENING",
    "targetDay": 28,
    "windowDays": 3,
    "visitDateField": "VSDAT"
  },
  "severity": "warning"
}
```

**Validation Logic:**

```csharp
public async Task<Result> Execute(ValidationContext ctx, Dictionary<string, object> p)
{
    var baselineVisit = await ctx.GetVisitDate(p["baselineVisitId"] as string);
    var targetDay = (int)p["targetDay"];
    var windowDays = (int)p["windowDays"];
    var visitDate = ctx.GetField<DateTime>(p["visitDateField"] as string);
    
    var daysSinceBaseline = (visitDate - baselineVisit).Days;
    var deviation = Math.Abs(daysSinceBaseline - targetDay);
    
    if (deviation > windowDays)
        return Result.Warn($"Visit on Day {daysSinceBaseline} (target Day {targetDay} ±{windowDays}d)");
    
    return Result.Pass();
}
```

---

#### **3.1.2 Baseline Value Consistency**

**CheckId:** `baseline-consistency`

**Purpose:** Validate that a baseline value has not changed across visits (e.g., demographics).

**Parameters:**

| Key | Type | Description | Required | Default |
|-----|------|-------------|----------|---------|
| `baselineVisitId` | VisitReference | Visit defining baseline | Yes | - |
| `fieldToCheck` | FieldReference | Field that must be consistent | Yes | - |
| `tolerance` | Decimal | Allowed % change for numeric fields | No | 0 |

**Example:**

```json
{
  "checkId": "baseline-consistency",
  "parameters": {
    "baselineVisitId": "SCREENING",
    "fieldToCheck": "RACE",
    "tolerance": 0
  },
  "severity": "error"
}
```

**Use Case:** Subject's race at Day 28 must match Screening visit.

---

#### **3.1.3 Prior Value Required**

**CheckId:** `prior-value-required`

**Purpose:** Validate that a value exists in a prior visit before current visit can proceed.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `priorVisitId` | VisitReference | Visit containing required value |
| `requiredField` | FieldReference | Field that must have data |
| `currentVisitId` | VisitReference | Visit being validated |

**Example:** Cannot enter Day 28 tumor assessment without baseline tumor assessment.

---

### 3.2 Category: Safety & Pharmacovigilance

#### **3.2.1 SAE Notification Timeline**

**CheckId:** `sae-notification-timeline`

**Purpose:** Enforce ICH-GCP E2A requirement that SAEs be reported within 24 hours.

**Parameters:**

| Key | Type | Description | Required | Default |
|-----|------|-------------|----------|---------|
| `aeOnsetField` | FieldReference | AE onset date | Yes | - |
| `notificationDateField` | FieldReference | SAE notification date | Yes | - |
| `maxHours` | Integer | Maximum hours allowed | No | 24 |
| `awarenessDateField` | FieldReference | Date of awareness (if different) | No | - |

**Example:**

```json
{
  "checkId": "sae-notification-timeline",
  "parameters": {
    "aeOnsetField": "AESTDTC",
    "notificationDateField": "SAENOTDT",
    "maxHours": 24
  },
  "severity": "error",
  "queryTemplate": "SAE notification delayed {{actualHours}} hours (max 24h per GCP)"
}
```

---

#### **3.2.2 SUSAR Detection**

**CheckId:** `susar-detection`

**Purpose:** Detect Suspected Unexpected Serious Adverse Reactions requiring expedited reporting.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `seriousField` | FieldReference | Boolean: Is SAE? |
| `relatedField` | FieldReference | Causality: Related to drug? |
| `expectedField` | FieldReference | Boolean: Expected per IB? |
| `outcomeField` | FieldReference | Outcome (fatal, life-threatening, etc.) |

**Logic:** SUSAR = Serious + Related + Unexpected

**Example:**

```json
{
  "checkId": "susar-detection",
  "parameters": {
    "seriousField": "AESER",
    "relatedField": "AEREL",
    "expectedField": "AEEXPECT",
    "outcomeField": "AEOUT"
  },
  "severity": "error",
  "queryTemplate": "SUSAR detected - expedited reporting required ({{reportingDeadline}})"
}
```

**Reporting deadlines:**
- Fatal/life-threatening: 7 calendar days
- Other serious: 15 calendar days

---

#### **3.2.3 Grade Progression Validation**

**CheckId:** `grade-progression-validation`

**Purpose:** Validate CTCAE grade changes are clinically plausible.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `gradeField` | FieldReference | CTCAE grade field |
| `allowIncrease` | Boolean | Allow grade to increase |
| `allowDecrease` | Boolean | Allow grade to decrease |
| `requireExplanation` | Boolean | Require explanation field if decrease |
| `explanationField` | FieldReference | Explanation field reference |

**Example:** Grade cannot decrease without clinician explanation.

---

### 3.3 Category: Medical Coding

#### **3.3.1 MedDRA PT Validation**

**CheckId:** `meddra-pt-validation`

**Purpose:** Validate MedDRA Preferred Term code exists in specified version.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `ptCodeField` | FieldReference | PT code field (8-digit) |
| `meddraVersion` | MedDRAVersion | e.g., "26.1", "27.0" |
| `ptTextField` | FieldReference | PT text field (optional consistency check) |

**Example:**

```json
{
  "checkId": "meddra-pt-validation",
  "parameters": {
    "ptCodeField": "AEDECOD_PT",
    "meddraVersion": "26.1",
    "ptTextField": "AEDECOD"
  }
}
```

**Validation:**
1. PT code exists in MedDRA v26.1
2. PT text matches PT code (if provided)

---

#### **3.3.2 MedDRA Hierarchy Consistency**

**CheckId:** `meddra-hierarchy-consistency`

**Purpose:** Validate PT → HLT → HLGT → SOC hierarchy is correct.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `ptCodeField` | FieldReference | PT code |
| `socCodeField` | FieldReference | SOC code |
| `meddraVersion` | MedDRAVersion | MedDRA version |

**Logic:** Query MedDRA service to verify PT's primary SOC matches provided SOC.

---

#### **3.3.3 WHODrug Validation**

**CheckId:** `whodrug-validation`

**Purpose:** Validate WHODrug code and hierarchy.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `drugCodeField` | FieldReference | WHODrug code |
| `atcCodeField` | FieldReference | ATC code (optional) |
| `whodrugVersion` | String | e.g., "2024-Q1" |

---

### 3.4 Category: Eligibility & Randomization

#### **3.4.1 Inclusion Criteria Gate**

**CheckId:** `inclusion-criteria-gate`

**Purpose:** Validate all inclusion criteria are met before randomization.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `inclusionFields` | FieldReference[] | Array of boolean fields |
| `requiredCount` | Integer | How many must be true (default: all) |

**Example:**

```json
{
  "checkId": "inclusion-criteria-gate",
  "parameters": {
    "inclusionFields": ["IC1", "IC2", "IC3", "IC4"],
    "requiredCount": 4
  },
  "severity": "error"
}
```

---

#### **3.4.2 Exclusion Criteria Gate**

**CheckId:** `exclusion-criteria-gate`

**Purpose:** Validate no exclusion criteria are met.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `exclusionFields` | FieldReference[] | Array of boolean fields |

**Logic:** All exclusion fields must be `false` or empty.

---

### 3.5 Category: Oncology-Specific

#### **3.5.1 RECIST Response Confirmation**

**CheckId:** `recist-response-confirmation`

**Purpose:** Validate CR/PR requires confirmation ≥4 weeks later per RECIST 1.1.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `responseField` | FieldReference | Response: CR, PR, SD, PD |
| `assessmentDateField` | FieldReference | Assessment date |
| `minConfirmationDays` | Integer | Minimum days for confirmation (default: 28) |

**Example:**

```json
{
  "checkId": "recist-response-confirmation",
  "parameters": {
    "responseField": "TURESP",
    "assessmentDateField": "TUDAT",
    "minConfirmationDays": 28
  },
  "severity": "warning"
}
```

**Logic:**
1. If current assessment = CR or PR
2. Query prior assessments
3. Must have CR/PR at least 28 days prior

---

#### **3.5.2 Tumor Burden Calculation**

**CheckId:** `tumor-burden-calculation`

**Purpose:** Validate sum of target lesion diameters.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `lesionFields` | FieldReference[] | Array of lesion diameter fields |
| `sumField` | FieldReference | Calculated sum field |
| `tolerance` | Decimal | Allowed deviation (mm) |

---

### 3.6 Category: Protocol Compliance

#### **3.6.1 Study Drug Dose Cap**

**CheckId:** `study-drug-dose-cap`

**Purpose:** Validate dose does not exceed protocol-defined maximum.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `doseField` | FieldReference | Dose value |
| `maxDose` | Decimal | Maximum allowed dose |
| `doseUnit` | String | e.g., "mg", "mg/kg" |

---

#### **3.6.2 Prior Washout Period**

**CheckId:** `prior-washout-period`

**Purpose:** Validate washout period between prior therapy and study drug.

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `priorTherapyEndField` | FieldReference | Prior therapy end date (from MH form) |
| `studyDrugStartField` | FieldReference | Study drug start date |
| `minWashoutDays` | Integer | Minimum washout days |

---

### 3.7 Category: Data Consistency

#### **3.7.1 BMI Consistency**

**CheckId:** `bmi-consistency`

**Purpose:** Validate BMI = weight (kg) / height (m)².

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `weightField` | FieldReference | Weight in kg |
| `heightField` | FieldReference | Height in cm |
| `bmiField` | FieldReference | BMI field |
| `tolerance` | Decimal | Allowed % deviation |

**Example:**

```json
{
  "checkId": "bmi-consistency",
  "parameters": {
    "weightField": "VSORRES_WEIGHT",
    "heightField": "VSORRES_HEIGHT",
    "bmiField": "VSORRES_BMI",
    "tolerance": 0.05
  }
}
```

---

#### **3.7.2 Unit Conversion Consistency**

**CheckId:** `unit-conversion-consistency`

**Purpose:** Validate unit conversions are correct (e.g., mg/dL ↔ mmol/L).

**Parameters:**

| Key | Type | Description |
|-----|------|-------------|
| `sourceField` | FieldReference | Value in source unit |
| `sourceUnit` | String | e.g., "mg/dL" |
| `targetField` | FieldReference | Value in target unit |
| `targetUnit` | String | e.g., "mmol/L" |
| `conversionFactor` | Decimal | Multiplication factor |

---

### 3.8 Full Catalog Summary

| CheckId | Category | Requires DB | Medical Coding | GCP/Regulatory |
|---------|----------|-------------|----------------|----------------|
| `visit-window-compliance` | Cross-Visit | ✅ | ❌ | ✅ |
| `baseline-consistency` | Cross-Visit | ✅ | ❌ | ✅ |
| `prior-value-required` | Cross-Visit | ✅ | ❌ | ❌ |
| `sae-notification-timeline` | Safety | ❌ | ❌ | ✅ |
| `susar-detection` | Safety | ❌ | ❌ | ✅ |
| `grade-progression-validation` | Safety | ✅ | ❌ | ❌ |
| `meddra-pt-validation` | Medical Coding | ❌ | ✅ | ✅ |
| `meddra-hierarchy-consistency` | Medical Coding | ❌ | ✅ | ✅ |
| `whodrug-validation` | Medical Coding | ❌ | ✅ | ✅ |
| `inclusion-criteria-gate` | Eligibility | ❌ | ❌ | ✅ |
| `exclusion-criteria-gate` | Eligibility | ❌ | ❌ | ✅ |
| `recist-response-confirmation` | Oncology | ✅ | ❌ | ❌ |
| `tumor-burden-calculation` | Oncology | ❌ | ❌ | ❌ |
| `study-drug-dose-cap` | Protocol | ❌ | ❌ | ✅ |
| `prior-washout-period` | Protocol | ✅ | ❌ | ✅ |
| `bmi-consistency` | Data Consistency | ❌ | ❌ | ❌ |
| `unit-conversion-consistency` | Data Consistency | ❌ | ❌ | ❌ |

**Total:** 17 validators in initial library. Expandable by platform and clients.

---

## 4. Form Builder UI Integration

### 4.1 Study Designer Workflow

**Step 1: Navigate to Form Schema Editor**

```
Study Management → Study "ABC-101" → Form Designer → Select Form "AE_SAE" → Server-Side Validations Tab
```

**Step 2: Add Server-Side Validator**

UI shows:
- **Button:** "Add Server Validation"
- Opens modal with validator catalog

**Step 3: Select Validator from Catalog**

Catalog UI:

```
┌─────────────────────────────────────────────────────────────────┐
│ Select Server-Side Validator                              [×]  │
├─────────────────────────────────────────────────────────────────┤
│ Category: [All ▼]  Search: [________________] [🔍]             │
├─────────────────────────────────────────────────────────────────┤
│ ☑ Cross-Visit Validation (3)                                   │
│   ├─ Visit Window Compliance         [Requires DB]             │
│   ├─ Baseline Consistency             [Requires DB]             │
│   └─ Prior Value Required             [Requires DB]             │
│                                                                 │
│ ☑ Safety & Pharmacovigilance (3)                               │
│   ├─ SAE Notification Timeline        [GCP] [★ Popular]        │
│   ├─ SUSAR Detection                  [GCP]                     │
│   └─ Grade Progression Validation                               │
│                                                                 │
│ ☑ Medical Coding (3)                                           │
│   ├─ MedDRA PT Validation             [Requires Coding Service]│
│   ├─ MedDRA Hierarchy Consistency     [Requires Coding Service]│
│   └─ WHODrug Validation               [Requires Coding Service]│
│                                                                 │
│ ☑ Eligibility & Randomization (2)                              │
│ ☑ Oncology-Specific (2)                                        │
│ ☑ Protocol Compliance (2)                                      │
│ ☑ Data Consistency (2)                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Step 4: Configure Parameters**

After selecting "SAE Notification Timeline":

```
┌─────────────────────────────────────────────────────────────────┐
│ Configure: SAE Notification Timeline                      [×]  │
├─────────────────────────────────────────────────────────────────┤
│ Enforces ICH-GCP E2A requirement that SAEs be reported within  │
│ 24 hours of site awareness.                                    │
├─────────────────────────────────────────────────────────────────┤
│ AE Onset Date Field *                                          │
│ [AESTDTC                         ▼]  ← Field picker           │
│                                                                │
│ Notification Date Field *                                      │
│ [SAENOTDT                        ▼]                            │
│                                                                │
│ Maximum Hours                                                  │
│ [24        ] (default: 24)                                     │
│                                                                │
│ Awareness Date Field (optional)                                │
│ [                                ▼]                            │
│ If different from onset date                                   │
│                                                                │
│ Severity *                                                     │
│ ◉ Error    ○ Warning                                          │
│                                                                │
│ Query Template (optional)                                      │
│ [SAE notification delayed {{actualHours}}h (max 24h per GCP)] │
│                                                                │
├─────────────────────────────────────────────────────────────────┤
│                         [Cancel]  [Save Validator]             │
└─────────────────────────────────────────────────────────────────┘
```

**Step 5: Validator Saved to Schema**

Appears in server validations list:

```
Server-Side Validations (2)                        [+ Add Validator]

┌─────────────────────────────────────────────────────────────────┐
│ ✓ SAE Notification Timeline                       [⚙] [🗑] [☰] │
│   Error | Checks AESTDTC → SAENOTDT ≤ 24h                      │
│   ICH-GCP E2A compliance                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ✓ MedDRA PT Validation                            [⚙] [🗑] [☰] │
│   Error | Validates AEDECOD_PT in MedDRA v26.1                 │
└─────────────────────────────────────────────────────────────────┘
```

**Icons:**
- ⚙ = Edit configuration
- 🗑 = Delete
- ☰ = Reorder (execution order)
- ✓/✗ = Enable/disable toggle

### 4.2 Parameter Input Types

| ParameterType | UI Component | Example |
|---------------|--------------|---------|
| `FieldReference` | Dropdown: fields from current form | `AESTDTC` |
| `VisitReference` | Dropdown: visits from study schedule | `SCREENING`, `DAY_28` |
| `FormReference` | Dropdown: forms in study | `DEMOGRAPHICS`, `VITAL_SIGNS` |
| `Integer` | Number input | `24` |
| `Decimal` | Number input with decimals | `0.05` |
| `String` | Text input | `"mg/dL"` |
| `Boolean` | Checkbox | ☑ |
| `Date` | Date picker | `2026-05-30` |
| `TimeSpan` | Duration picker | `24 hours`, `7 days` |
| `EnumValue` | Dropdown with predefined options | `CR`, `PR`, `SD`, `PD` |
| `MedDRAVersion` | Dropdown: available versions | `26.1`, `27.0` |

### 4.3 Validation Preview

Study designer can test validator configuration:

```
┌─────────────────────────────────────────────────────────────────┐
│ Test Validator                                                  │
├─────────────────────────────────────────────────────────────────┤
│ Enter sample data to preview validation:                       │
│                                                                 │
│ AESTDTC (AE Onset Date):     [2026-05-01 10:00]               │
│ SAENOTDT (Notification Date): [2026-05-03 08:00]               │
│                                                                 │
│                                    [Run Validation]             │
├─────────────────────────────────────────────────────────────────┤
│ ❌ ERROR                                                        │
│ SAE notification delayed 46.0h (max 24h per GCP)               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Custom Validator Extension

### 5.1 Client-Specific Validators

Clients can add **study-specific validators** to the library:

```csharp
// Client's custom validator package
namespace VialiqStudies.ABC101.ServerValidators;

[ServerEditCheck(CheckId = "abc101-pk-sampling-window")]
public class PkSamplingWindowValidator : IServerEditCheck
{
    public string CheckId => "abc101-pk-sampling-window";
    
    public ValidatorMetadata Metadata => new()
    {
        Name = "PK Sampling Window (ABC-101 Protocol)",
        Category = "Protocol Compliance",
        Description = "Validates PK samples collected within ±15 minutes of scheduled time",
        Parameters =
        [
            new("scheduledTimeField", "Scheduled Time", ParameterType.FieldReference),
            new("actualTimeField", "Actual Time", ParameterType.FieldReference),
            new("toleranceMinutes", "Tolerance (minutes)", ParameterType.Integer, defaultValue: 15)
        ],
        Tags = ["pk", "study-specific", "abc-101"]
    };
    
    public async Task<Result> Execute(ValidationContext ctx, Dictionary<string, object> p)
    {
        var scheduled = ctx.GetField<TimeSpan>(p["scheduledTimeField"] as string);
        var actual = ctx.GetField<TimeSpan>(p["actualTimeField"] as string);
        var tolerance = (int)p["toleranceMinutes"];
        
        var deviation = Math.Abs((actual - scheduled).TotalMinutes);
        
        if (deviation > tolerance)
            return Result.Warn($"PK sample {deviation:F0} min off schedule (tolerance ±{tolerance} min)");
        
        return Result.Pass();
    }
}
```

### 5.2 Registration

Client validators are registered via dependency injection:

```csharp
// Startup.cs
services.AddServerEditCheck<PkSamplingWindowValidator>();
```

Platform scans assemblies for `[ServerEditCheck]` attribute and registers them in `IServerEditCheckRegistry`.

### 5.3 Visibility

- **Platform validators:** Visible to all studies
- **Client validators:** Visible only to client's studies (multi-tenant isolation)

Client validators appear in Form Builder catalog with `[Custom]` badge:

```
☑ Protocol Compliance (3)
  ├─ Study Drug Dose Cap
  ├─ Prior Washout Period
  └─ PK Sampling Window (ABC-101 Protocol)  [Custom] [Study-Specific]
```

---

## 6. Testing & Quality Assurance

### 6.1 Validator Unit Tests

Each validator must have unit tests:

```csharp
public class SaeNotificationTimelineValidatorTests
{
    [Fact]
    public async Task Execute_WithinWindow_ReturnsPass()
    {
        // Arrange
        var validator = new SaeNotificationTimelineValidator();
        var formData = new FormData
        {
            Fields = new()
            {
                ["AESTDTC"] = "2026-05-01T10:00:00",
                ["SAENOTDT"] = "2026-05-02T08:00:00"  // 22 hours later
            }
        };
        var context = new ValidationContext<FormData>(formData, schema, repo, "study1", "form1");
        var parameters = new Dictionary<string, object>
        {
            ["aeOnsetField"] = "AESTDTC",
            ["notificationDateField"] = "SAENOTDT",
            ["maxHours"] = 24
        };
        
        // Act
        var result = await validator.Execute(context, parameters);
        
        // Assert
        Assert.True(result.IsSuccess);
    }
    
    [Fact]
    public async Task Execute_ExceedsWindow_ReturnsFail()
    {
        // ... similar setup with 48-hour delay
        var result = await validator.Execute(context, parameters);
        
        Assert.True(result.IsFailure);
        Assert.Contains("48", result.Message);
    }
}
```

### 6.2 Configuration Validation

Form Builder validates parameter configuration before save:

```csharp
public class ServerValidationRuleValidator : AbstractValidator<ServerValidationRule>
{
    private readonly IServerEditCheckRegistry _registry;
    
    public ServerValidationRuleValidator(IServerEditCheckRegistry registry)
    {
        _registry = registry;
        
        RuleFor(x => x.CheckId)
            .NotEmpty()
            .Must(BeValidCheckId).WithMessage("Unknown validator checkId");
        
        RuleFor(x => x.Parameters)
            .Must((rule, params) => AllRequiredParametersProvided(rule.CheckId, params))
            .WithMessage("Missing required parameters");
        
        RuleFor(x => x.Parameters)
            .Must((rule, params) => ParameterTypesValid(rule.CheckId, params))
            .WithMessage("Invalid parameter types");
    }
    
    private bool BeValidCheckId(string checkId)
        => _registry.GetValidator(checkId) != null;
    
    private bool AllRequiredParametersProvided(string checkId, Dictionary<string, object> p)
    {
        var validator = _registry.GetValidator(checkId);
        var required = validator.Metadata.Parameters.Where(x => x.Required).Select(x => x.Key);
        return required.All(p.ContainsKey);
    }
}
```

### 6.3 Integration Testing

Test validators with real database:

```csharp
[Collection("Database")]
public class BaselineConsistencyValidatorIntegrationTests : IAsyncLifetime
{
    private readonly TestDatabase _db;
    
    public BaselineConsistencyValidatorIntegrationTests(DatabaseFixture fixture)
    {
        _db = fixture.CreateTestDatabase();
    }
    
    [Fact]
    public async Task Execute_BaselineChangedAcrossVisits_ReturnsFail()
    {
        // Arrange: Seed baseline visit with RACE = "White"
        await _db.SeedVisit("SCREENING", new() { ["RACE"] = "White" });
        
        // Current visit has RACE = "Asian" (inconsistent)
        var formData = new FormData { Fields = new() { ["RACE"] = "Asian" } };
        
        var validator = new BaselineConsistencyValidator();
        var context = new ValidationContext<FormData>(
            formData,
            schema,
            _db.FormRepository,
            "study1",
            "DEMOGRAPHICS_DAY28"
        );
        
        var parameters = new Dictionary<string, object>
        {
            ["baselineVisitId"] = "SCREENING",
            ["fieldToCheck"] = "RACE"
        };
        
        // Act
        var result = await validator.Execute(context, parameters);
        
        // Assert
        Assert.True(result.IsFailure);
        Assert.Contains("baseline", result.Message, StringComparison.OrdinalIgnoreCase);
    }
}
```

---

## 7. Performance Optimization

### 7.1 Validator Caching

Validator instances are singletons:

```csharp
public class ServerEditCheckRegistry : IServerEditCheckRegistry
{
    private readonly ConcurrentDictionary<string, IServerEditCheck> _validators = new();
    
    public IServerEditCheck? GetValidator(string checkId)
    {
        return _validators.TryGetValue(checkId, out var validator) ? validator : null;
    }
    
    public void Register<T>() where T : IServerEditCheck, new()
    {
        var instance = new T();
        _validators.TryAdd(instance.CheckId, instance);
    }
}
```

### 7.2 Parallel Execution

Validators execute in parallel when independent:

```csharp
public async Task<ValidationResult> ValidateForm(...)
{
    var validationTasks = schema.ServerValidations
        .Where(r => r.Enabled != false)
        .Select(async rule =>
        {
            var validator = _registry.GetValidator(rule.CheckId);
            var context = BuildContext(formData, schema, studyId, formId);
            return await validator.Execute(context, rule.Parameters);
        });
    
    var results = await Task.WhenAll(validationTasks);
    return new ValidationResult(results);
}
```

### 7.3 Database Query Optimization

Cross-visit validators use compiled queries:

```csharp
private static readonly Func<AppDbContext, string, string, Task<FormData?>> GetBaselineVisitQuery =
    EF.CompileAsyncQuery((AppDbContext db, string studyId, string visitId) =>
        db.FormData
            .Where(f => f.StudyId == studyId && f.VisitId == visitId)
            .FirstOrDefault());
```

### 7.4 Medical Coding Service Caching

MedDRA/WHODrug lookups are cached:

```csharp
public class MedDRAService
{
    private readonly IMemoryCache _cache;
    
    public async Task<MedDRATerm?> GetPT(string ptCode, string version)
    {
        var cacheKey = $"meddra:{version}:pt:{ptCode}";
        
        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24);
            return await _db.MedDRATerms
                .Where(t => t.Code == ptCode && t.Version == version && t.Level == "PT")
                .FirstOrDefaultAsync();
        });
    }
}
```

---

## 8. Audit Trail & Compliance

### 8.1 Validator Execution Logging

Every validator execution is logged:

```csharp
public async Task<Result> Execute(ValidationContext ctx, Dictionary<string, object> p)
{
    var startTime = DateTime.UtcNow;
    
    try
    {
        var result = await ExecuteCore(ctx, p);
        
        await _auditLog.LogValidation(new ValidationAuditEntry
        {
            Timestamp = DateTime.UtcNow,
            StudyId = ctx.StudyId,
            FormId = ctx.FormId,
            SubjectId = ctx.FormData.SubjectId,
            CheckId = CheckId,
            Parameters = JsonSerializer.Serialize(p),
            Result = result.Status,  // Pass, Fail, Warn
            Message = result.Message,
            ExecutionTimeMs = (DateTime.UtcNow - startTime).TotalMilliseconds,
            UserId = ctx.User.Id
        });
        
        return result;
    }
    catch (Exception ex)
    {
        await _auditLog.LogValidationError(CheckId, ex);
        throw;
    }
}
```

### 8.2 Configuration Change Tracking

Study designer configuration changes are versioned:

```sql
CREATE TABLE FormSchemaVersions (
    Id BIGINT PRIMARY KEY,
    StudyId VARCHAR(50),
    FormId VARCHAR(50),
    Version INT,
    SchemaJson TEXT,  -- includes serverValidations[]
    ChangedBy VARCHAR(100),
    ChangedAt TIMESTAMP,
    ChangeReason TEXT
);
```

### 8.3 ALCOA Compliance

Validator execution logs provide ALCOA evidence:

- **Attributable:** Logs include `UserId`, `SubjectId`, `StudyId`
- **Legible:** Human-readable `CheckId`, `Message`
- **Contemporaneous:** `Timestamp` at execution
- **Original:** Immutable audit log (append-only)
- **Accurate:** Execution result + input parameters logged

---

## 9. Deployment & Versioning

### 9.1 Library Versioning

Validator library follows semantic versioning:

```
v1.0.0 — Initial release (17 validators)
v1.1.0 — Added PK sampling window validator
v2.0.0 — Breaking: Changed ParameterType.FieldReference schema
```

### 9.2 Backward Compatibility

When updating validators:

```csharp
public interface IServerEditCheck
{
    string CheckId { get; }
    int Version { get; }  // NEW: Track validator version
    ValidatorMetadata Metadata { get; }
    Task<Result> Execute(ValidationContext context, Dictionary<string, object> parameters);
}
```

Study schema stores validator version:

```json
{
  "checkId": "sae-notification-timeline",
  "version": 1,  // Locked to v1 behavior
  "parameters": { ... }
}
```

Platform can execute multiple versions of same validator for backward compatibility.

### 9.3 Migration Tools

When validator signature changes, provide migration tool:

```csharp
public class ServerValidationMigrator
{
    public ServerValidationRule Migrate(ServerValidationRule oldRule, int targetVersion)
    {
        if (oldRule.CheckId == "sae-notification-timeline" && oldRule.Version == 1 && targetVersion == 2)
        {
            // v1 → v2: Split "aeOnsetField" into "onsetDateField" + "onsetTimeField"
            return new ServerValidationRule
            {
                CheckId = oldRule.CheckId,
                Version = 2,
                Parameters = new()
                {
                    ["onsetDateField"] = oldRule.Parameters["aeOnsetField"],
                    ["onsetTimeField"] = oldRule.Parameters["aeOnsetField"],  // Same field for now
                    ["notificationDateField"] = oldRule.Parameters["notificationDateField"],
                    ["maxHours"] = oldRule.Parameters["maxHours"]
                }
            };
        }
        
        return oldRule;
    }
}
```

---

## 10. Roadmap

### Phase 1 (Current)
- ✅ Architecture design
- ✅ Core validator interface
- ✅ Initial catalog (17 validators)

### Phase 2 (Q3 2026)
- Form Builder UI integration
- Parameter configuration forms
- Validator catalog browser
- Configuration preview/testing

### Phase 3 (Q4 2026)
- 10 additional validators (target: 27 total)
- Client custom validator extension
- Integration testing framework
- Performance benchmarking

### Phase 4 (Q1 2027)
- Validator composition (AND/OR/NOT logic)
- Conditional validator execution
- Validator templates for common studies
- Validator marketplace (client-contributed validators)

---

## Appendix A: Validator Interface Reference

### Full `IServerEditCheck` Interface

```csharp
namespace Vialiq.Platform.Validation;

/// <summary>
/// Server-side edit check that can be configured by study designers
/// and executed in the validation pipeline.
/// </summary>
public interface IServerEditCheck
{
    /// <summary>
    /// Unique identifier for catalog lookup.
    /// Convention: kebab-case, e.g., "sae-notification-timeline"
    /// </summary>
    string CheckId { get; }
    
    /// <summary>
    /// Metadata for Form Builder UI.
    /// </summary>
    ValidatorMetadata Metadata { get; }
    
    /// <summary>
    /// Execute validation with runtime context.
    /// </summary>
    /// <param name="context">Validation context with form data, schema, and DB access</param>
    /// <param name="parameters">Configuration parameters from study designer</param>
    /// <returns>Validation result (Pass, Fail, Warn)</returns>
    Task<Result> Execute(ValidationContext context, Dictionary<string, object> parameters);
}

public record ValidatorMetadata
{
    /// <summary>Display name for Form Builder UI</summary>
    public required string Name { get; init; }
    
    /// <summary>Category for grouping in UI</summary>
    public required string Category { get; init; }
    
    /// <summary>Long description with use cases</summary>
    public string Description { get; init; } = string.Empty;
    
    /// <summary>Configurable parameters</summary>
    public required ValidatorParameter[] Parameters { get; init; }
    
    /// <summary>Required user roles to configure this validator</summary>
    public string[] RequiredRoles { get; init; } = [];
    
    /// <summary>Whether this validator requires database access</summary>
    public bool RequiresDatabase { get; init; }
    
    /// <summary>Whether this validator requires medical coding services</summary>
    public bool RequiresMedicalCodingService { get; init; }
    
    /// <summary>Tags for filtering/search</summary>
    public string[] Tags { get; init; } = [];
    
    /// <summary>Version of validator (for backward compatibility)</summary>
    public int Version { get; init; } = 1;
}

public record ValidatorParameter
{
    public required string Key { get; init; }
    public required string Label { get; init; }
    public required ParameterType Type { get; init; }
    public object? DefaultValue { get; init; }
    public bool Required { get; init; } = true;
    public string? HelpText { get; init; }
    public string[]? AllowedValues { get; init; }  // For EnumValue type
    public int? MinValue { get; init; }            // For Integer/Decimal
    public int? MaxValue { get; init; }            // For Integer/Decimal
}

public enum ParameterType
{
    FieldReference,
    VisitReference,
    FormReference,
    Integer,
    Decimal,
    String,
    Boolean,
    Date,
    TimeSpan,
    EnumValue,
    MedDRAVersion,
    CTCAEVersion,
    WHODrugVersion
}
```

---

## Appendix B: Configuration Schema

### TypeScript Interface

```typescript
export interface ServerValidationRule {
  /** Validator checkId from library */
  checkId: string;
  
  /** Validator version (for backward compatibility) */
  version?: number;
  
  /** Configuration parameters */
  parameters: Record<string, unknown>;
  
  /** Severity override */
  severity: 'error' | 'warning';
  
  /** Query text template (supports {{variable}} interpolation) */
  queryTemplate?: string;
  
  /** Enable/disable without deleting */
  enabled?: boolean;
  
  /** Study-specific notes */
  description?: string;
  
  /** Execution order priority (lower = earlier) */
  priority?: number;
}

export interface FormSchema {
  formId: string;
  formName: string;
  fields: FieldSchema[];
  
  /** Client-side validations */
  validations?: ValidationRule[];
  
  /** Server-side validations (NEW) */
  serverValidations?: ServerValidationRule[];
}
```

### JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "checkId": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "version": {
      "type": "integer",
      "minimum": 1
    },
    "parameters": {
      "type": "object"
    },
    "severity": {
      "type": "string",
      "enum": ["error", "warning"]
    },
    "queryTemplate": {
      "type": "string"
    },
    "enabled": {
      "type": "boolean",
      "default": true
    },
    "description": {
      "type": "string"
    },
    "priority": {
      "type": "integer",
      "minimum": 0
    }
  },
  "required": ["checkId", "parameters", "severity"]
}
```

---

## Appendix C: Example Study Configuration

### Oncology Study "ABC-101" Form Schema

```json
{
  "studyId": "ABC-101",
  "formId": "AE_SAE_FORM",
  "formName": "Adverse Event (AE) & Serious Adverse Event (SAE)",
  "serverValidations": [
    {
      "checkId": "sae-notification-timeline",
      "parameters": {
        "aeOnsetField": "AESTDTC",
        "notificationDateField": "SAENOTDT",
        "maxHours": 24
      },
      "severity": "error",
      "queryTemplate": "SAE notification delayed {{actualHours}} hours (max 24h per GCP)",
      "description": "ICH-GCP E2A compliance check"
    },
    {
      "checkId": "susar-detection",
      "parameters": {
        "seriousField": "AESER",
        "relatedField": "AEREL",
        "expectedField": "AEEXPECT",
        "outcomeField": "AEOUT"
      },
      "severity": "error",
      "queryTemplate": "SUSAR detected - expedited reporting required (deadline: {{reportingDeadline}})"
    },
    {
      "checkId": "meddra-pt-validation",
      "parameters": {
        "ptCodeField": "AEDECOD_PT",
        "meddraVersion": "26.1",
        "ptTextField": "AEDECOD"
      },
      "severity": "error",
      "queryTemplate": "Invalid MedDRA PT code or text mismatch"
    },
    {
      "checkId": "meddra-hierarchy-consistency",
      "parameters": {
        "ptCodeField": "AEDECOD_PT",
        "socCodeField": "AESOC",
        "meddraVersion": "26.1"
      },
      "severity": "error",
      "queryTemplate": "MedDRA SOC does not match PT primary SOC"
    },
    {
      "checkId": "grade-progression-validation",
      "parameters": {
        "gradeField": "AETOXGR",
        "allowIncrease": true,
        "allowDecrease": true,
        "requireExplanation": true,
        "explanationField": "AEGRADEEXPL"
      },
      "severity": "warning",
      "queryTemplate": "Grade decreased without explanation"
    }
  ]
}
```

This configuration enables:
1. SAE 24-hour reporting check
2. SUSAR auto-detection
3. MedDRA PT code validation (v26.1)
4. MedDRA PT→SOC hierarchy check
5. CTCAE grade progression with explanation requirement

All configured through Form Builder UI — **no C# coding required**.

---

**End of Document**
