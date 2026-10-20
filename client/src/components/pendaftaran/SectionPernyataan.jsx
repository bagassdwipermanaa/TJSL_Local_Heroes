import React from 'react';
import { ShieldAlert, CheckSquare } from 'lucide-react';
import { REGISTRATION_DECLARATIONS } from '../../constants/registrationConstants';

export default function SectionPernyataan({ decl = [], onToggleDecl, onCheckAll }) {
  const allChecked = decl.length === REGISTRATION_DECLARATIONS.length && decl.every(Boolean);

  return (
    <section id="sec-pernyataan" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-cyan-800 mb-1">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Bagian 5</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pernyataan Integritas & Keaslian Dokumen
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Centang seluruh butir pernyataan kepatuhan di bawah ini sebelum mengirim pendaftaran.
            </p>
          </div>

          <button
            type="button"
            onClick={onCheckAll}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
          >
            <CheckSquare className="w-3.5 h-3.5 text-cyan-700" />
            <span>{allChecked ? 'Batal Centang Semua' : 'Centang Semua'}</span>
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {REGISTRATION_DECLARATIONS.map((text, idx) => {
          const isChecked = !!decl[idx];

          return (
            <label
              key={idx}
              className={`flex items-start gap-3.5 py-4 cursor-pointer transition-colors ${
                isChecked ? 'bg-cyan-50/20' : 'hover:bg-slate-50/60'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onToggleDecl(idx)}
                className="mt-1 w-4 h-4 rounded text-cyan-700 focus:ring-cyan-600 border-slate-300 shrink-0"
              />
              <div className="flex-1 min-w-0 text-xs sm:text-sm leading-relaxed text-slate-800">
                <span className="font-semibold text-slate-900 mr-1.5">[{idx + 1}]</span>
                {text}
              </div>
            </label>
          );
        })}
      </div>
    </section>
  );
}
