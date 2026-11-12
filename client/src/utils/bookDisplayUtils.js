/**
 * Pure utility helpers for formatting book metadata, computing live category counts,
 * and filtering/sorting active catalogue entries cleanly.
 */

/**
 * Checks whether a string value contains meaningful non-whitespace text.
 * Rejects null, undefined, empty strings, and whitespace-only strings.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function hasMeaningfulText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Checks whether a numeric value is present and valid (preserves numeric 0).
 * Rejects null, undefined, empty strings, booleans, and NaN.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function hasNumericValue(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  const num = Number(value);
  return Number.isFinite(num);
}

/**
 * Formats an integer volume count into a grammatically accurate label.
 *
 * @param {number} count
 * @returns {string}
 */
export function formatVolumeCount(count) {
  const safeCount = Number.isFinite(Number(count)) && Number(count) >= 0 ? Math.floor(Number(count)) : 0;
  return `${safeCount} ${safeCount === 1 ? 'Volume' : 'Volumes'}`;
}

/**
 * Computes actual non-archived book counts keyed by normalized category ID.
 *
 * @param {Array<Object>} books
 * @returns {Record<string, number>}
 */
export function computeCategoryBookCounts(books) {
  const counts = {};
  if (!Array.isArray(books)) {
    return counts;
  }

  for (const book of books) {
    if (!book || book.archived) continue;
    const categoryId = typeof book.category === 'string' ? book.category.trim().toLowerCase() : '';
    if (categoryId) {
      counts[categoryId] = (counts[categoryId] || 0) + 1;
    }
  }

  return counts;
}

/**
 * Filters and sorts active catalogue books based on search query, category,
 * availability, and sort order. Explicitly excludes archived books.
 *
 * @param {Array<Object>} books
 * @param {Object} [options]
 * @param {string} [options.searchQuery]
 * @param {string} [options.selectedCategory]
 * @param {boolean} [options.onlyAvailable]
 * @param {string} [options.sortBy]
 * @returns {Array<Object>}
 */
export function filterAndSortCatalogBooks(
  books,
  {
    searchQuery = '',
    selectedCategory = 'all',
    onlyAvailable = false,
    sortBy = 'default',
  } = {}
) {
  const list = Array.isArray(books) ? books : [];
  const normalizedQuery = typeof searchQuery === 'string' ? searchQuery.toLowerCase().trim() : '';

  return list
    .filter((book) => {
      if (!book || book.archived) return false;

      if (normalizedQuery) {
        const matchesTitle = book.title?.toLowerCase().includes(normalizedQuery);
        const matchesAuthor = book.author?.toLowerCase().includes(normalizedQuery);
        const matchesCall = book.callNumber?.toLowerCase().includes(normalizedQuery);
        const matchesCategory = book.categoryLabel?.toLowerCase().includes(normalizedQuery);
        const matchesTags = Array.isArray(book.tags)
          ? book.tags.some((t) => typeof t === 'string' && t.toLowerCase().includes(normalizedQuery))
          : (typeof book.tags === 'string' && book.tags.toLowerCase().includes(normalizedQuery));
        const matchesSynopsis = book.synopsis?.toLowerCase().includes(normalizedQuery);

        if (!matchesTitle && !matchesAuthor && !matchesCall && !matchesCategory && !matchesTags && !matchesSynopsis) {
          return false;
        }
      }

      if (selectedCategory && selectedCategory !== 'all') {
        const bookCat = typeof book.category === 'string' ? book.category.trim().toLowerCase() : '';
        if (bookCat !== selectedCategory.trim().toLowerCase()) {
          return false;
        }
      }

      if (onlyAvailable && book.status !== 'Available') {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'year-desc') return (b.year || b.publicationYear || 0) - (a.year || a.publicationYear || 0);
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      return 0;
    });
}

