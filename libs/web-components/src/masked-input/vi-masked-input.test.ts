import { $, expect, browser } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-masked-input.js';
import type { ViMaskedInput } from './vi-masked-input.js';

describe('vi-masked-input', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render the custom element and its shadow DOM', async () => {
    render(html`<vi-masked-input></vi-masked-input>`, container);

    const host = await $('vi-masked-input');
    await expect(host).toExist();

    const input = await host.shadow$('.input-control');
    await expect(input).toExist();
  });

  describe('Complex Masking Requirements', () => {
    it('should format input according to the phone number mask', async () => {
      render(
        html`<vi-masked-input mask="(000) 000-0000"></vi-masked-input>`,
        container,
      );
      const host = document.querySelector('vi-masked-input') as ViMaskedInput;
      await host.updateComplete;

      const input = await (
        await $('vi-masked-input')
      ).shadow$('.input-control');
      await input.setValue('1234567890');

      const val = await input.getValue();
      expect(val).toBe('(123) 456-7890');

      // rawValue should be the unmasked version
      expect(host.rawValue).toBe('1234567890');
    });

    it('should format input using regex-based maskOptions', async () => {
      // Create a complex dynamic mask using maskOptions
      const myMaskOptions = {
        mask: /^[a-zA-Z0-9]*$/,
      };

      render(
        html`<vi-masked-input .maskOptions=${myMaskOptions}></vi-masked-input>`,
        container,
      );
      const host = document.querySelector('vi-masked-input') as ViMaskedInput;
      await host.updateComplete;

      const input = await (
        await $('vi-masked-input')
      ).shadow$('.input-control');
      // Set alphanumeric with some special chars that should be blocked
      await input.setValue('A1b2*&C3');

      const val = await input.getValue();
      expect(val).toBe('A1b2C3');
    });

    it('should apply masking pattern dynamically when input is typed', async () => {
      render(
        html`<vi-masked-input mask="00/00/0000"></vi-masked-input>`,
        container,
      );
      const host = document.querySelector('vi-masked-input') as ViMaskedInput;
      await host.updateComplete;

      const input = await (
        await $('vi-masked-input')
      ).shadow$('.input-control');
      await input.click();

      // Simulate sequential typing to check mask progression
      await browser.keys(['1']);
      expect(await input.getValue()).toBe('1');
      await browser.keys(['2']);
      expect(await input.getValue()).toBe('12');
      await browser.keys(['2']);
      expect(await input.getValue()).toBe('12/2');
      await browser.keys(['5']);
      expect(await input.getValue()).toBe('12/25');
      await browser.keys(['2', '0', '2', '4']);
      expect(await input.getValue()).toBe('12/25/2024');
    });
  });

  describe('Clipboard Operations', () => {
    it('should handle cut operation and reset masking state', async () => {
      render(
        html`<vi-masked-input
          mask="(000) 000-0000"
          value="(123) 456-7890"
        ></vi-masked-input>`,
        container,
      );
      const host = document.querySelector('vi-masked-input') as ViMaskedInput;
      await host.updateComplete;

      const input = await (
        await $('vi-masked-input')
      ).shadow$('.input-control');
      await input.click();

      // Using browser.execute to simulate a destructive edit/cut across all drivers reliably
      await browser.execute(() => {
        const el = document.querySelector('vi-masked-input');
        const inputEl = el?.shadowRoot?.querySelector(
          '.input-control',
        ) as HTMLInputElement;
        if (inputEl) {
          inputEl.value = '';
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      const value = await input.getValue();
      expect(value).toBe('');
      expect(host.rawValue).toBe('');
    });

    it('should handle copy operation without altering masked value', async () => {
      render(
        html`<vi-masked-input
          mask="(000) 000-0000"
          value="(123) 456-7890"
        ></vi-masked-input>`,
        container,
      );
      const host = document.querySelector('vi-masked-input') as ViMaskedInput;
      await host.updateComplete;

      const input = await (
        await $('vi-masked-input')
      ).shadow$('.input-control');
      await input.click();

      const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';
      await browser.keys([modifier, 'a']);
      await browser.keys([modifier, 'c']);

      const value = await input.getValue();
      expect(value).toBe('(123) 456-7890');
    });

    it('should handle paste operation and properly mask the pasted content', async () => {
      render(
        html`<vi-masked-input mask="(000) 000-0000"></vi-masked-input>`,
        container,
      );
      const host = document.querySelector('vi-masked-input') as ViMaskedInput;
      await host.updateComplete;

      const input = await (
        await $('vi-masked-input')
      ).shadow$('.input-control');
      await input.click();

      // Since WebDriver clipboard can be flaky depending on browser security settings,
      // we'll explicitly dispatch a paste event to test component reaction.
      // For masked inputs, imask listens to 'input' and handles it
      await browser.execute(() => {
        const el = document.querySelector('vi-masked-input');
        const inputEl = el?.shadowRoot?.querySelector(
          '.input-control',
        ) as HTMLInputElement;
        if (inputEl) {
          // set raw unmasked string to test if component formats it
          inputEl.value = '9876543210';
          inputEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      const value = await input.getValue();
      expect(value).toBe('(987) 654-3210');
      expect(host.rawValue).toBe('9876543210');
    });
  });
});
