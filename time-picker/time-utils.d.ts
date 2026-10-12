import { TimeComponents, TimeFormat } from './types.js';
export declare function pad2(n: number | string): string;
/**
 * Returns true if the string represents an unknown clinical time (CDISC SDTM format).
 */
/**
 * Returns true if the string represents a fully unknown clinical time (CDISC SDTM format).
 */
export declare function isUnknownTime(value: string | null | undefined): boolean;
/**
 * Parses a CDISC SDTM partial unknown time string (e.g. "14:??", "??:30", "14:??:??", "02:?? PM")
 * according to CDISC grammar and numeric range rules.
 *
 * Grammar:
 * - 2-segment: (\d{1,2}|??):(\d{2}|??)( AM|PM)?
 * - 3-segment: (\d{1,2}|??):(\d{2}|??):(\d{2}|??)( AM|PM)?
 *
 * Range & Wildcard Rules:
 * - Must contain at least one wildcard '??' segment.
 * - Must NOT be fully unknown (where all present segments are '??', e.g. "??:??" or "??:??:??").
 * - Numeric hours with period: 1–12.
 * - Numeric hours without period: 0–23.
 * - Numeric minutes: 0–59.
 * - Numeric seconds: 0–59.
 *
 * Returns normalized TimeComponents if valid, or null if malformed or out of range.
 */
export declare function parsePartialTime(value: string | null | undefined, format?: TimeFormat): TimeComponents | null;
/**
 * Returns true if the string represents a valid partially unknown clinical time (e.g. "14:??" or "??:30")
 * conforming to CDISC SDTM grammar and numeric ranges.
 */
export declare function isPartialUnknownTime(value: string | null | undefined, format?: TimeFormat): boolean;
/**
 * Converts a 12-hour clock value with period into a 24-hour number (0–23).
 */
export declare function to24Hour(hours: number, period?: 'AM' | 'PM'): number;
/**
 * Converts a 24-hour number (0–23) into 12-hour clock values (1–12) with period.
 */
export declare function to12Hour(hours24: number): {
    hours: number;
    period: 'AM' | 'PM';
};
/**
 * Parses any time string ("14:30", "14:30:45", "02:30 PM", "2:30:15 am", "14:??", "??:30")
 * into normalized components.
 */
export declare function parseTime(value: string | null | undefined, format?: TimeFormat): TimeComponents | null;
/**
 * Parses pasted clipboard strings across standard, 12h, military continuous (1430), and partial formats.
 */
export declare function parsePastedTime(pastedText: string, format?: TimeFormat): TimeComponents | null;
/**
 * Formats time components into display string based on format ('12' or '24').
 */
export declare function formatTime(components: TimeComponents | null, format?: TimeFormat, showSeconds?: boolean): string;
/**
 * Produces a standardized 24-hour ISO string ("14:30" or "14:30:00"), with optional timezone.
 */
export declare function toIsoTime(components: TimeComponents | null, showSeconds?: boolean, timezone?: string): string | null;
/**
 * Converts a time string or components into seconds from midnight (0–86399).
 */
export declare function timeToSeconds(timeStr: string): number | null;
/**
 * Compares two time strings. Returns:
 * < 0 if a < b
 * = 0 if a === b
 * > 0 if a > b
 */
export declare function compareTimes(a: string, b: string): number;
/**
 * Increments or decrements a number with wrap-around within [min, max].
 */
export declare function stepSegment(val: number, step: number, min: number, max: number, direction: 'up' | 'down'): number;
//# sourceMappingURL=time-utils.d.ts.map