# Lit Web Components: Property & State Declaration Guide

This guide documents how to declare **properties** (public, reflected to HTML attributes) and **state** (private, internal-only) in this repository's Lit web components.

> **Updated 30 March 2026**: Decorator syntax is now the recommended pattern following successful implementation of TC39 standard decorators with the `accessor` keyword. See [ADR-001](./adr/ADR-001-lit-web-components-decorator-pattern.md) for the full decision record.

## Quick Reference: Property vs State

| Feature | `@property()` decorator | `@state()` decorator |
|---------|------------------------|----------------------|
| **Syntax** | `@property({ type: String, reflect: true }) accessor x = ''` | `@state() accessor y = false` |
| **Public** | ✅ Yes | ❌ No (internal only) |
| **Reflected to HTML** | ✅ Yes (with `reflect: true`) | ❌ Never |
| **HTML attribute** | ✅ Yes (auto) | ❌ No |
| **Type Safety** | Inline on declaration | Inline on declaration |
| **Status** | ✅ **Recommended** | ✅ **Recommended** |

## Required: `accessor` Keyword

TC39 standard decorators require the `accessor` keyword on decorated class fields. This creates a getter/setter pair that Lit wraps to hook into reactive updates.

```typescript
// ✅ Correct — accessor keyword required
@property({ type: String, reflect: true }) accessor variant: ViVariant = 'primary';

// ❌ Wrong — missing accessor, will cause runtime error with TC39 decorators
@property({ type: String, reflect: true }) variant: ViVariant = 'primary';
```

---

## Pattern 1: Decorator Syntax (RECOMMENDED)

Use this pattern for all new and existing components.

### Public Properties (Exposed to HTML)

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-button')
export class MyButton extends LitElement {
  /**
   * Button variant/style
   * @attr variant - primary | secondary | danger
   * @example <my-button variant="primary"></my-button>
   */
  @property({ type: String, reflect: true }) accessor variant: 'primary' | 'secondary' | 'danger' = 'primary';

  /**
   * Disabled state
   * @attr
   * @example <my-button disabled></my-button>
   */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  render() {
    return html`<button ?disabled=${this.disabled}>${this.variant}</button>`;
  }
}
```

**HTML Usage:**
```html
<my-button variant="secondary" disabled></my-button>
```

### Private State (Internal Only)

```typescript
import { customElement, property, state } from 'lit/decorators.js';

@customElement('my-button')
export class MyButton extends LitElement {
  /** Public — users can set this attribute */
  @property({ type: String, reflect: true }) accessor variant: string = 'primary';

  /** Public — users can set this attribute */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Private — internal reactivity only, NOT in HTML */
  @state() accessor isHovering = false;

  /** Private — internal counter, NOT in HTML */
  @state() accessor _internalCounter = 0;

  private onMouseEnter() {
    this.isHovering = true;  // Triggers reactivity internally
  }

  render() {
    return html`
      <button
        ?disabled=${this.disabled}
        @mouseenter=${this.onMouseEnter}
      >
        ${this.isHovering ? 'Hovering!' : 'Hover me'}
      </button>
    `;
  }
}
```

---

## Pattern 2: Static `properties` Object (Legacy Reference)

This was the previous recommended pattern before TC39 decorator support was confirmed working. Documented here for context when reading older code or for rare cases where decorator syntax is not available.

```typescript
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-button')
export class MyButton extends LitElement {
  // 1. Declare the properties object
  static override properties = {
    variant: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    isHovering: { state: true },     // Private — state only, no attribute
  };

  // 2. Declare types for TypeScript separately
  declare variant: 'primary' | 'secondary' | 'danger';
  declare disabled: boolean;
  declare isHovering: boolean;

  // 3. Initialize in constructor
  constructor() {
    super();
    this.variant = 'primary';
    this.disabled = false;
    this.isHovering = false;
  }

  render() {
    return html`<button ?disabled=${this.disabled}>${this.variant}</button>`;
  }
}
```

**When to use**: Migrating existing components, or if a build environment truly cannot support TC39 decorators.

---

## Common Patterns

### Number & Array Properties

```typescript
@property({ type: Number }) accessor count = 0;
@property({ type: Array }) accessor tags: string[] = [];
```

### Read-Only Properties (No Reflection)

Properties that are set once and don't need to be reflected back to HTML attributes:

```typescript
// No reflect — it's set programmatically, not from HTML
@property({ type: String }) accessor productId = 'PROD-001';
```

### Computed Properties (Derived State)

Use a getter for values derived from other properties — no decorator needed:

```typescript
@property({ type: String, reflect: true }) accessor firstName = 'John';
@property({ type: String, reflect: true }) accessor lastName = 'Doe';

// Getter — re-computed automatically on each render
get fullName() {
  return `${this.firstName} ${this.lastName}`;
}

render() {
  return html`<p>${this.fullName}</p>`;
}
```

### Complex Objects (Be Careful!)

```typescript
@property({ type: Object }) accessor config: { width: number; height: number } = { width: 100, height: 200 };

// ⚠️ Modifying nested properties won't trigger reactivity
// Reassign the entire object instead:
updateConfig() {
  this.config = { ...this.config, width: 150 }; // ✅ Triggers re-render
  // NOT: this.config.width = 150;              // ❌ Won't trigger update
}
```

---

## JSDoc for HTML Attributes

Always document public properties with `@attr` so HTML users get IDE hints:

```typescript
/**
 * Sets the button size.
 * @attr size - small | medium | large
 * @example <vi-button size="large"></vi-button>
 */
@property({ type: String, reflect: true }) accessor size: 'small' | 'medium' | 'large' = 'medium';
```

Users get autocomplete in their HTML:
```html
<vi-button size="[autocomplete: small|medium|large]"></vi-button>
```

---

## TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": false,    // DO NOT enable — breaks Lit decorators
    "useDefineForClassFields": true,    // Required at ES2022 target
    "emitDecoratorMetadata": false,     // Not needed
    "target": "ES2022",
    "module": "ES2022"
  }
}
```

---

## Troubleshooting

### Property not updating?

Check:
1. ✅ Does the field have **`accessor`** keyword? (`accessor variant = ...`)
2. ✅ Is the decorator applied to the right field?
3. ✅ For objects, are you reassigning the whole object (not mutating)?

### Runtime error "Unsupported decorator location: field"?

You're likely missing the `accessor` keyword:
```typescript
// ❌ Causes runtime error
@property({ type: String }) variant = 'primary';

// ✅ Fixed
@property({ type: String }) accessor variant = 'primary';
```

### "experimentalDecorators" lint warning?

Ensure `tsconfig.json` has `"experimentalDecorators": false`. Do **not** set it to `true` — that mode is incompatible with Lit's decorator implementation.

### HTML attribute not reflecting?

Make sure `reflect: true` is set:
```typescript
@property({ type: String, reflect: true }) accessor variant = 'primary'; // ← reflect: true is KEY
```

---

## References

- [Lit Documentation: Decorators](https://lit.dev/docs/components/decorators/#enabling-decorators)
- [Lit Documentation: Properties](https://lit.dev/docs/components/properties/)
- [ADR-001: Decorator Pattern Decision](./adr/ADR-001-lit-web-components-decorator-pattern.md)
- [Industry Research: How Other Libraries Handle Decorators](./INDUSTRY-RESEARCH.md)
- [Reference Implementation: vi-button](../src/button/vi-button.ts)

---

**Last Updated**: 30 March 2026  
**Related ADR**: ADR-001 (v2 — decorators adopted)
