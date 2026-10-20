import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User, Users, MapPin, Calendar, Award, Globe, ArrowRight,
  Building, FileSpreadsheet, CheckCircle2, Check, RefreshCw
} from 'lucide-react';
import { SDGS_OPTIONS, PILAR_OPTIONS } from '../utils/constants';
import { API_BASE_URL } from '../config';

export default function IdentitasPage({
  assessment,
  onChangeIdent,
  onNext,
  registrations: propRegistrations = [],
  onSelectRegistration
}) {
  const [internalRegs, setInternalRegs] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const ident = assessment?.ident || {};

  // Fallback fetch registrations if not passed via props
  useEffect(() => {
    if (propRegistrations && propRegistrations.length > 0) {
      setInternalRegs(propRegistrations);
      return;
    }

    let isMounted = true;
    async function loadRegistrations() {
      try {
        const res = await fetch(`${API_BASE_URL}/registrations`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data) {
            setInternalRegs(json.data);
          }
        }
      } catch (err) {
        console.warn('[IdentitasPage] Failed to fetch registrations:', err);
      }
    }

    loadRegistrations();
    return () => {
      isMounted = false;
    };
  }, [propRegistrations]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/registrations`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setInternalRegs(json.data);
        }
      }
    } catch (err) {
      console.warn('[IdentitasPage] Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const allRegistrations = propRegistrations.length > 0 ? propRegistrations : internalRegs;

  // Urutkan data pendaftaran: yang berstatus terkirim ditaruh di atas
  const sortedRegistrations = useMemo(() => {
    return [...allRegistrations].sort((a, b) => {
      if (a.status === 'terkirim' && b.status !== 'terkirim') return -1;
      if (a.status !== 'terkirim' && b.status === 'terkirim') return 1;
      return 0;
    });
  }, [allRegistrations]);

  // Cek apakah pendaftar ini cocok dengan data identitas form saat ini
  const matchedReg = useMemo(() => {
    if (!ident.nama && !assessment?.registrationId) return null;
    return allRegistrations.find(
      (r) =>
        (assessment?.registrationId && r.id === assessment.registrationId) ||
        (ident.nama && r.data?.nama && r.data.nama.toLowerCase().trim() === ident.nama.toLowerCase().trim())
    );
  }, [allRegistrations, assessment, ident.nama]);

  const handleSelectReg = (regId) => {
    if (!regId) {
      if (onSelectRegistration) onSelectRegistration(null);
      return;
    }
    const found = allRegistrations.find((r) => r.id === regId);
    if (found && onSelectRegistration) {
      onSelectRegistration(found);
    }
  };

  const handleChange = (field, value) => {
    onChangeIdent(field, value);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-800 mb-1">
          <User className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Tahap 1</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Identitas Peserta dan Program
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pilih peserta dari data pendaftaran resmi untuk menghubungkan berkas dan memulai penilaian evaluasi.
        </p>
      </div>

      {/* KARTU HUBUNGKAN DENGAN PENDAFTAR */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-cyan-950 text-white shadow-xs border border-cyan-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-800/80 flex items-center justify-center text-cyan-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Hubungkan Data Pendaftar</h3>
              <p className="text-xs text-cyan-200/80">Pilih nama peserta/program inisiatif yang akan dievaluasi oleh Dewan Juri</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-cyan-800/90 text-cyan-200 border border-cyan-700/80">
              {allRegistrations.length} Inisiatif Terdaftar
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-cyan-800/80 hover:bg-cyan-700 text-cyan-200 hover:text-white transition-colors"
              title="Segarkan daftar pendaftar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="relative">
          <select
            value={matchedReg?.id || assessment?.registrationId || ''}
            onChange={(e) => handleSelectReg(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-semibold border-0 focus:ring-2 focus:ring-cyan-300 shadow-xs cursor-pointer"
          >
            <option value="">-- Pilih Peserta Inisiatif dari Berkas Pendaftaran --</option>
            {sortedRegistrations.map((r) => {
              const d = r.data || {};
              const isSent = r.status === 'terkirim';
              return (
                <option key={r.id} value={r.id}>
                  {d.nama || '(Tanpa Nama)'} - {d.program || '(Program belum diisi)'} [{d.unit || 'Unit belum ditentukan'}] {isSent ? '• Terkirim' : '• Draf'}
                </option>
              );
            })}
          </select>
        </div>

        {matchedReg ? (
          <div className="mt-3 pt-3 border-t border-cyan-900 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-cyan-100">
                Terhubung: <strong className="text-white font-bold">{matchedReg.data?.nama}</strong> ({matchedReg.data?.unit || '-'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-cyan-200">
                Status Review: <strong className="text-white capitalize">{matchedReg.reviewStatus || 'Baru'}</strong>
              </span>
              <button
                type="button"
                onClick={() => handleSelectReg('')}
                className="text-[11px] underline text-cyan-300 hover:text-white transition-colors"
              >
                Ganti Peserta
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2.5 text-[11px] text-cyan-300/80">
            * Pilih salah satu peserta di atas agar seluruh profil, lokasi, dan dokumen otomatis terisi.
          </p>
        )}
      </div>

      <div className="space-y-6">
        {/* Section: Data Pegawai / Penggerak */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              Data Pegawai / Tim Penggerak
            </h3>
            {matchedReg && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                <Check className="w-3 h-3" /> Terisi Otomatis
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Pegawai / Inisiator Utama <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Ahmad Fauzi"
                value={ident.nama || ''}
                onChange={(e) => handleChange('nama', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                NIP Pegawai / Nomor TAD
              </label>
              <input
                type="text"
                placeholder="Contoh: 92140182ZY"
                value={ident.nip || ''}
                onChange={(e) => handleChange('nip', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Unit Kerja / Bidang
              </label>
              <input
                type="text"
                placeholder="Contoh: PLN ES Kantor Pusat - Divisi TJSL"
                value={ident.unit || ''}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kategori Kepesertaan
              </label>
              <input
                type="text"
                value={ident.kategori || 'Individu'}
                onChange={(e) => handleChange('kategori', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section: Data Program Inisiatif */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-slate-400" />
              Rincian Program & Inisiatif
            </h3>
            {matchedReg && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                <Check className="w-3 h-3" /> Terisi Otomatis
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Program TJSL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pemberdayaan Petani Kopi Berkelanjutan Berbasis Biomassa Ramah Lingkungan"
                value={ident.program || ''}
                onChange={(e) => handleChange('program', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Lokasi Kegiatan (Desa/Kelurahan, Kecamatan, Kab/Kota, Provinsi)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Contoh: Desa Karangrejo, Kec. Loano, Kab. Purworejo, Jawa Tengah"
                  value={ident.lokasi || ''}
                  onChange={(e) => handleChange('lokasi', e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mulai Kegiatan (Bulan & Tahun)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="month"
                    value={ident.mulai || ''}
                    onChange={(e) => handleChange('mulai', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jumlah Penerima Manfaat Langsung (Jiwa/KK)
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 120"
                    value={ident.penerima || ''}
                    onChange={(e) => handleChange('penerima', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilar Utama TJSL
                </label>
                <div className="relative">
                  <FileSpreadsheet className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={ident.pilar || 'Sosial'}
                    onChange={(e) => handleChange('pilar', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
                  >
                    {PILAR_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tujuan Pembangunan Berkelanjutan (SDGs)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={ident.sdgs || ''}
                    onChange={(e) => handleChange('sdgs', e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
                  >
                    <option value="">Pilih Tujuan SDGs</option>
                    {SDGS_OPTIONS.map((sdg) => (
                      <option key={sdg} value={sdg}>
                        {sdg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation bottom */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {matchedReg ? 'Data pendaftar tersambung. Anda dapat melanjutkan ke tahapan administrasi.' : 'Pastikan data nama & program terisi dengan benar'}
          </span>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <span>Lanjut ke Administrasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
