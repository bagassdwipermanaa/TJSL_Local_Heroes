import React from 'react';
import { BookOpen, MapPin, Calendar, Clock, Users, Globe, Layers, AlertCircle } from 'lucide-react';
import { REGISTRATION_SDGS, REGISTRATION_PILAR, FREKUENSI_OPTIONS } from '../../constants/registrationConstants';
import { calculateMonthsSince } from '../../services/registrationService';

export default function SectionProgram({ data, sdgs, onChangeField, onToggleSdg }) {
  const months = calculateMonthsSince(data.mulai);
  const isTooShort = months != null && months < 6;

  return (
    <section id="sec-program" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-800 mb-1">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Bagian 2</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Profil Program & Inisiatif Sosial
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gambaran umum kegiatan sosial kemasyarakatan yang didaftarkan beserta lokasi dan penerima manfaat.
        </p>
      </div>

      <div className="space-y-5">
        {/* Nama Program */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nama Program / Kegiatan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Pemberdayaan Petani Kopi Berkelanjutan Berbasis Biomassa Ramah Lingkungan"
            value={data.program || ''}
            onChange={(e) => onChangeField('program', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* Lokasi 4 grid */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Lokasi Pelaksanaan Kegiatan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Desa / Kelurahan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Desa Karangrejo"
                value={data.desa || ''}
                onChange={(e) => onChangeField('desa', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Kecamatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Kec. Loano"
                value={data.kecamatan || ''}
                onChange={(e) => onChangeField('kecamatan', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Kabupaten / Kota <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Kab. Purworejo"
                value={data.kabkota || ''}
                onChange={(e) => onChangeField('kabkota', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Provinsi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Jawa Tengah"
                value={data.provinsi || ''}
                onChange={(e) => onChangeField('provinsi', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Mulai kegiatan & frekuensi & pilar & penerima */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mulai Kegiatan (Bulan & Tahun) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="month"
                value={data.mulai || ''}
                onChange={(e) => onChangeField('mulai', e.target.value)}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  isTooShort
                    ? 'border-rose-400 focus:ring-rose-200 focus:border-rose-500 bg-rose-50/30'
                    : 'border-slate-200 focus:ring-cyan-600/20 focus:border-cyan-600'
                }`}
              />
            </div>
            {isTooShort ? (
              <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Baru berjalan {Math.max(months, 0)} bulan. Wajib min. 6 bulan.
              </p>
            ) : months != null ? (
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                Sudah berjalan {months} bulan (Memenuhi syarat).
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">Minimal berjalan 6 bulan.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Frekuensi Kegiatan <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={data.frekuensi || 'Mingguan'}
                onChange={(e) => onChangeField('frekuensi', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              >
                {FREKUENSI_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilar TJSL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <select
                value={data.pilar || 'Sosial'}
                onChange={(e) => onChangeField('pilar', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              >
                {REGISTRATION_PILAR.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Penerima Manfaat (Orang / KK) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="number"
                min="1"
                placeholder="Contoh: 150"
                value={data.penerima || ''}
                onChange={(e) => onChangeField('penerima', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* SDGs Multi-selection Chips */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-800" />
              Tujuan Pembangunan Berkelanjutan (SDGs) yang Disasar <span className="text-rose-500">*</span>
            </label>
            <span className="text-[11px] text-slate-500">
              {(sdgs || []).length} dipilih (bisa pilih lebih dari satu)
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {REGISTRATION_SDGS.map((sdgName, idx) => {
              const num = idx + 1;
              const isSelected = (sdgs || []).includes(num);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onToggleSdg(num)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-cyan-700 text-white border-cyan-700 shadow-xs ring-2 ring-cyan-700/20'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-white text-cyan-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {num}
                  </span>
                  <span>{sdgName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
