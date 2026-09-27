import { expect } from '@wdio/globals';
import { render, html } from 'lit';
import './index.js';
import '../menu/index.js';
import '../button/index.js';
import type { ViContextMenu } from './vi-context-menu.js';

describe('vi-context-menu', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should open when contextmenu event is fired on trigger', async () => {
    render(html`
      <vi-context-menu>
        <div id="trigger" style="width: 100px; height: 100px;">Right click me</div>
        <vi-menu slot="content">
          <vi-menu-item value="1">Item 1</vi-menu-item>
        </vi-menu>
      </vi-context-menu>
    `, container);

    const el = container.querySelector('vi-context-menu') as ViContextMenu;
    await el.updateComplete;

    expect(el.open).toBe(false);

    const trigger = el.querySelector('#trigger');
    const contextMenuEvent = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: 50,
      clientY: 50
    });
    
    trigger!.dispatchEvent(contextMenuEvent);
    
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 0));
    
    expect(el.open).toBe(true);
  });

  it('should close when a menu item is clicked', async () => {
    render(html`
      <vi-context-menu open>
        <div id="trigger">Right click me</div>
        <vi-menu slot="content">
          <vi-menu-item value="1">Item 1</vi-menu-item>
        </vi-menu>
      </vi-context-menu>
    `, container);

    const el = container.querySelector('vi-context-menu') as ViContextMenu;
    await el.updateComplete;
    expect(el.open).toBe(true);

    const menuItem = el.querySelector('vi-menu-item');
    const innerLi = menuItem!.shadowRoot!.querySelector('li');
    
    // Simulate clicking the menu item
    innerLi!.click();

    await el.updateComplete;
    await new Promise(r => setTimeout(r, 0));

    expect(el.open).toBe(false);
  });
});
