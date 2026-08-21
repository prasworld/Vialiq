# `vi-date-picker` — Date Picker

**Package:** `@vialiq/web-components/date-picker`  
**Element:** `<vi-date-picker>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_date-picker.scss`  
**Engine:** [flatpickr](https://flatpickr.js.org/) (MIT, zero-dep, built-in TypeScript types)

---

## Table of Contents

1. [Purpose](#purpose)
2. [Design Modes](#design-modes)
3. [Architecture Overview](#architecture-overview)
4. [TypeScript Type Definitions](#typescript-type-definitions)
5. [Plugin System](#plugin-system)
6. [Built-in Plugins](#built-in-plugins)
7. [Dynamic Loading](#dynamic-loading)
8. [FlatpickrMixin](#flatpickrmixin)
9. [Internationalization (i18n)](#internationalization-i18n)
10. [Public API](#public-api)
11. [CSS Design System Integration](#css-design-system-integration)
12. [Input Structure per Mode](#input-structure-per-mode)
13. [Flatpickr Integration Details](#flatpickr-integration-details)
14. [Validation Rules](#validation-rules)
15. [Keyboard Interactions](#keyboard-interactions)
16. [Accessibility](#accessibility)

18. [Usage Examples](#usage-examples)
19. [Framework Integration](#framework-integration)
20. [Extension Points](#extension-points)
21. [Related Components](#related-components)

---

## Purpose

A form-associated date entry control for clinical EDC and general-purpose use.

1. **Multiple picker modes** — day, month, year, month-year, range, week via a single `mode` attribute
2. **Native flatpickr plugins** — modes implemented as real flatpickr `Plugin<E>` factories
3. **Consumer plugin passthrough** — raw `Plugin` or `ViDatePickerPlugin` via `.plugins` property
4. **Internationalization** — locale-aware formatting, lazy-loaded flatpickr l10n, segment order follows locale
5. **Rich event detail** — emits `rawValue {day,month,year}`, `formattedValue`, `utcIso`, `locale`, `timeZone`
7. **Dynamic loading** — plugins and locale files loaded via `import()` in parallel at init time
8. **Flat/inline mode** — renders the calendar inline (no popup trigger)
9. **Fully CSS-tokenized** — three-level Flux UI cascade; dark mode and study themes automatic

---

## Design Modes

### Supported modes

| Mode | Output | Built-in Plugin | Flatpickr mode |
|---|---|---|---|
| `date` (default) | `YYYY-MM-DD` | — (fp core) | `'single'` |
| `month` | `YYYY-MM` | `monthSelectPlugin` (flatpickr built-in, lazy) | `'single'` |
| `month-year` | `YYYY-MM` | `monthSelectPlugin` (flatpickr built-in, lazy) | `'single'` |
| `year` | `YYYY` | `yearSelectPlugin` (custom, written as real fp Plugin) | `'single'` |
| `range` | `YYYY-MM-DD to YYYY-MM-DD` | — (fp core `mode:'range'`) | `'range'` |
| `week` | `YYYY-Www` (ISO week) | `weekSelectPlugin` (flatpickr built-in, lazy) | `'single'` |

> The popup calendar UI for all standard modes is **owned by flatpickr and its plugins**.
> We do not prescribe popup layout, footer buttons, or trigger style — flatpickr renders these
> natively. Our responsibility is: (1) the visible trigger/segment UI in shadow DOM, (2) Flux UI
> CSS tokens applied to the portalled `.flatpickr-calendar` in `<body>`, (3) the event detail
> shape we emit after flatpickr fires `onChange`.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│  vi-date-picker  (Lit LitElement + FlatpickrMixin)                 │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Visible UI (Shadow DOM, Flux UI token styled)              │   │
│  │  • Segmented inputs  (order per locale: DMY/MDY/YMD)        │   │
│  │  • Month/Year trigger button       — mode: month/year       │   │
│  │  • Range start→end buttons         — mode: range            │   │
│  │  • Week display trigger            — mode: week             │   │
│  │  • inline-calendar div             — flat attribute         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  I18n Layer                                                 │   │
│  │  - resolveLocale(locale attr → navigator.language → 'en')   │   │
│  │  - loadLocale(bcp47) → flatpickr/dist/l10n/*.js (lazy)      │   │
│  │  - resolveSegmentOrder(locale) → 'DMY' | 'MDY' | 'YMD'     │   │
│  │  - formatDisplay(date, locale)  → Intl.DateTimeFormat       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  FlatpickrMixin                                             │   │
│  │  - _initFlatpickr(config, mode?) → Promise                  │   │
│  │  - _mergePlugins(modePlugin, consumerPlugins)               │   │
│  │  - _destroyFlatpickr()                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│         │                                                           │
│         │  dynamic import()  ────────────────────────────────┐     │
│         ▼                                                     ▼     │
│  ┌─────────────────────────┐   ┌───────────────────────────────┐   │
│  │  Plugin Registry        │   │  flatpickr (shared Vite chunk) │   │
│  │  'month' → monthSelect  │   │  ~18 KB gzip                  │   │
│  │  'year'  → yearSelect   │   └───────────────────────────────┘   │
│  │  'week'  → weekSelect   │                                        │
│  └─────────────────────────┘   ┌───────────────────────────────┐   │
│                                │  Locale Registry              │   │
│                                │  'fr' → flatpickr/l10n/fr.js  │   │
│                                │  'de' → flatpickr/l10n/de.js  │   │
│                                │  ... (40+ locales, lazy)      │   │
│                                └───────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  <input type="hidden" name="...">  (ISO 8601 form value)    │   │
│  │  ElementInternals.setFormValue(isoValue)                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
              │  appendTo: document.body  (portals out of shadow DOM)
              ▼
    <div class="flatpickr-calendar"> in <body>
    Styled by libs/flux-ui/components/_date-picker.scss ONLY
    (flatpickr's default flatpickr.css is NEVER imported)
```

---

## TypeScript Type Definitions

### Flatpickr's native types (from `flatpickr/dist/types/options`)

```typescript
// --- flatpickr source types (do NOT redefine, import directly) ---
import type { Instance } from 'flatpickr/dist/types/instance';
import type { Plugin, Hook, HookKey, Options } from 'flatpickr/dist/types/options';

// Plugin is a factory function — returns a partial Options object (the hooks).
// E extends the Instance with any extra properties the plugin adds.
export type Plugin<E = {}> = (fp: Instance & E) => Options;

// A Hook is a callback for any lifecycle event.
export type Hook = (
  dates: Date[],
  currentDateString: string,
  self: Instance,
  data?: any
) => void;

// Available lifecycle hook keys:
export type HookKey =
  | 'onChange' | 'onClose' | 'onDayCreate' | 'onDestroy'
  | 'onKeyDown' | 'onMonthChange' | 'onOpen' | 'onParseConfig'
  | 'onReady' | 'onValueUpdate' | 'onYearChange' | 'onPreCalendarPosition';
```

### Our wrapper type: `ViDatePickerPlugin`

We do NOT reimplement `Plugin`. Instead we wrap it with metadata for the registry:

```typescript
// src/date-picker/types.ts

import type { Instance } from 'flatpickr/dist/types/instance';
import type { Plugin }   from 'flatpickr/dist/types/options';

/** Metadata wrapper around a flatpickr Plugin factory. */
export interface ViDatePickerPlugin<E = {}> {
  /** Unique identifier for deduplication and lazy lookup. */
  readonly id: string;
  /** Human-readable label for debugging and Storybook addons. */
  readonly label?: string;
  /** The native flatpickr Plugin factory (fp: Instance & E) => Options. */
  readonly factory: Plugin<E>;
  /** Default config passed to the factory. Consumers may override via `.pluginConfig`. */
  readonly defaultConfig?: Record<string, unknown>;
}

/** Shape of the `.plugins` property on `<vi-date-picker>`. */
export type DatePickerPluginInput =
  | Plugin               // raw flatpickr plugin — accepted as-is
  | ViDatePickerPlugin;  // our wrapper — unwrapped before passing to fp

/** Resolved internal representation — always a native Plugin. */
export type ResolvedPlugin = Plugin;
```

### Mode and i18n types

```typescript
// src/date-picker/types.ts (continued)

export type DatePickerMode =
  | 'date'
  | 'month'
  | 'year'
  | 'month-year'
  | 'range'
  | 'week';

export type DateFormat    = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type ControlStatus = 'default' | 'valid' | 'invalid';

/**
 * Unambiguous decomposed date components.
 * Uses `day` (not `date`) to avoid confusion with a full Date object.
 * Mirrors the upcoming Temporal.PlainDate API for forward-compatibility.
 * Month is 1-indexed (January = 1), matching ISO 8601 and human expectation.
 */
export interface DateComponents {
  day:   number;   // 1–31
  month: number;   // 1–12
  year:  number;   // full 4-digit year, e.g. 2025
}

/**
 * Segment display order derived from the resolved locale.
 * Determines the physical left-to-right order of the three input fields.
 * - DMY: day / month / year  (en-GB, fr-FR, de-DE, ...)
 * - MDY: month / day / year  (en-US, es-PR, ...)
 * - YMD: year / month / day  (zh-CN, ja-JP, ko-KR, ...)
 */
export type SegmentOrder = 'DMY' | 'MDY' | 'YMD';

/**
 * Full detail payload emitted on every `vialiq-change` event.
 *
 * Design rationale:
 * - `isoValue`       — storage/server canonical form; always UTC midnight
 * - `utcIso`         — unambiguous full UTC timestamp for clinical audit trails
 * - `rawValue`       — unambiguous integer components; no TZ or locale interpretation needed
 * - `formattedValue` — locale-aware display string (Intl.DateTimeFormat); use for UI labels
 * - `locale`         — browser BCP 47 tag; allows server to reproduce the exact display format
 * - `timeZone`       — IANA tz; allows server to reconstruct the absolute moment
 */
export interface DatePickerChangeDetail {
  /** ISO 8601 machine value stored in the hidden form field.
   *  Examples: '2025-06-15' | '2025-06' | '2025' | '2025-01-01 to 2025-06-30' | '1985-06-??' */
  isoValue: string;

  /**
   * Full UTC ISO 8601 timestamp (midnight UTC on the selected date).
   * Null when no date is selected.
   * Example: '2025-06-15T00:00:00.000Z'
   */
  utcIso: string | null;

  /**
   * Locale-formatted display string using Intl.DateTimeFormat.
   * Reflects exactly what the user sees in the trigger/segments.
   * Example (en-GB): '15 June 2025'  |  Example (de-DE): '15. Juni 2025'
   */
  formattedValue: string;

  /**
   * Unambiguous numeric components. Preferred for server-side date reconstruction.
   * For range mode: represents the START date components.
   * Null when mode is 'year'/'month' (not all components apply).
   */
  rawValue: DateComponents | null;

  /**
   * For mode='range': end date components. Null for all other modes.
   */
  rawEndValue: DateComponents | null;

  /** ISO week number. Non-null only when mode='week'. Example: 24 */
  weekNumber: number | null;

  /**
   * BCP 47 locale tag resolved by the component.
   * Follows the resolution order: `locale` attribute → navigator.language → 'en'.
   * Example: 'en-GB' | 'de-DE' | 'zh-CN'
   */
  locale: string;

  /**
   * IANA time zone identifier from Intl.DateTimeFormat().resolvedOptions().
   * Represents the user's browser time zone at the moment of selection.
   * Example: 'Asia/Kolkata' | 'America/New_York' | 'Europe/Berlin'
   */
  timeZone: string;


}
```

---

## Plugin System

### Design principles

1. **Flatpickr plugins are the unit of behaviour.** Every mode-specific calendar layout is a
   flatpickr `Plugin<E>` — not a separate component, not a separate class hierarchy.
2. **`ViDatePickerPlugin` adds metadata, not behaviour.** It wraps the factory with `id` and
   `label` so the registry can deduplicate and the Storybook addon can display it.
3. **Raw `Plugin` is always accepted.** The `.plugins` property accepts both our wrapper and
   raw flatpickr plugins, so consumers can use any third-party flatpickr plugin without wrapping it.
4. **Deduplication is by `id` for wrapped plugins.** If a consumer passes the same named plugin
   that the mode already requires, it is deduplicated silently.

### Plugin resolution in `_mergePlugins`

```typescript
// src/base/flatpickr-mixin.ts

import type { Plugin }                    from 'flatpickr/dist/types/options';
import type { DatePickerPluginInput, ViDatePickerPlugin } from '../date-picker/types.js';

function isViPlugin(p: DatePickerPluginInput): p is ViDatePickerPlugin {
  return typeof p === 'object' && 'factory' in p;
}

function resolvePlugin(p: DatePickerPluginInput): Plugin {
  return isViPlugin(p) ? p.factory : p;
}

function mergePlugins(
  modePlugin: Plugin | null,
  consumerPlugins: DatePickerPluginInput[],
): Plugin[] {
  // Resolve consumer inputs to raw Plugin[]
  const resolved = consumerPlugins.map(resolvePlugin);

  // Deduplication: if a wrapped plugin with same id as the mode plugin
  // was also passed by the consumer, only keep one.
  // (Raw plugins cannot be deduplicated — consumer's responsibility.)
  return modePlugin
    ? [modePlugin, ...resolved]
    : resolved;
}
```

### The `.plugins` property on the component

```typescript
// In ViDatePicker (vi-date-picker.ts):
@property({ attribute: false })
accessor plugins: DatePickerPluginInput[] = [];
```

> **Why `attribute: false`?** Plugins are function references — they cannot be serialised to
> an HTML attribute string. Setting `.plugins` is always a JS-only operation.

---

## Built-in Plugins

### 1. `monthSelectPlugin` — flatpickr built-in

Source: `flatpickr/dist/plugins/monthSelect/index.js`  
CSS: replaced entirely by `_date-picker/_months.scss` (never import `monthSelect.css`)

```typescript
// src/date-picker/plugins/month-select.ts
import type { ViDatePickerPlugin } from '../types.js';
import type { Instance }           from 'flatpickr/dist/types/instance';
import type { Plugin }             from 'flatpickr/dist/types/options';

let _factory: Plugin | null = null;

export async function loadMonthSelectPlugin(): Promise<ViDatePickerPlugin> {
  if (!_factory) {
    const mod = await import('flatpickr/dist/plugins/monthSelect/index.js');
    _factory = mod.default as Plugin;
  }
  return {
    id:      'monthSelect',
    label:   'Month/Year Picker',
    factory: _factory,
    defaultConfig: { shorthand: false, dateFormat: 'Y-m', altFormat: 'F Y' },
  };
}
```

### 2. `yearSelectPlugin` — custom flatpickr Plugin

Implemented as a **real flatpickr plugin** (returns `Options` partial with hooks). Replaces the
calendar's day grid with a year scroll grid. No extra library needed.

```typescript
// src/date-picker/plugins/year-select.ts
import type { Instance } from 'flatpickr/dist/types/instance';
import type { Plugin }   from 'flatpickr/dist/types/options';
import type { ViDatePickerPlugin } from '../types.js';

/** Config surface for the year picker plugin. */
export interface YearSelectConfig {
  /** Range of years to display. Defaults to [currentYear - 100, currentYear]. */
  minYear?: number;
  maxYear?: number;
  /** Number of year columns in the grid. Default: 4. */
  columns?: number;
}

export function createYearSelectPlugin(cfg: YearSelectConfig = {}): Plugin {
  return (fp: Instance) => {
    const {
      minYear = new Date().getFullYear() - 100,
      maxYear = new Date().getFullYear(),
      columns = 4,
    } = cfg;

    let yearContainer: HTMLDivElement;

    function buildYearGrid(): void {
      yearContainer.innerHTML = '';
      for (let y = maxYear; y >= minYear; y--) {
        const cell = fp._createElement<HTMLElement>('span', 'year-cell numInput');
        cell.textContent = String(y);
        cell.setAttribute('aria-label', String(y));
        cell.setAttribute('role', 'option');
        cell.setAttribute('tabindex', '-1');
        cell.dataset.year = String(y);
        cell.addEventListener('click', () => {
          fp.setDate(new Date(y, 0, 1), true, 'Y');
          fp.close();
        });
        if (y === fp.currentYear) {
          cell.classList.add('selected');
          cell.setAttribute('aria-selected', 'true');
        }
        yearContainer.appendChild(cell);
      }
      yearContainer.style.setProperty('--year-grid-columns', String(columns));
    }

    return {
      onReady() {
        // Hide the default day grid and month navigation
        fp.calendarContainer.classList.add('flatpickr-year-select');

        yearContainer = fp._createElement<HTMLDivElement>('div', 'year-select-container');
        fp.calendarContainer.appendChild(yearContainer);
        buildYearGrid();
      },
      onYearChange: buildYearGrid,
      onOpen:       buildYearGrid,
    };
  };
}

/** Lazy-loaded ViDatePickerPlugin wrapper for the year select plugin. */
export async function loadYearSelectPlugin(cfg?: YearSelectConfig): Promise<ViDatePickerPlugin> {
  return {
    id:      'yearSelect',
    label:   'Year Picker',
    factory: createYearSelectPlugin(cfg),
    defaultConfig: cfg ?? {},
  };
}
```

### 3. `weekSelectPlugin` — flatpickr built-in

Source: `flatpickr/dist/plugins/weekSelect/weekSelect.js`  
Outputs the ISO week number; `value` on the component is `YYYY-Www`.

```typescript
// src/date-picker/plugins/week-select.ts
import type { ViDatePickerPlugin } from '../types.js';
import type { Plugin }             from 'flatpickr/dist/types/options';

let _factory: Plugin | null = null;

export async function loadWeekSelectPlugin(): Promise<ViDatePickerPlugin> {
  if (!_factory) {
    // flatpickr exports weekSelectPlugin as a class — cast needed (fp TS quirk)
    const mod = await import('flatpickr/dist/plugins/weekSelect/weekSelect.js');
    _factory = (fp: any) => new (mod.default as any)(fp);
  }
  return {
    id:      'weekSelect',
    label:   'Week Picker',
    factory: _factory,
    defaultConfig: { weekNumbers: true },
  };
}
```

---

## Dynamic Loading

### Plugin Registry (`src/date-picker/plugin-registry.ts`)

```typescript
import type { DatePickerMode }     from './types.js';
import type { ViDatePickerPlugin } from './types.js';

type ModePluginLoader = () => Promise<ViDatePickerPlugin | null>;

const REGISTRY: Partial<Record<DatePickerMode, ModePluginLoader>> = {
  month:        () => import('./plugins/month-select.js').then(m => m.loadMonthSelectPlugin()),
  'month-year': () => import('./plugins/month-select.js').then(m => m.loadMonthSelectPlugin()),
  year:         () => import('./plugins/year-select.js').then(m => m.loadYearSelectPlugin()),
  week:         () => import('./plugins/week-select.js').then(m => m.loadWeekSelectPlugin()),
  // 'date' and 'range' use no mode plugin — flatpickr core handles them
};

/** Returns the built-in mode plugin for the given mode, or null. */
export async function loadModePlugin(mode: DatePickerMode): Promise<ViDatePickerPlugin | null> {
  return REGISTRY[mode]?.() ?? null;
}
```

### Loading sequence (parallel)

```
_initFlatpickr() called from firstUpdated()
         │
         ├── Promise.all([
         │     import('flatpickr'),           // ~18 KB gzip — shared Vite chunk
         │     loadModePlugin(this.mode),     // e.g. monthSelectPlugin ~2 KB
         │   ])
         │
         └── fp(this._hiddenInput, {
               ...modeConfig,
               plugins: mergePlugins(modePlugin?.factory, this.plugins),
               appendTo: document.body,
             })
```

Both resolve in parallel. Flatpickr is shared across all `vi-date-picker` instances on the page
because Vite deduplicates the shared async chunk.

---

## FlatpickrMixin

```typescript
// src/base/flatpickr-mixin.ts
import type { LitElement }                from 'lit';
import type { Instance }                  from 'flatpickr/dist/types/instance';
import type { Options as FpOptions }      from 'flatpickr/dist/types/options';
import { loadModePlugin }                 from '../date-picker/plugin-registry.js';
import { mergePlugins, resolvePlugin }    from '../date-picker/plugin-utils.js';
import type { DatePickerMode, DatePickerPluginInput } from '../date-picker/types.js';

type Constructor<T = {}> = abstract new (...args: any[]) => T;

export declare class FlatpickrMixinInterface {
  protected _fp: Instance | null;
  protected _initFlatpickr(config: Partial<FpOptions>, mode?: DatePickerMode): Promise<void>;
  protected _destroyFlatpickr(): void;
  plugins: DatePickerPluginInput[];
}

export const FlatpickrMixin = <T extends Constructor<LitElement>>(Base: T) => {
  abstract class FlatpickrBase extends Base implements FlatpickrMixinInterface {
    protected _fp: Instance | null = null;

    /** JS-only. Accepts raw flatpickr Plugin or ViDatePickerPlugin wrappers. */
    plugins: DatePickerPluginInput[] = [];

    protected async _initFlatpickr(
      config: Partial<FpOptions>,
      mode?: DatePickerMode,
    ): Promise<void> {
      const [{ default: fp }, modePlugin] = await Promise.all([
        import('flatpickr'),
        mode ? loadModePlugin(mode) : Promise.resolve(null),
      ]);

      const resolved = mergePlugins(
        modePlugin ? modePlugin.factory : null,
        this.plugins,
      );

      this._fp = fp(this._hiddenInput as HTMLInputElement, {
        ...config,
        plugins:     resolved,
        appendTo:    document.body,
        static:      false,
        disableMobile: true,
      });
    }

    protected _destroyFlatpickr(): void {
      this._fp?.destroy();
      this._fp = null;
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this._destroyFlatpickr();
    }

    /** Subclasses must provide the hidden input element. */
    protected abstract _hiddenInput: HTMLInputElement | null;
  }
  return FlatpickrBase;
};
};

## Internationalization (i18n)

### Design decisions

| Decision | Rationale |
|---|---|
| Locale resolved at runtime, not build-time | The same app may serve multiple countries; switching locale = re-init |
| flatpickr l10n files loaded lazily | 40+ locales × ~1 KB each = never pay for locales you don't use |
| Segment order derived from locale | `en-US` → MDY, `en-GB` → DMY, `zh-CN` → YMD; never hard-code |
| `Intl.DateTimeFormat` for `formattedValue` | Browser-native, no extra library, accurate across all locales |
| IANA `timeZone` in event detail | Clinical: a date selected in `Asia/Kolkata` ≠ the same UTC moment as `America/New_York` |
| `rawValue {day,month,year}` in event detail | Eliminates string parsing on the server; month is always 1-indexed |
| UTC ISO in event detail | `'2025-06-15T00:00:00.000Z'` is the unambiguous storage key |

---

### Locale resolution order

```
locale attribute ("fr-FR")
    │  if not set
    ▼
navigator.language ("en-US")
    │  if not available (SSR / test env)
    ▼
'en' (hardcoded safe fallback)
```

```typescript
// src/date-picker/i18n.ts

/** Resolves the effective BCP 47 locale tag. */
export function resolveLocale(localeAttr: string | null): string {
  if (localeAttr) return localeAttr;
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  return 'en';
}

/** Reads the browser's IANA time zone from Intl. */
export function resolveTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
```

---

### Locale file loading (`flatpickr/dist/l10n/`)

flatpickr ships locale files at `flatpickr/dist/l10n/<lang>.js`. Each file exports a
`CustomLocale` object that is passed to flatpickr's `locale` option.

```typescript
// src/date-picker/locale-registry.ts
import type { CustomLocale } from 'flatpickr/dist/types/locale';

/** BCP 47 tag → flatpickr l10n module path. Covers the most common study locales. */
const LOCALE_MAP: Record<string, () => Promise<{ default: { default: CustomLocale } }>> = {
  'fr':    () => import('flatpickr/dist/l10n/fr.js'),
  'fr-FR': () => import('flatpickr/dist/l10n/fr.js'),
  'de':    () => import('flatpickr/dist/l10n/de.js'),
  'de-DE': () => import('flatpickr/dist/l10n/de.js'),
  'es':    () => import('flatpickr/dist/l10n/es.js'),
  'es-ES': () => import('flatpickr/dist/l10n/es.js'),
  'zh-CN': () => import('flatpickr/dist/l10n/zh.js'),
  'ja':    () => import('flatpickr/dist/l10n/ja.js'),
  'ko':    () => import('flatpickr/dist/l10n/ko.js'),
  'ar':    () => import('flatpickr/dist/l10n/ar.js'),
  'pt-BR': () => import('flatpickr/dist/l10n/pt.js'),
  'nl':    () => import('flatpickr/dist/l10n/nl.js'),
  'it':    () => import('flatpickr/dist/l10n/it.js'),
  // 'en' and 'en-*' fall through to null → flatpickr default (English)
};

const _cache = new Map<string, CustomLocale | null>();

/**
 * Lazily loads the flatpickr locale for a BCP 47 tag.
 * Returns null for English (flatpickr's built-in default).
 * Caches the result so the network request is made only once per locale.
 */
export async function loadLocale(bcp47: string): Promise<CustomLocale | null> {
  // Normalise: try full tag first, then language-only prefix
  const key = LOCALE_MAP[bcp47] ? bcp47 : bcp47.split('-')[0];

  if (_cache.has(key)) return _cache.get(key)!;

  const loader = LOCALE_MAP[key];
  if (!loader) {
    _cache.set(key, null);
    return null;  // unknown locale → flatpickr will use English
  }

  const mod = await loader();
  const locale = mod.default.default;  // flatpickr l10n files re-export as default.default
  _cache.set(key, locale);
  return locale;
}
```

---

### Segment order and format overrides

The physical left-to-right order of Day / Month / Year input fields **must** reflect the locale, unless an explicit `format` attribute is provided (e.g., `format="MM/DD/YYYY"`).

- **When `format` is absent:** The order is derived from `Intl.DateTimeFormat` — no hard-coded lookup table needed. Placeholders default to standard `DD`, `MM`, `YYYY`.
- **When `format` is present:** The segments strictly follow the `format` order. Placeholders visually match the format structure, and the `formattedValue` emitted by the component exactly mirrors this format (bypassing the `Intl` formatter).

```typescript
// src/date-picker/i18n.ts (continued)

import type { SegmentOrder } from './types.js';

/**
 * Derives the segment order from the locale using the browser's Intl API.
 * Formats a known reference date and reads back the field order from the parts.
 * Reference: 2001-01-02 — day=2, month=1, year=2001 (all distinct, no ambiguity)
 */
export function resolveSegmentOrder(locale: string): SegmentOrder {
  const ref = new Date(2001, 0, 2); // Jan 2 2001
  const parts = new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'numeric', year: 'numeric',
  }).formatToParts(ref);

  const order = parts
    .filter(p => p.type === 'day' || p.type === 'month' || p.type === 'year')
    .map(p => p.type[0].toUpperCase()) // 'D' | 'M' | 'Y'
    .join('') as SegmentOrder;

  return order; // 'DMY' | 'MDY' | 'YMD'
}

// Examples:
// resolveSegmentOrder('en-GB')  → 'DMY'
// resolveSegmentOrder('en-US')  → 'MDY'
// resolveSegmentOrder('zh-CN')  → 'YMD'
// resolveSegmentOrder('fr-FR')  → 'DMY'
// resolveSegmentOrder('ar')     → 'DMY' (Arabic uses DMY in Gregorian)
```

---

### Format while typing and deleting

Segment inputs validate **within their own range** on every keystroke — they do not attempt to
build a full `Date` mid-entry (which would fail for e.g. `31/0_/____`).

#### Typing rules

| Event | Rule |
|---|---|
| Digit entered (field not yet at max length) | Append digit; validate range; update `aria-valuenow` |
| Digit makes field exactly 2 chars (day/month) | Validate range; if valid → advance focus to next segment |
| Digit makes month `13+` on first char (impossible) | Reject keystroke; keep existing value |
| Non-digit key | Ignore (no-op) |

#### Deleting rules

| Event | Rule |
|---|---|
| `Backspace` on non-empty field | Delete last char; **do NOT move focus** |
| `Backspace` on empty field | Move focus to previous segment; do NOT delete previous value |
| `Delete` | Clear entire field contents |

#### Auto-advance heuristic

```typescript
function shouldAdvance(segment: 'day' | 'month' | 'year', value: string): boolean {
  if (segment === 'year') return value.length === 4;
  if (segment === 'day')  return value.length === 2 || (value.length === 1 && Number(value) > 3);
  if (segment === 'month') return value.length === 2 || (value.length === 1 && Number(value) > 1);
  return false;
}
// e.g. typing '4' in month field: Number('4') > 1 → advance immediately (can't be 40+)
// e.g. typing '1' in month field: could be 10,11,12 → wait for second digit
```

#### `↑` / `↓` increment/decrement

```typescript
function clampSegment(segment: 'day' | 'month' | 'year', value: number): number {
  if (segment === 'day')   return Math.min(Math.max(value, 1), 31);
  if (segment === 'month') return Math.min(Math.max(value, 1), 12);
  return value; // year: unclamped, min/max enforced by validation
}
```

---

#### `formattedValue` via `Intl.DateTimeFormat`

```typescript
// src/date-picker/i18n.ts (continued)

const FMT_OPTIONS_BY_MODE: Record<string, Intl.DateTimeFormatOptions> = {
  date:        { day: 'numeric', month: 'long',   year: 'numeric' },
  'month':     {                 month: 'long',   year: 'numeric' },
  'month-year':{ month: 'long', year: 'numeric' },
  year:        {                                  year: 'numeric' },
  range:       { day: 'numeric', month: 'short',  year: 'numeric' },
  week:        { day: 'numeric', month: 'short',  year: 'numeric' }, // week start date
};

export function formatDisplay(
  date: Date,
  locale: string,
  mode: string,
): string {
  const opts = FMT_OPTIONS_BY_MODE[mode] ?? FMT_OPTIONS_BY_MODE.date;
  return new Intl.DateTimeFormat(locale, opts).format(date);
}

// Examples:
// formatDisplay(new Date('2025-06-15'), 'en-GB', 'date')  → '15 June 2025'
// formatDisplay(new Date('2025-06-15'), 'de-DE', 'date')  → '15. Juni 2025'
// formatDisplay(new Date('2025-06-15'), 'fr-FR', 'date')  → '15 juin 2025'
// formatDisplay(new Date('2025-06-01'), 'en-US', 'month') → 'June 2025'
// formatDisplay(new Date('2025-01-01'), 'zh-CN', 'year')  → '2025年'
```

---

### Building the full `DatePickerChangeDetail`

```typescript
// Inside _onFlatpickrChange():
const locale   = this._resolvedLocale;   // already computed at init
const timeZone = resolveTimeZone();

const start = dates[0] ?? null;
const end   = dates[1] ?? null;          // range mode only

const isoValue = this._buildIsoValue(start, end);
const utcIso   = start
  ? start.toISOString()                  // 2025-06-15T00:00:00.000Z
  : null;

const rawValue: DateComponents | null = start
  ? { day: start.getDate(), month: start.getMonth() + 1, year: start.getFullYear() }
  : null;

const rawEndValue: DateComponents | null =
  this.mode === 'range' && end
    ? { day: end.getDate(), month: end.getMonth() + 1, year: end.getFullYear() }
    : null;

const formattedValue = start
  ? this.mode === 'range' && end
    ? `${formatDisplay(start, locale, 'range')} – ${formatDisplay(end, locale, 'range')}`
    : formatDisplay(start, locale, this.mode)
  : '';

const detail: DatePickerChangeDetail = {
  isoValue, utcIso, formattedValue,
  rawValue, rawEndValue,
  weekNumber: this.mode === 'week' ? getISOWeek(start) : null,
  locale, timeZone,
};

this.dispatchEvent(new CustomEvent<DatePickerChangeDetail>('vialiq-change', {
  bubbles: true, composed: true, detail,
}));
```

---

### Public API — `locale` attribute

```html
<!-- Explicit locale override — overrides navigator.language -->
<vi-date-picker locale="de-DE" name="visitDate"></vi-date-picker>

<!-- Dynamically update locale at runtime -->
<script>
  document.querySelector('vi-date-picker').locale = 'fr-FR';
  // Component re-initialises flatpickr with the new locale
</script>
```

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|---|---|---|---|---|---|
| `value` | `value` | `string` | `''` | ✅ | ISO 8601 machine value (form submission) |
| `name` | `name` | `string` | `''` | — | Form field name |
| `mode` | `mode` | `DatePickerMode` | `'date'` | ✅ | Picker mode |
| `flat` | `flat` | `boolean` | `false` | ✅ | Renders calendar inline |
| `min` | `min` | `string` | `''` | — | Min selectable date (ISO 8601) |
| `max` | `max` | `string` | `'today'` | — | Max date (`'today'` or ISO 8601) |
| `format` | `format` | `string` | `''` | — | Explicit date format (e.g., `MM/DD/YYYY`). Overrides locale-based segment order, sets segment placeholders to match, and dictates the `formattedValue` output. |
| `locale` | `locale` | `string` | `''` | — | BCP 47 locale tag. Falls back to `navigator.language` then `'en'`. Controls calendar l10n, and provides default segment order and `formattedValue` if `format` is not set. |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the control |
| `required` | `required` | `boolean` | `false` | ✅ | Required field |
| `weekNumbers` | `week-numbers` | `boolean` | `false` | — | Show ISO week numbers in calendar |
| `firstDayOfWeek` | `first-day-of-week` | `number` | `1` | — | 0=Sun 1=Mon 6=Sat |
| `plugins` | — | `DatePickerPluginInput[]` | `[]` | — | **JS-only.** Extra flatpickr plugins |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error/success message |

### Events

| Event | Detail | Bubbles | Composed | Description |
|---|---|---|---|---|
| `vialiq-change` | `DatePickerChangeDetail` | ✅ | ✅ | Date committed or range complete |
| `vialiq-input` | `{ isoValue: string }` | ✅ | ✅ | Any field changes (while typing) |
| `vialiq-open` | `{}` | ✅ | ✅ | Calendar popup opens |
| `vialiq-close` | `{}` | ✅ | ✅ | Calendar popup closes |
| `invalid` | `Event` | ❌ | — | `checkValidity()` fails |

#### `DatePickerChangeDetail` fields

| Field | Type | Description |
|---|---|---|
| `isoValue` | `string` | Machine-readable ISO 8601 value stored in form (`'2025-06-15'`, `'2025-06'`, `'2025-01-01 to 2025-06-30'`) |
| `utcIso` | `string \| null` | Full UTC ISO timestamp, midnight UTC (`'2025-06-15T00:00:00.000Z'`). |
| `formattedValue` | `string` | Locale-aware display string via `Intl.DateTimeFormat` (`'15 June 2025'`, `'15. Juni 2025'`) |
| `rawValue` | `DateComponents \| null` | `{ day, month, year }` — unambiguous integers, month is 1-indexed. `null` when mode=year/month. |
| `rawEndValue` | `DateComponents \| null` | End date components for `range` mode. `null` for all other modes. |
| `weekNumber` | `number \| null` | ISO week number. Non-null only when `mode='week'`. |
| `locale` | `string` | Resolved BCP 47 locale tag (`'en-GB'`, `'de-DE'`, `'zh-CN'`). |
| `timeZone` | `string` | IANA time zone from browser Intl (`'Asia/Kolkata'`, `'America/New_York'`). |

### Imperative Methods

| Method | Description |
|---|---|
| `checkValidity()` | Validates; fires `invalid` if invalid |
| `reportValidity()` | Validates + shows browser tooltip |
| `setCustomValidity(msg)` | Custom error message |
| `focus()` | Focus the first segment / trigger |
| `openCalendar()` | Programmatically open popup |
| `closeCalendar()` | Programmatically close popup |
| `clear()` | Clears current value |

### CSS Parts

| Part | Element | Available in mode |
|---|---|---|
| `field` | Outer wrapper | all |
| `segments` | DD/MM/YYYY segment row | `date` |
| `segment-day` | Day `<input>` | `date` |
| `segment-month` | Month `<input>` | `date` |
| `segment-year` | Year `<input>` | `date`, `year` |
| `separator` | `/` between segments | `date` |
| `month-trigger` | Month/Year display button | `month`, `month-year` |
| `year-trigger` | Year display button | `year` |
| `week-trigger` | Week display button | `week` |
| `range-start` | Range start button | `range` |
| `range-end` | Range end button | `range` |
| `range-separator` | `→` between range inputs | `range` |
| `calendar-trigger` | Calendar icon button | `date`, `month`, `range`, `week` |
| `calendar-popup` | Popup wrapper | all (except `flat`) |
| `inline-calendar` | Inline calendar wrapper | `flat` attribute |
| `helper` | Helper text | all |
| `validation` | Validation message | all |

---

## CSS Design System Integration

All tokens follow the **three-level cascade** from `CSS-DESIGN-SYSTEM.md`:

```scss
// _date-picker/_input.scss example
.flatpickr-day.selected {
  background-color: var(--vi-date-picker-day-selected-bg, #{tokens.$color-primary});
  color:            var(--vi-date-picker-day-selected-color, #{tokens.$text-primary-inverse});
}
```

### SCSS file structure

```
libs/flux-ui/components/
└── _date-picker.scss         ← Entry point; @forwards all pieces
libs/flux-ui/components/date-picker/
    ├── _input.scss           ← Segment inputs + trigger buttons
    ├── _calendar.scss        ← Calendar shell + navigation header (shared)
    ├── _days.scss            ← Day-grid cells  (mode: date, range)
    ├── _months.scss          ← Month-grid cells (mode: month, month-year)
    ├── _years.scss           ← Year-grid cells  (mode: year)
    ├── _weeks.scss           ← Week highlight rows (mode: week)
    ├── _range.scss           ← Range in-between highlight
    └── _flat.scss            ← Inline/flat rendering overrides
```

### CSS Custom Properties — Full Reference

#### Input & Trigger

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-border-color` | `tokens.$border-03` | Input border at rest |
| `--vi-date-picker-border-color-hover` | `tokens.$border-04` | Hover border |
| `--vi-date-picker-focus-ring-color` | `tokens.$focus` | Focus ring |
| `--vi-date-picker-focus-ring-glow` | `tokens.$color-blue-200` | Focus glow shadow |
| `--vi-date-picker-background-color` | `tokens.$color-background` | Field background |
| `--vi-date-picker-text-color` | `tokens.$text-primary` | Text colour |
| `--vi-date-picker-placeholder-color` | `tokens.$text-secondary` | Placeholder/empty |
| `--vi-date-picker-shape-border-radius` | `tokens.$border-radius-lg` | Corner radius |
| `--vi-date-picker-sizing-min-height` | `40px` | Min height |
| `--vi-date-picker-segment-width-day` | `36px` | Day segment width |
| `--vi-date-picker-segment-width-month` | `36px` | Month segment width |
| `--vi-date-picker-segment-width-year` | `52px` | Year segment width |
| `--vi-date-picker-separator-color` | `tokens.$border-03` | `/` colour |

#### Calendar Popup

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-calendar-bg` | `tokens.$layer-01` | Popup background |
| `--vi-date-picker-calendar-shadow` | `tokens.$shadow-lg` | Popup shadow |
| `--vi-date-picker-calendar-border-color` | `tokens.$border-02` | Outer border |
| `--vi-date-picker-calendar-border-radius` | `tokens.$border-radius-xl` | Corner radius |
| `--vi-date-picker-calendar-padding` | `tokens.$spacing-sm` | Internal padding |
| `--vi-date-picker-calendar-z-index` | `9500` | z-index (above tooltip 9000) |

#### Day Cells (`date`, `range`)

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-day-size` | `36px` | Cell size |
| `--vi-date-picker-day-hover-bg` | `tokens.$layer-hover-01` | Hover bg |
| `--vi-date-picker-day-selected-bg` | `tokens.$color-primary` | Selected bg |
| `--vi-date-picker-day-selected-color` | `tokens.$text-primary-inverse` | Selected text |
| `--vi-date-picker-day-today-border` | `tokens.$color-primary` | Today ring |
| `--vi-date-picker-day-disabled-opacity` | `0.35` | Disabled opacity |
| `--vi-date-picker-day-font-size` | `tokens.$font-size-sm` | Font size |

#### Range (`range`)

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-range-in-range-bg` | `tokens.$color-blue-50` | In-range background |
| `--vi-date-picker-range-in-range-color` | `tokens.$color-primary` | In-range text |
| `--vi-date-picker-range-separator-color` | `tokens.$text-secondary` | `→` separator |

#### Month Grid (`month`, `month-year`)

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-month-cell-size` | `80px` | Cell min-width |
| `--vi-date-picker-month-cell-height` | `48px` | Cell height |
| `--vi-date-picker-month-selected-bg` | `tokens.$color-primary` | Selected bg |
| `--vi-date-picker-month-selected-color` | `tokens.$text-primary-inverse` | Selected text |
| `--vi-date-picker-month-hover-bg` | `tokens.$layer-hover-01` | Hover bg |

#### Year Grid (`year`)

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-year-cell-size` | `64px` | Cell min-width |
| `--vi-date-picker-year-selected-bg` | `tokens.$color-primary` | Selected bg |
| `--vi-date-picker-year-selected-color` | `tokens.$text-primary-inverse` | Selected text |
| `--vi-date-picker-year-grid-columns` | `4` | Grid column count |

#### Week Mode (`week`)

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-week-row-bg` | `tokens.$color-blue-50` | Selected week row bg |
| `--vi-date-picker-week-row-color` | `tokens.$color-primary` | Selected week row text |

#### Navigation Header (all calendar modes)

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-nav-button-color` | `tokens.$text-secondary` | Prev/next chevron |
| `--vi-date-picker-nav-button-hover-bg` | `tokens.$layer-hover-01` | Nav hover bg |
| `--vi-date-picker-nav-title-color` | `tokens.$text-primary` | Month/year header text |
| `--vi-date-picker-nav-title-font-weight` | `tokens.$font-weight-semibold` | Header weight |
| `--vi-date-picker-weekday-color` | `tokens.$text-secondary` | Mo/Tu/We... header |

#### Flat/Inline Mode

| Property | Default | Description |
|---|---|---|
| `--vi-date-picker-flat-border` | `tokens.$border-02` | Wrapper border |
| `--vi-date-picker-flat-border-radius` | `tokens.$border-radius-xl` | Wrapper radius |
| `--vi-date-picker-flat-shadow` | `tokens.$shadow-sm` | Wrapper elevation |

---

## Input Structure per Mode

### Mode: `date` (default)

```html
<div part="segments" class="date-segments" role="group" aria-label="Date entry">
  <input part="segment-day"   type="text" inputmode="numeric" maxlength="2"
         aria-label="Day"   placeholder="DD" />
  <span  part="separator" aria-hidden="true">/</span>
  <input part="segment-month" type="text" inputmode="numeric" maxlength="2"
         aria-label="Month" placeholder="MM" />
  <span  part="separator" aria-hidden="true">/</span>
  <input part="segment-year"  type="text" inputmode="numeric" maxlength="4"
         aria-label="Year"  placeholder="YYYY" />
  <vi-button icon-only variant="ghost" size="sm" part="calendar-trigger"
    aria-label="Open calendar" aria-haspopup="dialog">
    <vi-icon slot="icon" name="calendar" size="16"></vi-icon>
  </vi-button>
</div>
```

### Mode: `month` / `month-year`

```html
<!-- Popup renders 3×4 month grid via monthSelectPlugin -->
<button part="month-trigger" type="button" class="date-picker-trigger"
  aria-haspopup="dialog" aria-expanded="false">
  <span class="month-display">June 2025</span>
  <vi-icon name="chevron-down" size="16" aria-hidden="true"></vi-icon>
</button>
```

### Mode: `year`

```html
<!-- Popup renders year-grid via our yearSelectPlugin -->
<button part="year-trigger" type="button" class="date-picker-trigger"
  aria-haspopup="dialog" aria-expanded="false">
  <span class="year-display">2025</span>
  <vi-icon name="chevron-down" size="16" aria-hidden="true"></vi-icon>
</button>
```

### Mode: `range`

```html
<div part="segments" class="range-segments" role="group" aria-label="Date range">
  <button part="range-start" type="button" aria-label="Select start date" aria-haspopup="dialog">
    15 Jan 2024
  </button>
  <span part="range-separator" aria-hidden="true">→</span>
  <button part="range-end" type="button" aria-label="Select end date" aria-haspopup="dialog">
    30 Jun 2024
  </button>
  <vi-button icon-only variant="ghost" size="sm" part="calendar-trigger"
    aria-label="Open range calendar" aria-haspopup="dialog">
    <vi-icon slot="icon" name="calendar" size="16"></vi-icon>
  </vi-button>
</div>
```

### Mode: `week`

```html
<!-- weekSelectPlugin highlights the entire row; fp outputs week start date -->
<button part="week-trigger" type="button" class="date-picker-trigger"
  aria-haspopup="dialog" aria-expanded="false">
  <span class="week-display">Week 24, 2025</span>
  <vi-icon name="chevron-down" size="16" aria-hidden="true"></vi-icon>
</button>
```

### Flat modifier

```html
<!-- No trigger; flatpickr renders inline via `inline: true` -->
<div part="inline-calendar" class="date-picker-flat"
     role="region" aria-label="Date picker">
  <!-- flatpickr injects .flatpickr-calendar here -->
</div>
```

---

## Flatpickr Integration Details

### Mode → flatpickr config

| Component mode | fp `mode` | Built-in plugin | `dateFormat` |
|---|---|---|---|
| `date` | `'single'` | — | `'Y-m-d'` |
| `month` | `'single'` | `monthSelectPlugin` | `'Y-m'` |
| `month-year` | `'single'` | `monthSelectPlugin` | `'Y-m'` |
| `year` | `'single'` | `yearSelectPlugin` (custom) | `'Y'` |
| `range` | `'range'` | — | `'Y-m-d'` |
| `week` | `'single'` | `weekSelectPlugin` | `'Y-\\WW'` |

### Hidden input + ElementInternals

```typescript
// In firstUpdated():
await this._initFlatpickr(
  {
    mode:        this.mode === 'range' ? 'range' : 'single',
    inline:      this.flat,
    dateFormat:  this._resolveDateFormat(),
    minDate:     this.min  || undefined,
    maxDate:     this.max === 'today' ? new Date() : this.max || undefined,
    weekNumbers: this.weekNumbers || this.mode === 'week',
    onChange:    this._onFlatpickrChange.bind(this),
    onOpen:      () => this._emit('vialiq-open'),
    onClose:     () => this._emit('vialiq-close'),
  },
  this.mode,   // triggers loadModePlugin(mode) inside FlatpickrMixin
);
```

### Value → form sync (with i18n detail)

```typescript
private _onFlatpickrChange(dates: Date[], _str: string, _fp: Instance): void {
  const locale   = this._resolvedLocale;          // computed at init from locale attr / navigator.language
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const start = dates[0] ?? null;
  const end   = dates[1] ?? null;                 // non-null only in range mode

  // 1. ISO machine value — stored in the hidden form field
  const isoValue = this._buildIsoValue(start, end);
  this._internals.setFormValue(isoValue);

  // 2. UTC ISO timestamp (midnight UTC) — null when partial or no selection
  const utcIso: string | null =
    start && !this.partial ? new Date(Date.UTC(
      start.getFullYear(), start.getMonth(), start.getDate()
    )).toISOString() : null;

  // 3. Unambiguous integer components (month is 1-indexed)
  const toComponents = (d: Date): DateComponents => ({
    day:   d.getDate(),
    month: d.getMonth() + 1,
    year:  d.getFullYear(),
  });
  const rawValue:    DateComponents | null = start && !this.partial ? toComponents(start) : null;
  const rawEndValue: DateComponents | null =
    this.mode === 'range' && end && !this.partial ? toComponents(end) : null;

  // 4. Locale-aware display string via Intl.DateTimeFormat
  const formattedValue = start
    ? this.mode === 'range' && end
      ? `${formatDisplay(start, locale, 'range')} – ${formatDisplay(end, locale, 'range')}`
      : formatDisplay(start, locale, this.mode)
    : '';

  const detail: DatePickerChangeDetail = {
    isoValue,
    utcIso,
    formattedValue,
    rawValue,
    rawEndValue,
    weekNumber: this.mode === 'week' ? getISOWeek(start!) : null,
    locale,
    timeZone,
    partial: this.partial,
  };

  this.dispatchEvent(new CustomEvent<DatePickerChangeDetail>('vialiq-change', {
    bubbles: true, composed: true, detail,
  }));
}
```

#### `rawValue` null-by-mode reference

Because not all modes produce a full `{day, month, year}` triple, here is the definitive null-by-mode table:

| Mode | `rawValue` | `rawEndValue` |
|---|---|---|
| `date` | `{ day, month, year }` | `null` |
| `month` / `month-year` | `null` (no day) | `null` |
| `year` | `null` (no day or month) | `null` |
| `week` | `{ day, month, year }` of week start | `null` |
| `range` (both selected) | `{ day, month, year }` of start | `{ day, month, year }` of end |

> **Server-side recommendation:** always prefer `rawValue` for date reconstruction. Fall back to
> parsing `isoValue` only when `rawValue` is null (month/year modes). Use `utcIso` as the
> audit trail key.

---

## Validation Rules

| Rule | Validity flag | Condition |
|---|---|---|
| Empty required | `valueMissing` | Required and all segments/trigger empty |
| Invalid date | `badInput` | Day 32, month 13, Feb 30, etc. |
| Before min | `rangeUnderflow` | Date < min |
| After max | `rangeOverflow` | Date > max (or > today) |
| Incomplete range | `badInput` | Range: start set but end missing |
| Incomplete entry | `badInput` | Some segments filled, some empty |

---

## Keyboard Interactions

| Key | Element | Behaviour |
|---|---|---|
| `Tab` / `Shift+Tab` | Segments | Move to next / previous segment |
| `↑` / `↓` | Day/month/year segment | Increment / decrement |
| `Backspace` | Empty segment | Move focus to previous segment |
| `0–9` | Any segment | Digit entry; auto-advance at max length |
| `Escape` | Calendar popup | Close calendar |
| `Enter` / `Space` | Calendar cell | Select |
| `←` / `→` | Day calendar | Previous / next day |
| `↑` / `↓` | Day calendar | Previous / next week |
| `Page Up/Down` | Day calendar | Previous / next month |
| `Home` / `End` | Day calendar | Start / end of month |

---

## Accessibility

| Requirement | Implementation |
|---|---|
| Group labelling | Segment row: `role="group"` + `aria-label="Date entry"` |
| Segments | Each `<input>` has `aria-label="Day"` / `"Month"` / `"Year"` |
| Calendar dialog | `role="dialog"` + `aria-label="Date picker calendar"` |
| Calendar trigger | `aria-haspopup="dialog"` + `aria-expanded` |
| Day cells | `aria-label="15 June 2025"` |
| Today | `aria-current="date"` |
| Selected | `aria-selected="true"` |
| Required | `aria-required` on the group |
| Invalid | `aria-invalid` + `aria-errormessage` |
| Flat mode | `role="region"` on inline wrapper |

#### `formattedValue` generation

When building the `DatePickerChangeDetail` payload:
1. **If `format` attribute is present:** The `formattedValue` string is constructed by directly replacing format tokens (`YYYY`, `MM`, `DD`, etc.) with the selected segment values, zero-padded as requested by the format string. This ensures the output exactly matches the developer's requested format.
2. **If `format` attribute is absent:** The component relies on the browser's native `Intl.DateTimeFormat` using the resolved `locale`.

```typescript
// Fallback path when no format is specified:
const opts: Intl.DateTimeFormatOptions = {
  date: { day: 'numeric', month: 'long', year: 'numeric' },
  month: { month: 'long', year: 'numeric' },
  // ...
}[this.mode];

// 2025-06-15 + 'en-GB' → '15 June 2025'
```

---



## Usage Examples

### Standard date entry

```html
<vi-date-picker name="aeStartDate" max="today" required>
  <vi-date-picker-input></vi-date-picker-input>
</vi-date-picker>
```

### Date entry with explicit locale (German)

```html
<!-- Segments render as TT.MM.JJJJ, calendar in German -->
<vi-date-picker
  name="visitDate"
  locale="de-DE"
  max="today"
  required
>
  <vi-date-picker-input></vi-date-picker-input>
</vi-date-picker>
```

### Month picker

```html
<vi-date-picker name="reportMonth" mode="month" max="today">
  <vi-date-picker-input></vi-date-picker-input>
</vi-date-picker>
<!-- isoValue: "2025-06" -->
```

### Year picker

```html
<vi-date-picker name="diagnosisYear" mode="year" min="1900" max="today">
  <vi-date-picker-input></vi-date-picker-input>
</vi-date-picker>
<!-- Output: "2019" -->
```

### Week picker

```html
<vi-date-picker name="reportWeek" mode="week" max="today" week-numbers>
  <vi-date-picker-input></vi-date-picker-input>
</vi-date-picker>
<!-- Output: "2025-W24" -->
```

### Date range picker

```html
<vi-date-picker name="conMedDuration" mode="range" max="today" required>
  <vi-date-picker-input kind="from"></vi-date-picker-input>
  <vi-date-picker-input kind="to"></vi-date-picker-input>
</vi-date-picker>
<!-- Output: "2024-01-15 to 2024-06-30" -->
```

### Inline / flat calendar

```html
<vi-date-picker name="visitDate" flat></vi-date-picker>
```

### Flat month picker (embedded panel)

```html
<vi-date-picker name="filterMonth" mode="month" flat></vi-date-picker>
```

### Reading the full event detail

```typescript
document.querySelector('vi-date-picker')!.addEventListener('vialiq-change', (e) => {
  const detail = (e as CustomEvent<DatePickerChangeDetail>).detail;

  // Machine storage key (ISO 8601, locale-independent)
  console.log(detail.isoValue);       // '2025-06-15'

  // Unambiguous reconstruction on server
  console.log(detail.rawValue);       // { day: 15, month: 6, year: 2025 }

  // Display string for UI (already locale-formatted)
  console.log(detail.formattedValue); // '15 June 2025' (en-GB) | '15. Juni 2025' (de-DE)

  // Audit trail: exact UTC moment
  console.log(detail.utcIso);         // '2025-06-15T00:00:00.000Z'

  // Context for server-side TZ conversion
  console.log(detail.timeZone);       // 'Asia/Kolkata'
  console.log(detail.locale);         // 'en-GB'
});
```

### Consumer-supplied plugin (e.g. confirmDate)

```typescript
import confirmDatePlugin from 'flatpickr/dist/plugins/confirmDate/confirmDate.js';
import type { Plugin } from 'flatpickr/dist/types/options';

const picker = document.querySelector('vi-date-picker');
// Pass as raw Plugin — no wrapper needed
picker.plugins = [confirmDatePlugin({ showAlways: false }) as unknown as Plugin];
```

### Consumer-supplied ViDatePickerPlugin (with metadata)

```typescript
import type { ViDatePickerPlugin } from '@vialiq/web-components/date-picker';
import type { Plugin } from 'flatpickr/dist/types/options';

const myPlugin: ViDatePickerPlugin = {
  id:    'myAuditPlugin',
  label: 'Audit trail logger',
  factory: (fp) => ({
    onChange(dates, str) {
      auditService.log({ field: fp.input.name, value: str });
    },
  }) as ReturnType<Plugin>,
};

picker.plugins = [myPlugin];
```

---

## Framework Integration

### Angular

```typescript
@Component({
  template: `
    <!-- locale bound from app i18n service -->
    <vi-date-picker
      name="studyPeriod"
      mode="range"
      max="today"
      [locale]="i18n.currentLocale"
      [value]="periodCtrl.value ?? ''"
      (vialiq-change)="onRangeChange($event)"
      [status]="periodCtrl.invalid && periodCtrl.touched ? 'invalid' : 'default'"
    ></vi-date-picker>
  `
})
export class StudyFormComponent {
  onRangeChange(e: CustomEvent<DatePickerChangeDetail>): void {
    // Use isoValue for form control (locale-independent)
    this.periodCtrl.setValue(e.detail.isoValue);
    // rawValue available for server-side processing without parsing
    this.auditService.log({
      start: e.detail.rawValue,
      end:   e.detail.rawEndValue,
      tz:    e.detail.timeZone,
    });
  }
}
```

### React 19

```tsx
import '@vialiq/web-components/date-picker';
import type { DatePickerChangeDetail } from '@vialiq/web-components/date-picker';

export function StudyForm({ locale }: { locale: string }) {
  const [isoRange, setIsoRange] = useState('');
  const [rawRange, setRawRange] = useState<{
    start: DateComponents | null;
    end:   DateComponents | null;
  }>({ start: null, end: null });

  return (
    <vi-date-picker
      name="studyPeriod"
      mode="range"
      max="today"
      locale={locale}             // pass app locale down
      value={isoRange}
      onvialiq-change={(e: CustomEvent<DatePickerChangeDetail>) => {
        setIsoRange(e.detail.isoValue);   // ← use isoValue, not .value
        setRawRange({
          start: e.detail.rawValue,
          end:   e.detail.rawEndValue,
        });
      }}
    />
  );
}
```

---

## Extension Points

### 1. Add a new built-in mode plugin

Create `src/date-picker/plugins/my-plugin.ts` conforming to flatpickr's `Plugin<E>` type.
Add one entry to `REGISTRY` in `plugin-registry.ts`. Done — no changes to the mixin or component.

### 2. Add a consumer-supplied plugin

```typescript
picker.plugins = [rawFlatpickrPlugin];          // raw Plugin accepted
picker.plugins = [myViDatePickerPluginWrapper];  // ViDatePickerPlugin accepted
```

### 3. Override calendar theme per study

```css
.sponsor-pfizer vi-date-picker {
  --vi-date-picker-day-selected-bg:    #009cde;
  --vi-date-picker-range-in-range-bg:  #cceef9;
}
```

### 4. Swap the calendar engine

Subclass `ViDatePickerBase` and override `_initFlatpickr`. The public API (attributes, events,
CSS parts, form integration) is on the base class and stays unchanged.

### 5. Add a new locale to the registry

```typescript
// src/date-picker/locale-registry.ts — add one line:
'sv':    () => import('flatpickr/dist/l10n/sv.js'),  // Swedish
'tr':    () => import('flatpickr/dist/l10n/tr.js'),  // Turkish
```

Flatpickr ships 40+ locale files. Simply add the BCP 47 tag → import path mapping.
No other code changes needed.

### 6. Provide a custom `formattedValue` formatter

Consumers can subclass and override `_formatDisplay(date, locale, mode)` to use a custom
formatting library (e.g. `date-fns` or `Luxon`) while keeping all other i18n logic intact:

```typescript
class MyDatePicker extends ViDatePicker {
  protected override _formatDisplay(date: Date, locale: string, mode: string): string {
    return format(date, 'PPP', { locale: dateFnsLocales[locale] });
  }
}
customElements.define('my-date-picker', MyDatePicker);
```

---

## Related Components

- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
- [`vi-modal`](./vi-modal.md) — date picker inside a modal
- [`vi-combobox`](./vi-combobox.md) — async searchable selection
