import React from 'react';
import { CheckCircle2, Clock, Send, Save, AlertCircle, FileCheck2, User, BookOpen, MessageSquare, ShieldAlert } from 'lucide-react';

const SECTIONS_NAV = [
  { id: 'pengusul', number: 1, label: 'Data Pengusul', icon: User },
  { id: 'program', number: 2, label: 'Profil Program', icon: BookOpen },
  { id: 'uraian', number: 3, label: 'Uraian Kegiatan', icon: MessageSquare },
  { id: 'dokumen', number: 4, label: 'Dokumen Pendukung', icon: FileCheck2 },
  { id: 'pernyataan', number: 5, label: 'Pernyataan Integritas', icon: ShieldAlert }
];

export default function RegistrationProgressBar({
  completeness,
  status,
  updatedAt,
  submittedAt,
  isSaving,
  onSaveDraft,
  onSubmit,
  onScrollToSection
}) {
  const { sections, isReady, months, completedCount, totalCount } = completeness;
  const percent = Math.round((completedCount / totalCount) * 100);

  const formatDateTime = (iso) => {
    if (!iso) return '–';
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-cyan-800">
            Kelengkapan Pendaftaran
          </span>
          <span className="font-bold text-slate-900">{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              percent === 100 ? 'bg-emerald-600' : 'bg-cyan-700'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Navigation list */}
      <nav className="space-y-1.5 mb-5" aria-label="Daftar Bagian Formulir">
        {SECTIONS_NAV.map((sec) => {
          const isDone = sections[sec.id];
          const Icon = sec.icon;

          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => onScrollToSection(sec.id)}
              className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : sec.number}
                </span>
                <span className={`text-xs font-medium truncate ${isDone ? 'text-slate-900 font-semibold' : 'text-slate-600'}`}>
                  {sec.label}
                </span>
              </div>
              <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0 ml-1" />
            </button>
          );
        })}
      </nav>

      {/* Status Box */}
      <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 mb-5 text-xs text-slate-600 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Status Form:</span>
          {status === 'terkirim' ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Terkirim
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[11px]">
              <Clock className="w-3 h-3 text-amber-600" />
              {updatedAt ? 'Draf Tersimpan' : 'Belum Disimpan'}
            </span>
          )}
        </div>
        {submittedAt && (
          <p className="text-[11px] text-slate-500 pt-0.5">
            Dikirim: {formatDateTime(submittedAt)}
          </p>
        )}
        {updatedAt && (
          <p className="text-[11px] text-slate-400">
            Pembaruan: {formatDateTime(updatedAt)}
          </p>
        )}
      </div>

      {/* Validation alert if 6 months criteria failed */}
      {months != null && months < 6 && (
        <div className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-snug">
            Kegiatan baru berjalan <strong>{Math.max(months, 0)} bulan</strong>. Sesuai pedoman, kegiatan wajib minimal 6 bulan.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSaving}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-all active:scale-98 ${
            isReady
              ? 'bg-cyan-700 hover:bg-cyan-800'
              : 'bg-slate-700 hover:bg-slate-800 opacity-90'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{status === 'terkirim' ? 'Kirim Ulang Perubahan' : 'Kirim Pendaftaran'}</span>
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSaving}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <Save className="w-3.5 h-3.5 text-slate-500" />
          <span>{isSaving ? 'Menyimpan...' : 'Simpan Draf (Lokal & Cloud)'}</span>
        </button>
      </div>
    </aside>
  );
}
