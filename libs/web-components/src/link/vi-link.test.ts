import { expect } from '@wdio/globals';
import { render, html } from 'lit';
import { ViLink } from './vi-link';
import '../icons/vi-icon'; // Ensure icon is imported if testing external

describe('vi-link', () => {
  beforeEach(() => {
    render(html``, document.body); // cleanup
  });

  it('renders with default properties', async () => {
    render(html`<vi-link>Link</vi-link>`, document.body);
    const link = document.body.querySelector('vi-link') as ViLink;
    await link.updateComplete;
    const anchor = link.shadowRoot!.querySelector('a')!;

    expect(anchor).toExist();
    expect(anchor.getAttribute('href')).toBeNull();
  });

  it('sets correct properties on the anchor element', async () => {
    render(html`<vi-link href="https://example.com" target="_blank" download="file.pdf">Link</vi-link>`, document.body);
    const link = document.body.querySelector('vi-link') as ViLink;
    await link.updateComplete;
    const anchor = link.shadowRoot!.querySelector('a')!;

    expect(anchor.getAttribute('href')).toEqual('https://example.com');
    expect(anchor.getAttribute('target')).toEqual('_blank');
    expect(anchor.getAttribute('download')).toEqual('file.pdf');
  });

  it('handles external links correctly', async () => {
    render(html`<vi-link href="https://example.com" external>Link</vi-link>`, document.body);
    const link = document.body.querySelector('vi-link') as ViLink;
    await link.updateComplete;
    const anchor = link.shadowRoot!.querySelector('a')!;

    expect(anchor.getAttribute('target')).toEqual('_blank');
    expect(anchor.getAttribute('rel')).toContain('noopener');
    expect(anchor.getAttribute('rel')).toContain('noreferrer');
    expect(anchor.getAttribute('aria-label')).toContain('opens in new tab');
  });

  it('removes href and sets aria-disabled when disabled', async () => {
    render(html`<vi-link href="https://example.com" disabled>Link</vi-link>`, document.body);
    const link = document.body.querySelector('vi-link') as ViLink;
    await link.updateComplete;
    const anchor = link.shadowRoot!.querySelector('a')!;

    expect(anchor.getAttribute('href')).toBeNull();
    expect(anchor.getAttribute('aria-disabled')).toEqual('true');
  });
});
