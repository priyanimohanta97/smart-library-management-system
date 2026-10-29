/**
 * Athenaeum Library Management System
 * Navigation & Route Management Service
 * 
 * Manages URL paths, role-based route guards, and view state synchronization.
 * Supports HTML5 History API (pushState/replaceState) without external router dependencies.
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  CATALOG: '/catalog',
  NOTES_PYQS: '/notes-pyqs',
  STUDENT_DASHBOARD: '/student-dashboard',
  LIBRARIAN_DASHBOARD: '/librarian-dashboard',
};

export const VIEWS = {
  HOME: 'home',
  LOGIN: 'login',
  CATALOG: 'catalog',
  NOTES_PYQS: 'notes-pyqs',
  STUDENT_DASHBOARD: 'student-dashboard',
  LIBRARIAN_DASHBOARD: 'librarian-dashboard',
};

/**
 * Checks whether a given role string represents an administrative or managerial librarian.
 * 
 * @param {string} [role]
 * @returns {boolean}
 */
export function isLibrarianOrAdminRole(role) {
  if (!role) return false;
  const normalized = String(role).toUpperCase();
  return (
    normalized === 'ADMIN' ||
    normalized === 'MANAGER' ||
    normalized === 'LIBRARIAN' ||
    normalized === 'ROLE_ADMIN' ||
    normalized === 'ROLE_MANAGER'
  );
}

/**
 * Checks whether an authenticated user object has librarian or admin privileges.
 * 
 * @param {Object} [user]
 * @returns {boolean}
 */
export function isLibrarianOrAdminUser(user) {
  return isLibrarianOrAdminRole(user?.role);
}

/**
 * Maps an internal view key to its canonical URL path.
 * 
 * @param {string} view
 * @returns {string}
 */
export function getPathFromView(view) {
  switch (view) {
    case VIEWS.LOGIN:
      return ROUTES.LOGIN;
    case VIEWS.CATALOG:
      return ROUTES.CATALOG;
    case VIEWS.NOTES_PYQS:
      return ROUTES.NOTES_PYQS;
    case VIEWS.STUDENT_DASHBOARD:
      return ROUTES.STUDENT_DASHBOARD;
    case VIEWS.LIBRARIAN_DASHBOARD:
      return ROUTES.LIBRARIAN_DASHBOARD;
    case VIEWS.HOME:
    default:
      return ROUTES.HOME;
  }
}

/**
 * Resolves the appropriate view from the browser pathname, enforcing role guards and protecting dashboards.
 * 
 * @param {string} pathname
 * @param {Object|null} currentUser
 * @returns {string} One of VIEWS values: 'home', 'login', 'catalog', 'student-dashboard', 'librarian-dashboard'
 */
export function getViewFromPath(pathname, currentUser) {
  const cleanPath = (pathname || '/').trim().toLowerCase().replace(/\/+$/, '') || '/';

  // 1. Home / root route
  if (cleanPath === '' || cleanPath === '/') {
    return VIEWS.HOME;
  }

  // 2. Public Catalog route (Open to everyone: guests, students, admins)
  if (
    cleanPath === '/catalog' ||
    cleanPath === '/catalogue' ||
    cleanPath === '/explore' ||
    cleanPath === '/books'
  ) {
    return VIEWS.CATALOG;
  }

  // 2b. Public Notes & PYQs route (Open to everyone: guests, students, admins)
  if (
    cleanPath === '/notes-pyqs' ||
    cleanPath === '/notes' ||
    cleanPath === '/pyq' ||
    cleanPath === '/pyqs' ||
    cleanPath === '/study-materials' ||
    cleanPath === '/resources'
  ) {
    return VIEWS.NOTES_PYQS;
  }

  // 3. Login route
  if (cleanPath === '/login' || cleanPath === '/signin') {
    // If already authenticated, redirect to appropriate dashboard
    if (currentUser) {
      return isLibrarianOrAdminUser(currentUser)
        ? VIEWS.LIBRARIAN_DASHBOARD
        : VIEWS.STUDENT_DASHBOARD;
    }
    return VIEWS.LOGIN;
  }

  // 4. Student Dashboard (Protected Route)
  if (cleanPath === '/student-dashboard') {
    if (!currentUser) {
      // Unauthenticated access blocked -> redirect to login
      return VIEWS.LOGIN;
    }
    if (isLibrarianOrAdminUser(currentUser)) {
      // Role mismatch: admin attempting student portal -> redirect to librarian dashboard
      return VIEWS.LIBRARIAN_DASHBOARD;
    }
    return VIEWS.STUDENT_DASHBOARD;
  }

  // 5. Librarian / Administrator Dashboard (Protected Route)
  if (
    cleanPath === '/librarian-dashboard' ||
    cleanPath === '/admin-dashboard' ||
    cleanPath === '/admin' ||
    cleanPath === '/librarian'
  ) {
    if (!currentUser) {
      // Unauthenticated access blocked -> redirect to login
      return VIEWS.LOGIN;
    }
    if (!isLibrarianOrAdminUser(currentUser)) {
      // Role mismatch: student attempting admin portal -> redirect to student dashboard
      return VIEWS.STUDENT_DASHBOARD;
    }
    return VIEWS.LIBRARIAN_DASHBOARD;
  }

  // 5. Generic /dashboard alias
  if (cleanPath === '/dashboard') {
    if (!currentUser) {
      return VIEWS.LOGIN;
    }
    return isLibrarianOrAdminUser(currentUser)
      ? VIEWS.LIBRARIAN_DASHBOARD
      : VIEWS.STUDENT_DASHBOARD;
  }

  // 6. Unknown paths default to home
  return VIEWS.HOME;
}

/**
 * Determines the initial role mode ('STUDENT' or 'LIBRARIAN') when redirecting to login.
 * 
 * @param {string} pathname
 * @returns {'STUDENT'|'LIBRARIAN'}
 */
export function getInitialLoginRoleFromPath(pathname) {
  const cleanPath = (pathname || '').trim().toLowerCase();
  if (
    cleanPath.includes('librarian') ||
    cleanPath.includes('admin') ||
    cleanPath.includes('manager')
  ) {
    return 'LIBRARIAN';
  }
  return 'STUDENT';
}

/**
 * Synchronizes the browser address bar with the given view using the History API.
 * 
 * @param {string} view
 * @param {boolean} [replace=false]
 */
export function syncUrlToView(view, replace = false) {
  if (typeof window === 'undefined' || !window.history) return;
  const canonicalPath = getPathFromView(view);
  if (window.location.pathname !== canonicalPath) {
    if (replace) {
      window.history.replaceState({ view }, '', canonicalPath);
    } else {
      window.history.pushState({ view }, '', canonicalPath);
    }
  }
}

