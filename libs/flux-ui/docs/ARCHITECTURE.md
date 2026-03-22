# Design System Architecture

**Purpose:** Technical implementation guide for the design system in a microfrontend environment.

---

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Token System](#token-system)
3. [Style Layers](#style-layers)
4. [CSS Deduplication Strategy](#css-deduplication-strategy)
5. [Component Patterns](#component-patterns)
6. [Microfrontend Integration](#microfrontend-integration)
7. [Theming & Runtime Customization](#theming--runtime-customization)

---

## Directory Structure

```
libs/flux-ui/
├── src/
│   ├── index.ts                    # Main entry point
│   │
│   ├── tokens/
│   │   └── index.ts               # Token definitions (TS + types)
│   │
│   ├── styles/
│   │   ├── index.ts               # Style aggregator
│   │   ├── _variables.scss        # SCSS + CSS custom properties (:root)
│   │   ├── _reset.scss            # Browser reset (CSS Layers)
│   │   ├── _layout.scss           # Flexbox/Grid utilities
│   │   ├── _utilities.scss        # Generated: spacing, typography, colors
│   │   └── components/            # Component styles (future)
│   │       ├── button.scss
│   │       ├── input.scss
│   │       └── card.scss
│   │
│   └── components/                # Component implementations (future)
│       ├── button/
│       │   ├── button.component.ts
│       │   ├── button.stories.ts  # Storybook
│       │   └── button.spec.ts
│       ├── form-input/
│       └── card/
│
├── docs/
│   ├── CSS-DECISION.md            # Decision rationale (this file)
│   ├── ARCHITECTURE.md            # Technical architecture (this file)
│   ├── USAGE-GUIDE.md             # How to use in apps
│   └── TOKEN-SPEC.md              # Detailed token reference
│
├── project.json                   # Nx project config
├── package.json                   # NPM package metadata
├── tsconfig.json                  # TypeScript config
├── eslint.config.mjs              # ESLint config
└── README.md                      # Package overview
```

---

## Token System

### Three-Tier Token Export

Tokens are exported in three formats to serve different consumption patterns:

#### 1. TypeScript Constants (Type-Safe)

**File:** `src/tokens/index.ts`

```typescript
export const tokens = {
  colors: {
    primary: 'var(--ds-color-primary)',
    secondary: 'var(--ds-color-secondary)',
  },
  spacing: {
    xs: 'var(--ds-spacing-xs)',
    sm: 'var(--ds-spacing-sm)',
  },
} as const;

// Usage in components:
import { tokens } from '@vi/flux-ui';

const style = {
  padding: tokens.spacing.md,  // Type-safe ✅
  color: tokens.colors.primary
};
```

**Advantages:**
- ✅ Compile-time type checking
- ✅ IDE autocomplete
- ✅ Refactoring support (rename-all)
- ✅ Values resolve to CSS variables at runtime

#### 2. SCSS Variables (Build-Time)

**File:** `src/styles/_variables.scss`

```scss
// Direct values for Sass compilation
$color-primary: #0066cc;
$spacing-sm: 16px;

// Usage in component styles:
@import '@vi/flux-ui/styles/variables';

.button {
  padding: $spacing-sm;
  background: $color-primary;
}
```

**Advantages:**
- ✅ Compile-time optimization
- ✅ Can be used in calculations: `$spacing-sm * 2`
- ✅ No runtime overhead
- ✅ Mixin generation: `@each $name, $value in $color-map { ... }`

#### 3. CSS Custom Properties (Runtime)

**File:** `src/styles/_variables.scss` (`:root` block)

```css
:root {
  --ds-color-primary: #0066cc;
  --ds-spacing-sm: 16px;
}

/* Usage in CSS/HTML: */
element {
  padding: var(--ds-spacing-sm);
  color: var(--ds-color-primary);
}

/* Or JavaScript: */
element.style.padding = getComputedStyle(root).getPropertyValue('--ds-spacing-sm');
```

**Advantages:**
- ✅ Runtime themeable (change colors in JS)
- ✅ Inherited by child elements
- ✅ Can override in media queries
- ✅ Works across MFE boundaries (shell loads once)

---

## Style Layers

### CSS Cascade Layers Architecture

We use CSS Layers (`@layer`) to manage cascade and avoid specificity wars:

```scss
@layer reset, components, utilities;

@layer reset {
  /* Browser defaults, lowest specificity */
  * { box-sizing: border-box; }
  body { margin: 0; }
}

@layer components {
  /* Reusable component styles, mid priority */
  .button { ... }
  .input { ... }
  .card { ... }
}

@layer utilities {
  /* Utility classes, highest priority within layers */
  .m-1 { margin: 8px; }
  .p-2 { padding: 16px; }
}
```

### Layer Priority (bottom wins)

```
reset < components < utilities
```

Specificity is ignored; only layer order matters. This prevents:
- ❌ Shell's button style overpowering remote's override
- ❌ Nested selectors creating specificity arms race
- ❌ !important hacks

### Cross-MFE Safety

When remote1 app loads its own component styles, it's automatically layered:

```scss
// remote1/src/app/app.component.scss
@layer components {
  .local-component { ... }
}

/* Result: */
/* 1. Shell loads: @layer reset, components, utilities */
/* 2. Remote loads: @layer reset, components, utilities */
/* 3. CSS Layers merge: reset stays lowest, components in the middle */
```

No conflicts ✅

---

## CSS Deduplication Strategy

### Problem: How to avoid shipping CSS multiple times?

In a standard MFE setup:
```
shell/
  └── build
       └── main.css (includes import of flux-ui)

remote1/
  └── build
       └── main.css (DUPLICATES flux-ui!)

remote2/
  └── build
       └── main.css (DUPLICATES flux-ui!)
```

**Total bundle:** 3× CSS downloaded

### Solution: Lazy Load at Shell

**File:** `apps/shell/src/bootstrap.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import App from './app/app.component';

// Load design system styles once at root
// This happens BEFORE any remote app is loaded
import '@vi/flux-ui/styles';  // ← Loaded once

bootstrapApplication(App).catch((err) => console.error(err));
```

**File:** `apps/remote1/src/bootstrap.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import RemoteEntry from './app/app.component';

// Do NOT import flux-ui styles here
// They're already loaded by the shell

bootstrapApplication(RemoteEntry).catch((err) => console.error(err));
```

**Result:**
- Shell (first load): Shell CSS + Design System CSS
- Remote1 (lazy loaded): Remote CSS only (no duplication)
- Remote2 (lazy loaded): Remote CSS only (no duplication)

**Total bundle:** 1× Design System CSS + N× App CSS

### Alternative: Module Federation Shared Library

If using MF's `shared` config:

```javascript
// webpack.config.ts
shared: {
  '@vi/flux-ui': {
    singleton: true,
    requiredVersion: 'auto'
  }
}
```

This tells each MFE: "Share this library - don't duplicate."

**Benefit:** Automatic deduplication at the bundler level.

---

## Component Patterns

### Component Structure

```
libs/flux-ui/src/components/button/
├── button.component.ts        # Angular component
├── button.component.html      # Template
├── button.component.scss      # Styles
├── button.spec.ts             # Tests
└── button.stories.ts          # Storybook
```

### Component Implementation Pattern

**File:** `button.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { tokens } from '@vi/flux-ui';

@Component({
  selector: 'ds-button',
  template: `
    <button 
      [class]="'btn btn--' + variant"
      [style]="{ padding: tokens.spacing.md }">
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  
  // Import tokens
  tokens = tokens;
}
```

**File:** `button.component.scss`

```scss
@import '../../styles/variables';

@layer components {
  .btn {
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;

    &--primary {
      background: $color-primary;
      color: white;

      &:hover {
        opacity: 0.9;
      }
    }

    &--secondary {
      background: $color-neutral-200;
      color: $color-foreground;

      &:hover {
        background: $color-neutral-300;
      }
    }
  }
}
```

### Style Encapsulation Options

#### 1. View Encapsulation (Angular Native) - Recommended for MFE

```typescript
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'ds-button',
  template: `...`,
  styleUrl: './button.component.scss',
  encapsulation: ViewEncapsulation.Emulated  // or ShadowDom
})
export class ButtonComponent { }
```

**Emulated:** CSS is scoped to component (prefixed with unique IDs)  
**ShadowDom:** Native browser isolation (maximum safety, slight perf cost)

#### 2. CSS Layers (Recommended for broad utilities)

Already built into utilities:

```scss
@layer utilities {
  .m-1 { margin: 8px; }  // Won't override .m-1 in other layers
  .p-1 { padding: 8px; }
}
```

---

## Microfrontend Integration

### Shell App Setup

**File:** `apps/shell/src/styles.scss`

```scss
// Global design system styles (load once for all MFEs)
@import '@vi/flux-ui/styles/variables';
@import '@vi/flux-ui/styles/reset';
@import '@vi/flux-ui/styles/layout';
@import '@vi/flux-ui/styles/utilities';

// Optional: App-specific overrides
:root {
  // Can override tokens at runtime here
  --ds-color-primary: #FF6B35;  // Brand color override for this deployment
}
```

**File:** `apps/shell/src/bootstrap.ts`

```typescript
// Tokens imported for use in component code
import { tokens } from '@vi/flux-ui';

console.log('Available tokens:', tokens);
```

### Remote App Setup

**File:** `apps/remote1/src/bootstrap.ts`

```typescript
// DO NOT import styles (shell already loaded them)

// DO import tokens for component use
import { tokens } from '@vi/flux-ui';

bootstrapApplication(RemoteEntry).catch(err => console.error(err));
```

**File:** `apps/remote1/src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { tokens } from '@vi/flux-ui';

@Component({
  selector: 'app-root',
  template: `
    <div [style]="{ 
      padding: tokens.spacing.lg,
      backgroundColor: tokens.colors.background,
      color: tokens.colors.foreground
    }">
      Remote App Content
    </div>
  `,
})
export class AppComponent {
  tokens = tokens;
}
```

### Benefits of This Pattern

- ✅ Shell loads design system CSS **once**
- ✅ All remotes **inherit** the loaded CSS variables
- ✅ Remote apps **reuse** tokens without duplication
- ✅ No namespace conflicts (CSS Layers + View Encapsulation)
- ✅ Tokens accessible everywhere (TS + CSS + runtime)

---

## Theming & Runtime Customization

### Static Theming (Build-Time)

Create theme variants:

```
libs/flux-ui/
├── src/
│   └── themes/
│       ├── light.scss
│       ├── dark.scss
│       └── brand-blue.scss
```

**File:** `src/themes/dark.scss`

```scss
:root[data-theme="dark"] {
  --ds-color-background: #1f2937;
  --ds-color-foreground: #f9fafb;
  --ds-color-primary: #60a5fa;
}
```

**Usage in HTML:**

```html
<html data-theme="dark">
  <!-- All CSS variables updated -->
</html>
```

### Dynamic Theming (Runtime)

**File:** `apps/shell/src/services/theme.service.ts`

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  setTheme(theme: 'light' | 'dark') {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }

  setCustomColor(token: string, value: string) {
    const root = document.documentElement;
    root.style.setProperty(`--ds-color-${token}`, value);
  }
}
```

**Usage in component:**

```typescript
constructor(private themeService: ThemeService) {}

toggleTheme() {
  this.themeService.setTheme('dark');
}

setCustomPrimary(color: string) {
  this.themeService.setCustomColor('primary', color);
}
```

### Benefits

- ✅ No rebuild needed to change theme
- ✅ Smooth transitions with CSS vars
- ✅ Can theme per user/deployment
- ✅ A/B testing different colors

---

## Maintenance & Governance

### Token Lifecycle

1. **Design proposes** new spacing value
2. **Defined in** `src/tokens/index.ts` + `_variables.scss`
3. **Generated** CSS custom properties in `:root`
4. **Used by** all components in all MFEs
5. **Updated** in one place, reflects everywhere

### Component Lifecycle

1. **Identified need** for new component (e.g., Checkbox)
2. **Created in** `libs/flux-ui/src/components/checkbox/`
3. **Documented in** Storybook
4. **Exported from** `libs/flux-ui/src/index.ts`
5. **Imported by** remote apps: `import { CheckboxComponent } from '@vi/flux-ui'`

### Versioning

- **Major:** Breaking API changes (component props renamed)
- **Minor:** New features (new token, new component)
- **Patch:** Bug fixes (styling corrections)

---

## Performance Considerations

### Bundle Impact

**Design System Core:**
- CSS: 15-25KB (gzipped)
- TS Tokens: 2-3KB
- Total: 17-28KB shared across all MFEs

**Per Remote App:**
- Design System not re-bundled ✅
- Only remote-specific styles (~5-10KB)

### CSS Selectors Count

**Utility layer:**
```
spacing utilities: 7 sizes × 4 directions = 28 classes
colors: 1 primary + 1 secondary + 10 neutral + 4 semantic = 16 classes
Total: ~200 utility classes
```

**Impact:** Minimal (CSS files are fast to download/parse)

### Runtime Overhead

- **CSS Layers:** Native browser feature, zero JS overhead
- **CSS Variables:** ~4-6ms for 100 getPropertyValue() calls
- **View Encapsulation (Emulated):** ~2-3ms per component tree

**Conclusion:** Negligible ✅

---

## Future Enhancements

- [ ] Component Storybook documentation site
- [ ] Dark mode theme variants
- [ ] Accessibility audit and WCAG compliance guide
- [ ] Animation/transition library
- [ ] Icon system integration
- [ ] Typography scale expansion

---

## Troubleshooting

### Q: Styles not applied in remote app?
**A:** Ensure shell has loaded design system CSS before remote bootstraps.

### Q: Namespace collision between shell and remote?
**A:** Wrap component styles with `@layer components` and use View Encapsulation.

### Q: Tokens not accessible in remote app?
**A:** Verify `@vi/flux-ui` is in `shared` config for Module Federation.

### Q: CSS variables not changing with theme?
**A:** Use `document.documentElement.style.setProperty('--ds-color-primary', '#newColor')`, not CSS file changes.

---

**Document Version:** 1.0  
**Last Updated:** March 2026
