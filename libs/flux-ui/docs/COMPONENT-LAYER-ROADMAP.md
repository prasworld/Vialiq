# Component Layer Implementation Guide

**Flux-UI Component Architecture for MFEs**

---

## Quick Reference: Architecture Decision

### Why Web Components?

| Approach | MFE Compatibility | Framework Flexibility | Bundle Impact | Performance |
|----------|------------------|----------------------|----------------|-------------|
| **Web Components** (Recommended) | ✅ Perfect | ✅ Any framework | Low | Fast |
| HTML Templates | ✅ Perfect | ⚠️ Limited JS | Very Low | Fast |
| React Components | ❌ React-only | ❌ Fragrant | Medium | Fast |
| Vue Components | ❌ Vue-only | ❌ Fragrant | Medium | Fast |
| Vanilla Classes | ✅ Good | ✅ Good | Low | Varies |

**Decision: Web Components (with React wrapper for convenience)**

---

## Phase 1: Foundation Layer (Infrastructure)

### 1.1 Setup Lit.js-based Web Components

```bash
# Add Lit to flux-ui-wc
npm install lit
npm install -D @lit/ts-mixins
```

### 1.2 Create Component Structure

```
libs/flux-ui-wc/
├── src/
│   ├── index.ts                 # Main export
│   ├── types.ts                 # Shared types
│   ├── styles/
│   │   ├── button.styles.ts
│   │   ├── input.styles.ts
│   │   └── shared.styles.ts
│   └── components/
│       ├── button/
│       │   ├── Button.ts         # Web Component
│       │   ├── Button.test.ts
│       │   └── button.stories.ts
│       ├── input/
│       │   ├── Input.ts
│       │   ├── Input.test.ts
│       │   └── input.stories.ts
│       └── ...
├── package.json
└── tsconfig.json
```

### 1.3 Styling Strategy

**Use CSS-in-JS via Lit (template literals):**

```typescript
// libs/flux-ui-wc/src/styles/button.styles.ts
import { css } from 'lit';
import { tokens } from '@vi/flux-ui';

export const buttonStyles = css`
  :host {
    --btn-padding: var(--vi-spacing-md);
    --btn-gap: var(--vi-spacing-sm);
    --btn-font-size: var(--vi-font-size-base);
    --btn-border-radius: var(--vi-border-radius-md);
    --btn-min-width: 40px;
  }

  :host([size="sm"]) {
    --btn-padding: var(--vi-spacing-sm) var(--vi-spacing-md);
  }

  :host([size="lg"]) {
    --btn-padding: var(--vi-spacing-lg) var(--vi-spacing-xl);
  }

  /* Variant: primary */
  :host([variant="primary"]) {
    --btn-bg: var(--vi-color-primary);
    --btn-text: white;
    --btn-hover-bg: var(--vi-color-primary-hover);
  }

  /* Variant: secondary */
  :host([variant="secondary"]) {
    --btn-bg: var(--vi-color-secondary);
    --btn-text: var(--vi-color-text-primary);
    --btn-hover-bg: var(--vi-color-secondary-hover);
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--btn-gap);
    
    padding: var(--btn-padding);
    font-size: var(--btn-font-size);
    border-radius: var(--btn-border-radius);
    min-width: var(--btn-min-width);
    
    background-color: var(--btn-bg);
    color: var(--btn-text);
    border: none;
    cursor: pointer;
    
    transition: all 200ms ease;
  }

  button:hover {
    background-color: var(--btn-hover-bg);
    transform: translateY(-1px);
  }

  button:focus-visible {
    outline: 2px solid var(--vi-color-focus-ring);
    outline-offset: 2px;
  }

  button:active {
    transform: translateY(0px);
  }

  :host([disabled]) button {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

### 1.4 Core Component Base Class

```typescript
// libs/flux-ui-wc/src/types.ts
import { LitElement } from 'lit';

export abstract class ViComponent extends LitElement {
  // Shared behavior:
  // - Keyboard navigation
  // - Focus management
  // - ARIA attributes
  // - Theme-aware rendering
  
  protected emitCustomEvent<T>(
    name: string,
    detail?: T,
    options: CustomEventInit<T> = {}
  ) {
    return this.dispatchEvent(
      new CustomEvent(name, {
        ...options,
        composed: true, // Traverse shadow DOM
        bubbles: true,
      })
    );
  }

  protected updateAriaAttribute(attr: string, value: any) {
    this.setAttribute(`aria-${attr}`, value);
  }
}
```

---

## Phase 2: Core Components

### 2.1 Button Component

```typescript
// libs/flux-ui-wc/src/components/button/Button.ts
import { html, LitElement, property } from 'lit';
import { buttonStyles } from '../../styles/button.styles';

/**
 * VI Button Component
 * 
 * @element vi-button
 * @prop {string} variant - 'primary' | 'secondary' | 'danger'
 * @prop {string} size - 'sm' | 'md' | 'lg'
 * @prop {boolean} disabled - Disable button
 * @prop {boolean} loading - Show loading spinner
 * 
 * @event {CustomEvent} vi-click - Fired on button click
 * 
 * @example
 *   <vi-button variant="primary" size="md">
 *     Click me
 *   </vi-button>
 */
@customElement('vi-button')
export class ViButton extends LitElement {
  static override styles = buttonStyles;

  @property({ type: String, reflect: true })
  variant: 'primary' | 'secondary' | 'danger' = 'primary';

  @property({ type: String, reflect: true })
  size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  loading = false;

  @property({ type: String })
  type: 'button' | 'submit' | 'reset' = 'button';

  constructor() {
    super();
    this.addEventListener('click', this.#handleClick);
  }

  override render() {
    return html`
      <button 
        type=${this.type} 
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading}
      >
        ${this.loading ? html`<span class="spinner"></span>` : ''}
        <slot></slot>
      </button>
    `;
  }

  #handleClick = (e: Event) => {
    if (!this.disabled && !this.loading) {
      this.emitCustomEvent('vi-click', { originalEvent: e });
    }
  };

  private emitCustomEvent(name: string, detail: any) {
    return this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        composed: true,
        bubbles: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-button': ViButton;
  }
}
```

### 2.2 Input Component

```typescript
// libs/flux-ui-wc/src/components/input/Input.ts
import { html, LitElement, property } from 'lit';
import { inputStyles } from '../../styles/input.styles';

/**
 * VI Input Component
 * 
 * @element vi-input
 * @prop {string} type - Input type (text, email, password, etc)
 * @prop {string} value - Input value
 * @prop {string} placeholder - Placeholder text
 * @prop {boolean} disabled - Disable input
 * @prop {boolean} readonly - Read-only input
 * @prop {string} error - Error message
 * 
 * @event {CustomEvent} vi-input - Fired on input change
 * @event {CustomEvent} vi-change - Fired on blur
 * 
 * @example
 *   <vi-input 
 *     type="email" 
 *     placeholder="Enter email"
 *     @vi-change=${handleChange}
 *   ></vi-input>
 */
@customElement('vi-input')
export class ViInput extends LitElement {
  static override styles = inputStyles;

  @property({ type: String, reflect: true })
  type: 'text' | 'email' | 'password' | 'search' | 'number' = 'text';

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = '';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: Boolean, reflect: true })
  readonly = false;

  @property({ type: String })
  error = '';

  @property({ type: String })
  name = '';

  @property({ type: String })
  id = '';

  override render() {
    return html`
      <div class="wrapper">
        <input
          type=${this.type}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?aria-invalid=${!!this.error}
          aria-described-by=${this.error ? `error-${this.id}` : ''}
          @input=${this.#handleInput}
          @change=${this.#handleChange}
          @focus=${this.#handleFocus}
          @blur=${this.#handleBlur}
        />
        ${this.error ? html`
          <span class="error" id="error-${this.id}">
            ${this.error}
          </span>
        ` : ''}
      </div>
    `;
  }

  #handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.emitCustomEvent('vi-input', { value: this.value });
  };

  #handleChange = (e: Event) => {
    this.emitCustomEvent('vi-change', { value: this.value });
  };

  #handleFocus = () => {
    this.emitCustomEvent('vi-focus');
  };

  #handleBlur = () => {
    this.emitCustomEvent('vi-blur');
  };

  private emitCustomEvent(name: string, detail: any) {
    return this.dispatchEvent(
      new CustomEvent(name, {
        detail,
        composed: true,
        bubbles: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'vi-input': ViInput;
  }
}
```

---

## Phase 3: React Wrapper Layer

```typescript
// libs/flux-ui-react/src/Button.tsx
import { forwardRef } from 'react';
import type { HTMLAttributes, PropsWithChildren } from 'react';
import '@vi/flux-ui-wc/button';

type ViButtonElement = (
  HTMLAttributes<HTMLElement> & {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: (e: React.SyntheticEvent) => void;
  }
);

export const Button = forwardRef<
  HTMLElement,
  PropsWithChildren<ViButtonElement>
>(
  (
    {
      children,
      onClick,
      ...rest
    },
    ref
  ) => {
    return (
      <vi-button
        ref={ref as any}
        onClick={onClick}
        {...rest}
      >
        {children}
      </vi-button>
    );
  }
);

Button.displayName = 'Button';
```

---

## Phase 4: Documentation & Testing

### 4.1 Storybook Stories

```typescript
// libs/flux-ui-wc/src/components/button/button.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Button';

const meta: Meta = {
  title: 'Components/Button',
  component: 'vi-button',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Primary: Story = {
  render: () => html`
    <vi-button variant="primary">
      Primary Button
    </vi-button>
  `,
};

export const Secondary: Story = {
  render: () => html`
    <vi-button variant="secondary">
      Secondary Button
    </vi-button>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem;">
      <vi-button size="sm">Small</vi-button>
      <vi-button size="md">Medium</vi-button>
      <vi-button size="lg">Large</vi-button>
    </div>
  `,
};

export const Loading: Story = {
  render: () => html`
    <vi-button loading>
      Loading...
    </vi-button>
  `,
};

export const Disabled: Story = {
  render: () => html`
    <vi-button disabled>
      Disabled
    </vi-button>
  `,
};
```

### 4.2 Tests

```typescript
// libs/flux-ui-wc/src/components/button/Button.test.ts
import { fixture, expect } from '@open-wc/testing';
import { html } from 'lit';
import './Button';

describe('ViButton', () => {
  it('renders with slot content', async () => {
    const el = await fixture<HTMLElement>(html`
      <vi-button>Click Me</vi-button>
    `);

    expect(el.textContent).to.include('Click Me');
  });

  it('respects disabled attribute', async () => {
    const el = await fixture<HTMLElement>(html`
      <vi-button disabled>Disabled</vi-button>
    `);

    expect(el.getAttribute('disabled')).to.exist;
  });

  it('emits vi-click event', async () => {
    const el = await fixture<HTMLElement>(html`
      <vi-button>Click</vi-button>
    `);

    const listener = sinon.spy();
    el.addEventListener('vi-click', listener);
    el.querySelector('button')?.click();

    expect(listener.called).to.be.true;
  });

  it('supports size variants', async () => {
    const el = await fixture<HTMLElement>(html`
      <vi-button size="lg">Large</vi-button>
    `);

    expect(el.getAttribute('size')).to.equal('lg');
  });
});
```

---

## Build Configuration

### Nx Project Configuration

```json
{
  "name": "flux-ui-wc",
  "projectType": "library",
  "sourceRoot": "libs/flux-ui-wc/src",
  "targets": {
    "build": {
      "executor": "@nx/esbuild:esbuild",
      "options": {
        "outputPath": "dist/libs/flux-ui-wc",
        "main": "libs/flux-ui-wc/src/index.ts",
        "format": ["esm"],
        "assets": [
          "libs/flux-ui-wc/README.md"
        ],
        "additionalEntryPoints": [
          "libs/flux-ui-wc/src/button/index.ts",
          "libs/flux-ui-wc/src/input/index.ts"
        ]
      }
    },
    "storybook": {
      "executor": "@storybook/angular:build-storybook",
      "options": {
        "configDir": "libs/flux-ui-wc/.storybook",
        "outputDir": "dist/storybook/flux-ui-wc"
      }
    }
  }
}
```

---

## Integration Pattern (MFE Usage)

### Shell App (loads once)

```typescript
// apps/shell/src/bootstrap.ts
import '@vi/flux-ui/styles';        // Core styles
import '@vi/flux-ui-wc';            // Web Components

bootstrap();
```

### Remote App (React)

```typescript
// apps/remote1/src/bootstrap.ts (NO style import)
import { Button } from '@vi/flux-ui-react';
import { tokens } from '@vi/flux-ui';

export function App() {
  return (
    <Button variant="primary" size="md">
      Click me
    </Button>
  );
}
```

### Remote App (Angular)

```typescript
// apps/remote2/src/app.component.ts
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-root',
  template: html`<vi-button variant="primary">Click</vi-button>`,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppComponent {}
```

---

## Checklist for Implementation

### Phase 1: Foundation
- [ ] Create `libs/flux-ui-wc` project structure
- [ ] Setup Lit.js + TypeScript config
- [ ] Create style system (CSS-in-JS)
- [ ] Create base component class
- [ ] Setup Storybook + testing infrastructure

### Phase 2: Core Components
- [ ] Button (4 variants × 3 sizes)
- [ ] Input (4 types + states)
- [ ] Select/Dropdown
- [ ] Checkbox/Radio
- [ ] Modal/Dialog
- [ ] Toast/Alert

### Phase 3: Utilities
- [ ] Badge
- [ ] Avatar
- [ ] Breadcrumb
- [ ] Tabs
- [ ] Pagination
- [ ] Tooltip

### Phase 4: Documentation
- [ ] Complete Storybook
- [ ] Integration guide
- [ ] API documentation
- [ ] Usage examples
- [ ] Migration guide

### Phase 5: Ecosystem
- [ ] React wrapper (`@vi/flux-ui-react`)
- [ ] Vue wrapper (`@vi/flux-ui-vue`)
- [ ] Angular module (`@vi/flux-ui-angular`)
- [ ] Icon system
- [ ] Animation system

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Bundle Size (Web Components only) | <40 KB |
| Bundle Size (+ React wrapper) | <50 KB |
| Component Coverage | 25+ core components |
| Test Coverage | >90% |
| Lighthouse Score | >95 |
| a11y (axe) Score | 100 |
| Documentation | 100% components |
| Adoption (MFEs using) | 3+ apps Q4 2026 |

