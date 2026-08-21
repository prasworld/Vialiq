/**
 * Calculates the ISO 8601 week number of a given date.
 * ISO week starts on Monday, and the first week of the year is the one
 * that contains the first Thursday of the year (or Jan 4).
 *
 * @param date The Date object to calculate the ISO week for.
 * @returns The ISO 8601 week number (1-53).
 */
export function getISOWeek(date: Date): number {
  const dt = new Date(date.valueOf());
  
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  const dayn = (date.getDay() + 6) % 7;
  dt.setDate(dt.getDate() - dayn + 3);
  
  // Return the calculated week number
  const firstThursday = dt.valueOf();
  
  // Set to January 1 of the nearest Thursday's year
  dt.setMonth(0, 1);
  if (dt.getDay() !== 4) {
    dt.setMonth(0, 1 + ((4 - dt.getDay()) + 7) % 7);
  }
  
  // Calculate week number
  return 1 + Math.ceil((firstThursday - dt.valueOf()) / 604800000);
}

/**
 * Parses an ISO 8601 week string (YYYY-Www) into a Date object.
 * Returns the Monday of that week.
 *
 * @param isoWeekString The string in format YYYY-Www
 * @returns A Date object representing the Monday of the given week, or null if invalid.
 */
export function parseISOWeek(isoWeekString: string): Date | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeekString);
  if (!match) return null;
  
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  
  if (week < 1 || week > 53) return null;

  // Jan 4 is always in ISO week 1.
  const jan4 = new Date(year, 0, 4);
  // Find Monday of week 1
  const dayn = (jan4.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const week1Monday = new Date(year, 0, 4 - dayn);
  
  // Add (week - 1) weeks
  week1Monday.setDate(week1Monday.getDate() + (week - 1) * 7);
  return week1Monday;
}
