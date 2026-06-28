# `vi-notification` / `vi-notification-center` — Notification System

**Package:** `@vialiq/web-components/notification`  
**Elements:** `<vi-notification>`, `<vi-notification-center>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_notification.scss`

---

## Purpose

A persistent notification system with a bell-triggered panel. Unlike `vi-toast` (ephemeral), notifications:

- **Persist** across page navigation
- Are stored in a list (notification centre panel)
- Have read/unread state
- Can be acted upon later

**Clinical EDC use cases:**
- New query assigned to investigator
- Form ready for data review
- Data review comments from monitor
- Subject visit window approaching
- Protocol deviation requires acknowledgement
- System maintenance announcement

---

## Component Overview

```
vi-notification-center       (bell icon + panel)
└── vi-notification × N      (individual notification cards)
```

---

## `vi-notification` — Single Notification Card

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `variant` | `variant` | `NotificationVariant` | `'info'` | ✅ | Colour and icon |
| `title` | `title` | `string` | `''` | — | Notification headline |
| `message` | `message` | `string` | `''` | — | Body text |
| `timestamp` | `timestamp` | `string` | `''` | — | ISO 8601 datetime; displayed as relative time |
| `read` | `read` | `boolean` | `false` | ✅ | Read state (blue dot when unread) |
| `dismissible` | `dismissible` | `boolean` | `true` | — | Show × dismiss button |

```typescript
type NotificationVariant = 'info' | 'success' | 'warning' | 'danger' | 'query' | 'system';
```

Additional variants:
- `query` — orange, query/comment icon — EDC query workflow
- `system` — grey, settings/gear icon — maintenance, release notes

### Slots

| Slot | Description |
|------|-------------|
| `actions` | Action buttons/links (e.g. "View Query", "Go to Form") |
| `metadata` | Secondary info below message (form name, subject ID, site) |

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-read` | `CustomEvent<void>` | ✅ | Notification clicked / marked read |
| `vialiq-dismiss` | `CustomEvent<void>` | ✅ | × dismiss clicked |
| `vialiq-action` | `CustomEvent<{action: string}>` | ✅ | Action button clicked |

### CSS Parts

| Part | Element |
|------|---------|
| `notification` | Root card |
| `unread-dot` | Blue indicator dot |
| `icon` | Variant status icon |
| `content` | Title + message + metadata column |
| `title` | Title span |
| `message` | Message span |
| `timestamp` | Relative time span |
| `actions` | Action slot wrapper |
| `dismiss-btn` | × button |

---

## `vi-notification-center` — Bell + Panel

### Properties / Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `count` | `count` | `number` | `0` | ✅ | Unread count (badge on bell) |
| `open` | `open` | `boolean` | `false` | ✅ | Panel open state |
| `placement` | `placement` | `PanelPlacement` | `'right'` | ✅ | Panel side |
| `panelTitle` | `panel-title` | `string` | `'Notifications'` | — | Panel header text |
| `emptyMessage` | `empty-message` | `string` | `'No notifications'` | — | Empty state text |

```typescript
type PanelPlacement = 'right' | 'left';
```

### Slots

| Slot | Description |
|------|-------------|
| `trigger` | Custom trigger element (default: bell icon button) |
| *(default)* | `vi-notification` items |
| `header-actions` | Actions in panel header (e.g. "Mark all read") |
| `footer` | Panel footer content |
| `empty` | Custom empty state |

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vialiq-open` | `CustomEvent<void>` | ✅ | Panel opens |
| `vialiq-close` | `CustomEvent<void>` | ✅ | Panel closes |
| `vialiq-clear-all` | `CustomEvent<void>` | ✅ | "Clear all" clicked |
| `vialiq-mark-all-read` | `CustomEvent<void>` | ✅ | "Mark all read" clicked |

### CSS Parts

| Part | Element |
|------|---------|
| `trigger` | Bell icon button (default trigger) |
| `badge` | Unread count badge |
| `panel` | Sliding notification panel |
| `panel-header` | Panel title + actions row |
| `panel-title` | Title text |
| `panel-body` | Scrollable notification list |
| `panel-footer` | Footer area |
| `empty` | Empty state |
| `overlay` | Backdrop (optional) |

### CSS Custom Properties

```css
/* vi-notification */
--vi-notification-border-radius: 6px;
--vi-notification-padding: 12px 16px;
--vi-notification-border-color: var(--vi-color-grey-200);
--vi-notification-unread-dot-size: 8px;
--vi-notification-unread-dot-color: var(--vi-color-primary);
--vi-notification-unread-bg: var(--vi-color-blue-50);
--vi-notification-read-bg: var(--vi-color-background);
--vi-notification-hover-bg: var(--vi-color-grey-50);

/* vi-notification-center panel */
--vi-notification-panel-width: 380px;
--vi-notification-panel-max-height: 600px;
--vi-notification-panel-shadow: var(--vi-shadow-2xl);
--vi-notification-panel-bg: var(--vi-color-background);
--vi-notification-panel-z-index: 9000;
--vi-notification-badge-color: var(--vi-color-error);
```

---

## Panel Structure

```html
<!-- vi-notification-center shadow DOM -->
<div class="notification-center">

  <!-- Bell trigger (default) -->
  <slot name="trigger">
    <vi-button icon-only variant="ghost" aria-label="Notifications" aria-haspopup="dialog"
      aria-expanded=${this.open} @click=${this._togglePanel}>
      <vi-icon slot="icon" name="bell" size="20"></vi-icon>
      <!-- Unread badge -->
      <vi-badge part="badge" variant="danger" count=${this.count}
        ?hidden=${this.count === 0}></vi-badge>
    </vi-button>
  </slot>

  <!-- Sliding panel -->
  <div part="panel" class="notification-panel" role="dialog"
    aria-label=${this.panelTitle}
    aria-modal="false"
    ?hidden=${!this.open}
    data-placement=${this.placement}
  >
    <!-- Panel header -->
    <header part="panel-header" class="notification-panel-header">
      <span part="panel-title" class="notification-panel-title">${this.panelTitle}</span>
      <div class="notification-panel-actions">
        <slot name="header-actions">
          <vi-button variant="ghost" size="sm" @click=${this._markAllRead}>
            Mark all read
          </vi-button>
          <vi-button variant="ghost" size="sm" @click=${this._clearAll}>
            Clear all
          </vi-button>
        </slot>
        <vi-button icon-only variant="ghost" size="sm" aria-label="Close notifications"
          @click=${this._closePanel}>
          <vi-icon slot="icon" name="x" size="16"></vi-icon>
        </vi-button>
      </div>
    </header>

    <!-- Notification list -->
    <div part="panel-body" class="notification-panel-body" role="list">
      <slot></slot>  <!-- vi-notification items -->

      <!-- Empty state -->
      <div part="empty" class="notification-empty" ?hidden=${this.count > 0}>
        <slot name="empty">
          <vi-icon name="bell-off" size="32" style="color: var(--vi-color-grey-300)"></vi-icon>
          <p>${this.emptyMessage}</p>
        </slot>
      </div>
    </div>

    <footer part="panel-footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</div>
```

---

## Panel Open/Close Behaviour

The panel uses a **non-modal** approach (not a dialog, no focus trap) because:
1. Users may want to click on page content while keeping the panel open
2. Notifications are supplementary — they don't block primary workflow
3. The panel auto-closes when user clicks outside it

Click-outside detection uses the `Handle` pattern with `document` `click` event.

If a notification action requires the user's full attention (e.g. "Review query"), the action opens a proper `vi-modal` after closing the panel.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Bell button | `aria-label="Notifications"` + `aria-haspopup="dialog"` + `aria-expanded` |
| Unread count | Bell button `aria-label="Notifications, 5 unread"` when count > 0 |
| Panel role | `role="dialog"` + `aria-label="Notifications"` |
| Panel focus | Focus moves to panel title or first notification on open |
| Notification role | `role="listitem"` on each notification |
| Unread dot | `aria-label="Unread"` or communicated via notification title prefix |
| Dismiss | `aria-label="Dismiss: {title}"` on × button |
| Timestamp | `<time datetime="ISO-value">` element with relative display |
| Close | `Escape` closes panel; focus returns to bell button |

---

## Timestamp Display

`timestamp` is ISO 8601. Displayed as relative human time using `Intl.RelativeTimeFormat`:

| Age | Display |
|-----|---------|
| < 1 minute | "Just now" |
| < 60 minutes | "12 minutes ago" |
| < 24 hours | "3 hours ago" |
| < 7 days | "Monday" (day name) |
| Older | "15 Jan 2026" |

---

## Keyboard Interactions

| Key | Context | Behaviour |
|-----|---------|-----------|
| `Tab` | Bell focused | Move to bell button |
| `Enter` / `Space` | Bell button | Toggle panel |
| `Escape` | Panel open | Close panel; return focus to bell |
| `Tab` | Inside panel | Navigate through notifications and action buttons |

---

## Usage Examples

### Basic setup

```html
<vi-notification-center [count]="unreadCount" [open]="panelOpen"
  (vialiq-open)="panelOpen = true"
  (vialiq-close)="panelOpen = false"
  (vialiq-mark-all-read)="markAllRead()"
>
  @for (n of notifications; track n.id) {
    <vi-notification
      [variant]="n.variant"
      [title]="n.title"
      [message]="n.message"
      [timestamp]="n.createdAt"
      [read]="n.read"
      (vialiq-read)="markRead(n.id)"
      (vialiq-dismiss)="dismiss(n.id)"
    >
      <vi-button slot="actions" variant="ghost" size="sm"
        (click)="navigate(n.link)">
        View
      </vi-button>
    </vi-notification>
  }
</vi-notification-center>
```

### Query notification (EDC-specific)

```html
<vi-notification
  variant="query"
  title="New query on Visit 2 — Weight"
  message="Monitor: 'Please verify this value against source documents.'"
  timestamp="2026-06-01T09:23:00Z"
>
  <span slot="metadata">
    Subject SUB-0042 · Site 001 · TRIAL-PRIME
  </span>
  <vi-button slot="actions" variant="primary" size="sm">
    <vi-icon slot="icon" name="message-circle" size="14"></vi-icon>
    View Query
  </vi-button>
</vi-notification>
```

### System announcement

```html
<vi-notification
  variant="system"
  title="Scheduled maintenance"
  message="The system will be unavailable 01:00–03:00 UTC on 5 June 2026."
  timestamp="2026-06-01T08:00:00Z"
  :dismissible="false"
>
</vi-notification>
```

---

## Data Management

`vi-notification-center` does **not** store notifications internally — the host app owns the data:

```typescript
// Angular signal-based store
notifications = signal<NotificationModel[]>([]);
unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

markRead(id: string) {
  this.notificationService.markRead(id);  // API call
  this.notifications.update(ns =>
    ns.map(n => n.id === id ? { ...n, read: true } : n)
  );
}
```

For real-time delivery, integrate with WebSocket or Server-Sent Events in the application layer — this component handles only the UI.

---

## Related Components

- [`vi-toast`](./vi-toast.md) — ephemeral, auto-dismiss notifications
- [`vi-alert`](./vi-alert.md) — inline page-level persistent messages
- [`vi-badge`](./vi-badge.md) — unread count badge
- [`vi-modal`](./vi-modal.md) — for notification actions requiring focus
