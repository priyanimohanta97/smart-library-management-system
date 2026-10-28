import React from 'react';
import { X, Trash2, BookOpen, Bookmark, ArrowUpRight } from 'lucide-react';
import BookCoverImage from './BookCoverImage';

export default function SavedBooksDrawer({
  isOpen,
  onClose,
  savedBooks = [],
  onRemoveSaved,
  onClearAll,
  onInspectBook,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Reading list drawer">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-[#DCE7F5] shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-[#DCE7F5] bg-[#F8FAFC] flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] border border-[#DCE7F5] flex items-center justify-center text-[#2563EB]">
                <Bookmark className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0B1F3A] leading-tight">
                  Personal Reading List
                </h2>
                <span className="text-[11px] text-slate-500">
                  {savedBooks.length} volume{savedBooks.length === 1 ? '' : 's'} earmarked
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {savedBooks.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-[11px] text-slate-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
                  title="Remove all books from reading list"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-200 transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {savedBooks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <BookOpen className="w-12 h-12 stroke-1 text-slate-300" />
                <h3 className="font-bold text-sm text-[#0B1F3A]">Your reading list is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Browse the university catalogue and click the bookmark icon on any monograph to save it for study.
                </p>
              </div>
            ) : (
              savedBooks.map((book) => (
                <div key={book.id} className="py-4 first:pt-0 last:pb-0 flex space-x-3.5 group">
                  <div 
                    onClick={() => {
                      onInspectBook(book);
                      onClose();
                    }}
                    className="w-16 h-22 relative bg-[#F5F9FF] rounded-lg overflow-hidden shrink-0 border border-[#DCE7F5] cursor-pointer shadow-2xs group-hover:scale-102 transition-transform"
                  >
                    <BookCoverImage
                      src={book.coverImage}
                      alt={book.title}
                      title={book.title}
                      author={book.author}
                      callNumber={book.callNumber}
                      aspectRatio="aspect-[3/4]"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 
                        onClick={() => {
                          onInspectBook(book);
                          onClose();
                        }}
                        className="text-xs font-bold text-[#0B1F3A] hover:text-[#2563EB] cursor-pointer line-clamp-2 leading-snug"
                        title={book.title}
                      >
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {book.author}
                      </p>
                      <span className="inline-block font-mono text-[9px] px-1.5 py-0.2 bg-[#F5F9FF] border border-[#DCE7F5] text-slate-600 rounded mt-1">
                        {book.callNumber}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`text-[10px] font-semibold ${
                        book.status === 'Available' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        {book.status}
                      </span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            onInspectBook(book);
                            onClose();
                          }}
                          className="text-[11px] text-[#2563EB] hover:underline inline-flex items-center space-x-0.5 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onRemoveSaved(book.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors cursor-pointer"
                          title="Remove from list"
                          aria-label={`Remove ${book.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {savedBooks.length > 0 && (
            <div className="p-4 border-t border-[#DCE7F5] bg-[#F8FAFC] space-y-2">
              <button
                onClick={onClose}
                className="w-full h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
              >
                <span>Continue Browsing Catalogue</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
