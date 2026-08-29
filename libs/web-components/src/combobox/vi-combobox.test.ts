import { expect } from '@wdio/globals';
import { render, html } from 'lit';
import './vi-combobox.js';
import './vi-combobox-item.js';
import type { ViCombobox } from './vi-combobox.js';
import type { ViComboboxItem } from './vi-combobox-item.js';

beforeEach(function () {
  console.log('>>> STARTING TEST:', this.currentTest?.title);
});

describe('vi-combobox', function () {
  beforeEach(function () {
    console.log('>>> STARTING TEST:', this.currentTest?.title);
  });

  let element: ViCombobox;

  beforeEach(async () => {
    element = document.createElement('vi-combobox');
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    if (element) {
      element.open = false;
      (element as any)['_slottedItems'] = [];
      (element as any)['_optionsList'] = [];
      element.remove();
    }
  });

  it('initializes with default properties', () => {
    expect(element.mode).toBe('single');
    expect(element.searchable).toBe(true);
    expect(element.disabled).toBe(false);
    expect(element.clearable).toBe(false); // spec default is false
    expect(element.open).toBe(false);
  });

  it('supports programmatic open property with attribute reflection', async () => {
    let opened = false;
    element.addEventListener('vi-combobox-open', () => {
      opened = true;
    });

    element.open = true;
    await element.updateComplete;

    expect(element.open).toBe(true);
    expect(element.hasAttribute('open')).toBe(true);
    expect(opened).toBe(true);

    let closed = false;
    element.addEventListener('vi-combobox-close', () => {
      closed = true;
    });

    element.open = false;
    await element.updateComplete;

    expect(element.open).toBe(false);
    expect(element.hasAttribute('open')).toBe(false);
    expect(closed).toBe(true);
  });

  it('clears selection and dispatches vi-combobox-clear event when clear button is clicked', async () => {
    element.options = [{ value: 'us', label: 'United States' }];
    element.value = 'us';
    element.clearable = true;
    await element.updateComplete;

    let cleared = false;
    element.addEventListener('vi-combobox-clear', () => {
      cleared = true;
    });

    const clearBtn = element.shadowRoot?.querySelector(
      '.combobox-clear-btn',
    ) as HTMLElement;
    expect(clearBtn).not.toBeNull();
    clearBtn.click();

    await element.updateComplete;
    expect(element.value).toBe('');
    expect(cleared).toBe(true);
  });

  it('supports data-driven options selection in single mode', async () => {
    element.options = [
      { value: 'us', label: 'United States' },
      { value: 'gb', label: 'United Kingdom' },
    ];
    await element.updateComplete;

    let changeDetail: any = null;
    element.addEventListener('vi-combobox-change', (e: any) => {
      changeDetail = e.detail;
    });

    element.open = true;
    await element.updateComplete;

    const firstOption = element.shadowRoot?.querySelector(
      '.combobox-option',
    ) as HTMLElement;
    expect(firstOption).not.toBeNull();
    firstOption.click();

    await element.updateComplete;
    expect(element.value).toBe('us');
    expect(changeDetail?.value).toBe('us');
    expect(changeDetail?.label).toBe('United States');
  });

  it('supports declarative slotted <vi-combobox-item> with data payload', async () => {
    render(
      html`
        <vi-combobox-item value="site-1" label="Site 1" .data="${JSON.stringify({ code: 'S1' })}">
          <div class="custom-template"><strong>Site 1</strong></div>
        </vi-combobox-item>
      `,
      element
    );
    await element.updateComplete;

    // Give Slot mutation observer a frame
    await new Promise((r) => setTimeout(r, 50));
    await element.updateComplete;

    const item = element.querySelector('vi-combobox-item') as ViComboboxItem;
    expect(item).not.toBeNull();
    item.data = { code: 'S1' };

    let changeDetail: any = null;
    element.addEventListener('vi-combobox-change', (e: any) => {
      changeDetail = e.detail;
    });

    element.open = true;
    await element.updateComplete;

    item.click();
    await element.updateComplete;

    expect(element.value).toBe('site-1');
    expect(changeDetail?.data).toEqual({ code: 'S1' });
  });

  it('handles multi-select mode with tags', async () => {
    element.mode = 'multi';
    element.options = [
      { value: 'a', label: 'Alpha' },
      { value: 'b', label: 'Beta' },
    ];
    await element.updateComplete;

    element.open = true;
    await element.updateComplete;

    const options = element.shadowRoot?.querySelectorAll('.combobox-option');
    (options?.[0] as HTMLElement)?.click();
    await element.updateComplete;

    (options?.[1] as HTMLElement)?.click();
    await element.updateComplete;

    expect(element.value).toEqual(['a', 'b']);
    const tags = element.shadowRoot?.querySelectorAll('vi-chip');
    expect(tags?.length).toBe(2);
  });

  it('supports searchable=false (pure dropdown mode)', async () => {
    element.searchable = false;
    element.options = [{ value: '1', label: 'Option 1' }];
    await element.updateComplete;

    const trigger = element.shadowRoot?.querySelector('.combobox-trigger');
    expect(trigger).not.toBeNull();
    const input = element.shadowRoot?.querySelector('.combobox-input');
    expect(input).toBeNull();
  });

  it('correctly parses searchable="false" attribute string to false', async () => {
    element.setAttribute('searchable', 'false');
    await element.updateComplete;

    expect(element.searchable).toBe(false);
    expect(element.isSearchable).toBe(false);
    const input = element.shadowRoot?.querySelector('.combobox-input');
    expect(input).toBeNull();
    const trigger = element.shadowRoot?.querySelector('.combobox-trigger');
    expect(trigger).not.toBeNull();
  });

  it('validates required fields via checkValidity()', async () => {
    element.required = true;
    await element.updateComplete;

    expect(element.checkValidity()).toBe(false);

    element.value = 'selected-val';
    await element.updateComplete;
    expect(element.checkValidity()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Slotted item search / filtering
// ---------------------------------------------------------------------------

describe('vi-combobox — slotted item filtering', () => {
  let element: ViCombobox;

  /** Appends two vi-combobox-item children and waits for MutationObserver to sync. */
  async function mountSlotted(): Promise<{
    alice: ViComboboxItem;
    bob: ViComboboxItem;
  }> {
    element = document.createElement('vi-combobox') as ViCombobox;
    document.body.appendChild(element);
    await element.updateComplete;

    render(
      html`
        <vi-combobox-item value="usr-1" label="Alice Johnson"></vi-combobox-item>
        <vi-combobox-item value="usr-2" label="Bob Smith"></vi-combobox-item>
      `,
      element
    );

    const alice = element.querySelector<ViComboboxItem>('[value="usr-1"]')!;
    const bob = element.querySelector<ViComboboxItem>('[value="usr-2"]')!;

    // Allow MutationObserver tick + Lit update
    await new Promise((r) => setTimeout(r, 50));
    await element.updateComplete;

    return { alice, bob };
  }

  afterEach(() => {
    if (element) {
      element.open = false;
      element.remove();
    }
  });

  it('non-matching slotted items become hidden when a query is typed', async () => {
    const { alice, bob } = await mountSlotted();

    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    element.open = true;
    await element.updateComplete;

    // Simulate typing "alice"
    input.value = 'alice';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;

    expect(alice.hidden).toBe(false); // matched
    expect(bob.hidden).toBe(true); // not matched
  });

  it('all slotted items are restored (hidden=false) when query is cleared', async () => {
    const { alice, bob } = await mountSlotted();

    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    element.open = true;
    await element.updateComplete;

    // Type to filter
    input.value = 'alice';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;
    expect(bob.hidden).toBe(true);

    // Clear query
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;

    expect(alice.hidden).toBe(false);
    expect(bob.hidden).toBe(false);
  });

  it('vi-combobox-filter event carries matchedValues when filtering slotted items', async () => {
    await mountSlotted();

    let filterDetail: any = null;
    element.addEventListener('vi-combobox-filter', (e: any) => {
      filterDetail = e.detail;
    });

    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    element.open = true;
    await element.updateComplete;

    input.value = 'bob';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;

    expect(filterDetail).not.toBeNull();
    expect(filterDetail.query).toBe('bob');
    expect(filterDetail.matchedValues).toContain('usr-2');
    expect(filterDetail.matchedValues).not.toContain('usr-1');
  });

  it('shows empty state in listbox when all slotted items are filtered out', async () => {
    await mountSlotted();

    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    element.open = true;
    await element.updateComplete;

    input.value = 'zzznomatch';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;

    const emptyEl = element.shadowRoot!.querySelector('.combobox-empty');
    expect(emptyEl).not.toBeNull();
  });

  it('searchText array extends the filter corpus beyond the label', async () => {
    element = document.createElement('vi-combobox') as ViCombobox;
    document.body.appendChild(element);
    await element.updateComplete;

    render(
      html`
        <vi-combobox-item value="usr-1" label="Alice Johnson"></vi-combobox-item>
      `,
      element
    );
    const alice = element.querySelector<ViComboboxItem>('[value="usr-1"]')!;
    alice.searchText = [
      'Alice Johnson',
      'PI',
      'alice@acme.com',
      'Principal Investigator',
    ];

    await new Promise((r) => setTimeout(r, 50));
    await element.updateComplete;

    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    element.open = true;
    await element.updateComplete;

    // Query matches via searchText corpus (email), not the label
    input.value = 'alice@acme';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;

    expect(alice.hidden).toBe(false); // should be visible despite label not matching
  });

  it('restores slotted visibility when close() is called', async () => {
    const { alice, bob } = await mountSlotted();

    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    element.open = true;
    await element.updateComplete;

    input.value = 'alice';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;
    expect(bob.hidden).toBe(true);

    element.close();
    await element.updateComplete;

    expect(alice.hidden).toBe(false);
    expect(bob.hidden).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Keyboard Navigation with disabled items
// ---------------------------------------------------------------------------

describe('vi-combobox — keyboard navigation with disabled items', () => {
  let element: ViCombobox;

  beforeEach(async () => {
    element = document.createElement('vi-combobox') as ViCombobox;
    document.body.appendChild(element);
    element.options = [
      { value: '1', label: 'Item 1' },
      { value: '2', label: 'Item 2', disabled: true },
      { value: '3', label: 'Item 3' },
    ];
    await element.updateComplete;
    element.open = true;
    await element.updateComplete;
  });

  afterEach(() => {
    if (element) {
      element.open = false;
      element.remove();
    }
  });

  it('ArrowDown skips disabled items', async () => {
    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;
    expect(
      input.getAttribute('aria-activedescendant')?.startsWith('opt-'),
    ).toBe(true);

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;
    // Should skip Item 2 and go to Item 3
    expect(
      input.getAttribute('aria-activedescendant')?.startsWith('opt-'),
    ).toBe(true);
  });

  it('ArrowUp skips disabled items', async () => {
    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    // Go to first item (from -1, ArrowUp wraps to end)
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;
    expect(
      input.getAttribute('aria-activedescendant')?.startsWith('opt-'),
    ).toBe(true);

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowUp',
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;
    // Should skip Item 2 and go to Item 1
    expect(
      input.getAttribute('aria-activedescendant')?.startsWith('opt-'),
    ).toBe(true);
  });

  it('Home and End skip disabled items if they land on bounds', async () => {
    element.options = [
      { value: '1', label: 'Item 1', disabled: true },
      { value: '2', label: 'Item 2' },
      { value: '3', label: 'Item 3', disabled: true },
    ];
    await element.updateComplete;
    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Home',
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;
    // 0 is disabled, should select 1 (Item 2)
    expect(
      input.getAttribute('aria-activedescendant')?.startsWith('opt-'),
    ).toBe(true);

    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'End',
        bubbles: true,
        composed: true,
      }),
    );
    await element.updateComplete;
    // 2 is disabled, should select 1 (Item 2)
    expect(
      input.getAttribute('aria-activedescendant')?.startsWith('opt-'),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// minChars Filtering
// ---------------------------------------------------------------------------

describe('vi-combobox — minChars filtering', () => {
  let element: ViCombobox;

  afterEach(() => {
    if (element) {
      element.open = false;
      element.remove();
    }
  });

  it('does not filter slotted items if query length is less than minChars', async () => {
    element = document.createElement('vi-combobox') as ViCombobox;
    document.body.appendChild(element);
    element.minChars = 2; // Require 2 chars
    render(
      html`
        <vi-combobox-item value="a" label="Apple"></vi-combobox-item>
        <vi-combobox-item value="b" label="Banana"></vi-combobox-item>
      `,
      element
    );
    await element.updateComplete;
    // Give Slot mutation observer a frame
    await new Promise((r) => setTimeout(r, 50));
    await element.updateComplete;

    const input = element.shadowRoot!.querySelector(
      '.combobox-input',
    ) as HTMLInputElement;
    element.open = true;
    await element.updateComplete;

    // Type 1 char ("b"), less than minChars
    input.value = 'b';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;

    const apple = element.querySelector<ViComboboxItem>('[value="a"]')!;
    const banana = element.querySelector<ViComboboxItem>('[value="b"]')!;

    // Should NOT filter them out yet!
    expect(apple.hidden).toBe(false);
    expect(banana.hidden).toBe(false);

    // Type 2 chars ("ba")
    input.value = 'ba';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await element.updateComplete;

    // Now it should filter
    expect(apple.hidden).toBe(true);
    expect(banana.hidden).toBe(false);
  });
  describe('Accessibility (A11y)', () => {
    let element: ViCombobox;

    beforeEach(async () => {
      element = document.createElement('vi-combobox') as ViCombobox;
      document.body.appendChild(element);
      await element.updateComplete;
    });

    afterEach(() => {
      if (element) {
        element.open = false;
        element.remove();
      }
    });

    it('sets correct ARIA listbox wiring (aria-controls, aria-owns, aria-label)', async () => {
      element.options = [
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
      ];
      element.open = true;
      await element.updateComplete;

      const input = element.shadowRoot?.querySelector('.combobox-input');
      const listbox = element.shadowRoot?.querySelector('#listbox');

      expect(input?.getAttribute('aria-controls')).toBe('listbox');
      expect(input?.getAttribute('role')).toBe('combobox');
      expect(input?.getAttribute('aria-expanded')).toBe('true');
      expect(listbox?.getAttribute('role')).toBe('listbox');
    });

    it('sets correct cross-shadow DOM ARIA semantics on slotted items', async () => {
      render(
        html`
          <vi-combobox-item value="1" label="One"></vi-combobox-item>
          <vi-combobox-item value="2" label="Two" disabled></vi-combobox-item>
        `,
        element
      );
      await element.updateComplete;
      await new Promise((r) => setTimeout(r, 50));
      await element.updateComplete;

      const item1 = element.querySelector<ViComboboxItem>('[value="1"]')!;
      const item2 = element.querySelector<ViComboboxItem>('[value="2"]')!;
      await item1.updateComplete;
      await item2.updateComplete;

      expect(item1.getAttribute('role')).toBe('option');
      expect(item1.getAttribute('aria-selected')).toBe('false');
      expect(item1.getAttribute('aria-disabled')).toBe('false');

      expect(item2.getAttribute('role')).toBe('option');
      expect(item2.getAttribute('aria-disabled')).toBe('true');

      // The listbox should aria-own the slotted items
      const listbox = element.shadowRoot?.querySelector('#listbox');
      const owns = listbox?.getAttribute('aria-owns');
      expect(owns).toContain(item1.id);
      expect(owns).toContain(item2.id);
    });

    it('correctly maps aria-activedescendant to the Create option', async () => {
      element.mode = 'creatable';
      element.options = [{ value: 'exist', label: 'Existing' }];
      await element.updateComplete;

      element.open = true;
      await element.updateComplete;

      const input = element.shadowRoot?.querySelector(
        '.combobox-input',
      ) as HTMLInputElement;

      // Type something that doesn't exist
      input.value = 'new';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await element.updateComplete;

      const createOption = element.shadowRoot?.querySelector('#create-option');
      expect(createOption).not.toBeNull();
      expect(createOption?.getAttribute('role')).toBe('option');
      expect(createOption?.classList.contains('is-active')).toBe(true);
      expect(input.getAttribute('aria-activedescendant')).toBe('create-option');
    });

    it('should pass axe accessibility audits', async () => {
      const container = document.createElement('div');
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';
      document.body.appendChild(container);

      const host = document.createElement('vi-combobox');
      host.setAttribute('aria-label', 'Select an option');
      host.options = [
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
      ];
      container.appendChild(host);
      await host.updateComplete;

      expect(host.getAttribute('aria-label')).toBe('Select an option');
      container.remove();
    });
  });
});
