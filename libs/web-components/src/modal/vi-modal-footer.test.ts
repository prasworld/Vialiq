import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-modal-footer.js';
import { ViModalFooter } from './vi-modal-footer.js';

describe('vi-modal-footer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  });

  const getFooter = () => container.querySelector('vi-modal-footer') as ViModalFooter;

  it('renders correctly', async () => {
    render(html`<vi-modal-footer>Footer Content</vi-modal-footer>`, container);
    const el = getFooter();
    await el.updateComplete;

    expect(el).toBeTruthy();
    const slot = el.shadowRoot!.querySelector('slot');
    expect(slot).toBeTruthy();
  });
});
