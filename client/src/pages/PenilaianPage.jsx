import React, { useState } from 'react';
import { Award, AlertTriangle, ArrowRight, ArrowLeft, PlusCircle, CheckCircle2, MessageSquare } from 'lucide-react';
import { STAGES, CRITERIA, WEIGHTS, BONUS_ITEMS } from '../utils/constants';
import { getAdminStatus } from '../utils/scoring';

const SCORE_OPTIONS = [
  { value: 1, label: '1 - Sangat Kurang' },
  { value: 2, label: '2 - Kurang' },
  { value: 3, label: '3 - Cukup' },
  { value: 4, label: '4 - Baik' },
  { value: 5, label: '5 - Sangat Baik' }
];

export default function PenilaianPage({
  assessment,
  onChangeScore,
  onChangeCriterionNote,
  onToggleBonus,
  onNext,
  onPrev
}) {
  const [activeStageKey, setActiveStageKey] = useState('porto');
  const adminStatus = getAdminStatus(assessment?.admin);
  const category = assessment?.ident?.kategori || 'Individu';
  const weights = WEIGHTS[category] || WEIGHTS.default;

  const currentScores = assessment?.scores?.[activeStageKey] || Array(7).fill(null);
  const currentNotes = assessment?.notes?.[activeStageKey] || Array(7).fill('');
  const bonusArray = assessment?.bonus || Array(BONUS_ITEMS.length).fill(false);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-700 mb-1">
          <Award className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Tahap 3</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Penilaian Substansi Program
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Beri skor 1 sampai 5 untuk setiap kriteria evaluasi pada masing-masing tahapan penilaian juri.
        </p>
      </div>

      {/* Lock alert if admin failed */}
      {adminStatus === 'fail' && (
        <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs sm:text-sm font-bold">Perhatian: Peserta Gugur di Administrasi</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              Peserta ini tidak memenuhi persyaratan wajib administrasi. Nilai substansi yang diinput tidak akan dimasukkan ke perhitungan nilai akhir.
            </p>
          </div>
        </div>
      )}

      {/* Stage Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto">
        {STAGES.map((stg) => {
          const isActive = activeStageKey === stg.key;
          const stageScores = assessment?.scores?.[stg.key] || [];
          const filledCount = stageScores.filter((s) => s != null).length;
          const isComplete = filledCount === 7;

          return (
            <button
              key={stg.key}
              type="button"
              onClick={() => setActiveStageKey(stg.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-cyan-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{stg.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-cyan-800 text-cyan-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {stg.weight}%
              </span>
              {isComplete && (
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-200' : 'text-emerald-600'}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Criteria List for Selected Stage */}
      <div className="space-y-5">
        {CRITERIA.map((crit, idx) => {
          const weight = weights[idx] || 0;
          const score = currentScores[idx];
          const note = currentNotes[idx] || '';

          return (
            <div
              key={crit.id}
              className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {crit.title}
                    </h3>
                    <span className="text-xs font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/60 shrink-0">
                      Bobot: {weight}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 pl-7 leading-relaxed">
                    {crit.desc}
                  </p>
                </div>

                {/* Score Button Group (1 - 5) */}
                <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 shrink-0 self-start sm:self-center">
                  {[1, 2, 3, 4, 5].map((val) => {
                    const isSelected = score === val;
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => onChangeScore(activeStageKey, idx, val)}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs scale-102 ring-2 ring-slate-900/10'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                        }`}
                        title={SCORE_OPTIONS[val - 1]?.label}
                      >
                        {val}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note per criteria */}
              <div className="pl-0 sm:pl-7 pt-2">
                <div className="relative">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Catatan juri untuk kriteria ini (opsional)..."
                    value={note}
                    onChange={(e) => onChangeCriterionNote(activeStageKey, idx, e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bonus Points Section */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <PlusCircle className="w-4 h-4 text-cyan-700" />
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
            Nilai Tambah (Bonus Poin)
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">
            Maksimal +5 poin langsung ke nilai akhir
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {BONUS_ITEMS.map((b, bIdx) => {
            const isChecked = !!bonusArray[bIdx];
            return (
              <label
                key={b.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isChecked
                    ? 'border-cyan-600 bg-cyan-50/60 ring-1 ring-cyan-600/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggleBonus(bIdx)}
                  className="mt-0.5 w-4 h-4 rounded text-cyan-700 focus:ring-cyan-600 border-slate-300"
                />
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-slate-800 leading-snug block">
                    {b.title}
                  </span>
                </div>
                <span className="text-xs font-extrabold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-md shrink-0">
                  +{b.points} Poin
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Administrasi</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <span>Lanjut ke Rekomendasi Juri</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
