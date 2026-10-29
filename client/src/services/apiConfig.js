/**
 * Athenaeum Library Management System
 * API Configuration & Centralized Base URL
 * 
 * In production (e.g. Vercel), VITE_API_BASE_URL points to the deployed backend (e.g. Render).
 * In local development, if VITE_API_BASE_URL is unset, it defaults to '' (empty string),
 * allowing relative /api requests to be proxied by Vite dev server to http://localhost:8080.
 */

const rawBaseUrl = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).trim()
    : ''
);

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

/**
 * Resolves an API endpoint path to a relative path (in dev) or absolute URL (in prod).
 * 
 * @param {string} endpoint e.g. '/api/books' or 'api/auth/login'
 * @returns {string} e.g. 'https://athenaeum.onrender.com/api/books' or '/api/books'
 */
export function buildApiUrl(endpoint) {
  const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}

