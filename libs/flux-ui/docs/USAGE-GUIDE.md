# Design System Usage Guide

**Quick start guide for using the design system in shell and remote applications.**

---

## Table of Contents

1. [Installation](#installation)
2. [Shell App Setup](#shell-app-setup)
3. [Remote App Setup](#remote-app-setup)
4. [Using Tokens](#using-tokens)
5. [Using Utilities](#using-utilities)
6. [Building Components](#building-components)
7. [Theming](#theming)
8. [Common Patterns](#common-patterns)

---

## Installation

The design system is a local Nx library, no npm install needed.

```typescript
// Import from the local library
import { tokens } from '@vi/flux-ui';
import '@vi/flux-ui/styles';
```

---

## Shell App Setup

The shell application is responsible for loading the design system once.

### Step 1: Import Styles in Global CSS

**File:** `apps/shell/src/styles.scss`

```scss
// Load all design system styles
@import '@vi/flux-ui/styles/variables';
@import '@vi/flux-ui/styles/reset';
@import '@vi/flux-ui/styles/layout';
@import '@vi/flux-ui/styles/utilities';

// App-specific overrides (optional)
body {
  // Custom app-wide styles
}

// Override tokens at runtime (optional)
:root {
  --ds-color-primary: #FF6B35; // Brand color for this deployment
}
```

### Step 2: Load in Bootstrap

**File:** `apps/shell/src/bootstrap.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import App from './app/app.component';
import appConfig from './app/app.config';

// Import tokens for use in component code
import { tokens } from '@vi/flux-ui';

// styles.scss is already referenced in project.json
// No need to import again

bootstrapApplication(App, appConfig).catch(err => console.error(err));
```

### Step 3: Use Tokens in Components

**File:** `apps/shell/src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { tokens } from '@vi/flux-ui';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <header [style]="{ 
        padding: tokens.spacing.md,
        backgroundColor: tokens.colors.primary
      }">
        <h1>My App</h1>
      </header>
      <main>
        <ng-content></ng-content>
      </main>
    </div>
  `,
  styleUrl: './app.scss',
})
export class AppComponent {
  tokens = tokens;  // Make available in template
}
```

---

## Remote App Setup

Remote applications inherit the design system from the shell.

### Step 1: Do NOT Import Styles

**File:** `apps/remote1/src/bootstrap.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import RemoteEntry from './app/app.component';

// ❌ DO NOT import '@vi/flux-ui/styles'
// Shell already loaded it

bootstrapApplication(RemoteEntry).catch(err => console.error(err));
```

### Step 2: Import Tokens Only

**File:** `apps/remote1/src/app/app.component.ts`

```typescript
import { Component } from '@angular/core';
import { tokens } from '@vi/flux-ui';

@Component({
  selector: 'app-remote-entry',
  template: `
    <div class="remote-container">
      <h2>Remote App</h2>
      <!-- Use tokens here -->
    </div>
  `,
  styleUrl: './app.scss',
})
export class RemoteEntryComponent {
  tokens = tokens;
}
```

### Step 3: Use Utilities in Styles

**File:** `apps/remote1/src/app/app.scss`

```scss
// You can import variables if needed for component-specific styles
@import '@vi/flux-ui/styles/variables';

.remote-container {
  padding: $spacing-md;
  background: $color-background;
  color: $color-foreground;
}
```

---

## Using Tokens

### In TypeScript

```typescript
import { tokens } from '@vi/flux-ui';

// Type-safe token access
const padding = tokens.spacing.md;        // 'var(--vi-spacing-md)'
const color = tokens.colors.primary;      // 'var(--vi-color-primary)'
const shadow = tokens.shadows.lg;         // 'var(--vi-shadow-lg)'

// Usage in inline styles
const style = {
  padding: tokens.spacing.md,
  color: tokens.colors.primary,
  boxShadow: tokens.shadows.md,
};
```

### In SCSS

```scss
@import '@vi/flux-ui/styles/variables';

.button {
  padding: $spacing-sm $spacing-md;
  background-color: $color-primary;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
}
```

### In CSS

```css
.button {
  padding: var(--vi-spacing-sm) var(--vi-spacing-md);
  background-color: var(--vi-color-primary);
  border-radius: var(--vi-border-radius-md);
  box-shadow: var(--vi-shadow-md);
}
```

---

## Using Utilities

### Spacing Utilities

```html
<!-- Margin utilities -->
<div class="m-md">Margin all sides</div>
<div class="mx-lg">Margin left and right</div>
<div class="mt-sm">Margin top</div>

<!-- Padding utilities -->
<div class="p-md">Padding all sides</div>
<div class="px-lg">Padding left and right</div>
<div class="py-sm">Padding top and bottom</div>
```

### Typography Utilities

```html
<p class="text-lg font-semibold leading-tight">Large, semibold, tight</p>
<p class="text-base font-normal leading-relaxed">Base, normal, relaxed</p>
<code class="text-sm text-neutral-600">Small monospace text</code>
```

### Color Utilities

```html
<!-- Text colors -->
<p class="text-primary">Primary text</p>
<p class="text-success">Success message</p>
<p class="text-error">Error message</p>

<!-- Background colors -->
<div class="bg-primary">Primary background</div>
<div class="bg-neutral-100">Light neutral background</div>

<!-- Border colors -->
<div class="border-primary border-base">Blue border</div>
```

### Layout Utilities

```html
<!-- Flexbox -->
<div class="flex justify-between items-center gap-md">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Grid -->
<div class="grid grid-cols-3 gap-md">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- Display -->
<div class="hidden">Hidden on all screens</div>
<div class="block">Block element</div>
```

### Rounded Corners

```html
<div class="rounded-sm">2px radius</div>
<div class="rounded-md">4px radius</div>
<div class="rounded-lg">8px radius</div>
<div class="rounded-full">Circular</div>
```

### Shadows

```html
<div class="shadow-sm">Subtle shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
```

### Z-Index

```html
<div class="z-dropdown">Dropdown layer</div>
<div class="z-modal">Modal layer</div>
<div class="z-tooltip">Tooltip layer</div>
```

---

## Building Components

### Creating a Button Component

**File:** `apps/shell/src/app/components/button.component.ts`

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { tokens } from '@vi/flux-ui';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      [class]="'btn btn--' + variant"
      [disabled]="disabled"
      (click)="onClick.emit($event)">
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'danger' = 'primary';
  @Input() disabled = false;
  @Output() onClick = new EventEmitter<MouseEvent>();

  tokens = tokens;
}
```

**File:** `apps/shell/src/app/components/button.component.scss`

```scss
@import '@vi/flux-ui/styles/variables';

@layer components {
  .btn {
    padding: $spacing-sm $spacing-md;
    border-radius: $border-radius-md;
    border: none;
    font-weight: $font-weight-semibold;
    cursor: pointer;
    transition: all 0.2s ease;

    &--primary {
      background: $color-primary;
      color: white;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    &--secondary {
      background: $color-neutral-200;
      color: $color-foreground;

      &:hover:not(:disabled) {
        background: $color-neutral-300;
      }
    }

    &--danger {
      background: $color-error;
      color: white;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }
    }
  }
}
```

### Using the Button

```typescript
import { Component } from '@angular/core';
import { ButtonComponent } from './components/button.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="p-lg">
      <app-button variant="primary">Save</app-button>
      <app-button variant="secondary">Cancel</app-button>
      <app-button variant="danger">Delete</app-button>
    </div>
  `,
})
export class AppComponent {}
```

---

## Theming

### Light/Dark Theme

**File:** `apps/shell/src/app/services/theme.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme$ = new BehaviorSubject<'light' | 'dark'>('light');

  setTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
    this.theme$.next(theme);
  }

  getTheme() {
    return this.theme$.asObservable();
  }
}
```

**File:** `apps/shell/src/styles.scss`

```scss
// Light theme (default)
:root {
  --ds-color-background: #ffffff;
  --ds-color-foreground: #111827;
}

// Dark theme
:root[data-theme="dark"] {
  --ds-color-background: #1f2937;
  --ds-color-foreground: #f9fafb;
  --ds-color-primary: #60a5fa;  // Lighter blue for dark mode
}
```

**File:** `apps/shell/src/app/app.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  template: `
    <button (click)="toggleTheme()">Toggle Theme</button>
  `,
})
export class AppComponent {
  private themeService = inject(ThemeService);

  toggleTheme() {
    this.themeService.getTheme().subscribe(current => {
      this.themeService.setTheme(current === 'light' ? 'dark' : 'light');
    });
  }
}
```

---

## Common Patterns

### Responsive Text Sizing

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-heading',
  template: `
    <h1 class="text-3xl md:text-4xl lg:text-5xl">
      {{ title }}
    </h1>
  `,
  styles: [`
    :host {
      --ds-font-size-3xl: 30px;
    }
    @media (min-width: 768px) {
      :host {
        --ds-font-size-3xl: 36px;
      }
    }
  `]
})
export class HeadingComponent {
  @Input() title = '';
}
```

### Responsive Grid

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

### Conditional Spacing

```typescript
import { Component, Input } from '@angular/core';
import { tokens } from '@vi/flux-ui';

@Component({
  selector: 'app-card',
  template: `
    <div [style]="{
      padding: size === 'large' ? tokens.spacing.lg : tokens.spacing.md
    }">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  tokens = tokens;
}
```

---

## Next Steps

- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Check [TOKEN-SPEC.md](./TOKEN-SPEC.md) for complete token reference
- Read [CSS-DECISION.md](./CSS-DECISION.md) for design rationale

---

**Document Version:** 1.0  
**Last Updated:** March 2026
