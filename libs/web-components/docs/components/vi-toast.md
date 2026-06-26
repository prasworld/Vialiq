# `vi-toast` — Toast Notification

**Package:** `@vialiq/web-components/toast`  
**Elements:** `<vi-toast>`, `ViToastService`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_toast.scss`

---

## Purpose

Ephemeral floating notifications that appear in response to user actions or system events. Toasts are:

- **Non-blocking** — appear in a corner, never interrupt workflow
- **Auto-dismissing** — disappear after a configurable duration
- **Stackable** — multiple toasts queue vertically
- **Action-capable** — optional one-click action (e.g. "Undo", "View")

**Toast vs. Alert vs. Notification:**

| | `vi-toast` | `vi-alert` | `vi-notification` |
|-|-----------|-----------|------------------|
| Persistence | Temporary (auto-dismiss) | Permanent (inline) | Permanent (notification centre) |
| Position | Floating portal | Inline in layout | Notification bell panel |
| User triggers | No | No | No |
| Interrupts flow | No | No | No |
| Survives navigation | No | No | Yes |
| Use for | Action feedback | Page-level warnings | Async events (queries, emails) |

**Clinical EDC use cases:**
- "Form saved successfully" — after auto-save
- "Query assigned to you" — background notification
- "Session expiring in 5 minutes" — warning (sticky)
- "Record locked" — after PI sign-off
- "Upload failed" — error with retry action

---

## `vi-toast` Element API

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `variant` | `variant` | `ToastVariant` | `'info'` | ✅ | Colour and icon |
| `title` | `title` | `string` | `''` | — | Bold headline text |
| `message` | `message` | `string` | `''` | — | Body message text |
| `duration` | `duration` | `number` | `4000` | — | Auto-dismiss ms; `0` = sticky |
| `closable` | `closable` | `boolean` | `true` | ✅ | Show close (×) button |
| `showProgress` | `show-progress` | `boolean` | `true` | — | Progress bar shows remaining time |

```typescript
type ToastVariant = 'info' | 'success' | 'warning' | 'danger';
```

### Slots

| Slot | Description |
|------|-------------|
| `icon` | Override the default status icon |
| `actions` | Action buttons or links (e.g. "Undo", "View") |

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-close` | `CustomEvent<{reason: 'auto' \| 'user'}>` | ✅ | Toast is dismissed |
| `vialiq-action` | `CustomEvent<{action: string}>` | ✅ | Action button clicked |

### CSS Parts

| Part | Element |
|------|---------|
| `toast` | Root toast container |
| `icon` | Status icon wrapper |
| `content` | Title + message column |
| `title` | Title `<span>` |
| `message` | Message `<span>` |
| `actions` | Action slot wrapper |
| `close-btn` | Close button |
| `progress` | Progress bar track |
| `progress-bar` | Animated progress bar fill |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-toast-width` | `360px` | Toast width |
| `--vi-toast-border-radius` | `6px` | Corner radius |
| `--vi-toast-shadow` | `var(--vi-shadow-xl)` | Drop shadow |
| `--vi-toast-padding` | `12px 16px` | Inner padding |
| `--vi-toast-gap` | `12px` | Gap: icon → content → close |
| `--vi-toast-z-index` | `10000` | Stack order |
| `--vi-toast-progress-height` | `3px` | Progress bar thickness |
| `--vi-toast-slide-distance` | `24px` | Slide-in distance |

Variant-specific background/border (example):

| Variant | Background | Border-left | Icon |
|---------|-----------|-------------|------|
| `info` | white | `--vi-color-primary` | `info` |
| `success` | white | `--vi-color-success` | `check-circle` |
| `warning` | white | `--vi-color-warning` | `alert-circle` |
| `danger` | white | `--vi-color-error` | `x-circle` |

---

## `ViToastService` — Programmatic API

The service manages the global toast portal (a `<vi-toast-container>` mounted at `document.body`):

```typescript
import { ViToastService } from '@vialiq/web-components/toast';

// Basic usage
ViToastService.show({
  variant: 'success',
  title: 'Form saved',
  message: 'Draft saved at 14:32',
  duration: 3000,
});

// With action
ViToastService.show({
  variant: 'danger',
  title: 'Upload failed',
  message: 'The file could not be uploaded.',
  duration: 0,  // sticky
  actions: [{ label: 'Retry', action: 'retry' }],
  onAction: (action) => retryUpload(),
  onClose: (reason) => console.log('closed:', reason),
});

// Dismiss all
ViToastService.dismissAll();

// Configure defaults globally (call once at app bootstrap)
ViToastService.configure({
  position: 'top-right',       // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
  maxVisible: 5,               // max toasts visible at once
  defaultDuration: 4000,
  animationDuration: 250,
});
```

### Service Options

```typescript
interface ToastOptions {
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;           // ms; 0 = sticky
  closable?: boolean;
  showProgress?: boolean;
  actions?: ToastAction[];
  onClose?: (reason: 'auto' | 'user') => void;
  onAction?: (action: string) => void;
  id?: string;                 // optional id for programmatic dismiss
}

interface ToastAction {
  label: string;
  action: string;              // emitted in vialiq-action event detail
  variant?: 'primary' | 'ghost';  // button variant
}

interface ToastServiceConfig {
  position: ToastPosition;
  maxVisible: number;
  defaultDuration: number;
  animationDuration: number;
}

type ToastPosition =
  | 'top-right' | 'top-left' | 'top-center'
  | 'bottom-right' | 'bottom-left' | 'bottom-center';
```

---

## Stack Behaviour

- Newest toast appears at the **top** of the stack (top-right position); at **bottom** for bottom positions
- When `maxVisible` is exceeded, the oldest toast collapses with a fade-out animation; queue resumes as others dismiss
- Hovering any toast **pauses all timers** — resumes when mouse leaves the stack area
- Progress bar reflects remaining time; pauses on hover

---

## Animation

```scss
// Enter: slide in from the right (top-right position)
@keyframes vi-toast-enter {
  from {
    opacity: 0;
    transform: translateX(var(--vi-toast-slide-distance, 24px));
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Exit: fade + slide back out
@keyframes vi-toast-exit {
  from {
    opacity: 1;
    transform: translateX(0);
    max-height: 200px;
    margin-bottom: 8px;
  }
  to {
    opacity: 0;
    transform: translateX(var(--vi-toast-slide-distance, 24px));
    max-height: 0;
    margin-bottom: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .toast { animation: none; }
}
```

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Live region | `role="status"` (info/success — polite) / `role="alert"` (warning/danger — assertive) |
| Atomic | `aria-atomic="true"` — entire toast read as a unit |
| Close button | `aria-label="Dismiss notification"` |
| Progress bar | `aria-hidden="true"` (visual only; timer expiry is communicated by the toast disappearing) |
| Hover pause | Timer pauses on hover; no `aria-live` update needed |
| Focus management | Toasts do NOT steal focus; keyboard users can reach them via `Tab` (they are in DOM) |

---

## Keyboard Interactions

| Key | Behaviour |
|-----|-----------|
| `Tab` | Focus moves into the toast stack (toast container is in tab order) |
| `Escape` | Dismiss the currently focused toast |
| `Tab` / `Shift+Tab` | Navigate between close button and action buttons within a toast |

---

## Usage Examples

### After form save (auto-dismiss)

```typescript
onSaveSuccess() {
  ViToastService.show({
    variant: 'success',
    title: 'Draft saved',
    message: `Saved at ${new Date().toLocaleTimeString()}`,
    duration: 3000,
  });
}
```

### Sticky warning

```typescript
ViToastService.show({
  variant: 'warning',
  title: 'Session expiring',
  message: 'You will be logged out in 5 minutes.',
  duration: 0,
  closable: true,
  actions: [{ label: 'Extend session', action: 'extend' }],
  onAction: () => this.authService.refreshSession(),
});
```

### Error with retry

```typescript
ViToastService.show({
  variant: 'danger',
  title: 'Sync failed',
  message: 'Could not sync data. Check your connection.',
  duration: 0,
  actions: [{ label: 'Retry', action: 'retry' }],
  onAction: () => this.sync(),
  onClose: (reason) => {
    if (reason === 'user') this.markSyncDismissed();
  },
});
```

### Manual `<vi-toast>` element (rare — prefer service)

```html
<vi-toast
  variant="info"
  title="Tip"
  message="You can use keyboard shortcut Ctrl+S to save."
  duration="5000"
  show-progress
>
  <vi-button slot="actions" variant="ghost" size="sm">Got it</vi-button>
</vi-toast>
```

### Angular service integration

```typescript
@Injectable({ providedIn: 'root' })
export class AppToastService {
  success(message: string, title = 'Success') {
    ViToastService.show({ variant: 'success', title, message, duration: 3000 });
  }
  error(message: string, title = 'Error') {
    ViToastService.show({ variant: 'danger', title, message, duration: 0, closable: true });
  }
  warning(message: string) {
    ViToastService.show({ variant: 'warning', message, duration: 5000 });
  }
}
```

---

## Implementation Notes

- The `ViToastService` lazily creates a `<vi-toast-container>` custom element and appends it to `document.body` on first call.
- `vi-toast-container` is a Lit component that renders the positioned stack and manages the queue.
- Timer uses `setTimeout`; hover detection uses `mouseenter`/`mouseleave` on the container (not each toast) to handle inter-toast mouse movement smoothly.
- Each toast has a unique `id` (UUID). `dismissAll()` and `dismiss(id)` are supported.
- The progress bar is CSS `animation` with `animation-play-state: paused` on hover — no JS tick loop.

---

## i18n — Internal Labels

All internal text uses `translateDirective`. See [I18N.md](../I18N.md) for setup.

| Key | Default (en) |
|-----|-------------|
| `toast.dismiss` | `"Dismiss notification"` |

---

## Related Components

- [`vi-alert`](./vi-alert.md) — persistent inline status message
- [`vi-notification`](./vi-notification.md) — permanent notification centre entries
- [`vi-spinner`](./vi-spinner.md) — loading indicator
