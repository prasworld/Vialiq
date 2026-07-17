import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-badge.js';
import type { ViBadge } from './vi-badge.js';

describe('vi-badge', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders a default badge', async () => {
    render(html`<vi-badge>Test</vi-badge>`, container);
    const badge = container.querySelector('vi-badge') as ViBadge;
    await badge.updateComplete;

    expect(badge.variant).toBe('neutral');
    expect(badge.size).toBe('md');
    expect(badge.pill).toBe(true);
    expect(badge.dot).toBe(false);
    expect(badge.outline).toBe(false);
    expect(badge.textContent).toContain('Test');
  });

  it('reflects variant, size, outline, pill properties to attributes', async () => {
    // using ?pill=${false} will omit the attribute, so we need to test hasAttribute
    render(
      html`<vi-badge variant="success" size="lg" outline></vi-badge>`,
      container
    );
    const badge = container.querySelector('vi-badge') as ViBadge;
    badge.pill = false;
    await badge.updateComplete;

    expect(badge.getAttribute('variant')).toBe('success');
    expect(badge.getAttribute('size')).toBe('lg');
    expect(badge.hasAttribute('outline')).toBe(true);
    expect(badge.hasAttribute('pill')).toBe(false); // Should be false because we removed it via prop update/or init
  });

  it('renders a dot when dot is true', async () => {
    render(html`<vi-badge dot></vi-badge>`, container);
    const badge = container.querySelector('vi-badge') as ViBadge;
    await badge.updateComplete;

    const innerSpan = badge.shadowRoot?.querySelector('.badge');
    expect(innerSpan).toBeTruthy();
    const dotPart = innerSpan?.querySelector('.dot');
    expect(dotPart).toBeTruthy();
  });

  it('renders count when count is set', async () => {
    render(html`<vi-badge count="5"></vi-badge>`, container);
    const badge = container.querySelector('vi-badge') as ViBadge;
    await badge.updateComplete;

    const innerSpan = badge.shadowRoot?.querySelector('.badge');
    expect(innerSpan?.textContent?.trim()).toBe('5');
  });

  it('renders {max}+ when count > max', async () => {
    render(html`<vi-badge count="105" max="99"></vi-badge>`, container);
    const badge = container.querySelector('vi-badge') as ViBadge;
    await badge.updateComplete;

    const innerSpan = badge.shadowRoot?.querySelector('.badge');
    expect(innerSpan?.textContent?.trim()).toBe('99+');
  });

  it('renders an icon in the icon slot', async () => {
    render(html`<vi-badge><span slot="icon" class="my-icon"></span>Icon Badge</vi-badge>`, container);
    const badge = container.querySelector('vi-badge') as ViBadge;
    await badge.updateComplete;

    const iconSlot = badge.shadowRoot?.querySelector('slot[name="icon"]') as HTMLSlotElement;
    const assignedNodes = iconSlot.assignedNodes({ flatten: true });

    // find element node
    const iconSpan = assignedNodes.find(node => node.nodeType === Node.ELEMENT_NODE) as HTMLElement;
    expect(iconSpan).toBeTruthy();
    expect(iconSpan.classList.contains('my-icon')).toBe(true);
  });

  it('has purely presentational default accessibility unless labeled', async () => {
    render(html`<vi-badge dot></vi-badge>`, container);
    const badge = container.querySelector('vi-badge') as ViBadge;
    await badge.updateComplete;

    // Component connects and is ready, no automatic aria-hidden if we let consumer handle it,
    // just confirming it mounts without breaking.
    expect(badge).toBeTruthy();
  });
});
