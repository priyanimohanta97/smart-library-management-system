import React from 'react';
import { Cpu, Compass, Landmark, Feather, Atom, ArrowRight } from 'lucide-react';

const DISCIPLINES_DATA = [
  {
    id: 'ai-computing',
    name: 'AI & Computational Thinking',
    classification: 'LC: QA75 – QA76.9',
    description: 'Recursion, neuro-symbolic reasoning, cybernetics, and human-computer symbiosis.',
    volumes: '42,100 Volumes',
    icon: Cpu,
  },
  {
    id: 'philosophy',
    name: 'Philosophy & Engineering Ethics',
    classification: 'LC: B1 – B5802',
    description: 'Classical antiquity, epistemology, engineering ethics, and intellectual inquiry.',
    volumes: '28,450 Volumes',
    icon: Compass,
  },
  {
    id: 'economics-society',
    name: 'Political Economy & Society',
    classification: 'LC: H1 – HV9960',
    description: 'Institutional economics, technology policy, statecraft, and social systems.',
    volumes: '36,800 Volumes',
    icon: Landmark,
  },
  {
    id: 'classical-lit',
    name: 'Literary Classics & Essays',
    classification: 'LC: PA – PZ4',
    description: 'World epics, Modernist prose, translated correspondence, and critical theory.',
    volumes: '54,200 Volumes',
    icon: Feather,
  },
  {
    id: 'science-nature',
    name: 'Natural History & Applied Physics',
    classification: 'LC: Q – QC999',
    description: 'Quantum mechanics, thermodynamics, material sciences, and cosmological physics.',
    volumes: '22,650 Volumes',
    icon: Atom,
  },
];

export default function CategorySection({ onSelectCategory }) {
  const handleSelect = (categoryId) => {
    onSelectCategory(categoryId);
  };

  return (
    <section id="disciplines" className="py-12 sm:py-16 border-t border-[#DCE7F5]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-[#2563EB] block">
            Academic Organization
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A] mt-1 tracking-tight">
            Browse by Intellectual Discipline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Each discipline pairs foundational textbook monographs with primary research papers curated for VSSUT academic programs.
          </p>
        </div>

        <button
          onClick={() => handleSelect('all')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#2563EB] hover:underline transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded px-1 py-0.5 self-start md:self-auto cursor-pointer"
        >
          <span>View All Classifications</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {DISCIPLINES_DATA.map((discipline) => {
          const Icon = discipline.icon;
          return (
            <div
              key={discipline.id}
              onClick={() => handleSelect(discipline.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(discipline.id);
                }
              }}
              tabIndex={0}
              role="button"
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#DCE7F5] hover:border-[#2563EB] shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between focus-visible:ring-2 focus-visible:ring-[#2563EB] focus:outline-none"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] border border-[#DCE7F5] flex items-center justify-center text-[#2563EB]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-medium bg-[#F5F9FF] text-slate-600 border border-[#DCE7F5]">
                    {discipline.classification}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-[#0B1F3A] transition-colors leading-snug">
                  {discipline.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {discipline.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-400">
                  {discipline.volumes}
                </span>
                <span className="text-[#2563EB] font-semibold flex items-center space-x-1">
                  <span>Explore Stack</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
