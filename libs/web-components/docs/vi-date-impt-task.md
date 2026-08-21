# vi-date-picker — Implementation Task List

> **How to use this list**
> - `[ ]` = not started  `[/]` = in progress  `[x]` = complete  `[~]` = deferred/blocked
> - Tasks within each phase are roughly dependency-ordered
> - Reference docs: [`vi-date-picker.md`](./components/vi-date-picker.md) | [`vi-partial-date.md`](./components/vi-partial-date.md)

---

## Phase 0 — Pre-implementation Decisions (COMPLETE)

- [x] Choose calendar engine — **keep flatpickr**, document swap-engine exit path
- [x] Decide plugin architecture — **native `Plugin<E>` type**, `ViDatePickerPlugin` metadata wrapper
- [x] Decide locale strategy — **page-load only**, no runtime re-init
- [x] Decide `_hiddenInput` mixin pattern — **protected method override** `_getHiddenInput()`
- [x] Decide partial date UI — **implicit empty = unknown**, no checkboxes, no separate component
- [x] Decide partial date form value — **JSON string** `{year,month,day}` on `vi-date-picker` with `partial=true`
- [x] Decide partial date mode — **`mode` attribute on `vi-date-picker`**: `'full' | 'month-year' | 'year'`
- [x] Decide popup UI — **flatpickr owns it** — we style via Flux UI CSS tokens only, do not prescribe layout or footer
- [x] Decide RTL — **deferred to separate i18n effort**
- [x] Write `vi-date-picker.md` architecture doc (includes partial date mode spec)
- [x] Supersede `vi-partial-date.md` (redirects to vi-date-picker)

---

## Phase 1 — Shared Infrastructure

### 1.1 TypeScript types package

- [x] Create `src/date-picker/types.ts`
  - [x] `DatePickerMode` union type — includes `'full' | 'month-year' | 'year'` for partial modes
  - [x] `DateComponents {day, month, year}` interface
  - [x] `SegmentOrder` = `'DMY' | 'MDY' | 'YMD'`
  - [x] `PartialDateValue {year, month, day}` interface (year required, month/day nullable)
  - [x] `DatePickerChangeDetail` interface (isoValue, utcIso, formattedValue, rawValue, rawEndValue, weekNumber, locale, timeZone, partial)
  - [x] `PartialDateChangeDetail extends DatePickerChangeDetail` (partialValue, isComplete)
  - [x] `ViDatePickerPlugin<E>` interface (id, label, factory, defaultConfig)
  - [x] `DatePickerPluginInput` union type
  - [x] `ControlStatus` type

### 1.2 i18n utilities (`src/date-picker/i18n.ts`)

- [x] `resolveLocale(localeAttr: string | null): string`
  - [x] Returns `localeAttr` → `navigator.language` → `'en'`
- [x] `resolveTimeZone(): string`
  - [x] Uses `Intl.DateTimeFormat().resolvedOptions().timeZone`
- [x] `resolveSegmentOrder(locale: string, format?: string): SegmentOrder`
  - [x] If `format` provided, parse it to extract order
  - [x] Else uses `Intl.DateTimeFormat(locale).formatToParts(refDate)` — NO hard-coded table
- [x] `formatDisplay(date: Date, locale: string, mode: string): string`
  - [x] `FMT_OPTIONS_BY_MODE` map for all modes
  - [x] Uses `Intl.DateTimeFormat`
- [x] `formatPartialDate(value: PartialDateValue, locale: string): string`
  - [x] Spreads only known Intl options (month omitted if null, day omitted if null)
- [x] Unit tests for all i18n functions
  - [x] Covers en-GB (DMY), en-US (MDY), zh-CN (YMD), de-DE, ar
  - [x] Covers edge: Jan 1 year boundary for ISO week

### 1.3 Locale registry (`src/date-picker/locale-registry.ts`)

- [x] `LOCALE_MAP` — BCP 47 → `() => import('flatpickr/l10n/*.js')`
  - [x] Include: fr, fr-FR, de, de-DE, es, es-ES, zh-CN, ja, ko, ar, pt-BR, nl, it
- [x] `loadLocale(bcp47: string): Promise<CustomLocale | null>`
  - [x] Normalise: full tag first, then language-only prefix fallback
  - [x] Module-level `Map` cache — one network request per locale per session
  - [x] Returns `null` for English (flatpickr built-in default)
- [x] Unit tests
  - [x] Caching: second call returns from cache (no second import)
  - [x] Unknown locale returns null gracefully

### 1.4 Plugin registry (`src/date-picker/plugin-registry.ts`)

- [x] `REGISTRY: Partial<Record<DatePickerMode, ModePluginLoader>>`
  - [x] `'month'` → `monthSelectPlugin` (flatpickr built-in)
  - [x] `'month-year'` → `monthSelectPlugin` (same loader)
  - [x] `'year'` → `yearSelectPlugin` (custom — see Phase 2)
  - [x] `'week'` → `weekSelectPlugin` (flatpickr built-in)
- [x] `loadModePlugin(mode: DatePickerMode): Promise<ViDatePickerPlugin | null>`
- [x] Unit tests — mode routing, null for 'date' and 'range'

### 1.5 Plugin utilities (`src/date-picker/plugin-utils.ts`)

- [x] `isViPlugin(p: DatePickerPluginInput): p is ViDatePickerPlugin`
- [x] `resolvePlugin(p: DatePickerPluginInput): Plugin`
- [x] `mergePlugins(modePlugin: Plugin | null, consumerPlugins: DatePickerPluginInput[]): Plugin[]`
  - [x] Deduplication by `id` for wrapped plugins
  - [x] Mode plugin always first
- [x] Unit tests — dedup, order, raw plugin passthrough

### 1.6 ISO week utility (`src/date-picker/iso-week.ts`)

- [x] `getISOWeek(date: Date): number` — inline implementation, no date-fns dep
  - [x] Follows ISO 8601: week starts Monday, week 1 = first week with Thursday
- [x] Unit tests for known edge cases: Jan 1 2022 → week 52 of 2021

---

## Phase 2 — Custom Plugins

### 2.1 Year Select Plugin (`src/date-picker/plugins/year-select.ts`)

- [ ] Prototype in plain HTML — inspect flatpickr DOM, understand `fp._createElement`, `fp.calendarContainer`, `fp.close()`
- [ ] `YearSelectConfig {minYear?, maxYear?, columns?}` interface
- [ ] `createYearSelectPlugin(cfg): Plugin` — real flatpickr `Plugin<E>` factory
  - [ ] `onReady`: hide day-grid, build year grid, append to `fp.calendarContainer`
  - [ ] `onOpen`: rebuild grid (in case year range config changed)
  - [ ] `onYearChange`: rebuild grid
  - [ ] Year cells: click → `fp.setDate(new Date(y, 0, 1), true, 'Y')` → `fp.close()`
  - [ ] Selected cell: `aria-selected="true"`, `.selected` CSS class
  - [ ] CSS variable `--year-grid-columns` for column count
- [ ] `loadYearSelectPlugin(cfg?): Promise<ViDatePickerPlugin>` — lazy wrapper
- [ ] CSS: `src/date-picker/plugins/year-select.scss` — grid layout, cell hover, selected state
- [ ] Unit tests — grid builds correct year range, selected year marked, close fires on click

### 2.2 Month Select Plugin (flatpickr built-in wrapper)

- [ ] Prototype in plain HTML — inspect `monthSelectPlugin` DOM output
- [ ] Document exact CSS class names produced by the plugin
- [ ] Write `libs/flux-ui/components/date-picker/_months.scss` targeting discovered class names
- [ ] `loadMonthSelectPlugin(): Promise<ViDatePickerPlugin>` — lazy wrapper in `src/date-picker/plugins/month-select.ts`
  - [ ] Module-level singleton cache (only load once)
  - [ ] Apply `defaultConfig: { shorthand: false, dateFormat: 'Y-m', altFormat: 'F Y' }`
  - [ ] **Never import `monthSelect.css`** — Flux UI styles replace it entirely
- [ ] Visual test: month grid renders with Flux UI tokens

### 2.3 Week Select Plugin (flatpickr built-in wrapper)

- [ ] Prototype: inspect `weekSelectPlugin` DOM + CSS class names
- [ ] `loadWeekSelectPlugin(): Promise<ViDatePickerPlugin>` — handle the `new (mod.default as any)()` TS cast issue
- [ ] Wrap in a factory that normalises the class-based plugin to the function-based `Plugin<E>` contract
- [ ] Write `libs/flux-ui/components/date-picker/_weeks.scss`
- [ ] Visual test: selected week row highlighted

---

## Phase 3 — FlatpickrMixin

### 3.1 Core mixin (`src/base/flatpickr-mixin.ts`)

- [ ] `FlatpickrMixinInterface` declare class — exported for consumer type-checking
- [ ] `FlatpickrMixin<T>(Base: T)` — abstract class return
- [ ] `protected _fp: Instance | null = null`
- [ ] `plugins: DatePickerPluginInput[] = []` — JS-only property, `attribute: false`
- [ ] `protected _getHiddenInput(): HTMLInputElement | null` — returns null (subclass overrides)
- [ ] `protected async _initFlatpickr(config: Partial<FpOptions>, mode?: DatePickerMode): Promise<void>`
  - [ ] `Promise.all([import('flatpickr'), loadModePlugin(mode), loadLocale(resolvedLocale)])` — three-way parallel
  - [ ] `mergePlugins(modePlugin?.factory, this.plugins)` 
  - [ ] Always set `appendTo: document.body`, `disableMobile: true`, `static: false`
  - [ ] Merge locale into config if non-null
- [ ] `protected _destroyFlatpickr(): void`
- [ ] `override disconnectedCallback()` — calls `_destroyFlatpickr()`
- [ ] Unit tests — init, destroy, locale merge, plugin merge

---

## Phase 4 — vi-date-picker Component

### 4.1 Component scaffold (`src/date-picker/vi-date-picker.ts`)

- [ ] `@customElement('vi-date-picker')` extending `FlatpickrMixin(ViElement)`
- [ ] `static formAssociated = true`
- [ ] `ElementInternals` via `attachInternals()`
- [ ] All `@property()` declarations matching API doc
  - [ ] `value`, `name`, `mode`, `flat`, `min`, `max`, `locale`, `disabled`, `required`, `partial`
  - [ ] `weekNumbers`, `firstDayOfWeek`, `plugins`, `status`, `validityMessage`
- [ ] `@query('#fp-input') override _getHiddenInput()` — protected method override
- [ ] `protected _resolvedLocale: string` — computed in `willUpdate` when `locale` changes
- [ ] `firstUpdated()` — calls `_initFlatpickr(this._buildFpConfig(), this.mode)`
- [ ] `_buildFpConfig(): Partial<FpOptions>` — maps component props to flatpickr options

### 4.2 Value sync and event emission

- [ ] `_buildIsoValue(start: Date | null, end: Date | null): string`
  - [ ] Maps mode to correct ISO format: `Y-m-d`, `Y-m`, `Y`, `Y-Www`, range `to`
- [ ] `_onFlatpickrChange(dates: Date[], str: string, fp: Instance): void`
  - [ ] Builds full `DatePickerChangeDetail` (isoValue, utcIso, formattedValue, rawValue, rawEndValue, weekNumber, locale, timeZone, partial)
  - [ ] `this._internals.setFormValue(isoValue)`
  - [ ] Dispatches `vialiq-change`
  - [ ] Calls `_syncSegments()`
- [ ] `_syncSegments()` — updates visible segment inputs from `_fp.selectedDates`
- [ ] `vialiq-input` event dispatched on every segment keystroke

### 4.3 Segment input logic (date mode)

- [ ] Segment auto-advance: `shouldAdvance(segment, value): boolean`
- [ ] Backspace: delete on non-empty, focus-prev on empty
- [ ] Delete: clear field
- [ ] `↑`/`↓`: increment/decrement with `clampSegment()`
- [ ] Segment placeholders: map to format tokens or default `DD`/`MM`/`YYYY`
- [ ] Template ordering: `resolveSegmentOrder(locale, format)` drives template structure
- [ ] Segment → flatpickr sync: when all 3 segments have valid values, call `fp.setDate()`

### 4.4 Modes: month, year, week, range triggers

- [ ] Month/year mode trigger button — click opens popup
- [ ] Year mode trigger button — click opens popup
- [ ] Week mode trigger button — click opens popup
- [ ] Range: two buttons (start / end), both open shared popup
- [ ] Flat mode: no trigger, `inline: true` in fp config

### 4.5 Validation

- [ ] `checkValidity(): boolean` — checks all validity rules, fires `invalid`
- [ ] `reportValidity(): boolean` — calls `checkValidity()` + shows tooltip
- [ ] `setCustomValidity(msg: string)` — sets custom message
- [ ] Wire `status` → shadow DOM CSS class for error/success ring
- [ ] Validity rules (standard): valueMissing, badInput (invalid date), rangeUnderflow, rangeOverflow
- [ ] Validity rules (partial): year required, cascade (day without month), year range

### 4.6 Render template

- [ ] Switch on `mode` + `partial` flag to render correct visible UI
- [ ] `flat` attribute renders `<div part="inline-calendar">` instead of trigger
- [ ] `<input type="hidden" id="fp-input" name="${this.name}">` always present
- [ ] `<slot name="helper">` for helper text
- [ ] Validation message slot

### 4.7 Partial date mode (`partial=true`)

- [ ] When `partial=true`, skip `_initFlatpickr` entirely — flatpickr not loaded
- [ ] Render only segment inputs (no trigger button, no calendar icon)
- [ ] `mode` controls which segments show: `full`=DDMMYyyy, `month-year`=MMYyyy, `year`=Yyyy
- [ ] Empty segment → `null` in `PartialDateValue`
- [ ] `_buildPartialIsoValue(): string` — `JSON.stringify(PartialDateValue)` stored in hidden input
- [ ] `_onPartialSegmentChange()` handler — builds value, calls `setFormValue`, emits events
  - [ ] `vialiq-input` fires on every keystroke
  - [ ] `vialiq-change` fires when value changes (emits `PartialDateChangeDetail`)
- [ ] `formatPartialDate(v, locale)` — Intl-based, only includes Intl options for non-null fields
- [ ] Cascade validation: month null → day must be null
- [ ] Greyed placeholder for empty segments (CSS `--vi-date-picker-segment-unknown-color` token)
- [ ] `isComplete` flag in event detail

### 4.8 Public imperative API

- [ ] `focus()` — focus first segment / trigger button
- [ ] `openCalendar()` — calls `this._fp?.open()` (no-op when `partial=true`)
- [ ] `closeCalendar()` — calls `this._fp?.close()` (no-op when `partial=true`)
- [ ] `clear()` — `this._fp?.clear()`, clears segments, fires change

---

## Phase 5 — CSS (Flux UI)

### 5.1 SCSS file structure

- [ ] Create `libs/flux-ui/components/_date-picker.scss` — entry point with `@forward`s
- [ ] `libs/flux-ui/components/date-picker/_input.scss` — segment inputs + trigger buttons
- [ ] `libs/flux-ui/components/date-picker/_calendar.scss` — shared calendar shell + nav header
- [ ] `libs/flux-ui/components/date-picker/_days.scss` — day-grid cells (date, range modes)
- [ ] `libs/flux-ui/components/date-picker/_months.scss` — month-grid cells (discovered from plugin DOM)
- [ ] `libs/flux-ui/components/date-picker/_years.scss` — year-grid cells (our plugin DOM)
- [ ] `libs/flux-ui/components/date-picker/_weeks.scss` — week row highlight
- [ ] `libs/flux-ui/components/date-picker/_range.scss` — in-range day background
- [ ] `libs/flux-ui/components/date-picker/_flat.scss` — inline wrapper overrides
- [ ] Add entry to `libs/flux-ui/components/_index.scss`
- [ ] **Never import `flatpickr.css` or any plugin CSS** — all styles are in Flux UI

### 5.2 Token definitions

- [ ] All CSS custom properties follow three-level cascade: `var(--vi-date-picker-{token}, #{tokens.$sass-token})`
- [ ] Input tokens: border, focus-ring, background, text, placeholder, segments widths
- [ ] Calendar tokens: bg, shadow, border, z-index, padding, radius
- [ ] Day cell tokens: size, hover-bg, selected-bg/color, today-border, disabled-opacity
- [ ] Range tokens: in-range-bg/color, separator-color
- [ ] Month cell tokens: size, height, selected-bg/color, hover-bg
- [ ] Year cell tokens: size, selected-bg/color, grid-columns
- [ ] Week row tokens: bg, color
- [ ] Nav tokens: button-color, button-hover-bg, title-color, title-weight, weekday-color
- [ ] Flat tokens: border, radius, shadow
- [ ] Partial date tokens: unknown-color (greyed empty segments)
- [ ] Dark theme: all tokens remapped via `$vi-theme--dark` (automatic via existing system)

### 5.3 Partial date CSS (within date-picker partials)

- [ ] Add `_partial.scss` to `libs/flux-ui/components/date-picker/`
  - [ ] `--vi-date-picker-segment-unknown-color` token (greyed placeholder for empty/unknown segments)
  - [ ] Shared segment layout tokens with standard date mode (no duplication)

---

## Phase 6 — Storybook Stories

### 6.1 vi-date-picker stories (`src/date-picker/vi-date-picker.stories.ts`)

- [ ] Default (date mode, no args)
- [ ] All modes: month, year, month-year, range, week
- [ ] Flat mode (all modes × flat=true)
- [ ] With locale: en-GB, en-US, de-DE, zh-CN (demonstrates segment order change)
- [ ] With partial=true (date mode)
- [ ] With min/max constraints
- [ ] Disabled state
- [ ] Invalid state with `validityMessage`
- [ ] Dark theme variant
- [ ] Consumer plugin (confirmDate or audit logger)
- [ ] Study theme CSS override (sponsor colours)
- [ ] Week numbers shown

### 6.2 vi-partial-date stories (`src/partial-date/vi-partial-date.stories.ts`)

- [ ] mode=full (year+month known, day unknown)
- [ ] mode=full (year known only)
- [ ] mode=month-year
- [ ] mode=year
- [ ] Required validation
- [ ] Cascade validation (day without month)
- [ ] Locale variants (en-GB, de-DE)
- [ ] Programmatic value set
- [ ] Disabled / readonly

---

## Phase 7 — Vite Build Config

- [ ] Update `libs/web-components/vite.config.ts`
  - [ ] Add entry: `'date-picker/vi-date-picker': 'src/date-picker/vi-date-picker.ts'`
  - [ ] Add entry: `'partial-date/vi-partial-date': 'src/partial-date/vi-partial-date.ts'`
  - [ ] Ensure flatpickr is in `external` or `manualChunks` for deduplication
- [ ] Verify tree-shaking: importing `date-picker` does not pull in `partial-date` and vice versa

---

## Phase 8 — Documentation Updates

- [ ] Update `libs/web-components/README.md`
  - [ ] Add `vi-date-picker` section
  - [ ] Add `vi-partial-date` section
- [ ] Update `vi-date-picker.md` to note flatpickr maintenance risk and swap-engine exit path
- [ ] Update `vi-date-picker.md` — locale is page-load only (add warning box)
- [ ] Update `vi-date-picker.md` — fix `_hiddenInput` to `_getHiddenInput()` method pattern
- [ ] Update `vi-date-picker.md` — clarify `utcIso` is "midnight UTC of calendar date", not moment of click
- [ ] `vi-partial-date.md` — mark open questions resolved as work progresses

---

## Phase 9 — Prototype Spike (do BEFORE writing component code)

> These are de-risking steps to discover unknowns early.

- [ ] **Spike A** — plain HTML page with `monthSelectPlugin` + custom CSS only. Goal: document exact DOM class names produced by the plugin. Time-box: 2h.
- [ ] **Spike B** — plain HTML page with `weekSelectPlugin`. Same goal. Time-box: 1h.
- [ ] **Spike C** — plain HTML page with custom `yearSelectPlugin` factory. Verify `fp._createElement`, `fp.close()`, `fp.calendarContainer` all work as expected. Time-box: 3h.
- [ ] **Spike D** — plain HTML with locale hot-swap (destroy + recreate). Confirm that page-load-only locale is safe and that Storybook can still switch locale via knob (by re-rendering the component). Time-box: 1h.

---

## Milestones

| Milestone | Phases | Goal |
|---|---|---|
| **M1: Types + Infra** | 0, 1 | All types (incl. PartialDateValue/PartialDateChangeDetail), i18n utils, registries, mixin — fully tested |
| **M2: Plugin spikes** | 2, 9 | All three plugins working in plain HTML, CSS class names discovered |
| **M3: date-picker MVP** | 3, 4.1–4.3 | `date` mode works end-to-end in Storybook |
| **M4: All standard modes** | 4.4–4.6 | All 6 standard modes + flat working in Storybook |
| **M5: Partial date mode** | 4.7 | `partial=true` with all three sub-modes (`full`, `month-year`, `year`) working |
| **M6: Flux UI CSS** | 5 | Full token system, dark theme, partial-unknown styles, sponsor override |
| **M7: Ship** | 6, 7, 8 | Stories, build, docs complete |

