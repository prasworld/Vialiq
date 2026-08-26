import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-label.js';

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
    
    const label = await $('vi-label');

    await expect(label).toExist();
    await expect(label).toHaveAttribute('for', 'test-input');

    const nativeLabel = await label.shadow$('label');
    await expect(nativeLabel).toExist();
    await expect(nativeLabel).toHaveAttribute('for', 'test-input');

    const slot = await label.shadow$('slot:not([name])');
    await expect(slot).toExist();
  });

  it('renders required indicator when required is true', async () => {
    render(
      html`
        <vi-label required>Required Label</vi-label>
      `,
      container
    );
    
    const label = await $('vi-label');

    const requiredIndicator = await label.shadow$('.vi-label-required');
    await expect(requiredIndicator).toExist();
    await expect(requiredIndicator).toHaveText('*');
    await expect(requiredIndicator).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders optional indicator when optional is true', async () => {
    render(
      html`
        <vi-label optional>Optional Label</vi-label>
      `,
      container
    );
    
    const label = await $('vi-label');

    const optionalIndicator = await label.shadow$('.vi-label-optional');
    await expect(optionalIndicator).toExist();
    await expect(optionalIndicator).toHaveText('(optional)');
  });

  it('applies disabled styling', async () => {
    render(
      html`
        <vi-label disabled>Disabled Label</vi-label>
      `,
      container
    );
    
    const label = await $('vi-label');

    await expect(label).toHaveAttribute('disabled');
    const nativeLabel = await label.shadow$('label');
    await expect(nativeLabel).toHaveElementClass('is-disabled');
  });

  it('applies correct size classes', async () => {
    render(
      html`
        <vi-label size="lg">Large Label</vi-label>
      `,
      container
    );
    
    const label = await $('vi-label');

    const nativeLabel = await label.shadow$('label');
    await expect(nativeLabel).toHaveElementClass('size-lg');
  });

  it('links aria-labelledby to the target input', async () => {
    render(
      html`
        <vi-label for="test-input">Test Label</vi-label>
        <input id="test-input" />
      `,
      container
    );
    
    const label = await $('vi-label');
    const input = await $('#test-input');

    // Wait for Lit component to finish updating and link ARIA
    await new Promise(r => setTimeout(r, 0));

    const labelId = await label.getAttribute('id');
    await expect(labelId).toContain('vi-label-');
    await expect(input).toHaveAttribute('aria-labelledby', labelId);
  });

  it('routes clicks to the target input', async () => {
    render(
      html`
        <vi-label for="test-input">Test Label</vi-label>
        <input id="test-input" />
      `,
      container
    );
    
    const label = await $('vi-label');
    const input = await $('#test-input');

    await new Promise(r => setTimeout(r, 0));

    const innerLabel = await label.shadow$('label');
    await innerLabel.click();
    await expect(input).toBeFocused();
  });
});
