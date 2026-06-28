# EDC Platform Development Plan — Part 4: Release & Testing

**Date:** May 31, 2026  
**Version:** 1.0 (Phase 7 only)  
**Status:** 📋 Planning Phase  
**Coverage:** Phase 7 (Weeks 13-14)
  
**Prerequisites:** [Part 1](development-plan-part-1-foundation.md), [Part 2](development-plan-part-2-properties-layout.md), and [Part 3](development-plan-part-3-validation-accessibility.md) must be complete

---

## 🎯 Part 4 Overview

This plan covers **testing, polish, and v1.0.0 release**:

- ✅ **Phase 7** — Polish & Release (Week 13-14)

**Goal:** Ship production-ready v1.0.0 with:
- 90%+ unit test coverage
- Full E2E test suite (Playwright)
- Complete Storybook documentation
- Performance optimizations
- Production-ready package

**Future Parts:**
- **Part 4B**: Platform Phase 3 (Compliance) — Audit trail, query management, e-signature
- **Part 4C**: Platform Phase 4 (Persistence) — Offline mode, versioning, draft save

---

## 📚 Document Reference Map

| Document | Lines | Key Sections for Part 4 |
|----------|-------|------------------------|
| [form-builder-roadmap.md](form-builder-roadmap.md) | 539 | §3.7 Phase 7 (L313-L327) |
| [form-builder-architecture.md](form-builder-architecture.md) | 653 | §4 Services (L200-L400), §5 Testing (L401-L500) |
| [form-builder-technical-debt.md](form-builder-technical-debt.md) | 413 | All TD items for verification |

---

## Phase 7 — Polish & Release (Week 13-14)

**Goal:** Full test coverage, Storybook deployment, documentation, v1.0.0 release

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L313-L327)

### 📋 Task List

#### Task 7.1: Unit Test Coverage Plan

**Location:** All `*.spec.ts` files across `libs/form-builder/src/`

**Target:** 90%+ code coverage

**Strategy:**
- Services: 100% coverage (pure functions, easy to test)
- Components: 85%+ coverage (focus on logic, skip trivial rendering)
- Utilities: 100% coverage (type guards, validators, transformers)
- Integration: Key workflows fully covered

**Test Structure:**

```typescript
// Example: form-schema.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { FormSchemaService } from './form-schema.service';
import { EMPTY_FORM_SCHEMA } from '../types';

describe('FormSchemaService', () => {
  let service: FormSchemaService;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormSchemaService]
    });
    service = TestBed.inject(FormSchemaService);
  });
  
  describe('addComponent', () => {
    it('should add component to root level', () => {
      const schema = EMPTY_FORM_SCHEMA();
      const newComponent = {
        id: 'node1',
        type: 'text-input',
        key: 'firstName',
        label: 'First Name'
      };
      
      const updated = service.addComponent(schema, newComponent, null, 0);
      
      expect(updated.components).toHaveLength(1);
      expect(updated.components[0]).toEqual(newComponent);
    });
    
    it('should add component to nested container', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [{
          id: 'panel1',
          type: 'panel',
          key: 'panel',
          label: 'Panel',
          components: []
        }]
      };
      
      const newComponent = {
        id: 'node2',
        type: 'text-input',
        key: 'email',
        label: 'Email'
      };
      
      const updated = service.addComponent(schema, newComponent, 'panel1', 0);
      
      const panel = updated.components[0] as any;
      expect(panel.components).toHaveLength(1);
      expect(panel.components[0]).toEqual(newComponent);
    });
    
    it('should maintain immutability', () => {
      const schema = EMPTY_FORM_SCHEMA();
      const newComponent = { id: 'node1', type: 'text-input', key: 'test', label: 'Test' };
      
      const updated = service.addComponent(schema, newComponent, null, 0);
      
      expect(updated).not.toBe(schema);
      expect(updated.components).not.toBe(schema.components);
    });
  });
  
  describe('removeComponent', () => {
    it('should remove component by id', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [
          { id: 'node1', type: 'text-input', key: 'a', label: 'A' },
          { id: 'node2', type: 'text-input', key: 'b', label: 'B' }
        ]
      };
      
      const updated = service.removeComponent(schema, 'node1');
      
      expect(updated.components).toHaveLength(1);
      expect(updated.components[0].id).toBe('node2');
    });
    
    it('should remove nested component', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [{
          id: 'panel1',
          type: 'panel',
          key: 'panel',
          label: 'Panel',
          components: [
            { id: 'node1', type: 'text-input', key: 'a', label: 'A' },
            { id: 'node2', type: 'text-input', key: 'b', label: 'B' }
          ]
        }]
      };
      
      const updated = service.removeComponent(schema, 'node1');
      
      const panel = updated.components[0] as any;
      expect(panel.components).toHaveLength(1);
      expect(panel.components[0].id).toBe('node2');
    });
  });
  
  describe('moveComponent', () => {
    it('should move component within same parent', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [
          { id: 'node1', type: 'text-input', key: 'a', label: 'A' },
          { id: 'node2', type: 'text-input', key: 'b', label: 'B' },
          { id: 'node3', type: 'text-input', key: 'c', label: 'C' }
        ]
      };
      
      const updated = service.moveComponent(schema, 'node1', null, 2);
      
      expect(updated.components[0].id).toBe('node2');
      expect(updated.components[1].id).toBe('node3');
      expect(updated.components[2].id).toBe('node1');
    });
    
    it('should move component to different parent', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [
          { id: 'node1', type: 'text-input', key: 'a', label: 'A' },
          {
            id: 'panel1',
            type: 'panel',
            key: 'panel',
            label: 'Panel',
            components: []
          }
        ]
      };
      
      const updated = service.moveComponent(schema, 'node1', 'panel1', 0);
      
      expect(updated.components).toHaveLength(1);
      expect(updated.components[0].id).toBe('panel1');
      
      const panel = updated.components[0] as any;
      expect(panel.components).toHaveLength(1);
      expect(panel.components[0].id).toBe('node1');
    });
  });
  
  describe('duplicateComponent', () => {
    it('should create copy with suffixed key', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [
          { id: 'node1', type: 'text-input', key: 'firstName', label: 'First Name' }
        ]
      };
      
      const keyGen = (label: string, keys: string[]) => {
        const base = 'firstName';
        let suffix = 1;
        while (keys.includes(`${base}${suffix}`)) suffix++;
        return `${base}${suffix}`;
      };
      
      const updated = service.duplicateComponent(schema, 'node1', keyGen);
      
      expect(updated.components).toHaveLength(2);
      expect(updated.components[1].key).toBe('firstName1');
      expect(updated.components[1].id).not.toBe('node1');
    });
  });
  
  describe('isDescendant', () => {
    it('should detect direct child', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [{
          id: 'panel1',
          type: 'panel',
          key: 'panel',
          label: 'Panel',
          components: [
            { id: 'node1', type: 'text-input', key: 'a', label: 'A' }
          ]
        }]
      };
      
      const isDesc = service.isDescendant(schema, 'node1', 'panel1');
      expect(isDesc).toBe(true);
    });
    
    it('should detect nested descendant', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [{
          id: 'panel1',
          type: 'panel',
          key: 'panel1',
          label: 'Panel 1',
          components: [{
            id: 'panel2',
            type: 'panel',
            key: 'panel2',
            label: 'Panel 2',
            components: [
              { id: 'node1', type: 'text-input', key: 'a', label: 'A' }
            ]
          }]
        }]
      };
      
      const isDesc = service.isDescendant(schema, 'node1', 'panel1');
      expect(isDesc).toBe(true);
    });
    
    it('should return false for non-descendant', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [
          { id: 'node1', type: 'text-input', key: 'a', label: 'A' },
          { id: 'node2', type: 'text-input', key: 'b', label: 'B' }
        ]
      };
      
      const isDesc = service.isDescendant(schema, 'node1', 'node2');
      expect(isDesc).toBe(false);
    });
  });
  
  describe('isKeyUnique', () => {
    it('should return true for unique key', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [
          { id: 'node1', type: 'text-input', key: 'firstName', label: 'First Name' }
        ]
      };
      
      const isUnique = service.isKeyUnique(schema, 'email', 'node2');
      expect(isUnique).toBe(true);
    });
    
    it('should return false for duplicate key', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [
          { id: 'node1', type: 'text-input', key: 'firstName', label: 'First Name' }
        ]
      };
      
      const isUnique = service.isKeyUnique(schema, 'firstName', 'node2');
      expect(isUnique).toBe(false);
    });
    
    it('should exclude self when checking', () => {
      const schema = {
        ...EMPTY_FORM_SCHEMA(),
        components: [
          { id: 'node1', type: 'text-input', key: 'firstName', label: 'First Name' }
        ]
      };
      
      const isUnique = service.isKeyUnique(schema, 'firstName', 'node1');
      expect(isUnique).toBe(true);
    });
  });
});
```

**Coverage Breakdown:**

```typescript
// Target coverage by area
const COVERAGE_TARGETS = {
  services: {
    'form-schema.service.ts': 100,
    'builder-state.service.ts': 100,
    'history.service.ts': 100,
    'key-generator.service.ts': 100,
    'dnd.service.ts': 95,  // Some DOM interaction
    'keyboard-dnd.service.ts': 95,
    'conditional-evaluator.service.ts': 100,
    'validation-engine.service.ts': 100
  },
  
  components: {
    'form-builder.component.ts': 85,
    'palette/*.ts': 85,
    'canvas/*.ts': 85,
    'properties/*.ts': 85,
    'builder-toolbar.component.ts': 90
  },
  
  validation: {
    'built-in/*.ts': 100,  // All validators
    'json-logic-wrapper.ts': 100
  },
  
  registry: {
    'builder-registry.service.ts': 100,
    'built-in-components/*.descriptor.ts': 95
  },
  
  utils: {
    'type-guards.ts': 100,
    'schema-validators.ts': 100
  }
};
```

**Run Coverage:**

```bash
# Generate coverage report
npx nx test form-builder --coverage

# View HTML report
open coverage/libs/form-builder/index.html

# Check coverage thresholds
npx nx test form-builder --coverage --coverageThresholds='{"global":{"lines":90,"statements":90,"branches":85,"functions":90}}'
```

**Acceptance Criteria:**
- ✅ Overall coverage ≥ 90%
- ✅ Services coverage ≥ 95%
- ✅ Validation coverage 100%
- ✅ Critical paths 100% covered
- ✅ CI fails if coverage drops below 90%

**Estimated Effort:** 3 days

---

#### Task 7.2: Playwright E2E Test Suite

**Location:** `libs/form-builder/playwright/`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L315)

**Setup:**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:4400',  // Storybook
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  
  webServer: {
    command: 'npx nx run form-builder:storybook',
    url: 'http://localhost:4400',
    reuseExistingServer: !process.env.CI,
  },
});
```

**Test Scenarios:**

```typescript
// playwright/form-builder-dnd.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=form-builder--default');
    await page.waitForSelector('vi-form-builder');
  });
  
  test('should drag component from palette to canvas', async ({ page }) => {
    // Find text-input palette item
    const paletteItem = page.locator('[data-testid="palette-item-text-input"]');
    await expect(paletteItem).toBeVisible();
    
    // Find canvas drop zone
    const dropZone = page.locator('[data-testid="canvas-drop-zone-0"]');
    await expect(dropZone).toBeVisible();
    
    // Drag from palette to canvas
    await paletteItem.dragTo(dropZone);
    
    // Verify component added to canvas
    const canvasNode = page.locator('[data-testid="canvas-node"]').first();
    await expect(canvasNode).toBeVisible();
    await expect(canvasNode).toContainText('Text Input');
  });
  
  test('should reorder components on canvas', async ({ page }) => {
    // Add two components first
    await page.locator('[data-testid="palette-item-text-input"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-0"]')
    );
    await page.locator('[data-testid="palette-item-email"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-1"]')
    );
    
    // Get initial order
    const nodes = page.locator('[data-testid="canvas-node"]');
    await expect(nodes).toHaveCount(2);
    const firstLabel = await nodes.nth(0).textContent();
    const secondLabel = await nodes.nth(1).textContent();
    
    // Drag second node to first position
    const dragHandle = nodes.nth(1).locator('[data-testid="drag-handle"]');
    const targetZone = page.locator('[data-testid="canvas-drop-zone-0"]');
    await dragHandle.dragTo(targetZone);
    
    // Verify order changed
    const newFirstLabel = await nodes.nth(0).textContent();
    expect(newFirstLabel).toBe(secondLabel);
  });
  
  test('should prevent dropping container into itself', async ({ page }) => {
    // Add panel to canvas
    await page.locator('[data-testid="palette-item-panel"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-0"]')
    );
    
    // Try to drag panel into its own drop zone
    const panel = page.locator('[data-testid="canvas-node-panel"]');
    const dragHandle = panel.locator('[data-testid="drag-handle"]');
    const panelDropZone = panel.locator('[data-testid="drop-zone-0"]');
    
    // Attempt drag (should show error or prevent)
    await dragHandle.hover();
    await page.mouse.down();
    await panelDropZone.hover();
    
    // Drop zones in container should be disabled
    await expect(panelDropZone).toHaveAttribute('data-disabled', 'true');
    
    await page.mouse.up();
  });
  
  test('should support keyboard drag and drop', async ({ page }) => {
    // Add two components
    await page.locator('[data-testid="palette-item-text-input"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-0"]')
    );
    await page.locator('[data-testid="palette-item-email"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-1"]')
    );
    
    // Focus first component's drag handle
    const dragHandle = page.locator('[data-testid="drag-handle"]').first();
    await dragHandle.focus();
    
    // Activate keyboard DnD with Space
    await page.keyboard.press('Space');
    
    // Verify DnD mode active
    await expect(dragHandle).toHaveClass(/keyboard-dragging/);
    
    // Move down with Arrow Down
    await page.keyboard.press('ArrowDown');
    
    // Drop with Space
    await page.keyboard.press('Space');
    
    // Verify order changed
    const nodes = page.locator('[data-testid="canvas-node"]');
    const firstLabel = await nodes.nth(0).getAttribute('data-label');
    expect(firstLabel).toBe('Email');
  });
});
```

```typescript
// playwright/form-builder-properties.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Properties Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=form-builder--with-components');
  });
  
  test('should open properties panel on component click', async ({ page }) => {
    // Click component on canvas
    const component = page.locator('[data-testid="canvas-node"]').first();
    await component.click();
    
    // Verify properties panel opens
    const panel = page.locator('[data-testid="properties-panel"]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText('Settings');
  });
  
  test('should update component label in real-time', async ({ page }) => {
    // Select component
    await page.locator('[data-testid="canvas-node"]').first().click();
    
    // Find label input in properties panel
    const labelInput = page.locator('[data-testid="setting-field-label"] input');
    await expect(labelInput).toBeVisible();
    
    // Clear and type new label
    await labelInput.clear();
    await labelInput.fill('New Label');
    
    // Verify canvas updates
    await expect(page.locator('[data-testid="canvas-node"]').first()).toContainText('New Label');
  });
  
  test('should validate key uniqueness', async ({ page }) => {
    // Add two components
    await page.locator('[data-testid="palette-item-text-input"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-0"]')
    );
    await page.locator('[data-testid="palette-item-email"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-1"]')
    );
    
    // Select second component
    await page.locator('[data-testid="canvas-node"]').nth(1).click();
    
    // Try to set duplicate key
    const keyInput = page.locator('[data-testid="setting-field-key"] input');
    await keyInput.clear();
    await keyInput.fill('textInput');  // Same as first
    await keyInput.blur();
    
    // Verify error message
    await expect(page.locator('[data-testid="setting-field-key"]')).toContainText('Key must be unique');
  });
  
  test('should add validation rule', async ({ page }) => {
    // Select component
    await page.locator('[data-testid="canvas-node"]').first().click();
    
    // Switch to validation tab
    await page.locator('[data-testid="settings-tab-validation"]').click();
    
    // Click add rule
    await page.locator('[data-testid="btn-add-rule"]').click();
    
    // Select required validator
    await page.locator('[data-testid="validator-select"]').selectOption('required');
    
    // Save rule
    await page.locator('[data-testid="btn-save-rule"]').click();
    
    // Verify rule appears in list
    await expect(page.locator('[data-testid="rule-row"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="rule-row"]')).toContainText('required');
  });
});
```

```typescript
// playwright/form-builder-undo-redo.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Undo/Redo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/iframe.html?id=form-builder--default');
  });
  
  test('should undo component addition', async ({ page }) => {
    // Add component
    await page.locator('[data-testid="palette-item-text-input"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-0"]')
    );
    
    // Verify added
    await expect(page.locator('[data-testid="canvas-node"]')).toHaveCount(1);
    
    // Click undo
    await page.locator('[data-testid="btn-undo"]').click();
    
    // Verify removed
    await expect(page.locator('[data-testid="canvas-node"]')).toHaveCount(0);
  });
  
  test('should redo component addition', async ({ page }) => {
    // Add and undo
    await page.locator('[data-testid="palette-item-text-input"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-0"]')
    );
    await page.locator('[data-testid="btn-undo"]').click();
    
    // Click redo
    await page.locator('[data-testid="btn-redo"]').click();
    
    // Verify restored
    await expect(page.locator('[data-testid="canvas-node"]')).toHaveCount(1);
  });
  
  test('should undo label edit', async ({ page }) => {
    // Add component
    await page.locator('[data-testid="palette-item-text-input"]').dragTo(
      page.locator('[data-testid="canvas-drop-zone-0"]')
    );
    
    // Edit label
    await page.locator('[data-testid="canvas-node"]').click();
    const labelInput = page.locator('[data-testid="setting-field-label"] input');
    const originalLabel = await labelInput.inputValue();
    await labelInput.fill('Modified Label');
    await page.waitForTimeout(600);  // Wait for debounce
    
    // Undo
    await page.locator('[data-testid="btn-undo"]').click();
    
    // Verify reverted
    await expect(labelInput).toHaveValue(originalLabel);
  });
});
```

**Acceptance Criteria:**
- ✅ All E2E scenarios passing on Chrome, Firefox, Safari
- ✅ Mobile viewport tests passing
- ✅ Touch DnD tested on mobile
- ✅ Screenshots on failure
- ✅ CI integration complete

**Estimated Effort:** 3 days

---

#### Task 7.3: Storybook Documentation

**Location:** `libs/form-builder/.storybook/` + `*.stories.ts`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L316)

**Setup:**

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  docs: {
    autodocs: true,
  },
};

export default config;
```

**Story Examples:**

```typescript
// form-builder.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { FormBuilderComponent } from './form-builder.component';
import { BUILT_IN_BUILDER_COMPONENTS } from './built-in-components';
import { EMPTY_FORM_SCHEMA } from './types';

const meta: Meta<FormBuilderComponent> = {
  component: FormBuilderComponent,
  title: 'Form Builder/Builder',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'The main form builder component with drag-and-drop canvas, palette, and properties panel.',
      },
    },
  },
  decorators: [
    (story) => ({
      template: `
        <div style="height: 100vh; display: flex; flex-direction: column;">
          <ng-template [ngTemplateOutlet]="story"></ng-template>
        </div>
      `,
    }),
  ],
};

export default meta;
type Story = StoryObj<FormBuilderComponent>;

export const Default: Story = {
  args: {
    schema: EMPTY_FORM_SCHEMA(),
  },
};

export const WithComponents: Story = {
  args: {
    schema: {
      ...EMPTY_FORM_SCHEMA(),
      title: 'Contact Form',
      description: 'Please fill in your contact information',
      components: [
        {
          id: 'node1',
          type: 'text-input',
          key: 'firstName',
          label: 'First Name',
          placeholder: 'Enter your first name',
          required: true,
          validationRules: [
            { ruleId: 'required', type: 'built-in' }
          ]
        },
        {
          id: 'node2',
          type: 'email',
          key: 'email',
          label: 'Email Address',
          placeholder: 'you@example.com',
          required: true,
          validationRules: [
            { ruleId: 'required', type: 'built-in' },
            { ruleId: 'email', type: 'built-in' }
          ]
        }
      ]
    },
  },
};

export const WithNestedLayout: Story = {
  args: {
    schema: {
      ...EMPTY_FORM_SCHEMA(),
      title: 'Advanced Form',
      components: [
        {
          id: 'panel1',
          type: 'panel',
          key: 'personalInfo',
          label: 'Personal Information',
          collapsible: true,
          components: [
            {
              id: 'cols1',
              type: 'columns',
              key: 'nameColumns',
              label: 'Name',
              columns: 2,
              columnAssignments: {
                'node1': 0,
                'node2': 1
              },
              components: [
                {
                  id: 'node1',
                  type: 'text-input',
                  key: 'firstName',
                  label: 'First Name'
                },
                {
                  id: 'node2',
                  type: 'text-input',
                  key: 'lastName',
                  label: 'Last Name'
                }
              ]
            }
          ]
        }
      ]
    },
  },
};

export const PreviewMode: Story = {
  args: {
    schema: {
      ...EMPTY_FORM_SCHEMA(),
      title: 'Survey Form',
      components: [
        {
          id: 'node1',
          type: 'radio',
          key: 'satisfaction',
          label: 'How satisfied are you?',
          options: {
            type: 'static',
            items: [
              { key: '1', value: 'Very Dissatisfied' },
              { key: '2', value: 'Dissatisfied' },
              { key: '3', value: 'Neutral' },
              { key: '4', value: 'Satisfied' },
              { key: '5', value: 'Very Satisfied' }
            ]
          },
          required: true
        }
      ]
    },
  },
  play: async ({ canvasElement }) => {
    // Auto-activate preview mode
    const previewBtn = canvasElement.querySelector('[data-testid="btn-preview"]');
    if (previewBtn) previewBtn.click();
  },
};
```

```mdx
<!-- docs/GettingStarted.mdx -->
import { Meta } from '@storybook/blocks';

<Meta title="Form Builder/Getting Started" />

# Getting Started with Form Builder

The Form Builder is a drag-and-drop visual form authoring tool for Angular 21 applications.

## Installation

\`\`\`bash
npm install @vi/form-builder
\`\`\`

## Basic Usage

\`\`\`typescript
import { Component } from '@angular/core';
import { FormBuilderComponent } from '@vi/form-builder';

@Component({
  standalone: true,
  imports: [FormBuilderComponent],
  template: `
    <vi-form-builder
      [schema]="formSchema"
      (schemaChange)="onSchemaChange($event)" />
  `
})
export class MyBuilderPage {
  formSchema = {
    schemaVersion: '1.0',
    id: 'my-form',
    title: 'My Form',
    components: []
  };
  
  onSchemaChange(newSchema) {
    console.log('Schema updated:', newSchema);
    // Save to backend
  }
}
\`\`\`

## Features

- **Drag-and-Drop**: Drag components from palette to canvas
- **Nested Layouts**: Panel, Columns, Tabs, Fieldset, Repeater
- **Validation Rules**: 11 built-in validators + JSON Logic
- **Conditional Visibility**: Show/hide fields based on other fields
- **Undo/Redo**: Full history with debounced snapshots
- **Keyboard Accessible**: Space + arrows for DnD
- **Responsive**: Properties panel switches to drawer on narrow viewports

## Next Steps

- [Component Catalog](?path=/docs/form-builder-components--docs)
- [Validation Guide](?path=/docs/form-builder-validation--docs)
- [API Reference](?path=/docs/form-builder-api--docs)
```

**Acceptance Criteria:**
- ✅ All components have stories
- ✅ Interactive examples with controls
- ✅ MDX documentation pages
- ✅ Accessibility addon enabled
- ✅ Deployed to static hosting
- ✅ Shareable URLs for each story

**Estimated Effort:** 2 days

---

#### Task 7.4: Performance Optimization

**Location:** Various (rendering, DnD, history)

**Targets:**
- Canvas renders large schema (<500 components) without lag
- DnD feels smooth (60 FPS)
- History snapshots don't block UI
- Initial load < 2s (production build)

**Optimizations:**

**1. Virtual Scrolling for Large Palettes:**

```typescript
// Update palette.component.ts
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  template: `
    <cdk-virtual-scroll-viewport itemSize="50" class="palette-scroll">
      @for (item of filteredComponents(); track item.type) {
        <vi-palette-item [descriptor]="item" />
      }
    </cdk-virtual-scroll-viewport>
  `
})
```

**2. OnPush Change Detection:**

```typescript
// All components use OnPush
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

**3. Memoize Expensive Computations:**

```typescript
// Use computed() for derived state
visibleComponents = computed(() => {
  return this.filterVisibleComponents(
    this.schema().components,
    this.formData()
  );
});
```

**4. Debounce History Snapshots:**

```typescript
// Already implemented in HistoryService
private readonly changeSubject = new Subject<FormSchema>();

constructor() {
  this.changeSubject
    .pipe(debounceTime(500))  // Don't snapshot more than once per 500ms
    .subscribe(schema => this._captureSnapshot(schema));
}
```

**5. Lazy Load Heavy Dependencies:**

```typescript
// json-logic-js loaded only when needed
private async evaluateJsonLogic(logic: unknown, data: unknown): Promise<boolean> {
  const jsonLogic = await import('json-logic-js');
  return jsonLogic.apply(logic, data);
}
```

**6. Web Worker for Validation (if needed):**

```typescript
// Move heavy validation to worker
const validationWorker = new Worker(
  new URL('./validation.worker.ts', import.meta.url)
);

validationWorker.postMessage({ rules, value, formData });
validationWorker.onmessage = (e) => {
  const results = e.data;
  // Update UI
};
```

**Performance Budget:**

```typescript
// Lighthouse performance targets
const PERFORMANCE_BUDGET = {
  fcp: 1.5,  // First Contentful Paint (s)
  lcp: 2.5,  // Largest Contentful Paint (s)
  cls: 0.1,  // Cumulative Layout Shift
  tbt: 200,  // Total Blocking Time (ms)
  tti: 3.0,  // Time to Interactive (s)
};
```

**Acceptance Criteria:**
- ✅ Lighthouse Performance score ≥ 90
- ✅ 500-component schema renders smoothly
- ✅ DnD maintains 60 FPS
- ✅ No perceivable UI lag
- ✅ Bundle size < 300 KB (gzipped)

**Estimated Effort:** 2 days

---

#### Task 7.5: Production Build & Publishing

**Location:** `libs/form-builder/project.json`

**Reference:** [form-builder-roadmap.md](form-builder-roadmap.md#L317)

**Build Configuration:**

```json
// project.json
{
  "name": "form-builder",
  "targets": {
    "build": {
      "executor": "@nx/angular:package",
      "options": {
        "project": "libs/form-builder/ng-package.json",
        "tsConfig": "libs/form-builder/tsconfig.lib.json",
        "buildableProjectDepsInPackageJsonType": "dependencies"
      },
      "configurations": {
        "production": {
          "tsConfig": "libs/form-builder/tsconfig.lib.prod.json"
        }
      }
    }
  }
}
```

```json
// ng-package.json
{
  "$schema": "node_modules/ng-packagr/ng-package.schema.json",
  "dest": "../../dist/libs/form-builder",
  "lib": {
    "entryFile": "src/index.ts"
  }
}
```

**Package.json:**

```json
{
  "name": "@vi/form-builder",
  "version": "1.0.0",
  "description": "Drag-and-drop form builder for Angular 21",
  "keywords": [
    "angular",
    "form-builder",
    "drag-and-drop",
    "visual-editor",
    "edc"
  ],
  "author": "Vialiq EDC Team",
  "license": "UNLICENSED",
  "private": true,
  "peerDependencies": {
    "@angular/animations": "^21.0.0",
    "@angular/cdk": "^21.0.0",
    "@angular/common": "^21.0.0",
    "@angular/core": "^21.0.0",
    "@angular/forms": "^21.0.0",
    "@vialiq/web-components": "^0.1.0",
    "@vi/state-fp": "^0.1.0"
  },
  "dependencies": {
    "@atlaskit/pragmatic-drag-and-drop": "^1.3.1",
    "@atlaskit/pragmatic-drag-and-drop-hitbox": "^1.0.3",
    "json-logic-js": "^2.0.5",
    "tslib": "^2.8.1"
  }
}
```

**Release Checklist:**

```markdown
## v1.0.0 Release Checklist

### Code Quality
- [ ] All unit tests passing (90%+ coverage)
- [ ] All E2E tests passing
- [ ] No linting errors
- [ ] No type errors
- [ ] Bundle size < 300 KB (gzipped)

### Documentation
- [ ] README.md complete
- [ ] CHANGELOG.md updated
- [ ] API docs generated
- [ ] Storybook deployed
- [ ] Migration guide (if applicable)

### Testing
- [ ] Chrome testing complete
- [ ] Firefox testing complete
- [ ] Safari testing complete
- [ ] Mobile testing (iOS + Android)
- [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
- [ ] Accessibility audit (WAVE/axe/Lighthouse)

### Build
- [ ] Production build succeeds
- [ ] Source maps generated
- [ ] Type definitions (.d.ts) included
- [ ] Package.json metadata correct
- [ ] Peer dependencies verified

### Release
- [ ] Version bumped (nx release version)
- [ ] Git tag created
- [ ] CHANGELOG entry
- [ ] GitHub release notes
- [ ] npm publish (if public)

### Post-Release
- [ ] Announce in team chat
- [ ] Update dependent projects
- [ ] Monitor error tracking
```

**Release Commands:**

```bash
# Version bump
npx nx release version form-builder --version=1.0.0

# Build production package
npx nx build form-builder --configuration=production

# Verify bundle
ls -lh dist/libs/form-builder/

# Create git tag
git tag form-builder@1.0.0
git push origin form-builder@1.0.0

# Publish (if applicable)
cd dist/libs/form-builder
npm publish
```

**Acceptance Criteria:**
- ✅ Clean production build
- ✅ Package.json metadata correct
- ✅ All peer deps listed
- ✅ Version tagged in git
- ✅ CHANGELOG updated
- ✅ Release notes published

**Estimated Effort:** 1 day

---

### Phase 7 Summary

**Total Duration:** Week 13-14 (10 days)

**Deliverables:**
- ✅ 90%+ unit test coverage
- ✅ Full E2E test suite (Playwright)
- ✅ Complete Storybook with documentation
- ✅ Performance optimizations (Lighthouse 90+)
- ✅ Production build pipeline
- ✅ v1.0.0 released and tagged

**Validation:**
```bash
# Run full test suite
npx nx test form-builder --coverage
npx nx e2e form-builder-e2e

# Build and analyze
npx nx build form-builder --configuration=production
npx nx run form-builder:analyze

# Lighthouse audit
npm run lighthouse

# Accessibility audit
npm run a11y-audit

# Release
npx nx release version form-builder --version=1.0.0
npx nx release publish form-builder
```

---

## Phase 7 Completion Checklist

**Testing:**
- [ ] Unit tests ≥ 90% coverage
- [ ] All E2E scenarios passing
- [ ] Cross-browser testing complete (Chrome, Firefox, Safari)
- [ ] Mobile testing complete (iOS, Android)
- [ ] Touch DnD verified
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)

**Documentation:**
- [ ] Storybook stories for all components
- [ ] Getting Started guide
- [ ] API reference docs
- [ ] MDX documentation pages
- [ ] README.md complete
- [ ] CHANGELOG.md updated

**Performance:**
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility = 100
- [ ] Bundle size < 300 KB gzipped
- [ ] Large schemas (500 components) render smoothly
- [ ] DnD maintains 60 FPS

**Build & Release:**
- [ ] Production build succeeds
- [ ] Package.json metadata correct
- [ ] Peer dependencies verified
- [ ] Version 1.0.0 tagged
- [ ] GitHub release notes published
- [ ] Team notified

---

## Next Documents

**Part 4B: Platform Phase 3 — Compliance** *(to be created next)*
- Audit trail architecture
- Query management system
- Reason-for-change workflow
- Electronic signature (`<vi-signature>`)
- 21 CFR Part 11 compliance

**Part 4C: Platform Phase 4 — Persistence** *(to be created after 4B)*
- Schema versioning strategy
- Draft persistence architecture
- Offline mode implementation
- Sync conflict resolution

---

**END OF PART 4 (Phase 7 Only)**

*Continue with Part 4B for Platform Phase 3 content...*
