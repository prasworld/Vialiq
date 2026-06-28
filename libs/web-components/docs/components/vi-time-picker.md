# `vi-time-picker` — Time Picker

**Package:** `@vialiq/web-components/time-picker`  
**Element:** `<vi-time-picker>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_date-picker.scss` (shared tokens)  
**Engine:** [flatpickr](https://flatpickr.js.org/) — `enableTime: true`, `noCalendar: true` (MIT)

---

## Purpose

A time-of-day input control. Used wherever a precise time (not just date) must be recorded:

- Adverse event start/end time
- Dose administration time
- Vital signs assessment time
- Procedure time
- Infusion start/stop time

**When to use `vi-date-picker` instead:** when both date and time are required in one field, `vi-date-picker` can be extended with `showTime: true` (combines both via flatpickr's `enableTime`).

---

## Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `value` | `value` | `string` | `''` | ✅ | `HH:mm` or `HH:mm:ss`. `??:??` for unknown |
| `name` | `name` | `string` | `''` | — | Form field name |
| `format` | `format` | `TimeFormat` | `'24'` | ✅ | 12-hour or 24-hour clock |
| `step` | `step` | `number` | `15` | — | Minute increment step (5, 10, 15, 30, 60) |
| `showSeconds` | `show-seconds` | `boolean` | `false` | — | Include seconds segment |
| `min` | `min` | `string` | `''` | — | Minimum time (`HH:mm`) |
| `max` | `max` | `string` | `''` | — | Maximum time (`HH:mm`) |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the control |
| `required` | `required` | `boolean` | `false` | ✅ | Required field |
| `allowUnknown` | `allow-unknown` | `boolean` | `false` | — | Allow `??:??` (time not recorded) |
| `clearable` | `clearable` | `boolean` | `false` | — | Show clear button |
| `status` | `status` | `ControlStatus` | `'default'` | ✅ | Validation state |
| `validityMessage` | `validity-message` | `string` | `''` | — | Error/success message |

```typescript
type TimeFormat = '12' | '24';
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
| `vialiq-change` | `CustomEvent<{value: string; hours: number; minutes: number; seconds?: number}>` | ✅ | Time changes |
| `vialiq-clear` | `CustomEvent<void>` | ✅ | Clear button clicked |
| `invalid` | `Event` (cancelable) | ❌ | `checkValidity()` fails |

---

## Imperative Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Returns false if required and no value |
| `reportValidity()` | Validates and shows message |
| `setCustomValidity(msg)` | Custom validation error |
| `focus()` | Focus the hours segment |
| `clear()` | Clear the current value |
| `stepUp(segment?)` | Increment `'hours'` or `'minutes'` (default: minutes) |
| `stepDown(segment?)` | Decrement the specified segment |

---

## CSS Parts

| Part | Element |
|------|---------|
| `control` | Outer row |
| `hours-input` | Hours `<input>` |
| `minutes-input` | Minutes `<input>` |
| `seconds-input` | Seconds `<input>` (when `show-seconds`) |
| `separator` | `:` separator spans |
| `period-btn` | AM/PM toggle button (12-hour mode) |
| `clock-btn` | Clock icon button |
| `scroll-panel` | flatpickr time scroll panel |
| `clear-btn` | Clear × button |
| `helper` | Helper text wrapper |
| `validation` | Validation message |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-time-picker-segment-width` | `40px` | Per-segment input width |
| `--vi-time-picker-separator-color` | `var(--vi-color-grey-500)` | `:` colour |
| `--vi-time-picker-period-width` | `56px` | AM/PM button width |
| `--vi-time-picker-scroll-height` | `200px` | flatpickr scroll panel height |

---

## Shadow DOM Structure

```
vi-time-picker
├── div[part="control"] .timepicker-control
│   ├── input[part="hours-input"] type="text" inputmode="numeric"
│   │   maxlength="2" placeholder="HH" pattern="[0-9?]{2}"
│   ├── span[part="separator"] :
│   ├── input[part="minutes-input"] type="text" inputmode="numeric"
│   │   maxlength="2" placeholder="mm" pattern="[0-9?]{2}"
│   ├── span[part="separator"] :          (when show-seconds)
│   ├── input[part="seconds-input"] ...   (when show-seconds)
│   ├── vi-button[part="period-btn"]      (12-hour format only)
│   │   AM / PM
│   ├── vi-button[part="clock-btn"] icon-only ghost
│   │   └── vi-icon name="clock"
│   └── vi-button[part="clear-btn"]       (when clearable & has value)
│       └── vi-icon name="x"
├── input type="hidden" name=${name} value=${value}
├── slot[name="helper"]
└── span[part="validation"]
```

---

## flatpickr Configuration

```typescript
flatpickr(this._hiddenInput, {
  enableTime: true,
  noCalendar: true,
  time_24hr: this.format === '24',
  minuteIncrement: this.step,
  enableSeconds: this.showSeconds,
  minTime: this.min || undefined,
  maxTime: this.max || undefined,
  allowInput: false,          // segment inputs handle direct entry
  appendTo: document.body,
  onChange: ([date]) => this._onFlatpickrChange(date),
  onClose: () => this._onPanelClose(),
});
```

The flatpickr scroll wheels (hours, minutes, seconds) are shown in the popup panel via `clock-btn`. Segment inputs support direct keyboard entry independent of the popup.

---

## Keyboard Interactions

| Key | Context | Behaviour |
|-----|---------|-----------|
| `Tab` | Hours segment | Move to minutes |
| `Tab` | Minutes segment | Move to seconds (if shown) or next element |
| `↑` | Hours segment | Increment hours (wraps 23→0 / 11→0) |
| `↓` | Hours segment | Decrement hours |
| `↑` | Minutes segment | Increment by `step` minutes (wraps 59→0) |
| `↓` | Minutes segment | Decrement by `step` minutes |
| `A` / `P` | Hours segment (12h) | Switch AM / PM |
| `Space` / `Enter` | Clock button | Open scroll panel |
| `Escape` | Panel open | Close panel |
| Numeric | Any segment | Type directly; auto-advances after 2 digits |
| `Backspace` | Segment | Clear digit / set `??` if `allow-unknown` |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Label | `vi-form-field` provides label; segments get `aria-labelledby` |
| Hours | `aria-label="Hours"` + `aria-valuemin="0"` `aria-valuemax="23"` |
| Minutes | `aria-label="Minutes"` + `aria-valuemin="0"` `aria-valuemax="59"` |
| Seconds | `aria-label="Seconds"` |
| AM/PM | `aria-label="AM"` / `aria-label="PM"` (toggle button) |
| Clock button | `aria-label="Open time picker"` + `aria-haspopup="dialog"` |
| Required | `aria-required` on host + individual segments |
| Invalid | `aria-invalid` + `aria-errormessage` |

---

## Unknown Time (EDC convention)

When `allow-unknown` is set, a "Time unknown" checkbox appears below the control. Checking it:
1. Disables the segments
2. Sets value to `??:??` (or `??:??:??`)
3. Fires `vialiq-change` with `value: '??:??'`

This matches CDISC SDTM convention for times not recorded.

```html
<vi-time-picker
  name="aeStartTime"
  allow-unknown
  (vialiq-change)="ae.startTime = $event.detail.value"
>
  <span slot="helper">Record time to nearest minute if known.</span>
</vi-time-picker>
```

---

## Usage Examples

### Dose time (24-hour, 5-minute steps)

```html
<vi-form-field label="Dose Administration Time" required>
  <vi-time-picker
    name="doseTime"
    format="24"
    step="5"
    required
    (vialiq-change)="dose.time = $event.detail.value"
  ></vi-time-picker>
</vi-form-field>
```

### AE time with seconds

```html
<vi-time-picker
  name="aeOnsetTime"
  format="24"
  step="1"
  show-seconds
  allow-unknown
  [value]="ae.onsetTime"
></vi-time-picker>
```

### 12-hour format

```html
<vi-time-picker
  name="visitTime"
  format="12"
  step="15"
  min="07:00"
  max="20:00"
></vi-time-picker>
```

---

## Form Participation

Form-associated (`static formAssociated = true`). Value submitted as `name=HH:mm` (or `HH:mm:ss` with seconds, `??:??` for unknown).

---

## i18n — Internal Labels

All internal text uses `translateDirective`. See [I18N.md](../I18N.md) for setup.

| Key | Default (en) |
|-----|-------------|
| `timePicker.unknown` | `"Time unknown"` |
| `timePicker.hour` | `"Hour"` |
| `timePicker.minute` | `"Minute"` |
| `timePicker.second` | `"Second"` |
| `timePicker.amPm` | `"AM/PM"` |

---

## Related Components

- [`vi-date-picker`](./vi-date-picker.md) — date with optional time
- [`vi-month-year-picker`](./vi-month-year-picker.md) — month/year only
- [`vi-number-input`](./vi-number-input.md) — numeric-only input for measurements
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
