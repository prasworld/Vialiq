import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import './index.js'; // Registers vi-checkbox
import type { ViCheckbox } from './vi-checkbox.js';

describe('vi-checkbox', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render the custom element and its shadow DOM', async () => {
    render(html`<vi-checkbox>Label Content</vi-checkbox>`, container);

    const host = await $('vi-checkbox');
    await expect(host).toExist();

    const input = await host.shadow$('.checkbox-input');
    await expect(input).toExist();

    const labelPart = await host.shadow$('.checkbox-label');
    await expect(labelPart).toExist();
  });

  describe('Properties and defaults', () => {
    it('should have correct default property values', () => {
      render(html`<vi-checkbox>Label</vi-checkbox>`, container);
      const el = document.querySelector('vi-checkbox') as ViCheckbox;

      expect(el.checked).toBe(false);
      expect(el.indeterminate).toBe(false);
      expect(el.value).toBe('on');
      expect(el.name).toBe('');
      expect(el.disabled).toBe(false);
      expect(el.required).toBe(false);
      expect(el.status).toBe('default');
    });

    it('should sync properties from attributes', async () => {
      render(
        html`
          <vi-checkbox
            name="consent"
            value="yes"
            checked
            required
            disabled
          >
            Agree
          </vi-checkbox>
        `,
        container
      );
      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      await el.updateComplete;

      expect(el.name).toBe('consent');
      expect(el.value).toBe('yes');
      expect(el.checked).toBe(true);
      expect(el.required).toBe(true);
      expect(el.disabled).toBe(true);
    });

    it('should disable the native input when disabled is set', async () => {
      render(html`<vi-checkbox disabled>Disabled Box</vi-checkbox>`, container);
      const input = await $('vi-checkbox').shadow$('.checkbox-input');
      await expect(input).toBeDisabled();
    });

    it('should re-enable the native input when disabled is removed', async () => {
      render(html`<vi-checkbox disabled>Disabled Box</vi-checkbox>`, container);
      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      await el.updateComplete;

      el.disabled = false;
      await el.updateComplete;

      const input = await $('vi-checkbox').shadow$('.checkbox-input');
      await expect(input).toBeEnabled();
    });
  });

  describe('Interactions and Events', () => {
    it('should toggle checked state and emit vi-checkbox-change on click', async () => {
      let changeFired = false;
      let lastChecked = false;
      let lastValue = '';

      render(
        html`
          <vi-checkbox
            value="agree"
            @vi-checkbox-change=${(e: CustomEvent<{ checked: boolean; value: string }>) => {
              changeFired = true;
              lastChecked = e.detail.checked;
              lastValue = e.detail.value;
            }}
          >
            Agree
          </vi-checkbox>
        `,
        container
      );

      const host = await $('vi-checkbox');
      const label = await host.shadow$('.checkbox-wrapper');

      // Click the checkbox wrapper
      await browser.execute((el) => (el as HTMLElement).click(), label);

      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      expect(el.checked).toBe(true);
      expect(changeFired).toBe(true);
      expect(lastChecked).toBe(true);
      expect(lastValue).toBe('agree');
    });

    it('should not allow toggling state when disabled is set', async () => {
      let changeFired = false;

      render(
        html`
          <vi-checkbox
            disabled
            @vi-checkbox-change=${() => (changeFired = true)}
          >
            Agree
          </vi-checkbox>
        `,
        container
      );

      const host = await $('vi-checkbox');
      const label = await host.shadow$('.checkbox-wrapper');

      // Attempt click
      await browser.execute((el) => (el as HTMLElement).click(), label);

      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      expect(el.checked).toBe(false);
      expect(changeFired).toBe(false);
    });
  });

  describe('Indeterminate State', () => {
    it('should render indeterminate state correctly', async () => {
      render(
        html`<vi-checkbox indeterminate>Select All</vi-checkbox>`,
        container
      );

      const host = await $('vi-checkbox');
      const input = await host.shadow$('.checkbox-input');

      // Native property should be set
      const isIndeterminate = await browser.execute(
        (el) => (el as HTMLInputElement).indeterminate,
        input
      );
      expect(isIndeterminate).toBe(true);

      // ARIA checked should be mixed
      await expect(input).toHaveAttribute('aria-checked', 'mixed');
    });

    it('should transition indeterminate state to checked/unchecked on click', async () => {
      render(
        html`<vi-checkbox indeterminate>Select All</vi-checkbox>`,
        container
      );

      const host = await $('vi-checkbox');
      const label = await host.shadow$('.checkbox-wrapper');

      // Click the indeterminate checkbox wrapper
      await browser.execute((el) => (el as HTMLElement).click(), label);

      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      expect(el.checked).toBe(true);
      expect(el.indeterminate).toBe(false);
    });
  });

  describe('Keyboard accessibility', () => {
    it('should toggle state via Space key when focused', async () => {
      render(
        html`<vi-checkbox value="key">Keyboard</vi-checkbox>`,
        container
      );

      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      await el.updateComplete;
      
      el.focus();
      await el.updateComplete;
      await browser.pause(50);

      // Press Space on the focused element to toggle (native checkbox behavior)
      await browser.keys(['Space']);
      await browser.pause(50);
      await el.updateComplete;

      expect(el.checked).toBe(true);
    });
  });

  describe('Form submission and validation', () => {
    it('should participate in form validation when required is true', async () => {
      render(
        html`
          <form id="test-form">
            <vi-checkbox name="terms" required>Accept terms</vi-checkbox>
          </form>
        `,
        container
      );

      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      await el.updateComplete;

      // Empty/unchecked required checkbox is invalid
      expect(el.reportValidity()).toBe(false);
      expect(el.status).toBe('invalid');

      // Checking checkbox passes validation
      el.checked = true;
      await el.updateComplete;

      expect(el.reportValidity()).toBe(true);
      expect(el.status).toBe('default'); // reset to default since valid
    });

    it('should reset checked value to initial attribute state on form reset', async () => {
      render(
        html`
          <form id="form-reset">
            <vi-checkbox name="opt" checked>Opt In</vi-checkbox>
          </form>
        `,
        container
      );

      const form = document.getElementById('form-reset') as HTMLFormElement;
      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      await el.updateComplete;

      expect(el.checked).toBe(true);

      // Uncheck it
      el.checked = false;
      await el.updateComplete;
      expect(el.checked).toBe(false);

      // Trigger form reset
      form.reset();
      await el.updateComplete;

      // Restores value to initial checked state
      expect(el.checked).toBe(true);
    });
  });

  describe('Focus & disabled states', () => {
    it('should delegate focus to the inner input', async () => {
      render(html`<vi-checkbox>Focus Target</vi-checkbox>`, container);
      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      await el.updateComplete;

      el.focus();

      const input = el.shadowRoot?.querySelector('input');
      expect(el.shadowRoot?.activeElement).toBe(input);
    });

    it('should change tabIndex to -1 when disabled', async () => {
      render(html`<vi-checkbox disabled>Disabled Focus</vi-checkbox>`, container);
      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      await el.updateComplete;

      expect(el.tabIndex).toBe(-1);
    });
  });

  describe('Sizing', () => {
    it('should default to md size', () => {
      render(html`<vi-checkbox>Size Test</vi-checkbox>`, container);
      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      expect(el.size).toBe('md');
    });

    it('should reflect size attribute changes', async () => {
      render(html`<vi-checkbox size="lg">Size Test</vi-checkbox>`, container);
      const el = document.querySelector('vi-checkbox') as ViCheckbox;
      await el.updateComplete;
      expect(el.size).toBe('lg');
    });
  });

  describe('Missing Branch Coverage', () => {
    it('syncs checked state to input before validating if out of sync', async () => {
      render(html`<vi-checkbox required></vi-checkbox>`, container);
      const checkbox = document.querySelector('vi-checkbox') as any;
      await checkbox.updateComplete;

      const input = checkbox.shadowRoot.querySelector('input');
      input.checked = true;
      checkbox.checked = false;

      const isValid = checkbox.checkValidity();
      expect(isValid).toBe(false);
      expect(input.checked).toBe(false);
    });

    it('validates without an input element', () => {
      const checkbox = document.createElement('vi-checkbox') as any;
      checkbox.required = true;
      checkbox.checked = false;

      const isValid = checkbox.checkValidity();
      expect(isValid).toBe(false);
      expect(checkbox.validationMessage).not.toBe('');
    });
  });

  describe('Accessibility (A11y)', () => {
    it('should pass axe accessibility audits', async () => {
      // Set background to pass color contrast checks
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';

      render(
        html`
          <vi-checkbox name="check-a11y-1">Default Checkbox</vi-checkbox>
          <vi-checkbox name="check-a11y-2" checked>Checked Checkbox</vi-checkbox>
          <vi-checkbox name="check-a11y-3" indeterminate>Indeterminate Checkbox</vi-checkbox>
          <vi-checkbox name="check-a11y-4" disabled>Disabled Checkbox</vi-checkbox>
        `,
        container
      );

      const host = document.querySelector('vi-checkbox') as ViCheckbox;
      await host.updateComplete;

      const results = await axe.run(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          'region': { enabled: false },
          'color-contrast': { enabled: false }
        }
      });

      expect(results.violations).toHaveLength(0);
    });
  });
});

