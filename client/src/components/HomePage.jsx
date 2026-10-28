import React from 'react';
import { 
  BookOpen, 
  Search, 
  Layers, 
  Bookmark, 
  Shield, 
  User, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Building2, 
  CheckCircle2, 
  ChevronRight,
  Library
} from 'lucide-react';

export default function HomePage({
  onSelectRole,
  onExploreBooks,
  onOpenLogin,
}) {
  return (
    <div className="w-full bg-[#F8FAFC] text-[#334155] font-interface">
      {/* ====================================================
          1. HERO SECTION
          ==================================================== */}
      <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden bg-[#0B1F3A]">
        {/* Background College Gate Image with Rich Navy Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/images.jpg.jpeg"
            alt="VSSUT Burla Campus Gate and Arch"
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Deep Navy/Royal Blue Gradient Overlays for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/95 via-[#0B1F3A]/88 to-[#0B1F3A]/75"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A] via-transparent to-black/30"></div>
          
          {/* Subtle Decorative Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#3B82F6_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-white w-full">
          <div className="max-w-3xl space-y-6 animate-slide-up">
            {/* Visual Pill Label */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>SMART COLLEGE LIBRARY · VSSUT BURLA</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your Campus. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-blue-400 to-indigo-200">
                Your Library.
              </span> <br />
              Your Next Discovery.
            </h1>

            {/* Supporting Description */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-200/90 leading-relaxed max-w-2xl font-normal">
              Explore knowledge, discover your next favorite book, and access your college library through one smart digital platform.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onExploreBooks}
                className="h-11 sm:h-12 px-6 sm:px-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center space-x-2.5 focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
              >
                <span>Explore Library</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const portalEl = document.getElementById('choose-portal-section');
                  if (portalEl) {
                    portalEl.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    onOpenLogin();
                  }
                }}
                className="h-11 sm:h-12 px-5 sm:px-7 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-lg border border-white/25 backdrop-blur-md transition-all flex items-center space-x-2 focus-visible:ring-2 focus-visible:ring-white cursor-pointer"
              >
                <span>Enter Library Portal</span>
                <ChevronRight className="w-4 h-4 text-blue-300" />
              </button>
            </div>

            {/* Institutional Trust Indicators */}
            <div className="pt-6 border-t border-white/15 flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Central Campus Library Tower</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Reading Hall: 08:00 – 22:00</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Synchronized Student OPAC</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          2. LIBRARY SERVICES SECTION
          ==================================================== */}
      <section id="library-services" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] block">
            Academic Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mt-1.5 tracking-tight">
            Library Services for Scholars
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Engineered to streamline study workflows, bibliographic search, and access to campus print stacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Service Card 1: Discover Books */}
          <div 
            onClick={onExploreBooks}
            className="group bg-white rounded-xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-[#DCE7F5] text-[#2563EB] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B1F3A] group-hover:text-[#2563EB] transition-colors">
                Discover Books
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Search verified university holdings by title, author, subject tags, or Library of Congress call numbers.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#2563EB]">
              <span>Search Catalogue</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service Card 2: Browse Categories */}
          <div 
            onClick={onExploreBooks}
            className="group bg-white rounded-xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-[#DCE7F5] text-[#2563EB] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B1F3A] group-hover:text-[#2563EB] transition-colors">
                Browse Categories
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Filter monographs across Computer Science, Electrical Engineering, Civil & Mechanical Stacks, and Pure Sciences.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#2563EB]">
              <span>View Disciplines</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service Card 3: Reading Lists */}
          <div 
            onClick={onExploreBooks}
            className="group bg-white rounded-xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-[#DCE7F5] text-[#2563EB] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B1F3A] group-hover:text-[#2563EB] transition-colors">
                Reading Lists
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Bookmark and assemble private syllabi lists for ongoing coursework, dissertation research, or faculty reading groups.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#2563EB]">
              <span>Manage List</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Service Card 4: Library Access */}
          <div 
            onClick={() => {
              const portalEl = document.getElementById('choose-portal-section');
              if (portalEl) portalEl.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group bg-white rounded-xl p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-[#DCE7F5] text-[#2563EB] flex items-center justify-center mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0B1320] group-hover:text-[#2563EB] transition-colors">
                Library Access
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Authenticated student and faculty digital gateway with role-based clearances for loan verification and stack inventory.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[#2563EB]">
              <span>Sign In to Portal</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          3. WHY USE THE DIGITAL LIBRARY? SECTION
          ==================================================== */}
      <section id="about-library" className="py-16 sm:py-20 bg-white border-y border-[#DCE7F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Visual Column with Campus Gate Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#DCE7F5] shadow-lg">
                <img
                  src="/images/images (2).jpg.jpeg"
                  alt="VSSUT Burla Campus Entrance Arch and Palm Grounds"
                  className="w-full h-[360px] sm:h-[420px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/30 to-transparent"></div>
                
                {/* Floating Inset Badge */}
                <div className="absolute bottom-5 left-5 right-5 p-4 bg-white/95 backdrop-blur-md rounded-xl border border-white/60 shadow-md">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0B1F3A] text-white flex items-center justify-center shrink-0">
                      <Library className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0B1F3A]">Veer Surendra Sai University of Technology</p>
                      <p className="text-[11px] text-slate-500">Established 1956 · Premier Engineering & Scientific Stacks</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] block">
                  Campus Digital Evolution
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mt-1.5 tracking-tight">
                  Why Use the Digital Library?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  The central university library bridges traditional archival print collections with intelligent discovery, helping students and educators locate primary sources in seconds.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Real-Time Stack Availability</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Confirm physical copy availability, shelf call numbers, and alcove locations before visiting the reading halls.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Smart Coursework Recommendations</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Discover complementary monographs and research treatises aligned with your academic discipline and syllabus.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0B1F3A]">Secure Role-Based Governance</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Isolated student research areas and administrator management tools powered by Spring Security and JWT.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onExploreBooks}
                  className="h-10 px-5 bg-[#0B1F3A] hover:bg-[#162F56] text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center space-x-2 cursor-pointer"
                >
                  <span>Explore Academic Collections</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          4. ROLE SELECTION SECTION ("Choose Your Portal")
          ==================================================== */}
      <section id="choose-portal-section" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100/70 text-[#2563EB] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Digital Gateway</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            Choose Your Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Select how you want to access the college library.
          </p>
        </div>

        {/* The Two Distinct Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card 1: Student Card */}
          <div className="group relative bg-white rounded-2xl p-8 border-2 border-[#DCE7F5] hover:border-[#2563EB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>
            
            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-[#EFF6FF] border border-blue-200 text-[#2563EB] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-200">
                  <User className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-[#2563EB]">
                  Student Access
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-[#0B1F3A] group-hover:text-[#2563EB] transition-colors">
                Continue as Student
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Discover books, organize your reading list, and explore library resources.
              </p>

              {/* Feature Highlights */}
              <ul className="mt-5 space-y-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Personal reading list and bookmark sync</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Real-time shelf call number lookup</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Self-registration for enrolled students</span>
                </li>
              </ul>
            </div>

            {/* Action Button: Continue as Student */}
            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSelectRole('STUDENT')}
                className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-xs group-hover:shadow-md cursor-pointer"
              >
                <span>Continue as Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Card 2: Librarian Card */}
          <div className="group relative bg-white rounded-2xl p-8 border-2 border-[#DCE7F5] hover:border-[#0B1F3A] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-slate-100 to-transparent rounded-bl-full pointer-events-none transition-transform group-hover:scale-110"></div>

            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-[#0B1F3A] flex items-center justify-center group-hover:bg-[#0B1F3A] group-hover:text-white transition-colors duration-200">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-[#0B1F3A]">
                  Staff Clearance
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold text-[#0B1F3A]">
                Continue as Librarian
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                Access the library administration portal and manage supported library operations.
              </p>

              {/* Feature Highlights */}
              <ul className="mt-5 space-y-2 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Central collection inventory & stack controls</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Patron records & circulation overview</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>Requires verified ADMIN or MANAGER role</span>
                </li>
              </ul>
            </div>

            {/* Action Button: Continue as Librarian */}
            <div className="mt-8 pt-5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onSelectRole('LIBRARIAN')}
                className="w-full h-11 bg-[#0B1F3A] hover:bg-[#162F56] text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-xs group-hover:shadow-md cursor-pointer"
              >
                <span>Continue as Librarian</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          5. FOOTER
          ==================================================== */}
      <footer className="bg-[#0B1F3A] text-slate-300 pt-12 pb-8 border-t-2 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#162F56]">
            {/* Column 1: Brand & Institution */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden">
                  <img src="/images/1630574548148.jpg" alt="VSSUT Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-bold text-white text-base block leading-tight">
                    VSSUT Central Library
                  </span>
                  <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider block">
                    Veer Surendra Sai University of Technology
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                Smart Library Book Recommendation & Management System. Serving students, research scholars, and faculty with integrated bibliographic access and AI-driven recommendations.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Quick Navigation
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li>
                  <button onClick={onExploreBooks} className="hover:text-white transition-colors cursor-pointer">
                    Explore Books
                  </button>
                </li>
                <li>
                  <a href="#library-services" className="hover:text-white transition-colors">
                    Library Services
                  </a>
                </li>
                <li>
                  <a href="#choose-portal-section" className="hover:text-white transition-colors">
                    Choose Your Portal
                  </a>
                </li>
                <li>
                  <a href="#about-library" className="hover:text-white transition-colors">
                    About Digital Library
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Hours & Location */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Campus Location
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Central Library Building<br />
                VSSUT Campus, Burla, Sambalpur<br />
                Odisha, India – 768018
              </p>
              <div className="text-[11px] text-blue-300">
                Reading Hall: 08:00 – 22:00 Daily
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
            <p>
              &copy; {new Date().getFullYear()} VSSUT Central Library. Developed for College Mini Project.
            </p>
            <div className="flex items-center space-x-4 text-[11px]">
              <span>ISBD Bibliographic Standards</span>
              <span>·</span>
              <span>Spring Boot + React Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

