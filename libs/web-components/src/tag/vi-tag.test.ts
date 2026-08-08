import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-tag.js';
import type { ViTag } from './vi-tag.js';

describe('vi-tag', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders a neutral tag by default', async () => {
    render(html`<vi-tag>Test Tag</vi-tag>`, container);
    const tag = container.querySelector('vi-tag') as ViTag;

    // Wait for lit to render
    await new Promise((r) => setTimeout(r, 0));

    expect(tag).toExist();
    expect(tag.variant).toBe('neutral');
    expect(tag.size).toBe('md');
    expect(tag.removable).toBe(false);
    expect(tag.selected).toBe(false);
    expect(tag.disabled).toBe(false);

    const innerTag = tag.shadowRoot!.querySelector('.tag') as HTMLElement;
    expect(innerTag.classList.contains('variant-neutral')).toBe(true);
    expect(innerTag.classList.contains('size-md')).toBe(true);
  });

  it('renders a removable tag with remove button', async () => {
    render(html`<vi-tag removable>Removable Tag</vi-tag>`, container);
    const tag = container.querySelector('vi-tag') as ViTag;
    await new Promise((r) => setTimeout(r, 0));

    const removeBtn = tag.shadowRoot!.querySelector('.tag-remove-btn');
    expect(removeBtn).toExist();
  });

  it('fires vialiq-remove event on remove button click', async () => {
    let removeFired = false;
    render(
      html`<vi-tag removable @vialiq-remove=${() => { removeFired = true; }}>Remove me</vi-tag>`,
      container
    );
    const tag = container.querySelector('vi-tag') as ViTag;
    await new Promise((r) => setTimeout(r, 0));

    const removeBtn = tag.shadowRoot!.querySelector('.tag-remove-btn') as HTMLElement;
    removeBtn.click();

    expect(removeFired).toBe(true);
  });

  it('fires vialiq-remove on Delete/Backspace keydown', async () => {
    let removeFired = false;
    render(
      html`<vi-tag removable @vialiq-remove=${() => { removeFired = true; }}>Remove me</vi-tag>`,
      container
    );
    const tag = container.querySelector('vi-tag') as ViTag;
    await new Promise((r) => setTimeout(r, 0));

    const innerTag = tag.shadowRoot!.querySelector('.tag-content-wrapper') as HTMLElement;

    innerTag.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    expect(removeFired).toBe(true);
  });

  it('fires vialiq-select event on tag click and toggles selected', async () => {
    let selectedState: boolean | undefined;
    render(
      html`<vi-tag @vialiq-select=${(e: CustomEvent) => { selectedState = e.detail.selected; }}>Selectable</vi-tag>`,
      container
    );
    const tag = container.querySelector('vi-tag') as ViTag;
    await new Promise((r) => setTimeout(r, 0));

    const innerTag = tag.shadowRoot!.querySelector('.tag-content-wrapper') as HTMLElement;
    innerTag.click();

    expect(selectedState).toBe(true);
    expect(tag.selected).toBe(true);

    innerTag.click();
    expect(selectedState).toBe(false);
    expect(tag.selected).toBe(false);
  });

  it('does not fire events when disabled', async () => {
    let selectFired = false;
    let removeFired = false;
    render(
      html`<vi-tag disabled removable @vialiq-select=${() => { selectFired = true; }} @vialiq-remove=${() => { removeFired = true; }}>Disabled</vi-tag>`,
      container
    );
    const tag = container.querySelector('vi-tag') as ViTag;
    await new Promise((r) => setTimeout(r, 0));

    const innerTag = tag.shadowRoot!.querySelector('.tag') as HTMLElement;
    innerTag.click();
    expect(selectFired).toBe(false);

    innerTag.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    expect(removeFired).toBe(false);

    const removeBtn = tag.shadowRoot!.querySelector('.tag-remove-btn') as HTMLElement;
    removeBtn.click();
    expect(removeFired).toBe(false);
  });
});
