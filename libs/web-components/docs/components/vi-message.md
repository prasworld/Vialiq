# `vi-message` — Global Message Feedback

**Package:** `@vialiq/web-components/message`  
**Elements:** `ViMessageService` (API), `<vi-message>` (Internal Element)  
**Status:** 🔲 Planned
**Inspiration:** Ant Design `Message`

---

## Purpose

A lightweight, ephemeral global feedback message used to indicate the result of a user action without interrupting their workflow. 

**Message vs. Notification (Toast):**
- **Message** is simple: just an icon and a short line of text (no title, usually no actions, no close button). It appears at the top center of the screen by default.
- **Notification/Toast** is complex: has a title, body, can have actions, often appears in corners.

**Use cases:**
- "Item copied to clipboard"
- "Settings updated successfully"
- "Failed to save, please try again"

---

## Programmatic API (`ViMessageService`)

The component is primarily used via a JavaScript/TypeScript API rather than HTML tags, making it easy to call from anywhere.

```typescript
import { ViMessageService } from '@vialiq/web-components/message';

// Basic usage
ViMessageService.info('This is a normal message');
ViMessageService.success('Profile updated successfully');
ViMessageService.error('Failed to load data');
ViMessageService.warning('Your session will expire soon');
ViMessageService.loading('Action in progress...');

// Advanced configuration
ViMessageService.show({
  variant: 'success',
  content: 'Profile updated successfully',
  duration: 3000,
  icon: 'custom-check-icon' // override default icon
});
```

### Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `content` | `string` | — | The message text to display. |
| `variant` | `'info' \| 'success' \| 'error' \| 'warning' \| 'loading'` | `'info'` | Determines the icon and color styling. |
| `duration` | `number` | `3000` | Auto-dismiss time in ms. `0` means it will not auto-dismiss (requires programmatic closing). |
| `icon` | `string` | — | Optional custom icon name to override the variant's default icon. |

---

## UI / CSS Details

### Structure
A message typically consists of a small, pill-shaped or softly rounded rectangular container with a drop shadow, an icon on the left, and text on the right.

### Animations
- **Enter:** Slide down from the top and fade in.
- **Exit:** Fade out and slide up.
- **Stacking:** If multiple messages are triggered, they should stack vertically with a smooth translation animation.

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--vi-message-bg` | `var(--vi-color-background)` | Background color of the message box |
| `--vi-message-border-radius` | `8px` | Corner radius |
| `--vi-message-shadow` | `var(--vi-shadow-md)` | Drop shadow |
| `--vi-message-padding` | `9px 16px` | Inner padding |
| `--vi-message-top` | `24px` | Distance from the top of the viewport |
| `--vi-message-z-index` | `1010` | Ensure it's above modals and drawers |

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Live region | Rendered inside a container with `role="status"` and `aria-live="polite"`. |
| Focus | Does not steal focus. |

