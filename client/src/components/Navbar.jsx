import React, { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  Menu, 
  X, 
  User, 
  Shield, 
  LogOut, 
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Bell
} from 'lucide-react';

export default function Navbar({ 
  savedCount = 0, 
  onOpenSaved, 
  currentUser = null,
  onOpenLogin,
  onLogout,
  onNavigateHome,
  onNavigateExplore,
  onNavigateServices,
  onNavigateAbout,
  onOpenDashboard,
  currentView = 'home',
  unreadNotificationsCount = 0,
  onOpenNotifications
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminOrManager = currentUser && (
    currentUser.role === 'ADMIN' ||
    currentUser.role === 'MANAGER' ||
    currentUser.role === 'LIBRARIAN' ||
    currentUser.role === 'ROLE_ADMIN' ||
    currentUser.role === 'ROLE_MANAGER'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE7F5] transition-all shadow-2xs">
      {/* Top Institutional Notification Strip */}
      <div className="bg-[#0B1F3A] text-white text-xs py-1.5 px-4 sm:px-8 flex justify-between items-center tracking-wide border-b border-[#162F56]">
        <div className="flex items-center space-x-2.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">
            Veer Surendra Sai University of Technology · Central Digital Library
          </span>
        </div>
        <div className="hidden md:flex items-center space-x-6 text-slate-300 text-xs">
          <span>Main Reading Hall Open: 08:00 – 22:00</span>
          <span className="text-blue-300 font-medium">Digital OPAC Active</span>
          <span>Burla, Sambalpur, Odisha</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
        {/* Brand identity with VSSUT Crest */}
        <div className="flex items-center space-x-4">
          <button 
            type="button"
            onClick={onNavigateHome} 
            className="flex items-center space-x-3.5 group focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-lg p-1 text-left cursor-pointer"
            aria-label="VSSUT Central Library Home"
          >
            <div className="w-11 h-11 rounded-lg bg-white p-1 border border-[#DCE7F5] shadow-xs flex items-center justify-center group-hover:border-[#2563EB] transition-colors overflow-hidden">
              <img 
                src="/images/1630574548148.jpg" 
                alt="VSSUT University Crest" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-[#0B1F3A] leading-tight">
                VSSUT Central Library
              </span>
              <span className="text-[11px] font-semibold text-[#2563EB] uppercase tracking-wider">
                Smart Recommendation & Management Portal
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-7 text-xs font-semibold uppercase tracking-wider text-[#334155]">
          <button 
            type="button"
            onClick={onNavigateHome}
            className={`py-1 transition-colors hover:text-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1 cursor-pointer ${
              currentView === 'home' ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold' : ''
            }`}
          >
            Home
          </button>
          <button 
            type="button"
            onClick={onNavigateExplore}
            className={`py-1 transition-colors hover:text-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1 cursor-pointer ${
              currentView === 'student-dashboard' || currentView === 'catalog' ? 'text-[#2563EB] border-b-2 border-[#2563EB] font-bold' : ''
            }`}
          >
            Explore Books
          </button>
          <button 
            type="button"
            onClick={onNavigateServices}
            className="py-1 transition-colors hover:text-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1 cursor-pointer"
          >
            Library Services
          </button>
          <button 
            type="button"
            onClick={onNavigateAbout}
            className="py-1 transition-colors hover:text-[#2563EB] focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1 cursor-pointer"
          >
            About
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Saved Reading List (when on catalog/dashboard) - hidden for ADMIN/MANAGER/LIBRARIAN */}
          {!isAdminOrManager && onOpenSaved && (
            <button
              onClick={onOpenSaved}
              className="h-9 relative inline-flex items-center space-x-2 px-3 rounded-md border border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EFF6FF] text-[#0B1F3A] text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
              aria-label={`View reading list with ${savedCount} books`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedCount > 0 ? 'text-[#2563EB] fill-[#2563EB]' : 'text-[#64748B]'}`} />
              <span className="hidden sm:inline">Reading List</span>
              {savedCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
          )}

          {/* Notification Bell (for authenticated users) */}
          {currentUser && onOpenNotifications && (
            <button
              type="button"
              onClick={onOpenNotifications}
              className="h-9 relative inline-flex items-center justify-center w-9 rounded-md border border-[#DCE7F5] bg-[#F5F9FF] hover:bg-[#EFF6FF] text-[#0B1F3A] transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
              title="Notifications"
              aria-label={`View notifications, ${unreadNotificationsCount} unread`}
            >
              <Bell className="w-4 h-4 text-[#475569]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Authenticated user badge & controls */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onOpenDashboard}
                className="h-9 px-3 rounded-md border border-[#DCE7F5] bg-[#EFF6FF] hover:bg-blue-100/70 text-[#0B1F3A] flex items-center space-x-2 text-xs transition-colors cursor-pointer"
                title="Go to your dashboard"
              >
                {isAdminOrManager ? (
                  <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                ) : (
                  <User className="w-3.5 h-3.5 text-[#2563EB]" />
                )}
                <span className="font-semibold max-w-[120px] truncate hidden sm:inline">
                  {currentUser.fullName}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isAdminOrManager 
                    ? 'bg-[#0B1F3A] text-white' 
                    : 'bg-[#2563EB] text-white'
                }`}>
                  {isAdminOrManager ? 'Librarian' : 'Student'}
                </span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="h-9 px-2.5 inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-[#475569] border border-[#DCE7F5] rounded-md text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
                title="Sign out of your session"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            /* Unauthenticated Portal CTA Button */
            <button
              type="button"
              onClick={onOpenLogin}
              className="h-9.5 inline-flex items-center space-x-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 rounded-md text-xs font-semibold tracking-wide transition-all shadow-xs hover:shadow-sm focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Enter Library Portal</span>
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md text-[#0B1F3A] hover:bg-[#EFF6FF] border border-[#DCE7F5] focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#DCE7F5] bg-white px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          {currentUser && (
            <div className="p-3 bg-[#EFF6FF] rounded-lg border border-[#DCE7F5] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isAdminOrManager ? (
                  <Shield className="w-4 h-4 text-[#2563EB]" />
                ) : (
                  <User className="w-4 h-4 text-[#2563EB]" />
                )}
                <div>
                  <p className="text-xs font-bold text-[#0B1F3A]">{currentUser.fullName}</p>
                  <p className="text-[10px] text-[#64748B]">{currentUser.email}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isAdminOrManager ? 'bg-[#0B1F3A] text-white' : 'bg-[#2563EB] text-white'
              }`}>
                {isAdminOrManager ? 'Librarian' : 'Student'}
              </span>
            </div>
          )}

          <div className="flex flex-col space-y-2 text-sm font-medium text-[#334155]">
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateHome();
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#EFF6FF] transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateExplore();
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#EFF6FF] transition-colors"
            >
              Explore Books
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateServices();
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#EFF6FF] transition-colors"
            >
              Library Services
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigateAbout();
              }}
              className="text-left px-3 py-2 rounded hover:bg-[#EFF6FF] transition-colors"
            >
              About
            </button>
          </div>

          <div className="pt-3 border-t border-[#DCE7F5] flex items-center justify-between text-xs text-[#64748B]">
            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout();
                }}
                className="text-red-700 font-semibold flex items-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out ({currentUser.fullName})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="text-[#2563EB] font-bold flex items-center space-x-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Enter Library Portal</span>
              </button>
            )}
            <span className="text-[#0B1F3A] font-semibold">VSSUT Portal v2.0</span>
          </div>
        </div>
      )}
    </header>
  );
}
