import { $, expect } from '@wdio/globals';
import './vi-button.js';

describe('vi-button', () => {
  it('renders and applies primary variant style token', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="primary" variant="primary">Save</vi-button>';
    });

    const host = await $('#primary');
    await expect(host).toExist();

    const button = await host.shadow$('button');
    await expect(button).toExist();
    await expect(button).toHaveText('Save');
  });

  it('supports disabled state', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="primary" variant="primary">Save</vi-button>';
    });

    const host = await $('#primary');
    await browser.execute((el) => el.setAttribute('disabled', ''), host);

    const button = await host.shadow$('button');
    await expect(button).toBeDisabled();
  });

  it('reflects variant change and style token from tokenized CSS vars', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="variant-test" variant="secondary">Action</vi-button>';
    });

    const host = await $('#variant-test');
    const button = await host.shadow$('button');

    await expect(button).toHaveText('Action');
    const colorBefore = await browser.execute((el) => getComputedStyle(el).backgroundColor, button);
    await expect(colorBefore).not.toBe('rgba(0, 0, 0, 0)');

    await browser.execute((el) => el.setAttribute('variant', 'danger'), host);
    await browser.pause(50);
    const colorAfter = await browser.execute((el) => getComputedStyle(el).backgroundColor, button);
    await expect(colorAfter).not.toEqual(colorBefore);
  });

  it('does not call click handler when disabled', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="disabled-click" variant="primary">Submit</vi-button>';
    });

    await browser.execute(() => {
      const host = document.querySelector('#disabled-click');
      if (!host) throw new Error('no host');
      host.setAttribute('disabled', '');
       (window as unknown as {wasClicked?: boolean}).wasClicked = false;

      host.addEventListener('click', () => {
         (window as unknown as {wasClicked?: boolean}).wasClicked = true;
      });

      const btn = host.shadowRoot?.querySelector('button');
      btn?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    const clicked = await browser.execute(() => (window as unknown as {wasClicked?: boolean}).wasClicked);
    await expect(clicked).toBe(false);
  });

  it('supports size property', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="size-test" size="lg">Size</vi-button>';
    });
    const host = await $('#size-test');
    await expect(host).toHaveAttribute('size', 'lg');

    await browser.execute((el) => el.setAttribute('size', 'sm'), host);
    await browser.pause(50);
    await expect(host).toHaveAttribute('size', 'sm');
  });

  it('supports icon-placement property', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="icon-test" icon-placement="end">Icon</vi-button>';
    });
    const host = await $('#icon-test');
    await expect(host).toHaveAttribute('icon-placement', 'end');
  });

  it('supports full-width boolean property', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="fw-test" full-width>Full Width</vi-button>';
    });
    const host = await $('#fw-test');
    await expect(host).toHaveAttribute('full-width');

    await browser.execute((el) => el.removeAttribute('full-width'), host);
    await browser.pause(50);
    
    const hasAttrAfter = await browser.execute((el) => el.hasAttribute('full-width'), host);
    await expect(hasAttrAfter).toBe(false);
  });

  it('supports icon-only layout and visually hides the label', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="icon-only-test" icon-only>Save</vi-button>';
    });
    const host = await $('#icon-only-test');
    await expect(host).toHaveAttribute('icon-only');

    const labelSpan = await host.shadow$('.label');
    await expect(labelSpan).toExist();

    // Check that the label is visually hidden (screen-reader only)
    const position = await browser.execute((el) => getComputedStyle(el).position, labelSpan);
    await expect(position).toBe('absolute');
    
    const width = await browser.execute((el) => getComputedStyle(el).width, labelSpan);
    await expect(width).toBe('1px');
  });

  it('renders icon slot', async () => {
    await browser.execute(() => {
      document.body.innerHTML = '<vi-button id="slot-test"><span slot="icon">Icon</span>Label</vi-button>';
    });
    const host = await $('#slot-test');
    
    // Verify the named slot exists in the shadow DOM
    const iconSlot = await host.shadow$('slot[name="icon"]');
    await expect(iconSlot).toExist();
  });

  describe('focus management', () => {
    it('enforces tabindex="-1" on the host element', async () => {
      await browser.execute(() => {
        document.body.innerHTML = '<vi-button id="focus-test">Focus</vi-button>';
      });

      const host = await $('#focus-test');
      await expect(host).toHaveAttribute('tabindex', '-1');
    });

    it('explicitly delegates programmatic focus to the inner native button', async () => {
      await browser.execute(() => {
        document.body.innerHTML = '<vi-button id="focus-delegate">Focus</vi-button>';
      });

      const host = await $('#focus-delegate');
      
      // Crucial: Wait for Lit's async render cycle to populate the shadow DOM
      await browser.waitUntil(async () => {
        const btn = await host.shadow$('button');
        return await btn.isExisting();
      });

      // Now call programmatic focus on the host after it has rendered
      await browser.execute((el) => el.focus(), host);

      const isActive = await browser.execute((el) => {
        return el.shadowRoot?.activeElement === el.shadowRoot?.querySelector('button') && el.shadowRoot?.activeElement !== null;
      }, host);
      await expect(isActive).toBe(true);
    });

    it('safely falls back if focus() is called before the first render', async () => {
      const result = await browser.execute(() => {
        try {
          const btn = document.createElement('vi-button');
          document.body.appendChild(btn);
          btn.focus(); // Should not throw
          btn.remove();
          return 'success';
        } catch (e) {
          return e instanceof Error ? e.message : String(e);
        }
      });
      await expect(result).toBe('success');
    });
  });
});
