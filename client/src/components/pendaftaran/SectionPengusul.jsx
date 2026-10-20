import React from 'react';
import { User, Building, Mail, Phone, UserCheck, Shield } from 'lucide-react';

export default function SectionPengusul({ data, onChangeField }) {

  return (
    <section id="sec-pengusul" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-800 mb-1">
          <User className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Bagian 1</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Data Pengusul
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Identitas pegawai atau Tenaga Alih Daya (TAD) PLN Electricity Services yang menjadi penggerak utama kegiatan.
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Kepegawaian */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Status Kepegawaian <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            {['Pegawai', 'TAD'].map((st) => {
              const isSelected = (data.statuspeg || 'Pegawai') === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => onChangeField('statuspeg', st)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{st === 'Pegawai' ? 'Pegawai Organik' : 'TAD / Mitra Kerja'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Biodata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Lengkap Pengusul <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Ahmad Fauzi"
              value={data.nama || ''}
              onChange={(e) => onChangeField('nama', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              NIP / Nomor Induk TAD <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: 92140182ZY / TAD-88921"
              value={data.nip || ''}
              onChange={(e) => onChangeField('nip', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Jabatan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Officer TJSL & Komunikasi"
              value={data.jabatan || ''}
              onChange={(e) => onChangeField('jabatan', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Unit Kerja / Bidang <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Contoh: Kantor Pusat - Divisi TJSL"
                value={data.unit || ''}
                onChange={(e) => onChangeField('unit', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Kantor PLN ES <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                placeholder="nama.pegawai@plnes.co.id"
                value={data.email || ''}
                onChange={(e) => onChangeField('email', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nomor HP / WhatsApp Aktif <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                placeholder="0812-XXXX-XXXX"
                value={data.hp || ''}
                onChange={(e) => onChangeField('hp', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Atasan Langsung / Pimpinan Unit <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <UserCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Contoh: Ir. Budi Santoso, M.M. (Manager TJSL & CSR)"
                value={data.atasan || ''}
                onChange={(e) => onChangeField('atasan', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Atasan ini yang akan menandatangani surat rekomendasi dukungan kegiatan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
