import { $, expect } from '@wdio/globals';
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
    await expect(listbox).toHaveAttribute('aria-disabled', 'false');

    // Child should have role=option
    const chip = await $('vi-chip');
    const button = await chip.shadow$('button[role="option"]');
    await expect(button).toExist();
  });

  it('reflects disabled state via aria-disabled on listbox container', async () => {
    render(html`
      <vi-chip-group disabled>
        <vi-chip value="1">One</vi-chip>
      </vi-chip-group>
    `, container);

    const group = await $('vi-chip-group');
    const listbox = await group.shadow$('div[role="listbox"]');
    await expect(listbox).toHaveAttribute('aria-disabled', 'true');
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

    await browser.execute((elem: any) => elem.shadowRoot.querySelector('button').click(), chips[0]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['1']);

    await browser.execute((elem: any) => elem.shadowRoot.querySelector('button').click(), chips[1]);
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

    await browser.execute((elem: any) => elem.shadowRoot.querySelector('button').click(), chips[0]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['1']);

    await browser.execute((elem: any) => elem.shadowRoot.querySelector('button').click(), chips[1]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['2']);
  });

  it('syncs selection when chip.value is updated programmatically', async () => {
    render(html`
      <vi-chip-group .value=${['new-val']}>
        <vi-chip value="old-val">One</vi-chip>
      </vi-chip-group>
    `, container);

    const chip = await $('vi-chip');

    // Initially old-val is not selected because group value is ['new-val']
    expect(await browser.execute((c: any) => c.selected, chip)).toBe(false);

    // Update chip.value programmatically to 'new-val'
    await browser.execute((c: any) => { c.value = 'new-val'; }, chip);

    // Wait for MutationObserver callback to trigger _syncChips()
    await browser.pause(50);

    // Chip should now be selected
    expect(await browser.execute((c: any) => c.selected, chip)).toBe(true);
  });

  it('clears selection when an already selected chip is clicked in single select mode', async () => {
    render(html`
      <vi-chip-group .multi=${false} .value=${['1']}>
        <vi-chip value="1">One</vi-chip>
      </vi-chip-group>
    `, container);

    const group = await $('vi-chip-group');
    const hostElement = await group as unknown as ViChipGroup;
    const chips = await $$('vi-chip');

    // Click the already selected chip
    await browser.execute((elem: any) => elem.shadowRoot.querySelector('button').click(), chips[0]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual([]);
  });

  it('disconnects MutationObserver on disconnectedCallback without throwing', async () => {
    render(html`
      <vi-chip-group id="test-disconnect">
        <vi-chip value="1">One</vi-chip>
      </vi-chip-group>
    `, container);
    const group = await $('#test-disconnect');
    await browser.execute((g: any) => g.remove(), group);
  });

  it('handles keyboard navigation (ArrowRight, ArrowLeft, Home, End) correctly', async () => {
    render(html`
      <vi-chip-group id="test-keyboard">
        <vi-chip value="1">One</vi-chip>
        <vi-chip value="2">Two</vi-chip>
        <vi-chip value="3" disabled>Three</vi-chip>
        <vi-chip value="4">Four</vi-chip>
      </vi-chip-group>
    `, container);

    const group = await $('#test-keyboard');
    const hostElement = await group as unknown as ViChipGroup;

    const keydownResult = await browser.execute(async (g: ViChipGroup) => {
      const chips = Array.from(g.querySelectorAll('vi-chip'));
      const results: string[] = [];
      
      chips[0].focus();

      const listbox = g.shadowRoot!.querySelector('[role="listbox"]') as HTMLElement;
      const simulateKey = (key: string) => {
        listbox.dispatchEvent(new KeyboardEvent('keydown', { key }));
      };

      simulateKey('ArrowRight');
      results.push(document.activeElement?.getAttribute('value') || '');

      simulateKey('ArrowDown');
      results.push(document.activeElement?.getAttribute('value') || '');

      simulateKey('ArrowRight');
      results.push(document.activeElement?.getAttribute('value') || '');

      simulateKey('ArrowLeft');
      results.push(document.activeElement?.getAttribute('value') || '');

      simulateKey('Home');
      results.push(document.activeElement?.getAttribute('value') || '');

      simulateKey('End');
      results.push(document.activeElement?.getAttribute('value') || '');
      
      simulateKey('Enter');
      results.push(document.activeElement?.getAttribute('value') || '');

      return results;
    }, hostElement);

    expect(keydownResult).toEqual(['2', '4', '1', '4', '1', '4', '4']);
  });

  describe('Missing Branch Coverage', () => {
    it('handles form reset, state restore, and keydown default', async () => {
      render(html`<form><vi-chip-group name="cg" value='["1"]'><vi-chip value="1">1</vi-chip></vi-chip-group></form>`, container);
      const form = document.querySelector('form')!;
      const group = document.querySelector('vi-chip-group') as any;
      await group.updateComplete;

      group.value = ['2'];
      form.reset();
      expect(group.value).toEqual(['1']); 

      group.formStateRestoreCallback('3', 'restore');
      expect(group.value).toEqual(['3']);

      const result = await browser.execute((g: any) => {
        const listbox = g.shadowRoot!.querySelector('[role="listbox"]') as HTMLElement;
        const e = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
        listbox.dispatchEvent(e);
        return e.defaultPrevented;
      }, await $('vi-chip-group'));
      expect(result).toBe(false);
    });

    it('handles selectAll, clearAll, and multi deselect', async () => {
      render(html`
        <vi-chip-group multi>
          <vi-chip value="1">1</vi-chip>
          <vi-chip value="2">2</vi-chip>
        </vi-chip-group>
      `, container);
      const group = document.querySelector('vi-chip-group') as any;
      await group.updateComplete;

      group.selectAll();
      expect(group.value).toEqual(['1', '2']);

      group.clearAll();
      expect(group.value).toEqual([]);

      // Test multi deselect (line 176)
      group.value = ['1', '2'];
      await group.updateComplete;
      
      const chip1 = document.querySelector('vi-chip[value="1"]') as any;
      chip1.shadowRoot!.querySelector('button')!.click();
      await group.updateComplete;
      
      expect(group.value).toEqual(['2']);
    });

    it('handles validity checking', async () => {
      render(html`
        <vi-chip-group required multi></vi-chip-group>
      `, container);
      const group = document.querySelector('vi-chip-group') as any;
      await group.updateComplete;

      const isValid = group.checkValidity();
      expect(isValid).toBe(false);
      expect(group.validationMessage).not.toBe('');
    });
  });
});
