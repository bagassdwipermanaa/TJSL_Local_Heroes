import React from 'react';
import { MessageSquare, ArrowLeft, Save, CheckCircle2, User, Building, Calendar, ThumbsUp, AlertCircle } from 'lucide-react';
import { REKOMENDASI_OPTIONS, UNSUR_JURI_OPTIONS } from '../utils/constants';

export default function RekomendasiPage({ assessment, onChangeField, onSave, onPrev, onGoToRekap }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-700 mb-1">
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Tahap 4</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Rekomendasi dan Catatan Dewan Juri
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Ringkasan temuan kualitatif, kekuatan inisiatif, dan rekomendasi resmi untuk rapat pleno penentuan pemenang.
        </p>
      </div>

      <div className="space-y-6">
        {/* Catatan Kekuatan & Perbaikan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kekuatan Utama Program (Strengths)</span>
            </label>
            <textarea
              rows={4}
              placeholder="Jelaskan aspek paling menonjol dari program (misal: partisipasi warga tinggi, solusi inovatif, dampak ekonomi nyata)..."
              value={assessment?.kekuatan || ''}
              onChange={(e) => onChangeField('kekuatan', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Hal yang Perlu Ditingkatkan / Diperbaiki</span>
            </label>
            <textarea
              rows={4}
              placeholder="Catatan kelemahan atau potensi risiko (misal: dokumentasi keuangan belum rapi, mitigasi keberlanjutan belum matang)..."
              value={assessment?.perbaikan || ''}
              onChange={(e) => onChangeField('perbaikan', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Rekomendasi Putusan Juri */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            Rekomendasi Putusan Juri <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {REKOMENDASI_OPTIONS.map((opt) => {
              const isSelected = assessment?.rekomendasi === opt;
              let selectedStyle = 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
              if (isSelected) {
                if (opt === 'Diusulkan sebagai pemenang') {
                  selectedStyle = 'border-amber-500 bg-amber-50/80 text-amber-900 ring-2 ring-amber-500/30';
                } else if (opt === 'Lanjut ke tahap berikutnya') {
                  selectedStyle = 'border-emerald-600 bg-emerald-50/80 text-emerald-900 ring-2 ring-emerald-600/30';
                } else {
                  selectedStyle = 'border-rose-500 bg-rose-50/80 text-rose-900 ring-2 ring-rose-500/30';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChangeField('rekomendasi', opt)}
                  className={`p-3.5 rounded-xl border text-xs font-bold text-left transition-all ${selectedStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Data Juri & Tanggal */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Identitas Juri Penilai
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Nama Juri</span>
              </label>
              <input
                type="text"
                placeholder="Nama lengkap penilai"
                value={assessment?.juri || ''}
                onChange={(e) => onChangeField('juri', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Unsur Dewan Juri</span>
              </label>
              <select
                value={assessment?.unsur || ''}
                onChange={(e) => onChangeField('unsur', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              >
                <option value="">Pilih Unsur Juri</option>
                {UNSUR_JURI_OPTIONS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal Penilaian</span>
              </label>
              <input
                type="date"
                value={assessment?.tanggal || ''}
                onChange={(e) => onChangeField('tanggal', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Navigation bottom */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Penilaian</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onSave}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-cyan-700 text-white hover:bg-cyan-800 transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Penilaian</span>
            </button>

            <button
              type="button"
              onClick={onGoToRekap}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <span>Lihat Rekap Peringkat</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
