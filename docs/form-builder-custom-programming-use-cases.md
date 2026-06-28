# Form Builder — Custom Programming Use Cases

> **Status:** Active — decisions recorded, Medical Coding & QMS specified  
> **Date:** 2026-05-29  
> **Purpose:** Exhaustive catalogue of study-specific validation and computation use cases, prior to any implementation decisions.  
> Related docs: [custom-validators](./form-builder-custom-validators.md) · [client-side implementation](./form-builder-custom-programming-implementation.md) · [server-side validator library](./form-builder-server-side-validator-library.md) · [server-side implementation](./form-builder-custom-programming-server-side.md) · [validation](./form-builder-validation.md) · [schema](./form-builder-schema.md)

---

## 1. What "Custom Programming" Means

In commercial EDC systems (Medidata Rave, Oracle InForm, Veeva Vault CDMS, OpenClinica, Castor), the built-in check library covers common patterns: required fields, min/max range, date format, and email format. **Custom programming** is everything the built-in library cannot express — logic that is study-specific, protocol-specific, or therapeutically specific.

In our platform, custom programming maps to validators with `type: 'custom'` in the `ValidationRule[]` array on a field schema. These validators are registered per-study and executed by the `ValidationEngine` at data-entry time.

### 1.1 The Two-Layer Model

Custom programming spans **two** execution layers. This document covers both, but tags each use case with where it is most appropriately executed:

| Tag | Where | When | Trust level |
|---|---|---|---|
| 🖥 **CLIENT** | Browser, Angular `ValidationEngine` | On blur / change / submit | UX only — server always re-validates |
| 🖧 **SERVER** | Backend edit-check engine | On save / lock / sign | Authoritative — cannot be bypassed |
| 🖥🖧 **BOTH** | Duplicate on client for UX, server for integrity | — | Server result is the legal record |

> **Regulatory principle:** In GCP-regulated clinical trials, client-side validation is user experience. Server-side validation is data integrity. Any check that affects subject safety, eligibility, or regulatory submission must be enforced server-side regardless of what the client does. Client-side custom validators provide immediate feedback only.

---

## 2. Taxonomy Overview

```
Custom Programming Use Cases
│
├── A. Identifier & Format Validation          (🖥 client preferred)
│    ├── A1. National identifier check digits
│    ├── A2. Coding system hierarchy validation
│    └── A3. Barcode / labelling format
│
├── B. Single-Field Range & Plausibility       (🖥🖧 both)
│    ├── B1. Absolute physiological limits (hard)
│    ├── B2. Protocol-specific range (hard)
│    ├── B3. Soft / warning range (soft query)
│    └── B4. CTCAE / scale value bounds
│
├── C. Intra-Form Cross-Field Validation       (🖥🖧 both)
│    ├── C1. Date ordering
│    ├── C2. Conditional required ("if X then Y required")
│    ├── C3. Mutual exclusivity
│    ├── C4. "Other, specify" enforcement
│    ├── C5. Unit–value pairing
│    ├── C6. Anatomical / laterality consistency
│    └── C7. Logical exclusion (e.g. sex vs pregnancy)
│
├── D. Derived / Calculated Field Validation   (🖥🖧 both; complex = 🖧 server)
│    ├── D1. Anthropometric calculations (BMI, BSA)
│    ├── D2. Kidney function (eGFR, CrCl)
│    ├── D3. Composite clinical scores
│    ├── D4. Dose intensity / exposure duration
│    └── D5. Change from baseline / percent change
│
├── E. Protocol Eligibility Checks             (🖥🖧 both; gating = 🖧 server)
│    ├── E1. Inclusion/exclusion criteria
│    ├── E2. Age, weight, organ function thresholds
│    ├── E3. Time-window compliance
│    └── E4. Prior therapy washout
│
├── F. Safety & Pharmacovigilance              (🖥🖧 both; reporting = 🖧 server)
│    ├── F1. AE / SAE temporal consistency
│    ├── F2. SAE reporting timeline
│    ├── F3. CTCAE grade logic
│    ├── F4. Causality × seriousness matrix
│    └── F5. Death date consistency
│
├── G. Population-Specific Rules               (🖥 client — study meta lookup)
│    ├── G1. Paediatric age banding
│    ├── G2. Renal / hepatic impairment strata
│    ├── G3. Gender-adjusted reference ranges
│    └── G4. Biomarker / genetic subgroup rules
│
├── H. Cross-Form / Cross-Visit Validation     (🖧 server only — needs DB)
│    ├── H1. Baseline-to-follow-up consistency
│    ├── H2. Visit window compliance
│    ├── H3. Prior medication / concomitant dates
│    ├── H4. Delta checks (change between visits)
│    └── H5. Informed consent date gate
│
└── I. Instrument / PRO Completeness           (🖥🖧 both)
     ├── I1. Scale item bounds and total
     ├── I2. Missing-item imputation rules
     ├── I3. Reverse-coded items
     └── I4. Administration timing / anchor logic
```

---

## 3. Category A — Identifier & Format Validation

These are **pure functions** — they need only the raw field value to execute. No form data, no study metadata, no backend. Ideal client-side custom validators.

### A1. National Identifier Check Digits

#### A1.1 NHS Number (United Kingdom)

**What:** Every patient registered with NHS England has a 10-digit NHS Number. The 10th digit is a check digit computed via a Modulus 11 algorithm. An invalid NHS number means the subject cannot be linked to their NHS records.

**Clinical impact:** Data linkage failure. If the NHS number is wrong, pharmacovigilance follow-up and safety signal linkage fail.

**Algorithm:**
```
1. Multiply each of the first 9 digits by (11 − position), where position is 1-based.
   e.g. digits [4,5,0,5,5,5,5,5,5] × [10,9,8,7,6,5,4,3,2]
2. Sum the products.
3. Compute remainder = sum mod 11.
4. Check digit = 11 − remainder.
   If check digit = 11 → check digit = 0.
   If check digit = 10 → NHS number is invalid (no valid check digit exists).
5. Compare computed check digit to the 10th digit of the number.
```

**Examples:**
- `4505555555` → valid (check digit 5 is correct)
- `1234567890` → invalid
- Numbers where step 4 yields 10 → structurally impossible, always reject

**Edge cases:**
- Input may arrive with spaces: `450 555 5555` → strip spaces before validation
- All-zero: `0000000000` → fails algorithm, reject
- 9 digits only: user forgot trailing check digit → format error, not algorithm error
- "999 999 9001" is used in test environments → may need allowlist for test NHS numbers

**Field:** Typically on the Subject Identification Form (`SUBJID`) or Demographics (`DM.NHS_NUM`)

**Regulatory note:** Not required by FDA/EMA but mandatory in NHS-sponsored and NIHR-funded trials for data linkage to NHS Digital datasets.

---

#### A1.2 CPF Number (Brazil — Cadastro de Pessoas Físicas)

**What:** 11-digit national identifier. Used in Brazilian clinical trials for subject identification and ANVISA reporting.

**Algorithm:**
```
First check digit (10th digit):
  1. Multiply first 9 digits by [10,9,8,7,6,5,4,3,2].
  2. Sum; remainder = sum mod 11.
  3. If remainder < 2 → first check = 0; else first check = 11 − remainder.

Second check digit (11th digit):
  1. Multiply first 10 digits (including first check digit) by [11,10,9,8,7,6,5,4,3,2].
  2. Sum; remainder = sum mod 11.
  3. If remainder < 2 → second check = 0; else second check = 11 − remainder.
```

**Edge cases:**
- All-same-digit sequences (`111.111.111-11`, `222.222.222-22`, …, `999.999.999-99`) pass the algorithm but are invalid — they must be rejected explicitly.
- May arrive formatted as `XXX.XXX.XXX-XX` → strip `.` and `-` before validation.
- Brazilian test environments use `000.000.001-91` as a canonical valid test CPF.

---

#### A1.3 BSN (Netherlands — Burgerservicenummer)

**What:** 9-digit citizen service number. Used in Netherlands trials linked to Nivel or CBS registry data.

**Algorithm (Elfproef / 11-check):**
```
Multiply digits by weights [9,8,7,6,5,4,3,2,-1].
Sum of products must be divisible by 11 (sum mod 11 == 0).
```

**Edge cases:**
- `000000000` → fails, reject.
- Leading zeros are significant — BSN is always stored/transmitted as 9 digits with leading zeros.

---

#### A1.4 EAN-13 / GS1 Barcode (Kit Labelling)

**What:** 13-digit barcode on Investigational Medicinal Product (IMP) kits. Used to log dispensing events. Invalid barcode = dispensing error.

**Algorithm:**
```
Multiply digits alternately by 1 and 3 (positions 1,3,5,7,9,11 → ×1; positions 2,4,6,8,10,12 → ×3).
Sum all products.
Check digit = (10 − (sum mod 10)) mod 10.
Compare to the 13th digit.
```

---

### A2. Coding System Hierarchy Validation

#### A2.1 MedDRA Coding Consistency

**What:** Medical Dictionary for Regulatory Activities (MedDRA) is the regulatory-mandated AE coding system. Every adverse event is coded to a Preferred Term (PT) which sits within a High-Level Term (HLT) → High-Level Group Term (HLGT) → System Organ Class (SOC).

**Rule:** The SOC selected by the data manager must be the primary SOC for the chosen PT. MedDRA allows multi-axial coding (one PT can belong to multiple SOCs) but requires designation of a primary SOC per MSSO guidance.

**Data requirement:** A reference table mapping PT codes → valid SOC codes (primary and secondary). This table is versioned with each MedDRA release (currently v27.0, released March 2024).

**Validation:** If `AE_PT_CODE = 10052015` (Myocardial infarction) and `AE_SOC_CODE = 10029104` (Nervous system disorders) → error: "Selected SOC is not valid for this Preferred Term. Primary SOC for Myocardial infarction is Cardiac disorders (10007541)."

**Execution layer:** 🖥🖧 — client can validate against a bundled PT→SOC lookup; server validates against the live MedDRA database. The lookup table is part of `StudyMeta` (codelist version).

---

#### A2.2 WHO Drug Coding Consistency

**What:** Concomitant medications are coded against the WHO Drug Dictionary (WHODrug). Each drug record has a Drug Record Number (DRN) linking to an ATC (Anatomical Therapeutic Chemical) code hierarchy.

**Rule:** `CONMED_ATC_CODE` must correspond to the ATC code of the drug identified by `CONMED_WHO_DRN`. The ATC code must be at level 5 (full ATC, e.g., `C09AA01` = Captopril).

**Execution layer:** 🖧 server only — WHODrug dictionary requires licensed access and cannot be bundled client-side.

---

#### A2.3 CDISC Controlled Terminology Validation

**What:** CDISC CT provides standardised codelists for SDTM domains. Values submitted must come from the applicable CT codelist for a given SDTM variable.

**Examples:**
- `DM.SEX` → must be one of C66742 (`M`, `F`, `U`, `UNDIFFERENTIATED`)
- `DM.ETHNIC` → must be one of C66790 (`HISPANIC OR LATINO`, `NOT HISPANIC OR LATINO`, `NOT REPORTED`, `UNKNOWN`)
- `AE.AEOUT` → must be one of C66768
- `CM.CMDOSFRQ` → must be one of C71113 (dose frequency terms)

**Rule:** When a field is SDTM-mapped to a controlled term variable, the submitted value must appear in the applicable CDISC CT codelist version specified in the study protocol.

**Execution layer:** 🖥 client — codelist is bundled with the form schema (the `optionSource` points to the relevant CT codelist). A custom validator is only needed when the user can enter free-text values that are not constrained to the dropdown (e.g., when `allowCreate: true`).

---

### A3. Barcode / Document Reference Format

#### A3.1 Study Reference Number Format

**What:** Many trials assign subjects a Screening Number (`SCRNO`) and a Subject Number (`SUBJNO`) with a specific format encoding site number, cohort, and sequential ID.

**Example format:** `[2-letter country]-[3-digit site]-[2-digit cohort]-[4-digit sequential]`  
e.g., `UK-042-01-0023`

**Validation:** Regex check against the study-specific format. Alert if country code is not one of the expected countries for this trial.

**Execution layer:** 🖥 client — pure regex + `StudyMeta.subjectNumberFormat` pattern.

---

## 4. Category B — Single-Field Range & Plausibility

These checks operate on one field value in isolation (or with a small set of companion fields like the unit selector on the same form).

### B1. Absolute Physiological Limits (Hard Errors)

These are protocol-independent. A value outside these limits is a data entry error, not a clinical finding.

| Field | Minimum | Maximum | Notes |
|---|---|---|---|
| Heart rate (`VS.HR`) | 1 bpm | 300 bpm | <1 = impossible; >300 = impossible in living human |
| Systolic BP (`VS.SYSBP`) | 40 mmHg | 300 mmHg | |
| Diastolic BP (`VS.DIABP`) | 10 mmHg | 200 mmHg | |
| Body temperature (`VS.TEMP`) | 30.0°C | 44.0°C | Adjust for unit |
| Body weight (`VS.WEIGHT`) | 1 kg | 300 kg | Adjust for paediatric |
| Height (`VS.HEIGHT`) | 30 cm | 250 cm | |
| Oxygen saturation (`VS.OXYSAT`) | 50% | 100% | |
| Haemoglobin (`LB.HB`) | 3 g/dL | 25 g/dL | Below 3 = incompatible with life |
| Platelets (`LB.PLAT`) | 1 × 10⁹/L | 1500 × 10⁹/L | |
| Serum sodium (`LB.NA`) | 100 mmol/L | 180 mmol/L | |
| Serum glucose (fasting) | 1.0 mmol/L | 55 mmol/L | |
| Creatinine | 10 μmol/L | 2000 μmol/L | |
| ALT / AST | 0 IU/L | 5000 IU/L | Above = dilution error |
| White blood cell count | 0.1 × 10⁹/L | 400 × 10⁹/L | |

**Rule type:** Hard error — field must be corrected before the form can be saved.

**Execution layer:** 🖥🖧 both.

---

### B2. Protocol-Specific Ranges (Hard Errors)

The protocol defines acceptable ranges for subject enrolment and data acceptance. These differ by trial.

**Examples:**

**Study ONCO-001 (oncology trial, Phase I dose escalation):**
- Platelet count at baseline ≥ 100 × 10⁹/L (inclusion criterion)
- ANC (absolute neutrophil count) ≥ 1.5 × 10⁹/L
- Haemoglobin ≥ 9 g/dL
- These are not absolute physiological limits — they are study-specific gates

**Study CARD-002 (heart failure trial):**
- LVEF (left ventricular ejection fraction) must be ≤ 40% at screening (reduced EF is inclusion criterion)
- If LVEF > 40% → block randomisation with message: "LVEF does not meet inclusion criterion IC-3 (LVEF ≤ 40%)"

**Study RENAL-003 (renal impairment trial):**
- eGFR strata: 15–29 (severe), 30–59 (moderate), 60–89 (mild), ≥ 90 (normal)
- The form must validate that the eGFR value entered matches the stratum the subject was assigned to at screening

**Data requirement:** `StudyMeta.inclusionCriteria[]` — list of named criteria with threshold values and comparator operators. This allows the validator to be generic while the thresholds are study-specific.

**Execution layer:** 🖥🖧 both.

---

### B3. Soft / Warning Ranges (Queries)

A soft check does not block saving — it raises a query (a data clarification request) that must be acknowledged or resolved by the site.

**Concept:** In EDC systems, a query is a formal record: "The system flagged value X on field Y — please confirm or correct." The site can respond: "Confirmed as entered" or correct the value.

**Examples:**

| Field | Soft lower | Soft upper | Query text |
|---|---|---|---|
| Systolic BP | 70 mmHg | 200 mmHg | "Systolic BP of {value} mmHg is outside the expected range. Please confirm." |
| Heart rate | 40 bpm | 130 bpm | "Heart rate of {value} bpm is outside the expected range. Please confirm." |
| Weight | 30 kg | 200 kg | "Body weight of {value} kg is unusual. Please verify measurement." |
| ECOG PS | — | 4 | "ECOG PS = 4 indicates the subject is completely disabled. Please confirm this is correct." |
| Total daily dose | — | protocol max | "Dose of {value} mg exceeds the protocol maximum of {meta.maxDose} mg. Please confirm." |

**In our form renderer:** Soft checks render as `severity: 'warning'` rather than `severity: 'error'`. The field is not blocked. A query record is created server-side. The site must acknowledge the warning before the form can be locked. _(Note: `severity` on ValidationRule is a future design point — currently all client errors block submission.)_

**Execution layer:** 🖥 client (shows the warning inline); 🖧 server (creates the formal query record, controls locking).

---

### B4. CTCAE Grade and Clinical Scale Bounds

**CTCAE (Common Terminology Criteria for Adverse Events):**
- Grade is an integer 1–5. Grade 0 is not valid for an AE that is present (Grade 0 means absent).
- Grade 5 = death. If grade 5 is entered → `AE_OUTCOME` must be `FATAL` and `DEATH_DATE` must be populated.
- Grade cannot decrease from one severity assessment to a higher grade in the same AE episode without an explanation (grade regression check — cross-form, server-side).

**ECOG Performance Status:**
- Integer 0–5 (0 = fully active; 5 = dead).
- If ECOG = 5 → subject is dead → must align with survival status on the same or related form.
- ECOG ≥ 2 may trigger a query in trials with ECOG ≤ 1 as inclusion criterion.

**NRS (Numeric Rating Scale for Pain):**
- Integer 0–10. Decimal values are invalid.
- NRS = 0 entered at all visits while "pain present" is recorded elsewhere → query.

**Execution layer:** 🖥🖧 both.

---

## 5. Category C — Intra-Form Cross-Field Validation

These checks require two or more fields from the **same form page**. They are well-suited to client-side execution because all required data is present in `formData`.

### C1. Date Ordering

The most common cross-field check in clinical trials.

| Pair | Rule | Example |
|---|---|---|
| AE Start / End | `AE_STDAT` ≤ `AE_ENDAT` if end date is populated | AE cannot resolve before it starts |
| Medication Start / End | `CONMED_STDAT` ≤ `CONMED_ENDAT` | |
| Hospitalization | `HOSP_ADMDT` ≤ `HOSP_DISDT` | |
| Biopsy / Result | `BIOPSY_DT` ≤ `RESULT_DT` | Result cannot precede procedure |
| ICF / Procedures | `ICF_DATE` ≤ all procedure dates | See Category H — cross-form |
| Date of Birth / Visit | `DOB` ≤ `VISIT_DATE` | Subject must exist at time of visit |
| Informed consent / DOB | `ICF_DATE` ≥ `DOB` + 18 years (if adult trial) | Age at consent |

**Nuance — partial dates:** Clinical data often uses partial dates (`yyyy-mm-UN` = unknown day, `yyyy-UN-UN` = unknown month and day). Ordering logic must handle partial date comparisons correctly:
- `2025-03-UN` vs `2025-02-15`: March unknown-day vs Feb 15th → March is definitely after February, so if start = `2025-02-15` and end = `2025-03-UN` → end is after start → valid.
- `2025-03-UN` vs `2025-03-20`: same month, unknown start day vs known end day → cannot determine order → soft query, not hard error.

**Execution layer:** 🖥🖧 both.

---

### C2. Conditional Required

"If field A has value X, then field B is required."

These go beyond what `required` rules can express because the requirement is conditional.

| Trigger field | Trigger value | Required field | Clinical rationale |
|---|---|---|---|
| `AE_SERIOUS` | `Y` | `SAE_NOTIFY_DATE` | SAE must have notification date |
| `AE_SERIOUS` | `Y` | `SAE_CRITERIA` (at least one checked) | Must specify why it's serious |
| `AE_OUTCOME` | `FATAL` | `DEATH_DATE` | Fatal outcome requires death date |
| `AE_OUTCOME` | `RESOLVED` | `AE_ENDAT` | Resolution requires end date |
| `AE_CAUSAL` | `YES` | `AE_ACTION` | If drug-related, action must be recorded |
| `CM_ONGOING` | `N` | `CM_ENDAT` | If medication stopped, end date required |
| `PREG_TEST` | `POSITIVE` | `PREG_CONFIRM_DT` | Positive pregnancy test needs confirmation |
| `RESPONSE` | `CR` or `PR` | `CONFIRM_DATE` | RECIST response requires confirmation |
| `SURGERY` | `Y` | `SURG_DATE`, `SURG_TYPE` | Surgery flag triggers surgical details |
| `WITHDRAWAL` | `Y` | `WITHDRAWAL_REASON` | Withdrawal requires documented reason |
| `ECOG` | `≥ 2` | `ECOG_REASON` | Deterioration requires justification if protocol says ECOG ≤ 1 at screening |

**Execution layer:** 🖥🖧 both — client provides immediate feedback; server enforces before form lock.

---

### C3. Mutual Exclusivity

Some fields represent mutually exclusive states. Selecting more than one is a data error.

| Field | Mutually exclusive options |
|---|---|
| AE seriousness criteria | "Life-threatening" and "Not serious" cannot both be checked |
| AE outcome | `RECOVERED`, `RECOVERING`, `NOT_RECOVERED`, `FATAL`, `SEQUELAE` — only one may be selected |
| Concomitant med reason | Some protocols require exactly one primary reason |
| Response assessment | `CR`, `PR`, `SD`, `PD`, `NE` — exactly one per assessment timepoint |
| Dose modification reason | If `NONE` selected, no other reason may be checked |

**Execution layer:** 🖥🖧 both.

---

### C4. "Other, Specify" Enforcement

A codelist allows selecting "Other" with a free-text companion field. The free-text companion is required if and only if "Other" is selected.

**Examples:**
- `RACE = 'OTHER'` → `RACE_OTH` (free text) required
- `MED_REASON = 'OTHER'` → `MED_REASON_OTH` required
- `AE_RELATEDNESS = 'POSSIBLY'` and `AE_COMMENT` is empty → soft query (explanation recommended)
- `WITHDRAWAL_REASON = 'OTHER'` → `WITHDRAWAL_REASON_OTH` required
- `SURGICAL_APPROACH = 'OTHER'` → `SURGICAL_APPROACH_SPEC` required

**Nuance:** Some protocols require the "Other" free text to be ≥ N characters to prevent useless entries like "other" or "N/A".

**Execution layer:** 🖥🖧 both.

---

### C5. Unit–Value Pairing

Many lab fields have a companion unit selector. The valid range of the value depends on the selected unit.

**Glucose example:**
- `GLUC_VALUE` with `GLUC_UNIT` ∈ `{'mmol/L', 'mg/dL'}`
- If `GLUC_UNIT = 'mmol/L'` → expected range 2.5–30 mmol/L (fasting: 3.9–5.6 normal)
- If `GLUC_UNIT = 'mg/dL'` → expected range 45–540 mg/dL (fasting: 70–100 normal)
- If value = 8 and unit = 'mg/dL' → soft query: "8 mg/dL is below the minimum expected glucose level. Did you mean 8 mmol/L?"

**HbA1c example:**
- `HBA1C_VALUE` with `HBA1C_UNIT` ∈ `{'%', 'mmol/mol'}`
- `%`: range 4–15 (normal ~5.7%, diabetic ~6.5%+)
- `mmol/mol`: range 20–180 (normal ~39 mmol/mol, diabetic ~48 mmol/mol)

**Creatinine example:**
- `μmol/L`: range 10–2000
- `mg/dL`: range 0.1–22.6
- `mg/L`: range 1–226

**Weight-based dose example:**
- `DOSE_VALUE` with `DOSE_UNIT` ∈ `{'mg', 'mg/kg', 'μg/kg'}`
- If `DOSE_UNIT = 'mg/kg'` → apply validation against `meta.maxDosePerKg × formData.WEIGHT`
- If `DOSE_UNIT = 'mg'` → apply validation against fixed `meta.maxAbsoluteDose`

**Execution layer:** 🖥🖧 both.

---

### C6. Anatomical / Laterality Consistency

**Examples:**
- Biopsy location = "Left Breast", Laterality field = "Right" → error
- Injection site = "Left Arm" but `LATERALITY = 'R'` → inconsistency
- Lymph node involvement: "Right axillary" + laterality = "Left" → error
- Tumour site: "Bilateral" → laterality field should not be "Left" or "Right" but "Bilateral"

**Execution layer:** 🖥🖧 both.

---

### C7. Logical Exclusion

Facts that cannot simultaneously be true:

| Condition | Rule |
|---|---|
| `SEX = 'MALE'` | `PREGNANT` must be null, N/A, or hidden |
| `SEX = 'MALE'` | `MENOPAUSE_STATUS` must be N/A |
| `AGE_AT_CONSENT < 12` | `CONTRACEPTION_TYPE` must be N/A |
| `CONMED_ONGOING = 'Y'` | `CONMED_ENDAT` must be null (ongoing = no end date) |
| `SURGERY_PERFORMED = 'N'` | All surgery detail fields must be null |
| `LAB_NOT_DONE = 'Y'` (reason field populated) | Lab value and units must be null |
| Subject post-death | Any new vital signs measurement → alert (data entered after death date) |

**Execution layer:** 🖥🖧 both.

---

## 6. Category D — Derived / Calculated Field Validation

These checks validate that a computed field matches the correct formula. The **computed value** is derived from other fields; the validator checks the derived field's value is within expected bounds or matches the formula output.

In some EDC implementations, derived fields are auto-calculated (the user never types them — the system fills them in). In others, the user enters the value and the system validates it against the formula.

### D1. Anthropometric Calculations

#### D1.1 BMI (Body Mass Index)

**Formula:** `BMI = weight(kg) / (height(m))²`

**Validation scenarios:**
- User enters `WEIGHT = 70 kg`, `HEIGHT = 1.70 m` → system expects `BMI ≈ 24.2`
- If user-entered `BMI = 18.0` → system checks |18.0 − 24.2| > tolerance (e.g. 0.5) → error
- OR: BMI field is auto-computed and read-only → validation is the computation itself
- Plausibility bounds: BMI < 10 or BMI > 70 → hard error regardless of formula

**Unit handling:**
- Weight in lbs → convert to kg first: `lbs × 0.453592`
- Height in inches → convert to cm first, then to m: `inches × 2.54 / 100`
- Height in feet+inches → `(feet × 12 + inches) × 2.54 / 100`

**Edge cases:**
- Height = 0 → division by zero → must guard
- Missing weight or height → BMI cannot be computed → do not validate, but flag as required if BMI field is required

**Execution layer:** 🖥🖧 both.

---

#### D1.2 BSA (Body Surface Area)

**Mosteller formula (most common in oncology):** `BSA = √((height_cm × weight_kg) / 3600)`

**DuBois formula:** `BSA = 0.007184 × height_cm^0.725 × weight_kg^0.425`

**Haycock formula (paediatric):** `BSA = 0.024265 × height_cm^0.3964 × weight_kg^0.5378`

**Usage:** BSA is used for oncology drug dosing (e.g., `dose = 1.5 mg/m² × BSA`). Validating BSA correctness is safety-critical because an error directly affects chemotherapy dose.

**Execution layer:** 🖥🖧 both. Client validates formula using same-form height/weight. Server recomputes from database-stored height/weight.

---

### D2. Kidney Function Calculations

#### D2.1 eGFR — CKD-EPI Creatinine Equation (2021)

**Why this matters:** eGFR determines renal impairment stratum for dose adjustment. An error in eGFR calculation → wrong dose → patient safety risk.

**Formula:**
```
eGFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^(-1.200)
       × 0.9938^Age
       × (1.012 if Female)

Where:
  Scr = serum creatinine in mg/dL
  κ   = 0.7 (female) or 0.9 (male)
  α   = -0.241 (female) or -0.302 (male)
  Age = age in years
```

**Input fields required:** `LB.CREAT` (creatinine in mg/dL or μmol/L — must convert), `DM.SEX`, `DM.AGE` or `DM.DOB` + visit date.

**Unit conversion:** if creatinine in μmol/L → divide by 88.42 to get mg/dL.

**Validation:** If user enters `eGFR = 65` but computed value is `72.3` → |65 − 72.3| > 2 → error: "The entered eGFR does not match the computed value from serum creatinine, age, and sex."

**Stratum consistency check:** If computed eGFR = 42 (moderate impairment, 30–59) but subject was enrolled in the normal renal function arm → eligibility error.

**Execution layer:** 🖥 client for formula validation (all inputs on form or in StudyMeta). 🖧 server for stratum consistency (needs enrolment data).

---

#### D2.2 Cockcroft-Gault Creatinine Clearance

**Formula:**
```
CrCl = ((140 − Age) × Weight_kg) / (72 × Scr_mg/dL) × (0.85 if Female)
```

**Usage:** Older trials and some renal dosing algorithms still use CG rather than CKD-EPI.

**Edge case:** Weight to use — some protocols specify ideal body weight (IBW), others use actual body weight (ABW), adjusted body weight (AdjBW) for obese subjects:
- `IBW(male) = 50 + 2.3 × (height_inches − 60)`
- `IBW(female) = 45.5 + 2.3 × (height_inches − 60)`
- If `ABW > 1.3 × IBW` → use AdjBW = IBW + 0.4 × (ABW − IBW)

**Execution layer:** 🖥🖧 both.

---

### D3. Composite Clinical Scores

#### D3.1 ECOG Performance Status

**What it is:** Clinician-rated 0–5 scale. Some protocols allow derivation from sub-items.

**Validation:** ECOG = 5 means dead. If subject has ECOG = 5 at visit N, then visit N+1 should not exist. (Cross-visit — server-side.)

#### D3.2 HAM-A (Hamilton Anxiety Rating Scale)

**What it is:** 14 items, each scored 0–4. Total = sum of all 14.

**Validation:**
- Each item must be 0–4.
- Total score must equal exact sum of items (auto-computed total is preferred; if user-entered, validate formula).
- Total range: 0–56.
- `< 17` = mild; `17–24` = mild-to-moderate; `25–30` = moderate; `> 30` = severe.
- Some protocols require minimum HAM-A ≥ 18 at baseline for enrolment.

#### D3.3 MMSE (Mini-Mental State Examination)

**What it is:** 11 items across 5 domains. Total = sum = 0–30.

**Items and max scores:**
| Domain | Max |
|---|---|
| Orientation in time | 5 |
| Orientation in place | 5 |
| Registration | 3 |
| Attention & calculation | 5 |
| Recall | 3 |
| Naming | 2 |
| Repetition | 1 |
| Complex command | 3 |
| Reading | 1 |
| Writing | 1 |
| Copying | 1 |
| **Total** | **30** |

**Validation:**
- Each domain subscale must be within its defined maximum.
- Total must equal sum of subscales.
- `< 24` = possible impairment; `< 10` = severe — some trials require MMSE ≥ 24 for enrolment.
- If `EDUCATION_YEARS < 8` → adjusted cutoff applies (some protocols).

#### D3.4 PHQ-9 (Patient Health Questionnaire Depression Screen)

**What it is:** 9 items, each 0–3. Total = sum = 0–27.

**Validation:**
- Total must equal sum of 9 items.
- Item 9 (suicidal ideation): `PHQ9_Q9 ≥ 1` → safety alert must be triggered; sponsor notification may be required.
- Severity: 1–4 = minimal; 5–9 = mild; 10–14 = moderate; 15–19 = moderately severe; 20–27 = severe.

#### D3.5 SLEDAI-2K (SLE Disease Activity Index)

**What it is:** 24 weighted items across 9 organ systems. Each item contributes a weight (1, 2, 4, or 8 points) if present.

**Validation:**
- Each item is binary (present/absent).
- Total = sum of weights for present items.
- Maximum theoretical score = 105.
- Some items require supporting data: e.g., "Seizure" item requires EEG or clinical note.
- Score ≤ 4 = inactive disease; ≥ 20 = highly active — some trials require SLEDAI ≥ 6 for enrolment.

---

### D4. Dose Intensity and Exposure Duration

**Dose intensity:**
```
Dose intensity (%) = (Actual total dose / Planned total dose) × 100
```

**Usage:** Oncology trials report dose intensity per cycle and overall. < 85% triggers a dose modification review query.

**Planned total dose** = `meta.plannedDosePerCycle × meta.numberOfCycles` or derived from dosing schema.

**Actual total dose** = sum of `DOSE_VALUE` across all dosing records for the subject.

**Execution layer:** 🖧 server (needs all dosing records across all visits). Client can validate the formula for a single cycle if all doses in that cycle are on the same form.

---

### D5. Change from Baseline / Percent Change

**Formulas:**
- `CHANGE = CURRENT_VALUE − BASELINE_VALUE`
- `PCHG = ((CURRENT_VALUE − BASELINE_VALUE) / |BASELINE_VALUE|) × 100`

**Validation:** If user enters a `PCHG` field, validate it matches the formula.

**Special cases:**
- `BASELINE_VALUE = 0` → percent change is undefined → code as "NC" (not calculable)
- `BASELINE_VALUE < 0` → percent change is meaningful but directionally non-intuitive
- Missing baseline → change cannot be computed → do not validate, flag as missing

**Execution layer:** 🖧 server (baseline value is in a different visit's form). Client can validate if baseline is carried forward as a hidden field on the current form.

---

## 7. Category E — Protocol Eligibility Checks

### E1. Inclusion / Exclusion Criteria Gate

**What:** Before a subject is randomised, all I/E criteria must be confirmed. Each criterion is a data check against CRF values.

**Structure:**
```json
{
  "type": "custom",
  "validator": "inclusionCriteriaCheck",
  "params": {
    "criteriaId": "IC-03",
    "description": "eGFR ≥ 45 mL/min/1.73m²",
    "operator": ">=",
    "threshold": 45,
    "fieldRef": "LB.EGFR"
  }
}
```

**Common I/E criteria validation patterns:**
- Continuous value vs threshold: `EGFR >= 45`, `AGE >= 18 and AGE <= 75`, `WEIGHT >= 50`
- Categorical: `ECOG_PS <= 1`, `DISEASE_STAGE in ['II', 'III', 'IV']`
- Binary: `PRIOR_THERAPY_X = 'N'` (exclusion: prior treatment with agent X)
- Time-based: `DAYS_SINCE_LAST_CHEMO >= 21` (washout)
- Lab value: `WBC >= 3.0 × 10⁹/L` and `NEUT >= 1.5 × 10⁹/L` and `PLT >= 100 × 10⁹/L`
- Composite: multiple criteria must ALL be met

**Execution layer:** 🖥 client for individual field checks. 🖧 server for composite assessment and randomisation gating (cannot allow randomisation without server confirmation).

---

### E2. Age, Weight, and Organ Function Thresholds

Specific protocols apply:

**Paediatric trials:**
- Neonates (0–27 days): dose in μg/kg; weight range 0.5–6 kg; length not height
- Infants (28 days–23 months): weight 3–15 kg; surface area calculated using Haycock
- Children (2–11 years): standard paediatric dose table indexed to weight band
- Adolescents (12–17 years): near-adult dosing if weight > 40 kg

**Organ function (oncology standard minimums):**
- Haematological: Hb ≥ 9 g/dL, ANC ≥ 1.5 × 10⁹/L, PLT ≥ 100 × 10⁹/L
- Hepatic: ALT/AST ≤ 2.5 × ULN (or ≤ 5 × ULN if liver metastases), Bilirubin ≤ 1.5 × ULN
- Renal: CrCl ≥ 50 mL/min or eGFR ≥ 45 mL/min/1.73m²

`ULN` = Upper Limit of Normal — a value that comes from `StudyMeta.labReferenceRanges[sex][ageGroup]`.

---

### E3. Time-Window Compliance

**Screening window:** Subject must be screened within N days of Day 1 (first dose).
```
DAY1_DATE − SCREENING_DATE ≤ meta.screeningWindowDays
```

**Visit windows:** Day 14 visit must fall within `Day1 + 14 ± meta.visitWindows['V3'].tolerance`.

**Assessment timing:** Tumour assessment (CT/MRI) must be within 28 days before randomisation.

**Lab results age:** Screening labs must not be older than N days at the time of randomisation.

**Execution layer:** 🖥 client for same-form dates. 🖧 server for cross-visit windows (need Day 1 date from a prior form).

---

### E4. Prior Therapy Washout

**What:** Subjects who have received prior therapy must have stopped it far enough in advance.

**Examples:**
- Systemic chemotherapy: ≥ 21 days washout before Day 1
- Nitrosoureas: ≥ 42 days (6 weeks)
- Biologics (e.g., anti-PD-1): ≥ 28 days
- Radiotherapy to index lesion: ≥ 14 days
- Strong CYP3A4 inhibitors: ≥ 14 days (for PK-sensitive compounds)

**Formula:** `DAY1_DATE − PRIOR_THERAPY_END_DATE >= meta.washoutDays[therapyType]`

**Execution layer:** 🖧 server (prior therapy end date is on a different form from Day 1 date).

---

## 8. Category F — Safety & Pharmacovigilance

Safety data requires the most rigorous validation because errors directly affect patient safety reporting.

### F1. AE / SAE Temporal Consistency

| Check | Rule | Error |
|---|---|---|
| AE after study start | `AE_STDAT >= STUDY_START_DATE` | "AE onset predates subject's study entry" |
| AE end before start | `AE_ENDAT >= AE_STDAT` if populated | "AE end date is before start date" |
| SAE after subject exists | SAE cannot precede informed consent | Cross-form (server) |
| AE during drug exposure | Flag if AE onset during off-drug period (potentially not treatment-related) | Soft query |

### F2. SAE Reporting Timeline

**Regulatory requirement (ICH E6):** Unexpected SAEs that are suspected to be related to the IMP must be reported to the regulatory authority within 7 or 15 calendar days (7 days for fatal/life-threatening; 15 days for others).

**Validation:**
```
If AE_SERIOUS = 'Y' AND AE_UNEXPECTED = 'Y' AND AE_CAUSAL IN ('POSSIBLY', 'PROBABLY', 'DEFINITELY'):
  SUSAR_NOTIFY_DATE − AE_ONSET_DATE ≤ 7 (if AE_OUTCOME = 'FATAL' or AE_GRADE = 'LIFE-THREATENING')
  SUSAR_NOTIFY_DATE − AE_ONSET_DATE ≤ 15 (otherwise)
```

**Execution layer:** 🖧 server (generates a regulatory compliance alert, creates a SUSAR workflow). Client can show a warning that the timeline may be at risk.

---

### F3. CTCAE Grade Logic

| Rule | Detail |
|---|---|
| Grade range | Integer 1–5. Grade 0 = no AE (not valid for a present AE) |
| Grade 5 = death | If `CTCAE_GRADE = 5` → `AE_OUTCOME` must be `FATAL`, `DEATH_DATE` must be populated |
| Seriousness implied by grade | Some protocols: CTCAE grade ≥ 3 automatically triggers SAE assessment |
| Grade ≥ 3 dose modification | If `CTCAE_GRADE >= 3` → check if dose modification is recorded (cross-form) |
| Grade increase without event | If grade increases from visit N to visit N+1 without new AE onset, query |

**Execution layer:** 🖥 client for single-form grade checks. 🖧 server for cross-visit grade progression.

---

### F4. Causality × Seriousness Matrix

**Standard matrix:**

| | Serious | Non-serious |
|---|---|---|
| **Related** | SUSAR candidate — expedited reporting | Non-serious related AE |
| **Unrelated** | SAE — 15-day reporting | Standard AE |
| **Unknown** | Conservative treatment as Related + Serious | Conservative |

**Validation rules:**
- If `CAUSAL = 'DEFINITELY' or 'PROBABLY'` and `SERIOUS = 'Y'` → SUSAR workflow initiated
- If `CAUSAL = 'UNRELATED'` and `SERIOUS = 'Y'` → still an SAE, 15-day reporting applies
- If `CAUSAL = 'UNRELATED'` and `SERIOUS = 'N'` → standard AE follow-up
- Causality = `null` and SERIOUS = 'Y' → query: "Causality assessment required for all SAEs"

---

### F5. Death Date Consistency

If a subject has died:
- `DEATH_DATE` must be populated on the survival status form
- All AEs with `OUTCOME = 'FATAL'` must have `AE_ENDAT = DEATH_DATE`
- No vital signs or new assessments may be recorded after `DEATH_DATE`
- If `DEATH_DATE` is populated, `LAST_CONTACT_DATE` = `DEATH_DATE`
- If `AE_GRADE = 5` (CTCAE fatal) → `DEATH_DATE` must be populated

**Execution layer:** 🖧 server (death date is on survival status form; AE forms are separate).

---

## 9. Category G — Population-Specific Rules

These checks require knowledge of the subject's demographic sub-group to apply the correct threshold. The thresholds come from `StudyMeta`.

### G1. Paediatric Age Banding

**Age bands (ICH E11A):**
| Band | Age range | Key dosing considerations |
|---|---|---|
| Neonates | 0–27 days | Immature hepatic/renal function; weight-only dosing |
| Infants | 28 days–23 months | Rapidly changing PK; weight-band dose tables |
| Children | 2–11 years | BSA or weight-based dosing |
| Adolescents | 12–17 years | Near-adult PK; adult dosing if weight > 40 kg |

**Validation examples:**
- Age band derived from `AGE_AT_CONSENT`. Validate that the dose entered matches the dose table row for the subject's age band and weight band.
- Paediatric weight-for-age: if weight is below 3rd percentile for age → alert.
- Head circumference (OFC) for neonates: validate against age-sex norms.

**Execution layer:** 🖥 client (age band derived from DOB + visit date, both available; dose table in `StudyMeta`).

---

### G2. Renal / Hepatic Impairment Strata

**Renal impairment (eGFR-based):**
| Stratum | eGFR range | Dose adjustment |
|---|---|---|
| Normal | ≥ 90 | 100% |
| Mild | 60–89 | 100% (monitor) |
| Moderate | 30–59 | 75% or alternate schedule |
| Severe | 15–29 | 50% or contraindicated |
| ESRD / dialysis | < 15 | Contraindicated or specialist dosing |

**Validation:** `DOSE_VALUE` must not exceed `meta.renalDoseAdjustment[stratum] × meta.standardDose`.

**Child-Pugh class (hepatic):**
| Class | Score | Dose adjustment |
|---|---|---|
| A | 5–6 | 100% |
| B | 7–9 | 50% (monitor closely) |
| C | 10–15 | Contraindicated |

**Child-Pugh score** = sum of 5 items (bilirubin, albumin, INR, ascites, encephalopathy), each 1–3.

**Execution layer:** 🖥 client (stratum derived from same-form or carried-forward lab values + `StudyMeta`).

---

### G3. Gender-Adjusted Reference Ranges

Common lab reference ranges differ by sex:

| Lab | Male range | Female range |
|---|---|---|
| Haemoglobin | 13.5–17.5 g/dL | 12.0–15.5 g/dL |
| Haematocrit | 40–54% | 37–47% |
| Creatinine | 62–115 μmol/L | 53–97 μmol/L |
| ALT | 7–56 IU/L | 7–45 IU/L |
| Ferritin | 20–500 ng/mL | 20–200 ng/mL |
| eGFR κ constant | 0.9 | 0.7 |

**Validation pattern:** Look up `formData.SEX` → apply the sex-specific range for the lab field being validated.

**Execution layer:** 🖥 client (sex available from same-form or `StudyMeta`).

---

### G4. Biomarker and Genetic Subgroup Rules

**PD-L1 expression:**
- `PDL1_IHC_SCORE`: integer or categorical (`0`, `1-49%`, `≥ 50%`)
- Some trials: if `PDL1 < 1%` → subject is biomarker-negative → may be excluded or placed in specific arm
- TPS (Tumour Proportion Score) vs CPS (Combined Positive Score) — method must match protocol

**EGFR mutation status:**
- Valid values: `EXON19DEL`, `L858R`, `T790M`, `EXON20INS`, `OTHER`, `WILDTYPE`
- `T790M` only occurs as a secondary mutation (resistance) → if `PRIOR_EGFR_TKI = 'N'` and `EGFR_MUT = 'T790M'` → query

**BRCA status:**
- `BRCA1_GERMLINE`, `BRCA2_GERMLINE`, `BRCA_SOMATIC` — at least one must be specified if `BRCA_TESTED = 'Y'`
- If `BRCA_GERMLINE = 'POSITIVE'` → genetic counselling referral flag

**HER2 status:**
- IHC 3+ → HER2 positive
- IHC 2+ → FISH required (FISH ratio ≥ 2.0 = positive)
- IHC 0/1+ → HER2 negative
- `HER2_IHC = '2+'` and `HER2_FISH_RESULT = null` → error: "FISH testing required for IHC 2+ samples"

**Execution layer:** 🖥🖧 both (format/logic on client; eligibility gating on server).

---

## 10. Category H — Cross-Form / Cross-Visit Validation (Server-Side)

**These checks cannot be performed on the client.** They require data from other CRF forms, other visits, or the randomisation/safety database. They are documented here for completeness but are not candidates for client-side custom validators. 

**Implementation:** Many of these are available as pre-built validators in the [Server-Side Validator Library](./form-builder-server-side-validator-library.md) (configurable via Form Builder UI, no coding required). For custom validators, see [Server-Side Implementation Guide](./form-builder-custom-programming-server-side.md).

| Check | Data required | Mechanism |
|---|---|---|
| ICF date before all procedures | ICF date (CONSENTS form) vs procedure dates (all forms) | Server edit check at save |
| Baseline value for PCHG | Baseline visit lab (prior visit) | Derived field server-side |
| Delta check (visit-to-visit) | Two visits' lab values | Server batch check |
| Visit window compliance | Day 1 date (prior form) + current visit date | Server at visit open |
| Prior medication washout | Prior therapy end date (MH form) vs Day 1 (dosing form) | Server at randomisation |
| SAE CIOMS timeline | AE onset date + SAE workflow dates | Server safety module |
| RECIST confirmation | Index lesion data from two assessment timepoints | Server at assessment |
| Progression-free survival | Last assessment before PD + date of PD | Server at data lock |
| Overall survival | Last contact date + death date | Server at data lock |

**How server errors appear on the client:** The server returns `ServerValidationError[]` from `onSubmit()`. These propagate to field-level errors in `FieldStateService` as `SYSTEM_VALIDATION` type. The client displays them but does not compute them.

---

## 11. Category I — Instrument / PRO Completeness and Scoring

Patient-Reported Outcome (PRO) instruments have strict administration and scoring rules defined by the instrument developers.

### I1. Scale Item Bounds and Total Validation

Every validated scale has defined item ranges and a total score formula:

| Instrument | Items | Item range | Total range | Scoring |
|---|---|---|---|---|
| PHQ-9 | 9 | 0–3 | 0–27 | Sum |
| GAD-7 | 7 | 0–3 | 0–21 | Sum |
| HAM-A | 14 | 0–4 | 0–56 | Sum |
| MMSE | 11 | Variable per item | 0–30 | Sum |
| UPDRS III | 18 | 0–4 each | 0–72 | Sum |
| KCCQ-12 | 12 | 1–5 | Converted to 0–100 | Weighted |
| EQ-5D-5L | 5 dimensions + VAS | 1–5 per dim; VAS 0–100 | Multiple | Published algorithm |
| SF-36 | 36 | Item-specific | 0–100 (8 subscales) | Published algorithm |

**Validation rules:**
- Each item must be within its defined range.
- Total must equal sum (or weighted sum) of items.
- Items cannot be partially completed — all items must be answered.
- `null` or blank items → the total cannot be computed → soft query if imputation is allowed.

---

### I2. Missing Item Imputation Rules

Many instruments have published rules for handling missing items:

**PHQ-9:** If ≤ 1 item missing → impute with the mean of the completed items (round to nearest integer). If ≥ 2 items missing → total is missing (NC = Not Calculable).

**SF-36:** Each subscale has its own missing-item rule. Some allow 0 missing; others allow up to 50% missing with mean imputation.

**HAMD-17:** If ≤ 3 items missing → mean imputation. If > 3 missing → score is not calculable.

**Validation logic:**
```
countMissing = items.filter(i => i.value === null || i.value === undefined).length
if (countMissing > meta.instrument.maxMissingItems):
  error("Too many missing items — score cannot be computed per {meta.instrument.name} rules")
else if (countMissing > 0 && countMissing <= meta.instrument.maxMissingItems):
  warning("Imputation applied: {countMissing} item(s) missing. Score computed using mean imputation.")
```

---

### I3. Reverse-Coded Items

Some scale items are reverse-scored. The raw response (e.g., 1–5) is transformed before contributing to the total.

**Example — SF-36 item 2 (General Health):**
- Response options: 1=Excellent, 2=Very good, 3=Good, 4=Fair, 5=Poor
- Reverse code: 5→100, 4→75, 3→50, 2→25, 1→0
- Validation: if user enters raw score = 3, stored/computed value should be 50, not 3.

**RSES (Rosenberg Self-Esteem Scale):** 5 positive items and 5 negative items. Negative items are reverse-coded (4 - item value).

**Validation:** If the system stores raw responses and computes scores, validate that the computation applies reverse coding correctly.

---

### I4. Administration Timing and Anchor Logic

**Timing constraints:**
- KCCQ-12: must be administered before any clinical assessment at that visit (prevents recall bias)
- ePRO diaries: entries must have timestamps within the defined window (morning: 05:00–12:00; evening: 18:00–23:59)
- Weekly questionnaire: must be completed within ±1 day of the nominal week-end date

**Anchor item logic:**
- NRS pain scale anchor: "If you answered 0 (no pain) to question 1, please skip questions 2–8"
- If `NRS_Q1 = 0` but any of `NRS_Q2` through `NRS_Q8` is non-zero → error
- If `NRS_Q1 > 0` but `NRS_Q2` through `NRS_Q8` are all null → soft query

**Execution layer:** 🖥 client for timing (timestamp available), 🖧 server for inter-visit timing compliance.

---

## 12. Data Availability Reference

What data is available to a validator at execution time determines whether it can run client-side.

| Data | Client-side availability | Server-side availability |
|---|---|---|
| Current field value | ✅ `value` parameter | ✅ |
| All fields on same form page | ✅ `formData` parameter | ✅ |
| Subject demographics (sex, DOB) | ✅ if in same form or carried forward | ✅ always |
| Protocol-level parameters (ranges, windows) | ✅ `StudyMeta` InjectionToken | ✅ always |
| Baseline visit data | ❌ not available client-side | ✅ from database |
| Prior visit data (any visit N−1) | ❌ | ✅ |
| Data from other form types | ❌ | ✅ |
| Randomisation assignment | ❌ | ✅ |
| Audit trail / query history | ❌ | ✅ |
| WHODrug / MedDRA live databases | ❌ | ✅ |
| Real-time lab reference ranges | ✅ if bundled in StudyMeta | ✅ from LIMS |

---

## 13. Regulatory Context

### 13.1 GCP and ICH E6(R3) Requirements

- All data changes in a clinical trial must be audited (21 CFR Part 11, EMA Annex 11).
- Edit checks that block or query data are part of the Data Management Plan (DMP) and must be validated (i.e., tested with documented evidence that they work correctly).
- The validation of edit check logic is a Quality Management System (QMS) activity — not just a software engineering activity.
- Custom validators that affect safety reporting, eligibility determination, or SDTM derivation are "critical" checks and require 100% test coverage with documented IQ/OQ/PQ evidence.

### 13.2 CDISC and SDTM Compliance

- CDASH (Clinical Data Acquisition Standards Harmonization) defines standard CRF field names and controlled terminology.
- SDTM (Study Data Tabulation Model) defines how collected data maps to submission datasets.
- Custom validators that perform codelist checks must reference the CDISC CT codelist version specified in the study's Define.xml.
- CDASH companion guides provide "Completion Instructions" — the human-readable rules that translate into edit check logic.

### 13.3 21 CFR Part 11 Electronic Records

- Client-side validation cannot satisfy 21 CFR §11.10(b) (system validation) because it is not part of the audited server record.
- Server-side edit checks are part of the validated system and are included in the system validation documentation.
- Any check that gates an action (save, lock, sign) must be server-side.

---

## 14. Design Decision Register

| # | Topic | Status | Summary |
|---|---|---|---|
| Q1 | Partial date handling | ✅ **DECIDED** | Functional transform library with pipe/chain — see below |
| Q2 | Soft query / warn mechanism | ✅ **DECIDED** | Add `warn()` to SDK alongside `pass()` / `fail()` — see below |
| Q3 | ULN / Lab reference ranges | 🔖 **DEFERRED** | Separate Labs Implementation doc — not immediate |
| Q4 | Instrument scoring algorithm IP | 🔖 **DEFERRED** | SDK ships generic utilities only; instrument weights supplied by study team |
| Q5 | Cross-form data on client | ✅ **DECIDED** | `_carried` namespace in `formData` — see below |
| Q6 | MedDRA / WHODrug (Medical Coding) | 🔖 **DEFERRED** | Separate Medical Coding feature — fully documented in §15 |
| Q7 | CTCAE version management | 🔖 **DEFERRED** | Part of AE/SAE Implementation doc — Phase 4 |
| Q8 | Validator test evidence for QMS | ✅ **DECIDED** | Full implementation spec in §16 |

---

### Q1 — Partial Date Handling: Functional Transform Library ✅

**Decision:** Introduce a dedicated functional value-transformation library (working name `@vialiq/form-transforms`) that supports pipe/chain composition. It provides transformation functions that normalise field values *before* they are validated and *before* they are sent to the server. The existing `pipe` from `@vi/state-fp` is the composition primitive.

**Distinction from validation:**
- **Transformation** → normalises the raw input into a canonical form (e.g., `'450 555 5555'` → `'4505555555'`)
- **Validation** → checks whether the canonical form is acceptable (e.g., Modulus 11 check)

Both steps run in order on every trigger: `rawInput → transform pipeline → canonical value → validate → submit`.

**`PartialDate` type and utilities (first deliverable from the library):**

```typescript
// Canonical partial date representation
interface PartialDate {
  year:  number;
  month: number | null;   // null = unknown (UN)
  day:   number | null;   // null = unknown (UN)
}

type PartialDateComparison =
  | 'before'
  | 'after'
  | 'equal'
  | 'indeterminate';   // same month, one or both days unknown

// Library functions
parsePartialDate(raw: string): PartialDate | null
  // Parses 'yyyy-MM-UN', 'yyyy-UN-UN', 'yyyy-MM-dd', etc.

toISOPartialDate(pd: PartialDate): string
  // Serialises back to 'yyyy-MM-UN' format for server

comparePartialDates(a: PartialDate, b: PartialDate): PartialDateComparison
  // 'indeterminate' when ordering cannot be determined unambiguously
```

**Comparison semantics:**
- `2025-02-15` vs `2025-03-UN` → `'before'` (February always precedes March)
- `2025-03-UN` vs `2025-03-20` → `'indeterminate'` (same month, unknown day vs known day)
- `2025-03-UN` vs `2025-03-UN` → `'indeterminate'` (both unknown days)
- `'indeterminate'` comparisons must produce `warn()`, never `fail()` — a hard date-ordering error requires an unambiguous `'before'` or `'after'`

**Example transform pipeline using `pipe` from `@vi/state-fp`:**

```typescript
import { pipe } from '@vi/state-fp';
import { stripWhitespace, parsePartialDate, toISOPartialDate } from '@vialiq/form-transforms';

const normaliseDateField = pipe(
  stripWhitespace,
  parsePartialDate,
  toISOPartialDate,
);
// Applied to the raw field value before it reaches the validator
```

**Other initial transform utilities planned:**
- `stripFormatting(pattern: RegExp)` — strip separators (spaces, dashes, dots)
- `toUpperCase` / `toLowerCase`
- `trimWhitespace`
- `normaliseUnit(from, to)` — unit conversion (e.g., lbs → kg, °F → °C)
- `coerceNumeric` — parse numeric string to number with locale awareness

**Library location:** New package in this monorepo — `libs/form-transforms/`. Not part of `@vi/state-fp` (that library is domain-agnostic; transforms are clinical-form-specific). Tracked as a future roadmap item.

---

### Q2 — Soft Query / Warn Mechanism ✅

**Decision:** Extend `RuleResult` with a third outcome: `warn()`. A warning does not block form submission — it produces an inline amber indicator. The server creates a formal query record on save. The site must acknowledge the query before the form can be locked.

**SDK additions (v1.1):**

```typescript
type ValidationSeverity = 'error' | 'warning';

type ValidationError = {
  message:  string;
  severity: ValidationSeverity;
};

// All three helpers available in @vialiq/form-validator-sdk:
pass()              // field is valid — no indicator shown
fail('message')     // hard error — shown in red, blocks submit
warn('message')     // soft query — shown in amber, does NOT block submit
```

**Renderer behaviour:**
- `fail()` → red border + error message below field; form cannot be submitted until resolved
- `warn()` → amber border + warning message; form can be submitted; server creates a query record

**v1.0 scope:** `pass()` and `fail()` only. `warn()` is a v1.1 feature tracked as a technical debt item.

---

### Q5 — Cross-Form Data on Client: `_carried` Namespace ✅

**Decision:** `formData` is extended with a `_carried.*` namespace for values that originate from other forms. The server pre-populates these when delivering the form for data entry. The form schema declares which fields are carried forward using a `carried-forward` field type (read-only, not user-editable).

**Schema declaration:**

```json
{
  "key": "_carried.DM.SEX",
  "type": "carried-forward",
  "label": "Sex (from Demographics)",
  "source": { "formType": "DM", "fieldKey": "SEX" }
}
```

**Available to validators as:**

```typescript
formData['_carried.DM.SEX']       // 'M' | 'F'
formData['_carried.DM.DOB']       // ISO date string or partial date
formData['_carried.SCR.EGFR']     // number — screening eGFR
formData['_carried.SCR.WEIGHT']   // number — most recent weight
```

**Rules:**
- `_carried.*` keys are always read-only — validators must not mutate them
- If the source form has no data (subject not yet screened), the carried value is `null` — validators must handle `null` gracefully
- The `_carried` prefix is reserved — study programmers may not use it for their own field keys

---

### Q3 — Labs Implementation 🔖 DEFERRED

Labs Reference Ranges (ULN, LLN per lab, per sex, per age group) and site-specific vs central-lab logic will be specified in a dedicated document: **`docs/form-builder-labs.md`** (to be created). This covers:

- `StudyMeta.labReferenceRanges` data model
- Central lab vs local lab models
- LIMS integration for live reference range retrieval
- ULN-based eligibility validators (ALT/AST/bilirubin/creatinine thresholds)
- Lab result normalisation (unit conversion pipeline)

Not required for initial implementation.

---

### Q4 — Instrument Scoring Algorithm IP 🔖 DEFERRED

The SDK will ship **generic scoring utilities** only:
- `sumItems(items: number[]): number`
- `weightedSum(items: number[], weights: number[]): number`
- `reverseCode(value: number, max: number): number`
- `meanImputation(items: (number | null)[], maxMissing: number): number | null`

Instrument-specific weights/tables are the responsibility of the study programmer. They are provided either as `params` in the schema or as entries in `StudyMeta`. Deferred: evaluate bundling freely-published instrument algorithms (PHQ-9, GAD-7, HAM-A) in a separate `@vialiq/form-validator-sdk/instruments` entry point.

---

### Q6 — Medical Coding (MedDRA / WHODrug) 🔖 DEFERRED → See §15

Fully documented in §15. This is a distinct feature from the custom validator SDK — it requires a dedicated coding widget, server-side dictionary API, and licensed dictionary access. Not part of the initial validator SDK scope.

---

### Q7 — CTCAE Version Management 🔖 DEFERRED

CTCAE-specific grade logic (grade bounds, grade 5 = death rules, grade-to-SOC mapping) will be specified in the **AE/SAE Implementation Document** (Phase 4). This document will cover the full AE/SAE data model, CTCAE v4.03 and v5.0 definitions, and server-side grade progression rules. `StudyMeta.ctcaeVersion` field will be specified there.

---

## 15. Medical Coding — MedDRA & WHODrug

> **Status:** 🔖 Deferred — detailed requirements documented here; implementation is a future phase.  
> **Priority:** Required before any study that includes AE coding or concomitant medication coding can go live.

### 15.1 What Medical Coding Is

Medical coding is the process of mapping free-text clinical terms entered by investigators to standardised controlled dictionary codes. It is a regulatory requirement:
- **MedDRA** (Medical Dictionary for Regulatory Activities) — for adverse events, prior conditions, and concomitant conditions
- **WHODrug** (WHO Drug Dictionary) — for concomitant medications, prior medications, and study drug details

Without coded terms, adverse event data cannot be submitted to regulatory authorities and cannot be aggregated across trials in a safety database.

---

### 15.2 MedDRA Dictionary Structure

MedDRA has a **5-level hierarchy** (top → bottom):

```
SOC   →  System Organ Class          (27 SOCs in v27, e.g., "Cardiac disorders")
HLGT  →  High Level Group Term       (grouping above HLT)
HLT   →  High Level Term             (grouping above PT)
PT    →  Preferred Term              ← primary coding level for SDTM submissions
LLT   →  Lowest Level Term           ← what coders search by (synonyms of PT)
```

**Key rules:**
- Every AE must be coded to exactly one PT. The PT is the term that appears in the SDTM AE dataset (`AEDECOD`).
- Every PT belongs to a primary SOC. A PT may also belong to secondary SOCs (multi-axial coding). The primary SOC is used for submissions unless the protocol specifies otherwise.
- The SOC appears in the SDTM AE dataset (`AEBODSYS`).
- Coders search using LLTs (e.g., "heart attack" → LLT → PT "Myocardial infarction" → SOC "Cardiac disorders").
- MedDRA is **versioned**: MSSO releases new versions twice yearly (March and September). Current version: v27.1 (September 2024). A study fixes its version at study start; all coding uses that version.

**Dictionary size:** ~80,000 LLTs, ~24,000 PTs, 336 HLTs, 134 HLGTs, 27 SOCs (v27.1).

---

### 15.3 WHODrug Dictionary Structure

WHODrug uses a **5-level ATC hierarchy**:

```
Level 1  →  Anatomical main group          (e.g., C = Cardiovascular system)
Level 2  →  Therapeutic subgroup           (e.g., C09 = Renin-angiotensin system)
Level 3  →  Pharmacological subgroup       (e.g., C09A = ACE inhibitors)
Level 4  →  Chemical subgroup              (e.g., C09AA = ACE inhibitors, plain)
Level 5  →  Chemical substance             (e.g., C09AA01 = Captopril)
```

Each drug record also has:
- **DRN** (Drug Record Number) — unique identifier, 6-character string
- **Preferred drug name** — the standard name in WHODrug
- **Strength and dose form** — WHODrug B3 format includes strength (e.g., "100 mg tablet")

**Dictionary size:** ~600,000+ drug records across ~10,000 preferred names.  
**Versioning:** Quarterly releases (B3 format). Current: B3 2024Q1.

---

### 15.4 The Medical Coding Workflow

```
Investigator enters verbatim text
         │
         ▼
Site staff saves the form (verbatim stored, status = UNCODED)
         │
         ▼
Data manager opens Medical Coding module
         │
         ├── System suggests matches (auto-coding with confidence score)
         │        ├── Confidence ≥ threshold → AUTO_CODED (no review needed)
         │        └── Confidence < threshold → presented as suggestions only
         │
         ▼
Data manager selects most appropriate PT/drug
         │
         ▼
System records: verbatim + coded term + dictionary version (status = CODED)
         │
         ▼
Medical monitor reviews coding decisions (status = APPROVED)
         │
         ▼
Data lock: codings frozen (status = LOCKED)
```

**Coding status states:**

| Status | Meaning |
|---|---|
| `UNCODED` | Verbatim entered; no code assigned yet |
| `AUTO_CODED` | System auto-matched at high confidence |
| `CODED` | Data manager confirmed/selected a code |
| `QUERIED` | Coding is uncertain; query raised for investigator or medical monitor |
| `APPROVED` | Medical monitor signed off the coding decision |
| `LOCKED` | Frozen at data lock; no further changes |

---

### 15.5 CRF Fields — Adverse Event Coding

These are the CRF fields that must be present on the AE form (SDTM AE domain field names shown):

| CRF Field | SDTM Variable | Type | Description |
|---|---|---|---|
| `AE_VERBATIM` | `AETERM` | Free text | Exactly as recorded by investigator — must not be modified |
| `AE_VERBATIM_STD` | — | Free text | Standardised verbatim (punctuation/case normalised by CRO, if applicable) |
| `AE_LLT_CODE` | — | 8-digit numeric | MedDRA Lowest Level Term code (search term used) |
| `AE_LLT_TERM` | `AELLT` | Text | MedDRA LLT name (derived from code) |
| `AE_PT_CODE` | — | 8-digit numeric | MedDRA Preferred Term code |
| `AE_PT_TERM` | `AEDECOD` | Text | MedDRA PT name (derived from code) |
| `AE_HLT_CODE` | — | 8-digit numeric | High Level Term code |
| `AE_HLT_TERM` | `AEHLT` | Text | HLT name |
| `AE_HLGT_CODE` | — | 8-digit numeric | High Level Group Term code |
| `AE_HLGT_TERM` | `AEHLGT` | Text | HLGT name |
| `AE_SOC_CODE` | — | 8-digit numeric | System Organ Class code |
| `AE_SOC_TERM` | `AEBODSYS` | Text | SOC name |
| `AE_MEDDRA_VER` | — | String | MedDRA version used (e.g., `'27.1'`) |
| `AE_CODING_STATUS` | — | Enum | `UNCODED / AUTO_CODED / CODED / QUERIED / APPROVED / LOCKED` |

---

### 15.6 CRF Fields — Concomitant Medication Coding

| CRF Field | SDTM Variable | Type | Description |
|---|---|---|---|
| `CM_VERBATIM` | `CMTRT` | Free text | Drug name as written by investigator |
| `CM_VERBATIM_STD` | — | Free text | Standardised verbatim |
| `CM_WHO_DRN` | — | 6-char string | WHODrug Drug Record Number |
| `CM_WHO_NAME` | `CMDECOD` | Text | WHODrug preferred drug name |
| `CM_ATC1_CODE` | — | 1 char | ATC Level 1 code (e.g., `'C'`) |
| `CM_ATC2_CODE` | — | 3 chars | ATC Level 2 code (e.g., `'C09'`) |
| `CM_ATC3_CODE` | — | 4 chars | ATC Level 3 code (e.g., `'C09A'`) |
| `CM_ATC4_CODE` | — | 5 chars | ATC Level 4 code (e.g., `'C09AA'`) |
| `CM_ATC_CODE` | `CMCLAS` | 7 chars | ATC Level 5 code (e.g., `'C09AA01'`) |
| `CM_WHO_VER` | — | String | WHODrug version (e.g., `'B3 2024Q1'`) |
| `CM_CODING_STATUS` | — | Enum | Same states as AE above |

---

### 15.7 Client-Side Validation (Format Only)

These are the only checks the client performs — no dictionary access required:

| Rule | Check | Error |
|---|---|---|
| Verbatim required if code present | `AE_PT_CODE` populated → `AE_VERBATIM` must be populated | "Verbatim term is required when a coded term is selected" |
| Code required if verbatim and status ≠ UNCODED | If `AE_CODING_STATUS ≠ 'UNCODED'` → PT, SOC, and LLT codes must be populated | "Coding incomplete" |
| SOC required with PT | `AE_PT_CODE` present → `AE_SOC_CODE` must be present | "SOC code is required with a PT code" |
| MedDRA code format | All MedDRA codes must match `/^\d{8}$/` | "Invalid MedDRA code format (must be 8 digits)" |
| ATC code format | `CM_ATC_CODE` must match `/^[A-Z]\d{2}[A-Z]{2}\d{2}$/` | "Invalid ATC code format (e.g., C09AA01)" |
| ATC level consistency | `CM_ATC_CODE` must start with `CM_ATC4_CODE` | "ATC code hierarchy is inconsistent" |
| Version must match study | `AE_MEDDRA_VER` must equal `meta.meddraVersion` | "MedDRA version mismatch" |
| Verbatim ≠ PT term | `AE_VERBATIM` must not equal `AE_PT_TERM` exactly | "Verbatim should be the investigator's own words, not the dictionary term" |

---

### 15.8 Server-Side Validation (Authoritative)

All hierarchy and existence checks are server-side, using the licensed dictionary database:

| Rule | Mechanism |
|---|---|
| PT code exists in the declared MedDRA version | Dictionary lookup |
| LLT code is a valid LLT for the declared PT | Hierarchy lookup |
| SOC code is valid for the PT (including primary SOC check) | Hierarchy + primary flag lookup |
| ATC Level 5 code exists in the declared WHODrug version | Dictionary lookup |
| DRN exists and matches the preferred drug name | Record lookup |
| Dictionary version matches the study's declared version | Study configuration check |
| Same verbatim coded differently in two visits | Cross-form delta check |
| All AEs coded before data lock | Study-level completeness check |

---

### 15.9 UI/UX Requirements — Medical Coding Widget

The coding workflow cannot use a standard text input. It requires a dedicated `coded-term` field type in the form builder:

**Widget features (AE coding):**
- Verbatim text field — free text entry, investigator-entered
- Coding status badge (colour-coded: grey=UNCODED, amber=QUERIED, green=CODED/APPROVED)
- "Code this term" button → opens coding panel
- **Coding panel:**
  - Search box → real-time PT search via REST API (server → MedDRA DB)
  - Results list: `PT name | SOC name | LLT used`
  - Select result → auto-populates all code fields
  - Confidence indicator if AI-suggested
- Review mode: shows existing coding with option to recode

**Widget features (concomitant medication coding):**
- Verbatim text field
- Drug search → WHODrug lookup via REST API
- Results: preferred name + ATC code + strength/form
- Select → populates all CM coding fields

---

### 15.10 Auto-Coding (AI-Assisted) — Future Phase

Auto-coding maps verbatim terms to dictionary codes automatically using natural language matching.

**Proposed approach:**
- On form save, server sends verbatim to an auto-coding service
- Service returns: top-N candidate codes + confidence score per candidate
- If top candidate confidence ≥ `meta.autoCodeThreshold` (e.g., 0.95): status = `AUTO_CODED`, no human action needed
- If confidence < threshold: status = `UNCODED`, presented to data manager as suggestions

**External services to evaluate:** Medidata Autocode, Ennov Auto-Coding, custom fine-tuned LLM on MedDRA.

Not in scope for initial implementation.

---

### 15.11 Regulatory Requirements for Medical Coding

- **ICH E2A / E2B(R3):** AE coding standards for ICSRs (Individual Case Safety Reports) and expedited reporting
- **CDISC SDTM AE domain:** `AETERM`, `AEDECOD`, `AEBODSYS`, `AELLT`, `AEHLT`, `AEHLGT` are required variables for regulatory submissions
- **CDISC SDTM CM domain:** `CMTRT`, `CMDECOD`, `CMCLAS` for medications
- **Define.xml:** The MedDRA and WHODrug dictionary versions used must be declared in the study's Define.xml (`Study.MetaDataVersion`)
- **Recoding:** If MedDRA is upgraded mid-study, all existing codings must be reviewed and a recoding SOP documented. This is a sponsor DM SOP activity.
- **TMF archival:** The dictionary versions used at data lock are archived in the Trial Master File.

---

### 15.12 Implementation Requirements (Future Phase)

**Phase A — Foundation (prerequisite for any coded-term forms):**
1. Procure MedDRA licence (MSSO) and WHODrug licence (Uppsala Monitoring Centre)
2. Stand up server-side dictionary database (PostgreSQL with full MedDRA/WHODrug import pipeline)
3. REST API endpoints:
   - `GET /dictionaries/meddra/search?term={verbatim}&version={ver}` → `PT[]`
   - `GET /dictionaries/meddra/hierarchy/{ptCode}?version={ver}` → full hierarchy record
   - `GET /dictionaries/whodrug/search?term={verbatim}&version={ver}` → `DrugRecord[]`
4. Add `meddraVersion` and `whodrugVersion` to `StudyMeta`

**Phase B — Form Builder Integration:**
5. New field type: `coded-term` with `dictionary: 'meddra' | 'whodrug'`
6. Coding widget component (Angular standalone)
7. Coding status state machine in `FieldStateService`
8. Server-side validation of coding completeness at form save

**Phase C — Coding Module (separate application):**
9. Standalone medical coding queue (data manager workflow)
10. Medical monitor approval interface
11. Coding discrepancy resolution workflow

**Phase D — Auto-Coding:**
12. Auto-coding service integration
13. Confidence threshold configuration per study
14. Audit trail for auto-coded vs human-coded records

**Open design questions for Medical Coding (to be resolved in Phase A design):**
- Do we build the coding widget as a Lit web component or an Angular standalone component?
- Is the coding module a separate Angular app or integrated into the main EDC application?
- How does the client display the coding status on a read-only locked form?
- When a study upgrades MedDRA mid-study, is recoding done in the coding module or the form itself?

---

## 16. Validator Testing & QMS Evidence

> **Status:** ✅ Decided — full implementation specification.  
> **Applies to:** All custom validators written by study teams using `@vialiq/form-validator-sdk`.

### 16.1 Why This Matters

GCP (Good Clinical Practice, ICH E6(R3)) requires that all software used to manage clinical trial data is **validated** — meaning documented evidence exists that the software performs its intended function correctly. Custom validators are part of the data management system. A validator error that lets invalid data through, or blocks valid data, could:

- Corrupt clinical data going into the regulatory submission
- Prevent or delay subject treatment through false eligibility failures
- Trigger incorrect safety reports (false SAE flags)

The regulatory authority may request validation evidence during an inspection. "It was tested" is not sufficient — the test evidence must be documented, attributable, and archived.

---

### 16.2 SDK Testing Utility — `runValidator()`

The SDK ships a `runValidator()` function in its `/testing` entry point. It is the **standard and required way** to test custom validators.

```typescript
// @vialiq/form-validator-sdk/testing
import { runValidator, ValidatorTestCase, ValidatorTestReport } from '@vialiq/form-validator-sdk/testing';
```

**`ValidatorTestCase` interface:**

```typescript
interface ValidatorTestCase {
  /** Human-readable test description. Must be unique within the validator's test suite. */
  description: string;
  /** Schema params passed to the validator factory (outer function). */
  params: Record<string, unknown>;
  /** Field value under test. */
  value: unknown;
  /** Optional: other field values on the form (for cross-field validators). */
  formData?: Record<string, unknown>;
  /** Optional: override specific StudyMeta fields for this test. */
  meta?: Partial<StudyMeta>;
  /** Expected outcome from the validator inner function. */
  expect: 'pass' | 'fail' | 'warn';
  /** Optional: expected message text (substring match, case-insensitive). */
  expectMessage?: string;
}
```

**`runValidator()` signature:**

```typescript
function runValidator(
  factory: ValidatorFactory,
  cases: ValidatorTestCase[],
  options?: { validatorId?: string }
): ValidatorTestReport;
```

**`ValidatorTestReport` structure:**

```typescript
interface ValidatorTestReport {
  validatorId:  string;     // from options, or factory.name, or 'unknown'
  runAt:        string;     // ISO 8601 timestamp
  sdkVersion:   string;     // @vialiq/form-validator-sdk version
  totalCases:   number;
  passedCases:  number;
  failedCases:  number;     // cases where actual outcome ≠ expected outcome
  outcome:      'PASS' | 'FAIL';
  cases:        ValidatorTestCaseResult[];
}

interface ValidatorTestCaseResult extends ValidatorTestCase {
  actual:        'pass' | 'fail' | 'warn';
  actualMessage: string | null;
  durationMs:    number;
  testOutcome:   'PASS' | 'FAIL';
}
```

---

### 16.3 Standard Vitest Test File Structure

Every custom validator must have a co-located `*.validator.spec.ts` file. The structure is standardised:

```typescript
// validators/nhs-number.validator.spec.ts
import { describe, it, expect } from 'vitest';
import { runValidator } from '@vialiq/form-validator-sdk/testing';
import { nhsNumber } from './nhs-number.validator';

describe('nhsNumber', () => {
  const report = runValidator(nhsNumber, [
    // ── Valid inputs ─────────────────────────────────────────────────────────
    { description: 'valid NHS number (canonical)', params: {}, value: '4505555555', expect: 'pass' },
    { description: 'valid NHS number with spaces stripped', params: {}, value: '450 555 5555', expect: 'pass' },

    // ── Empty / null inputs ──────────────────────────────────────────────────
    { description: 'null passes (required handles emptiness)', params: {}, value: null, expect: 'pass' },
    { description: 'empty string passes', params: {}, value: '', expect: 'pass' },

    // ── Invalid inputs ───────────────────────────────────────────────────────
    { description: 'invalid check digit', params: {}, value: '1234567890', expect: 'fail', expectMessage: 'check digit' },
    { description: 'only 9 digits', params: {}, value: '123456789', expect: 'fail', expectMessage: '10 digits' },
    { description: '11 digits', params: {}, value: '12345678901', expect: 'fail' },
    { description: 'non-numeric characters', params: {}, value: 'ABC1234567', expect: 'fail' },

    // ── Structural impossibility ─────────────────────────────────────────────
    { description: 'structurally impossible (check digit would be 10)', params: {}, value: '0000000001', expect: 'fail' },
  ], { validatorId: 'nhsNumber' });

  // Derive vitest tests from the report
  it.each(report.cases)('$description → $expect', (tc) => {
    expect(tc.testOutcome).toBe('PASS');
  });
});
```

---

### 16.4 Minimum Test Case Requirements

The QMS requires a minimum number of test cases per validator complexity tier. Study QA is responsible for verifying compliance before study go-live.

| Validator type | Min cases | Mandatory coverage |
|---|---|---|
| Format / check digit | 6 | 1 valid; 1 null/empty; 2 invalid formats; 1 boundary; 1 impossible/edge |
| Range check (single field) | 8 | 1 valid middle; 1 at lower bound; 1 below lower; 1 at upper bound; 1 above upper; 1 null; 1 non-numeric; 1 unit edge |
| Cross-field (conditional) | 10 | All conditional branches covered; both triggered and not-triggered states; null on each field |
| Derived / formula | 12 | Formula valid; boundary inputs; division by zero guard; unit conversion; null component; out-of-range result |
| Composite (multi-field, multi-rule) | 15 | Full branch coverage + all null combinations |

Test descriptions must be unique — duplicate descriptions are rejected by the reporter.

---

### 16.5 GCP Manifest — ALCOA-Compliant Evidence

The platform provides a Vitest reporter plugin: **`@vialiq/vitest-validator-reporter`**.

When enabled in `vitest.config.ts`, it intercepts `runValidator()` results and emits a per-validator JSON manifest:

```json
{
  "manifestVersion": "1.0",
  "studyId": "XYZ-001",
  "validatorId": "nhsNumber",
  "executionEnvironment": "CI/CD — GitHub Actions (ubuntu-24.04)",
  "executedAt": "2026-05-29T14:23:01.000Z",
  "executedBy": "github-actions[bot] / run-id: 12345678",
  "gitRepository": "git@github.com:vialiq/study-xyz-001.git",
  "gitCommit": "abc1234def5678",
  "gitBranch": "main",
  "sdkVersion": "@vialiq/form-validator-sdk@1.0.0",
  "reporterVersion": "@vialiq/vitest-validator-reporter@1.0.0",
  "totalCases": 9,
  "passedCases": 9,
  "failedCases": 0,
  "outcome": "PASS",
  "cases": [
    {
      "description": "valid NHS number (canonical)",
      "value": "4505555555",
      "expect": "pass",
      "actual": "pass",
      "testOutcome": "PASS",
      "durationMs": 0.12
    }
  ]
}
```

**ALCOA compliance:**

| ALCOA criterion | How satisfied |
|---|---|
| **Attributable** | `executedBy` links CI runner to git commit; signed by CI identity |
| **Legible** | Structured JSON with human-readable `description` per case |
| **Contemporaneous** | `executedAt` ISO timestamp reflects actual test execution time |
| **Original** | CI artifact — immutable after upload; not manually editable |
| **Accurate** | Machine-generated from live test runs; not manually entered |

---

### 16.6 CI/CD Workflow

Study teams must configure their CI pipeline as follows:

```yaml
# .github/workflows/validate-validators.yml (example)
- name: Run validator tests
  run: npx vitest run --reporter=@vialiq/vitest-validator-reporter

- name: Upload QMS manifests
  uses: actions/upload-artifact@v4
  with:
    name: validator-qms-manifests
    path: dist/validator-manifests/*.json
    retention-days: 3650   # 10 years — GCP archival requirement
```

**Gating rule:** If any validator test fails (actual ≠ expected for any case), the CI pipeline fails and the validator cannot be deployed to a live study. There is no manual override — test failures block deployment.

---

### 16.7 Study Go-Live Checklist (QMS)

Before a study can start collecting data:

- [ ] All custom validators have a co-located `*.validator.spec.ts`
- [ ] `runValidator()` is used in every spec file
- [ ] Test case count meets minimum requirements per complexity tier (§16.4)
- [ ] CI pipeline runs tests and uploads manifests
- [ ] All manifests have `"outcome": "PASS"`
- [ ] Manifests are stored in the study's DMS with a version reference
- [ ] The `validatorId` in each manifest matches the key used in the form schema
- [ ] QA manager signs off the Validator Validation Report in the DMS

**For critical validators** (eligibility gates, SAE flags, dose calculation): additionally:
- [ ] Independent second reviewer has reviewed test cases
- [ ] Edge cases reviewed against the protocol (not just against the code)
- [ ] Approval documented in the study's Data Management Plan

---

### 16.8 Platform Deliverables

| Deliverable | Package | Owner | Release |
|---|---|---|---|
| `runValidator()` function | `@vialiq/form-validator-sdk/testing` | Platform team | SDK v1.0 |
| `ValidatorTestCase` / `ValidatorTestReport` types | `@vialiq/form-validator-sdk/testing` | Platform team | SDK v1.0 |
| `@vialiq/vitest-validator-reporter` Vitest plugin | Separate package | Platform team | Before first study go-live |
| QMS Validator Validation Report template (DOCX) | DMS template library | QMS team | Before first study go-live |
| CI workflow YAML example | Platform docs | Platform team | SDK v1.0 |
