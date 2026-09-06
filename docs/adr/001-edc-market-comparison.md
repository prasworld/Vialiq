# EDC Market Comparison: Vialiq Form Builder Architecture

This report evaluates the initial architectural setup of the **Vialiq Form Builder** against industry standards and leading Electronic Data Capture (EDC) applications in the clinical trials market.

## Architectural Differentiators

Our current setup relies on a highly modern, decoupled architecture:
- **Orchestration:** Angular 21 (Signals, zoneless-ready, strict typing).
- **Leaf UI:** Lit 3 Web Components (Framework agnostic, shadow DOM isolation).
- **Schema Engine:** Pure JSON driven by `@vi/form-builder`.
- **Validation Engine:** `json-logic-js` (Portable rules executable on client, server, and mobile).
- **Drag-and-Drop:** `@atlaskit/pragmatic-drag-and-drop` (Performance-optimized, accessible).

Here is how this setup performs relative to the broader EDC market.

---

## 1. Competitive Matrix

| Feature / Capability | Vialiq (Our Architecture) | Legacy Enterprise (e.g., Medidata Rave, Oracle) | Modern Enterprise (e.g., Veeva Vault EDC) | Agile Cloud EDCs (e.g., Castor, OpenClinica) |
| :--- | :--- | :--- | :--- | :--- |
| **Tech Stack Age** | **Cutting-Edge (2025+)**<br>Angular 21, Signals, Lit Web Components. | **Legacy**<br>Often .NET, older Java, or legacy JS frameworks. | **Modern**<br>React/Angular, but deeply tied to proprietary ecosystems. | **Modern**<br>React/Vue. |
| **Form Rendering Speed** | **Extremely Fast**<br>Virtual DOM overhead bypassed via Signals and Lit Custom Elements. | **Moderate to Slow**<br>Heavy server-side rendering or heavy DOM manipulation. | **Fast**<br>Optimized SPA performance. | **Fast**<br>Standard SPA performance. |
| **Framework Lock-in** | **Low**<br>Web components `<vi-*>` can be ported to React, Vue, or Vanilla JS if needed. | **High**<br>Monolithic, deeply integrated codebases. | **High**<br>Proprietary component libraries. | **Medium**<br>Usually tightly coupled to React or Vue. |
| **Schema Portability** | **High (JSON)**<br>Pure JSON. Can be parsed by iOS, Android, or Node.js backends. | **Low (Proprietary/XML)**<br>Often relies on ODM (Operational Data Model) XML or proprietary DB blobs. | **Medium**<br>JSON, but often tightly coupled to their specific backend logic. | **High (JSON)**<br>Often use JSON schemas. |
| **Validation Rules** | **Universal (`json-logic`)**<br>Rules authored in builder run identically on UI and backend. | **Proprietary / Custom Code**<br>Requires custom functions or proprietary macro languages. | **Proprietary UI builder**<br>Good UI, but engine is black-boxed. | **Standardized**<br>Often good, but rarely portable across microservices. |
| **Extensibility (Custom Fields)** | **High (DI & Registry)**<br>New components injected via Angular DI without altering core builder logic. | **Low**<br>Requires vendor intervention or heavy professional services. | **Medium**<br>Platform limits what can be extended. | **Medium**<br>API integrations, but UI components are hard to inject. |
| **Type Safety & Reliability** | **Absolute (Zero `any`)**<br>Strict TS and discriminated unions prevent entire classes of runtime errors. | **N/A**<br>Reliant on heavy QA and monolithic testing. | **High**<br>Strictly typed, but opaque to clients. | **High**<br>Standard TypeScript practices. |

---

## 2. Deep Dive: Where We Win

### A. The "Micro-Frontend" (MFE) Readiness
By utilizing **Lit 3 Web Components** for the base UI (`<vi-input>`, `<vi-date-picker>`), the form builder and renderer are inherently insulated from framework churn. If the industry shifts away from Angular in 5 years, the core clinical components remain intact and reusable. Legacy EDCs struggle massively with UI modernization because their business logic is intertwined with outdated presentation layers.

### B. Portable Validation (JSON Logic)
In clinical trials, data integrity is paramount. If a validation rule says "Heart rate must be > 60", that rule must execute in the browser (for immediate feedback) and on the backend (for data sanitization). 
- **Competitors:** Often write rules in JS for the frontend and C#/Java for the backend, leading to drift and validation discrepancies. 
- **Vialiq Setup:** Using `json-logic-js` means the exact same JSON rule tree is executed on the client and the server. This drastically reduces validation bugs and simplifies regulatory validation (Computer System Validation / 21 CFR Part 11).

### C. Performance at Scale (Signals + Pragmatic DnD)
CRFs (Case Report Forms) can easily contain 100+ fields with complex skip-logic (conditional visibility).
- Traditional Angular/React apps suffer from "prop-drilling" and massive re-renders when a single field changes.
- **Our Setup:** Angular Signals provide fine-grained reactivity. Updating field #99 does not re-render fields #1-98. Combined with `@atlaskit/pragmatic-drag-and-drop` (which bypasses the HTML5 drag-and-drop API's limitations and avoids heavy CDK overhead), the builder will remain fluid even with massive forms.

### D. Extensibility without Technical Debt
Enterprise clients always want custom fields (e.g., a specific visual analog scale for pain, or a custom ECG viewer). 
Because our `BuilderRegistryService` relies on Angular's Dependency Injection (`multi: true` tokens), custom fields can be injected by a specific tenant's application module without ever modifying the core `@vi/form-builder` library. 

---

## 3. Potential Market Risks & Mitigation

While the architecture is stellar, we must be aware of the following market expectations:

> [!WARNING]
> **CDISC ODM Compatibility**
> **Risk:** The clinical trial industry heavily relies on CDISC ODM (Operational Data Model) XML for data exchange. Our internal schema is JSON.
> **Mitigation:** We must ensure our JSON schema maps cleanly to ODM standards. Following our architecture, we will implement an "external configuration injection" pattern: consuming applications can pass ODM-specific settings (which do not need to be rendered in the core visual designer) directly to the form-builder instance. When the form is saved, these external configurations are appended to the field schema payload and passed cleanly to the backend services.

> [!NOTE]
> **Complex Edit Checks**
> **Risk:** Simple `json-logic` covers 90% of use cases (range checks, required fields). However, clinical trials often require cross-form or cross-visit validation (e.g., "Event date on Form B cannot be earlier than Informed Consent date on Form A").
> **Mitigation:** Ensure our validation engine context can accept external variables (e.g., `formData.visit1.consentDate`) so `json-logic` can evaluate cross-form logic.

## Conclusion

From a software engineering perspective, the initial setup is **tier-1**. It completely avoids the monolithic, tightly-coupled pitfalls of legacy EDCs like Medidata, while offering better performance and framework-agnostic UI than modern competitors. By strictly enforcing code quality (like eliminating all `any` types and utilizing explicit structural typing), the platform is fundamentally designed for the high-compliance, high-reliability requirements of the clinical domain.
