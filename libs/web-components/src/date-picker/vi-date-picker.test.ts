import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-date-picker.js';
import './vi-date-picker-input.js';
import type { ViDatePicker } from './vi-date-picker.js';
import type { ViDatePickerInput } from './vi-date-picker-input.js';
import type { DatePickerChangeDetail } from './types.js';

describe('vi-date-picker', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    // Clean up any stray flatpickr calendars that might have been appended to body
    document.querySelectorAll('.flatpickr-calendar').forEach(el => el.remove());
  });

  const waitForUpdate = async (el: ViDatePicker) => {
    await el.updateComplete;
    // Flatpickr initialization is async (it loads locale, plugins, etc.)
    // We can yield to the event loop to give it a chance to finish.
    await new Promise(resolve => setTimeout(resolve, 50));
  };

  it('renders without errors and initializes flatpickr', async () => {
    render(html`
      <vi-date-picker>
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const el = container.querySelector('vi-date-picker') as ViDatePicker;
    await waitForUpdate(el);

    expect(el).toBeTruthy();
    expect(el.mode).toBe('date');
    
    // Flatpickr should have created a calendar element in the DOM (usually appended to body)
    const calendar = el.shadowRoot!.querySelector('.flatpickr-calendar') || document.querySelector('.flatpickr-calendar');
   
    expect(calendar).toBeTruthy();
  });

  it('syncs focus and opens calendar when trigger is clicked', async () => {
    render(html`
      <vi-date-picker>
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    const input = container.querySelector('vi-date-picker-input') as ViDatePickerInput;
    await waitForUpdate(picker);

    // Initial state
    expect(input.expanded).toBe(false);
    
    // Call openCalendar programmatically or simulate click
    picker.openCalendar();
    await picker.updateComplete;
    
    expect(input.expanded).toBe(true);
    const calendar = picker.shadowRoot!.querySelector('.flatpickr-calendar.open');
    expect(calendar).toBeTruthy();
  });

  it('updates form value and trigger display when a date is selected', async () => {
    render(html`
      <vi-date-picker>
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    const input = container.querySelector('vi-date-picker-input') as ViDatePickerInput;
    await waitForUpdate(picker);

    // Set value programmatically
    picker.value = '2025-06-15';
    await waitForUpdate(picker);

    expect(picker.value).toBe('2025-06-15');
    // The trigger should show the formatted date
    expect(input.value).toContain('15');
    expect(input.value).toContain('2025');
  });

  it('dispatches vi-date-picker-change event with DatePickerChangeDetail on selection', async () => {
    render(html`
      <vi-date-picker>
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    await waitForUpdate(picker);

    let eventDetail: DatePickerChangeDetail | undefined;
    picker.addEventListener('vi-date-picker-change', (e: Event) => {
      eventDetail = (e as CustomEvent<DatePickerChangeDetail>).detail;
    });

    // Simulate flatpickr change (simulate user selection which triggers onChange)
    (picker as any)._fp.setDate('2025-10-31', true);
    await waitForUpdate(picker);

    expect(eventDetail).toBeTruthy();
    expect(eventDetail?.isoValue).toBe('2025-10-31');
    expect(eventDetail?.rawValue).toEqual({ day: 31, month: 10, year: 2025 });
  });

  it('loads month mode plugin and sets up custom header', async () => {
    render(html`
      <vi-date-picker mode="month">
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    await waitForUpdate(picker);
    
    const calendar = picker.shadowRoot!.querySelector('.flatpickr-calendar');
    // The month plugin creates a custom header with `.vi-calendar-header`
    const customHeader = calendar?.querySelector('.vi-calendar-header');
    expect(customHeader).toBeTruthy();
  });

  it('handles range mode selection', async () => {
    render(html`
      <vi-date-picker mode="range">
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    await waitForUpdate(picker);

    picker.value = '2025-01-01 to 2025-01-15';
    await waitForUpdate(picker);

    let eventDetail: DatePickerChangeDetail | undefined;
    picker.addEventListener('vi-date-picker-change', (e: Event) => {
      eventDetail = (e as CustomEvent<DatePickerChangeDetail>).detail;
    });
    
    // Simulate setting a new range (user interaction)
    (picker as any)._fp.setDate('2025-02-01 to 2025-02-10', true);
    await waitForUpdate(picker);

    expect(eventDetail?.isoValue).toBe('2025-02-01 to 2025-02-10');
    expect(eventDetail?.rawValue).toEqual({ day: 1, month: 2, year: 2025 });
    expect(eventDetail?.rawEndValue).toEqual({ day: 10, month: 2, year: 2025 });
  });

  it('sets proper accessibility attributes on the input trigger', async () => {
    render(html`
      <vi-date-picker>
        <vi-date-picker-input label="Start Date"></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    const input = container.querySelector('vi-date-picker-input') as ViDatePickerInput;
    await waitForUpdate(picker);

    const triggerBtn = input.shadowRoot?.querySelector('.trigger');
    expect(triggerBtn?.getAttribute('aria-haspopup')).toBe('dialog');
    expect(triggerBtn?.getAttribute('aria-expanded')).toBe('false');
    
    picker.openCalendar();
    await picker.updateComplete;
    
    expect(triggerBtn?.getAttribute('aria-expanded')).toBe('true');
  });
  it('enforces required constraint', async () => {
    render(html`
      <vi-date-picker required>
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    await waitForUpdate(picker);

    expect(picker.checkValidity()).toBe(false);
    expect(picker.validity.valueMissing).toBe(true);

    picker.value = '2025-01-01';
    await waitForUpdate(picker);
    expect(picker.checkValidity()).toBe(true);
  });

  it('enforces min constraint', async () => {
    render(html`
      <vi-date-picker min="2025-01-10" value="2025-01-05">
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    await waitForUpdate(picker);

    expect(picker.checkValidity()).toBe(false);
    expect(picker.validity.rangeUnderflow).toBe(true);
  });

  it('enforces max constraint', async () => {
    render(html`
      <vi-date-picker max="2025-01-10" value="2025-01-15">
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    await waitForUpdate(picker);

    expect(picker.checkValidity()).toBe(false);
    expect(picker.validity.rangeOverflow).toBe(true);
  });
  it('handles programmatic week value', async () => {
    render(html`
      <vi-date-picker mode="week" value="2024-W01">
        <vi-date-picker-input></vi-date-picker-input>
      </vi-date-picker>
    `, container);

    const picker = container.querySelector('vi-date-picker') as ViDatePicker;
    await waitForUpdate(picker);

    // 2024-W01 Monday is 2024-01-01
    let fpSelectedDates = (picker as any)._fp.selectedDates;
    expect(fpSelectedDates.length).toBe(1);
    expect(fpSelectedDates[0].getFullYear()).toBe(2024);
    expect(fpSelectedDates[0].getMonth()).toBe(0); // Jan
    expect(fpSelectedDates[0].getDate()).toBe(1);
    
    picker.value = '2024-W02';
    await waitForUpdate(picker);
    fpSelectedDates = (picker as any)._fp.selectedDates;
    expect(fpSelectedDates[0].getDate()).toBe(8); // 2024-01-08
  });
});
