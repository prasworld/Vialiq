# `vi-popconfirm` — Popconfirm

**Package:** `@vialiq/web-components/popconfirm`  
**Element:** `<vi-popconfirm>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_popconfirm.scss` (To be created)

---

## Purpose

A simple and compact confirmation dialog that hovers over the trigger element. It is used to ask the user for confirmation before executing an action.

**Popconfirm vs. Modal:**
- **Modal:** Screen-blocking, used for heavy interactions or forms that require the user's undivided attention.
- **Popconfirm:** Lightweight, contextual, non-blocking. Excellent for quick actions like "Delete row" in a data table where opening a full modal would be visually disruptive.

**Architecture Note:**  
`vi-popconfirm` is a higher-order component that internally composes `<vi-popover>` and `<vi-button>`. It manages the popover's open state and wires up the confirmation buttons automatically.

---

## Public API

### Properties / Attributes

Following the TC39 Decorator pattern:

| Property | Attribute | Type | Default | Reflects | Description |
|----------|-----------|------|---------|---------|-------------|
| `title` | `title` | `string` | `''` | — | Main confirmation text (e.g. "Delete this task?") |
| `description` | `description` | `string` | `''` | — | Optional secondary text |
| `icon` | `icon` | `string` | `'warning'` | — | Icon name displayed next to the title |
| `okText` | `ok-text` | `string` | `'OK'` | — | Text for the confirmation button |
| `cancelText` | `cancel-text` | `string` | `'Cancel'` | — | Text for the cancellation button |
| `okVariant` | `ok-variant` | `ViVariant` | `'primary'` | — | Variant for the OK button (often `'danger'`) |
| `cancelVariant` | `cancel-variant` | `ViVariant`| `'default'` | — | Variant for the Cancel button |
| `placement` | `placement` | `Placement` | `'top'` | ✅ | Preferred position |
| `disabled` | `disabled` | `boolean` | `false` | ✅ | Disables the popconfirm from opening |

---

### Slots

| Slot | Description |
|------|-------------|
| *(default)* | The trigger element (e.g., a button or link) |
| `title` | Rich HTML title (overrides `title` property) |
| `description`| Rich HTML description (overrides `description` property) |
| `icon` | Custom icon element (overrides `icon` property) |

---

### Events

| Event | Type | Bubbles | Fires when |
|-------|------|---------|-----------|
| `vi-popconfirm-confirm` | `CustomEvent` | ✅ | The user clicks the OK button |
| `vi-popconfirm-cancel` | `CustomEvent` | ✅ | The user clicks the Cancel button |

---

### CSS Parts

Because `vi-popconfirm` composes `vi-popover`, we will forward parts so they remain stylable:

| Part | Element |
|------|---------|
| `popover` | The inner floating panel |
| `body` | The body containing the icon and text |
| `footer` | The button container area |

---

## Accessibility

- The underlying popover receives `role="dialog"`.
- Focus is trapped within the popconfirm buttons when open.
- The trigger button has `aria-haspopup="dialog"`.
- Pressing `Escape` closes the popconfirm and fires `vi-popconfirm-cancel`.

---

## Usage Examples

### Basic Delete Action

```html
<vi-popconfirm 
  title="Are you sure delete this task?" 
  ok-text="Yes" 
  cancel-text="No" 
  ok-variant="danger"
>
  <vi-button variant="danger" variant="ghost">Delete</vi-button>
</vi-popconfirm>
```

```javascript
document.querySelector('vi-popconfirm').addEventListener('vi-popconfirm-confirm', () => {
  // Execute delete logic
});
```

### With Additional Description

```html
<vi-popconfirm 
  title="Revoke access?" 
  description="This user will immediately lose access to all projects."
  icon="alert-circle"
  ok-text="Revoke"
>
  <vi-button>Revoke User</vi-button>
</vi-popconfirm>
```

---

## Implementation Notes

- Since this component relies on composition, the Shadow DOM will look roughly like this:
  ```html
  <vi-popover placement="${this.placement}">
    <slot></slot> <!-- The trigger -->
    
    <div slot="content" class="popconfirm-content">
      <div class="body">
        <vi-icon name="${this.icon}"></vi-icon>
        <div class="text">
          <div class="title">${this.title}</div>
          <div class="description">${this.description}</div>
        </div>
      </div>
      <div class="footer">
        <vi-button size="sm" @click="${this.cancel}">${this.cancelText}</vi-button>
        <vi-button size="sm" variant="${this.okVariant}" @click="${this.confirm}">${this.okText}</vi-button>
      </div>
    </div>
  </vi-popover>
  ```
- The `<vi-popconfirm>` must act as a controller, listening to the buttons and forcefully closing the `<vi-popover>` by modifying its `open` state, while dispatching the appropriate events up to the consumer.

---

## Related Components

- [`vi-popover`](./vi-popover.md) — the base component that powers `vi-popconfirm`.
- [`vi-modal`](./vi-modal.md) — for larger, blocking confirmation dialogs.
