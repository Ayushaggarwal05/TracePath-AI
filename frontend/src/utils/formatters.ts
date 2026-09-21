export function formatShortSha(sha?: string): string {
  if (!sha) return '—';
  return sha.slice(0, 7);
}

/**
 * Robustly parses any ISO date string, UTC string, naive datetime string, or Date object.
 * If the input string has no timezone designator (Z or +/-HH:MM), it safely treats it as UTC,
 * preventing browser timezone skew bugs where UTC timestamps are mistaken for local time.
 */
export function parseDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;

  let str = String(dateInput).trim();
  if (!str || str === '—' || str === 'Never') return null;

  // Replace space with 'T' if format is "YYYY-MM-DD HH:mm:ss"
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}/.test(str)) {
    str = str.replace(' ', 'T');
  }

  // If string has date & time without any timezone offset indicator (Z, +HH:MM, -HH:MM), treat as UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(str) && !/([Zz]|[+-]\d{2}:?\d{2})$/.test(str)) {
    str += 'Z';
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date into a localized, user-friendly string (e.g. "Sep 21, 6:18 PM").
 * Accurately translates UTC timestamps into the user's local browser timezone.
 */
export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return '—';
  try {
    const date = parseDate(dateString);
    if (!date) return String(dateString);

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return String(dateString);
  }
}

/**
 * Formats full timestamp with year and time for detailed tooltips and modals.
 */
export function formatFullDateTime(dateString?: string | Date | null): string {
  if (!dateString) return '—';
  try {
    const date = parseDate(dateString);
    if (!date) return String(dateString);

    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return String(dateString);
  }
}

/**
 * Computes human-readable relative time (e.g. "just now", "2m ago", "1h ago")
 * accurately comparing against the user's current local clock.
 */
export function formatTimeAgo(dateString?: string | Date | null): string {
  if (!dateString) return '—';
  try {
    const date = parseDate(dateString);
    if (!date) return String(dateString);

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Guard against slight client/server clock skew
    if (diffMs < 0 && diffMs > -60000) return 'just now';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 45) return 'just now';
    if (diffSec < 90) return '1m ago';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr === 1) return '1h ago';
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return 'yesterday';
    if (diffDay < 30) return `${diffDay}d ago`;
    return formatDate(date);
  } catch {
    return String(dateString);
  }
}

/**
 * Formats execution runtime duration in seconds.
 */
export function formatDuration(startTime?: string | Date | null, endTime?: string | Date | null): string {
  if (!startTime || !endTime) return '—';
  try {
    const start = parseDate(startTime);
    const end = parseDate(endTime);
    if (!start || !end) return '—';

    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const diffSec = (diffMs / 1000).toFixed(1);
    return `${diffSec}s`;
  } catch {
    return '—';
  }
}
