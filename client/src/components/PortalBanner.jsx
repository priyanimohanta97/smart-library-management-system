import React from 'react';
import { Shield, BookOpen, User, CheckCircle2, AlertTriangle, KeyRound, LogOut, Sparkles } from 'lucide-react';

export default function PortalBanner({ currentUser, savedCount = 0, onLogout }) {
  if (!currentUser) return null;

  const isAdminOrManager = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

  return (
    <div className="mb-6 sm:mb-8">
      {isAdminOrManager ? (
        /* Administrator / Librarian Portal Bar */
        <div className="bg-[#0B1320] text-[#FAF8F5] rounded-xl p-5 sm:p-6 border border-[#C88A35]/40 shadow-sm relative overflow-hidden">
          {/* Subtle gold background emblem accent */}
          <div className="absolute -right-6 -bottom-6 text-[#17243A] pointer-events-none opacity-40">
            <Shield className="w-36 h-36 text-[#C88A35]" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C88A35] text-white">
                  <Shield className="w-3 h-3" />
                  <span>{currentUser.role} Clearance</span>
                </span>
                <span className="text-xs text-[#FAF8F5]/60">
                  Institutional Session Active
                </span>
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-white">
                Librarian & Administrative Control Stacks
              </h2>
              <p className="text-xs text-[#FAF8F5]/80 leading-relaxed">
                Curator session authenticated as <strong className="text-white">{currentUser.fullName}</strong> (<span className="text-[#C88A35]">{currentUser.email}</span>). You have elevated access to catalog curation, physical stack inventory, and circulation controls.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
              <div className="bg-[#17243A] px-3 py-1.5 rounded-lg border border-[#223450] text-[#FAF8F5]/90 text-[11px] flex items-center space-x-2">
                <KeyRound className="w-3.5 h-3.5 text-[#C88A35]" />
                <span>JWT HMAC-SHA256 Validated</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="h-8.5 px-3 bg-[#FAF8F5]/10 hover:bg-red-900/60 text-[#FAF8F5] border border-white/20 hover:border-red-500/50 rounded-lg transition-colors flex items-center space-x-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#C88A35]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Scholar / Reader Portal Bar */
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E8E2D9] shadow-2xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#6E8578] text-white">
                  <User className="w-3 h-3" />
                  <span>Enrolled Scholar</span>
                </span>
                <span className="text-xs text-[#64748B]">
                  Academic Reading Pass Active
                </span>
              </div>
              <h2 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-[#0B1320]">
                Scholar Reading Desk · {currentUser.fullName}
              </h2>
              <p className="text-xs text-[#475569] leading-relaxed">
                Welcome back, {currentUser.fullName}. Your patron account is active with borrowing privileges, custom reading list sync, and algorithmic recommendations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-xs shrink-0">
              <div className="bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E8E2D9] text-[#1E293B] text-[11px] flex items-center space-x-2">
                <BookOpen className="w-3.5 h-3.5 text-[#6E8578]" />
                <span>{savedCount} Saved in Reading List</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="h-8.5 px-3 bg-[#FAF8F5] hover:bg-red-50 hover:text-red-700 text-[#475569] border border-[#E8E2D9] hover:border-red-200 rounded-lg transition-colors flex items-center space-x-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#C88A35]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

