import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './index.js';
import type { ViDivider } from './vi-divider.js';

describe('vi-divider', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders horizontal divider with default properties', async () => {
    render(html`<vi-divider id="d1"></vi-divider>`, container);
    const divider = container.querySelector('#d1') as ViDivider;
    await divider.updateComplete;

    expect(divider.direction).toBe('horizontal');
    expect(divider.textPlacement).toBe('center');
    expect(divider.dashed).toBe(false);
    expect(divider.plain).toBe(false);
    expect(divider.getAttribute('role')).toBe('separator');
    expect(divider.getAttribute('aria-orientation')).toBe('horizontal');

    const inner = divider.shadowRoot?.querySelector('.divider');
    expect(inner).toBeTruthy();
    expect(inner?.classList.contains('divider--horizontal')).toBe(true);
    expect(inner?.classList.contains('divider--vertical')).toBe(false);
  });

  it('renders vertical divider and updates orientation attributes', async () => {
    render(
      html`<vi-divider id="d2" direction="vertical"></vi-divider>`,
      container,
    );
    const divider = container.querySelector('#d2') as ViDivider;
    await divider.updateComplete;

    expect(divider.direction).toBe('vertical');
    expect(divider.getAttribute('aria-orientation')).toBe('vertical');

    const inner = divider.shadowRoot?.querySelector('.divider');
    expect(inner?.classList.contains('divider--vertical')).toBe(true);
    expect(inner?.classList.contains('divider--horizontal')).toBe(false);
  });

  it('renders dashed separator stroke', async () => {
    render(html`<vi-divider id="d-dashed" dashed></vi-divider>`, container);
    const divider = container.querySelector('#d-dashed') as ViDivider;
    await divider.updateComplete;

    expect(divider.dashed).toBe(true);
    const inner = divider.shadowRoot?.querySelector('.divider');
    expect(inner?.classList.contains('divider--dashed')).toBe(true);
  });

  it('renders plain text modifier class', async () => {
    render(
      html`<vi-divider id="d-plain" plain>Audit Log</vi-divider>`,
      container,
    );
    const divider = container.querySelector('#d-plain') as ViDivider;
    await divider.updateComplete;

    expect(divider.plain).toBe(true);
    const inner = divider.shadowRoot?.querySelector('.divider');
    expect(inner?.classList.contains('divider--plain')).toBe(true);
  });

  it('handles slotted text and text placement', async () => {
    render(
      html`<vi-divider id="d-text" text-placement="left"
        >Form Section</vi-divider
      >`,
      container,
    );
    const divider = container.querySelector('#d-text') as ViDivider;
    await divider.updateComplete;

    // Trigger slotchange if needed or check DOM
    const slot = divider.shadowRoot?.querySelector('slot');
    slot?.dispatchEvent(new Event('slotchange'));
    await divider.updateComplete;

    const inner = divider.shadowRoot?.querySelector('.divider');
    expect(inner?.classList.contains('divider--placement-left')).toBe(true);
    expect(inner?.classList.contains('divider--with-text')).toBe(true);

    const lineStart = divider.shadowRoot?.querySelector('.divider__line-start');
    const lineEnd = divider.shadowRoot?.querySelector('.divider__line-end');
    const textSpan = divider.shadowRoot?.querySelector('.divider__text');

    expect(lineStart).toBeTruthy();
    expect(lineEnd).toBeTruthy();
    expect(textSpan).toBeTruthy();
  });

  it('applies custom text-margin style', async () => {
    render(
      html`<vi-divider
        id="d-margin"
        text-placement="left"
        text-margin="40px"
      >
        Left Margin
      </vi-divider>`,
      container,
    );
    const divider = container.querySelector('#d-margin') as ViDivider;
    await divider.updateComplete;

    const slot = divider.shadowRoot?.querySelector('slot');
    slot?.dispatchEvent(new Event('slotchange'));
    await divider.updateComplete;

    const inner = divider.shadowRoot?.querySelector('.divider') as HTMLElement;
    expect(inner?.style.getPropertyValue('--vi-divider-text-margin')).toBe(
      '40px',
    );
  });

  it('dynamically switches direction', async () => {
    render(html`<vi-divider id="d-dyn"></vi-divider>`, container);
    const divider = container.querySelector('#d-dyn') as ViDivider;
    await divider.updateComplete;

    expect(divider.getAttribute('aria-orientation')).toBe('horizontal');

    divider.direction = 'vertical';
    await divider.updateComplete;

    expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    const inner = divider.shadowRoot?.querySelector('.divider');
    expect(inner?.classList.contains('divider--vertical')).toBe(true);
  });
});
