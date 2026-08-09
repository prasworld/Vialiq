# `vi-switch` — Toggle Switch

**Package:** `@vialiq/web-components/switch`  
**Element:** `<vi-switch>`  
**Status:** 🔲 Planned — Phase 1  
**Flux UI base:** `libs/flux-ui/components/_switch.scss`

---

## Purpose

A boolean toggle control representing on/off, enabled/disabled, or active/inactive states. Semantically equivalent to a checkbox (`role="switch"`), but visually conveys the notion of enabling/disabling a setting rather than selecting from a list.

**Use `vi-switch` when:**
- The action takes effect immediately (no "Submit" needed), e.g. enabling dark mode
- The label clearly describes what "on" means (e.g. "Enable email notifications")
- The state is a system preference or feature flag

**Use `vi-checkbox` instead when:**
- The field is part of a form submitted with a button
- The option is part of a multi-select group
- "Checked" maps to a list value, not an on/off setting

**Clinical EDC use cases:**
- Site-level feature flags (e.g. "Enable offline mode for site")
- "Lock record" toggle in data review workflow
- "Require dual data entry" setting per form
- Protocol deviation — "Is this a major deviation?" (but prefer checkbox for audit trail forms)

---

## Public API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `checked` | `checked` | `boolean` | `false` | ✅ | On/off state |
| `value` | `value` | `string` | `'on'` | — | Form submission value when checked |
| `name` | `name` | `string` | `''` | — | Form field name |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the switch |
| `size` | `size` | `SwitchSize` | `'md'` | ✅ | Visual size |
| `labelPlacement` | `label-placement` | `LabelPlacement` | `'end'` | — | Label position relative to switch |

```typescript
type SwitchSize = 'sm' | 'md' | 'lg';
type LabelPlacement = 'start' | 'end';
```

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | Label text. Wraps naturally for long descriptions; the track stays top-aligned with the first line. |

---

### Events

| Event | Type | Bubbles | Composed | Fires when |
|-------|------|---------|---------|-----------|
| `vi-switch-change` | `CustomEvent<{checked: boolean}>` | ✅ | ✅ | Toggle state changes |

---

### CSS Parts

| Part | Element |
|------|---------|
| `track` | The pill-shaped background |
| `thumb` | The sliding circle |
| `label` | Label text span |

---

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-switch-track-width` | `44px` | Track width |
| `--vi-switch-track-height` | `24px` | Track height |
| `--vi-switch-track-color-off` | `var(--vi-color-grey-300)` | Track colour when off |
| `--vi-switch-track-color-on` | `var(--vi-color-primary)` | Track colour when on |
| `--vi-switch-thumb-size` | `18px` | Thumb diameter |
| `--vi-switch-thumb-color` | `#ffffff` | Thumb fill |
| `--vi-switch-thumb-offset` | `2px` | Gap between thumb and track edge |
| `--vi-switch-thumb-shadow` | `0 1px 3px rgba(0,0,0,.2)` | Thumb shadow |
| `--vi-switch-focus-ring-color` | `var(--vi-color-primary)` | Focus outline colour |
| `--vi-switch-focus-ring-glow` | `var(--vi-color-blue-200)` | Focus glow halo |
| `--vi-switch-label-gap` | `8px` | Gap between track and label |
| `--vi-switch-transition-duration` | `150ms` | Animation speed |
| `--vi-switch-disabled-opacity` | `0.5` | Disabled opacity |

Size variants (set automatically via `:host([size="sm"])`):

| Size | Track | Thumb |
|------|-------|-------|
| `sm` | 36×20px | 14px |
| `md` | 44×24px | 18px (default) |
| `lg` | 52×28px | 22px |

---

## Shadow DOM Structure

```html
<label class="switch-wrapper" data-placement=${labelPlacement}>
  <!-- Label can appear before or after the track (label-placement) -->
  ${labelPlacement === 'start' ? html`
    <span part="label" class="switch-label"><slot></slot></span>
  ` : nothing}

  <!-- Hidden native input for form participation + a11y -->
  <input
    type="checkbox"
    role="switch"
    class="switch-input sr-only"
    .name=${this.name}
    .value=${this.value}
    ?checked=${this.checked}
    ?disabled=${this.disabled}
    ?required=${this.required}
    aria-required=${this.required ? 'true' : 'false'}
    aria-checked=${this.checked ? 'true' : 'false'}
    @change=${this._onChange}
  />

  <!-- Visual track + thumb -->
  <span part="track" class="switch-track" aria-hidden="true">
    <span part="thumb" class="switch-thumb"></span>
  </span>

  ${labelPlacement === 'end' ? html`
    <span part="label" class="switch-label"><slot></slot></span>
  ` : nothing}
</label>
```

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `Tab` / `Shift+Tab` | Focus in/out |
| `Space` | Toggle on/off |
| `Enter` | Toggle (some browsers; not standard for checkboxes) |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Role | `role="switch"` on native `<input type="checkbox">` |
| State | `aria-checked="true | false"` |
| Label | Slot text inside `<label>` — automatic association |
| Focus ring | On native input `:focus-visible` |
| Disabled | `disabled` on native input; `aria-disabled` not needed |

---

## Usage Examples

### Basic toggle

```html
<vi-switch name="notifications">Enable email notifications</vi-switch>
```

### Controlled (Angular)

```html
<vi-switch
  name="offlineMode"
  [checked]="settings.offlineMode"
  (vi-switch-change)="settings.offlineMode = $event.detail.checked"
>
  Enable offline data entry
</vi-switch>
```

### With long descriptive label

```html
<!-- The track top-aligns with the first text line when the label wraps -->
<vi-switch name="offlineMode" style="max-width: 320px;">
  Allow offline data entry when network connectivity is unavailable
</vi-switch>
```

### Label before (start placement)

```html
<vi-switch label-placement="start" name="darkMode">
  Dark theme
</vi-switch>
```

### Disabled (read-only system value)

```html
<vi-switch checked disabled>
  21 CFR Part 11 Audit Trail (always enabled)
</vi-switch>
```

---

## Related Components

- [`vi-checkbox`](./vi-checkbox.md) — form submission, multi-select
- [`vi-radio-group`](./vi-radio.md) — exclusive choice
- [`vi-form-field`](./vi-form-field.md) — label + validation wrapper
