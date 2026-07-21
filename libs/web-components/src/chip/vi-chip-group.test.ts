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

    // Child should have role=option
    const chip = await $('vi-chip');
    const button = await chip.shadow$('button[role="option"]');
    await expect(button).toExist();
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

    await browser.execute((elem) => elem.shadowRoot.querySelector('button').click(), chips[0]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['1']);

    await browser.execute((elem) => elem.shadowRoot.querySelector('button').click(), chips[1]);
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

    await browser.execute((elem) => elem.shadowRoot.querySelector('button').click(), chips[0]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['1']);

    await browser.execute((elem) => elem.shadowRoot.querySelector('button').click(), chips[1]);
    expect(await browser.execute((g: ViChipGroup) => g.value, hostElement)).toEqual(['2']);
  });
});
