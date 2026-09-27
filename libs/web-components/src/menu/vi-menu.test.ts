import { expect } from '@wdio/globals';
import { render, html } from 'lit';
import './index.js';
import type { ViMenu } from './vi-menu.js';
import type { ViMenuItem } from './vi-menu-item.js';

describe('vi-menu', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render menu and items correctly', async () => {
    render(html`
      <vi-menu>
        <vi-menu-item value="1">Item 1</vi-menu-item>
        <vi-menu-item value="2">Item 2</vi-menu-item>
      </vi-menu>
    `, container);

    const el = container.querySelector('vi-menu') as ViMenu;
    await el.updateComplete;
    expect(el).toBeTruthy();
    
    const items = el.querySelectorAll('vi-menu-item');
    expect(items.length).toBe(2);
  });

  it('should dispatch click event with value', async () => {
    let clickedValue = '';
    
    const handleEvent = (e: CustomEvent) => {
      clickedValue = e.detail.value;
    };

    render(html`
      <vi-menu @vi-menu-item-click=${handleEvent}>
        <vi-menu-item value="test-value">Test</vi-menu-item>
      </vi-menu>
    `, container);

    const el = container.querySelector('vi-menu') as ViMenu;
    await el.updateComplete;

    const item = el.querySelector('vi-menu-item') as ViMenuItem;
    const innerLi = item.shadowRoot!.querySelector('li') as HTMLElement;
    
    innerLi.click();

    expect(clickedValue).toBe('test-value');
  });

  it('should handle keyboard navigation', async () => {
    render(html`
      <vi-menu>
        <vi-menu-item value="1" id="item1">1</vi-menu-item>
        <vi-menu-item value="2" id="item2">2</vi-menu-item>
      </vi-menu>
    `, container);

    const el = container.querySelector('vi-menu') as ViMenu;
    await el.updateComplete;

    const item1 = el.querySelector('#item1') as ViMenuItem;
    const item1Li = item1.shadowRoot!.querySelector('li') as HTMLElement;
    const item2 = el.querySelector('#item2') as ViMenuItem;

    item1Li.focus();
    expect(document.activeElement).toBe(item1);

    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

    await el.updateComplete;
    await new Promise(r => setTimeout(r, 50));
    expect(document.activeElement).toBe(item2);
  });
});
