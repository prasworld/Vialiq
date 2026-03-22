# Design System Documentation Index

Welcome to the Design System documentation. This is your starting point for understanding the CSS architecture for the microfrontend product.

---

## 📚 Documentation Structure

### 1. **[CSS-DECISION.md](./CSS-DECISION.md)** - START HERE
**Purpose:** Understand WHY we chose a custom CSS framework

**Contains:**
- Decision analysis of 3 CSS approaches (Bootstrap vs Tailwind vs Custom)
- Detailed comparison matrix
- MFE-specific considerations
- Risk mitigation strategies
- Implementation phases

**Read this if:** You want to understand the strategic decision behind our CSS approach.

---

### 2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - TECHNICAL FOUNDATION
**Purpose:** Understand HOW the design system is structured

**Contains:**
- Directory structure and file organization
- Token system (3-tier export: TS + SCSS + CSS vars)
- CSS Layers cascade management
- CSS deduplication strategy for MFEs
- Component patterns
- MFE integration setup
- Theming and runtime customization

**Read this if:** You're implementing the design system or want technical depth.

---

### 3. **[USAGE-GUIDE.md](./USAGE-GUIDE.md)** - HANDS-ON EXAMPLES
**Purpose:** Learn how to USE tokens and utilities in your apps

**Contains:**
- Shell app setup (load CSS once)
- Remote app setup (reuse CSS)
- Using tokens in TypeScript
- Using utilities in HTML/CSS
- Building components
- Theming examples
- Common patterns

**Read this if:** You're building a feature and need practical examples.

---

### 4. **[TOKEN-SPEC.md](./TOKEN-SPEC.md)** - REFERENCE DOCUMENTATION
**Purpose:** Complete token reference with all values

**Contains:**
- Color tokens (brand, semantic, neutral palette)
- Spacing tokens (8px unit system)
- Typography tokens (fonts, sizes, weights)
- Shadow tokens (elevation system)
- Border tokens (radius, width)
- Z-Index tokens (stacking context)
- Breakpoint tokens (responsive sizes)
- Access patterns (TS, SCSS, CSS)
- Best practices (do's and don'ts)

**Read this if:** You need to look up specific token values or access patterns.

---

## 🎯 Quick Decision Matrix

| Question | Document | Section |
|----------|----------|---------|
| Why not Bootstrap or Tailwind? | CSS-DECISION.md | Alternatives Evaluated |
| How is CSS organized? | ARCHITECTURE.md | Directory Structure |
| How do I load CSS in shell? | USAGE-GUIDE.md | Shell App Setup |
| How do I use tokens in components? | USAGE-GUIDE.md | Using Tokens |
| What's the spacing value for `md`? | TOKEN-SPEC.md | Spacing Tokens |
| How does CSS avoid conflicts in MFEs? | ARCHITECTURE.md | CSS Layers |
| How do I build a new component? | USAGE-GUIDE.md | Building Components |
| What's the color token for errors? | TOKEN-SPEC.md | Color Tokens |

---

## 🚀 Getting Started Workflows

### Workflow 1: Setup Shell App

1. Read: [USAGE-GUIDE.md → Shell App Setup](./USAGE-GUIDE.md#shell-app-setup)
2. Reference: [TOKEN-SPEC.md → Color Tokens](./TOKEN-SPEC.md#color-tokens)
3. Result: Shell loads CSS once, remotes reuse it

### Workflow 2: Setup Remote App

1. Read: [USAGE-GUIDE.md → Remote App Setup](./USAGE-GUIDE.md#remote-app-setup)
2. Reference: [ARCHITECTURE.md → MFE Integration](./ARCHITECTURE.md#microfrontend-integration)
3. Result: Remote uses tokens without CSS duplication

### Workflow 3: Build a Component

1. Read: [USAGE-GUIDE.md → Building Components](./USAGE-GUIDE.md#building-components)
2. Reference: [TOKEN-SPEC.md](./TOKEN-SPEC.md) for token values
3. Reference: [ARCHITECTURE.md → Component Patterns](./ARCHITECTURE.md#component-patterns)
4. Result: Custom, type-safe component using design tokens

### Workflow 4: Use Utility Classes

1. Read: [USAGE-GUIDE.md → Using Utilities](./USAGE-GUIDE.md#using-utilities)
2. Reference: [TOKEN-SPEC.md](./TOKEN-SPEC.md) for utility class names
3. Result: Quickly style HTML without writing CSS

### Workflow 5: Implement Dark Mode

1. Read: [USAGE-GUIDE.md → Theming](./USAGE-GUIDE.md#theming)
2. Reference: [ARCHITECTURE.md → Theming & Runtime Customization](./ARCHITECTURE.md#theming--runtime-customization)
3. Result: Runtime theme switching with CSS variables

---

## 📦 Design System at a Glance

### Token Categories

```
Colors     → 20+ tokens (brand, semantic, neutral palette)
Spacing    → 7 tokens (8px unit system: xs to 3xl)
Typography → 15+ tokens (sizes, weights, line heights)
Shadows    → 4 tokens (elevation levels: sm to xl)
Borders    → 8 tokens (radius and width variants)
Z-Index    → 10 tokens (stacking context layers)
Breakpoints → 6 tokens (responsive sizes: xs to 2xl)
```

### Three Export Formats

```
TypeScript   → import { tokens } from '@vi/flux-ui'
SCSS         → @import '@vi/flux-ui/styles/variables'
CSS Custom   → var(--ds-color-primary)
```

### MFE Architecture

```
Shell loads CSS once
├── Design System CSS (15-25KB)
├── CSS Custom Properties (:root)
└── CSS Layers (reset, components, utilities)

Remotes consume tokens
├── Remote 1: Import tokens, reuse CSS ✓
├── Remote 2: Import tokens, reuse CSS ✓
└── Remote 3: Import tokens, reuse CSS ✓

Result: CSS not duplicated across MFEs ✓
```

---

## 🛠️ Common Tasks Quick Links

| Task | Go To |
|------|-------|
| Add a new color token | TOKEN-SPEC.md → Colors + ARCHITECTURE.md → Maintenance |
| Change primary color for deployment | ARCHITECTURE.md → Theming & Runtime Customization |
| Create Button component | USAGE-GUIDE.md → Building Components |
| Use tokens in Angular component | USAGE-GUIDE.md → Using Tokens |
| Style layout with flexbox | USAGE-GUIDE.md → Using Utilities → Layout |
| Debug CSS conflict in remote app | ARCHITECTURE.md → CSS Deduplication |
| Add dark mode theme | USAGE-GUIDE.md → Theming |
| Check breakpoint values | TOKEN-SPEC.md → Breakpoint Tokens |

---

## 📊 Bundle Impact Comparison

| Approach | Bundle Size | MFE Duplication | Dedup Support |
|----------|-------------|-----------------|---------------|
| Bootstrap | 180-230KB | ❌ Each MFE | ❌ Manual config required |
| Tailwind | 20-80KB | ❌ Each MFE | ❌ Shared config needed |
| **Design System (Ours)** | **15-25KB** | **✅ None (shell only)** | **✅ Native support** |

---

## 🎨 Design Philosophy

### Principles

1. **Microfrontend First** - CSS deduplication is fundamental
2. **Type Safety** - Tokens as TypeScript constants
3. **Minimal Surface Area** - Only 15-25KB base CSS
4. **Framework Agnostic** - Works with Angular, React, Web Components
5. **Explicit Over Implicit** - Clear naming, intentional patterns
6. **Progressive Enhancement** - CSS Layers for safe cascade

---

## 📞 FAQ

**Q: How do I import the design system in my app?**  
A: See [USAGE-GUIDE.md → Shell App Setup](./USAGE-GUIDE.md#shell-app-setup) or [Remote App Setup](./USAGE-GUIDE.md#remote-app-setup)

**Q: Why CSS Layers instead of BEM or other systems?**  
A: See [ARCHITECTURE.md → Style Layers](./ARCHITECTURE.md#style-layers)

**Q: What if I need a custom color not in tokens?**  
A: See [ARCHITECTURE.md → Maintenance & Governance](./ARCHITECTURE.md#maintenance--governance)

**Q: How do I handle CSS conflicts between shell and remote?**  
A: See [ARCHITECTURE.md → CSS Deduplication Strategy](./ARCHITECTURE.md#css-deduplication-strategy)

**Q: Which tokens should I use for padding?**  
A: See [TOKEN-SPEC.md → Spacing Tokens](./TOKEN-SPEC.md#spacing-tokens)

**Q: How do I implement dark mode?**  
A: See [USAGE-GUIDE.md → Theming](./USAGE-GUIDE.md#theming)

---

## 🔄 Workflow Pointers

### New Team Member?
1. Read CSS-DECISION.md (understand the why)
2. Skim ARCHITECTURE.md (understand the structure)
3. Use USAGE-GUIDE.md as reference (start coding)
4. Keep TOKEN-SPEC.md handy (for lookups)

### Ready to Build?
1. Refer to [USAGE-GUIDE.md](./USAGE-GUIDE.md) for your scenario
2. Look up tokens in [TOKEN-SPEC.md](./TOKEN-SPEC.md)
3. Reference [ARCHITECTURE.md](./ARCHITECTURE.md) for patterns
4. Comes back to [CSS-DECISION.md](./CSS-DECISION.md) if you have Why questions

### Troubleshooting?
1. Search relevant document (CSS not loading? → USAGE-GUIDE or ARCHITECTURE)
2. Check implementation against documented patterns
3. Verify token usage against TOKEN-SPEC.md
4. Review ARCHITECTURE.md's Troubleshooting section

---

## 📈 Next Steps

### Phase 1: Foundation ✅ COMPLETE
- Tokens defined (TS + SCSS + CSS vars)
- Reset styles created
- Utilities generated
- Documentation complete

### Phase 2: Sample Component
- [ ] Create Button component
- [ ] Test in shell app
- [ ] Document in Storybook
- [ ] Test in remote app

### Phase 3: MFE Testing
- [ ] Verify CSS loads once in shell
- [ ] Verify CSS not duplicated in remotes
- [ ] Test CSS variable inheritance
- [ ] Verify no namespace conflicts

### Phase 4: Team Onboarding
- [ ] Team review of decision
- [ ] Setup in all apps
- [ ] Process documentation
- [ ] Code review guidelines

---

## 📝 Document Index

| File | Purpose | Last Updated | Status |
|------|---------|--------------|--------|
| CSS-DECISION.md | Decision rationale | Mar 2026 | ✅ Complete |
| ARCHITECTURE.md | Technical design | Mar 2026 | ✅ Complete |
| USAGE-GUIDE.md | Hands-on examples | Mar 2026 | ✅ Complete |
| TOKEN-SPEC.md | Token reference | Mar 2026 | ✅ Complete |
| INDEX.md | This file | Mar 2026 | ✅ Complete |

---

## 🔗 Related Files

- **Package:** [libs/flux-ui/package.json](../package.json)
- **Config:** [tsconfig.base.json](../../tsconfig.base.json) (path aliases)
- **Main Export:** [libs/flux-ui/src/index.ts](../src/index.ts)
- **Tokens:** [libs/flux-ui/src/tokens/index.ts](../src/tokens/index.ts)
- **Styles:** [libs/flux-ui/src/styles/](../src/styles/)

---

**Last Updated:** March 2026  
**Maintained By:** Design System Team  
**Version:** 1.0

Start with [CSS-DECISION.md](./CSS-DECISION.md) to understand our approach!
