import React from 'react';
import { Printer, Download, History, Award, FileText, LogIn, LogOut, UserPlus, LayoutDashboard } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { exportAssessmentsToCSV } from '../../services/assessmentService';

export default function Navbar({
  onOpenAuditLog,
  auditLogCount,
  appMode = 'penilaian',
  onSelectAppMode
}) {
  const { showNotification } = useNotification();
  const { user, isAuthenticated, logout } = useAuth();

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

  const handleLogout = async () => {
    await logout();
    showNotification({
      type: 'info',
      title: 'Berhasil Keluar',
      message: 'Sesi akun Anda telah diakhiri dengan aman.'
    });
    if (onSelectAppMode) {
      onSelectAppMode('pendaftaran');
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-4">
          {/* Brand Logo & Mode Switcher */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0">
            <div
              className="flex items-center shrink-0 cursor-pointer"
              onClick={() => {
                if (!onSelectAppMode) return;
                if (user?.role === 'admin') onSelectAppMode('dashboard');
                else if (user?.role === 'penilai') onSelectAppMode('penilaian');
                else onSelectAppMode('pendaftaran');
              }}
            >
              <img
                src="/logos/PLNES_logo.webp"
                alt="PLN Electricity Services"
                className="h-6 sm:h-8 md:h-10 w-auto object-contain shrink-0"
              />
              <h1 className="sr-only">Penilaian TJSL Local Heroes PLN ES</h1>
            </div>

            {/* Role-Based Mode Switcher / Title */}
            {onSelectAppMode && (
              user?.role === 'admin' ? (
                // Admin: Dedicated Dashboard Pusat Kendali
                <button
                  type="button"
                  onClick={() => onSelectAppMode('dashboard')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
                    appMode === 'dashboard'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="hidden sm:inline">Dashboard Administrator</span>
                  <span className="sm:hidden text-[11px]">Dashboard</span>
                </button>
              ) : user?.role === 'penilai' ? (
                // Penilai: Only Lembar Penilaian Juri
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-900 text-xs font-bold shrink-0">
                  <Award className="w-3.5 h-3.5 text-cyan-800 shrink-0" />
                  <span className="hidden sm:inline">Lembar Penilaian Juri</span>
                  <span className="sm:hidden text-[11px]">Penilaian</span>
                </div>
              ) : (
                // Pendaftar / Guest: Only Pendaftaran Peserta
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100/80 text-slate-900 text-xs font-bold shrink-0">
                  <FileText className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                  <span className="hidden sm:inline">Pendaftaran Peserta</span>
                  <span className="sm:hidden text-[11px]">Pendaftaran</span>
                </div>
              )
            )}
          </div>

          {/* Action Buttons & Auth Panel */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Export & Print hanya untuk Penilai & Admin */}
            {(user?.role === 'admin' || user?.role === 'penilai') && (
              <>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  title="Ekspor CSV Rekapitulasi"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="hidden md:inline">Ekspor CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  title="Cetak Form Penilaian Juri"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="hidden md:inline">Cetak Form</span>
                </button>
              </>
            )}

            {/* Audit Log (Hanya Admin) */}
            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={onOpenAuditLog}
                className="relative inline-flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                title="Buka Audit Log (Admin)"
              >
                <History className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="hidden lg:inline">Audit Log</span>
                {auditLogCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-slate-800 rounded-full">
                    {auditLogCount > 99 ? '99+' : auditLogCount}
                  </span>
                )}
              </button>
            )}

            {/* User Authentication Profile / Actions */}
            <div className="h-5 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    user.role === 'admin'
                      ? 'bg-amber-600 text-white'
                      : user.role === 'penilai'
                      ? 'bg-slate-800 text-white'
                      : 'bg-cyan-800 text-white'
                  }`}>
                    {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left leading-none">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">{user.nama}</span>
                    <span className="text-[10px] font-medium text-slate-500 capitalize">
                      {user.role === 'admin' ? 'Admin' : user.role === 'penilai' ? 'Penilai' : 'Pendaftar'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 p-2 sm:px-2.5 sm:py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelectAppMode && onSelectAppMode('login')}
                  className={`inline-flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    appMode === 'login'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Masuk ke Akun"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Masuk</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectAppMode && onSelectAppMode('register')}
                  className={`inline-flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold rounded-lg transition-colors ${
                    appMode === 'register'
                      ? 'bg-cyan-800 text-white'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                  title="Daftar Akun Baru"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Daftar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

