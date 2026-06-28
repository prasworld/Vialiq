# `vi-date-picker` — Date Picker

**Package:** `@vialiq/web-components/date-picker`  
**Element:** `<vi-date-picker>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_date-picker.scss`  
**Engine:** [flatpickr](https://flatpickr.js.org/) (MIT, zero-dep, TypeScript)

---

## Purpose

A form-associated date entry control designed specifically for clinical EDC. Key differentiators from generic date pickers:

1. **Partial date support** — allows unknown date components (year-only: `1985-??-??`, year+month: `1985-06-??`) per CDISC and EDC conventions
2. **ISO 8601 output** — always outputs `YYYY-MM-DD` (or `YYYY-MM-??` / `YYYY-??-??` for partials)
3. **Future date prevention** — configurable; default blocks future dates for historical events (AEs, prior medications)
4. **Manual text entry** — three separate fields (DD / MM / YYYY) to avoid locale ambiguity
5. **Calendar popup** — optional visual picker for date selection (native `popover` API)

**Clinical EDC use cases:**
- Subject date of birth (partial date common: year known, exact date unknown)
- Adverse event start/end date
- Concomitant medication start date
- Prior medical history dates
- Protocol deviation dates

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string` | `''` | ✅ | ISO 8601 date string (with `?` for unknown) |
| `name` | `name` | `string` | `''` | — | Form field name |
| `min` | `min` | `string` | `''` | — | Minimum date (ISO 8601) |
| `max` | `max` | `string` | `'today'` | — | Maximum date (`'today'` or ISO 8601) |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the control |
| `required` | `required` | `boolean` | `false` | ✅ | Required field |
| `partial` | `partial` | `boolean` | `false` | — | Allow unknown day / month components |
| `format` | `format` | `DateFormat` | `'DD/MM/YYYY'` | — | Display format for the entry fields |
| `showCalendar` | `show-calendar` | `boolean` | `true` | — | Show calendar popup trigger |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error/success message |

```typescript
type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
type ControlStatus = 'default' | 'valid' | 'invalid';
```

---

### Partial Date Values

When `partial` is `true`, the user can mark individual date components as unknown using a checkbox or `??` keyboard input:

| Value | Meaning |
|-------|---------|
| `1985-06-15` | Full date known |
| `1985-06-??` | Year and month known, day unknown |
| `1985-??-??` | Year known only |
| `??-??-??` | Completely unknown (use only when truly needed) |

The `?` characters are literal in the ISO 8601 output string. This is the CDISC SDTM convention for partial dates (`DTC` variables).

---

### Slots

| Slot | Description |
|------|-------------|
| `helper` | Persistent helper text |

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vialiq-change` | `CustomEvent<{value: string; date: Date \| null; partial: boolean}>` | ✅ | ✅ | Date committed (all fields filled or calendar selection) |
| `vialiq-input` | `CustomEvent<{value: string}>` | ✅ | ✅ | Any component field changes |
| `invalid` | `Event` (cancelable) | ❌ | — | `checkValidity()` fails |

---

### Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Validates date; fires `invalid` if invalid |
| `reportValidity()` | Validates + shows browser tooltip |
| `setCustomValidity(msg)` | Custom error message |
| `focus()` | Focus the first date segment (DD or YYYY) |
| `openCalendar()` | Programmatically open the calendar popup |
| `closeCalendar()` | Programmatically close the popup |

---

### CSS Parts

| Part | Element |
|------|---------|
| `field` | Outer wrapper |
| `segments` | The DD/MM/YYYY segment row |
| `segment-day` | Day `<input>` |
| `segment-month` | Month `<input>` |
| `segment-year` | Year `<input>` |
| `separator` | `/` between segments |
| `calendar-trigger` | Calendar icon button |
| `calendar-popup` | Calendar popover |
| `helper` | Helper text wrapper |
| `validation` | Validation message |
| `partial-toggle` | "Unknown" checkbox (when `partial`) |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-date-picker-segment-width-day` | `36px` | Day field width |
| `--vi-date-picker-segment-width-month` | `36px` | Month field width |
| `--vi-date-picker-segment-width-year` | `52px` | Year field width |
| `--vi-date-picker-separator-color` | `var(--vi-color-grey-400)` | `/` separator colour |
| `--vi-date-picker-unknown-color` | `var(--vi-color-grey-400)` | Colour of `??` unknown text |
| `--vi-date-picker-calendar-bg` | `var(--vi-color-background)` | Calendar popup background |
| `--vi-date-picker-calendar-shadow` | `var(--vi-shadow-lg)` | Calendar popup shadow |
| `--vi-date-picker-day-hover-bg` | `var(--vi-color-blue-50)` | Calendar day hover |
| `--vi-date-picker-day-selected-bg` | `var(--vi-color-primary)` | Selected day |
| `--vi-date-picker-day-today-border` | `var(--vi-color-primary)` | Today outline |

---

## Input Structure

Three separate numeric text fields with auto-advance:

```html
<div part="segments" class="date-segments" role="group" aria-label="Date entry">

  <!-- Day field (auto-advances to month after 2 digits) -->
  <input part="segment-day" type="text" inputmode="numeric"
    pattern="\d{1,2}" maxlength="2"
    aria-label="Day" placeholder="DD"
    @input=${this._onDayInput}
  />
  <span part="separator" aria-hidden="true">/</span>

  <!-- Month field -->
  <input part="segment-month" type="text" inputmode="numeric"
    pattern="\d{1,2}" maxlength="2"
    aria-label="Month" placeholder="MM"
    @input=${this._onMonthInput}
  />
  <span part="separator" aria-hidden="true">/</span>

  <!-- Year field -->
  <input part="segment-year" type="text" inputmode="numeric"
    pattern="\d{4}" maxlength="4"
    aria-label="Year" placeholder="YYYY"
    @input=${this._onYearInput}
  />

  <!-- Calendar trigger -->
  <vi-button icon-only variant="ghost" size="sm" part="calendar-trigger"
    aria-label="Open calendar" aria-haspopup="dialog"
    @click=${this.openCalendar}
  >
    <vi-icon slot="icon" name="calendar" size="16"></vi-icon>
  </vi-button>
</div>

<!-- Calendar popup (native popover API) -->
<div part="calendar-popup" popover="auto" role="dialog" aria-label="Date picker calendar">
  <!-- Month navigation -->
  <!-- Day grid (7 columns, Mon–Sun) -->
</div>
```

Using `type="text"` + `inputmode="numeric"` instead of `type="number"` for the segments avoids browser-native increment behaviour and gives full control over validation messaging.

---

## Validation Rules

| Rule | Validity flag | Condition |
|------|--------------|-----------|
| Empty required | `valueMissing` | Required and all segments empty |
| Invalid date | `badInput` | Day 32, month 13, Feb 30, etc. |
| Before min | `rangeUnderflow` | Date < min |
| After max | `rangeOverflow` | Date > max (or > today when max="today") |
| Future date | `rangeOverflow` | Date is in the future (when max="today") |
| Incomplete | `badInput` | Some segments filled, some empty (non-partial mode) |

---

## Partial Date Behaviour

When `partial="true"`:

1. A "Day unknown" checkbox appears below the day field
2. A "Month unknown" checkbox appears below the month field
3. When checked, the corresponding field shows `??` and is disabled
4. The value is constructed as `YYYY-MM-??` or `YYYY-??-??`

```html
<vi-date-picker partial name="medHistoryStart" max="today">
  <span slot="helper">
    Check "Unknown" if the exact date is not available.
  </span>
</vi-date-picker>
```

Output examples:
- User enters `15/06/1985` → `1985-06-15`
- User enters year `1985`, checks "Day unknown" and "Month unknown" → `1985-??-??`
- User enters `06/1985`, checks "Day unknown" → `1985-06-??`

---

## Keyboard Interactions

| Key | Element | Behaviour |
|-----|---------|-----------|
| `Tab` | Any segment | Move to next segment / control |
| `Shift+Tab` | Any segment | Move to previous segment / control |
| `↑` / `↓` | Day/month/year | Increment / decrement value |
| `Backspace` | Empty segment | Move focus to previous segment |
| `0–9` | Any segment | Enter digit; auto-advance after max digits |
| `Escape` | Calendar popup | Close calendar |
| `Enter` / `Space` | Calendar day | Select date |
| `←` / `→` | Calendar | Previous / next day |
| `↑` / `↓` | Calendar | Previous / next week |
| `Page Up/Down` | Calendar | Previous / next month |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Group labelling | Segment row has `role="group"` + `aria-label="Date entry"` |
| Individual segments | Each `<input>` has `aria-label="Day"` / `"Month"` / `"Year"` |
| Calendar | `role="dialog"` + `aria-label="Date picker calendar"` |
| Calendar trigger | `aria-haspopup="dialog"` + `aria-expanded` state |
| Calendar days | Each day button: `aria-label="15 June 1985"` |
| Today | `aria-current="date"` on today's day cell |
| Selected | `aria-selected="true"` on selected day |
| Required | `aria-required` on the group |
| Invalid | `aria-invalid` + `aria-errormessage` on the group |

---

## Angular Integration

```typescript
@Component({
  template: `
    <vi-form-field label="Date of Birth" required
      [status]="dobCtrl.invalid && dobCtrl.touched ? 'invalid' : 'default'"
      [validityMessage]="getDobError(dobCtrl)">
      <vi-date-picker
        name="dob"
        partial
        max="today"
        [value]="dobCtrl.value ?? ''"
        (vialiq-change)="dobCtrl.setValue($event.detail.value); dobCtrl.markAsTouched()"
      ></vi-date-picker>
    </vi-form-field>
  `
})
```

---

## Usage Examples

### Standard date entry

```html
<vi-form-field label="Adverse Event Start Date" required>
  <vi-date-picker name="aeStartDate" max="today" required></vi-date-picker>
</vi-form-field>
```

### Date of birth with partial support

```html
<vi-form-field label="Date of Birth" required>
  <vi-date-picker
    name="dob"
    partial
    max="today"
    required
  >
    <span slot="helper">If exact date is unknown, enter the year only.</span>
  </vi-date-picker>
</vi-form-field>
```

### Date range (start → end)

```html
<vi-form-field label="Concomitant Medication Start Date">
  <vi-date-picker name="conMedStart" max="today" id="conmed-start"></vi-date-picker>
</vi-form-field>

<vi-form-field label="Concomitant Medication End Date">
  <vi-date-picker
    name="conMedEnd"
    max="today"
    [min]="conMedStartValue"
  ></vi-date-picker>
</vi-form-field>
```

### Controlled value

```html
<vi-date-picker
  name="visitDate"
  .value=${visitDate}
  @vialiq-change=${e => visitDate = e.detail.value}
></vi-date-picker>
```

---

## Implementation Notes

### flatpickr integration
`vi-date-picker` wraps **flatpickr** for the calendar UI. The Lit component:
1. Renders the three-segment `DD / MM / YYYY` text inputs as the trigger (shadow DOM, styled via Flux UI tokens)
2. On `firstUpdated`, calls `flatpickr(hiddenInput, config)` with `appendTo: document.body` so the calendar portals outside shadow DOM overflow
3. Syncs `vialiq-change` by listening to flatpickr's `onChange` hook
4. Destroys flatpickr in `disconnectedCallback`

```typescript
// Shared base mixin (libs/web-components/src/base/flatpickr-mixin.ts)
// _fp: Instance | null
// _initFlatpickr(el: HTMLElement, config: Partial<BaseOptions>): void
// _destroyFlatpickr(): void
```

Flatpickr CSS is **completely replaced** by `libs/flux-ui/components/_flatpickr.scss` — the default `flatpickr.css` is never imported.

### Partial date handling
When `allow-partial` is set, the calendar is supplementary. The three segment inputs handle DD/MM/YYYY independently; empty segments serialise as `??` in the ISO output. flatpickr is not used for partial entry — it is only used for full-date calendar selection.

- Segment auto-advance: when DD field has 2 digits, focus moves to MM; when MM has 2 digits, focus moves to YYYY.
- The native `<input type="hidden">` carries the ISO 8601 value for form submission.
- `max="today"` is resolved at render time to `new Date()` formatted as `YYYY-MM-DD`.

---

## Related Components

- [`vi-number-input`](./vi-number-input.md) — numeric values
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
- [`vi-modal`](./vi-modal.md) — date picker can be inside a modal
