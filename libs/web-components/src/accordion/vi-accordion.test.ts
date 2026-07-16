import { html, render } from 'lit';
import axe from 'axe-core';
import type { ViAccordion } from './vi-accordion.js';
import type { ViAccordionItem } from './vi-accordion-item.js';
import './index.js';

describe('vi-accordion & vi-accordion-item', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Rendering and DOM structure', () => {
    it('should render accordion items and their accessibility markup correctly', async () => {
      render(
        html`
          <vi-accordion>
            <vi-accordion-item item-id="item-1" label="Section 1">
              <p>Content 1</p>
            </vi-accordion-item>
            <vi-accordion-item item-id="item-2" label="Section 2" open>
              <p>Content 2</p>
            </vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const items = Array.from(document.querySelectorAll('vi-accordion-item'));
      await accordion.updateComplete;
      await Promise.all(items.map(item => item.updateComplete));

      expect(accordion).toBeTruthy();
      expect(items).toHaveLength(2);

      const firstItem = items[0] as ViAccordionItem;
      const secondItem = items[1] as ViAccordionItem;

      // Verify open attributes
      expect(firstItem.open).toBe(false);
      expect(secondItem.open).toBe(true);

      // Verify shadow DOM header native buttons
      const button1 = firstItem.shadowRoot?.querySelector('button');
      const button2 = secondItem.shadowRoot?.querySelector('button');
      expect(button1).toBeTruthy();
      expect(button2).toBeTruthy();

      expect(button1?.getAttribute('aria-expanded')).toBe('false');
      expect(button2?.getAttribute('aria-expanded')).toBe('true');

      expect(button1?.getAttribute('aria-controls')).toBe('panel-item-1');
      expect(button2?.getAttribute('aria-controls')).toBe('panel-item-2');

      // Verify role="region" on collapsible panels
      const panel1 = firstItem.shadowRoot?.querySelector('.accordion-panel');
      const panel2 = secondItem.shadowRoot?.querySelector('.accordion-panel');
      expect(panel1?.getAttribute('role')).toBe('region');
      expect(panel2?.getAttribute('role')).toBe('region');
      expect(panel1?.getAttribute('aria-labelledby')).toBe('header-item-1');
      expect(panel2?.getAttribute('aria-labelledby')).toBe('header-item-2');
    });
  });

  describe('Property propagation', () => {
    it('should propagate size and variant from parent to children', async () => {
      render(
        html`
          <vi-accordion variant="card" size="lg">
            <vi-accordion-item label="Item"></vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const item = document.querySelector('vi-accordion-item') as ViAccordionItem;
      await accordion.updateComplete;
      await item.updateComplete;

      // Check initial propagation
      expect(item.size).toBe('lg');
      expect(item.variant).toBe('card');

      // Check update propagation
      accordion.size = 'sm';
      accordion.variant = 'flush';
      await accordion.updateComplete;
      await item.updateComplete;

      expect(item.size).toBe('sm');
      expect(item.variant).toBe('flush');
    });
  });

  describe('Multi-Open vs Single-Open Behaviour', () => {
    it('should only allow one open item when multi is false', async () => {
      render(
        html`
          <vi-accordion>
            <vi-accordion-item item-id="item-1" label="Section 1" open></vi-accordion-item>
            <vi-accordion-item item-id="item-2" label="Section 2"></vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const items = Array.from(document.querySelectorAll('vi-accordion-item')) as ViAccordionItem[];
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      expect(items[0].open).toBe(true);
      expect(items[1].open).toBe(false);

      // Open second item
      items[1].shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      // First item is collapsed, second item is open
      expect(items[0].open).toBe(false);
      expect(items[1].open).toBe(true);
    });

    it('should allow multiple open items when multi is true', async () => {
      render(
        html`
          <vi-accordion multi>
            <vi-accordion-item item-id="item-1" label="Section 1" open></vi-accordion-item>
            <vi-accordion-item item-id="item-2" label="Section 2"></vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const items = Array.from(document.querySelectorAll('vi-accordion-item')) as ViAccordionItem[];
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      expect(items[0].open).toBe(true);
      expect(items[1].open).toBe(false);

      // Open second item
      items[1].shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      // Both items are open
      expect(items[0].open).toBe(true);
      expect(items[1].open).toBe(true);
    });
  });

  describe('Events', () => {
    it('should emit vialiq-accordion-open, vialiq-accordion-close, and vialiq-accordion-change events on toggling', async () => {
      render(
        html`
          <vi-accordion>
            <vi-accordion-item item-id="item-1" label="Section 1"></vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const item = document.querySelector('vi-accordion-item') as ViAccordionItem;
      await accordion.updateComplete;
      await item.updateComplete;

      let openEventFired = false;
      let closeEventFired = false;
      let changeEventDetail: any = null;

      item.addEventListener('vialiq-accordion-open', () => { openEventFired = true; });
      item.addEventListener('vialiq-accordion-close', () => { closeEventFired = true; });
      accordion.addEventListener('vialiq-accordion-change', (e: Event) => {
        changeEventDetail = (e as CustomEvent).detail;
      });

      // Expand
      item.shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;

      expect(openEventFired).toBe(true);
      expect(changeEventDetail).toEqual({ itemId: 'item-1', open: true });

      // Collapse
      item.shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;

      expect(closeEventFired).toBe(true);
      expect(changeEventDetail).toEqual({ itemId: 'item-1', open: false });
    });

    it('should support event cancellation in before-open and before-close', async () => {
      render(
        html`
          <vi-accordion>
            <vi-accordion-item item-id="item-1" label="Section 1"></vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const item = document.querySelector('vi-accordion-item') as ViAccordionItem;
      await accordion.updateComplete;
      await item.updateComplete;

      let preventOpen = true;
      let preventClose = false;

      item.addEventListener('vialiq-accordion-before-open', (e) => {
        if (preventOpen) e.preventDefault();
      });
      item.addEventListener('vialiq-accordion-before-close', (e) => {
        if (preventClose) e.preventDefault();
      });

      // Try open when preventOpen is true
      item.shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;
      await item.updateComplete;
      expect(item.open).toBe(false);

      // Open when preventOpen is false
      preventOpen = false;
      item.shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;
      await item.updateComplete;
      expect(item.open).toBe(true);

      // Try close when preventClose is true
      preventClose = true;
      item.shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;
      await item.updateComplete;
      expect(item.open).toBe(true); // Should remain open

      // Close when preventClose is false
      preventClose = false;
      item.shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;
      await item.updateComplete;
      expect(item.open).toBe(false);
    });

    it('should coordinate item closure prevention with opening of another item in single-open mode', async () => {
      render(
        html`
          <vi-accordion .multi=${false}>
            <vi-accordion-item item-id="item-1" label="Section 1" open></vi-accordion-item>
            <vi-accordion-item item-id="item-2" label="Section 2"></vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const items = Array.from(document.querySelectorAll('vi-accordion-item')) as ViAccordionItem[];
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      expect(items[0].open).toBe(true);
      expect(items[1].open).toBe(false);

      // Prevent item-1 from closing and assert it carries the trigger item ID
      items[0].addEventListener('vialiq-accordion-before-close', (e) => {
        const customEvent = e as CustomEvent;
        expect(customEvent.detail.itemId).toBe('item-2');
        e.preventDefault();
      });

      // Try opening item-2. This should fail because item-1 refuses to close!
      items[1].shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      expect(items[0].open).toBe(true);
      expect(items[1].open).toBe(false);
    });

    it('should coordinate item closure prevention with opening of another item in multi-open mode', async () => {
      render(
        html`
          <vi-accordion .multi=${true}>
            <vi-accordion-item item-id="item-1" label="Section 1" open></vi-accordion-item>
            <vi-accordion-item item-id="item-2" label="Section 2"></vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const items = Array.from(document.querySelectorAll('vi-accordion-item')) as ViAccordionItem[];
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      expect(items[0].open).toBe(true);
      expect(items[1].open).toBe(false);

      // Prevent item-1 from closing and assert it carries the trigger item ID
      items[0].addEventListener('vialiq-accordion-before-close', (e) => {
        const customEvent = e as CustomEvent;
        expect(customEvent.detail.itemId).toBe('item-2');
        e.preventDefault();
      });

      // Try opening item-2. This should fail because item-1 refuses to close!
      items[1].shadowRoot?.querySelector('button')?.click();
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      expect(items[0].open).toBe(true);
      expect(items[1].open).toBe(false);
    });
  });

  describe('Keyboard navigation (roving focus)', () => {
    it('should move focus with Arrow keys, Home, and End', async () => {
      render(
        html`
          <vi-accordion>
            <vi-accordion-item item-id="item-1" label="Section 1"></vi-accordion-item>
            <vi-accordion-item item-id="item-2" label="Section 2" disabled></vi-accordion-item>
            <vi-accordion-item item-id="item-3" label="Section 3"></vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const items = Array.from(document.querySelectorAll('vi-accordion-item')) as ViAccordionItem[];
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      const button1 = items[0].shadowRoot?.querySelector('button') as HTMLButtonElement;
      const button3 = items[2].shadowRoot?.querySelector('button') as HTMLButtonElement;

      // Focus first item
      button1.focus();
      expect(document.activeElement).toBe(items[0]);

      // Arrow down should skip disabled item-2 and focus item-3
      button1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      expect(items[2].shadowRoot?.activeElement).toBe(button3);

      // Arrow down on item-3 should wrap to item-1
      button3.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      expect(items[0].shadowRoot?.activeElement).toBe(button1);

      // Arrow up should wrap to item-3
      button1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, composed: true }));
      expect(items[2].shadowRoot?.activeElement).toBe(button3);

      // Home should focus item-1
      button3.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));
      expect(items[0].shadowRoot?.activeElement).toBe(button1);

      // End should focus item-3
      button1.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }));
      expect(items[2].shadowRoot?.activeElement).toBe(button3);
    });
  });

  describe('Accessibility (A11y)', () => {
    it('should pass axe accessibility audits', async () => {
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';

      render(
        html`
          <vi-accordion>
            <vi-accordion-item item-id="item-1" label="Medical History">
              <p>Prior cardiovascular conditions details here.</p>
            </vi-accordion-item>
            <vi-accordion-item item-id="item-2" label="Respiratory Status">
              <p>No prior respiratory diseases reported.</p>
            </vi-accordion-item>
          </vi-accordion>
        `,
        container
      );

      const accordion = document.querySelector('vi-accordion') as ViAccordion;
      const items = Array.from(document.querySelectorAll('vi-accordion-item')) as ViAccordionItem[];
      await accordion.updateComplete;
      await Promise.all(items.map(i => i.updateComplete));

      const results = await axe.run(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          'region': { enabled: false },
          'color-contrast': { enabled: false }
        }
      });
      expect(results.violations).toHaveLength(0);
    });
  });
});
