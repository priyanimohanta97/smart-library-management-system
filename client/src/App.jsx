import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import PublicCatalog from './components/PublicCatalog';
import StudentDashboard from './components/StudentDashboard';
import LibrarianDashboard from './components/LibrarianDashboard';
import BookDetailModal from './components/BookDetailModal';
import SavedBooksDrawer from './components/SavedBooksDrawer';
import NotificationDrawer from './components/NotificationDrawer';
import AuthRequiredModal from './components/AuthRequiredModal';
import { BOOKS as STATIC_FALLBACK_BOOKS } from './data/books';
import { CheckCircle2, AlertCircle, WifiOff } from 'lucide-react';
import { getStoredAuth, clearStoredAuth, fetchCurrentUser } from './services/authService';
import { fetchBooks } from './services/bookService';
import { requestLoan } from './services/loanService';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from './services/notificationService';
import { 
  VIEWS, 
  ROUTES, 
  getViewFromPath, 
  getPathFromView, 
  getInitialLoginRoleFromPath, 
  syncUrlToView, 
  isLibrarianOrAdminUser as isLibrarianOrAdmin 
} from './services/navigationService';

export default function App() {
  // Authenticated User State (from sessionStorage with expiration checks)
  const [currentUser, setCurrentUser] = useState(() => {
    const auth = getStoredAuth();
    return auth?.user || null;
  });

  // Navigation View State: 'home' | 'login' | 'student-dashboard' | 'librarian-dashboard'
  // Synchronously resolved from URL path and authenticated session to prevent homepage flash
  const [currentView, setCurrentView] = useState(() => {
    const auth = getStoredAuth();
    const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    return getViewFromPath(initialPath, auth?.user || null);
  });

  const [loginInitialRole, setLoginInitialRole] = useState(() => {
    const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    return getInitialLoginRoleFromPath(initialPath);
  });

  // Authoritative Books State from MySQL Backend
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [catalogueOfflineError, setCatalogueOfflineError] = useState(null);
  const [isFallbackCatalogue, setIsFallbackCatalogue] = useState(false);

  // Modal & Drawer State
  const [inspectedBook, setInspectedBook] = useState(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRequiredBook, setAuthRequiredBook] = useState(null);
  const [authRequiredReason, setAuthRequiredReason] = useState('loan'); // 'loan' | 'reading-list'
  const [pendingBookAfterLogin, setPendingBookAfterLogin] = useState(null);


  // User-scoped Reading List storage helpers
  const getSavedBooksStorageKey = (user) => {
    if (!user) return null;
    const userIdentifier = user.id || user.email || user.username;
    return `vssut_saved_books_${userIdentifier}`;
  };

  const loadSavedBooksForUser = (user) => {
    const key = getSavedBooksStorageKey(user);
    if (!key) return [];
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info'); // 'info' | 'success' | 'error'

  // Saved Books State (scoped per authenticated patron)
  const [savedBookIds, setSavedBookIds] = useState(() => {
    const auth = getStoredAuth();
    // Clear legacy un-scoped key to prevent stale mock data leakage
    try {
      localStorage.removeItem('vssut_library_saved_books');
    } catch {
      // Ignore
    }
    return loadSavedBooksForUser(auth?.user);
  });

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 4000);
  };

  // Load books from authoritative backend API
  const loadBooksFromBackend = useCallback(async () => {
    setIsLoadingBooks(true);
    try {
      const liveBooks = await fetchBooks();
      // Legitimate live response (even if empty []) is preserved as authoritative
      setBooks(Array.isArray(liveBooks) ? liveBooks : []);
      setCatalogueOfflineError(null);
      setIsFallbackCatalogue(false);
    } catch (err) {
      setCatalogueOfflineError(err.message || 'Unable to connect to MySQL library catalog.');
      // Do not substitute static fake books as live database inventory
      setBooks([]);
      setIsFallbackCatalogue(false);
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  useEffect(() => {
    loadBooksFromBackend();
  }, [loadBooksFromBackend]);

  // Load notifications for authenticated user
  const loadNotificationsData = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    setIsLoadingNotifications(true);
    try {
      const [list, count] = await Promise.all([
        getNotifications().catch(() => []),
        getUnreadCount().catch(() => 0),
      ]);
      setNotifications(list || []);
      setUnreadCount(count || 0);
    } catch (err) {
      // Quietly ignore polling failures
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadNotificationsData();
    // Poll notifications every 30 seconds if user is logged in
    if (currentUser) {
      const interval = setInterval(loadNotificationsData, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser, loadNotificationsData]);

  // Mark single notification as read
  const handleMarkNotificationRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      setUnreadCount(0);
      showToast('All notifications marked as read.', 'success');
    } catch (err) {
      showToast('Failed to mark all notifications as read.', 'error');
    }
  };

  // Synchronize reading list when currentUser switches or logs out
  useEffect(() => {
    setSavedBookIds(loadSavedBooksForUser(currentUser));
  }, [currentUser]);

  // Persist user-specific saved book IDs to local storage
  useEffect(() => {
    const key = getSavedBooksStorageKey(currentUser);
    if (key) {
      try {
        localStorage.setItem(key, JSON.stringify(savedBookIds));
      } catch {
        // Ignore in restricted environments
      }
    }
  }, [currentUser, savedBookIds]);

  // Toggle Save / Bookmark (requires authentication for all modifications)
  const handleToggleSave = (bookId) => {
    const book = books.find((b) => b.id === bookId || b.code === bookId);

    // Guard: Require authentication for modifying personal Reading List
    if (!currentUser) {
      setAuthRequiredBook(book || null);
      setAuthRequiredReason('reading-list');
      setIsAuthModalOpen(true);
      return;
    }

    if (savedBookIds.includes(bookId)) {
      setSavedBookIds((prev) => prev.filter((id) => id !== bookId));
      showToast(`Removed "${book?.title || 'Volume'}" from Reading List`, 'info');
    } else {
      setSavedBookIds((prev) => [...prev, bookId]);
      showToast(`Added "${book?.title || 'Volume'}" to Reading List`, 'success');
    }
  };

  const handleClearAllSaved = () => {
    // Guard: Require authentication for clearing personal Reading List
    if (!currentUser) {
      setAuthRequiredBook(null);
      setAuthRequiredReason('reading-list');
      setIsAuthModalOpen(true);
      return;
    }

    setSavedBookIds([]);
    showToast('Cleared all volumes from Reading List', 'info');
  };

  // Reserve / Loan Action
  const handleReserve = async (book) => {
    // 1. Guard against fallback data, offline catalog, or non-numeric IDs
    if (isFallbackCatalogue || catalogueOfflineError || typeof book?.id !== 'number') {
      showToast(
        'Physical monograph borrowing is temporarily unavailable while running on offline catalogue preview. Please verify database connectivity.',
        'error'
      );
      return;
    }

    // 2. If user is unauthenticated browsing legitimate live entries, open AuthRequiredModal
    if (!currentUser) {
      setAuthRequiredBook(book);
      setAuthRequiredReason('loan');
      setIsAuthModalOpen(true);
      return;
    }

    // 3. If user is authenticated, submit loan request to Spring Boot backend
    try {
      const result = await requestLoan({ bookId: book.id });
      showToast(
        `Loan request submitted for "${book.title}". Awaiting librarian clearance.`,
        'success'
      );
      // Reload live books to update available counts and reload notifications
      loadBooksFromBackend();
      loadNotificationsData();
    } catch (err) {
      showToast(err.message || 'Loan request failed.', 'error');
    }
  };

  // Central navigation dispatcher that updates state and keeps browser URL synchronized
  const navigateTo = useCallback((view, replace = false) => {
    setCurrentView(view);
    syncUrlToView(view, replace);
  }, []);

  // Synchronize browser address bar to initial canonical route on startup
  useEffect(() => {
    syncUrlToView(currentView, true);
  }, []);

  // Listen for browser popstate (back / forward navigation buttons)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const auth = getStoredAuth();
      const activeUser = auth?.user || null;
      const targetView = getViewFromPath(window.location.pathname, activeUser);

      // Ensure canonical path if route guarding triggered a redirection
      syncUrlToView(targetView, true);
      setCurrentUser(activeUser);
      setCurrentView(targetView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Background verification of active session with backend /api/users/me
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const auth = getStoredAuth();
      if (!auth?.token) return;

      try {
        const verifiedUser = await fetchCurrentUser();
        if (isMounted) {
          if (!verifiedUser) {
            // Session was revoked or expired on backend
            handleLogout();
          } else {
            setCurrentUser(verifiedUser);
          }
        }
      } catch (err) {
        // Quietly retain active session if backend is momentarily unreachable
      }
    };

    verifySession();
    return () => { isMounted = false; };
  }, []);

  // Navigation handlers
  const handleNavigateHome = () => {
    navigateTo('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = (mode = 'STUDENT') => {
    setLoginInitialRole(mode);
    navigateTo('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreBooks = () => {
    navigateTo('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateServices = () => {
    if (currentView !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        document.getElementById('library-services')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('library-services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateAbout = () => {
    if (currentView !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        document.getElementById('about-library')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('about-library')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDashboard = () => {
    if (!currentUser) {
      handleOpenLogin('STUDENT');
      return;
    }
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER') {
      navigateTo('librarian-dashboard');
    } else {
      navigateTo('student-dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication Handlers
  const handleLoginSuccess = (authData) => {
    const user = authData.user;
    setCurrentUser(user);

    // Route to appropriate dashboard based on actual authenticated backend role
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      navigateTo('librarian-dashboard', true);
      showToast(`Welcome, Librarian ${user.fullName}. Administration active.`, 'success');
    } else {
      navigateTo('student-dashboard', true);
      showToast(`Welcome, ${user.fullName}. Student Portal active.`, 'success');
    }

    // Preserve previously selected book if user was prompted to login
    if (pendingBookAfterLogin) {
      setInspectedBook(pendingBookAfterLogin);
      setPendingBookAfterLogin(null);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setSavedBookIds([]);
    setNotifications([]);
    setUnreadCount(0);
    navigateTo('home', true);
    showToast('Signed out of VSSUT Library System.', 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Saved books list computation
  const savedBooks = useMemo(() => {
    return books.filter((b) => savedBookIds.includes(b.id) || savedBookIds.includes(b.code));
  }, [books, savedBookIds]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] font-interface flex flex-col selection:bg-blue-100 selection:text-[#0B1F3A]">
      {/* Offline Warning Banner (if backend on port 8080 is disconnected) */}
      {catalogueOfflineError && (
        <div className="bg-amber-500 text-white text-xs px-4 py-2 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              <strong>Catalogue Service Offline:</strong> Could not connect to Spring Boot API on port 8080. Displaying cached catalog. Start backend for live loans.
            </span>
          </div>
          <button
            onClick={loadBooksFromBackend}
            className="underline font-bold hover:text-amber-100 cursor-pointer ml-4"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Top Institutional Navbar */}
      <Navbar
        savedCount={savedBookIds.length}
        onOpenSaved={isLibrarianOrAdmin(currentUser) ? null : () => setIsSavedDrawerOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => handleOpenLogin('STUDENT')}
        onLogout={handleLogout}
        onNavigateHome={handleNavigateHome}
        onNavigateExplore={handleExploreBooks}
        onNavigateServices={handleNavigateServices}
        onNavigateAbout={handleNavigateAbout}
        onOpenDashboard={handleOpenDashboard}
        currentView={currentView}
        unreadNotificationsCount={unreadCount}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
      />

      {/* Main View Switcher */}
      <main className="flex-1 w-full">
        {/* VIEW 1: Modern College Public Homepage */}
        {currentView === 'home' && (
          <HomePage
            onSelectRole={(role) => handleOpenLogin(role)}
            onExploreBooks={handleExploreBooks}
            onOpenLogin={() => handleOpenLogin('STUDENT')}
          />
        )}

        {/* VIEW 2: Public Live Book Catalogue (accessible without login) */}
        {currentView === 'catalog' && (
          <PublicCatalog
            books={books}
            isLoadingBooks={isLoadingBooks}
            catalogueOfflineError={catalogueOfflineError}
            onRetryConnection={loadBooksFromBackend}
            currentUser={currentUser}
            savedBookIds={savedBookIds}
            onToggleSave={handleToggleSave}
            onInspectBook={(book) => setInspectedBook(book)}
            onReserve={handleReserve}
            onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
            onOpenLogin={() => handleOpenLogin('STUDENT')}
          />
        )}

        {/* VIEW 3: Animated Split-Screen Authentication & Registration */}
        {currentView === 'login' && (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onBackToHome={handleNavigateHome}
            initialMode={loginInitialRole}
          />
        )}

        {/* VIEW 3: Dedicated Student Dashboard */}
        {currentView === 'student-dashboard' && (
          <StudentDashboard
            currentUser={currentUser}
            books={books}
            isFallbackCatalogue={isFallbackCatalogue}
            savedBookIds={savedBookIds}
            onToggleSave={handleToggleSave}
            onInspectBook={(book) => setInspectedBook(book)}
            onReserve={handleReserve}
            onOpenSavedDrawer={() => setIsSavedDrawerOpen(true)}
            onLogout={handleLogout}
            onNavigateHome={handleNavigateHome}
          />
        )}

        {/* VIEW 4: Dedicated Librarian Dashboard */}
        {currentView === 'librarian-dashboard' && (
          <LibrarianDashboard
            currentUser={currentUser}
            books={books}
            isFallbackCatalogue={isFallbackCatalogue}
            onLogout={handleLogout}
            onInspectBook={(book) => setInspectedBook(book)}
          />
        )}
      </main>

      {/* Book Detail Inspection Modal */}
      <BookDetailModal
        book={inspectedBook}
        isOpen={Boolean(inspectedBook)}
        onClose={() => setInspectedBook(null)}
        isSaved={inspectedBook ? (savedBookIds.includes(inspectedBook.id) || savedBookIds.includes(inspectedBook.code)) : false}
        onToggleSave={handleToggleSave}
        onReserve={handleReserve}
        isBorrowingDisabled={isFallbackCatalogue || Boolean(catalogueOfflineError) || typeof inspectedBook?.id !== 'number'}
        showReadingList={!isLibrarianOrAdmin(currentUser)}
      />

      {/* Saved Reading List Side Drawer (for student & guest views only) */}
      <SavedBooksDrawer
        isOpen={isSavedDrawerOpen && !isLibrarianOrAdmin(currentUser)}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedBooks={savedBooks}
        onRemoveSaved={handleToggleSave}
        onClearAll={handleClearAllSaved}
        onInspectBook={(book) => setInspectedBook(book)}
      />

      {/* Persistent In-App Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={handleMarkNotificationRead}
        onMarkAllAsRead={handleMarkAllNotificationsRead}
        isLoading={isLoadingNotifications}
      />

      {/* Institutional Sign-In Required Modal for Unauthenticated Loan & Reading List Requests */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        book={authRequiredBook}
        reason={authRequiredReason}
        onProceedToLogin={(book) => {
          setPendingBookAfterLogin(book);
          handleOpenLogin('STUDENT');
        }}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div 
          className={`fixed bottom-5 right-5 z-50 text-white px-4 py-2.5 rounded-xl shadow-lg border flex items-center space-x-2.5 text-xs animate-slide-up ${
            toastType === 'error'
              ? 'bg-rose-900 border-rose-400/50'
              : toastType === 'success'
              ? 'bg-emerald-900 border-emerald-400/50'
              : 'bg-[#0B1F3A] border-blue-400/40'
          }`}
          role="status"
          aria-live="polite"
        >
          {toastType === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : toastType === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
