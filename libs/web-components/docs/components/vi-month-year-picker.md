# `vi-month-year-picker` — Month & Year Picker

**Package:** `@vialiq/web-components/month-year-picker`  
**Element:** `<vi-month-year-picker>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_date-picker.scss` (shared tokens)  
**Engine:** [flatpickr](https://flatpickr.js.org/) + `monthSelectPlugin` (MIT)

---

## Purpose

A month + year picker for when day-level precision is not needed or not known:

- Drug expiry date (month/year only)
- Subject birth month (day not recorded)
- Reporting periods (e.g. "June 2026")
- Medication start when only month known
- Partial date entry: `YYYY-??` when month is unknown but year is known

**Not this component if:** you need full day/month/year — use [`vi-date-picker`](./vi-date-picker.md).

---

## Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string` | `''` | ✅ | `YYYY-MM` or `YYYY-??` (partial) |
| `name` | `name` | `string` | `''` | — | Form field name |
| `min` | `min` | `string` | `''` | — | Min value (`YYYY-MM`) |
| `max` | `max` | `string` | `'today'` | — | Max value (`YYYY-MM` or `'today'`) |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the control |
| `required` | `required` | `boolean` | `false` | ✅ | Required field |
| `allowPartial` | `allow-partial` | `boolean` | `false` | — | Allow `YYYY-??` (month unknown) |
| `clearable` | `clearable` | `boolean` | `false` | — | Show clear button |
| `placeholder` | `placeholder` | `string` | `'MM / YYYY'` | — | Input placeholder |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error message |
| `locale` | `locale` | `string` | `'en'` | — | flatpickr locale key |

```typescript
type ControlStatus = 'default' | 'valid' | 'invalid';
```

---

## Slots

| Slot | Description |
|------|-------------|
| `helper` | Persistent helper text below the control |

---

## Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-change` | `CustomEvent<{value: string}>` | ✅ | Month/year selection changes |
| `vialiq-clear` | `CustomEvent<void>` | ✅ | Clear button clicked |
| `invalid` | `Event` (cancelable) | ❌ | `checkValidity()` fails |

---

## Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Returns false if required and no value |
| `reportValidity()` | Validates + shows message |
| `setCustomValidity(msg)` | Custom error |
| `focus()` | Focus the month input |
| `clear()` | Clear the current value |

---

## CSS Parts

| Part | Element |
|------|---------|
| `control` | Outer input row |
| `month-input` | Month `<input>` field |
| `year-input` | Year `<input>` field |
| `separator` | `/` separator span |
| `calendar-btn` | Calendar icon button |
| `clear-btn` | Clear × button |
| `helper` | Helper text wrapper |
| `validation` | Validation message |
| `calendar` | flatpickr calendar container (when open) |

---

## CSS Custom Properties

Inherits shared date picker tokens from `--vi-date-picker-*`. Additional:

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-month-picker-month-width` | `56px` | Month segment width |
| `--vi-month-picker-year-width` | `72px` | Year segment width |
| `--vi-month-picker-separator-color` | `var(--vi-color-grey-400)` | `/` colour |
| `--vi-month-picker-calendar-month-cols` | `3` | Month grid columns |

---

## Shadow DOM Structure

```
vi-month-year-picker
├── div[part="control"] .mypicker-control
│   ├── input[part="month-input"] type="text" inputmode="numeric"
│   │   placeholder="MM" maxlength="2" pattern="[0-9?]{2}"
│   ├── span[part="separator"] /
│   ├── input[part="year-input"] type="text" inputmode="numeric"
│   │   placeholder="YYYY" maxlength="4" pattern="[0-9]{4}"
│   ├── vi-button[part="calendar-btn"] icon-only ghost
│   │   └── vi-icon name="calendar"
│   └── vi-button[part="clear-btn"] icon-only ghost (when clearable & has value)
│       └── vi-icon name="x"
├── input type="hidden" name=${name} value=${isoValue}  (form submission)
├── slot[name="helper"]
└── span[part="validation"]
```

flatpickr's calendar panel is appended to `document.body` (portalled). The component's hidden input is the flatpickr target with `monthSelectPlugin` configuration.

---

## flatpickr Configuration

```typescript
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect';

flatpickr(this._hiddenInput, {
  plugins: [
    monthSelectPlugin({
      shorthand: false,         // "January" not "Jan"
      dateFormat: 'Y-m',        // internal format
      altFormat: 'F Y',         // display format: "June 2026"
      theme: 'vialiq',          // Flux UI CSS class on calendar
    }),
  ],
  locale: this.locale,
  minDate: this.min || undefined,
  maxDate: this.max === 'today' ? 'today' : this.max || undefined,
  allowInput: false,            // segment inputs handle manual entry
  appendTo: document.body,
  onChange: ([date]) => this._onFlatpickrChange(date),
});
```

---

## Keyboard Interactions

| Key | Context | Behaviour |
|-----|---------|-----------|
| `Tab` | On month | Move focus to year segment |
| `Tab` | On year | Move to next element outside picker |
| `↑` / `↓` | On month segment | Increment / decrement month (01–12) |
| `↑` / `↓` | On year segment | Increment / decrement year |
| `Enter` / `Space` | Calendar button | Open calendar |
| `Escape` | Calendar open | Close calendar |
| `←` / `→` | Calendar open | Navigate months |
| Numeric input | Month/year | Type directly; `01`–`12` valid months |
| `Backspace` | Month/year | Clear segment; `?` fills if `allow-partial` |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Label association | `vi-form-field` generates id; inner inputs get `aria-labelledby` |
| Month input | `aria-label="Month"` |
| Year input | `aria-label="Year"` |
| Required | `aria-required="true"` on control |
| Invalid | `aria-invalid="true"` + `aria-errormessage` id |
| Calendar button | `aria-label="Open month picker"` + `aria-haspopup="dialog"` |
| Calendar | `role="dialog"` (flatpickr default) |

---

## Partial Date Support

When `allow-partial` is set:

- A "Month unknown" checkbox (or triple-click to set `??`) sets the month segment to `??`
- Value serialises as `YYYY-??` (e.g. `2023-??`)
- Year-only partial is not supported here — use the year-segment of `vi-date-picker` instead

```html
<vi-month-year-picker
  name="drugExpiry"
  value="2027-06"
  allow-partial
  (vialiq-change)="drugExpiry = $event.detail.value"
></vi-month-year-picker>
```

---

## Usage Examples

### Reporting period

```html
<vi-form-field label="Reporting Period" required>
  <vi-month-year-picker
    name="reportingPeriod"
    [min]="studyStartMonth"
    max="today"
    required
    (vialiq-change)="onPeriodChange($event.detail.value)"
  ></vi-month-year-picker>
</vi-form-field>
```

### Drug expiry (partial allowed)

```html
<vi-month-year-picker
  name="expiryDate"
  allow-partial
  clearable
  [value]="medication.expiry"
  (vialiq-change)="medication.expiry = $event.detail.value"
>
  <span slot="helper">Enter month and year only. Use '??' if month is unknown.</span>
</vi-month-year-picker>
```

---

## Form Participation

Form-associated (`static formAssociated = true`). Value submitted as `name=YYYY-MM`.

---

## i18n — Internal Labels

All internal text uses `translateDirective`. See [I18N.md](../I18N.md) for setup.

| Key | Default (en) |
|-----|-------------|
| `monthPicker.year` | `"Year"` |
| `monthPicker.month` | `"Month"` |

Month names use `Intl.DateTimeFormat` with the active locale — no translation keys needed.

---

## Related Components

- [`vi-date-picker`](./vi-date-picker.md) — full day/month/year picker
- [`vi-time-picker`](./vi-time-picker.md) — time of day picker
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
