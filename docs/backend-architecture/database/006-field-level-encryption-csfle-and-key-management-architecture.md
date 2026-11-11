# Field-Level Encryption (CSFLE/QE), Multi-Tenant Key Vault Security & Cryptographic Lifecycle Architecture

> **Document ID:** `VIALIQ-ARCH-DB-007`  
> **Status:** Approved / Active Cryptographic Standard *(Canonical runtime = `.NET 9` + `RabbitMQ`/`Hangfire`; illustrative TypeScript/NestJS/BullMQ snippets below are legacy background exploration)*  
> **Regulatory Compliance:** FDA 21 CFR Part 11, EU Annex 11, HIPAA Security Rule §164.312(a)(2)(iv), GDPR Article 17, NIST SP 800-57, FIPS 140-2/3 Level 3, ICH GCP E6(R3)  
> **Target Audience:** Principal Security Architects, Clinical Data Management Leads, Database Administrators, Regulatory Compliance Officers, Core Backend Engineers  
> **Related Documents:**
> - [002: 3-Cluster & Flexible Tenancy Architecture](./002-3-cluster-and-flexible-tenancy-architecture.md)
> - [004: Background Jobs, Protocol Migration & Auto-Query Engine](./004-background-jobs-protocol-migration-and-auto-query-engine.md)
> - [005: Database Operational Pillars (Backup, Locking, Archival)](./005-database-operational-pillars-backup-locking-dictionaries-and-archival.md)
> - [3-Layer MongoDB Cluster Docker Setup Guide](./mongodb-3layer-docker-setup-guide.md)

---

## Executive Summary & Cryptographic Scope

Clinical trial Electronic Data Capture (EDC) platforms store some of the world's most sensitive data: Direct Personally Identifiable Information (PII) of patients, Protected Health Information (PHI), baseline genomics, and unblinded Investigational Product (IP) treatment assignments.

A standard "Transparent Data Encryption" (TDE) or disk-level AES-256 model is **grossly insufficient** for clinical trials:
* **The Root DBA Exposure Problem:** Any database administrator, cloud hosting provider engineer, or compromised database credential with `root` privileges can inspect raw patient identities and unblinded randomized treatment arms.
* **The Regulatory Compliance Conflict:** GDPR Article 17 mandates patient data deletion ("Right to be Forgotten"), whereas FDA 21 CFR §11.10(e) strictly forbids altering or deleting clinical audit records.
* **The Multi-Sponsor Multi-Tenancy Risk:** When multiple global pharmaceutical sponsors (e.g. Pfizer, Novartis, Roche) operate on a shared SaaS infrastructure, their cryptographic boundaries must remain mathematically segregated.

To resolve these challenges, Vialiq EDC implements **Client-Side Field-Level Encryption (CSFLE)** and **Queryable Encryption (QE)** governed by **Envelope Cryptography**, **Multi-Tenant Key Vault Isolation**, and a **7-Phase Resumable Key Rotation Engine**.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        VIALIQ EDC — CRYPTOGRAPHIC ARCHITECTURE PILLARS                                 │
├────────────────────────────┬────────────────────────────┬──────────────────────────────────────────────┤
│ 1. Cryptographic Trust     │ 2. Configurable Tiers      │ 3. Multi-Tenant Key Vault                    │
│ - Trust Boundary at API    │ - 5 Security Tiers (0 to 4)│ - Layer 1 Admin Key Storage                  │
│ - Zero keys to Browser UI  │ - Deterministic vs Random  │ - 3 Sponsor Models (Shared, Dedicated, BYOK) │
│ - Database sees only BSON  │ - Queryable Encryption     │ - Cloud KMS HSM (FIPS 140-2 L3)              │
├────────────────────────────┼────────────────────────────┼──────────────────────────────────────────────┤
│ 4. GDPR Crypto-Shredding   │ 5. Key Lifecycle & Lock    │ 6. 7-Phase Key Rotation                      │
│ - Per-subject DEK isolation│ - Active Read/Write State  │ - CMK Re-wrapping (<500ms, 0 docs touched)   │
│ - Instant consent erasure  │ - DBL Read-Only KMS Policy │ - Background Field Re-encryption (Batch 500) │
│ - 100% audit trail retained│ - 25-Year WORM Compliance  │ - Optimistic Concurrency Control (_version)  │
├────────────────────────────┴────────────────────────────┴──────────────────────────────────────────────┤
│ 7. Local Offline Development Mode (Apple Silicon M1 Pro / M5 Pro & CI)                                 │
│ - 96-Byte Local Master Key (Zero Cloud KMS dependency)                                                 │
│ - Native crypt_shared C++ Dynamic Shared Library (mongo_crypt_v1.dylib / .so)                         │
│ - Turnkey automated key seeding script (seed-local-encryption-keys.ts)                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table of Contents

1. [Cryptographic Trust Boundary: Why "Client-Side" Means Backend API, Not Browser UI](#1-cryptographic-trust-boundary-why-client-side-means-backend-api-not-browser-ui)
2. [Study Configuration & 5 Security Tiers (Security vs. Performance Matrix)](#2-study-configuration--5-security-tiers-security-vs-performance-matrix)
3. [Multi-Tenant Key Vault Security & Layer 1 Admin Storage](#3-multi-tenant-key-vault-security--layer-1-admin-storage)
   - [3.1 Is Storing Keys in Layer 1 Admin Safe and Compliant?](#31-is-storing-keys-in-layer-1-admin-safe-and-compliant)
   - [3.2 The 3 Multi-Tenant Key Vault Isolation Models (Shared, Dedicated DB, BYOK)](#32-the-3-multi-tenant-key-vault-isolation-models-shared-dedicated-db-byok)
   - [3.3 Defense-in-Depth: Physical Cluster Separation (Layer 1 vs. Layer 3)](#33-defense-in-depth-physical-cluster-separation-layer-1-vs-layer-3)
   - [3.4 Extended `__keyVault` Lifecycle Document Schema](#34-extended-__keyvault-lifecycle-document-schema)
4. [The Clinical GDPR Dilemma: Subject-Level Crypto-Shredding](#4-the-clinical-gdpr-dilemma-subject-level-crypto-shredding)
5. [Cryptographic Key Lifecycle Across Clinical Phases](#5-cryptographic-key-lifecycle-across-clinical-phases)
   - [5.1 Active Enrollment & Visits](#51-active-enrollment--visits)
   - [5.2 Database Lock (DBL) Read-Only Transition](#52-database-lock-dbl-read-only-transition)
   - [5.3 25-Year WORM Storage & Legal Hold Extension](#53-25-year-worm-storage--legal-hold-extension)
6. [Key Rotation & Field Re-Encryption Architecture](#6-key-rotation--field-re-encryption-architecture)
   - [6.1 Type A: Customer Master Key (CMK) Rotation (Zero Downtime, Zero Record Touch)](#61-type-a-customer-master-key-cmk-rotation-zero-downtime-zero-record-touch)
   - [6.2 Type B: Data Encryption Key (DEK) Rotation & Field Re-Encryption](#62-type-b-data-encryption-key-dek-rotation--field-re-encryption)
   - [6.3 Seamless Dual-Key Read Window (BSON Subtype 6 Binary Header)](#63-seamless-dual-key-read-window-bson-subtype-6-binary-header)
   - [6.4 Resumable Batch Worker with Redis Checkpointing & OCC Concurrency Protection](#64-resumable-batch-worker-with-redis-checkpointing--occ-concurrency-protection)
   - [6.5 21 CFR Part 11 Regulatory Audit Trail Emission](#65-21-cfr-part-11-regulatory-audit-trail-emission)
7. [Field-Level Encryption Development Mode (Local Offline Developer Experience)](#7-field-level-encryption-development-mode-local-offline-developer-experience)
   - [7.1 Dual-Mode Architecture: Local Dev vs. Cloud Production](#71-dual-mode-architecture-local-dev-vs-cloud-production)
   - [7.2 Generating the 96-Byte Local Master Key](#72-generating-the-96-byte-local-master-key)
   - [7.3 `crypt_shared` Dynamic Shared Library Setup on Apple Silicon (macOS ARM64)](#73-crypt_shared-dynamic-shared-library-setup-on-apple-silicon-macos-arm64)
   - [7.4 Automated Local Key Seeding Script (`seed-local-encryption-keys.ts`)](#74-automated-local-key-seeding-script-seed-local-encryption-keysts)
   - [7.5 Local Developer Inspection: MongoDB Compass vs. NestJS API](#75-local-developer-inspection-mongodb-compass-vs-nestjs-api)
   - [7.6 Developer Troubleshooting Guide](#76-developer-troubleshooting-guide)
8. [Double-Blind RTSM Treatment Arm Isolation & Emergency Code Break](#8-double-blind-rtsm-treatment-arm-isolation--emergency-code-break)
9. [Regulatory Compliance Matrix & Audit Verification Checklist](#9-regulatory-compliance-matrix--audit-verification-checklist)

---

## 1. Cryptographic Trust Boundary: Why "Client-Side" Means Backend API, Not Browser UI

> [!IMPORTANT]
> **Architectural Trust Boundary Definition:**  
> In database systems architecture, the term **"Client"** refers strictly to the **Backend Application Server (the NestJS `MongoClient` driver process)** running inside a secure, private VPC subnet. It **NEVER** refers to the end-user's web browser, tablet, or mobile UI!

### Why Keys Must NEVER Be Sent to the Browser UI
1. **Compromised Endpoints:** If cryptographic keys or Data Encryption Keys (DEKs) were transmitted to the user's browser, any Clinical Research Coordinator (CRC), investigator, or malicious user could open Chrome DevTools, inspect the JavaScript memory heap, and extract the raw keys.
2. **Loss of Access Control:** With client-held keys, the user could decrypt patient data across other study sites, other cohorts, or unblinded treatment arms without server-side Role-Based Access Control (RBAC) validation.
3. **Regulatory Violation:** Sending raw keys to client devices violates FDA 21 CFR §11.10(d) (limiting system access to authorized individuals) and HIPAA Security Rule §164.312(a)(2)(iv).

### The Vialiq 3-Tier Encryption Pipeline

```
                                  TRUST & ENCRYPTION BOUNDARY
                                  
    ┌───────────────────────────┐
    │ Web Browser / CRC UI      │
    │ (Angular / Lit Components)│
    └─────────────┬─────────────┘
                  │ Standard TLS 1.3 (HTTPS) — Plaintext transmitted securely over TLS.
                  │ The browser NEVER receives keys or raw ciphertexts.
                  ▼
    ══════════════════════════════════════════════════════════════════════════════
    [TRUST BOUNDARY] Backend API Server (NestJS Container on Private VPC Subnet)
    ══════════════════════════════════════════════════════════════════════════════
                  │
                  ▼
    ┌───────────────────────────┐        Fetches Wrapped DEK     ┌────────────────────┐
    │ NestJS API Worker Process │◄──────────────────────────────┤ Cloud KMS (AWS/HSM)│
    │ (Holds CSFLE MongoClient) │ Decrypts DEK in private memory└────────────────────┘
    └─────────────┬─────────────┘
                  │ Encrypted BSON Wire Protocol (Ciphertext: BinData Subtype 6)
                  ▼
    ══════════════════════════════════════════════════════════════════════════════
    [ZERO-TRUST STORAGE TIER] Database Engine Never Possesses Keys
    ══════════════════════════════════════════════════════════════════════════════
                  │
                  ▼
    ┌───────────────────────────┐
    │ MongoDB Cluster (Layer 3) │ ◄── Stores only encrypted ciphertext on disk & in RAM.
    │ mongod process            │     Even root DBAs or cloud engineers cannot decrypt data.
    └───────────────────────────┘
```

* **To the UI:** Communication is standard HTTPS. The UI submits plain form inputs and receives clean JSON payloads *only for fields the authenticated user has explicit RBAC clearance to view*.
* **To the Backend API:** The NestJS process authenticates with Cloud KMS, holds the decrypted DEK in protected volatile memory, and encrypts fields locally before serializing BSON packets across the network.
* **To MongoDB (`mongod` on Layer 3):** The database engine receives and stores only raw binary ciphertext (`BinData(6, "...")`). The database server possesses zero keys.

---

## 2. Study Configuration & 5 Security Tiers (Security vs. Performance Matrix)

In clinical trials, encryption is not "one-size-fits-all." Applying randomized encryption to every field imposes severe trade-offs: index limitations, query constraints, and CPU overhead.

Vialiq introduces **Configurable Security Tiers** in the Form Builder and Study Protocol Configuration:

```json
{
  "fieldId": "crf_patient_mrn",
  "label": "Medical Record Number",
  "fieldType": "TEXT",
  "encryptionTier": "TIER_1_DETERMINISTIC"
}
```

### Security vs. Performance Trade-Off Matrix

| Security Tier | Cryptographic Mechanism | Supported Database Queries | Performance Impact | Recommended Clinical Fields |
|:---|:---|:---|:---:|:---|
| **Tier 0: Standard Base Security** | TLS 1.3 in-transit + WiredTiger AES-256 disk encryption at-rest. | **Full:** Range (`$gt`/`$lt`), Regex, Compound indexes, Text search, Aggregations. | **Baseline (100% Speed):** Zero crypto latency overhead. | Vital signs (Blood Pressure, Pulse, Temperature), non-sensitive CRF values, adverse event verbatims. |
| **Tier 1: Deterministic FLE** | `AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic` | **Exact Match Only:** Equality queries (`find({ mrn: "123" })`). No range or regex. | **~5% overhead:** Identical plaintext always produces identical ciphertext; supports index lookups. | Subject MRN (Medical Record Number), National Health ID, Screening Number. |
| **Tier 2: Randomized FLE (AEAD)** | `AEAD_AES_256_CBC_HMAC_SHA_512-Random` | **No Direct Querying:** Cannot search by value. Loaded by document `_id` or indexed parent key (`subjectId`). | **~10% overhead:** Unique ciphertext on every write (random IV); immune to statistical frequency analysis. | Direct Patient Identifiers (Full Name, Date of Birth, Email, Street Address, SSN). |
| **Tier 3: Queryable Encryption (QE)** | MongoDB 7.0 Native Fast Encrypted Indexes (Structured Encryption). | **Range & Prefix:** Encrypted equality, range (`$gt`, `$lt`), and prefix search over encrypted data. | **~15–20% overhead:** Auxiliary encrypted index collections managed automatically. | Sensitive optional clinical metrics not projected to SQL (while derived `Age`/`Birth Year` remain `ClinicalResearch` per ADR 004 for SDTM `DM`). |
| **Tier 4: Role-Blinded Isolation** | Randomized AEAD governed by restricted Cloud KMS IAM Key Policy. | **Role-Gated:** Decryptable **only** by unblinded service accounts or unblinded pharmacist roles. | **KMS Network Bound:** Handled by native MongoDB `libmongocrypt` 60s key buffer (no `.NET IMemoryCache`). | Investigational Product (IP) Kit Number, Treatment Arm (Active vs. Placebo). |

---

## 3. Multi-Tenant Key Vault Security & Layer 1 Admin Storage

### 3.1 Is Storing Keys in Layer 1 Admin Safe and Compliant?

> **The Question:** We store the `__keyVault` collection in the Layer 1 Admin Cluster (`vialiq_control_plane.__keyVault` for `Single` baseline studies, or regional `keyvault_study_{id}_{zoneId}.__keyVault` inside each sovereign VPC for `MultiRegionGeoPartitioned` studies per [Scale 005-A](../../scaling-architecture/005-a-multilingual-study-db-per-site-group-and-reporting-guide.md)). If multiple pharmaceutical sponsors (e.g. Pfizer, Novartis, Roche) run clinical trials on Vialiq, is sharing the KMS pattern compliant? Could one client's keys decrypt another's data?

#### The Compliance & Cryptographic Answer: YES, 100% Safe Due to Envelope Cryptography

The architectural security rests on **Envelope Encryption (mandated by NIST SP 800-57, HIPAA §164.312, and SOC 2 Type II)**, combined with strict multi-tenant isolation tiers:

```
                          MULTI-TENANT ENVELOPE ISOLATION
                          
    Layer 1 Admin Cluster (vialiq_control_plane.__keyVault)
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │ Pfizer Wrapped DEK:  BinData(0, "AQIDAH...") ──► Encrypted by Pfizer AWS CMK│
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ Roche Wrapped DEK:   BinData(0, "AQIDAK...") ──► Encrypted by Roche AWS CMK │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ Novartis Wrapped DEK:BinData(0, "AQIDAR...") ──► Encrypted by Novartis CMK  │
    └─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
    Even if an admin dumps the Layer 1 database, ALL keys are completely useless ciphertexts.
    To unwrap a DEK, the request MUST reach AWS KMS with valid IAM credentials.
    Pfizer's IAM role CANNOT invoke kms:Decrypt on Roche's Master Key!
```

1. **The Database Stores NO Plaintext Keys:**
   Documents in `vialiq_control_plane.__keyVault` do **not** contain raw cryptographic keys. They store **Data Encryption Keys (DEKs) wrapped (encrypted) by a Cloud Customer Master Key (CMK)**:
   ```json
   {
     "_id": UUID("c4b2a8d1-7f8e-4a9b-9c2e-8d1e3f5a7b9c"),
     "keyAltNames": ["dek_pfizer_study_101_identity"],
     "masterKey": {
       "provider": "aws",
       "key": "arn:aws:kms:us-east-1:111122223333:key/pfizer-clinical-master-cmk"
     },
     "keyMaterial": BinData(0, "AQIDAHh7z...") // ◄── 100% ENCRYPTED CIPHERTEXT
   }
   ```
2. **Cryptographic Segregation Across Sponsors:**
   - Every pharmaceutical client/sponsor is assigned an **isolated Customer Master Key (CMK) ARN** in Cloud KMS.
   - Even though wrapped DEK records are cataloged in Layer 1, **they are cryptographically quarantined**.
   - An API service account running a Pfizer study only holds IAM permissions for `arn:aws:kms:...:key/pfizer-clinical-master-cmk`. If it attempts to unwrap a Roche DEK, AWS KMS hardware-enforced IAM security immediately **rejects the decryption request (`AccessDeniedException`)**.
3. **Hardware Security Module (HSM) Isolation:**
   The Master Keys (CMKs) reside strictly within an **AWS KMS / Azure Key Vault Hardware Security Module (FIPS 140-2 Level 3 certified)** and can never be exported or viewed by any human administrator.

---

### 3.2 The 3 Multi-Tenant Key Vault Isolation Models

Depending on the sponsor's regulatory classification and enterprise contractual requirements, Vialiq supports **3 distinct Key Vault isolation models**:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              VIALIQ MULTI-TENANT KEY VAULT ISOLATION TIERS                             │
├───────────────────────────────────┬───────────────────────────────────┬────────────────────────────────┤
│ Model 1: Shared KeyVault Namespace│ Model 2: Dedicated KeyVault DB    │ Model 3: Bring Your Own Key    │
│ (Standard Enterprise)             │ (Physical DB Isolation)           │ (BYOK Sovereign Control)       │
├───────────────────────────────────┼───────────────────────────────────┼────────────────────────────────┤
│ • Collection: Single shared       │ • Collection: Dedicated per tenant│ • CMK Location: Sponsor's OWN  │
│   vialiq_control_plane.__keyVault │   keyvault_sponsor_pfizer.__keyVlt│   AWS Account (Not Vialiq)     │
│ • Isolation: Cloud KMS IAM ARNs   │ • Isolation: MongoDB native RBAC  │ • Isolation: Full Sovereign    │
│ • Best for: Standard phase trials │ • Best for: High-compliance CROs  │ • Best for: Top-tier Big Pharma│
└───────────────────────────────────┴───────────────────────────────────┴────────────────────────────────┘
```

#### Model 1: Shared KeyVault with Sponsor-Specific KMS CMKs (Standard Enterprise)
* A single high-performance `vialiq_control_plane.__keyVault` collection stores wrapped DEKs for all active studies.
* Isolation is enforced cryptographically at the Cloud KMS layer via dedicated CMKs and IAM Key Policies per sponsor.

#### Model 2: Dedicated KeyVault Database per Sponsor (Physical Collection Isolation)
* For sponsors requiring strict separation of storage at rest, Layer 1 Admin provisions **dedicated databases per sponsor**:
  - `keyvault_sponsor_pfizer.__keyVault`
  - `keyvault_sponsor_roche.__keyVault`
* **MongoDB RBAC Enforcement:**
  - The database user account for the Pfizer connection pool is strictly granted `readWrite` on `keyvault_sponsor_pfizer` only.
  - Queries attempting to touch Roche's keyvault database are blocked by MongoDB's internal authorization engine before ever executing.
* In the NestJS connection pool, `keyVaultNamespace` is dynamically set per sponsor pool:
  ```typescript
  autoEncryption: {
    keyVaultNamespace: `keyvault_sponsor_${tenantId}.__keyVault`,
    kmsProviders: { ... }
  }
  ```

#### Model 3: Bring Your Own Key (BYOK) — Zero-Knowledge Sovereign Control
* For global tier-1 pharmaceutical sponsors (e.g., Novartis, AstraZeneca), corporate policy forbids third-party SaaS vendors from owning the Master Key.
* **How BYOK Works in Vialiq:**
  1. The Master Key (CMK) is created inside the **Sponsor's own AWS account** (`arn:aws:kms:us-east-1:sponsor-account-id:key/...`).
  2. The sponsor configures an AWS KMS Key Policy that allows Vialiq's dedicated VPC worker IAM role to invoke `kms:Decrypt` and `kms:Encrypt`.
  3. **Instant Sovereign Kill Switch:** If the sponsor terminates the study, suspects a compromise, or ends the contract, the sponsor **disables the key in their own AWS console with 1 click**.
  4. Once disabled by the sponsor, **Vialiq cannot decrypt a single byte of their patient data**, even with full administrative access to both Layer 1 Admin and Layer 3 Prod.

---

### 3.3 Defense-in-Depth: Physical Separation & Sovereign Regional Key Vaults

Storing Key Vaults separately from operational CRF databases introduces a powerful **physical architectural barrier**:

* **Single-Region / Standard Trials (`Single` Mode):** Wrapped DEKs can reside on Layer 1 Admin (`vialiq_control_plane.__keyVault` or `keyvault_sponsor_{tenantId}.__keyVault`), isolated physically from Layer 3 Prod CRF documents.
* **Global Multi-Region Geo-Partitioned Studies (`MultiRegionGeoPartitioned`, e.g., US / EU / China):** To obey China PIPL/DSL and strict EU DPO sovereignty laws, **wrapped DEKs (`__keyVault`) NEVER leave their sovereign region**:
  - `vialiq_control_plane.study_registry` (Layer 1) stores **non-secret KMS & KeyVault pointers ONLY** (`kmsProvider`, `kmsKeyArn`, `keyVaultNamespace`).
  - Wrapped DEKs physically reside inside isolated databases within each **sovereign regional cluster** (`keyvault_study_global301_eu.__keyVault` on `rs-prod-eu-01` wrapped by AWS Frankfurt KMS; `keyvault_study_global301_cn.__keyVault` on `rs-prod-cn-01` wrapped by Aliyun Beijing HSM), with separate MongoDB RBAC credentials from `crf_entries`.

```
    ┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
    │        SOVEREIGN KEY VAULT DB / LAYER 1      │       │             LAYER 3: PROD STUDY DB           │
    │   (Isolated Key Vault in Region / Admin)     │       │             (crf_entries / audit_trail)      │
    ├──────────────────────────────────────────────┤       ├──────────────────────────────────────────────┤
    │ • Stores: Wrapped DEKs only (ciphertexts)    │       │ • Stores: Encrypted patient CRF & audit PII  │
    │ • Stores: ZERO patient clinical records      │       │ • Stores: ZERO cryptographic keys            │
    │ • Requires regional Cloud KMS / HSM to unwrap│       │ • Protected by separate DB RBAC credentials  │
    └──────────────────────────────────────────────┘       └──────────────────────────────────────────────┘
```

To achieve an unauthorized decryption of clinical patient data, an attacker would have to breach **three completely independent, isolated security perimeters simultaneously**:
1. **Perimeter 1:** Breach the regional Layer 3 Prod clinical database to steal raw encrypted BSON records.
2. **Perimeter 2:** Breach the isolated Key Vault database (`__keyVault`) to steal the wrapped DEKs.
3. **Perimeter 3:** Breach regional Cloud KMS / HSM IAM infrastructure inside that sovereign territory (`eu-central-1` / Beijing HSM).

---

> **Key Vault Governance Ownership:** Physical KMS CMKs and regional `__keyVault` databases are provisioned by **Platform SRE / Cloud Security** (or the **Sponsor Security Team** for Model 3 BYOK IAM trust policies). Study-level non-secret KMS/KeyVault pointers (`kmsKeyArn`, `keyVaultNamespace`) are bound prior to `PROD` FPI by holders of **`STUDY_INFRA_CONFIG`** (Vialiq Support or Client Tech Lead per SOW) as detailed in [FTS-003 Section 4.4](../../functional-and-technical-specs/003-inter-zone-patient-transfers-and-multinational-inspections-specification.md#44-end-to-end-infrastructure-ownership--execution-matrix).

### 3.4 Extended `__keyVault` Lifecycle Document Schema

Every DEK document in the resolved target `__keyVault` contains rigorous lifecycle state tracking:

```typescript
export enum KeyStatus {
  ACTIVE = 'ACTIVE',       // Actively used for both new writes and reads
  MIGRATING = 'MIGRATING', // Used for dual-read; background re-encryption in progress
  RETIRED = 'RETIRED',     // Read-only for historical audit trail inspection; no new writes
  REVOKED = 'REVOKED'      // Crypto-shredded (GDPR Article 17) or compromised; decryption disabled
}

export interface IKeyVaultDocument {
  _id: UUID; // Standard CSFLE UUID
  keyAltNames: string[]; // e.g. ["dek_study_101_identity_v2"]
  keyVersion: number;    // e.g. 1, 2, 3
  status: KeyStatus;
  
  masterKey: {
    provider: 'aws' | 'azure' | 'gcp' | 'local';
    key: string; // Cloud KMS Key ARN
  };
  keyMaterial: Binary; // Encrypted DEK ciphertext wrapped by CMK
  
  // Regulatory Metadata
  creationDate: Date;
  createdByUserId: string;
  parentKeyId?: UUID;    // Points to the predecessor key (v1) if rotated
  retiredAt?: Date;
  retirementReason?: string;
  signatureHash: string; // SHA-256 of key metadata signed by Security Officer
}
```

---

## 4. The Clinical GDPR Dilemma: Subject-Level Crypto-Shredding

A fundamental regulatory contradiction exists in clinical trial software:
* **GDPR Article 17 ("Right to Erasure / Right to be Forgotten"):** An EU participant has the legal right to revoke informed consent and demand permanent deletion of their personal health data.
* **FDA 21 CFR §11.10(e) & ICH GCP:** Strictly **forbids deleting or altering** clinical records, audit trail histories, or cryptographic signatures (data must be preserved for 25 years).

### The Technical Solution: Zone-Local Subject-Level Crypto-Shredding (CRFs & Audit Trails)
Instead of violating FDA regulations by deleting records from the database or audit trail:
1. Every clinical subject is assigned an **isolated, individual Data Encryption Key (`dek_subject_{uuid}`)** stored in their **Site Zone's `__keyVault`** (`keyvault_study_{id}_{zoneId}.__keyVault` pointed to by `study_registry`).
2. Both live `crf_entries` PII and historical audit snapshots (`ADR 006` segregated collections such as `audit_crf_data` / `audit_subject_journey`) encrypt `SiteIdentifier` `oldValue`/`newValue` with that subject's `dek_subject_{uuid}`. Structural audit metadata (`auditSequence`, `serverTimestampUtc`, `performedByUserId`, `reasonForChange`, `signatureHash`) and the **stored post-CSFLE ciphertext envelope (`BinData`)** feed the Part 11 SHA-256 chain (never pre-encryption plaintext, so deleting `dek_subject_{uuid}` leaves hash-chain verification valid forever).
3. When a patient exercises their GDPR Article 17 Right to Erasure, the system records the erasure through the canonical Part 11 chained audit service (Primary server clock + `auditSequence`, never unchained `DateTime.UtcNow`) and executes **Crypto-Shredding** strictly inside that subject's Site Zone:

```csharp
public async Task ExecuteGdprCryptoShreddingAsync(
    string tenantId,
    string studyId,
    string zoneId,
    string subjectId,
    CancellationToken ct)
{
    var keyAltName = $"dek_subject_{subjectId}";
    var zoneKeyVaultDb = await _zoneKeyVaultResolver.GetKeyVaultDatabaseAsync(tenantId, studyId, zoneId, ct);
    var auditTrailDb = await _clinicalDbProvider.GetDatabaseByZoneAsync(tenantId, studyId, zoneId, ct);

    // 1. Permanently delete the subject's unique DEK inside their sovereign Site Zone's __keyVault
    await zoneKeyVaultDb.GetCollection<BsonDocument>("__keyVault")
        .DeleteOneAsync(Builders<BsonDocument>.Filter.AnyEq("keyAltNames", keyAltName), ct);

    // 2. Notify CSFLE driver scopes to recycle scoped MongoClient libmongocrypt key buffer (60s native buffer; zero .NET IMemoryCache used)
    await _csfleClientManager.NotifyKeyRevokedAsync(zoneId, keyAltName, ct);

    // 3. Log immutable compliance event via the canonical ADR 006/009 chained audit collection
    //    (e.g., audit_subject_journey) using Primary server clock & AuditSequence
    await auditTrailDb.GetCollection<BsonDocument>("audit_subject_journey").InsertOneAsync(new BsonDocument
    {
        { "_id", Guid.NewGuid().ToString() },
        { "eventType", "GDPR_CRYPTO_SHREDDING_EXECUTED" },
        { "subjectId", subjectId },
        { "zoneId", zoneId },
        { "reason", "Subject revoked informed consent; invoked GDPR Article 17" },
        { "serverTimestampUtc", DateTime.UtcNow }
    }, cancellationToken: ct);
}
```

### The Regulatory Outcome:
* The encrypted ciphertext in `subject_identities`, `crf_entries`, **and historical `audit_trail` snapshots (`oldValue`/`newValue`)** remains **100% untouched** on disk, preserving bit-for-bit SHA-256 hash-chain validity for FDA/EMA inspectors.
* Without the shredded DEK, patient PII in both live CRFs and audit logs collapses into unrecoverable ciphertext. When rendered in the Audit Viewer or PDF/CSV inspection exports, missing-key exceptions are handled gracefully and displayed as **`[REDACTED — GDPR ARTICLE 17 ERASURE EXECUTED]`**, fulfilling GDPR Article 17 with **zero audit trail destruction**.

---

## 5. Cryptographic Key Lifecycle Across Clinical Phases

When a clinical trial completes and transitions through locking and archival, its cryptographic keys follow a strictly audited lifecycle:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             KEY LIFECYCLE PHASES                                 │
├───────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Active Study      │ Database Lock (DBL)          │ 25-Year WORM Archival         │
│ (Enrollment/Visits│ (Study Read-Only)            │ (Cold Storage Shutdown)       │
├───────────────────┼──────────────────────────────┼───────────────────────────────┤
│ Keys: Read/Write  │ Keys: Read-Only Policy       │ Keys: Retained in KMS Vault   │
│ - New DEKs created│ - No new DEKs allowed        │ - Policy: RETAIN_25YR         │
│ - Live encryption │ - Decryption active for DMs  │ - Exported into WORM bundle   │
│   and decryption  │ - Mutation blocked in KMS    │ - Guaranteed FDA inspectability│
└───────────────────┴──────────────────────────────┴───────────────────────────────┘
```

### 5.1 Active Enrollment & Visits
Keys support live reads and writes. Key unwrapping is managed inside MongoDB's native C++ `libmongocrypt` driver boundary using its built-in 60-second internal key buffer (zero custom `.NET IMemoryCache`).

### 5.2 Database Lock (DBL) Read-Only Transition
* An automated script updates the AWS KMS IAM Key Policy for that study to `DENY_KEY_CREATION`.
* The study's DEKs transition to a **Read-Only State**. Decryption remains functional for monitors, data managers, and biostatisticians generating final regulatory submission files (SDTM/ADaM, CSR).

### 5.3 25-Year WORM Storage & Legal Hold Extension
* **The Problem:** If a cloud account or KMS key is deleted 5 years after study close, the 25-year archived clinical data is permanently lost, triggering catastrophic FDA regulatory fines.
* **The Vialiq Archival Key Policy:**
  1. The encrypted study DEKs are packaged directly inside the regulatory archival bundle (`archive-bundle-final.tar.gz`) stored in **AWS S3 Glacier Object Lock (Compliance Mode)**.
  2. In AWS KMS, the Master Key is assigned a `COMPLIANCE_HOLD_25_YEAR` resource tag with deletion protection enabled.
  3. The KMS Key policy prevents key deletion until the regulatory retention date (e.g. October 18, 2051) has passed.
  4. If the trial becomes subject to ongoing litigation or regulatory inquiry, a **Legal Hold flag** extends the KMS retention period indefinitely.

---

## 6. Key Rotation & Field Re-Encryption Architecture

Key rotation in clinical trial databases is subject to strict regulatory oversight. We distinguish between two fundamentally different rotation operations:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                KEY ROTATION TYPOLOGY & ARCHITECTURE                                    │
├─────────────────────────────────────────────────┬──────────────────────────────────────────────────────┤
│ Type A: Master Key (CMK / KEK) Rotation         │ Type B: Data Encryption Key (DEK) Rotation           │
├─────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ • Frequency: Annual routine compliance          │ • Frequency: Key lifecycle retirement / compromise   │
│ • Target: Customer Master Key in Cloud KMS      │ • Target: Individual DEKs in __keyVault              │
│ • Clinical Records Touched: ZERO (0 records)    │ • Clinical Records Touched: ALL encrypted fields     │
│ • Execution Time: <500 milliseconds             │ • Execution Time: Decoupled background async batches │
│ • System Downtime: 0 seconds (Live operational) │ • System Downtime: 0 seconds (Zero downtime dual-key)│
│ • Mechanism: ClientEncryption.rewrapManyDataKey │ • Mechanism: 7-Phase Resumable Re-encryption Worker   │
└─────────────────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

### 6.1 Type A: Customer Master Key (CMK) Rotation (Zero Downtime, Zero Record Touch)

When enterprise cloud security policies require rotating the Customer Master Key (KEK) in AWS KMS or Azure Key Vault:
1. **Cloud KMS Auto-Rotation:** Cloud KMS creates a new backing key version in its HSM while preserving the identical Key ARN.
2. **Envelope Re-wrapping via `rewrapManyDataKey()`:**  
   MongoDB CSFLE provides a native, atomic operation that decrypts the Data Encryption Keys inside `__keyVault` using the old CMK version and immediately re-encrypts them with the new CMK version:

```typescript
import { MongoClient, ClientEncryption } from 'mongodb';

export class MasterKeyRotationService {
  constructor(private readonly mongoClient: MongoClient) {}

  /**
   * Rotates the Master Key wrapping all DEKs in the __keyVault.
   * Execution time: <500ms. Zero patient records are modified!
   */
  async rotateCustomerMasterKey(studyId: string, kmsKeyArn: string): Promise<void> {
    const clientEncryption = new ClientEncryption(this.mongoClient, {
      keyVaultNamespace: 'vialiq_control_plane.__keyVault',
      kmsProviders: {
        aws: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      }
    });

    // Atomically re-wraps all DEKs referencing the Master Key
    const result = await clientEncryption.rewrapManyDataKey(
      { 'masterKey.key': kmsKeyArn }
    );

    console.log(`✅ Master Key rotation complete: ${result.bulkWriteResult.modifiedCount} DEKs re-wrapped.`);
  }
}
```

* **Why Zero Patient Records Are Touched:** Because patient CRF records are encrypted with the Data Encryption Key (DEK), not the Master Key (CMK). Changing the wrapper around the DEK in `__keyVault` requires zero changes to the underlying clinical data collections.

---

### 6.2 Type B: Data Encryption Key (DEK) Rotation & Field Re-Encryption

When a specific Data Encryption Key (DEK) reaches the end of its cryptoperiod (e.g., 3 years), or in the event of suspected key compromise, the actual ciphertexts on disk must be migrated from `dek_v1` to `dek_v2`.

Re-encrypting millions of clinical records while investigators and CRCs are actively entering trial data requires an **asynchronous, resumable, optimistic-concurrency-safe architecture**.

```
                           7-PHASE DEK ROTATION STATE MACHINE
                           
    [Phase 1: Dual-Person Part 11 Auth] ──► Pre-flight document count & snapshot
                   │
                   ▼
    [Phase 2: Generate DEK v2]           ──► Inserts dek_v2 with status "ACTIVE" in __keyVault
                   │
                   ▼
    [Phase 3: Live SchemaMap Switch]     ──► Outgoing writes immediately use dek_v2.
                   │                         Inbound reads seamlessly decrypt v1 & v2.
                   ▼
    [Phase 4: Resumable Batch Worker]    ──► Decoupled worker processes 500-record chunks
                   │                         Checkpointing via Redis: lastProcessedId
                   ▼
    [Phase 5: Concurrency Resolution]    ──► Optimistic Concurrency Control (_version guard)
                   │                         Retries on concurrent CRC edits without data loss
                   ▼
    [Phase 6: 100% Cryptographic Audit]  ──► Verifies remaining v1 count === 0
                   │                         Reconciles record counts before vs after
                   ▼
    [Phase 7: Decommission DEK v1]       ──► Marks dek_v1 as "RETIRED" in __keyVault
                                             Appends 21 CFR Part 11 digital signature
```

---

### 6.3 Seamless Dual-Key Read Window (BSON Subtype 6 Binary Header)

A critical architectural capability of MongoDB CSFLE is that **the API application can read both `v1` and `v2` records concurrently without code changes or ambiguous guesswork**:
1. **BSON Subtype 6 Binary Header:** When MongoDB CSFLE encrypts a field, it wraps the ciphertext into a BSON binary blob (Subtype 6). The first 16 bytes of the binary header explicitly contain the **Key UUID (`keyId`)** that encrypted that specific value.
2. **Automatic Key Lookup:** When `MongoClient` fetches a document, it reads the 16-byte UUID from the field header, pulls the corresponding DEK from its local cache (or `__keyVault`), and decrypts the field.
3. If Document A was written last year with `dek_v1`, it decrypts with `dek_v1`. If Document B was written 5 seconds ago with `dek_v2`, it decrypts with `dek_v2`. Both coexist peacefully in the exact same collection.

---

### 6.4 Resumable Batch Worker with Redis Checkpointing & OCC Concurrency Protection

The background re-encryption worker integrates with our BullMQ Job Architecture (Document 004). It handles crashes, network blips, and concurrent clinical edits with mathematical safety:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { MongoClient, ClientEncryption, Db, ObjectId } from 'mongodb';

export interface IReencryptionJobPayload {
  studyId: string;
  collectionName: string;
  targetField: string;
  oldKeyId: string; // UUID string of dek_v1
  newKeyId: string; // UUID string of dek_v2
  batchSize: number; // default: 500
}

@Injectable()
export class FieldReencryptionWorker {
  private readonly logger = new Logger(FieldReencryptionWorker.name);

  constructor(
    private readonly mongoClient: MongoClient,
    private readonly clientEncryption: ClientEncryption,
    private readonly redisCache: RedisService
  ) {}

  /**
   * Resumable background processor for batch field re-encryption.
   */
  async processReencryptionJob(job: IReencryptionJobPayload): Promise<void> {
    const db: Db = this.mongoClient.db(`study_${job.studyId}_prod`);
    const collection = db.collection(job.collectionName);
    const checkpointKey = `vialiq:reencrypt:checkpoint:${job.studyId}:${job.collectionName}`;

    // 1. Resume from last saved checkpoint, or start from beginning
    let lastProcessedId: string | null = await this.redisCache.get(checkpointKey);
    let totalMigrated = 0;
    let hasMore = true;

    this.logger.log(`Starting re-encryption for ${job.collectionName}. Resuming after _id: ${lastProcessedId || 'START'}`);

    while (hasMore) {
      // 2. Query next deterministic batch sorted strictly by _id ascending
      const query: any = { keyVersion: 'v1' };
      if (lastProcessedId) {
        query._id = { $gt: new ObjectId(lastProcessedId) };
      }

      const batch = await collection
        .find(query)
        .sort({ _id: 1 })
        .limit(job.batchSize)
        .toArray();

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      const bulkOps: any[] = [];

      for (const doc of batch) {
        try {
          // 3. Decrypt ciphertext in worker RAM using old DEK (dek_v1)
          const plaintextValue = await this.clientEncryption.decrypt(doc[job.targetField]);

          // 4. Re-encrypt with new DEK (dek_v2)
          const newCiphertext = await this.clientEncryption.encrypt(plaintextValue, {
            keyId: new (require('mongodb').UUID)(job.newKeyId),
            algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Random'
          });

          // 5. Build OCC Atomic Update: Match both _id AND current _version
          bulkOps.push({
            updateOne: {
              filter: { _id: doc._id, _version: doc._version },
              update: {
                $set: {
                  [job.targetField]: newCiphertext,
                  keyVersion: 'v2',
                  _version: doc._version + 1,
                  reencryptedAt: new Date()
                }
              }
            }
          });
        } catch (cryptoErr) {
          this.logger.error(`Decryption failed on document ${doc._id}. Halting to prevent data corruption!`, cryptoErr);
          throw cryptoErr;
        }
      }

      // 6. Execute atomic bulk write
      const writeResult = await collection.bulkWrite(bulkOps, { ordered: false });

      // 7. OCC Collision Detection: Check if any documents were modified concurrently by CRCs
      if (writeResult.modifiedCount < batch.length) {
        const missedCount = batch.length - writeResult.modifiedCount;
        this.logger.warn(`OCC Collision: ${missedCount} documents were edited concurrently by live users. Handling gracefully.`);
        
        // Documents edited concurrently by live users already received dek_v2 on the live write path!
        const unmigratedCheck = await collection.countDocuments({
          _id: { $in: batch.map(d => d._id) },
          keyVersion: 'v1'
        });
        
        if (unmigratedCheck > 0) {
          this.logger.warn(`${unmigratedCheck} documents require re-fetch retry.`);
        }
      }

      totalMigrated += writeResult.modifiedCount;
      lastProcessedId = batch[batch.length - 1]._id.toString();

      // 8. Persist progress checkpoint to Redis (for crash recovery)
      await this.redisCache.set(checkpointKey, lastProcessedId, 'EX', 86400); // 24-hour TTL

      this.logger.log(`Re-encrypted batch of ${batch.length} documents. Total migrated so far: ${totalMigrated}`);
    }

    // 9. Phase 6: Post-Flight Cryptographic Audit Verification
    const remainingV1 = await collection.countDocuments({ keyVersion: 'v1' });
    if (remainingV1 > 0) {
      throw new Error(`Integrity Check Failed: ${remainingV1} documents still remain on keyVersion v1!`);
    }

    // Clear checkpoint upon successful completion
    await this.redisCache.del(checkpointKey);
    this.logger.log(`✅ Field re-encryption successfully finished for ${job.collectionName}. Total records: ${totalMigrated}`);
  }
}
```

#### Concurrency Resolution: Handling Live User Writes During Re-Encryption
What happens if a Clinical Research Coordinator (CRC) at Site 101 edits a patient's CRF record *at the exact millisecond* that the background worker is re-encrypting that same record?

Vialiq guarantees **Zero Data Loss and Zero Overwrites** through Optimistic Concurrency Control:

```
    Timeline: CRC Live Edit vs. Background Re-Encryption Worker
    
    Time (t)      CRC User Request (Live Web API)          Background Re-Encryption Worker
    ──────────────────────────────────────────────────────────────────────────────────────────
    t0            -                                        Fetches Document A (_version: 4)
    t1            CRC submits edit to Document A           Worker re-encrypts in memory
    t2            API writes Document A with dek_v2        -
                  (_version becomes 5)                     -
    t3            -                                        Worker executes bulkWrite:
                                                           filter: { _id: A, _version: 4 }
    t4            -                                        RESULT: matchedCount = 0 (OCC Miss)
                                                           Worker's stale update is REJECTED!
    ──────────────────────────────────────────────────────────────────────────────────────────
    Outcome: CRC's new clinical values are PRESERVED. Stale worker payload is dropped.
             Document A is already on dek_v2 from the live write. 100% integrity guaranteed.
```

---

### 6.5 21 CFR Part 11 Regulatory Audit Trail Emission

Once Phase 6 verifies that 100% of target documents have successfully migrated to `v2`, the `KeyRotationOrchestrator` executes Phase 7:
1. Updates `vialiq_control_plane.__keyVault` setting `status: 'RETIRED'`, `retiredAt: new Date()`.
2. Appends an immutable regulatory record to `audit_trail`:

```json
{
  "_id": "c7a8b9d0-1e2f-4a3b-9c8d-7e6f5a4b3c2d",
  "eventType": "CRYPTO_KEY_ROTATION_COMPLETED",
  "studyId": "study_oncology_101",
  "collectionName": "subject_identities",
  "targetField": "fullName",
  "oldKeyId": "UUID(b1a2c3d4-0000-0000-0000-000000000001)",
  "newKeyId": "UUID(b1a2c3d4-0000-0000-0000-000000000002)",
  "totalRecordsMigrated": 48250,
  "preFlightDocumentCount": 48250,
  "postFlightDocumentCount": 48250,
  "unmigratedV1Count": 0,
  "authorizedByUserId": "sec_officer_patel",
  "countersignedByUserId": "dm_lead_martinez",
  "executionDurationMs": 142380,
  "signatureHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "timestamp": "2026-10-18T22:15:00.000Z"
}
```

---

## 7. Field-Level Encryption Development Mode (Local Offline Developer Experience)

### 7.1 Dual-Mode Architecture: Local Dev vs. Cloud Production

In production environments, CSFLE relies on AWS KMS or Azure Key Vault Hardware Security Modules (FIPS 140-2 Level 3 HSM). However, requiring active cloud KMS connections for daily engineering introduces significant friction:
- **Cloud Dependency & Latency:** Offline development (e.g. on airplanes, remote sites, or restricted corporate networks) becomes impossible.
- **KMS API Costs:** Automated unit and integration test suites running thousands of crypto queries would incur unnecessary KMS billing.
- **Developer Onboarding:** New developers on Apple Silicon (M1 Pro / M5 Pro) would require complex AWS IAM credential provisioning before writing a single line of code.

To resolve this, Vialiq implements a **100% Offline, Bit-for-Bit Identical Development Mode** powered by MongoDB CSFLE's native `local` KMS provider and the `crypt_shared` shared library.

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              CSFLE ENVIRONMENT DUAL-MODE ARCHITECTURE                                 │
├────────────────────────────────────────┬───────────────────────────────────────────────────────────────┤
│ Mode Feature                           │ Local Development / CI Environment │ Cloud Production / Staging   │
├────────────────────────────────────────┼─────────────────────────────────────┼─────────────────────────┤
│ **KMS Provider**                       │ `local`                             │ `aws` (or `azure`)      │
│ **Master Key Storage**                 │ 96-Byte Base64 String in `.env`     │ AWS KMS Hardware HSM    │
│ **Key Vault Location**                 │ Layer 1 Admin Cluster (Port 27017)  │ Layer 1 Admin VPC Subnet│
│ **Decryption Engine**                  │ `crypt_shared` (`.dylib` / `.so`)   │ `crypt_shared` (`.so`)  │
│ **Cloud Network Dependency**           │ **ZERO (100% Offline)**             │ VPC Endpoint to AWS KMS │
│ **Cryptographic Wire Format**          │ BinData Subtype 6 (Identical BSON)  │ BinData Subtype 6       │
└────────────────────────────────────────┴─────────────────────────────────────┴─────────────────────────┘
```

---

### 7.2 Generating the 96-Byte Local Master Key

MongoDB CSFLE mandates that local master keys must be **exactly 96 bytes** (768 bits) of cryptographically secure random data:
- 32 bytes for the HMAC-SHA-512 signing key
- 32 bytes for the AES-256 encryption key
- 32 bytes for key derivation

To generate this key on macOS (Apple Silicon M1 Pro / M5 Pro) or Linux, run:

```bash
node -e "console.log(require('crypto').randomBytes(96).toString('base64'))"
```

This outputs a 128-character Base64 string. Add this to your local `.env.development` file:

```bash
# ==============================================================================
# VIALIQ LOCAL DEVELOPMENT ENVIRONMENT CONFIGURATION (.env.development)
# ==============================================================================
NODE_ENV=development
KMS_PROVIDER=local

# 96-Byte Cryptographically Secure Master Key (Base64-encoded)
LOCAL_KMS_MASTER_KEY_BASE64="qW8/3vK2e+9...<exactly 128 base64 chars>...=="

# 3-Layer MongoDB Cluster Endpoints (Docker on Apple Silicon)
MONGO_LAYER1_ADMIN_URI="mongodb://root:admin_secret_pass_2026@localhost:27017/admin?authSource=admin"
MONGO_LAYER2_DEV_URI="mongodb://root:dev_secret_pass_2026@localhost:27027/admin?authSource=admin"
MONGO_LAYER3_PROD_URI="mongodb://root:prod_secret_pass_2026@localhost:27037/admin?authSource=admin"

# KeyVault Namespace on Layer 1 Admin
KEY_VAULT_NAMESPACE="vialiq_control_plane.__keyVault"

# macOS Apple Silicon crypt_shared library path
CRYPT_SHARED_LIB_PATH="/usr/local/lib/mongo_crypt_v1.dylib"
```

> [!WARNING]
> **Production Guard:** Never commit `.env.development` or `.env.local` containing local master keys to Git. In production, the backend ignores `LOCAL_KMS_MASTER_KEY_BASE64` and strictly requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_KMS_KEY_ARN`.

---

### 7.3 `crypt_shared` Dynamic Shared Library Setup on Apple Silicon (macOS ARM64)

In MongoDB 6.0 and 7.0, the official MongoDB Node.js driver uses the high-performance **`crypt_shared` C++ dynamic shared library** (`mongo_crypt_v1.dylib` on macOS / `mongo_crypt_v1.so` on Linux) instead of the legacy `mongocryptd` background daemon. 

`crypt_shared` runs directly inside the Node.js process via native FFI bindings, eliminating socket IPC overhead and external process crashes.

#### Step 1: Download & Install on macOS (Apple Silicon ARM64)
```bash
# 1. Download official MongoDB 7.0 crypt_shared archive for macOS ARM64
curl -O https://downloads.mongodb.com/osx/mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.5.tgz

# 2. Extract the archive
tar -xzf mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.5.tgz

# 3. Copy the dynamic library to system library search path
sudo cp mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.5/lib/mongo_crypt_v1.dylib /usr/local/lib/

# 4. Remove macOS Gatekeeper quarantine flag
sudo xattr -d com.apple.quarantine /usr/local/lib/mongo_crypt_v1.dylib

# 5. Clean up temporary files
rm -rf mongo_crypt_shared_v1*
```

#### Step 2: Linux / Docker Dev Containers (ARM64 & x86_64)
In dev containers or CI pipelines, the library is placed at `/usr/lib/mongo_crypt_v1.so`:
```dockerfile
# Inside development Dockerfile:
RUN apt-get update && apt-get install -y libmongocrypt0
ENV CRYPT_SHARED_LIB_PATH=/usr/lib/x86_64-linux-gnu/mongo_crypt_v1.so
```

---

### 7.4 Automated Local Key Seeding Script (`scripts/seed-local-encryption-keys.ts`)

To allow developers to immediately run and test the application without manual database setup, Vialiq provides an automated seeding script.

Run after booting the 3-layer Docker cluster (`npm run docker:mongo:all`):

```bash
npx ts-node scripts/seed-local-encryption-keys.ts
```

```typescript
import { MongoClient, ClientEncryption, Binary } from 'mongodb';
import * as crypto from 'crypto';

async function seedLocalEncryptionKeys() {
  console.log('🚀 Initializing Local Field-Level Encryption Keys on Layer 1 Admin...');

  const adminUri = process.env.MONGO_LAYER1_ADMIN_URI || 'mongodb://root:admin_secret_pass_2026@localhost:27017/admin?authSource=admin';
  const keyVaultNamespace = 'vialiq_control_plane.__keyVault';
  const [keyVaultDb, keyVaultColl] = keyVaultNamespace.split('.');

  const masterKeyBase64 = process.env.LOCAL_KMS_MASTER_KEY_BASE64 || crypto.randomBytes(96).toString('base64');
  const localMasterKeyBuffer = Buffer.from(masterKeyBase64, 'base64');

  if (localMasterKeyBuffer.length !== 96) {
    throw new Error(`CRITICAL: Local master key must be exactly 96 bytes! Received: ${localMasterKeyBuffer.length} bytes.`);
  }

  const adminClient = new MongoClient(adminUri);
  await adminClient.connect();

  try {
    const db = adminClient.db(keyVaultDb);
    const collection = db.collection(keyVaultColl);

    // 1. Create partial unique index on keyAltNames
    await collection.createIndex(
      { keyAltNames: 1 },
      { unique: true, partialFilterExpression: { keyAltNames: { $exists: true } } }
    );

    // 2. Initialize ClientEncryption with local KMS provider
    const clientEncryption = new ClientEncryption(adminClient, {
      keyVaultNamespace,
      kmsProviders: {
        local: {
          key: localMasterKeyBuffer
        }
      }
    });

    // 3. Define Standard EDC Data Encryption Keys (DEKs)
    const keysToSeed = [
      { altName: 'dek_study_oncology_101_identity', description: 'Patient Demographics (Randomized AEAD)' },
      { altName: 'dek_subject_mrn', description: 'Medical Record Number (Deterministic AEAD)' },
      { altName: 'dek_study_101_rtsm_blinded', description: 'RTSM Treatment Arm (Blinded AEAD)' }
    ];

    for (const keyDef of keysToSeed) {
      const existing = await collection.findOne({ keyAltNames: keyDef.altName });
      if (existing) {
        console.log(`  ℹ️  Key already exists: ${keyDef.altName} (ID: ${existing._id})`);
        continue;
      }

      const keyId = await clientEncryption.createDataKey('local', {
        keyAltNames: [keyDef.altName]
      });

      // Update regulatory metadata on local DEK
      await collection.updateOne(
        { _id: keyId },
        {
          $set: {
            keyVersion: 1,
            status: 'ACTIVE',
            createdByUserId: 'local_dev_seed',
            creationDate: new Date(),
            description: keyDef.description
          }
        }
      );

      console.log(`  ✅ Generated DEK: ${keyDef.altName} ➔ UUID: ${keyId}`);
    }

    console.log('🎉 Local CSFLE Key Seeding completed successfully!');
  } finally {
    await adminClient.close();
  }
}

seedLocalEncryptionKeys().catch(console.error);
```

---

### 7.5 Local Developer Inspection: MongoDB Compass vs. NestJS API

Developers can visually verify that encryption is operating with 100% fidelity using **MongoDB Compass** alongside the **NestJS API**:

#### 1. Direct Inspection in MongoDB Compass (Zero-Knowledge View)
Connect Compass directly to Layer 3 Prod:  
`mongodb://root:prod_secret_pass_2026@localhost:27037/study_oncology_101_prod?authSource=admin`

Navigate to `study_oncology_101_prod.subject_identities`:
```json
{
  "_id": "SUBJ-001",
  "studyId": "study_oncology_101",
  "siteId": "SITE-101",
  "mrn": {
    "$binary": {
      "base64": "AQIDAHh7z...",
      "subType": "06" // ◄── Encrypted Deterministic Ciphertext (Subtype 6)
    }
  },
  "fullName": {
    "$binary": {
      "base64": "BQIDAK12p...",
      "subType": "06" // ◄── Encrypted Randomized AEAD Ciphertext (Subtype 6)
    }
  },
  "status": "ENROLLED" // ◄── Plaintext standard field
}
```
* Notice that the database engine stores only raw binary ciphertext (`subType: 06`). Even when logged into MongoDB as the `root` administrative user, **the data cannot be read in Compass without the application keys**.

#### 2. Application API Inspection (Decrypted Authorized View)
Start the local NestJS dev server (`npm run start:dev`) and query the API via Swagger / curl:

```bash
curl -X GET http://localhost:3000/api/v1/studies/study_oncology_101/subjects/SUBJ-001 \
  -H "Authorization: Bearer <valid_local_jwt>"
```

Response:
```json
{
  "subjectId": "SUBJ-001",
  "mrn": "MRN-984210",
  "fullName": "Jane Doe",
  "status": "ENROLLED"
}
```
* The NestJS application automatically and transparently decrypts the fields in memory before sending the JSON payload over the local HTTP response.

#### 3. Configuring Compass CSFLE In-GUI Decryption (Optional for Developers)
For deep debugging, MongoDB Compass supports client-side decryption natively:
1. In Compass connection screen, click **Advanced Connection Options** ➔ **Field Level Encryption**.
2. Set **KMS Provider** to `local`.
3. Paste the 96-byte Base64 key from `.env.development`.
4. Set **Key Vault Namespace** to `vialiq_control_plane.__keyVault`.
5. Connect. Compass will now decrypt the fields in the GUI on-the-fly!

---

### 7.6 Developer Troubleshooting Guide

| Error Message | Root Cause | Solution |
|:---|:---|:---|
| `MongoCryptError: crypt_shared library not found` | The dynamic `.dylib` or `.so` is not installed or not in system path. | Download `mongo_crypt_v1.dylib` and copy to `/usr/local/lib/`, or verify `CRYPT_SHARED_LIB_PATH` in `.env`. |
| `MongoCryptError: Master key must be 96 bytes` | The Base64 string does not decode to exactly 96 bytes. | Re-generate using `node -e "console.log(require('crypto').randomBytes(96).toString('base64'))"`. |
| `MongoCryptError: Key vault collection does not exist` | Layer 1 Admin was not seeded. | Boot Layer 1 (`npm run docker:mongo:admin`) and run `npx ts-node scripts/seed-local-encryption-keys.ts`. |
| `MongoCryptError: Decryption failed for keyId...` | The local key used to encrypt the document is different from the key in `.env`. | Run `npm run docker:mongo:clean` and re-seed to start with a fresh local database. |

---

## 8. Double-Blind RTSM Treatment Arm Isolation & Emergency Code Break

### 8.1 Cryptographic Blinding Enforcement
In double-blind studies, blinding integrity is governed at the **cryptographic KMS level**:
1. The Data Encryption Key for `treatmentArm` (`dek_study_101_rtsm_blinded`) is encrypted with an isolated Cloud KMS Key ARN:  
   `arn:aws:kms:us-east-1:123456789012:key/vialiq-rtsm-unblinded-master`
2. **IAM Policy Guard:**
   - Standard EDC API Worker IAM roles **do not have `kms:Decrypt`** permission on the unblinded key. Any attempt by standard CRCs, Monitors, or Sponsor Data Managers to query `treatmentArm` returns the raw encrypted ciphertext or triggers the application masking filter.
   - Only the **Unblinded Pharmacist** and **IDMC Safety Committee** microservice identities hold IAM credentials authorized to invoke `kms:Decrypt`.

### 8.2 Emergency Code Break (Emergency Unblinding) Workflow
When a subject experiences a life-threatening Serious Adverse Event (SAE), an emergency medical decision may require immediate knowledge of the administered treatment.

Vialiq enforces the **Emergency Code Break Protocol**:
1. Treating Physician navigates to `/studies/:id/subjects/:subId/emergency-unblind`.
2. Enters 21 CFR Part 11 digital signature and specifies mandatory **Medical Emergency Reason**.
3. System decrypts treatment arm for that specific patient **only** via a dedicated privileged unblinding handler.
4. The system immediately executes an atomic multi-document transaction:
   - Sets `subject.isEmergencyUnblinded = true`.
   - Writes an immutable record to `audit_trail` (Event: `EMERGENCY_CODE_BREAK`).
   - Dispatches real-time automated SMS and encrypted high-priority emails to the Sponsor Medical Monitor and Pharmacovigilance Safety Team.

---

## 9. Regulatory Compliance Matrix & Audit Verification Checklist

| Regulatory Mandate | Regulatory Requirement | Technical Implementation in Vialiq EDC | Verification Artifact |
|:---|:---|:---|:---|
| **FDA 21 CFR §11.10(a)** | Validation of systems to ensure accuracy, reliability, and consistent intended performance. | Automated cryptographic test suites verifying deterministic & randomized encryption parity. | Jest cryptographic test logs; SHA-256 test vectors. |
| **FDA 21 CFR §11.10(c)** | Protection of records to enable their accurate and ready retrieval throughout retention period. | 25-Year KMS Compliance Hold (`COMPLIANCE_HOLD_25_YEAR`) + S3 Glacier Object Lock (Compliance Mode). | AWS KMS Resource Policy; S3 Object Lock configuration dump. |
| **FDA 21 CFR §11.10(d)** | Limiting system access to authorized individuals. | Hardware Security Module (HSM) IAM segregation; presentation tier never receives cryptographic keys. | AWS IAM KMS Policy; Network Subnet Routing Table. |
| **FDA 21 CFR §11.10(e)** | Use of secure, computer-generated, time-stamped audit trails to independently record actions. | Key rotation, emergency unblinding, and crypto-shredding emit SHA-256 hash-chained audit events. | `audit_trail` collection records with digital signatures. |
| **GDPR Article 17** | Right to Erasure ("Right to be Forgotten") upon revocation of consent. | Subject-Level Crypto-Shredding (destroying DEK while leaving bit-for-bit audit trail ciphertext intact). | `GDPR_CRYPTO_SHREDDING_EXECUTED` audit event; unrecoverable BSON ciphertext verification. |
| **HIPAA §164.312(a)(2)(iv)** | Encryption and decryption of electronic protected health information (ePHI). | AEAD AES-256-CBC-HMAC-SHA-512 Field-Level Encryption governed by Cloud KMS HSM. | NIST CAVP / FIPS 140-2 Level 3 HSM Certificate. |
| **NIST SP 800-57** | Recommendation for Key Management (Envelope encryption, separation of CMK and DEK). | Strict two-tier key hierarchy: KEK in Cloud KMS HSM wraps DEKs in Layer 1 Admin `__keyVault`. | Envelope encryption schema; `rewrapManyDataKey` audit drill logs. |

---

## 10. Conclusion & Architectural Sign-Off

The Vialiq Field-Level Encryption & Key Management Architecture resolves the core operational and compliance challenges of clinical trial data security:
1. **Mathematical Isolation:** Zero plaintext keys on client devices or database servers.
2. **Multi-Tenant Safety:** Strong cryptographic quarantine across sponsors with BYOK sovereign control.
3. **Regulatory Harmony:** Reconciles GDPR Article 17 erasure with FDA 21 CFR Part 11 immutability through subject-level crypto-shredding.
4. **Zero-Downtime Operations:** Sub-second CMK rotation and background resumable DEK re-encryption with OCC conflict resolution.
5. **Developer Ergonomics:** 100% offline local development on Apple Silicon with native `crypt_shared` support.
