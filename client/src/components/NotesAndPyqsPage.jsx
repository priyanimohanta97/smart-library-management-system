import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Search,
  X,
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  ArrowLeft,
  Calendar,
  Building2,
  Bookmark,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { 
  RESOURCE_CATEGORIES, 
  searchResources, 
  getResourceCounts 
} from '../data/resources';

export default function NotesAndPyqsPage({
  onNavigateCatalog,
  onNavigateHome
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const counts = useMemo(() => getResourceCounts(), []);

  // Filtered resources based on search query and category
  const filteredResources = useMemo(() => {
    return searchResources(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
  };

  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case 'notes':
        return 'bg-blue-50 text-[#2563EB] border-blue-200';
      case 'college-pyq':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'govt-pyq':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="w-full bg-[#F5F9FF] min-h-screen pb-20 font-interface">
      {/* ====================================================
          1. INSTITUTIONAL HEADER & BREADCRUMB STRIP
          ==================================================== */}
      <div className="bg-[#0B1F3A] text-white py-10 sm:py-14 border-b border-[#162F56] relative overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <button
              type="button"
              onClick={onNavigateHome}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={onNavigateCatalog}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Library Catalogue
            </button>
            <span>/</span>
            <span className="text-blue-300 font-semibold">Notes & PYQs</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 text-blue-200">
                <FileText className="w-3.5 h-3.5 text-blue-300" />
                <span>Academic Resource Repository</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Notes & Previous Year Questions
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Access curated notes, semester university exam question papers, and competitive examination resources compiled for VSSUT engineering students and scholars.
              </p>
            </div>

            {/* Quick Metrics Badge Card */}
            <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 shrink-0 text-center">
              <div className="px-3 py-1">
                <span className="block text-2xl font-black text-white">{counts.notes}</span>
                <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Notes</span>
              </div>
              <div className="px-3 py-1 border-x border-white/15">
                <span className="block text-2xl font-black text-white">{counts.collegePyq}</span>
                <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">College PYQs</span>
              </div>
              <div className="px-3 py-1">
                <span className="block text-2xl font-black text-white">{counts.govtPyq}</span>
                <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">Govt PYQs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================
          2. SEARCH & CATEGORY FILTER NAVIGATION
          ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-2xl border border-[#DCE7F5] shadow-md p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes, subjects, exam session, or question papers..."
                className="w-full h-10.5 pl-10 pr-9 text-xs sm:text-sm bg-[#F8FAFC] border border-[#DCE7F5] rounded-xl text-[#0B1F3A] placeholder:text-slate-400 focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all outline-none"
                aria-label="Search study materials and question papers"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Clear search"
                  aria-label="Clear search input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Back to Catalogue Button */}
            <button
              type="button"
              onClick={onNavigateCatalog}
              className="h-10.5 px-4 rounded-xl border border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EFF6FF] text-[#0B1F3A] text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Browse Book Catalogue</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none pt-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`h-9 px-4 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#DCE7F5]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Documents</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('notes')}
              className={`h-9 px-4 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                selectedCategory === 'notes'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#DCE7F5]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Notes</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === 'notes' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {counts.notes}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('college-pyq')}
              className={`h-9 px-4 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                selectedCategory === 'college-pyq'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#DCE7F5]'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>College PYQs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === 'college-pyq' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {counts.collegePyq}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory('govt-pyq')}
              className={`h-9 px-4 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 cursor-pointer whitespace-nowrap ${
                selectedCategory === 'govt-pyq'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-slate-600 hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-[#DCE7F5]'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Government Exam PYQs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedCategory === 'govt-pyq' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {counts.govtPyq}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================
          3. MAIN DOCUMENTS LISTING
          ==================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Results Count Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span className="font-bold text-[#0B1F3A]">Showing:</span>
            <span>
              {filteredResources.length} document{filteredResources.length === 1 ? '' : 's'}
              {searchQuery && <span> matching &ldquo;{searchQuery}&rdquo;</span>}
            </span>
          </div>

          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-[#2563EB] hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Empty State */}
        {filteredResources.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#DCE7F5] p-12 text-center shadow-xs my-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-[#2563EB]">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A]">No matching documents found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any notes or question papers matching your query &ldquo;{searchQuery}&rdquo;. Try another subject or reset your filters.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <span>View All Documents</span>
            </button>
          </div>
        ) : (
          /* Document Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
            {filteredResources.map((doc) => (
              <article
                key={doc.id}
                className="bg-white rounded-2xl border border-[#DCE7F5] hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Row: Category Badge & PDF Size */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryBadgeStyle(doc.category)}`}>
                      {doc.category === 'notes' && <BookOpen className="w-3 h-3" />}
                      {doc.category === 'college-pyq' && <GraduationCap className="w-3 h-3" />}
                      {doc.category === 'govt-pyq' && <Award className="w-3 h-3" />}
                      <span>{doc.categoryLabel}</span>
                    </span>

                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-500 bg-[#F8FAFC] border border-[#DCE7F5] px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span className="font-bold text-slate-700">PDF</span>
                      <span className="text-slate-400">·</span>
                      <span>{doc.fileSize}</span>
                    </div>
                  </div>

                  {/* Document Title */}
                  <div>
                    <h3 className="text-base font-bold text-[#0B1F3A] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {doc.title}
                    </h3>

                    {/* Metadata Subtitle / Exam Specs */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-slate-500 mt-2">
                      {doc.subject && (
                        <span className="font-semibold text-slate-700">
                          {doc.subject}
                        </span>
                      )}

                      {doc.semester && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center space-x-1 text-slate-600">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{doc.semester}</span>
                          </span>
                        </>
                      )}

                      {doc.academicSession && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center space-x-1 text-slate-600">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{doc.academicSession}</span>
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 leading-relaxed mt-2.5 line-clamp-2">
                      {doc.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {doc.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] bg-[#F5F9FF] text-slate-600 border border-[#DCE7F5] px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Actions: View PDF & Download */}
                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 truncate max-w-[160px] font-mono">
                    {doc.filename}
                  </span>

                  <div className="flex items-center space-x-2 shrink-0">
                    {/* View PDF in new browser tab */}
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-8.5 px-3 rounded-lg border border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EFF6FF] text-[#0B1F3A] hover:text-[#2563EB] text-xs font-semibold flex items-center space-x-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
                      title={`View ${doc.title} in a new browser tab`}
                      aria-label={`View ${doc.title} in a new tab`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>View PDF</span>
                    </a>

                    {/* Download file directly */}
                    <a
                      href={doc.downloadUrl}
                      download={doc.filename}
                      className="h-8.5 px-3.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs hover:shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
                      title={`Download ${doc.filename}`}
                      aria-label={`Download ${doc.title}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Educational Repository Notice Banner */}
        <div className="mt-12 p-5 bg-[#EFF6FF] border border-[#BFDBFE]/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#0B1F3A]">Academic Integrity & Circulation Guidelines</h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                All uploaded notes and examination papers are curated for academic study and non-commercial educational reference by VSSUT students.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateCatalog}
            className="h-8.5 px-4 bg-white hover:bg-slate-50 border border-[#DCE7F5] text-[#0B1F3A] text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Explore Library Stacks
          </button>
        </div>
      </div>
    </div>
  );
}

