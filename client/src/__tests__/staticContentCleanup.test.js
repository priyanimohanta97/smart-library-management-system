import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readClientFile(relativePath) {
  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf8');
}

describe('Complete Frontend Static Content Cleanup Suite', () => {
  const indexHtml = readClientFile('../../index.html');
  const appSrc = readClientFile('../App.jsx');
  const homePageSrc = readClientFile('../components/HomePage.jsx');
  const navbarSrc = readClientFile('../components/Navbar.jsx');
  const loginPageSrc = readClientFile('../components/LoginPage.jsx');
  const librarianDashboardSrc = readClientFile('../components/LibrarianDashboard.jsx');
  const studentDashboardSrc = readClientFile('../components/StudentDashboard.jsx');
  const publicCatalogSrc = readClientFile('../components/PublicCatalog.jsx');
  const bookCardSrc = readClientFile('../components/BookCard.jsx');
  const bookCollectionSrc = readClientFile('../components/BookCollection.jsx');
  const bookDetailModalSrc = readClientFile('../components/BookDetailModal.jsx');
  const bookCoverImageSrc = readClientFile('../components/BookCoverImage.jsx');
  const authServiceSrc = readClientFile('../services/authService.js');
  const booksDataSrc = readClientFile('../data/books.js');

  describe('1. Homepage, Navigation & Branding Cleanup', () => {
    it('removes mini-project notice, unimplemented AI claims, and tech-stack footer labels from HomePage', () => {
      assert.ok(!homePageSrc.includes('Developed for College Mini Project'));
      assert.ok(!homePageSrc.includes('AI-driven recommendations'));
      assert.ok(!homePageSrc.includes('Smart Coursework Recommendations'));
      assert.ok(!homePageSrc.includes('ISBD Bibliographic Standards'));
      assert.ok(!homePageSrc.includes('Spring Boot + React Platform'));

      // Preserves genuine VSSUT institutional identity
      assert.ok(homePageSrc.includes('Veer Surendra Sai University of Technology'));
      assert.ok(homePageSrc.includes('Established 1956'));
      assert.ok(homePageSrc.includes('Odisha, India – 768018'));
      assert.ok(homePageSrc.includes('new Date().getFullYear()'));
    });

    it('removes arbitrary version label v2.0 from Navbar and outdated Athenaeum title/cover branding', () => {
      assert.ok(!navbarSrc.includes('VSSUT Portal v2.0'));
      assert.ok(!indexHtml.includes('Athenaeum'));
      assert.ok(indexHtml.includes('VSSUT Central Library'));
      assert.ok(!bookCoverImageSrc.includes('Athenæum Stacks'));
      assert.ok(bookCoverImageSrc.includes('VSSUT Central Library'));
    });
  });

  describe('2. Dynamic Connectivity Status Indicators', () => {
    it('App.jsx passes real shared backend connectivity state (including auth network failures) to UI views', () => {
      assert.ok(appSrc.includes('const isBackendOnline = !catalogueOfflineError && !authOffline;'));
      assert.ok(appSrc.includes('isBackendOnline={isBackendOnline}'));
      assert.ok(appSrc.includes('isCheckingBackend={isLoadingBooks}'));
      assert.ok(appSrc.includes('onAuthConnectivityChange={(isOnline) => setAuthOffline(!isOnline)}'));
    });

    it('Navbar, HomePage, LoginPage, and LibrarianDashboard render offline and partial states accurately', () => {
      assert.ok(navbarSrc.includes('Digital OPAC Offline'));
      assert.ok(navbarSrc.includes('Digital OPAC Active'));

      assert.ok(homePageSrc.includes('Student OPAC Offline'));
      assert.ok(homePageSrc.includes('Synchronized Student OPAC'));

      assert.ok(loginPageSrc.includes('Authentication Service Offline'));
      assert.ok(loginPageSrc.includes('VSSUT Security Authority Active'));
      assert.ok(loginPageSrc.includes('isNetworkConnectivityError'));

      assert.ok(librarianDashboardSrc.includes('Database Connection Offline'));
      assert.ok(librarianDashboardSrc.includes('Partial Service Availability'));
      assert.ok(librarianDashboardSrc.includes('evaluateCirculationConnectivity'));
      assert.ok(librarianDashboardSrc.includes('circulationConnected'));
    });
  });

  describe('3. Removal of Demo Shortcuts, Placeholders & Misleading Copy', () => {
    it('LoginPage removes Demo Shortcuts, dummy emails, and developer personal name placeholder', () => {
      assert.ok(!loginPageSrc.includes('Demo Shortcuts'));
      assert.ok(!loginPageSrc.includes('admin@athenaeum.edu'));
      assert.ok(!loginPageSrc.includes('student@vssut.ac.in'));
      assert.ok(!loginPageSrc.includes('Pragyan Mohanta'));
      assert.ok(!loginPageSrc.includes('HMAC-SHA256'));
    });

    it('LibrarianDashboard removes fake fallback admin email and outdated MySQL / SQL lock text', () => {
      assert.ok(!librarianDashboardSrc.includes('admin@library.vssut.ac.in'));
      assert.ok(!librarianDashboardSrc.includes('Chief Librarian'));
      assert.ok(!librarianDashboardSrc.includes('MySQL persistence'));
      assert.ok(!librarianDashboardSrc.includes('SELECT ... FOR UPDATE'));
      assert.ok(librarianDashboardSrc.includes('MongoDB Atlas persistence'));
    });

    it('removes misleading Waitlist labels when books are unavailable', () => {
      assert.ok(!bookCardSrc.includes('Join Waitlist'));
      assert.ok(!bookCollectionSrc.includes('Waitlist'));
      assert.ok(!bookDetailModalSrc.includes('Waitlist Active'));
      assert.ok(!bookDetailModalSrc.includes('Join Waitlist'));
    });

    it('removes outdated MySQL, port 8080, Athenaeum, and cached catalog falsehoods from App, PublicCatalog, and authService', () => {
      assert.ok(!appSrc.includes('port 8080'));
      assert.ok(!appSrc.includes('Displaying cached catalog'));
      assert.ok(!appSrc.includes('STATIC_FALLBACK_BOOKS'));

      assert.ok(!publicCatalogSrc.includes('MySQL database'));
      assert.ok(!publicCatalogSrc.includes('port 8080'));

      assert.ok(!authServiceSrc.includes('Athenaeum authentication server'));
      assert.ok(!authServiceSrc.includes('Athenaeum registration server'));
      assert.ok(!authServiceSrc.includes('port 8080'));
    });
  });

  describe('4. Dead Prototype Files & Dummy Data Cleanup', () => {
    it('removes unused legacy prototype components Footer.jsx, HeroSpotlight.jsx, and PortalBanner.jsx', () => {
      assert.equal(fs.existsSync(path.resolve(__dirname, '../components/Footer.jsx')), false);
      assert.equal(fs.existsSync(path.resolve(__dirname, '../components/HeroSpotlight.jsx')), false);
      assert.equal(fs.existsSync(path.resolve(__dirname, '../components/PortalBanner.jsx')), false);
    });

    it('data/books.js contains only clean CATEGORIES without fake counts, dummy BOOKS, or EDITORIAL_STATISTICS', () => {
      assert.ok(!booksDataSrc.includes('EDITORIAL_STATISTICS'));
      assert.ok(!booksDataSrc.includes('CURATOR_SELECTION'));
      assert.ok(!booksDataSrc.includes('export const BOOKS'));
      assert.ok(!booksDataSrc.includes('count:'));
      assert.ok(booksDataSrc.includes('export const CATEGORIES'));

      assert.ok(!studentDashboardSrc.includes('STATIC_BOOKS'));
      assert.ok(!librarianDashboardSrc.includes('STATIC_BOOKS'));
    });
  });
});

