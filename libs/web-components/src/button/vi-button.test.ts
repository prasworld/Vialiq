import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-button.js'; // Ensure the Custom Element is registered
import type { ViButton } from './vi-button.js';

describe('vi-button', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Create a fresh container before each test
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up the DOM after each test to prevent side-effects
    container.remove();
  });

  it('should render the custom element and its shadow DOM', async () => {
    render(html`<vi-button>Click Me</vi-button>`, container);

    const host = await $('vi-button');
    await expect(host).toExist();

    const nativeButton = await host.shadow$('.button');
    await expect(nativeButton).toExist();
  });

  describe('Step 2: Properties and Lit Lifecycle', () => {
    it('should set default properties correctly', () => {
      render(html`<vi-button>Default</vi-button>`, container);
      const el = document.querySelector('vi-button') as ViButton;

      // Native browser assertion (no await needed for initial render state)
      expect(el.variant).toBe('primary');
      expect(el.disabled).toBe(false);
    });

    it('should reflect disabled state to the internal native button', async () => {
      render(html`<vi-button>Click Me</vi-button>`, container);
      const el = document.querySelector('vi-button') as ViButton;
      const nativeButton = await $('vi-button').shadow$('.button');

      await expect(nativeButton).toBeEnabled();

      // Programmatically change property
      el.disabled = true;
      await el.updateComplete; // CRITICAL: Wait for Lit to process the batch update

      await expect(nativeButton).toBeDisabled();
    });
  });

  describe('Step 3: Events and Slots', () => {
    it('should dispatch a click event when the native button is clicked', async () => {
      let clickCount = 0;
      // The browser-runner allows us to mix native event listeners with WDIO commands
      render(html`<vi-button @click=${() => (clickCount += 1)}>Click Me</vi-button>`, container);

      // Ensure Lit has finished rendering and binding event listeners
      const el = document.querySelector('vi-button') as ViButton;
      await el.updateComplete;

      const nativeButton = await $('vi-button').shadow$('.button');
      
      // Use native browser click to bypass WDIO's visual/animation safety checks
      await browser.execute((btn) => (btn as HTMLButtonElement).click(), nativeButton);

      expect(clickCount).toBe(1);
    });

    it('should NOT dispatch a click event when disabled', async () => {
      let clickCount = 0;
      render(html`<vi-button disabled @click=${() => (clickCount += 1)}>Click Me</vi-button>`, container);

      // A disabled <button> element does not fire click events.
      // We assert that our component correctly applies the native `disabled` attribute,
      // which enforces this browser behavior.
      const nativeButton = await $('vi-button').shadow$('.button');
      await expect(nativeButton).toBeDisabled();

      // Attempting a click should not increment the counter.
      // We use `browser.execute` to bypass WDIO's safety check that would throw an error.
      await browser.execute((btn) => (btn as HTMLButtonElement).click(), nativeButton);

      expect(clickCount).toBe(0);
    });

    it('should render default slotted content as the label', async () => {
      render(html`<vi-button>My Label</vi-button>`, container);

      const host = await $('vi-button');
      await expect(host).toHaveText('My Label');
    });
  });

  describe('Step 4: Attributes and Reflection', () => {
    it('should reflect string properties to attributes', async () => {
      render(html`<vi-button variant="danger" size="lg" icon-placement="end">Button</vi-button>`, container);
      
      const host = await $('vi-button');
      await expect(host).toHaveAttribute('variant', 'danger');
      await expect(host).toHaveAttribute('size', 'lg');
      await expect(host).toHaveAttribute('icon-placement', 'end');
    });

    it('should reflect boolean properties as attributes', async () => {
      render(html`<vi-button full-width icon-only>Button</vi-button>`, container);

      const host = await $('vi-button');
      await expect(host).toHaveAttribute('full-width');
      await expect(host).toHaveAttribute('icon-only');
    });

    it('should hide the icon slot when no icon is provided', async () => {
      render(html`<vi-button>No Icon</vi-button>`, container);
      
      const host = await $('vi-button');
      const iconSlot = await host.shadow$('.icon');
      await expect(iconSlot).toHaveAttribute('hidden');
    });

    it('should unhide the icon slot when an icon is assigned', async () => {
      render(html`<vi-button><span slot="icon">★</span>Label</vi-button>`, container);
      
      const host = await $('vi-button');
      const iconSlot = await host.shadow$('.icon');
      
      // slotchange is asynchronous natively, so we wait for Lit to process the DOM update
      await browser.waitUntil(async () => (await iconSlot.getAttribute('hidden')) === null);
    });
  });

  describe('Step 5: Accessibility, CSS Parts, and Internals', () => {
    it('should set type="button" and tabindex="-1" on the internal native button', async () => {
      render(html`<vi-button>Default</vi-button>`, container);
      const nativeButton = await $('vi-button').shadow$('.button');
      
      await expect(nativeButton).toHaveAttribute('type', 'button');
      await expect(nativeButton).toHaveAttribute('tabindex', '-1');
    });

    it('should expose the correct CSS parts for styling', async () => {
      render(html`<vi-button><span slot="icon">★</span>Label</vi-button>`, container);
      const host = await $('vi-button');
      
      const nativeButton = await host.shadow$('.button');
      await expect(nativeButton).toHaveAttribute('part', 'button');

      const labelSpan = await host.shadow$('.label');
      await expect(labelSpan).toHaveAttribute('part', 'label');

      const iconSlot = await host.shadow$('.icon');
      await expect(iconSlot).toHaveAttribute('part', 'icon');
    });

    it('should safely handle focus state transitions when disabled is toggled', async () => {
      render(html`<vi-button>Lifecycle Test</vi-button>`, container);
      const el = document.querySelector('vi-button') as ViButton;
      
      // The updated() lifecycle method has branches for disabling and re-enabling
      // We toggle them to ensure the FocusableMixin's _setHostFocusable executes correctly
      el.disabled = true;
      await el.updateComplete;
      
      el.disabled = false;
      await el.updateComplete;
      
      const nativeButton = await $('vi-button').shadow$('.button');
      await expect(nativeButton).toBeEnabled();
    });
  });

  describe('Step 6: Dynamic Property Updates and Advanced Interactions', () => {
    it('should reactively update attributes when properties change programmatically', async () => {
      render(html`<vi-button>Dynamic</vi-button>`, container);
      const el = document.querySelector('vi-button') as ViButton;
      const host = await $('vi-button');

      // Change properties programmatically
      el.variant = 'success';
      el.size = 'sm';
      el.iconPlacement = 'end';
      el.fullWidth = true;
      el.iconOnly = true;

      await el.updateComplete; // Wait for Lit to process the batch update

      await expect(host).toHaveAttribute('variant', 'success');
      await expect(host).toHaveAttribute('size', 'sm');
      await expect(host).toHaveAttribute('icon-placement', 'end');
      await expect(host).toHaveAttribute('full-width');
      await expect(host).toHaveAttribute('icon-only');
    });

    it('should re-hide the icon slot if the icon is dynamically removed', async () => {
      render(html`<vi-button><span id="test-icon" slot="icon">★</span>Label</vi-button>`, container);
      const iconSlot = await $('vi-button').shadow$('.icon');
      
      // Wait for initial unhide
      await browser.waitUntil(async () => (await iconSlot.getAttribute('hidden')) === null);

      // Dynamically remove the icon
      const iconElement = document.getElementById('test-icon');
      iconElement?.remove();

      // Wait for slotchange to catch the removal and hide the slot again
      // getAttribute('hidden') returns an empty string when the boolean attribute is present
      await browser.waitUntil(async () => (await iconSlot.getAttribute('hidden')) !== null);
    });

    it('should not submit a form when clicked since it defaults to type="button"', async () => {
      let submitted = false;
      const onSubmit = (e: Event) => {
        e.preventDefault();
        submitted = true;
      };

      render(html`
        <form @submit=${onSubmit}>
          <vi-button>Submit</vi-button>
        </form>
      `, container);

      const el = document.querySelector('vi-button') as ViButton;
      await el.updateComplete;

      const nativeButton = await $('vi-button').shadow$('.button');
      await browser.execute((btn) => (btn as HTMLButtonElement).click(), nativeButton);

      expect(submitted).toBe(false);
    });
  });

  describe('Step 7: Edge Cases and Advanced Scenarios', () => {
    it('should correctly handle focus and blur events', async () => {
      render(html`<vi-button>Focus Me</vi-button>`, container);
      const el = document.querySelector('vi-button') as ViButton;
      const nativeButton = await $('vi-button').shadow$('.button');
      const host = await $('vi-button');

      // Focus the host element
      el.focus();
      await el.updateComplete;
      await browser.pause(50); // Give browser a moment to process focus

      // In Shadow DOM, the document.activeElement is the host element
      await expect(host).toBeFocused();

      // Verify the internal button actually received the delegated focus
      const isInternalFocused = await browser.execute((hostEl) => {
        return (hostEl as HTMLElement).shadowRoot?.activeElement?.classList.contains('button');
      }, host);
      expect(isInternalFocused).toBe(true);

      // Blur the host element
      el.blur();
      await el.updateComplete;
      await browser.pause(50); // Give browser a moment to process blur

      // Expect the host to no longer be focused
      await expect(host).not.toBeFocused();
    });

    it('should apply aria-label to the host element for accessibility', async () => {
      render(html`<vi-button icon-only aria-label="Settings"></vi-button>`, container);
      const host = await $('vi-button');

      await expect(host).toHaveAttribute('aria-label', 'Settings');
    });

    it('should update displayed text when default slot content changes dynamically', async () => {
      const initialText = 'Initial Label';
      const updatedText = 'Updated Label';
      
      render(html`<vi-button>${initialText}</vi-button>`, container);
      const host = await $('vi-button');
      await expect(host).toHaveText(initialText);

      // Dynamically change the slotted content
      container.querySelector('vi-button')!.textContent = updatedText;
      const el = document.querySelector('vi-button') as ViButton;
      await el.updateComplete; // Wait for Lit to re-render

      await expect(host).toHaveText(updatedText);
    });

    it('should re-enable the button when the disabled attribute is removed', async () => {
      render(html`<vi-button disabled>Toggle Disabled</vi-button>`, container);
      const el = document.querySelector('vi-button') as ViButton;
      const nativeButton = await $('vi-button').shadow$('.button');

      await expect(nativeButton).toBeDisabled();

      el.removeAttribute('disabled');
      await el.updateComplete;

      await expect(nativeButton).toBeEnabled();
    });
  });

  describe('Step 8: Keyboard Interactions and Attribute Sync', () => {
    it('should trigger a click event when Enter or Space is pressed', async () => {
      let clickCount = 0;
      render(html`<vi-button @click=${() => (clickCount += 1)}>Key Test</vi-button>`, container);
      const el = document.querySelector('vi-button') as ViButton;
      await el.updateComplete;

      // Focus the host, which delegates to the native internal button
      el.focus();
      await el.updateComplete;
      await browser.pause(50);

      // WebdriverIO sends keys to the currently focused activeElement
      await browser.keys(['Enter']);
      expect(clickCount).toBe(1);

      await browser.keys(['Space']);
      expect(clickCount).toBe(2);
    });

    it('should sync standard DOM attribute mutations to Lit properties', async () => {
      render(html`<vi-button>Attr Sync</vi-button>`, container);
      const el = document.querySelector('vi-button') as ViButton;
      const nativeButton = await $('vi-button').shadow$('.button');
      
      // Consumer uses standard DOM API instead of JS property
      el.setAttribute('disabled', '');
      await el.updateComplete;
      
      // Verify Lit caught it and updated the internal DOM
      expect(el.disabled).toBe(true);
      await expect(nativeButton).toBeDisabled();
    });

    it('should handle multiple nodes in the icon slot without breaking', async () => {
      render(html`<vi-button><span slot="icon">1</span><span slot="icon">2</span>Label</vi-button>`, container);
      const host = await $('vi-button');
      const iconSlot = await host.shadow$('.icon');
      
      await browser.waitUntil(async () => (await iconSlot.getAttribute('hidden')) === null);
      await expect(iconSlot).not.toHaveAttribute('hidden');
    });
  });
});
