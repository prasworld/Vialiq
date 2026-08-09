import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import './vi-tag.js'; // Registers vi-tag
import type { ViTag } from './vi-tag.js';

describe('vi-tag', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render the custom element and shadow DOM structure', async () => {
    render(html`<vi-tag>Site 001</vi-tag>`, container);

    const tag = await $('vi-tag');
    await expect(tag).toExist();

    const spanPart = await tag.shadow$('.tag');
    await expect(spanPart).toExist();

    const labelPart = await tag.shadow$('.tag-label');
    await expect(labelPart).toExist();
  });

  describe('Properties and defaults', () => {
    it('should initialize with correct default property values', () => {
      render(html`<vi-tag>Default Tag</vi-tag>`, container);
      const el = document.querySelector('vi-tag') as ViTag;

      expect(el.variant).toBe('neutral');
      expect(el.appearance).toBe('subtle');
      expect(el.size).toBe('md');
      expect(el.pill).toBe(false);
      expect(el.dot).toBe(false);
      expect(el.count).toBeUndefined();
      expect(el.removable).toBe(false);
      expect(el.selectable).toBe(false);
      expect(el.selected).toBe(false);
      expect(el.disabled).toBe(false);
    });

    it('should sync properties from attributes', async () => {
      render(
        html`
          <vi-tag
            variant="success"
            appearance="solid"
            size="lg"
            pill
            dot
            .count=${12}
            removable
            selectable
            selected
            disabled
          >
            Tag Value
          </vi-tag>
        `,
        container
      );
      const el = document.querySelector('vi-tag') as ViTag;
      await el.updateComplete;

      expect(el.variant).toBe('success');
      expect(el.appearance).toBe('solid');
      expect(el.size).toBe('lg');
      expect(el.pill).toBe(true);
      expect(el.dot).toBe(true);
      expect(el.count).toBe(12);
      expect(el.removable).toBe(true);
      expect(el.selectable).toBe(true);
      expect(el.selected).toBe(true);
      expect(el.disabled).toBe(true);
    });

    it('should render status dot element when dot property is true', async () => {
      render(html`<vi-tag dot>Status</vi-tag>`, container);
      const host = await $('vi-tag');
      const dotEl = await host.shadow$('.tag-dot');
      await expect(dotEl).toExist();
    });

    it('should render numeric count badge when count property is provided', async () => {
      render(html`<vi-tag .count=${5}>Items</vi-tag>`, container);
      const host = await $('vi-tag');
      const countEl = await host.shadow$('.tag-count');
      await expect(countEl).toExist();
      await expect(countEl).toHaveText('5');
    });
  });

  describe('Interactions and Events', () => {
    it('should toggle selected state and emit vialiq-select when clicked in selectable mode', async () => {
      let selectFired = false;
      let lastSelected = false;

      render(
        html`
          <vi-tag
            selectable
            @vialiq-select=${(e: CustomEvent<{ selected: boolean }>) => {
              selectFired = true;
              lastSelected = e.detail.selected;
            }}
          >
            Filter
          </vi-tag>
        `,
        container
      );

      const host = await $('vi-tag');
      const contentWrapper = await host.shadow$('.tag-content-wrapper');

      await browser.execute((el) => (el as HTMLElement).click(), contentWrapper);

      const el = document.querySelector('vi-tag') as ViTag;
      expect(el.selected).toBe(true);
      expect(selectFired).toBe(true);
      expect(lastSelected).toBe(true);
    });

    it('should emit vialiq-remove when remove button is clicked', async () => {
      let removeFired = false;

      render(
        html`
          <vi-tag
            removable
            @vialiq-remove=${() => {
              removeFired = true;
            }}
          >
            Removable Tag
          </vi-tag>
        `,
        container
      );

      const host = await $('vi-tag');
      const removeBtn = await host.shadow$('.tag-remove-btn');

      await browser.execute((el) => (el as HTMLElement).click(), removeBtn);

      expect(removeFired).toBe(true);
    });

    it('should emit vialiq-remove on Delete / Backspace keydown', async () => {
      let removeFired = false;

      render(
        html`
          <vi-tag
            removable
            @vialiq-remove=${() => {
              removeFired = true;
            }}
          >
            Removable Tag
          </vi-tag>
        `,
        container
      );

      const el = document.querySelector('vi-tag') as ViTag;
      await el.updateComplete;

      const contentWrapper = el.shadowRoot?.querySelector('.tag-content-wrapper') as HTMLElement;
      contentWrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

      expect(removeFired).toBe(true);
    });

    it('should not allow interaction when disabled is set', async () => {
      let selectFired = false;
      let removeFired = false;

      render(
        html`
          <vi-tag
            disabled
            selectable
            removable
            @vialiq-select=${() => (selectFired = true)}
            @vialiq-remove=${() => (removeFired = true)}
          >
            Disabled Tag
          </vi-tag>
        `,
        container
      );

      const host = await $('vi-tag');
      const contentWrapper = await host.shadow$('.tag-content-wrapper');

      await browser.execute((el) => (el as HTMLElement).click(), contentWrapper);

      const el = document.querySelector('vi-tag') as ViTag;
      expect(el.selected).toBe(false);
      expect(selectFired).toBe(false);
      expect(removeFired).toBe(false);
    });
  });

  describe('Accessibility (A11y)', () => {
    it('should pass axe accessibility audits', async () => {
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';

      render(
        html`
          <div role="list">
            <vi-tag variant="neutral">Default</vi-tag>
            <vi-tag variant="primary" removable>Removable</vi-tag>
            <vi-tag variant="success" selectable selected>Selectable</vi-tag>
            <vi-tag variant="warning" dot>Status Dot</vi-tag>
            <vi-tag variant="danger" disabled>Disabled</vi-tag>
          </div>
        `,
        container
      );

      const host = document.querySelector('vi-tag') as ViTag;
      await host.updateComplete;

      const results = await axe.run(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          'region': { enabled: false },
          'color-contrast': { enabled: false },
        },
      });

      expect(results.violations).toHaveLength(0);
    });
  });
});
