# `vi-animation` — Web Animation & Transition Wrapper

**Package:** `@vialiq/web-components/animation`  
**Elements:** `<vi-animation>`, `<vi-animation-group>`  
**Status:** 🔲 Planned — Phase 2  
**Flux UI base:** `libs/flux-ui/components/_animation.scss`

---

## Purpose

`<vi-animation>` is a lightweight, high-performance Lit Web Component wrapper that abstracts the complexities of the Web Animations API (WAAPI), CSS `@keyframes`, transitions, and modern CSS `@starting-style`. 

It provides a unified, declarative, and imperative API for element entry/exit, property morphing, attention-seeking motion, and cascading/staggered child animations. By managing hardware-accelerated compositor-thread execution under the hood, `<vi-animation>` isolates developers from layout thrashing, complex Promise sequencing, display toggling (`display: none` vs. animation lifecycles), and accessibility (`prefers-reduced-motion`) management.

### Key Capabilities

| Capability | Standard CSS / JS | `<vi-animation>` Wrapper |
|---|---|---|
| **Exit Animations** | Elements disappear instantly when `display: none` or `hidden` is set; requires manual `setTimeout` or `animationend` handlers. | Seamless exit phase: plays exit animation, waits for completion, then toggles `hidden`/`display: none` automatically. |
| **Cascading / Staggering** | Requires manual CSS `--delay` custom property loops or inline `style="animation-delay: ..."` for each child. | Declarative `cascade` and `stagger="50"` attributes automatically compute and sequence delays across target children. |
| **Hardware Acceleration** | Requires manual management of `will-change`, `transform`, `opacity`, and GPU layer promotion. | Uses native Web Animations API (`Element.animate()`) running directly on the browser compositor thread (60/120 fps). |
| **Lifecycle Events** | Raw `animationstart`, `animationend`, and `transitionend` events bubble unpredictably and fire per CSS property. | Clean, standardized `vi-animation-start`, `vi-animation-end`, `vi-animation-cancel`, and `vi-animation-finish` custom events with detailed metadata. |
| **Reduced Motion** | Requires manual `@media (prefers-reduced-motion: reduce)` rules for every keyframe in CSS. | Built-in accessible fallback engine that automatically respects system settings or allows explicit overrides. |

---

## Clinical EDC & Enterprise Use Cases

- **Staggered Table & List Entry:** Sequentially animating patient subject rows, audit log entries, or query lists as they load into view (`cascade` + `stagger="40"`).
- **Modal & Drawer Entrance/Exit:** Smooth backdrop fade and dialog scale-up/scale-down when opening or closing clinical forms.
- **Accordion & Collapsible Panels:** Animating section expansions in multi-page Case Report Forms (eCRF).
- **Form Field Contextual Reveals:** Animating the entrance of conditional fields (e.g., revealing "Pregnancy Test Date" when gender is set to Female).
- **Notification & Toast Banners:** Slide-in and slide-out alerts for real-time protocol deviation notifications.
- **Skeleton Screen to Content Transitions:** Smooth cross-fade when replacing skeleton placeholders with live EDC data.

---

## Technical Architecture

The component operates as a non-rendering structural wrapper (`display: contents` by default) around its slotted content.

```
                      +---------------------------------------+
                      |         <vi-animation> Wrapper        |
                      +---------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
      Declarative Attributes                               Imperative API
    (name, enter, exit, duration,                      (show(), hide(), play(),
    cascade, stagger, easing)                            pause(), reverse())
                |                                                   |
                +-------------------------+-------------------------+
                                          |
                                          v
                      +---------------------------------------+
                      |       Animation Orchestrator Engine   |
                      |  - WAAPI (Element.animate()) Engine  |
                      |  - Cascading Delay Stagger Calculator  |
                      |  - Prefers-Reduced-Motion Auditor     |
                      +---------------------------------------+
                                          |
        +---------------------------------+---------------------------------+
        |                                 |                                 |
        v                                 v                                 v
+---------------+                 +---------------+                 +---------------+
| Custom Events |                 | Display/State |                 | Hardware GPU  |
| - start       |                 | Management    |                 | Compositor    |
| - end         |                 | - show/hide   |                 | Execution     |
| - cancel      |                 | - unmount     |                 | (120fps)      |
| - finish      |                 +---------------+                 +---------------+
+---------------+
```

---

## Properties & Attributes

| Property | Attribute | Type | Default | Reflects | Description |
|---|---|---|---|---|---|
| `name` | `name` | `AnimationPreset \| string` | `'fade-in'` | ✅ | Name of the animation preset or custom keyframes identifier. |
| `enter` | `enter` | `AnimationPreset \| string` | `''` | ✅ | Animation preset used specifically for the **enter** phase (`show()`). Defaults to `name` if omitted. |
| `exit` | `exit` | `AnimationPreset \| string` | `''` | ✅ | Animation preset used specifically for the **exit** phase (`hide()`). |
| `duration` | `duration` | `number` | `300` | ✅ | Animation duration in milliseconds. |
| `delay` | `delay` | `number` | `0` | ✅ | Initial delay before animation starts in milliseconds. |
| `easing` | `easing` | `string` | `'cubic-bezier(0.2, 0, 0, 1)'` | ✅ | Timing function / easing (e.g., `'ease'`, `'linear'`, `'cubic-bezier(...)'`). |
| `iterations` | `iterations` | `number` | `1` | ✅ | Number of times the animation repeats (`Infinity` for infinite looping). |
| `direction` | `direction` | `PlaybackDirection` | `'normal'` | ✅ | Playback direction: `'normal'`, `'reverse'`, `'alternate'`, `'alternate-reverse'`. |
| `fill` | `fill` | `FillMode` | `'forwards'` | ✅ | Fill mode: `'none'`, `'forwards'`, `'backwards'`, `'both'`, `'auto'`. |
| `open` | `open` | `boolean` | `true` | ✅ | Controls visibility state. Changing `open` triggers enter/exit animations automatically. |
| `autoPlay` | `auto-play` | `boolean` | `true` | ✅ | Automatically play animation on mount or when properties change. |
| `cascade` | `cascade` | `boolean` | `false` | ✅ | Enables staggered cascading animation across child elements. |
| `stagger` | `stagger` | `number` | `50` | ✅ | Stagger delay offset in milliseconds per child element when `cascade` is `true`. |
| `staggerSelector` | `stagger-selector` | `string` | `':scope > *'` | ✅ | CSS selector to identify child elements to cascade/stagger. |
| `staggerDirection` | `stagger-direction` | `'normal' \| 'reverse' \| 'center' \| 'random'` | `'normal'` | ✅ | Order of staggered animation execution across child elements. |
| `reducedMotion` | `reduced-motion` | `'auto' \| 'disable' \| 'fade-only'` | `'auto'` | ✅ | Accessibility mode for motion reduction. |
| `keyframes` | — | `Keyframe[] \| PropertyIndexedKeyframes` | `null` | — | Direct JS property for passing custom Web Animations API keyframes array. |

---

## Preset Catalog

`<vi-animation>` comes pre-packaged with hardware-accelerated animation presets tailored for enterprise UI patterns:

### Fade Presets
- `fade-in`, `fade-out`
- `fade-in-up`, `fade-in-down`, `fade-in-left`, `fade-in-right`
- `fade-out-up`, `fade-out-down`, `fade-out-left`, `fade-out-right`

### Scale & Zoom Presets
- `zoom-in`, `zoom-out`
- `scale-up`, `scale-down`
- `bounce-in`, `bounce-out`
- `pop-in`, `pop-out`

### Slide Presets
- `slide-in-top`, `slide-in-bottom`, `slide-in-left`, `slide-in-right`
- `slide-out-top`, `slide-out-bottom`, `slide-out-left`, `slide-out-right`

### 3D & Flip Presets
- `flip-x`, `flip-y`
- `perspective-pop`

### Collapse / Accordion Presets
- `expand-vertical`, `collapse-vertical`
- `expand-horizontal`, `collapse-horizontal`

### Attention Seekers & Utilities
- `pulse`, `bounce`, `shake`, `wobble`, `heartbeat`, `shimmer` (skeleton loader wave)

---

## Imperative API Methods

`<vi-animation>` exposes a clean async JavaScript API:

```typescript
interface ViAnimation extends HTMLElement {
  /** Plays the animation. Returns a promise that resolves when the animation completes. */
  play(): Promise<void>;

  /** Triggers the enter animation phase, making the element visible. */
  show(): Promise<void>;

  /** Triggers the exit animation phase, then hides the element (display: none / hidden). */
  hide(): Promise<void>;

  /** Toggles between show() and hide() based on current state. */
  toggle(): Promise<void>;

  /** Pauses active animations. */
  pause(): void;

  /** Resumes paused animations. */
  resume(): void;

  /** Reverses the playback direction of active animations. */
  reverse(): void;

  /** Cancels active animations, returning targets to pre-animation state. */
  cancel(): void;

  /** Immediately completes the animation, jumping to the final frame. */
  finish(): void;

  /** Returns the active underlying WAAPI Animation instances. */
  getAnimations(): Animation[];
}
```

---

## Custom Events

| Event Name | Detail Payload | Description |
|---|---|---|
| `vi-animation-start` | `{ name: string, target: HTMLElement, phase: 'enter' \| 'exit' \| 'custom', duration: number, delay: number }` | Dispatched when an animation sequence or cascading sequence begins. |
| `vi-animation-end` | `{ name: string, target: HTMLElement, phase: 'enter' \| 'exit' \| 'custom', completed: boolean }` | Dispatched when the animation finishes naturally or is forced to finish via `finish()`. |
| `vi-animation-cancel` | `{ name: string, target: HTMLElement, phase: 'enter' \| 'exit' \| 'custom' }` | Dispatched if the animation is interrupted or cancelled before completing. |
| `vi-animation-finish` | `{ name: string, target: HTMLElement, phase: 'enter' \| 'exit' \| 'custom' }` | Dispatched when animation playback reaches the end frame. |

> [!NOTE]
> All custom events set `bubbles: true`, `composed: true`, and `cancelable: false`.

---

## Cascading & Staggered Animations Engine

When `cascade` is enabled, `<vi-animation>` calculates staggered delays for each matching child element.

### Stagger Direction Modes

1. **`normal` (Default):** First child starts at `delay`, each subsequent child starts `stagger` ms later.
2. **`reverse`:** Last child starts first, working backwards to the first child.
3. **`center`:** Middle child animates first, staggering outward towards the edges.
4. **`random`:** Children animate in randomized order for dynamic particle/grid reveals.

```
Cascade Normal (stagger="50ms"):
Child 0: |=== 300ms ===|
Child 1:    |=== 300ms ===|
Child 2:       |=== 300ms ===|
Child 3:          |=== 300ms ===|

Cascade Center (stagger="50ms"):
Child 2: |=== 300ms ===|  (Center)
Child 1,3:  |=== 300ms ===|
Child 0,4:     |=== 300ms ===|
```

The wrapper orchestrates all child `Animation.finished` Promises into a single `Promise.all()` to fire unified `vi-animation-start` and `vi-animation-end` events for the group.

---

## Motion Accessibility (`prefers-reduced-motion`)

`<vi-animation>` enforces accessibility standards out of the box:

1. **`reduced-motion="auto"` (Default):**
   Checks `window.matchMedia('(prefers-reduced-motion: reduce)')`. If enabled by the user's OS:
   - Transform/motion presets (e.g., `bounce`, `slide-in-top`, `flip-x`) automatically fallback to a simple, non-orienting 100ms `fade-in` / `fade-out`.
   - Duration is capped at 100ms.
   - Cascading delays are reduced to 0ms.
2. **`reduced-motion="fade-only"`:**
   Forces all animations to use pure opacity cross-fades regardless of preset name.
3. **`reduced-motion="disable"`:**
   Bypasses reduced motion overrides (use with caution, only when user explicitly opts into motion via app settings).

---

## Complete TypeScript Implementation (`vi-animation.ts`)

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

export type AnimationPreset =
  | 'fade-in' | 'fade-out' | 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right'
  | 'zoom-in' | 'zoom-out' | 'scale-up' | 'scale-down' | 'bounce-in' | 'bounce-out'
  | 'slide-in-top' | 'slide-in-bottom' | 'slide-in-left' | 'slide-in-right'
  | 'slide-out-top' | 'slide-out-bottom' | 'slide-out-left' | 'slide-out-right'
  | 'flip-x' | 'flip-y' | 'expand-vertical' | 'collapse-vertical'
  | 'pulse' | 'bounce' | 'shake' | 'shimmer';

export type StaggerDirection = 'normal' | 'reverse' | 'center' | 'random';
export type AnimationPhase = 'enter' | 'exit' | 'custom';

export interface ViAnimationEventDetail {
  name: string;
  target: HTMLElement;
  phase: AnimationPhase;
  duration?: number;
  delay?: number;
  completed?: boolean;
}

const PRESET_KEYFRAMES: Record<string, Keyframe[]> = {
  'fade-in': [
    { opacity: 0 },
    { opacity: 1 }
  ],
  'fade-out': [
    { opacity: 1 },
    { opacity: 0 }
  ],
  'fade-in-up': [
    { opacity: 0, transform: 'translate3d(0, 1rem, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' }
  ],
  'fade-in-down': [
    { opacity: 0, transform: 'translate3d(0, -1rem, 0)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0)' }
  ],
  'fade-out-up': [
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, transform: 'translate3d(0, -1rem, 0)' }
  ],
  'fade-out-down': [
    { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    { opacity: 0, transform: 'translate3d(0, 1rem, 0)' }
  ],
  'zoom-in': [
    { opacity: 0, transform: 'scale3d(0.92, 0.92, 0.92)' },
    { opacity: 1, transform: 'scale3d(1, 1, 1)' }
  ],
  'zoom-out': [
    { opacity: 1, transform: 'scale3d(1, 1, 1)' },
    { opacity: 0, transform: 'scale3d(0.92, 0.92, 0.92)' }
  ],
  'slide-in-bottom': [
    { transform: 'translate3d(0, 100%, 0)' },
    { transform: 'translate3d(0, 0, 0)' }
  ],
  'slide-out-bottom': [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(0, 100%, 0)' }
  ],
  'bounce-in': [
    { opacity: 0, transform: 'scale3d(0.3, 0.3, 0.3)' },
    { opacity: 0.9, transform: 'scale3d(1.05, 1.05, 1.05)' },
    { opacity: 1, transform: 'scale3d(1, 1, 1)' }
  ],
  'expand-vertical': [
    { height: '0px', opacity: 0, overflow: 'hidden' },
    { height: 'auto', opacity: 1, overflow: 'visible' }
  ],
  'collapse-vertical': [
    { height: 'auto', opacity: 1, overflow: 'hidden' },
    { height: '0px', opacity: 0, overflow: 'hidden' }
  ],
  'pulse': [
    { transform: 'scale3d(1, 1, 1)' },
    { transform: 'scale3d(1.05, 1.05, 1.05)' },
    { transform: 'scale3d(1, 1, 1)' }
  ],
  'shimmer': [
    { backgroundPosition: '-200% 0' },
    { backgroundPosition: '200% 0' }
  ]
};

@customElement('vi-animation')
export class ViAnimation extends LitElement {
  static override styles = css`
    :host {
      display: contents;
    }
    :host([hidden]) {
      display: none !important;
    }
  `;

  @property({ type: String, reflect: true }) name: AnimationPreset | string = 'fade-in';
  @property({ type: String, reflect: true }) enter: AnimationPreset | string = '';
  @property({ type: String, reflect: true }) exit: AnimationPreset | string = '';
  @property({ type: Number, reflect: true }) duration = 300;
  @property({ type: Number, reflect: true }) delay = 0;
  @property({ type: String, reflect: true }) easing = 'cubic-bezier(0.2, 0, 0, 1)';
  @property({ type: Number, reflect: true }) iterations = 1;
  @property({ type: String, reflect: true }) direction: PlaybackDirection = 'normal';
  @property({ type: String, reflect: true }) fill: FillMode = 'forwards';
  @property({ type: Boolean, reflect: true }) open = true;
  @property({ type: Boolean, attribute: 'auto-play', reflect: true }) autoPlay = true;

  @property({ type: Boolean, reflect: true }) cascade = false;
  @property({ type: Number, reflect: true }) stagger = 50;
  @property({ type: String, attribute: 'stagger-selector', reflect: true }) staggerSelector = ':scope > *';
  @property({ type: String, attribute: 'stagger-direction', reflect: true }) staggerDirection: StaggerDirection = 'normal';

  @property({ type: String, attribute: 'reduced-motion', reflect: true }) reducedMotion: 'auto' | 'disable' | 'fade-only' = 'auto';

  @property({ attribute: false }) keyframes: Keyframe[] | PropertyIndexedKeyframes | null = null;

  @state() private _isAnimating = false;
  private _activeAnimations: Animation[] = [];

  override connectedCallback() {
    super.connectedCallback();
    if (this.autoPlay && this.open) {
      this.updateComplete.then(() => this.play());
    }
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open') && !changedProperties.isFirstProperties) {
      if (this.open) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  public getAnimations(): Animation[] {
    return [...this._activeAnimations];
  }

  public async show(): Promise<void> {
    this.open = true;
    this.hidden = false;
    const animName = this.enter || this.name || 'fade-in';
    await this._runAnimationSequence(animName, 'enter');
  }

  public async hide(): Promise<void> {
    const animName = this.exit || (this.name.includes('in') ? this.name.replace('in', 'out') : 'fade-out');
    await this._runAnimationSequence(animName, 'exit');
    this.open = false;
    this.hidden = true;
  }

  public async toggle(): Promise<void> {
    if (this.open) {
      await this.hide();
    } else {
      await this.show();
    }
  }

  public async play(): Promise<void> {
    const phase: AnimationPhase = this.open ? 'enter' : 'custom';
    await this._runAnimationSequence(this.name, phase);
  }

  public pause(): void {
    this._activeAnimations.forEach(a => a.pause());
  }

  public resume(): void {
    this._activeAnimations.forEach(a => a.play());
  }

  public reverse(): void {
    this._activeAnimations.forEach(a => a.reverse());
  }

  public cancel(): void {
    this._activeAnimations.forEach(a => a.cancel());
    this._activeAnimations = [];
    this._isAnimating = false;
    this._dispatch('vi-animation-cancel', { name: this.name, target: this, phase: 'custom' });
  }

  public finish(): void {
    this._activeAnimations.forEach(a => a.finish());
    this._dispatch('vi-animation-finish', { name: this.name, target: this, phase: 'custom' });
  }

  private _getTargetElements(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot');
    if (!slot) return [this];

    const assignedNodes = slot.assignedElements({ flatten: true }) as HTMLElement[];
    if (assignedNodes.length === 0) return [this];

    if (!this.cascade) {
      return assignedNodes;
    }

    let targetElements: HTMLElement[] = [];
    assignedNodes.forEach(node => {
      if (node.matches(this.staggerSelector)) {
        targetElements.push(node);
      }
      const children = Array.from(node.querySelectorAll<HTMLElement>(this.staggerSelector));
      targetElements.push(...children);
    });

    return targetElements.length > 0 ? targetElements : assignedNodes;
  }

  private _getKeyframes(animName: string, isReducedMotion: boolean): Keyframe[] {
    if (isReducedMotion) {
      return PRESET_KEYFRAMES['fade-in'];
    }
    if (this.keyframes) {
      return Array.isArray(this.keyframes) ? this.keyframes : [this.keyframes];
    }
    return PRESET_KEYFRAMES[animName] || PRESET_KEYFRAMES['fade-in'];
  }

  private _calculateStaggerDelay(index: number, total: number): number {
    if (!this.cascade || total <= 1) return this.delay;

    let orderIndex = index;
    if (this.staggerDirection === 'reverse') {
      orderIndex = total - 1 - index;
    } else if (this.staggerDirection === 'center') {
      const middle = (total - 1) / 2;
      orderIndex = Math.abs(middle - index);
    } else if (this.staggerDirection === 'random') {
      orderIndex = Math.floor(Math.random() * total);
    }

    return this.delay + (orderIndex * this.stagger);
  }

  private async _runAnimationSequence(animName: string, phase: AnimationPhase): Promise<void> {
    const isReduced = this._shouldReduceMotion();
    const targets = this._getTargetElements();
    if (targets.length === 0) return;

    this.cancel();
    this._isAnimating = true;

    const actualDuration = isReduced ? Math.min(this.duration, 100) : this.duration;

    this._dispatch('vi-animation-start', {
      name: animName,
      target: this,
      phase,
      duration: actualDuration,
      delay: this.delay
    });

    const keyframes = this._getKeyframes(animName, isReduced);

    const animationPromises = targets.map((el, index) => {
      const elementDelay = isReduced ? 0 : this._calculateStaggerDelay(index, targets.length);

      const anim = el.animate(keyframes, {
        duration: actualDuration,
        delay: elementDelay,
        easing: this.easing,
        iterations: this.iterations,
        direction: this.direction,
        fill: this.fill
      });

      this._activeAnimations.push(anim);
      return anim.finished.catch(() => null);
    });

    await Promise.all(animationPromises);

    this._isAnimating = false;
    this._activeAnimations = [];

    this._dispatch('vi-animation-end', {
      name: animName,
      target: this,
      phase,
      completed: true
    });
  }

  private _shouldReduceMotion(): boolean {
    if (this.reducedMotion === 'disable') return false;
    if (this.reducedMotion === 'fade-only') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  private _dispatch(eventName: string, detail: ViAnimationEventDetail) {
    this.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true
    }));
  }

  override render() {
    return html`<slot></slot>`;
  }
}
```

---

## Design System Scss Keyframes (`_animation.scss`)

```scss
// Flux UI Design Tokens Integration
:root {
  --vi-animation-duration-fast: 150ms;
  --vi-animation-duration-base: 300ms;
  --vi-animation-duration-slow: 500ms;
  --vi-animation-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --vi-animation-easing-entrance: cubic-bezier(0, 0, 0.2, 1);
  --vi-animation-easing-exit: cubic-bezier(0.4, 0, 1, 1);
  --vi-animation-easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes vi-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes vi-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes vi-slide-in-bottom {
  from { transform: translate3d(0, 100%, 0); }
  to { transform: translate3d(0, 0, 0); }
}

@keyframes vi-zoom-in {
  from { opacity: 0; transform: scale3d(0.92, 0.92, 0.92); }
  to { opacity: 1; transform: scale3d(1, 1, 1); }
}

@keyframes vi-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

---

## Comprehensive Usage Examples

### 1. Basic Declarative Animation Presets

```html
<!-- Simple Fade In -->
<vi-animation name="fade-in" duration="400">
  <div class="card">Basic Card Content</div>
</vi-animation>

<!-- Zoom In with Bounce Easing -->
<vi-animation name="zoom-in" duration="500" easing="cubic-bezier(0.34, 1.56, 0.64, 1)">
  <vi-button variant="primary">Bouncing Button</vi-button>
</vi-animation>
```

### 2. Enter and Exit Toggle Binding

```html
<vi-animation 
  enter="fade-in-up" 
  exit="fade-out-down" 
  duration="300"
  .open=${isFilterOpen}
>
  <div class="filter-panel">
    <h3>Filter Patient Records</h3>
    <!-- Form Content -->
  </div>
</vi-animation>
```

### 3. Cascading Staggered Table Rows (Clinical EDC Patient List)

```html
<vi-animation 
  cascade 
  stagger="40" 
  stagger-selector="tr"
  stagger-direction="normal"
  enter="fade-in-up" 
  duration="250"
>
  <table class="edc-table">
    <thead>
      <tr><th>Subject ID</th><th>Site</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr><td>SUBJ-1001</td><td>Site 01</td><td>Enrolled</td></tr>
      <tr><td>SUBJ-1002</td><td>Site 01</td><td>Screened</td></tr>
      <tr><td>SUBJ-1003</td><td>Site 02</td><td>Completed</td></tr>
      <tr><td>SUBJ-1004</td><td>Site 03</td><td>Discontinued</td></tr>
    </tbody>
  </table>
</vi-animation>
```

### 4. Custom WAAPI Keyframes via JavaScript

```typescript
const animWrapper = document.querySelector<ViAnimation>('vi-animation#custom-anim');

animWrapper.keyframes = [
  { transform: 'rotate(0deg) scale(1)', filter: 'blur(0px)' },
  { transform: 'rotate(180deg) scale(1.2)', filter: 'blur(4px)' },
  { transform: 'rotate(360deg) scale(1)', filter: 'blur(0px)' }
];

animWrapper.duration = 800;
await animWrapper.play();
```

### 5. Imperative Event Listener Integration

```typescript
const anim = document.querySelector<ViAnimation>('#modal-anim');

anim.addEventListener('vi-animation-start', (e: CustomEvent<ViAnimationEventDetail>) => {
  console.log(`Started ${e.detail.phase} animation: ${e.detail.name}`);
});

anim.addEventListener('vi-animation-end', async (e: CustomEvent<ViAnimationEventDetail>) => {
  if (e.detail.phase === 'exit') {
    console.log('Modal fully hidden and DOM cleaned up.');
  }
});

// Trigger modal exit programmatically
await anim.hide();
```

---

## Verification & Testing Strategy

1. **Unit Tests (`vi-animation.test.ts`):**
   - Test proper lifecycle event dispatching (`vi-animation-start`, `vi-animation-end`, `vi-animation-cancel`).
   - Test toggle between `show()` and `hide()`, confirming `hidden` property state changes after exit animation completes.
   - Verify `stagger` delay calculations across child elements.
2. **Accessibility Audits:**
   - Emulate `prefers-reduced-motion: reduce` in DevTools and verify that duration caps at 100ms and transforms revert to safe fades.
3. **Performance Profiling:**
   - Confirm WAAPI execution runs strictly on the compositor thread (`Layerized` layout, zero forced reflows during playback).
