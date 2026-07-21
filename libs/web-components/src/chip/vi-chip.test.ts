import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-chip.js';

describe('vi-chip', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders standard chip structure', async () => {
    render(html`<vi-chip value="test">Test Chip</vi-chip>`, container);
    const chip = await $('vi-chip');
    await expect(chip).toExist();

    const element = await chip.shadow$('[part="chip"]');
    await expect(element).toExist();
    expect(await element.getAttribute('role')).toBe('button');
  });

  it('renders check icon when selected', async () => {
    render(html`<vi-chip selected>Selected</vi-chip>`, container);
    const chip = await $('vi-chip');
    const check = await chip.shadow$('vi-icon[part="check-icon"]');
    await expect(check).toExist();
  });

  it('renders remove button when removable', async () => {
    render(html`<vi-chip removable remove-aria-label="Remove">Removable</vi-chip>`, container);
    const chip = await $('vi-chip');
    const removeBtn = await chip.shadow$('vi-button[part="remove-btn"]');
    await expect(removeBtn).toExist();
    expect(await removeBtn.getAttribute('aria-label')).toBe('Remove');
  });

  it('emits vialiq-select when clicked', async () => {
    let selectFired = false;
    let selectDetail: any = null;

    const onSelect = (e: any) => {
      selectFired = true;
      selectDetail = e.detail;
    };

    render(html`<vi-chip value="val1" @vialiq-select=${onSelect}>Click me</vi-chip>`, container);
    const chip = await $('vi-chip');

    // Trigger keyboard/mouse events on host itself as wdio shadow click can be flaky
    await browser.execute((elem: any) => {
        (elem.shadowRoot!.querySelector('[part="chip"]') as HTMLElement)!.click();
    }, await chip);

    expect(selectFired).toBe(true);
    expect(selectDetail.value).toBe('val1');
    expect(selectDetail.selected).toBe(true);
  });

  it('emits vialiq-remove when remove button is clicked', async () => {
    let removeFired = false;

    const onRemove = () => {
      removeFired = true;
    };

    render(html`<vi-chip value="val1" removable @vialiq-remove=${onRemove}>Remove me</vi-chip>`, container);
    const chip = await $('vi-chip');

    // Trigger keyboard event on the host as defined
    await browser.execute((elem: any) => {
        (elem.shadowRoot!.querySelector('vi-button[part="remove-btn"]') as HTMLElement).click();
    }, await chip);

    expect(removeFired).toBe(true);
  });
});
