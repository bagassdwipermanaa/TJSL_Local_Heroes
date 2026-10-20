import React from 'react';
import { UserCheck, ShieldCheck, Award, MessageSquare, Users, FileText } from 'lucide-react';

const STEPS = [
  { id: 'identitas', number: 1, label: 'Identitas', icon: UserCheck },
  { id: 'admin', number: 2, label: 'Administrasi', icon: ShieldCheck },
  { id: 'nilai', number: 3, label: 'Penilaian', icon: Award },
  { id: 'rekom', number: 4, label: 'Rekomendasi', icon: MessageSquare },
  { id: 'rekap', number: 5, label: 'Rekap Peserta', icon: Users }
];

export default function StepTabs({ activeStep, onSelectStep, savedCount = 0, onSwitchToPendaftaran }) {
  return (
    <nav className="border-b border-slate-200 bg-white no-print" aria-label="Tahapan Evaluasi Juri">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-2 sm:py-2.5 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectStep(step.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0 ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step.number}
                  </span>
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{step.label}</span>
                  {step.id === 'rekap' && savedCount > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-slate-800 text-cyan-300' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {savedCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {onSwitchToPendaftaran && (
            <button
              type="button"
              onClick={onSwitchToPendaftaran}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors whitespace-nowrap shrink-0 ml-2"
            >
              <FileText className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span className="hidden sm:inline">Kembali ke Dashboard Admin</span>
              <span className="sm:hidden">Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
