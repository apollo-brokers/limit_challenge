const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });
const costFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** Font stack for VINs and other fixed-width identifiers. */
export const MONO_FONT = 'var(--font-geist-mono), monospace';

function parseDay(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

/** Format an API date (`YYYY-MM-DD`) without shifting it to the browser time zone. */
export function formatDate(iso: string): string {
  return dateFormat.format(parseDay(iso));
}

/** Format an API decimal string (or number) as US dollars. */
export function formatCost(value: string | number): string {
  return costFormat.format(Number(value));
}

/** Whole days from an API date until today, both taken as UTC calendar days. */
export function daysSince(iso: string): number {
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((today - parseDay(iso).getTime()) / 86_400_000);
}

/** Today in the browser time zone, as an API date (`YYYY-MM-DD`). */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
