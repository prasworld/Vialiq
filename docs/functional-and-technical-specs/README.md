# Functional & Technical Specifications (FTS) Index

> **Purpose:** Master repository for detailed, cross-cutting Functional Requirements and Technical Implementation Blueprints.  
> **Target Scope:** Vialiq Platform (Frontend, Form Engine, Core Services, Datastores, Security, Caching, and Integrations)  
> **Governance:** Architecture & Engineering Core Team  

---

## 1. Catalog of Functional & Technical Specifications

```
=============================================================================================================
VIALIQ FUNCTIONAL & TECHNICAL SPECIFICATIONS (FTS) INDEX
=============================================================================================================
Spec ID   Title / Domain Area                      Status     Target Subsystems            Key Standards
-------------------------------------------------------------------------------------------------------------
FTS-001   Global & Client Standards Library        APPROVED   Form Builder, API, MongoDB   21 CFR Part 11, CDISC
-------------------------------------------------------------------------------------------------------------
FTS-002   Study-Specific MFE Architecture,         DEFERRED   Module Federation, Shell,    FDA 21 CFR Part 11,
          Cryptographic Signing & Multi-Target     (READY)    API, KMS/HSM, CloudFront/    GAMP 5 Category 5,
          Deployment Specification                            FrontDoor/IIS/NGINX          HIPAA § 164.312
-------------------------------------------------------------------------------------------------------------
FTS-003   Inter-Zone Patient Transfers,            APPROVED   Multi-Region Storage, CDC,   FDA 21 CFR Part 11,
          Multi-National Regulatory Inspections               PDF/XML Exports, RBAC/SOW    EMA Computerised Sys,
          & Study Governance                                  Administration               GDPR, China PIPL/NMPA
=============================================================================================================
```

---

## 2. Document Registry

* [**FTS-001: Global Standards Library, Client Library & Study Instantiation Engine**](./001-global-and-client-standards-library-specification.md)
  * Defines the 3-Tier Clinical Form Standards Hierarchy (Platform Global Library, Tenant-Isolated Client Library, Study Instances).
  * Formal 21 CFR Part 11 electronic approval workflow for promoting local study designs to corporate standards.
  * Atomic deep-copy instantiation preserving study protocol stability and clinical trial freezing.
  * Multi-tenant security guards, fail-closed isolation filters, and Redis namespace isolation.

* [**FTS-002: Study-Specific MFE Creation, Cryptographic Attestation & Multi-Target Deployment Specification**](./002-study-specific-mfe-creation-and-secure-loading-specification.md)
  * End-to-end technical specification for bespoke study-specific micro-frontends (Module Federation).
  * Automated GxP CI/CD security gate: SAST (DOM-XSS, prototype pollution), DAST, and GAMP 5 Category 5 verification.
  * Cryptographic attestation: Asymmetric Private Key signing (Ed25519) and SHA-384 Subresource Integrity (SRI) digest pinning.
  * Backend declarative pre-route authorization attributes (`[Authorize]`, `[RequireStudyRole]`, `[ValidateStudyTenantContext]`).
  * Multi-target enterprise deployment blueprints for **AWS** (S3 + CloudFront + KMS), **Azure** (Blob + Front Door + Key Vault), and **On-Premises** (Windows Server IIS 10 / NGINX + AD CS / Local HSM).
  * Fast local development mode with Docker and HMR support.
  * *Implementation Status:* Specification Complete (Deferred to post-infrastructure baseline).

* [**FTS-003: Inter-Zone Patient Transfers, Multi-National Health Authority Inspections & Study Governance**](./003-inter-zone-patient-transfers-and-multinational-inspections-specification.md)
  * Defines the origin custody preservation and destination linkage workflow (`TRANSFERRED_OUT`, re-consent, `GlobalSubjectGuid` reconciliation in Tier 3 SQL Server) for subjects relocating across US, EU, and China zones.
  * Establishes FDA BIMO, EMA Computerised Systems, and China NMPA inspection readiness: scoped read-only Auditor roles, dual `Base ↔ Site` language display with original investigator verbatim retention, certified bookmarked PDF archival books, and dynamic machine-readable XML/CSV audit exports.
  * Codifies the Pre-Go-Live configuration lock upon `PROD` FPI activation and SOW-flexible governance via the `STUDY_INFRA_CONFIG` RBAC privilege over pre-certified Zone Profiles.
