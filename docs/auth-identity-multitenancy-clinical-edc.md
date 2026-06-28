# Authentication, Authorization, MFA, AD Integration, Multi-Tenancy & Audit Compliance
## Clinical EDC SaaS Platform — Deep Architecture Analysis

**Date:** 31 May 2026
**Status:** DISCUSSION DOCUMENT — Pre-Finalization
**Scope:** Auth, AuthZ, MFA, Active Directory, Multi-Tenancy, Identity Server, Audit Compliance
**Clinical Context:** Electronic Data Capture (EDC) for Phase I–IV Clinical Trials
**Regulatory Context:** 21 CFR Part 11, GDPR, HIPAA, ICH E6(R3), EMA Annex 11

---

## Table of Contents

1. [The Hard Question First — What Is Our Clinical Trust Model?](#1-the-hard-question-first)
2. [Multi-Tenancy: The Most Critical Decision](#2-multi-tenancy)
3. [GDPR, HIPAA & Data Protection Analysis](#3-gdpr-hipaa-data-protection)
4. [Identity Server: Should We Use One? Which One?](#4-identity-server)
5. [Authentication Architecture](#5-authentication)
6. [Authorization: RBAC vs ABAC — Clinical Context](#6-authorization)
7. [MFA: Strategy, Types, Configuration](#7-mfa)
8. [Active Directory Integration — Per-Client](#8-active-directory)
9. [Audit Compliance: 21 CFR Part 11 Deep Dive](#9-audit-compliance-21-cfr-part-11)
10. [Electronic Signatures — Clinical Standard](#10-electronic-signatures)
11. [Clinical Roles & Permission Matrix](#11-clinical-roles)
12. [Implementation Architecture](#12-implementation-architecture)
13. [Security Threat Analysis — OWASP Top 10 in Clinical Context](#13-security-threats)
14. [Technology Stack Decision](#14-technology-stack)
15. [Implementation Timeline & Phasing](#15-timeline)
16. [Open Questions for Discussion](#16-open-questions)
17. [Final Recommendations](#17-final-recommendations)

---

## 1. The Hard Question First — What Is Our Clinical Trust Model?

Before diving into technology choices, we must understand **who our users are** and **what they are doing**. Clinical trials are not typical SaaS applications.

### 1.1 Why This Is Different From Regular SaaS

| Dimension | Regular SaaS | Clinical EDC SaaS |
|-----------|-------------|-------------------|
| **Data sensitivity** | Business data | Patient health data (PII + PHI) |
| **Data corruption risk** | Data loss | Incorrect treatment, patient harm, invalid trial |
| **Regulatory inspection** | Rare | FDA, EMA, competent authorities inspect systems |
| **User accountability** | Nice to have | **Mandatory** — persons sign with legal accountability |
| **Audit trail** | Useful | **Required by law** (21 CFR Part 11, ICH E6) |
| **Data modification** | Normal | Must be documented with reason and timestamp |
| **Multi-client isolation** | Performance concern | **Regulatory requirement** — sponsor data isolation |
| **Authentication failure** | UX problem | Could mean patient data accessed by wrong person |
| **GDPR breach** | Fine | Fine + trial invalidation + regulatory action |

### 1.2 Who Accesses the System?

```
┌─────────────────────────────────────────────────────┐
│               CLINICAL TRIAL ECOSYSTEM              │
├─────────────────────────────────────────────────────┤
│ PHARMA COMPANY (Sponsor)                           │
│   ├── Sponsor Admin         (manages study config)  │
│   ├── Clinical Data Manager (CDM)                  │
│   ├── Biostatistician       (analysis, unblinded?)  │
│   ├── Medical Monitor       (safety review)         │
│   └── Quality Assurance     (audit, read-only)      │
├─────────────────────────────────────────────────────┤
│ CONTRACT RESEARCH ORG (CRO) — may act as Sponsor   │
│   ├── CRO Project Manager                          │
│   ├── CRA / Monitor         (site monitoring)       │
│   └── Data Coordinator                             │
├─────────────────────────────────────────────────────┤
│ INVESTIGATIVE SITE (Hospital/Clinic)               │
│   ├── Principal Investigator (PI)   [signs data]   │
│   ├── Sub-Investigator              [signs data]    │
│   ├── Clinical Research Coordinator (CRC)          │
│   ├── Site Staff / Data Entry                      │
│   └── Site Pharmacist                              │
├─────────────────────────────────────────────────────┤
│ OUR PLATFORM (EDC Vendor)                          │
│   ├── Super Admin           (system management)    │
│   ├── Support Engineer      (limited data access)  │
│   └── [NO ACCESS to clinical data unless audited]  │
└─────────────────────────────────────────────────────┘
```

### 1.3 Key Clinical Trust Rules (These Drive All Architecture Decisions)

1. **Data Isolation**: Sponsor A CANNOT see Sponsor B's trial data. Ever.
2. **Site Isolation**: Site A staff can ONLY see patients enrolled at their site.
3. **Accountability**: Every action must be traceable to a named, authenticated individual.
4. **Data Integrity**: Modified data must show original value, new value, who changed it, when, and WHY.
5. **Electronic Signatures**: PI must sign data with multi-factor confirmation.
6. **Blinding**: Biostatisticians may be blinded — their access must be controlled per trial phase.
7. **Monitor Access**: CRAs can view (not modify) all sites they are assigned to monitor.
8. **Regulatory Authority Access**: FDA/EMA may request read-only access post-trial.

---

## 2. Multi-Tenancy: The Most Critical Decision

### 2.1 The Three Models — Deep Analysis

```
MODEL A: SHARED EVERYTHING (Single Cluster, Single DB, Tenant ID column)
┌────────────────────────────────────┐
│     MongoDB Atlas Cluster          │
│  ┌────────────────────────────┐   │
│  │  shared_database           │   │
│  │  ├── subjects {tenantId}   │   │
│  │  ├── forms {tenantId}      │   │
│  │  └── audit_log {tenantId}  │   │
│  └────────────────────────────┘   │
└────────────────────────────────────┘

MODEL B: SHARED CLUSTER, SEPARATE DATABASES (Per-Client Database)
┌────────────────────────────────────────────────────┐
│           MongoDB Atlas Cluster                    │
│  ┌──────────────┐  ┌──────────────┐              │
│  │ client_A_db  │  │ client_B_db  │  ...         │
│  │ ├── subjects │  │ ├── subjects │              │
│  │ ├── forms    │  │ ├── forms    │              │
│  │ └── audit    │  │ └── audit    │              │
│  └──────────────┘  └──────────────┘              │
└────────────────────────────────────────────────────┘

MODEL C: SEPARATE CLUSTERS (Full Physical Isolation)
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Cluster A   │  │  Cluster B   │  │  Cluster C   │
│ (Client A)   │  │ (Client B)   │  │ (Client C)   │
│ Own region   │  │ Own region   │  │ Own region   │
└──────────────┘  └──────────────┘  └──────────────┘
```

### 2.2 Compliance Analysis — The Truth Table

| Requirement | Model A | Model B | Model C |
|-------------|---------|---------|---------|
| **GDPR Art. 25** (data protection by design) | ⚠️ Risky | ✅ Good | ✅ Best |
| **GDPR Art. 32** (appropriate security measures) | ⚠️ Risk if bug | ✅ Good | ✅ Best |
| **GDPR Art. 17** (right to erasure — per client) | Complex | ✅ Drop database | ✅ Delete cluster |
| **21 CFR Part 11** (audit trail per sponsor) | Complex | ✅ Per database | ✅ Per cluster |
| **HIPAA PHI isolation** | ⚠️ Risky | ✅ Compliant | ✅ Best |
| **Sponsor data confidentiality** | ⚠️ Bug risk | ✅ Strong | ✅ Strongest |
| **FDA inspection (audit access per sponsor)** | Complex | ✅ Per database | ✅ Per cluster |
| **ICH E6(R3) — data integrity per trial** | Risk | ✅ Good | ✅ Best |
| **Data residency (EU vs US)** | Complex | ✅ Per client region | ✅ Per client region |
| **Cost (MVP, <10 clients)** | ✅ $0 | ✅ ~$57/month | ❌ ~$180/client |
| **Cost (production, 50 clients)** | ✅ Cheapest | ✅ $57/month shared | ⚠️ $9,000/month |
| **Development complexity** | Complex (always filter) | ✅ Simple | ✅ Simplest |
| **Risk of data leak (code bug)** | HIGH (missed tenantId) | Low | None |
| **Backup per client** | Complex | ✅ Per database | ✅ Per cluster |

### 2.3 Why Model A (Shared DB) Is DANGEROUS for Clinical Trials

```typescript
// THE DEADLY BUG — Happens in real applications
// Developer forgets tenantId filter in ONE query
const subjects = await db.collection('subjects').find({
  studyId: studyId
  // OOPS! forgot: tenantId: req.user.tenantId
}).toArray();

// Result: Sponsor A accidentally sees Sponsor B's patient data
// Clinical consequence: Potential GDPR breach, regulatory action, trial invalidation
// This is not hypothetical — it has happened to Medidata, Oracle Health Sciences
```

**Real-world incidents with shared-DB clinical systems:**
- Missing row-level security filters exposing cross-tenant data
- SQL injection bypassing tenant isolation
- Cache poisoning returning wrong tenant's data
- Misconfigured background jobs processing all tenants' data

### 2.4 ✅ DECISION: Dual-Mode Tenancy — Model C Default, Model B Optional

**Both models are supported. Model C (dedicated cluster per client) is the default.**

```
MODEL C — DEFAULT (Dedicated Cluster Per Client):
  - Each client gets their own MongoDB Atlas cluster
  - Full physical isolation — strongest regulatory position
  - EU clients → EU-region Atlas cluster (GDPR data residency by default)
  - US clients → US-region Atlas cluster (HIPAA BAA with MongoDB)
  - Right to erasure = delete the entire cluster (unambiguous, clean)
  - FDA inspection answer: "complete physical separation between clients"
  - Cost: $180-540/month per client (passed through in subscription pricing)
  - Provisioned via Atlas Admin API at client onboarding time

MODEL B — OPTIONAL (Shared Cluster, Separate Databases):
  - Available for: pilot clients, POC engagements, internal/demo tenants
  - Clients who explicitly waive physical isolation in writing
  - Academic sites with minimal data volume or early-phase trials
  - Still provides logical isolation (separate database, zero risk of
    "forgot tenantId" bugs — wrong database = connection error)
  - Cost: shared platform M10 cluster ($57/month shared among Model B clients)

UPGRADE PATH (Model B → Model C):
  - mongodump from shared cluster → mongorestore to dedicated cluster
  - Zero application code change — only connection string changes
  - Can be triggered at any time (enterprise contract, regulatory requirement)
```

**Implementation Pattern — Dual-Mode Connection Manager:**

```typescript
// connection-manager.ts — dual-mode tenancy support
// Model C: connect to client's own dedicated Atlas cluster
// Model B: connect to shared cluster, client's database

class TenantConnectionManager {
  private connections = new Map<string, mongoose.Connection>();

  async getConnection(tenantId: string): Promise<mongoose.Connection> {
    if (!this.connections.has(tenantId)) {
      const config = await this.getTenantConfig(tenantId);
      
      let conn: mongoose.Connection;
      if (config.isolationMode === 'dedicated-cluster') {
        // Model C default: client has their own cluster URI
        conn = await mongoose.createConnection(config.clusterUri!);
      } else {
        // Model B: shared cluster, per-client database
        conn = await mongoose.createConnection(
          process.env.SHARED_CLUSTER_URI! + `/${config.databaseName}`
        );
      }
      
      this.connections.set(tenantId, conn);
    }
    return this.connections.get(tenantId)!;
  }
}

// middleware/tenant-context.ts
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const tenantId = req.user?.tenantId; // from JWT claims
  
  if (!tenantId) {
    return res.status(403).json({ error: 'No tenant context' });
  }
  
  // Attach tenant-specific DB connection to request
  // Works identically for Model B and Model C — calling code is unaware
  req.db = await connectionManager.getConnection(tenantId);
  next();
};

// routes/subjects.ts — tenant isolation is AUTOMATIC regardless of mode
// Model C: different cluster → impossible to access another tenant's data
// Model B: different database → wrong database = data not found
const subjects = await req.db.collection('subjects').find({
  studyId: studyId  // No tenantId needed — already isolated!
}).toArray();
```

### 2.5 Multi-Tenancy for Identity — Separate Keycloak Realms

```
Keycloak Server
├── Realm: platform-admin      (our internal admin users)
├── Realm: client-a-pharma     (PharmaCo A's users)
│   ├── AD Federation: ad.pharmaco-a.com (LDAP)
│   ├── MFA: Required for all
│   └── Roles: specific to their studies
├── Realm: client-b-cro        (CRO B's users)
│   ├── AD Federation: None (username/password)
│   ├── MFA: Optional (opt-in)
│   └── Roles: specific to their studies
└── Realm: client-c-academic   (University C)
    ├── AD Federation: Shibboleth/SAML (university IdP)
    ├── MFA: Required for PI, Optional for others
    └── Roles: specific to their studies
```

**Each Keycloak Realm provides:**
- Complete isolation of user identities
- Separate AD/LDAP configuration per client
- Separate MFA policies per client
- Separate session management
- Separate token signing keys

---

## 3. GDPR, HIPAA & Data Protection Analysis

### 3.1 GDPR Key Articles — Impact on EDC Architecture

#### Article 5 — Principles of Data Processing
```
(f) processed in a manner that ensures appropriate security of the personal data, 
including protection against unauthorised or unlawful processing and against 
accidental loss, destruction or damage, using appropriate technical or 
organisational measures ('integrity and confidentiality')
```

**EDC Implementation Requirements:**
- Encryption at rest (MongoDB Atlas automatic encryption + KMIP)
- Encryption in transit (TLS 1.2+, certificate pinning)
- Access control (our auth system)
- Audit logging (who accessed what, when)
- Pseudonymization of patient data where possible

#### Article 25 — Data Protection by Design and by Default
```
Implement appropriate technical and organisational measures designed to 
implement data-protection principles in an effective manner and to integrate 
the necessary safeguards into the processing.
```

**EDC Architecture Implications:**
```
✅ Separate database per tenant (physical isolation by design)
✅ Separate Keycloak realm per tenant (identity isolation by design)
✅ Default deny — users have NO access until explicitly granted
✅ Minimum data collection — don't store unnecessary patient identifiers
✅ Pseudonymization — use Subject Number (not name) as primary identifier
✅ Data minimization — role-based: CRAs only see data they need to monitor
```

#### Article 30 — Records of Processing Activities
```
Each controller shall maintain a record of processing activities:
- purposes of processing
- categories of data subjects and personal data
- recipients
- transfers to third countries
- retention periods
- security measures
```

**EDC Requirements:**
- Processing register per client (sponsor)
- Documented data flows
- Transfer mechanisms for EU → US data (Standard Contractual Clauses)
- Retention policy documentation

#### Article 32 — Security of Processing
```
Taking into account the state of the art, implement measures including:
(a) pseudonymisation and encryption
(b) ability to ensure confidentiality, integrity, availability
(c) ability to restore availability in case of incident
(d) process for testing security measures
```

**EDC Implementation:**
```yaml
Pseudonymization:
  - Patient identified by Subject Number (SBJ-001, SBJ-002)
  - Subject Screening Number mapped to Subject Number in secure mapping table
  - PI only knows the full name; CRAs see only Subject Number
  - Biostatistician NEVER sees identifiable information

Encryption:
  - At rest: MongoDB Atlas encryption (AES-256)
  - In transit: TLS 1.3
  - Application-level: sensitive fields encrypted with client-specific keys
  - Key management: AWS KMS / Azure Key Vault per client

Availability:
  - MongoDB Atlas M10+: 99.95% SLA
  - Multi-region backups (point-in-time recovery)
  - Auto-scaling

Security Testing:
  - Annual penetration testing (required for FDA 21 CFR Part 11)
  - OWASP security scanning in CI/CD
  - Dependency vulnerability scanning
```

#### Article 33-34 — Breach Notification
**72-hour notification requirement after discovering a breach.**

**EDC Requirements:**
- Incident detection capability (monitoring, alerting)
- Incident response procedure (documented SOP)
- Client notification process
- Regulatory authority notification (GDPR supervisory authority)
- ICH E6(R3) requires sponsor notification for data integrity issues

#### Article 35 — Data Protection Impact Assessment (DPIA)
**REQUIRED** for clinical trial data processing (high-risk processing of health data).

```
DPIA Requirements:
1. Systematic description of processing
2. Assessment of necessity and proportionality
3. Assessment of risks to data subjects
4. Measures to address risks

Must be documented BEFORE launching the platform.
DPO (Data Protection Officer) involvement required if we process EU data at scale.
```

### 3.2 HIPAA Requirements — US Clinical Trials

```
§ 164.312(a) — Access Controls
  ✅ Unique user identification (no shared logins — 21 CFR Part 11 too)
  ✅ Emergency access procedure (break-glass access)
  ✅ Automatic logoff (configurable per client)
  ✅ Encryption/decryption of ePHI at rest

§ 164.312(b) — Audit Controls
  ✅ Hardware, software, procedural mechanisms to record access to ePHI
  ✅ WHO + WHAT + WHEN + HOW (all actions logged)

§ 164.312(c) — Integrity
  ✅ Electronic mechanisms to confirm ePHI has not been altered
  ✅ Checksums/hashing for audit trail records

§ 164.312(d) — Person Authentication
  ✅ Verify the identity before accessing ePHI
  ✅ MFA recommended (NIST 800-63-3)

§ 164.312(e) — Transmission Security
  ✅ Encryption of ePHI in transit
  ✅ TLS 1.2+ minimum
```

**Business Associate Agreement (BAA) Required:**
- MongoDB Atlas: Offers HIPAA BAA for M10+ clusters ✅
- Keycloak (self-hosted): We control — BAA with cloud provider ✅
- Auth0: HIPAA BAA available (enterprise tier) — expensive
- AWS Cognito: HIPAA eligible ✅

### 3.3 Data Residency — Critical for EU Clients

```
EU Clinical Trial Clients:
  - Patient data MUST remain in EU/EEA
  - MongoDB Atlas EU cluster (Frankfurt: eu-central-1 or Ireland: eu-west-1)
  - Keycloak hosted in EU
  - No cross-border transfer without Standard Contractual Clauses

US Clinical Trial Clients:
  - Patient data in US (us-east-1 or us-west-2)
  - HIPAA BAA required

Global Studies (multi-region):
  - Standard Contractual Clauses for EU → US transfers
  - Consider data localization: each site's data stays in their region
  - Complex but sometimes required by local regulations
```

### 3.4 GDPR Assessment — Our Multi-Tenancy Model

```
QUESTION: Does our platform need a multi-tenant assessment?

ANSWER: YES. Under GDPR:
- We are the DATA PROCESSOR for each pharma client (DATA CONTROLLER)
- We need a Data Processing Agreement (DPA) with each client
- We must implement technical measures demonstrating GDPR compliance
- Model B (separate databases) makes this much easier:
  - Each client's data is physically separate
  - Data export for one client doesn't risk exposing others
  - Right to erasure: drop the database + delete Keycloak realm
  - Data portability: export one database without touching others
  - Audit for one client: one database, clean scope
```

---

## 4. Identity Server: Should We Use One? Which One?

### 4.1 The Core Question — Build vs Buy vs Use Open Source

```
OPTIONS:
A) Build our own auth system (JWT + bcrypt + custom MFA)
B) Use managed service (Auth0, Azure AD B2C, AWS Cognito, Okta)
C) Use open source Identity Server (Keycloak, IdentityServer/Duende)
D) Use library in our API (Passport.js, next-auth)
```

### 4.2 Why NOT Build Our Own

**Never build your own authentication system for clinical applications.**

```
Reasons:
1. Auth is a specialty — crypto, session management, timing attacks
2. 21 CFR Part 11 §11.10(g): Authority checks must be validated
3. OWASP A7: Identification and Authentication Failures is #7 most common
4. MFA implementation is complex (TOTP, backup codes, recovery flows)
5. AD/LDAP federation is complex (multiple vendor quirks)
6. Session management vulnerabilities are common
7. Regulatory inspectors will challenge your auth implementation
8. Time: 6+ months to build properly vs 2 weeks with Keycloak

The FDA and EMA expect industry-standard identity solutions.
Custom auth is a red flag during regulatory inspection.
```

### 4.3 Identity Server Options — Detailed Comparison

#### Option 1: Keycloak (RECOMMENDED ⭐)

```yaml
Provider: Red Hat / Open Source (Apache License 2.0)
Type: Self-hosted Identity and Access Management
Maturity: Production-grade since 2014, v26.6 (2026)

Capabilities:
  Authentication:
    - Username + Password ✅
    - Social Login (Google, Microsoft, GitHub) ✅
    - SAML 2.0 ✅
    - OpenID Connect 1.0 ✅
    - Kerberos ✅
    - X.509 Certificates ✅
    - WebAuthn / FIDO2 (Passkeys) ✅
    
  MFA:
    - TOTP (Google Authenticator, FreeOTP) ✅
    - WebAuthn hardware tokens (YubiKey) ✅
    - Recovery codes ✅
    - Email OTP ✅ (via custom SPI)
    - SMS OTP ✅ (via custom SPI, but avoid for PHI)
    
  Federation:
    - LDAP / Active Directory ✅ (per realm = per client)
    - Azure AD (OIDC/SAML) ✅
    - On-premises AD (LDAP) ✅
    - Any SAML 2.0 IdP ✅
    - Any OIDC 1.0 IdP ✅
    
  Multi-tenancy:
    - Realms = perfect per-client isolation ✅
    - Separate config per realm ✅
    - Separate users per realm ✅
    - Separate AD per realm ✅
    - Separate MFA policy per realm ✅
    
  Clinical Compliance:
    - Audit logs for all auth events ✅
    - Brute force detection ✅
    - Session revocation ✅
    - Token introspection ✅
    - Fine-grained permissions ✅
    
  Step-up Authentication (21 CFR Part 11):
    - Level of Authentication (LoA) mapping ✅
    - Require re-authentication for sensitive ops ✅
    - ACR claims in tokens ✅
    
Cost:
  - Self-hosted: FREE (open source)
  - Red Hat SSO (enterprise support): ~$100/month
  - Cloud provider hosting (EKS/GKE): ~$50-200/month
  
Cons:
  - Requires operational expertise to run
  - Updates require testing
  - Self-hosted = we manage uptime
  
VERDICT: Best choice for clinical EDC startup
  ✅ Free
  ✅ Full control (important for regulatory validation)
  ✅ Per-realm AD configuration matches our per-client AD requirement
  ✅ Step-up auth for electronic signatures (21 CFR Part 11)
  ✅ Full audit trail
  ✅ Used by healthcare organizations worldwide
  ✅ FAPI 1.0 (Financial-grade API) profile available
```

#### Option 2: Auth0 (Okta)

```yaml
Provider: Okta (Auth0)
Type: Managed cloud service
Pricing: Complex, based on MAU

Cost Analysis:
  Free tier: 7,500 MAU (adequate for MVP)
  B2B Essential: $800/month (enterprise features)
  B2B Professional: $2,700/month (custom domains, unlimited orgs)
  Enterprise: Custom pricing ($20,000+/year)
  
  For 50 clients × 50 users = 2,500 MAU:
  B2B Professional: $2,700/month = $32,400/year

Capabilities:
  - Organizations feature (for multi-tenancy) ✅ but recent (2021)
  - AD/LDAP integration ✅ (enterprise tier only)
  - MFA ✅
  - Machine-to-machine ✅
  
Clinical Compliance Issues:
  ❌ HIPAA BAA only at enterprise tier ($$$)
  ❌ SOC 2 Type II (yes) but FDA 21 CFR Part 11 validation unclear
  ❌ Data stored on Auth0 servers — harder to validate for FDA
  ❌ Vendor lock-in risk
  ⚠️ Auth0 Organizations feature is relatively new (2021)
  
Step-up Authentication: ✅ (but limited customization)

VERDICT: Good for consumer apps, not ideal for clinical EDC
  - Expensive at scale
  - Less control for regulatory validation
  - HIPAA BAA expensive
  - Better for non-clinical SaaS
```

#### Option 3: Azure Active Directory B2C

```yaml
Provider: Microsoft Azure
Type: Managed cloud service
Pricing: Free 50,000 MAU, then $0.00016/authentication

Cost Analysis:
  50 clients × 50 users × 20 logins/month = 50,000 auth/month = FREE!
  Even at 500,000 auths/month = $80/month = very cheap

Capabilities:
  - Microsoft ecosystem fit (if clients use M365) ✅
  - Azure AD federation ✅ (native, best in class for Azure AD clients)
  - SAML 2.0 ✅ (as SP, limited as IdP broker)
  - TOTP MFA ✅
  - Custom policies (Identity Experience Framework) ✅ but very complex XML
  
Multi-tenancy:
  - Azure AD B2C tenants = per-client tenant possible
  - But: expensive to manage 50 separate B2C tenants
  - Better: Single B2C tenant with custom claims for our tenants

Clinical Compliance:
  ✅ HIPAA eligible
  ✅ SOC 2 Type II
  ✅ ISO 27001
  ⚠️ 21 CFR Part 11 validation — less common than Keycloak in clinical
  
Step-up Authentication: ✅ (via custom policies)

VERDICT: Good if your clients are Microsoft shops
  - Cheapest at scale (nearly free)
  - Best Azure AD integration
  - Complex custom policies (XML hell)
  - Better for B2B Microsoft-heavy environments
  - Consider as complement to Keycloak for Azure AD federation
```

#### Option 4: AWS Cognito

```yaml
Provider: Amazon Web Services
Type: Managed cloud service
Pricing: Free 50,000 MAU, then $0.0055/MAU

Cost Analysis:
  50 clients × 50 users = 2,500 MAU = FREE
  500 clients × 100 users = 50,000 MAU = FREE
  
Capabilities:
  - User Pools (built-in user management) ✅
  - Identity Pools (federated identities) ✅
  - TOTP MFA ✅
  - SAML 2.0 federation ✅ (limited)
  - OIDC federation ✅
  
Multi-tenancy:
  - User Pools per client: possible but operational overhead
  - Single pool with custom attributes: feasible but limited isolation
  
Clinical Compliance Issues:
  ✅ HIPAA eligible (BAA available)
  ❌ Limited SAML capabilities in free tier
  ❌ No LDAP/AD federation (must use SAML or OIDC from AD FS)
  ❌ Limited step-up authentication
  ❌ Limited audit trail compared to Keycloak
  ❌ Less customizable than Keycloak
  
VERDICT: Good for simple AWS-native applications
  - Not ideal for complex clinical EDC requirements
  - AD integration is cumbersome
  - Limited step-up auth for 21 CFR Part 11 signing
```

#### Option 5: Duende IdentityServer (.NET)

```yaml
Provider: Duende Software
Type: Open source / Commercial .NET library
Pricing: 
  - Free for open source / startups under $1M revenue
  - Business: $1,500/year
  - Enterprise: $4,000/year

Capabilities:
  - Full OIDC/OAuth2 server ✅
  - FAPI 1.0 compliant ✅
  - Custom implementations ✅
  
Cons:
  - .NET only — requires .NET backend
  - Must build everything yourself (UI, MFA, AD integration)
  - No built-in multi-tenancy
  - Significant development time

VERDICT: Only if already using .NET stack
  - Not appropriate for Node.js/TypeScript stack
```

### 4.4 Identity Server Decision Matrix

| Requirement | Keycloak ⭐ | Auth0 | Azure AD B2C | AWS Cognito |
|-------------|-----------|-------|--------------|-------------|
| Per-client AD support | ✅ Per realm | ✅ Enterprise | ✅ Per tenant | ⚠️ Complex |
| MFA configurable | ✅ Per realm | ✅ | ✅ | ✅ |
| TOTP support | ✅ | ✅ | ✅ | ✅ |
| Step-up auth (21 CFR Part 11) | ✅ Built-in | ✅ Limited | ✅ Complex | ❌ |
| Multi-tenancy isolation | ✅ Realms | ✅ Organizations | ⚠️ Single B2C | ⚠️ |
| HIPAA BAA | ✅ Self-hosted | 💰 Enterprise | ✅ | ✅ |
| GDPR data control | ✅ Full | ⚠️ Vendor | ⚠️ Vendor | ⚠️ Vendor |
| 21 CFR Part 11 validation | ✅ Easier | ⚠️ | ⚠️ | ❌ |
| Audit trail quality | ✅ Excellent | ✅ Good | ✅ Good | ⚠️ Basic |
| Custom auth flows | ✅ SPI | ✅ Actions | ✅ Policies | ✅ Triggers |
| Cost (50 clients, 3yr) | ~$5,400 | ~$97,200 | ~$100 | ~$0-100 |
| Vendor lock-in | ✅ None | ❌ High | ❌ High | ❌ Medium |
| Operational burden | ⚠️ Self-hosted | ✅ Managed | ✅ Managed | ✅ Managed |

### 4.5 ⭐ VERDICT: Keycloak

**Primary recommendation: Keycloak (self-hosted on Kubernetes)**

**Reasons:**
1. **Regulatory control** — We self-host → we validate → FDA is comfortable
2. **Per-realm AD** — One realm per client, AD configured per realm (exactly what you asked for)
3. **Cost** — Free vs $32K+/year for Auth0 at scale
4. **Multi-tenant by design** — Realms ARE multi-tenancy
5. **Step-up auth** — Built-in LoA (Level of Authentication) for electronic signatures
6. **MFA policy per client** — Each realm has its own MFA settings
7. **No vendor lock-in** — Industry-standard OIDC/SAML tokens, migrate anytime
8. **Healthcare track record** — Used by NHS, German healthcare, academic medical centers

**Hosting:**
```yaml
MVP (Month 1-6):
  - Keycloak on single Docker container (Fly.io or Railway)
  - PostgreSQL backend (Supabase free tier)
  - Cost: ~$10-30/month

Production (Month 7+):
  - Keycloak on Kubernetes (AWS EKS or GCP GKE)
  - High availability (3 replicas minimum)
  - PostgreSQL on AWS RDS (Multi-AZ for HA)
  - Cost: ~$150-300/month

Enterprise (Year 2+):
  - Separate Keycloak instance per region (EU, US, APAC)
  - Each region: 3+ replicas, dedicated PostgreSQL
  - Cost: ~$500-1,500/month
```

---

## 5. Authentication Architecture

### 5.1 Authentication Flow — Standard User Login

```
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│    Browser    │    │   EDC Backend    │    │   Keycloak       │
│   (React)    │    │   (Node.js API)  │    │   (Auth Server)  │
└──────────────┘    └──────────────────┘    └──────────────────┘
       │                                            │
       │  1. Click "Login"                          │
       │─────────────────────────────────────────►│
       │                                            │
       │  2. Redirect to Keycloak login page       │
       │◄────────────────────────────────────────── │
       │                                            │
       │  3. Enter username + password              │
       │─────────────────────────────────────────►│
       │                                            │
       │  4. If MFA enabled: enter TOTP code       │
       │─────────────────────────────────────────►│
       │                                            │
       │  5. Authorization Code returned           │
       │◄────────────────────────────────────────── │
       │                                            │
       │  6. Exchange code for tokens              │
       │──────────────────────────────►│            │
       │                               │─────────►│
       │                               │  POST /token
       │                               │◄──────────│
       │                               │  access_token, refresh_token
       │◄──────────────────────────────│
       │  7. JWT tokens stored in memory (no cookies for PHI)
```

### 5.2 JWT Token Structure — Clinical EDC Claims

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "realm-key-id"
  },
  "payload": {
    "iss": "https://auth.edcplatform.com/realms/client-a-pharma",
    "sub": "user-uuid-here",
    "aud": ["edc-api", "edc-frontend"],
    "exp": 1748721600,
    "iat": 1748718000,
    "auth_time": 1748718000,
    "acr": "2",                          // Level of Authentication (2 = MFA)
    "amr": ["pwd", "otp"],               // Authentication Methods Reference
    
    "realm_access": {
      "roles": ["CRA", "offline_access"]
    },
    "resource_access": {
      "edc-api": {
        "roles": ["CRA"]
      }
    },
    
    // CLINICAL CUSTOM CLAIMS
    "tenantId": "client-a-pharma",        // For DB routing
    "tenantName": "PharmaCo A",
    "userId": "dr-jane-smith-uuid",
    "userFullName": "Dr. Jane Smith",     // For audit trail (do not use username)
    "userRole": "CRA",
    "studyAccess": ["STUDY-001", "STUDY-003"],     // Explicit study access
    "siteAccess": ["SITE-101", "SITE-102"],         // Sites this CRA monitors
    "blinded": false,                     // Is this user blinded for this study?
    "canSign": false,                     // Can perform electronic signatures?
    "mfaVerified": true,                  // MFA was used in this session
    "sessionId": "session-uuid",          // For audit trail session tracking
    "ipAddress": "192.168.1.1"            // At auth time (for audit)
  }
}
```

### 5.3 Token Security — Clinical Standard

```typescript
// token-config.ts
export const tokenConfig = {
  // Short-lived access tokens (clinical security requirement)
  accessTokenLifetime: 15 * 60,       // 15 minutes (not 1 hour)
  refreshTokenLifetime: 8 * 60 * 60,  // 8 hours (one work day)
  
  // Force re-authentication after idle (21 CFR Part 11 requirement)
  sessionIdleTimeout: 30 * 60,        // 30 minutes idle logout
  
  // For electronic signatures: require explicit re-authentication
  // Not just "has valid token" but "re-authenticated within X minutes"
  signatureAuthMaxAge: 5 * 60,        // 5 minutes (acr_values max_age)
  
  // Token storage: NEVER localStorage (XSS risk for PHI)
  // Use: in-memory store in React + httpOnly secure cookie for refresh
  tokenStorage: 'memory',
  
  // PKCE required (prevents authorization code interception)
  pkceRequired: true,
  
  // Algorithm: RS256 (asymmetric — can verify without secret)
  signingAlgorithm: 'RS256',
};
```

### 5.4 Session Management — Clinical Requirements

```typescript
// session-management.ts

// 21 CFR Part 11 §11.10(d): Limiting system access to authorized individuals
// Implement automatic session termination

interface SessionPolicy {
  idleTimeout: number;       // Auto-logout after inactivity
  absoluteTimeout: number;   // Force logout regardless of activity
  requireReauthForSign: boolean; // Re-auth before electronic signature
  concurrentSessionsAllowed: number; // 1 = no concurrent logins
}

const clinicalSessionPolicy: SessionPolicy = {
  idleTimeout: 30 * 60,          // 30 minutes (configurable per client)
  absoluteTimeout: 12 * 60 * 60, // 12 hours absolute max
  requireReauthForSign: true,     // MANDATORY for 21 CFR Part 11
  concurrentSessionsAllowed: 1    // One active session per user
                                  // (prevents shared credentials)
};

// Keycloak configuration in Admin Console:
// Realm Settings > Sessions:
// SSO Session Idle: 30 minutes
// SSO Session Max: 12 hours
// Login timeout: 5 minutes
```

---

## 6. Authorization: RBAC vs ABAC — Clinical Context

### 6.1 Why Pure RBAC Fails for Clinical EDC

```
PROBLEM: A CRA named "John Smith" has role "CRA".
But in a clinical trial:
  - John monitors STUDY-001, Sites 101 and 102 ONLY
  - John does NOT monitor STUDY-002
  - John CANNOT see STUDY-001's Site 103 data
  - John can VIEW data but CANNOT modify it
  - John can VERIFY data but cannot sign off as PI

Pure RBAC: Give John "CRA" role → he can see ALL sites, ALL studies
WRONG! This violates ICH E6(R3) and GDPR data minimization.

SOLUTION: Hierarchical RBAC + Study/Site-level assignments
```

### 6.2 Authorization Model — Hierarchical RBAC with Study Context

```
LEVEL 1: SYSTEM ROLES (Keycloak realm roles)
┌─────────────────────────────────────────────┐
│ super_admin     — Platform administration   │
│ tenant_admin    — Client org admin          │
│ study_creator   — Can create studies        │
│ user_manager    — Can manage users          │
└─────────────────────────────────────────────┘

LEVEL 2: STUDY ROLES (assigned per study in our DB)
┌─────────────────────────────────────────────┐
│ study_sponsor_lead    — Full study access   │
│ data_manager          — Can manage eCRF     │
│ medical_monitor       — Safety data access  │
│ biostatistician_blind — Blinded access      │
│ biostatistician_unblind — Unblinded access  │
│ qa_auditor            — Read-only audit     │
└─────────────────────────────────────────────┘

LEVEL 3: SITE ROLES (assigned per study, per site)
┌─────────────────────────────────────────────┐
│ principal_investigator — Can sign data      │
│ sub_investigator       — Can sign data      │
│ crc                    — Data entry         │
│ site_staff             — Limited data entry │
│ cra_monitor            — Read + verify      │
└─────────────────────────────────────────────┘
```

### 6.3 Permission Model — MongoDB Schema

```typescript
// models/user-study-access.ts
interface UserStudyAccess {
  userId: string;
  studyId: string;
  tenantId: string;
  
  studyRole: 'sponsor_lead' | 'data_manager' | 'medical_monitor' | 
             'biostatistician' | 'qa_auditor';
  
  siteAccess: Array<{
    siteId: string;
    siteRole: 'pi' | 'sub_i' | 'crc' | 'site_staff' | 'cra';
    canViewSubjects: boolean;
    canEnterData: boolean;
    canVerifyData: boolean;
    canSignData: boolean;     // PI/Sub-I only (21 CFR Part 11)
    canLockData: boolean;     // Data manager only
    canUnlockData: boolean;   // Data manager only
    canQueryData: boolean;    // CRA and data manager
    canResolveQuery: boolean; // CRC and data manager
    canViewSAE: boolean;      // Serious Adverse Events (controlled)
    isBlinded: boolean;       // Biostatistician blinding
  }>;
  
  activeFrom: Date;
  activeTo?: Date;
  grantedBy: string;
  grantedAt: Date;
}
```

### 6.4 Authorization Middleware — Clinical Guard

```typescript
// middleware/clinical-authorization.ts

export const requireStudyAccess = (
  requiredPermission: keyof SiteAccess
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { studyId, siteId } = req.params;
    const userId = req.user.userId;
    
    // Get user's access for this study + site
    const access = await db.collection('user_study_access').findOne({
      userId,
      studyId,
      tenantId: req.user.tenantId, // Tenant isolation guaranteed by DB context
      'siteAccess.siteId': siteId,
      activeFrom: { $lte: new Date() },
      $or: [{ activeTo: null }, { activeTo: { $gte: new Date() } }]
    });
    
    if (!access) {
      // Audit unauthorized access attempt
      await auditLog(req, 'UNAUTHORIZED_ACCESS_ATTEMPT', {
        studyId, siteId, requiredPermission
      });
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'NO_STUDY_SITE_ACCESS'
      });
    }
    
    const siteAccess = access.siteAccess.find(s => s.siteId === siteId);
    
    if (!siteAccess?.[requiredPermission]) {
      await auditLog(req, 'INSUFFICIENT_PERMISSIONS', {
        studyId, siteId, requiredPermission,
        userHas: Object.keys(siteAccess || {}).filter(k => siteAccess?.[k] === true)
      });
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'PERMISSION_DENIED'
      });
    }
    
    // Inject access context for downstream use
    req.studyAccess = siteAccess;
    next();
  };
};

// Usage in routes:
router.put('/studies/:studyId/sites/:siteId/subjects/:subjectId/forms/:formId',
  requireStudyAccess('canEnterData'),
  updateFormData
);

router.post('/studies/:studyId/sites/:siteId/subjects/:subjectId/forms/:formId/sign',
  requireStudyAccess('canSignData'),
  requireRecentAuthentication(5 * 60), // Must have re-authed in last 5 min
  signFormData
);
```

### 6.5 OWASP Recommendation: ABAC vs RBAC in Clinical Context

Based on OWASP Authorization Cheat Sheet research:
> *"ABAC should typically be preferred for application development... supports fine-grained Boolean logic... RBAC is poorly suited for multi-tenant environments"*

**Our Hybrid Approach:**
- **RBAC at system level** (Keycloak roles): Simple, validated, maintainable
- **Attribute-based at study level**: Study role + site assignment + permissions
- **ReBAC at subject level**: User has relationship to specific site → can see subjects at that site

This gives us ABAC power with RBAC simplicity.

---

## 7. MFA: Strategy, Types, Configuration

### 7.1 MFA Decision Framework for Clinical EDC

```
NIST SP 800-63-3 (US Standard):
  Assurance Level 1 (AAL1): Password only
  Assurance Level 2 (AAL2): MFA required
  Assurance Level 3 (AAL3): Hardware key + biometric

21 CFR Part 11 Implication:
  - Electronic signatures require TWO distinct components:
    §11.200(a)(1): identification code (username/password)
    §11.200(a)(2): password — BUT it says "at least two distinct components"
    
  INTERPRETATION: MFA satisfies §11.200(a) better than password-only
  Best practice: MFA = username + password + TOTP for signing actions

ICH E6(R3) Implication:
  - Requires unique identification and accountability
  - MFA dramatically reduces unauthorized access risk
  - GCP inspectors will view MFA favorably
```

### 7.2 MFA Policy — By Role ✅ DECIDED

```
DEFAULT PLATFORM POLICY: MFA is OPT-IN (client controls their own MFA policy)

  - Each Keycloak realm has its own MFA policy configuration
  - Enterprise pharma clients can require MFA for ALL their users in their realm
  - Academic / small CRO clients can leave MFA optional for data entry roles
  - AD-federated users: defer entirely to their corporate AD MFA (no double-prompt)

PLATFORM HARD REQUIREMENT (non-negotiable, cannot be disabled by any client):
  Signing roles MUST have MFA for signing actions (step-up authentication)
  This is 21 CFR Part 11 §11.200 compliance — not a configuration option.

┌───────────────────────────────────────────────────────────────────┐
│ ROLE                   │ REGULAR LOGIN    │ SIGNING ACTION        │
├───────────────────────────────────────────────────────────────────┤
│ Super Admin            │ REQUIRED MFA     │ REQUIRED MFA          │
│ Tenant Admin           │ REQUIRED MFA     │ REQUIRED MFA          │
│ Data Manager           │ REQUIRED MFA     │ REQUIRED MFA          │
│ Principal Investigator │ REQUIRED MFA     │ REQUIRED MFA (Part 11)│
│ Sub-Investigator       │ REQUIRED MFA     │ REQUIRED MFA (Part 11)│
│ CRA/Monitor            │ CLIENT POLICY*   │ N/A (read/review only)│
│ Biostatistician        │ CLIENT POLICY*   │ N/A                   │
│ CRC (Data Entry)       │ CLIENT POLICY*   │ N/A                   │
│ Site Staff             │ CLIENT POLICY*   │ N/A                   │
│ QA Auditor             │ CLIENT POLICY*   │ N/A                   │
└───────────────────────────────────────────────────────────────────┘

* CLIENT POLICY = the client configures their own Keycloak realm:
  - REQUIRE MFA for all (enterprise pharma, high-security sites)
  - OPT-IN MFA (default — user chooses to enroll or not)
  - AD-managed MFA only (defer entirely to AD, no Keycloak MFA prompt)
```

### 7.3 MFA Types — Clinical Assessment

#### TOTP (Time-based One-Time Password) — RECOMMENDED ✅

```yaml
App: Google Authenticator, FreeOTP, Microsoft Authenticator, Authy
Standard: RFC 6238 (TOTP), RFC 4226 (HOTP)
Code: 6-digit, valid 30 seconds

Pros:
  - Free for users (app on their phone)
  - Works offline (no network needed)
  - Standard: any TOTP app works
  - Resistant to replay attacks (time-based)
  - NIST SP 800-63-3: AAL2 compliant ✅
  - No SMS infrastructure (no cost, no SIM-swap risk)

Cons:
  - User must have phone with them
  - If phone lost, recovery process needed

Implementation (Keycloak):
  - Built-in TOTP support ✅
  - QR code enrollment ✅
  - Recovery codes ✅
  - Admin can reset/re-enroll
```

#### SMS OTP — NOT RECOMMENDED for Clinical ❌

```yaml
OWASP MFA Cheat Sheet (2026) states:
  "Do not use SMS for high-value or PII-handling applications"
  "NIST SP 800-63B designates SMS and PSTN-delivered codes as a 
   RESTRICTED AUTHENTICATOR because of SS7 interception, SIM-swap, 
   and number-porting attacks"

Clinical Risk:
  - Patient health data (PHI) at risk via SIM-swap
  - SMS interception exposes clinical data access
  - If PI's number SIM-swapped → attacker can sign clinical data
  - REGULATORY RISK: FDA/EMA may flag SMS as insufficient for Part 11

VERDICT: Do NOT use SMS MFA for clinical data signing
  May offer as backup for non-signing actions if requested by client
  MUST document risk acceptance if used
```

#### WebAuthn / FIDO2 / Passkeys — FUTURE RECOMMENDED ✅

```yaml
Standard: W3C WebAuthn, FIDO2
Devices: YubiKey, Touch ID, Face ID, Windows Hello
2026 Status: Increasingly adopted in healthcare

Pros:
  - Phishing-resistant (private key never leaves device)
  - Biometric (fingerprint/face) for convenience
  - No codes to type
  - NIST SP 800-63-3: AAL3 capable with hardware key
  - FDA moving toward FIDO2 in new guidance

Cons:
  - Requires compatible device
  - Setup slightly complex for non-technical users
  - Hardware keys (YubiKey): cost ($25-50/device)

Clinical Fit:
  - Excellent for PI/investigators (high accountability)
  - Hospital workstations may support Windows Hello
  - Future-proof for FDA electronic signature requirements

Keycloak Support: ✅ Built-in WebAuthn (v26+)
```

#### Email OTP — BACKUP ONLY ⚠️

```yaml
Use: Recovery when TOTP unavailable (lost phone)
NOT for primary authentication
Risk: If email compromised → bypasses MFA

Implementation:
  - User requests email OTP to registered email
  - One-time use, expires in 10 minutes
  - Used ONLY for MFA recovery, not daily auth
  - Log event, notify user of recovery action
```

### 7.4 MFA Enrollment Flow — Clinical UX

```
First Login:
1. User logs in with username + password
2. Keycloak shows: "Your account requires MFA setup"
3. User scans QR code with Google Authenticator
4. User enters 6-digit code to verify
5. System shows 8 backup recovery codes
6. User confirms they have saved recovery codes
7. MFA enrollment complete — logged in

Subsequent Logins:
1. Username + password
2. TOTP prompt: "Enter 6-digit code from your authenticator app"
3. Enter code → logged in

For Electronic Signatures (step-up):
1. User is already logged in
2. User clicks "Sign and Lock" on a CRF
3. Keycloak step-up: "Re-authentication required for signing"
4. User enters password + TOTP (even if MFA already used at login)
5. Signature recorded with: user identity + timestamp + acr=2
```

### 7.5 MFA Configuration in Keycloak — Per Realm (Per Client)

```json
// Keycloak Realm Policy — Exported Config
{
  "realm": "client-a-pharma",
  "otpPolicyType": "totp",
  "otpPolicyAlgorithm": "HmacSHA256",
  "otpPolicyInitialCounter": 0,
  "otpPolicyDigits": 6,
  "otpPolicyLookAheadWindow": 1,
  "otpPolicyPeriod": 30,
  "otpPolicyCodeReusable": false,
  
  "browserSecurityHeaders": {
    "contentSecurityPolicy": "frame-src 'self'; frame-ancestors 'self';"
  },
  
  "bruteForceProtected": true,
  "failureFactor": 5,          // Lock after 5 failures
  "waitIncrementSeconds": 30,
  "maxFailureWaitSeconds": 900,
  
  // Session policy
  "ssoSessionIdleTimeout": 1800,    // 30 min idle
  "ssoSessionMaxLifespan": 43200,   // 12 hours max
  
  // MFA required for all users in this realm:
  "requiredActions": ["CONFIGURE_TOTP"]
}
```

---

## 8. Active Directory Integration — Per-Client ✅ DECIDED: LDAP First, Azure AD Second

### 8.1 Why Per-Client AD Is Critical

Large pharma companies (e.g., Pfizer, Novartis, GSK) have:
- Corporate Active Directory with 50,000+ users
- IT policy: ALL external SaaS must federate with corporate AD
- Users should NOT have separate EDC passwords
- AD-managed MFA (Microsoft Authenticator) should be sufficient

Small CROs and academic sites:
- No AD — use username/password
- May want to configure AD later
- Should not require AD to get started

**Our Solution: AD configurable at client level (Keycloak realm)**

**DECISION (June 2026): Build on-premises LDAP federation first.** Academic medical centers and hospital sites are the primary early clients. Azure AD (Microsoft Entra ID) federation follows as the second implementation milestone, covering pharma/CRO clients.

```
BUILD ORDER:
  Phase 1 (MVP):      Username/password (no AD) — for clients without AD
  Phase 2 (Month 4):  On-premises LDAP / Active Directory (hospital sites, academia)
  Phase 3 (Month 6):  Azure AD / Microsoft Entra ID OIDC (pharma, CRO)
  Future:             Shibboleth/SAML for university IdPs
```

### 8.2 AD Federation Patterns

#### Pattern A: On-Premises LDAP / Active Directory — BUILT FIRST

```
Hospital / Academic Medical Center (on-premises AD)
         │
         │ LDAP / LDAPS (port 636 for TLS)
         ▼
    Keycloak Realm (client-a-hospital)
         │
         │ OIDC
         ▼
    Clinical EDC Platform
```

```typescript
// Keycloak LDAP Provider Config (via Admin API)
const ldapConfig = {
  providerId: 'ldap',
  name: 'Hospital-X-AD',
  config: {
    connectionUrl: 'ldaps://ad.hospitalx.com:636',
    bindDn: 'CN=keycloak-svc,OU=Service Accounts,DC=hospitalx,DC=com',
    bindCredential: '{{vault:hospitalx-ldap-password}}',
    usersDn: 'OU=Users,DC=hospitalx,DC=com',
    userObjectClasses: 'person,organizationalPerson,user',
    uuidLDAPAttribute: 'objectGUID',
    usernameLDAPAttribute: 'sAMAccountName',
    editMode: 'READ_ONLY',        // Don't write back to hospital AD
    syncRegistrations: false,
    importEnabled: true,
    
    // Sync settings
    fullSyncPeriod: 3600,         // Full sync every hour
    changedSyncPeriod: 300,       // Changed users every 5 min
    
    // MSAD specific
    vendor: 'ad',
    useTruststoreSpi: 'always',
  }
};
```

**User Login Flow with On-Premises AD:**
1. User visits EDC → clicks "Hospital X Corporate Login"
2. Keycloak authenticates against hospital LDAP (Kerberos or password bind)
3. Keycloak maps AD attributes to EDC user profile
4. Keycloak issues EDC access token with clinical claims
5. User is in — no separate EDC password needed

**MFA with On-Premises AD:**
- Hospital AD MFA (e.g., RSA SecurID, Duo) handled before LDAP bind
- Keycloak can require additional TOTP if hospital AD doesn't enforce MFA
- Configurable per realm: trust AD MFA or add TOTP layer

#### Pattern B: Azure Active Directory (Microsoft Entra ID) — BUILT SECOND

```
PharmaCo A (Azure AD / Microsoft Entra ID)
         │
         │ OIDC (OpenID Connect)
         ▼
    Keycloak Realm (client-a-pharma)
         │
         │ OIDC
         ▼
    EDC Application
```

```typescript
// Keycloak Identity Provider Config (via Admin API)
const azureAdIdpConfig = {
  alias: 'azure-ad-pharmaco-a',
  displayName: 'PharmaCo A Corporate Login',
  providerId: 'oidc',
  enabled: true,
  config: {
    authorizationUrl: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/authorize`,
    tokenUrl: `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
    clientId: CLIENT_ID,            // Registered in Azure AD
    clientSecret: CLIENT_SECRET,    // Stored in Keycloak vault
    defaultScope: 'openid profile email',
    syncMode: 'INHERIT',
    validateSignature: true,
    useJwksUrl: true,
    jwksUrl: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
  }
};
```

**User Login Flow with Azure AD:**
1. User visits EDC → clicks "PharmaCo A Corporate Login"
2. Redirected to Microsoft login (with existing corporate session = SSO)
3. Azure AD issues OIDC token to Keycloak
4. Keycloak maps Azure AD claims to EDC user attributes
5. Keycloak issues EDC access token
6. User is in — no separate EDC password needed

**MFA with Azure AD:**
- If Azure AD enforces MFA (Conditional Access) → Keycloak skips additional MFA
- If Azure AD doesn't enforce MFA → Keycloak can require additional TOTP
- Configurable per realm

#### Pattern C: No AD (Username + Password)

```
Small CRO / Academic Site:
  - Keycloak manages user accounts directly
  - Email invitation → user sets password
  - Optional TOTP enrollment (client's MFA policy applies)
  - No AD dependency
```

### 8.3 AD Attribute Mapping — Clinical Context

```typescript
// Map AD attributes to EDC user profile
const ldapMappers = [
  {
    name: 'username',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': 'sAMAccountName',
      'user.model.attribute': 'username',
    }
  },
  {
    name: 'email',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': 'mail',
      'user.model.attribute': 'email',
    }
  },
  {
    name: 'fullName',
    providerId: 'full-name-ldap-mapper',
    config: {
      'ldap.attribute': 'displayName',
    }
  },
  {
    name: 'department',
    providerId: 'user-attribute-ldap-mapper',
    config: {
      'ldap.attribute': 'department',
      'user.model.attribute': 'department',
    }
  },
  // Map AD groups to Keycloak roles
  {
    name: 'groups',
    providerId: 'group-ldap-mapper',
    config: {
      'groups.dn': 'OU=EDC-Groups,DC=pharmaco,DC=com',
      'membership.ldap.attribute': 'member',
      'mode': 'READ_ONLY',
    }
  }
];
```

### 8.4 AD Configuration — Client Onboarding Process

```
Client Onboarding Steps for AD Integration:

1. Client provides:
   ├── AD type (Azure AD / On-premises LDAP / ADFS)
   ├── Azure AD: Tenant ID + Client ID + Client Secret
   ├── On-premises: LDAP URL + Service Account credentials
   └── Attribute mapping preferences

2. We configure in Keycloak Admin:
   ├── Create new Realm for client
   ├── Configure LDAP/OIDC Identity Provider
   ├── Test connectivity
   ├── Map attributes
   └── Configure MFA policy (client decides: required or optional)

3. Client tests with their AD users

4. Go-live: Users login with corporate credentials

5. Ongoing:
   ├── AD password changes automatically reflected (LDAP)
   ├── User deactivation in AD → deactivated in EDC (sync)
   └── New users added in AD → can access EDC (if provisioned)
```

---

## 9. Audit Compliance: 21 CFR Part 11 Deep Dive

### 9.1 What 21 CFR Part 11 Actually Requires

The FDA guidance (2003, still current) focuses enforcement on:

```
§11.10 Controls for Closed Systems — ENFORCED:
  (a) Validation                    ← Computer system validation (CSV)
  (b) Accurate copies               ← Ability to export audit data
  (c) Record protection             ← Data retention
  (d) System access limits          ← Authentication + authorization
  (e) Audit trails                  ← WHO, WHAT, WHEN, WHY
  (f) Operational system checks     ← System enforces permitted sequences
  (g) Authority checks              ← Only authorized users act
  (h) Device checks                 ← Source verification
  (i) Personnel training            ← SOPs + training records
  (j) Written policies              ← SOPs exist
  (k) Controls for data distribution ← Export security

§11.50 Signature Manifestations     ← ENFORCED
  ├── Printed name of signer
  ├── Date and time of signature
  └── Meaning of signature (e.g., "approved", "reviewed")

§11.70 Signature/Record Linking     ← ENFORCED
  └── Signature linked to record — cannot be copied/forged

§11.100 General Electronic Signature Rules  ← ENFORCED
  ├── Unique to one individual
  ├── Not reused or reassigned
  └── Verified identity before issuance

§11.200 Electronic Signature Components  ← ENFORCED
  ├── At least TWO distinct components:
  │   ├── Identification code (username)
  │   └── Password (+ we add TOTP for best practice)
  └── Used in combination
```

### 9.2 Audit Trail Architecture — Immutable Event Log

```typescript
// models/audit-log.ts

interface ClinicalAuditEvent {
  // Immutable identifier
  _id: ObjectId;                    // Never updated
  eventId: string;                  // UUID
  
  // WHEN
  timestamp: Date;                  // UTC timestamp (microsecond precision)
  timezone: string;                 // User's local timezone (display only)
  
  // WHO — "The individual who performed the action" (21 CFR Part 11)
  userId: string;                   // Internal user ID
  userFullName: string;             // Legal name (not username)
  userRole: string;                 // Role at time of action
  userEmail: string;                // For identification
  sessionId: string;                // Session identifier
  ipAddress: string;                // Network source
  userAgent: string;                // Browser/device
  
  // WHAT
  eventType: AuditEventType;        // See enum below
  entityType: string;               // 'Subject', 'Form', 'Field', 'Study'
  entityId: string;                 // ID of the modified entity
  
  // DATA CHANGE (field-level audit for clinical data)
  field?: string;                   // Which field changed
  oldValue?: unknown;               // Previous value
  newValue?: unknown;               // New value
  
  // WHY (required for clinical data modifications)
  reason?: string;                  // Mandatory for data changes
  reasonCode?: string;              // Controlled vocabulary: CORRECTION, TRANSCRIPTION_ERROR, etc.
  
  // CONTEXT
  studyId?: string;
  siteId?: string;
  subjectId?: string;
  formId?: string;
  visitId?: string;
  
  // SIGNATURE (for electronic signatures)
  signatureDetails?: {
    signingMeaning: string;         // "I certify this data is accurate"
    authenticationLevel: number;    // ACR level used (2 = MFA)
    authenticationMethods: string[]; // ['pwd', 'otp']
    keycloakSessionId: string;
    certificateThumbprint?: string;
  };
  
  // INTEGRITY
  eventHash: string;                // SHA-256 of event content (tamper detection)
  previousEventHash?: string;       // Chain hash (blockchain-like integrity)
  
  // Study context for this event
  tenantId: string;                 // Never null — tenant isolation
}

enum AuditEventType {
  // Authentication
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  MFA_SETUP = 'MFA_SETUP',
  MFA_BYPASS_ATTEMPT = 'MFA_BYPASS_ATTEMPT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  
  // Data Operations
  SUBJECT_ENROLLED = 'SUBJECT_ENROLLED',
  FORM_CREATED = 'FORM_CREATED',
  FORM_DATA_ENTERED = 'FORM_DATA_ENTERED',
  FORM_DATA_MODIFIED = 'FORM_DATA_MODIFIED',
  FORM_DATA_DELETED = 'FORM_DATA_DELETED',
  FORM_VERIFIED = 'FORM_VERIFIED',
  FORM_SIGNED = 'FORM_SIGNED',
  FORM_LOCKED = 'FORM_LOCKED',
  FORM_UNLOCKED = 'FORM_UNLOCKED',
  
  // Query Management
  QUERY_RAISED = 'QUERY_RAISED',
  QUERY_RESPONDED = 'QUERY_RESPONDED',
  QUERY_CLOSED = 'QUERY_CLOSED',
  
  // Safety
  SAE_REPORTED = 'SAE_REPORTED',
  SAE_UPDATED = 'SAE_UPDATED',
  
  // Administrative
  USER_CREATED = 'USER_CREATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  ROLE_REMOVED = 'ROLE_REMOVED',
  STUDY_ACCESS_GRANTED = 'STUDY_ACCESS_GRANTED',
  SITE_ACCESS_GRANTED = 'SITE_ACCESS_GRANTED',
  
  // Authorization Events
  UNAUTHORIZED_ACCESS_ATTEMPT = 'UNAUTHORIZED_ACCESS_ATTEMPT',
  DATA_EXPORTED = 'DATA_EXPORTED',
  AUDIT_REPORT_GENERATED = 'AUDIT_REPORT_GENERATED',
}
```

### 9.3 Audit Service Implementation

```typescript
// services/audit-service.ts

class AuditService {
  
  async logEvent(
    req: AuthenticatedRequest,
    eventType: AuditEventType,
    details: Partial<ClinicalAuditEvent>
  ): Promise<void> {
    
    // Get previous event hash for chain integrity
    const lastEvent = await req.db.collection('audit_log')
      .findOne({}, { sort: { timestamp: -1 } });
    
    const event: ClinicalAuditEvent = {
      _id: new ObjectId(),
      eventId: uuidv4(),
      timestamp: new Date(),
      timezone: req.user.timezone || 'UTC',
      
      userId: req.user.userId,
      userFullName: req.user.userFullName,
      userRole: req.user.userRole,
      userEmail: req.user.email,
      sessionId: req.user.sessionId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || 'unknown',
      
      eventType,
      tenantId: req.user.tenantId,
      
      ...details,
      
      // Compute hash AFTER merging all fields
      eventHash: '', // placeholder
      previousEventHash: lastEvent?.eventHash,
    };
    
    // Compute SHA-256 hash of entire event (before hash fields)
    const hashContent = JSON.stringify({
      ...event,
      eventHash: undefined,
      _id: event._id.toString()
    });
    event.eventHash = crypto
      .createHash('sha256')
      .update(hashContent)
      .digest('hex');
    
    // Insert ONCE — never update audit records
    await req.db.collection('audit_log').insertOne(event);
    
    // For critical security events, also write to separate immutable log
    if (CRITICAL_EVENTS.includes(eventType)) {
      await this.writeToCriticalLog(event);
    }
  }
  
  // Interceptor for ALL data modifications
  async logDataChange(
    req: AuthenticatedRequest,
    entity: { type: string; id: string; field: string },
    oldValue: unknown,
    newValue: unknown,
    reason: string  // MANDATORY for clinical data changes
  ): Promise<void> {
    
    if (!reason || reason.trim().length < 5) {
      throw new Error('Reason for data change is required (21 CFR Part 11)');
    }
    
    await this.logEvent(req, AuditEventType.FORM_DATA_MODIFIED, {
      entityType: entity.type,
      entityId: entity.id,
      field: entity.field,
      oldValue,
      newValue,
      reason: reason.trim(),
    });
  }
}
```

### 9.4 Audit Trail — What FDA Inspectors Look For

During an FDA inspection of an EDC system, inspectors will:

```
1. Request audit trail for a specific subject (e.g., Subject 001)
   → Must show: ALL data entered, modified, deleted with timestamps

2. Verify data integrity
   → Must show: original value AND modified value (not just current)
   → Must show: WHO changed it AND WHEN AND WHY

3. Check for unauthorized modifications
   → Filter by event type: FORM_DATA_MODIFIED after FORM_LOCKED
   → Should be empty (no changes after lock without unlock event)

4. Verify electronic signatures
   → Show signature events with signer identity and timestamp
   → Verify signature cannot be "copy-pasted" to another record

5. Check system access controls
   → Show who has access to each study/site
   → Show access grant history (who granted access, when)
   → Show if any access was inappropriate

6. Check for data exports
   → Show all DATA_EXPORTED events
   → Verify who exported and for what purpose
```

---

## 10. Electronic Signatures — Clinical Standard

### 10.1 What 21 CFR Part 11 §11.200 Requires

```
§11.200(a) Electronic signatures not based upon biometrics shall employ at least 
two distinct identification components such as an identification code and password.

§11.200(a)(1) When an individual executes a series of signings during a single, 
continuous period of controlled system access, the first signing shall be 
executed using all electronic signature components; subsequent signings shall 
be executed using at least one electronic signature component.

§11.200(a)(2) When an individual executes one or more signings not performed 
during a single, continuous period of controlled system access, each signing 
shall be executed using all electronic signature components.
```

**Clinical EDC Translation:**
```
First signature in a session:
  → Username + Password + TOTP (all three components)

Subsequent signatures in same session (within 30 min):
  → Password + TOTP (two components — user already identified)

New session (new login, or after idle timeout):
  → Username + Password + TOTP (all three — new controlled access period)
```

### 10.2 Electronic Signature Implementation

```typescript
// routes/signatures.ts

// Step 1: Request signing — shows what will be signed
router.get('/studies/:studyId/forms/:formId/signature-preview', 
  requireStudyAccess('canSignData'),
  async (req, res) => {
    const form = await getFormForSigning(req.params.formId);
    
    res.json({
      form,
      signingStatement: generateSigningStatement(form, req.user),
      requiresReAuth: true,
      // Keycloak challenge for re-auth
      keycloakChallenge: generateKeycloakChallenge(req.user.sessionId)
    });
  }
);

// Step 2: Execute signature (after step-up authentication)
router.post('/studies/:studyId/forms/:formId/sign',
  requireStudyAccess('canSignData'),
  requireStepUpAuthentication({
    minAcr: 2,           // Must have used MFA
    maxAge: 5 * 60,      // Re-authenticated within last 5 minutes
  }),
  async (req, res) => {
    const { signingMeaning, confirmationCode } = req.body;
    
    // Validate the signing statement was acknowledged
    if (!signingMeaning || !VALID_SIGNING_MEANINGS.includes(signingMeaning)) {
      return res.status(400).json({ error: 'Invalid signing meaning' });
    }
    
    // Hash the form content AT TIME OF SIGNING
    // This links the signature to the exact data signed (§11.70)
    const formContent = await getFormContent(req.params.formId);
    const contentHash = sha256(JSON.stringify(formContent));
    
    // Record the signature
    const signature = {
      formId: req.params.formId,
      signedBy: {
        userId: req.user.userId,
        userFullName: req.user.userFullName,
        userRole: req.user.userRole,
        userEmail: req.user.email,
      },
      signedAt: new Date(),
      signingMeaning,
      
      // §11.70 — Signature linked to record
      formContentHash: contentHash,
      formVersion: formContent.version,
      
      // Authentication evidence
      authenticationLevel: req.user.acr,
      authenticationMethods: req.user.amr,
      sessionId: req.user.sessionId,
      keycloakSessionRef: req.user.keycloakSessionId,
      
      // Immutable signature reference
      signatureId: uuidv4(),
    };
    
    await saveSignature(signature);
    
    // Audit the signing event
    await auditService.logEvent(req, AuditEventType.FORM_SIGNED, {
      entityType: 'Form',
      entityId: req.params.formId,
      studyId: req.params.studyId,
      signatureDetails: {
        signingMeaning,
        authenticationLevel: req.user.acr,
        authenticationMethods: req.user.amr,
        keycloakSessionId: req.user.sessionId,
      }
    });
    
    res.json({ success: true, signatureId: signature.signatureId });
  }
);

// Middleware: Step-up authentication check
const requireStepUpAuthentication = ({ minAcr, maxAge }) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tokenAcr = parseInt(req.user.acr || '0');
    const authTime = req.user.auth_time || 0;
    const timeSinceAuth = Math.floor(Date.now() / 1000) - authTime;
    
    if (tokenAcr < minAcr || timeSinceAuth > maxAge) {
      // Return challenge — frontend will trigger Keycloak step-up
      return res.status(401).json({
        error: 'STEP_UP_REQUIRED',
        required: { minAcr, maxAge },
        current: { acr: tokenAcr, timeSinceAuth },
        challengeUrl: `${KEYCLOAK_URL}/realms/${req.user.tenantId}/protocol/openid-connect/auth`
          + `?client_id=edc-frontend`
          + `&response_type=code`
          + `&scope=openid`
          + `&acr_values=${minAcr}`
          + `&max_age=${maxAge}`
          + `&prompt=login`
      });
    }
    
    next();
  };
};
```

### 10.3 Signing UI — What the User Sees

```
┌─────────────────────────────────────────────────────┐
│           ELECTRONIC SIGNATURE CONFIRMATION          │
│                                                     │
│  You are about to sign:                            │
│  Subject: SBJ-001  Visit: Week 12  Form: Vitals    │
│                                                     │
│  By signing, you confirm:                          │
│  ┌─────────────────────────────────────────────┐   │
│  │ "I certify that the information recorded    │   │
│  │  in this form is accurate and complete to  │   │
│  │  the best of my knowledge."                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Signatory: Dr. Jane Smith                         │
│  Role: Principal Investigator                       │
│  Date/Time: 2026-05-31 14:32:00 UTC               │
│                                                     │
│  ⚠️  Re-authentication Required                    │
│  Enter your password and MFA code to sign:         │
│                                                     │
│  Password: [________________]                       │
│  MFA Code:  [______]                              │
│                                                     │
│  [CANCEL]              [CONFIRM & SIGN]            │
└─────────────────────────────────────────────────────┘
```

---

## 11. Clinical Roles & Permission Matrix

### 11.1 Complete Permission Matrix

```
LEGEND: ✅ Yes | ❌ No | ⚠️ Conditional | 🔒 Requires Signature

ACTION                          │ PI  │ SubI│ CRC │ CRA │ DM  │ Bio │ MM  │ QA
─────────────────────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────
Enroll subject                   │  ✅ │  ✅ │  ⚠️ │  ❌ │  ❌ │  ❌ │  ❌ │  ❌
Enter CRF data                   │  ✅ │  ✅ │  ✅ │  ❌ │  ❌ │  ❌ │  ❌ │  ❌
Modify CRF data                  │  ✅ │  ✅ │  ✅ │  ❌ │  ✅ │  ❌ │  ❌ │  ❌
View CRF data (own site)         │  ✅ │  ✅ │  ✅ │  ✅ │  ✅ │  ✅ │  ✅ │  ✅
View CRF data (all sites)        │  ❌ │  ❌ │  ❌ │  ⚠️ │  ✅ │  ✅ │  ✅ │  ✅
Sign CRF data                    │ 🔒 │ 🔒 │  ❌ │  ❌ │  ❌ │  ❌ │  ❌ │  ❌
Lock form                        │  ❌ │  ❌ │  ❌ │  ❌ │  ✅ │  ❌ │  ❌ │  ❌
Unlock form                      │  ❌ │  ❌ │  ❌ │  ❌ │  ✅ │  ❌ │  ❌ │  ❌
Raise query                      │  ❌ │  ❌ │  ❌ │  ✅ │  ✅ │  ❌ │  ⚠️ │  ❌
Respond to query                 │  ✅ │  ✅ │  ✅ │  ❌ │  ✅ │  ❌ │  ❌ │  ❌
Close query                      │  ❌ │  ❌ │  ❌ │  ✅ │  ✅ │  ❌ │  ❌ │  ❌
Report SAE                       │  ✅ │  ✅ │  ✅ │  ❌ │  ❌ │  ❌ │  ❌ │  ❌
View SAE (unblinded)             │  ✅ │  ✅ │  ❌ │  ❌ │  ✅ │  ⚠️ │  ✅ │  ✅
View audit trail                 │  ⚠️ │  ❌ │  ❌ │  ❌ │  ✅ │  ❌ │  ❌ │  ✅
Export data                      │  ❌ │  ❌ │  ❌ │  ❌ │  ✅ │  ✅ │  ❌ │  ✅
View randomization               │  ⚠️ │  ⚠️ │  ⚠️ │  ❌ │  ⚠️ │  ⚠️ │  ✅ │  ❌
Manage study configuration       │  ❌ │  ❌ │  ❌ │  ❌ │  ✅ │  ❌ │  ❌ │  ❌
Manage site users                │  ⚠️ │  ❌ │  ❌ │  ❌ │  ❌ │  ❌ │  ❌ │  ❌
View all sites (CRA monitors)    │  ❌ │  ❌ │  ❌ │ ⚠️* │  ❌ │  ❌ │  ❌ │  ❌

*CRA can only see sites they are explicitly assigned to monitor

PI = Principal Investigator
SubI = Sub-Investigator
CRC = Clinical Research Coordinator
CRA = Clinical Research Associate (Monitor)
DM = Data Manager
Bio = Biostatistician
MM = Medical Monitor
QA = Quality Assurance Auditor
```

### 11.2 Blinding Management

```typescript
// services/blinding-service.ts

// Randomization is blinded: treatment assignment hidden from most users
// Critical for trial integrity

interface BlindingRule {
  studyId: string;
  isBlinded: boolean;          // Is the study blinded overall?
  
  // Who can see unblinded data:
  unblindedRoles: string[];    // e.g., ['medical_monitor', 'biostatistician_unblind']
  
  // Emergency unblinding (SAE scenarios):
  emergencyUnblindEnabled: boolean;
  emergencyUnblindApprovers: string[];  // User IDs who can approve
  
  // Interim analysis:
  interimAnalysisUsers: string[];  // Selected biostatisticians
}

// Every query for randomization data MUST check blinding
const getSubjectRandomization = async (
  subjectId: string, 
  requestingUser: JWTUser
): Promise<Randomization> => {
  const study = await getStudy(requestingUser.studyId);
  
  if (study.blindingConfig.isBlinded) {
    const canSeeUnblinded = study.blindingConfig.unblindedRoles
      .includes(requestingUser.userRole);
    
    if (!canSeeUnblinded) {
      // Return blinded data — DO NOT reveal treatment assignment
      return {
        ...randomization,
        treatmentArm: '[BLINDED]',
        treatmentDescription: '[BLINDED]',
      };
    }
  }
  
  return randomization;
};
```

---

## 12. Implementation Architecture

### 12.1 Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER (React)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  React App (SPA)                                         │  │
│  │  ├── Keycloak JS Adapter (OIDC + PKCE)                  │  │
│  │  ├── In-memory token storage (no localStorage)          │  │
│  │  ├── httpOnly cookie for refresh token                  │  │
│  │  └── Automatic token refresh                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                        │ HTTPS/TLS 1.3
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY / LOAD BALANCER                   │
│  (AWS ALB / Nginx / Cloudflare)                                 │
│  ├── SSL termination                                           │
│  ├── Rate limiting                                             │
│  ├── DDoS protection                                           │
│  └── Route to services                                         │
└─────────────────────────────────────────────────────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────┐         ┌─────────────────────────────┐
│   Keycloak      │         │   EDC API Service           │
│   (Auth Server) │         │   (Node.js / TypeScript)    │
│                 │         │   ├── JWT validation         │
│  Realm per      │◄───────►│   ├── Tenant DB routing     │
│  client:        │  Token  │   ├── Authorization checks  │
│  ├── LDAP/AD   │  Verify │   ├── Audit logging         │
│  ├── MFA config │         │   └── Business logic        │
│  └── SSO config │         └────────────┬────────────────┘
│                 │                      │
│  PostgreSQL     │         ┌────────────▼────────────────┐
│  (Keycloak DB)  │         │   MongoDB Atlas Cluster     │
│                 │         │   ├── client_a_pharma_db    │
└─────────────────┘         │   ├── client_b_cro_db       │
                            │   ├── client_c_academic_db  │
                            │   └── platform_audit_db     │
                            └─────────────────────────────┘
```

### 12.2 Keycloak Deployment — Kubernetes

```yaml
# keycloak-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keycloak
  namespace: auth
spec:
  replicas: 2  # High availability (minimum for production)
  selector:
    matchLabels:
      app: keycloak
  template:
    spec:
      containers:
      - name: keycloak
        image: quay.io/keycloak/keycloak:26.6.2
        args: ["start"]
        env:
        - name: KC_DB
          value: postgres
        - name: KC_DB_URL
          value: jdbc:postgresql://postgres-service:5432/keycloak
        - name: KC_DB_USERNAME
          valueFrom:
            secretKeyRef:
              name: keycloak-db-secret
              key: username
        - name: KC_DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: keycloak-db-secret
              key: password
        - name: KC_HOSTNAME
          value: auth.edcplatform.com
        - name: KC_HTTPS_CERTIFICATE_FILE
          value: /etc/tls/tls.crt
        - name: KC_HTTPS_CERTIFICATE_KEY_FILE
          value: /etc/tls/tls.key
        - name: KC_HEALTH_ENABLED
          value: "true"
        - name: KC_METRICS_ENABLED
          value: "true"
        - name: KC_LOG_LEVEL
          value: "INFO"
        
        # Clinical security settings
        - name: KC_HTTP_ENABLED
          value: "false"  # HTTPS only
        - name: KC_PROXY
          value: edge
          
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        
        livenessProbe:
          httpGet:
            path: /health/live
            port: 9000
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 9000
```

---

## 13. Security Threat Analysis — OWASP Top 10 in Clinical Context

### 13.1 Clinical EDC Security Risk Matrix

| OWASP 2021 | Clinical-Specific Risk | Our Mitigation |
|-----------|------------------------|----------------|
| **A01: Broken Access Control** | CRA sees wrong sponsor's data; PI sees other site's patients | Separate MongoDB DBs per tenant; site-level authorization; auth middleware on every route |
| **A02: Cryptographic Failures** | Patient data exposed at rest or in transit | MongoDB Atlas encryption; TLS 1.3; field-level encryption for sensitive PHI |
| **A03: Injection** | SQL/NoSQL injection to bypass tenant isolation | MongoDB parameterized queries; no raw query string interpolation; input validation |
| **A04: Insecure Design** | No re-auth before signature — forged signatures | Step-up authentication; signature linked to form hash; MFA required for signing |
| **A05: Security Misconfiguration** | Keycloak realm misconfigured, MFA bypass | Infrastructure as Code (Terraform) for Keycloak; automated config validation tests |
| **A06: Vulnerable Components** | Keycloak CVE not patched | Automated dependency scanning; Keycloak update procedure; container image scanning |
| **A07: Auth & Identity Failures** | Weak passwords; no MFA; session fixation | Strong password policy; TOTP MFA; PKCE; short token lifetime; idle timeout |
| **A08: Software & Data Integrity** | Audit trail tampering | Immutable audit log; hash chaining; audit log in separate collection; Write concern: majority |
| **A09: Logging & Monitoring Failures** | Unauthorized access not detected | Every action logged; real-time alerts for suspicious patterns; SIEM integration |
| **A10: SSRF** | Keycloak OIDC metadata URL exploited | Allowlist for OIDC discovery URLs; internal network segmentation |

### 13.2 Clinical-Specific Attack Scenarios

```
SCENARIO 1: Shared Login Credentials
  Risk: PI shares username/password with CRC (common in academic sites)
  Mitigation:
    - Audit trail shows WHO logged in, from which IP/device
    - Concurrent session prevention (1 session per user)
    - Training requirement documented (§11.10(i))
    - If shared login detected → account suspended + investigation

SCENARIO 2: Data Falsification (Fraudulent Clinical Data)
  Risk: Site staff enters incorrect data to make study look better
  Mitigation:
    - All original data preserved (audit trail — never delete)
    - Queries raised for suspicious values (DM reviews outliers)
    - SDV (Source Data Verification) by CRA compares to source docs
    - Electronic signatures link PI's identity to data accuracy attestation

SCENARIO 3: Unauthorized Unblinding (Trial Integrity Attack)
  Risk: Competitor or insider accesses randomization data
  Mitigation:
    - Blinding enforced at application layer (not just UI)
    - Separate role required for unblinded access
    - All unblinded data access logged with high alert level
    - Emergency unblinding procedure documented and restricted

SCENARIO 4: Backdated Data Entry
  Risk: Staff enters data with wrong timestamp to hide delay
  Mitigation:
    - Server-side timestamp (not client-provided)
    - UTC timestamp recorded at API layer (not browser time)
    - "Data Entry Date" vs "Visit Date" are separate fields
    - Audit event timestamp is immutable (MongoDB ObjectId timestamp)

SCENARIO 5: GDPR Breach — Cross-Tenant Data Leak
  Risk: Code bug returns Sponsor A data to Sponsor B
  Mitigation:
    - Separate databases per tenant (no shared DB = no data mixing)
    - Integration tests assert DB isolation (automated)
    - Pen testing includes cross-tenant access tests
    - 72-hour GDPR breach notification procedure documented
```

---

## 14. Technology Stack Decision

### 14.1 Auth Stack — Final Decision

```yaml
Identity Server: Keycloak 26.x (self-hosted on Kubernetes)
  Rationale:
    ✅ Free, open source
    ✅ Per-realm per-client configuration
    ✅ Built-in AD/LDAP federation per realm
    ✅ TOTP + WebAuthn built-in
    ✅ Step-up auth for 21 CFR Part 11 signing
    ✅ No vendor lock-in
    ✅ Used in healthcare worldwide
    ✅ Full audit capability
    ✅ Computer System Validation (CSV) possible

Backend Token Validation:
  Library: keycloak-backend (Node.js)
  Alternative: jose (OIDC JWT validation)
  
Frontend OIDC Client:
  Library: @react-keycloak/web or @axa-fr/react-oidc
  Protocol: OIDC Authorization Code Flow + PKCE
  
Session Management:
  Access token: In-memory (React state) — 15 min lifetime
  Refresh token: httpOnly Secure SameSite=Strict cookie — 8 hr lifetime
  NO localStorage for tokens (XSS risk for PHI)
```

### 14.2 Database Auth Routing

```typescript
// Infrastructure/db-connection-manager.ts

class DatabaseConnectionManager {
  private pool: Map<string, mongoose.Connection> = new Map();
  
  async getTenantConnection(tenantId: string): Promise<mongoose.Connection> {
    // Validate tenantId format (prevent injection)
    if (!/^[a-z0-9-]+$/.test(tenantId)) {
      throw new Error('Invalid tenant ID format');
    }
    
    const key = tenantId;
    
    if (!this.pool.has(key)) {
      const dbName = `edc_${tenantId}`;  // Prefix for clarity
      const conn = await mongoose.createConnection(
        `${MONGODB_BASE_URI}/${dbName}`,
        MONGODB_OPTIONS
      );
      
      // Verify this database exists (reject unknown tenants)
      const tenantConfig = await getTenantConfig(tenantId);
      if (!tenantConfig) {
        conn.close();
        throw new Error(`Unknown tenant: ${tenantId}`);
      }
      
      this.pool.set(key, conn);
    }
    
    return this.pool.get(key)!;
  }
}
```

---

## 15. Implementation Timeline & Phasing

### 15.1 Phase 1 — MVP (Month 1-3): Basic Auth

```yaml
Month 1:
  - Keycloak deployment (Docker Compose or single pod)
  - Single Keycloak realm for MVP testing
  - Username/password auth
  - JWT validation in API
  - Basic audit logging (authentication events)
  - Tenant DB routing (database-per-tenant)
  
Month 2:
  - TOTP MFA (opt-in) for admin users
  - Role-based authorization (basic RBAC)
  - Session management (idle timeout)
  - Brute force protection
  - Audit trail for data entry/modification
  
Month 3:
  - Step-up authentication for signing
  - Electronic signature flow (password + TOTP)
  - Audit report generation
  - Security testing (OWASP ZAP scan)
```

### 15.2 Phase 2 — Beta (Month 4-6): Per-Client Configuration

```yaml
Month 4:
  - Per-client Keycloak realm creation (automated)
  - Configurable MFA policy per realm
  - Basic LDAP federation (on-premises AD)
  
Month 5:
  - Azure AD OIDC federation per realm
  - AD attribute mapping
  - MFA enforcement by role
  - Site-level access control
  - Blinding enforcement
  
Month 6:
  - Full audit trail with chain integrity
  - Audit report for FDA/EMA inspection format
  - GDPR: Right to erasure (drop database)
  - Penetration testing (external vendor)
  - Computer System Validation documentation started
```

### 15.3 Phase 3 — Production (Month 7-12): Enterprise Features

```yaml
Month 7-8:
  - Keycloak HA (3 replicas, PostgreSQL HA)
  - EU region deployment (GDPR data residency)
  - WebAuthn/FIDO2 support (hardware keys for PI)
  - SIEM integration (audit log → Splunk/Elasticsearch)
  
Month 9-10:
  - ADFS/SAML federation for complex AD setups
  - Break-glass emergency access (HIPAA §164.312(a))
  - Risk-based authentication (new device = MFA required)
  - Session management reporting
  
Month 11-12:
  - CSV (Computer System Validation) documentation complete
  - IQ/OQ/PQ protocols documented
  - FDA 21 CFR Part 11 readiness assessment
  - Third-party security audit
  - ISO 27001 alignment review
```

---

## 16. Finalized Decisions

### 16.1 Confirmed Architectural Decisions (June 2026)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     DECISIONS — CONFIRMED 2026-06-01                    │
├──────────────────────────┬──────────────────────────────────────────────┤
│ Question                 │ Decision                                      │
├──────────────────────────┼──────────────────────────────────────────────┤
│ Q1: MFA enforcement      │ OPT-IN (client controls their MFA policy)    │
│                          │ Exception: signing roles ALWAYS required      │
│                          │ (PI, Sub-I, Data Manager, Tenant Admin)       │
│                          │ AD-federated users: defer to their AD MFA     │
├──────────────────────────┼──────────────────────────────────────────────┤
│ Q2: Keycloak hosting     │ Self-hosted on Kubernetes (not answered →     │
│                          │ keeping original recommendation for CSV       │
│                          │ validation auditability and cost control)     │
├──────────────────────────┼──────────────────────────────────────────────┤
│ Q3: AD federation        │ On-premises LDAP FIRST                        │
│                          │ Azure AD (OIDC/Entra ID) SECOND              │
│                          │ Rationale: academic medical centers and       │
│                          │ hospital sites are primary early clients      │
├──────────────────────────┼──────────────────────────────────────────────┤
│ Q4: Electronic signature │ PASSWORD + TOTP ✅                            │
│                          │ Step-up re-authentication before signing      │
│                          │ Satisfies 21 CFR Part 11 §11.200(a)          │
│                          │ "two distinct identification components"      │
├──────────────────────────┼──────────────────────────────────────────────┤
│ Q5: Multi-tenancy model  │ DUAL-MODE SUPPORTED                          │
│                          │ DEFAULT: Model C — dedicated cluster per      │
│                          │   client ($180-540/month per client)          │
│                          │ OPTIONAL: Model B — shared cluster, separate  │
│                          │   database ($57/month shared) for clients     │
│                          │   who do not require full physical isolation  │
├──────────────────────────┼──────────────────────────────────────────────┤
│ Q6: GDPR DPO             │ DEFER for MVP                                │
│                          │ Plan and budget for DPO post-MVP             │
│                          │ Outsource route likely (~$500-2000/month)    │
│                          │ Ensure Data Processing Agreements signed      │
│                          │ before any EU client goes live               │
└──────────────────────────┴──────────────────────────────────────────────┘
```

### 16.2 Architectural Impact of Dual-Mode Tenancy Decision

**Why defaulting to Model C (separate cluster per client) matters:**

```
IMPLICATIONS OF MODEL C AS DEFAULT:

1. CONNECTION MANAGEMENT
   - TenantConnectionManager must store per-client MONGO_URI (not just DB name)
   - Each client has their own Atlas cluster URI (stored encrypted in platform DB)
   - Connection pool per client cluster (not per database)

2. CLIENT ONBOARDING
   - Provisioning step: create Atlas cluster → takes 3-5 minutes
   - Automated via Atlas Admin API (or Terraform)
   - Keycloak Realm creation + Atlas cluster creation are paired operations

3. COST MODEL CHANGE
   - Platform charges clients for their dedicated cluster (~$180/month M10 base)
   - This is passed through or bundled into subscription pricing
   - Model B clients (if any) share a platform-managed cluster at lower tier

4. GDPR / 21 CFR Part 11 BENEFIT
   - Physical cluster isolation = strongest possible data segregation
   - Right to erasure = delete entire Atlas cluster (clean, unambiguous)
   - FDA inspection: separate cluster = "complete physical separation" (strongest answer)
   - EU clients: EU-region cluster by default (GDPR data residency)
   - US clients: US-region cluster (HIPAA BAA with MongoDB)

5. WHEN MODEL B IS OFFERED
   - Small pilot clients / proof of concept
   - Internal test/demo clients
   - Clients who explicitly waive physical isolation in writing
   - Academic sites with minimal data volume

6. UPGRADE PATH
   - Any Model B client can upgrade to Model C at any time
   - Migration: mongodump from shared cluster → mongorestore to new cluster
   - Zero application code change (connection string swap only)
```

**Updated TenantConnectionManager for Dual-Mode:**

```typescript
// connection-manager.ts — UPDATED for dual-mode tenancy
interface TenantConfig {
  tenantId: string;
  isolationMode: 'dedicated-cluster' | 'shared-cluster';
  // Model C: full cluster URI per client
  clusterUri?: string;       // e.g. mongodb+srv://user:pass@client-a.abc.mongodb.net
  // Model B: shared cluster, just the database name
  databaseName?: string;     // e.g. edc_client-a-pharma
}

class TenantConnectionManager {
  private connections = new Map<string, mongoose.Connection>();
  private configs = new Map<string, TenantConfig>();

  async getConnection(tenantId: string): Promise<mongoose.Connection> {
    if (!this.connections.has(tenantId)) {
      const config = await this.getTenantConfig(tenantId);
      
      let conn: mongoose.Connection;
      
      if (config.isolationMode === 'dedicated-cluster') {
        // Model C: connect to client's own cluster
        conn = await mongoose.createConnection(config.clusterUri!);
      } else {
        // Model B: connect to shared cluster, client's database
        const sharedUri = process.env.SHARED_CLUSTER_URI!;
        conn = await mongoose.createConnection(
          `${sharedUri}/${config.databaseName}`
        );
      }
      
      this.connections.set(tenantId, conn);
    }
    return this.connections.get(tenantId)!;
  }

  private async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    // Load from platform's own config database (not the tenant DB)
    if (!this.configs.has(tenantId)) {
      const config = await platformDb.collection('tenants').findOne({ tenantId });
      if (!config) throw new Error(`Unknown tenant: ${tenantId}`);
      this.configs.set(tenantId, config as TenantConfig);
    }
    return this.configs.get(tenantId)!;
  }
}
```

---

## 17. Final Recommendations

### 17.1 Summary of Decisions ✅ FINALIZED

```
┌─────────────────────────────────────────────────────────────────┐
│              ARCHITECTURE DECISIONS — FINALIZED 2026-06-01      │
├───────────────────────────┬─────────────────────────────────────┤
│ Decision                  │ Final Answer                        │
├───────────────────────────┼─────────────────────────────────────┤
│ Multi-tenancy model       │ DUAL-MODE:                          │
│                           │ DEFAULT: Model C — dedicated Atlas  │
│                           │   cluster per client (full physical │
│                           │   isolation; strongest reg. pos.)   │
│                           │ OPTIONAL: Model B — shared cluster, │
│                           │   separate DB (pilot/POC clients)   │
├───────────────────────────┼─────────────────────────────────────┤
│ Identity Server           │ Keycloak (self-hosted on K8s)       │
│                           │ One Realm per client                │
├───────────────────────────┼─────────────────────────────────────┤
│ Authentication protocol   │ OIDC Authorization Code + PKCE      │
├───────────────────────────┼─────────────────────────────────────┤
│ MFA default               │ OPT-IN — client controls policy     │
│                           │ Signing roles: ALWAYS REQUIRED      │
│                           │ AD-federated users: defer to AD MFA │
├───────────────────────────┼─────────────────────────────────────┤
│ MFA type                  │ TOTP (Google Authenticator)         │
│                           │ + future: WebAuthn/FIDO2            │
│                           │ NO SMS (NIST deprecated for PHI)    │
├───────────────────────────┼─────────────────────────────────────┤
│ AD federation build order │ 1. On-premises LDAP (hospitals,     │
│                           │    academic medical centers)        │
│                           │ 2. Azure AD / Microsoft Entra ID    │
│                           │    (pharma, CRO)                    │
│                           │ Per Keycloak Realm — per client     │
├───────────────────────────┼─────────────────────────────────────┤
│ Authorization model       │ Hierarchical RBAC                   │
│                           │ System roles + Study roles +        │
│                           │ Site-level assignments              │
├───────────────────────────┼─────────────────────────────────────┤
│ Electronic signatures     │ ✅ Password + TOTP (step-up auth)   │
│ (21 CFR Part 11 §11.200) │ Re-auth within 5 min before signing │
│                           │ Two distinct identification         │
│                           │ components — satisfies §11.200(a)  │
├───────────────────────────┼─────────────────────────────────────┤
│ Audit trail               │ Immutable event log per tenant DB   │
│                           │ SHA-256 chain hash                  │
│                           │ Who + What + When + Why             │
├───────────────────────────┼─────────────────────────────────────┤
│ Token lifetime            │ Access: 15 min                      │
│                           │ Refresh: 8 hours (one work day)     │
│                           │ Idle: 30 min auto-logout            │
├───────────────────────────┼─────────────────────────────────────┤
│ Token storage             │ Access: in-memory (React)           │
│                           │ Refresh: httpOnly Secure cookie     │
│                           │ NEVER localStorage (XSS risk)       │
├───────────────────────────┼─────────────────────────────────────┤
│ GDPR model                │ We = Data Processor                 │
│                           │ Client = Data Controller            │
│                           │ DPA agreement with each client      │
│                           │ DPIA required before EU launch      │
├───────────────────────────┼─────────────────────────────────────┤
│ GDPR DPO                  │ DEFERRED for MVP                    │
│                           │ Plan DPO (outsource route) post-MVP │
│                           │ Required before scale / EU clients  │
├───────────────────────────┼─────────────────────────────────────┤
│ Data residency            │ EU clients: EU Atlas cluster        │
│                           │ US clients: US Atlas cluster        │
│                           │ Global: Standard Contractual Clauses│
└───────────────────────────┴─────────────────────────────────────┘
```

### 17.2 Critical Path — Must Have Before First Client

```
BEFORE FIRST CLINICAL CLIENT — Non-Negotiable:
  ✅ Keycloak deployed and validated
  ✅ Per-realm AD configuration working
  ✅ MFA enforced for signing roles
  ✅ Audit trail with WHO + WHAT + WHEN + WHY
  ✅ Electronic signature with step-up auth
  ✅ Tenant database isolation (separate MongoDB databases)
  ✅ Token security (15-min access, httpOnly refresh)
  ✅ Idle session timeout (30 min)
  ✅ No shared logins (concurrent session prevention)
  ✅ Brute force protection
  ✅ Data Protection Agreement template ready
  ✅ Incident response procedure (GDPR breach 72hr notification)
  ✅ Basic Computer System Validation documentation started
  
NICE TO HAVE FOR FIRST CLIENT:
  ⚪ WebAuthn/FIDO2
  ⚪ Full SIEM integration
  ⚪ Risk-based authentication
  ⚪ Formal ISO 27001 certification
  ⚪ External penetration test (can do at 3-month mark)
```

### 17.3 Cost Summary

```yaml
MVP Auth Infrastructure (Month 1-6):
  Keycloak:
    - Single server / Docker: ~$20/month (VPS)
    - PostgreSQL: $25/month (Supabase or small RDS)
  Total auth: ~$45/month
  
Production Auth Infrastructure (Month 7+):
  Keycloak:
    - Kubernetes (2 replicas): ~$100/month compute
    - PostgreSQL RDS Multi-AZ: ~$150/month
    - SSL certificate: Let's Encrypt (FREE)
  Total auth: ~$250/month for unlimited clients
  
Comparison:
  Auth0 B2B Professional: $2,700/month
  Our Keycloak: $250/month
  Savings: $2,450/month = $29,400/year
```

### 17.4 Final Architecture One-Pager

```
CLINICAL EDC PLATFORM — AUTH ARCHITECTURE (FINALIZED 2026-06-01)

Authentication:  OIDC Authorization Code Flow + PKCE
                 via Keycloak (one realm per client)
                 
Identity:        Signing roles: Password + TOTP (ALWAYS required)
                 Other roles:   Client MFA policy (opt-in default)
                 AD-federated:  Defer to corporate AD MFA
                 
AD Integration:  Per client, per Keycloak Realm
                 Build order: LDAP (hospitals/academia) → Azure AD (pharma/CRO)
                 
Authorization:   System RBAC (Keycloak) +
                 Study-level roles (our DB) +
                 Site-level permissions (our DB)
                 
Multi-tenancy:   Keycloak: one realm per client (identity isolation)
                 MongoDB: DEFAULT Model C — dedicated Atlas cluster per client
                          OPTIONAL Model B — shared cluster, separate database
                 
Audit:           Immutable event log (MongoDB, per-tenant DB)
                 Every action: WHO + WHAT + WHEN + WHY
                 Hash-chained for tamper detection
                 
Signatures:      Step-up authentication (password + TOTP)
                 Signature linked to form content hash (§11.70)
                 Meaning of signature recorded (§11.50)
                 
GDPR DPO:        Deferred for MVP; outsource post-MVP
                 DPA signed with every client before go-live
                 
Compliance:      21 CFR Part 11 ✅
                 GDPR Art. 25 (data protection by design) ✅
                 HIPAA ✅
                 ICH E6(R3) ✅
```

---

## Document Status

**Status:** ✅ FINALIZED — 2026-06-01

**Decisions Confirmed:**
- Multi-tenancy: Dual-mode (Model C dedicated cluster as default, Model B optional)
- MFA: Opt-in per client; signing roles always required (Password + TOTP)
- AD build order: On-premises LDAP first → Azure AD second
- Electronic signatures: Password + TOTP (step-up, 5-min window)
- GDPR DPO: Deferred for MVP; outsource route post-MVP

**Next Steps:**
1. Begin Computer System Validation (CSV) documentation framework
2. Design CRF (Case Report Form) architecture and validation engine
3. Define study configuration and setup workflow
4. Create Data Processing Agreement template
4. Conduct Data Protection Impact Assessment (DPIA)
5. Begin Keycloak implementation

**Related Documents:**
- [final-database-decision-mssql-vs-mongodb.md](./final-database-decision-mssql-vs-mongodb.md) — Database architecture
- [mf-architecture.md](./mf-architecture.md) — Frontend architecture

---

## 18. ASP.NET Core Implementation — .NET Backend

This section covers the complete .NET/C# implementation of every auth, identity, multi-tenancy, and audit component described in this document. Stack: **ASP.NET Core 8+ (Minimal APIs or controllers), MongoDB.Driver 3.x, Keycloak OIDC**.

### 18.1 NuGet Package Dependencies

```xml
<!-- Clinical EDC API .csproj -->
<ItemGroup>
  <!-- JWT Bearer authentication — validates Keycloak-issued tokens -->
  <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.*" />
  
  <!-- MongoDB driver for per-tenant connections -->
  <PackageReference Include="MongoDB.Driver" Version="3.*" />
  
  <!-- Keycloak admin client (realm provisioning at onboarding) -->
  <PackageReference Include="Keycloak.Net" Version="1.*" />
  
  <!-- Cryptography for SHA-256 audit hash chain -->
  <!-- System.Security.Cryptography — built into .NET, no package needed -->

  <!-- Options pattern for strongly-typed configuration -->
  <PackageReference Include="Microsoft.Extensions.Options.ConfigurationExtensions" Version="8.*" />
  
  <!-- HttpContext accessor for tenant middleware -->
  <!-- Microsoft.AspNetCore.Http — built in -->
  
  <!-- Health checks for Keycloak + MongoDB liveness probes -->
  <PackageReference Include="AspNetCore.HealthChecks.MongoDb" Version="8.*" />
  <PackageReference Include="AspNetCore.HealthChecks.Uris" Version="8.*" />
</ItemGroup>
```

---

### 18.2 Configuration — appsettings.json Structure

```json
{
  "Keycloak": {
    "BaseUrl": "https://keycloak.yourdomain.com",
    "AdminClientId": "admin-cli",
    "AdminClientSecret": "{{from-vault}}",
    "PlatformRealm": "platform-admin"
  },
  "MongoDB": {
    "SharedClusterUri": "mongodb+srv://svc:{{pass}}@shared.abc.mongodb.net",
    "TlsEnabled": true,
    "MaxConnectionPoolSize": 100
  },
  "Auth": {
    "AccessTokenLifetimeMinutes": 15,
    "SessionIdleTimeoutMinutes": 30,
    "StepUpMaxAgeSeconds": 300
  }
}
```

**Tenant configs (per-client, stored in platform DB, NOT appsettings):**
```csharp
// Stored in platform MongoDB collection: "tenants"
public record TenantConfig
{
    public string TenantId { get; init; } = default!;
    public string RealmName { get; init; } = default!;          // Keycloak realm
    public IsolationMode IsolationMode { get; init; }
    public string? ClusterUri { get; init; }                    // Model C: encrypted at rest
    public string? DatabaseName { get; init; }                  // Model B: shared cluster DB name
    public string Region { get; init; } = "us-east-1";         // data residency
    public bool MfaRequiredForAll { get; init; } = false;       // client MFA policy
    public DateTime CreatedAt { get; init; }
}

public enum IsolationMode
{
    DedicatedCluster,   // Model C — default
    SharedCluster       // Model B — opt-in
}
```

---

### 18.3 Keycloak JWT Authentication — Dynamic Multi-Tenant Validation

The critical challenge: each client has their own Keycloak realm, so the `issuer` (iss) claim in the JWT is different per tenant. ASP.NET Core's default `AddJwtBearer` expects one static issuer. We use a custom `IConfigureNamedOptions` pattern to resolve the correct realm dynamically.

```csharp
// Auth/KeycloakMultiTenantOptions.cs
public class KeycloakOptions
{
    public string BaseUrl { get; set; } = default!;
}

// Auth/TenantJwtBearerConfigureOptions.cs
// Called at startup — sets up JwtBearer with a token validator that
// looks up the correct Keycloak realm per token at validation time.
public class TenantJwtBearerConfigureOptions 
    : IConfigureNamedOptions<JwtBearerOptions>
{
    private readonly KeycloakOptions _kc;
    
    public TenantJwtBearerConfigureOptions(IOptions<KeycloakOptions> kc)
        => _kc = kc.Value;

    public void Configure(string? name, JwtBearerOptions options)
    {
        if (name != JwtBearerDefaults.AuthenticationScheme) return;

        options.RequireHttpsMetadata = true;
        options.SaveToken = false;
        options.MapInboundClaims = false;

        // We do NOT set options.Authority here.
        // Instead we validate per-token using TokenValidationParameters
        // with a custom IssuerSigningKeyResolver.
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidAudience = "edc-api",
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            
            // Resolve signing keys from the correct Keycloak realm JWKS endpoint
            IssuerSigningKeyResolver = (token, securityToken, kid, parameters) =>
            {
                var issuer = securityToken.Issuer;
                // e.g. "https://keycloak.yourdomain.com/realms/client-a-pharma"
                var jwksUrl = $"{issuer}/protocol/openid-connect/certs";
                
                // Fetch JWKS (cached via IMemoryCache — don't hammer Keycloak)
                return JwksCache.GetKeys(jwksUrl);
            },
            
            // Validate that issuer matches a known Keycloak realm pattern
            IssuerValidator = (issuer, token, parameters) =>
            {
                if (issuer.StartsWith(_kc.BaseUrl + "/realms/"))
                    return issuer;
                throw new SecurityTokenInvalidIssuerException(
                    $"Unknown issuer: {issuer}");
            }
        };
    }

    public void Configure(JwtBearerOptions options) => Configure(null, options);
}
```

```csharp
// Auth/JwksCache.cs — in-memory JWKS key cache with 1hr TTL
public static class JwksCache
{
    private static readonly MemoryCache _cache = new(new MemoryCacheOptions());

    public static IEnumerable<SecurityKey> GetKeys(string jwksUrl)
    {
        return _cache.GetOrCreate(jwksUrl, entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            
            using var http = new HttpClient();
            var json = http.GetStringAsync(jwksUrl).GetAwaiter().GetResult();
            var jwks = new JsonWebKeySet(json);
            return jwks.GetSigningKeys();
        })!;
    }
}
```

---

### 18.4 Tenant Resolution Middleware

Extracts `tenantId` from the validated JWT, looks up the `TenantConfig`, and stores both in `HttpContext.Items` for downstream use. Every API request flows through this after authentication.

```csharp
// Middleware/TenantContextMiddleware.cs
public class TenantContextMiddleware
{
    private readonly RequestDelegate _next;

    public TenantContextMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, 
        ITenantConfigRepository tenantRepo,
        ITenantConnectionManager connectionManager)
    {
        var user = context.User;
        
        if (user?.Identity?.IsAuthenticated == true)
        {
            // Extract tenantId from JWT custom claim
            var tenantId = user.FindFirstValue("tenantId");
            
            if (string.IsNullOrEmpty(tenantId))
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new { error = "No tenant context in token" });
                return;
            }

            var config = await tenantRepo.GetAsync(tenantId);
            if (config is null)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new { error = "Unknown tenant" });
                return;
            }

            // Attach tenant context and database connection to the request
            context.Items["TenantId"] = tenantId;
            context.Items["TenantConfig"] = config;
            context.Items["TenantDb"] = await connectionManager.GetDatabaseAsync(config);
        }

        await _next(context);
    }
}

// Extension to make registration clean
public static class TenantContextMiddlewareExtensions
{
    public static IApplicationBuilder UseTenantContext(this IApplicationBuilder app)
        => app.UseMiddleware<TenantContextMiddleware>();
}
```

```csharp
// Helpers/HttpContextExtensions.cs — strongly typed access throughout app
public static class HttpContextExtensions
{
    public static string GetTenantId(this HttpContext ctx)
        => ctx.Items["TenantId"] as string 
           ?? throw new InvalidOperationException("No tenant context");

    public static IMongoDatabase GetTenantDb(this HttpContext ctx)
        => ctx.Items["TenantDb"] as IMongoDatabase
           ?? throw new InvalidOperationException("No tenant database");

    public static TenantConfig GetTenantConfig(this HttpContext ctx)
        => ctx.Items["TenantConfig"] as TenantConfig
           ?? throw new InvalidOperationException("No tenant config");
}
```

---

### 18.5 Dual-Mode Tenant Connection Manager (Model B + Model C)

```csharp
// MultiTenancy/ITenantConnectionManager.cs
public interface ITenantConnectionManager
{
    Task<IMongoDatabase> GetDatabaseAsync(TenantConfig config);
}

// MultiTenancy/TenantConnectionManager.cs
public class TenantConnectionManager : ITenantConnectionManager, IAsyncDisposable
{
    // Key = tenantId → MongoClient (one per tenant, thread-safe)
    private readonly ConcurrentDictionary<string, MongoClient> _clients = new();
    private readonly MongoClientSettings _sharedSettings;
    private readonly string _sharedClusterUri;

    public TenantConnectionManager(IOptions<MongoDbOptions> opts)
    {
        _sharedClusterUri = opts.Value.SharedClusterUri;
        _sharedSettings = MongoClientSettings.FromConnectionString(_sharedClusterUri);
        _sharedSettings.MaxConnectionPoolSize = 100;
        _sharedSettings.SslSettings = new SslSettings { EnabledSslProtocols = SslProtocols.Tls12 };
    }

    public Task<IMongoDatabase> GetDatabaseAsync(TenantConfig config)
    {
        return config.IsolationMode switch
        {
            IsolationMode.DedicatedCluster => GetDedicatedClusterDatabaseAsync(config),
            IsolationMode.SharedCluster => Task.FromResult(GetSharedClusterDatabase(config)),
            _ => throw new NotSupportedException($"Unknown isolation mode: {config.IsolationMode}")
        };
    }

    // Model C — dedicated cluster per client (DEFAULT)
    private Task<IMongoDatabase> GetDedicatedClusterDatabaseAsync(TenantConfig config)
    {
        var client = _clients.GetOrAdd(config.TenantId, _ =>
        {
            // ClusterUri is decrypted from vault before reaching here
            var settings = MongoClientSettings.FromConnectionString(config.ClusterUri!);
            settings.MaxConnectionPoolSize = 50;
            settings.SslSettings = new SslSettings { EnabledSslProtocols = SslProtocols.Tls12 };
            return new MongoClient(settings);
        });

        // Database name is standardised — "edc" inside each client's own cluster
        var db = client.GetDatabase("edc");
        return Task.FromResult(db);
    }

    // Model B — shared cluster, per-client database
    private IMongoDatabase GetSharedClusterDatabase(TenantConfig config)
    {
        var sharedClient = _clients.GetOrAdd("__shared__", _ =>
            new MongoClient(_sharedSettings));

        // Each client has their own database: edc_{tenantId}
        return sharedClient.GetDatabase($"edc_{config.DatabaseName}");
    }

    public async ValueTask DisposeAsync()
    {
        // MongoClient manages connection pool lifecycle — no explicit close needed
        _clients.Clear();
        await Task.CompletedTask;
    }
}
```

---

### 18.6 Clinical RBAC — JWT Claim Mapping + Authorization Policies

Keycloak embeds realm roles in the JWT under `realm_access.roles`. We map these into ASP.NET Core `ClaimsPrincipal` roles, then define named policies for clinical permissions.

```csharp
// Auth/ClinicalClaimsTransformer.cs
// Runs after token validation — maps Keycloak claims to ASP.NET Core claims
public class ClinicalClaimsTransformer : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        var identity = (ClaimsIdentity)principal.Identity!;
        
        // Map Keycloak realm_access.roles → standard ASP.NET Core role claims
        var realmAccess = principal.FindFirst("realm_access")?.Value;
        if (realmAccess is not null)
        {
            var roles = JsonSerializer.Deserialize<RealmAccess>(realmAccess);
            foreach (var role in roles?.Roles ?? [])
            {
                if (!identity.HasClaim(ClaimTypes.Role, role))
                    identity.AddClaim(new Claim(ClaimTypes.Role, role));
            }
        }

        // Promote clinical custom claims to standard claim types
        // These are added by Keycloak realm mappers from the user profile
        var canSign = principal.FindFirst("canSign")?.Value;
        if (canSign == "true")
            identity.AddClaim(new Claim("clinical:canSign", "true"));

        var mfaVerified = principal.FindFirst("mfaVerified")?.Value;
        if (mfaVerified == "true")
            identity.AddClaim(new Claim("clinical:mfaVerified", "true"));

        return Task.FromResult(principal);
    }

    private record RealmAccess([property: JsonPropertyName("roles")] List<string> Roles);
}
```

```csharp
// Auth/ClinicalRoles.cs — strongly typed role constants (never use magic strings)
public static class ClinicalRoles
{
    public const string PlatformAdmin      = "platform-admin";
    public const string TenantAdmin        = "tenant-admin";
    public const string PrincipalInvestigator = "principal-investigator";
    public const string SubInvestigator    = "sub-investigator";
    public const string DataManager        = "data-manager";
    public const string ClinicalResearchCoordinator = "crc";
    public const string ClinicalResearchAssociate   = "cra";
    public const string Biostatistician    = "biostatistician";
    public const string MedicalMonitor     = "medical-monitor";
    public const string QaAuditor          = "qa-auditor";
}

// Auth/ClinicalPolicies.cs — named authorization policies
public static class ClinicalPolicies
{
    public const string CanSign          = "CanSign";
    public const string CanReviewData    = "CanReviewData";
    public const string CanManageStudy   = "CanManageStudy";
    public const string CanAudit         = "CanAudit";
    public const string CanRandomize     = "CanRandomize";
    public const string CanUnblind       = "CanUnblind";
    public const string CanQueryData     = "CanQueryData";
    public const string CanExportData    = "CanExportData";
    public const string TenantAdminOnly  = "TenantAdminOnly";
    public const string SigningMfaVerified = "SigningMfaVerified";
}
```

```csharp
// Auth/PolicyRegistration.cs — wired in Program.cs
public static void AddClinicalAuthorization(this IServiceCollection services)
{
    services.AddAuthorization(options =>
    {
        // Who can perform electronic signatures (21 CFR Part 11)
        options.AddPolicy(ClinicalPolicies.CanSign, policy =>
            policy.RequireAssertion(ctx =>
                ctx.User.IsInRole(ClinicalRoles.PrincipalInvestigator)
                || ctx.User.IsInRole(ClinicalRoles.SubInvestigator)
                || ctx.User.IsInRole(ClinicalRoles.DataManager)
                || ctx.User.IsInRole(ClinicalRoles.TenantAdmin)));

        // Signing with step-up MFA verified (required for Part 11 endpoints)
        options.AddPolicy(ClinicalPolicies.SigningMfaVerified, policy =>
        {
            policy.RequireAssertion(ctx =>
                ctx.User.IsInRole(ClinicalRoles.PrincipalInvestigator)
                || ctx.User.IsInRole(ClinicalRoles.SubInvestigator)
                || ctx.User.IsInRole(ClinicalRoles.DataManager));
            policy.AddRequirements(new StepUpAuthRequirement());
        });

        options.AddPolicy(ClinicalPolicies.CanReviewData, policy =>
            policy.RequireRole(
                ClinicalRoles.PrincipalInvestigator,
                ClinicalRoles.SubInvestigator,
                ClinicalRoles.DataManager,
                ClinicalRoles.ClinicalResearchAssociate,
                ClinicalRoles.MedicalMonitor,
                ClinicalRoles.QaAuditor));

        options.AddPolicy(ClinicalPolicies.CanManageStudy, policy =>
            policy.RequireRole(
                ClinicalRoles.TenantAdmin,
                ClinicalRoles.DataManager));

        options.AddPolicy(ClinicalPolicies.CanAudit, policy =>
            policy.RequireRole(
                ClinicalRoles.QaAuditor,
                ClinicalRoles.TenantAdmin,
                ClinicalRoles.PlatformAdmin));

        options.AddPolicy(ClinicalPolicies.CanRandomize, policy =>
            policy.RequireRole(
                ClinicalRoles.DataManager,
                ClinicalRoles.TenantAdmin));

        options.AddPolicy(ClinicalPolicies.CanUnblind, policy =>
            policy.RequireRole(
                ClinicalRoles.DataManager,
                ClinicalRoles.TenantAdmin)
            .AddRequirements(new StepUpAuthRequirement()));

        options.AddPolicy(ClinicalPolicies.CanExportData, policy =>
            policy.RequireRole(
                ClinicalRoles.DataManager,
                ClinicalRoles.Biostatistician,
                ClinicalRoles.TenantAdmin));

        options.AddPolicy(ClinicalPolicies.TenantAdminOnly, policy =>
            policy.RequireRole(ClinicalRoles.TenantAdmin, ClinicalRoles.PlatformAdmin));
    });
}
```

---

### 18.7 Step-Up Authentication — 21 CFR Part 11 §11.200

Step-up authentication enforces that the user re-authenticated with Password + TOTP (ACR level 2) within the last 5 minutes before a signing action. This satisfies "two distinct identification components" per §11.200(a).

```csharp
// Auth/StepUpAuthRequirement.cs
public class StepUpAuthRequirement : IAuthorizationRequirement { }

// Auth/StepUpAuthHandler.cs
public class StepUpAuthHandler : AuthorizationHandler<StepUpAuthRequirement>
{
    private readonly IOptions<AuthOptions> _authOptions;

    public StepUpAuthHandler(IOptions<AuthOptions> authOptions)
        => _authOptions = authOptions;

    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        StepUpAuthRequirement requirement)
    {
        var user = context.User;

        // Check Keycloak ACR (Authentication Context Class Reference)
        // step-up = Keycloak level-of-assurance 2 (password + TOTP)
        var acr = user.FindFirstValue("acr");
        if (acr != "step-up" && acr != "2")
        {
            context.Fail(new AuthorizationFailureReason(this,
                "Step-up authentication required. Please re-authenticate with your password and TOTP."));
            return Task.CompletedTask;
        }

        // Check that step-up happened within the allowed window (default 300s = 5 min)
        var authTimeStr = user.FindFirstValue("auth_time");
        if (!long.TryParse(authTimeStr, out var authTimeUnix))
        {
            context.Fail(new AuthorizationFailureReason(this, "auth_time claim missing"));
            return Task.CompletedTask;
        }

        var authTime = DateTimeOffset.FromUnixTimeSeconds(authTimeUnix);
        var maxAge = TimeSpan.FromSeconds(_authOptions.Value.StepUpMaxAgeSeconds);

        if (DateTimeOffset.UtcNow - authTime > maxAge)
        {
            context.Fail(new AuthorizationFailureReason(this,
                $"Step-up authentication expired. Re-authenticate within {maxAge.TotalMinutes} minutes of signing."));
            return Task.CompletedTask;
        }

        context.Succeed(requirement);
        return Task.CompletedTask;
    }
}
```

```csharp
// Auth/AuthOptions.cs
public class AuthOptions
{
    public int AccessTokenLifetimeMinutes { get; set; } = 15;
    public int SessionIdleTimeoutMinutes { get; set; } = 30;
    public int StepUpMaxAgeSeconds { get; set; } = 300;  // 5 minutes
}
```

---

### 18.8 Study-Level Authorization — Site Context Guard

System roles from Keycloak are coarse-grained. At the study level we also check the user's assigned sites from our MongoDB `UserStudyAccess` collection. This is an ASP.NET Core `IAuthorizationHandler` with access to the HTTP context.

```csharp
// Auth/StudyAccessRequirement.cs
public class StudyAccessRequirement : IAuthorizationRequirement
{
    public string RequiredStudyRole { get; }
    public StudyAccessRequirement(string requiredStudyRole) 
        => RequiredStudyRole = requiredStudyRole;
}

// Auth/StudyAccessHandler.cs
public class StudyAccessHandler : AuthorizationHandler<StudyAccessRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public StudyAccessHandler(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        StudyAccessRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext!;
        var db = httpContext.GetTenantDb();
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        // studyId comes from the route: /api/studies/{studyId}/subjects
        var studyId = httpContext.GetRouteValue("studyId")?.ToString();
        var siteId  = httpContext.GetRouteValue("siteId")?.ToString();

        if (string.IsNullOrEmpty(studyId))
        {
            context.Fail(new AuthorizationFailureReason(this, "No studyId in route"));
            return;
        }

        var collection = db.GetCollection<UserStudyAccess>("user_study_access");
        var access = await collection.Find(a =>
            a.UserId == userId && a.StudyId == studyId
        ).FirstOrDefaultAsync();

        if (access is null)
        {
            context.Fail(new AuthorizationFailureReason(this, 
                $"User has no access to study {studyId}"));
            return;
        }

        // Check role hierarchy
        if (!HasRequiredRole(access.StudyRole, requirement.RequiredStudyRole))
        {
            context.Fail(new AuthorizationFailureReason(this,
                $"Study role '{access.StudyRole}' insufficient. Required: '{requirement.RequiredStudyRole}'"));
            return;
        }

        // Site-level check (if siteId in route and user has site restrictions)
        if (!string.IsNullOrEmpty(siteId) && access.AllowedSiteIds?.Any() == true)
        {
            if (!access.AllowedSiteIds.Contains(siteId))
            {
                context.Fail(new AuthorizationFailureReason(this,
                    $"User not assigned to site {siteId}"));
                return;
            }
        }

        context.Succeed(requirement);
    }

    private static bool HasRequiredRole(string userRole, string requiredRole)
    {
        // Role hierarchy: PI > Sub-I > DM > CRC > CRA > Biostatistician > others
        var hierarchy = new List<string>
        {
            ClinicalRoles.PrincipalInvestigator,
            ClinicalRoles.SubInvestigator,
            ClinicalRoles.DataManager,
            ClinicalRoles.ClinicalResearchCoordinator,
            ClinicalRoles.ClinicalResearchAssociate,
            ClinicalRoles.Biostatistician,
            ClinicalRoles.MedicalMonitor,
            ClinicalRoles.QaAuditor
        };

        var userIndex     = hierarchy.IndexOf(userRole);
        var requiredIndex = hierarchy.IndexOf(requiredRole);

        return userIndex >= 0 && userIndex <= requiredIndex;
    }
}

// MongoDB document shape for study access
public class UserStudyAccess
{
    [BsonId] public ObjectId Id { get; set; }
    public string UserId { get; set; } = default!;        // Keycloak user sub
    public string StudyId { get; set; } = default!;
    public string StudyRole { get; set; } = default!;     // one of ClinicalRoles
    public List<string>? AllowedSiteIds { get; set; }     // null = all sites
    public bool IsBlinded { get; set; } = true;           // default: blinded
    public DateTime AssignedAt { get; set; }
    public string AssignedByUserId { get; set; } = default!;
}
```

---

### 18.9 Audit Trail Service — Immutable, Hash-Chained

```csharp
// Audit/AuditEventType.cs
public enum AuditEventType
{
    // Auth events
    UserLogin, UserLogout, LoginFailed, MfaEnrolled, MfaFailed,
    PasswordChanged, TokenRefreshed, StepUpCompleted,
    
    // Data events
    SubjectCreated, SubjectUpdated, DataEntryStarted, DataEntrySaved,
    DataEntryCompleted, DataEntryAmended, DataDeleted,
    
    // Signature events
    ElectronicSignatureCreated, ElectronicSignatureVerified,
    
    // Query events
    QueryRaised, QueryAnswered, QueryClosed,
    
    // Admin events
    UserCreated, UserDeactivated, UserRoleChanged,
    StudyCreated, SiteAdded, StudyLocked, StudyUnlocked,
    
    // Blinding/randomization
    SubjectRandomized, UnblindingPerformed, EmergencyUnblinding,
    
    // Export/access
    DataExported, AuditLogAccessed, ReportGenerated,
    
    // Security events
    UnauthorizedAccessAttempt, SuspiciousActivityDetected
}

// Audit/ClinicalAuditEvent.cs
[BsonCollection("audit_events")]
public class ClinicalAuditEvent
{
    [BsonId] public ObjectId Id { get; set; }
    
    // 21 CFR Part 11 required fields
    public string UserId { get; set; } = default!;        // who
    public string UserEmail { get; set; } = default!;
    public string UserRole { get; set; } = default!;
    public AuditEventType EventType { get; set; }         // what
    public DateTime TimestampUtc { get; set; }            // when (server time)
    public string Reason { get; set; } = default!;        // why
    
    // Context
    public string TenantId { get; set; } = default!;
    public string? StudyId { get; set; }
    public string? SiteId { get; set; }
    public string? SubjectId { get; set; }
    public string? FormId { get; set; }
    
    // Data integrity
    public Dictionary<string, object>? OldValues { get; set; }   // before
    public Dictionary<string, object>? NewValues { get; set; }   // after
    public string? DataHash { get; set; }                         // SHA-256 of affected data
    
    // Hash chain — links this event to the previous one (tamper detection)
    public string? PreviousEventHash { get; set; }
    public string EventHash { get; set; } = default!;            // SHA-256(this event)
    
    // Network
    public string IpAddress { get; set; } = default!;
    public string UserAgent { get; set; } = default!;
    public string? SessionId { get; set; }
}
```

```csharp
// Audit/AuditService.cs
public class AuditService : IAuditService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private static readonly SemaphoreSlim _hashLock = new(1, 1);

    public AuditService(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    public async Task LogAsync(
        AuditEventType eventType,
        string reason,
        object? oldValues = null,
        object? newValues = null,
        string? studyId = null,
        string? subjectId = null,
        string? formId = null,
        string? siteId = null,
        CancellationToken ct = default)
    {
        var ctx = _httpContextAccessor.HttpContext!;
        var db = ctx.GetTenantDb();
        var user = ctx.User;

        var collection = db.GetCollection<ClinicalAuditEvent>("audit_events");

        // Get last event hash to chain to (serialized — one at a time per tenant)
        await _hashLock.WaitAsync(ct);
        try
        {
            var lastEvent = await collection
                .Find(FilterDefinition<ClinicalAuditEvent>.Empty)
                .Sort(Builders<ClinicalAuditEvent>.Sort.Descending(e => e.TimestampUtc))
                .Limit(1)
                .FirstOrDefaultAsync(ct);

            var previousHash = lastEvent?.EventHash;

            var auditEvent = new ClinicalAuditEvent
            {
                UserId       = user.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system",
                UserEmail    = user.FindFirstValue(ClaimTypes.Email) ?? "system",
                UserRole     = user.FindFirstValue(ClaimTypes.Role) ?? "unknown",
                EventType    = eventType,
                TimestampUtc = DateTime.UtcNow,
                Reason       = reason,
                TenantId     = ctx.GetTenantId(),
                StudyId      = studyId,
                SiteId       = siteId,
                SubjectId    = subjectId,
                FormId       = formId,
                OldValues    = oldValues is null ? null 
                               : JsonSerializer.Deserialize<Dictionary<string, object>>(
                                   JsonSerializer.Serialize(oldValues)),
                NewValues    = newValues is null ? null 
                               : JsonSerializer.Deserialize<Dictionary<string, object>>(
                                   JsonSerializer.Serialize(newValues)),
                DataHash     = newValues is null ? null : ComputeHash(JsonSerializer.Serialize(newValues)),
                PreviousEventHash = previousHash,
                IpAddress    = ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                UserAgent    = ctx.Request.Headers.UserAgent.ToString(),
                SessionId    = ctx.User.FindFirstValue("sid")
            };

            // Hash this event (includes previous hash → chain)
            auditEvent.EventHash = ComputeEventHash(auditEvent);

            // Write with majority write concern — ensures durability before returning
            var writeConcernCollection = collection.WithWriteConcern(WriteConcern.WMajority);
            await writeConcernCollection.InsertOneAsync(auditEvent, cancellationToken: ct);
        }
        finally
        {
            _hashLock.Release();
        }
    }

    private static string ComputeHash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static string ComputeEventHash(ClinicalAuditEvent evt)
    {
        // Deterministic serialization — field order matters for reproducible hash
        var payload = $"{evt.UserId}|{evt.EventType}|{evt.TimestampUtc:O}|" +
                      $"{evt.TenantId}|{evt.StudyId}|{evt.Reason}|" +
                      $"{evt.DataHash}|{evt.PreviousEventHash}";
        return ComputeHash(payload);
    }
}

public interface IAuditService
{
    Task LogAsync(
        AuditEventType eventType,
        string reason,
        object? oldValues = null,
        object? newValues = null,
        string? studyId = null,
        string? subjectId = null,
        string? formId = null,
        string? siteId = null,
        CancellationToken ct = default);
}
```

---

### 18.10 Electronic Signature Endpoint — 21 CFR Part 11 §11.200

```csharp
// Models/SignatureRequest.cs
public record SignatureRequest(
    string StudyId,
    string SubjectId,
    string FormId,
    string FormVersion,
    string SignatureMeaning,    // "I certify this data is accurate and complete"
    string FormDataHash         // SHA-256 of the form data being signed (client computes)
);

public record SignatureResponse(
    string SignatureId,
    string SignedByUserId,
    string SignedByEmail,
    DateTime SignedAtUtc,
    string FormDataHash,
    string SignatureHash         // SHA-256(signatureId + userId + formDataHash + timestamp)
);
```

```csharp
// Endpoints/SignatureEndpoints.cs (Minimal API)
public static class SignatureEndpoints
{
    public static void MapSignatureEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/studies/{studyId}/subjects/{subjectId}/forms/{formId}/sign",
            [Authorize(Policy = ClinicalPolicies.SigningMfaVerified)]
            async (
                string studyId,
                string subjectId,
                string formId,
                [FromBody] SignatureRequest request,
                HttpContext context,
                IAuditService auditService,
                CancellationToken ct) =>
            {
                var db = context.GetTenantDb();
                var user = context.User;
                var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var userEmail = user.FindFirstValue(ClaimTypes.Email)!;

                // Verify form data hash matches what the server has stored
                // (prevents "sign anything" attacks — §11.70 links signature to specific data)
                var forms = db.GetCollection<BsonDocument>("form_data");
                var formData = await forms.Find(f =>
                    f["studyId"] == studyId
                    && f["subjectId"] == subjectId
                    && f["formId"] == formId
                ).FirstOrDefaultAsync(ct);

                if (formData is null)
                    return Results.NotFound(new { error = "Form not found" });

                var serverFormHash = ComputeFormHash(formData.ToJson());
                if (serverFormHash != request.FormDataHash)
                    return Results.UnprocessableEntity(new
                    {
                        error = "Form data hash mismatch. Data may have changed since page loaded.",
                        detail = "Refresh the form and re-review before signing."
                    });

                // Create signature record
                var signatureId = ObjectId.GenerateNewId().ToString();
                var signedAt = DateTime.UtcNow;
                var signatureHash = ComputeSignatureHash(signatureId, userId, request.FormDataHash, signedAt);

                var signature = new BsonDocument
                {
                    ["_id"]               = ObjectId.Parse(signatureId),
                    ["studyId"]           = studyId,
                    ["subjectId"]         = subjectId,
                    ["formId"]            = formId,
                    ["formVersion"]       = request.FormVersion,
                    ["signedByUserId"]    = userId,
                    ["signedByEmail"]     = userEmail,
                    ["signatureMeaning"]  = request.SignatureMeaning,
                    ["formDataHash"]      = request.FormDataHash,
                    ["signatureHash"]     = signatureHash,
                    ["signedAtUtc"]       = signedAt,
                    ["stepUpAcrLevel"]    = user.FindFirstValue("acr"),
                    ["ipAddress"]         = context.Connection.RemoteIpAddress?.ToString()
                };

                var sigCollection = db.GetCollection<BsonDocument>("electronic_signatures");
                await sigCollection
                    .WithWriteConcern(WriteConcern.WMajority)
                    .InsertOneAsync(signature, cancellationToken: ct);

                // Immutable audit trail entry
                await auditService.LogAsync(
                    eventType: AuditEventType.ElectronicSignatureCreated,
                    reason: request.SignatureMeaning,
                    newValues: new { signatureId, formId, formDataHash = request.FormDataHash },
                    studyId: studyId,
                    subjectId: subjectId,
                    formId: formId,
                    ct: ct);

                return Results.Ok(new SignatureResponse(
                    SignatureId:    signatureId,
                    SignedByUserId: userId,
                    SignedByEmail:  userEmail,
                    SignedAtUtc:    signedAt,
                    FormDataHash:   request.FormDataHash,
                    SignatureHash:  signatureHash));
            });
    }

    private static string ComputeFormHash(string formJson)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(formJson));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static string ComputeSignatureHash(string sigId, string userId, string formHash, DateTime signedAt)
    {
        var payload = $"{sigId}|{userId}|{formHash}|{signedAt:O}";
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
```

---

### 18.11 Idle Session Enforcement

The React frontend handles idle timeout in-browser (see Section 5.4). On the .NET backend we enforce token lifetime and ensure expired tokens are rejected. Additionally, we can enforce concurrent session prevention (§11.10 — no shared logins).

```csharp
// Auth/ConcurrentSessionRequirement.cs
// Checks that the token's jti (JWT ID) matches the user's current active session
// stored in our platform DB. Prevents two people using the same account simultaneously.
public class ConcurrentSessionRequirement : IAuthorizationRequirement { }

public class ConcurrentSessionHandler : AuthorizationHandler<ConcurrentSessionRequirement>
{
    private readonly IActiveSessionStore _sessionStore;

    public ConcurrentSessionHandler(IActiveSessionStore sessionStore)
        => _sessionStore = sessionStore;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ConcurrentSessionRequirement requirement)
    {
        var jti = context.User.FindFirstValue("jti");
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (jti is null || userId is null)
        {
            context.Fail(new AuthorizationFailureReason(this, "Token missing jti or sub"));
            return;
        }

        // Check current active token for this user
        var activeJti = await _sessionStore.GetActiveJtiAsync(userId);

        if (activeJti != jti)
        {
            // This token was issued for a previous session — user logged in elsewhere
            context.Fail(new AuthorizationFailureReason(this,
                "Session invalidated. Another login detected for this account."));
            return;
        }

        context.Succeed(requirement);
    }
}

// IActiveSessionStore backed by MongoDB (or Redis for performance)
public interface IActiveSessionStore
{
    Task<string?> GetActiveJtiAsync(string userId);
    Task SetActiveJtiAsync(string userId, string jti, TimeSpan ttl);
    Task RevokeAsync(string userId);
}
```

---

### 18.12 Program.cs — Full Wiring

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// ── Configuration ──────────────────────────────────────────────────────────
builder.Services.Configure<KeycloakOptions>(builder.Configuration.GetSection("Keycloak"));
builder.Services.Configure<MongoDbOptions>(builder.Configuration.GetSection("MongoDB"));
builder.Services.Configure<AuthOptions>(builder.Configuration.GetSection("Auth"));

// ── Multi-Tenant Connection Manager ────────────────────────────────────────
builder.Services.AddSingleton<ITenantConnectionManager, TenantConnectionManager>();
builder.Services.AddSingleton<ITenantConfigRepository, MongTenantConfigRepository>();

// ── Authentication — Keycloak multi-tenant JWT ─────────────────────────────
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.AddSingleton<
    IConfigureNamedOptions<JwtBearerOptions>, 
    TenantJwtBearerConfigureOptions>();

// Claims transformer — maps Keycloak realm_access.roles → ClaimTypes.Role
builder.Services.AddSingleton<IClaimsTransformation, ClinicalClaimsTransformer>();

// ── Authorization ───────────────────────────────────────────────────────────
builder.Services.AddClinicalAuthorization();

builder.Services.AddSingleton<IAuthorizationHandler, StepUpAuthHandler>();
builder.Services.AddSingleton<IAuthorizationHandler, StudyAccessHandler>();
builder.Services.AddSingleton<IAuthorizationHandler, ConcurrentSessionHandler>();

// ── HTTP Context Accessor (needed by middleware and handlers) ───────────────
builder.Services.AddHttpContextAccessor();

// ── Audit ───────────────────────────────────────────────────────────────────
builder.Services.AddScoped<IAuditService, AuditService>();

// ── Active Session Store (concurrent session prevention) ────────────────────
builder.Services.AddSingleton<IActiveSessionStore, MongoActiveSessionStore>();

// ── Health Checks ────────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddMongoDb(builder.Configuration["MongoDB:SharedClusterUri"]!, name: "mongodb-shared")
    .AddUrlGroup(new Uri(builder.Configuration["Keycloak:BaseUrl"]! + "/health/ready"),
                 name: "keycloak");

// ── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("ClinicalEDC", policy =>
        policy
            .WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()!)
            .AllowCredentials()         // needed for httpOnly cookie (refresh token)
            .AllowAnyMethod()
            .WithHeaders("Authorization", "Content-Type", "X-Tenant-Id"));
});

var app = builder.Build();

// ── Pipeline ──────────────────────────────────────────────────────────────────
app.UseHttpsRedirection();

app.UseCors("ClinicalEDC");

// Security headers — clinical data requires strict CSP
app.Use(async (ctx, next) =>
{
    ctx.Response.Headers["X-Frame-Options"]           = "DENY";
    ctx.Response.Headers["X-Content-Type-Options"]    = "nosniff";
    ctx.Response.Headers["Referrer-Policy"]           = "strict-origin-when-cross-origin";
    ctx.Response.Headers["X-XSS-Protection"]          = "1; mode=block";
    ctx.Response.Headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    ctx.Response.Headers["Content-Security-Policy"]   =
        "default-src 'self'; " +
        $"connect-src 'self' {builder.Configuration["Keycloak:BaseUrl"]}; " +
        "img-src 'self' data:; " +
        "frame-ancestors 'none';";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

// Tenant resolution — AFTER auth so JWT is validated, BEFORE route handlers
app.UseTenantContext();

// ── Endpoints ─────────────────────────────────────────────────────────────────
app.MapHealthChecks("/health");
app.MapSignatureEndpoints();
// ... other endpoint groups

app.Run();
```

---

### 18.13 MongoDB Index Strategy — Audit & Performance

```csharp
// Infrastructure/MongoIndexInitializer.cs
// Run at startup to ensure indexes exist on all tenant databases.
// Called per tenant when they are first provisioned.
public class MongoIndexInitializer
{
    public static async Task EnsureIndexesAsync(IMongoDatabase db)
    {
        // Audit events — queried by userId, studyId, and timestamp for FDA inspection
        var auditCollection = db.GetCollection<ClinicalAuditEvent>("audit_events");
        await auditCollection.Indexes.CreateManyAsync([
            new CreateIndexModel<ClinicalAuditEvent>(
                Builders<ClinicalAuditEvent>.IndexKeys
                    .Ascending(e => e.TenantId)
                    .Ascending(e => e.TimestampUtc),
                new CreateIndexOptions { Name = "tenantId_timestamp" }),

            new CreateIndexModel<ClinicalAuditEvent>(
                Builders<ClinicalAuditEvent>.IndexKeys
                    .Ascending(e => e.UserId)
                    .Descending(e => e.TimestampUtc),
                new CreateIndexOptions { Name = "userId_timestamp_desc" }),

            new CreateIndexModel<ClinicalAuditEvent>(
                Builders<ClinicalAuditEvent>.IndexKeys
                    .Ascending(e => e.StudyId)
                    .Ascending(e => e.EventType),
                new CreateIndexOptions { Name = "studyId_eventType" }),
                
            // EventHash uniqueness — cannot insert duplicate audit events
            new CreateIndexModel<ClinicalAuditEvent>(
                Builders<ClinicalAuditEvent>.IndexKeys.Ascending(e => e.EventHash),
                new CreateIndexOptions { Unique = true, Name = "eventHash_unique" })
        ]);

        // User study access — queried on every API request for authz
        var accessCollection = db.GetCollection<UserStudyAccess>("user_study_access");
        await accessCollection.Indexes.CreateManyAsync([
            new CreateIndexModel<UserStudyAccess>(
                Builders<UserStudyAccess>.IndexKeys
                    .Ascending(a => a.UserId)
                    .Ascending(a => a.StudyId),
                new CreateIndexOptions { Unique = true, Name = "userId_studyId_unique" })
        ]);
    }
}
```

---

### 18.14 .NET Stack Summary

```
┌────────────────────────────────────────────────────────────────────┐
│           ASP.NET CORE AUTH STACK — CLINICAL EDC                   │
├───────────────────────────┬────────────────────────────────────────┤
│ Layer                     │ Implementation                         │
├───────────────────────────┼────────────────────────────────────────┤
│ JWT validation            │ Microsoft.AspNetCore.Authentication     │
│                           │ .JwtBearer with dynamic issuer         │
│                           │ resolution per Keycloak realm          │
├───────────────────────────┼────────────────────────────────────────┤
│ JWKS key caching          │ IMemoryCache, 1hr TTL per realm        │
├───────────────────────────┼────────────────────────────────────────┤
│ Claims mapping            │ IClaimsTransformation                  │
│                           │ realm_access.roles → ClaimTypes.Role   │
│                           │ canSign, mfaVerified → clinical claims │
├───────────────────────────┼────────────────────────────────────────┤
│ Tenant resolution         │ Custom middleware: extracts tenantId   │
│                           │ from JWT, looks up TenantConfig,       │
│                           │ attaches IMongoDatabase to HttpContext  │
├───────────────────────────┼────────────────────────────────────────┤
│ Multi-tenancy DB          │ TenantConnectionManager:               │
│                           │ Model C → MongoClient per cluster URI  │
│                           │ Model B → shared MongoClient + per-DB  │
├───────────────────────────┼────────────────────────────────────────┤
│ System RBAC               │ RequireRole() + named policies         │
│                           │ 10 clinical role constants             │
├───────────────────────────┼────────────────────────────────────────┤
│ Study-level authz         │ StudyAccessHandler: checks             │
│                           │ user_study_access MongoDB collection   │
│                           │ per request; site-level restriction    │
├───────────────────────────┼────────────────────────────────────────┤
│ Step-up auth              │ StepUpAuthHandler: checks acr="step-up"│
│                           │ and auth_time within 300s              │
│                           │ Applied via SigningMfaVerified policy  │
├───────────────────────────┼────────────────────────────────────────┤
│ Electronic signatures     │ Minimal API endpoint:                  │
│                           │ validates form data hash (§11.70)      │
│                           │ records signature + meaning (§11.50)  │
│                           │ writes audit event                     │
├───────────────────────────┼────────────────────────────────────────┤
│ Audit trail               │ AuditService: SHA-256 hash-chained     │
│                           │ immutable events in MongoDB            │
│                           │ WriteConcern.WMajority for durability  │
├───────────────────────────┼────────────────────────────────────────┤
│ Concurrent session        │ ConcurrentSessionHandler: jti checked  │
│                           │ against active session store           │
│                           │ (21 CFR §11.10 — no shared logins)    │
├───────────────────────────┼────────────────────────────────────────┤
│ Security headers          │ Inline middleware: X-Frame-Options,    │
│                           │ CSP, HSTS, X-Content-Type-Options      │
├───────────────────────────┼────────────────────────────────────────┤
│ MongoDB indexes           │ MongoIndexInitializer: audit,          │
│                           │ user_study_access — run at provisioning│
└───────────────────────────┴────────────────────────────────────────┘
```

---

**Research Sources:**
- FDA 21 CFR Part 11 (Electronic Records; Electronic Signatures) — Sept 2003 Guidance
- GDPR Articles 5, 25, 30, 32, 33, 35 (gdpr-info.eu)
- OWASP Multifactor Authentication Cheat Sheet 2026
- OWASP Authorization Cheat Sheet 2026
- Keycloak 26.6.2 Server Administration Guide (keycloak.org)
- NIST SP 800-63-3 (Digital Identity Guidelines)
- ICH E6(R3) Good Clinical Practice (ich.org)
- EMA Annex 11 (Computerized Systems)
- HIPAA Security Rule 45 CFR §164.312
