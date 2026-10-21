import React, { useState } from 'react';
import { FileCheck2, Upload, Trash2, ExternalLink, Paperclip, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { REGISTRATION_DOCS } from '../../constants/registrationConstants';
import { uploadFileToServer, deleteFileFromServer } from '../../services/uploadService';
import { useNotification } from '../../hooks/useNotification';
import { API_BASE_URL } from '../../config';

export default function SectionDokumen({ files = {}, onAddFile, onRemoveFile }) {
  const { showNotification } = useNotification();
  const [uploadingKey, setUploadingKey] = useState(null);

  const getFullFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleFileUpload = async (docKey, e) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setUploadingKey(docKey);
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const uploadedData = await uploadFileToServer(file);
        onAddFile(docKey, uploadedData);
        showNotification({
          type: 'success',
          title: 'Berkas Terunggah',
          message: `Berkas "${file.name}" berhasil diunggah.`
        });
      }
    } catch (err) {
      showNotification({
        type: 'error',
        title: 'Unggah Gagal',
        message: err.message || 'Terjadi kesalahan saat mengunggah berkas.'
      });
    } finally {
      setUploadingKey(null);
      e.target.value = '';
    }
  };

  const handleFileDelete = async (docKey, fileItem, index) => {
    if (window.confirm(`Hapus berkas "${fileItem.originalName || fileItem.filename}"?`)) {
      if (fileItem.filename) {
        await deleteFileFromServer(fileItem.filename);
      }
      onRemoveFile(docKey, index);
      showNotification({
        type: 'warning',
        title: 'Berkas Dihapus',
        message: `Berkas "${fileItem.originalName || fileItem.filename}" telah dihapus.`
      });
    }
  };

  return (
    <section id="sec-dokumen" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-800 mb-1">
          <FileCheck2 className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Bagian 4</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Dokumen Pendukung & Bukti Sahih
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Unggah berkas bukti resmi (PDF, foto JPG/PNG, atau video MP4 maks. 20 MB per berkas).
        </p>
      </div>

      <div className="divide-y divide-slate-100 space-y-6">
        {REGISTRATION_DOCS.map((doc, idx) => {
          const docFiles = files[doc.key] || [];
          const hasEvidence = docFiles.length > 0;
          const isUploading = uploadingKey === doc.key;

          return (
            <div key={doc.key} className={idx === 0 ? '' : 'pt-6'}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {doc.label}
                      {doc.required && <span className="text-rose-500 ml-1">*</span>}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 pl-7 leading-relaxed">
                    {doc.hint}
                  </p>
                </div>

                <div className="pl-7 md:pl-0 shrink-0">
                  {hasEvidence ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Bukti Terlampir
                    </span>
                  ) : doc.required ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Wajib Diunggah
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                      Opsional
                    </span>
                  )}
                </div>
              </div>

              {/* Upload & Link Controls */}
              <div className="pl-0 md:pl-7 space-y-3">
                {/* Upload Button */}
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs transition-all active:scale-98 ${
                      isUploading ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-700" />
                        <span>Mengunggah berkas...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Unggah Berkas (PDF / Foto / Video)</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.webm,.doc,.docx"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(doc.key, e)}
                      disabled={isUploading}
                    />
                  </label>

                  <span className="text-[11px] text-slate-400">
                    Maks. 20 MB via server upload
                  </span>
                </div>

                {/* Uploaded Files Chips */}
                {docFiles.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {docFiles.map((fileItem, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-cyan-200 bg-cyan-50/60 text-xs text-cyan-950"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                          <span className="font-semibold truncate max-w-xs sm:max-w-md" title={fileItem.originalName}>
                            {fileItem.originalName || fileItem.filename}
                          </span>
                          {fileItem.size && (
                            <span className="text-[10px] text-cyan-700 shrink-0 font-medium">
                              ({(fileItem.size / 1024 / 1024).toFixed(1)} MB)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={getFullFileUrl(fileItem.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-cyan-700 hover:text-cyan-900 rounded hover:bg-cyan-100 transition-colors"
                            title="Buka Berkas"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleFileDelete(doc.key, fileItem, fIdx)}
                            className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-100 transition-colors"
                            title="Hapus Berkas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}


              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
