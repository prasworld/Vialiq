# Form Builder — Component Registry

> **Status:** Brainstorm / Planning  
> **Date:** 2026-05-21  
> Related docs: [overview](./form-builder-overview.md) · [architecture](./form-builder-architecture.md) · [schema](./form-builder-schema.md)

---

## 1. Design Goals

The registry answers the question: **"What draggable components exist in the palette, and how does each one behave?"**

Design constraints:
1. **Open/Closed** — Built-in components are provided by the library. Third-party components are added without modifying library code.
2. **Tree-shakeable** — Unused built-in components do not appear in the host app's bundle.
3. **Lazy** — Custom settings components are loaded on demand via dynamic import.
4. **Testable** — The registry is injectable; tests provide their own descriptors.
5. **Angular-native** — Uses `InjectionToken` multi-provider, the idiomatic Angular DI pattern.
6. **Framework-agnostic core** — `ComponentDescriptor` is a plain TypeScript interface. The Angular DI layer is a thin shell around it.

---

## 2. `ComponentDescriptor` Interface

```typescript
// libs/form-builder/src/lib/types/component-descriptor.ts

import type { Type } from '@angular/core';
import type { ComponentSchema } from './schema';
import type { SettingsSchema } from './settings-schema';

/**
 * Describes a single draggable component type.
 * This is the primary extension point for the form builder.
 *
 * A ComponentDescriptor is a plain object — no Angular-specific code.
 * The Angular DI layer (BUILDER_COMPONENTS token) is the only Angular touch point.
 */
export interface ComponentDescriptor {
  /**
   * Unique identifier for this component type.
   * Must match ComponentSchema.type exactly.
   * Use kebab-case: 'text-input', 'date-picker', 'address-autocomplete'.
   */
  type: string;

  /**
   * Human-readable display name shown in the palette.
   * e.g. 'Text Field', 'Date Picker'
   */
  label: string;

  /**
   * Palette category key. Built-in categories: 'basic' | 'layout' | 'advanced'.
   * Custom categories can use any string; they will appear as new palette groups.
   */
  category: BuiltInCategory | string;

  /**
   * Icon name from @vialiq/icons. Shown in the palette tile and canvas overlay.
   */
  icon: string;

  /**
   * Sort weight within the category. Lower = higher in the list.
   * Built-in basic components start at 0, 10, 20, …
   */
  weight?: number;

  /**
   * Default ComponentSchema applied when this component is dragged onto the canvas.
   * The builder generates a UUID `id` and requires the consumer to set `key` in the
   * properties panel before saving. `type` is set automatically from this descriptor.
   */
  defaultSchema: Omit<Partial<ComponentSchema>, 'id' | 'type'> & { label: string };

  /**
   * Declarative meta-schema for the properties panel.
   * Interpreted by SettingsPanelComponent to generate a reactive form.
   * See: form-builder-schema.md §6
   */
  settingsSchema: SettingsSchema;

  /**
   * Optional: custom Angular component rendered in the properties panel
   * instead of (or in addition to) the settingsSchema-driven panel.
   * Loaded lazily via dynamic import.
   *
   * The component must implement SettingsComponentInterface.
   */
  settingsComponent?: () => Promise<Type<SettingsComponentInterface>>;

  /**
   * The HTML custom element tag name rendered on the canvas and in the renderer.
   * e.g. 'vi-input', 'vi-button', 'vi-date-picker'
   * Must be a registered custom element (from @vialiq/web-components or a custom WCEA).
   */
  canvasElement: string;

  /**
   * Pure function: maps a ComponentSchema to the DOM attributes/properties
   * that will be set on `canvasElement` during canvas rendering.
   * Return Record<string, string | boolean | null> — null removes the attribute.
   */
  canvasProps?: (schema: ComponentSchema) => Record<string, string | boolean | null | undefined>;

  /**
   * How the renderer should render this component type.
   *
   * - `{ kind: 'custom-element', tagName }` — wraps any Lit web component (or any CE) in
   *   `vi-renderer-generic`, which passes schema props as element attributes/properties.
   *   Use this when you already have a Lit CE and don't need a custom Angular wrapper.
   *
   * - `{ kind: 'angular', component }` — lazy-loads a full Angular standalone component.
   *   Use this when you need Angular DI, computed signals, or complex rendering logic in
   *   the renderer (e.g., a cascading-select that calls an API).
   *
   * When omitted, the renderer falls back to `canvasElement` in `vi-renderer-generic`.
   * Built-in types ('text-input', 'select', 'panel', etc.) ignore this field — they use
   * their own hard-coded `vi-renderer-*` Angular wrapper components.
   */
  rendererRef?: RendererComponentRef;

  /**
   * If true, this component is a layout container: it has a `components[]` child array
   * and renders CanvasContainerComponent. The builder enables child drop zones inside it.
   * Default: false
   */
  isLayoutComponent?: boolean;

  /**
   * Whether this component type supports the isRepeating field-level repeating mechanic.
   * When true, the builder properties panel shows the "Allow multiple values" toggle.
   * When false (or omitted), isRepeating is hidden from the settings panel.
   *
   * Layout components (isLayoutComponent: true), hidden fields, dividers, and content
   * blocks should set this to false or omit it.
   * Field types (text-input, email, tel, select, textarea, date, radio, etc.) should
   * set this to true.
   * Default: false
   */
  supportsRepeating?: boolean;
}

/**
 * Describes how the renderer should instantiate a custom component type.
 * One of two strategies: a Lit/CE generic wrapper, or a full Angular component.
 */
export type RendererComponentRef =
  | {
      kind: 'custom-element';
      /**
       * The CE tag name (Lit or any spec-compliant custom element).
       * Rendered inside `vi-renderer-generic` — an Angular wrapper that bridges
       * FieldStateService signals to element attributes and listens for CE events.
       * All Lit leaf components in @vialiq/web-components qualify here.
       */
      tagName: string;
      /**
       * Optional prop mapper — same signature as canvasProps.
       * Maps ComponentSchema fields to element attribute/property names.
       * If omitted, a default set of props (label, value, disabled, errorMessage) is applied.
       */
      elementProps?: (schema: ComponentSchema) => Record<string, string | boolean | null | undefined>;
    }
  | {
      kind: 'angular';
      /**
       * Lazy-loaded Angular 21 standalone component.
       * Must implement RendererComponentInterface (see @vi/form-renderer).
       * Receives `schema` as an `input.required<ComponentSchema>()` signal.
       * Can inject FieldStateService, FORM_DATA_SERVICE, etc. via Angular DI.
       */
      component: () => Promise<Type<RendererComponentInterface>>;
    };

export type BuiltInCategory = 'basic' | 'layout' | 'advanced';

/**
 * Interface that custom settings components must implement.
 */
export interface SettingsComponentInterface {
  /** The current node schema. Builder sets this when the component mounts. */
  schema: ComponentSchema;

  /**
   * Emitted when the user changes a setting.
   * Payload is a partial patch of the ComponentSchema.
   * The builder merges this into the full schema via FormSchemaService.patchComponent().
   */
  schemaChange: EventEmitter<Partial<ComponentSchema>>;
}
```

---

## 3. `BUILDER_COMPONENTS` InjectionToken

```typescript
// libs/form-builder/src/lib/tokens/builder-components.token.ts

import { InjectionToken } from '@angular/core';
import type { ComponentDescriptor } from '../types/component-descriptor';

/**
 * Multi-provider token. Each registered component descriptor contributes
 * one value to the array that BuilderRegistryService receives.
 *
 * Usage:
 *   { provide: BUILDER_COMPONENTS, useValue: MY_DESCRIPTOR, multi: true }
 */
export const BUILDER_COMPONENTS = new InjectionToken<ComponentDescriptor[]>(
  'BUILDER_COMPONENTS',
  {
    // providedIn: null — consumers must provide this in their app config
    // or a specific component/route injector.
    providedIn: null,
  }
);
```

---

## 4. `BUILDER_CONFIG` InjectionToken

```typescript
// libs/form-builder/src/lib/tokens/builder-config.token.ts

import { InjectionToken } from '@angular/core';

export interface BuilderConfig {
  /**
   * Map of category key → display config.
   * Controls which categories appear in the palette and in what order.
   * Unlisted categories from third-party descriptors are appended at the end.
   */
  categories?: Record<string, CategoryConfig>;

  /**
   * Whether to show the built-in toolbar (undo/redo/preview/save buttons).
   * Set false if the host renders its own toolbar. Default: true.
   */
  showToolbar?: boolean;

  /**
   * Whether the properties panel is embedded in the right column (default)
   * or opened in a <vi-drawer> sidebar. Default: 'column'.
   */
  propertiesPanelMode?: 'column' | 'sidebar';

  /**
   * Breakpoint (px) below which the properties panel collapses to sidebar mode
   * regardless of propertiesPanelMode setting. Default: 960.
   */
  sidebarBreakpoint?: number;

  /**
   * Hook called after every schema mutation. Useful for auto-save.
   * Called with the new full FormSchema.
   */
  onSchemaChange?: (schema: FormSchema) => void;

  /**
   * History debounce in milliseconds.
   * Rapid mutations within this window are coalesced into a single undo snapshot.
   * Use case: typing in the label field — each keystroke calls patchComponent(),
   * but only one undo step should capture the whole word/phrase.
   * Default: 500
   */
  historyDebounceMs?: number;

  /**
   * Maximum number of undo/redo snapshots to keep.
   * Older snapshots are discarded to prevent unbounded memory growth.
   * Default: 100
   */
  maxHistorySize?: number;

  /**
   * Allow `custom-js` validation rules in the properties panel.
   * When false (default), the `custom-js` rule type is hidden from the rule picker
   * and any existing `custom-js` rules are rendered as read-only.
   * SECURITY: enabling this requires `unsafe-eval` in your CSP.
   * Default: false
   */
  allowCustomJs?: boolean;
}

export interface CategoryConfig {
  label: string;
  weight: number;         // Sort order. Lower = appears first.
  collapsed?: boolean;    // Initial palette group collapsed state. Default: false.
}

export const DEFAULT_BUILDER_CONFIG: Required<BuilderConfig> = {
  categories: {
    basic:    { label: 'Basic',    weight: 0  },
    layout:   { label: 'Layout',   weight: 10 },
    advanced: { label: 'Advanced', weight: 20 },
  },
  showToolbar: true,
  propertiesPanelMode: 'column',
  sidebarBreakpoint: 960,
  onSchemaChange: () => {},
  historyDebounceMs: 500,
  maxHistorySize: 100,
  allowCustomJs: false,
};

export const BUILDER_CONFIG = new InjectionToken<BuilderConfig>(
  'BUILDER_CONFIG',
  { providedIn: null }
);
```

---

## 5. `BuilderRegistryService`

```typescript
// libs/form-builder/src/lib/registry/builder-registry.service.ts

import { inject, Injectable, Optional } from '@angular/core';
import { BUILDER_COMPONENTS } from '../tokens/builder-components.token';
import { BUILDER_CONFIG, DEFAULT_BUILDER_CONFIG } from '../tokens/builder-config.token';
import type { ComponentDescriptor } from '../types/component-descriptor';

@Injectable({ providedIn: 'root' })
export class BuilderRegistryService {
  private readonly _descriptors: ComponentDescriptor[];
  private readonly _config: Required<BuilderConfig>;

  constructor() {
    // inject() resolves the multi-provider array
    const injected = inject(BUILDER_COMPONENTS, { optional: true }) ?? [];
    this._descriptors = injected.flat();

    const configOverride = inject(BUILDER_CONFIG, { optional: true }) ?? {};
    this._config = { ...DEFAULT_BUILDER_CONFIG, ...configOverride };

    this._validate();
  }

  /** Look up a descriptor by its type string. */
  getByType(type: string): ComponentDescriptor | undefined {
    return this._descriptors.find(d => d.type === type);
  }

  /**
   * Returns descriptors grouped by category, sorted by:
   *   1. Category weight (from BuilderConfig.categories)
   *   2. Descriptor weight within the category
   */
  getGrouped(): Map<string, ComponentDescriptor[]> {
    const categoryOrder = this._buildCategoryOrder();
    const groups = new Map<string, ComponentDescriptor[]>();

    // Sort descriptors within each category
    const sorted = [...this._descriptors].sort((a, b) => {
      const aWeight = a.weight ?? 99;
      const bWeight = b.weight ?? 99;
      return aWeight - bWeight;
    });

    for (const descriptor of sorted) {
      const existing = groups.get(descriptor.category) ?? [];
      groups.set(descriptor.category, [...existing, descriptor]);
    }

    // Return entries sorted by category weight
    return new Map(
      [...groups.entries()].sort(([catA], [catB]) => {
        const orderA = categoryOrder.get(catA) ?? 9999;
        const orderB = categoryOrder.get(catB) ?? 9999;
        return orderA - orderB;
      })
    );
  }

  /** All descriptors as a flat array. */
  getAll(): ComponentDescriptor[] {
    return this._descriptors;
  }

  get config(): Required<BuilderConfig> {
    return this._config;
  }

  private _buildCategoryOrder(): Map<string, number> {
    const order = new Map<string, number>();
    for (const [key, config] of Object.entries(this._config.categories ?? {})) {
      order.set(key, config.weight);
    }
    return order;
  }

  private _validate(): void {
    const types = this._descriptors.map(d => d.type);
    const duplicates = types.filter((t, i) => types.indexOf(t) !== i);
    if (duplicates.length > 0) {
      console.warn(`[FormBuilder] Duplicate component types in registry: ${duplicates.join(', ')}`);
    }
  }
}
```

---

## 6. Built-In Component Descriptors

### 6.1 Text Input Descriptor Example

```typescript
// libs/form-builder/src/lib/built-in-components/text-input.descriptor.ts

import type { ComponentDescriptor } from '../types/component-descriptor';
import { TEXT_INPUT_SETTINGS_SCHEMA } from '../settings-schemas/text-input.settings-schema';

export const TEXT_INPUT_DESCRIPTOR: ComponentDescriptor = {
  type: 'text-input',
  label: 'Text Field',
  category: 'basic',
  icon: 'text-cursor',    // from @vialiq/icons
  weight: 0,
  supportsRepeating: true,

  defaultSchema: {
    label: 'Text Field',
    key: '',              // user must fill in key in properties panel
    placeholder: '',
    validation: { rules: [] },
  },

  settingsSchema: TEXT_INPUT_SETTINGS_SCHEMA,

  canvasElement: 'vi-input',

  canvasProps: (schema) => {
    const s = schema as InputComponentSchema;
    return {
      type:        s.type === 'text-input' ? 'text' : undefined,
      placeholder: s.placeholder ?? null,
      disabled:    s.disabled ? '' : null,
      value:       s.defaultValue != null ? String(s.defaultValue) : null,
    };
  },
};
```

### 6.2 Panel Layout Descriptor Example

```typescript
// libs/form-builder/src/lib/built-in-components/panel.descriptor.ts

import type { ComponentDescriptor } from '../types/component-descriptor';
import { PANEL_SETTINGS_SCHEMA } from '../settings-schemas/panel.settings-schema';

export const PANEL_DESCRIPTOR: ComponentDescriptor = {
  type: 'panel',
  label: 'Panel',
  category: 'layout',
  icon: 'layout-panel',
  weight: 0,
  isLayoutComponent: true,

  defaultSchema: {
    label: 'Panel',
    key: '',
    layoutConfig: {
      kind: 'panel',
      collapsible: false,
      collapsed: false,
      theme: 'default',
    },
    components: [],
  },

  settingsSchema: PANEL_SETTINGS_SCHEMA,
  canvasElement: 'vi-panel',  // future web component
  canvasProps: (schema) => {
    const s = schema as LayoutComponentSchema;
    const config = s.layoutConfig as PanelConfig;
    return {
      label:       s.label,
      collapsible: config.collapsible ? '' : null,
      theme:       config.theme ?? null,
    };
  },
};
```

### 6.3 Convenience Bundle

```typescript
// libs/form-builder/src/lib/built-in-components/index.ts

import { TEXT_INPUT_DESCRIPTOR } from './text-input.descriptor';
import { EMAIL_DESCRIPTOR }      from './email.descriptor';
import { PASSWORD_DESCRIPTOR }   from './password.descriptor';
import { TEL_DESCRIPTOR }        from './tel.descriptor';
import { NUMBER_DESCRIPTOR }     from './number.descriptor';
import { TEXTAREA_DESCRIPTOR }   from './textarea.descriptor';
import { SELECT_DESCRIPTOR }     from './select.descriptor';
import { CHECKBOX_DESCRIPTOR }   from './checkbox.descriptor';
import { RADIO_DESCRIPTOR }      from './radio.descriptor';
import { BUTTON_DESCRIPTOR }     from './button.descriptor';
import { SUBMIT_DESCRIPTOR }     from './submit.descriptor';
import { PANEL_DESCRIPTOR }      from './panel.descriptor';
import { COLUMNS_DESCRIPTOR }    from './columns.descriptor';
import { TABS_DESCRIPTOR }       from './tabs.descriptor';
import { FIELDSET_DESCRIPTOR }   from './fieldset.descriptor';
import { REPEATER_DESCRIPTOR }   from './repeater.descriptor';
// import { SUB_FORM_DESCRIPTOR } from './sub-form.descriptor';  // deferred to v2+
import type { ComponentDescriptor } from '../types/component-descriptor';

export const BUILT_IN_BASIC_COMPONENTS: ComponentDescriptor[] = [
  TEXT_INPUT_DESCRIPTOR,
  EMAIL_DESCRIPTOR,
  PASSWORD_DESCRIPTOR,
  TEL_DESCRIPTOR,
  NUMBER_DESCRIPTOR,
  TEXTAREA_DESCRIPTOR,
  SELECT_DESCRIPTOR,
  CHECKBOX_DESCRIPTOR,
  RADIO_DESCRIPTOR,
];

export const BUILT_IN_BUTTON_COMPONENTS: ComponentDescriptor[] = [
  BUTTON_DESCRIPTOR,
  SUBMIT_DESCRIPTOR,
];

export const BUILT_IN_LAYOUT_COMPONENTS: ComponentDescriptor[] = [
  PANEL_DESCRIPTOR,
  COLUMNS_DESCRIPTOR,
  TABS_DESCRIPTOR,
  FIELDSET_DESCRIPTOR,
  REPEATER_DESCRIPTOR,
];

export const BUILT_IN_ADVANCED_COMPONENTS: ComponentDescriptor[] = [
  // SUB_FORM_DESCRIPTOR — deferred to v2+
];

/**
 * All built-in descriptors as a flat array.
 * Import this and spread into BUILDER_COMPONENTS multi-providers for a full palette.
 */
export const BUILT_IN_BUILDER_COMPONENTS: ComponentDescriptor[] = [
  ...BUILT_IN_BASIC_COMPONENTS,
  ...BUILT_IN_BUTTON_COMPONENTS,
  ...BUILT_IN_LAYOUT_COMPONENTS,
  ...BUILT_IN_ADVANCED_COMPONENTS,
];
```

---

## 7. Registration Patterns

### 7.1 Full Built-in Registration (`app.config.ts`)

```typescript
import { ApplicationConfig } from '@angular/core';
import { BUILDER_COMPONENTS, BUILT_IN_BUILDER_COMPONENTS } from '@vi/form-builder';

export const appConfig: ApplicationConfig = {
  providers: [
    // Register all built-ins in one shot
    ...BUILT_IN_BUILDER_COMPONENTS.map(descriptor => ({
      provide: BUILDER_COMPONENTS,
      useValue: descriptor,
      multi: true,
    })),
  ],
};
```

### 7.2 Cherry-picked Built-ins (tree-shakeable)

```typescript
import { BUILDER_COMPONENTS, TEXT_INPUT_DESCRIPTOR, BUTTON_DESCRIPTOR } from '@vi/form-builder';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: BUILDER_COMPONENTS, useValue: TEXT_INPUT_DESCRIPTOR, multi: true },
    { provide: BUILDER_COMPONENTS, useValue: BUTTON_DESCRIPTOR,     multi: true },
  ],
};
```

### 7.3 Adding a Custom Component

```typescript
// my-feature/my-rating.descriptor.ts

import type { ComponentDescriptor } from '@vi/form-builder';

const MY_RATING_SETTINGS_SCHEMA: SettingsSchema = {
  tabs: [{
    id: 'display',
    label: 'Display',
    fields: [
      { type: 'text',   key: 'label', label: 'Label', required: true, defaultValue: 'Rating' },
      { type: 'number', key: 'properties.maxStars', label: 'Max Stars', min: 3, max: 10, defaultValue: 5 },
    ]
  }]
};

export const MY_RATING_DESCRIPTOR: ComponentDescriptor = {
  type: 'my-rating',
  label: 'Star Rating',
  category: 'advanced',   // appears under built-in 'Advanced' group
  icon: 'star',
  weight: 5,
  isLayoutComponent: false,

  defaultSchema: {
    label: 'Rating',
    key: '',
    properties: { maxStars: 5 },
  },

  settingsSchema: MY_RATING_SETTINGS_SCHEMA,

  // Could use a custom settings component instead:
  settingsComponent: () =>
    import('./my-rating-settings.component')
      .then(m => m.MyRatingSettingsComponent),

  // Canvas element — used in the builder's live-preview canvas.
  // Must be a registered custom element (Lit or any spec-compliant CE).
  canvasElement: 'my-star-rating',

  canvasProps: (schema) => ({
    'max-stars': String(schema.properties?.['maxStars'] ?? 5),
    label:       schema.label,
  }),

  // Renderer strategy — how FormRendererComponent renders this type at runtime.
  // Option A: reuse the same Lit CE via the generic wrapper (simplest):
  rendererRef: {
    kind: 'custom-element',
    tagName: 'my-star-rating',
    elementProps: (schema) => ({
      'max-stars': String(schema.properties?.['maxStars'] ?? 5),
      label:       schema.label,
    }),
  },

  // Option B: full Angular component (use when you need DI, signals, or API calls):
  // rendererRef: {
  //   kind: 'angular',
  //   component: () =>
  //     import('./my-renderer-star-rating.component')
  //       .then(m => m.MyRendererStarRatingComponent),
  // },
};
```

Register in feature module's `Route.providers`:

```typescript
// Lazy feature route — component is only loaded when this route is activated:
{
  path: 'form-editor',
  component: FormEditorPageComponent,
  providers: [
    { provide: BUILDER_COMPONENTS, useValue: MY_RATING_DESCRIPTOR, multi: true },
  ]
}
```

### 7.4 Custom Category

```typescript
// app.config.ts — declare a custom category in BUILDER_CONFIG:
import { BUILDER_CONFIG } from '@vi/form-builder';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: BUILDER_CONFIG,
      useValue: {
        categories: {
          basic:   { label: 'Basic',    weight: 0  },
          layout:  { label: 'Layout',   weight: 10 },
          advanced:{ label: 'Advanced', weight: 20 },
          crm:     { label: 'CRM Fields', weight: 30 },  // 🆕 custom
        },
      },
    },
    { provide: BUILDER_COMPONENTS, useValue: MY_RATING_DESCRIPTOR, multi: true },
    { provide: BUILDER_COMPONENTS, useValue: { ...MY_RATING_DESCRIPTOR, category: 'crm' }, multi: true },
  ]
};
```

---

## 8. Registry in the Palette

`PaletteComponent` reads from `BuilderRegistryService.getGrouped()` and renders groups:

```typescript
@Component({
  selector: 'vi-palette',
  standalone: true,
  imports: [PaletteGroupComponent],
  template: `
    @for (group of groups(); track group[0]) {
      <vi-palette-group [category]="group[0]" [descriptors]="group[1]" />
    }
  `
})
export class PaletteComponent {
  private readonly _registry = inject(BuilderRegistryService);

  // Signal derived from the registry (read-once, registry is static at runtime)
  protected groups = signal([...this._registry.getGrouped().entries()]);
}
```

---

## 9. Cross-Framework Consideration

### Current: Angular-only builder, framework-agnostic output

The `ComponentDescriptor` interface is a plain TypeScript object with no Angular imports. This is intentional:

```typescript
// ✅ No Angular imports in ComponentDescriptor
// ✅ No Angular imports in rule-engine.ts, schema.ts, validation.ts
// ⚠️  Angular-specific: BUILDER_COMPONENTS token, BuilderRegistryService, all components
```

### Future: `@vi/form-builder-core` (v3+)

If a React or Vue builder is needed, extract the framework-agnostic parts:

```
@vi/form-builder-core (framework-agnostic)
├── types/          ← ComponentDescriptor, FormSchema, RuleDescriptor, SettingsSchema
├── registry/       ← Plain TS class: ComponentRegistry (no DI)
├── validation/     ← rule-engine.ts (pure functions)
├── mutations/      ← addComponent, removeComponent, moveComponent, patchComponent
└── history/        ← HistoryManager (wraps state-fp, no Angular)

@vi/form-builder (Angular adapter)
├── tokens/         ← BUILDER_COMPONENTS, BUILDER_CONFIG (uses @vi/form-builder-core)
├── services/       ← BuilderRegistryService, FormSchemaService (Angular wrappers)
└── components/     ← PaletteComponent, CanvasComponent, etc. (Angular standalone)

@vi/form-builder-react (React adapter, v3+)
├── context/        ← BuilderContext (wraps @vi/form-builder-core ComponentRegistry)
├── hooks/          ← useFormBuilder, useRegistry
└── components/     ← Palette, Canvas (React)
```

The web component output (`<vi-form>`, `<vi-drawer>`) already works across frameworks — no adapter needed.

### Why NOT tsyringe/inversify for v1

tsyringe and inversify are viable IoC containers for cross-framework dependency injection. However:

- They require reflect-metadata (decorator metadata), which has polyfill overhead.
- Angular 21 has native DI that is more powerful and better integrated (tree-shaking, scope, lazy injection).
- The overhead is not justified until we actually need a React/Vue builder.
- The `ComponentDescriptor` plain-object design means the registry's data is already framework-agnostic. Only the DI _wiring_ is Angular-specific, and that can be swapped out for a different mechanism in v3 without changing descriptors.

**Decision:** Angular DI for v1. Plain object descriptor design preserves the option for tsyringe/inversify in a future `@vi/form-builder-core`. Revisit at v3 if cross-framework builder is funded.
