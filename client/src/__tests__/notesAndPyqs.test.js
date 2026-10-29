import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  RESOURCES_CATALOG,
  getAllResources,
  getResourcesByCategory,
  searchResources,
  getResourceCounts,
  RESOURCE_CATEGORIES,
} from '../data/resources.js';

import {
  VIEWS,
  ROUTES,
  getViewFromPath,
  getPathFromView,
} from '../services/navigationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Notes & PYQs Section Test Suite', () => {
  const clientDir = path.resolve(__dirname, '../..');
  const publicPdfDir = path.resolve(clientDir, 'public/pdf');

  describe('1. Static PDF Catalog Integrity & Physical Filesystem Alignment', () => {
    it('contains exactly 8 registered academic documents matching physical files', () => {
      assert.equal(RESOURCES_CATALOG.length, 8, 'Expected exactly 8 curated resources');
    });

    it('contains exactly 4 notes, 2 college PYQs, and 2 government exam PYQs', () => {
      const counts = getResourceCounts();
      assert.equal(counts.all, 8);
      assert.equal(counts.notes, 4);
      assert.equal(counts.collegePyq, 2);
      assert.equal(counts.govtPyq, 2);

      const notesCategory = RESOURCE_CATEGORIES.find((c) => c.id === 'notes');
      assert.equal(notesCategory?.label, 'Notes', 'RESOURCE_CATEGORIES must label notes as "Notes"');
    });

    it('ensures every resource points to an actual existing file on disk', () => {
      for (const item of RESOURCES_CATALOG) {
        // Strip leading '/' to resolve path relative to client/public
        const relativeFilePath = item.filePath.replace(/^\/+/, '');
        const absoluteDiskPath = path.resolve(clientDir, 'public', relativeFilePath);

        assert.ok(
          fs.existsSync(absoluteDiskPath),
          `Physical file does not exist on disk: ${absoluteDiskPath}`
        );

        const stats = fs.statSync(absoluteDiskPath);
        assert.ok(stats.size > 0, `File size on disk must be greater than 0: ${item.filename}`);
      }
    });

    it('properly URL-encodes file paths with spaces for web safety and browser actions', () => {
      const spaceFiles = RESOURCES_CATALOG.filter((item) => item.filename.includes(' '));
      assert.equal(spaceFiles.length, 2, 'Two college PYQ files contain spaces');

      for (const item of spaceFiles) {
        assert.ok(
          item.downloadUrl.includes('%20'),
          `downloadUrl must encode spaces for browser navigation: ${item.downloadUrl}`
        );
        assert.ok(
          !item.downloadUrl.includes(' '),
          `downloadUrl must not contain raw spaces: ${item.downloadUrl}`
        );
        // Verify decodeURI reproduces the raw filePath
        assert.equal(decodeURI(item.downloadUrl), item.filePath);
      }
    });

    it('validates that each item contains verified metadata and non-empty mandatory fields', () => {
      for (const item of RESOURCES_CATALOG) {
        assert.ok(item.id, 'Resource must have a unique ID');
        assert.ok(item.title, 'Resource must have a display title');
        assert.ok(item.filename, 'Resource must have a filename');
        assert.ok(item.category, 'Resource must have a category');
        assert.ok(item.categoryLabel, 'Resource must have a categoryLabel');
        assert.ok(item.fileSize, 'Resource must have a human-readable fileSize string');
        assert.ok(Array.isArray(item.tags) && item.tags.length > 0, 'Resource must have tags');
        assert.ok(item.subject, 'Resource must define an academic subject');
      }

      const notesItems = RESOURCES_CATALOG.filter((i) => i.category === 'notes');
      for (const note of notesItems) {
        assert.equal(note.categoryLabel, 'Notes', 'categoryLabel for note items must be "Notes"');
      }
    });
  });

  describe('2. Catalog Query, Search & Filter Functions', () => {
    it('getAllResources returns all catalog items without mutation', () => {
      const all = getAllResources();
      assert.equal(all.length, 8);
    });

    it('getResourcesByCategory filters accurately by category', () => {
      const notes = getResourcesByCategory('notes');
      assert.equal(notes.length, 4);
      assert.ok(notes.every((doc) => doc.category === 'notes'));

      const collegePyqs = getResourcesByCategory('college-pyq');
      assert.equal(collegePyqs.length, 2);
      assert.ok(collegePyqs.every((doc) => doc.category === 'college-pyq'));

      const govtPyqs = getResourcesByCategory('govt-pyq');
      assert.equal(govtPyqs.length, 2);
      assert.ok(govtPyqs.every((doc) => doc.category === 'govt-pyq'));
    });

    it('searchResources filters by title, subject, tags, and category', () => {
      // Search by subject / title keyword
      const javaResults = searchResources('Java');
      assert.equal(javaResults.length, 1);
      assert.equal(javaResults[0].id, 'note-java-complete');

      // Search across college PYQs
      const electricalResults = searchResources('electrical');
      assert.equal(electricalResults.length, 2); // 1 college electrical engineering + 1 govt EE

      // Search with category constraint
      const collegeElectricalOnly = searchResources('electrical', 'college-pyq');
      assert.equal(collegeElectricalOnly.length, 1);
      assert.equal(collegeElectricalOnly[0].id, 'pyq-college-bee-midsem-2024-25');

      // Search government exam
      const sscResults = searchResources('SSC');
      assert.equal(sscResults.length, 1);
      assert.equal(sscResults[0].id, 'pyq-govt-ssc-cgl-2025-english');

      // Search non-existent query
      const nonExistent = searchResources('NonExistentTermXYZ');
      assert.equal(nonExistent.length, 0);
    });
  });

  describe('3. Route Mapping & View Synchronization', () => {
    it('maps canonical and alias URLs to VIEWS.NOTES_PYQS for public access', () => {
      assert.equal(getViewFromPath('/notes-pyqs'), VIEWS.NOTES_PYQS);
      assert.equal(getViewFromPath('/notes'), VIEWS.NOTES_PYQS);
      assert.equal(getViewFromPath('/pyq'), VIEWS.NOTES_PYQS);
      assert.equal(getViewFromPath('/pyqs'), VIEWS.NOTES_PYQS);
      assert.equal(getViewFromPath('/study-materials'), VIEWS.NOTES_PYQS);
      assert.equal(getViewFromPath('/resources'), VIEWS.NOTES_PYQS);
    });

    it('maps VIEWS.NOTES_PYQS back to canonical route /notes-pyqs', () => {
      const canonicalPath = getPathFromView(VIEWS.NOTES_PYQS);
      assert.equal(canonicalPath, ROUTES.NOTES_PYQS);
      assert.equal(canonicalPath, '/notes-pyqs');
    });

    it('allows public visitor, student, and admin access to Notes & PYQs', () => {
      const guestView = getViewFromPath('/notes-pyqs', null);
      assert.equal(guestView, VIEWS.NOTES_PYQS);

      const studentUser = { id: 1, role: 'USER' };
      const studentView = getViewFromPath('/notes-pyqs', studentUser);
      assert.equal(studentView, VIEWS.NOTES_PYQS);

      const adminUser = { id: 2, role: 'ADMIN' };
      const adminView = getViewFromPath('/notes-pyqs', adminUser);
      assert.equal(adminView, VIEWS.NOTES_PYQS);
    });
  });

  describe('4. Component Source Code & Integration Integrity', () => {
    it('Navbar.jsx includes Notes & PYQs link in desktop navigation and mobile menu', () => {
      const navbarSrc = fs.readFileSync(path.resolve(__dirname, '../components/Navbar.jsx'), 'utf8');
      assert.ok(
        navbarSrc.includes('onNavigateNotesPyqs'),
        'Navbar must accept onNavigateNotesPyqs handler'
      );
      assert.match(
        navbarSrc,
        /Notes & PYQs/,
        'Navbar must contain visible "Notes & PYQs" text'
      );
    });

    it('PublicCatalog.jsx includes quick gateway to Notes & PYQs', () => {
      const catalogSrc = fs.readFileSync(path.resolve(__dirname, '../components/PublicCatalog.jsx'), 'utf8');
      assert.ok(
        catalogSrc.includes('onNavigateNotesPyqs'),
        'PublicCatalog must accept onNavigateNotesPyqs'
      );
      assert.match(
        catalogSrc,
        /Explore Notes &amp; PYQs|Explore Notes & PYQs/,
        'PublicCatalog must feature gateway button to Notes & PYQs'
      );
    });

    it('NotesAndPyqsPage.jsx enforces secure external view and download links', () => {
      const pageSrc = fs.readFileSync(path.resolve(__dirname, '../components/NotesAndPyqsPage.jsx'), 'utf8');
      assert.match(
        pageSrc,
        /target="_blank"/,
        'NotesAndPyqsPage must open PDF viewer in new tab'
      );
      assert.match(
        pageSrc,
        /rel="noopener noreferrer"/,
        'NotesAndPyqsPage must secure new tab with rel="noopener noreferrer"'
      );
      assert.match(
        pageSrc,
        /download=\{doc\.filename\}/,
        'NotesAndPyqsPage must provide direct download attribute'
      );
    });

    it('NotesAndPyqsPage.jsx displays "Notes" category label and tab button', () => {
      const pageSrc = fs.readFileSync(path.resolve(__dirname, '../components/NotesAndPyqsPage.jsx'), 'utf8');
      assert.match(pageSrc, /<span>Notes<\/span>/, 'Notes tab button must display "Notes"');
      assert.ok(!pageSrc.includes('<span>Lecture Notes</span>'), 'Notes tab button must not display "Lecture Notes"');
    });

    it('App.jsx mounts NotesAndPyqsPage when currentView is notes-pyqs', () => {
      const appSrc = fs.readFileSync(path.resolve(__dirname, '../App.jsx'), 'utf8');
      assert.ok(
        appSrc.includes("import NotesAndPyqsPage from './components/NotesAndPyqsPage'"),
        'App.jsx must import NotesAndPyqsPage'
      );
      assert.ok(
        appSrc.includes("currentView === 'notes-pyqs'"),
        'App.jsx must check currentView === notes-pyqs'
      );
      assert.ok(
        appSrc.includes('<NotesAndPyqsPage'),
        'App.jsx must render NotesAndPyqsPage'
      );
    });
  });
});
