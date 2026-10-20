import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Download,
  Trash2,
  FolderOpen,
  CheckCircle2,
  XCircle,
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { computeAssessment, formatScore } from '../utils/scoring';
import { exportAssessmentsToCSV } from '../services/assessmentService';
import { useNotification } from '../hooks/useNotification';

export default function RekapPage({ assessments, onOpenAssessment, onDeleteAssessment, _onNewAssessment }) {
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score-desc');

  // Compute assessments with scores
  const processedList = useMemo(() => {
    return assessments.map(item => ({
      data: item,
      computed: computeAssessment(item)
    }));
  }, [assessments]);

  // Filter & Sort
  const filteredList = useMemo(() => {
    return processedList.filter(({ data, computed }) => {
      // Search
      const name = (data.ident?.nama || data.ident?.komunitas || '').toLowerCase();
      const prog = (data.ident?.program || '').toLowerCase();
      const unit = (data.ident?.unit || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      if (q && !name.includes(q) && !prog.includes(q) && !unit.includes(q)) {
        return false;
      }

      // Admin Status
      if (adminFilter !== 'all' && computed.adminStatus !== adminFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score-desc') {
        return (b.computed.finalScore ?? -1) - (a.computed.finalScore ?? -1);
      }
      if (sortBy === 'score-asc') {
        return (a.computed.finalScore ?? 999) - (b.computed.finalScore ?? 999);
      }
      if (sortBy === 'name-asc') {
        const nameA = a.data.ident?.nama || a.data.ident?.komunitas || '';
        const nameB = b.data.ident?.nama || b.data.ident?.komunitas || '';
        return nameA.localeCompare(nameB);
      }
      return new Date(b.data.updatedAt || 0) - new Date(a.data.updatedAt || 0);
    });
  }, [processedList, searchQuery, adminFilter, sortBy]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = processedList.length;
    const passedAdmin = processedList.filter(p => p.computed.adminStatus === 'ok').length;
    const scoredList = processedList.filter(p => p.computed.finalScore != null);
    const avgScore = scoredList.length > 0
      ? scoredList.reduce((acc, p) => acc + p.computed.finalScore, 0) / scoredList.length
      : 0;
    const candidateWinners = processedList.filter(p => p.computed.finalScore >= 85).length;

    return { total, passedAdmin, avgScore, candidateWinners };
  }, [processedList]);

  const handleExportCSV = () => {
    const csvData = exportAssessmentsToCSV();
    if (!csvData) {
      showNotification({
        type: 'warning',
        title: 'Ekspor Gagal',
        message: 'Belum ada data untuk diekspor.'
      });
      return;
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap-tjsl-local-heroes-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification({
      type: 'success',
      title: 'Unduhan Dimulai',
      message: 'Rekap penilaian juri berhasil diekspor ke file CSV.'
    });
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-cyan-700 mb-1">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Tahap 5</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rekapitulasi dan Peringkat Peserta
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Klasemen peringkat peserta diurutkan berdasarkan akumulasi nilai akhir tertinggi.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Peserta Terdaftar
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
            {metrics.total}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">
            Lolos Administrasi
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-800 mt-1 block">
            {metrics.passedAdmin}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-cyan-100 bg-cyan-50/50">
          <span className="text-[11px] font-semibold text-cyan-700 uppercase tracking-wider block">
            Rata-rata Nilai
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-900 mt-1 block">
            {metrics.avgScore > 0 ? formatScore(metrics.avgScore) : '0'}
          </span>
        </div>

        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
            Kandidat Juara (≥ 85)
          </span>
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1 block">
            {metrics.candidateWinners}
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama peserta, program, atau unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-600 focus:border-cyan-600"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {/* Admin Filter */}
          <select
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-600"
          >
            <option value="all">Semua Status Adm</option>
            <option value="ok">Lolos Adm</option>
            <option value="fail">Gugur</option>
            <option value="wait">Belum Lengkap</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-cyan-600"
          >
            <option value="score-desc">Nilai Tertinggi</option>
            <option value="score-asc">Nilai Terendah</option>
            <option value="name-asc">Nama (A-Z)</option>
            <option value="date-desc">Terakhir Diubah</option>
          </select>
        </div>
      </div>

      {/* Table Leaderboard */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200">
          <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 sm:px-4 text-center w-12">#</th>
              <th className="py-3 px-3 sm:px-4">Peserta & Program (Yang Dinilai)</th>
              <th className="py-3 px-3 sm:px-4">Dewan Juri (Penilai)</th>
              <th className="py-3 px-3 sm:px-4">Kategori & Pilar</th>
              <th className="py-3 px-3 sm:px-4 text-center">Administrasi</th>
              <th className="py-3 px-3 sm:px-4 text-right">Nilai Akhir</th>
              <th className="py-3 px-3 sm:px-4">Predikat & Rekomendasi</th>
              <th className="py-3 px-3 sm:px-4 text-right w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-xs text-slate-600">Belum ada evaluasi nilai peserta tersimpan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Data peringkat akan tampil otomatis setelah dewan juri menyimpan hasil penilaian inisiatif peserta.
                  </p>
                </td>
              </tr>
            ) : (
              filteredList.map(({ data, computed }, index) => {
                const name = data.ident?.nama || data.ident?.komunitas || 'Tanpa Nama';
                const program = data.ident?.program || '–';
                const category = data.ident?.kategori || 'Individu';
                const pilar = data.ident?.pilar || '–';
                const juriName = data.juri || 'Belum Ditentukan';
                const juriEmail = data.juriEmail || '';

                return (
                  <tr key={data.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Rank */}
                    <td className="py-3 px-3 sm:px-4 text-center font-extrabold text-slate-700">
                      {index === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 inline-flex items-center justify-center text-xs shadow-xs">
                          1
                        </span>
                      ) : index === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 inline-flex items-center justify-center text-xs">
                          2
                        </span>
                      ) : index === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-900 inline-flex items-center justify-center text-xs">
                          3
                        </span>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </td>

                    {/* Participant Info (Yang Dinilai) */}
                    <td className="py-3 px-3 sm:px-4 max-w-xs">
                      <div className="font-bold text-slate-900 line-clamp-1">{name}</div>
                      <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{program}</div>
                      {data.ident?.unit && (
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          {data.ident.unit} {data.ident?.nip ? `• NIP: ${data.ident.nip}` : ''}
                        </span>
                      )}
                    </td>

                    {/* Judge Info (Penilai) */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-900 text-cyan-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {juriName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-xs font-bold text-slate-900">{juriName}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                            {juriEmail || (data.unsur ? `Unsur: ${data.unsur}` : 'Dewan Juri')}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category & Pilar */}
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {category}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-1">{pilar}</div>
                    </td>

                    {/* Admin Status */}
                    <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                      {computed.adminStatus === 'ok' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Lolos
                        </span>
                      ) : computed.adminStatus === 'fail' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          Gugur
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Belum Lengkap
                        </span>
                      )}
                    </td>

                    {/* Final Score */}
                    <td className="py-3 px-3 sm:px-4 text-right font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                      {computed.finalScore == null ? (
                        <span className="text-slate-400">–</span>
                      ) : (
                        <span
                          className={`text-sm ${
                            computed.finalScore >= 85
                              ? 'text-emerald-700 font-extrabold'
                              : computed.finalScore >= 70
                              ? 'text-cyan-800'
                              : 'text-slate-700'
                          }`}
                        >
                          {formatScore(computed.finalScore)}
                        </span>
                      )}
                    </td>

                    {/* Predicate & Rekomendasi */}
                    <td className="py-3 px-3 sm:px-4 max-w-xs">
                      <div className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {computed.predicate}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {data.rekomendasi || 'Belum ada rekomendasi'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenAssessment(data.id)}
                          className="p-1.5 text-cyan-700 hover:text-cyan-900 rounded-lg hover:bg-cyan-50 transition-colors"
                          title="Buka / Edit Penilaian"
                        >
                          <FolderOpen className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteAssessment(data.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus Data Peserta"
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
    </section>
  );
}
