/**
 * Formats an ISO timestamp string into a concise relative time label
 * (e.g., 'Just now', '5m ago', '2h ago', '3d ago', or 'Nov 12').
 *
 * @param {string|Date} dateString
 * @param {Date} [referenceNow] Optional reference timestamp for deterministic testing
 * @returns {string}
 */
export function formatRelativeTime(dateString, referenceNow = new Date()) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const diffInSeconds = Math.floor((referenceNow.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'Just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

