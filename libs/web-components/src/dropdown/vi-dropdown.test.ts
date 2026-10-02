import { expect } from '@wdio/globals';
import { render, html } from 'lit';
import './index.js';
import '../menu/index.js';
import '../button/index.js';
import type { ViDropdown } from './vi-dropdown.js';

describe('vi-dropdown', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('should render trigger element', async () => {
    render(
      html`
        <vi-dropdown>
          <vi-button id="trigger">Dropdown</vi-button>
          <vi-menu slot="content">
            <vi-menu-item value="1">Item 1</vi-menu-item>
          </vi-menu>
        </vi-dropdown>
      `,
      container,
    );

    const el = container.querySelector('vi-dropdown') as ViDropdown;
    await el.updateComplete;

    expect(el).toBeTruthy();
    const button = el.querySelector('vi-button');
    expect(button).toBeTruthy();
    expect(button!.textContent).toBe('Dropdown');
  });

  it('should close when a menu item is clicked', async () => {
    render(
      html`
        <vi-dropdown open>
          <vi-button>Dropdown</vi-button>
          <vi-menu slot="content">
            <vi-menu-item value="1">Item 1</vi-menu-item>
          </vi-menu>
        </vi-dropdown>
      `,
      container,
    );

    const el = container.querySelector('vi-dropdown') as ViDropdown;
    await el.updateComplete;
    expect(el.open).toBe(true);

    const menuItem = el.querySelector('vi-menu-item');
    const innerLi = menuItem!.shadowRoot!.querySelector('li');

    // Simulate clicking the menu item
    innerLi!.click();

    expect(el.open).toBe(false);
  });
});
