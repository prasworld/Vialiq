import type { SegmentOrder, PartialDateValue, DatePickerMode } from './types.js';

/** Resolves the effective BCP 47 locale tag. */
export function resolveLocale(localeAttr: string | null): string {
  if (localeAttr) return localeAttr;
  if (typeof navigator !== 'undefined' && navigator.language) return navigator.language;
  return 'en';
}

/** Reads the browser's IANA time zone from Intl. */
export function resolveTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
}

/** 
 * Returns the localized word for "Today" (e.g. "today", "hoy", "aujourd'hui")
 * capitalized properly using native Intl formatting.
 */
export function getTodayLabel(locale: string): string {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const today = rtf.format(0, 'day'); 
    return today.charAt(0).toUpperCase() + today.slice(1);
  } catch (e) {
    return 'Today';
  }
}

/**
 * Derives the segment order from the locale using the browser's Intl API,
 * or from an explicit format string.
 * Formats a known reference date and reads back the field order from the parts.
 * Reference: 2001-01-02 — day=2, month=1, year=2001
 */
export function resolveSegmentOrder(locale: string, format?: string): SegmentOrder {
  if (format) {
    const dIdx = format.indexOf('DD');
    const mIdx = format.indexOf('MM');
    const yIdx = format.indexOf('YYYY');
    
    // If format is valid and contains all parts, derive order
    if (dIdx !== -1 && mIdx !== -1 && yIdx !== -1) {
      const parts = [
        { type: 'D', idx: dIdx },
        { type: 'M', idx: mIdx },
        { type: 'Y', idx: yIdx }
      ].sort((a, b) => a.idx - b.idx);
      
      return parts.map(p => p.type).join('') as SegmentOrder;
    }
  }

  const ref = new Date(2001, 0, 2); // Jan 2 2001
  const parts = new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'numeric', year: 'numeric',
  }).formatToParts(ref);

  const order = parts
    .filter(p => p.type === 'day' || p.type === 'month' || p.type === 'year')
    .map(p => p.type[0].toUpperCase()) // 'D' | 'M' | 'Y'
    .join('');

  // Fallback to DMY if parsing fails for some reason
  return (order.length === 3 ? order : 'DMY') as SegmentOrder;
}

const FMT_OPTIONS_BY_MODE: Record<DatePickerMode, Intl.DateTimeFormatOptions> = {
  date: { day: 'numeric', month: 'long', year: 'numeric' },
  month: { month: 'long', year: 'numeric' },
  'month-year': { month: 'long', year: 'numeric' },
  year: { year: 'numeric' },
  range: { day: 'numeric', month: 'short', year: 'numeric' },
  week: { year: 'numeric', month: 'short', day: 'numeric' } // Fallback, usually overridden by custom week display
};

export function formatDisplay(date: Date, locale: string, mode: DatePickerMode, formatStr?: string): string {
  if (formatStr && /^([yYmMdD\-\/\.\s]+)$/.test(formatStr)) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let res = formatStr.replace(/y{4}|Y{4}|y{2}|Y{2}|y|Y|m{4}|M{4}|m{3}|M{3}|m{2}|M{2}|m|M|d{2}|D{2}|d|D/g, (match) => {
      switch (match) {
        case 'yyyy': case 'YYYY': return year.toString();
        case 'yy': case 'YY': return year.toString().slice(-2);
        case 'y': case 'Y': return year.toString();
        case 'mmmm': case 'MMMM': return new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
        case 'mmm': case 'MMM': return new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
        case 'mm': case 'MM': return month.toString().padStart(2, '0');
        case 'm': case 'M': return month.toString();
        case 'dd': case 'DD': return day.toString().padStart(2, '0');
        case 'd': case 'D': return day.toString();
        default: return match;
      }
    });

    return res;
  }

  const opts = FMT_OPTIONS_BY_MODE[mode] || FMT_OPTIONS_BY_MODE.date;
  return new Intl.DateTimeFormat(locale, opts).format(date);
}

export function formatPartialDate(v: PartialDateValue, locale: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    ...(v.month !== null && { month: 'long' }),
    ...(v.day !== null && { day: 'numeric' }),
  };
  const ref = new Date(v.year, (v.month ?? 1) - 1, v.day ?? 1);
  return new Intl.DateTimeFormat(locale, opts).format(ref);
}
