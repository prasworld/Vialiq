import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import sinon from 'sinon';
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

  it('reflects aria-pressed attribute to inner button element', async () => {
    render(
      html`<vi-float-button
        id="btn-pressed"
        aria-pressed="true"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-pressed') as ViFloatButton;
    await btn.updateComplete;

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    expect(nativeBtn?.getAttribute('aria-pressed')).toBe('true');
    expect(btn.getAttribute('aria-pressed')).toBe('true');
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
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('rejects javascript: and other executable schemes and renders a button instead of anchor', async () => {
    render(
      html`<vi-float-button
        id="btn-xss"
        href="javascript:alert(1)"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-xss') as ViFloatButton;
    await btn.updateComplete;

    const anchor = btn.shadowRoot?.querySelector('a');
    expect(anchor).toBeNull();

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    expect(nativeBtn).toBeTruthy();
    expect(nativeBtn?.classList.contains('float-button')).toBe(true);
  });

  it('rejects obfuscated javascript: URLs and data: URLs', async () => {
    render(
      html`
        <vi-float-button
          id="btn-obfuscated"
          href="  JaVaScRiPt:alert(1) "
        ></vi-float-button>
        <vi-float-button
          id="btn-data"
          href="${'data:text/html,<script>alert(1)</script>'}"
        ></vi-float-button>
      `,
      container,
    );
    const btnObfuscated = container.querySelector(
      '#btn-obfuscated',
    ) as ViFloatButton;
    const btnData = container.querySelector('#btn-data') as ViFloatButton;
    await btnObfuscated.updateComplete;
    await btnData.updateComplete;

    expect(btnObfuscated.shadowRoot?.querySelector('a')).toBeNull();
    expect(btnObfuscated.shadowRoot?.querySelector('button')).toBeTruthy();

    expect(btnData.shadowRoot?.querySelector('a')).toBeNull();
    expect(btnData.shadowRoot?.querySelector('button')).toBeTruthy();
  });

  it('allows safe relative paths and anchors in href', async () => {
    render(
      html`<vi-float-button
        id="btn-relative"
        href="/dashboard#top"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-relative') as ViFloatButton;
    await btn.updateComplete;

    const anchor = btn.shadowRoot?.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor?.getAttribute('href')).toBe('/dashboard#top');
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
    const scrollToSpy = sinon.spy(window, 'scrollTo');

    try {
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

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      const expectedBehavior = prefersReducedMotion ? 'auto' : 'smooth';

      expect(scrollToSpy.calledOnce).toBe(true);
      expect(
        scrollToSpy.calledWith(
          sinon.match({
            top: 0,
            behavior: expectedBehavior,
          }),
        ),
      ).toBe(true);
      expect(scrollToSpy.firstCall.args[0]).toEqual({
        top: 0,
        behavior: expectedBehavior,
      });
    } finally {
      scrollToSpy.restore();
    }
  });

  it('resolves bare ID scroll-target without leading # to the matching container element', async () => {
    const scrollBox = document.createElement('div');
    scrollBox.id = 'bare-scroll-container';
    container.appendChild(scrollBox);

    render(
      html`<vi-float-button
        id="btn-bare-scroll"
        back-top
        scroll-target="bare-scroll-container"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-bare-scroll') as ViFloatButton;
    await btn.updateComplete;

    let targetElement: unknown = null;
    btn.addEventListener('vi-float-button-back-top', (e: Event) => {
      const custom = e as CustomEvent<{ scrollTarget: HTMLElement | Window }>;
      targetElement = custom.detail.scrollTarget;
    });

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    nativeBtn?.click();

    expect(targetElement).toBe(scrollBox);
  });

  it('resolves CSS selector and hash ID scroll-target', async () => {
    const scrollBox = document.createElement('div');
    scrollBox.id = 'hash-scroll-container';
    container.appendChild(scrollBox);

    render(
      html`<vi-float-button
        id="btn-hash-scroll"
        back-top
        scroll-target="#hash-scroll-container"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-hash-scroll') as ViFloatButton;
    await btn.updateComplete;

    let targetElement: unknown = null;
    btn.addEventListener('vi-float-button-back-top', (e: Event) => {
      const custom = e as CustomEvent<{ scrollTarget: HTMLElement | Window }>;
      targetElement = custom.detail.scrollTarget;
    });

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    nativeBtn?.click();

    expect(targetElement).toBe(scrollBox);
  });

  it('retries resolving late scroll target and rebinds when container is inserted into the DOM', async () => {
    render(
      html`<vi-float-button
        id="btn-late-scroll"
        back-top
        scroll-target="late-scroll-box"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-late-scroll') as ViFloatButton;
    await btn.updateComplete;

    let targetElement: unknown = null;
    btn.addEventListener('vi-float-button-back-top', (e: Event) => {
      const custom = e as CustomEvent<{ scrollTarget: HTMLElement | Window }>;
      targetElement = custom.detail.scrollTarget;
    });

    // Insert target element late into the DOM
    const scrollBox = document.createElement('div');
    scrollBox.id = 'late-scroll-box';
    container.appendChild(scrollBox);

    // Allow MutationObserver microtask to fire
    await new Promise((resolve) => setTimeout(resolve, 50));
    await btn.updateComplete;

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    nativeBtn?.click();

    expect(targetElement).toBe(scrollBox);
  });

  it('reads default duration of 450ms and accepts configured duration', async () => {
    render(
      html`<vi-float-button
        id="btn-dur-test"
        back-top
        duration="350"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-dur-test') as ViFloatButton;
    await btn.updateComplete;

    expect(btn.duration).toBe(350);

    btn.duration = 600;
    await btn.updateComplete;
    expect(btn.duration).toBe(600);

    const defaultBtn = document.createElement('vi-float-button') as ViFloatButton;
    expect(defaultBtn.duration).toBe(450);
  });

  it('scrolls container to top immediately when duration is 0', async () => {
    const scrollBox = document.createElement('div');
    scrollBox.id = 'scroll-box-zero';
    scrollBox.style.height = '100px';
    scrollBox.style.overflowY = 'scroll';
    const inner = document.createElement('div');
    inner.style.height = '1000px';
    scrollBox.appendChild(inner);
    container.appendChild(scrollBox);
    scrollBox.scrollTop = 400;

    render(
      html`<vi-float-button
        id="btn-dur-zero"
        back-top
        duration="0"
        scroll-target="#scroll-box-zero"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-dur-zero') as ViFloatButton;
    await btn.updateComplete;

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    nativeBtn?.click();

    expect(scrollBox.scrollTop).toBe(0);
  });

  it('controls back-to-top animation timing with configured duration', async () => {
    const scrollBox = document.createElement('div');
    scrollBox.id = 'scroll-box-anim';
    scrollBox.style.height = '100px';
    scrollBox.style.overflowY = 'scroll';
    const inner = document.createElement('div');
    inner.style.height = '2000px';
    scrollBox.appendChild(inner);
    container.appendChild(scrollBox);
    scrollBox.scrollTop = 800;

    render(
      html`<vi-float-button
        id="btn-dur-anim"
        back-top
        duration="120"
        scroll-target="#scroll-box-anim"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-dur-anim') as ViFloatButton;
    await btn.updateComplete;

    const nativeBtn = btn.shadowRoot?.querySelector('button');
    nativeBtn?.click();

    // After animation duration has elapsed, container reaches top
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(scrollBox.scrollTop).toBe(0);
  });

  it('associates tooltip description with inner focusable button when explicit aria-label is provided', async () => {
    render(
      html`<vi-float-button
        id="btn-tooltip-label"
        tooltip="Helpful tooltip text"
        aria-label="Explicit action name"
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector('#btn-tooltip-label') as ViFloatButton;
    await btn.updateComplete;

    const controlWrapper = btn.shadowRoot?.querySelector('.float-button__control');
    const nativeBtn = btn.shadowRoot?.querySelector('button');
    const tooltipEl = btn.shadowRoot?.querySelector('vi-tooltip');

    expect(controlWrapper).toBeTruthy();
    expect(nativeBtn).toBeTruthy();
    expect(tooltipEl).toBeTruthy();
    await tooltipEl?.updateComplete;

    // Allow microtask in vi-tooltip firstUpdated to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Non-focusable wrapper does NOT receive aria-describedby
    expect(controlWrapper?.hasAttribute('aria-describedby')).toBe(false);

    // Focusable native button receives both the explicit label and tooltip aria-describedby
    expect(nativeBtn?.getAttribute('aria-label')).toBe('Explicit action name');
    expect(nativeBtn?.hasAttribute('aria-describedby')).toBe(true);
    const describedBy = nativeBtn?.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();

    const tooltipPanel = tooltipEl?.shadowRoot?.querySelector('.tooltip-panel');
    expect(tooltipPanel?.id).toBe(describedBy);
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

  it('does not dispatch vi-float-button-open-change on initial render', async () => {
    let callCount = 0;
    const group = document.createElement('vi-float-button-group') as ViFloatButtonGroup;
    group.addEventListener('vi-float-button-open-change', () => {
      callCount++;
    });
    container.appendChild(group);
    await group.updateComplete;

    expect(callCount).toBe(0);

    group.open = true;
    await group.updateComplete;
    expect(callCount).toBe(1);

    group.open = false;
    await group.updateComplete;
    expect(callCount).toBe(2);
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

  it('closes on Escape key press when focus is on a child button with a tooltip', async () => {
    render(
      html`
        <vi-float-button-group id="group-tooltip-esc" trigger="click" open>
          <vi-float-button id="item-tooltip-esc" tooltip="Quick Action"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector('#group-tooltip-esc') as ViFloatButtonGroup;
    const item = container.querySelector('#item-tooltip-esc') as ViFloatButton;
    await group.updateComplete;
    await item.updateComplete;

    expect(group.open).toBe(true);

    const nativeBtn = item.shadowRoot?.querySelector('button');
    expect(nativeBtn).toBeTruthy();

    nativeBtn?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }),
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

  it('opens and toggles menu on keyboard activation in default hover mode', async () => {
    render(
      html`
        <vi-float-button-group id="group-default-hover">
          <vi-float-button id="item-dh1"></vi-float-button>
          <vi-float-button id="item-dh2"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector(
      '#group-default-hover',
    ) as ViFloatButtonGroup;
    await group.updateComplete;

    expect(group.trigger).toBe('hover');
    expect(group.open).toBe(false);

    const triggerBtn = group.shadowRoot?.querySelector(
      '.float-button-group__trigger',
    ) as ViFloatButton;
    expect(triggerBtn).toBeTruthy();

    // Keyboard activation (detail === 0 on native click)
    const nativeTrigger = triggerBtn.shadowRoot?.querySelector('button');
    nativeTrigger?.click();
    await group.updateComplete;

    expect(group.open).toBe(true);

    // Activating again closes the menu
    nativeTrigger?.click();
    await group.updateComplete;
    expect(group.open).toBe(false);
  });

  it('opens menu on Enter and ArrowUp keydown on trigger button in default hover mode', async () => {
    render(
      html`
        <vi-float-button-group id="group-keys-hover">
          <vi-float-button id="item-kh1"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector(
      '#group-keys-hover',
    ) as ViFloatButtonGroup;
    await group.updateComplete;

    const triggerBtn = group.shadowRoot?.querySelector(
      '.float-button-group__trigger',
    ) as ViFloatButton;

    // Press Enter on trigger
    triggerBtn.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      }),
    );
    await group.updateComplete;
    expect(group.open).toBe(true);

    // Close with Escape
    group.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
      }),
    );
    await group.updateComplete;
    expect(group.open).toBe(false);

    // Press ArrowUp on trigger
    triggerBtn.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        composed: true,
      }),
    );
    await group.updateComplete;
    expect(group.open).toBe(true);
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

  it('skips disabled buttons during keyboard navigation in group', async () => {
    render(
      html`
        <vi-float-button-group id="group-skip-disabled" trigger="click" open>
          <vi-float-button id="item-d1" description="First"></vi-float-button>
          <vi-float-button id="item-d2" description="Second" disabled></vi-float-button>
          <vi-float-button id="item-d3" description="Third"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector(
      '#group-skip-disabled',
    ) as ViFloatButtonGroup;
    const item1 = container.querySelector('#item-d1') as ViFloatButton;
    const item2 = container.querySelector('#item-d2') as ViFloatButton;
    const item3 = container.querySelector('#item-d3') as ViFloatButton;
    await group.updateComplete;
    await item1.updateComplete;
    await item2.updateComplete;
    await item3.updateComplete;

    // Home key focuses first non-disabled item
    group.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    expect(document.activeElement === item1 || item1.matches(':focus-within')).toBe(true);

    // ArrowDown from item1 skips item2 (disabled) and focuses item3
    group.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    expect(document.activeElement === item3 || item3.matches(':focus-within')).toBe(true);

    // ArrowUp from item3 skips item2 (disabled) and focuses item1
    group.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    expect(document.activeElement === item1 || item1.matches(':focus-within')).toBe(true);
  });

  it('removes href and sets aria-disabled on anchor when disabled', async () => {
    render(
      html`<vi-float-button
        id="btn-link-disabled"
        href="https://example.com"
        disabled
      ></vi-float-button>`,
      container,
    );
    const btn = container.querySelector(
      '#btn-link-disabled',
    ) as ViFloatButton;
    await btn.updateComplete;

    const anchor = btn.shadowRoot?.querySelector('a');
    expect(anchor).toBeTruthy();
    expect(anchor?.hasAttribute('href')).toBe(false);
    expect(anchor?.getAttribute('tabindex')).toBe('-1');
    expect(anchor?.getAttribute('aria-disabled')).toBe('true');
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
    expect(triggerBtn.getAttribute('aria-label')).toBe('Quick tools');

    const triggerNative = triggerBtn.shadowRoot?.querySelector('button');
    expect(triggerNative?.getAttribute('aria-label')).toBe('Quick tools');
    expect(triggerNative?.getAttribute('aria-haspopup')).toBe('menu');
    expect(triggerNative?.getAttribute('aria-expanded')).toBe('false');

    const menu = group.shadowRoot?.querySelector('.float-button-group__menu');
    expect(menu?.getAttribute('role')).toBe('menu');
    expect(menu?.getAttribute('aria-hidden')).toBe('true');

    // Child button has role="menuitem"
    const nativeChildBtn = item.shadowRoot?.querySelector('button');
    expect(nativeChildBtn?.getAttribute('role')).toBe('menuitem');

    // Open group
    group.open = true;
    await group.updateComplete;
    await triggerBtn.updateComplete;
    expect(triggerBtn.getAttribute('aria-expanded')).toBe('true');
    expect(triggerNative?.getAttribute('aria-expanded')).toBe('true');
    expect(menu?.getAttribute('aria-hidden')).toBe('false');
  });

  it('provides default Speed dial actions accessible name on trigger button when group aria-label is omitted', async () => {
    render(
      html`
        <vi-float-button-group id="group-default-aria">
          <vi-float-button id="item-def"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector('#group-default-aria') as ViFloatButtonGroup;
    await group.updateComplete;

    const triggerBtn = group.shadowRoot?.querySelector('.float-button-group__trigger') as ViFloatButton;
    expect(triggerBtn.getAttribute('aria-label')).toBe('Speed dial actions');

    const triggerNative = triggerBtn.shadowRoot?.querySelector('button');
    expect(triggerNative?.getAttribute('aria-label')).toBe('Speed dial actions');
  });

  it('removes inactive menu items from sequential tab order and keeps active item tabbable', async () => {
    render(
      html`
        <vi-float-button-group id="group-roving" trigger="click">
          <vi-float-button id="rov-item1" description="First"></vi-float-button>
          <vi-float-button id="rov-item2" description="Second"></vi-float-button>
          <vi-float-button id="rov-item3" description="Third"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector(
      '#group-roving',
    ) as ViFloatButtonGroup;
    const item1 = container.querySelector('#rov-item1') as ViFloatButton;
    const item2 = container.querySelector('#rov-item2') as ViFloatButton;
    const item3 = container.querySelector('#rov-item3') as ViFloatButton;
    await group.updateComplete;
    await item1.updateComplete;
    await item2.updateComplete;
    await item3.updateComplete;

    // While closed, all menu items are excluded from sequential tab order
    expect(item1.tabbable).toBe(false);
    expect(item1.tabIndex).toBe(-1);
    expect(
      item1.shadowRoot?.querySelector('button')?.getAttribute('tabindex'),
    ).toBe('-1');

    expect(item2.tabbable).toBe(false);
    expect(item2.tabIndex).toBe(-1);
    expect(
      item2.shadowRoot?.querySelector('button')?.getAttribute('tabindex'),
    ).toBe('-1');

    expect(item3.tabbable).toBe(false);
    expect(item3.tabIndex).toBe(-1);
    expect(
      item3.shadowRoot?.querySelector('button')?.getAttribute('tabindex'),
    ).toBe('-1');

    // Open group
    group.open = true;
    await group.updateComplete;
    await item1.updateComplete;
    await item2.updateComplete;
    await item3.updateComplete;

    // By default on open, only the last item (closest to trigger) is active and in sequential tab order
    expect(item1.tabbable).toBe(false);
    expect(item1.tabIndex).toBe(-1);
    expect(
      item1.shadowRoot?.querySelector('button')?.getAttribute('tabindex'),
    ).toBe('-1');

    expect(item2.tabbable).toBe(false);
    expect(item2.tabIndex).toBe(-1);
    expect(
      item2.shadowRoot?.querySelector('button')?.getAttribute('tabindex'),
    ).toBe('-1');

    expect(item3.tabbable).toBe(true);
    expect(item3.tabIndex).toBe(0);
    expect(
      item3.shadowRoot?.querySelector('button')?.getAttribute('tabindex'),
    ).toBe('0');

    // Navigating with Home key activates item1
    group.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
    );
    await item1.updateComplete;
    await item3.updateComplete;

    expect(item1.tabbable).toBe(true);
    expect(item1.tabIndex).toBe(0);
    expect(
      item1.shadowRoot?.querySelector('button')?.getAttribute('tabindex'),
    ).toBe('0');

    expect(item3.tabbable).toBe(false);
    expect(item3.tabIndex).toBe(-1);
    expect(
      item3.shadowRoot?.querySelector('button')?.getAttribute('tabindex'),
    ).toBe('-1');

    // Navigating with ArrowDown activates item2
    group.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await item1.updateComplete;
    await item2.updateComplete;

    expect(item1.tabbable).toBe(false);
    expect(item1.tabIndex).toBe(-1);
    expect(item2.tabbable).toBe(true);
    expect(item2.tabIndex).toBe(0);

    // Closing the menu removes all items from sequential tab order
    group.open = false;
    await group.updateComplete;
    await item2.updateComplete;

    expect(item1.tabbable).toBe(false);
    expect(item1.tabIndex).toBe(-1);
    expect(item2.tabbable).toBe(false);
    expect(item2.tabIndex).toBe(-1);
    expect(item3.tabbable).toBe(false);
    expect(item3.tabIndex).toBe(-1);
  });

  it('moves focus to the first item above trigger on initial ArrowUp after mouse click', async () => {
    render(
      html`
        <vi-float-button-group id="group-click-arrow" trigger="click">
          <vi-float-button id="c-item1" description="Item 1"></vi-float-button>
          <vi-float-button id="c-item2" description="Item 2"></vi-float-button>
          <vi-float-button id="c-item3" description="Item 3"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const group = container.querySelector(
      '#group-click-arrow',
    ) as ViFloatButtonGroup;
    const item1 = container.querySelector('#c-item1') as ViFloatButton;
    const item2 = container.querySelector('#c-item2') as ViFloatButton;
    const item3 = container.querySelector('#c-item3') as ViFloatButton;
    await group.updateComplete;
    await item1.updateComplete;
    await item2.updateComplete;
    await item3.updateComplete;

    const triggerBtn = group.shadowRoot?.querySelector(
      '.float-button-group__trigger',
    ) as ViFloatButton;
    const nativeTrigger = triggerBtn.shadowRoot?.querySelector('button');

    // Simulate mouse click (detail = 1)
    nativeTrigger?.dispatchEvent(
      new MouseEvent('click', { detail: 1, bubbles: true, composed: true }),
    );
    await group.updateComplete;

    expect(group.open).toBe(true);

    // Initial ArrowUp keypress
    group.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    await item3.updateComplete;

    // Focus must land on item3 (the first item above trigger, not item2)
    expect(document.activeElement === item3 || item3.matches(':focus-within')).toBe(true);

    // Subsequent ArrowUp keypress moves to item2
    group.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    );
    await item2.updateComplete;
    expect(document.activeElement === item2 || item2.matches(':focus-within')).toBe(true);
  });

  it('renders default x close icon when open and uses configured close-icon attribute', async () => {
    render(
      html`
        <vi-float-button-group id="group-close-default" open>
          <vi-float-button id="item-c1"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const defaultGroup = container.querySelector(
      '#group-close-default',
    ) as ViFloatButtonGroup;
    await defaultGroup.updateComplete;

    expect(defaultGroup.closeIcon).toBe('x');
    const defaultTrigger = defaultGroup.shadowRoot?.querySelector(
      '.float-button-group__trigger',
    ) as ViFloatButton;
    const defaultCloseIcon = defaultTrigger.querySelector('vi-icon.default-icon');
    expect(defaultCloseIcon?.getAttribute('name')).toBe('x');

    // Custom close-icon attribute
    render(
      html`
        <vi-float-button-group id="group-close-custom" close-icon="chevron-down" open>
          <vi-float-button id="item-c2"></vi-float-button>
        </vi-float-button-group>
      `,
      container,
    );
    const customGroup = container.querySelector(
      '#group-close-custom',
    ) as ViFloatButtonGroup;
    await customGroup.updateComplete;

    expect(customGroup.closeIcon).toBe('chevron-down');
    const customTrigger = customGroup.shadowRoot?.querySelector(
      '.float-button-group__trigger',
    ) as ViFloatButton;
    const customCloseIcon = customTrigger.querySelector('vi-icon.default-icon');
    expect(customCloseIcon?.getAttribute('name')).toBe('chevron-down');

    // Update closeIcon property dynamically
    customGroup.closeIcon = 'minus';
    await customGroup.updateComplete;
    const dynamicCloseIcon = customTrigger.querySelector('vi-icon.default-icon');
    expect(dynamicCloseIcon?.getAttribute('name')).toBe('minus');
  });
});
