import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ValidityMixin } from './validity-mixin.js';
import { ViElement } from './vi-element.js';

// ── Test harness element ─────────────────────────────────────────────────────
// A minimal form control that extends ValidityMixin to test the mixin in
// isolation. Only provides `value`, `name`, and `disabled` properties.
// Overrides `_testValidity()` to check required + empty value.

@customElement('test-validity-el')
class TestValidityEl extends ValidityMixin(ViElement) {
  @property() accessor value = '';
  @property() accessor name = '';
  @property({ type: Boolean, reflect: true }) accessor disabled = false;

  protected override _testValidity(): Partial<ValidityStateFlags> {
    if (this.required && !this.value) {
      return { valueMissing: true };
    }
    return {};
  }

  override updated(changed: import('lit').PropertyValues): void {
    super.updated(changed);
    if (changed.has('value')) {
      this._internals.setFormValue(this.value || null);
    }
  }

  override formResetCallback(): void {
    this.value = this.getAttribute('value') ?? '';
    super.formResetCallback();
  }
}

// Prevent duplicate registration warnings in multi-run test environments
declare global {
  interface HTMLElementTagNameMap {
    'test-validity-el': TestValidityEl;
  }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ValidityMixin', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Form Association ─────────────────────────────────────────────────────

  describe('Form Association', () => {
    it('sets static formAssociated = true on the subclass', async () => {
      render(html`<test-validity-el></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute(
        (e: TestValidityEl) => (e.constructor as typeof TestValidityEl & { formAssociated: boolean }).formAssociated,
        el
      );
      expect(result).toBe(true);
    });

    it('creates _internals as an ElementInternals instance', async () => {
      render(html`<test-validity-el></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const hasInternals = await browser.execute(
        (e: any) => e._internals != null && typeof e._internals.setFormValue === 'function',
        el
      );
      expect(hasInternals).toBe(true);
    });
  });

  // ── Constraint Validation API: checkValidity() ─────────────────────────

  describe('checkValidity()', () => {
    it('returns true when the control is valid', async () => {
      render(html`<test-validity-el value="hello"></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const isValid = await browser.execute(
        (e: TestValidityEl) => e.checkValidity(),
        el
      );
      expect(isValid).toBe(true);
    });

    it('returns false when required and value is empty', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const isValid = await browser.execute(
        (e: TestValidityEl) => e.checkValidity(),
        el
      );
      expect(isValid).toBe(false);
    });

    it('does NOT mutate the visual status property', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        const statusBefore = e.status;
        e.checkValidity();
        const statusAfter = e.status;
        return { statusBefore, statusAfter };
      }, el);

      expect(result.statusBefore).toBe('default');
      expect(result.statusAfter).toBe('default');
    });

    it('dispatches a cancelable "invalid" event when invalid', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        let eventFired = false;
        let eventCancelable = false;
        let eventBubbles = false;

        e.addEventListener('invalid', (evt: Event) => {
          eventFired = true;
          eventCancelable = evt.cancelable;
          eventBubbles = evt.bubbles;
        }, { once: true });

        e.checkValidity();
        return { eventFired, eventCancelable, eventBubbles };
      }, el);

      expect(result.eventFired).toBe(true);
      expect(result.eventCancelable).toBe(true);
      expect(result.eventBubbles).toBe(false);
    });

    it('does NOT dispatch "invalid" when valid', async () => {
      render(html`<test-validity-el value="ok"></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const eventFired = await browser.execute((e: TestValidityEl) => {
        let fired = false;
        e.addEventListener('invalid', () => { fired = true; }, { once: true });
        e.checkValidity();
        return fired;
      }, el);

      expect(eventFired).toBe(false);
    });
  });

  // ── Constraint Validation API: reportValidity() ────────────────────────

  describe('reportValidity()', () => {
    it('sets status to "invalid" when validation fails', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.reportValidity();
        return e.status;
      }, el);

      expect(result).toBe('invalid');
    });

    it('resets status to "default" when re-validated as valid', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        // First: fail
        e.reportValidity();
        const statusAfterFail = e.status;

        // Then: fix and re-validate
        e.value = 'fixed';
        e.reportValidity();
        const statusAfterFix = e.status;

        return { statusAfterFail, statusAfterFix };
      }, el);

      expect(result.statusAfterFail).toBe('invalid');
      expect(result.statusAfterFix).toBe('default');
    });
  });

  // ── ValidityState flags ────────────────────────────────────────────────

  describe('ValidityState', () => {
    it('has valueMissing=true after checkValidity on required empty', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.checkValidity();
        return {
          valueMissing: e.validity.valueMissing,
          valid: e.validity.valid,
        };
      }, el);

      expect(result.valueMissing).toBe(true);
      expect(result.valid).toBe(false);
    });

    it('has valid=true when not required', async () => {
      render(html`<test-validity-el></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const valid = await browser.execute(
        (e: TestValidityEl) => e.validity.valid,
        el
      );
      expect(valid).toBe(true);
    });

    it('validationMessage returns the message from internals', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.validityMessage = 'This field is required';
        e.checkValidity();
        return e.validationMessage;
      }, el);

      expect(result).toBe('This field is required');
    });
  });

  // ── setCustomValidity() ────────────────────────────────────────────────

  describe('setCustomValidity()', () => {
    it('sets customError flag and status to "invalid"', async () => {
      render(html`<test-validity-el></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.setCustomValidity('Custom error');
        return {
          status: e.status,
          validityMessage: e.validityMessage,
          customError: e.validity.customError,
          valid: e.validity.valid,
        };
      }, el);

      expect(result.status).toBe('invalid');
      expect(result.validityMessage).toBe('Custom error');
      expect(result.customError).toBe(true);
      expect(result.valid).toBe(false);
    });

    it('clears error when called with empty string', async () => {
      render(html`<test-validity-el></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.setCustomValidity('Some error');
        e.setCustomValidity('');
        return {
          status: e.status,
          validityMessage: e.validityMessage,
          customError: e.validity.customError,
          valid: e.validity.valid,
        };
      }, el);

      expect(result.status).toBe('default');
      expect(result.validityMessage).toBe('');
      expect(result.customError).toBe(false);
      expect(result.valid).toBe(true);
    });
  });

  // ── willValidate ───────────────────────────────────────────────────────

  describe('willValidate', () => {
    it('returns true when the control is enabled', async () => {
      render(html`<test-validity-el></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute(
        (e: TestValidityEl) => e.willValidate,
        el
      );
      expect(result).toBe(true);
    });

    it('returns false when the control is disabled', async () => {
      render(html`<test-validity-el disabled></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute(
        (e: TestValidityEl) => e.willValidate,
        el
      );
      expect(result).toBe(false);
    });
  });

  // ── Form Lifecycle Callbacks ───────────────────────────────────────────

  describe('Form Lifecycle', () => {
    it('formResetCallback() resets status and validityMessage', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.reportValidity(); // sets status=invalid
        const statusBefore = e.status;

        e.formResetCallback();
        return {
          statusBefore,
          statusAfter: e.status,
          validityMessage: e.validityMessage,
          value: e.value,
        };
      }, el);

      expect(result.statusBefore).toBe('invalid');
      expect(result.statusAfter).toBe('default');
      expect(result.validityMessage).toBe('');
      expect(result.value).toBe('');
    });

    it('formDisabledCallback(true) sets disabled = true', async () => {
      render(html`<test-validity-el></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.formDisabledCallback(true);
        return e.disabled;
      }, el);

      expect(result).toBe(true);
    });

    it('formDisabledCallback(false) sets disabled = false', async () => {
      render(html`<test-validity-el disabled></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.formDisabledCallback(false);
        return e.disabled;
      }, el);

      expect(result).toBe(false);
    });

    it('formStateRestoreCallback() restores string value', async () => {
      render(html`<test-validity-el></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.formStateRestoreCallback('restored-value', 'restore');
        return e.value;
      }, el);

      expect(result).toBe('restored-value');
    });
  });

  // ── Auto re-validation (.validity always fresh) ────────────────────────

  describe('Auto re-validation', () => {
    it('.validity is fresh after value change without explicit checkValidity()', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute(async (e: TestValidityEl) => {
        // Initially invalid (required, no value)
        await e.updateComplete;
        const validBefore = e.validity.valid;

        // Set value — should auto-sync validity
        e.value = 'now-has-value';
        await e.updateComplete;
        const validAfter = e.validity.valid;

        return { validBefore, validAfter };
      }, el);

      expect(result.validBefore).toBe(false);
      expect(result.validAfter).toBe(true);
    });

    it('.validity reflects required change without explicit checkValidity()', async () => {
      render(html`<test-validity-el value="hello"></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute(async (e: TestValidityEl) => {
        await e.updateComplete;
        const validBefore = e.validity.valid;

        // Now remove value and set required
        e.value = '';
        e.required = true;
        await e.updateComplete;
        const validAfter = e.validity.valid;

        return { validBefore, validAfter };
      }, el);

      expect(result.validBefore).toBe(true);
      expect(result.validAfter).toBe(false);
    });
  });

  // ── Cancelable invalid event ───────────────────────────────────────────

  describe('Cancelable invalid event', () => {
    it('preventDefault() on invalid event does not affect checkValidity return value', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.addEventListener('invalid', (evt: Event) => {
          evt.preventDefault();
        }, { once: true });

        const isValid = e.checkValidity();
        return { isValid, status: e.status };
      }, el);

      expect(result.isValid).toBe(false);
      expect(result.status).toBe('default');
    });

    it('preventDefault() on invalid event prevents status change in reportValidity()', async () => {
      render(html`<test-validity-el required></test-validity-el>`, container);
      const el = await $('test-validity-el') as unknown as TestValidityEl;

      const result = await browser.execute((e: TestValidityEl) => {
        e.addEventListener('invalid', (evt: Event) => {
          evt.preventDefault();
        }, { once: true });

        const isValid = e.reportValidity();
        return { isValid, status: e.status };
      }, el);

      expect(result.isValid).toBe(false);
      expect(result.status).toBe('default');
    });
  });
});
