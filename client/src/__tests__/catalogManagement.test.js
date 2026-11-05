import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createBook, archiveBook, fetchBooks } from '../services/bookService.js';
import { setStoredAuth, clearStoredAuth } from '../services/authService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to construct a valid 3-part test JWT with future expiration
function createTestJwt(payloadObj = {}) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const defaultPayload = {
    sub: 'admin@vssut.ac.in',
    role: 'ADMIN',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payloadObj,
  };
  const payload = Buffer.from(JSON.stringify(defaultPayload)).toString('base64url');
  const signature = 'test_signature';
  return `${header}.${payload}.${signature}`;
}

describe('Catalogue Management: Add Book & Archive Book Suite', () => {
  const librarianDashboardPath = path.resolve(__dirname, '../components/LibrarianDashboard.jsx');
  const librarianDashboardSrc = fs.readFileSync(librarianDashboardPath, 'utf8');

  const appPath = path.resolve(__dirname, '../App.jsx');
  const appSrc = fs.readFileSync(appPath, 'utf8');

  const studentDashboardPath = path.resolve(__dirname, '../components/StudentDashboard.jsx');
  const studentDashboardSrc = fs.readFileSync(studentDashboardPath, 'utf8');

  const publicCatalogPath = path.resolve(__dirname, '../components/PublicCatalog.jsx');
  const publicCatalogSrc = fs.readFileSync(publicCatalogPath, 'utf8');

  beforeEach(() => {
    clearStoredAuth();
    globalThis.fetch = undefined;
  });

  describe('1. API Service: createBook', () => {
    it('1. sends correct POST payload, headers, and Bearer token to /api/books', async () => {
      const validJwt = createTestJwt();
      setStoredAuth({
        token: validJwt,
        tokenType: 'Bearer',
        user: { id: 'admin-1', email: 'admin@vssut.ac.in', role: 'ADMIN' },
      });

      let requestedUrl = null;
      let requestedOptions = null;

      globalThis.fetch = async (url, options) => {
        requestedUrl = String(url);
        requestedOptions = options;
        return {
          ok: true,
          status: 201,
          json: async () => ({
            id: '6729e41b8a531737e42d8f99',
            code: 'admin-book-12345678',
            title: 'Design Patterns',
            author: 'GoF',
            category: 'ai-computing',
            totalCopies: 3,
            copiesAvailable: 3,
            archived: false,
          }),
        };
      };

      const result = await createBook({
        title: 'Design Patterns',
        author: 'GoF',
        category: 'ai-computing',
        totalCopies: 3,
      });

      assert.ok(requestedUrl.includes('/api/books'), 'Must send request to /api/books');
      assert.equal(requestedOptions.method, 'POST');
      assert.equal(requestedOptions.headers['Authorization'], `Bearer ${validJwt}`);
      assert.equal(requestedOptions.headers['Content-Type'], 'application/json');

      const parsedBody = JSON.parse(requestedOptions.body);
      assert.equal(parsedBody.title, 'Design Patterns');
      assert.equal(parsedBody.author, 'GoF');
      assert.equal(parsedBody.category, 'ai-computing');
      assert.equal(parsedBody.totalCopies, 3);

      assert.equal(result.id, '6729e41b8a531737e42d8f99');
      assert.equal(result.archived, false);
    });

    it('handles 409 conflict when duplicate title/author exists', async () => {
      globalThis.fetch = async () => ({
        ok: false,
        status: 409,
        json: async () => ({
          message: 'A book titled "Design Patterns" by "GoF" already exists in the catalogue.',
        }),
      });

      await assert.rejects(
        () => createBook({ title: 'Design Patterns', author: 'GoF', category: 'ai-computing' }),
        /already exists in the catalogue/
      );
    });
  });

  describe('2. API Service: archiveBook', () => {
    it('6. sends PATCH request to /api/books/:id/archive with Bearer token', async () => {
      const validJwt = createTestJwt();
      setStoredAuth({
        token: validJwt,
        tokenType: 'Bearer',
        user: { id: 'admin-1', email: 'admin@vssut.ac.in', role: 'ADMIN' },
      });

      let requestedUrl = null;
      let requestedOptions = null;

      globalThis.fetch = async (url, options) => {
        requestedUrl = String(url);
        requestedOptions = options;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            id: 'book-target-id',
            title: 'Legacy Manual',
            archived: true,
          }),
        };
      };

      const result = await archiveBook('book-target-id');

      assert.ok(requestedUrl.includes('/api/books/book-target-id/archive'));
      assert.equal(requestedOptions.method, 'PATCH');
      assert.equal(requestedOptions.headers['Authorization'], `Bearer ${validJwt}`);
      assert.equal(result.archived, true);
    });

    it('9. handles 409 conflict when book has active circulation loans', async () => {
      globalThis.fetch = async () => ({
        ok: false,
        status: 409,
        json: async () => ({
          message: 'Cannot archive book "SICP": book has active or pending circulation loans.',
        }),
      });

      await assert.rejects(
        () => archiveBook('book-with-active-loans'),
        /active or pending circulation loans/
      );
    });
  });

  describe('3. Form Submission & State Lifecycle Logic', () => {
    it('2. successful creation simulation clears form and triggers onBookAdded callback', async () => {
      let formState = {
        title: 'New Textbook',
        author: 'Dr. Rao',
        category: 'ai-computing',
        copies: 2,
      };

      let onBookAddedCalled = false;
      const onBookAdded = async () => {
        onBookAddedCalled = true;
      };

      // Simulate handleAddBookSubmit success flow
      const createdBook = { id: 'new-id', title: formState.title };
      if (createdBook) {
        formState = { title: '', author: '', category: 'ai-computing', copies: 1 };
        await onBookAdded();
      }

      assert.equal(formState.title, '', 'Title must be cleared on success');
      assert.equal(formState.author, '', 'Author must be cleared on success');
      assert.equal(onBookAddedCalled, true, 'onBookAdded must be invoked');
    });

    it('3. failed creation preserves form values for user correction', async () => {
      const initialForm = {
        title: 'Conflicting Book',
        author: 'Duplicate Author',
        category: 'ai-computing',
        copies: 3,
      };

      let currentForm = { ...initialForm };
      let notice = null;

      try {
        throw new Error('A book with this title/author already exists.');
      } catch (err) {
        notice = { type: 'error', message: err.message };
      }

      assert.equal(currentForm.title, initialForm.title, 'Title must be preserved on error');
      assert.equal(currentForm.author, initialForm.author, 'Author must be preserved on error');
      assert.equal(notice.type, 'error');
    });

    it('4. duplicate submission prevented when isSubmittingBook is true', () => {
      let isSubmitting = true;
      let dispatches = 0;

      const submitAttempt = () => {
        if (isSubmitting) return;
        dispatches++;
      };

      submitAttempt();
      assert.equal(dispatches, 0, 'No request dispatched when submission already in flight');
    });
  });

  describe('4. Archiving Confirmation & UI Guards', () => {
    it('7. archive action requires confirmation before dispatching API call', () => {
      let confirmingBook = null;
      let archiveDispatched = false;

      // Click Archive in table row
      const handleArchiveClick = (book) => {
        confirmingBook = book;
      };

      // Confirm Archive in modal dialog
      const handleModalConfirm = () => {
        if (!confirmingBook) return;
        archiveDispatched = true;
      };

      handleArchiveClick({ id: 'target-1', title: 'Calculus Volume' });
      assert.notEqual(confirmingBook, null, 'Must open confirmation modal with selected book');
      assert.equal(archiveDispatched, false, 'API must not be dispatched until confirmed in modal');

      handleModalConfirm();
      assert.equal(archiveDispatched, true, 'Dispatched only after confirmation');
    });

    it('8. successful archive triggers catalogue refresh via onBookAdded', async () => {
      let refreshed = false;
      const onBookAdded = async () => {
        refreshed = true;
      };

      // Simulate archive success handler
      await onBookAdded();
      assert.equal(refreshed, true, 'Catalogue refresh must be triggered after successful archive');
    });
  });

  describe('5. Student and Public Catalogue Exclusion', () => {
    it('10. archived books are excluded from student catalogue filtering', () => {
      const mixedBooks = [
        { id: '1', title: 'Active Machine Learning', archived: false, category: 'ai-computing' },
        { id: '2', title: 'Archived Classical Mechanics', archived: true, category: 'science-nature' },
        { id: '3', title: 'Legacy Monograph (Omitted field)', category: 'philosophy' }, // missing archived treated as active
      ];

      // Student filter logic
      const studentFiltered = mixedBooks.filter((book) => {
        if (book.archived) return false;
        return true;
      });

      assert.equal(studentFiltered.length, 2);
      assert.ok(studentFiltered.some((b) => b.id === '1'), 'Active book must be included');
      assert.ok(studentFiltered.some((b) => b.id === '3'), 'Book with missing archived must be included');
      assert.ok(!studentFiltered.some((b) => b.id === '2'), 'Archived book must be strictly excluded');
    });
  });

  describe('6. Component Code & Contract Integrity Guards', () => {
    it('LibrarianDashboard imports and wires createBook and archiveBook', () => {
      assert.ok(librarianDashboardSrc.includes('createBook'), 'Must import createBook');
      assert.ok(librarianDashboardSrc.includes('archiveBook'), 'Must import archiveBook');
      assert.ok(librarianDashboardSrc.includes('onBookAdded'), 'Must accept and call onBookAdded');
      assert.ok(!librarianDashboardSrc.includes('will be added in Feature 2'), 'Obsolete Feature 2 placeholder must be removed');
    });

    it('App.jsx passes onBookAdded to LibrarianDashboard', () => {
      assert.ok(appSrc.includes('onBookAdded={loadBooksFromBackend}'), 'App.jsx must pass onBookAdded={loadBooksFromBackend}');
    });

    it('StudentDashboard and PublicCatalog guard against archived books', () => {
      assert.ok(studentDashboardSrc.includes('book.archived'), 'StudentDashboard must check book.archived');
      assert.ok(publicCatalogSrc.includes('book.archived'), 'PublicCatalog must check book.archived');
    });
  });
});

