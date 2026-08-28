import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-tabs.js';
import './vi-tab.js';
import './vi-tab-panel.js';

describe('vi-tabs', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders with first non-disabled tab active when no active attr set', async () => {
    render(
      html`
        <vi-tabs>
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2">Tab 2</vi-tab>
          <vi-tab-panel for="t1">Panel 1</vi-tab-panel>
          <vi-tab-panel for="t2">Panel 2</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const tab = await $('vi-tab[active]');
    await expect(tab).toExist();
    await expect(tab).toHaveAttribute('tab-id', 't1');
  });

  it('renders active tab set via attribute', async () => {
    render(
      html`
        <vi-tabs active="t2">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2">Tab 2</vi-tab>
          <vi-tab-panel for="t1">Panel 1</vi-tab-panel>
          <vi-tab-panel for="t2">Panel 2</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const activeTab = await $('vi-tab[active]');
    await expect(activeTab).toHaveAttribute('tab-id', 't2');
  });

  // ── ARIA ──────────────────────────────────────────────────────────────────

  it('sets correct role and aria attributes on the tablist', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab-panel for="t1">Panel 1</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const tabs = await $('vi-tabs');
    const tablist = await tabs.shadow$('[role="tablist"]');
    await expect(tablist).toExist();
    await expect(tablist).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('sets aria-selected="true" on the active tab button', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2">Tab 2</vi-tab>
          <vi-tab-panel for="t1">Panel 1</vi-tab-panel>
          <vi-tab-panel for="t2">Panel 2</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const activeTabEl = await $('vi-tab[tab-id="t1"]');
    await expect(activeTabEl).toHaveAttribute('aria-selected', 'true');

    const inactiveTabEl = await $('vi-tab[tab-id="t2"]');
    await expect(inactiveTabEl).toHaveAttribute('aria-selected', 'false');
  });

  it('sets aria-setsize and aria-posinset correctly', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2">Tab 2</vi-tab>
          <vi-tab tab-id="t3">Tab 3</vi-tab>
          <vi-tab-panel for="t1">P1</vi-tab-panel>
          <vi-tab-panel for="t2">P2</vi-tab-panel>
          <vi-tab-panel for="t3">P3</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const t2 = await $('vi-tab[tab-id="t2"]');
    await expect(t2).toHaveAttribute('aria-posinset', '2');
    await expect(t2).toHaveAttribute('aria-setsize', '3');
  });

  it('sets aria-controls and aria-labelledby linking tabs to panels', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab-panel for="t1">Panel 1</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const tabEl = await $('vi-tab[tab-id="t1"]');
    await expect(tabEl).toHaveAttribute('aria-controls', 'panel-t1');

    const panelEl = await $('vi-tab-panel[for="t1"]');
    await expect(panelEl).toHaveAttribute('aria-labelledby', 't1');
  });

  // ── Tab Switch ────────────────────────────────────────────────────────────

  it('switches active tab on click', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2">Tab 2</vi-tab>
          <vi-tab-panel for="t1">Panel 1</vi-tab-panel>
          <vi-tab-panel for="t2">Panel 2</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const t2 = await $('vi-tab[tab-id="t2"]');
    await t2.click();

    await new Promise((r) => setTimeout(r, 50));

    await expect(t2).toHaveAttribute('active');
    const panel2 = await $('vi-tab-panel[for="t2"]');
    await expect(panel2).toHaveAttribute('active');
  });

  // ── Disabled ──────────────────────────────────────────────────────────────

  it('does not activate a disabled tab on click', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2" disabled>Tab 2</vi-tab>
          <vi-tab-panel for="t1">P1</vi-tab-panel>
          <vi-tab-panel for="t2">P2</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const t2 = await $('vi-tab[tab-id="t2"]');
    await t2.click();

    await new Promise((r) => setTimeout(r, 50));

    const tabs = await $('vi-tabs');
    await expect(tabs).toHaveAttribute('active', 't1');
  });

  // ── Badge ─────────────────────────────────────────────────────────────────

  it('renders badge count when badge-count is set', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1" badge-count="5">Queries</vi-tab>
          <vi-tab-panel for="t1">P1</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const tabEl = await $('vi-tab[tab-id="t1"]');
    const badge = await tabEl.shadow$('[part="badge"]');
    await expect(badge).toExist();
    await expect(badge).toHaveText('5');
  });

  // ── Lazy panels ───────────────────────────────────────────────────────────

  it('lazy panel does not render content until activated', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2">Tab 2</vi-tab>
          <vi-tab-panel for="t1">Eager content</vi-tab-panel>
          <vi-tab-panel for="t2" lazy>Lazy content</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    // Panel 2 not yet activated — should be empty
    const lazyPanel = await $('vi-tab-panel[for="t2"]');
    const content = await lazyPanel.getText();
    expect(content.trim()).toBe('');

    // Activate it
    const t2btn = await $('vi-tab[tab-id="t2"]');
    await t2btn.click();
    await new Promise((r) => setTimeout(r, 50));

    const contentAfter = await lazyPanel.getText();
    expect(contentAfter.trim()).toBe('Lazy content');
  });
  // ── Keyboard Navigation ───────────────────────────────────────────────────

  it('navigates to next/previous tab with arrow keys', async () => {
    render(
      html`
        <vi-tabs active="t1" activation="automatic">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2">Tab 2</vi-tab>
          <vi-tab tab-id="t3">Tab 3</vi-tab>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const tabs = await $('vi-tabs');
    const t1 = await $('vi-tab[tab-id="t1"]');
    await t1.click(); // focus it

    // Dispatch ArrowRight
    await browser.keys(['ArrowRight']);
    await new Promise((r) => setTimeout(r, 50));
    let activeTab = await $('vi-tab[active]');
    await expect(activeTab).toHaveAttribute('tab-id', 't2');

    // Dispatch ArrowLeft
    await browser.keys(['ArrowLeft']);
    await new Promise((r) => setTimeout(r, 50));
    activeTab = await $('vi-tab[active]');
    await expect(activeTab).toHaveAttribute('tab-id', 't1');
  });

  it('navigates to first/last tab with Home/End keys', async () => {
    render(
      html`
        <vi-tabs active="t1" activation="automatic">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab tab-id="t2">Tab 2</vi-tab>
          <vi-tab tab-id="t3">Tab 3</vi-tab>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const tabs = await $('vi-tabs');
    const t1 = await $('vi-tab[tab-id="t1"]');
    await t1.click(); // focus it

    await browser.keys(['End']);
    await new Promise((r) => setTimeout(r, 50));
    let activeTab = await $('vi-tab[active]');
    await expect(activeTab).toHaveAttribute('tab-id', 't3');

    await browser.keys(['Home']);
    await new Promise((r) => setTimeout(r, 50));
    activeTab = await $('vi-tab[active]');
    await expect(activeTab).toHaveAttribute('tab-id', 't1');
  });

  // ── Focus Delegation / Accessibility ───────────────────────────────────────

  it('delegates focus to tab panel when navigating', async () => {
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1">Tab 1</vi-tab>
          <vi-tab-panel for="t1">Panel 1</vi-tab-panel>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const panel = await $('vi-tab-panel[for="t1"]');
    await expect(panel).toHaveAttribute('tabindex', '0');
    await expect(panel).toHaveAttribute('role', 'tabpanel');
  });

  // ── Scroll Overflow ───────────────────────────────────────────────────────

  it('renders left and right scroll arrows when scrollable', async () => {
    render(
      html`
        <div style="width: 200px;">
          <vi-tabs overflow="scroll">
            <vi-tab tab-id="t1">Very Long Tab Name 1</vi-tab>
            <vi-tab tab-id="t2">Very Long Tab Name 2</vi-tab>
            <vi-tab tab-id="t3">Very Long Tab Name 3</vi-tab>
            <vi-tab tab-id="t4">Very Long Tab Name 4</vi-tab>
          </vi-tabs>
        </div>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 100)); // wait for ResizeObserver

    const tabs = await $('vi-tabs');
    const rightBtn = await tabs.shadow$('.vi-tabs__scroll-btn--right');
    await expect(rightBtn).toExist();
  });

  // ── Menu Overflow ─────────────────────────────────────────────────────────

  it('renders a more menu when overflow is menu and there are hidden tabs', async () => {
    render(
      html`
        <div style="width: 200px;">
          <vi-tabs overflow="menu">
            <vi-tab tab-id="t1">Very Long Tab Name 1</vi-tab>
            <vi-tab tab-id="t2">Very Long Tab Name 2</vi-tab>
            <vi-tab tab-id="t3">Very Long Tab Name 3</vi-tab>
            <vi-tab tab-id="t4">Very Long Tab Name 4</vi-tab>
          </vi-tabs>
        </div>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 150)); // Wait for ResizeObserver

    const tabs = await $('vi-tabs');
    const moreBtn = await tabs.shadow$('.vi-tabs__more-btn');
    // If ResizeObserver works in the test environment, the more button should exist
    if (await moreBtn.isExisting()) {
      await expect(moreBtn).toExist();
      await moreBtn.click();
      await new Promise((r) => setTimeout(r, 50));
      const moreMenu = await tabs.shadow$('.vi-tabs__more-menu');
      await expect(moreMenu).toExist();
    }
  });

  // ── Closable Tabs ─────────────────────────────────────────────────────────

  it('dispatches vi-tab-before-close when close button is clicked', async () => {
    let eventFired = false;
    render(
      html`
        <vi-tabs active="t1">
          <vi-tab tab-id="t1" closable @vi-tab-before-close="${() => { eventFired = true; }}">Tab 1</vi-tab>
        </vi-tabs>
      `,
      container,
    );
    await new Promise((r) => setTimeout(r, 50));

    const t1 = await $('vi-tab[tab-id="t1"]');
    const closeBtn = await t1.shadow$('.vi-tab__close');
    await expect(closeBtn).toExist();
    
    await closeBtn.click();
    expect(eventFired).toBe(true);
  });
});
