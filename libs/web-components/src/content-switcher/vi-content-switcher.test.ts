import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import './vi-content-switcher.js';
import type { ViContentSwitcher } from './vi-content-switcher.js';
import type { ViSwitcherItem } from './vi-content-switcher.js';

describe('vi-content-switcher', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render the custom element and its shadow DOM', async () => {
    render(
      html`
        <vi-content-switcher value="first">
          <vi-switcher-item value="first">First</vi-switcher-item>
          <vi-switcher-item value="second">Second</vi-switcher-item>
        </vi-content-switcher>
      `,
      container,
    );

    const host = await $('vi-content-switcher');
    await expect(host).toExist();

    const track = await host.shadow$('.track');
    await expect(track).toExist();
  });

  describe('Properties and Selection', () => {
    it('should set initial active item based on value', async () => {
      render(
        html`
          <vi-content-switcher value="second">
            <vi-switcher-item id="first" value="first">First</vi-switcher-item>
            <vi-switcher-item id="second" value="second"
              >Second</vi-switcher-item
            >
          </vi-content-switcher>
        `,
        container,
      );

      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      const firstItem = document.getElementById('first') as ViSwitcherItem;
      const secondItem = document.getElementById('second') as ViSwitcherItem;

      expect(firstItem.active).toBe(false);
      expect(secondItem.active).toBe(true);
    });

    it('should change value when an item is clicked', async () => {
      render(
        html`
          <vi-content-switcher value="first">
            <vi-switcher-item id="first" value="first">First</vi-switcher-item>
            <vi-switcher-item id="second" value="second"
              >Second</vi-switcher-item
            >
          </vi-content-switcher>
        `,
        container,
      );

      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      let changeFired = false;
      host.addEventListener('vi-content-switcher-change', (e: Event) => {
        changeFired = true;
        const customEvent = e as CustomEvent;
        expect(customEvent.detail.value).toBe('second');
        expect(customEvent.detail.previousValue).toBe('first');
      });

      const secondItem = await $('#second');
      await secondItem.click();

      expect(host.value).toBe('second');
      expect(changeFired).toBe(true);

      const secondItemNode = document.getElementById(
        'second',
      ) as ViSwitcherItem;
      expect(secondItemNode.active).toBe(true);
    });

    it('should not change value when a disabled item is clicked', async () => {
      render(
        html`
          <vi-content-switcher value="first">
            <vi-switcher-item id="first" value="first">First</vi-switcher-item>
            <vi-switcher-item id="second" value="second" disabled
              >Second</vi-switcher-item
            >
          </vi-content-switcher>
        `,
        container,
      );

      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      let changeFired = false;
      host.addEventListener('vi-content-switcher-change', () => {
        changeFired = true;
      });

      const secondItem = await $('#second');
      await browser.execute(() => {
        document.getElementById('second')?.click();
      });

      expect(host.value).toBe('first');
      expect(changeFired).toBe(false);
    });

    it('should not change value when the switcher itself is disabled', async () => {
      render(
        html`
          <vi-content-switcher value="first" disabled>
            <vi-switcher-item id="first" value="first">First</vi-switcher-item>
            <vi-switcher-item id="second" value="second"
              >Second</vi-switcher-item
            >
          </vi-content-switcher>
        `,
        container,
      );

      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      let changeFired = false;
      host.addEventListener('vi-content-switcher-change', () => {
        changeFired = true;
      });

      const secondItem = await $('#second');
      await browser.execute(() => {
        document.getElementById('second')?.click();
      });

      expect(host.value).toBe('first');
      expect(changeFired).toBe(false);
    });

    it('should not change value if vi-content-switcher-before-change is prevented', async () => {
      render(
        html`
          <vi-content-switcher value="first">
            <vi-switcher-item id="first" value="first">First</vi-switcher-item>
            <vi-switcher-item id="second" value="second"
              >Second</vi-switcher-item
            >
          </vi-content-switcher>
        `,
        container,
      );

      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      let changeFired = false;
      host.addEventListener('vi-content-switcher-before-change', (e: Event) => {
        e.preventDefault();
      });
      host.addEventListener('vi-content-switcher-change', () => {
        changeFired = true;
      });

      await browser.execute(() => {
        document.getElementById('second')?.click();
      });

      expect(host.value).toBe('first');
      expect(changeFired).toBe(false);
    });

    it('should support keyboard navigation with arrow keys', async () => {
      render(
        html`
          <vi-content-switcher value="first">
            <vi-switcher-item id="first" value="first">First</vi-switcher-item>
            <vi-switcher-item id="second" value="second"
              >Second</vi-switcher-item
            >
            <vi-switcher-item id="third" value="third" disabled
              >Third</vi-switcher-item
            >
            <vi-switcher-item id="fourth" value="fourth"
              >Fourth</vi-switcher-item
            >
          </vi-content-switcher>
        `,
        container,
      );

      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      const first = await $('#first');
      await first.click(); // focus and select first

      // simulate ArrowRight
      await browser.keys(['ArrowRight']);
      expect(host.value).toBe('second');

      // simulate ArrowRight again, should skip disabled third item and go to fourth
      await browser.keys(['ArrowRight']);
      expect(host.value).toBe('fourth');

      // simulate ArrowRight again, should wrap around to first
      await browser.keys(['ArrowRight']);
      expect(host.value).toBe('first');
    });
  });

  describe('Form Integration', () => {
    it('should act as a form-associated element and submit its value', async () => {
      render(
        html`
          <form id="test-form">
            <vi-content-switcher name="switcher" value="second">
              <vi-switcher-item value="first">First</vi-switcher-item>
              <vi-switcher-item value="second">Second</vi-switcher-item>
            </vi-content-switcher>
          </form>
        `,
        container,
      );

      const form = document.getElementById('test-form') as HTMLFormElement;
      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      const formData = new FormData(form);
      expect(formData.get('switcher')).toBe('second');
    });

    it('should respect formResetCallback when form is reset', async () => {
      render(
        html`
          <form id="test-form">
            <vi-content-switcher name="switcher" value="first">
              <vi-switcher-item id="first" value="first"
                >First</vi-switcher-item
              >
              <vi-switcher-item id="second" value="second"
                >Second</vi-switcher-item
              >
            </vi-content-switcher>
          </form>
        `,
        container,
      );

      const form = document.getElementById('test-form') as HTMLFormElement;
      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      // Click second to change value
      await browser.execute(() => {
        document.getElementById('second')?.click();
      });
      expect(host.value).toBe('second');

      // Reset form
      form.reset();
      await host.updateComplete;
      expect(host.value).toBe('first');
    });
  });

  describe('Accessibility', () => {
    it('should pass axe accessibility tests', async () => {
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';

      render(
        html`
          <vi-content-switcher value="first" aria-label="View switch">
            <vi-switcher-item value="first">First View</vi-switcher-item>
            <vi-switcher-item value="second">Second View</vi-switcher-item>
          </vi-content-switcher>
        `,
        container,
      );

      const host = document.querySelector(
        'vi-content-switcher',
      ) as ViContentSwitcher;
      await host.updateComplete;

      const results = await axe.run(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          region: { enabled: false },
          'color-contrast': { enabled: false },
        },
      });

      expect(results.violations).toHaveLength(0);
    });
  });
});
