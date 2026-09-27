---
description: Custom events emitted by web components MUST follow the vi-component-type-event convention.
---

# Web Component Event Naming Convention

When defining custom events within `@vialiq/web-components` (or any other web component in the repository), you MUST strictly follow the `vi-[component-type]-[event-name]` convention for clarity and conflict prevention.

**Do NOT use generic prefixes like `vialiq-` for event names.**

### Rule
All events emitted by a component should be prefixed with the component's name.

**Examples:**
- `vi-toast`: Should emit `vi-toast-close`, `vi-toast-action` (NOT `vialiq-close`)
- `vi-message`: Should emit `vi-message-close`
- `vi-modal`: Should emit `vi-modal-open`, `vi-modal-close`
- `vi-date-picker`: Should emit `vi-date-picker-change`

### Code Example
```typescript
private handleDismiss(reason: 'auto' | 'user' = 'user') {
  this.dispatchEvent(
    new CustomEvent('vi-toast-close', { // Correct: prefixed with component type
      bubbles: true,
      composed: true,
      detail: { reason, id: this.id },
    })
  );
}
```
