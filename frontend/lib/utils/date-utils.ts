/**
 * Format a date as a readable string with US locale
 * @param date - ISO date string or Date object
 * @returns Formatted date string (e.g., "Apr 26, 2026, 02:30 PM")
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US');
}
