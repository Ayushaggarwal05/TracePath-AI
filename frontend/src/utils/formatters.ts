export function formatShortSha(sha?: string): string {
  if (!sha) return '—';
  return sha.slice(0, 7);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function formatDuration(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return '—';
  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const diffMs = Math.max(0, end - start);
    const diffSec = (diffMs / 1000).toFixed(1);
    return `${diffSec}s`;
  } catch {
    return '—';
  }
}
