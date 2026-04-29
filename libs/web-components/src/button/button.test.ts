import { $, expect } from '@wdio/globals';
import './vi-button.js';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Render HTML into body and wait for Lit's first update cycle. */
async function render(html: string): Promise<void> {
  await browser.execute((markup) => {
    document.body.innerHTML = markup;
  }, html);
  // Let Lit's microtask queue flush
  await browser.executeAsync((done: () => void) => {
    Promise.resolve().then(done);
  });
}

/** Wait for a vi-button's shadow DOM to contain the inner <button>. */
async function waitForShadow(selector: string) {
  const host = await $(selector);
  await browser.waitUntil(async () => {
    const btn = await host.shadow$('button');
    return btn.isExisting();
  });
  return host;
}

// ─── suite ──────────────────────────────────────────────────────────────────

describe('vi-button', () => {

  // ── Rendering & default state ────────────────────────────────────────────

  describe('rendering', () => {
    it('renders an inner <button> with the slotted label text', async () => {
      await render('<vi-button id="r1">Save</vi-button>');
      const host = await waitForShadow('#r1');
      const btn = await host.shadow$('button');
      await expect(btn).toExist();
      await expect(btn).toHaveText('Save');
    });

    it('defaults variant to "primary"', async () => {
      await render('<vi-button id="r2">Btn</vi-button>');
      const host = await $('#r2');
      await expect(host).toHaveAttribute('variant', 'primary');
    });

    it('defaults size to "md"', async () => {
      await render('<vi-button id="r3">Btn</vi-button>');
      const host = await $('#r3');
      await expect(host).toHaveAttribute('size', 'md');
    });

    it('defaults icon-placement to "start"', async () => {
      await render('<vi-button id="r4">Btn</vi-button>');
      const host = await $('#r4');
      await expect(host).toHaveAttribute('icon-placement', 'start');
    });

    it('inner <button> has part="button" for external styling', async () => {
      await render('<vi-button id="r5">Btn</vi-button>');
      const host = await waitForShadow('#r5');
      const btn = await host.shadow$('button[part="button"]');
      await expect(btn).toExist();
    });

    it('inner <button> has type="button" (never submits forms by accident)', async () => {
      await render('<vi-button id="r6">Btn</vi-button>');
      const host = await waitForShadow('#r6');
      const btn = await host.shadow$('button');
      await expect(btn).toHaveAttribute('type', 'button');
    });

    it('inner <button> has tabindex="-1" (host is the tab stop)', async () => {
      await render('<vi-button id="r7">Btn</vi-button>');
      const host = await waitForShadow('#r7');
      const btn = await host.shadow$('button');
      await expect(btn).toHaveAttribute('tabindex', '-1');
    });

    it('shadow DOM contains a named icon slot and a label slot', async () => {
      await render('<vi-button id="r8">Btn</vi-button>');
      const host = await waitForShadow('#r8');
      await expect(await host.shadow$('slot[name="icon"]')).toExist();
      await expect(await host.shadow$('span.label slot')).toExist();
    });
  });

  // ── Variant ──────────────────────────────────────────────────────────────

  describe('variant', () => {
    const variants = ['primary', 'secondary', 'danger', 'success', 'info', 'ghost'] as const;

    for (const variant of variants) {
      it(`reflects variant="${variant}" as attribute`, async () => {
        await render(`<vi-button id="v-${variant}" variant="${variant}">Btn</vi-button>`);
        const host = await $(`#v-${variant}`);
        await expect(host).toHaveAttribute('variant', variant);
      });
    }

    it('changing variant attribute updates the reflected property', async () => {
      await render('<vi-button id="v-change" variant="secondary">Btn</vi-button>');
      const host = await $('#v-change');
      await browser.execute((el) => el.setAttribute('variant', 'danger'), host);
      await expect(host).toHaveAttribute('variant', 'danger');
    });

    it('secondary and danger variants produce different background colors', async () => {
      await render(`
        <vi-button id="secondary" variant="secondary">S</vi-button>
        <vi-button id="danger" variant="danger">D</vi-button>
      `);
      const secBtn = await (await waitForShadow('#secondary')).shadow$('button');
      const danBtn = await (await waitForShadow('#danger')).shadow$('button');
      const secBg = await browser.execute((el) => getComputedStyle(el).backgroundColor, secBtn);
      const danBg = await browser.execute((el) => getComputedStyle(el).backgroundColor, danBtn);
      expect(secBg).not.toBe(danBg);
    });
  });

  // ── Size ─────────────────────────────────────────────────────────────────

  describe('size', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const;

    for (const size of sizes) {
      it(`reflects size="${size}" as attribute`, async () => {
        await render(`<vi-button id="sz-${size}" size="${size}">Btn</vi-button>`);
        const host = await $(`#sz-${size}`);
        await expect(host).toHaveAttribute('size', size);
      });
    }

    it('changing size attribute is reflected immediately', async () => {
      await render('<vi-button id="sz-change" size="lg">Btn</vi-button>');
      const host = await $('#sz-change');
      await browser.execute((el) => el.setAttribute('size', 'sm'), host);
      await expect(host).toHaveAttribute('size', 'sm');
    });
  });

  // ── Disabled ─────────────────────────────────────────────────────────────

  describe('disabled', () => {
    it('reflects disabled attribute on host', async () => {
      await render('<vi-button id="dis1" disabled>Btn</vi-button>');
      const host = await $('#dis1');
      await expect(host).toHaveAttribute('disabled');
    });

    it('native inner <button> is disabled when host has disabled attr', async () => {
      await render('<vi-button id="dis2" disabled>Btn</vi-button>');
      const host = await waitForShadow('#dis2');
      const btn = await host.shadow$('button');
      await expect(btn).toBeDisabled();
    });

    it('removes disabled from inner button when attribute is removed', async () => {
      await render('<vi-button id="dis3" disabled>Btn</vi-button>');
      const host = await waitForShadow('#dis3');
      await browser.execute((el) => el.removeAttribute('disabled'), host);
      await browser.pause(30);
      const btn = await host.shadow$('button');
      await expect(btn).not.toBeDisabled();
    });

    it('suppresses click events when disabled (stopImmediatePropagation)', async () => {
      await render('<vi-button id="dis4" disabled>Btn</vi-button>');

      const clicked = await browser.execute(() => {
        const host = document.querySelector<EventTarget>('#dis4')!;
        let fired = false;
        host.addEventListener('click', () => { fired = true; });
        const inner = (host as HTMLElement).shadowRoot?.querySelector('button');
        // composed:true required — without it the event stops at the shadow boundary
        // and can never reach the host listener (which would make this test pass
        // trivially even if onClick suppression were broken).
        inner?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
        return fired;
      });
      expect(clicked).toBe(false);
    });

    it('allows click events when not disabled', async () => {
      await render('<vi-button id="dis5">Btn</vi-button>');
      await waitForShadow('#dis5');

      const clicked = await browser.execute(() => {
        const host = document.querySelector<EventTarget>('#dis5')!;
        let fired = false;
        host.addEventListener('click', () => { fired = true; });
        const inner = (host as HTMLElement).shadowRoot?.querySelector('button');
        // composed:true is required for the event to cross the shadow boundary.
        inner?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true }));
        return fired;
      });
      expect(clicked).toBe(true);
    });

    it('sets host tabIndex to -1 when disabled (removed from tab order)', async () => {
      await render('<vi-button id="dis6">Btn</vi-button>');
      const host = await $('#dis6');
      // Disable and wait for updated() to fire
      await browser.execute((el) => el.setAttribute('disabled', ''), host);
      await browser.pause(30);
      const tabIndex = await browser.execute((el) => (el as HTMLElement).tabIndex, host);
      expect(tabIndex).toBe(-1);
    });

    it('restores host tabIndex to 0 when re-enabled', async () => {
      await render('<vi-button id="dis7" disabled>Btn</vi-button>');
      const host = await $('#dis7');
      await browser.execute((el) => el.removeAttribute('disabled'), host);
      await browser.pause(30);
      const tabIndex = await browser.execute((el) => (el as HTMLElement).tabIndex, host);
      expect(tabIndex).toBe(0);
    });
  });

  // ── Full-width ────────────────────────────────────────────────────────────

  describe('full-width', () => {
    it('reflects full-width boolean attribute when present', async () => {
      await render('<vi-button id="fw1" full-width>Btn</vi-button>');
      const host = await $('#fw1');
      await expect(host).toHaveAttribute('full-width');
    });

    it('absence of full-width attribute means it is false', async () => {
      await render('<vi-button id="fw2">Btn</vi-button>');
      const host = await $('#fw2');
      const has = await browser.execute((el) => el.hasAttribute('full-width'), host);
      expect(has).toBe(false);
    });

    it('toggling full-width off removes the attribute', async () => {
      await render('<vi-button id="fw3" full-width>Btn</vi-button>');
      const host = await $('#fw3');
      await browser.execute((el) => el.removeAttribute('full-width'), host);
      await browser.pause(30);
      const has = await browser.execute((el) => el.hasAttribute('full-width'), host);
      expect(has).toBe(false);
    });
  });

  // ── Icon-only ─────────────────────────────────────────────────────────────

  describe('icon-only', () => {
    it('reflects icon-only attribute on host', async () => {
      await render('<vi-button id="io1" icon-only aria-label="Save">Btn</vi-button>');
      const host = await $('#io1');
      await expect(host).toHaveAttribute('icon-only');
    });

    it('visually hides the label span (position:absolute, width:1px)', async () => {
      await render('<vi-button id="io2" icon-only aria-label="Save">Label</vi-button>');
      const host = await waitForShadow('#io2');
      const labelSpan = await host.shadow$('.label');
      const position = await browser.execute((el) => getComputedStyle(el).position, labelSpan);
      const width = await browser.execute((el) => getComputedStyle(el).width, labelSpan);
      expect(position).toBe('absolute');
      expect(width).toBe('1px');
    });

    it('label is still in the DOM for screen readers when icon-only', async () => {
      await render('<vi-button id="io3" icon-only aria-label="Delete">Delete</vi-button>');
      const host = await waitForShadow('#io3');
      const labelSpan = await host.shadow$('.label');
      await expect(labelSpan).toExist();
    });
  });

  // ── Icon placement ────────────────────────────────────────────────────────

  describe('icon-placement', () => {
    it('reflects icon-placement="end" as attribute', async () => {
      await render('<vi-button id="ip1" icon-placement="end">Btn</vi-button>');
      const host = await $('#ip1');
      await expect(host).toHaveAttribute('icon-placement', 'end');
    });

    it('reflects icon-placement="start" as attribute', async () => {
      await render('<vi-button id="ip2" icon-placement="start">Btn</vi-button>');
      const host = await $('#ip2');
      await expect(host).toHaveAttribute('icon-placement', 'start');
    });

    it('changing icon-placement from end to start is reflected', async () => {
      await render('<vi-button id="ip3" icon-placement="end">Btn</vi-button>');
      const host = await $('#ip3');
      await browser.execute((el) => el.setAttribute('icon-placement', 'start'), host);
      await expect(host).toHaveAttribute('icon-placement', 'start');
    });
  });

  // ── Slots ─────────────────────────────────────────────────────────────────

  describe('slots', () => {
    it('named icon slot exists in shadow DOM', async () => {
      await render('<vi-button id="sl1"><span slot="icon">★</span>Label</vi-button>');
      const host = await waitForShadow('#sl1');
      const slot = await host.shadow$('slot[name="icon"]');
      await expect(slot).toExist();
    });

    it('default slot renders label content', async () => {
      await render('<vi-button id="sl2">My Label</vi-button>');
      const host = await waitForShadow('#sl2');
      const btn = await host.shadow$('button');
      await expect(btn).toHaveText('My Label');
    });

    it('icon slot has part="icon" for external styling', async () => {
      await render('<vi-button id="sl3">Btn</vi-button>');
      const host = await waitForShadow('#sl3');
      const iconSlot = await host.shadow$('slot[part="icon"]');
      await expect(iconSlot).toExist();
    });

    it('label span has part="label" for external styling', async () => {
      await render('<vi-button id="sl4">Btn</vi-button>');
      const host = await waitForShadow('#sl4');
      const labelSpan = await host.shadow$('span[part="label"]');
      await expect(labelSpan).toExist();
    });
  });

  // ── Focus management ─────────────────────────────────────────────────────

  describe('focus management', () => {
    it('host has tabIndex=0 by default (host is the tab stop)', async () => {
      await render('<vi-button id="fm1">Focus</vi-button>');
      const host = await $('#fm1');
      const tabIndex = await browser.execute((el) => (el as HTMLElement).tabIndex, host);
      expect(tabIndex).toBe(0);
    });

    it('consumer-specified tabindex is respected (e.g. tabindex="2")', async () => {
      await render('<vi-button id="fm2" tabindex="2">Focus</vi-button>');
      const host = await $('#fm2');
      const tabIndex = await browser.execute((el) => (el as HTMLElement).tabIndex, host);
      expect(tabIndex).toBe(2);
    });

    it('consumer-specified tabindex="-1" is respected (remove from tab order)', async () => {
      await render('<vi-button id="fm3" tabindex="-1">Focus</vi-button>');
      const host = await $('#fm3');
      const tabIndex = await browser.execute((el) => (el as HTMLElement).tabIndex, host);
      expect(tabIndex).toBe(-1);
    });

    it('inner <button> has tabindex="-1" (not a direct tab stop)', async () => {
      await render('<vi-button id="fm4">Focus</vi-button>');
      const host = await waitForShadow('#fm4');
      const btn = await host.shadow$('button');
      await expect(btn).toHaveAttribute('tabindex', '-1');
    });

    it('programmatic focus() delegates to the inner <button>', async () => {
      await render('<vi-button id="fm5">Focus</vi-button>');
      const host = await waitForShadow('#fm5');
      await browser.execute((el) => (el as HTMLElement).focus(), host);
      const isActive = await browser.execute((el) => {
        const inner = (el as HTMLElement).shadowRoot?.querySelector('button');
        return (el as HTMLElement).shadowRoot?.activeElement === inner;
      }, host);
      expect(isActive).toBe(true);
    });

    it('delegatesFocus: clicking the shadow host routes focus to inner button', async () => {
      await render('<vi-button id="fm6">Focus</vi-button>');
      const host = await waitForShadow('#fm6');
      // Click the host element itself (not the inner button)
      await host.click();
      const isActive = await browser.execute((el) => {
        const inner = (el as HTMLElement).shadowRoot?.querySelector('button');
        return (el as HTMLElement).shadowRoot?.activeElement === inner;
      }, host);
      expect(isActive).toBe(true);
    });

    it('focus() does not throw when called before first render', async () => {
      const result = await browser.execute(() => {
        try {
          const el = document.createElement('vi-button');
          document.body.appendChild(el);
          (el as HTMLElement).focus();
          el.remove();
          return 'ok';
        } catch (e) {
          return (e as Error).message;
        }
      });
      expect(result).toBe('ok');
    });

    it('disabled button is not focusable via keyboard (tabIndex -1)', async () => {
      await render('<vi-button id="fm7" disabled>Focus</vi-button>');
      const host = await $('#fm7');
      const tabIndex = await browser.execute((el) => (el as HTMLElement).tabIndex, host);
      expect(tabIndex).toBe(-1);
    });
  });

  // ── Accessibility ─────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('disabled state is conveyed via native disabled on inner button', async () => {
      await render('<vi-button id="a11y1" disabled>Save</vi-button>');
      const host = await waitForShadow('#a11y1');
      const btn = await host.shadow$('button');
      const isDisabled = await browser.execute((el) => (el as HTMLButtonElement).disabled, btn);
      expect(isDisabled).toBe(true);
    });

    it('aria-label on host is accessible to assistive technology', async () => {
      await render('<vi-button id="a11y2" aria-label="Close dialog">✕</vi-button>');
      const host = await $('#a11y2');
      await expect(host).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('icon-only button: aria-label on host is the accessible name', async () => {
      await render('<vi-button id="a11y3" icon-only aria-label="Delete item">✕</vi-button>');
      const host = await $('#a11y3');
      await expect(host).toHaveAttribute('aria-label', 'Delete item');
    });
  });

  // ── CSS parts ─────────────────────────────────────────────────────────────

  describe('CSS parts', () => {
    it('exposes part="button" on inner <button>', async () => {
      await render('<vi-button id="pt1">Btn</vi-button>');
      const host = await waitForShadow('#pt1');
      const btn = await host.shadow$('[part="button"]');
      await expect(btn).toExist();
    });

    it('exposes part="icon" on the icon slot', async () => {
      await render('<vi-button id="pt2">Btn</vi-button>');
      const host = await waitForShadow('#pt2');
      const icon = await host.shadow$('[part="icon"]');
      await expect(icon).toExist();
    });

    it('exposes part="label" on the label span', async () => {
      await render('<vi-button id="pt3">Btn</vi-button>');
      const host = await waitForShadow('#pt3');
      const label = await host.shadow$('[part="label"]');
      await expect(label).toExist();
    });
  });
});
