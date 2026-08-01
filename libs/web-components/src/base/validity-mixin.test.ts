import { expect } from '@wdio/globals';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ValidityMixin } from './validity-mixin.js';

@customElement('vi-validity-test')
class ViValidityTest extends ValidityMixin<string, typeof LitElement>(LitElement) {
  @property({ type: String }) accessor value = '';
  @property({ type: Boolean }) accessor disabled = false;
  
  protected _testValidity() {
    if (this.required && !this.value) {
      return { valueMissing: true };
    }
    return {};
  }
  
  protected _getValidationAnchor() {
    return this.shadowRoot?.querySelector('div') || undefined;
  }
  
  render() {
    return html`<div>Test</div>`;
  }
}

describe('ValidityMixin', () => {
  let element: ViValidityTest;
  
  beforeEach(async () => {
    element = document.createElement('vi-validity-test') as ViValidityTest;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  it('initializes with default status', () => {
    expect(element.status).toBe('default');
    expect(element.required).toBe(false);
    expect(element.validityMessage).toBe('');
    expect(element.willValidate).toBe(true);
  });

  it('willValidate is false when disabled', async () => {
    element.disabled = true;
    await element.updateComplete;
    expect(element.willValidate).toBe(false);
  });

  it('checkValidity() returns boolean and does not change visual status', async () => {
    element.required = true;
    await element.updateComplete;
    
    // Invalid state
    expect(element.checkValidity()).toBe(false);
    expect(element.status).toBe('default'); // Status untouched by checkValidity
    
    // Valid state
    element.value = 'abc';
    await element.updateComplete;
    expect(element.checkValidity()).toBe(true);
  });

  it('reportValidity() updates visual status and returns boolean', async () => {
    element.required = true;
    await element.updateComplete;
    
    // Invalid
    expect(element.reportValidity()).toBe(false);
    expect(element.status).toBe('invalid');
    
    // Valid
    element.value = 'abc';
    await element.updateComplete;
    expect(element.reportValidity()).toBe(true);
    expect(element.status).toBe('valid');
  });

  it('setCustomValidity() forces invalid state', async () => {
    element.setCustomValidity('Custom error');
    expect(element.validity.customError).toBe(true);
    expect(element.validationMessage).toBe('Custom error');
    
    // Clear
    element.setCustomValidity('');
    expect(element.validity.customError).toBe(false);
  });

  it('formResetCallback resets status and validity message', async () => {
    element.status = 'invalid';
    element.validityMessage = 'error';
    element.formResetCallback();
    
    expect(element.status).toBe('default');
    expect(element.validityMessage).toBe('');
    expect(element.validity.valid).toBe(true);
  });

  it('formDisabledCallback propagates disabled state', async () => {
    element.formDisabledCallback(true);
    expect(element.disabled).toBe(true);
  });

  it('formStateRestoreCallback restores string state', async () => {
    element.formStateRestoreCallback('restored', 'restore');
    expect(element.value).toBe('restored');
  });
  
  it('formStateRestoreCallback ignores non-string state (default implementation)', async () => {
    element.value = 'original';
    element.formStateRestoreCallback(null, 'restore');
    expect(element.value).toBe('original');
  });
});
