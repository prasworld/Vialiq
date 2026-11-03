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
=============================================================================================================
```

---

## 2. Document Registry

* [**FTS-001: Global Standards Library, Client Library & Study Instantiation Engine**](./001-global-and-client-standards-library-specification.md)
  * Defines the 3-Tier Clinical Form Standards Hierarchy (Platform Global Library, Tenant-Isolated Client Library, Study Instances).
  * Formal 21 CFR Part 11 electronic approval workflow for promoting local study designs to corporate standards.
  * Atomic deep-copy instantiation preserving study protocol stability and clinical trial freezing.
  * Multi-tenant security guards, fail-closed isolation filters, and dual-tier .NET 9 `HybridCache` / Redis namespacing.
