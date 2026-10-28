import React, { useState } from 'react';
import { LayoutGrid, List, Library, RotateCcw, Bookmark } from 'lucide-react';
import BookCard from './BookCard';
import BookCoverImage from './BookCoverImage';

export default function BookCollection({
  books,
  savedBookIds,
  onToggleSave,
  onInspectBook,
  onQuickReserve,
  onResetFilters
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  if (books.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-8 sm:p-12 text-center max-w-lg mx-auto my-10 shadow-2xs">
        <div className="w-14 h-14 rounded-full bg-[#FAF8F5] border border-[#E8E2D9] flex items-center justify-center mx-auto text-[#6E8578] mb-3.5">
          <Library className="w-7 h-7" />
        </div>
        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#0B1320]">
          No Volumes Found in Stacks
        </h3>
        <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
          No catalog records match your query or filter criteria. You can clear your active filters or broaden your search keywords.
        </p>
        <button
          onClick={onResetFilters}
          className="mt-5 h-9 inline-flex items-center space-x-2 bg-[#0B1320] hover:bg-[#17243A] text-[#FAF8F5] px-4 rounded-md text-xs font-semibold tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35]"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#C88A35]" />
          <span>Reset Catalog Filters</span>
        </button>
      </div>
    );
  }

  return (
    <div id="curated-catalog" className="w-full">
      {/* Section Header with View Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-[#E8E2D9] gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#C88A35] block">
            Curatorial Selection
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B1320] mt-1">
            Recommended Volumes & Archival Highlights
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl leading-relaxed">
            Selected for intellectual depth, enduring relevance, and contemporary resonance across faculties.
          </p>
        </div>

        {/* View Switcher & Counter */}
        <div className="flex items-center space-x-3 self-start sm:self-auto shrink-0">
          <span className="text-xs text-[#94A3B8]">
            <strong className="text-[#0B1320]">{books.length}</strong> volume{books.length === 1 ? '' : 's'} displayed
          </span>
          <div className="bg-white border border-[#E8E2D9] p-0.5 rounded-lg flex items-center space-x-1 shadow-2xs">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35] ${
                viewMode === 'grid'
                  ? 'bg-[#0B1320] text-white'
                  : 'text-[#64748B] hover:text-[#0B1320]'
              }`}
              title="Grid View"
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35] ${
                viewMode === 'list'
                  ? 'bg-[#0B1320] text-white'
                  : 'text-[#64748B] hover:text-[#0B1320]'
              }`}
              title="Bibliographic List View"
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isSaved={savedBookIds.includes(book.id)}
              onToggleSave={onToggleSave}
              onInspect={onInspectBook}
              onQuickReserve={onQuickReserve}
            />
          ))}
        </div>
      ) : (
        /* Dense Bibliographic List View */
        <div className="bg-white rounded-xl border border-[#E8E2D9] divide-y divide-[#F3EFEA] overflow-hidden shadow-2xs">
          {books.map((book) => {
            const isSaved = savedBookIds.includes(book.id);
            const isAvailable = book.status === 'Available';

            return (
              <div
                key={book.id}
                className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF8F5]/80 transition-colors"
              >
                <div className="flex items-start space-x-4 min-w-0">
                  <div className="w-16 h-22 aspect-[3/4] rounded overflow-hidden border border-[#E8E2D9] shrink-0">
                    <BookCoverImage
                      src={book.coverImage}
                      alt={book.title}
                      title={book.title}
                      author={book.author}
                      callNumber={book.callNumber}
                      aspectRatio="aspect-[3/4]"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#F3EFEA] text-[#0B1320] border border-[#E8E2D9]">
                        {book.callNumber}
                      </span>
                      <span className="text-xs font-semibold text-[#6E8578]">
                        {book.categoryLabel}
                      </span>
                      {book.editorPick && (
                        <span className="text-[9px] uppercase tracking-wider font-bold bg-[#C88A35] text-white px-1.5 py-0.2 rounded">
                          Staff Pick
                        </span>
                      )}
                    </div>
                    <h4 
                      onClick={() => onInspectBook(book)}
                      className="font-editorial text-base sm:text-lg font-bold text-[#0B1320] hover:text-[#C88A35] cursor-pointer mt-1 truncate"
                      title={book.title}
                    >
                      {book.title}
                    </h4>
                    <p className="text-xs text-[#64748B] truncate mt-0.5">
                      {book.author} · <span className="italic">{book.authorRole}</span>
                    </p>
                    <p className="text-xs text-[#475569] italic mt-1 line-clamp-1 max-w-xl">
                      &ldquo;{book.curatorQuote}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right metadata and action buttons */}
                <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#F3EFEA]">
                  <div className="text-left md:text-right">
                    <span className="text-xs font-semibold text-[#0B1320] block">
                      {isAvailable ? `Available (${book.copiesAvailable} in stacks)` : book.status}
                    </span>
                    <span className="text-[11px] text-[#94A3B8] block truncate max-w-[150px]">
                      {book.location}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleSave(book.id)}
                      className={`h-8 w-8 flex items-center justify-center rounded-md border text-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35] ${
                        isSaved
                          ? 'bg-[#C88A35] text-white border-[#C88A35]'
                          : 'border-[#E8E2D9] text-[#64748B] hover:bg-[#FAF8F5]'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save volume'}
                      aria-label="Toggle bookmark"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => onInspectBook(book)}
                      className="h-8 px-3 text-xs font-medium bg-[#F3EFEA] hover:bg-[#E8E2D9] text-[#0B1320] border border-[#E8E2D9] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35]"
                    >
                      Inspect
                    </button>
                    <button
                      onClick={() => onQuickReserve(book)}
                      disabled={!isAvailable}
                      className={`h-8 px-3 text-xs font-medium rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35] ${
                        isAvailable
                          ? 'bg-[#0B1320] hover:bg-[#17243A] text-[#FAF8F5]'
                          : 'bg-[#E8E2D9] text-[#94A3B8] border border-[#D5CEC4] cursor-not-allowed'
                      }`}
                    >
                      {isAvailable ? 'Loan' : 'Waitlist'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
