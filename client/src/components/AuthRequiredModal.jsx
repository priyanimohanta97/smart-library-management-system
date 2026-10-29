import React from 'react';
import { LogIn, ShieldAlert, X, BookOpen, GraduationCap, Bookmark } from 'lucide-react';

export default function AuthRequiredModal({
  isOpen,
  onClose,
  onProceedToLogin,
  book = null,
  reason = 'loan'
}) {
  if (!isOpen) return null;

  const isReadingList = reason === 'reading-list';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B1F3A]/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle bg-white rounded-2xl border border-[#DCE7F5] shadow-2xl transform transition-all relative z-10 animate-in fade-in zoom-in-95 duration-200">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-[#0B1F3A] hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center space-x-3.5 mb-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] shrink-0">
              {isReadingList ? (
                <Bookmark className="w-6 h-6 fill-[#2563EB]/20 text-[#2563EB]" />
              ) : (
                <GraduationCap className="w-6 h-6" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded border border-[#BFDBFE]/60">
                Institutional Access
              </span>
              <h3 id="auth-modal-title" className="text-lg font-bold text-[#0B1F3A] mt-0.5">
                {isReadingList ? 'Sign In to Save Books' : 'Student Sign-In Required'}
              </h3>
            </div>
          </div>

          {/* Book Summary Card */}
          {book && (
            <div className="p-3 bg-[#F8FAFC] border border-[#DCE7F5] rounded-xl flex items-center space-x-3 mb-4">
              <div className="w-10 h-14 bg-[#0B1F3A] rounded overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                {book.coverImage ? (
                  <img 
                    src={book.coverImage} 
                    alt={book.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <BookOpen className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#0B1F3A] line-clamp-1">
                  {book.title}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {book.author}
                </p>
                <span className="text-[10px] font-medium text-emerald-600">
                  {book.copiesAvailable || 0} copies ready in stacks
                </span>
              </div>
            </div>
          )}

          {/* Message */}
          <p className="text-xs text-slate-600 leading-relaxed mb-6">
            {isReadingList
              ? 'Personal reading lists are reserved for authenticated VSSUT students. Please sign in to save monographs to your personal syllabus and reading list.'
              : 'Monograph borrowing and circulation reservations are exclusively available to authenticated VSSUT students and academic members. Please sign in to reserve this volume under your student account.'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                onClose();
                if (onProceedToLogin) {
                  onProceedToLogin(book);
                }
              }}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 mr-2" />
              Sign In as Student
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

