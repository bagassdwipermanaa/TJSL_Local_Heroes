import React from 'react';
import { computeAssessment, formatScore } from '../../utils/scoring';
import { STAGES } from '../../utils/constants';

export default function PrintView({ assessment }) {
  if (!assessment) return null;

  const computed = computeAssessment(assessment);
  const ident = assessment.ident || {};
  const category = ident.kategori || 'Individu';

  return (
    <div className="hidden print:block p-8 bg-white text-black font-sans text-xs">
      {/* Official Letterhead */}
      <div className="border-b-2 border-black pb-4 mb-6 text-center">
        <h1 className="text-base font-bold uppercase tracking-wide">
          PT PLN ELECTRICITY SERVICES
        </h1>
        <h2 className="text-sm font-extrabold uppercase tracking-wider mt-0.5">
          PENILAIAN TJSL LOCAL HEROES PLN ES
        </h2>
        <p className="text-[11px] text-neutral-600 mt-1">
          Form penilaian juri PLN ES TJSL Local Heroes: cek persyaratan, beri skor, dan lihat peringkat peserta pegawai/TAD.
        </p>
      </div>

      {/* 1. Identitas Peserta & Inisiatif */}
      <div className="mb-6">
        <h3 className="font-bold uppercase tracking-wider text-xs border-b border-black pb-1 mb-2">
          I. Identitas Pengusul & Inisiatif Program
        </h3>
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className="w-40 py-1 font-semibold">Nama Pegawai / Inisiator</td>
              <td className="w-4 py-1">:</td>
              <td className="py-1 font-bold">{ident.nama || ident.komunitas || '–'}</td>
              <td className="w-32 py-1 font-semibold">Kategori</td>
              <td className="w-4 py-1">:</td>
              <td className="py-1">{category}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">NIP / Nomor TAD</td>
              <td className="py-1">:</td>
              <td className="py-1">{ident.nip || '–'}</td>
              <td className="py-1 font-semibold">Unit Kerja / Bidang</td>
              <td className="py-1">:</td>
              <td className="py-1">{ident.unit || '–'}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">Nama Program</td>
              <td className="py-1">:</td>
              <td className="py-1 font-semibold" colSpan={4}>{ident.program || '–'}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">Lokasi Kegiatan</td>
              <td className="py-1">:</td>
              <td className="py-1" colSpan={4}>{ident.lokasi || '–'}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">Pilar TJSL</td>
              <td className="py-1">:</td>
              <td className="py-1">{ident.pilar || '–'}</td>
              <td className="py-1 font-semibold">Penerima Manfaat</td>
              <td className="py-1">:</td>
              <td className="py-1">{ident.penerima ? `${ident.penerima} Jiwa/KK` : '–'}</td>
            </tr>
            <tr>
              <td className="py-1 font-semibold">Target SDGs</td>
              <td className="py-1">:</td>
              <td className="py-1" colSpan={4}>{ident.sdgs || '–'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Status Administrasi */}
      <div className="mb-6">
        <h3 className="font-bold uppercase tracking-wider text-xs border-b border-black pb-1 mb-2">
          II. Verifikasi Persyaratan Administratif
        </h3>
        <div className="flex items-center justify-between p-2 border border-black mb-2">
          <span className="font-semibold">Keputusan Verifikasi Administrasi:</span>
          <span className="font-bold text-sm">
            {computed.adminStatus === 'ok'
              ? 'LOLOS PERSYARATAN ADMINISTRATIF'
              : computed.adminStatus === 'fail'
              ? 'GUGUR (PERSYARATAN TIDAK LENGKAP)'
              : 'BELUM LENGKAP'}
          </span>
        </div>
        {assessment.catatanAdmin && (
          <p className="text-[11px] italic">
            Catatan Verifikator: {assessment.catatanAdmin}
          </p>
        )}
      </div>

      {/* 3. Penilaian Substansi */}
      <div className="mb-6">
        <h3 className="font-bold uppercase tracking-wider text-xs border-b border-black pb-1 mb-2">
          III. Rekapitulasi Penilaian Substansi & Nilai Tambah
        </h3>
        <table className="w-full border border-black text-center text-[11px]">
          <thead>
            <tr className="bg-neutral-100 border-b border-black">
              <th className="py-1.5 px-2 border-r border-black text-left">Tahapan Penilaian</th>
              <th className="py-1.5 px-2 border-r border-black w-24">Bobot</th>
              <th className="py-1.5 px-2 border-r border-black w-28">Skor Tahap (100)</th>
              <th className="py-1.5 px-2 w-32">Kontribusi Nilai</th>
            </tr>
          </thead>
          <tbody>
            {STAGES.map(({ key, label, weight }) => {
              const score = computed.stageScores[key];
              const contribution = score != null ? (score * weight) / 100 : null;
              return (
                <tr key={key} className="border-b border-black">
                  <td className="py-1.5 px-2 border-r border-black text-left">{label}</td>
                  <td className="py-1.5 px-2 border-r border-black">{weight}%</td>
                  <td className="py-1.5 px-2 border-r border-black font-semibold">
                    {formatScore(score)}
                  </td>
                  <td className="py-1.5 px-2 font-bold">{formatScore(contribution)}</td>
                </tr>
              );
            })}
            <tr className="border-b border-black bg-neutral-50">
              <td className="py-1.5 px-2 border-r border-black text-left font-semibold" colSpan={3}>
                Nilai Tambah (Bonus Poin Pengakuan/Dampak Khusus)
              </td>
              <td className="py-1.5 px-2 font-bold">+{computed.bonusTotal}</td>
            </tr>
            <tr className="bg-neutral-200 font-extrabold text-xs">
              <td className="py-2 px-2 border-r border-black text-left uppercase" colSpan={3}>
                Nilai Akhir Akumulasi Juri (Maks. 100)
              </td>
              <td className="py-2 px-2 text-sm">
                {computed.finalScore == null ? '–' : formatScore(computed.finalScore)}
              </td>
            </tr>
          </tbody>
        </table>
        <p className="mt-1 text-right font-bold text-[11px]">
          Predikat Kelayakan: {computed.predicate}
        </p>
      </div>

      {/* 4. Rekomendasi & Catatan Juri */}
      <div className="mb-8">
        <h3 className="font-bold uppercase tracking-wider text-xs border-b border-black pb-1 mb-2">
          IV. Catatan Kualitatif & Rekomendasi Putusan Juri
        </h3>
        <div className="space-y-2 text-[11px]">
          <div>
            <span className="font-bold">Kekuatan Program: </span>
            <span>{assessment.kekuatan || '–'}</span>
          </div>
          <div>
            <span className="font-bold">Hal yang Perlu Diperbaiki: </span>
            <span>{assessment.perbaikan || '–'}</span>
          </div>
          <div className="p-2 border border-black mt-2">
            <span className="font-bold">Rekomendasi Putusan Juri: </span>
            <span className="font-extrabold uppercase">
              {assessment.rekomendasi || 'Belum Diputuskan'}
            </span>
          </div>
        </div>
      </div>

      {/* Tanda Tangan Juri */}
      <div className="pt-4 flex justify-between items-start text-center">
        <div className="w-56">
          <p className="font-semibold text-[11px]">Mengetahui,</p>
          <p className="text-[10px] text-neutral-600">Ketua Panitia TJSL Local Heroes</p>
          <div className="h-16" />
          <p className="font-bold underline">( ............................................ )</p>
        </div>

        <div className="w-64">
          <p className="text-[11px]">
            {assessment.tanggal
              ? new Date(assessment.tanggal).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })
              : '........................., .................... 2026'}
          </p>
          <p className="font-bold text-[11px]">Dewan Juri Penilai</p>
          <p className="text-[10px] text-neutral-600">{assessment.unsur || 'Unsur Dewan Juri'}</p>
          <div className="h-16" />
          <p className="font-bold underline">
            ( {assessment.juri || '............................................'} )
          </p>
        </div>
      </div>
    </div>
  );
}
