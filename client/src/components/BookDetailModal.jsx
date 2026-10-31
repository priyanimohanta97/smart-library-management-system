import React, { useEffect } from 'react';
import { X, Star, Bookmark, MapPin, ShieldCheck, CheckCircle2 } from 'lucide-react';
import BookCoverImage from './BookCoverImage';

export default function BookDetailModal({
  book,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onReserve,
  isBorrowingDisabled = false,
  showReadingList = true
}) {
  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !book) return null;

  const isAvailable = book.status === 'Available';
  const isFallback = isBorrowingDisabled || Boolean(book.isFallback) || (typeof book.id === 'string' && book.id.startsWith('book-'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-book-title">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B1F3A]/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-white rounded-2xl max-w-2xl sm:max-w-3xl w-full border border-[#DCE7F5] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#F8FAFC] border-b border-[#DCE7F5] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-white text-[#0B1F3A] border border-[#DCE7F5]">
              Call Number: {book.callNumber}
            </span>
            <span className="text-xs font-semibold text-[#2563EB]">
              {book.categoryLabel}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-[#0B1F3A] hover:bg-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Book Cover */}
            <div className="w-full sm:w-48 shrink-0">
              <div className="relative aspect-[3/4] bg-[#F5F9FF] rounded-xl overflow-hidden border border-[#DCE7F5] shadow-xs">
                <BookCoverImage
                  src={book.coverImage}
                  alt={`Cover of ${book.title}`}
                  title={book.title}
                  author={book.author}
                  callNumber={book.callNumber}
                  aspectRatio="aspect-[3/4]"
                />
              </div>

              {/* Status pill under image */}
              <div className="mt-3 text-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  isAvailable 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isAvailable ? `In Stacks (${book.copiesAvailable} copies)` : 'Waitlist Active'}
                </span>
              </div>
            </div>

            {/* Book Details Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 id="modal-book-title" className="text-xl sm:text-2xl font-bold text-[#0B1F3A] leading-tight">
                  {book.title}
                </h2>
                {book.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 italic">
                    {book.subtitle}
                  </p>
                )}
                <p className="text-xs text-slate-600 mt-2">
                  By <strong className="text-slate-900">{book.author}</strong> ({book.year})
                </p>
                <p className="text-[11px] text-slate-400">
                  {book.authorRole || 'Faculty Monograph'}
                </p>
              </div>

              {/* Rating & Review */}
              <div className="flex items-center space-x-2 text-xs text-slate-700">
                <div className="flex items-center space-x-1 font-bold text-[#0B1F3A]">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{book.rating} / 5.0</span>
                </div>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{book.reviewsCount} scholarly citations & reviews</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500">{book.pages} pages</span>
              </div>

              {/* Location in Central Library */}
              <div className="p-3 bg-[#F5F9FF] rounded-xl border border-[#DCE7F5] flex items-center space-x-2.5 text-xs text-slate-700">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Shelf Location:</strong> {book.location}
                </span>
              </div>

              {/* Synopsis */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Monograph Abstract & Synopsis
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {book.synopsis}
                </p>
              </div>

              {/* Subject Tags */}
              {book.tags && (
                <div className="pt-1 flex flex-wrap gap-1.5">
                  {(Array.isArray(book.tags) ? book.tags : book.tags.split(',').map(t => t.trim())).map((tag) => (
                    <span 
                      key={tag}
                      className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 sm:px-6 py-4 bg-[#F8FAFC] border-t border-[#DCE7F5] flex flex-wrap items-center justify-between gap-3">
          {showReadingList ? (
            <button
              onClick={() => onToggleSave(book.id)}
              className={`h-9 px-4 rounded-lg border text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-[#DCE7F5]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved to Reading List' : 'Save to Reading List'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (!isFallback) {
                  onReserve(book);
                  onClose();
                }
              }}
              disabled={!isAvailable || isFallback}
              title={isFallback ? 'Borrowing is temporarily unavailable on offline catalogue preview' : undefined}
              className={`h-9 px-5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isFallback
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isAvailable
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isFallback ? 'Borrowing Offline' : isAvailable ? 'Issue Book' : 'Join Waitlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
