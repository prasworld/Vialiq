# ADR-001: Lit Web Components Property Declaration Pattern

**Date**: 30 March 2026  
**Status**: REVISED — 30 March 2026  
**Context**: Web Components library using Lit v3 with Vite build system  
**Participants**: Prashant Gupta, Engineering Team

## Revision History

| Version | Date | Status | Summary |
|---------|------|--------|---------|
| v1 | 30 March 2026 (morning) | ~~ACCEPTED~~ SUPERSEDED | Rejected decorators; adopted static `properties` object |
| **v2** | **30 March 2026 (afternoon)** | **ACCEPTED** | **Adopted TC39 standard decorators with `accessor` keyword** |

---

## Problem Statement

When implementing reactive properties in Lit web components, we needed to determine the correct pattern for declaring reactive properties:

- **Option A**: Use `@property` / `@state` decorators (shown throughout Lit documentation)
- **Option B**: Use static `properties` object (imperative, no decorator dependency)

### Original Failure (v1 context)

The initial investigation rejected decorators because:

```
Error: Unsupported decorator location: field
at standardProperty (node_modules/@lit/reactive-element/src/decorators/property.ts:170:9)
```

This was caused by **using TypeScript's `experimentalDecorators` mode**, which uses a pre-TC39 transpilation strategy incompatible with Lit's decorator implementation. The mistake was configuration, not the decorators themselves.

---

## Technical Analysis

### Root Cause of v1 Failure

Lit's decorators (`@property`, `@state`) are implemented for **TC39 standard decorators** (Stage 3 proposal, finalized). TypeScript's `experimentalDecorators: true` uses an older, incompatible pre-TC39 semantics.

| Mode | `experimentalDecorators` | Field syntax | Compatible with Lit? |
|---|---|---|---|
| TypeScript Experimental | `true` + `useDefineForClassFields: false` | `@property() variant = 'x'` | ❌ Runtime error |
| **TC39 Standard (v2)** | **`false` + `useDefineForClassFields: true`** | **`@property() accessor variant = 'x'`** | ✅ Works |

### The `accessor` Keyword

TC39 standard decorators cannot change the *kind* of a class member — fields cannot become accessors. The `accessor` keyword (TypeScript 4.9+) explicitly declares an auto-accessor (get/set pair), which Lit's decorator can then wrap to hook into the reactive update lifecycle.

```typescript
// ✅ TC39 standard — accessor keyword required
@property({ type: String, reflect: true }) accessor variant: ViVariant = 'primary';

// ❌ Experimental — no accessor, fails at runtime
@property({ type: String, reflect: true }) variant: ViVariant = 'primary';
```

### Why the SWC Configuration Worked

The project's `unplugin-swc` was already configured with `decoratorVersion: '2022-03'`, which is the TC39 2022-03 standard version — aligned with TC39 semantics. Switching to `'legacy'` (experimental mode equivalent) was the wrong direction and was reverted.

---

## Options Compared

### Option A: TC39 Standard Decorators with `accessor` (SELECTED ✅)

```typescript
import { customElement, property, state } from 'lit/decorators.js';

@customElement('vi-button')
export class ViButton extends ViElement {
  static override styles = css`${unsafeCSS(buttonStyles)}`;

  /** @attr variant - Button variant: primary, secondary, danger */
  @property({ type: String, reflect: true }) accessor variant: ViVariant = 'primary';

  /** @attr disabled - Disabled state */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Private internal state — not reflected to HTML */
  @state() accessor isHovering = false;
}
```

**Pros:**
- ✅ Matches Lit documentation and official examples
- ✅ Concise and declarative — less boilerplate than static properties
- ✅ No constructor needed for default values
- ✅ Property and type declaration colocated on one line
- ✅ Industry-standard direction for TC39 compilers
- ✅ Works with SWC `decoratorVersion: '2022-03'`

**Cons:**
- Requires `accessor` keyword (may be unfamiliar to newcomers)
- Larger compiler output than native decorator support (until browsers ship native support)
- Lit's own docs note: _"compiler output for standard decorators is unfortunately large"_

### Option B: Static `properties` Object (Superseded)

```typescript
@customElement('vi-button')
export class ViButton extends ViElement {
  static override properties = {
    variant: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare variant: ViVariant;
  declare disabled: boolean;

  constructor() {
    super();
    this.variant = 'primary';
    this.disabled = false;
  }
}
```

**Was selected in v1 because**: Appeared to be the only working option.
**Superseded because**: TC39 standard decorators with `accessor` work correctly and are more concise.

---

## Decision (v2)

**ACCEPT Option A: TC39 Standard Decorators with `accessor` keyword**

### Rationale

1. **Correct implementation**: TC39 standard decorators match what Lit's library is built for
2. **Conciseness**: One line vs. three (declaration + `declare` + constructor init)
3. **Alignment**: Matches official Lit docs, community examples, and future browser-native support
4. **Validated**: Build ✅ Lint ✅ WDIO 4/4 ✅ Production build ✅
5. **Standards direction**: TC39 decorators are at Stage 3 (complete spec); browser native support is imminent

### Required TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": false,     // DO NOT enable — breaks Lit
    "useDefineForClassFields": true,      // Required with ES2022 target
    "emitDecoratorMetadata": false,       // Not needed, not recommended
    "target": "ES2022",
    "module": "ES2022"
  }
}
```

### Required SWC Configuration (for WDIO test runner)

```json
// .swcrc
{
  "jsc": {
    "target": "es2022",
    "parser": { "syntax": "typescript", "decorators": true },
    "transform": { "decoratorVersion": "2022-03" }  // TC39 standard — NOT "legacy"
  }
}
```

### Implementation Pattern

For all Lit components in this repository:

```typescript
import { css, html, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ViElement } from '../base/vi-element.js';

@customElement('my-component')
export class MyComponent extends ViElement {
  static override styles = css`...`;

  /** Public property — reflected to HTML attribute */
  @property({ type: String, reflect: true }) accessor variant: string = 'primary';

  /** Public boolean — set as bare attribute: <my-component disabled> */
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  /** Private state — NOT reflected to HTML, internal reactivity only */
  @state() accessor isLoading = false;

  override render() {
    return html`...`;
  }
}
```

---

## Revisit Triggers

**Review this decision if:**

1. **Bundle size** becomes a concern due to TC39 decorator polyfill output — benchmark and consider static properties for performance-critical components
2. **Browser native decorator support** ships — can then simplify and drop `accessor` keyword in some contexts
3. **Lit v4+** changes its decorator API contract
4. **Team consistency issues** — if `accessor` keyword causes confusion, create lint rule reminders

**Review timing**: Re-evaluate annually or on major Lit/TypeScript release.

---

## References

- [Lit Documentation: Decorators](https://lit.dev/docs/components/decorators/#enabling-decorators)
- [Lit Documentation: Migrating to Standard Decorators](https://lit.dev/docs/components/decorators/#migrating-typescript-experimental-decorators-to-standard-decorators)
- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators)
- [TypeScript: useDefineForClassFields](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)
- [Reference Implementation: vi-button](../src/button/vi-button.ts)
- [Industry Research: Decorator Landscape](./INDUSTRY-RESEARCH.md)

## Appendix: Test Results (v2)

**Build Status**: ✅ Vite build succeeds  
**Lint Status**: ✅ ESLint passes  
**Test Status**: ✅ WebdriverIO tests pass (4/4)  
**Production Build**: ✅ Passes  

All tests confirmed working with `@property() accessor` pattern.

---

**Approved by**: Prashant Gupta, Engineering Team  
**Next Review**: 30 March 2027
