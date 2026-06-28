# Form Builder — Custom Programming Implementation Guide

> **Status:** Architecture Design — Dynamic Validator Loading System  
> **Date:** 2026-05-29  
> **Audience:** Platform architects, study-level developers, build engineers  
> Related docs: [use-cases](./form-builder-custom-programming-use-cases.md) · [custom-validators SDK](./form-builder-custom-validators.md) · [validation](./form-builder-validation.md)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture — Dynamic Validator Loading](#2-architecture--dynamic-validator-loading)
3. [Development Workflow](#3-development-workflow)
4. [Study Workspace Structure](#4-study-workspace-structure)
5. [Build & Deployment Pipeline](#5-build--deployment-pipeline)
6. [Visual Programming Interface](#6-visual-programming-interface)
7. [Testing Framework Integration](#7-testing-framework-integration)
8. [Oncology Study Example — End-to-End](#8-oncology-study-example--end-to-end)
9. [Security & Sandboxing](#9-security--sandboxing)
10. [Troubleshooting & Debug Tools](#10-troubleshooting--debug-tools)

---

## 1. Overview

### 1.1 The Problem

**Scenario:** ViaLiq EDC Platform v1 is live. A pharmaceutical client is configuring an Oncology Phase III study. Form and visit schedules are designed in the Form Builder UI. Now the client's programming team needs to implement **custom validators** and **edit checks** specific to their protocol.

**Requirements:**
- ✅ Client develops validators in **TypeScript** in their own dev environment
- ✅ Validators are **built and tested** before deployment
- ✅ Output (compiled JS) is **lazy-loaded** at runtime — no rebuild of the base platform
- ✅ Validators access platform services via **Angular dependency injection**
- ✅ **Visual programming** interface for low-code/no-code users
- ✅ Both **client-side** (browser UX) and **server-side** (C# Web API) implementations

This document focuses on **client-side implementation** (TypeScript/Angular). For server-side:
- **[Validator Library](./form-builder-server-side-validator-library.md)** — Pre-built, configurable validators (no coding required)
- **[Server-Side Implementation](./form-builder-custom-programming-server-side.md)** — Custom validator development in C# .NET

### 1.2 The Solution — Three Development Paths

| Persona | Tool | Output | Use case |
|---|---|---|---|
| **Data Manager** (no code) | Visual Builder (Google Blockly) | JSON logic → Auto-generated TS | Simple checks: required-if, range, format |
| **Clinical Programmer** (TS beginner) | SDK Templates + Copilot | Hand-written TS validators | Medium complexity: cross-field, conditional |
| **Software Engineer** (advanced) | Full TypeScript IDE | Complex class-based validators | Advanced: DI services, async lookups, instruments |

All three paths converge into a **single build pipeline** that produces a **lazy-loadable Angular module**.

---

## 2. Architecture — Dynamic Validator Loading

### 2.1 Runtime Loading Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Study App (Angular)                                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ FormRendererComponent                                        │  │
│  │  ├─ ValidationEngine (injected)                              │  │
│  │  │   ├─ Built-in validators (platform)                       │  │
│  │  │   └─ Custom validators (lazy-loaded)                      │  │
│  │  │                                                            │  │
│  │  └─ On form load:                                            │  │
│  │      1. Check schema.validation[] for custom validators      │  │
│  │      2. If custom validators present → load bundle           │  │
│  │      3. Import: `/assets/validators/study-XYZ-001.bundle.js` │  │
│  │      4. Register validators with ValidationEngine            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
                    ┌─────────────────────────┐
                    │ CDN / Static Assets     │
                    │ /assets/validators/     │
                    │  └─ study-XYZ-001.      │
                    │     bundle.js           │
                    │     (150 KB gzipped)    │
                    └─────────────────────────┘
```

### 2.2 Key Architectural Decisions

#### Decision 1: Lazy Loading, Not Rebuild

❌ **Rejected approach:** Validators are part of the main Angular bundle — requires rebuild and redeployment of the platform for every study.

✅ **Adopted approach:** Validators are compiled into a **separate JavaScript bundle** and loaded on-demand via `import()` when a form with custom validators is opened.

**Benefits:**
- Platform and study code are fully decoupled
- Multiple studies can coexist with different validator versions
- Study programmers work in isolation — no cross-contamination
- Platform can be updated independently of study validators

#### Decision 2: Webpack Module Federation (Adopted)

✅ **Adopted:** Webpack Module Federation with version pinning.

**Why Module Federation over Dynamic Import:**
- **Version safety**: Platform exposes shared modules (`@angular/core`, SDK) at runtime — client bundles pull exact versions from host
- **No version skew**: Build fails if client expects SDK v1.2 but platform provides v1.1
- **Smaller bundles**: Shared dependencies not duplicated in client bundle (50-70% size reduction)
- **Graceful degradation**: Platform can detect incompatible bundles at load time and show error UI

**Trade-offs accepted:**
- More complex build config (Webpack federation plugin)
- Federation runtime overhead (~20 KB)
- Client must rebuild when platform updates major versions

**Module Federation Contract:**

```typescript
// Platform exposes shared modules
module.exports = {
  name: 'vialiq_edc_platform',
  filename: 'remoteEntry.js',
  exposes: {},
  shared: {
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: '21.1.0' },
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: '21.1.0' },
    '@vialiq/form-validator-sdk': { singleton: true, strictVersion: true, requiredVersion: '^1.1.0' },
    '@vialiq/form-renderer': { singleton: true, strictVersion: false },
    '@vi/state-fp': { singleton: true, strictVersion: true, requiredVersion: '^2.0.0' },
  },
};

// Client consumes shared modules
module.exports = {
  name: 'study_xyz_001_validators',
  filename: 'remoteEntry.js',
  exposes: {
    './validators': './src/index.ts',
  },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: '21.1.0' },
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: '21.1.0' },
    '@vialiq/form-validator-sdk': { singleton: true, strictVersion: true, requiredVersion: '^1.1.0' },
    '@vi/state-fp': { singleton: true, strictVersion: true, requiredVersion: '^2.0.0' },
  },
};
```

#### Decision 3: Validators Are Injectable Angular Services

Each custom validator is an **Angular service** that can `inject()` platform services:

```typescript
import { Injectable, inject } from '@angular/core';
import { STUDY_METADATA, CustomValidator, RuleResult, fail, pass } from '@vialiq/form-validator-sdk';
import { CodelistService } from '@vialiq/form-renderer'; // Platform service

@Injectable()
export class MeddraLookupValidator extends CustomValidator {
  private readonly codelistService = inject(CodelistService);
  private readonly meta = inject(STUDY_METADATA);

  validate(value: unknown): RuleResult {
    const code = String(value);
    const valid = this.codelistService.isValidMedDRACode(code, this.meta.meddraVersion);
    return valid ? pass() : fail(`MedDRA code ${code} not found in version ${this.meta.meddraVersion}`);
  }
}
```

The platform provides a **sandboxed injector** to the validator bundle at load time.

---

### 2.3 Lazy Loading Implementation — Platform Side

**Step 1: FormRendererComponent detects custom validators in schema**

```typescript
// libs/form-renderer/src/lib/form-renderer.component.ts
export class FormRendererComponent implements OnInit {
  private readonly validatorLoader = inject(CustomValidatorLoaderService);
  private readonly validationEngine = inject(ValidationEngine);

  async ngOnInit() {
    const schema = this.formSchema(); // Signal<FormSchema>
    
    // Scan for custom validators
    const customValidatorIds = this.extractCustomValidatorIds(schema);
    
    if (customValidatorIds.length > 0) {
      const studyId = this.studyMeta().studyId; // 'XYZ-001'
      await this.validatorLoader.loadStudyValidators(studyId);
    }
    
    // Continue normal init...
  }

  private extractCustomValidatorIds(schema: FormSchema): string[] {
    const ids: Set<string> = new Set();
    for (const field of schema.fields) {
      for (const rule of field.validation ?? []) {
        if (rule.type === 'custom') {
          ids.add(rule.ruleId);
        }
      }
    }
    return Array.from(ids);
  }
}
```

**Step 2: CustomValidatorLoaderService — Module Federation Loader**

```typescript
// libs/form-renderer/src/lib/services/custom-validator-loader.service.ts
import { Injectable, inject, Injector, EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { ValidationEngine } from './validation-engine.service';
import { loadRemoteModule } from '@angular-architects/module-federation';

interface StudyValidatorBundle {
  /** Map of validator ID → validator factory or class */
  readonly validators: Record<string, ValidatorFactory | Type<CustomValidator>>;
  /** Angular providers needed by the validators (if any) */
  readonly providers?: Provider[];
  /** Bundle version for telemetry */
  readonly version: string;
}

@Injectable({ providedIn: 'root' })
export class CustomValidatorLoaderService {
  private readonly rootInjector = inject(EnvironmentInjector);
  private readonly validationEngine = inject(ValidationEngine);
  private readonly loadedStudies = new Map<string, string>(); // studyId → version
  private readonly httpClient = inject(HttpClient);

  async loadStudyValidators(studyId: string): Promise<void> {
    const loadedVersion = this.loadedStudies.get(studyId);
    if (loadedVersion) {
      console.log(`[CustomValidatorLoader] Validators for ${studyId} v${loadedVersion} already loaded`);
      return;
    }

    console.log(`[CustomValidatorLoader] Loading validators for study ${studyId}...`);

    try {
      // Step 1: Get study config (includes pinned validator version)
      const studyConfig = await this.getStudyConfig(studyId);
      const version = studyConfig.validatorBundleVersion;

      if (!version) {
        console.warn(`[CustomValidatorLoader] No validator bundle configured for ${studyId}`);
        return;
      }

      // Step 2: Get SAS token for Azure Blob access
      const sasToken = await this.getSasToken(studyId, version);

      // Step 3: Load remote module via Module Federation
      const bundleUrl = `https://vialiqvalidators.blob.core.windows.net/validator-bundles/` +
                        `study-${studyId}/v${version}/remoteEntry.js?${sasToken}`;

      const container = await loadRemoteModule({
        type: 'module',
        remoteEntry: bundleUrl,
        remoteName: `study_${studyId.replace(/-/g, '_')}_validators`,
        exposedModule: './validators',
      });

      const bundle = container.default as StudyValidatorBundle;

      // Step 4: Verify version compatibility
      if (bundle.version !== version) {
        throw new Error(
          `Version mismatch: expected ${version}, got ${bundle.version}`
        );
      }

      // Step 5: Create a sandboxed injector for the validators
      const studyInjector = createEnvironmentInjector(
        bundle.providers ?? [],
        this.rootInjector
      );

      // Step 6: Register each validator with the ValidationEngine
      let registeredCount = 0;
      for (const [ruleId, validatorDef] of Object.entries(bundle.validators)) {
        this.validationEngine.registerCustomValidator(ruleId, validatorDef, studyInjector);
        registeredCount++;
        console.log(`[CustomValidatorLoader] Registered: ${ruleId}`);
      }

      this.loadedStudies.set(studyId, version);
      
      console.log(
        `[CustomValidatorLoader] ✓ Study ${studyId} validators v${version} loaded successfully ` +
        `(${registeredCount} validators)`
      );

      // Telemetry
      this.trackEvent('ValidatorBundleLoaded', {
        studyId,
        version,
        validatorCount: registeredCount,
      });

    } catch (error) {
      console.error(`[CustomValidatorLoader] ✗ Failed to load validators for ${studyId}:`, error);
      
      // Send alert to study admin + platform team
      await this.sendAlert({
        severity: 'critical',
        studyId,
        error: error.message,
      });

      // Telemetry
      this.trackException('ValidatorBundleLoadFailed', {
        studyId,
        error: error.message,
      });

      // Fail-open: log error but don't crash the form
      // Server-side validation will catch any issues
      throw new Error(
        `Custom validators for study ${studyId} could not be loaded. ` +
        `Client-side validation is unavailable. Server-side validation will still apply.`
      );
    }
  }

  private async getStudyConfig(studyId: string): Promise<StudyConfig> {
    return firstValueFrom(
      this.httpClient.get<StudyConfig>(`/api/studies/${studyId}/config`)
    );
  }

  private async getSasToken(studyId: string, version: string): Promise<string> {
    const response = await firstValueFrom(
      this.httpClient.post<{ token: string }>('/api/validator-bundles/token', {
        studyId,
        version,
      })
    );
    return response.token;
  }

  private async sendAlert(alert: Alert): Promise<void> {
    await firstValueFrom(
      this.httpClient.post('/api/alerts', alert)
    );
  }

  private trackEvent(name: string, properties: Record<string, unknown>): void {
    // Send to Azure Application Insights
    (window as any).appInsights?.trackEvent({ name, properties });
  }

  private trackException(name: string, properties: Record<string, unknown>): void {
    (window as any).appInsights?.trackException({ error: new Error(name), properties });
  }
}
```

**Step 3: ValidationEngine — Register and Execute Custom Validators**

```typescript
// libs/form-renderer/src/lib/services/validation-engine.service.ts
@Injectable() // Scoped per FormRendererComponent
export class ValidationEngine {
  private readonly customValidators = new Map<string, {
    factory: ValidatorFactory | Type<CustomValidator>,
    injector: EnvironmentInjector
  }>();

  registerCustomValidator(
    ruleId: string,
    validatorDef: ValidatorFactory | Type<CustomValidator>,
    injector: EnvironmentInjector
  ): void {
    if (this.customValidators.has(ruleId)) {
      console.warn(`[ValidationEngine] Validator ${ruleId} already registered — skipping duplicate`);
      return;
    }
    this.customValidators.set(ruleId, { factory: validatorDef, injector });
  }

  /** Execute a custom validator */
  private executeCustomValidator(
    ruleId: string,
    params: Record<string, unknown>,
    value: unknown,
    formData: Record<string, unknown>,
    meta: StudyMeta
  ): RuleResult {
    const entry = this.customValidators.get(ruleId);
    if (!entry) {
      console.error(`[ValidationEngine] Custom validator ${ruleId} not found — failing open`);
      return pass(); // Fail-open if validator is missing
    }

    try {
      if (typeof entry.factory === 'function') {
        // Pure function validator
        const validatorFn = entry.factory(params);
        return validatorFn(value, formData, meta);
      } else {
        // Class-based validator
        const instance = entry.injector.get(entry.factory);
        return instance.validate(value, formData, meta);
      }
    } catch (error) {
      console.error(`[ValidationEngine] Validator ${ruleId} threw an error:`, error);
      return pass(); // Fail-open on exception
    }
  }
}
```

---

### 2.4 Bundle Contract — Study Side

The study's validator bundle must export a default object matching this interface:

```typescript
// study-validators/src/index.ts (entry point)
import type { StudyValidatorBundle } from '@vialiq/form-validator-sdk';
import { bmiConsistency } from './validators/bmi-consistency.validator';
import { recistTargetLesion } from './validators/recist-target-lesion.validator';
import { ecogPerformanceStatus } from './validators/ecog-performance-status.validator';
import { CodelistService } from './services/codelist.service'; // Study-specific service

const bundle: StudyValidatorBundle = {
  validators: {
    'bmiConsistency': bmiConsistency,
    'recistTargetLesion': recistTargetLesion,
    'ecogPerformanceStatus': ecogPerformanceStatus,
  },
  providers: [
    CodelistService, // Study-specific provider available to validators
  ],
};

export default bundle;
```

This file is the **entry point** for the build pipeline (see §5).

---

## 3. Development Workflow

### 3.1 Study Team Roles

| Role | Responsibility | Tools |
|---|---|---|
| **Data Manager** | Define edit checks using visual builder | Visual Builder UI (Blockly) |
| **Clinical Programmer** | Write TS validators from templates | VS Code + SDK templates |
| **QA Engineer** | Write test cases, run validator tests | Vitest + `runValidator()` |
| **Build Engineer** | Build, version, deploy validator bundle | CI/CD pipeline (GitHub Actions) |

### 3.2 Development Environment Setup

**Prerequisites:**
- Node.js 20+
- VS Code with Angular Language Service
- Git/GitHub access
- ViaLiq Platform account with study admin role

**Step 1: Obtain starter project**

Two methods available:

**Option A: GitHub Template (recommended for developers)**

```bash
# 1. Navigate to GitHub template repository
#    https://github.com/vialiq/validator-starter-template
# 2. Click "Use this template" → "Create a new repository"
# 3. Name it: study-XYZ-001-validators
# 4. Clone your new repo
git clone https://github.com/your-org/study-XYZ-001-validators.git
cd study-XYZ-001-validators
```

**Option B: Platform UI Download (for non-developers)**

```
1. Log in to ViaLiq EDC Platform
2. Navigate to: Study XYZ-001 → Admin → Custom Programming
3. Click "Download Starter Project"
4. Extract ZIP file
5. cd study-XYZ-001-validators
```

**Step 2: Install study metadata package**

Each study has a published NPM package containing schema, metadata, and mock platform services:

```bash
npm install @vialiq-studies/xyz-001-metadata@latest
```

This package provides:
- Form schemas for all study forms
- Study metadata (protocol version, sites, visits)
- Mock platform services (CodelistService, ValidationEngine)
- FP helper functions for common calculations
- TypeScript types for all domain models

**Step 3: Install dependencies**

```bash
npm install
```

**Step 2: Workspace structure** (see §4 for full structure)

```
study-XYZ-001-validators/
├── src/
│   ├── validators/          # Hand-written validators
│   ├── generated/           # Auto-generated from Visual Builder
│   ├── services/            # Study-specific services
│   └── index.ts             # Bundle entry point
├── test/
│   └── validators/          # Test files
├── package.json
├── tsconfig.json
├── vite.config.ts           # Build config
└── vitest.config.ts         # Test config
```

**Step 3: Run development mode**

```bash
npm run dev
# Watches src/ and rebuilds on change
# Output: dist/study-XYZ-001.bundle.js
```

**Step 4: Run tests**

```bash
npm test
# Runs all validator test files via Vitest
```

**Step 5: Build for production**

```bash
npm run build
# Output: dist/study-XYZ-001.bundle.js (minified, tree-shaken)
```

---

### 3.3 Day-to-Day Developer Experience

**Scenario:** Clinical programmer needs to add a new validator — "ECOG Performance Status must be 0–5".

**Step 1: Create validator file**

```bash
npm run create:validator -- --name ecog-ps
# Scaffolds: src/validators/ecog-ps.validator.ts
```

**Step 2: Implement validator**

```typescript
// src/validators/ecog-ps.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates that ECOG Performance Status is within 0–5 range.
 * ECOG PS is a standard oncology assessment scale.
 * 0 = Fully active, 5 = Dead.
 */
export const ecogPerformanceStatus: ValidatorFactory = (params) => {
  return (value) => {
    if (value === null || value === undefined || value === '') return pass();

    const score = Number(value);
    if (!Number.isInteger(score)) {
      return fail('ECOG Performance Status must be a whole number');
    }

    if (score < 0 || score > 5) {
      return fail(`ECOG PS must be 0–5 (entered: ${score})`);
    }

    return pass();
  };
};
```

**Step 3: Write test**

```typescript
// test/validators/ecog-ps.validator.spec.ts
import { describe, it, expect } from 'vitest';
import { runValidator } from '@vialiq/form-validator-sdk/testing';
import { ecogPerformanceStatus } from '../../src/validators/ecog-ps.validator';

describe('ecogPerformanceStatus', () => {
  const validator = ecogPerformanceStatus({});

  it('accepts valid ECOG PS 0–5', () => {
    for (let i = 0; i <= 5; i++) {
      const result = runValidator(validator, i, {}, {});
      expect(result.isValid).toBe(true);
    }
  });

  it('rejects ECOG PS < 0', () => {
    const result = runValidator(validator, -1, {}, {});
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('must be 0–5');
  });

  it('rejects ECOG PS > 5', () => {
    const result = runValidator(validator, 6, {}, {});
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('must be 0–5');
  });

  it('rejects non-integer values', () => {
    const result = runValidator(validator, 2.5, {}, {});
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('must be a whole number');
  });

  it('passes for empty value (fail-open)', () => {
    const result = runValidator(validator, null, {}, {});
    expect(result.isValid).toBe(true);
  });
});
```

**Step 4: Run test**

```bash
npm test -- ecog-ps
# ✓ test/validators/ecog-ps.validator.spec.ts (5 tests) 12ms
```

**Step 5: Register in bundle**

```typescript
// src/index.ts
import { ecogPerformanceStatus } from './validators/ecog-ps.validator';

const bundle: StudyValidatorBundle = {
  validators: {
    // ... existing validators
    'ecogPerformanceStatus': ecogPerformanceStatus, // Add here
  },
};

export default bundle;
```

**Step 6: Build and commit**

```bash
npm run build
git add .
git commit -m "feat(validators): add ECOG Performance Status validator"
git push origin main
```

CI/CD pipeline automatically builds and deploys to CDN (see §5).

---

### 3.4 Study Metadata NPM Package

Every study has a **companion metadata package** that is versioned and published alongside the platform. This package provides all context needed for local validator development and testing.

**Package structure:**

```
@vialiq-studies/xyz-001-metadata@1.2.0
├── schemas/
│   ├── forms/
│   │   ├── demographics.schema.json
│   │   ├── adverse-events.schema.json
│   │   ├── vital-signs.schema.json
│   │   └── ...
│   └── visits/
│       └── visit-schedule.json
│
├── mocks/
│   ├── codelist.service.mock.ts      # Mock CodelistService
│   ├── validation-engine.mock.ts     # Mock ValidationEngine  
│   └── study-meta.mock.ts            # Mock StudyMeta
│
├── helpers/
│   ├── date-utils.ts                 # FP date helpers
│   ├── range-utils.ts                # Range validation helpers
│   ├── bmi-calculator.ts             # BMI/BSA calculations
│   └── egfr-calculator.ts            # eGFR (CKD-EPI) formula
│
├── types/
│   ├── form-data.d.ts                # TypeScript types for form data
│   ├── study-meta.d.ts               # Extended StudyMeta interface
│   └── codelists.d.ts                # Codelist enums
│
└── index.ts                          # Main exports
```

**Example usage in validator:**

```typescript
// src/validators/egfr-range.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';
import { calculateEGFR } from '@vialiq-studies/xyz-001-metadata/helpers';
import { GenderCode } from '@vialiq-studies/xyz-001-metadata/types';

export const egfrRange: ValidatorFactory = (params) => {
  return (value, formData, meta) => {
    if (!value) return pass();

    const egfr = Number(value);
    const gender = formData['_carried.DM.SEX'] as GenderCode;
    const age = meta.subjectAge;

    // Use study-provided helper
    const expected = calculateEGFR({
      creatinine: formData['creatinine'] as number,
      age,
      gender,
    });

    const tolerance = 5; // mL/min/1.73m²
    if (Math.abs(egfr - expected) > tolerance) {
      return fail(`eGFR ${egfr} does not match computed ${expected.toFixed(1)} (tolerance ±${tolerance})`);
    }

    return pass();
  };
};
```

**Package versioning:**

Metadata packages follow **study amendment versioning**:

- **1.0.0** — Protocol v1.0, initial study design
- **1.1.0** — Protocol Amendment 1 (new forms, updated codelists)
- **1.2.0** — Protocol Amendment 2
- **2.0.0** — Major protocol change (breaking changes to form structure)

Clients pin to a specific version in `package.json` and upgrade when protocol amendments are approved.

---

### 3.5 Local Testing with Mocked Platform

The metadata package provides mock services that simulate platform behavior:

```typescript
// test/setup.ts (Vitest global setup)
import { mockPlatformServices } from '@vialiq-studies/xyz-001-metadata/mocks';

beforeAll(() => {
  mockPlatformServices({
    studyId: 'XYZ-001',
    protocolVersion: 'v2.0',
    meddraVersion: '27.1',
    // ... other config
  });
});
```

**Mock CodelistService:**

```typescript
// From metadata package
export class MockCodelistService {
  isValidMedDRACode(code: string, version: string): boolean {
    // Returns true for known test codes, false otherwise
    const testCodes = ['10000001', '10000002', '10000003'];
    return testCodes.includes(code);
  }

  getCodelistValues(codelistName: string): string[] {
    // Returns mock codelist values
    const codelists = {
      'CTCAE_GRADE': ['1', '2', '3', '4', '5'],
      'ECOG_PS': ['0', '1', '2', '3', '4', '5'],
      // ...
    };
    return codelists[codelistName] ?? [];
  }
}
```

Validators are tested in isolation with full type safety and realistic mock data.

---

## 4. Study Workspace Structure

### 4.1 Directory Layout

```
study-XYZ-001-validators/
├── src/
│   ├── validators/              # Hand-written validators
│   │   ├── bmi-consistency.validator.ts
│   │   ├── ecog-ps.validator.ts
│   │   ├── recist-target-lesion.validator.ts
│   │   ├── ctcae-grade-outcome.validator.ts
│   │   └── ...
│   │
│   ├── generated/               # Auto-generated from Visual Builder
│   │   ├── conditional-required-sae-notification.ts
│   │   ├── unit-aware-range-glucose.ts
│   │   └── ...
│   │
│   ├── services/                # Study-specific services
│   │   ├── codelist.service.ts
│   │   └── reference-data.service.ts
│   │
│   ├── utils/                   # Shared utilities
│   │   ├── date-utils.ts
│   │   └── range-utils.ts
│   │
│   └── index.ts                 # Bundle entry point
│
├── test/
│   ├── validators/              # Test files (mirror src/validators/)
│   │   ├── bmi-consistency.validator.spec.ts
│   │   ├── ecog-ps.validator.spec.ts
│   │   └── ...
│   │
│   └── setup.ts                 # Vitest global setup
│
├── config/
│   ├── vite.config.ts           # Build configuration
│   └── vitest.config.ts         # Test configuration
│
├── .github/
│   └── workflows/
│       ├── build.yml            # CI build
│       └── deploy.yml           # CD to CDN
│
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── README.md
```

### 4.2 Key Files

#### `package.json`

```json
{
  "name": "@vialiq/study-xyz-001-validators",
  "version": "1.2.3",
  "type": "module",
  "scripts": {
    "dev": "vite build --watch --mode development",
    "build": "vite build --mode production",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src test",
    "create:validator": "node scripts/scaffold-validator.mjs"
  },
  "dependencies": {
    "@vialiq/form-validator-sdk": "^1.1.0",
    "@vi/state-fp": "^2.0.0"
  },
  "devDependencies": {
    "@angular/core": "~21.1.0",
    "@angular/common": "~21.1.0",
    "vite": "^6.0.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "typescript": "~5.7.0"
  }
}
```

#### `webpack.config.js` — Module Federation Build Configuration

```javascript
const { ModuleFederationPlugin } = require('webpack').container;
const path = require('path');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: './src/index.ts',
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'eval-source-map',

    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'study-XYZ-001.bundle.js',
      publicPath: 'auto',
      clean: true,
    },

    resolve: {
      extensions: ['.ts', '.js'],
    },

    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },

    plugins: [
      new ModuleFederationPlugin({
        name: 'study_xyz_001_validators',
        filename: 'remoteEntry.js',
        
        exposes: {
          './validators': './src/index.ts',
        },

        // Shared dependencies — must match platform versions exactly
        shared: {
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: '21.1.0',
          },
          '@angular/common': {
            singleton: true,
            strictVersion: true,
            requiredVersion: '21.1.0',
          },
          '@vialiq/form-validator-sdk': {
            singleton: true,
            strictVersion: true,
            requiredVersion: '^1.1.0', // Allow minor/patch updates
          },
          '@vi/state-fp': {
            singleton: true,
            strictVersion: true,
            requiredVersion: '^2.0.0',
          },
        },
      }),
    ],

    optimization: {
      minimize: isProduction,
      splitChunks: false, // Federation handles chunking
    },
  };
};
```

**Key differences from Vite:**
- Uses Webpack ModuleFederationPlugin
- `exposes` declares public validator bundle contract
- `shared` ensures single instance of Angular + SDK (prevents version conflicts)
- `strictVersion: true` fails build if client requires incompatible version
- Output includes `remoteEntry.js` (federation manifest)
```

#### `vitest.config.ts` — Test Configuration

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // For Angular DI tests
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts', 'src/generated/**'],
    },
  },
});
```

---

## 5. Build & Deployment Pipeline

### 5.1 CI/CD Workflow — GitHub Actions

**`.github/workflows/build-and-deploy.yml`**

```yaml
name: Build and Deploy Validators

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  STUDY_ID: XYZ-001

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build validator bundle
        run: npm run build
      
      - name: Generate GCP manifest
        run: npm run manifest:generate
        # Generates ALCOA-compliant manifest (see use-cases §16.5)
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: validator-bundle
          path: |
            dist/study-${{ env.STUDY_ID }}.bundle.js
            dist/study-${{ env.STUDY_ID }}.bundle.js.map
            dist/manifest.json
          retention-days: 2555 # 7 years for GCP compliance

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: validator-bundle
          path: dist
      
      - name: Upload to Azure staging (awaiting approval)
        uses: azure/CLI@v1
        with:
          azcliversion: 2.53.0
          inlineScript: |
            az storage blob upload-batch \
              --account-name vialiqvalidators \
              --auth-mode login \
              --destination validator-bundles-staging \
              --destination-path study-${{ env.STUDY_ID }}/v${{ github.run_number }} \
              --source dist/ \
              --overwrite false \
              --metadata "study-id=${{ env.STUDY_ID }},build-sha=${{ github.sha }},status=pending-approval"
      
      - name: Create approval request
        run: |
          curl -X POST https://platform.vialiq.com/api/validator-bundles/approval-requests \
            -H "Authorization: Bearer ${{ secrets.VIALIQ_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "studyId": "${{ env.STUDY_ID }}",
              "version": "v${{ github.run_number }}",
              "buildSha": "${{ github.sha }}",
              "submittedBy": "${{ github.actor }}",
              "artifactUrl": "https://vialiqvalidators.blob.core.windows.net/validator-bundles-staging/study-${{ env.STUDY_ID }}/v${{ github.run_number }}"
            }'
      
      - name: Notify study admin
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: smtp.office365.com
          server_port: 587
          username: ${{ secrets.MAIL_USERNAME }}
          password: ${{ secrets.MAIL_PASSWORD }}
          subject: "[ViaLiq] Validator bundle ready for approval: Study ${{ env.STUDY_ID }} v${{ github.run_number }}"
          to: study-admin@example.com,platform-admin@vialiq.com
          from: no-reply@vialiq.com
          body: |
            A new validator bundle is ready for approval.
            
            Study: ${{ env.STUDY_ID }}
            Version: v${{ github.run_number }}
            Submitted by: ${{ github.actor }}
            
            Review and approve at:
            https://platform.vialiq.com/admin/validator-approvals/${{ env.STUDY_ID }}/v${{ github.run_number }}
            
            Changes in this version:
            ${{ github.event.head_commit.message }}
```

### 5.2 Versioning Strategy

Validator bundles follow **semantic versioning** independent of the platform:

- **1.0.0** — Initial go-live version (first subject enrolled)
- **1.1.0** — New validators added (backward compatible)
- **1.1.1** — Bug fix in existing validator (patch)
- **2.0.0** — Breaking change (validator removed or params changed)

Version is embedded in the bundle filename:

```
/validators/study-XYZ-001/v1.2.3/remoteEntry.js
```

The platform **always** fetches the version pinned in study configuration (never "latest"). This ensures regulatory compliance — no automatic updates without approval.

### 5.3 Multi-Tenant Deployment Architecture

**Azure Blob Storage** (not public CDN):

```
Azure Storage Account: vialiqvalidators
└── Container: validator-bundles
    ├── study-ABC-001/
    │   ├── v1.0.0/
    │   │   ├── remoteEntry.js
    │   │   ├── study-ABC-001.bundle.js
    │   │   └── manifest.json
    │   └── v1.1.0/
    │       └── ...
    │
    ├── study-XYZ-001/
    │   ├── v1.0.0/
    │   └── v1.2.3/
    │       ├── remoteEntry.js
    │       ├── study-XYZ-001.bundle.js
    │       ├── study-XYZ-001.bundle.js.map
    │       └── manifest.json
    │
    └── study-DEF-456/
        └── ...
```

**Access control:**

1. **SAS Token Authentication**: Platform backend generates time-limited SAS tokens for each study
2. **RBAC**: Study admins can only deploy to their study's folder
3. **Immutable versions**: Once deployed, a version cannot be overwritten (append-only)
4. **Audit log**: All deployments logged to Azure Monitor

**Platform loading flow:**

```typescript
// Platform fetches bundle with SAS token
const studyConfig = await getStudyConfig('XYZ-001');
const validatorVersion = studyConfig.validatorBundleVersion; // '1.2.3'
const sasToken = await generateSasToken('XYZ-001', validatorVersion);

const bundleUrl = `https://vialiqvalidators.blob.core.windows.net/validator-bundles/` +
                  `study-XYZ-001/v${validatorVersion}/remoteEntry.js?${sasToken}`;

const container = await loadRemoteModule({
  remoteEntry: bundleUrl,
  remoteName: 'study_xyz_001_validators',
  exposedModule: './validators',
});

const bundle = container.default as StudyValidatorBundle;
```

**Benefits over public CDN:**
- ✅ Client data sovereignty concerns addressed
- ✅ Fine-grained access control per study
- ✅ No public exposure of client code
- ✅ Integration with Azure AD for auth
- ✅ Compliance with HIPAA, GDPR, GxP

### 5.4 Deployment Approval Workflow

**Step 1: Client builds and tests**

```bash
# In client's repo
npm run build
npm test -- --coverage
# All tests pass, bundle ready
```

**Step 2: Submit for approval**

```bash
npm run deploy:submit
# Uploads bundle to staging area
# Creates approval request in platform
```

This triggers:
1. CI/CD uploads bundle to Azure staging blob
2. Static analysis runs (ESLint security rules, bundle size check)
3. Notification sent to platform admin + study admin
4. Approval request created in platform UI

**Step 3: Platform admin reviews**

Platform UI shows:
- Validator code diff (vs previous version)
- Test coverage report (must be ≥80%)
- Static analysis results
- Bundle size (warn if >500 KB)
- Security scan results (no banned APIs)
- GCP manifest (ALCOA compliance)

**Automated checks (must pass):**
- ✅ All tests passed
- ✅ Coverage ≥80%
- ✅ ESLint security rules passed
- ✅ No `fetch`, `XMLHttpRequest`, `eval` detected
- ✅ TypeScript compilation succeeded
- ✅ Module Federation version compatibility verified

**Manual review (spot checks):**
- Class-based validators with DI (higher risk)
- Validators accessing external services
- Complex cross-field logic
- First-time contributors

**Step 4: Approval**

Platform admin clicks **"Approve for Production"** → bundle moves from staging to production:

```
Azure Blob: staging/study-XYZ-001/v1.2.3/
         ↓
Azure Blob: validator-bundles/study-XYZ-001/v1.2.3/
```

**Step 5: Study configuration update**

Study admin updates study config to reference new version:

```json
{
  "studyId": "XYZ-001",
  "validatorBundleVersion": "1.2.3",
  "validatorBundleApprovedBy": "admin@vialiq.com",
  "validatorBundleApprovedAt": "2026-05-29T16:45:00Z"
}
```

**Go-live:** Next form load fetches v1.2.3.

**Rollback:** Study admin changes config back to "1.2.2" → instant rollback.

**Turnaround time:**
- Automated checks: 2-5 minutes
- Manual review: 1-4 hours (during business hours)
- Emergency hotfix: 15 minutes (bypass manual review, post-review required)

### 5.5 Rollback Procedure

If a validator bundle causes production issues:

**Option A: Configuration rollback (instant)**

1. Study admin opens study config in platform UI
2. Changes `validatorBundleVersion` from "1.2.3" → "1.2.2"
3. Saves config
4. Next form load fetches v1.2.2

**Time to rollback: < 30 seconds**

**Option B: Re-deploy previous version (if config lost)**

1. Revert Git commit in client repo
2. Re-submit for approval (fast-track)
3. Platform admin approves
4. Study config updated

**Time to rollback: < 10 minutes**

All previous versions remain in Azure Blob Storage (immutable, 7-year retention for GCP).

### 5.6 SDK Versioning & LTS Support

The **Form Validator SDK** (`@vialiq/form-validator-sdk`) follows **Long-Term Support (LTS)** versioning to balance stability with feature updates.

**LTS Policy:**

| Version | Status | Released | End of Support | Notes |
|---------|--------|----------|----------------|-------|
| **1.0.x** | Deprecated | 2025-01-15 | 2027-01-15 | Initial release, no `warn()` |
| **1.1.x** | Active LTS | 2026-03-01 | 2028-03-01 | Added `warn()`, `_carried.*` |
| **2.0.x** | Preview | 2026-06-01 | TBD | Breaking: async validators |

**Support windows:**
- **2 years** from initial release
- **6 months** deprecation warning before EOL
- **Security patches** for all LTS versions

**Version constraints in Module Federation:**

```javascript
// Platform's webpack.config.js
shared: {
  '@vialiq/form-validator-sdk': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^1.1.0', // Allow 1.1.x → 1.x.y, but not 2.0
  },
}

// Client's webpack.config.js (study validators)
shared: {
  '@vialiq/form-validator-sdk': {
    singleton: true,
    strictVersion: true,
    requiredVersion: '^1.1.0', // Must match platform
  },
}
```

**Migration strategy:**

When platform upgrades SDK (e.g., 1.1 → 2.0), clients have **6 months** to migrate:

1. **Month 1-3**: Deprecation warnings in logs, no breaking changes
2. **Month 4-6**: Platform runs in dual-mode (supports 1.x and 2.x)
3. **Month 6+**: SDK 1.x bundles rejected at load time

**Deprecation warnings:**

```typescript
// Example: warn() deprecated in SDK 3.0
export function warn(message: string): RuleResult {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[DEPRECATION] warn() will be removed in SDK v3.0 (EOL: 2028-06-01). ` +
      `Use result({ level: 'warning', message }) instead.`
    );
  }
  return { isValid: true, level: 'warning', message };
}
```

**Compatibility check tool:**

```bash
# In client repo
npm run sdk:check-compat

# Output:
# ✓ SDK version: 1.1.2 (compatible with platform 1.1.0-1.9.9)
# ✓ Module Federation config: OK
# ⚠ Using deprecated API: warn() — migrate by 2028-06-01
```

**Benefits:**
- ✅ Clients not forced to upgrade frequently
- ✅ Platform can add features without breaking studies
- ✅ Predictable migration windows
- ✅ No surprise breaking changes

---

## 6. Visual Programming Interface

### 6.1 Why Visual Programming?

**Target user:** Data Manager with no TypeScript experience who needs to create a simple edit check: _"If AE Serious = 'Y', then SAE Notification Date is required"_.

**Options:**
1. ❌ Write raw TypeScript → too technical
2. ❌ Fill a JSON form → error-prone, no validation
3. ✅ **Drag-and-drop visual builder** → intuitive, generates correct code

### 6.2 Technology Evaluation — Google Blockly vs Alternatives

| Tool | Pros | Cons | Verdict |
|---|---|---|---|
| **Google Blockly** | Mature, FOSS, generates JS/TS, medical device pedigree (used in healthcare) | Heavy (500 KB), limited built-in blocks | ✅ **Recommended** |
| **Node-RED** | Flow-based, visual, excellent for sequences | Async-first (we need sync), server-side focus | ❌ Wrong paradigm |
| **Scratch Blocks** | Simpler than Blockly | Less flexible, more kid-focused | ❌ Too simple |
| **Custom React Flow** | Full control, modern React | Build from scratch, maintenance burden | ❌ Too much effort |

**Decision: Google Blockly** with custom blocks tailored to EDC validators.

### 6.3 Visual Builder Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Visual Validator Builder (Angular component)                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Blockly Workspace                                         │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │ [If]   AE Serious   [equals]   'Y'                  │  │ │
│  │  │   [Then]                                            │  │ │
│  │  │      [Require field] SAE Notification Date          │  │ │
│  │  │      [Show message] "SAE notification date required"│  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Code Generator                                            │ │
│  │  • Blockly → JSON                                          │ │
│  │  • JSON → TypeScript via template                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                            ↓                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Generated TS saved to:                                    │ │
│  │  src/generated/conditional-required-sae-notification.ts    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Custom Blockly Blocks for EDC

#### Block 1: Conditional Required

```javascript
// Visual representation:
// ┌─────────────────────────────────────────────┐
// │ [If]  [dropdown: field]  [dropdown: op]     │
// │       [input: value]                        │
// │ [Then require field]  [dropdown: field]     │
// │       [message]  [text input]               │
// └─────────────────────────────────────────────┘

Blockly.Blocks['edc_conditional_required'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("If field")
        .appendField(new Blockly.FieldDropdown([
          ["AE Serious", "aeSerious"],
          ["CTCAE Grade", "ctcaeGrade"],
          ["Dose Modified", "doseModified"]
        ]), "TRIGGER_FIELD");
    
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ["equals", "==="],
          ["not equals", "!=="],
          [">=", ">="],
          [">", ">"]
        ]), "OPERATOR");
    
    this.appendValueInput("TRIGGER_VALUE")
        .setCheck(["String", "Number"])
        .appendField("value");
    
    this.appendDummyInput()
        .appendField("Then require field")
        .appendField(new Blockly.FieldDropdown([
          ["SAE Notification Date", "saeNotificationDate"],
          ["Death Date", "deathDate"],
          ["Dose Reduction Reason", "doseReductionReason"]
        ]), "REQUIRED_FIELD");
    
    this.appendDummyInput()
        .appendField("with message")
        .appendField(new Blockly.FieldTextInput("This field is required"), "MESSAGE");
    
    this.setColour(160);
    this.setTooltip("Makes a field required when another field has a specific value");
  }
};

// Code generator → TypeScript
Blockly.JavaScript['edc_conditional_required'] = function(block) {
  const triggerField = block.getFieldValue('TRIGGER_FIELD');
  const operator = block.getFieldValue('OPERATOR');
  const triggerValue = Blockly.JavaScript.valueToCode(block, 'TRIGGER_VALUE', Blockly.JavaScript.ORDER_ATOMIC);
  const requiredField = block.getFieldValue('REQUIRED_FIELD');
  const message = block.getFieldValue('MESSAGE');

  // Generate TypeScript code
  return `
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

export const conditionalRequired_${requiredField}: ValidatorFactory = (params) => {
  return (value, formData) => {
    const triggerValue = formData['${triggerField}'];
    
    if (triggerValue ${operator} ${triggerValue}) {
      if (value === null || value === undefined || value === '') {
        return fail('${message}');
      }
    }
    
    return pass();
  };
};
`;
};
```

#### Block 2: Range Check with Unit

```javascript
// Visual:
// ┌─────────────────────────────────────────────┐
// │ [Range check with unit]                     │
// │   Value field:     [dropdown]               │
// │   Unit field:      [dropdown]               │
// │   Ranges:                                   │
// │     mmol/L:  [min] to [max]                 │
// │     mg/dL:   [min] to [max]                 │
// └─────────────────────────────────────────────┘

Blockly.Blocks['edc_unit_aware_range'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Range check with unit");
    
    this.appendDummyInput()
        .appendField("Value field:")
        .appendField(new Blockly.FieldDropdown([
          ["Glucose Value", "glucoseValue"],
          ["Creatinine Value", "creatinineValue"],
          ["eGFR Value", "egfrValue"]
        ]), "VALUE_FIELD");
    
    this.appendDummyInput()
        .appendField("Unit field:")
        .appendField(new Blockly.FieldDropdown([
          ["Glucose Unit", "glucoseUnit"],
          ["Creatinine Unit", "creatinineUnit"],
          ["eGFR Unit", "egfrUnit"]
        ]), "UNIT_FIELD");
    
    this.appendDummyInput()
        .appendField("Unit 1:")
        .appendField(new Blockly.FieldTextInput("mmol/L"), "UNIT1_NAME");
    
    this.appendDummyInput()
        .appendField("  Range:")
        .appendField(new Blockly.FieldNumber(0), "UNIT1_MIN")
        .appendField("to")
        .appendField(new Blockly.FieldNumber(100), "UNIT1_MAX");
    
    this.appendDummyInput()
        .appendField("Unit 2:")
        .appendField(new Blockly.FieldTextInput("mg/dL"), "UNIT2_NAME");
    
    this.appendDummyInput()
        .appendField("  Range:")
        .appendField(new Blockly.FieldNumber(0), "UNIT2_MIN")
        .appendField("to")
        .appendField(new Blockly.FieldNumber(100), "UNIT2_MAX");
    
    this.setColour(230);
  }
};
```

#### Block 3: Cross-Field Calculation

```javascript
// Visual:
// ┌─────────────────────────────────────────────┐
// │ [Check calculated field]                    │
// │   Formula:  [dropdown]                      │
// │   Inputs:   [multi-dropdown]                │
// │   Tolerance: [number]                       │
// └─────────────────────────────────────────────┘

Blockly.Blocks['edc_calculated_field'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Check calculated field");
    
    this.appendDummyInput()
        .appendField("Formula:")
        .appendField(new Blockly.FieldDropdown([
          ["BMI (weight / height²)", "bmi"],
          ["BSA (Mosteller)", "bsa"],
          ["eGFR (CKD-EPI)", "egfr"]
        ]), "FORMULA");
    
    this.appendDummyInput()
        .appendField("Tolerance:")
        .appendField(new Blockly.FieldNumber(0.5, 0, 10, 0.1), "TOLERANCE");
    
    this.setColour(290);
  }
};
```

### 6.5 Generated Code Example

**Input (Blockly workspace):**

```
[If] aeSerious [equals] 'Y'
  [Then require field] saeNotificationDate
  [with message] "SAE notification date is required when AE is serious"
```

**Output (Generated TypeScript):**

```typescript
// src/generated/conditional-required-sae-notification.ts
// ⚠️ AUTO-GENERATED by Visual Validator Builder on 2026-05-29
// DO NOT EDIT THIS FILE MANUALLY — changes will be overwritten
// To modify, edit the visual workflow and regenerate

import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * AUTO-GENERATED VALIDATOR
 * 
 * Rule: If aeSerious equals 'Y', then saeNotificationDate is required
 * Generated from: Visual Builder workspace "SAE Notification Required"
 * Created by: jane.smith@example.com
 * Date: 2026-05-29T14:23:17Z
 */
export const conditionalRequiredSaeNotification: ValidatorFactory = (params) => {
  return (value, formData) => {
    const triggerValue = formData['aeSerious'];
    
    // Condition: aeSerious === 'Y'
    if (triggerValue === 'Y') {
      // This field (saeNotificationDate) is now required
      if (value === null || value === undefined || value === '') {
        return fail('SAE notification date is required when AE is serious');
      }
    }
    
    return pass();
  };
};
```

**Auto-registration in bundle:**

```typescript
// src/index.ts (updated automatically)
import { conditionalRequiredSaeNotification } from './generated/conditional-required-sae-notification';

const bundle: StudyValidatorBundle = {
  validators: {
    'conditionalRequiredSaeNotification': conditionalRequiredSaeNotification,
    // ... other validators
  },
};

export default bundle;
```

### 6.6 Visual Builder UI — Angular Component

```typescript
// apps/study-config/src/app/components/visual-validator-builder/visual-validator-builder.component.ts
import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import Blockly from 'blockly';
import './custom-blocks'; // Custom EDC blocks

@Component({
  selector: 'app-visual-validator-builder',
  template: `
    <div class="validator-builder">
      <div class="toolbar">
        <button (click)="generateCode()">Generate Code</button>
        <button (click)="saveWorkspace()">Save</button>
        <button (click)="loadWorkspace()">Load</button>
      </div>
      
      <div class="workspace-container">
        <div #blocklyDiv class="blockly-workspace"></div>
      </div>
      
      <div class="code-preview">
        <h3>Generated TypeScript</h3>
        <pre><code>{{ generatedCode() }}</code></pre>
      </div>
    </div>
  `,
  styles: [`
    .validator-builder {
      display: grid;
      grid-template-rows: auto 1fr;
      height: 100vh;
    }
    
    .workspace-container {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
      padding: 1rem;
    }
    
    .blockly-workspace {
      height: 600px;
      border: 1px solid #ccc;
    }
    
    .code-preview {
      overflow: auto;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      font-family: 'Fira Code', monospace;
    }
  `]
})
export class VisualValidatorBuilderComponent implements OnInit {
  @ViewChild('blocklyDiv', { static: true }) blocklyDiv!: ElementRef;
  
  private workspace!: Blockly.WorkspaceSvg;
  readonly generatedCode = signal<string>('');

  ngOnInit() {
    this.workspace = Blockly.inject(this.blocklyDiv.nativeElement, {
      toolbox: this.getToolbox(),
      grid: { spacing: 20, length: 3, colour: '#ccc' },
      zoom: { controls: true, wheel: true },
    });
  }

  generateCode() {
    const code = Blockly.JavaScript.workspaceToCode(this.workspace);
    this.generatedCode.set(code);
    
    // Auto-save to study workspace
    this.saveGeneratedValidator(code);
  }

  private saveGeneratedValidator(code: string) {
    // POST to backend API → writes to src/generated/
    // Triggers git commit + CI/CD pipeline
  }

  private getToolbox(): Blockly.utils.toolbox.ToolboxDefinition {
    return {
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Logic',
          contents: [
            { kind: 'block', type: 'edc_conditional_required' },
            { kind: 'block', type: 'edc_cross_field_compare' },
          ]
        },
        {
          kind: 'category',
          name: 'Ranges',
          contents: [
            { kind: 'block', type: 'edc_unit_aware_range' },
            { kind: 'block', type: 'edc_soft_range_warn' },
          ]
        },
        {
          kind: 'category',
          name: 'Calculations',
          contents: [
            { kind: 'block', type: 'edc_calculated_field' },
            { kind: 'block', type: 'edc_score_sum' },
          ]
        },
      ]
    };
  }
}
```

---

## 7. Testing Framework Integration

### 7.1 Test-Driven Development Workflow

Every validator must have **at least one test** before it can be deployed. The CI/CD pipeline enforces this with a coverage gate (minimum 80%).

### 7.2 Test File Structure

```typescript
// test/validators/bmi-consistency.validator.spec.ts
import { describe, it, expect } from 'vitest';
import { runValidator } from '@vialiq/form-validator-sdk/testing';
import { bmiConsistency } from '../../src/validators/bmi-consistency.validator';

describe('bmiConsistency', () => {
  const params = {
    weightFieldKey: 'weight',
    heightFieldKey: 'height',
    toleranceUnit: 0.5,
  };

  const validator = bmiConsistency(params);

  describe('valid BMI', () => {
    it('passes when BMI matches computed value within tolerance', () => {
      const formData = { weight: 70, height: 170 }; // BMI = 24.22
      const result = runValidator(validator, 24.2, formData, {});
      
      expect(result.isValid).toBe(true);
    });

    it('passes when BMI is exactly at upper tolerance', () => {
      const formData = { weight: 70, height: 170 }; // BMI = 24.22
      const result = runValidator(validator, 24.72, formData, {}); // 24.22 + 0.5
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('invalid BMI', () => {
    it('fails when BMI is outside tolerance', () => {
      const formData = { weight: 70, height: 170 }; // BMI = 24.22
      const result = runValidator(validator, 30, formData, {});
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('does not match the computed value');
      expect(result.message).toContain('24.2'); // Computed BMI in message
    });

    it('fails when BMI is below physiological minimum', () => {
      const result = runValidator(validator, 5, {}, {});
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('physiologically possible range');
    });

    it('fails when BMI is above physiological maximum', () => {
      const result = runValidator(validator, 85, {}, {});
      
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('physiologically possible range');
    });
  });

  describe('edge cases', () => {
    it('passes (fail-open) when weight is missing', () => {
      const formData = { height: 170 };
      const result = runValidator(validator, 24, formData, {});
      
      expect(result.isValid).toBe(true);
    });

    it('passes (fail-open) when height is zero (division by zero)', () => {
      const formData = { weight: 70, height: 0 };
      const result = runValidator(validator, 24, formData, {});
      
      expect(result.isValid).toBe(true);
    });

    it('passes when value is empty', () => {
      const result = runValidator(validator, null, {}, {});
      expect(result.isValid).toBe(true);
    });
  });
});
```

### 7.3 GCP Manifest Generation

After all tests pass, the CI pipeline generates an ALCOA-compliant manifest (see use-cases §16.5):

```json
{
  "manifestVersion": "1.0",
  "studyId": "XYZ-001",
  "validatorBundleVersion": "1.2.3",
  "generatedAt": "2026-05-29T16:45:32Z",
  "gitCommit": "a3f5e2b",
  "buildPipeline": "GitHub Actions",
  "testResults": {
    "totalTests": 127,
    "passed": 127,
    "failed": 0,
    "coverage": 94.2
  },
  "validators": [
    {
      "ruleId": "bmiConsistency",
      "sourceFile": "src/validators/bmi-consistency.validator.ts",
      "author": "john.doe@example.com",
      "reviewedBy": "jane.smith@example.com",
      "approvedDate": "2026-05-28",
      "testCases": 12,
      "alcoa": {
        "attributable": "Authored by john.doe@example.com, commit a3f5e2b",
        "legible": "Source code available in Git repository",
        "contemporaneous": "Committed 2026-05-28T10:23:45Z",
        "original": "Primary source: src/validators/bmi-consistency.validator.ts",
        "accurate": "127/127 tests passed, 94.2% coverage"
      }
    }
  ]
}
```

---

## 8. Oncology Study Example — End-to-End

### 8.1 Study Context

**Study:** XYZ-001 — Phase III trial for advanced non-small cell lung cancer  
**Intervention:** Experimental immunotherapy + chemotherapy vs standard of care  
**Primary endpoint:** Overall survival  
**Key assessments:** RECIST 1.1, CTCAE v5.0, ECOG PS, Patient-Reported Outcomes (EORTC QLQ-C30)

### 8.2 Custom Validators Required

| # | Validator | Category | Complexity | Method |
|---|---|---|---|---|
| 1 | ECOG PS range (0–5) | Single-field | Low | Visual Builder |
| 2 | CTCAE grade vs outcome | Cross-field | Medium | Hand-written TS |
| 3 | RECIST target lesion sum | Calculation | Medium | Hand-written TS |
| 4 | Conditional required: SAE → notification date | Cross-field | Low | Visual Builder |
| 5 | Unit-aware glucose range | Cross-field | Medium | Visual Builder |
| 6 | EORTC QLQ-C30 score sum | Calculation | Medium | Hand-written TS |
| 7 | BMI consistency | Calculation | Medium | Hand-written TS |
| 8 | Tumor response confirmation window | Temporal | High | Hand-written TS |

### 8.3 Implementation — Validator #2: CTCAE Grade vs Outcome

**Step 1: Create validator**

```typescript
// src/validators/ctcae-grade-outcome.validator.ts
import { ValidatorFactory, pass, fail } from '@vialiq/form-validator-sdk';

/**
 * Validates CTCAE grade consistency with AE outcome.
 * - Grade 5 = death → outcome must be 'FATAL' and death date must be populated
 * - Grade 0 is not valid for an AE that exists
 * 
 * Use case: F3 from form-builder-custom-programming-use-cases.md §8
 */
export const ctcaeGradeOutcome: ValidatorFactory = (params) => {
  const outcomeKey   = String(params['outcomeFieldKey']   ?? 'aeOutcome');
  const deathDateKey = String(params['deathDateFieldKey'] ?? 'deathDate');

  return (value, formData) => {
    if (value === null || value === undefined || value === '') return pass();

    const grade = Number(value);
    if (!Number.isInteger(grade)) {
      return fail('CTCAE grade must be a whole number');
    }

    if (grade === 0) {
      return fail('CTCAE grade 0 means no adverse event. If AE is present, grade must be 1–5.');
    }

    if (grade < 1 || grade > 5) {
      return fail(`CTCAE grade must be 1–5 (entered: ${grade})`);
    }

    // Grade 5 = death
    if (grade === 5) {
      const outcome   = formData[outcomeKey];
      const deathDate = formData[deathDateKey];

      if (outcome !== 'FATAL') {
        return fail(
          'CTCAE grade 5 indicates a fatal outcome. AE Outcome must be set to "FATAL".'
        );
      }

      if (!deathDate) {
        return fail('CTCAE grade 5 requires Death Date to be populated.');
      }
    }

    return pass();
  };
};
```

**Step 2: Write test**

```typescript
// test/validators/ctcae-grade-outcome.validator.spec.ts
import { describe, it, expect } from 'vitest';
import { runValidator } from '@vialiq/form-validator-sdk/testing';
import { ctcaeGradeOutcome } from '../../src/validators/ctcae-grade-outcome.validator';

describe('ctcaeGradeOutcome', () => {
  const validator = ctcaeGradeOutcome({});

  it('accepts grade 1–4', () => {
    for (let grade = 1; grade <= 4; grade++) {
      const result = runValidator(validator, grade, {}, {});
      expect(result.isValid).toBe(true);
    }
  });

  it('rejects grade 0', () => {
    const result = runValidator(validator, 0, {}, {});
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('grade 0 means no adverse event');
  });

  it('rejects grade < 0 or > 5', () => {
    expect(runValidator(validator, -1, {}, {}).isValid).toBe(false);
    expect(runValidator(validator, 6, {}, {}).isValid).toBe(false);
  });

  it('grade 5 requires outcome = FATAL', () => {
    const formData = { aeOutcome: 'RECOVERED', deathDate: '2026-05-15' };
    const result = runValidator(validator, 5, formData, {});
    
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Outcome must be set to "FATAL"');
  });

  it('grade 5 requires death date', () => {
    const formData = { aeOutcome: 'FATAL', deathDate: null };
    const result = runValidator(validator, 5, formData, {});
    
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('Death Date');
  });

  it('grade 5 passes when outcome = FATAL and death date present', () => {
    const formData = { aeOutcome: 'FATAL', deathDate: '2026-05-15' };
    const result = runValidator(validator, 5, formData, {});
    
    expect(result.isValid).toBe(true);
  });
});
```

**Step 3: Register in bundle**

```typescript
// src/index.ts
import { ctcaeGradeOutcome } from './validators/ctcae-grade-outcome.validator';

const bundle: StudyValidatorBundle = {
  validators: {
    'ctcaeGradeOutcome': ctcaeGradeOutcome,
    // ... other validators
  },
};

export default bundle;
```

**Step 4: Reference in form schema**

```json
{
  "formId": "AE",
  "formName": "Adverse Event",
  "fields": [
    {
      "key": "ctcaeGrade",
      "type": "number",
      "label": "CTCAE Grade",
      "validation": [
        {
          "type": "custom",
          "ruleId": "ctcaeGradeOutcome",
          "params": {
            "outcomeFieldKey": "aeOutcome",
            "deathDateFieldKey": "deathDate"
          },
          "validateOn": "onBlur"
        }
      ]
    }
  ]
}
```

**Step 5: Test in browser**

1. Open study XYZ-001 in EDC
2. Navigate to AE form
3. Enter CTCAE Grade = 5
4. Enter AE Outcome = 'RECOVERED'
5. Blur → Error appears: _"CTCAE grade 5 indicates a fatal outcome. AE Outcome must be set to 'FATAL'."_
6. Change outcome to 'FATAL' → Error clears ✓

---

## 9. Security & Sandboxing

### 9.1 Threat Model

**Threat:** A malicious or compromised validator bundle could:
- Exfiltrate PHI (subject data) to external servers
- Corrupt form data before save
- Crash the browser with infinite loops
- Access platform APIs it shouldn't (user management, audit logs)

### 9.2 Mitigation — Defense in Depth

| Layer | Mitigation | Enforcement |
|---|---|---|
| **1. Code review** | All validators reviewed before deploy | GitHub PR required approval |
| **2. Static analysis** | ESLint rules ban `fetch`, `XMLHttpRequest`, `eval` | CI/CD fails on violations |
| **3. Sandboxed injector** | Validators only see explicitly provided services | Angular DI scoping |
| **4. Content Security Policy** | Blocks inline scripts, external domains | HTTP header in platform |
| **5. Timeout** | Validator execution capped at 5ms | ValidationEngine enforces |
| **6. Readonly formData** | Validators cannot mutate `formData` | TypeScript `Readonly<>` |
| **7. Server re-validation** | Client errors are UX only — server is authoritative | Backend edit-check engine |

### 9.3 ESLint Security Rules

```javascript
// .eslintrc.json in study workspace
{
  "rules": {
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-restricted-globals": ["error", "fetch", "XMLHttpRequest", "WebSocket"],
    "no-restricted-imports": [
      "error",
      {
        "paths": [
          { "name": "@angular/common/http", "message": "HTTP calls not allowed in validators" },
          { "name": "rxjs/ajax", "message": "HTTP calls not allowed in validators" }
        ]
      }
    ]
  }
}
```

### 9.4 Timeout Enforcement

```typescript
// ValidationEngine — wrap validator execution with timeout
private executeWithTimeout<T>(fn: () => T, timeoutMs: number): T {
  const start = performance.now();
  const result = fn();
  const elapsed = performance.now() - start;

  if (elapsed > timeoutMs) {
    console.warn(`[ValidationEngine] Validator exceeded ${timeoutMs}ms timeout (took ${elapsed.toFixed(1)}ms)`);
    // Log to telemetry for monitoring
  }

  return result;
}
```

---

## 10. Troubleshooting & Debug Tools

### 10.1 Common Issues

#### Issue 1: Validator Not Found

**Symptom:** Form loads, but custom validator is not executed. No error in console.

**Diagnosis:**
1. Open DevTools → Network tab
2. Look for `study-XYZ-001.bundle.js` — status should be 200
3. If 404: bundle not deployed to CDN
4. If 200: check Console for `[CustomValidatorLoader] Registered: <ruleId>`

**Fix:**
- Ensure `ruleId` in schema matches the key in `bundle.validators`
- Check capitalization — keys are case-sensitive

---

#### Issue 2: Validator Throws Error

**Symptom:** Console shows `[ValidationEngine] Validator <ruleId> threw an error`

**Diagnosis:**
1. Check the error stack trace in Console
2. Common causes:
   - Null reference (`formData[key]` is undefined)
   - Type mismatch (expected number, got string)
   - Missing param in schema

**Fix:**
- Add null checks: `if (!formData[key]) return pass();`
- Use `Number()` / `String()` to coerce types
- Provide default params: `const key = String(params['key'] ?? 'defaultKey');`

---

#### Issue 3: Validator Always Passes (Fail-Open)

**Symptom:** Validator should fail but doesn't

**Diagnosis:**
- Check if validator is hitting an early `return pass()` due to missing data
- Add `console.log()` statements in validator to trace execution

**Fix:**
- Review fail-open logic — ensure it only applies to truly missing data, not invalid data

---

### 10.2 Debug Mode

Enable verbose logging in ValidationEngine:

```typescript
// In browser console:
localStorage.setItem('DEBUG_VALIDATORS', 'true');
location.reload();

// ValidationEngine will now log every validator execution:
// [ValidationEngine] Executing: bmiConsistency
// [ValidationEngine]   value: 24.5
// [ValidationEngine]   formData: { weight: 70, height: 170 }
// [ValidationEngine]   result: pass
```

---

### 10.3 Validator Test Harness — Browser Tool

A built-in UI tool for testing validators in isolation:

```
Platform → Admin → Developer Tools → Validator Test Harness

┌───────────────────────────────────────────────────┐
│ Validator Test Harness                            │
├───────────────────────────────────────────────────┤
│ Validator: [dropdown: bmiConsistency          ▼] │
│                                                   │
│ Value:                                            │
│ ┌───────────────────────────────────────────────┐ │
│ │ 24.5                                          │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ formData (JSON):                                  │
│ ┌───────────────────────────────────────────────┐ │
│ │ {                                             │ │
│ │   "weight": 70,                               │ │
│ │   "height": 170                               │ │
│ │ }                                             │ │
│ └───────────────────────────────────────────────┘ │
│                                                   │
│ [Run Validator]                                   │
│                                                   │
│ Result:                                           │
│ ✓ Pass                                            │
└───────────────────────────────────────────────────┘
```

---

### 10.4 Alerting & Monitoring System

**Failure detection:**

The platform monitors validator bundle health in real-time:

```typescript
// Platform — CustomValidatorLoaderService
async loadStudyValidators(studyId: string): Promise<void> {
  try {
    // Attempt to load bundle
    const bundle = await loadRemoteModule({ ... });
    
    // Success
    this.telemetry.trackEvent('ValidatorBundleLoaded', {
      studyId,
      version: bundle.version,
      loadTimeMs: elapsed,
    });
    
  } catch (error) {
    // Failure — trigger alerts
    this.telemetry.trackException('ValidatorBundleLoadFailed', {
      studyId,
      error: error.message,
      stack: error.stack,
    });

    // Send alerts
    await this.alertService.sendAlert({
      severity: 'critical',
      studyId,
      error: 'Validator bundle failed to load',
      recipients: [
        ...getStudyAdmins(studyId),
        ...getPlatformAdmins(),
      ],
    });

    // Fail-open: forms still work, but no client-side validation
    console.error(`[ValidatorLoader] Study ${studyId} validators unavailable`);
  }
}
```

**Alert channels:**

1. **Email** (immediate)
   - Study admin
   - Platform ops team
   - On-call engineer (if critical study)

2. **Platform UI banner**
   ```
   ⚠️ Custom validators unavailable for Study XYZ-001.
   Forms are functional but client-side validation is disabled.
   Server-side validation is still active.
   ```

3. **Slack/Teams webhook** (optional)
   ```
   🚨 Validator Bundle Failure
   Study: XYZ-001
   Version: 1.2.3
   Error: Module Federation version mismatch
   Action: Rollback to v1.2.2 or rebuild with platform SDK v1.1.2
   ```

4. **Azure Monitor dashboard**
   - Validator load success rate per study
   - Average load time
   - Bundle size trends
   - Version distribution

**Monitoring metrics:**

| Metric | Threshold | Alert |
|---|---|---|
| Bundle load failure rate | >5% | Warning |
| Bundle load failure rate | >20% | Critical |
| Bundle load time | >3 seconds | Warning |
| Bundle size | >500 KB | Info |
| Version mismatch errors | >0 | Critical |
| Validator execution timeout | >5ms avg | Warning |

**Automated remediation:**

1. **Version mismatch**: Platform suggests compatible SDK version in error message
2. **Bundle 404**: Platform checks Azure Blob, suggests rollback if version missing
3. **Timeout**: Platform disables slow validators, logs for review

**Incident response playbook:**

```markdown
## Validator Bundle Load Failure

**Symptoms:** Forms load but no client-side validation errors appear

**Diagnosis:**
1. Check Azure Monitor dashboard → Validator Health
2. Review error logs for study
3. Common causes:
   - Module Federation version mismatch (SDK upgrade needed)
   - Azure Blob SAS token expired (regenerate token)
   - Network connectivity (retry)
   - Malformed bundle (rollback)

**Resolution:**
1. **Immediate**: Rollback to last working version (study config)
2. **Root cause**: Review build logs, fix issue, redeploy
3. **Prevention**: Add pre-deployment compatibility check
```

---

## 11. Next Steps

This document covered **client-side** custom programming. For server-side implementation, see:

**[form-builder-server-side-validator-library.md](./form-builder-server-side-validator-library.md)** — Pre-built validator library:
- 17+ configurable validators for study designers
- No C# coding required — configure via Form Builder UI
- SAE timelines, cross-visit checks, medical coding validation
- Custom validator extension mechanism

**[form-builder-custom-programming-server-side.md](./form-builder-custom-programming-server-side.md)** — Custom validator development:
- Functional programming architecture with Task/async-await
- Cross-visit validation (baseline consistency, visit windows)
- Medical coding hierarchy validation (MedDRA/WHODrug)
- SAE regulatory timeline enforcement (GCP, SUSAR reporting)
- Query generation and ALCOA-compliant audit trail
- Database access patterns and performance optimization
- Testing strategy (unit, integration, property-based)

---

## Appendix A: Client-Side Use Case Checklist

From [use-cases §16](./form-builder-custom-programming-use-cases.md#16-client-vs-server-execution-boundary), these use cases **can and should** be implemented client-side. For server-side implementation of cross-visit, medical coding, and regulatory checks, see [form-builder-custom-programming-server-side.md](./form-builder-custom-programming-server-side.md).

✅ **Always client-side:**
- [x] Check digit algorithms (NHS, CPF, BSN, EAN-13)
- [x] Regex / format validation (subject number, date format, ATC code)
- [x] Score range bounds (HAMD-17, CTCAE grade, ECOG PS)
- [x] Cross-field date ordering (same form)
- [x] Conditional required (same form)
- [x] "Other, specify" enforcement
- [x] Unit–value pairing (glucose, creatinine)
- [x] BMI / BSA formula consistency
- [x] Score item sum validation (PHQ-9, EORTC QLQ-C30)
- [x] PHQ-9 item 9 safety acknowledgement
- [x] Paediatric age-band checks
- [x] Gender-adjusted lab plausibility (using `_carried.DM.SEX`)

❌ **Never client-side** (server only):
- [ ] Cross-visit data (baseline vs follow-up)
- [ ] Visit window compliance
- [ ] Prior therapy washout
- [ ] Informed consent date before all procedures
- [ ] SAE SUSAR regulatory timeline
- [ ] RECIST tumor response confirmation (requires two timepoints)
- [ ] MedDRA PT→SOC hierarchy validation
- [ ] WHODrug DRN existence and ATC hierarchy
- [ ] Randomisation gating
- [ ] Audit trail / query history checks

🔀 **Both client and server** (client for UX, server for integrity):
- [x] Single-field range (hard limits)
- [x] Intra-form cross-field consistency
- [x] Simple derived fields (BMI, score sums)
- [x] Protocol eligibility (individual thresholds)
- [x] Same-form temporal checks (AE start/end)
- [x] Population-specific ranges (with `StudyMeta` or `_carried.*`)
- [x] PRO instrument scoring (item bounds, total)
- [x] Medical coding format (8-digit code, ATC pattern, version)

---

**End of Document**

---

## Appendix B: Architecture Decision Record

Summary of key architectural decisions for the custom validator system:

| Decision | Options Evaluated | Selected | Rationale |
|----------|-------------------|----------|-----------|
| **Bundle Loading** | Dynamic Import vs Module Federation | **Module Federation** | Version safety, no version skew, smaller bundles (50-70% reduction) |
| **Hosting** | Public CDN vs Platform Server | **Azure Blob + SAS tokens** | Client data sovereignty, fine-grained access control, compliance |
| **Starter Distribution** | GitHub template, npm init, platform UI | **GitHub template + Platform UI** | Developer flexibility + non-technical user support |
| **Study Metadata** | Inline in platform, separate repo, npm package | **NPM package** | Versioning alignment with protocol amendments, local dev mocks |
| **Code Review** | None, automated only, approval workflow | **Automated + approval workflow** | Security + speed balance, spot checks for high-risk |
| **Local Testing** | Shared dev env, production data, mocking | **Mocking framework** | Fast iteration, no turnaround time, safe test data |
| **SDK Versioning** | Rolling updates, major-only, LTS | **LTS with 2-year support** | Predictable migration windows, stability for studies |
| **Deployment Linking** | Auto-latest, study config, client-triggered | **Study config (pinned version)** | Regulatory compliance, no auto-updates, instant rollback |
| **Billing** | Per-validator, per-study, per-load | **Deferred** | Last phase, focus on core functionality first |
| **Error Handling** | Silent fail-open, logging only, alerting | **Alerting to study admin + platform team** | Proactive issue detection, SLA compliance |

**Security Model:**
- 7-layer defense: code review, static analysis, sandboxed DI, CSP, timeout, readonly data, server re-validation
- Fail-open strategy: client validation UX enhancement, server is authoritative
- Immutable deployments: append-only Azure Blob, 7-year GCP retention

**Development Experience:**
- 3 development paths: Visual Builder (Blockly), SDK templates, full TypeScript
- Study metadata NPM package provides mocks, types, helpers
- Test coverage gate: 80% minimum
- CI/CD turnaround: 2-5 minutes automated, 1-4 hours manual review
- Emergency hotfix: 15 minutes

**Compliance:**
- ALCOA-compliant manifest generation
- Audit trail for all deployments
- GCP-validated testing framework
- HIPAA, GDPR, GxP compliant architecture

---

## Appendix C: Client Onboarding Checklist

For pharmaceutical clients setting up custom validator development:

### Pre-requisites (Platform Team)
- [ ] Study created in ViaLiq EDC Platform
- [ ] Study admin role assigned to client contacts
- [ ] Azure Blob Storage folder created (`validator-bundles/study-{ID}/`)
- [ ] RBAC permissions configured (study-specific)
- [ ] CI/CD pipeline configured in platform

### Client Setup (Study Team)
- [ ] Obtain starter project (GitHub template or platform UI download)
- [ ] Install Node.js 20+ and VS Code
- [ ] Install study metadata NPM package: `@vialiq-studies/{study-id}-metadata`
- [ ] Configure Git repository (if using GitHub template)
- [ ] Run `npm install` and verify build works
- [ ] Run `npm test` and verify tests pass

### Development Workflow
- [ ] Create first validator using SDK template or Visual Builder
- [ ] Write test cases (minimum 3: happy path, edge case, fail-open)
- [ ] Verify test coverage ≥80%
- [ ] Build locally: `npm run build`
- [ ] Submit for approval: `npm run deploy:submit`
- [ ] Platform admin reviews and approves
- [ ] Study admin links validator version in study config
- [ ] Test in platform (UAT environment first)

### Go-Live Checklist
- [ ] All validators tested in UAT
- [ ] Test coverage report reviewed and approved
- [ ] Security scan passed (no banned APIs)
- [ ] GCP manifest generated and archived
- [ ] Rollback plan documented
- [ ] Study admin trained on version management
- [ ] Monitoring alerts configured (study admin + platform team)
- [ ] Production deployment approved by study sponsor

### Post-Deployment
- [ ] Monitor Azure dashboard for bundle load success rate
- [ ] Review validator execution time (should be <5ms avg)
- [ ] Collect user feedback on validation errors (clarity, timing)
- [ ] Schedule protocol amendment reviews (metadata package updates)

---

**Document Revision History:**

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-05-29 | Initial implementation guide | Platform Team |
| 1.1 | 2026-05-29 | Added Module Federation, Azure deployment, approval workflow, study metadata NPM packages, alerting, LTS versioning | Platform Team |

---

**End of Document**
