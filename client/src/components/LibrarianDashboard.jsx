import React, { useState, useMemo, useEffect } from 'react';
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
  Database,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Mail
} from 'lucide-react';
import { BOOKS as STATIC_BOOKS, CATEGORIES } from '../data/books';
import { 
  getCirculationStats, 
  getPendingLoans, 
  getPendingReturns, 
  getActiveLoans, 
  approveLoan, 
  rejectLoan, 
  confirmReturn 
} from '../services/loanService';

export default function LibrarianDashboard({
  currentUser,
  books = [],
  isFallbackCatalogue = false,
  onLogout,
  onInspectBook
}) {
  const catalogBooks = isFallbackCatalogue 
    ? STATIC_BOOKS 
    : (Array.isArray(books) ? books : []);

  // Navigation Tabs for Admin Portal
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'catalog' | 'add-book' | 'circulation' | 'audit'
  const [circulationSubTab, setCirculationSubTab] = useState('pending-loans'); // 'pending-loans' | 'pending-returns' | 'active-holdings' | 'policy'
  
  // Search state inside Librarian Catalog view
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('all');

  // Live circulation state from backend
  const [circulationStats, setCirculationStats] = useState(null);
  const [pendingLoans, setPendingLoans] = useState([]);
  const [pendingReturns, setPendingReturns] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [isLoadingCirculation, setIsLoadingCirculation] = useState(false);
  const [actionNotice, setActionNotice] = useState(null);
  const [processingLoanId, setProcessingLoanId] = useState(null);

  // Reject Modal State
  const [rejectingLoan, setRejectingLoan] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // New Book Mock Form State
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('ai-computing');
  const [newBookCallNumber, setNewBookCallNumber] = useState('');
  const [addBookNotice, setAddBookNotice] = useState(null);

  // Fetch live circulation data from Spring Boot REST endpoints
  const loadCirculationData = async () => {
    setIsLoadingCirculation(true);
    try {
      const [stats, pending, returns, active] = await Promise.all([
        getCirculationStats().catch(() => null),
        getPendingLoans().catch(() => []),
        getPendingReturns().catch(() => []),
        getActiveLoans().catch(() => []),
      ]);
      setCirculationStats(stats);
      setPendingLoans(pending || []);
      setPendingReturns(returns || []);
      setActiveLoans(active || []);
    } catch (err) {
      console.warn('Circulation data load error:', err);
    } finally {
      setIsLoadingCirculation(false);
    }
  };

  useEffect(() => {
    loadCirculationData();
  }, []);

  // Compute live library catalog stats
  const catalogStats = useMemo(() => {
    const totalTitles = catalogBooks.length;
    const totalCopies = catalogBooks.reduce((acc, b) => acc + (b.totalCopies || 1), 0);
    const availableCopies = catalogBooks.reduce((acc, b) => acc + (b.copiesAvailable ?? 1), 0);
    const categoriesCount = CATEGORIES.length - 1; // excluding 'all'
    return { totalTitles, totalCopies, availableCopies, categoriesCount };
  }, [catalogBooks]);

  // Handle Approve Loan
  const handleApprove = async (loanId) => {
    setProcessingLoanId(loanId);
    setActionNotice(null);
    try {
      await approveLoan(loanId);
      setActionNotice({
        type: 'success',
        message: 'Loan successfully approved. Authoritative inventory decremented and notification dispatched to student.'
      });
      await loadCirculationData();
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to approve loan.'
      });
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Handle Reject Loan
  const handleConfirmReject = async () => {
    if (!rejectingLoan) return;
    if (!rejectionReason.trim()) {
      setActionNotice({ type: 'error', message: 'Rejection reason is required.' });
      return;
    }
    const loanId = rejectingLoan.id;
    setProcessingLoanId(loanId);
    setActionNotice(null);
    try {
      await rejectLoan(loanId, rejectionReason);
      setActionNotice({
        type: 'info',
        message: `Loan request for "${rejectingLoan.bookTitle}" rejected. Student notified with documented reason.`
      });
      setRejectingLoan(null);
      setRejectionReason('');
      await loadCirculationData();
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to reject loan.'
      });
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Handle Confirm Return
  const handleConfirmReturn = async (loanId) => {
    setProcessingLoanId(loanId);
    setActionNotice(null);
    try {
      await confirmReturn(loanId);
      setActionNotice({
        type: 'success',
        message: 'Physical return confirmed. Copy count atomically restored in database inventory.'
      });
      await loadCirculationData();
    } catch (err) {
      setActionNotice({
        type: 'error',
        message: err.message || 'Failed to confirm return.'
      });
    } finally {
      setProcessingLoanId(null);
    }
  };

  // Filtered books for admin management table
  const adminFilteredBooks = useMemo(() => {
    return catalogBooks.filter((b) => {
      if (adminSearch.trim()) {
        const q = adminSearch.toLowerCase().trim();
        const matchTitle = b.title?.toLowerCase().includes(q);
        const matchAuthor = b.author?.toLowerCase().includes(q);
        const matchCall = b.callNumber?.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchCall) return false;
      }
      if (selectedDiscipline !== 'all' && b.category !== selectedDiscipline) {
        return false;
      }
      return true;
    });
  }, [catalogBooks, adminSearch, selectedDiscipline]);

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
      message: `Form validated for "${newBookTitle}". Full backend ingestion endpoint (POST /api/books) will be added in Feature 2.`
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
                  VSSUT Central Library Management System
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Circulation & Staff Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Supervise authoritative stack inventories, review student loan requests, and process book check-ins.
              </p>
            </div>

            {/* Quick Librarian Details */}
            <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-xl border border-white/20">
              <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center font-bold text-white shadow-xs">
                {currentUser?.fullName?.charAt(0) || 'L'}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{currentUser?.fullName || 'Chief Librarian'}</p>
                <p className="text-[11px] text-slate-300">{currentUser?.email || 'admin@library.vssut.ac.in'}</p>
                <span className="inline-block text-[10px] font-semibold text-emerald-400 mt-0.5">
                  ● Active Database Connection
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          2. ADMINISTRATIVE NAVIGATION TABS
          ==================================================== */}
      <div className="bg-white border-b border-[#DCE7F5] shadow-xs sticky top-18 sm:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-1 sm:space-x-2 py-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('circulation');
                loadCirculationData();
              }}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap relative ${
                activeTab === 'circulation'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Circulation Desk</span>
              {pendingLoans.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                  {pendingLoans.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Catalogue Inventory ({catalogStats.totalTitles})</span>
            </button>

            <button
              onClick={() => setActiveTab('add-book')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'add-book'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Book</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-[#0B1F3A] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1F3A]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Security & Policies</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notice Banner */}
      {actionNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            actionNotice.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center space-x-2">
              {actionNotice.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{actionNotice.message}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="font-bold underline ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ====================================================
          3. TAB CONTENT VIEWS
          ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* ----------------------------------------------------
            TAB 1: OVERVIEW METRICS & ACTION CARDS
            ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Key Stack & Circulation Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F5] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Catalog Titles</span>
                  <BookOpen className="w-4 h-4 text-[#2563EB]" />
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F3A]">
                  {circulationStats?.totalTitlesCount ?? catalogStats.totalTitles}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {circulationStats?.availableCopiesCount ?? catalogStats.availableCopies} copies currently on shelf
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F5] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Loans</span>
                  <Library className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F3A]">
                  {circulationStats?.activeLoansCount ?? activeLoans.length}
                </p>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium">Volumes in student possession</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F5] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending Requests</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F3A]">
                  {circulationStats?.pendingRequestsCount ?? pendingLoans.length}
                </p>
                <p className="text-[11px] text-amber-600 mt-1 font-medium">Awaiting circulation review</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-[#DCE7F5] shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pending Returns</span>
                  <RotateCcw className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-3xl font-extrabold text-[#0B1F3A]">
                  {circulationStats?.pendingReturnsCount ?? pendingReturns.length}
                </p>
                <p className="text-[11px] text-purple-600 mt-1 font-medium">Awaiting stack receipt</p>
              </div>
            </div>

            {/* Quick Action Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => {
                  setActiveTab('circulation');
                  setCirculationSubTab('pending-loans');
                }}
                className="bg-white rounded-2xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Loan Approvals Queue</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review student monograph requests, check borrower capacity, and authorize physical loan dispatches.
                </p>
                <span className="inline-block text-xs font-semibold text-amber-600">
                  Open Approval Desk ({pendingLoans.length}) &rarr;
                </span>
              </div>

              <div 
                onClick={() => {
                  setActiveTab('circulation');
                  setCirculationSubTab('pending-returns');
                }}
                className="bg-white rounded-2xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Confirm Book Returns</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verify returned monographs deposited at the desk and atomically replenish shelf availability counts.
                </p>
                <span className="inline-block text-xs font-semibold text-[#2563EB]">
                  Process Drop-Offs ({pendingReturns.length}) &rarr;
                </span>
              </div>

              <div 
                onClick={() => setActiveTab('catalog')}
                className="bg-white rounded-2xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Catalogue Audit & Inventory</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Inspect title call numbers, copy statuses, shelf alcove locations, and metadata integrity.
                </p>
                <span className="inline-block text-xs font-semibold text-emerald-600">
                  Open Book Stacks &rarr;
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 2: CIRCULATION DESK (LIVE OPERATIONS)
            ---------------------------------------------------- */}
        {activeTab === 'circulation' && (
          <div className="space-y-6 animate-fade-in">
            {/* Circulation Sub-Navigation */}
            <div className="flex items-center justify-between border-b border-[#DCE7F5] pb-3">
              <div className="flex items-center space-x-2 text-xs font-bold">
                <button
                  onClick={() => setCirculationSubTab('pending-loans')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    circulationSubTab === 'pending-loans'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-[#DCE7F5] hover:bg-slate-50'
                  }`}
                >
                  Pending Loan Requests ({pendingLoans.length})
                </button>

                <button
                  onClick={() => setCirculationSubTab('pending-returns')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    circulationSubTab === 'pending-returns'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-[#DCE7F5] hover:bg-slate-50'
                  }`}
                >
                  Returns Awaiting Confirmation ({pendingReturns.length})
                </button>

                <button
                  onClick={() => setCirculationSubTab('active-holdings')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    circulationSubTab === 'active-holdings'
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-[#DCE7F5] hover:bg-slate-50'
                  }`}
                >
                  Active Circulation Holdings ({activeLoans.length})
                </button>
              </div>

              <button
                onClick={loadCirculationData}
                className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
              >
                Refresh Queue
              </button>
            </div>

            {/* Sub-view 1: Pending Loan Requests */}
            {circulationSubTab === 'pending-loans' && (
              <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs overflow-hidden">
                <div className="p-4 bg-[#F8FAFC] border-b border-[#DCE7F5] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Student Borrowing Requests Queue</h3>
                    <p className="text-xs text-slate-500">Approve to issue physical book and decrement available copy count.</p>
                  </div>
                </div>

                {isLoadingCirculation ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <div className="animate-spin w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-2" />
                    Refreshing pending requests...
                  </div>
                ) : pendingLoans.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No pending loan requests</p>
                    <p className="text-[11px]">All student requests have been processed.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#DCE7F5] text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Monograph Title</th>
                          <th className="py-3 px-4">Call Number</th>
                          <th className="py-3 px-4">Request Date</th>
                          <th className="py-3 px-4">Notes</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingLoans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-[#F5F9FF]/60 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#0B1F3A]">{loan.studentName}</p>
                              <p className="text-[11px] text-slate-500">{loan.studentEmail}</p>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs">
                              {loan.bookTitle}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-blue-700">
                              {loan.bookCallNumber || 'QA76.6'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(loan.requestDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                              {loan.notes || '—'}
                            </td>
                            <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleApprove(loan.id)}
                                disabled={processingLoanId === loan.id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {processingLoanId === loan.id ? 'Processing...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingLoan(loan);
                                  setRejectionReason('');
                                }}
                                disabled={processingLoanId === loan.id}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sub-view 2: Returns Awaiting Confirmation */}
            {circulationSubTab === 'pending-returns' && (
              <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs overflow-hidden">
                <div className="p-4 bg-[#F8FAFC] border-b border-[#DCE7F5] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Returns Awaiting Physical Desk Receipt</h3>
                    <p className="text-xs text-slate-500">Confirm receipt of the physical volume to increment shelf inventory.</p>
                  </div>
                </div>

                {isLoadingCirculation ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <div className="animate-spin w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-2" />
                    Refreshing return queue...
                  </div>
                ) : pendingReturns.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">No returns awaiting confirmation</p>
                    <p className="text-[11px]">All submitted returns have been physically shelved.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#DCE7F5] text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="py-3 px-4">Student</th>
                          <th className="py-3 px-4">Monograph Title</th>
                          <th className="py-3 px-4">Call Number</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingReturns.map((loan) => (
                          <tr key={loan.id} className="hover:bg-[#F5F9FF]/60 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#0B1F3A]">{loan.studentName}</p>
                              <p className="text-[11px] text-slate-500">{loan.studentEmail}</p>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {loan.bookTitle}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-blue-700">
                              {loan.bookCallNumber || 'QA76.6'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(loan.dueDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleConfirmReturn(loan.id)}
                                disabled={processingLoanId === loan.id}
                                className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {processingLoanId === loan.id ? 'Updating...' : 'Confirm Receipt & Restock'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sub-view 3: Active Circulation Holdings */}
            {circulationSubTab === 'active-holdings' && (
              <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs overflow-hidden">
                <div className="p-4 bg-[#F8FAFC] border-b border-[#DCE7F5] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Active Borrower Holdings</h3>
                    <p className="text-xs text-slate-500">Monographs currently checked out across student accounts.</p>
                  </div>
                </div>

                {isLoadingCirculation ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <div className="animate-spin w-5 h-5 border-2 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-2" />
                    Loading circulation holdings...
                  </div>
                ) : activeLoans.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-xs font-semibold text-slate-700">No monographs currently checked out</p>
                    <p className="text-[11px]">All catalog copies are present on library shelves.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#DCE7F5] text-slate-600 uppercase font-semibold">
                        <tr>
                          <th className="py-3 px-4">Borrower</th>
                          <th className="py-3 px-4">Monograph Title</th>
                          <th className="py-3 px-4">Call Number</th>
                          <th className="py-3 px-4">Issued On</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Quick Restock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeLoans.map((loan) => (
                          <tr key={loan.id} className="hover:bg-[#F5F9FF]/60 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#0B1F3A]">{loan.studentName}</p>
                              <p className="text-[11px] text-slate-500">{loan.studentEmail}</p>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">
                              {loan.bookTitle}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-blue-700">
                              {loan.bookCallNumber || 'QA76.6'}
                            </td>
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(loan.issueDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700 whitespace-nowrap">
                              {new Date(loan.dueDate).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                loan.status === 'ISSUED' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {loan.status === 'ISSUED' ? 'Checked Out' : 'Return Pending'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => handleConfirmReturn(loan.id)}
                                disabled={processingLoanId === loan.id}
                                className="px-2.5 py-1 text-[11px] font-semibold text-[#2563EB] hover:bg-blue-50 rounded transition-colors cursor-pointer"
                              >
                                Direct Return
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------
            TAB 3: CATALOGUE AUDIT & INVENTORY TABLE
            ---------------------------------------------------- */}
        {activeTab === 'catalog' && (
          <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs overflow-hidden animate-fade-in">
            {/* Search and discipline filter */}
            <div className="p-4 sm:p-5 bg-[#F8FAFC] border-b border-[#DCE7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Database Stack Catalogue</h3>
                <p className="text-xs text-slate-500">Live inventory records backed by MySQL persistence.</p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
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
                    <th className="py-3 px-3">Copies Available</th>
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
                          book.copiesAvailable > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {book.copiesAvailable > 0 ? 'Available' : 'Checked Out'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium whitespace-nowrap">
                        <span className="font-bold text-[#0B1F3A]">{book.copiesAvailable}</span> / {book.totalCopies}
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
            TAB 4: ADD BOOK FORM
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
            TAB 5: SECURITY & POLICIES
            ---------------------------------------------------- */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-xs p-6 sm:p-8 space-y-6 animate-fade-in">
            <h3 className="text-xl font-extrabold text-[#0B1F3A]">Circulation Policies & Concurrency Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
              <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7F5] space-y-2">
                <h4 className="font-bold text-[#0B1F3A] text-sm">Undergraduate Lending</h4>
                <p>Maximum of 4 books simultaneously for 14 calendar days. Enforced at request creation and librarian approval.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7F5] space-y-2">
                <h4 className="font-bold text-[#0B1F3A] text-sm">Inventory Concurrency Locking</h4>
                <p>Pessimistic write locking (<code>SELECT ... FOR UPDATE</code>) + optimistic <code>@Version</code> prevent double-issuance of final copies.</p>
              </div>
              <div className="p-4 rounded-xl bg-[#F5F9FF] border border-[#DCE7F5] space-y-2">
                <h4 className="font-bold text-[#0B1F3A] text-sm">Automated In-App Alerts</h4>
                <p>Co-located transactional notification engine generates audit entries on every loan, approval, rejection, and return.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================
          REJECTION REASON MODAL
          ==================================================== */}
      {rejectingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#DCE7F5] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#0B1F3A]">Decline Loan Request</h3>
              <button
                onClick={() => setRejectingLoan(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Please enter the official institutional reason for declining <strong>{rejectingLoan.studentName}</strong>'s request for <em>"{rejectingLoan.bookTitle}"</em>:
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Reserved for professor course-reserve shelf, or physical copy sent for binding repair..."
              rows={3}
              className="w-full p-3 text-xs bg-[#F5F9FF] border border-[#DCE7F5] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setRejectingLoan(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectionReason.trim() || processingLoanId === rejectingLoan.id}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer disabled:opacity-50"
              >
                {processingLoanId === rejectingLoan.id ? 'Declining...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
