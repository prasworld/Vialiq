# `vi-modal` — Modal Dialog

**Package:** `@vialiq/web-components/modal`  
**Element:** `<vi-modal>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_modal.scss`  
**Mixin:** `FocusTrapMixin`

---

## Purpose

A focus-trapping dialog that blocks interaction with the page behind it. Built on the native `<dialog>` element for correct accessibility semantics and browser-native backdrop handling.

**Modal variants:**

| Variant | Use case | Size behaviour |
|---------|----------|---------------|
| `default` | General content, forms, data entry | Configurable (xs–xl, fullscreen) |
| `drawer` | Side panel — detailed record, query thread, config | Fills full viewport height; slides in from right or left |
| `alert` | Confirmation, destructive action, critical warning | Compact; centred; with variant icon |

**Clinical EDC use cases:**
- Subject enrolment confirmation dialog
- AE narrative entry (full form in modal)
- Query entry and response thread
- E-signature capture (captures signature before submit)
- Protocol deviation acknowledgement
- Data lock confirmation (destructive — `alert` variant)
- Audit trail viewer (drawer)
- Visit scheduling wizard (multi-step, fullscreen)

---

## Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `open` | `open` | `boolean` | `false` | ✅ | Controls visibility |
| `variant` | `variant` | `ModalVariant` | `'default'` | ✅ | Layout variant |
| `size` | `size` | `ModalSize` | `'md'` | ✅ | Dialog dimensions |
| `closable` | `closable` | `boolean` | `true` | — | Show × button in header |
| `persistent` | `persistent` | `boolean` | `false` | — | Prevent close on `Escape` and backdrop click |
| `scrollable` | `scrollable` | `boolean` | `true` | — | Body scrolls; header/footer stay fixed |
| `drawerPlacement` | `drawer-placement` | `DrawerPlacement` | `'right'` | — | Side for drawer variant |
| `alertVariant` | `alert-variant` | `AlertDialogVariant` | `'info'` | — | Icon+colour for alert variant |
| `returnFocusSelector` | — | `string \| HTMLElement` | — | — | Element to return focus to on close |

```typescript
type ModalVariant = 'default' | 'drawer' | 'alert';
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
type DrawerPlacement = 'right' | 'left';
type AlertDialogVariant = 'info' | 'success' | 'warning' | 'danger';
```

**Size dimensions (default variant):**

| Size | Width | Max height |
|------|-------|-----------|
| `xs` | 320px | 90vh |
| `sm` | 480px | 90vh |
| `md` | 640px | 90vh |
| `lg` | 800px | 90vh |
| `xl` | 960px | 90vh |
| `fullscreen` | 100vw | 100vh |

**Drawer dimensions:**
- Width: `var(--vi-modal-drawer-width, 480px)`
- Height: 100vh (always full height)

---

## Slots

| Slot | Description |
|------|-------------|
| `header` | Dialog title / header row (replaces default `<header>`) |
| `header-actions` | Actions in header (next to close button) |
| *(default)* | Body content |
| `footer` | Action buttons (Confirm / Cancel) |
| `icon` | Icon for `alert` variant (default: status icon from `alert-variant`) |

---

## Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-open` | `CustomEvent<void>` | ✅ | Modal opens |
| `vialiq-close` | `CustomEvent<{reason: 'escape' \| 'backdrop' \| 'button' \| 'programmatic'}>` | ✅ | Modal closes |
| `vialiq-request-close` | `CustomEvent<void>` (cancelable) | ✅ | Before close — caller can `preventDefault()` to block |

---

## Imperative Methods

| Method | Description |
|--------|-------------|
| `show()` | Open the modal (`open = true`) |
| `close(reason?)` | Close the modal; fires `vialiq-close` with reason |
| `focus()` | Focus first focusable element in modal body |

---

## CSS Parts

| Part | Element |
|------|---------|
| `backdrop` | `::backdrop` (native `<dialog>` backdrop) |
| `dialog` | The `<dialog>` element |
| `header` | Header row |
| `title` | Title text |
| `close-btn` | × close button |
| `body` | Scrollable body |
| `footer` | Footer row |
| `icon` | Alert variant icon wrapper |
| `alert-content` | Alert variant title + message column |

---

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-modal-bg` | `var(--vi-color-background)` | Dialog background |
| `--vi-modal-border-radius` | `8px` | Dialog corner radius |
| `--vi-modal-shadow` | `var(--vi-shadow-2xl)` | Dialog shadow |
| `--vi-modal-header-padding` | `20px 24px` | Header padding |
| `--vi-modal-body-padding` | `24px` | Body padding |
| `--vi-modal-footer-padding` | `16px 24px` | Footer padding |
| `--vi-modal-footer-bg` | `var(--vi-color-grey-50)` | Footer background |
| `--vi-modal-footer-border-color` | `var(--vi-color-grey-200)` | Footer top border |
| `--vi-modal-backdrop-bg` | `rgba(0, 0, 0, 0.5)` | Backdrop overlay colour |
| `--vi-modal-drawer-width` | `480px` | Drawer variant width |
| `--vi-modal-z-index` | `8000` | Stack order |
| `--vi-modal-animation-duration` | `200ms` | Open/close animation |

---

## Shadow DOM Structure

```
vi-modal
└── dialog[part="dialog"][open?] role="dialog" aria-modal="true" aria-labelledby="modal-title"
    │
    ├── header[part="header"] .modal-header  (default variant)
    │   ├── slot[name="header"]
    │   │   └── span[part="title"] id="modal-title"  (default)
    │   ├── slot[name="header-actions"]
    │   └── vi-button[part="close-btn"] icon-only ghost (if closable)
    │
    ├── div[part="icon"] .modal-alert-icon  (alert variant only)
    │   └── slot[name="icon"] → vi-icon (default from alertVariant)
    │
    ├── div[part="body"] .modal-body
    │   └── slot (default content)
    │
    └── footer[part="footer"] .modal-footer  (when footer slot has content)
        └── slot[name="footer"]
```

---

## Focus Management

Uses `FocusTrapMixin`:

1. **On open:** `_activateFocusTrap()` is called — queries all focusable elements in shadow + slotted content, stores `document.activeElement`, moves focus to first focusable element (or modal title if no interactive elements in body).
2. **While open:** `Tab` and `Shift+Tab` cycle within the modal; focus cannot escape.
3. **On close:** `_deactivateFocusTrap()` restores focus to the trigger element (from `returnFocusSelector` or the previously focused element).

```typescript
// Focusable selector (matches elements that should be in the tab cycle)
const FOCUSABLE = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');
```

**Slotted content:** `FocusTrapMixin` uses `this.shadowRoot.querySelectorAll` + traverses assigned elements of each `<slot>` via `slot.assignedElements({ flatten: true })` to include host-provided focusable content.

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `Escape` | Close modal (unless `persistent`) |
| `Tab` | Focus next element; wraps at end |
| `Shift+Tab` | Focus previous element; wraps at start |
| `Enter` / `Space` | Activate focused button (native) |
| `Escape` (persistent) | Fires `vialiq-request-close`; does not close if not prevented |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Dialog role | `role="dialog"` on `<dialog>` |
| Modal | `aria-modal="true"` |
| Label | `aria-labelledby` → title element id |
| Alert dialog | `role="alertdialog"` when `variant="alert"` and `alert-variant` is warning/danger |
| Backdrop | `::backdrop` CSS pseudo-element (native `<dialog>`) |
| Focus | First focusable element receives focus on open |
| Focus return | Returns to trigger on close |
| Scroll lock | `body { overflow: hidden }` while modal open |
| Announced on open | `aria-live="assertive"` on title for screen reader announcement |

---

## Animation

```scss
// Default variant — scale + fade
@keyframes vi-modal-enter {
  from { opacity: 0; transform: scale(0.96); }
  to   { opacity: 1; transform: scale(1); }
}

// Drawer variant — slide from right
@keyframes vi-modal-drawer-enter {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

// Alert variant — zoom-in spring
@keyframes vi-modal-alert-enter {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}

dialog[open] { animation: vi-modal-enter var(--vi-modal-animation-duration) ease-out; }

@media (prefers-reduced-motion: reduce) {
  dialog[open] { animation: none; }
}
```

---

## Usage Examples

### Default modal — form entry

```html
<vi-modal #aeModal size="lg" (vialiq-close)="onModalClose($event.detail.reason)">
  <span slot="header">Record Adverse Event</span>
  <app-ae-form [ae]="currentAe"></app-ae-form>
  <div slot="footer">
    <vi-button variant="ghost" (click)="aeModal.close('button')">Cancel</vi-button>
    <vi-button variant="primary" (click)="submitAe()">Save AE</vi-button>
  </div>
</vi-modal>

<vi-button (click)="aeModal.show()">Add Adverse Event</vi-button>
```

### Alert variant — destructive confirmation

```html
<vi-modal #lockModal variant="alert" alert-variant="danger" size="sm" persistent>
  <span slot="header">Lock Data</span>
  <p>This action is <strong>irreversible</strong>. All forms will be locked for editing.</p>
  <p>Are you sure you want to lock this subject's data?</p>
  <div slot="footer">
    <vi-button variant="ghost" (click)="lockModal.close('button')">Cancel</vi-button>
    <vi-button variant="danger" (click)="confirmLock()">Lock Data</vi-button>
  </div>
</vi-modal>
```

### Drawer — query thread

```html
<vi-modal #queryDrawer variant="drawer" drawer-placement="right" size="lg">
  <span slot="header">Query #QR-0042 — Weight</span>
  <app-query-thread [queryId]="selectedQueryId"></app-query-thread>
  <div slot="footer">
    <vi-button variant="primary" (click)="submitResponse()">Submit Response</vi-button>
  </div>
</vi-modal>
```

### Programmatic control

```typescript
// Angular component
@ViewChild('aeModal') modal!: HTMLElement & { show(): void; close(r?: string): void };

openModal() {
  this.modal.show();
}

// Listen to vialiq-request-close to guard against unsaved changes
this.modal.addEventListener('vialiq-request-close', (e: Event) => {
  if (this.form.dirty) {
    e.preventDefault();  // block close
    this.showUnsavedChangesDialog();
  }
});
```

### Multi-step / wizard

```html
<vi-modal #wizardModal size="xl" [persistent]="wizardStep < lastStep">
  <div slot="header">
    <span>Enrol Subject — Step {{wizardStep}} of {{lastStep}}</span>
    <vi-progress-bar [value]="wizardStep / lastStep"></vi-progress-bar>
  </div>

  @switch (wizardStep) {
    @case (1) { <app-demographics-step></app-demographics-step> }
    @case (2) { <app-eligibility-step></app-eligibility-step> }
    @case (3) { <app-consent-step></app-consent-step> }
  }

  <div slot="footer">
    <vi-button variant="ghost" (click)="prevStep()">Back</vi-button>
    <vi-button variant="primary" (click)="nextStep()">
      {{wizardStep < lastStep ? 'Next' : 'Submit'}}
    </vi-button>
  </div>
</vi-modal>
```

---

## Implementation Notes

- Uses native `<dialog>` element. `dialog.showModal()` is called when `open` changes to `true`; `dialog.close()` when `false`. No polyfill needed (all modern browsers, 2022+).
- Backdrop is `::backdrop` pseudo-element styled via CSS — not a separate `<div>`.
- `scrollable` is implemented by setting `overflow-y: auto` on the body slot wrapper and `overflow: hidden` on the dialog itself (header/footer stay fixed).
- For the drawer variant, `dialog` uses `position: fixed; inset: 0 0 0 auto; width: var(--vi-modal-drawer-width); border-radius: 0; animation: vi-modal-drawer-enter`.
- `vialiq-request-close` is fired before any close action. The handler calls `e.preventDefault()` to cancel. After a tick (rAF), if not prevented, `close()` proceeds.

---

## i18n — Internal Labels

All internal text uses `translateDirective`. See [I18N.md](../I18N.md) for setup.

| Key | Default (en) |
|-----|-------------|
| `modal.close` | `"Close"` |
| `modal.closeDialog` | `"Close dialog"` |

---

## Related Components

- [`vi-alert`](./vi-alert.md) — inline non-blocking status message
- [`vi-toast`](./vi-toast.md) — ephemeral floating notifications
- [`vi-tabs`](./vi-tabs.md) — tabs within a modal for multi-section forms
- [`vi-signature`](./vi-signature.md) — e-signature capture inside a modal
- [`vi-accordion`](./vi-accordion.md) — collapsible sections within modal body
