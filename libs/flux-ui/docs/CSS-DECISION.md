# CSS Strategy Decision Document

**Date:** March 2026  
**Project:** Microfrontend Architecture with Module Federation  
**Status:** Proposed ⏳  
**Decision:** Build Custom Minimal CSS/SASS Framework

---

## Executive Summary

After deep analysis of three CSS approaches, we have chosen to **build a custom minimal CSS/SASS framework** with a solid foundation supporting CSS utility classes and components. This decision optimizes for performance, maintainability, and microfrontend isolation.

---

## Decision Context

### Project Constraints
- **Architecture:** Angular + Vite + Nx monorepo
- **Deployment:** Module Federation (MFE) with shell + remote apps
- **Goal:** CSS must be lightweight, deduplicatable, and MFE-safe
- **Teams:** Multiple remote app teams need design system consistency

### Business Goals
1. Minimize bundle size per MFE
2. Prevent CSS namespace collisions across MFE boundaries
3. Enable design system evolution without framework lock-in
4. Provide type-safe design tokens (TS + SCSS)
5. Ship only what's used (zero dead code)

---

## Alternatives Evaluated

### Option 1: Bootstrap ❌ REJECTED

**Why it's inappropriate for MFE:**

| Issue | Impact | Severity |
|-------|--------|----------|
| **CSS Duplication** | 180-230KB per MFE × N remotes = massive bloat | 🔴 Critical |
| **Namespace Pollution** | Global CSS conflicts across MFE boundaries | 🔴 Critical |
| **Version Mismatch Risk** | Shell v5.2 + Remote v5.1 = style inconsistencies | 🔴 Critical |
| **Component Lock-in** | Tied to Bootstrap's HTML structure assumptions | 🟡 High |
| **Design Vision** | Generic, not brand-specific for product | 🟡 High |
| **Customization Tax** | Requires Sass overrides adding complexity | 🟢 Low |

**Verdict:** Bootstrap is optimized for monolithic SPAs, not MFE architectures. The CSS cannot be safely deduplicated across MFEs.

---

### Option 2: Tailwind CSS ⚠️ VIABLE BUT RISKY

**Pros:**
- ✅ Tree-shaking eliminates unused utilities
- ✅ JIT compilation is performant
- ✅ Theme system with tokens
- ✅ Design system friendly

**Cons (for MFE):**
- ❌ Multiple Tailwind instances → CSS duplication per MFE
- ⚠️ Requires shared `tailwind.config.ts` across all MFEs (discipline needed)
- ⚠️ Class name collisions if PurgeCSS misconfigured
- ⚠️ Configuration drift between teams

**Why we rejected it:**
1. Each MFE's build still compiles its own Tailwind instance
2. Cannot guarantee single CSS file per MFE without custom webpack config
3. Adds operational overhead (keeping config in sync)
4. Not worth the complexity for utility-first patterns we can build ourselves

**When it would work:**
- Single shared Tailwind build at shell level (complex)
- Strong internal discipline + ESLint rules to prevent duplicates

---

### Option 3: Custom Minimal CSS/SASS Framework ✅ SELECTED

**Perfect for MFE because:**

| Advantage | Why It Matters for MFE |
|-----------|---|
| **Zero Duplication** | CSS loads once in shell or lazy-loaded, shared by all remotes |
| **Namespace Control** | Designer explicitly manages global vs scoped CSS |
| **Minimal Surface Area** | Only ship what's built (15-25KB vs 150-230KB frameworks) |
| **CSS Layers Support** | Modern cascade management prevents cross-MFE conflicts |
| **Design Tokens as Code** | TS tokens + CSS vars enable runtime theming + type safety |
| **Framework Agnostic** | Works equally well with Angular, React, Web Components |
| **No Release Lock-in** | Not dependent on Bootstrap/Tailwind release cycles |
| **Immediate Brand Alignment** | System reflects product's design vision from day one |

**Trade-offs:**
- ⚠️ Build some components ourselves (but strategic: only 5-7 core ones initially)
- ⚠️ Requires design discipline (but monorepo structure enforces this naturally)

---

## Decision Breakdown: Why This Works for MFE

### 1. CSS Deduplication Pattern

```
Shell (main.ts)
  └── Load flux-ui CSS once
       ├── _variables.scss (CSS custom properties)
       ├── _reset.scss (via CSS Layers)
       └── _utilities.scss (spacing, typography, etc.)

Remote1 MFE
  └── Import tokens from @vi/flux-ui
       └── Use CSS variables (already loaded by shell)
       └── NO CSS re-bundled

Remote2 MFE
  └── Same pattern (reuses shell's CSS)
```

**Result:** CSS file size ÷ by N MFEs instead of multiplied.

### 2. Namespace Safety with CSS Layers

```scss
@layer reset, components, utilities;

@layer reset {
  * { box-sizing: border-box; }  // Safe, low specificity
}

@layer components {
  .btn { /* Custom button */ }   // Mid priority
}

@layer utilities {
  .m-1 { margin: 8px; }          // Low priority
}
```

**Benefit:** Prevents specificity wars between shell and remote styles.

### 3. Type-Safe Tokens

```typescript
// Tokens are exported as TS constants
import { tokens } from '@vi/flux-ui';

// Type-safe component code
const buttonClasses = `px-${tokens.spacing.md}`;  // ✅ TS validates key

// Also available as CSS variables
const buttonStyle = { 
  padding: tokens.spacing.md  // var(--vi-spacing-md)
};
```

**Benefit:** Designers maintain tokens in ONE place, both TS and CSS consume it.

---

## Architecture Overview

```
libs/flux-ui/
├── src/
│   ├── tokens/
│   │   └── index.ts          ← TS constants + CSS variable definitions
│   ├── styles/
│   │   ├── _variables.scss   ← SCSS variables + CSS custom properties (:root)
│   │   ├── _reset.scss       ← Minimal, MFE-safe reset (CSS Layers)
│   │   ├── _layout.scss      ← Flexbox/Grid utilities
│   │   ├── _utilities.scss   ← Spacing, typography, colors (generated)
│   │   └── index.ts          ← Style imports aggregator
│   └── components/           ← Observable: Built later
│       ├── button/
│       ├── form-input/
│       └── card/
├── docs/
│   ├── CSS-DECISION.md       ← This document
│   ├── ARCHITECTURE.md       ← Technical deep-dive
│   ├── USAGE-GUIDE.md        ← How to use in apps
│   └── TOKEN-SPEC.md         ← Token reference
└── package.json
```

---

## Design System Foundation

### Token Categories

| Category | Examples | Scope |
|----------|----------|-------|
| **Colors** | primary, secondary, success, error, neutral[50-900] | Brand + Semantic |
| **Spacing** | xs (8px), sm (16px), md (24px), ... 3xl (56px) | 8px unit system |
| **Typography** | text-base, text-lg, font-semibold, leading-relaxed | Base family + scales |
| **Shadows** | shadow-sm, shadow-md, shadow-lg, shadow-xl | Elevation system |
| **Borders** | border-radius-*, border-width-* | Roundness + thickness |
| **Z-Index** | dropdown, modal, tooltip | Stacking context |
| **Breakpoints** | xs, sm, md, lg, xl, 2xl | Responsive design |

### Export Strategy

**SCSS Variables:**
```scss
$color-primary: #0066cc;
$spacing-sm: 16px;
```
Use in style files, compile-time only.

**CSS Custom Properties:**
```css
:root {
  --vi-color-primary: #0066cc;
  --vi-spacing-sm: 16px;
}
```
Use in apps, runtime accessible, themeable.

**TypeScript Constants:**
```typescript
export const tokens = {
  colors: { primary: 'var(--vi-color-primary)' },
  spacing: { sm: 'var(--vi-spacing-sm)' }
}
```
Use in component code, type-safe.

---

## Comparison Matrix: Final

| Criteria | Bootstrap | Tailwind | Custom (Selected) |
|----------|-----------|----------|---|
| **Bundle Size** | 180-230KB | 20-80KB | **15-25KB** ✓ |
| **Per-MFE Duplication** | ❌ 100% duplicated | ⚠️ If not shared | ✅ 0% duplicated |
| **Namespace Safety** | ❌ High conflict risk | ⚠️ Discipline needed | ✅ Native support |
| **Design System Ready** | 🟡 Generic | ✅ With config | **✅ Purpose-built** ✓ |
| **Type Safety** | ❌ None | ❌ None | **✅ Full TS support** ✓ |
| **Learning Curve** | 🟢 Easy | 🟡 Medium | **🟢 Medium** ✓ |
| **Customization** | 🔴 Heavy overrides | ✅ Theme config | **✅ Simple tweaks** ✓ |
| **Maintenance Control** | 🔴 Upstream changes | 🟡 Follow releases | **✅ Complete control** ✓ |
| **Component Library** | ✅ 50+ pre-built | 🟡 Need to extract | **⚠️ Build 5-7 core** |
| **Microfrontend Rating** | 🔴 Poor | ⚠️ Mediocre | **🟢 Excellent** ✓ |

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Finalize color palette and brand guidelines
- [ ] Define spacing system (8px unit)
- [ ] Set typography scales and families
- [ ] Create tokens (TS + SCSS + CSS vars)
- [ ] Build reset styles (CSS Layers)
- [ ] Generate layout utilities (flexbox, grid)

### Phase 2: Core Components (Week 3-4)
- [ ] Button component (variants: primary, secondary, danger, ghost)
- [ ] Form input component (text, email, password)
- [ ] Card component (container with padding/shadow)
- [ ] Modal component (dialog wrapper)
- [ ] Navigation component (header/menu)

### Phase 3: MFE Integration (Week 5)
- [ ] Shell loads flux-ui CSS at bootstrap
- [ ] Remotes import tokens from shared lib
- [ ] Test CSS isolation with real remote apps
- [ ] Document usage in remote apps

### Phase 4: Extension (Ongoing)
- [ ] Build additional components as needed
- [ ] Establish theme customization system
- [ ] Create component documentation site

---

## Risk Mitigation

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| **Team doesn't follow patterns** | Medium | ESLint rules + code review process |
| **CSS grows uncontrollably** | Low | Enforce component/utility tier structure |
| **Inconsistent tokens across apps** | Low | Monorepo structure + shared imports |
| **Browser support issues** | Low | CSS Layers widely supported (90%+) |
| **Component library incomplete** | High | Build incrementally, don't block MFE launch |

---

## Success Metrics

- ✅ Design system CSS bundle: < 30KB gzipped
- ✅ Zero CSS conflicts between shell and remote1
- ✅ Tokens accessible in TS with type checking
- ✅ New remote app can be styled in < 1 hour
- ✅ Design changes propagate to all MFEs in one commit

---

## Approval & Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| Tech Lead | - | - | ⏳ Pending |
| Design Lead | - | - | ⏳ Pending |
| Product Owner | - | - | ⏳ Pending |

---

## Next Steps

1. **Immediate:** Review this decision document with team
2. **Design:** Start color palette refinement
3. **Development:** Create first component (Button) with tokens
4. **Integration:** Test tokens in shell app
5. **Documentation:** Create developer guide for remote apps

---

## References

- [CSS Layers Specification](https://www.w3.org/TR/css-cascade-5/#cascade-layers)
- [Module Federation Architecture](../mf-architecture.md)
- [Design System Tokens Best Practices](./TOKEN-SPEC.md)
- [Microfrontend CSS Patterns](./ARCHITECTURE.md)

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Next Review:** After implementation Phase 1
