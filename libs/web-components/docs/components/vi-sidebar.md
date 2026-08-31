# Sidebar Components (`vi-sidebar-container` & `vi-sidebar`)

**Status:** Planned  
**Package:** `@vialiq/web-components`  
**Purpose:** Replaces `ng-sidebar` with modern, native Lit web components, providing full parity with its features.

## 1. Architecture overview
To support advanced modes like `push` (which squishes content) and `slide` (which moves the entire page), the architecture requires a parent container that coordinates the layout between the sidebar and the main content.

```html
<vi-sidebar-container>
  <!-- Sidebar definition -->
  <vi-sidebar slot="sidebar" opened mode="push" position="left">
    <nav>Sidebar Navigation</nav>
  </vi-sidebar>

  <!-- Main page content -->
  <div slot="content">
    <main>Main Content</main>
  </div>
</vi-sidebar-container>
```

## 2. Component API: `<vi-sidebar-container>`

The wrapper component that coordinates the sidebar layout and the main content.

### Properties / Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `show-backdrop` | `boolean` | `false` | Shows a backdrop overlaying the main content. |
| `animate` | `boolean` | `true` | Enables sliding animations for container content (used in push/slide modes). |
| `allow-sidebar-backdrop-control` | `boolean` | `true` | Allows the child `vi-sidebar` to control the container's backdrop state. |

### Events
| Event | Detail | Description |
|---|---|---|
| `vi-backdrop-click` | `{}` | Emitted when the backdrop is clicked. |
| `vi-show-backdrop-change` | `{ showBackdrop: boolean }` | Emitted when the backdrop state changes. |

### Slots
- `sidebar`: The slot for `<vi-sidebar>` elements.
- `content`: The slot for the main page content.

---

## 3. Component API: `<vi-sidebar>`

The sidebar panel itself.

### Properties / Attributes

| Name | Type | Default | Description |
|---|---|---|---|
| `opened` | `boolean` | `false` | Controls whether the sidebar is currently open. |
| `mode` | `string` | `'over'` | Layout mode: `'over'` (default), `'push'`, or `'slide'`. |
| `position` | `string` | `'start'` | Docking position: `'left'`, `'right'`, `'top'`, `'bottom'`, `'start'`, `'end'`. |
| `dock` | `boolean` | `false` | Shows the sidebar in a minimized "docked" state when `opened` is false. |
| `docked-size` | `string` | `'0px'` | Width/Height of the docked sidebar when closed (e.g., `'50px'`). |
| `auto-collapse-width` | `number` | `undefined` | Window width (px) to automatically close the sidebar. |
| `auto-collapse-height` | `number` | `undefined` | Window height (px) to automatically close the sidebar. |
| `animate` | `boolean` | `true` | Animates the open/close state. |
| `trap-focus` | `boolean` | `false` | Traps keyboard focus within the sidebar when open. |
| `auto-focus` | `boolean` | `true` | Automatically focuses the first focusable element when opened. |
| `show-backdrop` | `boolean` | `false` | Shows the backdrop when opened (if container allows). |
| `close-on-click-backdrop` | `boolean` | `false` | Closes the sidebar when the backdrop is clicked. |
| `close-on-click-outside` | `boolean` | `false` | Closes the sidebar when clicking outside of it (but not on backdrop). |
| `key-close` | `boolean` | `false` | Closes the sidebar when `Escape` is pressed. |

### Methods
- `open()`: Programmatically opens the sidebar.
- `close()`: Programmatically closes the sidebar.

### Events
| Event | Detail | Description |
|---|---|---|
| `vi-opened-change` | `{ opened: boolean }` | Emitted when the `opened` state changes. |
| `vi-open-start` | `{}` | Emitted when the opening animation starts. |
| `vi-opened` | `{}` | Emitted when the opening animation completes. |
| `vi-close-start` | `{}` | Emitted when the closing animation starts. |
| `vi-closed` | `{}` | Emitted when the closing animation completes. |
| `vi-mode-change` | `{ mode: string }` | Emitted when the `mode` property changes. |
| `vi-position-change` | `{ position: string }` | Emitted when the `position` property changes. |

### Slots
- `default`: The content of the sidebar. Note: docked mode content is just the regular content; it is simply clipped via CSS using the `docked-size` dimension.

### CSS Custom Properties & Parts
- **Parts:** `base` (the sidebar panel itself).
- **Custom Properties:** 
  - `--vi-sidebar-width`: Controls the width of vertical sidebars (default: `250px`).
  - `--vi-sidebar-height`: Controls the height of horizontal sidebars (default: `250px`).
  - `--vi-sidebar-bg`: Background color of the sidebar (default: `var(--color-surface)`).
  - `--vi-sidebar-z-index`: Z-index of the sidebar (default: `9999`).

## 4. Layout Modes Explained

1. **`over`**: The sidebar slides in over the top of the main page content. The main content remains fixed in place.
2. **`push`**: The sidebar slides in and "pushes" the main page content, causing it to shrink in width/height to make room.
3. **`slide`**: The sidebar slides in and pushes the entire page content off-canvas without shrinking it.

## 5. Accessibility (a11y)
- Uses `role="dialog"` or `role="complementary"` based on the mode and purpose.
- When `trap-focus` is enabled, the main content is typically hidden from screen readers using `aria-hidden="true"`.
- Implements keyboard navigation (`Escape` to close).
- Respects OS-level `prefers-reduced-motion` settings for all animations.
