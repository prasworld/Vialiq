import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './index.js';
import type { ViFloatButton } from './vi-float-button.js';
import type { ViFloatButtonGroup } from './vi-float-button-group.js';

describe('vi-float-button', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders with default properties', async () => {
    render(html`<vi-float-button id="btn1"></vi-float-button>`, container);
    const btn = container.querySelector('#btn1') as ViFloatButton;
    await btn.updateComplete;

    expect(btn.shape).toBe('circle');
    expect(btn.type).toBe('default');
    expect(btn.size).toBe('default');
    expect(btn.disabled).toBe(false);
    expect(btn.backTop).toBe(false);

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    expect(nativeBtn).toBeTruthy();
    expect(nativeBtn?.classList.contains('float-button')).toBe(true);
  });

  it('reflects shape, type, and size to classes', async () => {
    render(
      html`<vi-float-button
        id="btn-custom"
        shape="square"
        type="primary"
        size="sm"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-custom') as ViFloatButton;
    await btn.updateComplete;

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    expect(nativeBtn?.classList.contains('float-button--square')).toBe(true);
    expect(nativeBtn?.classList.contains('float-button--primary')).toBe(true);
    expect(nativeBtn?.classList.contains('float-button--sm')).toBe(true);
  });

  it('renders anchor element when href is provided', async () => {
    render(
      html`<vi-float-button
        id="btn-link"
        href="https://example.com"
        target="_blank"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-link') as ViFloatButton;
    await btn.updateComplete;

    const anchor = btn.shadowRoot?.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('href')).toBe('https://example.com');
    expect(anchor?.getAttribute('target')).toBe('_blank');
  });

  it('renders badge dot and count', async () => {
    render(
      html`
        <vi-float-button id="btn-dot" badge-dot></vi-float-button>
        <vi-float-button
          id="btn-count"
          badge="5"
          badge-status="warning"
        ></vi-float-button>
      `,
      container,
    );
    const btnDot = container.querySelector('#btn-dot') as ViFloatButton;
    const btnCount = container.querySelector('#btn-count') as ViFloatButton;
    await btnDot.updateComplete;
    await btnCount.updateComplete;

    const dot = btnDot.shadowRoot?.querySelector('.badge-dot');
    expect(dot).toBeTruthy();

    const count = btnCount.shadowRoot?.querySelector('.badge-count');
    expect(count).toBeTruthy();
    expect(count?.textContent).toBe('5');
    expect(btnCount.getAttribute('badge-status')).toBe('warning');
  });

  it('renders description text', async () => {
    render(
      html`<vi-float-button
        id="btn-desc"
        description="Help"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-desc') as ViFloatButton;
    await btn.updateComplete;

    const descEl = btn.shadowRoot?.querySelector('.float-button__description');
    expect(descEl).toBeTruthy();
    expect(descEl?.textContent?.trim()).toBe('Help');
  });

  it('dispatches vi-float-button-click event on activation', async () => {
    render(html`<vi-float-button id="btn-click"></vi-float-button>`, container);
    const btn = container.querySelector('#btn-click') as ViFloatButton;
    await btn.updateComplete;

    let clicked = false;
    btn.addEventListener('vi-float-button-click', () => {
      clicked = true;
    });

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    nativeBtn?.click();

    expect(clicked).toBe(true);
  });

  it('suppresses click when disabled', async () => {
    render(
      html`<vi-float-button id="btn-dis" disabled></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-dis') as ViFloatButton;
    await btn.updateComplete;

    let clicked = false;
    btn.addEventListener('vi-float-button-click', () => {
      clicked = true;
    });

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    nativeBtn?.click();

    expect(clicked).toBe(false);
  });

  it('handles back-top scrolling mode and default icon', async () => {
    render(
      html`<vi-float-button
        id="btn-backtop"
        back-top
        visibility-height="200"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-backtop') as ViFloatButton;
    await btn.updateComplete;

    // Back-top renders the default arrow-up SVG
    const svgIcon = btn.shadowRoot?.querySelector('.default-icon');
    expect(svgIcon).toBeTruthy();

    let backTopFired = false;
    btn.addEventListener('vi-float-button-back-top', () => {
      backTopFired = true;
    });

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    nativeBtn?.click();

    expect(backTopFired).toBe(true);
  });
});

describe('vi-float-button-group', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders group and propagates in-group to child buttons', async () => {
    render(
      html`
        <vi-float-button-group id="group1" trigger="click">
          <vi-float-button id="item1"></vi-float-button>
          <vi-float-button id="item2"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector('#group1') as ViFloatButtonGroup;
    const item1 = container.querySelector('#item1') as ViFloatButton;
    const item2 = container.querySelector('#item2') as ViFloatButton;
    await group.updateComplete;
    await item1.updateComplete;
    await item2.updateComplete;

    expect(item1.inGroup).toBe(true);
    expect(item2.inGroup).toBe(true);
    expect(group.open).toBe(false);
  });

  it('toggles open state on trigger click when trigger="click"', async () => {
    render(
      html`
        <vi-float-button-group id="group2" trigger="click">
          <vi-float-button id="sub-item"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector('#group2') as ViFloatButtonGroup;
    await group.updateComplete;

    let openChangeCount = 0;
    group.addEventListener('vi-float-button-open-change', (e: Event) => {
      const custom = e as CustomEvent<{ open: boolean }>;
      if (custom.detail.open) openChangeCount++;
    });

    const triggerBtn = group.shadowRoot?.querySelector(
      '.float-button-group__trigger',
    ) as ViFloatButton;
    expect(triggerBtn).toBeTruthy();

    // Trigger click
    const nativeTrigger = triggerBtn.shadowRoot?.querySelector('button');
    nativeTrigger?.click();
    await group.updateComplete;

    expect(group.open).toBe(true);
    expect(openChangeCount).toBe(1);

    // Click again to close
    nativeTrigger?.click();
    await group.updateComplete;
    expect(group.open).toBe(false);
  });

  it('closes on Escape key press when open', async () => {
    render(
      html`
        <vi-float-button-group id="group3" trigger="click" open>
          <vi-float-button id="item-esc"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector('#group3') as ViFloatButtonGroup;
    await group.updateComplete;

    expect(group.open).toBe(true);

    group.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await group.updateComplete;

    expect(group.open).toBe(false);
  });

  it('toggles open state on hover when trigger="hover"', async () => {
    render(
      html`
        <vi-float-button-group id="group-hover" trigger="hover">
          <vi-float-button id="item-h"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector('#group-hover') as ViFloatButtonGroup;
    await group.updateComplete;

    const groupDiv = group.shadowRoot?.querySelector('.float-button-group');
    groupDiv?.dispatchEvent(new MouseEvent('mouseenter'));
    await group.updateComplete;
    expect(group.open).toBe(true);

    groupDiv?.dispatchEvent(new MouseEvent('mouseleave'));
    await group.updateComplete;
    expect(group.open).toBe(false);
  });

  it('navigates menu items with ArrowUp, ArrowDown, Home, and End keys', async () => {
    render(
      html`
        <vi-float-button-group id="group-nav" trigger="click" open>
          <vi-float-button id="nav1" description="First"></vi-float-button>
          <vi-float-button id="nav2" description="Second"></vi-float-button>
          <vi-float-button id="nav3" description="Third"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector('#group-nav') as ViFloatButtonGroup;
    const nav1 = container.querySelector('#nav1') as ViFloatButton;
    const nav2 = container.querySelector('#nav2') as ViFloatButton;
    const nav3 = container.querySelector('#nav3') as ViFloatButton;
    await group.updateComplete;
    await nav1.updateComplete;
    await nav2.updateComplete;
    await nav3.updateComplete;

    // Home key focuses first item
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement === nav1 || nav1.matches(':focus-within')).toBe(true);

    // End key focuses last item
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement === nav3 || nav3.matches(':focus-within')).toBe(true);

    // ArrowUp from last item moves to second item
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    expect(document.activeElement === nav2 || nav2.matches(':focus-within')).toBe(true);

    // ArrowDown from second item moves to third item
    group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement === nav3 || nav3.matches(':focus-within')).toBe(true);
  });

  it('reflects correct aria attributes on trigger and menu', async () => {
    render(
      html`
        <vi-float-button-group id="group-aria" aria-label="Quick tools">
          <vi-float-button id="aria-item"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector('#group-aria') as ViFloatButtonGroup;
    const item = container.querySelector('#aria-item') as ViFloatButton;
    await group.updateComplete;
    await item.updateComplete;

    const triggerBtn = group.shadowRoot?.querySelector('.float-button-group__trigger') as ViFloatButton;
    expect(triggerBtn.getAttribute('aria-haspopup')).toBe('menu');
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('false');

    const menu = group.shadowRoot?.querySelector('.float-button-group__menu');
    expect(menu?.getAttribute('role')).toBe('menu');
    expect(menu?.getAttribute('aria-hidden')).toBe('true');

    // Child button has role="menuitem"
    const nativeChildBtn = item.shadowRoot?.querySelector('button');
    expect(nativeChildBtn?.getAttribute('role')).toBe('menuitem');

    // Open group
    group.open = true;
    await group.updateComplete;
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('true');
    expect(menu?.getAttribute('aria-hidden')).toBe('false');
  });
});

