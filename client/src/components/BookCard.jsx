import React from 'react';
import { Star, Bookmark, MapPin, ArrowUpRight } from 'lucide-react';
import BookCoverImage from './BookCoverImage';

export default function BookCard({
  book,
  isSaved,
  onToggleSave,
  onInspect,
  onQuickReserve
}) {
  const isAvailable = book.status === 'Available';

  return (
    <article className="group bg-white rounded-xl border border-[#DCE7F5] hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden h-full">
      {/* Top half: Cover and Core Metadata */}
      <div className="flex-1 flex flex-col">
        {/* Cover Container */}
        <div className="relative aspect-[3/4] bg-[#F5F9FF] overflow-hidden border-b border-[#DCE7F5]">
          <BookCoverImage
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            title={book.title}
            author={book.author}
            callNumber={book.callNumber}
            aspectRatio="aspect-[3/4]"
            className="group-hover:scale-[1.02] transition-transform duration-300 ease-out"
          />

          {/* Spine Call Number Tag */}
          <div className="absolute top-2.5 left-2.5 bg-[#0B1F3A]/90 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider px-2 py-0.5 rounded shadow-2xs">
            {book.callNumber}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(book.id);
            }}
            className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer ${
              isSaved
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white/90 hover:bg-white text-slate-700 hover:text-[#2563EB] border border-[#DCE7F5]'
            }`}
            title={isSaved ? 'Remove from Reading List' : 'Save to Reading List'}
            aria-label={isSaved ? `Remove ${book.title} from reading list` : `Save ${book.title} to reading list`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Category Badge & Editor's Tag */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <span className="bg-white/95 backdrop-blur-xs text-[#0B1F3A] text-[10px] font-semibold px-2 py-0.5 rounded border border-[#DCE7F5] shadow-2xs">
              {book.categoryLabel}
            </span>
            {book.editorPick && (
              <span className="bg-[#2563EB] text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-2xs">
                Faculty Pick
              </span>
            )}
          </div>
        </div>

        {/* Card Content with consistent heights */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Title container */}
            <h3 
              onClick={() => onInspect(book)}
              className="text-base font-bold text-[#0B1F3A] group-hover:text-[#2563EB] transition-colors leading-snug cursor-pointer line-clamp-2 h-12"
              title={book.title}
            >
              {book.title}
            </h3>

            {/* Author line */}
            <p className="text-xs text-slate-500 font-medium truncate mt-1">
              By <span className="text-slate-800 font-semibold">{book.author}</span>
              {book.year && <span className="text-slate-400"> · {book.year}</span>}
            </p>

            {/* Author Role */}
            <p className="text-[11px] text-slate-400 italic truncate mt-0.5">
              {book.authorRole || 'Faculty Monograph'}
            </p>
          </div>

          {/* Curator quote */}
          <div className="h-11 bg-[#F5F9FF] p-2 rounded border-l-2 border-[#2563EB] flex items-center overflow-hidden">
            <p className="text-[11px] text-slate-600 italic line-clamp-2 leading-relaxed">
              &ldquo;{book.curatorQuote}&rdquo;
            </p>
          </div>

          {/* Shelf location */}
          <div className="flex items-center text-[11px] text-slate-500 pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1 shrink-0" />
            <span className="truncate">{book.location}</span>
          </div>
        </div>
      </div>

      {/* Bottom section: Availability status and Action buttons */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-3 border-t border-slate-100 space-y-3">
        {/* Availability status line & rating */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            {isAvailable ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-emerald-700 text-[11px]">
                  Available ({book.copiesAvailable} in stacks)
                </span>
              </>
            ) : book.status === 'Reserved' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="font-semibold text-amber-700 text-[11px]">Reserved</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span className="font-semibold text-slate-500 text-[11px]">Checked Out</span>
              </>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1 text-xs font-semibold text-[#0B1F3A]">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{book.rating}</span>
            <span className="text-[10px] text-slate-400">({book.reviewsCount})</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onInspect(book)}
            className="h-9 flex items-center justify-center space-x-1 px-2.5 text-xs font-medium text-[#0B1F3A] bg-[#F5F9FF] hover:bg-[#EFF6FF] border border-[#DCE7F5] rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
          >
            <span>Inspect</span>
            <ArrowUpRight className="w-3 h-3 text-[#2563EB]" />
          </button>

          <button
            onClick={() => onQuickReserve(book)}
            disabled={!isAvailable}
            className={`h-9 flex items-center justify-center px-2.5 text-xs font-medium rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer ${
              isAvailable
                ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            {isAvailable ? 'Request Loan' : 'Join Waitlist'}
          </button>
        </div>
      </div>
    </article>
  );
}
