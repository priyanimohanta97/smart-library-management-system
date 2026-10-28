import React, { useState, useMemo, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import LibrarianDashboard from './components/LibrarianDashboard';
import BookDetailModal from './components/BookDetailModal';
import SavedBooksDrawer from './components/SavedBooksDrawer';
import { BOOKS } from './data/books';
import { CheckCircle2 } from 'lucide-react';
import { getStoredAuth, clearStoredAuth } from './services/authService';

export default function App() {
  // Navigation View State: 'home' | 'login' | 'student-dashboard' | 'librarian-dashboard'
  const [currentView, setCurrentView] = useState('home');
  const [loginInitialRole, setLoginInitialRole] = useState('STUDENT');

  // Authenticated User State (from sessionStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    const auth = getStoredAuth();
    return auth?.user || null;
  });

  // Modal & Drawer State
  const [inspectedBook, setInspectedBook] = useState(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  // Saved Books State (with LocalStorage persistence)
  const [savedBookIds, setSavedBookIds] = useState(() => {
    try {
      const stored = localStorage.getItem('vssut_library_saved_books');
      return stored ? JSON.parse(stored) : ['book-1', 'book-4'];
    } catch {
      return ['book-1', 'book-4'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('vssut_library_saved_books', JSON.stringify(savedBookIds));
    } catch {
      // Ignore write errors in restricted contexts
    }
  }, [savedBookIds]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3500);
  };

  // Toggle Save / Bookmark
  const handleToggleSave = (bookId) => {
    const book = BOOKS.find((b) => b.id === bookId);
    if (savedBookIds.includes(bookId)) {
      setSavedBookIds((prev) => prev.filter((id) => id !== bookId));
      showToast(`Removed "${book?.title || 'Volume'}" from Reading List`);
    } else {
      setSavedBookIds((prev) => [...prev, bookId]);
      showToast(`Added "${book?.title || 'Volume'}" to Reading List`);
    }
  };

  const handleClearAllSaved = () => {
    setSavedBookIds([]);
    showToast('Cleared all volumes from Reading List');
  };

  // Quick Loan Action
  const handleReserve = (book) => {
    showToast(`Physical loan requested for "${book.title}". Available at ${book.location}.`);
  };

  // Navigation handlers
  const handleNavigateHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenLogin = (mode = 'STUDENT') => {
    setLoginInitialRole(mode);
    setCurrentView('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreBooks = () => {
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER') {
      setCurrentView('librarian-dashboard');
    } else {
      setCurrentView('student-dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateServices = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        document.getElementById('library-services')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('library-services')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateAbout = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
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
      setCurrentView('librarian-dashboard');
    } else {
      setCurrentView('student-dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication Handlers
  const handleLoginSuccess = (authData, selectedRole) => {
    const user = authData.user;
    setCurrentUser(user);

    // Route to appropriate dashboard based on actual authenticated backend role
    if (user.role === 'ADMIN' || user.role === 'MANAGER') {
      setCurrentView('librarian-dashboard');
      showToast(`Welcome, Librarian ${user.fullName}. Administration active.`);
    } else {
      setCurrentView('student-dashboard');
      showToast(`Welcome, ${user.fullName}. Student Portal active.`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setCurrentView('home');
    showToast('Signed out of VSSUT Library System.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Saved books list computation
  const savedBooks = useMemo(() => {
    return BOOKS.filter((b) => savedBookIds.includes(b.id));
  }, [savedBookIds]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] font-interface flex flex-col selection:bg-blue-100 selection:text-[#0B1F3A]">
      {/* Top Institutional Navbar */}
      <Navbar
        savedCount={savedBookIds.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => handleOpenLogin('STUDENT')}
        onLogout={handleLogout}
        onNavigateHome={handleNavigateHome}
        onNavigateExplore={handleExploreBooks}
        onNavigateServices={handleNavigateServices}
        onNavigateAbout={handleNavigateAbout}
        onOpenDashboard={handleOpenDashboard}
        currentView={currentView}
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

        {/* VIEW 2: Animated Split-Screen Authentication & Registration */}
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
        isSaved={inspectedBook ? savedBookIds.includes(inspectedBook.id) : false}
        onToggleSave={handleToggleSave}
        onReserve={handleReserve}
      />

      {/* Saved Reading List Side Drawer */}
      <SavedBooksDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedBooks={savedBooks}
        onRemoveSaved={handleToggleSave}
        onClearAll={handleClearAllSaved}
        onInspectBook={(book) => setInspectedBook(book)}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div 
          className="fixed bottom-5 right-5 z-50 bg-[#0B1F3A] text-white px-4 py-2.5 rounded-xl shadow-lg border border-blue-400/40 flex items-center space-x-2.5 text-xs animate-slide-up"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
