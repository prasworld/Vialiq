import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import './vi-input.js'; // Ensure the Custom Element is registered
import type { ViInput } from './vi-input.js';

describe('vi-input', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render the custom element and its shadow DOM', async () => {
      render(html`<vi-input></vi-input>`, container);

      const host = await $('vi-input');
      await expect(host).toExist();

      const input = await host.shadow$('.input-control');
      await expect(input).toExist();
    });

  describe('Properties and defaults', () => {
    it('should have correct default property values', () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;

      expect(el.type).toBe('text');
      expect(el.value).toBe('');
      expect(el.disabled).toBe(false);
      expect(el.required).toBe(false);
      expect(el.status).toBe('default');
    });

    it('should reflect the type attribute to the native input', async () => {
      render(html`<vi-input type="email"></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const input = el.shadowRoot?.querySelector('input');
      expect(input?.type).toBe('email');
    });

    it('should pass placeholder to the native input', async () => {
      render(html`<vi-input placeholder="Enter your name"></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const input = el.shadowRoot?.querySelector('input');
      expect(input?.placeholder).toBe('Enter your name');
    });

    it('should disable the native input when disabled is set', async () => {
      render(html`<vi-input disabled></vi-input>`, container);
      const input = await $('vi-input').shadow$('.input-control');
      await expect(input).toBeDisabled();
    });

    it('should re-enable the native input when disabled is removed', async () => {
      render(html`<vi-input disabled></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      el.disabled = false;
      await el.updateComplete;

      const input = await $('vi-input').shadow$('.input-control');
      await expect(input).toBeEnabled();
    });
  });

  describe('Value binding', () => {
    it('should reflect value changes to the native input', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;

      el.value = 'hello world';
      await el.updateComplete;

      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('hello world');
    });
  });

  describe('Events', () => {
    it('should emit vialiq-input on every keystroke', async () => {
      let lastValue: string | undefined;
      render(
        html`<vi-input
          @vialiq-input=${(e: CustomEvent<{ value: string }>) => (lastValue = e.detail.value)}
        ></vi-input>`,
        container,
      );
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
      input.value = 'hello';
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

      expect(lastValue).toBe('hello');
    });

    it('should emit vialiq-change when the value is committed', async () => {
      let lastValue: string | undefined;
      render(
        html`<vi-input
          @vialiq-change=${(e: CustomEvent<{ value: string }>) => (lastValue = e.detail.value)}
        ></vi-input>`,
        container,
      );
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
      input.value = 'committed';
      input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

      expect(lastValue).toBe('committed');
    });

    it('vialiq-input should bubble and be composed', async () => {
      let received = false;
      container.addEventListener('vialiq-input', () => (received = true));

      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
      input.value = 'x';
      input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

      expect(received).toBe(true);
    });
  });

  describe('Validation', () => {
    it('checkValidity() should return false and set status to invalid when required and empty', () => {
      render(html`<vi-input required></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;

      const valid = el.checkValidity();

      expect(valid).toBe(false);
      expect(el.status).toBe('invalid');
    });

    it('checkValidity() should return true and clear status when required and has a value', async () => {
      render(html`<vi-input required></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      // First make it invalid so we can verify the clear
      el.checkValidity();
      el.value = 'test@example.com';
      await el.updateComplete;

      const valid = el.checkValidity();

      expect(valid).toBe(true);
      expect(el.status).toBe('default');
    });

    it('should show the error validation message when status is invalid and validityMessage is set', async () => {
      render(html`<vi-input required></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;

      el.checkValidity();
      el.validityMessage = 'This field is required';
      await el.updateComplete;

      const msgEl = el.shadowRoot?.querySelector('.input-validation--invalid');
      expect(msgEl).toBeTruthy();
      expect(msgEl?.textContent?.trim()).toBe('This field is required');
    });

    it('should hide the validation message when validityMessage is cleared', async () => {
      render(html`<vi-input required></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;

      el.checkValidity(); // sets status = 'invalid'
      el.validityMessage = 'Required';
      await el.updateComplete;

      el.value = 'filled';
      el.checkValidity(); // clears status back to 'default'
      await el.updateComplete;

      const msgEl = el.shadowRoot?.querySelector('.input-validation--invalid');
      expect(msgEl).toBeNull();
    });

    it('should show the valid validation message when status is valid and validityMessage is set', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;

      el.status = 'valid';
      el.validityMessage = 'Looks good!';
      await el.updateComplete;

      const msgEl = el.shadowRoot?.querySelector('.input-validation--valid');
      expect(msgEl).toBeTruthy();
      expect(msgEl?.textContent?.trim()).toBe('Looks good!');
    });

    it('setCustomValidity() should mark the field as invalid with the given message', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;

      el.setCustomValidity('Server error: email already taken');
      await el.updateComplete;

      expect(el.status).toBe('invalid');
      expect(el.validityMessage).toBe('Server error: email already taken');
    });

    it('setCustomValidity("") should clear the invalid state', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;

      el.setCustomValidity('Something went wrong');
      await el.updateComplete;

      el.setCustomValidity('');
      await el.updateComplete;

      expect(el.status).toBe('default');
      expect(el.validityMessage).toBe('');
    });

    it('should be invalid when type is email and value is invalid', async () => {
      render(html`<vi-input type="email" value="invalid-email"></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const valid = el.checkValidity();
      expect(valid).toBe(false);
      expect(el.status).toBe('invalid');
      expect(el.validityMessage).toBeTruthy();
    });

    it('should be invalid when type is url and value is invalid', async () => {
      render(html`<vi-input type="url" value="invalid-url"></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const valid = el.checkValidity();
      expect(valid).toBe(false);
      expect(el.status).toBe('invalid');
      expect(el.validityMessage).toBeTruthy();
    });

    it('should set accessibility ARIA attributes on the native input', async () => {
      render(html`<vi-input required value=""></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
      expect(input).toBeTruthy();

      expect(input.getAttribute('aria-required')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('helper-text');

      el.checkValidity();
      el.validityMessage = 'Invalid input value';
      await el.updateComplete;

      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('helper-text validation-message');
      expect(input.getAttribute('aria-errormessage')).toBe('validation-message');
      
      const valMsg = el.shadowRoot?.querySelector('#validation-message');
      expect(valMsg).toBeTruthy();
    });

    it('should apply helper class and part on helper slot wrapper', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      const helperWrapper = el.shadowRoot?.querySelector('#helper-text');
      expect(helperWrapper).toBeTruthy();
      expect(helperWrapper?.classList.contains('input-helper')).toBe(true);
      expect(helperWrapper?.getAttribute('part')).toBe('helper');
    });
  });

  describe('Focus management', () => {
    it('should delegate focus to the inner input via FocusableMixin', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      el.focus();
      await el.updateComplete;

      // With delegatesFocus: true, the host element is the document activeElement,
      // and the inner input receives the visual focus ring through shadow delegation.
      expect(document.activeElement).toBe(el);
    });

    it('should have tabIndex 0 so it participates in tab order', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      expect(el.tabIndex).toBe(0);
    });

    it('should remove from tab order when disabled', async () => {
      render(html`<vi-input disabled></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      expect(el.tabIndex).toBe(-1);
    });

    it('should restore tab order when re-enabled', async () => {
      render(html`<vi-input disabled></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      el.disabled = false;
      await el.updateComplete;

      expect(el.tabIndex).toBe(0);
    });

    it('should move focus backward to the previous element via Shift+Tab', async () => {
      render(html`<button id="before">Before</button><vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      // A WebDriver click on the host is a real user gesture (equivalent to a mouse click).
      // It establishes OS-level focus inside the shadow DOM via delegatesFocus.
      await (await $('vi-input')).click();
      await browser.pause(50);

      // Shift+Tab should move back to #before.
      await browser.keys(['Shift', 'Tab']);
      await browser.pause(50);

      const activeId = await browser.execute(() => document.activeElement?.id);
      expect(activeId).toBe('before');
    });

    it('should apply :focus-within on host when the inner input is focused', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      el.focus();
      await browser.pause(50);

      // :focus-within on the host is set by the browser whenever a descendant
      // (including the delegated inner input) has focus.
      const hasFocusWithin = await browser.execute(() => {
        const host = document.querySelector('vi-input') as Element;
        return host.matches(':focus-within');
      });
      expect(hasFocusWithin).toBe(true);
    });

    it('should lose :focus-within when blurred', async () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      el.focus();
      await browser.pause(50);

      el.blur();
      await browser.pause(50);

      const hasFocusWithin = await browser.execute(() => {
        const host = document.querySelector('vi-input') as Element;
        return host.matches(':focus-within');
      });
      expect(hasFocusWithin).toBe(false);
    });

    it('should NOT be reachable via Tab when disabled', async () => {
      render(html`<button id="before">Before</button><vi-input disabled></vi-input><button id="after">After</button>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      // WebDriver click on #before to establish real focus context before pressing Tab.
      await (await $('#before')).click();
      await browser.pause(50);

      await browser.keys(['Tab']);
      await browser.pause(50);

      // Tab should skip the disabled vi-input and land on the button after it.
      const activeTag = await browser.execute(() => document.activeElement?.id);
      expect(activeTag).toBe('after');
    });

    it('should accept typed characters and Tab out to the next focusable element', async () => {
      render(
        html`<vi-input></vi-input><button id="after">After</button>`,
        container,
      );
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;

      // Step 1 — focus vi-input via a real WebDriver click (a real user gesture;
      // delegatesFocus forwards OS focus to the inner <input>).
      await (await $('vi-input')).click();
      await browser.pause(50);

      // Confirm the host is the document-level active element and the inner <input>
      // received shadow-DOM focus via delegatesFocus.
      const hostActive = await browser.execute(() => document.activeElement?.tagName.toLowerCase());
      expect(hostActive).toBe('vi-input');

      const innerFocused = await browser.execute(() => {
        const host = document.querySelector('vi-input') as HTMLElement;
        return host.shadowRoot?.activeElement?.tagName.toLowerCase();
      });
      expect(innerFocused).toBe('input');

      // Step 2 — type 'abcd'.
      // With delegatesFocus: true the inner <input> holds OS-level keyboard focus,
      // so browser.keys() delivers characters directly to it.
      await browser.keys(['a', 'b', 'c', 'd']);
      await browser.pause(50);

      // Step 3 — confirm both the native input's value and the component property.
      const innerValue = await browser.execute(() => {
        const host = document.querySelector('vi-input') as HTMLElement;
        return (host.shadowRoot?.querySelector('input') as HTMLInputElement)?.value;
      });
      expect(innerValue).toBe('abcd');

      const componentValue = await browser.execute(
        () => (document.querySelector('vi-input') as any).value,
      );
      expect(componentValue).toBe('abcd');

      // Step 4 — Tab out.
      // Tab FROM a focused custom element to a plain button is reliable.
      await browser.keys(['Tab']);
      await browser.pause(50);

      const activeAfterTab = await browser.execute(() => document.activeElement?.id);
      expect(activeAfterTab).toBe('after');
    });
  });

  describe('Form Participation', () => {
    it('should reset value to initial attribute value on form reset', async () => {
      render(
        html`
          <form id="test-form">
            <vi-input name="my-field" value="initial-value"></vi-input>
          </form>
        `,
        container,
      );
      const el = document.querySelector('vi-input') as ViInput;
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

  describe('Sizing', () => {
    it('should default to md size', () => {
      render(html`<vi-input></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      expect(el.size).toBe('md');
    });

    it('should reflect size attribute changes', async () => {
      render(html`<vi-input size="lg"></vi-input>`, container);
      const el = document.querySelector('vi-input') as ViInput;
      await el.updateComplete;
      expect(el.size).toBe('lg');
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
          <vi-input aria-label="Full Name" placeholder="John Doe" name="input-a11y-1"></vi-input>
          <vi-input aria-label="Email Address" type="email" value="invalid-email" status="invalid" validityMessage="Email is invalid" name="input-a11y-2"></vi-input>
          <vi-input aria-label="Disabled Field" disabled name="input-a11y-3"></vi-input>
        `,
        container
      );

      const host = document.querySelector('vi-input') as ViInput;
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


