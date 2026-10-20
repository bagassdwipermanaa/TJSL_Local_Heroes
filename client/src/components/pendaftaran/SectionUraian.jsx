import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function SectionUraian({ data, onChangeField }) {
  return (
    <section id="sec-uraian" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 lg:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <div className="flex items-center gap-2.5 text-cyan-800 mb-1">
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Bagian 3</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Uraian Kegiatan & Narasi Inisiatif
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Jawaban ini menjadi bahan utama penilaian juri. Tulis secara jelas, faktual, dan sertakan angka terukur bila ada.
        </p>
      </div>

      <div className="space-y-5">
        {/* Latar Belakang */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Latar Belakang dan Masalah yang Diatasi <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Jelaskan kondisi riil masyarakat sebelum kegiatan dimulai dan persoalan mendesak apa yang mendorong Anda bergerak.
          </p>
          <textarea
            rows={3}
            placeholder="Tuliskan latar belakang dan akar permasalahan yang dihadapi warga..."
            value={data.masalah || ''}
            onChange={(e) => onChangeField('masalah', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Bentuk Kegiatan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Bentuk Kegiatan yang Dilakukan <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Rangkaian aksi, metode, atau program kerja nyata yang diimplementasikan secara berkala di lapangan.
          </p>
          <textarea
            rows={3}
            placeholder="Contoh: Pelatihan budidaya, pendirian bank sampah, pengajaran rutin mingguan, dsb..."
            value={data.kegiatan || ''}
            onChange={(e) => onChangeField('kegiatan', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Peran Langsung */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Peran Anda Secara Langsung <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Misalnya penggagas, penggerak, instruktur, atau pelaksana; seberapa banyak waktu dan energi pribadi yang Anda curahkan.
          </p>
          <textarea
            rows={3}
            placeholder="Jelaskan peran aktif Anda di lapangan, bukan hanya donatur finansial..."
            value={data.peran || ''}
            onChange={(e) => onChangeField('peran', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Dampak & Manfaat */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Dampak dan Manfaat Nyata bagi Masyarakat <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Perubahan yang terukur: peningkatan pendapatan warga, perbaikan lingkungan, akses pendidikan, kesehatan, dsb.
          </p>
          <textarea
            rows={3}
            placeholder="Sertakan angka / estimasi dampak nyata (misal: 40 KK meningkat penghasilannya, 2 ton sampah terolah/bulan)..."
            value={data.dampak || ''}
            onChange={(e) => onChangeField('dampak', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Keberlanjutan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Keberlanjutan dan Rencana Pengembangan ke Depan <span className="text-rose-500">*</span>
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Bagaimana kegiatan tetap mandiri dan terus berjalan jangka panjang tanpa ketergantungan konstan.
          </p>
          <textarea
            rows={3}
            placeholder="Rencana perluasan program, regenerasi kader penggerak, kemandirian dana..."
            value={data.keberlanjutan || ''}
            onChange={(e) => onChangeField('keberlanjutan', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Inovasi / Keunikan (Opsional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Inovasi atau Keunikan Pendekatan (Opsional)
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Aspek pembeda atau metode kreatif yang membuat inisiatif ini efektif menyelesaikan masalah.
          </p>
          <textarea
            rows={2}
            placeholder="Teknologi terapan, metode pelibatan warga yang khas, pemanfaatan limbah lokal..."
            value={data.inovasi || ''}
            onChange={(e) => onChangeField('inovasi', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all leading-relaxed"
          />
        </div>

        {/* Mitra & Pihak Terlibat (Opsional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Mitra dan Pihak yang Terlibat (Opsional)
          </label>
          <p className="text-[11px] text-slate-400 mb-2">
            Kolaborasi dengan pemerintah desa, sekolah, UMKM, LSM, puskesmas, komunitas relawan lain, dsb.
          </p>
          <textarea
            rows={2}
            placeholder="Daftar mitra kerja sama pendukung..."
            value={data.mitra || ''}
            onChange={(e) => onChangeField('mitra', e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 focus:bg-white transition-all leading-relaxed"
          />
        </div>
      </div>
    </section>
  );
}
