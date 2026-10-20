import React, { useMemo } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Paperclip,
  ExternalLink,
  Shield
} from 'lucide-react';
import { ADMIN_CHECKLIST, TOTAL_ADMIN_ITEMS } from '../utils/constants';
import { getAdminStatus } from '../utils/scoring';
import { API_BASE } from '../config';

export default function AdministrasiPage({
  assessment,
  onChangeAdminItem,
  onChangeField,
  onNext,
  onPrev
}) {
  const adminState = useMemo(() => {
    const raw = [...(assessment?.admin || [])];
    while (raw.length < TOTAL_ADMIN_ITEMS) {
      raw.push(null);
    }
    // Auto-sync item 0 if employee status/NIP exists
    if (raw[0] == null && (assessment?.ident?.statuspeg || assessment?.ident?.nip)) {
      raw[0] = true;
    }
    // Auto-sync item 1 if rekomendasi letter or atasan exists
    if (raw[1] == null && (assessment?.adminFiles?.[1] || assessment?.regFiles?.rekomendasi?.length > 0 || assessment?.ident?.atasan)) {
      raw[1] = true;
    }
    // Auto-sync declaration items 2..6
    if (Array.isArray(assessment?.decl)) {
      assessment.decl.forEach((val, idx) => {
        if (idx < 5 && raw[2 + idx] == null) {
          raw[2 + idx] = Boolean(val);
        }
      });
    }
    return raw;
  }, [assessment]);

  const adminFiles = assessment?.adminFiles || {};
  const status = getAdminStatus(adminState);

  const completedCount = adminState.filter((val) => val != null).length;
  const passCount = adminState.filter((val) => val === true).length;
  const failCount = adminState.filter((val) => val === false).length;

  const getBackendUrl = (input) => {
    if (!input) return '#';
    const path = typeof input === 'string' ? input : (input.url || (input.filename ? `/uploads/${input.filename}` : ''));
    if (!path) return '#';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const origin = API_BASE.replace(/\/api\/?$/, '');
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  let globalIndex = 0;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-700 mb-1">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Tahap 2</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Checklist Persyaratan Administratif
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verifikasi keabsahan dokumen pengusul dan bukti implementasi. <strong>Satu butir &quot;Tidak Ada&quot; menggugurkan kepesertaan</strong>.
        </p>
      </div>

      {/* Progress & Verdict Banner */}
      <div className="mb-6">
        {status === 'ok' ? (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold">Lolos Administrasi</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Semua {TOTAL_ADMIN_ITEMS} butir persyaratan administratif lengkap dan terverifikasi. Peserta berhak lanjut ke penilaian substansi.
              </p>
            </div>
          </div>
        ) : status === 'fail' ? (
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold">Peserta Gugur</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Terdapat {failCount} butir persyaratan yang &quot;Tidak Ada&quot;. Sesuai pedoman juri, peserta tidak dapat dinilai pada tahap substansi.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs sm:text-sm font-medium">
                Pemeriksaan berjalan: <strong>{completedCount}</strong> dari {TOTAL_ADMIN_ITEMS} butir ({passCount} ada, {failCount} tidak ada)
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {Math.round((completedCount / TOTAL_ADMIN_ITEMS) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Checklist Groups */}
      <div className="space-y-6">
        {ADMIN_CHECKLIST.map((group) => (
          <div key={group.group} className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {group.group}
                </h3>
                {group.subtitle && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {group.subtitle}
                  </p>
                )}
              </div>
              <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                {group.items.length} Butir
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {group.items.map((item) => {
                const currentIndex = globalIndex++;
                const currentValue = adminState[currentIndex];
                const attachedFile = adminFiles[currentIndex];
                const isDeclaration = !!group.isDeclarationGroup;
                const declIdx = item.declIndex;
                const isAgreed = isDeclaration
                  ? (Array.isArray(assessment?.decl) ? assessment.decl[declIdx] === true : false)
                  : false;
                const isPass = currentValue === true || (currentValue == null && isDeclaration && isAgreed);
                const isFail = currentValue === false || (currentValue == null && isDeclaration && !isAgreed && assessment?.decl?.length);

                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 pr-2">
                        {isDeclaration ? (
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 text-white shadow-2xs ${
                                isAgreed ? 'bg-cyan-600' : 'bg-slate-300'
                              }`}
                              title={isAgreed ? 'Dicentang oleh pengusul' : 'Tidak dicentang'}
                            >
                              {isAgreed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                                <span className="font-bold text-cyan-800 mr-1.5">[{item.number || (declIdx + 1)}]</span>
                                {item.title}
                              </p>
                              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                {isAgreed ? (
                                  <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    Disetujui Pengusul pada Formulir Pendaftaran (Bagian 5)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    Belum dicentang oleh pengusul
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>Bukti Wajib: {item.evidence}</span>
                            </p>

                            {/* Tampilkan Sinkronisasi Status Kepegawaian jika item adm-1 (currentIndex === 0) */}
                            {currentIndex === 0 && (
                              <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs">
                                <span className="text-[10px] uppercase font-bold text-emerald-900 block mb-0.5">
                                  Sinkronisasi Form Pendaftaran (Bagian 1: Status Kepegawaian):
                                </span>
                                <div className="flex flex-wrap items-center gap-2 text-slate-800">
                                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                                    <Shield className="w-3 h-3 text-emerald-600" />
                                    {assessment?.ident?.statuspeg === 'TAD' || assessment?.ident?.kategori === 'TAD'
                                      ? 'TAD / Mitra Kerja'
                                      : 'Pegawai Organik'}
                                  </span>
                                  {assessment?.ident?.nip && (
                                    <span className="text-slate-600">
                                      • NIP/ID: <strong className="text-slate-900">{assessment.ident.nip}</strong>
                                    </span>
                                  )}
                                  {assessment?.ident?.unit && (
                                    <span className="text-slate-600 truncate max-w-xs">
                                      • Unit: {assessment.ident.unit}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Tampilkan Atasan Langsung dari Form Pendaftaran jika item adm-2 (Surat Rekomendasi) */}
                            {currentIndex === 1 && (assessment?.ident?.atasan || assessment?.regData?.atasan) && (
                              <div className="mt-2 p-2.5 rounded-lg bg-cyan-50/50 border border-cyan-100/80 text-xs">
                                <span className="text-[10px] uppercase font-bold text-cyan-900 block mb-0.5">
                                  Atasan Langsung Pengusul (Form Pendaftaran Bagian 1):
                                </span>
                                <span className="font-semibold text-slate-800">
                                  {assessment.ident.atasan || assessment.regData.atasan}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Action buttons: Ada / Tidak Ada */}
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 shrink-0 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => onChangeAdminItem(currentIndex, true)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            isPass
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Ada</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onChangeAdminItem(currentIndex, false)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            isFail
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <X className="w-3 h-3" />
                          <span>Tidak Ada</span>
                        </button>
                      </div>
                    </div>

                    {/* Baris Berkas Bukti Lampiran Pendaftar - Hanya untuk grup bukti dokumen */}
                    {!isDeclaration && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        {(() => {
                          const filesToShow = [];
                          if (currentIndex === 1) {
                            if (assessment?.regFiles?.rekomendasi?.[0]) {
                              filesToShow.push(assessment.regFiles.rekomendasi[0]);
                            } else if (attachedFile) {
                              filesToShow.push(attachedFile);
                            }
                          } else if (attachedFile) {
                            filesToShow.push(attachedFile);
                          }

                          if (filesToShow.length > 0) {
                            return (
                              <div className="flex flex-wrap items-center gap-2">
                                {filesToShow.map((f, fIdx) => (
                                  <div
                                    key={fIdx}
                                    className="flex items-center gap-2 bg-cyan-50/70 border border-cyan-200/80 rounded-lg px-2.5 py-1 text-xs text-cyan-900 max-w-full"
                                  >
                                    <Paperclip className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                                    <a
                                      href={getBackendUrl(f)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-semibold truncate max-w-xs hover:underline hover:text-cyan-950 transition-colors"
                                      title={`Buka / Unduh Berkas: ${f.originalName || f.filename}`}
                                    >
                                      {f.originalName || f.filename}
                                    </a>
                                    {f.size && (
                                      <span className="text-[10px] text-cyan-600 shrink-0">
                                        ({(f.size / 1024).toFixed(0)} KB)
                                      </span>
                                    )}
                                    <a
                                      href={getBackendUrl(f)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 font-bold text-cyan-700 hover:text-cyan-900 transition-colors ml-1"
                                      title="Buka / Unduh Berkas Lampiran Pendaftar"
                                    >
                                      <span>Buka Dokumen</span>
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          if (currentIndex === 0) {
                            return (
                              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                Terverifikasi otomatis dari Profil Pengusul (NIP/ID: {assessment?.ident?.nip || '-'}, Status: {assessment?.ident?.statuspeg || 'Pegawai Organik'})
                              </span>
                            );
                          }

                          return (
                            <span className="text-xs text-slate-400 italic flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-slate-300" />
                              Belum ada dokumen yang dilampirkan pendaftar
                            </span>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Catatan Verifikator */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Catatan Khusus Verifikator / Tim Administrasi
        </label>
        <textarea
          rows={3}
          placeholder="Tuliskan catatan kelengkapan berkas, nomor surat, atau klarifikasi dokumen jika diperlukan..."
          value={assessment?.catatanAdmin || ''}
          onChange={(e) => onChangeField('catatanAdmin', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
        />
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Identitas</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
        >
          <span>Lanjut ke Penilaian Substansi</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
