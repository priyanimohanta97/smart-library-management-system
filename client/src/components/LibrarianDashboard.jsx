import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Library, 
  BookOpen, 
  PlusCircle, 
  SlidersHorizontal, 
  Users, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  MapPin, 
  LogOut, 
  Sparkles,
  KeyRound,
  Database
} from 'lucide-react';
import { BOOKS, CATEGORIES } from '../data/books';

export default function LibrarianDashboard({
  currentUser,
  onLogout,
  onInspectBook
}) {
  // Navigation Tabs for Admin Portal
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'catalog' | 'add-book' | 'circulation' | 'audit'
  
  // Search state inside Librarian Catalog view
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  // New Book Mock Form State (for demonstrating Add Book view without backend mutation)
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('ai-computing');
  const [newBookCallNumber, setNewBookCallNumber] = useState('');
  const [addBookNotice, setAddBookNotice] = useState(null);

  // Compute live library catalog stats based on real BOOKS data
  const catalogStats = useMemo(() => {
    const totalTitles = BOOKS.length;
    const totalCopies = BOOKS.reduce((acc, b) => acc + (b.totalCopies || 1), 0);
    const availableCopies = BOOKS.reduce((acc, b) => acc + (b.copiesAvailable || 0), 0);
    const categoriesCount = CATEGORIES.length - 1; // excluding 'all'
    return { totalTitles, totalCopies, availableCopies, categoriesCount };
  }, []);

  // Filtered books for admin management table
  const adminFilteredBooks = useMemo(() => {
    return BOOKS.filter((b) => {
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchAuthor = b.author.toLowerCase().includes(q);
        const matchCall = b.callNumber.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchCall) return false;
      }
      if (selectedDiscipline !== 'all' && b.category !== selectedDiscipline) {
        return false;
      }
      return true;
    });
  }, [adminSearch, selectedDiscipline]);

  // Handle mock book submission
  const handleAddBookSubmit = (e) => {
    e.preventDefault();
    if (!newBookTitle.trim() || !newBookAuthor.trim()) {
      setAddBookNotice({
        type: 'error',
        message: 'Title and Author are required fields.'
      });
      return;
    }

    setAddBookNotice({
      type: 'info',
      message: `Form validated for "${newBookTitle}". Backend Book Management API is scheduled for Feature 2. No database changes were executed.`
    });
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookCallNumber('');
  };

  return (
    <div className="w-full bg-[#F5F9FF] min-h-screen pb-16 font-interface">
      {/* ====================================================
          1. LIBRARIAN TOP ADMINISTRATIVE BAR
          ==================================================== */}
      <div className="bg-[#0B1F3A] text-white py-6 sm:py-8 border-b border-[#162F56] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-400/30 text-amber-300">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{currentUser?.role || 'ADMIN'} Administration Clearance</span>
                </span>
                <span className="text-xs text-slate-300">
                  Institutional Session Active
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                VSSUT Central Library Administration
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Curator portal for <strong className="text-white">{currentUser?.fullName}</strong> ({currentUser?.email}). Manage campus stack cataloging, patron loan records, and circulation rules.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 text-white text-xs flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-[11px]">JWT HMAC-SHA256</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="h-9 px-3.5 bg-red-900/60 hover:bg-red-800 text-white border border-red-500/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          2. ADMIN NAVIGATION TABS
          ==================================================== */}
      <div className="bg-white border-b border-[#DCE7F5] sticky top-20 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Book Catalogue ({catalogStats.totalTitles})</span>
            </button>

            <button
              onClick={() => setActiveTab('add-book')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer ${
                activeTab === 'add-book'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Book</span>
            </button>

            <button
              onClick={() => setActiveTab('circulation')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer ${
                activeTab === 'circulation'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Circulation Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Security & Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================
          3. TAB CONTENT VIEWS
          ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ----------------------------------------------------
            TAB 1: OVERVIEW METRICS & ACTION CARDS
            ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Key Stack Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F5] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Catalog Titles</span>
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F3A]">{catalogStats.totalTitles}</p>
                <p className="text-[11px] text-slate-500 mt-1">Indexed in Central Database</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F5] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Stacks Copies</span>
                  <Library className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F3A]">{catalogStats.totalCopies}</p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">{catalogStats.availableCopies} available on shelf</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F5] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Disciplines</span>
                  <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F3A]">{catalogStats.categoriesCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">Engineering & Science Wings</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F5] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Patron Roles</span>
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F3A]">3 Roles</p>
                <p className="text-[11px] text-purple-600 mt-1 font-medium">ADMIN, MANAGER, USER</p>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveTab('catalog')}
                className="bg-white rounded-2xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Catalogue Audit & Inventory</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inspect title call numbers, copy statuses, shelf alcove locations, and metadata integrity.
                </p>
                <span className="inline-block text-xs font-semibold text-[#2563EB]">
                  Open Book Stacks &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('add-book')}
                className="bg-white rounded-2xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Add New Volume Record</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Prepare cataloging entry for newly acquired faculty monographs or international engineering journals.
                </p>
                <span className="inline-block text-xs font-semibold text-emerald-600">
                  New Title Ingestion &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('circulation')}
                className="bg-white rounded-2xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Circulation Desk Rules</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review student borrowing quotas (14 days, max 5 books) and inter-library loan dispatches.
                </p>
                <span className="inline-block text-xs font-semibold text-amber-600">
                  Circulation Policy &rarr;
                </span>
              </div>
            </div>

            {/* Architecture & Backend API Integration Status Box */}
            <div className="bg-white rounded-2xl p-6 border border-[#DCE7F5] shadow-xs space-y-3">
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0B1F3A]">
                  Backend Services Integration Status
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                The library system currently runs the production Spring Boot authentication subsystem with role authorization. The operational endpoints below reflect actual status:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="font-bold text-emerald-900">POST /api/auth/login</p>
                  <p className="text-[11px] text-emerald-700">Active · Authenticates JWT</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="font-bold text-emerald-900">POST /api/auth/register</p>
                  <p className="text-[11px] text-emerald-700">Active · Role.USER only</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <p className="font-bold text-emerald-900">GET /api/users/me</p>
                  <p className="text-[11px] text-emerald-700">Active · Bearer Authenticated</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="font-bold text-blue-900">Book CRUD APIs</p>
                  <p className="text-[11px] text-blue-700">Scheduled for Feature 2</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 2: BOOK CATALOGUE INVENTORY TABLE
            ---------------------------------------------------- */}
        {activeTab === 'catalog' && (
          <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs p-6 space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#0B1F3A]">Library Stack Inventory</h3>
                <p className="text-xs text-slate-500">
                  Showing {adminFilteredBooks.length} of {BOOKS.length} cataloged volumes.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search by title, author, call no..."
                    className="h-9 pl-8 pr-3 text-xs bg-[#F5F9FF] border border-[#DCE7F5] rounded-lg text-[#0B1F3A] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <select
                  value={selectedDiscipline}
                  onChange={(e) => setSelectedDiscipline(e.target.value)}
                  className="h-9 text-xs bg-[#F5F9FF] border border-[#DCE7F5] rounded-lg px-2.5 text-[#0B1F3A] focus:outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-y border-[#DCE7F5] text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Call Number</th>
                    <th className="py-3 px-3">Title & Author</th>
                    <th className="py-3 px-3">Discipline</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Copies</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {adminFilteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-[#F5F9FF]/70 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-blue-700 whitespace-nowrap">
                        {book.callNumber}
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-bold text-[#0B1F3A] truncate">{book.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{book.author}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {book.categoryLabel}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px] max-w-[140px] truncate">
                        {book.location}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          book.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium whitespace-nowrap">
                        {book.copiesAvailable} / {book.totalCopies}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onInspectBook(book)}
                          className="text-[#2563EB] hover:underline font-semibold cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 3: ADD BOOK INTERFACE (CLEARLY LABELED AS FUTURE API)
            ---------------------------------------------------- */}
        {activeTab === 'add-book' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-[#DCE7F5] shadow-xs p-6 sm:p-8 space-y-6 animate-fade-in">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-1">
                <PlusCircle className="w-4 h-4" />
                <span>Catalog Management Form</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#0B1F3A]">Add New Volume Entry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Input metadata for acquiring new textbooks or reference folios into the university library.
              </p>
            </div>

            {addBookNotice && (
              <div className={`p-4 rounded-xl text-xs flex items-start space-x-2.5 ${
                addBookNotice.type === 'error'
                  ? 'bg-red-50 text-red-900 border border-red-200'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
              }`}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{addBookNotice.type === 'error' ? 'Validation Error' : 'System Notice'}</p>
                  <p className="mt-0.5">{addBookNotice.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAddBookSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#0B1F3A]">Book Title</label>
                <input
                  type="text"
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="e.g. Principles of Electric Power Systems"
                  className="w-full h-10 px-3 bg-[#F5F9FF] border border-[#DCE7F5] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#0B1F3A]">Author(s)</label>
                  <input
                    type="text"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    placeholder="e.g. Dr. H. Saadat"
                    className="w-full h-10 px-3 bg-[#F5F9FF] border border-[#DCE7F5] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#0B1F3A]">Discipline</label>
                  <select
                    value={newBookCategory}
                    onChange={(e) => setNewBookCategory(e.target.value)}
                    className="w-full h-10 px-2.5 bg-[#F5F9FF] border border-[#DCE7F5] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  >
                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#0B1F3A]">Call Number (Library of Congress / Dewey)</label>
                <input
                  type="text"
                  value={newBookCallNumber}
                  onChange={(e) => setNewBookCallNumber(e.target.value)}
                  placeholder="e.g. TK1001 .S23 2026"
                  className="w-full h-10 px-3 bg-[#F5F9FF] border border-[#DCE7F5] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="h-10 px-6 bg-[#0B1F3A] hover:bg-[#162F56] text-white font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Validate & Record Entry
                </button>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                * Note: Full backend book creation endpoint (`POST /api/books`) will be wired in Feature 2 per the architecture roadmap.
              </p>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 4: CIRCULATION DESK RULES
            ---------------------------------------------------- */}
        {activeTab === 'circulation' && (
          <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs p-6 sm:p-8 space-y-6 animate-fade-in">
            <h3 className="text-xl font-extrabold text-[#0B1F3A]">VSSUT Circulation Policies</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
              <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7F5] space-y-2">
                <h4 className="font-bold text-[#0B1F3A] text-sm">Undergraduate Lending</h4>
                <p>Maximum of 4 books simultaneously for 14 calendar days. Renewals allowed once if not on hold.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7F5] space-y-2">
                <h4 className="font-bold text-[#0B1F3A] text-sm">Postgraduate & Research</h4>
                <p>Maximum of 6 books simultaneously for 30 calendar days. Access to dissertation vault stacks.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7F5] space-y-2">
                <h4 className="font-bold text-[#0B1F3A] text-sm">Faculty Privilege</h4>
                <p>Maximum of 10 monographs per semester. Priority inter-library dispatch and journal subscriptions.</p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 5: SECURITY AUDIT
            ---------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs p-6 sm:p-8 space-y-6 animate-fade-in">
            <h3 className="text-xl font-extrabold text-[#0B1F3A]">Security & Session Verification</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Spring Security Token Authority active with 256-bit HMAC secret validation.</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Client session stored in sessionStorage &mdash; zero persistent token leakage in localStorage.</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Role boundaries enforced on both frontend and backend controllers.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

