import React, { useState, useMemo, useRef } from 'react';
import { 
  User, 
  Bookmark, 
  Search, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ArrowRight,
  Library,
  LogOut
} from 'lucide-react';
import SearchBar from './SearchBar';
import BookCollection from './BookCollection';
import CategorySection from './CategorySection';
import { BOOKS } from '../data/books';

export default function StudentDashboard({
  currentUser,
  savedBookIds,
  onToggleSave,
  onInspectBook,
  onReserve,
  onOpenSavedDrawer,
  onLogout,
  onNavigateHome
}) {
  // Search & Filter State inside Student Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyEditorPicks, setOnlyEditorPicks] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const searchInputRef = useRef(null);

  // Filtered and Sorted Books computation
  const filteredBooks = useMemo(() => {
    return BOOKS.filter((book) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = book.title.toLowerCase().includes(query);
        const matchesAuthor = book.author.toLowerCase().includes(query);
        const matchesCall = book.callNumber.toLowerCase().includes(query);
        const matchesCategory = book.categoryLabel.toLowerCase().includes(query);
        const matchesTags = book.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesSynopsis = book.synopsis.toLowerCase().includes(query);

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
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'year-desc') return b.year - a.year;
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.editorPick && !b.editorPick) return -1;
      if (!a.editorPick && b.editorPick) return 1;
      return b.rating - a.rating;
    });
  }, [searchQuery, selectedCategory, onlyAvailable, onlyEditorPicks, sortBy]);

  // Saved books list computation
  const savedBooks = useMemo(() => {
    return BOOKS.filter((b) => savedBookIds.includes(b.id));
  }, [savedBookIds]);

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
          STUDENT DASHBOARD HEADER & WELCOME BANNER
          ==================================================== */}
      <div className="bg-[#0B1F3A] text-white py-8 sm:py-10 border-b border-[#162F56] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Student Info & Welcome */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/25 border border-blue-400/40 text-blue-200">
                  <User className="w-3.5 h-3.5 text-blue-300" />
                  <span>Enrolled Student Portal</span>
                </span>
                <span className="text-xs text-slate-300">
                  Semester Academic Pass Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {currentUser?.fullName || 'Scholar'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Your student account is active with digital catalog browsing, physical stack loans, and personal syllabus reading lists.
              </p>
            </div>

            {/* Quick Status Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenSavedDrawer}
                className="bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl border border-white/20 text-white text-xs font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
              >
                <Bookmark className="w-4 h-4 text-blue-400 fill-blue-400" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-300 uppercase font-semibold">Reading List</p>
                  <p className="font-bold">{savedBookIds.length} Saved Volumes</p>
                </div>
              </button>

              <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 text-white text-xs font-medium flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-300 uppercase font-semibold">Account Status</p>
                  <p className="font-bold">Good Standing · 0 Overdue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          STUDENT DASHBOARD MAIN CONTENT
          ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Quick Jump / Search Navigation Bar */}
        <div id="student-search-section">
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

        {/* Curated Catalog Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#0B1F3A] tracking-tight">
                Curated University Catalogue
              </h2>
              <p className="text-xs text-slate-500">
                Browse books currently indexed across VSSUT Burla departments.
              </p>
            </div>
            {savedBookIds.length > 0 && (
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

        {/* Reading List Summary Widget (if user has saved items) */}
        {savedBooks.length > 0 && (
          <section className="bg-white rounded-2xl p-6 border border-[#DCE7F5] shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Bookmark className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B1F3A]">
                    Active Reading List Snapshot
                  </h3>
                  <p className="text-xs text-slate-500">
                    {savedBooks.length} volume{savedBooks.length === 1 ? '' : 's'} earmarked for your coursework study.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenSavedDrawer}
                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                Open Full Drawer &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedBooks.slice(0, 3).map((book) => (
                <div 
                  key={book.id}
                  onClick={() => onInspectBook(book)}
                  className="p-3 rounded-xl border border-[#DCE7F5] bg-[#F8FAFC] hover:bg-white hover:border-[#2563EB] transition-all cursor-pointer flex items-center space-x-3"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded shadow-2xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#0B1F3A] truncate">{book.title}</p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{book.author}</p>
                    <span className="inline-block text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded mt-1">
                      {book.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Academic Disciplines Section */}
        <CategorySection
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            document.getElementById('student-search-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      </div>
    </div>
  );
}

