import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  hasMeaningfulText,
  hasNumericValue,
  formatVolumeCount,
  computeCategoryBookCounts,
  filterAndSortCatalogBooks,
} from '../utils/bookDisplayUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readComponent(relativePath) {
  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');
}

describe('Frontend Book Data Cleanup & Metadata Integrity Suite', () => {
  const categorySectionSrc = readComponent('../components/CategorySection.jsx');
  const bookCardSrc = readComponent('../components/BookCard.jsx');
  const bookCollectionSrc = readComponent('../components/BookCollection.jsx');
  const bookDetailModalSrc = readComponent('../components/BookDetailModal.jsx');
  const searchBarSrc = readComponent('../components/SearchBar.jsx');
  const studentDashboardSrc = readComponent('../components/StudentDashboard.jsx');
  const publicCatalogSrc = readComponent('../components/PublicCatalog.jsx');

  describe('1. Dynamic Category Book Counts', () => {
    it('computes accurate category counts from live catalogue records and excludes archived books', () => {
      const books = [
        { id: '1', title: 'SICP', category: 'ai-computing', archived: false },
        { id: '2', title: 'Clean Code', category: 'ai-computing' },
        { id: '3', title: 'Old CS Book', category: 'ai-computing', archived: true },
        { id: '4', title: 'Meditations', category: 'philosophy', archived: false },
        { id: '5', title: 'Order of Time', category: 'science-nature', archived: false },
      ];

      const counts = computeCategoryBookCounts(books);
      assert.equal(counts['ai-computing'], 2);
      assert.equal(counts['philosophy'], 1);
      assert.equal(counts['science-nature'], 1);
      assert.equal(counts['classical-lit'] || 0, 0);
      assert.equal(counts['economics-society'] || 0, 0);

      assert.equal(formatVolumeCount(counts['ai-computing']), '2 Volumes');
      assert.equal(formatVolumeCount(counts['philosophy']), '1 Volume');
      assert.equal(formatVolumeCount(0), '0 Volumes');
    });

    it('StudentDashboard passes live catalogBooks into CategorySection', () => {
      assert.match(studentDashboardSrc, /<CategorySection[\s\S]*books=\{catalogBooks\}/);
      assert.ok(categorySectionSrc.includes('computeCategoryBookCounts(books)'));
    });
  });

  describe('2. Empty Catalogue Gracefully Displays Zero Counts', () => {
    it('returns empty counts for empty or null catalogues without fabricated numbers', () => {
      assert.deepEqual(computeCategoryBookCounts([]), {});
      assert.deepEqual(computeCategoryBookCounts(null), {});
      assert.equal(formatVolumeCount(0), '0 Volumes');
    });

    it('CategorySection no longer contains fabricated volume numbers', () => {
      for (const fakeCount of ['42,100', '28,450', '36,800', '54,200', '22,650']) {
        assert.ok(
          !categorySectionSrc.includes(fakeCount),
          `CategorySection must not contain fabricated count "${fakeCount}"`
        );
      }
    });
  });

  describe('3. Missing authorRole Does Not Display "Faculty Monograph"', () => {
    it('hasMeaningfulText rejects null, undefined, and blank strings while preserving real roles', () => {
      assert.equal(hasMeaningfulText(null), false);
      assert.equal(hasMeaningfulText(undefined), false);
      assert.equal(hasMeaningfulText(''), false);
      assert.equal(hasMeaningfulText('   '), false);
      assert.equal(hasMeaningfulText('Professor of Physics'), true);
    });

    it('BookCard and BookDetailModal do not fall back to "Faculty Monograph"', () => {
      assert.ok(!bookCardSrc.includes('Faculty Monograph'), 'BookCard must not contain Faculty Monograph fallback');
      assert.ok(!bookDetailModalSrc.includes('Faculty Monograph'), 'BookDetailModal must not contain Faculty Monograph fallback');
      assert.ok(bookCardSrc.includes('hasMeaningfulText(book.authorRole)'));
      assert.ok(bookDetailModalSrc.includes('hasMeaningfulText(book.authorRole)'));
    });
  });

  describe('4. Missing curatorQuote & authorRole Separators', () => {
    it('BookCard and BookCollection render curatorQuote and authorRole separators conditionally', () => {
      assert.ok(bookCardSrc.includes('hasMeaningfulText(book.curatorQuote)'));
      assert.ok(bookCollectionSrc.includes('hasMeaningfulText(book.curatorQuote)'));
      assert.ok(bookCollectionSrc.includes('hasMeaningfulText(book.authorRole)'));
      // Ensure unguarded middot pattern is removed
      assert.ok(!bookCollectionSrc.includes('{book.author} · <span'));
    });
  });

  describe('5-7. Missing Year, Rating, Review Count & Page Count Handling', () => {
    it('hasNumericValue rejects null/undefined/empty strings/arrays/objects/symbols while preserving numeric zero', () => {
      assert.equal(hasNumericValue(null), false);
      assert.equal(hasNumericValue(undefined), false);
      assert.equal(hasNumericValue(''), false);
      assert.equal(hasNumericValue('   '), false);
      assert.equal(hasNumericValue(NaN), false);
      assert.equal(hasNumericValue(Infinity), false);
      assert.equal(hasNumericValue(-Infinity), false);
      assert.equal(hasNumericValue(false), false);
      assert.equal(hasNumericValue(true), false);
      assert.equal(hasNumericValue([]), false, 'Empty array must not coerce to 0');
      assert.equal(hasNumericValue([1]), false, 'Single-element array must not coerce to number');
      assert.equal(hasNumericValue([0]), false, 'Zero-element array must not coerce to 0');
      assert.equal(hasNumericValue({}), false, 'Plain object must return false');
      assert.equal(hasNumericValue(Symbol('s')), false, 'Symbol must return false without throwing');

      assert.equal(hasNumericValue(0), true, 'Valid numeric zero must not be hidden');
      assert.equal(hasNumericValue('0'), true);
      assert.equal(hasNumericValue(4.7), true);
      assert.equal(hasNumericValue(1996), true);
      assert.equal(hasNumericValue(350), true);
    });

    it('BookDetailModal and BookCard guard callNumber, year, rating, reviewsCount, and pages', () => {
      assert.ok(bookDetailModalSrc.includes('hasMeaningfulText(book.callNumber)'));
      assert.ok(bookCardSrc.includes('hasMeaningfulText(book.callNumber)'));
      assert.ok(bookDetailModalSrc.includes('hasNumericValue(book.year)'));
      assert.ok(bookDetailModalSrc.includes('hasNumericValue(book.rating)'));
      assert.ok(bookDetailModalSrc.includes('hasNumericValue(book.reviewsCount)'));
      assert.ok(bookDetailModalSrc.includes('hasNumericValue(book.pages)'));
      assert.ok(bookDetailModalSrc.includes('{hasYear && <span> ({book.year})</span>}'), 'Year must be guarded by hasYear');
      assert.ok(!bookDetailModalSrc.includes('</strong> ({book.year})'), 'Must not render unguarded ({book.year})');

      assert.ok(bookCardSrc.includes('hasNumericValue(book.rating)'));
      assert.ok(bookCardSrc.includes('hasNumericValue(book.reviewsCount)'));
      assert.ok(bookCardSrc.includes('hasNumericValue(book.year)'));
    });

    it('StudentDashboard tab count excludes archived books to match visible active books', () => {
      assert.ok(studentDashboardSrc.includes('activeCatalogBooks'));
      assert.ok(studentDashboardSrc.includes('Library Catalogue ({activeCatalogBooks.length})'));
      assert.ok(!studentDashboardSrc.includes('Library Catalogue ({catalogBooks.length})'));
    });
  });

  describe('8. Faculty Picks & Unsupported Filtering Removed', () => {
    it('SearchBar, StudentDashboard, PublicCatalog, BookCard, and BookCollection remove Faculty Picks/editorPick/featured', () => {
      assert.ok(!searchBarSrc.includes('Faculty Picks'));
      assert.ok(!searchBarSrc.includes('Faculty Recommendation'));
      assert.ok(!searchBarSrc.includes('onlyEditorPicks'));

      assert.ok(!studentDashboardSrc.includes('onlyEditorPicks'));
      assert.ok(!studentDashboardSrc.includes('editorPick'));
      assert.ok(!studentDashboardSrc.includes('featured'));

      assert.ok(!publicCatalogSrc.includes('onlyEditorPicks'));
      assert.ok(!publicCatalogSrc.includes('editorPick'));
      assert.ok(!publicCatalogSrc.includes('featured'));

      assert.ok(!bookCardSrc.includes('editorPick'));
      assert.ok(!bookCardSrc.includes('Faculty Pick'));
      assert.ok(!bookCollectionSrc.includes('editorPick'));
      assert.ok(!bookCollectionSrc.includes('Staff Pick'));
    });
  });

  describe('9-10. Catalogue Search, Filtering, and Sorting Functionality Preserved', () => {
    const sampleBooks = [
      {
        id: 'b1',
        title: 'Algorithms',
        author: 'Robert Sedgewick',
        callNumber: 'QA76.73',
        category: 'ai-computing',
        categoryLabel: 'AI & Computational Thinking',
        status: 'Available',
        year: 2011,
        rating: 4.7,
        archived: false,
      },
      {
        id: 'b2',
        title: 'Clean Architecture',
        author: 'Robert Martin',
        callNumber: 'QA76.76',
        category: 'ai-computing',
        categoryLabel: 'AI & Computational Thinking',
        status: 'Checked Out',
        year: 2017,
        rating: null,
        archived: false,
      },
      {
        id: 'b3',
        title: 'Meditations',
        author: 'Marcus Aurelius',
        callNumber: 'B580',
        category: 'philosophy',
        categoryLabel: 'Philosophy & Ethics',
        status: 'Available',
        year: 2002,
        rating: 4.9,
        archived: false,
      },
      {
        id: 'b4',
        title: 'Archived Monograph',
        author: 'Old Author',
        callNumber: 'Z999',
        category: 'philosophy',
        status: 'Available',
        archived: true,
      },
    ];

    it('filters by search query, category, and availability while excluding archived books', () => {
      const allActive = filterAndSortCatalogBooks(sampleBooks);
      assert.equal(allActive.length, 3);
      assert.ok(allActive.every((b) => !b.archived));

      const searchMatch = filterAndSortCatalogBooks(sampleBooks, { searchQuery: 'sedgewick' });
      assert.equal(searchMatch.length, 1);
      assert.equal(searchMatch[0].id, 'b1');

      const catAndAvail = filterAndSortCatalogBooks(sampleBooks, {
        selectedCategory: 'ai-computing',
        onlyAvailable: true,
      });
      assert.equal(catAndAvail.length, 1);
      assert.equal(catAndAvail[0].id, 'b1');
    });

    it('supports sorting by title-asc, year-desc, rating, and default order', () => {
      const byTitle = filterAndSortCatalogBooks(sampleBooks, { sortBy: 'title-asc' });
      assert.deepEqual(byTitle.map((b) => b.title), ['Algorithms', 'Clean Architecture', 'Meditations']);

      const byYear = filterAndSortCatalogBooks(sampleBooks, { sortBy: 'year-desc' });
      assert.deepEqual(byYear.map((b) => b.id), ['b2', 'b1', 'b3']);

      const byRating = filterAndSortCatalogBooks(sampleBooks, { sortBy: 'rating' });
      assert.deepEqual(byRating.map((b) => b.id), ['b3', 'b1', 'b2']);
    });

    it('safely searches mixed/non-string tags without throwing errors', () => {
      const mixedTagBooks = [
        {
          id: 't1',
          title: 'Compiler Design',
          author: 'Aho',
          category: 'ai-computing',
          status: 'Available',
          tags: [null, 42, undefined, {}, 'Compilers', 'Parsing'],
          archived: false,
        },
        {
          id: 't2',
          title: 'Signal Processing',
          author: 'Oppenheim',
          category: 'science-nature',
          status: 'Available',
          tags: 99999,
          archived: false,
        },
        {
          id: 't3',
          title: 'Legacy Systems',
          author: 'Author X',
          category: 'ai-computing',
          status: 'Available',
          tags: 'Distributed Systems, Compilers',
          archived: true,
        },
      ];

      const matched = filterAndSortCatalogBooks(mixedTagBooks, { searchQuery: 'parsing' });
      assert.deepEqual(matched.map((b) => b.id), ['t1']);

      const noThrowNonString = filterAndSortCatalogBooks(mixedTagBooks, { searchQuery: '999' });
      assert.deepEqual(noThrowNonString, []);
    });
  });
});
