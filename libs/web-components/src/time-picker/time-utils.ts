import type { TimeComponents, TimeFormat } from './types.js';

export function pad2(n: number | string): string {
  return String(Math.floor(Number(n))).padStart(2, '0');
}

/**
 * Returns true if the string represents an unknown clinical time (CDISC SDTM format).
 */
/**
 * Returns true if the string represents a fully unknown clinical time (CDISC SDTM format).
 */
export function isUnknownTime(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed === '??:??' || trimmed === '??:??:??';
}

/**
 * Returns true if the string represents a partially unknown clinical time (e.g. "14:??" or "??:30").
 */
export function isPartialUnknownTime(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (isUnknownTime(trimmed)) return false;
  return trimmed.includes('??');
}

/**
 * Converts a 12-hour clock value with period into a 24-hour number (0–23).
 */
export function to24Hour(hours: number, period?: 'AM' | 'PM'): number {
  if (!period) return Math.min(23, Math.max(0, hours));
  if (period === 'AM') {
    return hours === 12 ? 0 : hours;
  }
  // PM
  return hours === 12 ? 12 : hours + 12;
}

/**
 * Converts a 24-hour number (0–23) into 12-hour clock values (1–12) with period.
 */
export function to12Hour(hours24: number): {
  hours: number;
  period: 'AM' | 'PM';
} {
  const normalized = ((hours24 % 24) + 24) % 24;
  const period: 'AM' | 'PM' = normalized >= 12 ? 'PM' : 'AM';
  const hours = normalized % 12 || 12;
  return { hours, period };
}

/**
 * Parses any time string ("14:30", "14:30:45", "02:30 PM", "2:30:15 am", "14:??", "??:30")
 * into normalized components.
 */
export function parseTime(
  value: string | null | undefined,
  format: TimeFormat = '24',
): TimeComponents | null {
  if (!value || isUnknownTime(value)) return null;
  const trimmed = value.trim();

  // Handle partial unknown time (CDISC SDTM wildcards: e.g. "14:??", "??:30", "14:??:??")
  if (trimmed.includes('??')) {
    const parts = trimmed.split(/[:\s]+/);
    const rawH = parts[0] || '??';
    const rawM = parts[1] || '??';
    const rawS = parts[2] && parts[2] !== 'AM' && parts[2] !== 'PM' ? parts[2] : undefined;
    const periodMatch = trimmed.match(/(AM|PM)$/i);
    const period = periodMatch ? (periodMatch[1].toUpperCase() as 'AM' | 'PM') : undefined;

    const numH = rawH === '??' ? null : parseInt(rawH, 10);
    const numM = rawM === '??' ? null : parseInt(rawM, 10);
    const numS = rawS === undefined ? undefined : rawS === '??' ? null : parseInt(rawS, 10);

    return {
      hours: numH,
      minutes: numM,
      seconds: numS,
      period,
      rawHours: rawH,
      rawMinutes: rawM,
      rawSeconds: rawS,
      isPartial: true,
    };
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] !== undefined ? parseInt(match[3], 10) : undefined;
  const rawPeriod = match[4]?.toUpperCase() as 'AM' | 'PM' | undefined;

  if (minutes < 0 || minutes > 59) return null;
  if (seconds !== undefined && (seconds < 0 || seconds > 59)) return null;

  if (rawPeriod) {
    if (hours < 1 || hours > 12) return null;
    if (format === '24') {
      hours = to24Hour(hours, rawPeriod);
      return { hours, minutes, seconds };
    }
    return { hours, minutes, seconds, period: rawPeriod };
  }

  // No explicit period in the string:
  if (format === '12') {
    if (hours > 12) {
      const converted = to12Hour(hours);
      return {
        hours: converted.hours,
        minutes,
        seconds,
        period: converted.period,
      };
    }
    return {
      hours: hours === 0 ? 12 : hours,
      minutes,
      seconds,
      period: 'AM',
    };
  }

  // 24-hour format
  if (hours < 0 || hours > 23) return null;
  return { hours, minutes, seconds };
}

/**
 * Parses pasted clipboard strings across standard, 12h, military continuous (1430), and partial formats.
 */
export function parsePastedTime(
  pastedText: string,
  format: TimeFormat = '24',
): TimeComponents | null {
  if (!pastedText) return null;
  const clean = pastedText.trim();

  // 1. Direct standard or partial parse
  const direct = parseTime(clean, format);
  if (direct) return direct;

  // 2. Fully unknown
  if (isUnknownTime(clean)) {
    return {
      hours: null,
      minutes: null,
      seconds: null,
      rawHours: '??',
      rawMinutes: '??',
      rawSeconds: '??',
      isPartial: false,
    };
  }

  // 3. Compact military format (no colons): "1430", "0930", "930", "143045"
  const digitsOnly = clean.match(/^(\d{3,6})(?:\s*(AM|PM))?$/i);
  if (digitsOnly) {
    const rawDigits = digitsOnly[1];
    const period = digitsOnly[2]?.toUpperCase() as 'AM' | 'PM' | undefined;

    let hStr = '';
    let mStr = '';
    let sStr: string | undefined = undefined;

    if (rawDigits.length === 3) {
      // e.g. "930" -> "09:30"
      hStr = rawDigits.slice(0, 1);
      mStr = rawDigits.slice(1, 3);
    } else if (rawDigits.length === 4) {
      // e.g. "1430"
      hStr = rawDigits.slice(0, 2);
      mStr = rawDigits.slice(2, 4);
    } else if (rawDigits.length === 6) {
      // e.g. "143045"
      hStr = rawDigits.slice(0, 2);
      mStr = rawDigits.slice(2, 4);
      sStr = rawDigits.slice(4, 6);
    }

    if (hStr && mStr) {
      const synthetic = `${hStr}:${mStr}${sStr ? `:${sStr}` : ''}${period ? ` ${period}` : ''}`;
      return parseTime(synthetic, format);
    }
  }

  return null;
}

/**
 * Formats time components into display string based on format ('12' or '24').
 */
export function formatTime(
  components: TimeComponents | null,
  format: TimeFormat = '24',
  showSeconds = false,
): string {
  if (!components) return '';

  const hStr =
    components.rawHours !== undefined && components.rawHours !== ''
      ? components.rawHours
      : components.hours !== null && components.hours !== undefined
        ? pad2(components.hours)
        : '??';
  const mStr =
    components.rawMinutes !== undefined && components.rawMinutes !== ''
      ? components.rawMinutes
      : components.minutes !== null && components.minutes !== undefined
        ? pad2(components.minutes)
        : '??';
  const sStr =
    components.rawSeconds !== undefined && components.rawSeconds !== ''
      ? components.rawSeconds
      : components.seconds !== null && components.seconds !== undefined
        ? pad2(components.seconds)
        : '??';

  if (format === '12') {
    const period = components.period || 'AM';
    const base = `${hStr}:${mStr}`;
    return showSeconds ? `${base}:${sStr} ${period}` : `${base} ${period}`;
  }

  const base = `${hStr}:${mStr}`;
  return showSeconds ? `${base}:${sStr}` : base;
}

/**
 * Produces a standardized 24-hour ISO string ("14:30" or "14:30:00"), with optional timezone.
 */
export function toIsoTime(
  components: TimeComponents | null,
  showSeconds = false,
  timezone = '',
): string | null {
  if (!components) return null;

  const hStr =
    components.hours !== null && components.hours !== undefined
      ? pad2(
          components.period !== undefined
            ? to24Hour(components.hours, components.period)
            : components.hours,
        )
      : components.rawHours || '??';

  const mStr =
    components.minutes !== null && components.minutes !== undefined
      ? pad2(components.minutes)
      : components.rawMinutes || '??';

  const sStr =
    components.seconds !== null && components.seconds !== undefined
      ? pad2(components.seconds)
      : components.rawSeconds || (showSeconds ? '00' : '');

  let base = `${hStr}:${mStr}`;
  if (showSeconds) {
    base = `${base}:${sStr}`;
  }

  if (!timezone) return base;

  const tz = timezone.trim();
  if (tz === 'UTC' || tz === 'Z') {
    return `${base}Z`;
  }
  if (/^[+-]\d{2}(?::?\d{2})?$/.test(tz)) {
    return `${base}${tz}`;
  }
  return `${base} [${tz}]`;
}

/**
 * Converts a time string or components into seconds from midnight (0–86399).
 */
export function timeToSeconds(timeStr: string): number | null {
  const parsed = parseTime(timeStr);
  if (!parsed || parsed.hours === null || parsed.minutes === null) return null;
  const h24 =
    parsed.period !== undefined
      ? to24Hour(parsed.hours, parsed.period)
      : parsed.hours;
  return h24 * 3600 + parsed.minutes * 60 + (parsed.seconds ?? 0);
}

/**
 * Compares two time strings. Returns:
 * < 0 if a < b
 * = 0 if a === b
 * > 0 if a > b
 */
export function compareTimes(a: string, b: string): number {
  const secA = timeToSeconds(a);
  const secB = timeToSeconds(b);
  if (secA === null || secB === null) return 0;
  return secA - secB;
}

/**
 * Increments or decrements a number with wrap-around within [min, max].
 */
export function stepSegment(
  val: number,
  step: number,
  min: number,
  max: number,
  direction: 'up' | 'down',
): number {
  const range = max - min + 1;
  const delta = direction === 'up' ? step : -step;
  const next = val + delta;
  return ((((next - min) % range) + range) % range) + min;
}
