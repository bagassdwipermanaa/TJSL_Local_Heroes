import React from 'react';
import { User, Users, MapPin, Calendar, Award, Globe, ArrowRight, Building, FileSpreadsheet } from 'lucide-react';
import { SDGS_OPTIONS, PILAR_OPTIONS } from '../utils/constants';

export default function IdentitasPage({ assessment, onChangeIdent, onNext }) {
  const ident = assessment?.ident || {};

  const handleChange = (field, value) => {
    onChangeIdent(field, value);
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-700 mb-1">
          <User className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Tahap 1</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Identitas Peserta dan Program
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Lengkapi data administratif pegawai pengusul dan rincian inisiatif program TJSL yang diajukan.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section: Data Pegawai / Penggerak */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Building className="w-4 h-4 text-slate-400" />
            Data Pegawai / Tim Penggerak
          </h3>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
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
          </div>
        </div>

        {/* Section: Data Program Inisiatif */}
        <div className="pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-slate-400" />
            Rincian Program & Inisiatif
          </h3>

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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
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
          <span className="text-xs text-slate-400">Pastikan data nama & program terisi dengan benar</span>
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
