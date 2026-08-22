/**
 * Calculates the ISO 8601 week number of a given date.
 * ISO week starts on Monday, and the first week of the year is the one
 * that contains the first Thursday of the year (or Jan 4).
 *
 * @param date The Date object to calculate the ISO week for.
 * @returns The ISO 8601 week number (1-53).
 */
export declare function getISOWeek(date: Date): number;
/**
 * Parses an ISO 8601 week string (YYYY-Www) into a Date object.
 * Returns the Monday of that week.
 *
 * @param isoWeekString The string in format YYYY-Www
 * @returns A Date object representing the Monday of the given week, or null if invalid.
 */
export declare function parseISOWeek(isoWeekString: string): Date | null;
//# sourceMappingURL=iso-week.d.ts.map