import 'reflect-metadata';
import { expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import { container as iocContainer } from 'tsyringe';
import './vi-time-picker.js';
import type { ViTimePicker } from './vi-time-picker.js';
import type {
  TimePickerChangeDetail,
  ITimePickerLocaleRegistry,
} from './types.js';
import {
  timePickerLocaleRegistry,
  TIME_PICKER_LOCALE_REGISTRY_TOKEN,
} from './index.js';
import {
  parseTime,
  formatTime,
  toIsoTime,
  to12Hour,
  to24Hour,
  compareTimes,
  stepSegment,
  isUnknownTime,
  isPartialUnknownTime,
  parsePartialTime,
  parsePastedTime,
} from './time-utils.js';

describe('time-utils (WDIO browser runner)', () => {
  describe('to24Hour and to12Hour', () => {
    it('converts 12h AM to 24h', () => {
      expect(to24Hour(12, 'AM')).toBe(0);
      expect(to24Hour(1, 'AM')).toBe(1);
      expect(to24Hour(11, 'AM')).toBe(11);
    });

    it('converts 12h PM to 24h', () => {
      expect(to24Hour(12, 'PM')).toBe(12);
      expect(to24Hour(1, 'PM')).toBe(13);
      expect(to24Hour(11, 'PM')).toBe(23);
    });

    it('converts 24h to 12h', () => {
      expect(to12Hour(0)).toEqual({ hours: 12, period: 'AM' });
      expect(to12Hour(1)).toEqual({ hours: 1, period: 'AM' });
      expect(to12Hour(11)).toEqual({ hours: 11, period: 'AM' });
      expect(to12Hour(12)).toEqual({ hours: 12, period: 'PM' });
      expect(to12Hour(13)).toEqual({ hours: 1, period: 'PM' });
      expect(to12Hour(23)).toEqual({ hours: 11, period: 'PM' });
    });
  });

  describe('parseTime', () => {
    it('parses standard 24-hour time', () => {
      const res = parseTime('14:30', '24');
      expect(res).toEqual({ hours: 14, minutes: 30, seconds: undefined });
    });

    it('parses standard 24-hour time with seconds', () => {
      const res = parseTime('14:30:45', '24');
      expect(res).toEqual({ hours: 14, minutes: 30, seconds: 45 });
    });

    it('parses 12-hour time with period', () => {
      const res = parseTime('02:30 PM', '12');
      expect(res).toEqual({ hours: 2, minutes: 30, seconds: undefined, period: 'PM' });
    });

    it('converts 24-hour input string into 12-hour format when format is 12', () => {
      const res = parseTime('14:30', '12');
      expect(res).toEqual({ hours: 2, minutes: 30, seconds: undefined, period: 'PM' });
    });

    it('returns null for invalid strings', () => {
      expect(parseTime('', '24')).toBeNull();
      expect(parseTime('invalid', '24')).toBeNull();
      expect(parseTime('??:??', '24')).toBeNull();
    });
  });

  describe('formatTime and toIsoTime', () => {
    it('formats 24-hour time', () => {
      expect(formatTime({ hours: 9, minutes: 5 }, '24')).toBe('09:05');
      expect(formatTime({ hours: 9, minutes: 5, seconds: 3 }, '24', true)).toBe('09:05:03');
    });

    it('formats 12-hour time', () => {
      expect(formatTime({ hours: 2, minutes: 30, period: 'PM' }, '12')).toBe('02:30 PM');
      expect(formatTime({ hours: 2, minutes: 30, seconds: 15, period: 'PM' }, '12', true)).toBe('02:30:15 PM');
    });

    it('produces normalized 24-hour ISO time', () => {
      expect(toIsoTime({ hours: 2, minutes: 30, period: 'PM' })).toBe('14:30');
      expect(toIsoTime({ hours: 12, minutes: 0, period: 'AM' })).toBe('00:00');
      expect(toIsoTime({ hours: 14, minutes: 30, seconds: 45 }, true)).toBe('14:30:45');
    });
  });

  describe('compareTimes', () => {
    it('compares times accurately', () => {
      expect(compareTimes('08:00', '09:00')).toBeLessThan(0);
      expect(compareTimes('09:00', '08:00')).toBeGreaterThan(0);
      expect(compareTimes('12:00', '12:00')).toBe(0);
      expect(compareTimes('10:00:15', '10:00:30')).toBeLessThan(0);
    });
  });

  describe('stepSegment', () => {
    it('steps up and wraps around', () => {
      expect(stepSegment(23, 1, 0, 23, 'up')).toBe(0);
      expect(stepSegment(12, 1, 1, 12, 'up')).toBe(1);
      expect(stepSegment(50, 15, 0, 59, 'up')).toBe(5);
    });

    it('steps down and wraps around', () => {
      expect(stepSegment(0, 1, 0, 23, 'down')).toBe(23);
      expect(stepSegment(1, 1, 1, 12, 'down')).toBe(12);
      expect(stepSegment(5, 15, 0, 59, 'down')).toBe(50);
    });
  });

  describe('isUnknownTime and isPartialUnknownTime', () => {
    it('detects full unknown times', () => {
      expect(isUnknownTime('??:??')).toBe(true);
      expect(isUnknownTime('??:??:??')).toBe(true);
      expect(isUnknownTime('12:00')).toBe(false);
      expect(isUnknownTime('')).toBe(false);
    });

    it('detects CDISC partial unknown times', () => {
      expect(isPartialUnknownTime('14:??')).toBe(true);
      expect(isPartialUnknownTime('??:30')).toBe(true);
      expect(isPartialUnknownTime('??:??:45')).toBe(true);
      expect(isPartialUnknownTime('14:??:??')).toBe(true);
      expect(isPartialUnknownTime('??:30:??')).toBe(true);
      expect(isPartialUnknownTime('02:?? PM', '12')).toBe(true);
      expect(isPartialUnknownTime('2:?? am', '12')).toBe(true);
      expect(isPartialUnknownTime('??:??')).toBe(false);
      expect(isPartialUnknownTime('??:??:??')).toBe(false);
      expect(isPartialUnknownTime('14:30')).toBe(false);
      expect(isPartialUnknownTime('')).toBe(false);
      expect(isPartialUnknownTime(null)).toBe(false);
      expect(isPartialUnknownTime(undefined)).toBe(false);
    });

    it('rejects malformed strings and out-of-range wildcard values in isPartialUnknownTime', () => {
      // Malformed strings containing ??
      expect(isPartialUnknownTime('foo??')).toBe(false);
      expect(isPartialUnknownTime('??foo')).toBe(false);
      expect(isPartialUnknownTime('14:?')).toBe(false);
      expect(isPartialUnknownTime('14-??')).toBe(false);
      expect(isPartialUnknownTime('??:??:??:??')).toBe(false);

      // Out-of-range numeric ranges
      expect(isPartialUnknownTime('99:??')).toBe(false);
      expect(isPartialUnknownTime('??:99')).toBe(false);
      expect(isPartialUnknownTime('14:??:80')).toBe(false);
      expect(isPartialUnknownTime('15:?? PM')).toBe(false);
      expect(isPartialUnknownTime('00:?? PM')).toBe(false);
      expect(isPartialUnknownTime('24:??')).toBe(false);
    });

    it('parses valid and invalid partial times with parsePartialTime and parseTime', () => {
      // Valid partial times
      expect(parsePartialTime('14:??', '24')).toEqual({
        hours: 14,
        minutes: null,
        seconds: undefined,
        period: undefined,
        rawHours: '14',
        rawMinutes: '??',
        rawSeconds: undefined,
        isPartial: true,
      });

      expect(parseTime('14:??', '24')).toEqual({
        hours: 14,
        minutes: null,
        seconds: undefined,
        period: undefined,
        rawHours: '14',
        rawMinutes: '??',
        rawSeconds: undefined,
        isPartial: true,
      });

      // parseTime returns null for malformed or out-of-range partial values
      expect(parseTime('foo??')).toBeNull();
      expect(parseTime('99:??')).toBeNull();
      expect(parseTime('??:99')).toBeNull();
      expect(parseTime('14:??:80')).toBeNull();
      expect(parseTime('15:?? PM')).toBeNull();
    });
  });

  describe('parsePastedTime', () => {
    it('parses standard 24h and 12h pasted strings', () => {
      expect(parsePastedTime('14:30', '24')).toEqual({ hours: 14, minutes: 30, seconds: undefined });
      expect(parsePastedTime('02:30 PM', '12')).toEqual({ hours: 2, minutes: 30, seconds: undefined, period: 'PM' });
      expect(parsePastedTime('2:30pm', '12')).toEqual({ hours: 2, minutes: 30, seconds: undefined, period: 'PM' });
    });

    it('parses compact military 3-digit and 4-digit numbers', () => {
      expect(parsePastedTime('1430', '24')).toEqual({ hours: 14, minutes: 30, seconds: undefined });
      expect(parsePastedTime('930', '24')).toEqual({ hours: 9, minutes: 30, seconds: undefined });
      expect(parsePastedTime('143045', '24')).toEqual({ hours: 14, minutes: 30, seconds: 45 });
    });

    it('parses partial unknown pasted wildcards', () => {
      const partial = parsePastedTime('14:??', '24');
      expect(partial?.rawHours).toBe('14');
      expect(partial?.rawMinutes).toBe('??');
    });

    it('returns null for unparseable garbage', () => {
      expect(parsePastedTime('not a time', '24')).toBeNull();
      expect(parsePastedTime('99:99', '24')).toBeNull();
    });
  });

  describe('toIsoTime with timezone', () => {
    it('appends UTC or numerical timezone offset', () => {
      expect(toIsoTime({ hours: 14, minutes: 30 }, false, 'UTC')).toBe('14:30Z');
      expect(toIsoTime({ hours: 14, minutes: 30 }, false, '+05:30')).toBe('14:30+05:30');
      expect(toIsoTime({ hours: 14, minutes: 30, seconds: 15 }, true, 'EST')).toBe('14:30:15 [EST]');
    });
  });
});

describe('vi-time-picker (WDIO browser runner)', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    document
      .querySelectorAll('.flatpickr-calendar')
      .forEach((el) => el.remove());
  });

  const waitForUpdate = async (el: ViTimePicker) => {
    await el.updateComplete;
    await browser.waitUntil(
      async () => {
        return !!(
          el.shadowRoot?.querySelector('.flatpickr-calendar') ||
          document.querySelector('.flatpickr-calendar')
        );
      },
      {
        timeoutMsg: 'expected flatpickr to initialize and render popup DOM',
        timeout: 5000,
      },
    );
  };

  it('renders without errors and initializes flatpickr in time mode', async () => {
    render(html`<vi-time-picker></vi-time-picker>`, container);
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    expect(el).toBeTruthy();
    expect(el.format).toBe('24');

    const calendar =
      el.shadowRoot!.querySelector('.flatpickr-calendar') ||
      document.querySelector('.flatpickr-calendar');
    expect(calendar).toBeTruthy();
    expect(calendar?.classList.contains('noCalendar')).toBe(true);
    expect(calendar?.classList.contains('hasTime')).toBe(true);
  });

  it('synchronizes segment inputs when value is set in 24-hour mode', async () => {
    render(html`<vi-time-picker value="14:30"></vi-time-picker>`, container);
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const hoursInput = el.shadowRoot!.querySelector(
      '#hours-input',
    ) as HTMLInputElement;
    const minutesInput = el.shadowRoot!.querySelector(
      '#minutes-input',
    ) as HTMLInputElement;

    expect(hoursInput.value).toBe('14');
    expect(minutesInput.value).toBe('30');
    // Period button should NOT exist in 24h mode
    expect(el.shadowRoot!.querySelector('.timepicker-period-btn')).toBeNull();
  });

  it('renders period button and handles 12-hour format with clicks', async () => {
    render(
      html`<vi-time-picker format="12" value="02:30 PM"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const hoursInput = el.shadowRoot!.querySelector(
      '#hours-input',
    ) as HTMLInputElement;
    const minutesInput = el.shadowRoot!.querySelector(
      '#minutes-input',
    ) as HTMLInputElement;
    const periodBtn = el.shadowRoot!.querySelector(
      '.timepicker-period-btn',
    ) as HTMLButtonElement;

    expect(hoursInput.value).toBe('02');
    expect(minutesInput.value).toBe('30');
    expect(periodBtn).toBeTruthy();
    expect(periodBtn.textContent?.trim()).toBe('PM');
    expect(periodBtn.getAttribute('aria-pressed')).toBe('true');

    // Click period button to toggle to AM
    periodBtn.click();
    await el.updateComplete;

    expect(periodBtn.textContent?.trim()).toBe('AM');
    expect(periodBtn.getAttribute('aria-pressed')).toBe('false');
    expect(el.value).toBe('02:30 AM');
  });

  it('rehydrates segment state when format changes from 24-hour to 12-hour', async () => {
    render(
      html`<vi-time-picker format="24" value="14:30"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
    expect(hoursInput.value).toBe('14');
    expect(hoursInput.getAttribute('aria-valuemax')).toBe('23');

    // Switch format from 24 to 12
    el.format = '12';
    await el.updateComplete;

    expect(hoursInput.value).toBe('02');
    expect(hoursInput.getAttribute('aria-valuemax')).toBe('12');
    const periodBtn = el.shadowRoot!.querySelector('.timepicker-period-btn') as HTMLButtonElement;
    expect(periodBtn).toBeTruthy();
    expect(periodBtn.textContent?.trim()).toBe('PM');
  });

  it('rehydrates seconds segment state when showSeconds is dynamically enabled', async () => {
    render(
      html`<vi-time-picker value="14:30"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    expect(el.shadowRoot!.querySelector('#seconds-input')).toBeNull();

    // Dynamically enable seconds
    el.showSeconds = true;
    await el.updateComplete;

    const secondsInput = el.shadowRoot!.querySelector('#seconds-input') as HTMLInputElement;
    expect(secondsInput).toBeTruthy();
    expect(secondsInput.value).toBe('00');
  });

  it('supports keyboard toggling of AM/PM via A and P keys', async () => {
    render(
      html`<vi-time-picker format="12" value="08:00 AM"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const periodBtn = el.shadowRoot!.querySelector(
      '.timepicker-period-btn',
    ) as HTMLButtonElement;
    const hoursInput = el.shadowRoot!.querySelector(
      '#hours-input',
    ) as HTMLInputElement;

    // Press 'p' while hours is focused
    hoursInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'p' }));
    await el.updateComplete;

    expect(periodBtn.textContent?.trim()).toBe('PM');
    expect(el.value).toBe('08:00 PM');

    // Press 'a' while period button is focused
    periodBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    await el.updateComplete;

    expect(periodBtn.textContent?.trim()).toBe('AM');
    expect(el.value).toBe('08:00 AM');
  });

  it('renders seconds segment when show-seconds is enabled', async () => {
    render(
      html`<vi-time-picker show-seconds value="09:15:45"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const secondsInput = el.shadowRoot!.querySelector(
      '#seconds-input',
    ) as HTMLInputElement;
    expect(secondsInput).toBeTruthy();
    expect(secondsInput.value).toBe('45');
  });

  it('provides complete WAI-ARIA spinbutton attributes and group semantics', async () => {
    render(
      html`<vi-time-picker
        label="Departure Time"
        helper-text="Select your departure"
        value="14:30"
        required
      ></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const control = el.shadowRoot!.querySelector('.timepicker-control') as HTMLElement;
    expect(control.getAttribute('role')).toBe('group');
    expect(control.getAttribute('aria-label')).toBe('Departure Time');

    const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
    expect(hoursInput.getAttribute('role')).toBe('spinbutton');
    expect(hoursInput.getAttribute('aria-valuenow')).toBe('14');
    expect(hoursInput.getAttribute('aria-valuemin')).toBe('0');
    expect(hoursInput.getAttribute('aria-valuemax')).toBe('23');
    expect(hoursInput.getAttribute('aria-valuetext')).toBe('14 hours');
    expect(hoursInput.getAttribute('aria-required')).toBe('true');

    const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
    expect(minutesInput.getAttribute('role')).toBe('spinbutton');
    expect(minutesInput.getAttribute('aria-valuenow')).toBe('30');
    expect(minutesInput.getAttribute('aria-valuemin')).toBe('0');
    expect(minutesInput.getAttribute('aria-valuemax')).toBe('59');
    expect(minutesInput.getAttribute('aria-valuetext')).toBe('30 minutes');
    expect(minutesInput.getAttribute('aria-required')).toBe('true');
  });

  it('handles keyboard stepping with ArrowUp and ArrowDown keys', async () => {
    render(
      html`<vi-time-picker value="10:15" step="15"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
    const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;

    // Increment hours with ArrowUp
    hoursInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await el.updateComplete;
    expect(hoursInput.value).toBe('11');

    // Decrement hours with ArrowDown
    hoursInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await el.updateComplete;
    expect(hoursInput.value).toBe('10');

    // Increment minutes with ArrowUp (respects step=15)
    minutesInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
    await el.updateComplete;
    expect(minutesInput.value).toBe('30');

    // Decrement minutes with ArrowDown
    minutesInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await el.updateComplete;
    expect(minutesInput.value).toBe('15');
  });

  it('handles Home, End, PageUp, and PageDown keys', async () => {
    render(
      html`<vi-time-picker value="10:20"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
    const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;

    // Home jumps hours to 00
    hoursInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    await el.updateComplete;
    expect(hoursInput.value).toBe('00');

    // End jumps hours to 23
    hoursInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    await el.updateComplete;
    expect(hoursInput.value).toBe('23');

    // PageUp jumps minutes by +15
    minutesInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp' }));
    await el.updateComplete;
    expect(minutesInput.value).toBe('35');

    // PageDown jumps minutes by -15
    minutesInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown' }));
    await el.updateComplete;
    expect(minutesInput.value).toBe('20');
  });

  it('dispatches vi-time-picker-change and vialiq-change events on commit', async () => {
    render(html`<vi-time-picker></vi-time-picker>`, container);
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    let detail: TimePickerChangeDetail | undefined;
    el.addEventListener('vi-time-picker-change', (e: Event) => {
      detail = (e as CustomEvent<TimePickerChangeDetail>).detail;
    });

    const hoursInput = el.shadowRoot!.querySelector(
      '#hours-input',
    ) as HTMLInputElement;
    const minutesInput = el.shadowRoot!.querySelector(
      '#minutes-input',
    ) as HTMLInputElement;

    hoursInput.value = '10';
    hoursInput.dispatchEvent(new Event('input'));
    minutesInput.value = '45';
    minutesInput.dispatchEvent(new Event('input'));

    await el.updateComplete;

    expect(detail).toBeTruthy();
    expect(detail?.value).toBe('10:45');
    expect(detail?.isoValue).toBe('10:45');
    expect(detail?.hours).toBe(10);
    expect(detail?.minutes).toBe(45);
    expect(detail?.isUnknown).toBe(false);
  });

  it('supports clinical EDC unknown time (allow-unknown and ??:??)', async () => {
    render(
      html`<vi-time-picker allow-unknown value="??:??"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const checkbox = el.shadowRoot!.querySelector(
      '#unknown-checkbox',
    ) as HTMLInputElement;
    const hoursInput = el.shadowRoot!.querySelector(
      '#hours-input',
    ) as HTMLInputElement;

    expect(checkbox).toBeTruthy();
    expect(checkbox.checked).toBe(true);
    expect(hoursInput.value).toBe('??');
    expect(hoursInput.disabled).toBe(true);

    // Uncheck unknown checkbox
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change'));
    await el.updateComplete;

    expect(el.value).toBe('');
    expect(hoursInput.disabled).toBe(false);
  });

  it('opens and closes popup when clock button is clicked', async () => {
    render(html`<vi-time-picker></vi-time-picker>`, container);
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const clockBtn = el.shadowRoot!.querySelector(
      '.timepicker-clock-btn',
    ) as HTMLButtonElement;

    expect(clockBtn.getAttribute('aria-expanded')).toBe('false');

    clockBtn.click();
    await el.updateComplete;

    expect(clockBtn.getAttribute('aria-expanded')).toBe('true');

    clockBtn.click();
    await el.updateComplete;

    expect(clockBtn.getAttribute('aria-expanded')).toBe('false');
  });

  it('clears value when clear button is clicked', async () => {
    render(
      html`<vi-time-picker clearable value="12:00"></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    let clearFired = false;
    el.addEventListener('vialiq-clear', () => {
      clearFired = true;
    });

    const clearBtn = el.shadowRoot!.querySelector(
      '.timepicker-clear-btn',
    ) as HTMLButtonElement;
    expect(clearBtn).toBeTruthy();

    clearBtn.click();
    await el.updateComplete;

    expect(el.value).toBe('');
    expect(clearFired).toBe(true);
  });

  it('validates min and max time bounds', async () => {
    render(
      html`<vi-time-picker
        min="08:00"
        max="17:00"
        value="07:30"
      ></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    expect(el.checkValidity()).toBe(false);
    expect(el.validity.rangeUnderflow).toBe(true);

    el.value = '18:00';
    await el.updateComplete;

    expect(el.checkValidity()).toBe(false);
    expect(el.validity.rangeOverflow).toBe(true);

    el.value = '12:00';
    await el.updateComplete;

    expect(el.checkValidity()).toBe(true);
  });

  it('validates partial time grammar and sets badInput for malformed or out-of-range partial times', async () => {
    render(html`<vi-time-picker></vi-time-picker>`, container);
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    // Malformed partial string with wildcard substring
    el.value = 'foo??';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(false);
    expect(el.validity.badInput).toBe(true);

    // Out-of-range hours wildcard
    el.value = '99:??';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(false);
    expect(el.validity.badInput).toBe(true);

    // Out-of-range minutes wildcard
    el.value = '??:99';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(false);
    expect(el.validity.badInput).toBe(true);

    // Out-of-range seconds wildcard
    el.value = '14:??:80';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(false);
    expect(el.validity.badInput).toBe(true);

    // Valid CDISC partial unknown time
    el.value = '14:??';
    await el.updateComplete;
    expect(el.checkValidity()).toBe(true);
    expect(el.validity.badInput).toBe(false);
  });

  it('participates in native form submission and reset', async () => {
    const form = document.createElement('form');
    container.appendChild(form);

    render(
      html`<vi-time-picker name="testTime" value="11:30"></vi-time-picker>`,
      form,
    );
    const el = form.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const formData = new FormData(form);
    expect(formData.get('testTime')).toBe('11:30');

    // Change value then reset form
    el.value = '16:00';
    await el.updateComplete;

    form.reset();
    await el.updateComplete;

    expect(el.value).toBe('11:30');
  });

  it('disables autocomplete on hours, minutes, and seconds input segments', async () => {
    render(
      html`<vi-time-picker show-seconds></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
    const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
    const secondsInput = el.shadowRoot!.querySelector('#seconds-input') as HTMLInputElement;

    expect(hoursInput.getAttribute('autocomplete')).toBe('off');
    expect(minutesInput.getAttribute('autocomplete')).toBe('off');
    expect(secondsInput.getAttribute('autocomplete')).toBe('off');
  });

  it('supports configuration object without hardcoded literals via .config', async () => {
    render(
      html`<vi-time-picker
        show-seconds
        clearable
        allow-unknown
        value="10:00:00"
        .config=${{
          hoursPlaceholder: 'HHH',
          minutesPlaceholder: 'MMM',
          secondsPlaceholder: 'SSS',
          hoursAriaLabel: 'Custom Hours',
          minutesAriaLabel: 'Custom Minutes',
          secondsAriaLabel: 'Custom Seconds',
          groupAriaLabel: 'Custom Group',
          clockAriaLabel: 'Custom Clock',
          clearAriaLabel: 'Custom Clear',
          unknownLabel: 'Custom Unknown',
          popupAriaLabel: 'Custom Popup',
        }}
      ></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
    const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
    const secondsInput = el.shadowRoot!.querySelector('#seconds-input') as HTMLInputElement;
    const clockBtn = el.shadowRoot!.querySelector('.timepicker-clock-btn') as HTMLButtonElement;
    const clearBtn = el.shadowRoot!.querySelector('.timepicker-clear-btn') as HTMLButtonElement;
    const groupEl = el.shadowRoot!.querySelector('.timepicker-control') as HTMLElement;
    const unknownLabelEl = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;
    const popupEl = el.shadowRoot!.querySelector('#floating-menu-container') as HTMLElement;

    expect(hoursInput.placeholder).toBe('HHH');
    expect(minutesInput.placeholder).toBe('MMM');
    expect(secondsInput.placeholder).toBe('SSS');
    expect(hoursInput.getAttribute('aria-label')).toBe('Custom Hours');
    expect(minutesInput.getAttribute('aria-label')).toBe('Custom Minutes');
    expect(secondsInput.getAttribute('aria-label')).toBe('Custom Seconds');
    expect(groupEl.getAttribute('aria-label')).toBe('Custom Group');
    expect(clockBtn.getAttribute('aria-label')).toBe('Custom Clock');
    expect(clearBtn.getAttribute('aria-label')).toBe('Custom Clear');
    expect(unknownLabelEl.textContent).toBe('Custom Unknown');
    expect(popupEl.getAttribute('aria-label')).toBe('Custom Popup');
  });

  it('watches for in-place property mutations and setConfig updates on the config object', async () => {
    render(
      html`<vi-time-picker allow-unknown></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const unknownLabelEl = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;
    expect(unknownLabelEl.textContent).toBe('Time unknown');

    // 1. Direct in-place mutation on config object (watched by reactive Proxy!)
    el.config.unknownLabel = 'Mutated Unknown Label';
    await el.updateComplete;
    expect(unknownLabelEl.textContent).toBe('Mutated Unknown Label');

    // 2. setConfig helper method
    el.setConfig({ unknownLabel: 'Updated via setConfig' });
    await el.updateComplete;
    expect(unknownLabelEl.textContent).toBe('Updated via setConfig');
  });

  it('supports comprehensive i18n object configuration', async () => {
    render(
      html`<vi-time-picker
        allow-unknown
        .i18n=${{
          hoursPlaceholder: 'hh-custom',
          minutesPlaceholder: 'mm-custom',
          unknownLabel: 'Heure absente',
          clockAriaLabel: 'Ouvrir l’horloge',
        }}
      ></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
    const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
    const unknownLabelEl = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;
    const clockBtn = el.shadowRoot!.querySelector('.timepicker-clock-btn') as HTMLButtonElement;

    expect(hoursInput.placeholder).toBe('hh-custom');
    expect(minutesInput.placeholder).toBe('mm-custom');
    expect(unknownLabelEl.textContent).toBe('Heure absente');
    expect(clockBtn.getAttribute('aria-label')).toBe('Ouvrir l’horloge');
  });

  it('customizes validation messages via config object and watches updates', async () => {
    render(
      html`<vi-time-picker
        required
        .config=${{
          requiredMessage: 'Custom required msg',
        }}
      ></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    expect(el.checkValidity()).toBe(false);
    expect(el.validityMessage).toBe('Custom required msg');

    // Min message override via config mutation
    el.required = false;
    el.min = '10:00';
    el.value = '08:00';
    el.config.minMessage = 'Too early, must be at least {min}';
    await el.updateComplete;

    expect(el.checkValidity()).toBe(false);
    expect(el.validityMessage).toBe('Too early, must be at least 10:00');

    // Max message override via setConfig
    el.min = '';
    el.max = '18:00';
    el.value = '20:00';
    el.setConfig({ maxMessage: 'Too late, must be at most {max}' });
    await el.updateComplete;

    expect(el.checkValidity()).toBe(false);
    expect(el.validityMessage).toBe('Too late, must be at most 18:00');
  });

  it('supports locale prop with automatic localized defaults', async () => {
    render(
      html`<vi-time-picker locale="fr" allow-unknown></vi-time-picker>`,
      container,
    );
    const el = container.querySelector('vi-time-picker') as ViTimePicker;
    await waitForUpdate(el);

    const unknownLabelEl = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;
    expect(unknownLabelEl.textContent).toBe('Heure inconnue');

    const clockBtn = el.shadowRoot!.querySelector('.timepicker-clock-btn') as HTMLButtonElement;
    expect(clockBtn.getAttribute('aria-label')).toBe('Choisir l’heure');
  });

  describe('Locale Registry & Dependency Inversion (tsyringe)', () => {
    afterEach(() => {
      timePickerLocaleRegistry.clear();
      if (iocContainer.isRegistered(TIME_PICKER_LOCALE_REGISTRY_TOKEN)) {
        iocContainer.register(TIME_PICKER_LOCALE_REGISTRY_TOKEN, {
          useValue: timePickerLocaleRegistry,
        });
      }
    });

    it('dynamically registers custom locales via singleton timePickerLocaleRegistry', async () => {
      timePickerLocaleRegistry.register('sv', {
        hoursPlaceholder: 'TT',
        minutesPlaceholder: 'MM',
        secondsPlaceholder: 'SS',
        unknownLabel: 'Okänd tid',
        clockAriaLabel: 'Öppna klocka',
      });

      render(
        html`<vi-time-picker locale="sv" allow-unknown show-seconds></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
      const secondsInput = el.shadowRoot!.querySelector('#seconds-input') as HTMLInputElement;
      const unknownLabelEl = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;
      const clockBtn = el.shadowRoot!.querySelector('.timepicker-clock-btn') as HTMLButtonElement;

      expect(hoursInput.placeholder).toBe('TT');
      expect(minutesInput.placeholder).toBe('MM');
      expect(secondsInput.placeholder).toBe('SS');
      expect(unknownLabelEl.textContent).toBe('Okänd tid');
      expect(clockBtn.getAttribute('aria-label')).toBe('Öppna klocka');
    });

    it('falls back safely to English defaults when locale is unknown', async () => {
      render(
        html`<vi-time-picker locale="xx-YY" allow-unknown></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
      const unknownLabelEl = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;

      expect(hoursInput.placeholder).toBe('HH');
      expect(minutesInput.placeholder).toBe('mm');
      expect(unknownLabelEl.textContent).toBe('Time unknown');
    });

    it('supports Dependency Inversion Principle by resolving custom registry from tsyringe container', async () => {
      const mockCustomRegistry: ITimePickerLocaleRegistry = {
        register: () => {},
        registerLoader: () => {},
        has: () => true,
        clear: () => {},
        resolveLocale: async (loc) => mockCustomRegistry.getLocale(loc),
        getLocale: (_loc) => ({
          hoursPlaceholder: 'DI-HR',
          minutesPlaceholder: 'DI-MN',
          secondsPlaceholder: 'DI-SC',
          hoursAriaLabel: 'DI Hours',
          minutesAriaLabel: 'DI Minutes',
          secondsAriaLabel: 'DI Seconds',
          groupAriaLabel: 'DI Group',
          clockAriaLabel: 'DI Clock',
          clearAriaLabel: 'DI Clear',
          periodAriaLabel: 'DI Period',
          unknownLabel: 'DI Unknown',
          popupAriaLabel: 'DI Popup',
          nowLabel: 'DI Now',
          nowAriaLabel: 'DI Now',
          timezoneAriaLabel: 'DI Timezone',
          requiredMessage: 'DI Required',
          invalidMessage: 'DI Invalid',
          minMessage: 'DI Min',
          maxMessage: 'DI Max',
          disabledTimeMessage: 'DI Disabled',
          emptyValueText: 'DI Empty',
          unknownValueText: 'DI Unknown',
          hoursUnit: 'di-hrs',
          minutesUnit: 'di-mins',
          secondsUnit: 'di-secs',
        }),
      };

      iocContainer.register(TIME_PICKER_LOCALE_REGISTRY_TOKEN, {
        useValue: mockCustomRegistry,
      });

      render(
        html`<vi-time-picker locale="di-test" allow-unknown></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
      const unknownLabelEl = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;

      expect(hoursInput.placeholder).toBe('DI-HR');
      expect(minutesInput.placeholder).toBe('DI-MN');
      expect(unknownLabelEl.textContent).toBe('DI Unknown');
    });

    it('asynchronously resolves translations via registerLoader', async () => {
      timePickerLocaleRegistry.registerLoader(async (locale) => {
        if (locale === 'it') {
          return {
            hoursPlaceholder: 'OO',
            minutesPlaceholder: 'MM',
            unknownLabel: 'Ora non specificata',
          };
        }
        return null;
      });

      render(
        html`<vi-time-picker locale="it" allow-unknown></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);
      await el.updateComplete;

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      const unknownLabelEl = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;

      expect(hoursInput.placeholder).toBe('OO');
      expect(unknownLabelEl.textContent).toBe('Ora non specificata');
    });
  });

  describe('Accessibility (A11y)', () => {
    it('sets proper ARIA attributes, roles, and label associations', async () => {
      render(
        html`<vi-time-picker label="Scheduled Time" allow-unknown show-seconds></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const label = el.shadowRoot!.querySelector('#timepicker-label') as HTMLLabelElement;
      expect(label.getAttribute('for')).toBe('hours-input');
      expect(label.textContent?.trim()).toBe('Scheduled Time');

      const control = el.shadowRoot!.querySelector('.timepicker-control') as HTMLElement;
      expect(control.getAttribute('role')).toBe('group');
      expect(control.getAttribute('aria-labelledby')).toBe('timepicker-label');

      const hours = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      expect(hours.getAttribute('role')).toBe('spinbutton');
      expect(hours.getAttribute('aria-valuemin')).toBe('0');
      expect(hours.getAttribute('aria-valuemax')).toBe('23');
      expect(hours.getAttribute('aria-valuetext')).toBe('Empty');

      const minutes = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
      expect(minutes.getAttribute('role')).toBe('spinbutton');
      expect(minutes.getAttribute('aria-valuemin')).toBe('0');
      expect(minutes.getAttribute('aria-valuemax')).toBe('59');

      const seconds = el.shadowRoot!.querySelector('#seconds-input') as HTMLInputElement;
      expect(seconds.getAttribute('role')).toBe('spinbutton');

      const clockBtn = el.shadowRoot!.querySelector('.timepicker-clock-btn') as HTMLButtonElement;
      expect(clockBtn.getAttribute('aria-haspopup')).toBe('dialog');
      expect(clockBtn.getAttribute('aria-expanded')).toBe('false');

      const popup = el.shadowRoot!.querySelector('#floating-menu-container') as HTMLElement;
      expect(popup.getAttribute('role')).toBe('dialog');

      const unknownLabel = el.shadowRoot!.querySelector('.timepicker-unknown-wrapper label') as HTMLLabelElement;
      expect(unknownLabel.getAttribute('for')).toBe('unknown-checkbox');
    });

    it('toggles aria-expanded and restores focus to clock-btn on popup Escape key', async () => {
      render(
        html`<vi-time-picker></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const clockBtn = el.shadowRoot!.querySelector('.timepicker-clock-btn') as HTMLButtonElement;
      const popup = el.shadowRoot!.querySelector('#floating-menu-container') as HTMLElement;

      expect(clockBtn.getAttribute('aria-expanded')).toBe('false');

      el.open();
      await el.updateComplete;

      expect(clockBtn.getAttribute('aria-expanded')).toBe('true');

      // Dispatch Escape key on popup
      popup.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        }),
      );
      await el.updateComplete;

      expect(clockBtn.getAttribute('aria-expanded')).toBe('false');
      expect(el.shadowRoot!.activeElement).toBe(clockBtn);
    });

    it('dynamically updates aria-valuenow and aria-valuetext for screen readers', async () => {
      render(
        html`<vi-time-picker value="14:30"></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hours = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      const minutes = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;

      expect(hours.getAttribute('aria-valuenow')).toBe('14');
      expect(hours.getAttribute('aria-valuetext')).toBe('14 hours');
      expect(minutes.getAttribute('aria-valuenow')).toBe('30');
      expect(minutes.getAttribute('aria-valuetext')).toBe('30 minutes');
    });

    it('passes axe-core accessibility audit in default and invalid states', async () => {
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      render(
        html`
          <vi-time-picker
            id="tp-audit-1"
            label="Visit Time"
            helper-text="Select scheduled visit time"
          ></vi-time-picker>
          <vi-time-picker
            id="tp-audit-2"
            format="12"
            value="02:30 PM"
            clearable
          ></vi-time-picker>
          <vi-time-picker
            id="tp-audit-3"
            allow-unknown
            status="invalid"
            validity-message="Time is required"
          ></vi-time-picker>
        `,
        container,
      );
      const el = container.querySelector('#tp-audit-1') as ViTimePicker;
      await waitForUpdate(el);

      const results = await axe.run(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          region: { enabled: false },
          'color-contrast': { enabled: false },
        },
      });

      expect(results.violations).toHaveLength(0);
    });
  });

  describe('Real-World Enterprise Capabilities', () => {
    it('renders "Now" button with show-now and sets current time when clicked', async () => {
      render(
        html`<vi-time-picker show-now></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const nowBtn = el.shadowRoot!.querySelector('.timepicker-now-btn') as HTMLButtonElement;
      expect(nowBtn).not.toBeNull();
      expect(nowBtn.textContent?.trim()).toBe('Now');

      let fired = false;
      el.addEventListener('vi-time-picker-change', () => {
        fired = true;
      });

      nowBtn.click();
      await el.updateComplete;

      expect(fired).toBe(true);
      expect(el.value).not.toBe('');
      const hours = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      expect(hours.value).not.toBe('');
    });

    it('supports setCurrentTime() and now() public API methods', async () => {
      render(
        html`<vi-time-picker></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      expect(el.value).toBe('');
      el.setCurrentTime();
      await el.updateComplete;

      expect(el.value).not.toBe('');
      const d = new Date();
      const expectedHourPrefix = String(d.getHours()).padStart(2, '0');
      expect(el.value.startsWith(expectedHourPrefix)).toBe(true);
    });

    it('pastes time string from clipboard into segments', async () => {
      render(
        html`<vi-time-picker></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;

      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', '16:45');
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      hoursInput.dispatchEvent(pasteEvent);
      await el.updateComplete;

      expect(el.value).toBe('16:45');
      expect((el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement).value).toBe('16');
      expect((el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement).value).toBe('45');
    });

    it('pastes military time format (e.g. "0830") into 24h segments', async () => {
      render(
        html`<vi-time-picker></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;

      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', '0830');
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      hoursInput.dispatchEvent(pasteEvent);
      await el.updateComplete;

      expect(el.value).toBe('08:30');
    });

    it('pastes fully unknown time "??:??" and commits unknown value, form state, and emits change', async () => {
      render(
        html`<vi-time-picker value="14:30"></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      expect(el.value).toBe('14:30');

      let changeFired = false;
      let changeDetail: TimePickerChangeDetail | null = null;
      el.addEventListener('vi-time-picker-change', (e: Event) => {
        changeFired = true;
        changeDetail = (e as CustomEvent<TimePickerChangeDetail>).detail;
      });

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;

      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', '??:??');
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData,
        bubbles: true,
        cancelable: true,
        composed: true,
      });

      hoursInput.dispatchEvent(pasteEvent);
      await el.updateComplete;

      expect(el.value).toBe('??:??');
      expect(changeFired).toBe(true);
      const detail = changeDetail as TimePickerChangeDetail | null;
      expect(detail?.isUnknown).toBe(true);
      expect(detail?.value).toBe('??:??');
    });

    it('displays timezone indicator badge and includes timezone in event details', async () => {
      render(
        html`<vi-time-picker timezone="UTC" value="14:30"></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const tzBadge = el.shadowRoot!.querySelector('.timepicker-timezone') as HTMLElement;
      expect(tzBadge).not.toBeNull();
      expect(tzBadge.textContent?.trim()).toBe('UTC');

      let detail: TimePickerChangeDetail | null = null;
      el.addEventListener('vi-time-picker-change', (e: Event) => {
        detail = (e as CustomEvent<TimePickerChangeDetail>).detail;
      });

      el.stepUp('minutes');
      await el.updateComplete;

      expect(detail).not.toBeNull();
      expect(detail!.timezone).toBe('UTC');
      expect(detail!.isoValue).toContain('Z');
    });

    it('supports hour-step and second-step increments via API and keyboard', async () => {
      render(
        html`<vi-time-picker value="10:00:00" show-seconds hour-step="2" second-step="10"></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      const secondsInput = el.shadowRoot!.querySelector('#seconds-input') as HTMLInputElement;

      // API stepUp
      el.stepUp('hours');
      await el.updateComplete;
      expect(hoursInput.value).toBe('12');

      el.stepUp('seconds');
      await el.updateComplete;
      expect(secondsInput.value).toBe('10');

      // Keyboard ArrowUp / ArrowDown on hours segment (respects hourStep=2)
      hoursInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      await el.updateComplete;
      expect(hoursInput.value).toBe('14');

      hoursInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await el.updateComplete;
      expect(hoursInput.value).toBe('12');

      // Keyboard ArrowUp / ArrowDown on seconds segment (respects secondStep=10)
      secondsInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      await el.updateComplete;
      expect(secondsInput.value).toBe('20');

      secondsInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      await el.updateComplete;
      expect(secondsInput.value).toBe('10');
    });

    it('handles CDISC partial unknown time and sets checkbox to indeterminate', async () => {
      render(
        html`<vi-time-picker allow-unknown value="14:??"></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hours = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      const minutes = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;
      const checkbox = el.shadowRoot!.querySelector('#unknown-checkbox') as HTMLInputElement;

      expect(hours.value).toBe('14');
      expect(minutes.value).toBe('??');
      expect(checkbox.indeterminate).toBe(true);
    });

    it('allows typing ? in hour/minute input to set partial unknown', async () => {
      render(
        html`<vi-time-picker allow-unknown></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hours = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      hours.value = '?';
      hours.dispatchEvent(new Event('input', { bubbles: true }));
      await el.updateComplete;

      expect(hours.value).toBe('??');
      expect(el.value).toBe('??:??');
    });

    it('validates disabledHours and disabledMinutes callback and array constraints', async () => {
      render(
        html`<vi-time-picker></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      el.disabledHours = [12, 13];
      el.value = '12:30';
      await waitForUpdate(el);

      expect(el.checkValidity()).toBe(false);
      expect(el.validity.customError).toBe(true);
      expect(el.validityMessage).toContain('not selectable');

      el.reportValidity();
      expect(el.status).toBe('invalid');

      // Allowed time
      el.value = '11:30';
      await el.updateComplete;
      expect(el.checkValidity()).toBe(true);

      // Test disabledMinutes function
      el.disabledHours = null;
      el.disabledMinutes = (min: number, hr?: number) => hr === 10 && min === 45;
      el.value = '10:45';
      await el.updateComplete;
      expect(el.checkValidity()).toBe(false);
      expect(el.validity.customError).toBe(true);

      el.reportValidity();
      expect(el.status).toBe('invalid');
    });

    it('validates disabledSeconds callback and array constraints', async () => {
      render(
        html`<vi-time-picker show-seconds></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      el.disabledSeconds = [15, 30, 45];
      el.value = '10:20:15';
      await waitForUpdate(el);

      expect(el.checkValidity()).toBe(false);
      expect(el.validity.customError).toBe(true);
      expect(el.validityMessage).toContain('not selectable');

      el.reportValidity();
      expect(el.status).toBe('invalid');

      // Allowed seconds
      el.value = '10:20:16';
      await el.updateComplete;
      expect(el.checkValidity()).toBe(true);

      // Test disabledSeconds function predicate
      el.disabledSeconds = (sec: number, min?: number, hr?: number) =>
        hr === 10 && min === 20 && sec === 50;
      el.value = '10:20:50';
      await el.updateComplete;
      expect(el.checkValidity()).toBe(false);
      expect(el.validity.customError).toBe(true);

      el.reportValidity();
      expect(el.status).toBe('invalid');

      // Allowed value
      el.value = '10:20:51';
      await el.updateComplete;
      expect(el.checkValidity()).toBe(true);

      // Dynamically updating disabledSeconds re-validates the element
      el.disabledSeconds = [51];
      await el.updateComplete;
      expect(el.checkValidity()).toBe(false);
      expect(el.validity.customError).toBe(true);
    });

    it('handles interactive digit typing without erasing intermediate values or displaying premature validation errors', async () => {
      render(
        html`<vi-time-picker></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      const hoursInput = el.shadowRoot!.querySelector('#hours-input') as HTMLInputElement;
      const minutesInput = el.shadowRoot!.querySelector('#minutes-input') as HTMLInputElement;

      // 1. User types first digit '1' in hours
      hoursInput.value = '1';
      hoursInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      // Hours value must NOT be wiped back to ''
      expect(hoursInput.value).toBe('1');
      // No premature error message should appear
      expect(el.shadowRoot!.querySelector('#validation-msg')).toBeNull();

      // 2. User types second digit '4' in hours -> advances to '14'
      hoursInput.value = '14';
      hoursInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      expect(hoursInput.value).toBe('14');
      expect(el.shadowRoot!.querySelector('#validation-msg')).toBeNull();

      // 3. User types minutes '30'
      minutesInput.value = '30';
      minutesInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      expect(minutesInput.value).toBe('30');
      expect(el.value).toBe('14:30');
      expect(el.shadowRoot!.querySelector('#validation-msg')).toBeNull();

      // 4. User backspaces/clears hours input
      hoursInput.value = '';
      hoursInput.dispatchEvent(new Event('input'));
      await el.updateComplete;

      expect(hoursInput.value).toBe('');
      // Minutes should remain intact
      expect(minutesInput.value).toBe('30');
      expect(el.shadowRoot!.querySelector('#validation-msg')).toBeNull();
    });

    it('clears validation error message and resets invalid status when a valid time is selected from popup', async () => {
      render(
        html`<vi-time-picker required></vi-time-picker>`,
        container,
      );
      const el = container.querySelector('vi-time-picker') as ViTimePicker;
      await waitForUpdate(el);

      // Trigger validation failure on required field
      el.reportValidity();
      await el.updateComplete;

      expect(el.status).toBe('invalid');
      expect(el.shadowRoot!.querySelector('#validation-msg')).not.toBeNull();

      // Simulate picking time from flatpickr popup
      const fp = (el as any)._fp;
      expect(fp).toBeTruthy();
      const validDate = new Date();
      validDate.setHours(14, 30, 0, 0);
      (el as any)._onFlatpickrChange(validDate, '14:30');
      await el.updateComplete;

      expect(el.value).toBe('14:30');
      expect(el.status).toBe('default');
      expect(el.validityMessage).toBe('');
      expect(el.shadowRoot!.querySelector('#validation-msg')).toBeNull();
    });
  });
});


