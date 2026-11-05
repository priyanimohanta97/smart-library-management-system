/**
 * Athenaeum Library Management System
 * Book Catalog Service
 * 
 * Interacts with the backend book catalog API (/api/books).
 * Authoritative MongoDB database inventory with live copy counts and archive lifecycle.
 */

import { buildApiUrl } from './apiConfig.js';
import { getAuthHeaders } from './authService.js';

/**
 * Fetches books from the authoritative database catalogue.
 * Supports keyword search, discipline/category filtering, and optional archived inclusion for admins.
 * 
 * @param {Object} [params]
 * @param {string} [params.search]
 * @param {string} [params.category]
 * @param {boolean} [params.includeArchived]
 * @returns {Promise<Array<Object>>}
 */
export async function fetchBooks({ search, category, includeArchived } = {}) {
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
  if (includeArchived) {
    url.searchParams.set('includeArchived', 'true');
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
    });
  } catch (networkError) {
    throw new Error(
      'Unable to connect to the library catalogue server. Please ensure the backend service is running.'
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
        ...getAuthHeaders(),
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

/**
 * Creates a new volume entry in the library catalogue.
 * Restricted to ADMIN and MANAGER accounts.
 * 
 * @param {Object} bookData
 * @param {string} bookData.title
 * @param {string} bookData.author
 * @param {string} bookData.category
 * @param {string} [bookData.callNumber]
 * @param {number} [bookData.totalCopies]
 * @param {string} [bookData.location]
 * @param {string} [bookData.synopsis]
 * @param {number} [bookData.publicationYear]
 * @returns {Promise<Object>} The newly created BookResponse
 */
export async function createBook(bookData) {
  if (!bookData || !bookData.title?.trim() || !bookData.author?.trim()) {
    throw new Error('Title and Author are required to register a new book.');
  }

  let response;
  try {
    response = await fetch(buildApiUrl('/api/books'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(bookData),
    });
  } catch (networkError) {
    throw new Error('Unable to connect to the catalogue service. Please verify backend connectivity.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 400) {
      throw new Error(errorData?.message || 'Invalid book metadata provided.');
    }
    if (response.status === 401) {
      throw new Error('Authentication expired or missing. Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Only librarians and administrators can add books.');
    }
    if (response.status === 409) {
      throw new Error(errorData?.message || 'A book with this title/author or call number already exists.');
    }
    throw new Error(errorData?.message || `Failed to create book entry (HTTP ${response.status}).`);
  }

  return response.json();
}

/**
 * Archives an existing book in the catalogue without permanent deletion.
 * Restricted to ADMIN and MANAGER accounts.
 * 
 * @param {string} bookId
 * @returns {Promise<Object>} The updated BookResponse
 */
export async function archiveBook(bookId) {
  if (!bookId) {
    throw new Error('Book ID is required to archive a volume.');
  }

  let response;
  try {
    response = await fetch(buildApiUrl(`/api/books/${bookId}/archive`), {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        ...getAuthHeaders(),
      },
    });
  } catch (networkError) {
    throw new Error('Unable to connect to the catalogue service. Please verify backend connectivity.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401) {
      throw new Error('Authentication expired or missing. Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('Forbidden: Only librarians and administrators can archive books.');
    }
    if (response.status === 404) {
      throw new Error('Book not found in catalogue.');
    }
    if (response.status === 409) {
      throw new Error(errorData?.message || 'Cannot archive: book is already archived or has active loans.');
    }
    throw new Error(errorData?.message || `Failed to archive book (HTTP ${response.status}).`);
  }

  return response.json();
}
