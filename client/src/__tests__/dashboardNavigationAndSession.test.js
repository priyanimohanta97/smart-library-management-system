import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  VIEWS,
  ROUTES,
  getViewFromPath,
  getPathFromView,
  getInitialLoginRoleFromPath,
  isLibrarianOrAdminRole,
  isLibrarianOrAdminUser,
} from '../services/navigationService.js';

import {
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  isSessionExpired,
} from '../services/authService.js';

// Helper to construct a base64url-encoded test JWT
function createTestJwt(payloadObj) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const signature = 'test_signature';
  return `${header}.${payload}.${signature}`;
}

describe('Dashboard Navigation & Session Restoration Suite', () => {
  beforeEach(() => {
    clearStoredAuth();
  });

  describe('1. Student Dashboard Refresh & Session Restoration', () => {
    it('restores student dashboard view on page refresh when user holds student role', () => {
      const studentUser = {
        id: 101,
        fullName: 'Aarav Patel',
        email: 'aarav@vssut.ac.in',
        role: 'USER',
      };

      const resolvedView = getViewFromPath('/student-dashboard', studentUser);
      assert.equal(resolvedView, VIEWS.STUDENT_DASHBOARD);

      const canonicalPath = getPathFromView(resolvedView);
      assert.equal(canonicalPath, ROUTES.STUDENT_DASHBOARD);
      assert.equal(canonicalPath, '/student-dashboard');
    });

    it('resolves generic /dashboard path to student dashboard for student user', () => {
      const studentUser = { id: 101, role: 'USER' };
      const resolvedView = getViewFromPath('/dashboard', studentUser);
      assert.equal(resolvedView, VIEWS.STUDENT_DASHBOARD);
    });

    it('preserves public homepage view on refresh when authenticated user is at root path', () => {
      const studentUser = { id: 101, role: 'USER' };
      const resolvedView = getViewFromPath('/', studentUser);
      assert.equal(resolvedView, VIEWS.HOME);
    });
  });

  describe('2. Admin Dashboard Refresh & Session Restoration', () => {
    it('restores librarian dashboard view on page refresh when user holds ADMIN role', () => {
      const adminUser = {
        id: 1,
        fullName: 'Chief Librarian',
        email: 'admin@athenaeum.edu',
        role: 'ADMIN',
      };

      const resolvedView = getViewFromPath('/librarian-dashboard', adminUser);
      assert.equal(resolvedView, VIEWS.LIBRARIAN_DASHBOARD);

      const canonicalPath = getPathFromView(resolvedView);
      assert.equal(canonicalPath, ROUTES.LIBRARIAN_DASHBOARD);
      assert.equal(canonicalPath, '/librarian-dashboard');
    });

    it('restores librarian dashboard view on page refresh when user holds MANAGER role', () => {
      const managerUser = {
        id: 2,
        fullName: 'Circulation Manager',
        email: 'manager@athenaeum.edu',
        role: 'MANAGER',
      };

      const resolvedView = getViewFromPath('/librarian-dashboard', managerUser);
      assert.equal(resolvedView, VIEWS.LIBRARIAN_DASHBOARD);
    });

    it('resolves /admin and /admin-dashboard aliases to librarian dashboard for admin user', () => {
      const adminUser = { id: 1, role: 'ADMIN' };
      assert.equal(getViewFromPath('/admin', adminUser), VIEWS.LIBRARIAN_DASHBOARD);
      assert.equal(getViewFromPath('/admin-dashboard', adminUser), VIEWS.LIBRARIAN_DASHBOARD);
      assert.equal(getViewFromPath('/dashboard', adminUser), VIEWS.LIBRARIAN_DASHBOARD);
    });
  });

  describe('3. Unauthenticated Access Protection to Dashboard Routes', () => {
    it('blocks unauthenticated access to /student-dashboard and redirects to login', () => {
      const resolvedView = getViewFromPath('/student-dashboard', null);
      assert.equal(resolvedView, VIEWS.LOGIN);
    });

    it('blocks unauthenticated access to /librarian-dashboard and redirects to login', () => {
      const resolvedView = getViewFromPath('/librarian-dashboard', null);
      assert.equal(resolvedView, VIEWS.LOGIN);
    });

    it('blocks unauthenticated access to /admin and /dashboard aliases', () => {
      assert.equal(getViewFromPath('/admin', null), VIEWS.LOGIN);
      assert.equal(getViewFromPath('/dashboard', null), VIEWS.LOGIN);
    });

    it('sets initial login role mode appropriately when redirected from protected routes', () => {
      assert.equal(getInitialLoginRoleFromPath('/student-dashboard'), 'STUDENT');
      assert.equal(getInitialLoginRoleFromPath('/librarian-dashboard'), 'LIBRARIAN');
      assert.equal(getInitialLoginRoleFromPath('/admin'), 'LIBRARIAN');
      assert.equal(getInitialLoginRoleFromPath('/admin-dashboard'), 'LIBRARIAN');
    });
  });

  describe('4. Role Mismatch Redirection', () => {
    it('redirects students attempting to access /librarian-dashboard to /student-dashboard', () => {
      const studentUser = { id: 101, role: 'USER' };
      const resolvedView = getViewFromPath('/librarian-dashboard', studentUser);
      assert.equal(resolvedView, VIEWS.STUDENT_DASHBOARD);
    });

    it('redirects admins attempting to access /student-dashboard to /librarian-dashboard', () => {
      const adminUser = { id: 1, role: 'ADMIN' };
      const resolvedView = getViewFromPath('/student-dashboard', adminUser);
      assert.equal(resolvedView, VIEWS.LIBRARIAN_DASHBOARD);
    });

    it('redirects authenticated users visiting /login to their appropriate dashboard', () => {
      const studentUser = { id: 101, role: 'USER' };
      const adminUser = { id: 1, role: 'ADMIN' };

      assert.equal(getViewFromPath('/login', studentUser), VIEWS.STUDENT_DASHBOARD);
      assert.equal(getViewFromPath('/login', adminUser), VIEWS.LIBRARIAN_DASHBOARD);
    });
  });

  describe('5. Logout and Subsequent Protected-Route Access', () => {
    it('clears session on logout and prevents subsequent dashboard access', () => {
      const validJwt = createTestJwt({ sub: 'student@vssut.ac.in', exp: Math.floor(Date.now() / 1000) + 3600 });
      setStoredAuth({
        token: validJwt,
        tokenType: 'Bearer',
        expiresInMs: 3600000,
        user: { id: 101, fullName: 'Student', role: 'USER' },
      });

      // Verify session exists
      const stored = getStoredAuth();
      assert.ok(stored);
      assert.equal(stored.user.role, 'USER');

      // Execute logout
      clearStoredAuth();

      // Verify session is purged
      assert.equal(getStoredAuth(), null);

      // Attempting to access protected dashboard routes must now be blocked
      const afterLogoutStudentAccess = getViewFromPath('/student-dashboard', getStoredAuth()?.user || null);
      assert.equal(afterLogoutStudentAccess, VIEWS.LOGIN);

      const afterLogoutAdminAccess = getViewFromPath('/librarian-dashboard', getStoredAuth()?.user || null);
      assert.equal(afterLogoutAdminAccess, VIEWS.LOGIN);
    });
  });

  describe('6. Invalid or Expired Session Handling', () => {
    it('detects session expired by expiresInMs elapsed duration', () => {
      const expiredSession = {
        token: 'any.jwt.token',
        expiresInMs: 1000,
        storedAt: Date.now() - 5000, // 5 seconds ago (exceeded 1 sec duration)
        user: { id: 1, role: 'USER' },
      };

      assert.equal(isSessionExpired(expiredSession), true);
    });

    it('detects session expired by embedded JWT exp claim', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 60; // 60 seconds ago
      const expiredJwt = createTestJwt({ sub: 'user@test.com', exp: pastExp });

      const session = {
        token: expiredJwt,
        storedAt: Date.now(),
        expiresInMs: 3600000, // Duration says fresh, but JWT claims expired
        user: { id: 1, role: 'USER' },
      };

      assert.equal(isSessionExpired(session), true);
    });

    it('rejects malformed token strings safely without throwing', () => {
      const malformedSession = {
        token: 'not-a-valid-jwt-token',
        user: { id: 1, role: 'USER' },
      };

      assert.equal(isSessionExpired(malformedSession), true);
    });

    it('clears storage and returns null when getStoredAuth encounters expired session', () => {
      const pastExp = Math.floor(Date.now() / 1000) - 100;
      const expiredJwt = createTestJwt({ sub: 'expired@test.com', exp: pastExp });

      setStoredAuth({
        token: expiredJwt,
        tokenType: 'Bearer',
        expiresInMs: 3600000,
        user: { id: 99, role: 'USER' },
      });

      // getStoredAuth should inspect exp, discover expiration, clear storage, and return null
      const auth = getStoredAuth();
      assert.equal(auth, null);
    });

    it('restores valid unexpired session without dropping state', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 7200;
      const validJwt = createTestJwt({ sub: 'valid@vssut.ac.in', exp: futureExp });

      setStoredAuth({
        token: validJwt,
        tokenType: 'Bearer',
        expiresInMs: 7200000,
        user: { id: 102, fullName: 'Active Student', role: 'USER' },
      });

      const auth = getStoredAuth();
      assert.ok(auth);
      assert.equal(auth.user.fullName, 'Active Student');
      assert.equal(auth.user.role, 'USER');
    });
  });

  describe('7. Role Hierarchy Utilities', () => {
    it('accurately identifies administrative and librarian roles', () => {
      assert.equal(isLibrarianOrAdminRole('ADMIN'), true);
      assert.equal(isLibrarianOrAdminRole('MANAGER'), true);
      assert.equal(isLibrarianOrAdminRole('LIBRARIAN'), true);
      assert.equal(isLibrarianOrAdminRole('ROLE_ADMIN'), true);
      assert.equal(isLibrarianOrAdminRole('ROLE_MANAGER'), true);

      assert.equal(isLibrarianOrAdminRole('USER'), false);
      assert.equal(isLibrarianOrAdminRole('STUDENT'), false);
      assert.equal(isLibrarianOrAdminRole(''), false);
      assert.equal(isLibrarianOrAdminRole(null), false);
    });

    it('accurately identifies librarian or admin user objects', () => {
      assert.equal(isLibrarianOrAdminUser({ role: 'ADMIN' }), true);
      assert.equal(isLibrarianOrAdminUser({ role: 'MANAGER' }), true);
      assert.equal(isLibrarianOrAdminUser({ role: 'USER' }), false);
      assert.equal(isLibrarianOrAdminUser(null), false);
    });
  });

  describe('8. Public Catalogue Access & Live Inventory Protection', () => {
    it('allows logged-out visitors to access /catalog directly', () => {
      const resolvedView = getViewFromPath('/catalog', null);
      assert.equal(resolvedView, VIEWS.CATALOG);
      assert.equal(getPathFromView(resolvedView), ROUTES.CATALOG);
      assert.equal(getPathFromView(resolvedView), '/catalog');
    });

    it('resolves public aliases /catalogue, /explore, and /books to catalog view', () => {
      assert.equal(getViewFromPath('/catalogue', null), VIEWS.CATALOG);
      assert.equal(getViewFromPath('/explore', null), VIEWS.CATALOG);
      assert.equal(getViewFromPath('/books', null), VIEWS.CATALOG);
    });

    it('preserves /catalog view upon page refresh for both visitors and authenticated users', () => {
      const student = { id: 101, role: 'USER' };
      const admin = { id: 1, role: 'ADMIN' };

      assert.equal(getViewFromPath('/catalog', null), VIEWS.CATALOG);
      assert.equal(getViewFromPath('/catalog', student), VIEWS.CATALOG);
      assert.equal(getViewFromPath('/catalog', admin), VIEWS.CATALOG);
    });

    it('keeps dashboard routes strictly protected while catalogue is open', () => {
      // While /catalog is open to everyone, dashboards remain protected
      assert.equal(getViewFromPath('/student-dashboard', null), VIEWS.LOGIN);
      assert.equal(getViewFromPath('/librarian-dashboard', null), VIEWS.LOGIN);
      assert.equal(getViewFromPath('/admin-dashboard', null), VIEWS.LOGIN);
      assert.equal(getViewFromPath('/dashboard', null), VIEWS.LOGIN);
    });
  });
});

