import React from 'react';
import { Save, RotateCcw, CheckCircle2, XCircle, Clock, Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { computeAssessment, formatScore } from '../../utils/scoring';
import { STAGES } from '../../utils/constants';

export default function ScoreSidebar({ assessment, onSave, onReset, onGoToStep }) {
  const computed = computeAssessment(assessment);

  const participantName = assessment?.ident?.nama || assessment?.ident?.komunitas || 'Peserta belum diisi';
  const programName = assessment?.ident?.program || 'Program belum ditentukan';
  const category = assessment?.ident?.kategori || 'Individu';

  let adminBadge = {
    text: 'Belum Lengkap',
    bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
    Icon: Clock
  };

  if (computed.adminStatus === 'ok') {
    adminBadge = {
      text: 'Lolos Administrasi',
      bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Icon: CheckCircle2
    };
  } else if (computed.adminStatus === 'fail') {
    adminBadge = {
      text: 'Gugur Persyaratan',
      bgClass: 'bg-rose-50 text-rose-700 border-rose-200',
      Icon: XCircle
    };
  }

  const AdminIcon = adminBadge.Icon;
  const progressPercent = Math.min(100, Math.max(0, computed.finalScore || 0));

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto scrollbar-thin no-print">
      {/* Header Info */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-cyan-700">Ringkasan Skor Juri</span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">{category}</span>
        </div>
        <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1" title={participantName}>
          {participantName}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1" title={programName}>
          {programName}
        </p>
      </div>

      {/* Admin Status Pill */}
      <div className="py-3 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Status Administrasi
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${adminBadge.bgClass}`}>
            <AdminIcon className="w-3 h-3" />
            {adminBadge.text}
          </span>
        </div>
      </div>

      {/* Big Final Score */}
      <div className="py-4 border-b border-slate-100 text-center">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            {computed.finalScore == null ? '–' : formatScore(computed.finalScore)}
          </span>
          <span className="text-sm font-semibold text-slate-400">/ 100</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              computed.adminStatus === 'fail'
                ? 'bg-rose-500'
                : computed.finalScore >= 85
                ? 'bg-emerald-500'
                : computed.finalScore >= 70
                ? 'bg-cyan-600'
                : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Predicate */}
        <div className="mt-2 text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{computed.predicate}</span>
        </div>
      </div>

      {/* Breakdown per Tahap */}
      <div className="py-3 border-b border-slate-100 space-y-2 text-xs">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
          Rincian Bobot Nilai
        </span>
        {STAGES.map(({ key, label, weight }) => {
          const score = computed.stageScores[key];
          return (
            <div key={key} className="flex items-center justify-between text-slate-600 py-0.5">
              <span className="truncate pr-2">
                {label} <span className="text-slate-400 font-normal">({weight}%)</span>
              </span>
              <span className="font-bold text-slate-900 tabular-nums">
                {score == null ? '–' : formatScore(score)}
              </span>
            </div>
          );
        })}
        <div className="flex items-center justify-between text-slate-600 pt-1 border-t border-dashed border-slate-200">
          <span className="text-cyan-800 font-semibold">Nilai Tambah (Bonus)</span>
          <span className="font-bold text-cyan-800 tabular-nums">+{computed.bonusTotal}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-2">
        <button
          type="button"
          onClick={onSave}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-700 text-white hover:bg-cyan-800 active:scale-98 transition-all shadow-xs"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Penilaian</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Kosongkan Form</span>
        </button>

        <button
          type="button"
          onClick={() => onGoToStep('rekap')}
          className="w-full inline-flex items-center justify-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 py-1.5 transition-colors"
        >
          <span>Lihat Rekap Peringkat</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
