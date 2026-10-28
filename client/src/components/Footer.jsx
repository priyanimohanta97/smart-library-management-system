import React from 'react';
import { Library, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="circulation" className="bg-[#0B1320] text-[#FAF8F5] pt-14 pb-10 border-t-2 border-[#C88A35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-10 border-b border-[#1E2D44]">
          {/* Brand & Manifesto Column (2 cols wide) */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-[#111C2E] border border-[#1E2D44] flex items-center justify-center">
                <Library className="w-4.5 h-4.5 text-[#C88A35]" />
              </div>
              <div>
                <span className="font-editorial text-xl font-bold tracking-tight text-[#FAF8F5] block leading-none">
                  ATHENÆUM
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#6E8578] mt-1 block">
                  Editorial Intelligence System
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-sm">
              Smart Library Book Recommendation & Management System. Engineered for scholars, researchers, and curious minds seeking rigorous intellectual provenance.
            </p>

            <div className="space-y-2 pt-2 text-xs text-[#94A3B8]">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#C88A35] shrink-0" />
                <span>Central Campus Quadrangle · Library Tower, Floors 1–6</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#6E8578] shrink-0" />
                <span>Reference & Circulation Desk: +1 (555) 019-2834</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-[#6E8578] shrink-0" />
                <span>librarian@athenaeum-library.edu</span>
              </div>
            </div>
          </div>

          {/* Column 2: Archival Stacks */}
          <div className="space-y-3">
            <h4 className="font-editorial text-sm sm:text-base font-semibold text-[#FAF8F5] tracking-wide">
              Archival Stacks
            </h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li>
                <a href="#curated-catalog" className="hover:text-[#FAF8F5] transition-colors focus-visible:ring-1 focus-visible:ring-[#C88A35] rounded">
                  Autumn 2026 Acquisitions
                </a>
              </li>
              <li>
                <a href="#curated-catalog" className="hover:text-[#FAF8F5] transition-colors focus-visible:ring-1 focus-visible:ring-[#C88A35] rounded">
                  Rare Folios & Manuscripts
                </a>
              </li>
              <li>
                <a href="#curated-catalog" className="hover:text-[#FAF8F5] transition-colors focus-visible:ring-1 focus-visible:ring-[#C88A35] rounded">
                  Faculty Working Papers
                </a>
              </li>
              <li>
                <a href="#curated-catalog" className="hover:text-[#FAF8F5] transition-colors focus-visible:ring-1 focus-visible:ring-[#C88A35] rounded">
                  Digital Microfilm Scans
                </a>
              </li>
              <li>
                <a href="#curated-catalog" className="hover:text-[#FAF8F5] transition-colors focus-visible:ring-1 focus-visible:ring-[#C88A35] rounded">
                  Special Collections Alcove
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Hours & Circulation */}
          <div className="space-y-3">
            <h4 className="font-editorial text-sm sm:text-base font-semibold text-[#FAF8F5] tracking-wide">
              Hours & Access
            </h4>
            <ul className="space-y-2 text-xs text-[#94A3B8]">
              <li className="flex justify-between">
                <span>Main Reading Hall:</span>
                <span className="text-[#FAF8F5]">08:00 – 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Graduate Scholar Quads:</span>
                <span className="text-[#C88A35]">24 Hours</span>
              </li>
              <li className="flex justify-between">
                <span>Rare Book Stacks:</span>
                <span className="text-[#FAF8F5]">10:00 – 17:00</span>
              </li>
              <li className="flex justify-between">
                <span>Inter-Library Dispatch:</span>
                <span className="text-[#FAF8F5]">Mon – Fri</span>
              </li>
              <li className="pt-2 border-t border-[#1E2D44] text-[11px] text-[#6E8578]">
                Standard loan term: 14 academic days
              </li>
            </ul>
          </div>

          {/* Column 4: System Architecture */}
          <div className="space-y-3">
            <h4 className="font-editorial text-sm sm:text-base font-semibold text-[#FAF8F5] tracking-wide">
              System Architecture
            </h4>
            <div className="bg-[#111C2E] p-3 rounded-lg border border-[#1E2D44] text-xs space-y-1.5 text-[#94A3B8]">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#64748B]">Frontend:</span>
                <span className="font-mono text-[#FAF8F5]">React + Tailwind</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#64748B]">Backend:</span>
                <span className="font-mono text-[#FAF8F5]">Spring Boot</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#64748B]">Database:</span>
                <span className="font-mono text-[#FAF8F5]">MySQL + JPA</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#64748B]">API Gateway:</span>
                <span className="font-mono text-[#6E8578]">REST / JSON</span>
              </div>
            </div>
            <p className="text-[11px] text-[#64748B] italic">
              Faculty Edition · Version 1.0
            </p>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748B] gap-3">
          <p>
            &copy; 2026 Athenæum Library Discovery System. All rights reserved. Developed for College Mini Project.
          </p>
          <div className="flex items-center space-x-5">
            <span className="hover:text-[#FAF8F5] transition-colors cursor-pointer">
              Bibliographic Standards (ISBD)
            </span>
            <span className="hover:text-[#FAF8F5] transition-colors cursor-pointer">
              Circulation Code
            </span>
            <span className="text-[#C88A35] font-mono">
              v1.0.0
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
