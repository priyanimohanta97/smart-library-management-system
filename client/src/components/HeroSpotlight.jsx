import React from 'react';
import { ArrowRight, BookOpen, Star, Award } from 'lucide-react';
import { CURATOR_SELECTION, EDITORIAL_STATISTICS } from '../data/books';
import BookCoverImage from './BookCoverImage';

export default function HeroSpotlight({ onInspectBook, onExploreCatalog }) {
  const { book, essaySummary } = CURATOR_SELECTION;

  return (
    <section id="spotlight" className="relative pt-6 pb-12 sm:pb-14 border-b border-[#E8E2D9]">
      <div className="relative">
        {/* Main Editorial Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Manifesto */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EBF1ED] border border-[#6E8578]/30 text-[#4F6458] text-xs font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6E8578]"></span>
              <span>Autumn 2026 Academic Curation · Issue No. 48</span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B1320] leading-[1.15] tracking-tight max-w-2xl">
              The Architecture of Thought.
              <span className="block italic font-normal text-[#C88A35] mt-1 text-2xl sm:text-3xl lg:text-4xl">
                Curated for inquisitive readers.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl font-normal">
              Athenæum is a digital library discovery engine engineered around editorial deliberation. We elevate canonical monographs and contemporary scholarship with contextual provenance, faculty recommendations, and physical stacks indexing.
            </p>

            {/* Action buttons with consistent heights and focus states */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreCatalog}
                className="h-10 sm:h-11 inline-flex items-center space-x-2 bg-[#0B1320] hover:bg-[#17243A] text-[#FAF8F5] px-5 sm:px-6 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35] group"
              >
                <span>Browse Curated Catalog</span>
                <ArrowRight className="w-4 h-4 text-[#C88A35] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onInspectBook(book)}
                className="h-10 sm:h-11 inline-flex items-center space-x-2 bg-white hover:bg-[#F3EFEA] text-[#0B1320] border border-[#E8E2D9] px-4 sm:px-5 rounded-lg text-xs sm:text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35]"
              >
                <BookOpen className="w-4 h-4 text-[#6E8578]" />
                <span>Examine Volume Note</span>
              </button>
            </div>

            {/* Quote of the week */}
            <div className="pt-4 border-t border-[#E8E2D9] flex items-start space-x-3 text-xs text-[#64748B] max-w-xl">
              <span className="font-editorial text-xl text-[#C88A35] leading-none">&ldquo;</span>
              <p className="italic leading-relaxed">
                A library is not a luxury, but one of the necessities of life. It is the communal repository of human inquiry and wonder.
              </p>
            </div>
          </div>

          {/* Right Column: Featured Volume Showcase Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-[#E8E2D9] p-5 sm:p-6 shadow-2xs">
              {/* Header inside card */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#F3EFEA]">
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#C88A35]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0B1320]">
                    Volume Spotlight
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#6E8578] font-medium bg-[#EBF1ED] px-2 py-0.5 rounded">
                  {book.callNumber}
                </span>
              </div>

              {/* Book presentation */}
              <div className="mt-4 flex gap-4 sm:gap-5 items-start">
                <div className="w-24 sm:w-28 shrink-0 rounded overflow-hidden border border-[#E8E2D9]">
                  <BookCoverImage
                    src={book.coverImage}
                    alt={book.title}
                    title={book.title}
                    author={book.author}
                    callNumber={book.callNumber}
                    aspectRatio="aspect-[3/4]"
                  />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#C88A35] block">
                    {book.categoryLabel}
                  </span>
                  <h3 
                    onClick={() => onInspectBook(book)}
                    className="font-editorial text-lg sm:text-xl font-bold text-[#0B1320] hover:text-[#C88A35] transition-colors leading-tight cursor-pointer line-clamp-2"
                  >
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium truncate">
                    By {book.author}
                  </p>
                  <div className="flex items-center space-x-1 text-xs pt-1">
                    <Star className="w-3.5 h-3.5 fill-[#C88A35] text-[#C88A35]" />
                    <span className="font-bold text-[#0B1320]">{book.rating}</span>
                    <span className="text-[#94A3B8]">({book.reviewsCount} scholars)</span>
                  </div>
                </div>
              </div>

              {/* Curator appraisal */}
              <div className="mt-4 bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E2D9] text-xs text-[#475569] leading-relaxed">
                <p className="font-semibold text-[#0B1320] mb-1 flex items-center space-x-1.5 text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C88A35]"></span>
                  <span>Curator Appraisal</span>
                </p>
                <p className="line-clamp-3">
                  {essaySummary}
                </p>
              </div>

              {/* Status and Action */}
              <div className="mt-4 pt-3.5 border-t border-[#F3EFEA] flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#6E8578]"></span>
                  <span className="font-semibold text-[#4F6458] text-[11px]">
                    Available ({book.copiesAvailable} in Stacks)
                  </span>
                </div>
                <button
                  onClick={() => onInspectBook(book)}
                  className="h-8 inline-flex items-center space-x-1 text-xs font-semibold text-[#0B1320] hover:text-[#C88A35] transition-colors focus-visible:ring-2 focus-visible:ring-[#C88A35] rounded px-2"
                >
                  <span>Examine Record</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Institutional Statistics Strip */}
        <div className="mt-12 bg-[#0B1320] text-[#FAF8F5] rounded-xl p-5 sm:p-6 grid grid-cols-2 lg:grid-cols-4 gap-6 border border-[#1E2D44]">
          {EDITORIAL_STATISTICS.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <span className="font-editorial text-2xl sm:text-3xl font-bold text-[#FAF8F5] tracking-tight block">
                {stat.value}
              </span>
              <span className="text-[11px] text-[#94A3B8] font-medium uppercase tracking-wider block">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
