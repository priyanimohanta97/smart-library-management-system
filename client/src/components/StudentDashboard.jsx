import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  LogOut,
  RotateCcw,
  AlertTriangle,
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import SearchBar from './SearchBar';
import BookCollection from './BookCollection';
import CategorySection from './CategorySection';
import { BOOKS as STATIC_BOOKS } from '../data/books';
import { getMyLoans, requestReturn } from '../services/loanService';

export default function StudentDashboard({
  currentUser,
  books = [],
  isFallbackCatalogue = false,
  savedBookIds = [],
  onToggleSave,
  onInspectBook,
  onReserve,
  onOpenSavedDrawer,
  onLogout,
  onNavigateHome,
  onNavigateNotesPyqs
}) {
  const catalogBooks = isFallbackCatalogue 
    ? STATIC_BOOKS 
    : (Array.isArray(books) ? books : []);

  // View state: 'catalog' | 'loans'
  const [activeTab, setActiveTab] = useState('catalog');

  // Search & Filter State inside Student Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyEditorPicks, setOnlyEditorPicks] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  // Loans State
  const [studentLoans, setStudentLoans] = useState([]);
  const [isLoadingLoans, setIsLoadingLoans] = useState(false);
  const [loanActionError, setLoanActionError] = useState(null);
  const [loanActionSuccess, setLoanActionSuccess] = useState(null);
  const [returningLoanId, setReturningLoanId] = useState(null);

  const searchInputRef = useRef(null);

  // Load student loans from backend
  const loadStudentLoans = async () => {
    if (!currentUser) return;
    setIsLoadingLoans(true);
    try {
      const data = await getMyLoans();
      setStudentLoans(data || []);
      setLoanActionError(null);
    } catch (err) {
      setLoanActionError(err.message || 'Unable to retrieve loan records.');
    } finally {
      setIsLoadingLoans(false);
    }
  };

  useEffect(() => {
    loadStudentLoans();
  }, [currentUser]);

  // Handle return request
  const handleReturnRequest = async (loanId) => {
    setReturningLoanId(loanId);
    setLoanActionError(null);
    setLoanActionSuccess(null);
    try {
      await requestReturn(loanId);
      setLoanActionSuccess('Return request submitted. Please deposit the physical monograph at the VSSUT Circulation Desk.');
      await loadStudentLoans();
    } catch (err) {
      setLoanActionError(err.message || 'Failed to submit return request.');
    } finally {
      setReturningLoanId(null);
    }
  };

  // Group student loans by status
  const activeIssuedLoans = useMemo(() => {
    return studentLoans.filter(l => l.status === 'ISSUED');
  }, [studentLoans]);

  const pendingRequests = useMemo(() => {
    return studentLoans.filter(l => l.status === 'PENDING');
  }, [studentLoans]);

  const returnPendingLoans = useMemo(() => {
    return studentLoans.filter(l => l.status === 'RETURN_PENDING');
  }, [studentLoans]);

  const historicalLoans = useMemo(() => {
    return studentLoans.filter(l => l.status === 'RETURNED' || l.status === 'REJECTED' || l.status === 'CANCELLED');
  }, [studentLoans]);

  const totalActiveAndPending = activeIssuedLoans.length + pendingRequests.length + returnPendingLoans.length;

  // Filtered and Sorted Books computation
  const filteredBooks = useMemo(() => {
    return catalogBooks.filter((book) => {
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
  }, [catalogBooks, searchQuery, selectedCategory, onlyAvailable, onlyEditorPicks, sortBy]);

  // Saved books list computation
  const savedBooks = useMemo(() => {
    return catalogBooks.filter((b) => savedBookIds.includes(b.id) || savedBookIds.includes(b.code));
  }, [catalogBooks, savedBookIds]);

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
                  VSSUT Institutional Pass Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {currentUser?.fullName || 'Scholar'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Your student account is authorized for live catalogue browsing, physical stack borrowing, and automatic circulation notices.
              </p>
            </div>

            {/* Quick Status Badges */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Circulation Status Badge */}
              <button
                type="button"
                onClick={() => setActiveTab('loans')}
                className="bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl border border-white/20 text-white text-xs font-medium flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
              >
                <Clock className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-slate-300 uppercase font-semibold">Circulation Quota</p>
                  <p className="font-bold">{totalActiveAndPending} / 4 Books Held</p>
                </div>
              </button>

              {/* Reading list badge */}
              <button
                type="button"
                onClick={onOpenSavedDrawer}
                className="bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl border border-white/20 text-white text-xs font-medium flex items-center space-x-2.5 transition-colors cursor-pointer text-left"
              >
                <Bookmark className="w-4 h-4 text-blue-400 fill-blue-400" />
                <div>
                  <p className="text-[10px] text-slate-300 uppercase font-semibold">Reading List</p>
                  <p className="font-bold">{savedBookIds.length} Saved Volumes</p>
                </div>
              </button>
            </div>
          </div>

          {/* Student Sub-Tabs Bar */}
          <div className="mt-8 flex items-center space-x-2 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'catalog'
                  ? 'bg-white text-[#0B1F3A] shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Library Catalogue ({catalogBooks.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('loans');
                loadStudentLoans();
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 ${
                activeTab === 'loans'
                  ? 'bg-white text-[#0B1F3A] shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>My Loans & Borrowing ({activeIssuedLoans.length + pendingRequests.length})</span>
            </button>

            {onNavigateNotesPyqs && (
              <button
                type="button"
                onClick={onNavigateNotesPyqs}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-2 text-slate-300 hover:text-white hover:bg-white/10"
              >
                <FileText className="w-4 h-4 text-blue-300" />
                <span>Notes &amp; PYQs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================
          STUDENT DASHBOARD MAIN CONTENT
          ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Alerts and notices */}
        {loanActionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{loanActionSuccess}</span>
            </div>
            <button 
              onClick={() => setLoanActionSuccess(null)}
              className="text-emerald-700 font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {loanActionError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{loanActionError}</span>
            </div>
            <button 
              onClick={() => setLoanActionError(null)}
              className="text-rose-700 font-bold hover:underline ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 1: CATALOGUE BROWSING
            ---------------------------------------------------- */}
        {activeTab === 'catalog' && (
          <>
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
                    Authoritative catalog inventory synchronized with Central Library stacks.
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

            {/* Reading List Summary Widget */}
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
          </>
        )}

        {/* ----------------------------------------------------
            TAB 2: STUDENT CIRCULATION & BORROWING
            ---------------------------------------------------- */}
        {activeTab === 'loans' && (
          <div className="space-y-8 animate-fade-in">
            {/* Borrowing Capacity & Quota Card */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]">
                  Circulation Policy Quota
                </span>
                <h3 className="text-lg font-bold text-[#0B1F3A]">Student Borrowing Status</h3>
                <p className="text-xs text-slate-500 max-w-lg">
                  Under VSSUT regulations, undergraduates may hold up to 4 concurrent active loans or pending requests for 14 calendar days.
                </p>
              </div>

              {/* Meter */}
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#DCE7F5] min-w-[260px] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Capacity Used</span>
                  <span className="font-bold text-[#0B1F3A]">{totalActiveAndPending} of 4 Allocated</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      totalActiveAndPending >= 4 ? 'bg-rose-500' : totalActiveAndPending >= 3 ? 'bg-amber-500' : 'bg-[#2563EB]'
                    }`}
                    style={{ width: `${Math.min(100, (totalActiveAndPending / 4) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-right">
                  {4 - totalActiveAndPending > 0 ? `${4 - totalActiveAndPending} loans remaining` : 'Limit reached'}
                </p>
              </div>
            </div>

            {/* Active Issued Books Section */}
            <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#DCE7F5] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                  <h3 className="text-sm font-bold text-[#0B1F3A]">
                    Currently Checked-Out Monograph Volumes ({activeIssuedLoans.length})
                  </h3>
                </div>
                <button
                  onClick={loadStudentLoans}
                  className="text-xs text-[#2563EB] hover:underline cursor-pointer"
                >
                  Refresh
                </button>
              </div>

              {isLoadingLoans ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <div className="animate-spin w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-2" />
                  Loading circulation records...
                </div>
              ) : activeIssuedLoans.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <BookOpen className="w-8 h-8 stroke-1 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">No active physical loans</p>
                  <p className="text-[11px] text-slate-400">
                    When you request a book and it is approved by the librarian, it will appear here with your return due date.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {activeIssuedLoans.map((loan) => (
                    <div key={loan.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex items-start space-x-3.5">
                        <div className="w-12 h-16 bg-[#0B1F3A] rounded overflow-hidden shrink-0 border border-slate-200">
                          {loan.bookCoverImage && (
                            <img src={loan.bookCoverImage} alt={loan.bookTitle} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {loan.bookCallNumber || 'QA76.6'}
                          </span>
                          <h4 className="text-sm font-bold text-[#0B1F3A]">{loan.bookTitle}</h4>
                          <p className="text-xs text-slate-500">By {loan.bookAuthor}</p>
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>Issued: {new Date(loan.issueDate).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1 font-semibold text-slate-700">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Due: {new Date(loan.dueDate).toLocaleDateString()}</span>
                            </span>
                            {loan.approvedByName && (
                              <span className="text-slate-400">
                                Approved by: {loan.approvedByName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 self-end sm:self-center">
                        <button
                          onClick={() => handleReturnRequest(loan.id)}
                          disabled={returningLoanId === loan.id}
                          className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{returningLoanId === loan.id ? 'Submitting...' : 'Return Book'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Requests and Return Pending Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pending Approval Requests */}
              <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#DCE7F5] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-[#0B1F3A]">
                      Pending Loan Requests ({pendingRequests.length})
                    </h4>
                  </div>
                </div>

                <div className="p-4 divide-y divide-slate-100">
                  {pendingRequests.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No pending requests awaiting approval.</p>
                  ) : (
                    pendingRequests.map((loan) => (
                      <div key={loan.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#0B1F3A] line-clamp-1">{loan.bookTitle}</p>
                          <p className="text-[11px] text-slate-500">Requested: {new Date(loan.requestDate).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Awaiting Review
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Return Confirmations */}
              <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs overflow-hidden">
                <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#DCE7F5] flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-blue-500" />
                    <h4 className="text-xs font-bold text-[#0B1F3A]">
                      Returns Pending Desk Confirmation ({returnPendingLoans.length})
                    </h4>
                  </div>
                </div>

                <div className="p-4 divide-y divide-slate-100">
                  {returnPendingLoans.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center">No books awaiting physical desk drop-off.</p>
                  ) : (
                    returnPendingLoans.map((loan) => (
                      <div key={loan.id} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#0B1F3A] line-clamp-1">{loan.bookTitle}</p>
                          <p className="text-[11px] text-blue-600">Please drop book at circulation desk</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Drop-Off Pending
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Historical Past Loans */}
            {historicalLoans.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs overflow-hidden">
                <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#DCE7F5]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Past Circulation History ({historicalLoans.length})
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  {historicalLoans.map((loan) => (
                    <div key={loan.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#0B1F3A]">{loan.bookTitle}</p>
                        <p className="text-[11px] text-slate-500">By {loan.bookAuthor}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          loan.status === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {loan.status}
                        </span>
                        {loan.rejectionReason && (
                          <p className="text-[10px] text-rose-600 mt-1">Reason: {loan.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
