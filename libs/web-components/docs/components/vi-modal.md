# `vi-modal` — Modal Dialog

**Package:** `@vialiq/web-components/modal`  
**Element:** `<vi-modal>`  
**Status:** ✅ Developed  
**Flux UI base:** `libs/flux-ui/components/_modal.scss`  
**Mixins:** `FocusTrapMixin`, `DraggableMixin`

---

## Purpose

A focus-trapping dialog that blocks interaction with the page behind it. Built using the native `<dialog>` element for accessibility semantics, but managed manually via an `OverlayManager` to support robust, deterministic stacking of infinite modals and tooltips.

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

### `<vi-modal>`
| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `open` | `open` | `boolean` | `false` | ✅ | Controls visibility |
| `variant` | `variant` | `ModalVariant` | `'default'` | ✅ | Layout variant |
| `size` | `size` | `ModalSize` | `'md'` | ✅ | Dialog dimensions |
| `position` | `position` | `ModalPosition` | `'center'` | ✅ | Dialog position |
| `draggable` | `draggable` | `boolean` | `false` | ✅ | Allows the modal to be dragged |
| `persistent` | `persistent` | `boolean` | `false` | — | Prevent close on `Escape` and backdrop click |
| `autofocus` | `autofocus` | `boolean` | `true` | — | Focus first element on open |
| `scrollable` | `scrollable` | `boolean` | `true` | — | Body scrolls; header/footer stay fixed |
| `drawerPlacement` | `drawer-placement` | `DrawerPlacement` | `'right'` | — | Side for drawer variant |
| `returnFocusSelector` | — | `string \| HTMLElement` | — | — | Element to return focus to on close |

### `<vi-modal-header>`
| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `title` | `title` | `string` | `''` | — | Header title text |
| `description` | `description` | `string` | `''` | — | Header description text |
| `closable` | `closable` | `boolean` | `false` | — | Show × button in header |
| `maximizable` | `maximizable` | `boolean` | `false` | — | Show maximize button in header |
| `alertVariant` | `alert-variant` | `AlertDialogVariant` | `undefined` | — | Icon+colour for alert variant |
| `icon` | `icon` | `string` | `undefined` | — | Custom icon name for alert variant |

```typescript
type ModalVariant = 'default' | 'drawer' | 'alert';
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full-width' | 'fullscreen';
type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
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
| `full-width` | 100vw | 90vh |
| `fullscreen` | 100vw | 100vh |

**Drawer dimensions:**
- Width: `var(--vi-modal-drawer-width, 480px)`
- Height: 100vh (always full height)

---

## Slots

| Slot | Description |
|------|-------------|
| `header` | Accepts `<vi-modal-header>` component |
| *(default)* | Body content |
| `footer` | Accepts `<vi-modal-footer>` component |

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
| `backdrop` | The custom `<div class="modal-backdrop">` |
| `dialog` | The `<dialog>` element |
| `header` | Header row |
| `title` | Title text |
| `close-btn` | × close button |
| `maximize-btn` | Maximize/Restore button |
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
├── div.modal-backdrop (when open)
└── dialog[part="dialog"][open?] role="dialog" aria-modal="true" aria-labelledby="vi-modal-header-slot"
    │
    ├── slot[name="header"] id="vi-modal-header-slot"
    │
    ├── div[part="body"] .modal-body
    │   └── slot (default content)
    │
    └── slot[name="footer"]
```

---

## Focus Management

Uses `FocusTrapMixin`:

1. **On open:** `_activateFocusTrap()` is called — queries all focusable elements in shadow + slotted content, stores `document.activeElement` (using `getDeepActiveElement()` to trace into nested shadow roots), moves focus to first focusable element.
2. **While open:** `Tab` and `Shift+Tab` cycle within the modal; focus cannot escape. If multiple overlapping modals are open, the global `OverlayManager` guarantees only the topmost modal's elements are focusable by dynamically syncing the `inert` attribute on all background content.
3. **On close:** `_deactivateFocusTrap()` restores focus to the trigger element (from `returnFocusSelector` or the deeply tracked previous focus).

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
| Backdrop | Custom `div` layered immediately behind the `<dialog>` |
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
<vi-modal #aeModal size="lg" (vi-modal-close-request)="onModalClose($event.detail.reason)">
  <vi-modal-header slot="header" closable>Record Adverse Event</vi-modal-header>
  <app-ae-form [ae]="currentAe"></app-ae-form>
  <vi-modal-footer slot="footer">
    <vi-button variant="ghost" (click)="aeModal.close('button')">Cancel</vi-button>
    <vi-button variant="primary" (click)="submitAe()">Save AE</vi-button>
  </vi-modal-footer>
</vi-modal>

<vi-button (click)="aeModal.show()">Add Adverse Event</vi-button>
```

### Alert variant — destructive confirmation

```html
<vi-modal #lockModal variant="alert" size="sm" persistent>
  <vi-modal-header slot="header" alert-variant="danger" closable>Lock Data</vi-modal-header>
  <p>This action is <strong>irreversible</strong>. All forms will be locked for editing.</p>
  <p>Are you sure you want to lock this subject's data?</p>
  <vi-modal-footer slot="footer">
    <vi-button variant="ghost" (click)="lockModal.close('button')">Cancel</vi-button>
    <vi-button variant="danger" (click)="confirmLock()">Lock Data</vi-button>
  </vi-modal-footer>
</vi-modal>
```

### Drawer — query thread

```html
<vi-modal #queryDrawer variant="drawer" drawer-placement="right" size="lg">
  <vi-modal-header slot="header" closable>Query #QR-0042 — Weight</vi-modal-header>
  <app-query-thread [queryId]="selectedQueryId"></app-query-thread>
  <vi-modal-footer slot="footer">
    <vi-button variant="primary" (click)="submitResponse()">Submit Response</vi-button>
  </vi-modal-footer>
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

- **Native Dialog vs. Top Layer:** We use the native `<dialog>` element for accessibility and semantics, but we do **not** use the native `.showModal()` API. Browser implementations of the Top Layer do not allow custom `z-index` coordination with other fixed elements (like tooltips or dropdowns that are not also in the Top Layer). 
- **Teleportation & Stacking:** When `open` becomes `true`, the `<vi-modal>` DOM element detaches from its original location and teleports itself to `document.body`. This guarantees a pristine stacking context. The global `OverlayManager` singleton then assigns an escalating `z-index` to both the custom backdrop and the dialog itself, allowing for infinite modals and correctly layered popovers.
- **Draggability:** Because teleportation disconnects the component, any event listeners added during `updated` would normally be lost. `DraggableMixin` explicitly checks for reconnection in `connectedCallback` to re-attach pointer event listeners. The drag state sets a `translate3d` transform on the dialog.
- **Floating UI Compatibility:** When the modal is not actively being dragged, the `transform` property is explicitly cleared (set to `''`). This is a critical requirement for `Floating UI`, ensuring that hoisted child components (like `vi-combobox`'s `fixed` listbox) natively escape the modal's boundaries without being clipped.
- **Focus Management:** Handled by `FocusTrapMixin`, which captures focus inside the modal and restores it to the original trigger element upon closure.
- **Scroll Lock:** The `OverlayManager` automatically adds `overflow: hidden` to the body when the first modal opens and removes it when the last modal closes.
- `vialiq-request-close` is fired before any close action. The handler calls `e.preventDefault()` to cancel. If not prevented, `close()` proceeds.

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
