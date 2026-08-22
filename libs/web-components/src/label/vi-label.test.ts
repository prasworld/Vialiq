import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-label.js';
import { ViLabel } from './vi-label.js';

describe('vi-label', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders default label', async () => {
    render(
      html`
        <vi-label for="test-input">Test Label</vi-label>
      `,
      container
    );
    const label = container.querySelector('vi-label') as ViLabel;

    // allow web component to render
    await label.updateComplete;

    expect(label).toExist();
    expect(label.getAttribute('for')).toBe('test-input');

    const nativeLabel = label.shadowRoot!.querySelector('label');
    expect(nativeLabel).toExist();
    expect(nativeLabel!.getAttribute('for')).toBe('test-input');

    const slot = label.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
    expect(slot).toExist();
  });

  it('renders required indicator when required is true', async () => {
    render(
      html`
        <vi-label required>Required Label</vi-label>
      `,
      container
    );
    const label = container.querySelector('vi-label') as ViLabel;

    await label.updateComplete;

    const requiredIndicator = label.shadowRoot!.querySelector('.vi-label-required');
    expect(requiredIndicator).toExist();
    expect(requiredIndicator!.textContent).toBe('*');
    expect(requiredIndicator!.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders optional indicator when optional is true', async () => {
    render(
      html`
        <vi-label optional>Optional Label</vi-label>
      `,
      container
    );
    const label = container.querySelector('vi-label') as ViLabel;

    await label.updateComplete;

    const optionalIndicator = label.shadowRoot!.querySelector('.vi-label-optional');
    expect(optionalIndicator).toExist();
    expect(optionalIndicator!.textContent).toBe('(optional)');
  });

  it('applies disabled styling', async () => {
    render(
      html`
        <vi-label disabled>Disabled Label</vi-label>
      `,
      container
    );
    const label = container.querySelector('vi-label') as ViLabel;

    await label.updateComplete;

    expect(label.hasAttribute('disabled')).toBe(true);
    const nativeLabel = label.shadowRoot!.querySelector('label');
    expect(nativeLabel!.classList.contains('is-disabled')).toBe(true);
  });

  it('applies correct size classes', async () => {
    render(
      html`
        <vi-label size="lg">Large Label</vi-label>
      `,
      container
    );
    const label = container.querySelector('vi-label') as ViLabel;

    await label.updateComplete;

    const nativeLabel = label.shadowRoot!.querySelector('label');
    expect(nativeLabel!.classList.contains('size-lg')).toBe(true);
  });
});
