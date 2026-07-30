import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import './index.js'; // Registers vi-tooltip
import type { ViTooltip } from './vi-tooltip.js';

describe('vi-tooltip', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render the custom element and its shadow DOM structure', async () => {
    render(
      html`
        <vi-tooltip content="Supplementary text">
          <button id="trigger">Target</button>
        </vi-tooltip>
      `,
      container
    );

    const host = await $('vi-tooltip');
    await expect(host).toExist();

    const triggerWrapper = await host.shadow$('.trigger-wrapper');
    await expect(triggerWrapper).toExist();

    const panel = await host.shadow$('.tooltip-panel');
    await expect(panel).toExist();
    await expect(panel).toHaveAttribute('role', 'tooltip');
  });

  it('should have correct default property values', () => {
    render(html`<vi-tooltip><span>Target</span></vi-tooltip>`, container);
    const el = document.querySelector('vi-tooltip') as ViTooltip;

    expect(el.content).toBe('');
    expect(el.placement).toBe('top');
    expect(el.trigger).toBe('hover focus');
    expect(el.delay).toBe(500);
    expect(el.hideDelay).toBe(100);
    expect(el.maxWidth).toBe(240);
    expect(el.disabled).toBe(false);
  });

  it('should associate trigger element via aria-describedby for plaintext', async () => {
    render(
      html`
        <vi-tooltip content="Simple description">
          <button id="btn">Button</button>
        </vi-tooltip>
      `,
      container
    );

    const host = document.querySelector('vi-tooltip') as ViTooltip;
    await host.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 30));

    const btn = document.querySelector('#btn') as HTMLElement;
    const panel = host.shadowRoot?.querySelector('.tooltip-panel') as HTMLElement;

    expect(btn.getAttribute('aria-describedby')).toBe(panel.id);
    expect(btn.getAttribute('aria-details')).toBeNull();
    expect(panel.getAttribute('role')).toBe('tooltip');
    expect(panel.getAttribute('aria-modal')).toBeNull();
  });

  it('should associate trigger element via aria-details for interactive content', async () => {
    render(
      html`
        <vi-tooltip>
          <button id="btn">Button</button>
          <div slot="content">
            Interactive <a href="#">Link</a>
          </div>
        </vi-tooltip>
      `,
      container
    );

    // Wait a brief tick for slot change handlers to fire
    await new Promise(resolve => setTimeout(resolve, 50));

    const btn = document.querySelector('#btn') as HTMLElement;
    const host = document.querySelector('vi-tooltip') as ViTooltip;
    const panel = host.shadowRoot?.querySelector('.tooltip-panel') as HTMLElement;

    expect(btn.getAttribute('aria-details')).toBe(panel.id);
    expect(btn.getAttribute('aria-describedby')).toBeNull();
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('false');
    expect(panel.getAttribute('aria-label')).toBe('Tooltip');
  });

  it('should show and hide tooltip on pointer events with configured delays', async () => {
    render(
      html`
        <vi-tooltip content="Description" .delay=${50} .hideDelay=${50}>
          <span id="target">Hover Me</span>
        </vi-tooltip>
      `,
      container
    );

    const host = document.querySelector('vi-tooltip') as ViTooltip;
    await host.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 30));

    const triggerWrapper = host.shadowRoot?.querySelector('.trigger-wrapper') as HTMLElement;
    const panel = host.shadowRoot?.querySelector('.tooltip-panel') as HTMLElement;

    let showEventFired = false;
    let hideEventFired = false;

    host.addEventListener('vialiq-show', () => { showEventFired = true; });
    host.addEventListener('vialiq-hide', () => { hideEventFired = true; });

    // Initially closed
    expect(panel.matches(':popover-open')).toBe(false);

    // Simulate pointerenter
    triggerWrapper.dispatchEvent(new PointerEvent('pointerenter'));

    // Verify it is not open immediately due to delay
    expect(panel.matches(':popover-open')).toBe(false);

    // Wait for delay to pass
    await new Promise(resolve => setTimeout(resolve, 80));
    expect(panel.matches(':popover-open')).toBe(true);
    expect(showEventFired).toBe(true);

    // Simulate pointerleave
    triggerWrapper.dispatchEvent(new PointerEvent('pointerleave'));

    // Verify it is not closed immediately due to hideDelay
    expect(panel.matches(':popover-open')).toBe(true);

    // Wait for hideDelay to pass
    await new Promise(resolve => setTimeout(resolve, 80));
    expect(panel.matches(':popover-open')).toBe(false);
    expect(hideEventFired).toBe(true);
  });

  it('should immediately close when Escape key is pressed', async () => {
    render(
      html`
        <vi-tooltip content="Description" .delay=${10}>
          <span id="target">Focus Me</span>
        </vi-tooltip>
      `,
      container
    );

    const host = document.querySelector('vi-tooltip') as ViTooltip;
    await host.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 30));

    const triggerWrapper = host.shadowRoot?.querySelector('.trigger-wrapper') as HTMLElement;
    const panel = host.shadowRoot?.querySelector('.tooltip-panel') as HTMLElement;

    // Open it
    triggerWrapper.dispatchEvent(new PointerEvent('pointerenter'));
    await new Promise(resolve => setTimeout(resolve, 30));
    expect(panel.matches(':popover-open')).toBe(true);

    // Press Escape
    triggerWrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(panel.matches(':popover-open')).toBe(false);
  });

  it('should immediately close when Escape key is pressed inside the panel', async () => {
    render(
      html`
        <vi-tooltip .delay=${10}>
          <span id="target">Focus Me</span>
          <div slot="content">
            <button id="inside-btn">Inside Button</button>
          </div>
        </vi-tooltip>
      `,
      container
    );

    const host = document.querySelector('vi-tooltip') as ViTooltip;
    await host.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 50));

    const triggerWrapper = host.shadowRoot?.querySelector('.trigger-wrapper') as HTMLElement;
    const panel = host.shadowRoot?.querySelector('.tooltip-panel') as HTMLElement;

    // Open it
    triggerWrapper.dispatchEvent(new PointerEvent('pointerenter'));
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(panel.matches(':popover-open')).toBe(true);

    // Press Escape inside the panel content
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(panel.matches(':popover-open')).toBe(false);
  });

  it('should not display the tooltip when disabled is true', async () => {
    render(
      html`
        <vi-tooltip content="Disabled Tooltip" disabled .delay=${10}>
          <span>Target</span>
        </vi-tooltip>
      `,
      container
    );

    const host = document.querySelector('vi-tooltip') as ViTooltip;
    await host.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 30));

    const triggerWrapper = host.shadowRoot?.querySelector('.trigger-wrapper') as HTMLElement;
    const panel = host.shadowRoot?.querySelector('.tooltip-panel') as HTMLElement;

    triggerWrapper.dispatchEvent(new PointerEvent('pointerenter'));
    await new Promise(resolve => setTimeout(resolve, 30));

    expect(panel.matches(':popover-open')).toBe(false);
  });

  it('should accept custom popperOptions to configure Floating UI', async () => {
    render(
      html`
        <vi-tooltip 
          content="Overridden Options" 
          .delay=${10} 
          .popperOptions=${{ strategy: 'fixed' }}
        >
          <span>Target</span>
        </vi-tooltip>
      `,
      container
    );

    const host = document.querySelector('vi-tooltip') as ViTooltip;
    await host.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 30));

    const triggerWrapper = host.shadowRoot?.querySelector('.trigger-wrapper') as HTMLElement;
    const panel = host.shadowRoot?.querySelector('.tooltip-panel') as HTMLElement;

    // Trigger open
    triggerWrapper.dispatchEvent(new PointerEvent('pointerenter'));
    await new Promise(resolve => setTimeout(resolve, 80));

    expect(panel.matches(':popover-open')).toBe(true);
    // Floating UI uses the 'strategy' config to set position style (absolute vs fixed)
    expect(panel.style.position).toBe('fixed');
  });

  it('should not crash and fallback gracefully when invalid JSON is passed to popper-options attribute', async () => {
    render(
      html`
        <vi-tooltip 
          content="Fallback Test" 
          .delay=${10} 
          popper-options="{invalid-json}"
        >
          <span>Target</span>
        </vi-tooltip>
      `,
      container
    );

    const host = document.querySelector('vi-tooltip') as ViTooltip;
    await host.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 30));

    expect(host.popperOptions).toEqual({});
  });

  describe('Missing Branch Coverage', () => {
    it('handles click trigger to show and hide', async () => {
      render(
        html`
          <vi-tooltip content="Click" trigger="click" .delay=${0}>
            <button id="btn">Target</button>
          </vi-tooltip>
        `,
        container
      );
      const host = document.querySelector('vi-tooltip') as any;
      await host.updateComplete;

      const panel = host.shadowRoot!.querySelector('.tooltip-panel') as HTMLElement;
      
      host.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
      await host.updateComplete;
      expect(panel.matches(':popover-open')).toBe(true);

      host.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
      await host.updateComplete;
      expect(panel.matches(':popover-open')).toBe(false);
    });

    it('handles document click outside to close', async () => {
      render(
        html`
          <div>
            <vi-tooltip content="DocClick" trigger="click" .delay=${0} open>
              <button>Target</button>
            </vi-tooltip>
            <div id="outside">Outside</div>
          </div>
        `,
        container
      );
      const host = document.querySelector('vi-tooltip') as any;
      await host.updateComplete;
      
      const panel = host.shadowRoot!.querySelector('.tooltip-panel') as HTMLElement;
      
      // Force it open if 'open' attribute isn't enough (since it's internal state)
      host.show();
      await host.updateComplete;
      expect(panel.matches(':popover-open')).toBe(true);

      // Tooltip listens to pointerdown on document for outside click
      document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
      
      await host.updateComplete;
      expect(panel.matches(':popover-open')).toBe(false);
    });

    it('handles focus and focusout trigger', async () => {
      render(
        html`
          <vi-tooltip content="Focus" trigger="focus" .delay=${0}>
            <button id="btn">Target</button>
          </vi-tooltip>
        `,
        container
      );
      const host = document.querySelector('vi-tooltip') as any;
      await host.updateComplete;

      const panel = host.shadowRoot!.querySelector('.tooltip-panel') as HTMLElement;
      
      host.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }));
      await host.updateComplete;
      expect(panel.matches(':popover-open')).toBe(true);

      host.dispatchEvent(new FocusEvent('focusout', { bubbles: true, composed: true }));
      await host.updateComplete;
      expect(panel.matches(':popover-open')).toBe(false);
    });
  });

  describe('Accessibility (A11y)', () => {
    it('should pass axe accessibility audits', async () => {
      // Set background to pass color contrast checks
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';

      render(
        html`
          <vi-tooltip content="Helpful tooltip text">
            <button id="a11y-trigger">Hover target</button>
          </vi-tooltip>
        `,
        container
      );

      const host = document.querySelector('vi-tooltip') as ViTooltip;
      await host.updateComplete;

      // Run axe on the rendering container
      const results = await axe.run(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          'region': { enabled: false },
          'color-contrast': { enabled: false }
        }
      });

      expect(results.violations).toHaveLength(0);
    });
  });
});
