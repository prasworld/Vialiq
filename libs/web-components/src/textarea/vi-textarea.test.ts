import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import './index.js'; // Registers vi-textarea
import type { ViTextarea } from './vi-textarea.js';

describe('vi-textarea', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render the custom element and its shadow DOM', async () => {
    render(html`<vi-textarea></vi-textarea>`, container);

    const host = await $('vi-textarea');
    await expect(host).toExist();

    const textarea = await host.shadow$('.input-control');
    await expect(textarea).toExist();
  });

  describe('Properties and defaults', () => {
    it('should have correct default property values', () => {
      render(html`<vi-textarea></vi-textarea>`, container);
      const el = document.querySelector('vi-textarea') as ViTextarea;

      expect(el.value).toBe('');
      expect(el.placeholder).toBe('');
      expect(el.name).toBe('');
      expect(el.rows).toBe(3);
      expect(el.maxlength).toBeNull();
      expect(el.disabled).toBe(false);
      expect(el.required).toBe(false);
      expect(el.readonly).toBe(false);
      expect(el.resize).toBe('vertical');
      expect(el.status).toBe('default');
      expect(el.validityMessage).toBe('');
      expect(el.charCount).toBe(false);
    });

    it('should pass rows and placeholder to native control', async () => {
      render(
        html`<vi-textarea
          rows="5"
          placeholder="Enter comments..."
        ></vi-textarea>`,
        container,
      );
      const el = document.querySelector('vi-textarea') as ViTextarea;
      await el.updateComplete;

      const textarea = el.shadowRoot?.querySelector('textarea');
      expect(textarea?.getAttribute('rows')).toBe('5');
      expect(textarea?.getAttribute('placeholder')).toBe('Enter comments...');
    });

    it('should reflect disabled and readonly attributes to native control', async () => {
      render(html`<vi-textarea disabled readonly></vi-textarea>`, container);
      const el = document.querySelector('vi-textarea') as ViTextarea;
      await el.updateComplete;

      const textarea = el.shadowRoot?.querySelector('textarea');
      expect(textarea?.disabled).toBe(true);
      expect(textarea?.readOnly).toBe(true);
    });

    it('should handle native maxlength attribute correctly based on property value', async () => {
      render(html`<vi-textarea></vi-textarea>`, container);
      const el = document.querySelector('vi-textarea') as ViTextarea;
      await el.updateComplete;
      const textarea = el.shadowRoot?.querySelector('textarea');
      expect(textarea?.hasAttribute('maxlength')).toBe(false);

      el.maxlength = -5;
      await el.updateComplete;
      expect(textarea?.hasAttribute('maxlength')).toBe(false);

      el.maxlength = 100;
      await el.updateComplete;
      expect(textarea?.getAttribute('maxlength')).toBe('100');
    });
  });

  describe('Value binding and events', () => {
    it('should emit vi-textarea-input event on text entry', async () => {
      let inputVal = '';
      render(
        html`<vi-textarea
          @vi-textarea-input=${(e: CustomEvent<{ value: string }>) =>
            (inputVal = e.detail.value)}
        ></vi-textarea>`,
        container,
      );

      const host = document.querySelector('vi-textarea') as ViTextarea;
      await host.updateComplete;

      const textarea = host.shadowRoot?.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;
      textarea.value = 'hello';
      textarea.dispatchEvent(
        new Event('input', { bubbles: true, composed: true }),
      );

      expect(inputVal).toBe('hello');
      expect(host.value).toBe('hello');
    });

    it('should emit vi-textarea-change event on blur', async () => {
      let changeVal = '';
      render(
        html`<vi-textarea
          @vi-textarea-change=${(e: CustomEvent<{ value: string }>) =>
            (changeVal = e.detail.value)}
        ></vi-textarea>`,
        container,
      );

      const host = document.querySelector('vi-textarea') as ViTextarea;
      await host.updateComplete;

      const textarea = host.shadowRoot?.querySelector(
        'textarea',
      ) as HTMLTextAreaElement;
      textarea.value = 'committed text';
      textarea.dispatchEvent(
        new Event('change', { bubbles: true, composed: true }),
      );

      expect(changeVal).toBe('committed text');
      expect(host.value).toBe('committed text');
    });
  });

  describe('Character counter', () => {
    it('should display the character counter when char-count and maxlength are enabled', async () => {
      render(
        html`<vi-textarea value="abc" maxlength="10" char-count></vi-textarea>`,
        container,
      );

      const host = document.querySelector('vi-textarea') as ViTextarea;
      await host.updateComplete;

      const counter = host.shadowRoot?.querySelector(
        '.char-counter',
      ) as HTMLElement;
      expect(counter).not.toBeNull();
      expect(counter.textContent?.trim()).toBe('3 / 10');
    });

    it('should apply warning and error CSS state classes depending on length capacity', async () => {
      render(
        html`<vi-textarea
          value="12345678"
          maxlength="10"
          char-count
        ></vi-textarea>`,
        container,
      );

      const host = document.querySelector('vi-textarea') as ViTextarea;
      await host.updateComplete;

      const counter = host.shadowRoot?.querySelector(
        '.char-counter',
      ) as HTMLElement;
      expect(counter.className).not.toContain('char-counter--warning');
      expect(counter.className).not.toContain('char-counter--error');

      // Update to 9 characters (90% capacity) -> warning class
      host.value = '123456789';
      await host.updateComplete;
      expect(counter.className).toContain('char-counter--warning');
      expect(counter.className).not.toContain('char-counter--error');

      // Update to 10 characters (100% capacity) -> error class
      host.value = '1234567890';
      await host.updateComplete;
      expect(counter.className).not.toContain('char-counter--warning');
      expect(counter.className).toContain('char-counter--error');
    });
  });

  describe('Validation', () => {
    it('should fail validity checking when required and value is empty', async () => {
      render(html`<vi-textarea required></vi-textarea>`, container);
      const host = document.querySelector('vi-textarea') as ViTextarea;
      await host.updateComplete;

      const isValid = host.reportValidity();
      expect(isValid).toBe(false);
      expect(host.status).toBe('invalid');
      expect(host.validityMessage).toBeTruthy();
    });

    it('should pass validity checking when required and has a value', async () => {
      render(
        html`<vi-textarea required value="some text"></vi-textarea>`,
        container,
      );
      const host = document.querySelector('vi-textarea') as ViTextarea;
      await host.updateComplete;

      const isValid = host.reportValidity();
      expect(isValid).toBe(true);
      expect(host.status).toBe('default');
    });

    it('should support setCustomValidity and clear state on empty message', async () => {
      render(html`<vi-textarea></vi-textarea>`, container);
      const host = document.querySelector('vi-textarea') as ViTextarea;
      await host.updateComplete;

      host.setCustomValidity('Custom invalid message');
      expect(host.checkValidity()).toBe(false);
      expect(host.status).toBe('invalid');
      expect(host.validityMessage).toBe('Custom invalid message');

      host.setCustomValidity('');
      expect(host.checkValidity()).toBe(true);
      expect(host.status).toBe('default');
    });
  });

  describe('Form Participation', () => {
    it('should reset value to initial attribute value on form reset', async () => {
      render(
        html`
          <form id="test-form">
            <vi-textarea name="my-field" value="initial-value"></vi-textarea>
          </form>
        `,
        container,
      );
      const el = document.querySelector('vi-textarea') as ViTextarea;
      const form = document.querySelector('#test-form') as HTMLFormElement;
      await el.updateComplete;

      expect(el.value).toBe('initial-value');

      el.value = 'new-value';
      await el.updateComplete;
      expect(el.value).toBe('new-value');

      form.reset();
      await el.updateComplete;

      expect(el.value).toBe('initial-value');
    });
  });

  describe('Missing Branch Coverage', () => {
    it('syncs value to textarea before validating if out of sync', async () => {
      render(html`<vi-textarea required></vi-textarea>`, container);
      const host = document.querySelector('vi-textarea') as any;
      await host.updateComplete;

      const textarea = host.shadowRoot.querySelector('textarea');
      textarea.value = 'typed';
      host.value = '';

      const isValid = host.checkValidity();
      expect(isValid).toBe(false);
      expect(textarea.value).toBe('');
    });

    it('validates without a textarea element', () => {
      const host = document.createElement('vi-textarea') as any;
      host.required = true;
      host.value = '';

      const isValid = host.checkValidity();
      expect(isValid).toBe(false);
      expect(host.validityMessage).not.toBe('');
    });
  });

  describe('Accessibility (A11y)', () => {
    it('should pass axe accessibility audits', async () => {
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';

      render(
        html`
          <vi-textarea aria-label="Comment area" placeholder="Add some notes">
            <span slot="helper">Please enter notes here</span>
          </vi-textarea>
        `,
        container,
      );

      const host = document.querySelector('vi-textarea') as ViTextarea;
      await host.updateComplete;

      const results = await axe.run(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          region: { enabled: false },
          'color-contrast': { enabled: false },
        },
      });

      expect(results.violations).toHaveLength(0);
    });
  });
});
