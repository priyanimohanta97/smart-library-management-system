import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Library, 
  Search, 
  AlertCircle, 
  RefreshCw, 
  WifiOff, 
  User, 
  LogIn, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import SearchBar from './SearchBar';
import BookCollection from './BookCollection';

export default function PublicCatalog({
  books = [],
  isLoadingBooks = false,
  catalogueOfflineError = null,
  onRetryConnection,
  currentUser = null,
  savedBookIds = [],
  onToggleSave,
  onInspectBook,
  onReserve,
  onOpenSavedDrawer,
  onOpenLogin,
}) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyEditorPicks, setOnlyEditorPicks] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const searchInputRef = useRef(null);

  // Filtered and Sorted Books computation from authoritative live backend records
  const filteredBooks = useMemo(() => {
    const list = Array.isArray(books) ? books : [];
    return list.filter((book) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title?.toLowerCase().includes(query);
        const matchesAuthor = book.author?.toLowerCase().includes(query);
        const matchesCall = book.callNumber?.toLowerCase().includes(query);
        const matchesCategory = book.categoryLabel?.toLowerCase().includes(query);
        const matchesTags = Array.isArray(book.tags)
          ? book.tags.some((t) => t.toLowerCase().includes(query))
          : book.tags?.toLowerCase().includes(query);
        const matchesSynopsis = book.synopsis?.toLowerCase().includes(query);

        if (!matchesTitle && !matchesAuthor && !matchesCall && !matchesCategory && !matchesTags && !matchesSynopsis) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && book.category !== selectedCategory) {
        return false;
      }

      if (onlyAvailable && book.status !== 'Available') {
        return false;
      }

      if (onlyEditorPicks && !book.editorPick) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'year-desc') return (b.year || b.publicationYear || 0) - (a.year || a.publicationYear || 0);
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.editorPick && !b.editorPick) return -1;
      if (!a.editorPick && b.editorPick) return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [books, searchQuery, selectedCategory, onlyAvailable, onlyEditorPicks, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setOnlyAvailable(false);
    setOnlyEditorPicks(false);
    setSortBy('featured');
  };

  return (
    <div className="w-full bg-[#F5F9FF] min-h-screen pb-16 font-interface">
      {/* ====================================================
          PUBLIC CATALOGUE HEADER & INSTITUTIONAL BANNER
          ==================================================== */}
      <div className="bg-[#0B1F3A] text-white py-8 sm:py-10 border-b border-[#162F56] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Header Title & Subtitle */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/25 border border-blue-400/40 text-blue-200">
                  <Library className="w-3.5 h-3.5 text-blue-300" />
                  <span>Public OPAC Gateway</span>
                </span>
                <span className="text-xs text-slate-300">
                  Live Central Library Stack Inventory
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                University Monograph Catalogue
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Live bibliographic records synchronized with Central Library physical stacks. Search academic disciplines, inspect monograph metadata, and verify current copy availability in real time.
              </p>
            </div>

            {/* Patron / Visitor Access Card */}
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 max-w-sm flex flex-col justify-between space-y-3">
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/25 flex items-center justify-center shrink-0 text-blue-300">
                  {currentUser ? <ShieldCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-snug">
                    {currentUser 
                      ? `${currentUser.fullName} (${currentUser.role})`
                      : 'Public Visitor Access'}
                  </p>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {currentUser 
                      ? 'Authenticated for stack borrowing and personal reading list sync.'
                      : 'Browsing is open to all visitors. Sign in as a student to issue books.'}
                  </p>
                </div>
              </div>

              {!currentUser && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="w-full h-8 inline-flex items-center justify-center space-x-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In as Student to Borrow</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          MAIN CATALOGUE CONTENT AREA
          ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* 1. LOADING STATE */}
        {isLoadingBooks && (
          <div className="bg-white rounded-2xl border border-[#DCE7F5] p-12 text-center shadow-xs my-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#2563EB] mb-4 animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0B1F3A]">
              Connecting to VSSUT Central Library Catalogue...
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
              Querying Spring Boot REST API and MySQL database for real-time monograph holdings and live stock quantities.
            </p>
          </div>
        )}

        {/* 2. ERROR / BACKEND UNAVAILABLE STATE */}
        {!isLoadingBooks && catalogueOfflineError && (
          <div className="bg-white rounded-2xl border border-rose-200 p-8 sm:p-10 text-center shadow-xs my-6">
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 mb-3.5">
              <WifiOff className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-rose-900">
              Live Catalogue Service Unavailable
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-lg mx-auto leading-relaxed">
              Unable to connect to the Spring Boot backend on port 8080. Real-time monograph records, active stack quantities, and live availability cannot be verified right now.
            </p>
            <div className="mt-5 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={onRetryConnection}
                className="h-9 px-4 bg-[#0B1F3A] hover:bg-[#162F56] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. LIVE CATALOGUE DATA VIEW */}
        {!isLoadingBooks && !catalogueOfflineError && (
          <>
            {/* Search, Filter, and Sort Bar */}
            <div id="public-search-section">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                onlyAvailable={onlyAvailable}
                setOnlyAvailable={setOnlyAvailable}
                onlyEditorPicks={onlyEditorPicks}
                setOnlyEditorPicks={setOnlyEditorPicks}
                sortBy={sortBy}
                setSortBy={setSortBy}
                resultsCount={filteredBooks.length}
                searchInputRef={searchInputRef}
              />
            </div>

            {/* Collection Grid / List View */}
            <section className="pt-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0B1F3A] tracking-tight">
                    Academic Holdings & Stacks
                  </h2>
                  <p className="text-xs text-slate-500">
                    Showing {filteredBooks.length} verified live monograph{filteredBooks.length === 1 ? '' : 's'} from Central Library database.
                  </p>
                </div>

                {currentUser && savedBookIds.length > 0 && onOpenSavedDrawer && (
                  <button
                    type="button"
                    onClick={onOpenSavedDrawer}
                    className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View My Reading List ({savedBookIds.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <BookCollection
                books={filteredBooks}
                savedBookIds={savedBookIds}
                onToggleSave={onToggleSave}
                onInspectBook={onInspectBook}
                onQuickReserve={onReserve}
                onResetFilters={handleResetFilters}
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

