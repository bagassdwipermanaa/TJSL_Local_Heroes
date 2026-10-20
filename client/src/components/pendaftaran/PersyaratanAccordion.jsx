import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, UserCheck, CalendarCheck } from 'lucide-react';

export default function PersyaratanAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs mb-6 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-slate-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Persyaratan Kompetisi & Kriteria Keabsahan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kegiatan harus benar-benar sudah dijalankan dan diakui oleh masyarakat sekitar.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-800 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200 shrink-0">
          <span>{isOpen ? 'Tutup Rincian' : 'Baca Persyaratan'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Pengusul */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-2.5 text-cyan-800 font-bold text-xs uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>1. Kriteria Pengusul</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li>Pegawai atau Tenaga Alih Daya (TAD) aktif PLN Electricity Services.</li>
                <li>Mendaftar sebagai penggerak individu.</li>
                <li>Berperan langsung di lapangan sebagai penggagas, penggerak, atau pelaksana aktif (bukan hanya donatur).</li>
                <li>Mendapat surat rekomendasi / persetujuan dari atasan langsung atau pimpinan unit.</li>
              </ul>
            </div>

            {/* 2. Bukti Implementasi */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-2.5 text-cyan-800 font-bold text-xs uppercase tracking-wider">
                <CalendarCheck className="w-4 h-4" />
                <span>2. Bukti Implementasi</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li>Kegiatan sudah berjalan minimal 6 bulan secara berkesinambungan dan masih aktif.</li>
                <li>Memiliki catatan pelaksanaan (logbook, jadwal rutin, atau daftar kegiatan).</li>
                <li>Dokumentasi foto/video dengan keterangan waktu & lokasi dari beberapa periode berbeda.</li>
                <li>Lokasi dapat dikunjungi dan bersedia diverifikasi lapangan oleh tim juri.</li>
              </ul>
            </div>

            {/* 3. Kesesuaian Program */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2 mb-2.5 text-cyan-800 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>3. Kesesuaian & Integritas Program</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-4 list-disc">
                <li>Kegiatan murni sukarela, bukan tugas kedinasan atau proyek TJSL yang dibiayai penuh perusahaan.</li>
                <li>Bebas dari kepentingan politik praktis, SARA, dan kepentingan komersial pribadi.</li>
                <li>Pernyataan integritas dan kepatuhan wajib dicentang pada formulir. Ketidaksesuaian berakibat diskualifikasi.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
