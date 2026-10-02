import { expect } from '@wdio/globals';
import { render, html } from 'lit';
import './vi-upload.js';
import type { ViUpload } from './vi-upload.js';

describe('vi-upload', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('renders default slot and icon', async () => {
    render(html`<vi-upload></vi-upload>`, container);
    const el = container.querySelector('vi-upload') as ViUpload;
    await el.updateComplete;

    const dropzone = el.shadowRoot!.querySelector('.dropzone');
    expect(dropzone).toBeTruthy();
    expect(dropzone!.textContent).toContain('Drag and drop files here');
  });

  it('accepts and renders selected files', async () => {
    render(html`<vi-upload></vi-upload>`, container);
    const el = container.querySelector('vi-upload') as ViUpload;
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    // Simulate file selection
    const mockFile = new File(['hello'], 'test.png', { type: 'image/png' });

    // We have to mock the files property since we can't easily construct a FileList
    Object.defineProperty(input, 'files', {
      value: [mockFile],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    await el.updateComplete;

    const fileList = el.shadowRoot!.querySelectorAll('.file-item');
    expect(fileList.length).toBe(1);
    expect(fileList[0].textContent).toContain('test.png');
  });

  it('enforces maxFiles constraint', async () => {
    render(html`<vi-upload multiple maxFiles="2"></vi-upload>`, container);
    const el = container.querySelector('vi-upload') as ViUpload;
    await el.updateComplete;

    let errorEventFired = 0;
    el.addEventListener('vi-upload-error', () => {
      errorEventFired++;
    });

    const input = el.shadowRoot!.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file1 = new File(['1'], '1.png', { type: 'image/png' });
    const file2 = new File(['2'], '2.png', { type: 'image/png' });
    const file3 = new File(['3'], '3.png', { type: 'image/png' });

    Object.defineProperty(input, 'files', {
      value: [file1, file2, file3],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    await el.updateComplete;

    // Should only add 2 files
    const fileList = el.shadowRoot!.querySelectorAll('.file-item');
    expect(fileList.length).toBe(2);
    // Should fire 1 error event for the 3rd file
    expect(errorEventFired).toBe(1);
  });

  it('enforces maxSize constraint', async () => {
    render(html`<vi-upload maxSize="10"></vi-upload>`, container);
    const el = container.querySelector('vi-upload') as ViUpload;
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    // File size is larger than 10 bytes
    const largeFile = new File(
      ['this is a very large string that exceeds ten bytes'],
      'big.txt',
      { type: 'text/plain' },
    );

    Object.defineProperty(input, 'files', {
      value: [largeFile],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    await el.updateComplete;

    const fileList = el.shadowRoot!.querySelector('.file-item') as HTMLElement;
    expect(fileList.classList.contains('error')).toBe(true);
    expect(fileList.textContent).toContain('File size exceeds limit');
  });

  it('respects hide-thumbnail property', async () => {
    render(html`<vi-upload hide-thumbnail></vi-upload>`, container);
    const el = container.querySelector('vi-upload') as ViUpload;
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const mockFile = new File(['hello'], 'test.png', { type: 'image/png' });

    Object.defineProperty(input, 'files', {
      value: [mockFile],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));

    await el.updateComplete;

    // Thumbnail div should not exist
    const thumbnail = el.shadowRoot!.querySelector('.file-thumbnail');
    expect(thumbnail).toBeNull();
  });

  it('inherits disabled state from parent fieldset', async () => {
    render(
      html`
        <fieldset id="test-fieldset" disabled>
          <vi-upload></vi-upload>
        </fieldset>
      `,
      container,
    );

    const fieldset = document.getElementById(
      'test-fieldset',
    ) as HTMLFieldSetElement;
    const el = container.querySelector('vi-upload') as ViUpload;
    await el.updateComplete;

    expect(el.disabled).toBe(true);
    const dropzone = el.shadowRoot!.querySelector('.dropzone') as HTMLElement;
    expect(dropzone.getAttribute('tabindex')).toBe('-1');
    expect(dropzone.getAttribute('aria-disabled')).toBe('true');

    fieldset.disabled = false;
    await el.updateComplete;

    expect(el.disabled).toBe(false);
    expect(dropzone.getAttribute('tabindex')).toBe('0');
    expect(dropzone.getAttribute('aria-disabled')).toBe('false');
  });
});
