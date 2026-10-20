import React, { useState, useMemo } from 'react';
import {
  Users, CheckCircle2, Clock, ShieldCheck, Search,
  ExternalLink, Trash2, Award, X, Paperclip, Eye
} from 'lucide-react';
import { REVIEW_STATUS_OPTIONS, REGISTRATION_SDGS } from '../../constants/registrationConstants';
import { useNotification } from '../../hooks/useNotification';
import { API_BASE_URL } from '../../config';

export default function PanitiaDashboard({
  registrations = [],
  onUpdateReview,
  onDeleteRegistration,
  onImportToJudgeScoring
}) {
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatuspeg, setFilterStatuspeg] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedRegistrant, setSelectedRegistrant] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('baru');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Stats
  const sentCount = registrations.filter((r) => r.status === 'terkirim').length;
  const pegawaiCount = registrations.filter((r) => (r.data?.statuspeg || 'Pegawai') === 'Pegawai').length;
  const tadCount = registrations.filter((r) => r.data?.statuspeg === 'TAD').length;

  // Filtered List
  const filteredList = useMemo(() => {
    return registrations.filter((r) => {
      const d = r.data || {};
      const q = searchQuery.toLowerCase().trim();

      if (filterStatuspeg && (d.statuspeg || 'Pegawai') !== filterStatuspeg) return false;
      if (filterStatus && (r.status || 'draft') !== filterStatus) return false;

      if (q) {
        const hay = [
          d.nama,
          d.program,
          d.unit,
          d.nip,
          d.komunitas,
          d.kabkota,
          d.provinsi
        ].filter(Boolean).join(' ').toLowerCase();

        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [registrations, searchQuery, filterStatuspeg, filterStatus]);

  const handleOpenDetail = (item) => {
    setSelectedRegistrant(item);
    setReviewStatus(item.reviewStatus || 'baru');
    setReviewNotes(item.reviewNotes || '');
  };

  const handleSaveReview = async () => {
    if (!selectedRegistrant) return;
    setIsSavingReview(true);
    try {
      await onUpdateReview(selectedRegistrant.id, reviewStatus, reviewNotes);
      setSelectedRegistrant((prev) => ({
        ...prev,
        reviewStatus,
        reviewNotes
      }));
      showNotification({
        type: 'success',
        title: 'Verifikasi Tersimpan',
        message: 'Status verifikasi dan catatan panitia berhasil diperbarui.'
      });
    } catch {
      showNotification({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan saat menyimpan catatan verifikasi.'
      });
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Hapus pendaftaran untuk "${name || 'peserta ini'}" secara permanen?`)) {
      onDeleteRegistration(id);
      if (selectedRegistrant?.id === id) {
        setSelectedRegistrant(null);
      }
      showNotification({
        type: 'warning',
        title: 'Pendaftaran Dihapus',
        message: `Data pendaftaran "${name}" telah dihapus.`
      });
    }
  };

  const getFullFileUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Pendaftar</span>
            <Users className="w-4 h-4 text-cyan-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{registrations.length}</p>
          <span className="text-[11px] text-slate-400">Seluruh berkas masuk</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Sudah Mengirim</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{sentCount}</p>
          <span className="text-[11px] text-slate-400">{registrations.length - sentCount} masih draf</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pegawai Organik</span>
            <ShieldCheck className="w-4 h-4 text-cyan-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pegawaiCount}</p>
          <span className="text-[11px] text-slate-400">Pengusul pegawai</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tenaga Alih Daya (TAD)</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{tadCount}</p>
          <span className="text-[11px] text-slate-400">Pengusul TAD</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nama, program, unit, kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filterStatuspeg}
              onChange={(e) => setFilterStatuspeg(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
            >
              <option value="">Semua Pegawai / TAD</option>
              <option value="Pegawai">Pegawai Organik</option>
              <option value="TAD">Tenaga Alih Daya (TAD)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
            >
              <option value="">Semua Status Kiriman</option>
              <option value="terkirim">Terkirim</option>
              <option value="draft">Draf</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Pengusul & Unit</th>
                <th className="py-3.5 px-4">Program & Lokasi</th>
                <th className="py-3.5 px-4">Status Kiriman</th>
                <th className="py-3.5 px-4">Verifikasi Panitia</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-xs">Belum ada pendaftaran yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const d = item.data || {};
                  const isSent = item.status === 'terkirim';
                  const revOpt = REVIEW_STATUS_OPTIONS.find((opt) => opt.key === (item.reviewStatus || 'baru')) || REVIEW_STATUS_OPTIONS[0];

                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                          {d.nama || 'Tanpa Nama'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {d.statuspeg || 'Pegawai'} · {d.unit || '–'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-900 truncate" title={d.program}>
                          {d.program || '–'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {d.kabkota ? `${d.kabkota}, ${d.provinsi || ''}` : '–'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <CheckCircle2 className="w-3 h-3 text-cyan-700" />
                            Terkirim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock className="w-3 h-3 text-slate-500" />
                            Draf
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${revOpt.bgClass}`}>
                          {revOpt.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '–'}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Lihat Rincian"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onImportToJudgeScoring(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-700 text-white hover:bg-cyan-800 transition-colors shadow-2xs"
                            title="Buka di Penilaian Juri"
                          >
                            <Award className="w-3 h-3" />
                            <span className="hidden sm:inline">Nilai di Juri</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, d.nama)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Hapus Pendaftaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-over / Modal */}
      {selectedRegistrant && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 block">
                  Rincian Berkas Pendaftaran
                </span>
                <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                  {selectedRegistrant.data?.nama || 'Tanpa Nama'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedRegistrant.data?.program || 'Program belum ditentukan'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onImportToJudgeScoring(selectedRegistrant)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-700 text-white hover:bg-cyan-800 transition-colors shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Nilai di Form Juri</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRegistrant(null)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Panitia Review Card */}
              <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-900 uppercase tracking-wider">
                    Verifikasi Administrasi Panitia
                  </span>
                  <span className="text-[11px] text-slate-500">Khusus Akun Panitia</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {REVIEW_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setReviewStatus(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        reviewStatus === opt.key
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  placeholder="Tuliskan catatan verifikasi panitia mengenai keabsahan dokumen / penerima manfaat..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600 transition-all"
                />

                <button
                  type="button"
                  onClick={handleSaveReview}
                  disabled={isSavingReview}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-700 text-white hover:bg-cyan-800 transition-colors shadow-2xs"
                >
                  {isSavingReview ? 'Menyimpan...' : 'Simpan Catatan Verifikasi'}
                </button>
              </div>

              {/* Data Pengusul */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  1. Data Pegawai / Pengusul
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">NIP / No TAD</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.nip || '–'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Status Pegawai</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.statuspeg || '–'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Jabatan</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.jabatan || '–'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Unit Kerja</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.unit || '–'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Email Kantor</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.email || '–'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Nomor HP / WA</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.hp || '–'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Atasan Langsung / Rekomendasi</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.atasan || '–'}</span>
                  </div>
                  {selectedRegistrant.data?.kategori === 'Komunitas' && (
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[10px] uppercase">Komunitas & Anggota</span>
                      <span className="font-semibold text-slate-800">
                        {selectedRegistrant.data?.komunitas || '–'} ({selectedRegistrant.data?.anggota || 0} anggota)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profil Program */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  2. Profil & Cakupan Program
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Lokasi Kegiatan</span>
                    <span className="font-semibold text-slate-800">
                      {[
                        selectedRegistrant.data?.desa,
                        selectedRegistrant.data?.kecamatan,
                        selectedRegistrant.data?.kabkota,
                        selectedRegistrant.data?.provinsi
                      ].filter(Boolean).join(', ') || '–'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Mulai Kegiatan</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.mulai || '–'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Frekuensi</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.frekuensi || '–'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Pilar TJSL</span>
                    <span className="font-semibold text-slate-800">{selectedRegistrant.data?.pilar || '–'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Penerima Manfaat</span>
                    <span className="font-semibold text-slate-800">
                      {selectedRegistrant.data?.penerima ? `${selectedRegistrant.data.penerima} Jiwa/KK` : '–'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase">Target SDGs</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(selectedRegistrant.sdgs || []).map((num) => (
                        <span key={num} className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                          {num}. {REGISTRATION_SDGS[num - 1] || 'SDG'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Uraian Kegiatan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  3. Narasi & Uraian Kegiatan
                </h4>
                <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Latar Belakang & Masalah:</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedRegistrant.data?.masalah || '–'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Bentuk Kegiatan:</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedRegistrant.data?.kegiatan || '–'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Peran Langsung Pengusul:</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedRegistrant.data?.peran || '–'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Dampak & Manfaat:</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedRegistrant.data?.dampak || '–'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Keberlanjutan:</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedRegistrant.data?.keberlanjutan || '–'}</p>
                  </div>
                </div>
              </div>

              {/* Dokumen Terunggah */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  4. Dokumen & Tautan Pendukung
                </h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(selectedRegistrant.files || {}).map(([key, fileArr]) => {
                    if (!Array.isArray(fileArr) || fileArr.length === 0) return null;
                    return (
                      <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 capitalize block mb-1.5">{key}:</span>
                        <div className="space-y-1">
                          {fileArr.map((f, i) => (
                            <a
                              key={i}
                              href={getFullFileUrl(f.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-cyan-700 hover:text-cyan-900 font-medium underline"
                            >
                              <Paperclip className="w-3.5 h-3.5" />
                              <span>{f.originalName || f.filename}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {Object.entries(selectedRegistrant.links || {}).map(([key, link]) => {
                    if (!link) return null;
                    return (
                      <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700 capitalize block mb-1">Tautan Cloud ({key}):</span>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-cyan-700 hover:text-cyan-900 font-medium underline break-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>{link}</span>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
