import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Issue Book Validation & MongoDB String ID Compatibility Suite', () => {
  const appJsxPath = path.resolve(__dirname, '../App.jsx');
  const appJsxSrc = fs.readFileSync(appJsxPath, 'utf8');

  // Helper matching the exact guard in App.jsx handleReserve
  function checkBorrowingGuard(isFallbackCatalogue, catalogueOfflineError, book) {
    return Boolean(isFallbackCatalogue || catalogueOfflineError || !book?.id);
  }

  // Helper matching the exact isBorrowingDisabled prop expression in App.jsx
  function computeIsBorrowingDisabled(isFallbackCatalogue, catalogueOfflineError, inspectedBook) {
    return Boolean(isFallbackCatalogue || Boolean(catalogueOfflineError) || !inspectedBook?.id);
  }

  describe('1. MongoDB String ID Borrowing Validation', () => {
    it('allows a book with a valid 24-character hexadecimal MongoDB ObjectId string to pass borrowing validation', () => {
      const mongoBook = {
        id: '6729e41b8a531737e42d8f99',
        title: 'Structure and Interpretation of Computer Programs',
        code: 'csv-book-5',
        copiesAvailable: 3,
      };

      const isBlocked = checkBorrowingGuard(false, null, mongoBook);
      assert.equal(isBlocked, false, 'Valid MongoDB String ID must pass borrowing validation');
    });

    it('allows alphanumeric string IDs to pass borrowing validation', () => {
      const seedBook = {
        id: 'book-sicp-1996',
        title: 'SICP',
        code: 'book-5',
      };

      const isBlocked = checkBorrowingGuard(false, null, seedBook);
      assert.equal(isBlocked, false, 'Alphanumeric String ID must pass borrowing validation');
    });
  });

  describe('2. Missing or Empty Book ID Rejection', () => {
    it('rejects null or undefined book objects', () => {
      assert.equal(checkBorrowingGuard(false, null, null), true, 'Null book must be rejected');
      assert.equal(checkBorrowingGuard(false, null, undefined), true, 'Undefined book must be rejected');
    });

    it('rejects book objects with missing, null, or empty string IDs', () => {
      assert.equal(checkBorrowingGuard(false, null, {}), true, 'Book without id property must be rejected');
      assert.equal(checkBorrowingGuard(false, null, { id: null }), true, 'Book with null id must be rejected');
      assert.equal(checkBorrowingGuard(false, null, { id: undefined }), true, 'Book with undefined id must be rejected');
      assert.equal(checkBorrowingGuard(false, null, { id: '' }), true, 'Book with empty string id must be rejected');
    });
  });

  describe('3. Offline Catalogue & Error State Protection', () => {
    it('prevents borrowing when isFallbackCatalogue is true, even with a valid MongoDB ID', () => {
      const mongoBook = { id: '6729e41b8a531737e42d8f99', title: 'Test Volume' };
      const isBlocked = checkBorrowingGuard(true, null, mongoBook);
      assert.equal(isBlocked, true, 'isFallbackCatalogue must block borrowing');
    });

    it('prevents borrowing when catalogueOfflineError is present, even with a valid MongoDB ID', () => {
      const mongoBook = { id: '6729e41b8a531737e42d8f99', title: 'Test Volume' };
      const isBlocked = checkBorrowingGuard(false, 'Catalogue offline error', mongoBook);
      assert.equal(isBlocked, true, 'catalogueOfflineError must block borrowing');
    });
  });

  describe('4. Book Detail Modal Borrowing State Verification', () => {
    it('does not disable borrowing in BookDetailModal solely because the ID is a String', () => {
      const mongoBook = { id: '6729e41b8a531737e42d8f99', title: 'Test Volume' };
      const isDisabled = computeIsBorrowingDisabled(false, null, mongoBook);
      assert.equal(isDisabled, false, 'isBorrowingDisabled must be false for valid MongoDB book');
    });

    it('disables borrowing in BookDetailModal when book has no ID or is offline', () => {
      assert.equal(computeIsBorrowingDisabled(false, null, {}), true, 'Missing ID must disable borrowing');
      assert.equal(computeIsBorrowingDisabled(true, null, { id: '6729e41b8a531737e42d8f99' }), true);
      assert.equal(computeIsBorrowingDisabled(false, 'Network error', { id: '6729e41b8a531737e42d8f99' }), true);
    });
  });

  describe('5. App.jsx Source Code Regression & Contract Guards', () => {
    it('does not contain obsolete "typeof book?.id !== \'number\'" check', () => {
      assert.ok(
        !appJsxSrc.includes("typeof book?.id !== 'number'"),
        'App.jsx must not contain obsolete numeric check for book.id'
      );
    });

    it('does not contain obsolete "typeof inspectedBook?.id !== \'number\'" check', () => {
      assert.ok(
        !appJsxSrc.includes("typeof inspectedBook?.id !== 'number'"),
        'App.jsx must not contain obsolete numeric check for inspectedBook.id'
      );
    });

    it('contains updated "!book?.id" check in handleReserve', () => {
      assert.ok(
        appJsxSrc.includes('if (isFallbackCatalogue || catalogueOfflineError || !book?.id)'),
        'App.jsx must check for !book?.id in handleReserve'
      );
    });

    it('contains updated "!inspectedBook?.id" check in BookDetailModal prop', () => {
      assert.ok(
        appJsxSrc.includes('isBorrowingDisabled={isFallbackCatalogue || Boolean(catalogueOfflineError) || !inspectedBook?.id}'),
        'App.jsx must check for !inspectedBook?.id for BookDetailModal'
      );
    });
  });
});
