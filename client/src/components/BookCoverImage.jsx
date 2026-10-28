import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';

export default function BookCoverImage({
  src,
  alt,
  title,
  author,
  callNumber,
  className = '',
  aspectRatio = 'aspect-[3/4]',
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div 
        className={`w-full ${aspectRatio} bg-[#F3EFEA] border-l-4 border-[#C88A35] p-3 flex flex-col justify-between select-none relative overflow-hidden ${className}`}
        aria-label={alt || title}
      >
        {/* Subtle decorative watermark */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#6E8578] font-medium">
          <span className="truncate max-w-[120px]">{callNumber || 'LIB-ARCHIVE'}</span>
          <BookOpen className="w-3.5 h-3.5 text-[#C88A35] shrink-0" />
        </div>

        {/* Center title and author */}
        <div className="my-auto py-2 text-center">
          <p className="font-editorial text-xs sm:text-sm font-bold text-[#0B1320] leading-tight line-clamp-3">
            {title || 'Archival Volume'}
          </p>
          {author && (
            <p className="text-[10px] text-[#64748B] mt-1 line-clamp-1 font-interface">
              {author}
            </p>
          )}
        </div>

        {/* Bottom archival seal */}
        <div className="pt-2 border-t border-[#E8E2D9] text-[9px] text-[#94A3B8] tracking-widest uppercase text-center font-interface">
          Athenæum Stacks
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || title || 'Book cover'}
      onError={() => setHasError(true)}
      loading="lazy"
      className={`w-full h-full object-cover ${className}`}
    />
  );
}

