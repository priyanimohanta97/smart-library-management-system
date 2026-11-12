/**
 * Shared connectivity helpers for distinguishing genuine network failures
 * from application-level HTTP responses (e.g. 401/403/400/409) and evaluating
 * multi-endpoint dashboard availability without extra health-check requests.
 */

export function createConnectivityNetworkError(message, cause) {
  const error = new Error(message);
  error.isNetworkError = true;
  if (cause !== undefined) {
    error.cause = cause;
  }
  return error;
}

export function isNetworkConnectivityError(error) {
  if (!error) return false;
  if (error.isNetworkError === true) return true;
  if (typeof error.status === 'number') return false;
  if (error.name === 'TypeError' && typeof error.message === 'string') {
    const msg = error.message.toLowerCase();
    return msg.includes('fetch') || msg.includes('network');
  }
  return false;
}

/**
 * Evaluates Promise.allSettled results across circulation endpoints.
 * Returns:
 * - 'online' when all requests succeed
 * - 'degraded' when at least one succeeds and at least one fails
 * - 'offline' when zero requests succeed (or input is empty/invalid)
 */
export function evaluateCirculationConnectivity(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return 'offline';
  }
  const fulfilledCount = results.filter((result) => result?.status === 'fulfilled').length;
  if (fulfilledCount === results.length) return 'online';
  if (fulfilledCount > 0) return 'degraded';
  return 'offline';
}

/**
 * Resolves the display state for LibrarianDashboard's database status badge.
 * Returns: 'connecting' | 'online' | 'degraded' | 'offline'
 */
export function resolveLibrarianConnectivityState({
  isCheckingBackend = false,
  isLoadingCirculation = false,
  isBackendOnline = true,
  circulationStatus = 'online',
} = {}) {
  if (isCheckingBackend || isLoadingCirculation) {
    return 'connecting';
  }
  if (circulationStatus === 'offline') {
    return 'offline';
  }
  if (!isBackendOnline || circulationStatus === 'degraded') {
    return 'degraded';
  }
  return 'online';
}

