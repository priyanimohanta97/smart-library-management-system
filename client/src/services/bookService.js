/**
 * Athenaeum Library Management System
 * Book Catalog Service
 * 
 * Interacts with the backend book catalog API (/api/books).
 * Authoritative MySQL database inventory with live copy counts.
 */

import { buildApiUrl } from './apiConfig.js';

/**
 * Fetches books from the authoritative database catalogue.
 * Supports keyword search and discipline/category filtering.
 * 
 * @param {Object} [params]
 * @param {string} [params.search]
 * @param {string} [params.category]
 * @returns {Promise<Array<Object>>}
 */
export async function fetchBooks({ search, category } = {}) {
  const basePath = buildApiUrl('/api/books');
  const baseOrigin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost';
  const url = basePath.startsWith('http://') || basePath.startsWith('https://')
    ? new URL(basePath)
    : new URL(basePath, baseOrigin);

  if (search && search.trim()) {
    url.searchParams.set('search', search.trim());
  }
  if (category && category.trim() && category !== 'all') {
    url.searchParams.set('category', category.trim());
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (networkError) {
    throw new Error(
      'Unable to connect to the library catalogue server. Please ensure the backend service is running on port 8080.'
    );
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch catalogue (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * Fetches a single book by its unique database ID.
 * 
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export async function fetchBookById(id) {
  if (!id) {
    throw new Error('Book ID is required.');
  }

  let response;
  try {
    response = await fetch(buildApiUrl(`/api/books/${id}`), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (networkError) {
    throw new Error(
      'Unable to connect to the library catalogue server. Please ensure the backend service is running.'
    );
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('The requested book was not found in the library catalog.');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Failed to fetch book details (HTTP ${response.status}).`);
  }

  return response.json();
}
