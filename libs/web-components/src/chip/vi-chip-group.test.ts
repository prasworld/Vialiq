import { $, $$, expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-chip-group.js';
import './vi-chip.js';
import type { ViChipGroup } from './vi-chip-group.js';

describe('vi-chip-group', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders structure with correct roles', async () => {
    render(html`
      <vi-chip-group>
        <vi-chip value="1">One</vi-chip>
      </vi-chip-group>
    `, container);

    const group = await $('vi-chip-group');
    const listbox = await group.shadow$('div[role="listbox"]');
    await expect(listbox).toExist();

    // Child should have role=option
    const chip = await $('vi-chip');
    const option = await chip.shadow$('[role="option"]');
    await expect(option).toExist();
  });

  it('updates value in multi select mode', async () => {
    render(html`
      <vi-chip-group multi>
        <vi-chip value="1">One</vi-chip>
        <vi-chip value="2">Two</vi-chip>
      </vi-chip-group>
    `, container);

    const group = await $('vi-chip-group');
    const hostElement = await group as unknown as ViChipGroup;
    const chips = await $$('vi-chip');

    await browser.execute((elem: any) => (elem.shadowRoot!.querySelector('[part="chip"]') as HTMLElement)!.click(), chips[0]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['1']);

    await browser.execute((elem: any) => (elem.shadowRoot!.querySelector('[part="chip"]') as HTMLElement)!.click(), chips[1]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['1', '2']);
  });

  it('updates value in single select mode', async () => {
    render(html`
      <vi-chip-group .multi=${false}>
        <vi-chip value="1">One</vi-chip>
        <vi-chip value="2">Two</vi-chip>
      </vi-chip-group>
    `, container);

    const group = await $('vi-chip-group');
    const hostElement = await group as unknown as ViChipGroup;
    const chips = await $$('vi-chip');

    await browser.execute((elem: any) => (elem.shadowRoot!.querySelector('[part="chip"]') as HTMLElement)!.click(), chips[0]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['1']);

    await browser.execute((elem: any) => (elem.shadowRoot!.querySelector('[part="chip"]') as HTMLElement)!.click(), chips[1]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['2']);
  });

  it('correctly restores chip disabled state when group disabled is toggled on and off', async () => {
    render(html`
      <vi-chip-group>
        <vi-chip value="1">Enabled</vi-chip>
        <vi-chip value="2" disabled>Disabled</vi-chip>
      </vi-chip-group>
    `, container);

    const group = await $('vi-chip-group');
    const hostElement = await group as unknown as ViChipGroup;
    const chips = await $$('vi-chip');

    // Initially chip 1 enabled, chip 2 disabled
    expect(await browser.execute((c: any) => c.disabled, chips[0])).toBe(false);
    expect(await browser.execute((c: any) => c.disabled, chips[1])).toBe(true);

    // Disable group
    await browser.execute((g: any) => { g.disabled = true; }, await group);

    expect(await browser.execute((c: any) => c.disabled, chips[0])).toBe(true);
    expect(await browser.execute((c: any) => c.disabled, chips[1])).toBe(true);

    // Re-enable group
    await browser.execute((g: any) => { g.disabled = false; }, await group);

    expect(await browser.execute((c: any) => c.disabled, chips[0])).toBe(false);
    expect(await browser.execute((c: any) => c.disabled, chips[1])).toBe(true);
  });

  describe('Keyboard & Roving Tabindex Navigation', () => {
    it('sets roving tabindex correctly (0 on active/first enabled chip, -1 on others)', async () => {
      render(html`
        <vi-chip-group>
          <vi-chip value="1">One</vi-chip>
          <vi-chip value="2">Two</vi-chip>
          <vi-chip value="3">Three</vi-chip>
        </vi-chip-group>
      `, container);

      const chips = await $$('vi-chip');
      expect(await browser.execute((c: any) => c.tabIndex, chips[0])).toBe(0);
      expect(await browser.execute((c: any) => c.tabIndex, chips[1])).toBe(-1);
      expect(await browser.execute((c: any) => c.tabIndex, chips[2])).toBe(-1);
    });

    it('navigates through chips with ArrowRight and ArrowLeft keys', async () => {
      render(html`
        <vi-chip-group>
          <vi-chip value="1">One</vi-chip>
          <vi-chip value="2">Two</vi-chip>
          <vi-chip value="3">Three</vi-chip>
        </vi-chip-group>
      `, container);

      const group = await $('vi-chip-group');
      const chips = await $$('vi-chip');

      // Focus first chip
      await browser.execute((c: any) => c.focus(), chips[0]);

      // Press ArrowRight
      await browser.execute((g: any) => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true });
        g.shadowRoot.querySelector('div[role="listbox"]').dispatchEvent(event);
      }, await group);

      expect(await browser.execute((c: any) => c.tabIndex, chips[1])).toBe(0);
      expect(await browser.execute((c: any) => c.tabIndex, chips[0])).toBe(-1);

      // Press ArrowLeft
      await browser.execute((g: any) => {
        const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, composed: true });
        g.shadowRoot.querySelector('div[role="listbox"]').dispatchEvent(event);
      }, await group);

      expect(await browser.execute((c: any) => c.tabIndex, chips[0])).toBe(0);
    });

    it('supports Home and End key navigation', async () => {
      render(html`
        <vi-chip-group>
          <vi-chip value="1">One</vi-chip>
          <vi-chip value="2">Two</vi-chip>
          <vi-chip value="3">Three</vi-chip>
        </vi-chip-group>
      `, container);

      const group = await $('vi-chip-group');
      const chips = await $$('vi-chip');

      // Focus first chip
      await browser.execute((c: any) => c.focus(), chips[0]);

      // Press End
      await browser.execute((g: any) => {
        const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true });
        g.shadowRoot.querySelector('div[role="listbox"]').dispatchEvent(event);
      }, await group);

      expect(await browser.execute((c: any) => c.tabIndex, chips[2])).toBe(0);

      // Press Home
      await browser.execute((g: any) => {
        const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true });
        g.shadowRoot.querySelector('div[role="listbox"]').dispatchEvent(event);
      }, await group);

      expect(await browser.execute((c: any) => c.tabIndex, chips[0])).toBe(0);
    });
  });

  describe('Form Association & ElementInternals', () => {
    it('synchronizes selection with form data submission', async () => {
      render(html`
        <form id="test-form">
          <vi-chip-group name="categories" multi .value=${['dev', 'design']}>
            <vi-chip value="dev">Dev</vi-chip>
            <vi-chip value="design">Design</vi-chip>
          </vi-chip-group>
        </form>
      `, container);

      const formDataEntries = await browser.execute(() => {
        const form = document.querySelector('#test-form') as HTMLFormElement;
        const data = new FormData(form);
        return data.getAll('categories');
      });

      expect(formDataEntries).toEqual(['dev', 'design']);
    });

    it('updates form data when name changes dynamically', async () => {
      render(html`
        <form id="test-form">
          <vi-chip-group id="cg" name="oldName" multi .value=${['v1']}>
            <vi-chip value="v1">V1</vi-chip>
          </vi-chip-group>
        </form>
      `, container);

      const group = await $('vi-chip-group');
      await browser.execute((g: any) => { g.name = 'newName'; }, await group);

      const formDataEntries = await browser.execute(() => {
        const form = document.querySelector('#test-form') as HTMLFormElement;
        const data = new FormData(form);
        return {
          oldEntries: data.getAll('oldName'),
          newEntries: data.getAll('newName'),
        };
      });

      expect(formDataEntries.oldEntries).toEqual([]);
      expect(formDataEntries.newEntries).toEqual(['v1']);
    });

    it('does not submit values when name is empty', async () => {
      render(html`
        <form id="test-form">
          <vi-chip-group name="" multi .value=${['v1']}>
            <vi-chip value="v1">V1</vi-chip>
          </vi-chip-group>
        </form>
      `, container);

      const keys = await browser.execute(() => {
        const form = document.querySelector('#test-form') as HTMLFormElement;
        const data = new FormData(form);
        return Array.from(data.keys());
      });

      expect(keys).toEqual([]);
    });

    it('resets selection on form reset', async () => {
      render(html`
        <form id="test-form">
          <vi-chip-group id="cg" name="tags" multi .value=${['v1']}>
            <vi-chip value="v1">V1</vi-chip>
            <vi-chip value="v2">V2</vi-chip>
          </vi-chip-group>
        </form>
      `, container);

      const group = await $('vi-chip-group');
      const hostElement = await group as unknown as ViChipGroup;

      // Mutate value
      await browser.execute((g: any) => { g.value = ['v1', 'v2']; }, await group);
      expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['v1', 'v2']);

      // Reset form
      await browser.execute(() => {
        const form = document.querySelector('#test-form') as HTMLFormElement;
        form.reset();
      });

      expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual([]);
    });
  });

  describe('Constraint Validation (ValidityMixin)', () => {
    it('evaluates valueMissing when required and no chips are selected', async () => {
      render(html`
        <vi-chip-group required>
          <vi-chip value="1">One</vi-chip>
          <vi-chip value="2">Two</vi-chip>
        </vi-chip-group>
      `, container);

      const group = await $('vi-chip-group');
      const hostElement = await group as unknown as ViChipGroup;

      const isValid = await browser.execute((g: ViChipGroup) => g.reportValidity(), hostElement);
      expect(isValid).toBe(false);

      const validity = await browser.execute((g: ViChipGroup) => ({
        valueMissing: g.validity.valueMissing,
        status: g.status,
      }), hostElement);

      expect(validity.valueMissing).toBe(true);
      expect(validity.status).toBe('invalid');
    });

    it('clears valueMissing when a chip is selected', async () => {
      render(html`
        <vi-chip-group required>
          <vi-chip value="1">One</vi-chip>
          <vi-chip value="2">Two</vi-chip>
        </vi-chip-group>
      `, container);

      const group = await $('vi-chip-group');
      const hostElement = await group as unknown as ViChipGroup;
      const chips = await $$('vi-chip');

      // First mark as invalid
      await browser.execute((g: ViChipGroup) => g.reportValidity(), hostElement);

      // Click chip to select
      await browser.execute((elem: any) => (elem.shadowRoot!.querySelector('[part="chip"]') as HTMLElement)!.click(), chips[0]);

      const isValid = await browser.execute((g: ViChipGroup) => g.reportValidity(), hostElement);
      expect(isValid).toBe(true);

      const validity = await browser.execute((g: ViChipGroup) => ({
        valueMissing: g.validity.valueMissing,
        status: g.status,
      }), hostElement);

      expect(validity.valueMissing).toBe(false);
      expect(validity.status).toBe('default');
    });
  });

  describe('Programmatic Methods (selectAll / clearAll)', () => {
    it('selects all chips with selectAll() in multi mode', async () => {
      render(html`
        <vi-chip-group multi>
          <vi-chip value="1">One</vi-chip>
          <vi-chip value="2">Two</vi-chip>
        </vi-chip-group>
      `, container);

      const group = await $('vi-chip-group');
      const hostElement = await group as unknown as ViChipGroup;

      await browser.execute((g: ViChipGroup) => g.selectAll(), hostElement);
      expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['1', '2']);
    });

    it('clears all selected chips with clearAll()', async () => {
      render(html`
        <vi-chip-group multi .value=${['1', '2']}>
          <vi-chip value="1">One</vi-chip>
          <vi-chip value="2">Two</vi-chip>
        </vi-chip-group>
      `, container);

      const group = await $('vi-chip-group');
      const hostElement = await group as unknown as ViChipGroup;

      await browser.execute((g: ViChipGroup) => g.clearAll(), hostElement);
      expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual([]);
    });
  });
});
