import React, { useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  Upload,
  Paperclip,
  ExternalLink,
  Trash2,
  Loader2
} from 'lucide-react';
import { ADMIN_CHECKLIST, TOTAL_ADMIN_ITEMS } from '../utils/constants';
import { getAdminStatus } from '../utils/scoring';
import { uploadFile, deleteUploadedFile } from '../services/uploadService';
import { useNotification } from '../hooks/useNotification';
import { API_BASE } from '../config';

export default function AdministrasiPage({
  assessment,
  onChangeAdminItem,
  onAttachAdminFile,
  onRemoveAdminFile,
  onChangeField,
  onNext,
  onPrev
}) {
  const { showNotification } = useNotification();
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const adminState = assessment?.admin || [];
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
    // Strip '/api' from API_BASE to get backend origin
    const origin = API_BASE.replace(/\/api\/?$/, '');
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleFileUpload = async (index, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const uploaded = await uploadFile(file);
      onAttachAdminFile(index, uploaded);
      // Automatically mark as "Ada" if file successfully attached
      onChangeAdminItem(index, true);

      showNotification({
        type: 'success',
        title: 'Berkas Bukti Terunggah',
        message: `Berkas "${file.name}" berhasil diunggah dan diverifikasi.`
      });
    } catch (err) {
      showNotification({
        type: 'error',
        title: 'Gagal Mengunggah Berkas',
        message: err.message || 'Terjadi kesalahan saat mengunggah berkas ke server.'
      });
    } finally {
      setUploadingIndex(null);
      event.target.value = '';
    }
  };

  const handleFileRemove = async (index, fileData) => {
    if (window.confirm(`Hapus berkas bukti "${fileData.originalName || fileData.filename}"?`)) {
      if (fileData.filename) {
        await deleteUploadedFile(fileData.filename);
      }
      onRemoveAdminFile(index);
      showNotification({
        type: 'warning',
        title: 'Berkas Bukti Dihapus',
        message: `Berkas "${fileData.originalName || fileData.filename}" telah dihapus.`
      });
    }
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {group.group}
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">
                {group.items.length} Butir
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {group.items.map((item) => {
                const currentIndex = globalIndex++;
                const currentValue = adminState[currentIndex];
                const attachedFile = adminFiles[currentIndex];
                const isUploading = uploadingIndex === currentIndex;

                return (
                  <div
                    key={item.id}
                    className="p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 pr-2">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Bukti Wajib: {item.evidence}</span>
                        </p>
                      </div>

                      {/* Action buttons: Ada / Tidak Ada */}
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 shrink-0 self-start sm:self-center">
                        <button
                          type="button"
                          onClick={() => onChangeAdminItem(currentIndex, true)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                            currentValue === true
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
                            currentValue === false
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <X className="w-3 h-3" />
                          <span>Tidak Ada</span>
                        </button>
                      </div>
                    </div>

                    {/* Upload / Attached File Row */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      {attachedFile ? (
                        <div className="flex items-center gap-2 bg-cyan-50/70 border border-cyan-200/80 rounded-lg px-2.5 py-1 text-xs text-cyan-900 max-w-full">
                          <Paperclip className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                          <a
                            href={getBackendUrl(attachedFile)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold truncate max-w-xs hover:underline hover:text-cyan-950 transition-colors"
                            title={`Buka / Unduh Berkas: ${attachedFile.originalName}`}
                          >
                            {attachedFile.originalName}
                          </a>
                          {attachedFile.size && (
                            <span className="text-[10px] text-cyan-600 shrink-0">
                              ({(attachedFile.size / 1024).toFixed(0)} KB)
                            </span>
                          )}
                          <a
                            href={getBackendUrl(attachedFile)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:text-cyan-700 text-cyan-600 transition-colors ml-1"
                            title="Buka / Unduh Berkas"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(currentIndex, attachedFile)}
                            className="p-1 text-rose-500 hover:text-rose-700 transition-colors"
                            title="Hapus Berkas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-2xs ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {isUploading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-700" />
                                <span>Mengunggah...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5 text-slate-500" />
                                <span>Unggah Berkas Bukti (PDF/Foto)</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
                              className="hidden"
                              onChange={(e) => handleFileUpload(currentIndex, e)}
                              disabled={isUploading}
                            />
                          </label>
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            Maks. 20 MB
                          </span>
                        </div>
                      )}
                    </div>
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
