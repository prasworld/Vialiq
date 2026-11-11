# Form Builder — General Field Configuration & Token Injection Architecture

> **Document ID:** `VIALIQ-FORM-BUILDER-TOKENS-REF`  
> **Status:** Active Architectural Specification  
> **Date:** October 27, 2026  
> **Audience:** Form Builder Developers, Component Authors, Host Application Architects  
> **Related Documents:** [architecture](./form-builder-architecture.md) · [registry](./form-builder-registry.md) · [how-to-extend](./dev/form-builder/03-how-to-extend.md) · [ADR 004](./critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)  

---

> [!NOTE]
> **Scope Notice: Codelists Excluded**  
> Codelist management—including **multilingual translation matrices**, localized prompt dictionaries, and **cascading / hierarchical parent-child codelists** (e.g., Country $\rightarrow$ State $\rightarrow$ Site, or Anatomical System $\rightarrow$ Organ $\rightarrow$ Adverse Event)—is an independent, complex clinical topic and is **strictly excluded from this document**. It will be addressed in a dedicated upcoming architecture specification.

---

## 1. Context & The Core Design Challenge

When an author drags and drops any field (e.g., Text Input, Number, Date, Radio) onto the builder canvas, the right-hand **Field Configuration / Properties Panel** opens to let the author configure that field.

Every clinical form field requires **two distinct categories of configuration**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TOTAL FIELD CONFIGURATION (PROPERTIES PANEL)                           │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. Control-Specific Settings      │ 2. General / Cross-Cutting Settings│
│ (Owned by the Component)          │ (Owned by the Clinical Platform)   │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Placeholder, Rows, Min/Max      │ • Field Key / Variable Name        │
│ • Custom element rendering props  │ • Security & Data Classification   │
│ • Specific widget behaviors       │   (`SiteIdentifier`, `BlindedRTSM`)│
│ • Defined in `ComponentDescriptor`│ • CDISC CDASH Domain & Variable    │
│                                   │ • Source Data Verification (SDV)   │
│                                   │ • Injected dynamically via DI!     │
└───────────────────────────────────┴────────────────────────────────────┘
```

### The Architectural Problem:
If every individual `ComponentDescriptor` (Text, Number, Date, Upload, Signature) was forced to hardcode all general clinical, security, and CDISC fields inside its own `settingsSchema`:
1. **Violates Open/Closed Principle**: Adding a new enterprise attribute (such as `dataClassification` from [ADR 004](./critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md) or a Part 11 audit requirement) would require editing and re-testing dozens of component descriptors across the library.
2. **Couples Core Controls to Clinical Domain**: The core `@vialiq/form-builder` library would become tightly coupled to clinical EDC semantics, making it impossible to reuse in non-clinical portals.
3. **Third-Party Plugin Isolation**: Host applications injecting proprietary custom controls via `BUILDER_COMPONENTS` would lack the standard enterprise clinical properties.

---

## 2. The Solution: Dynamic Property Combination via `EXTENSION_PROVIDERS`

To resolve this cleanly, `@vialiq/form-builder` implements a **Two-Tier Property Combination Engine** powered by Angular's multi-provider token injection:

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Host Application / Clinical Plugin Bootstrap                       │
│    Provides general enterprise configuration via `EXTENSION_PROVIDERS` │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Multi-Provider Injection
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. ExtensionRegistryService (`@Injectable`)                            │
│    • Injects all `EXTENSION_PROVIDERS` instances                       │
│    • Collates and sorts general extension definitions                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Exposes `extensions` Signal Resource
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. SettingsHostComponent (`vi-settings-host`)                          │
│    • When a node is selected on the canvas:                            │
│      a) Reads `descriptor.settingsSchema` (Control-Specific Settings)  │
│      b) Reads `extensionRegistry.extensions` (Injected General Config) │
│      c) Filters by `appliesTo` and `requiredTraits`                    │
│      d) Combines both tiers into unified tabs and sections!            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. The Dependency Injection Contract: `EXTENSION_PROVIDERS`

### 3.1 The Injection Token Definition

```typescript
// libs/form-builder/src/lib/tokens/extension.token.ts
import { InjectionToken } from '@angular/core';
import type { ExtensionProvider } from '../types/extension';

/**
 * Multi-provider token allowing host applications to inject custom extension fields 
 * into the form builder's properties panel.
 */
export const EXTENSION_PROVIDERS = new InjectionToken<ExtensionProvider[]>('EXTENSION_PROVIDERS');
```

---

### 3.2 The `ExtensionFieldDefinition` Interface

This interface defines what configuration metadata is passed along with the token to render controls in the properties panel:

```typescript
// libs/form-builder/src/lib/types/extension.ts
import { Observable } from 'rxjs';
import type { ComponentTraits } from './component-descriptor';

export type ExtensionFieldType = 'text' | 'textarea' | 'select' | 'boolean';

export interface ExtensionFieldDefinition {
  /** 
   * The property key where this value is saved.
   * Stored cleanly inside `schema.metadata[key]`.
   */
  key: string;

  /** UI Label rendered in the properties panel */
  label: string;

  /** The type of input control to render */
  type: ExtensionFieldType;

  /** Options array if type is 'select' */
  options?: { label: string; value: string }[];

  /** Optional explanatory helper text shown below the field */
  description?: string;

  /** 
   * Filter: Component types this applies to (e.g. ['text-input', 'number', 'date']).
   * If omitted or empty, applies globally to ALL components.
   */
  appliesTo?: string[];

  /** 
   * Trait Filter: Only apply to components possessing ALL these traits
   * (e.g. ['isInput']).
   */
  requiredTraits?: (keyof ComponentTraits)[];
  
  // ─── Placement Controls ────────────────────────────────────────────────
  /** 
   * Which tab/section to place this field in.
   * Built-in sections: 'General', 'Security & CDISC', 'Advanced'.
   * If a new section name is provided, a new group/tab is created automatically.
   */
  section: string;

  /** Sort order within the section (lower numbers render first) */
  weight?: number;
}

export interface ExtensionProvider {
  /**
   * Returns extension field definitions for the current builder context.
   * Supports Synchronous Arrays, Promises, or RxJS Observables.
   */
  getExtensions(contextId: string): 
    | ExtensionFieldDefinition[] 
    | Promise<ExtensionFieldDefinition[]> 
    | Observable<ExtensionFieldDefinition[]>;
}
```

---

## 4. How Properties Are Dynamically Combined: `SettingsHostComponent`

When a field is selected on the canvas, `SettingsHostComponent` executes a computed merge:

```typescript
// libs/form-builder/src/lib/properties/settings-host.component.ts

readonly groupedExtensions = computed(() => {
  const allInjectedFields = this.extensionRegistry.extensions.value() || [];
  const schema = this.schema();
  const descriptor = this.descriptor();

  // 1. Filter general extensions applicable to the currently dropped control
  const applicableFields = allInjectedFields.filter((field: ExtensionFieldDefinition) => {
    // Check explicit component type filter
    if (field.appliesTo && field.appliesTo.length > 0) {
      if (!field.appliesTo.includes(schema.type)) return false;
    }
    
    // Check component traits (e.g. isInput, isContainer, isDisplayOnly)
    if (field.requiredTraits && field.requiredTraits.length > 0) {
      const traits = descriptor.traits || {};
      const hasAllTraits = field.requiredTraits.every(t => traits[t]);
      if (!hasAllTraits) return false;
    }
    
    return true;
  });

  // 2. Group into target sections
  const grouped = applicableFields.reduce((acc, field) => {
    const section = field.section || 'Advanced';
    if (!acc[section]) acc[section] = [];
    acc[section].push(field);
    return acc;
  }, {} as Record<string, ExtensionFieldDefinition[]>);

  // 3. Collate into sorted sections
  return Object.entries(grouped).map(([section, fields]) => ({
    section,
    fields: fields.sort((a, b) => (a.weight || 0) - (b.weight || 0))
  }));
});
```

### Schema State Separation:
* **Control-Specific Edits** (e.g., `placeholder`, `min`, `max`, `rows`) mutate the primary schema properties:  
  `schema.placeholder = "Enter systolic BP"`
* **General Injected Configurations** (e.g., `dataClassification`, `cdashDomain`, `sdvRequired`) mutate the namespaced metadata block:  
  `schema.metadata.dataClassification = "ClinicalResearch"`  
  `schema.metadata.cdashDomain = "VS"`

This ensures that general enterprise properties **never pollute or collide with widget-specific property keys**.

> [!IMPORTANT]
> **Backend Ingress Alignment with ADR 004:**  
> Per [ADR 004](./critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md), the backend CDC Ingress Worker (`CdcRecordTransformer`) reads classification specifically from `schema.metadata["dataClassification"]` (with fallback to root `DataClassification` for backward compatibility). If `dataClassification` is missing, unmapped, or null, the worker strictly **fails closed to `DataClassification.Quarantine`**, dropping the field from the SQL Server reporting warehouse and logging an alert to prevent unclassified PII leaks.

---

## 5. Concrete Implementation Example: Clinical Metadata Extension Provider

Here is how a clinical EDC host application provides **General Clinical Configuration** (implementing [ADR 004](./critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)) to **all form fields** via token injection:

> [!NOTE]
> Values written by this provider are serialized under `schema.metadata.dataClassification`. In the backend .NET 9 API, `FormComponentDefinition.GetDataClassification()` inspects this exact `metadata` path.

### 5.1 Define the Clinical Extension Provider

```typescript
// apps/clinical-edc/src/app/form-builder/providers/clinical-metadata.provider.ts

import { Injectable } from '@angular/core';
import type { ExtensionProvider, ExtensionFieldDefinition } from '@vialiq/form-builder';

@Injectable()
export class ClinicalMetadataExtensionProvider implements ExtensionProvider {
  getExtensions(contextId: string): ExtensionFieldDefinition[] {
    return [
      // ─── Security & Data Classification (ADR 004) ──────────────────────
      {
        key: 'dataClassification',
        label: 'Security & Privacy Classification',
        type: 'select',
        section: 'Security & CDISC',
        weight: 10,
        options: [
          { label: 'Clinical Research (Replicated to SQL Server)', value: 'ClinicalResearch' },
          { label: 'Site-Held Patient PII (MRN, Initials - CSFLE in Mongo, DROPPED from SQL)', value: 'SiteIdentifier' },
          { label: 'Blinded RTSM (Masked as "BLINDED" in SQL Server)', value: 'BlindedRTSM' },
        ],
        description: 'Governs Client-Side Field-Level Encryption and CDC pipeline routing (Patient PII, distinct from trial center SITEID).',
        requiredTraits: ['isInput'], // Applies to all data input fields
      },

      // ─── CDISC CDASH Mapping ───────────────────────────────────────────
      {
        key: 'cdashDomain',
        label: 'CDISC CDASH Domain',
        type: 'text',
        section: 'Security & CDISC',
        weight: 20,
        description: 'Target SDTM domain (e.g. DM, VS, LB, AE).',
        requiredTraits: ['isInput'],
      },
      {
        key: 'cdashVariable',
        label: 'CDASH Variable Name',
        type: 'text',
        section: 'Security & CDISC',
        weight: 30,
        description: 'Standard CDISC variable (e.g. SYSBP, DIABP, AGE).',
        requiredTraits: ['isInput'],
      },

      // ─── GCP Source Data Verification (SDV) ───────────────────────────
      {
        key: 'sdvMandatory',
        label: 'Mandatory Source Data Verification (SDV)',
        type: 'boolean',
        section: 'Clinical Monitoring',
        weight: 10,
        description: 'Requires CRA to verify against hospital source records.',
        requiredTraits: ['isInput'],
      },
    ];
  }
}
```

---

### 5.2 Register via `EXTENSION_PROVIDERS` in App Config

```typescript
// apps/clinical-edc/src/app/app.config.ts

import { ApplicationConfig } from '@angular/core';
import { EXTENSION_PROVIDERS } from '@vialiq/form-builder';
import { ClinicalMetadataExtensionProvider } from './form-builder/providers/clinical-metadata.provider';

export const appConfig: ApplicationConfig = {
  providers: [
    // Register the general configuration provider
    {
      provide: EXTENSION_PROVIDERS,
      useClass: ClinicalMetadataExtensionProvider,
      multi: true, // Multi-provider allows chaining multiple providers!
    },
  ],
};
```

---

## 6. Result: What the Form Designer Experiences

When the user drags a **Number Input** onto the canvas:
1. **From `number.descriptor.ts` (Control-Specific)**:
   * Designer sees: `Label`, `Min Value`, `Max Value`, `Step`, `Default Value`.
2. **From `ClinicalMetadataExtensionProvider` (Token Injected General Config)**:
   * Designer sees a new **"Security & CDISC"** section with:
     * `Security & Privacy Classification` dropdown (`ClinicalResearch` / `SiteIdentifier` / `BlindedRTSM`).
     * `CDISC CDASH Domain` and `CDASH Variable Name`.
   * Designer sees a new **"Clinical Monitoring"** section with:
     * `Mandatory Source Data Verification (SDV)` toggle.
3. **If a Layout Component (Columns/Panel) is dropped**:
   * It lacks the `'isInput'` trait $\rightarrow$ `requiredTraits: ['isInput']` filters out the clinical metadata automatically!

---

## 7. Summary Benefits of Token-Injected Configuration

```
=============================================================================================================
GENERAL CONFIGURATION TOKEN INJECTION ARCHITECTURE BENEFITS
=============================================================================================================
Feature                       Hardcoded in Descriptors           Injected via EXTENSION_PROVIDERS (Adopted)
-------------------------------------------------------------------------------------------------------------
Separation of Concerns        Core library coupled to clinical   Core library remains 100% domain-agnostic
Extensibility                 Requires editing dozens of files   Single provider class registered in app config
Trait-Based Scoping           Manual conditionals per descriptor Automatic filtering via `requiredTraits`
Metadata Collision Safety     Risk of property key collisions    All injected config namespaced to `metadata.*`
Third-Party Custom Controls   Custom controls lack enterprise UI Automatically inherit all general config
=============================================================================================================
```
