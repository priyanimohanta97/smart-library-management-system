import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/books';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  onlyAvailable,
  setOnlyAvailable,
  onlyEditorPicks,
  setOnlyEditorPicks,
  sortBy,
  setSortBy,
  resultsCount,
  searchInputRef,
}) {
  return (
    <div className="w-full bg-white rounded-2xl border border-[#DCE7F5] shadow-xs p-4 sm:p-5 transition-all">
      {/* Input row */}
      <div className="relative flex items-center">
        <label htmlFor="catalog-search-input" className="sr-only">
          Search college library catalogue
        </label>
        <Search className="w-4 h-4 text-blue-600 absolute left-3.5 pointer-events-none" />
        <input
          id="catalog-search-input"
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search catalogue by title, author, discipline, keyword, or call number (e.g., 'Hofstadter', 'Engineering')..."
          className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-[#F5F9FF] border border-[#DCE7F5] rounded-xl text-[#0B1F3A] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] transition-all font-interface"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-[#0B1F3A] rounded-full hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
            title="Clear search"
            aria-label="Clear search query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter and Sorting Row */}
      <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`h-8 whitespace-nowrap px-3 rounded-full text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-[#F5F9FF] text-slate-600 hover:bg-[#EFF6FF] hover:text-[#0B1F3A]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Filters & Sort options */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Editor picks filter */}
          <button
            onClick={() => setOnlyEditorPicks(!onlyEditorPicks)}
            className={`h-8 inline-flex items-center space-x-1.5 px-3 rounded-lg border text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer ${
              onlyEditorPicks
                ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] font-bold'
                : 'border-[#DCE7F5] text-slate-600 hover:bg-[#F5F9FF]'
            }`}
            aria-pressed={onlyEditorPicks}
          >
            <Sparkles className="w-3 h-3 text-[#2563EB]" />
            <span>Faculty Picks</span>
          </button>

          {/* Only Available Filter */}
          <button
            onClick={() => setOnlyAvailable(!onlyAvailable)}
            className={`h-8 inline-flex items-center space-x-1.5 px-3 rounded-lg border text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer ${
              onlyAvailable
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                : 'border-[#DCE7F5] text-slate-600 hover:bg-[#F5F9FF]'
            }`}
            aria-pressed={onlyAvailable}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${onlyAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            <span>Available in Stacks</span>
          </button>

          {/* Sort By Select */}
          <div className="flex items-center space-x-1.5 text-slate-600">
            <label htmlFor="sort-by-select" className="hidden sm:inline text-xs text-slate-400">
              Sort:
            </label>
            <select
              id="sort-by-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 bg-[#F5F9FF] border border-[#DCE7F5] rounded-lg px-2 text-xs text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB] cursor-pointer"
            >
              <option value="featured">Faculty Recommendation</option>
              <option value="rating">Highest Scholarly Rating</option>
              <option value="year-desc">Publication Year (Newest)</option>
              <option value="title-asc">Title (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filters status bar */}
      {(searchQuery || selectedCategory !== 'all' || onlyAvailable || onlyEditorPicks) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span>Showing <strong className="text-[#0B1F3A]">{resultsCount}</strong> filtered volume{resultsCount === 1 ? '' : 's'}</span>
            {searchQuery && (
              <span className="bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#DCE7F5] text-[#0B1F3A] truncate max-w-xs">
                matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setOnlyAvailable(false);
              setOnlyEditorPicks(false);
            }}
            className="text-[#2563EB] hover:underline font-medium cursor-pointer"
          >
            Reset all filters
          </button>
        </div>
      )}
    </div>
  );
}
