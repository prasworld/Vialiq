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
