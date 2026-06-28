# Field-Level Encryption — Clinical EDC SaaS Platform

> **Status:** FINALIZED — 2026-06-01  
> **Author:** Architecture Team  
> **Related Docs:**
> - [auth-identity-multitenancy-clinical-edc.md](./auth-identity-multitenancy-clinical-edc.md) — Identity, multi-tenancy, audit trail
> - [form-builder-schema.md](./form-builder-schema.md) — Field schema (BaseComponentSchema)
> - [form-builder-validation.md](./form-builder-validation.md) — Edit check / validation engine
> - [final-database-decision-mssql-vs-mongodb.md](./final-database-decision-mssql-vs-mongodb.md) — Storage layer

---

## Table of Contents

1. [Problem Statement & Requirements](#1-problem-statement--requirements)
2. [Threat Model — Why Field-Level Encryption?](#2-threat-model--why-field-level-encryption)
3. [What Field-Level Encryption Is NOT](#3-what-field-level-encryption-is-not)
4. [Algorithm Selection — AES-256-GCM](#4-algorithm-selection--aes-256-gcm)
5. [Key Management Architecture — Envelope Encryption](#5-key-management-architecture--envelope-encryption)
6. [Key Hierarchy — Platform → Tenant → Study](#6-key-hierarchy--platform--tenant--study)
7. [Encrypted Value Storage Format](#7-encrypted-value-storage-format)
8. [Field Schema Changes — Design System Integration](#8-field-schema-changes--design-system-integration)
9. [Edit Check Restriction — Why and How](#9-edit-check-restriction--why-and-how)
10. [Versioning Rules — Immutability After Data Entry Starts](#10-versioning-rules--immutability-after-data-entry-starts)
11. [Data Flow — Encrypt on Save, Decrypt on Read](#11-data-flow--encrypt-on-save-decrypt-on-read)
12. [.NET Implementation — IFieldEncryptionService](#12-net-implementation--ifieldencryptionservice)
13. [.NET Implementation — Key Management Service](#13-net-implementation--key-management-service)
14. [.NET Implementation — Encryption Pipeline in Data Save](#14-net-implementation--encryption-pipeline-in-data-save)
15. [.NET Implementation — Decryption Pipeline on Read](#15-net-implementation--decryption-pipeline-on-read)
16. [Form Schema TypeScript Changes](#16-form-schema-typescript-changes)
17. [Form Builder UI — Design-Time Behaviour](#17-form-builder-ui--design-time-behaviour)
18. [Form Renderer — Runtime Behaviour](#18-form-renderer--runtime-behaviour)
19. [Audit Trail with Encrypted Fields](#19-audit-trail-with-encrypted-fields)
20. [GDPR Crypto-Shredding — Right to Erasure](#20-gdpr-crypto-shredding--right-to-erasure)
21. [Key Rotation Strategy](#21-key-rotation-strategy)
22. [Performance — DEK Caching](#22-performance--dek-caching)
23. [MongoDB Considerations](#23-mongodb-considerations)
24. [Access Control — Who Can Decrypt](#24-access-control--who-can-decrypt)
25. [Regulatory Compliance Mapping](#25-regulatory-compliance-mapping)
26. [Decision Summary](#26-decision-summary)

---

## 1. Problem Statement & Requirements

### 1.1 Core Requirement

When a field in the form designer is marked as **encrypted**, its value must be stored in ciphertext in MongoDB. The plaintext is never persisted anywhere on the server. Decryption happens only at the point of display — on authorised screens.

**Screens that decrypt and display plaintext:**
- Data entry screen (CRC entering data)
- View-only screen (CRA reviewing, PI reviewing)
- Reports (Data Manager, Biostatistician — role-gated)

**Everywhere else the value appears as `[ENCRYPTED]` or is absent entirely:**
- API responses to unauthorised roles
- MongoDB query results viewed directly (DBA, ops)
- Logs, diagnostics, error messages
- Edit check / validation engine inputs
- Cross-field calculation engine inputs
- Export pipelines without explicit decryption step

### 1.2 Explicit Requirements Captured

```
R1: Fields in the design system can be individually marked for encryption.
    Marking is a boolean toggle in the field's properties panel.

R2: When a value is saved to MongoDB it is always stored as ciphertext.
    The API layer never persists plaintext for an encrypted field.

R3: Decrypted values are shown only on:
    (a) Data entry screen
    (b) View-only / read-only screen
    (c) Authorised report outputs

R4: This is STORAGE ENCRYPTION, not display masking.
    Masking (showing "****") is a separate, independent feature.
    A field can be: (a) neither, (b) masked only, (c) encrypted only,
    or (d) encrypted AND masked (shows masked + stored as ciphertext).

R5: Encrypted fields CANNOT be used as operands in edit checks.
    Enforcement happens at:
    (a) Design time — edit check builder blocks encrypted fields
    (b) Runtime — edit check engine skips encrypted fields entirely

R6: VERSIONING — once data entry has started for a field at a given form
    version, the encryption flag CANNOT be changed for that field version.
    Rationale: changing encryption retrospectively would require re-encrypting
    or decrypting all existing stored values — a data migration with audit risk.

R7: For NEW fields (no data yet in any record), encryption can be freely
    toggled before data entry begins.

R8: The system must support key rotation without re-encrypting all data
    (envelope encryption pattern).

R9: GDPR right to erasure: deleting a tenant's encryption key makes all
    their encrypted field data permanently irrecoverable (crypto-shredding).
    This satisfies Art. 17 without deleting audit trail records.
```

---

## 2. Threat Model — Why Field-Level Encryption?

### 2.1 Threats Mitigated

```
THREAT 1: Database Breach (MongoDB Atlas data exfiltration)
  Scenario: Attacker gains read access to MongoDB (compromised credentials,
            misconfigured network, Atlas vulnerability)
  Without FLE: All PII / PHI visible in plaintext → GDPR Art. 33 mandatory
               breach notification; HIPAA breach; reputational damage
  With FLE:    Only ciphertext exposed. Without the KMS key, data is
               computationally unrecoverable. Breach may NOT be notifiable
               under GDPR Recital 83 ("encryption renders data unintelligible")

THREAT 2: Insider Access (DBA, DevOps, MongoDB Atlas support)
  Scenario: Internal ops team or MongoDB support staff can query the Atlas cluster
  Without FLE: PHI visible to anyone with Atlas project access
  With FLE:    Atlas contains only ciphertext. KMS access is separate,
               audited, and restricted to the application service identity

THREAT 3: Backup/Snapshot Exposure
  Scenario: MongoDB Atlas backup snapshots are accessed (exfiltration or mistake)
  Without FLE: Snapshots contain plaintext PHI
  With FLE:    Snapshots contain only ciphertext; no key = no plaintext

THREAT 4: Log/Diagnostic Leakage
  Scenario: Structured logging inadvertently captures field values
            (e.g., error serialization of a MongoDB document)
  Without FLE: PHI appears in application logs, APM traces, Sentry
  With FLE:    Only ciphertext in logs (string starting with "enc:v1:")

THREAT 5: Cross-Tenant Data Leak (Model B — shared cluster)
  Scenario: Bug causes one tenant's documents to be read by another tenant
  Without FLE: PHI exposed cross-tenant
  With FLE:    Each tenant has their own DEK. Even if the raw document is
               returned, it cannot be decrypted without that tenant's key

THREAT 6: Regulatory Audit (FDA, EMA inspection)
  Scenario: Inspector requests evidence of data protection controls
  With FLE:    We can demonstrate: "Sensitive patient identifiers are
               encrypted at field level using AES-256-GCM with keys managed
               by [AWS KMS/Azure Key Vault]. No plaintext PHI is stored."
```

### 2.2 Threats NOT Mitigated by Field-Level Encryption

```
NOT MITIGATED:
  - Application-layer attacks (if attacker compromises the running API
    process, they can call IFieldEncryptionService.Decrypt directly)
  - KMS key compromise (if the master key is stolen, all DEKs are exposed)
  - Authorised user exfiltration (a legitimate PI can see the plaintext on screen)
  - Side-channel attacks on the encryption implementation

MITIGATIONS FOR THE ABOVE (out of scope for this doc):
  - Application layer: WAF, OWASP hardening, pen testing (see auth doc §13)
  - KMS: HSM-backed keys, strict IAM policies, KMS CloudTrail audit
  - Authorised users: DLP policies, audit logging of decrypt events
```

---

## 3. What Field-Level Encryption Is NOT

| Concept | What it does | Is it field-level encryption? |
|---|---|---|
| **TLS/HTTPS** | Encrypts data in transit between browser and API | No — data at rest is plaintext |
| **MongoDB Atlas Encryption at Rest** | Encrypts entire disk/volume | No — data is decrypted when read by MongoDB; MongoDB can see plaintext |
| **Display Masking** | Shows `****` or `xx/xx/1980` in the UI | No — value is plaintext in storage |
| **Field-Level Encryption (this doc)** | Stores ciphertext in MongoDB; decrypts only in authorised API handlers | **YES** |
| **MongoDB Client-Side Field Level Encryption (CSFLE)** | MongoDB's own FLE driver feature | Not used — requires MongoDB Enterprise/Atlas; limits our query flexibility and is harder to audit for CSV purposes |

> **Why not use MongoDB's CSFLE?**  
> MongoDB CSFLE is an excellent feature but requires MongoDB Enterprise or Atlas Dedicated (already our default), adds driver-side key management complexity, and makes Computer System Validation (CSV) harder — the encryption is opaque to standard MongoDB tooling. Our own AES-256-GCM implementation is simpler to validate, audit, and document for FDA 21 CFR Part 11 CSV purposes.

---

## 4. Algorithm Selection — AES-256-GCM

### 4.1 Decision: AES-256-GCM

```
Algorithm:  AES-256-GCM
            (Advanced Encryption Standard, 256-bit key, Galois/Counter Mode)

Key size:   256 bits (32 bytes)

Nonce/IV:   96 bits (12 bytes), randomly generated per encryption operation
            CRITICAL: Each encryption uses a fresh random nonce.
            NEVER reuse a nonce with the same key.

Auth tag:   128 bits (16 bytes)
            Provides authenticated encryption — any tampering with
            the ciphertext is detected at decryption time.

Mode:       Non-deterministic (probabilistic)
            Same plaintext + same key → DIFFERENT ciphertext each time
            (due to random nonce)
```

### 4.2 Why AES-256-GCM Over Alternatives

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ Algorithm       │ Auth'd │ Non-determ. │ FIPS 140-2 │ Notes                    │
├────────────────────────────────────────────────────────────────────────────────┤
│ AES-256-GCM ✅  │ Yes    │ Yes         │ Yes        │ CHOSEN. Standard for     │
│                 │        │             │            │ field-level encryption.  │
│                 │        │             │            │ Detects tampering.       │
├────────────────────────────────────────────────────────────────────────────────┤
│ AES-256-CBC     │ No*    │ Yes (IV)    │ Yes        │ No authentication tag —  │
│                 │        │             │            │ must add HMAC separately.│
│                 │        │             │            │ Padding oracle risk.     │
├────────────────────────────────────────────────────────────────────────────────┤
│ AES-256-SIV     │ Yes    │ NO          │ Yes        │ Deterministic — same     │
│ (AES-SIV)       │        │             │            │ plaintext = same cipher. │
│                 │        │             │            │ Allows equality queries  │
│                 │        │             │            │ but weaker security.     │
│                 │        │             │            │ NOT needed since FLE     │
│                 │        │             │            │ fields cannot be queried.│
├────────────────────────────────────────────────────────────────────────────────┤
│ ChaCha20-Poly   │ Yes    │ Yes (nonce) │ No         │ Not FIPS — rejected for  │
│ 1305            │        │             │            │ clinical/regulated use.  │
├────────────────────────────────────────────────────────────────────────────────┤
│ RSA-OAEP        │ Yes    │ Yes         │ Yes        │ Asymmetric — expensive;  │
│                 │        │             │            │ max 190 bytes plaintext  │
│                 │        │             │            │ with 2048-bit key.       │
│                 │        │             │            │ Used for key wrapping    │
│                 │        │             │            │ (KMS), NOT field values. │
└────────────────────────────────────────────────────────────────────────────────┘
* AES-CBC can be made authenticated with HMAC-SHA-256, but this is what GCM already does.
```

### 4.3 Why Non-Deterministic Is Right Here

Deterministic encryption (AES-SIV) would allow equality queries (`WHERE ssn = encrypt('123-45-6789')`). However, **encrypted fields in our system explicitly CANNOT be used in edit checks or queries** (Requirement R5). Since we don't need queryability, non-deterministic encryption is strictly superior — it leaks no frequency information to an attacker who sees the ciphertext database.

### 4.4 Security Parameters

```
Nonce size:        96 bits (12 bytes) — NIST SP 800-38D recommended size for GCM
Nonce source:      System CSPRNG (RandomNumberGenerator.GetBytes in .NET)
Auth tag size:     128 bits (maximum) — do not truncate
Max plaintext:     ~68 GB per (key, nonce) pair — not a practical concern for fields
Nonce collision:   With 96-bit random nonces, birthday bound is 2^48 encryptions
                   per key. Rotate DEK before reaching 2^32 encryptions (~4 billion)
                   per key. In practice, key rotation policy (annual or on events)
                   is far more frequent than this limit.
```

---

## 5. Key Management Architecture — Envelope Encryption

### 5.1 The Problem with Simple Encryption

If you encrypt all field values with a single static key stored in `appsettings.json`:
- Key rotation requires re-encrypting every encrypted field value in the database
- Key compromise exposes ALL tenants' data
- Key cannot be independently audited or revoked per tenant
- Cannot satisfy GDPR crypto-shredding (can't delete one tenant's key)

### 5.2 Envelope Encryption — The Solution

```
ENVELOPE ENCRYPTION PATTERN:

1. Master Key (KEK — Key Encryption Key)
   - Lives ONLY in KMS (AWS KMS / Azure Key Vault)
   - Never leaves the KMS HSM boundary
   - Used only to WRAP and UNWRAP Data Encryption Keys
   - Strictly access-controlled: only the application service identity can call KMS

2. Data Encryption Key (DEK)
   - 256-bit AES key, generated by the platform
   - Used to actually encrypt/decrypt field values
   - Stored ENCRYPTED (wrapped by KEK) in MongoDB → tenants.encryptedDek
   - Plaintext DEK lives only in application memory (short-lived cache)
   - Never written to disk, never logged

WORKFLOW — ENCRYPT A FIELD VALUE:
  ① API receives save request with plaintext field value
  ② TenantConnectionManager provides tenant context
  ③ KeyManagementService looks up DEK for tenant (from cache or KMS)
     If not in cache:
       a. Fetch encryptedDek from MongoDB tenants collection
       b. Call KMS.Decrypt(encryptedDek) → plaintext DEK (in-memory only)
       c. Cache plaintext DEK for 5 minutes (TTL per tenant)
  ④ FieldEncryptionService.Encrypt(plaintext, dek) → EncryptedValue
  ⑤ Store EncryptedValue in MongoDB field slot

WORKFLOW — DECRYPT A FIELD VALUE:
  ① API receives read request for authorised screen
  ② KeyManagementService provides DEK (same as above — cache hit or KMS call)
  ③ FieldEncryptionService.Decrypt(EncryptedValue, dek) → plaintext
  ④ Return plaintext in API response
  ⑤ Audit log: FIELD_DECRYPTED event (optional, configurable per tenant)

WORKFLOW — GDPR CRYPTO-SHREDDING (tenant right to erasure):
  ① Delete or disable tenant's DEK in KMS
  ② Delete encryptedDek from tenants collection
  ③ All encrypted field values in that tenant's DB are permanently unreadable
  ④ No need to delete individual records (preserves audit trail for 21 CFR Part 11)
```

### 5.3 KMS Provider Choice

Both AWS KMS and Azure Key Vault are supported via an abstraction interface. The choice is made at deployment time per environment.

```
AWS KMS:
  - Key type: Symmetric AES-256 (AWS-managed or customer-managed CMK)
  - API: GenerateDataKey (generates 256-bit DEK + encrypted copy in one call)
  - Price: $1/month per CMK + $0.03/10,000 API calls
  - Regions: same region as MongoDB Atlas for latency

Azure Key Vault:
  - Key type: AES-256 in Key Vault / RSA-4096 in Key Vault HSM
  - API: WrapKey / UnwrapKey (we generate DEK ourselves and wrap it)
  - Price: £0.0287 per 10,000 operations (Standard tier)
  - Note: Use Key Vault HSM tier for FIPS 140-2 Level 3 (strongest)

HashiCorp Vault (self-hosted):
  - Transit Secrets Engine (software implementation)
  - Higher operational overhead but no cloud dependency
  - Suitable if the platform is deployed fully on-premises
```

---

## 6. Key Hierarchy — Platform → Tenant → Study

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        KEY HIERARCHY                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  KMS (AWS / Azure)                                                           │
│  ┌────────────────────────────────┐                                          │
│  │ Platform Master Key (CMK)       │ ← NEVER leaves KMS                      │
│  │ One per deployment region       │   Used only to wrap/unwrap DEKs         │
│  └───────────────┬────────────────┘                                          │
│                  │ wraps                                                     │
│                  ▼                                                           │
│  MongoDB: tenants collection                                                 │
│  ┌─────────────────────────────────────────────────────────┐                 │
│  │ TenantConfig {                                           │                 │
│  │   tenantId: "client-a-pharma"                           │                 │
│  │   encryptedDek: "AQICAHh..."  ← DEK wrapped by CMK      │                 │
│  │   dekKeyId: "arn:aws:kms:..."  ← which CMK version      │                 │
│  │   dekCreatedAt: 2026-06-01T00:00:00Z                     │                 │
│  │   dekRotatedAt: null                                     │                 │
│  │ }                                                        │                 │
│  └────────────────────────────┬────────────────────────────┘                 │
│                               │ unwrap at runtime (KMS call)                 │
│                               ▼                                              │
│  Application Memory (volatile — never written to disk)                       │
│  ┌─────────────────────────────────────┐                                     │
│  │ DEK (plaintext, 256 bits)            │ ← IMemoryCache, TTL: 5 minutes     │
│  │ Used to encrypt / decrypt fields     │   Per tenant, per process instance  │
│  └─────────────────────────────────────┘                                     │
│                               │ AES-256-GCM                                  │
│                               ▼                                              │
│  MongoDB: edc database (per-tenant cluster or database)                      │
│  ┌─────────────────────────────────────────────────────────┐                 │
│  │ subject_form_data {                                      │                 │
│  │   "dob": {                                               │                 │
│  │     "v": 1,                                             │                 │
│  │     "alg": "A256GCM",                                   │                 │
│  │     "kid": "client-a-pharma-dek-v1",                    │                 │
│  │     "iv": "base64-96bit-nonce",                         │                 │
│  │     "tag": "base64-128bit-auth-tag",                    │                 │
│  │     "ct": "base64-ciphertext"                           │                 │
│  │   }                                                      │                 │
│  │ }                                                        │                 │
│  └─────────────────────────────────────────────────────────┘                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

ONE DEK PER TENANT — RATIONALE:
  ✅ Simple — one key per tenant, no per-study key complexity
  ✅ GDPR crypto-shredding = delete one key per tenant (clean, fast)
  ✅ Key compromise limited to one tenant's data
  ✅ Matches our multi-tenancy isolation model (one realm per tenant)

FUTURE OPTION — ONE DEK PER STUDY:
  If a client requires additional isolation between studies
  (e.g., a blinded sponsor who should not see subject data from another study):
  Add studyEncryptedDek to the study document.
  The current design supports this extension without schema changes.
```

---

## 7. Encrypted Value Storage Format

Every encrypted field value is stored as a structured sub-document in MongoDB. Plain string ciphertext is NOT sufficient — we need the nonce, auth tag, algorithm identifier, and key ID for correct decryption.

```typescript
// The stored format in MongoDB for any encrypted field
interface EncryptedValueEnvelope {
  v: 1;                   // envelope schema version (for future format evolution)
  alg: "A256GCM";         // algorithm identifier (always A256GCM for now)
  kid: string;            // key ID — which DEK version was used (for rotation)
                          // e.g. "client-a-pharma-dek-v2"
  iv: string;             // Base64-encoded 96-bit nonce (16 chars base64)
  tag: string;            // Base64-encoded 128-bit authentication tag (24 chars)
  ct: string;             // Base64-encoded ciphertext
}
```

**Example — storing date of birth `1985-03-15`:**

```json
{
  "subjectId": "SUBJ-001",
  "studyId": "STUDY-2026-001",
  "formId": "demographics-v1",
  "data": {
    "firstName": {
      "v": 1,
      "alg": "A256GCM",
      "kid": "client-a-pharma-dek-v1",
      "iv": "YWJjZGVmZ2hpamts",
      "tag": "MTIzNDU2Nzg5MDEyMzQ1Ng==",
      "ct": "c2Vuc2l0aXZl"
    },
    "dateOfBirth": {
      "v": 1,
      "alg": "A256GCM",
      "kid": "client-a-pharma-dek-v1",
      "iv": "bm9uY2VieXRlczEy",
      "tag": "YXV0aHRhZ2J5dGVzMTIzNA==",
      "ct": "ZGF0ZW9mYmlydGg="
    },
    "systolicBP": 128,
    "heartRate": 72
  }
}
```

Note: `systolicBP` and `heartRate` are not encrypted — they are clinical efficacy data used in edit checks. Only `firstName` and `dateOfBirth` (PII) are encrypted.

### 7.1 Why Sub-Document, Not String Prefix?

A common shortcut is to store encrypted values as a prefixed string: `"enc:v1:base64data"`. We explicitly reject this:

```
PROBLEMS WITH STRING PREFIX APPROACH:
  ✗ Type conflation — MongoDB stores everything as strings, losing numeric type info
  ✗ Auth tag and nonce need separate encoding/parsing (fragile string splitting)
  ✗ No structured querying of metadata (e.g., find all docs using old DEK version)
  ✗ Harder to detect partial corruption

BENEFITS OF SUB-DOCUMENT:
  ✅ Each component (iv, tag, ct, kid) is individually addressable
  ✅ MongoDB aggregation can find all documents using a specific key version:
     db.form_data.find({ "data.dob.kid": "dek-v1" }) — needed for key rotation
  ✅ Explicit algorithm field prevents algorithm confusion attacks
  ✅ Version field (v:1) allows format migration without touching ciphertext
```

---

## 8. Field Schema Changes — Design System Integration

### 8.1 New `encryption` Property on BaseComponentSchema

```typescript
// Addition to: libs/form-builder/src/lib/types/schema.ts
// Extends BaseComponentSchema

export interface FieldEncryptionConfig {
  /**
   * Whether this field's value is encrypted in storage.
   * When true:
   *   - Value is encrypted by the API layer before writing to MongoDB
   *   - Value is decrypted by the API layer before sending to authorised screens
   *   - Field is EXCLUDED from edit check engine inputs
   *   - Field cannot be used as an operand in any ValidationRule of type 'jsonLogic'
   *     that references other fields (cross-field rules)
   *   - Field is shown with a lock icon in the form builder
   *
   * Immutability rule:
   *   - Can be freely toggled BEFORE any data has been submitted for this field
   *     at the current formVersion.
   *   - Once ANY submission record exists with this field at this formVersion,
   *     the encryption flag is LOCKED (cannot be toggled in either direction).
   *   - To change encryption on an existing field: increment formVersion,
   *     create a migration plan for existing data.
   *
   * Default: false (not encrypted)
   */
  enabled: boolean;

  /**
   * ISO-8601 timestamp when the encryption flag was locked
   * (i.e., when the first data submission for this field+formVersion was received).
   * Set by the server — do NOT set in the form builder.
   * Null if not yet locked.
   */
  lockedAt?: string;

  /**
   * The form version at which this encryption setting was locked.
   * Set by the server at first submission.
   */
  lockedAtFormVersion?: string;
}

// Extend BaseComponentSchema:
export interface BaseComponentSchema {
  // ... all existing properties ...

  /**
   * Storage encryption configuration for this field.
   * Only meaningful for field components that submit a value
   * (text-input, email, tel, number, date, textarea, etc.).
   * Ignored for layout components, dividers, content blocks.
   *
   * When omitted, treated as { enabled: false }.
   *
   * IMPORTANT: Encrypted fields cannot be used in edit checks.
   * The edit check builder will reject encrypted fields as operands.
   */
  encryption?: FieldEncryptionConfig;
}
```

### 8.2 Which Field Types Can Be Encrypted?

```typescript
// Encryptable field types — value types where encryption is meaningful
const ENCRYPTABLE_FIELD_TYPES = [
  'text-input',
  'email',
  'tel',
  'textarea',
  'date',
  'number',
  'password',  // always encrypted regardless of flag
  'select',
  'dropdown',
  'combobox',
  'radio-group',
  'hidden',
] as const;

// NOT encryptable — these do not produce submittable values or are structural
const NON_ENCRYPTABLE_TYPES = [
  'panel', 'columns', 'tabs', 'fieldset', 'repeater',
  'divider', 'content', 'button', 'sub-form',
  'signature',  // signature has its own hash-based integrity; separate from encryption
  'rating',     // ordinal scale — usually used in edit checks; cannot be encrypted
] as const;
```

### 8.3 Field Identity for Versioning Lock

```typescript
// The server uses this composite key to determine if data exists
// for a given field version:
interface FieldVersionLockKey {
  formId: string;         // The form's stable UUID
  formVersion: string;    // e.g. "2"
  fieldId: string;        // Field's stable UUID (never changes even across versions)
}

// Query to check if encryption flag is locked:
// db.form_data.countDocuments({
//   formId: "...", formVersion: "2", "fieldValues.{fieldId}": { $exists: true }
// }) > 0 → LOCKED
```

---

## 9. Edit Check Restriction — Why and How

### 9.1 Why Encrypted Fields Cannot Be in Edit Checks

```
FUNDAMENTAL INCOMPATIBILITY:

Edit checks compare field values:
  IF systolicBP > 200 THEN raise_query("Systolic BP exceeds plausible maximum")
  IF dateOfBirth > visitDate THEN raise_query("DOB after visit date")

For an encrypted field, the value in MongoDB is:
  { "v": 1, "alg": "A256GCM", "kid": "...", "iv": "...", "tag": "...", "ct": "..." }

Not the plaintext date "1985-03-15".

OPTION A: Decrypt before edit check evaluation
  - Forces decryption of sensitive data in the edit check engine
  - Edit check engine becomes a sensitive data processor
  - Edit check results may be logged (query text, compared values)
  - Logs would contain decrypted PHI → audit/compliance risk
  - NOT acceptable.

OPTION B: Skip encrypted fields entirely in edit checks (CHOSEN)
  - Edit check engine never receives decrypted values
  - No PHI leakage through the validation pipeline
  - Users who try to build edit checks referencing encrypted fields
    receive a design-time error in the form builder
  - Runtime engine simply skips encrypted fields (no error, no comparison)
```

### 9.2 Design-Time Enforcement — Form Builder

```typescript
// libs/form-builder/src/lib/edit-check-builder/validation.ts

export function validateEditCheckOperand(
  fieldId: string,
  formSchema: FormSchema
): OperandValidationResult {
  const field = findFieldById(formSchema, fieldId);

  if (!field) {
    return { valid: false, error: `Field ${fieldId} not found in form` };
  }

  if (field.encryption?.enabled) {
    return {
      valid: false,
      error: `Field "${field.label}" is encrypted and cannot be used in edit checks. ` +
             `Encrypted fields are stored as ciphertext and have no comparable plaintext value ` +
             `available to the validation engine. Remove encryption or choose a different field.`,
      code: 'ENCRYPTED_FIELD_IN_EDIT_CHECK'
    };
  }

  return { valid: true };
}

// Applied in the edit check UI:
// - Encrypted fields shown in field picker with lock icon and greyed out
// - Attempting to drag an encrypted field into an edit check operand slot
//   shows the error inline
// - Existing edit checks that somehow reference an encrypted field
//   are flagged with a schema validation error on form load
```

### 9.3 Runtime Enforcement — Edit Check Engine

```typescript
// libs/form-builder/src/lib/validation/edit-check-engine.ts

// Before running any JsonLogic rule, strip all encrypted field values
// from the data context. This ensures the rule evaluation context
// contains ONLY plaintext (non-encrypted) field values.

function buildEditCheckContext(
  formData: Record<string, unknown>,
  formSchema: FormSchema
): Record<string, unknown> {
  const context: Record<string, unknown> = {};

  for (const [fieldKey, value] of Object.entries(formData)) {
    const field = findFieldByKey(formSchema, fieldKey);

    if (field?.encryption?.enabled) {
      // Encrypted fields are excluded from edit check context entirely.
      // The JsonLogic rule will see `undefined` for this field,
      // which evaluates as null/falsy in JsonLogic — no error thrown.
      // Note: any edit check referencing this field was blocked at design time.
      continue;
    }

    context[fieldKey] = value;
  }

  return context;
}
```

### 9.4 Schema Validation — Catch Violations at Form Publish Time

```typescript
// libs/form-builder/src/lib/schema-validator/rules/no-encrypted-in-edit-checks.ts

export function validateNoEncryptedFieldsInEditChecks(
  schema: FormSchema
): ValidationError[] {
  const errors: ValidationError[] = [];
  const encryptedFieldKeys = new Set<string>();

  // Collect all encrypted field keys
  function collectEncryptedFields(components: ComponentSchema[]) {
    for (const comp of components) {
      if (comp.encryption?.enabled && comp.key) {
        encryptedFieldKeys.add(comp.key);
      }
      if ('components' in comp && comp.components) {
        collectEncryptedFields(comp.components);
      }
    }
  }

  collectEncryptedFields(schema.components);

  // Check each field's validation rules for references to encrypted fields
  function checkValidationRules(components: ComponentSchema[]) {
    for (const comp of components) {
      for (const rule of comp.validation ?? []) {
        if (rule.type === 'jsonLogic' && rule.logic) {
          const referencedKeys = extractFieldReferences(rule.logic);
          for (const key of referencedKeys) {
            if (encryptedFieldKeys.has(key)) {
              errors.push({
                fieldId: comp.id,
                fieldLabel: comp.label,
                code: 'ENCRYPTED_FIELD_IN_EDIT_CHECK',
                message: `Edit check on "${comp.label}" references encrypted field "${key}". ` +
                         `Encrypted fields cannot be used in validation rules.`,
                path: `components.${comp.id}.validation`
              });
            }
          }
        }
      }
      if ('components' in comp && comp.components) {
        checkValidationRules(comp.components);
      }
    }
  }

  checkValidationRules(schema.components);
  return errors;
}
```

---

## 10. Versioning Rules — Immutability After Data Entry Starts

### 10.1 The Core Rule

```
┌─────────────────────────────────────────────────────────────────────────┐
│ FIELD ENCRYPTION VERSIONING RULE                                         │
│                                                                          │
│ STATE: No data submitted for this field at this form version             │
│   → encryption.enabled CAN be toggled (on or off)                       │
│   → encryption.lockedAt is null                                          │
│                                                                          │
│ STATE: At least one submission exists for this field at this form version│
│   → encryption.enabled is LOCKED                                         │
│   → Any attempt to toggle it returns HTTP 422 with code:                 │
│     ENCRYPTION_FLAG_LOCKED                                               │
│   → encryption.lockedAt = timestamp of first submission                  │
│                                                                          │
│ TO CHANGE ENCRYPTION ON AN EXISTING FIELD:                               │
│   1. Increment form version (e.g., from v3 to v4)                       │
│   2. Set encryption.enabled = desired value on the new version           │
│   3. Existing v3 records remain with their existing encryption setting   │
│   4. New v4 records use the new encryption setting                       │
│   5. Document in the form's change log (required for 21 CFR Part 11)    │
│                                                                          │
│ RATIONALE:                                                               │
│   Adding encryption to an existing field would require re-encrypting all │
│   existing plaintext values — a destructive migration with audit risk.   │
│   Removing encryption would expose historically encrypted values as      │
│   plaintext — a GDPR violation (less protection than previously promised)│
│   Versioning cleanly isolates old and new field behaviour.               │
└─────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Server-Side Lock Enforcement

```csharp
// Services/FormVersionService.cs

public async Task<UpdateFieldResult> UpdateFieldEncryptionAsync(
    string tenantId,
    string formId,
    string formVersion,
    string fieldId,
    bool encryptionEnabled,
    CancellationToken ct = default)
{
    var db = await _connectionManager.GetDatabaseAsync(tenantId);

    // Check if any submission data exists for this field+formVersion
    var hasData = await db.GetCollection<BsonDocument>("form_data")
        .Find(Builders<BsonDocument>.Filter.And(
            Builders<BsonDocument>.Filter.Eq("formId", formId),
            Builders<BsonDocument>.Filter.Eq("formVersion", formVersion),
            Builders<BsonDocument>.Filter.Exists($"data.{fieldId}")))
        .AnyAsync(ct);

    if (hasData)
    {
        // Check current encryption state — if same as requested, no-op
        var currentSchema = await GetFormVersionSchemaAsync(tenantId, formId, formVersion, ct);
        var field = FindFieldById(currentSchema, fieldId);

        if (field?.Encryption?.Enabled == encryptionEnabled)
            return UpdateFieldResult.NoChange; // already what they want — ok

        // Different value requested — locked
        return UpdateFieldResult.Locked(
            $"Field '{fieldId}' encryption cannot be changed for form version '{formVersion}' " +
            $"because data submissions already exist for this version. " +
            $"Increment the form version to change the encryption setting.");
    }

    // No data yet — allow the change
    await UpdateFormSchemaEncryptionFlagAsync(tenantId, formId, formVersion, fieldId, encryptionEnabled, ct);
    
    await _auditService.LogAsync(
        AuditEventType.FormFieldEncryptionChanged,
        reason: $"Field encryption toggled to {encryptionEnabled} (no data existed)",
        studyId: formId,
        ct: ct);

    return UpdateFieldResult.Success;
}
```

### 10.3 Visual Indicator in Form Builder

```
Form Builder UI states for the encryption toggle:

┌──────────────────────────────────────────────────────┐
│ Field Properties — Date of Birth                     │
│                                                      │
│ [Storage Encryption]                                 │
│  ○ Off   ● On   ← toggle enabled (no data yet)      │
│                                                      │
│ 🔒 [Storage Encryption]         ← when LOCKED       │
│  ● On  (locked — data exists)                        │
│  ℹ️ Encryption cannot be changed for this field      │
│     version because data entry has started.          │
│     To change encryption: create a new form version. │
└──────────────────────────────────────────────────────┘
```

---

## 11. Data Flow — Encrypt on Save, Decrypt on Read

```
┌─────────────────── DATA ENTRY (SAVE) ───────────────────────────────────┐
│                                                                          │
│  Browser (React)                                                         │
│  ┌──────────────────────────────────────────────────────┐                │
│  │ User enters: dateOfBirth = "1985-03-15"              │                │
│  │ Form submits as plaintext JSON over HTTPS (TLS)      │                │
│  └────────────────────────┬─────────────────────────────┘                │
│                           │ POST /api/studies/{id}/subjects/{id}/forms   │
│                           ▼ { dateOfBirth: "1985-03-15", ... }           │
│  ASP.NET Core API                                                        │
│  ┌──────────────────────────────────────────────────────┐                │
│  │ 1. JWT validated (Keycloak)                          │                │
│  │ 2. TenantContextMiddleware → IMongoDatabase          │                │
│  │ 3. FormVersionService.GetSchema() → know which       │                │
│  │    fields have encryption.enabled = true             │                │
│  │ 4. FieldEncryptionService.EncryptFormData(           │                │
│  │       formData, schema, dek)                         │                │
│  │    → dateOfBirth becomes EncryptedValueEnvelope      │                │
│  │ 5. AuditService.Log(DataEntrySaved, ...)             │                │
│  │    → audit stores encrypted value (not plaintext)   │                │
│  │ 6. MongoDB.InsertOne(formDataDoc)                    │                │
│  └──────────────────────────────────────────────────────┘                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────── DATA RETRIEVAL (READ) ───────────────────────────────┐
│                                                                          │
│  ASP.NET Core API                                                        │
│  ┌──────────────────────────────────────────────────────┐                │
│  │ GET /api/studies/{id}/subjects/{id}/forms/{id}       │                │
│  │                                                      │                │
│  │ 1. JWT validated + role checked                      │                │
│  │    → [Authorize(Policy = ClinicalPolicies.CanViewData)] │             │
│  │ 2. TenantDb → fetch raw MongoDB document             │                │
│  │ 3. Check request context:                            │                │
│  │    Is this a data entry, view-only, or report screen?│                │
│  │    (determined by route prefix or request header)    │                │
│  │    If YES → decrypt                                  │                │
│  │    If NO (e.g., edit-check API) → return [ENCRYPTED] │               │
│  │ 4. FieldEncryptionService.DecryptFormData(           │                │
│  │       rawDoc, schema, dek)                           │                │
│  │    → dateOfBirth: { ...envelope... } → "1985-03-15"  │               │
│  │ 5. Return plaintext JSON to browser over HTTPS       │                │
│  └──────────────────────────────────────────────────────┘                │
│                           │                                              │
│                           ▼                                              │
│  Browser (React)                                                         │
│  ┌──────────────────────────────────────────────────────┐                │
│  │ Displays: Date of Birth: 15/03/1985                  │                │
│  │ Does NOT store in localStorage, IndexedDB, or PWA    │                │
│  │ cache (see Section 18 — renderer constraints)        │                │
│  └──────────────────────────────────────────────────────┘                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 12. .NET Implementation — IFieldEncryptionService

```csharp
// Encryption/IFieldEncryptionService.cs
public interface IFieldEncryptionService
{
    /// <summary>
    /// Encrypts a plaintext string value using AES-256-GCM.
    /// Returns a structured EncryptedValue envelope for MongoDB storage.
    /// </summary>
    EncryptedValue Encrypt(string plaintext, byte[] dek, string keyId);

    /// <summary>
    /// Decrypts an EncryptedValue envelope back to the original plaintext.
    /// Throws CryptographicException if the auth tag does not verify (tamper detected).
    /// </summary>
    string Decrypt(EncryptedValue encrypted, byte[] dek);

    /// <summary>
    /// Encrypts all encrypted fields in a form data dictionary.
    /// Non-encrypted fields pass through unchanged.
    /// </summary>
    Task<Dictionary<string, object>> EncryptFormDataAsync(
        Dictionary<string, object> formData,
        FormSchema schema,
        byte[] dek,
        string keyId,
        CancellationToken ct = default);

    /// <summary>
    /// Decrypts all encrypted field values in a raw MongoDB form data document.
    /// Fields with no encryption envelope pass through unchanged.
    /// Fields with unrecognised encryption envelopes are returned as [ENCRYPTED].
    /// </summary>
    Task<Dictionary<string, object>> DecryptFormDataAsync(
        Dictionary<string, object> rawData,
        FormSchema schema,
        byte[] dek,
        CancellationToken ct = default);
}

// Encryption/EncryptedValue.cs
public sealed record EncryptedValue
{
    /// <summary>Envelope schema version. Always 1.</summary>
    [BsonElement("v")] public int V { get; init; } = 1;

    /// <summary>Algorithm. Always "A256GCM".</summary>
    [BsonElement("alg")] public string Alg { get; init; } = "A256GCM";

    /// <summary>Key ID — which DEK version was used. For rotation tracking.</summary>
    [BsonElement("kid")] public string Kid { get; init; } = default!;

    /// <summary>Base64-encoded 96-bit nonce (IV).</summary>
    [BsonElement("iv")] public string Iv { get; init; } = default!;

    /// <summary>Base64-encoded 128-bit GCM authentication tag.</summary>
    [BsonElement("tag")] public string Tag { get; init; } = default!;

    /// <summary>Base64-encoded ciphertext.</summary>
    [BsonElement("ct")] public string Ct { get; init; } = default!;

    /// <summary>
    /// Returns true if this BSON document sub-element looks like an EncryptedValue envelope.
    /// Used to detect encrypted fields without having the schema.
    /// </summary>
    public static bool IsEncryptedEnvelope(BsonDocument? doc)
        => doc is not null
           && doc.Contains("v") && doc.Contains("alg")
           && doc.Contains("kid") && doc.Contains("iv")
           && doc.Contains("ct");
}
```

```csharp
// Encryption/FieldEncryptionService.cs
public sealed class FieldEncryptionService : IFieldEncryptionService
{
    private const int NonceSize = 12;   // 96 bits — NIST SP 800-38D §5.2.1.1
    private const int TagSize   = 16;   // 128 bits — maximum, never truncate

    public EncryptedValue Encrypt(string plaintext, byte[] dek, string keyId)
    {
        ArgumentNullException.ThrowIfNull(plaintext);
        if (dek.Length != 32)
            throw new ArgumentException("DEK must be 256 bits (32 bytes)", nameof(dek));

        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);

        // Generate a fresh random nonce per encryption — CRITICAL
        var nonce = new byte[NonceSize];
        RandomNumberGenerator.Fill(nonce);

        var ciphertext = new byte[plaintextBytes.Length];
        var tag        = new byte[TagSize];

        using var aes = new AesGcm(dek, TagSize);
        aes.Encrypt(nonce, plaintextBytes, ciphertext, tag);

        return new EncryptedValue
        {
            V   = 1,
            Alg = "A256GCM",
            Kid = keyId,
            Iv  = Convert.ToBase64String(nonce),
            Tag = Convert.ToBase64String(tag),
            Ct  = Convert.ToBase64String(ciphertext)
        };
    }

    public string Decrypt(EncryptedValue encrypted, byte[] dek)
    {
        ArgumentNullException.ThrowIfNull(encrypted);
        if (dek.Length != 32)
            throw new ArgumentException("DEK must be 256 bits (32 bytes)", nameof(dek));
        if (encrypted.Alg != "A256GCM")
            throw new NotSupportedException($"Unsupported encryption algorithm: {encrypted.Alg}");

        var nonce      = Convert.FromBase64String(encrypted.Iv);
        var tag        = Convert.FromBase64String(encrypted.Tag);
        var ciphertext = Convert.FromBase64String(encrypted.Ct);
        var plaintext  = new byte[ciphertext.Length];

        using var aes = new AesGcm(dek, TagSize);

        try
        {
            // AesGcm.Decrypt verifies the authentication tag before decrypting.
            // If the tag does not verify (data tampered), throws AuthenticationTagMismatchException.
            aes.Decrypt(nonce, ciphertext, tag, plaintext);
        }
        catch (AuthenticationTagMismatchException ex)
        {
            // Do NOT log plaintext or ciphertext in the exception — security risk
            throw new CryptographicException(
                $"Authentication tag mismatch for field with kid='{encrypted.Kid}'. " +
                "The encrypted value may have been tampered with.", ex);
        }

        return Encoding.UTF8.GetString(plaintext);
    }

    public Task<Dictionary<string, object>> EncryptFormDataAsync(
        Dictionary<string, object> formData,
        FormSchema schema,
        byte[] dek,
        string keyId,
        CancellationToken ct = default)
    {
        var result = new Dictionary<string, object>(formData.Count);

        foreach (var (fieldKey, value) in formData)
        {
            ct.ThrowIfCancellationRequested();

            var field = FindFieldByKey(schema, fieldKey);

            if (field?.Encryption?.Enabled == true && value is string plaintextStr)
            {
                // Encrypt this field
                var envelope = Encrypt(plaintextStr, dek, keyId);
                result[fieldKey] = envelope; // MongoDB.Driver serializes this as sub-document
            }
            else
            {
                // Pass through as-is
                result[fieldKey] = value;
            }
        }

        return Task.FromResult(result);
    }

    public Task<Dictionary<string, object>> DecryptFormDataAsync(
        Dictionary<string, object> rawData,
        FormSchema schema,
        byte[] dek,
        CancellationToken ct = default)
    {
        var result = new Dictionary<string, object>(rawData.Count);

        foreach (var (fieldKey, rawValue) in rawData)
        {
            ct.ThrowIfCancellationRequested();

            if (rawValue is EncryptedValue envelope)
            {
                try
                {
                    result[fieldKey] = Decrypt(envelope, dek);
                }
                catch (CryptographicException)
                {
                    // Tampered or wrong key — return sentinel, log alert
                    result[fieldKey] = "[DECRYPTION_FAILED]";
                    // NOTE: AuthenticationTagMismatchException is a HIGH security alert
                    // The caller (DataEntryService) is responsible for auditing this
                }
            }
            else
            {
                result[fieldKey] = rawValue;
            }
        }

        return Task.FromResult(result);
    }

    // --- Helpers ---

    private static FormField? FindFieldByKey(FormSchema schema, string key)
    {
        // Recursive search through nested components
        return FindInComponents(schema.Components, key);
    }

    private static FormField? FindInComponents(IEnumerable<ComponentSchema> components, string key)
    {
        foreach (var comp in components)
        {
            if (comp.Key == key) return comp as FormField;
            if (comp is ContainerComponent container)
            {
                var found = FindInComponents(container.Components, key);
                if (found is not null) return found;
            }
        }
        return null;
    }
}
```

---

## 13. .NET Implementation — Key Management Service

```csharp
// Encryption/IKeyManagementService.cs
public interface IKeyManagementService
{
    /// <summary>
    /// Returns the plaintext DEK for the given tenant.
    /// The DEK is cached in memory for CacheTtl (default 5 min).
    /// Calls KMS to unwrap the encrypted DEK on first access or after cache expiry.
    /// </summary>
    Task<DecryptedDek> GetDekAsync(string tenantId, CancellationToken ct = default);

    /// <summary>
    /// Provisions a new DEK for a new tenant at onboarding.
    /// Generates a random 256-bit DEK, wraps it with the CMK via KMS,
    /// and stores the wrapped DEK in the tenants collection.
    /// </summary>
    Task<string> ProvisionTenantDekAsync(string tenantId, CancellationToken ct = default);

    /// <summary>
    /// Rotates the DEK for a tenant.
    /// Generates a new DEK, re-wraps with current CMK version,
    /// stores the new encryptedDek alongside the old kid → old DEK mapping
    /// (for decrypting documents encrypted with the old DEK).
    /// </summary>
    Task RotateDekAsync(string tenantId, CancellationToken ct = default);

    /// <summary>
    /// GDPR crypto-shredding: deletes the DEK for a tenant.
    /// After this call, all encrypted field values for the tenant are permanently
    /// unrecoverable. Use only for right-to-erasure of an entire tenant.
    /// </summary>
    Task ShredTenantDekAsync(string tenantId, CancellationToken ct = default);
}

public sealed record DecryptedDek(
    byte[]  KeyBytes,   // 32 bytes — plaintext DEK, use and discard
    string  KeyId       // "tenantId-dek-v{version}" — for EncryptedValue.kid
);
```

```csharp
// Encryption/KeyManagementService.cs
public sealed class KeyManagementService : IKeyManagementService
{
    private readonly IKmsProvider _kms;                        // AWS KMS or Azure Key Vault
    private readonly IMemoryCache _dekCache;
    private readonly ITenantConfigRepository _tenantRepo;
    private readonly TimeSpan _cacheTtl = TimeSpan.FromMinutes(5);

    public KeyManagementService(
        IKmsProvider kms,
        IMemoryCache dekCache,
        ITenantConfigRepository tenantRepo)
    {
        _kms = kms;
        _dekCache = dekCache;
        _tenantRepo = tenantRepo;
    }

    public async Task<DecryptedDek> GetDekAsync(string tenantId, CancellationToken ct = default)
    {
        var cacheKey = $"dek:{tenantId}";

        // Check in-memory cache first — avoids KMS round-trip on every request
        if (_dekCache.TryGetValue(cacheKey, out DecryptedDek? cached) && cached is not null)
            return cached;

        // Fetch the encrypted DEK from the tenant config document
        var tenantConfig = await _tenantRepo.GetAsync(tenantId, ct)
            ?? throw new InvalidOperationException($"Tenant '{tenantId}' not found");

        if (tenantConfig.EncryptedDek is null)
            throw new InvalidOperationException(
                $"Tenant '{tenantId}' has no encryption key. " +
                "Field-level encryption not provisioned for this tenant.");

        // Call KMS to unwrap the DEK (KMS holds the master key, does the decrypt)
        var plaintextDek = await _kms.UnwrapKeyAsync(
            encryptedKey: tenantConfig.EncryptedDek,
            masterKeyId: tenantConfig.DekMasterKeyId,
            ct: ct);

        var dek = new DecryptedDek(plaintextDek, tenantConfig.DekKeyId!);

        // Cache with TTL — plaintext DEK lives only in app memory
        // MemoryCache does NOT persist to disk. Set size limit to prevent
        // caching unbounded tenants in memory.
        _dekCache.Set(cacheKey, dek, new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = _cacheTtl,
            Size = 1
        });

        return dek;
    }

    public async Task<string> ProvisionTenantDekAsync(string tenantId, CancellationToken ct = default)
    {
        // Generate a fresh 256-bit DEK
        var plaintextDek = new byte[32];
        RandomNumberGenerator.Fill(plaintextDek);

        var keyId = $"{tenantId}-dek-v1";

        // Wrap the DEK with the KMS master key
        var encryptedDek = await _kms.WrapKeyAsync(
            plaintextKey: plaintextDek,
            masterKeyId: _kms.DefaultMasterKeyId,
            ct: ct);

        // Store the wrapped DEK in the tenant config
        await _tenantRepo.SetEncryptedDekAsync(tenantId, new EncryptedDekRecord
        {
            KeyId          = keyId,
            EncryptedDek   = encryptedDek,
            DekMasterKeyId = _kms.DefaultMasterKeyId,
            Version        = 1,
            CreatedAt      = DateTime.UtcNow
        }, ct);

        // Securely wipe from memory (best-effort in managed runtime)
        CryptographicOperations.ZeroMemory(plaintextDek);

        return keyId;
    }

    public async Task ShredTenantDekAsync(string tenantId, CancellationToken ct = default)
    {
        // Remove from cache immediately
        _dekCache.Remove($"dek:{tenantId}");

        // Delete the encrypted DEK from tenant config
        await _tenantRepo.DeleteEncryptedDekAsync(tenantId, ct);

        // Optional: call KMS to disable/schedule deletion of the CMK version
        // (depends on KMS provider — AWS KMS supports key deletion with 7-30 day pending period)
        // Do NOT do this automatically — requires separate authorization workflow

        // After this call: all encrypted field values for this tenant are permanently
        // unreadable. This is the GDPR crypto-shredding completion point.
    }
}
```

```csharp
// Encryption/IKmsProvider.cs — abstraction over AWS KMS / Azure Key Vault
public interface IKmsProvider
{
    string DefaultMasterKeyId { get; }

    /// <summary>
    /// Wraps (encrypts) a plaintext key using the specified master key.
    /// The plaintext key bytes are NOT passed over the network — only the 
    /// key material is sent to KMS for wrapping.
    /// </summary>
    Task<byte[]> WrapKeyAsync(byte[] plaintextKey, string masterKeyId, CancellationToken ct);

    /// <summary>
    /// Unwraps (decrypts) an encrypted key using the specified master key.
    /// Returns the plaintext key bytes in memory.
    /// </summary>
    Task<byte[]> UnwrapKeyAsync(byte[] encryptedKey, string masterKeyId, CancellationToken ct);
}

// Encryption/AwsKmsProvider.cs
public sealed class AwsKmsProvider : IKmsProvider
{
    private readonly IAmazonKeyManagementService _kmsClient;
    private readonly string _defaultKeyId;

    public AwsKmsProvider(IAmazonKeyManagementService kmsClient, IOptions<AwsKmsOptions> opts)
    {
        _kmsClient  = kmsClient;
        _defaultKeyId = opts.Value.DefaultMasterKeyId;
    }

    public string DefaultMasterKeyId => _defaultKeyId;

    public async Task<byte[]> WrapKeyAsync(byte[] plaintextKey, string masterKeyId, CancellationToken ct)
    {
        var response = await _kmsClient.EncryptAsync(new EncryptRequest
        {
            KeyId     = masterKeyId,
            Plaintext = new MemoryStream(plaintextKey),
            EncryptionAlgorithm = EncryptionAlgorithmSpec.SYMMETRIC_DEFAULT
        }, ct);

        return response.CiphertextBlob.ToArray();
    }

    public async Task<byte[]> UnwrapKeyAsync(byte[] encryptedKey, string masterKeyId, CancellationToken ct)
    {
        var response = await _kmsClient.DecryptAsync(new DecryptRequest
        {
            CiphertextBlob    = new MemoryStream(encryptedKey),
            KeyId             = masterKeyId,
            EncryptionAlgorithm = EncryptionAlgorithmSpec.SYMMETRIC_DEFAULT
        }, ct);

        return response.Plaintext.ToArray();
    }
}

// Encryption/AzureKeyVaultKmsProvider.cs
public sealed class AzureKeyVaultKmsProvider : IKmsProvider
{
    private readonly CryptographyClient _cryptoClient;
    private readonly string _keyId;

    public AzureKeyVaultKmsProvider(CryptographyClient cryptoClient, IOptions<AzureKvOptions> opts)
    {
        _cryptoClient = cryptoClient;
        _keyId = opts.Value.KeyId;
    }

    public string DefaultMasterKeyId => _keyId;

    public async Task<byte[]> WrapKeyAsync(byte[] plaintextKey, string masterKeyId, CancellationToken ct)
    {
        var result = await _cryptoClient.WrapKeyAsync(
            KeyWrapAlgorithm.A256KW, plaintextKey, ct);
        return result.EncryptedKey;
    }

    public async Task<byte[]> UnwrapKeyAsync(byte[] encryptedKey, string masterKeyId, CancellationToken ct)
    {
        var result = await _cryptoClient.UnwrapKeyAsync(
            KeyWrapAlgorithm.A256KW, encryptedKey, ct);
        return result.Key;
    }
}
```

---

## 14. .NET Implementation — Encryption Pipeline in Data Save

```csharp
// Services/DataEntryService.cs — save a form submission
public class DataEntryService : IDataEntryService
{
    private readonly IFieldEncryptionService _encryption;
    private readonly IKeyManagementService _keyManager;
    private readonly IAuditService _audit;

    public async Task<SaveFormResult> SaveFormDataAsync(
        string studyId,
        string subjectId,
        string formId,
        string formVersion,
        Dictionary<string, object> formData,   // plaintext from browser
        HttpContext httpContext,
        CancellationToken ct = default)
    {
        var db = httpContext.GetTenantDb();
        var tenantId = httpContext.GetTenantId();

        // 1. Load form schema to know which fields are encrypted
        var schema = await _schemaService.GetFormSchemaAsync(
            tenantId, formId, formVersion, ct);

        // 2. Get the tenant DEK (from cache or KMS)
        var dek = await _keyManager.GetDekAsync(tenantId, ct);

        // 3. Encrypt all marked fields
        var encryptedData = await _encryption.EncryptFormDataAsync(
            formData, schema, dek.KeyBytes, dek.KeyId, ct);

        // IMPORTANT: Wipe the DEK bytes reference once done
        // (Cannot force GC in managed code, but we don't hold a reference)

        // 4. Build the document to persist
        var doc = new BsonDocument
        {
            ["tenantId"]    = tenantId,
            ["studyId"]     = studyId,
            ["subjectId"]   = subjectId,
            ["formId"]      = formId,
            ["formVersion"] = formVersion,
            ["savedAt"]     = DateTime.UtcNow,   // server timestamp — NEVER client time
            ["savedBy"]     = httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier),
            ["data"]        = new BsonDocument(encryptedData.ToDictionary(
                                  kv => kv.Key,
                                  kv => BsonValue.Create(kv.Value)))
        };

        // 5. Write to MongoDB (encrypted fields are already EncryptedValue sub-documents)
        var collection = db.GetCollection<BsonDocument>("form_data");
        await collection
            .WithWriteConcern(WriteConcern.WMajority)
            .InsertOneAsync(doc, cancellationToken: ct);

        // 6. Audit — store ENCRYPTED values in audit trail, not plaintext
        //    The audit trail calls EncryptFormDataAsync too internally
        //    (see Section 19 for audit trail detail)
        await _audit.LogAsync(
            eventType: AuditEventType.DataEntrySaved,
            reason: "Form data entry submitted",
            newValues: BuildAuditValues(encryptedData, schema),  // encrypted sentinel for encrypted fields
            studyId: studyId,
            subjectId: subjectId,
            formId: formId,
            ct: ct);

        // 7. Lock encryption flag if this is first submission for this field version
        await _formVersionService.LockEncryptionFlagsIfFirstSubmissionAsync(
            tenantId, formId, formVersion, encryptedData.Keys, ct);

        return SaveFormResult.Success(doc["_id"].AsObjectId.ToString());
    }

    private Dictionary<string, object> BuildAuditValues(
        Dictionary<string, object> encryptedData,
        FormSchema schema)
    {
        // For audit trail: encrypted fields → sentinel "[ENCRYPTED]"
        // Non-encrypted fields → actual value
        // This ensures the audit trail does not contain plaintext PHI
        var auditValues = new Dictionary<string, object>();
        foreach (var (key, value) in encryptedData)
        {
            var field = FindFieldByKey(schema, key);
            auditValues[key] = field?.Encryption?.Enabled == true
                ? "[ENCRYPTED — view on data entry screen]"
                : value;
        }
        return auditValues;
    }
}
```

---

## 15. .NET Implementation — Decryption Pipeline on Read

```csharp
// Services/DataEntryService.cs — retrieve form data for display

public async Task<FormDataResponse> GetFormDataAsync(
    string studyId,
    string subjectId,
    string formId,
    HttpContext httpContext,
    DecryptionContext decryptionContext,  // DataEntry | ViewOnly | Report | Internal
    CancellationToken ct = default)
{
    var db = httpContext.GetTenantDb();
    var tenantId = httpContext.GetTenantId();

    // Fetch raw MongoDB document (contains EncryptedValue sub-documents)
    var collection = db.GetCollection<BsonDocument>("form_data");
    var rawDoc = await collection.Find(
        Builders<BsonDocument>.Filter.And(
            Builders<BsonDocument>.Filter.Eq("studyId", studyId),
            Builders<BsonDocument>.Filter.Eq("subjectId", subjectId),
            Builders<BsonDocument>.Filter.Eq("formId", formId)
        ))
        .SortByDescending(d => d["savedAt"])
        .FirstOrDefaultAsync(ct);

    if (rawDoc is null) return FormDataResponse.NotFound;

    var schema = await _schemaService.GetFormSchemaAsync(
        tenantId, rawDoc["formId"].AsString, rawDoc["formVersion"].AsString, ct);

    // Determine if we should decrypt
    bool shouldDecrypt = decryptionContext is
        DecryptionContext.DataEntry or
        DecryptionContext.ViewOnly or
        DecryptionContext.Report;

    Dictionary<string, object> finalData;

    if (shouldDecrypt)
    {
        var dek = await _keyManager.GetDekAsync(tenantId, ct);
        var rawData = BsonDocumentToDict(rawDoc["data"].AsBsonDocument);
        finalData = await _encryption.DecryptFormDataAsync(rawData, schema, dek.KeyBytes, ct);

        // Audit: log that decryption was performed (for encrypted fields)
        var hasEncryptedFields = schema.GetAllFields()
            .Any(f => f.Encryption?.Enabled == true);

        if (hasEncryptedFields)
        {
            await _audit.LogAsync(
                eventType: AuditEventType.EncryptedDataDecrypted,
                reason: $"Decrypted for {decryptionContext} screen access",
                studyId: studyId,
                subjectId: subjectId,
                formId: formId,
                ct: ct);
        }
    }
    else
    {
        // Return encrypted sentinel for any encrypted fields
        finalData = BsonDocumentToDict(rawDoc["data"].AsBsonDocument)
            .ToDictionary(
                kv => kv.Key,
                kv => kv.Value is EncryptedValue ? (object)"[ENCRYPTED]" : kv.Value);
    }

    return new FormDataResponse(finalData, rawDoc["savedAt"].ToUniversalTime());
}

public enum DecryptionContext
{
    DataEntry,    // CRC/PI entering or reviewing data
    ViewOnly,     // CRA monitoring, PI review (read-only screen)
    Report,       // Data Manager / Biostatistician authorised report
    Internal      // API-internal use (edit checks, calculations) — NO decrypt
}
```

---

## 16. Form Schema TypeScript Changes

### 16.1 TypeScript Type Addition (form-builder-schema.md update)

```typescript
// ADDITION to: libs/form-builder/src/lib/types/schema.ts

/**
 * Storage encryption configuration for a field.
 * When enabled, the field value is stored as AES-256-GCM ciphertext in MongoDB.
 * The plaintext is never persisted. Decryption occurs only in authorised API handlers.
 *
 * NOTE: Encrypted fields CANNOT be used as operands in edit checks or
 * cross-field validation rules. The form builder enforces this at design time.
 * The edit check engine enforces this at runtime.
 *
 * NOTE: Encrypted fields CANNOT be sorted, filtered, or aggregated in MongoDB.
 * Do not mark any field as encrypted if it will need to be searched or grouped.
 */
export interface FieldEncryptionConfig {
  /** Whether this field is encrypted in storage. */
  enabled: boolean;

  /**
   * Server-set ISO-8601 timestamp when the encryption setting became locked.
   * null if no data has been submitted for this field at the current form version.
   * READONLY in the builder — the server sets this; the builder only reads it.
   */
  lockedAt?: string | null;

  /**
   * The form version string at which this field's encryption was locked.
   * Set by the server at first submission. READONLY in the builder.
   */
  lockedAtFormVersion?: string | null;
}

// In BaseComponentSchema (addition):
export interface BaseComponentSchema {
  // ... all existing properties unchanged ...

  /**
   * Storage encryption configuration.
   * When omitted, defaults to { enabled: false } (not encrypted).
   *
   * Only applicable to field components that produce a submission value.
   * Ignored for layout containers, dividers, content blocks.
   *
   * After data entry starts for this field at the current form version,
   * `encryption.lockedAt` is set by the server and the `enabled` flag
   * cannot be changed. To change it: increment the form version.
   *
   * @see FieldEncryptionConfig
   */
  encryption?: FieldEncryptionConfig;
}
```

### 16.2 Helper Functions

```typescript
// libs/form-builder/src/lib/utils/encryption.ts

/** Returns true if the field component type supports storage encryption. */
export function supportsEncryption(fieldType: string): boolean {
  return ENCRYPTABLE_FIELD_TYPES.includes(fieldType as any);
}

/** Returns true if the encryption flag is locked (cannot be changed). */
export function isEncryptionLocked(field: BaseComponentSchema): boolean {
  return field.encryption?.lockedAt != null;
}

/** Returns true if this field's value will be stored encrypted. */
export function isEncrypted(field: BaseComponentSchema): boolean {
  return field.encryption?.enabled === true;
}

/**
 * Returns a sanitised API payload for a form submission.
 * Encrypted fields are included as plaintext — the API layer encrypts.
 * The browser never performs encryption (keys never reach the browser).
 */
export function buildSubmissionPayload(
  formData: Record<string, unknown>,
  _schema: FormSchema  // schema passed for future extension; not filtering here
): Record<string, unknown> {
  // Browser sends plaintext. The .NET API encrypts before MongoDB write.
  // This function is a no-op today but documents the intent explicitly.
  return { ...formData };
}
```

---

## 17. Form Builder UI — Design-Time Behaviour

### 17.1 Encryption Toggle in Field Properties Panel

```
┌─────────────────────────────────────────────────────┐
│ FIELD PROPERTIES — Date of Birth                    │
│                                                     │
│ Label:  [Date of Birth             ]                │
│ Key:    [dateOfBirth               ]                │
│ Type:   Date                                        │
│                                                     │
│ ─────── Storage & Privacy ────────────────────────  │
│                                                     │
│ 🔐 Storage Encryption                               │
│ [OFF ──── ON]   ← toggle                           │
│                                                     │
│ ℹ️ When ON:                                         │
│   • Value stored as ciphertext (AES-256-GCM)       │
│   • Shown only on data entry and view screens       │
│   • Cannot be used in edit checks or formulas      │
│   • Cannot be changed after data entry starts      │
│                                                     │
│ ⚠️  Encrypted fields cannot be used in edit checks  │
│                                                     │
└─────────────────────────────────────────────────────┘

─── When LOCKED (data entry has started): ─────────────
┌─────────────────────────────────────────────────────┐
│ 🔐 Storage Encryption                               │
│ [🔒 ON  — locked]                                   │
│ Locked since: 2026-06-01 (form version 2)           │
│ ℹ️ To change: create a new form version.             │
└─────────────────────────────────────────────────────┘
```

### 17.2 Field Picker — Edit Check Builder

Encrypted fields appear in the field picker with a lock icon and are **not draggable** into edit check rule slots:

```
Field Picker (Edit Check Builder):
  ┌───────────────────────────────────────────┐
  │ 🔐 Date of Birth    [🔒 Encrypted]        │  ← greyed, not draggable
  │ 🔐 First Name       [🔒 Encrypted]        │  ← greyed, not draggable
  │    Systolic BP      [drag to rule]        │  ← draggable
  │    Heart Rate       [drag to rule]        │  ← draggable
  │    Visit Date       [drag to rule]        │  ← draggable
  └───────────────────────────────────────────┘
  
  If user attempts to use an encrypted field:
  ┌───────────────────────────────────────────────────────────────┐
  │ ❌ "Date of Birth" is encrypted and cannot be used in         │
  │    edit checks. Encrypted fields have no queryable value      │
  │    in the validation engine.                                  │
  │    Remove encryption from this field first, or choose a       │
  │    different field.                                           │
  └───────────────────────────────────────────────────────────────┘
```

### 17.3 Form Canvas — Visual Indicator

```
On the form canvas, encrypted fields show a lock badge:

┌─────────────────────────────────────────────────────────┐
│ Date of Birth *          [🔐]                           │
│ ┌─────────────────────────────────────┐                 │
│ │  DD / MM / YYYY                     │                 │
│ └─────────────────────────────────────┘                 │
│ 🔐 Encrypted storage · Cannot be used in edit checks    │
└─────────────────────────────────────────────────────────┘
```

---

## 18. Form Renderer — Runtime Behaviour

### 18.1 What the Renderer Receives

The React renderer **always receives plaintext** from the API when the user is on an authorised screen (data entry, view-only). The renderer itself does no encryption or decryption — this is entirely server-side.

```typescript
// Renderer receives a standard form data object — no EncryptedValue envelopes
const formData = {
  dateOfBirth: "1985-03-15",   // ← plaintext from server (already decrypted)
  systolicBP: 128,
  heartRate: 72
};
```

### 18.2 Renderer Constraints for Encrypted Fields

```typescript
// libs/web-components/src/lib/form-renderer/services/form-data.service.ts

// CRITICAL: Encrypted field values MUST NOT be cached in browser storage.
// Reason: localStorage and IndexedDB are accessible by JavaScript 
//         (XSS risk) and may persist across sessions.

export class FormDataService {
  // In-memory only — not persisted to localStorage or IndexedDB
  private formData = signal<Record<string, unknown>>({});

  // When the user navigates away (component destroy):
  ngOnDestroy() {
    // Wipe form data from memory
    this.formData.set({});
  }
}
```

```typescript
// Offline/PWA constraint: encrypted fields cannot be stored in offline cache
// libs/web-components/src/lib/form-renderer/offline/offline-form-data.service.ts

export class OfflineFormDataService implements FormDataService {

  async saveDraft(formData: Record<string, unknown>, schema: FormSchema): Promise<void> {
    // Before saving to IndexedDB, STRIP encrypted field values
    const safeData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(formData)) {
      const field = findFieldByKey(schema, key);
      if (field?.encryption?.enabled) {
        // Never cache encrypted field values in IndexedDB
        // When the draft is reloaded, the field will appear empty
        // and the user will need to re-enter it
        safeData[key] = null;
      } else {
        safeData[key] = value;
      }
    }

    await this.indexedDb.put('form_drafts', safeData);
  }
}
```

### 18.3 No Browser-Side Encryption

```
DECISION: Encryption happens ONLY on the server (ASP.NET Core API).
          The browser never has the DEK.
          The browser never calls any crypto API for encryption.

RATIONALE:
  1. Key security — DEK must never reach the browser. If it did, 
     any XSS attack could extract it and decrypt all stored values.
  2. Key management — the KMS (AWS/Azure) is server-side only.
  3. Regulatory — 21 CFR Part 11 CSV validation is easier when
     the encryption logic is contained in one server-side component.
  4. Simplicity — no WASM crypto, no Web Crypto API integration.

What happens:
  Browser → (HTTPS) → plaintext → API → AES-256-GCM → MongoDB
  MongoDB → ciphertext → API → AES-256-GCM decrypt → (HTTPS) → plaintext → Browser
```

---

## 19. Audit Trail with Encrypted Fields

### 19.1 What Goes in the Audit Trail for Encrypted Fields?

```
CHALLENGE: The audit trail records old values and new values for every
           data change (21 CFR Part 11 §11.10(e) — audit trail required).
           If encrypted fields are stored as plaintext in the audit trail,
           the audit trail becomes PHI storage.
           If encrypted fields are stored as ciphertext, the audit trail
           is not human-readable during inspection.

SOLUTION: Encrypted fields in the audit trail store:
  (a) For new values: the SAME EncryptedValue envelope that was written to MongoDB.
      Keyed to the same DEK — can be decrypted by an authorised screen.
  (b) For old values (amendments): the previous EncryptedValue envelope.
  (c) Sentinel in human-readable summary: "[ENCRYPTED — view on data screen]"

This means:
  ✅ FDA inspector can see THAT the field was changed (audit trail completeness)
  ✅ FDA inspector can view the actual value through the authorised UI (decrypt on demand)
  ✅ Audit trail stored ciphertext does not expose PHI to MongoDB operators
  ✅ Right to erasure (crypto-shredding) extends to audit trail encrypted values:
     when the DEK is deleted, audit trail encrypted values also become unreadable
```

### 19.2 Audit Trail Service — Encrypted Value Handling

```csharp
// Audit/AuditService.cs — extension for encrypted field auditing

public async Task LogDataAmendmentAsync(
    string studyId,
    string subjectId,
    string formId,
    Dictionary<string, object> oldRawData,    // raw from MongoDB (may contain EncryptedValue)
    Dictionary<string, object> newEncryptedData,  // newly encrypted data
    FormSchema schema,
    string reason,
    CancellationToken ct = default)
{
    // Build audit-safe before/after maps
    var auditOld = BuildAuditFieldMap(oldRawData, schema);
    var auditNew = BuildAuditFieldMap(newEncryptedData, schema);

    await LogAsync(
        eventType: AuditEventType.DataEntryAmended,
        reason: reason,
        oldValues: auditOld,
        newValues: auditNew,
        studyId: studyId,
        subjectId: subjectId,
        formId: formId,
        ct: ct);
}

private static Dictionary<string, object> BuildAuditFieldMap(
    Dictionary<string, object> data,
    FormSchema schema)
{
    var result = new Dictionary<string, object>();

    foreach (var (key, value) in data)
    {
        var field = FindFieldByKey(schema, key);

        if (field?.Encryption?.Enabled == true)
        {
            if (value is EncryptedValue envelope)
            {
                // Store the encrypted envelope in audit — same ciphertext as in MongoDB
                // An authorised screen can decrypt this using the same DEK
                result[key] = new
                {
                    __encrypted = true,
                    envelope    = envelope,          // the ciphertext sub-document
                    display     = "[ENCRYPTED — view on data entry screen]"
                };
            }
            else
            {
                // Value is null or missing — record as absent
                result[key] = new { __encrypted = true, display = "[ENCRYPTED — no value]" };
            }
        }
        else
        {
            result[key] = value;
        }
    }

    return result;
}
```

---

## 20. GDPR Crypto-Shredding — Right to Erasure

### 20.1 The Problem with Traditional Data Deletion in Clinical Trials

```
21 CFR Part 11 §11.10(c): "Protection of records to enable their accurate
and ready retrieval throughout the records retention period."

FDA regulations require clinical trial data to be retained for:
  - 2 years after the last marketing application approval (minimum)
  - Often 10-15 years for some product types

GDPR Art. 17 (Right to Erasure): "The data subject shall have the right
to obtain from the controller the erasure of personal data."

CONFLICT: You cannot delete clinical data (FDA) but you must erase 
          personal data on request (GDPR).

RESOLUTION: Recital 26 & 83 — Pseudonymised/encrypted data where the key
            is destroyed is effectively "erased" for GDPR purposes.
            The data record exists but is permanently unintelligible.
```

### 20.2 Crypto-Shredding Process

```
GDPR RIGHT TO ERASURE — CRYPTO-SHREDDING PROCEDURE:

Trigger: Client signs Data Processing Agreement termination
         OR Subject withdraws consent for specific data categories
         (note: withdrawal of consent does not automatically trigger
         erasure in clinical trials — complex interplay with ICH E6)

Step 1: Verify erasure is legally permissible
        (clinical trial protocol-required data may be exempt)

Step 2: Remove the DEK from cache immediately
        IKeyManagementService.ShredTenantDekAsync(tenantId)
        → _dekCache.Remove("dek:{tenantId}")

Step 3: Delete encryptedDek from tenants collection
        → db.tenants.updateOne({ tenantId }, { $unset: { encryptedDek, dekKeyId } })

Step 4: (Optional) Schedule KMS master key version for deletion
        AWS KMS: 7-30 day pending deletion window
        Azure Key Vault: soft-delete + purge (configurable)

Step 5: Verify: attempt to decrypt any stored EncryptedValue
        → FAILS with "No encryption key. FLE not provisioned."
        → All encrypted field values are permanently inaccessible

Step 6: Audit log the shredding event (in platform audit log — separate DB)
        Cannot log in the tenant DB (that DB's keys are gone)

Step 7: Issue GDPR erasure confirmation to client/subject
        Document: "Personal data in encrypted fields has been crypto-shredded
        on [date]. The data records remain (audit trail integrity) but all
        personally identifiable field values are permanently irrecoverable."
        
WHAT REMAINS AFTER SHREDDING:
  ✅ Non-encrypted fields (clinical efficacy data, safety data) — still readable
  ✅ Audit trail structure (timestamps, event types, user IDs) — still readable
  ❌ Encrypted field values (PII: name, DOB, contact info) — permanently gone
  ❌ Audit trail encrypted value envelopes — permanently unreadable
```

### 20.3 Which Fields to Encrypt — GDPR Guidance

```
ENCRYPT (PII / PHI under GDPR Art. 4(1)):
  ✅ Patient name (first name, last name)
  ✅ Date of birth
  ✅ Contact information (email, phone, address)
  ✅ Medical record number / NHS number / SSN
  ✅ Insurance identifier
  ✅ Genotype / genetic data (Art. 9 special category)
  ✅ Biometric identifiers

DO NOT ENCRYPT (clinical data required for scientific validity):
  ❌ Study subject number / randomisation number (pseudonym — ok)
  ❌ Clinical outcomes (efficacy endpoints) — needed for edit checks and analysis
  ❌ Safety data (adverse events, lab results) — needed for medical review
  ❌ Protocol-required dates (visit date, procedure date) — needed for analysis
  ❌ Assessments, scores, ratings — needed for edit checks
  ❌ Codelists and coded answers — needed for regulatory submissions

WHY STUDY ID / SUBJECT NUMBER IS NOT ENCRYPTED:
  These are pseudonyms — the link between subject number and real identity
  is held by the site (site patient log), not in the EDC system.
  If the site log is kept separately, the EDC subject data is pseudonymous
  by design. Encrypting the subject number would break all queries.
```

---

## 21. Key Rotation Strategy

### 21.1 When to Rotate

```
ROTATE DEK (per tenant) WHEN:
  ✅ Scheduled: annually (or per client's security policy)
  ✅ On suspicion: any security event affecting the API service
  ✅ On demand: client contractual requirement (e.g., ISO 27001 audit)
  ✅ After personnel change: if a team member with KMS access leaves

ROTATE CMK (KMS master key) WHEN:
  ✅ Scheduled: every 2-3 years (KMS auto-rotation recommended)
  ✅ AWS KMS: enable automatic CMK rotation (annual, free, transparent)
  ✅ On KMS security event

DO NOT RE-ENCRYPT ALL DATA ON ROTATION (envelope encryption solves this):
  Old encrypted data stores kid = "dek-v1"
  New data stores kid = "dek-v2"
  During a read: if kid = "dek-v1", unwrap old DEK; if kid = "dek-v2", unwrap new DEK
  The EncryptedValue.kid field tracks which DEK version was used.
```

### 21.2 DEK Rotation — No Mass Re-Encryption Required

```csharp
// Encryption/KeyManagementService.cs — RotateDekAsync

public async Task RotateDekAsync(string tenantId, CancellationToken ct = default)
{
    // 1. Generate a new DEK
    var newDekBytes = new byte[32];
    RandomNumberGenerator.Fill(newDekBytes);

    var currentConfig = await _tenantRepo.GetAsync(tenantId, ct)!;
    var newVersion = (currentConfig.DekVersion ?? 1) + 1;
    var newKeyId = $"{tenantId}-dek-v{newVersion}";

    // 2. Wrap the new DEK with the current CMK version
    var newEncryptedDek = await _kms.WrapKeyAsync(newDekBytes, _kms.DefaultMasterKeyId, ct);

    // 3. Store the NEW DEK, keeping the OLD DEK for reading pre-rotation data
    await _tenantRepo.AddDekVersionAsync(tenantId, new EncryptedDekRecord
    {
        KeyId        = newKeyId,
        EncryptedDek = newEncryptedDek,
        Version      = newVersion,
        CreatedAt    = DateTime.UtcNow
    }, ct);

    // 4. Update the active DEK pointer (new data uses new DEK)
    await _tenantRepo.SetActiveDekVersionAsync(tenantId, newVersion, ct);

    // 5. Invalidate cache — next request will load new active DEK
    _dekCache.Remove($"dek:{tenantId}");

    // 6. Old data with kid = "dek-v{n-1}" is still readable via the old DEK record
    //    MongoDB query: find all documents by kid to find pre-rotation data
    //    Optional background job: re-encrypt old data with new DEK (see below)

    CryptographicOperations.ZeroMemory(newDekBytes);
}

// Multi-version DEK resolution (for reading old data):
public async Task<DecryptedDek> GetDekByKeyIdAsync(
    string tenantId, string keyId, CancellationToken ct = default)
{
    var cacheKey = $"dek:{tenantId}:{keyId}";
    if (_dekCache.TryGetValue(cacheKey, out DecryptedDek? cached) && cached is not null)
        return cached;

    var dekRecord = await _tenantRepo.GetDekVersionAsync(tenantId, keyId, ct)
        ?? throw new InvalidOperationException($"DEK version '{keyId}' not found for tenant '{tenantId}'");

    var plaintext = await _kms.UnwrapKeyAsync(dekRecord.EncryptedDek, dekRecord.DekMasterKeyId, ct);
    var dek = new DecryptedDek(plaintext, keyId);
    _dekCache.Set(cacheKey, dek, _cacheTtl);
    return dek;
}
```

---

## 22. Performance — DEK Caching

### 22.1 Without Caching

Every encrypted field read/write would require:
1. MongoDB read (fetch tenant config → encryptedDek)
2. KMS API call (decrypt encryptedDek → plaintext DEK)
3. AES-256-GCM encrypt/decrypt

A single form page with 5 encrypted fields × 10 concurrent users = 50 KMS API calls per page load. AWS KMS latency is ~5-10ms per call. This adds 50-500ms latency per request.

### 22.2 DEK Cache Strategy

```
DEK CACHE DESIGN:
  - Type: IMemoryCache (in-process, per-pod)
  - Key: "dek:{tenantId}" (or "dek:{tenantId}:{keyId}" for multi-version)
  - TTL: 5 minutes (absolute expiry)
  - Max cache size: set cache SizeLimit to prevent unbounded growth with many tenants
  - Thread safety: IMemoryCache is thread-safe; concurrent GetDek calls for
    same tenant may result in multiple KMS calls on first access (acceptable
    — GetOrCreate race is benign, both DEKs are identical)
  - Persistence: NO — IMemoryCache is in-memory only; pod restart = cold cache

CACHE INVALIDATION:
  - On DEK rotation: _dekCache.Remove("dek:{tenantId}") immediately
  - On crypto-shredding: _dekCache.Remove("dek:{tenantId}") immediately
  - TTL expiry: automatic after 5 minutes

WHY NOT REDIS?
  - Redis would require the plaintext DEK to transit the network
  - A Redis breach would expose all DEKs
  - In-process memory is strictly safer — the DEK never leaves the pod
  - With Kubernetes HPA (horizontal pod autoscaler), each pod has its own cache
    → slightly higher KMS call rate during scale-out (acceptable)

KMS CALL ESTIMATE (with 5-minute cache):
  10 active tenants × (1 KMS call / 5 min / pod) × 3 pods = 6 KMS calls/min
  = 8,640 KMS calls/day
  AWS KMS cost: $0.03/10,000 calls = $0.026/day per 10 tenants
  → Negligible cost.
```

---

## 23. MongoDB Considerations

### 23.1 Indexing Restrictions

```
CANNOT index encrypted fields:
  Non-deterministic encryption (different ciphertext each time) means
  you cannot build a useful index on the ct field.
  Two documents with identical plaintext "1985-03-15" will have completely
  different ciphertext values → an index on "data.dateOfBirth.ct" would
  be useless for equality queries.

  MongoDB index on an encrypted field: allowed but pointless.
  Do NOT create indexes on encrypted fields.

CAN index by kid (key ID):
  db.form_data.createIndex({ "data.dateOfBirth.kid": 1 })
  Useful for key rotation: find all documents encrypted with the old DEK.
  Create a partial index: { "data.dateOfBirth.kid": 1 } — only for that field.
```

### 23.2 Query Restrictions

```
CANNOT query encrypted fields by value:
  ❌ db.form_data.find({ "data.dateOfBirth": "1985-03-15" })
     → No match (stored as EncryptedValue sub-document, not string)
  
  ❌ db.form_data.find({ "data.dateOfBirth.ct": /someBase64/ })
     → Useless (non-deterministic, no two docs have same ct for same value)

CAN query by existence:
  ✅ db.form_data.find({ "data.dateOfBirth": { $exists: true, $type: "object" } })
     → Finds all docs where dateOfBirth is an EncryptedValue (has been filled in)

CAN query by key ID (for rotation):
  ✅ db.form_data.find({ "data.dateOfBirth.kid": "client-a-pharma-dek-v1" })
     → Finds all docs encrypted with old DEK version 1

CAN query non-encrypted fields normally:
  ✅ db.form_data.find({ "data.systolicBP": { $gt: 180 } })
     → Works perfectly (non-encrypted numeric field)
```

### 23.3 Aggregation Restrictions

```
CANNOT use encrypted fields in aggregations:
  ❌ db.form_data.aggregate([
       { $group: { _id: "$data.dateOfBirth", count: { $sum: 1 } } }
     ])
     → Groups by ciphertext, not plaintext — meaningless result

  ❌ db.form_data.aggregate([
       { $match: { "data.dateOfBirth": { $gt: ISODate("1960-01-01") } } }
     ])
     → dateOfBirth is a sub-document, not a date — no match

WORKAROUND FOR REPORTS REQUIRING AGGREGATION ON ENCRYPTED FIELDS:
  The report API decrypts all values in application code, then aggregates in-memory.
  For large datasets: use cursor-based pagination + in-memory aggregation.
  This is slower than MongoDB aggregation but necessary for encrypted fields.
  
  Alternatively: if a field is needed in aggregations, do not encrypt it.
  Encryption and aggregation are fundamentally incompatible.
```

---

## 24. Access Control — Who Can Decrypt

### 24.1 Decryption Access Matrix

```
┌──────────────────────────────────────────────────────────────────────┐
│ ROLE                    │ Data Entry  │ View-Only   │ Reports         │
│                         │ (Decrypt)   │ (Decrypt)   │ (Decrypt)       │
├──────────────────────────────────────────────────────────────────────┤
│ Principal Investigator  │ ✅ Yes      │ ✅ Yes      │ ✅ Yes          │
│ Sub-Investigator        │ ✅ Yes      │ ✅ Yes      │ ✅ Yes          │
│ CRC (Data Entry)        │ ✅ Yes      │ ✅ Yes      │ ❌ No           │
│ Data Manager            │ ✅ Yes      │ ✅ Yes      │ ✅ Yes          │
│ CRA (Monitor)           │ ❌ No*      │ ✅ Yes      │ ❌ No           │
│ Biostatistician         │ ❌ No       │ ❌ No       │ ✅ Yes (stats)  │
│ Medical Monitor         │ ❌ No       │ ✅ Yes      │ ❌ No           │
│ QA Auditor              │ ❌ No       │ ✅ Yes**    │ ❌ No           │
│ Platform Admin          │ ❌ No       │ ❌ No       │ ❌ No           │
│ Tenant Admin            │ ❌ No       │ ❌ No       │ ❌ No           │
└──────────────────────────────────────────────────────────────────────┘

* CRA cannot enter data — SDV (source document verification) is read-only
** QA Auditor sees decrypted values on view-only screen during audit visits
   All QA Auditor decrypt events are logged with elevated audit priority

Platform Admin and Tenant Admin: CANNOT decrypt subject data.
  These roles manage the platform — they do not need patient PII.
  Principle of least privilege strictly applied.
```

### 24.2 API Endpoint Authorization for Decryption

```csharp
// Endpoints/FormDataEndpoints.cs

// Data entry — decrypts for authorised data-entry roles
app.MapGet("/api/studies/{studyId}/subjects/{subjectId}/forms/{formId}",
    [Authorize(Policy = ClinicalPolicies.CanViewData)]
    async (string studyId, string subjectId, string formId,
           [FromQuery] string context,  // "data-entry" | "view-only"
           HttpContext httpContext, ...) =>
    {
        var decryptContext = context switch
        {
            "data-entry" => DecryptionContext.DataEntry,
            "view-only"  => DecryptionContext.ViewOnly,
            _            => DecryptionContext.Internal   // no decrypt
        };

        return await _dataEntryService.GetFormDataAsync(
            studyId, subjectId, formId, httpContext, decryptContext, ct);
    });

// Reports endpoint — role-gated with explicit decrypt
app.MapGet("/api/reports/studies/{studyId}/export",
    [Authorize(Policy = ClinicalPolicies.CanExportData)]
    async (...) =>
    {
        // Only CanExportData roles (DM, Biostatistician) reach here
        return await _reportService.GenerateReportAsync(
            studyId, httpContext, DecryptionContext.Report, ct);
    });
```

---

## 25. Regulatory Compliance Mapping

```
┌──────────────────────────────────────────────────────────────────────────┐
│ REGULATION          │ REQUIREMENT                    │ HOW FLE SATISFIES  │
├──────────────────────────────────────────────────────────────────────────┤
│ GDPR Art. 5(1)(f)   │ "appropriate security ...      │ AES-256-GCM is    │
│                     │  unauthorised processing"       │ state of the art  │
│                     │                                 │ encryption.        │
├──────────────────────────────────────────────────────────────────────────┤
│ GDPR Art. 25        │ Data protection by design      │ Sensitive fields   │
│                     │ and by default                 │ encrypted by       │
│                     │                                 │ default at schema  │
│                     │                                 │ design time.       │
├──────────────────────────────────────────────────────────────────────────┤
│ GDPR Art. 17        │ Right to erasure               │ Crypto-shredding:  │
│                     │                                 │ delete DEK =       │
│                     │                                 │ permanent erasure  │
│                     │                                 │ without deleting   │
│                     │                                 │ audit records.     │
├──────────────────────────────────────────────────────────────────────────┤
│ GDPR Art. 32        │ Encryption of personal data    │ AES-256-GCM per    │
│                     │ as appropriate measure         │ NIST SP 800-38D.   │
│                     │                                 │ Keys in KMS (HSM). │
├──────────────────────────────────────────────────────────────────────────┤
│ GDPR Recital 83     │ Encryption renders data        │ If our encrypted   │
│                     │ unintelligible after breach    │ MongoDB is         │
│                     │                                 │ exfiltrated,       │
│                     │                                 │ breach may not     │
│                     │                                 │ be notifiable.     │
├──────────────────────────────────────────────────────────────────────────┤
│ HIPAA §164.312      │ Encryption and decryption      │ Addressable        │
│ (a)(2)(iv)          │ of ePHI                        │ standard — FLE     │
│                     │                                 │ meets it.          │
├──────────────────────────────────────────────────────────────────────────┤
│ 21 CFR Part 11      │ Records must be accurate       │ Authenticated      │
│ §11.10(a)           │ and complete                   │ encryption (GCM    │
│                     │                                 │ tag) detects       │
│                     │                                 │ tampering.         │
├──────────────────────────────────────────────────────────────────────────┤
│ 21 CFR Part 11      │ Audit trail must record        │ Audit records      │
│ §11.10(e)           │ changes with original values   │ store encrypted    │
│                     │                                 │ envelopes for      │
│                     │                                 │ encrypted fields.  │
│                     │                                 │ Authorized UI      │
│                     │                                 │ can decrypt.       │
├──────────────────────────────────────────────────────────────────────────┤
│ ICH E6(R3)          │ Data integrity and             │ GCM auth tag       │
│ §5.18               │ confidentiality                │ ensures integrity. │
│                     │                                 │ FLE ensures        │
│                     │                                 │ confidentiality.   │
├──────────────────────────────────────────────────────────────────────────┤
│ EMA Annex 11        │ Security of the system         │ FLE is documented  │
│ §12                 │ must be documented             │ here; forms part   │
│                     │                                 │ of CSV evidence.   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 26. Decision Summary

```
┌───────────────────────────────────────────────────────────────────────┐
│              FIELD-LEVEL ENCRYPTION — FINALIZED DECISIONS             │
├──────────────────────────┬────────────────────────────────────────────┤
│ Decision                 │ Answer                                      │
├──────────────────────────┼────────────────────────────────────────────┤
│ Algorithm                │ AES-256-GCM                                 │
│                          │ FIPS 140-2, NIST SP 800-38D                │
│                          │ 256-bit key, 96-bit nonce, 128-bit tag     │
├──────────────────────────┼────────────────────────────────────────────┤
│ Deterministic?           │ NO — non-deterministic (random nonce)      │
│                          │ Same plaintext → different ciphertext      │
│                          │ Cannot query encrypted fields by value     │
├──────────────────────────┼────────────────────────────────────────────┤
│ Key management           │ Envelope encryption                         │
│                          │ CMK (master key) in KMS (AWS/Azure)        │
│                          │ DEK per tenant, encrypted by CMK           │
│                          │ DEK cached in-process 5min, never on disk  │
├──────────────────────────┼────────────────────────────────────────────┤
│ Storage format           │ EncryptedValue sub-document in MongoDB     │
│                          │ { v, alg, kid, iv, tag, ct }               │
├──────────────────────────┼────────────────────────────────────────────┤
│ Edit checks              │ BLOCKED — at design time AND at runtime    │
│                          │ Encrypted fields excluded from all         │
│                          │ edit check engine contexts                 │
├──────────────────────────┼────────────────────────────────────────────┤
│ Versioning lock          │ Locked after first data submission         │
│                          │ Cannot add/remove encryption mid-version   │
│                          │ Change encryption → new form version       │
├──────────────────────────┼────────────────────────────────────────────┤
│ Where encryption happens │ SERVER ONLY (ASP.NET Core API)             │
│                          │ Browser sends plaintext over HTTPS         │
│                          │ Browser NEVER has the DEK                  │
├──────────────────────────┼────────────────────────────────────────────┤
│ Decryption screens       │ Data entry screen ✅                        │
│                          │ View-only screen ✅                         │
│                          │ Authorised reports ✅                       │
│                          │ Edit check engine ❌                        │
│                          │ Direct MongoDB queries ❌                   │
│                          │ Offline/PWA cache ❌                        │
├──────────────────────────┼────────────────────────────────────────────┤
│ Audit trail              │ Encrypted envelopes stored in audit trail  │
│                          │ Authorised UI decrypts for inspection      │
│                          │ Plaintext never in audit trail             │
├──────────────────────────┼────────────────────────────────────────────┤
│ GDPR erasure             │ Crypto-shredding: delete DEK               │
│                          │ Data records remain (Part 11 audit trail)  │
│                          │ Encrypted values permanently unreadable    │
├──────────────────────────┼────────────────────────────────────────────┤
│ Key rotation             │ Envelope encryption: no mass re-encrypt    │
│                          │ Old data readable via old DEK version      │
│                          │ New data uses new DEK                      │
│                          │ kid field in envelope tracks DEK version   │
├──────────────────────────┼────────────────────────────────────────────┤
│ MongoDB CSFLE            │ NOT used — own implementation for CSV      │
│                          │ auditability and regulatory transparency   │
└──────────────────────────┴────────────────────────────────────────────┘
```

---

**Related Documents:**
- [auth-identity-multitenancy-clinical-edc.md](./auth-identity-multitenancy-clinical-edc.md) — Auth, audit trail, multi-tenancy (Section 18 for full .NET stack)
- [form-builder-schema.md](./form-builder-schema.md) — BaseComponentSchema (encryption property)
- [form-builder-validation.md](./form-builder-validation.md) — Edit check engine (encrypted field exclusion)
- [form-versioning-and-migration.md](./form-versioning-and-migration.md) — Form version lifecycle

**Research Sources:**
- NIST SP 800-38D — Recommendation for Block Cipher Modes of Operation: GCM and GMAC
- NIST SP 800-57 — Recommendation for Key Management
- FIPS 197 — Advanced Encryption Standard (AES)
- GDPR Articles 5, 17, 25, 32; Recitals 26, 83
- HIPAA Security Rule 45 CFR §164.312(a)(2)(iv)
- 21 CFR Part 11 §11.10(a)(e)
- ICH E6(R3) §5.18
- EMA Annex 11 §12
- AWS KMS Developer Guide — Envelope Encryption
- Azure Key Vault — Key Wrapping
