# EDC Platform Development Plan — Part 1: Foundation & Core Implementation

**Date:** May 31, 2026  
**Version:** 1.0  
**Status:** 📋 Planning Phase  
**Coverage:** Phase 0 → Phase 2 (Weeks 0-4)

---

## 🎯 Part 1 Overview

This plan covers the **foundational infrastructure** and **core form builder** implementation, including:

- ✅ **Phase 0** — Web Component Prerequisites (Week 0-1)
- ✅ **Phase 1** — Foundation & Type System (Week 1-2)
- ✅ **Phase 2** — Canvas & Drag-and-Drop (Week 3-4)

**Goal:** By end of Part 1, users can drag components from palette to canvas, see live `<vi-*>` web component rendering, and have schema auto-generate with unique keys.

---

## 📚 Document Reference Map

| Document | Lines | Key Sections for Part 1 |
|----------|-------|------------------------|
| [form-builder-roadmap.md](form-builder-roadmap.md) | 539 | §3 Implementation Phases (L51-449) |
| [form-builder-architecture.md](form-builder-architecture.md) | 653 | §1 Nx Setup (L1-100), §3 File Structure (L101-200) |
| [form-builder-schema.md](form-builder-schema.md) | 1,613 | §2 FormSchema (L50-150), §3 ComponentSchema (L151-400) |
| [form-builder-dnd.md](form-builder-dnd.md) | 530 | Full document (pragmatic-drag-and-drop integration) |
| [form-builder-registry.md](form-builder-registry.md) | 772 | §2 ComponentDescriptor (L30-150), §3 Registry Service (L151-300) |
| [form-builder-technical-debt.md](form-builder-technical-debt.md) | 413 | TD-06 Read-Only Mode (L175-265), TD-12 Custom Validators (L372-413) |

---

## Phase 0 — Web Component Prerequisites

**Duration:** Week 0-1 (Parallel with Phase 1)  
**Blocker:** Date/time fields cannot render without `<vi-date-picker>`

### 📋 Task List

#### Task 0.1: `<vi-date-picker>` Web Component

**Location:** `libs/web-components/src/date-picker/`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L55-L72)

**Requirements:**
```typescript
// vi-date-picker.ts
@customElement('vi-date-picker')
export class ViDatePicker extends LitElement {
  @property({ type: String }) type: 'date' | 'time' | 'datetime-local' = 'date';
  @property({ type: String }) value = '';
  @property({ type: String }) min?: string;
  @property({ type: String }) max?: string;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readonly = false; // TD-06 requirement
  
  // Form-associated custom element
  static formAssociated = true;
  private _internals: ElementInternals;
  
  // ValidityMixin integration (same as vi-input)
  // ... validity state management
}
```

**Implementation Steps:**

1. **Create component file structure**
   ```bash
   libs/web-components/src/date-picker/
   ├── vi-date-picker.ts          # Main component
   ├── vi-date-picker.spec.ts     # WDIO tests
   └── vi-date-picker.stories.ts  # Storybook documentation
   ```

2. **Implement form-association**
   - Use `ElementInternals` API
   - Implement `formAssociatedCallback()`, `formResetCallback()`
   - Call `internals.setFormValue(value)` on change

3. **Add ValidityMixin**
   - Same pattern as `vi-input` (see [web-components.instructions.md](../.github/instructions/web-components.instructions.md))
   - Support HTML5 constraint validation API

4. **Implement readonly mode** (TD-06)
   - When `readonly=true`: render as `<span class="vi-readonly-value">{formattedDate}</span>`
   - No native `<input>` element, clean text display
   - Reference: [form-builder-technical-debt.md](form-builder-technical-debt.md#L175-L265)

5. **WDIO Tests**
   ```typescript
   // vi-date-picker.spec.ts
   describe('<vi-date-picker>', () => {
     it('should select a date and submit', async () => {
       const picker = await $('vi-date-picker');
       await picker.click();
       // ... select date from calendar
       const form = await $('form');
       await form.submit();
       const value = await picker.getValue();
       expect(value).toMatch(/^\d{4}-\d{2}-\d{2}$/); // ISO 8601
     });
     
     it('should render readonly as text', async () => {
       const picker = await $('vi-date-picker[readonly]');
       const input = await picker.shadow$('input');
       expect(input).not.toExist();
       const text = await picker.getText();
       expect(text).toBe('May 31, 2026'); // Formatted date
     });
   });
   ```

6. **Storybook Documentation**
   - Default story: type="date"
   - Variants: time, datetime-local
   - Interactive: min/max constraints
   - Readonly mode example

**Acceptance Criteria:**
- ✅ Renders native date picker (or custom calendar UI)
- ✅ Returns ISO 8601 string: `2026-05-31`
- ✅ Form-associated: works with native form submission
- ✅ ValidityMixin: `checkValidity()`, `reportValidity()`
- ✅ Readonly mode: clean text display (no input)
- ✅ WDIO tests pass
- ✅ Storybook story published

**Estimated Effort:** 2-3 days

---

## Phase 1 — Foundation (Week 1-2)

**Goal:** Library scaffolded, types complete, schema parseable, registry working

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L74-L95)

### 📋 Task List

#### Task 1.1: Nx Library Setup

**Location:** `libs/form-builder/`

**Reference:** [form-builder-architecture.md](form-builder-architecture.md#L1-L100)

**Steps:**

1. **Generate Nx library**
   ```bash
   npx nx generate @nx/angular:library form-builder \
     --directory=libs/form-builder \
     --publishable \
     --importPath=@vi/form-builder \
     --tags=scope:form-builder,type:lib,framework:angular
   ```

2. **Configure package.json**
   ```json
   {
     "name": "@vi/form-builder",
     "version": "0.1.0",
     "peerDependencies": {
       "@angular/core": ">=21.0.0",
       "@angular/cdk": ">=21.0.0",
       "@vialiq/web-components": ">=0.1.0",
       "@vi/state-fp": ">=1.0.0"
     },
     "dependencies": {
       "@atlaskit/pragmatic-drag-and-drop": "^1.x",
       "@atlaskit/pragmatic-drag-and-drop-hitbox": "^1.x"
     }
   }
   ```

3. **Configure tsconfig.lib.json**
   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": {
       "outDir": "../../dist/out-tsc",
       "declaration": true,
       "declarationMap": true,
       "inlineSources": true,
       "types": [],
       "target": "ES2022",
       "lib": ["ES2022", "DOM"],
       "strict": true,
       "strictNullChecks": true,
       "noImplicitAny": true
     },
     "exclude": ["**/*.spec.ts", "**/*.test.ts"]
   }
   ```

4. **Setup Vitest configuration**
   ```typescript
   // vitest.config.mts
   import { defineConfig } from 'vitest/config';
   import angular from '@analogjs/vite-plugin-angular';
   
   export default defineConfig({
     plugins: [angular()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: ['src/test-setup.ts'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'html', 'lcov'],
         exclude: ['**/*.spec.ts', '**/*.stories.ts']
       }
     }
   });
   ```

5. **Create public API barrel** (`src/index.ts`)
   ```typescript
   // Components
   export { FormBuilderComponent } from './lib/builder/form-builder.component';
   
   // Tokens
   export { BUILDER_COMPONENTS, BUILDER_CONFIG } from './lib/tokens';
   
   // Types
   export type {
     FormSchema, ComponentSchema, ComponentDescriptor,
     ValidationRule, BuilderConfig
   } from './lib/types';
   
   // Built-in descriptors
   export { BUILT_IN_BUILDER_COMPONENTS } from './lib/built-in-components';
   ```

**Acceptance Criteria:**
- ✅ `npx nx build form-builder` succeeds
- ✅ `npx nx test form-builder` runs Vitest
- ✅ Package exports public API only
- ✅ TypeScript strict mode enabled

**Estimated Effort:** 1 day

---

#### Task 1.2: Type System & Schema

**Location:** `libs/form-builder/src/lib/types/`

**Reference:** 
- [form-builder-schema.md](form-builder-schema.md) (full document, 1,613 lines)
- [form-builder-roadmap.md](form-builder-roadmap.md#L29-L42)

**File Structure:**
```
src/lib/types/
├── index.ts                    # Re-exports all types
├── form-schema.ts              # FormSchema root interface
├── component-schema.ts         # Discriminated union
├── base-component-schema.ts    # BaseComponentSchema
├── input-component-schema.ts   # InputComponentSchema
├── layout-component-schema.ts  # LayoutComponentSchema
├── button-component-schema.ts  # ButtonComponentSchema
├── validation-schema.ts        # ValidationRule, RuleDescriptor
├── conditional-rule.ts         # ConditionalRule
├── settings-schema.ts          # SettingsSchema, SettingsField
├── component-descriptor.ts     # ComponentDescriptor interface
└── builder-config.ts           # BuilderConfig
```

**Implementation Steps:**

1. **Define `FormSchema` root type**
   ```typescript
   // form-schema.ts
   /**
    * Root schema for a clinical trial form.
    * Reference: form-builder-schema.md L50-L150
    */
   export interface FormSchema {
     /** Schema version for migration support (Phase 4) */
     readonly schemaVersion: string;  // "1.0.0"
     
     /** Unique form identifier (UUID) */
     readonly id: string;
     
     /** Form title and description */
     readonly title: string;
     readonly description?: string;
     
     /** Display mode: 'form' | 'wizard' (wizard in Phase 4) */
     readonly display: 'form' | 'wizard';
     
     /** Top-level component array (flat or nested) */
     readonly components: ComponentSchema[];
     
     /** Form-level settings */
     readonly settings: FormSettings;
   }
   
   export interface FormSettings {
     /** When to run validation: 'onChange' | 'onBlur' | 'onSubmit' */
     readonly validateOn: 'onChange' | 'onBlur' | 'onSubmit';
     
     /** Max form width (CSS value) */
     readonly maxWidth?: string;  // '800px', '100%'
     
     /** Submit button config */
     readonly submitButton?: {
       readonly label: string;
       readonly disabled?: boolean;
     };
     
     /** Success message after submission */
     readonly successMessage?: string;
     readonly successRedirectUrl?: string;
   }
   ```

2. **Define discriminated union for `ComponentSchema`**
   ```typescript
   // component-schema.ts
   /**
    * Discriminated union of all component schema types.
    * TypeScript narrows by the 'type' field.
    * Reference: form-builder-schema.md L151-L400
    */
   export type ComponentSchema =
     | InputComponentSchema
     | TextareaComponentSchema
     | SelectComponentSchema
     | CheckboxComponentSchema
     | CheckboxGroupComponentSchema
     | RadioComponentSchema
     | DateComponentSchema
     | TimeComponentSchema
     | DateTimeComponentSchema
     | HiddenComponentSchema
     | ContentComponentSchema
     | DividerComponentSchema
     | ButtonComponentSchema
     | LayoutComponentSchema;
   ```

3. **Define `BaseComponentSchema`**
   ```typescript
   // base-component-schema.ts
   /**
    * Properties common to all components.
    * Reference: form-builder-schema.md L200-L300
    */
   export interface BaseComponentSchema {
     /** Unique identifier (UUID) */
     readonly id: string;
     
     /** Component type discriminator */
     readonly type: string;
     
     /** Unique key for data binding (camelCase, no spaces) */
     readonly key: string;
     
     /** Display label */
     readonly label?: string;
     
     /** Label position: 'top' | 'left' | 'right' | 'hidden' */
     readonly labelPosition?: 'top' | 'left' | 'right' | 'hidden';
     
     /** Label width (when labelPosition='left') */
     readonly labelWidth?: string;  // '150px'
     
     /** Help text below field */
     readonly description?: string;
     
     /** Placeholder text */
     readonly placeholder?: string;
     
     /** Default value */
     readonly defaultValue?: unknown;
     
     /** Validation rules */
     readonly validation?: ValidationRule[];
     
     /** Conditional visibility rules */
     readonly conditional?: ConditionalRule;
     
     /** Custom CSS class */
     readonly customClass?: string;
     
     /** Read-only (data visible but not editable) */
     readonly readOnly?: boolean;
     
     /** Locked (builder-only, prevents editing) */
     readonly locked?: boolean;
     
     /** Hidden from UI */
     readonly hidden?: boolean;
     
     /** Repeating field (array of values) */
     readonly isRepeating?: boolean;
   }
   ```

4. **Define input component schemas**
   ```typescript
   // input-component-schema.ts
   export interface InputComponentSchema extends BaseComponentSchema {
     readonly type: 'text-input' | 'email' | 'password' | 'tel' | 'number';
     readonly inputType?: string;  // HTML input type
     readonly maxLength?: number;
     readonly minLength?: number;
     readonly pattern?: string;
     readonly autocomplete?: string;
   }
   
   export interface DateComponentSchema extends BaseComponentSchema {
     readonly type: 'date';
     readonly min?: string;  // ISO 8601
     readonly max?: string;
     readonly dateFormat?: string;  // Display format
   }
   ```

5. **Define layout component schemas**
   ```typescript
   // layout-component-schema.ts
   export type LayoutComponentSchema =
     | PanelComponentSchema
     | ColumnsComponentSchema
     | TabsComponentSchema
     | FieldsetComponentSchema
     | RepeaterComponentSchema;
   
   export interface PanelComponentSchema extends BaseComponentSchema {
     readonly type: 'panel';
     readonly components: ComponentSchema[];  // Nested children
     readonly collapsible?: boolean;
     readonly collapsed?: boolean;
   }
   
   export interface ColumnsComponentSchema extends BaseComponentSchema {
     readonly type: 'columns';
     readonly columns: number;  // 2, 3, 4
     readonly columnAssignments: Record<string, number>;  // { nodeId: columnIndex }
     readonly components: ComponentSchema[];
   }
   ```

6. **Define validation types**
   ```typescript
   // validation-schema.ts
   /**
    * Validation rule discriminated union.
    * Reference: form-builder-validation.md L75-L150
    */
   export type ValidationRule =
     | BuiltInRule
     | JsonLogicRule;
   
   export interface BuiltInRule {
     readonly ruleId: string;  // 'required', 'range', 'pattern'
     readonly type: 'built-in';
     readonly params?: Record<string, unknown>;
     readonly message?: string;
     readonly activeWhen?: JsonLogicExpression;
     readonly targetFieldKey?: string;  // Cross-field validation
   }
   
   export interface JsonLogicRule {
     readonly ruleId: string;
     readonly type: 'json-logic';
     readonly rule: JsonLogicExpression;
     readonly message: string;
     readonly activeWhen?: JsonLogicExpression;
     readonly targetFieldKey?: string;
   }
   
   export type JsonLogicExpression = Record<string, unknown>;
   ```

7. **Define `ComponentDescriptor` interface**
   ```typescript
   // component-descriptor.ts
   /**
    * Descriptor for a drag-and-drop palette item.
    * Pure TypeScript — no Angular dependencies.
    * Reference: form-builder-registry.md L30-L150
    */
   export interface ComponentDescriptor {
     /** Unique type identifier */
     readonly type: string;
     
     /** Display name in palette */
     readonly label: string;
     
     /** Icon name from @vi/icons */
     readonly icon?: string;
     
     /** Palette category */
     readonly category: 'inputs' | 'layout' | 'content' | 'buttons';
     
     /** Sort order within category */
     readonly order?: number;
     
     /** Factory: creates default schema when dragged to canvas */
     readonly createDefaultSchema: (id: string) => ComponentSchema;
     
     /** Settings schema for properties panel */
     readonly settingsSchema?: SettingsSchema;
     
     /** Optional custom Angular component for settings UI */
     readonly settingsComponent?: Type<unknown>;
     
     /** Canvas element tag (for rendering) */
     readonly canvasElement?: string;  // 'vi-input', 'vi-panel'
   }
   ```

8. **Create schema factory function**
   ```typescript
   // form-schema.ts
   export function createEmptyFormSchema(): FormSchema {
     return {
       schemaVersion: '1.0.0',
       id: crypto.randomUUID(),
       title: 'Untitled Form',
       display: 'form',
       components: [],
       settings: {
         validateOn: 'onBlur',
         submitButton: {
           label: 'Submit',
           disabled: false
         }
       }
     };
   }
   ```

**Acceptance Criteria:**
- ✅ All types exported from `src/lib/types/index.ts`
- ✅ TypeScript strict mode passes
- ✅ Discriminated unions correctly narrow by `type` field
- ✅ JSDoc comments on all public interfaces
- ✅ `createEmptyFormSchema()` factory works

**Estimated Effort:** 2-3 days

---

#### Task 1.3: Component Registry Service

**Location:** `libs/form-builder/src/lib/registry/`

**Reference:** 
- [form-builder-registry.md](form-builder-registry.md) (full document, 772 lines)
- [form-builder-roadmap.md](form-builder-roadmap.md#L30-L32)

**Implementation:**

```typescript
// registry/builder-registry.service.ts
import { Injectable, inject } from '@angular/core';
import { BUILDER_COMPONENTS } from '../tokens';
import type { ComponentDescriptor } from '../types';

@Injectable({ providedIn: 'root' })
export class BuilderRegistryService {
  private readonly descriptors = inject(BUILDER_COMPONENTS);
  
  /**
   * Returns all registered descriptors, grouped by category.
   * Reference: form-builder-registry.md L151-L300
   */
  getGrouped(): Record<string, ComponentDescriptor[]> {
    const groups: Record<string, ComponentDescriptor[]> = {
      inputs: [],
      layout: [],
      content: [],
      buttons: []
    };
    
    for (const descriptor of this.descriptors) {
      const category = descriptor.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(descriptor);
    }
    
    // Sort within each category by 'order' field
    for (const category in groups) {
      groups[category].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    }
    
    return groups;
  }
  
  /**
   * Finds a descriptor by type.
   * Returns undefined if not found.
   */
  getByType(type: string): ComponentDescriptor | undefined {
    return this.descriptors.find(d => d.type === type);
  }
  
  /**
   * Returns all descriptor types (for validation).
   */
  getAllTypes(): string[] {
    return this.descriptors.map(d => d.type);
  }
}
```

**Injection Token:**

```typescript
// tokens/builder-components.token.ts
import { InjectionToken } from '@angular/core';
import type { ComponentDescriptor } from '../types';

/**
 * Multi-provider token for component descriptors.
 * Host application can provide additional descriptors.
 */
export const BUILDER_COMPONENTS = new InjectionToken<ComponentDescriptor[]>(
  'BUILDER_COMPONENTS',
  {
    providedIn: 'root',
    factory: () => []  // Empty array; descriptors provided separately
  }
);
```

**Acceptance Criteria:**
- ✅ Service injects `BUILDER_COMPONENTS` multi-provider
- ✅ `getGrouped()` returns descriptors grouped by category
- ✅ Descriptors sorted by `order` within category
- ✅ `getByType()` returns descriptor or undefined
- ✅ Unit test: multi-provider registration works

**Estimated Effort:** 1 day

---

#### Task 1.4: Built-in Component Descriptors

**Location:** `libs/form-builder/src/lib/built-in-components/`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L32-L33)

**File Structure:**
```
built-in-components/
├── index.ts                      # Barrel + BUILT_IN_BUILDER_COMPONENTS array
├── text-input.descriptor.ts
├── email.descriptor.ts
├── password.descriptor.ts
├── tel.descriptor.ts
├── number.descriptor.ts
├── textarea.descriptor.ts
├── select.descriptor.ts
├── checkbox.descriptor.ts
├── checkbox-group.descriptor.ts
├── radio.descriptor.ts
├── date.descriptor.ts
├── time.descriptor.ts
├── datetime-local.descriptor.ts
├── hidden.descriptor.ts
├── content.descriptor.ts
├── divider.descriptor.ts
├── button.descriptor.ts
├── submit.descriptor.ts
├── panel.descriptor.ts
├── columns.descriptor.ts
├── tabs.descriptor.ts
├── fieldset.descriptor.ts
└── repeater.descriptor.ts
```

**Example Descriptor:**

```typescript
// text-input.descriptor.ts
import type { ComponentDescriptor, InputComponentSchema } from '../types';

export const TEXT_INPUT_DESCRIPTOR: ComponentDescriptor = {
  type: 'text-input',
  label: 'Text Input',
  icon: 'text',
  category: 'inputs',
  order: 1,
  
  createDefaultSchema: (id: string): InputComponentSchema => ({
    id,
    type: 'text-input',
    key: '',  // Auto-generated by KeyGeneratorService on drop
    label: 'Text Input',
    placeholder: '',
    validation: []
  }),
  
  settingsSchema: {
    tabs: [
      {
        id: 'general',
        label: 'General',
        fields: [
          {
            key: 'label',
            label: 'Label',
            type: 'text',
            required: true
          },
          {
            key: 'key',
            label: 'Field Key',
            type: 'text',
            required: true,
            pattern: '^[a-z][a-zA-Z0-9]*$',
            description: 'Unique camelCase identifier (auto-generated)'
          },
          {
            key: 'placeholder',
            label: 'Placeholder',
            type: 'text'
          },
          {
            key: 'defaultValue',
            label: 'Default Value',
            type: 'text'
          }
        ]
      },
      {
        id: 'validation',
        label: 'Validation',
        fields: [
          {
            key: 'validation',
            label: 'Rules',
            type: 'validation-rules',  // Custom component
          }
        ]
      },
      {
        id: 'display',
        label: 'Display',
        fields: [
          {
            key: 'labelPosition',
            label: 'Label Position',
            type: 'select',
            options: [
              { label: 'Top', value: 'top' },
              { label: 'Left', value: 'left' },
              { label: 'Right', value: 'right' },
              { label: 'Hidden', value: 'hidden' }
            ],
            defaultValue: 'top'
          },
          {
            key: 'description',
            label: 'Help Text',
            type: 'textarea'
          }
        ]
      }
    ]
  },
  
  canvasElement: 'vi-input'
};
```

**Barrel Export:**

```typescript
// built-in-components/index.ts
import { TEXT_INPUT_DESCRIPTOR } from './text-input.descriptor';
import { EMAIL_DESCRIPTOR } from './email.descriptor';
// ... all other imports

export {
  TEXT_INPUT_DESCRIPTOR,
  EMAIL_DESCRIPTOR,
  // ... all individual exports
};

/**
 * Convenience array: all built-in descriptors.
 * Host can provide this array to BUILDER_COMPONENTS token.
 */
export const BUILT_IN_BUILDER_COMPONENTS = [
  TEXT_INPUT_DESCRIPTOR,
  EMAIL_DESCRIPTOR,
  PASSWORD_DESCRIPTOR,
  TEL_DESCRIPTOR,
  NUMBER_DESCRIPTOR,
  TEXTAREA_DESCRIPTOR,
  SELECT_DESCRIPTOR,
  CHECKBOX_DESCRIPTOR,
  CHECKBOX_GROUP_DESCRIPTOR,
  RADIO_DESCRIPTOR,
  DATE_DESCRIPTOR,
  TIME_DESCRIPTOR,
  DATETIME_LOCAL_DESCRIPTOR,
  HIDDEN_DESCRIPTOR,
  CONTENT_DESCRIPTOR,
  DIVIDER_DESCRIPTOR,
  BUTTON_DESCRIPTOR,
  SUBMIT_DESCRIPTOR,
  PANEL_DESCRIPTOR,
  COLUMNS_DESCRIPTOR,
  TABS_DESCRIPTOR,
  FIELDSET_DESCRIPTOR,
  REPEATER_DESCRIPTOR
];
```

**Acceptance Criteria:**
- ✅ All 23 descriptors created
- ✅ Each descriptor has `createDefaultSchema()` factory
- ✅ Each descriptor has `settingsSchema` for properties panel
- ✅ `BUILT_IN_BUILDER_COMPONENTS` array exported
- ✅ Unit test: each descriptor creates valid schema

**Estimated Effort:** 3-4 days

---

#### Task 1.5: Validation Rule Engine

**Location:** `libs/form-builder/src/lib/validation/`

**Reference:** [form-builder-validation.md](form-builder-validation.md) (3,031 lines)

**Phase 1 Scope:** Rule evaluation logic only (no renderer integration yet)

**File Structure:**
```
validation/
├── index.ts
├── types.ts                    # ValidationRule, RuleResult
├── evaluators/
│   ├── index.ts
│   ├── required.evaluator.ts
│   ├── range.evaluator.ts
│   ├── pattern.evaluator.ts
│   ├── min-length.evaluator.ts
│   ├── max-length.evaluator.ts
│   ├── email.evaluator.ts
│   ├── url.evaluator.ts
│   └── integer.evaluator.ts
└── json-logic/
    ├── json-logic.evaluator.ts
    └── json-logic-js.d.ts      # Type definitions
```

**Implementation:**

```typescript
// validation/types.ts
export type RuleResult =
  | { pass: true }
  | { pass: false; message: string };

export interface EvaluatorContext {
  value: unknown;
  params?: Record<string, unknown>;
  formData?: Record<string, unknown>;
}

export type Evaluator = (context: EvaluatorContext) => RuleResult;
```

**Example Evaluator:**

```typescript
// evaluators/required.evaluator.ts
import type { Evaluator, RuleResult } from '../types';

/**
 * Required validator.
 * Reference: form-builder-validation.md L200-L250
 */
export const requiredEvaluator: Evaluator = ({ value, params }) => {
  const message = params?.message as string ?? 'This field is required';
  
  // Empty check
  if (value === null || value === undefined || value === '') {
    return { pass: false, message };
  }
  
  // Array check
  if (Array.isArray(value) && value.length === 0) {
    return { pass: false, message };
  }
  
  return { pass: true };
};
```

**Registry:**

```typescript
// evaluators/index.ts
import { requiredEvaluator } from './required.evaluator';
import { rangeEvaluator } from './range.evaluator';
// ... all imports

export const BUILT_IN_EVALUATORS: Record<string, Evaluator> = {
  required: requiredEvaluator,
  range: rangeEvaluator,
  pattern: patternEvaluator,
  minLength: minLengthEvaluator,
  maxLength: maxLengthEvaluator,
  email: emailEvaluator,
  url: urlEvaluator,
  integer: integerEvaluator
};
```

**Unit Tests:**

```typescript
// evaluators/required.evaluator.spec.ts
import { describe, it, expect } from 'vitest';
import { requiredEvaluator } from './required.evaluator';

describe('requiredEvaluator', () => {
  it('should fail when value is null', () => {
    const result = requiredEvaluator({ value: null });
    expect(result.pass).toBe(false);
    expect(result.message).toBe('This field is required');
  });
  
  it('should fail when value is empty string', () => {
    const result = requiredEvaluator({ value: '' });
    expect(result.pass).toBe(false);
  });
  
  it('should fail when value is empty array', () => {
    const result = requiredEvaluator({ value: [] });
    expect(result.pass).toBe(false);
  });
  
  it('should pass when value is non-empty string', () => {
    const result = requiredEvaluator({ value: 'John' });
    expect(result.pass).toBe(true);
  });
  
  it('should pass when value is number 0', () => {
    const result = requiredEvaluator({ value: 0 });
    expect(result.pass).toBe(true);
  });
  
  it('should use custom message', () => {
    const result = requiredEvaluator({ 
      value: null, 
      params: { message: 'Name is required' } 
    });
    expect(result.message).toBe('Name is required');
  });
});
```

**Acceptance Criteria:**
- ✅ All 8 built-in evaluators implemented
- ✅ Each evaluator has 100% function coverage tests
- ✅ `BUILT_IN_EVALUATORS` registry exported
- ✅ TypeScript types for all evaluators

**Estimated Effort:** 2 days

---

### Phase 1 Summary

**Total Duration:** Week 1-2 (10 days)

**Deliverables:**
- ✅ Nx library `@vi/form-builder` scaffolded
- ✅ Type system complete (1,600+ lines of types)
- ✅ Component registry service working
- ✅ 23 built-in descriptors created
- ✅ 8 validation evaluators + unit tests

**Validation:**
```bash
# Build succeeds
npx nx build form-builder

# All tests pass
npx nx test form-builder

# Registry resolves descriptors
import { BuilderRegistryService } from '@vi/form-builder';
const registry = inject(BuilderRegistryService);
const groups = registry.getGrouped();
console.log(groups.inputs.length); // 13 input descriptors
```

---

## Phase 2 — Canvas & Drag-and-Drop (Week 3-4)

**Goal:** Drag from palette to canvas works end-to-end. Key auto-generation fires on drop.

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L97-L120)

### 📋 Task List

#### Task 2.1: State Management Services

**Location:** `libs/form-builder/src/lib/services/`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L44-L48)

**File Structure:**
```
services/
├── form-schema.service.ts       # Immutable schema mutations
├── builder-state.service.ts     # UI state (selected node, dragging)
├── history.service.ts           # Undo/redo via state-fp
├── key-generator.service.ts     # Auto-generate unique keys
└── dnd.service.ts               # Drag-and-drop orchestration
```

**Implementation:**

```typescript
// services/form-schema.service.ts
import { Injectable, signal } from '@angular/core';
import { createEmptyFormSchema, type FormSchema, type ComponentSchema } from '../types';

@Injectable()
export class FormSchemaService {
  /** Reactive schema signal */
  readonly schema = signal<FormSchema>(createEmptyFormSchema());
  
  /**
   * Adds a component to the schema.
   * Pure function — returns new schema, does not mutate.
   */
  addComponent(parentId: string | null, index: number, component: ComponentSchema): FormSchema {
    const current = this.schema();
    
    if (parentId === null) {
      // Add to root
      const components = [...current.components];
      components.splice(index, 0, component);
      return { ...current, components };
    }
    
    // Add to nested parent (recursive)
    return {
      ...current,
      components: this._addToParent(current.components, parentId, index, component)
    };
  }
  
  private _addToParent(
    components: ComponentSchema[],
    parentId: string,
    index: number,
    component: ComponentSchema
  ): ComponentSchema[] {
    return components.map(c => {
      if (c.id === parentId && 'components' in c) {
        const children = [...(c.components as ComponentSchema[])];
        children.splice(index, 0, component);
        return { ...c, components: children };
      }
      
      if ('components' in c) {
        return {
          ...c,
          components: this._addToParent(c.components as ComponentSchema[], parentId, index, component)
        };
      }
      
      return c;
    });
  }
  
  /**
   * Removes a component by ID.
   */
  removeComponent(id: string): FormSchema {
    const current = this.schema();
    return {
      ...current,
      components: this._removeById(current.components, id)
    };
  }
  
  private _removeById(components: ComponentSchema[], id: string): ComponentSchema[] {
    return components
      .filter(c => c.id !== id)
      .map(c => {
        if ('components' in c) {
          return {
            ...c,
            components: this._removeById(c.components as ComponentSchema[], id)
          };
        }
        return c;
      });
  }
  
  /**
   * Patches a component (partial update).
   */
  patchComponent(id: string, patch: Partial<ComponentSchema>): FormSchema {
    const current = this.schema();
    return {
      ...current,
      components: this._patchById(current.components, id, patch)
    };
  }
  
  private _patchById(
    components: ComponentSchema[],
    id: string,
    patch: Partial<ComponentSchema>
  ): ComponentSchema[] {
    return components.map(c => {
      if (c.id === id) {
        return { ...c, ...patch };
      }
      
      if ('components' in c) {
        return {
          ...c,
          components: this._patchById(c.components as ComponentSchema[], id, patch)
        };
      }
      
      return c;
    });
  }
  
  /**
   * Duplicates a component (with new ID and key).
   */
  duplicateComponent(id: string, keyGenerator: (label: string, keys: string[]) => string): FormSchema {
    const current = this.schema();
    const node = this.getNode(id);
    if (!node) return current;
    
    const allKeys = this._collectAllKeys(current.components);
    const newKey = keyGenerator(node.label ?? node.key, allKeys);
    const duplicate: ComponentSchema = {
      ...node,
      id: crypto.randomUUID(),
      key: newKey
    };
    
    // Insert duplicate after original
    return this.addComponent(this._findParentId(current.components, id), this._findIndex(current.components, id) + 1, duplicate);
  }
  
  /**
   * Finds a node by ID (recursive search).
   */
  getNode(id: string): ComponentSchema | undefined {
    return this._findById(this.schema().components, id);
  }
  
  private _findById(components: ComponentSchema[], id: string): ComponentSchema | undefined {
    for (const c of components) {
      if (c.id === id) return c;
      if ('components' in c) {
        const found = this._findById(c.components as ComponentSchema[], id);
        if (found) return found;
      }
    }
    return undefined;
  }
  
  /**
   * Checks if a key is unique (excluding a specific node).
   */
  isKeyUnique(key: string, excludeNodeId?: string): boolean {
    const keys = this._collectAllKeys(this.schema().components, excludeNodeId);
    return !keys.includes(key);
  }
  
  private _collectAllKeys(components: ComponentSchema[], excludeId?: string): string[] {
    const keys: string[] = [];
    for (const c of components) {
      if (c.id !== excludeId && c.key) {
        keys.push(c.key);
      }
      if ('components' in c) {
        keys.push(...this._collectAllKeys(c.components as ComponentSchema[], excludeId));
      }
    }
    return keys;
  }
  
  /**
   * Prevents cycles: checks if targetId is a descendant of nodeId.
   */
  isDescendant(nodeId: string, targetId: string): boolean {
    const node = this.getNode(nodeId);
    if (!node || !('components' in node)) return false;
    
    const descendants = this._collectDescendantIds(node.components as ComponentSchema[]);
    return descendants.includes(targetId);
  }
  
  private _collectDescendantIds(components: ComponentSchema[]): string[] {
    const ids: string[] = [];
    for (const c of components) {
      ids.push(c.id);
      if ('components' in c) {
        ids.push(...this._collectDescendantIds(c.components as ComponentSchema[]));
      }
    }
    return ids;
  }
}
```

**Key Generator Service:**

```typescript
// services/key-generator.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class KeyGeneratorService {
  /**
   * Converts label to camelCase key.
   * Reference: form-builder-roadmap.md L50
   * 
   * Examples:
   *   "First Name" → "firstName"
   *   "Blood Pressure (mmHg)" → "bloodPressureMmHg"
   *   "Email Address" → "emailAddress"
   */
  labelToKey(label: string): string {
    return label
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special chars
      .split(/\s+/)                    // Split on whitespace
      .filter(Boolean)                 // Remove empty
      .map((word, i) => {
        const lower = word.toLowerCase();
        return i === 0 ? lower : lower[0].toUpperCase() + lower.slice(1);
      })
      .join('');
  }
  
  /**
   * De-duplicates key by appending suffix.
   * 
   * Examples:
   *   deduplicateKey('firstName', ['firstName']) → 'firstName1'
   *   deduplicateKey('firstName', ['firstName', 'firstName1']) → 'firstName2'
   */
  deduplicateKey(candidate: string, existingKeys: string[]): string {
    if (!existingKeys.includes(candidate)) {
      return candidate;
    }
    
    let suffix = 1;
    while (existingKeys.includes(`${candidate}${suffix}`)) {
      suffix++;
    }
    return `${candidate}${suffix}`;
  }
  
  /**
   * Combined: label to unique key.
   */
  generateUniqueKey(label: string, existingKeys: string[]): string {
    const baseKey = this.labelToKey(label);
    return this.deduplicateKey(baseKey, existingKeys);
  }
}
```

**Acceptance Criteria:**
- ✅ `FormSchemaService` provides immutable mutation functions
- ✅ All mutations return new schema (no in-place mutation)
- ✅ `getNode()` recursively finds nested components
- ✅ `isKeyUnique()` checks across all components
- ✅ `isDescendant()` prevents drop cycles
- ✅ `KeyGeneratorService` converts labels to camelCase
- ✅ De-duplication appends numeric suffix
- ✅ Unit tests for all functions

**Estimated Effort:** 2-3 days

---

#### Task 2.2: Drag-and-Drop Service

**Location:** `libs/form-builder/src/lib/services/dnd.service.ts`

**Reference:** 
- [form-builder-dnd.md](form-builder-dnd.md) (full document, 530 lines)
- [form-builder-roadmap.md](form-builder-roadmap.md#L49-L52)

**Implementation:**

```typescript
// services/dnd.service.ts
import { Injectable, inject } from '@angular/core';
import { monitorForElements, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop';
import { FormSchemaService } from './form-schema.service';
import { KeyGeneratorService } from './key-generator.service';
import { BuilderRegistryService } from '../registry/builder-registry.service';

interface DragData {
  type: 'palette' | 'canvas';
  descriptorType?: string;  // For palette items
  nodeId?: string;          // For canvas nodes
  parentId?: string | null;
  index?: number;
}

@Injectable()
export class DndService {
  private readonly schemaService = inject(FormSchemaService);
  private readonly keyGenerator = inject(KeyGeneratorService);
  private readonly registry = inject(BuilderRegistryService);
  
  /**
   * Registers a palette item as draggable.
   * Returns cleanup function.
   */
  registerPaletteItem(element: HTMLElement, descriptorType: string): () => void {
    const dragData: DragData = {
      type: 'palette',
      descriptorType
    };
    
    element.setAttribute('draggable', 'true');
    element.addEventListener('dragstart', (e) => {
      e.dataTransfer!.effectAllowed = 'copy';
      e.dataTransfer!.setData('application/json', JSON.stringify(dragData));
    });
    
    return () => {
      element.removeAttribute('draggable');
    };
  }
  
  /**
   * Registers a canvas node as draggable.
   * Returns cleanup function.
   */
  registerCanvasNode(
    dragHandle: HTMLElement,
    element: HTMLElement,
    nodeId: string,
    parentId: string | null,
    index: number
  ): () => void {
    const dragData: DragData = {
      type: 'canvas',
      nodeId,
      parentId,
      index
    };
    
    dragHandle.setAttribute('draggable', 'true');
    dragHandle.addEventListener('dragstart', (e) => {
      e.dataTransfer!.effectAllowed = 'move';
      e.dataTransfer!.setData('application/json', JSON.stringify(dragData));
      element.classList.add('dragging');
    });
    
    dragHandle.addEventListener('dragend', () => {
      element.classList.remove('dragging');
    });
    
    return () => {
      dragHandle.removeAttribute('draggable');
    };
  }
  
  /**
   * Registers a drop zone (between nodes, or inside container).
   * Returns cleanup function.
   */
  registerDropZone(
    element: HTMLElement,
    parentId: string | null,
    index: number
  ): () => void {
    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
      element.classList.add('drop-zone-active');
    });
    
    element.addEventListener('dragleave', () => {
      element.classList.remove('drop-zone-active');
    });
    
    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('drop-zone-active');
      
      const dataStr = e.dataTransfer!.getData('application/json');
      const dragData: DragData = JSON.parse(dataStr);
      
      if (dragData.type === 'palette') {
        this._handlePaletteDrop(dragData.descriptorType!, parentId, index);
      } else if (dragData.type === 'canvas') {
        this._handleCanvasMove(dragData.nodeId!, parentId, index);
      }
    });
    
    return () => {
      // Cleanup listeners
    };
  }
  
  private _handlePaletteDrop(descriptorType: string, parentId: string | null, index: number): void {
    const descriptor = this.registry.getByType(descriptorType);
    if (!descriptor) return;
    
    // Create new component schema
    const id = crypto.randomUUID();
    const schema = descriptor.createDefaultSchema(id);
    
    // Auto-generate unique key
    const existingKeys = this._collectAllKeys();
    const generatedKey = this.keyGenerator.generateUniqueKey(schema.label ?? descriptorType, existingKeys);
    
    const componentWithKey = { ...schema, key: generatedKey };
    
    // Add to schema
    const newSchema = this.schemaService.addComponent(parentId, index, componentWithKey);
    this.schemaService.schema.set(newSchema);
  }
  
  private _handleCanvasMove(nodeId: string, targetParentId: string | null, targetIndex: number): void {
    // Cycle prevention
    if (targetParentId && this.schemaService.isDescendant(nodeId, targetParentId)) {
      console.warn('Cannot drop container into itself');
      return;
    }
    
    // 1. Remove from current position
    const node = this.schemaService.getNode(nodeId);
    if (!node) return;
    
    let schema = this.schemaService.removeComponent(nodeId);
    
    // 2. Add to new position
    schema = this.schemaService.addComponent(targetParentId, targetIndex, node);
    this.schemaService.schema.set(schema);
  }
  
  private _collectAllKeys(): string[] {
    const components = this.schemaService.schema().components;
    return this._collectKeysRecursive(components);
  }
  
  private _collectKeysRecursive(components: ComponentSchema[]): string[] {
    const keys: string[] = [];
    for (const c of components) {
      if (c.key) keys.push(c.key);
      if ('components' in c) {
        keys.push(...this._collectKeysRecursive(c.components as ComponentSchema[]));
      }
    }
    return keys;
  }
}
```

**Acceptance Criteria:**
- ✅ `registerPaletteItem()` makes palette items draggable
- ✅ `registerCanvasNode()` makes canvas nodes draggable
- ✅ `registerDropZone()` handles drop events
- ✅ Palette drop: creates new component with auto-generated key
- ✅ Canvas move: removes from old position, adds to new position
- ✅ Cycle prevention: cannot drop container into itself
- ✅ Cleanup functions remove event listeners

**Estimated Effort:** 2-3 days

---

#### Task 2.3: Angular Components (Palette, Canvas, Builder Shell)

**Location:** `libs/form-builder/src/lib/`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L54-L70)

**File Structure:**
```
libs/form-builder/src/lib/
├── builder/
│   ├── form-builder.component.ts       # 3-column layout shell
│   └── builder-toolbar.component.ts    # Undo/redo buttons (minimal in Phase 2)
├── palette/
│   ├── palette.component.ts
│   ├── palette-search.component.ts
│   ├── palette-group.component.ts
│   └── palette-item.component.ts
└── canvas/
    ├── canvas.component.ts
    ├── canvas-empty-state.component.ts
    ├── canvas-form-title.component.ts  # Inline editable title
    ├── canvas-node.component.ts        # Recursive renderer
    ├── canvas-node-overlay.component.ts # Select/delete/duplicate actions
    └── canvas-drop-zone.component.ts
```

**FormBuilderComponent Shell:**

```typescript
// builder/form-builder.component.ts
import { Component, input, output, inject, effect } from '@angular/core';
import { FormSchemaService } from '../services/form-schema.service';
import { DndService } from '../services/dnd.service';
import type { FormSchema } from '../types';

@Component({
  selector: 'vi-form-builder',
  standalone: true,
  imports: [
    BuilderToolbarComponent,
    PaletteComponent,
    CanvasComponent
  ],
  providers: [
    FormSchemaService,
    DndService
  ],
  template: `
    <div class="form-builder">
      <vi-builder-toolbar />
      
      <div class="form-builder-body">
        <!-- Left: Palette -->
        <aside class="palette-sidebar">
          <vi-palette />
        </aside>
        
        <!-- Center: Canvas -->
        <main class="canvas-area">
          <vi-canvas />
        </main>
        
        <!-- Right: Properties Panel (Phase 3) -->
        <!-- <aside class="properties-sidebar">
          <vi-properties-panel />
        </aside> -->
      </div>
    </div>
  `,
  styles: [`
    .form-builder {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .form-builder-body {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    
    .palette-sidebar {
      width: 250px;
      border-right: 1px solid var(--vi-border-color);
      overflow-y: auto;
    }
    
    .canvas-area {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
    }
    
    .properties-sidebar {
      width: 350px;
      border-left: 1px solid var(--vi-border-color);
      overflow-y: auto;
    }
  `]
})
export class FormBuilderComponent {
  /** Input schema (for editing existing form) */
  schema = input<FormSchema>();
  
  /** Output: schema changes */
  schemaChange = output<FormSchema>();
  
  private readonly schemaService = inject(FormSchemaService);
  
  constructor() {
    // Load input schema
    effect(() => {
      const inputSchema = this.schema();
      if (inputSchema) {
        this.schemaService.schema.set(inputSchema);
      }
    });
    
    // Emit schema changes
    effect(() => {
      const currentSchema = this.schemaService.schema();
      this.schemaChange.emit(currentSchema);
    });
  }
}
```

**Palette Component:**

```typescript
// palette/palette.component.ts
import { Component, inject, computed } from '@angular/core';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { PaletteSearchComponent } from './palette-search.component';
import { PaletteGroupComponent } from './palette-group.component';

@Component({
  selector: 'vi-palette',
  standalone: true,
  imports: [PaletteSearchComponent, PaletteGroupComponent],
  template: `
    <div class="palette">
      <vi-palette-search [(searchTerm)]="searchTerm" />
      
      @for (group of filteredGroups(); track group.category) {
        <vi-palette-group 
          [category]="group.category"
          [descriptors]="group.descriptors" />
      }
    </div>
  `
})
export class PaletteComponent {
  private readonly registry = inject(BuilderRegistryService);
  
  searchTerm = signal('');
  
  private readonly allGroups = computed(() => this.registry.getGrouped());
  
  /** Filter groups by search term */
  filteredGroups = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) return this.allGroups();
    
    const filtered: Record<string, ComponentDescriptor[]> = {};
    for (const [category, descriptors] of Object.entries(this.allGroups())) {
      const matches = descriptors.filter(d => 
        d.label.toLowerCase().includes(search) ||
        d.type.toLowerCase().includes(search)
      );
      if (matches.length > 0) {
        filtered[category] = matches;
      }
    }
    return filtered;
  });
}
```

**Palette Item Component:**

```typescript
// palette/palette-item.component.ts
import { Component, input, inject, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { DndService } from '../services/dnd.service';
import type { ComponentDescriptor } from '../types';

@Component({
  selector: 'vi-palette-item',
  standalone: true,
  template: `
    <div class="palette-item">
      @if (descriptor().icon) {
        <vi-icon [name]="descriptor().icon" />
      }
      <span>{{ descriptor().label }}</span>
    </div>
  `,
  styles: [`
    .palette-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border: 1px solid var(--vi-border-color);
      border-radius: 4px;
      cursor: grab;
      transition: background 0.2s;
    }
    
    .palette-item:hover {
      background: var(--vi-hover-bg);
    }
    
    .palette-item:active {
      cursor: grabbing;
    }
  `]
})
export class PaletteItemComponent implements OnInit, OnDestroy {
  descriptor = input.required<ComponentDescriptor>();
  
  private readonly dndService = inject(DndService);
  private readonly elementRef = inject(ElementRef);
  private cleanup?: () => void;
  
  ngOnInit() {
    const element = this.elementRef.nativeElement as HTMLElement;
    this.cleanup = this.dndService.registerPaletteItem(element, this.descriptor().type);
  }
  
  ngOnDestroy() {
    this.cleanup?.();
  }
}
```

**Canvas Component:**

```typescript
// canvas/canvas.component.ts
import { Component, inject, computed } from '@angular/core';
import { FormSchemaService } from '../services/form-schema.service';
import { CanvasEmptyStateComponent } from './canvas-empty-state.component';
import { CanvasFormTitleComponent } from './canvas-form-title.component';
import { CanvasNodeComponent } from './canvas-node.component';
import { CanvasDropZoneComponent } from './canvas-drop-zone.component';

@Component({
  selector: 'vi-canvas',
  standalone: true,
  imports: [
    CanvasEmptyStateComponent,
    CanvasFormTitleComponent,
    CanvasNodeComponent,
    CanvasDropZoneComponent
  ],
  template: `
    <div class="canvas">
      <vi-canvas-form-title />
      
      @if (components().length === 0) {
        <vi-canvas-empty-state />
      } @else {
        <!-- Drop zone before first component -->
        <vi-canvas-drop-zone [parentId]="null" [index]="0" />
        
        @for (component of components(); track component.id; let i = $index) {
          <vi-canvas-node [schema]="component" [parentId]="null" [index]="i" />
          
          <!-- Drop zone after each component -->
          <vi-canvas-drop-zone [parentId]="null" [index]="i + 1" />
        }
      }
    </div>
  `,
  styles: [`
    .canvas {
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class CanvasComponent {
  private readonly schemaService = inject(FormSchemaService);
  
  components = computed(() => this.schemaService.schema().components);
}
```

**Canvas Node Component (Recursive):**

```typescript
// canvas/canvas-node.component.ts
import { Component, input, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { CanvasNodeOverlayComponent } from './canvas-node-overlay.component';
import type { ComponentSchema } from '../types';

@Component({
  selector: 'vi-canvas-node',
  standalone: true,
  imports: [CanvasNodeOverlayComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Allow vi-* custom elements
  template: `
    <div class="canvas-node">
      <vi-canvas-node-overlay [nodeId]="schema().id" />
      
      <!-- Render the web component -->
      @if (canvasElement()) {
        <ng-container [ngSwitch]="canvasElement()">
          <vi-input 
            *ngSwitchCase="'vi-input'"
            [label]="schema().label"
            [placeholder]="schema().placeholder"
            [value]="schema().defaultValue"
            [required]="hasRequiredRule()"
            disabled />
          
          <!-- ... other vi-* elements ... -->
        </ng-container>
      }
      
      <!-- Recursive: render nested children -->
      @if (hasChildren()) {
        <div class="canvas-node-children">
          @for (child of children(); track child.id; let i = $index) {
            <vi-canvas-node 
              [schema]="child" 
              [parentId]="schema().id" 
              [index]="i" />
          }
        </div>
      }
    </div>
  `
})
export class CanvasNodeComponent {
  schema = input.required<ComponentSchema>();
  parentId = input.required<string | null>();
  index = input.required<number>();
  
  private readonly registry = inject(BuilderRegistryService);
  
  canvasElement = computed(() => {
    const descriptor = this.registry.getByType(this.schema().type);
    return descriptor?.canvasElement;
  });
  
  hasChildren = computed(() => {
    return 'components' in this.schema();
  });
  
  children = computed(() => {
    const s = this.schema();
    return 'components' in s ? (s.components as ComponentSchema[]) : [];
  });
  
  hasRequiredRule = computed(() => {
    const rules = this.schema().validation ?? [];
    return rules.some(r => r.type === 'built-in' && r.ruleId === 'required');
  });
}
```

**Acceptance Criteria:**
- ✅ `FormBuilderComponent` renders 3-column layout
- ✅ Palette shows grouped descriptors
- ✅ Palette search filters components
- ✅ Palette items are draggable
- ✅ Canvas shows empty state when no components
- ✅ Canvas form title is inline editable
- ✅ Canvas nodes render `<vi-*>` web components
- ✅ Canvas nodes show required `*` indicator
- ✅ Canvas nodes have overlay with select/delete/duplicate actions
- ✅ Drop zones appear between nodes
- ✅ Dragging palette item to canvas adds component with auto-generated key
- ✅ Canvas nodes are recursive (render nested children)

**Estimated Effort:** 5-6 days

---

### Phase 2 Summary

**Total Duration:** Week 3-4 (10 days)

**Deliverables:**
- ✅ `FormSchemaService` with immutable mutations
- ✅ `KeyGeneratorService` auto-generates unique keys
- ✅ `DndService` orchestrates drag-and-drop
- ✅ Palette with search and grouped descriptors
- ✅ Canvas with recursive node rendering
- ✅ Drop zones between nodes
- ✅ Drag palette → canvas → schema updates
- ✅ `<vi-*>` web components render on canvas

**Validation:**
```bash
# Start Storybook
npx nx run form-builder:storybook

# Drag "Text Input" from palette to canvas
# → New InputComponentSchema added to schema
# → Key auto-generated as "textInput"

# Drag second "Text Input"
# → Key de-duplicated as "textInput1"

# Inspect schema:
console.log(formBuilder.schemaService.schema());
// {
//   components: [
//     { id: '...', type: 'text-input', key: 'textInput', label: 'Text Input' },
//     { id: '...', type: 'text-input', key: 'textInput1', label: 'Text Input' }
//   ]
// }
```

---

## Part 1 Completion Checklist

**Phase 0 (Parallel):**
- [ ] `<vi-date-picker>` web component implemented
- [ ] Form-associated custom element
- [ ] ValidityMixin integration
- [ ] Readonly mode rendering
- [ ] WDIO tests passing
- [ ] Storybook story published

**Phase 1:**
- [ ] Nx library scaffolded
- [ ] All types defined (FormSchema, ComponentSchema, ValidationRule)
- [ ] `BuilderRegistryService` implemented
- [ ] 23 built-in descriptors created
- [ ] 8 validation evaluators + 100% test coverage

**Phase 2:**
- [ ] `FormSchemaService` immutable mutations
- [ ] `KeyGeneratorService` label-to-key conversion
- [ ] `DndService` drag-and-drop orchestration
- [ ] Palette component with search
- [ ] Canvas component with recursive rendering
- [ ] Drop zones between nodes
- [ ] Drag palette → canvas → schema updates
- [ ] Key auto-generation on drop
- [ ] Canvas nodes render `<vi-*>` web components

**Integration Test:**
- [ ] Open Storybook: `npx nx run form-builder:storybook`
- [ ] Drag "Text Input" from palette to canvas
- [ ] Verify schema updates with unique key
- [ ] Drag "Panel" to canvas
- [ ] Drag "Text Input" into panel (nested)
- [ ] Verify recursive schema structure
- [ ] Duplicate a node → key de-duplicates correctly
- [ ] Delete a node → schema updates

---

## Next Steps

**Part 2: Properties Panel & Layout Components** (Weeks 5-8)
- Phase 3: Properties Panel & History (undo/redo)
- Phase 4: Layout Components (Panel, Columns, Tabs, Fieldset, Repeater)
- Phase 5: Validation & Conditionals (rule editor, conditional visibility)

See [development-plan-part-2-properties-layout.md](development-plan-part-2-properties-layout.md) *(to be created)*

---

**END OF PART 1**
