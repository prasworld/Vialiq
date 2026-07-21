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
});
