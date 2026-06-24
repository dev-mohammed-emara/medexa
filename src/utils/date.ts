import { format, parseISO, isValid } from 'date-fns';

/**
 * Ensures the input is converted into a valid Date object.
 * Returns null if the input is completely invalid or missing.
 */
function parseSafeDate(date: string | Date | number | any[] | null | undefined): Date | null {
  if (date === null || date === undefined || date === '') return null;

  let d: Date;
  if (Array.isArray(date)) {
    // Handle Spring Boot / Jackson array serialization: [YYYY, MM, DD, HH, mm, ss]
    const [year, month, day, hour = 0, minute = 0, second = 0] = date;
    d = new Date(year, month - 1, day, hour, minute, second);
  } else if (typeof date === 'string') {
    // Attempt to parse ISO string natively
    d = parseISO(date);
    if (!isValid(d)) {
      // Fallback for native string dates (e.g., '2026/06/24')
      d = new Date(date);
    }
  } else {
    d = new Date(date);
  }

  return isValid(d) ? d : null;
}

/**
 * Formats a date specifically for UI display to the user.
 * Format: YYYY/MM/DD
 */
export function formatDateDisplay(date: string | Date | number | any[] | null | undefined, fallback = '-'): string {
  const d = parseSafeDate(date);
  if (!d) return fallback;
  return format(d, 'yyyy/MM/dd');
}

/**
 * Formats a date and time specifically for UI display to the user.
 * Format: YYYY/MM/DD HH:mm
 */
export function formatDateTimeDisplay(date: string | Date | number | any[] | null | undefined, fallback = '-'): string {
  const d = parseSafeDate(date);
  if (!d) return fallback;
  return format(d, 'yyyy/MM/dd HH:mm');
}

/**
 * Formats a date specifically for backend API payloads.
 * Format: YYYY-MM-DD
 */
export function formatDateApi(date: string | Date | number | any[] | null | undefined): string | null {
  const d = parseSafeDate(date);
  if (!d) return null;
  return format(d, 'yyyy-MM-dd');
}

/**
 * Formats a time string (e.g. "09:00:00") for UI display ("09:00").
 */
export function formatTimeDisplay(timeStr: string | null | undefined, fallback = '-'): string {
  if (!timeStr || typeof timeStr !== 'string') return fallback;
  return timeStr.substring(0, 5); // Usually enough to grab HH:mm
}
