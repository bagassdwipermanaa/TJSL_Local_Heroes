import React from 'react';
import { Printer, Download, History, Plus } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { exportAssessmentsToCSV } from '../../services/assessmentService';

export default function Navbar({ onNewAssessment, onOpenAuditLog, auditLogCount }) {
  const { showNotification } = useNotification();

  const handleExportCSV = () => {
    const csvData = exportAssessmentsToCSV();
    if (!csvData) {
      showNotification({
        type: 'warning',
        title: 'Ekspor Gagal',
        message: 'Belum ada data penilaian tersimpan untuk diekspor.'
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
      title: 'Ekspor Rekap Berhasil',
      message: 'File CSV rekapitulasi penilaian berhasil diunduh.'
    });
  };

  const handlePrint = () => {
    showNotification({
      type: 'info',
      title: 'Menyiapkan Dokumen Cetak',
      message: 'Membuka dialog pencetakan lembar evaluasi juri.'
    });
    window.print();
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center min-w-0">
            <img
              src="/logos/PLNES_logo.webp"
              alt="PLN Electricity Services"
              className="h-8 sm:h-10 w-auto object-contain shrink-0"
            />
            <h1 className="sr-only">Penilaian TJSL Local Heroes PLN ES</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onNewAssessment}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-700 text-white hover:bg-cyan-800 transition-colors shadow-xs active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Peserta Baru</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              title="Ekspor CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Ekspor CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
              title="Cetak Form Penilaian"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Cetak Form</span>
            </button>

            <button
              type="button"
              onClick={onOpenAuditLog}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title="Buka Audit Log"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden lg:inline">Audit Log</span>
              {auditLogCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-slate-800 rounded-full">
                  {auditLogCount > 99 ? '99+' : auditLogCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
