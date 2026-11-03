# ADR 011: Study-Specific Custom Controls, Dynamic Module Federation Plugin Architecture & Property Composition

> **Document ID:** `VIALIQ-ADR-CRIT-011`  
> **Status:** APPROVED & SEALED  
> **Date:** October 27, 2026  
> **Authors:** Architecture Review Board / Prashant Gupta  
> **Domain:** Micro-Frontend Architecture, Module Federation (Rspack/Webpack), Dynamic Control Registry, Multi-Tenant Custom Widgets  
> **Compliance Standards:** FDA 21 CFR Part 11, GAMP 5 (Category 4 Configurable vs. Category 5 Custom Software), ICH GCP E6(R3)  

---

## 1. Context & The Core Failure Mode

In global clinical trials across 500+ sites and diverse therapeutic areas (Oncology, Dermatology, Cardiology, Ophthalmology), sponsors frequently require **highly specialized, study-specific UI controls**:
* **Dermatology (Plaque Psoriasis)**: An interactive 3D / SVG human body map for calculating the **PASI (Psoriasis Area and Severity Index)** score by tapping anatomical regions.
* **Oncology (Solid Tumors)**: An interactive **RECIST 1.1 Tumor Measurement Caliper** tool with live target lesion sizing.
* **Cardiology (Arrhythmia Trials)**: An interactive **ECG Rhythm Strip Viewer** allowing lead-by-lead caliper interval annotations.
* **Ophthalmology**: A dynamic **ETDRS Visual Acuity Letter Chart** with automated logMAR score calculations.

### The 4 Fatal Flaws of Traditional Monolithic Architectures:
1. **The "Monolithic Bloat" Anti-Pattern**:
   * If every client’s bespoke widget is added into the core `@vialiq/form-builder` library, bundle size explodes exponentially.
   * A vaccine trial with standard questionnaires would unnecessarily download megabytes of oncology tumor calipers and 3D skin maps.
2. **Version Lockstep Churn & Regression Risks**:
   * If Client A requests an update to their lesion map, releasing a new version of `@vialiq/form-builder` forces all 500 other studies across the platform to re-test, migrate, and risk unexpected regressions.
3. **Cross-Tenant Palette Pollution**:
   * A bespoke widget built exclusively for Pfizer must **never appear in the palette of a Roche or Novartis study**. Hardcoding controls in the core library leaks proprietary client tooling.
4. **GAMP 5 Computer System Validation (CSV) Explosion**:
   * Under regulatory GAMP 5 guidelines, modifying the core platform requires massive platform-level re-validation. Bespoke client widgets must be isolated to prevent triggering re-validation of the core EDC engine.

---

## 2. Fundamental Architectural Decisions

```
=============================================================================================================
VIALIQ DYNAMIC MODULE FEDERATION PLUGIN ARCHITECTURE (ADR 011)
=============================================================================================================
Core Principle                     Technical Specification                   Operational & Compliance Benefit
-------------------------------------------------------------------------------------------------------------
1. Module Federation Remotes       Bespoke study widgets live in isolated    Zero bundle bloat for other studies;
   (e.g., `remote1`)               micro-frontends (e.g. `apps/remote1`).    100% decoupled compilation.
-------------------------------------------------------------------------------------------------------------
2. Eager Study-Scoped Loading      Remotes loaded dynamically only when the  Zero palette pollution; strict
                                   authenticated study/tenant mounts.        multi-tenant client isolation.
-------------------------------------------------------------------------------------------------------------
3. DI Token Multi-Provider         Remotes register descriptors via the      Core `@vialiq/form-builder` stays
   (`BUILDER_COMPONENTS`)          `BUILDER_COMPONENTS` InjectionToken.      100% domain-agnostic and zero-touch.
-------------------------------------------------------------------------------------------------------------
4. Two-Tier Property Composition   Host injects General Clinical Governance; Remotes only code widget settings;
                                   Remote provides control-specific fields;  automatically inherit Part 11,
                                   `SettingsHostComponent` merges both.      `dataClassification`, & CDISC tags.
-------------------------------------------------------------------------------------------------------------
5. GAMP 5 Category 4/5 Boundary    Core builder is GAMP 5 Category 4;        Study widgets are validated in
                                   Bespoke remotes are GAMP 5 Category 5.    isolation; core CSV is untouched.
=============================================================================================================
```

---

### Decision 1: Micro-Frontend Plugin Architecture via Module Federation

The base form builder (`@vialiq/form-builder`) and form renderer (`@vialiq/form-renderer`) remain **100% domain-agnostic, stable, and version-frozen**.

Bespoke study-specific widgets are built as **Federated Remote Modules** (e.g., `apps/remote1`):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SHELL APPLICATION: Vialiq Clinical EDC Platform                                       │
│ • Mounts Core `@vialiq/form-builder` (GAMP 5 Category 4 Core Platform)                 │
│ • Injects Host Clinical Governance Tokens (Security, Part 11 Audit, CDISC)             │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                  [User Opens Study #101]
                                  [Study metadata requires 'pasi-map']
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ DYNAMIC REMOTE LOADER (Module Federation)                                              │
│ • Fetches `https://cdn.vialiq.io/plugins/study-101/remoteEntry.js`                     │
│ • Mounts `apps/remote1` into Angular Dependency Injection context                      │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ DYNAMIC PALETTE & PROPERTIES REGISTRATION                                              │
│ 1. Remote provides `{ provide: BUILDER_COMPONENTS, useValue: PasiMapDesc, multi: true }│
│ 2. Builder Registry detects new component -> Appears in Palette for Study #101 ONLY!   │
│ 3. SettingsHostComponent merges widget-specific settings with Host Governance settings │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Decision 2: Zero-Touch Versioning & GAMP 5 CSV Isolation

```
┌─────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│              CORE FORM BUILDER PLATFORM                 │            STUDY-SPECIFIC FEDERATED REMOTES            │
│                 (GAMP 5 Category 4)                     │                  (GAMP 5 Category 5)                   │
├─────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ • Package: `@vialiq/form-builder`                       │ • Package: `apps/remote1`, `apps/study-recist-remote`  │
│ • Release Frequency: Quarterly / Bi-annually            │ • Release Frequency: Ad-hoc per study protocol         │
│ • CSV Validation: Platform Validation Package           │ • CSV Validation: Scoped Study Validation Addendum     │
│ • Scope: Shared across all 500+ studies globally        │ • Scope: Isolated strictly to Study #101               │
│ • Impact of Client Change: ZERO VERSION BUMP REQUIRED   │ • Impact of Client Change: Isolated remote deployment  │
└─────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

### Decision 3: The Two-Tier Property Composition Protocol

When a study-specific remote control is dropped onto the canvas, **how does it get both its bespoke settings AND standard enterprise clinical governance?**

The Form Builder solves this via **Two-Tier Property Composition**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TOTAL ASSEMBLED PROPERTIES PANEL (`SettingsHostComponent`)                             │
├────────────────────────────────────────────┬───────────────────────────────────────────┤
│ Tier 1: Host Governance (Injected by Shell)│ Tier 2: Bespoke Settings (From Remote)    │
├────────────────────────────────────────────┼───────────────────────────────────────────┤
│ • Variable Key (SAS / CDISC Variable)      │ • Number of Body Regions (1 to 10)        │
│ • Field Label & Helper Description         │ • Lesion Severity Scale (Mild / Severe)   │
│ • `dataClassification` (ADR 004):          │ • Enable Touch Calibration / Stylus Mode  │
│   (`ClinicalResearch`, `SiteIdentifier`,   │ • Allow Freehand Lesion Drawing           │
│    `BlindedRTSM`)                          │                                           │
│ • CDISC CDASH Mapping (Domain & Var)       │                                           │
│ • Mandatory Source Data Verification (SDV) │                                           │
│ • 21 CFR Part 11 Audit Trail Enforcement   │                                           │
└────────────────────────────────────────────┴───────────────────────────────────────────┘
```

#### Why This Composition is Essential:
* The remote developer **never has to re-invent or copy-paste clinical governance fields**.
* If the platform introduces a new regulatory rule (e.g., FDA electronic consent verification), **every study remote automatically inherits it without code changes**.

---

## 3. Concrete Implementation Specifications

### 3.1 The Remote Module Descriptor (`apps/remote1`)

The remote only declares what is unique to its widget:

```typescript
// apps/remote1/src/app/descriptors/lesion-map.descriptor.ts
import type { ComponentDescriptor } from '@vialiq/form-builder';

export const PasiLesionMapDescriptor: ComponentDescriptor = {
  type: 'pasi-lesion-map',
  label: 'PASI Body Lesion Map',
  category: 'clinical-specialty',
  icon: 'user',
  weight: 10,

  traits: {
    isInput: true,     // Signal that this widget collects clinical patient data
    hasValue: true,
  },

  defaultSchema: {
    type: 'pasi-lesion-map',
    label: 'Psoriasis Body Surface Area Assessment',
    allowDraw: true,
    minRegions: 1,
  },

  // Bespoke settings unique to this study widget
  settingsSchema: {
    tabs: [
      {
        id: 'widget-config',
        label: 'Lesion Map Settings',
        fields: [
          { key: 'allowDraw', label: 'Allow Freehand Drawing', type: 'checkbox' },
          { key: 'minRegions', label: 'Minimum Required Regions', type: 'number', defaultValue: 1 },
          { key: 'severityScale', label: 'Severity Scale Metric', type: 'select', options: [
              { label: '0-4 Point Erythema Scale', value: 'erythema-4' },
              { label: '0-6 Point Induration Scale', value: 'induration-6' },
            ] 
          },
        ],
      },
    ],
  },

  canvasElement: 'vi-pasi-lesion-map',
  rendererRef: {
    kind: 'angular',
    component: () => import('../components/lesion-map.component').then(m => m.LesionMapComponent),
  },
};
```

---

### 3.2 Dynamic Registration in `apps/remote1/src/app/app.config.ts`

```typescript
// apps/remote1/src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { BUILDER_COMPONENTS } from '@vialiq/form-builder';
import { PasiLesionMapDescriptor } from './descriptors/lesion-map.descriptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // Register study-specific control into the multi-provider token
    {
      provide: BUILDER_COMPONENTS,
      useValue: PasiLesionMapDescriptor,
      multi: true,
    },
  ],
};
```

---

### 3.3 Shell Dynamic Module Federation Ingress (`StudyPluginLoaderService.cs`)

When a user switches studies in the EDC workspace:

```typescript
// apps/edc-shell/src/app/services/study-plugin-loader.service.ts
import { Injectable, inject } from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { BuilderRegistryService } from '@vialiq/form-builder';

@Injectable({ providedIn: 'root' })
export class StudyPluginLoaderService {
  private registry = inject(BuilderRegistryService);

  async loadStudyPlugins(studyId: string, plugins: StudyPluginConfig[]): Promise<void> {
    for (const plugin of plugins) {
      try {
        // Dynamically import the remote entry based on study configuration
        const remoteModule = await loadRemoteModule({
          type: 'module',
          remoteEntry: plugin.remoteEntryUrl, // e.g. https://cdn.vialiq.io/studies/101/remoteEntry.js
          exposedModule: './PluginModule',
        });

        // Register any exported descriptors into the active Builder Registry
        if (remoteModule.STUDY_DESCRIPTORS) {
          this.registry.registerDynamicComponents(remoteModule.STUDY_DESCRIPTORS);
        }
      } catch (err) {
        console.error(`[StudyPluginLoader] Failed to load remote for study ${studyId}:`, err);
      }
    }
  }
}
```

---

## 4. Multi-Tenant Security & Isolation Matrix

```
=============================================================================================================
STUDY-SPECIFIC PLUGIN ISOLATION & COMPLIANCE MATRIX
=============================================================================================================
Dimension                      Core Form Builder                  Study Remote (`remote1`)
-------------------------------------------------------------------------------------------------------------
Repository Location            `libs/form-builder` (Monorepo)     `apps/remote1` (Isolated Remote)
Deployment Artifact            Core Web App / Library Bundle      Standalone CDN remoteEntry.js
Multi-Tenant Visibility        Available to all tenants/studies   Mounted ONLY for authorized Study ID
Bundle Size Impact             Zero extra bytes in core bundle    Loaded on-demand only when study opened
GAMP 5 CSV Scope               Annual Platform Validation         Study Protocol Validation Addendum
Rollback Capability            Standard platform deployment       Instant CDN version pin/rollback
=============================================================================================================
```

---

## 5. Decision Consequences

### Positive Consequences:
1. **Zero Base Product Version Churn**: The core `@vialiq/form-builder` package is never modified or released just to satisfy a single client's custom widget request.
2. **Infinite Clinical Extensibility**: Any clinical trial can build custom body maps, calculators, or hardware visualizers without constraints.
3. **Zero Bundle Bloat**: Studies that do not use bespoke controls never download a single byte of unused remote code.
4. **Complete Regulatory Lineage**: Remotes automatically inherit 21 CFR Part 11 auditing, data classification, and CDISC annotations from the shell.

### Trade-offs & Mitigations:
1. **Network Dependency for Remotes**: If a study remote is hosted on a CDN, an outage could prevent the custom control from loading.
   * *Mitigation:* Remote artifacts are hosted on high-availability AWS CloudFront / Azure Front Door with immutable SHA-256 version pinning and offline Service Worker caching.
2. **Contract Drift between Remote and Core**:
   * *Mitigation:* Remotes build against the shared `@vialiq/form-builder` TypeScript interfaces in the monorepo, guaranteeing compile-time type safety.
