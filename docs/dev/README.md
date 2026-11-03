# Vialiq EDC — Developer Hub & Documentation Index

Welcome to the **Vialiq EDC Developer Documentation Hub**. This directory provides technical guides, setup instructions, architecture references, and engineering task backlogs for engineers contributing to the platform.

---

## Developer Document Catalog

```
docs/dev/
├── README.md                                             # You are here (Developer Hub Index)
│
├── development-architecture-and-setup-guide.md          # VIALIQ-DEV-001: 3-Minute Quickstart & Architecture
├── to-do-task-list.md                                   # Master Engineering Backlog (Sections 1 through 12)
├── local-publishing.md                                  # Guide for publishing and linking local Nx packages
└── xss-prevention-plan.md                               # Clinical Form Renderer Security & XSS Sanitization
```

---

## Quick Navigation

### 🚀 [Development Architecture & Setup Guide](./development-architecture-and-setup-guide.md)
* **Start here** if you are setting up your development machine or running the stack for the first time.
* Covers the 3-minute fast path (`npm run dev:infra`, `npm run dev:doctor`), the 3 hybrid workflows, and full connection strings.

### 📋 [Master Engineering Task List (Backlog)](./to-do-task-list.md)
* Detailed, numbered task breakdown across all components:
  * **Section 1–10:** UI Components, Form Builder, Accessibility, Lit `<vi-*>` components.
  * **Section 11:** Database Architecture, BSON Schemas, Codelists, MedDRA/WHODrug, Liquibase & CDC SDTM Pipeline.
  * **Section 12:** Web & API Enterprise Deployment Framework (Linux/K8s & Windows Server/IIS).

### 📦 [Local Publishing Guide](./local-publishing.md)
* How to test and publish monorepo libraries (e.g. `@vialiq/web-components`, `@vialiq/automapper`) locally via Verdaccio or tarballs.

### 🛡️ [XSS Prevention & Clinical Security Plan](./xss-prevention-plan.md)
* Standards for DOM sanitization, safe HTML rendering, and script evaluation inside the dynamic form renderer.

