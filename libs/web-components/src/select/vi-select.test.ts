import { expect, browser } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-select.js';
import './vi-select-option.js';
import type { ViSelect } from './vi-select.js';

describe('vi-select', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders with placeholder initially', async () => {
    render(html`
      <vi-select placeholder="Choose an option">
        <vi-select-option value="1" label="One"></vi-select-option>
      </vi-select>
    `, container);

    const el = document.querySelector('vi-select') as ViSelect;
    await el.updateComplete;

    const label = el.shadowRoot?.querySelector('.select-label');
    expect(label?.textContent?.trim()).toBe('Choose an option');
  });

  it('reflects selected option label based on value property', async () => {
    render(html`
      <vi-select value="2">
        <vi-select-option value="1" label="One"></vi-select-option>
        <vi-select-option value="2" label="Two"></vi-select-option>
      </vi-select>
    `, container);

    const el = document.querySelector('vi-select') as ViSelect;
    await el.updateComplete;
    // Wait for slotchange and mutation observer
    await browser.pause(50);
    await el.updateComplete;

    const label = el.shadowRoot?.querySelector('.select-label');
    expect(label?.textContent?.trim()).toBe('Two');
  });

  it('updates value and label when option is clicked', async () => {
    render(html`
      <vi-select>
        <vi-select-option value="1" label="One"></vi-select-option>
        <vi-select-option value="2" label="Two"></vi-select-option>
      </vi-select>
    `, container);

    const el = document.querySelector('vi-select') as ViSelect;
    await el.updateComplete;
    await browser.pause(50);

    const optionTwo = document.querySelector('vi-select-option[value="2"]') as HTMLElement;
    
    // Simulate user selecting "Two"
    optionTwo.click();

    await el.updateComplete;
    await browser.pause(50);

    expect(el.value).toBe('2');
    const label = el.shadowRoot?.querySelector('.select-label');
    expect(label?.textContent?.trim()).toBe('Two');
  });

  it('fires vialiq-change event on selection', async () => {
    let detail: any = null;
    let eventFired = false;
    
    render(html`
      <vi-select @vialiq-change=${(e: CustomEvent) => { eventFired = true; detail = e.detail; }}>
        <vi-select-option value="1" label="One"></vi-select-option>
      </vi-select>
    `, container);

    const el = document.querySelector('vi-select') as ViSelect;
    await el.updateComplete;
    await browser.pause(50);

    const optionOne = document.querySelector('vi-select-option[value="1"]') as HTMLElement;
    optionOne.click();

    expect(eventFired).toBe(true);
    expect(detail.value).toBe('1');
    expect(detail.label).toBe('One');
  });

  it('clears selection when clear button is clicked', async () => {
    let clearFired = false;
    let changeValue = '1';
    
    render(html`
      <vi-select clearable value="1" @vialiq-clear=${() => clearFired = true} @vialiq-change=${(e: CustomEvent) => changeValue = e.detail.value}>
        <vi-select-option value="1" label="One"></vi-select-option>
      </vi-select>
    `, container);

    const el = document.querySelector('vi-select') as ViSelect;
    await el.updateComplete;
    await browser.pause(50); // wait for slot sync

    expect(el.value).toBe('1');

    const clearBtn = el.shadowRoot?.querySelector('.select-clear-btn') as HTMLButtonElement;
    clearBtn.click();

    await el.updateComplete;

    expect(el.value).toBe('');
    expect(clearFired).toBe(true);
    expect(changeValue).toBe('');
  });

  it('handles validity correctly', async () => {
    render(html`
      <vi-select required>
        <vi-select-option value="1" label="One"></vi-select-option>
      </vi-select>
    `, container);

    const el = document.querySelector('vi-select') as ViSelect;
    await el.updateComplete;

    const isValid = el.reportValidity();
    expect(isValid).toBe(false);
    expect(el.status).toBe('invalid');
    
    el.value = '1';
    await el.updateComplete;
    
    expect(el.reportValidity()).toBe(true);
  });
});
