import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-switch.js';
import type { ViSwitch } from './vi-switch.js';

describe('vi-switch', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders correctly', async () => {
    render(html`<vi-switch></vi-switch>`, container);
    const el = container.querySelector('vi-switch') as ViSwitch;
    await el.updateComplete;
    expect(el).toBeDefined();
    const shadowRoot = el.shadowRoot;
    expect(shadowRoot).toBeDefined();
    const label = shadowRoot?.querySelector('.switch-wrapper');
    expect(label).toBeDefined();
  });

  it('reflects checked property to attribute', async () => {
    render(html`<vi-switch checked></vi-switch>`, container);
    const el = container.querySelector('vi-switch') as ViSwitch;
    await el.updateComplete;
    expect(el.checked).toBe(true);
    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('dispatches vi-switch-change event on click', async () => {
    render(html`<vi-switch></vi-switch>`, container);
    const el = container.querySelector('vi-switch') as ViSwitch;
    await el.updateComplete;

    let eventFired = false;
    let detailChecked = false;

    el.addEventListener('vi-switch-change', (e: Event) => {
      eventFired = true;
      detailChecked = (e as CustomEvent).detail.checked;
    });

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.click();

    expect(eventFired).toBe(true);
    expect(detailChecked).toBe(true);
    expect(el.checked).toBe(true);
  });

  it('does not dispatch event when disabled', async () => {
    render(html`<vi-switch disabled></vi-switch>`, container);
    const el = container.querySelector('vi-switch') as ViSwitch;
    await el.updateComplete;

    let eventFired = false;

    el.addEventListener('vi-switch-change', () => {
      eventFired = true;
    });

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    input.click();

    expect(eventFired).toBe(false);
    expect(el.checked).toBe(false);
  });

  it('reports valueMissing when required is true and switch is unchecked', async () => {
    render(html`<vi-switch required></vi-switch>`, container);
    const el = container.querySelector('vi-switch') as ViSwitch;
    await el.updateComplete;

    const isValid = el.checkValidity();
    expect(isValid).toBe(false);
    expect(el.validityMessage).toBeTruthy();

    const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('clears validityMessage when control becomes valid', async () => {
    render(html`<vi-switch required></vi-switch>`, container);
    const el = container.querySelector('vi-switch') as ViSwitch;
    await el.updateComplete;

    el.checkValidity();
    expect(el.validityMessage).toBeTruthy();

    el.checked = true;
    await el.updateComplete;
    el.checkValidity();
    expect(el.validityMessage).toBe('');
  });

  it('handles label placement correctly', async () => {
    render(html`<vi-switch label-placement="start">Test Label</vi-switch>`, container);
    const el = container.querySelector('vi-switch') as ViSwitch;
    await el.updateComplete;

    const labelNodes = el.shadowRoot?.querySelectorAll('.switch-label');
    expect(labelNodes?.length).toBe(1);

    const wrapper = el.shadowRoot?.querySelector('.switch-wrapper');
    expect(wrapper?.getAttribute('data-placement')).toBe('start');
  });
});
