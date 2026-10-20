import React, { useState } from 'react';
import { useNotification } from '../hooks/useNotification';
import {
  History, Trash2, CheckCircle2, AlertTriangle,
  XCircle, Info, Filter, Search, Download
} from 'lucide-react';

export default function AuditLogPage() {
  const { auditLogs, clearAuditLogs, showNotification } = useNotification();
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (log.title || '').toLowerCase().includes(q);
      const msgMatch = (log.message || '').toLowerCase().includes(q);
      return titleMatch || msgMatch;
    }
    return true;
  });

  const handleClear = () => {
    if (window.confirm('Bersihkan seluruh riwayat audit log aktivitas?')) {
      clearAuditLogs();
      showNotification({
        type: 'info',
        title: 'Audit Log Dikosongkan',
        message: 'Seluruh riwayat aktivitas lokal telah dibersihkan.'
      });
    }
  };

  const handleExportJSON = () => {
    if (auditLogs.length === 0) {
      showNotification({
        type: 'warning',
        title: 'Ekspor Kosong',
        message: 'Tidak ada log aktivitas untuk diekspor.'
      });
      return;
    }
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-800 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Audit Trail & Riwayat Aktivitas Sistem
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekam jejak setiap aksi autentikasi, verifikasi berkas, dan penilaian oleh pengguna.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportJSON}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor JSON</span>
          </button>

          {auditLogs.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari aktivitas, judul, keterangan log..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
          <span className="text-slate-400 flex items-center gap-1 pr-1 shrink-0 text-xs font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'all', label: 'Semua' },
            { id: 'success', label: 'Berhasil' },
            { id: 'warning', label: 'Peringatan' },
            { id: 'error', label: 'Gagal / Error' },
            { id: 'info', label: 'Informasi' }
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setFilterType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors shrink-0 ${
                filterType === type.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Tidak ada riwayat aktivitas</p>
            <p className="text-xs text-slate-400 mt-1">
              Setiap aktivitas masuk, verifikasi, atau perubahan penilaian akan terekam di sini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const Icon =
                log.type === 'success'
                  ? CheckCircle2
                  : log.type === 'warning'
                  ? AlertTriangle
                  : log.type === 'error'
                  ? XCircle
                  : Info;

              const badgeColor =
                log.type === 'success'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : log.type === 'warning'
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : log.type === 'error'
                  ? 'text-rose-700 bg-rose-50 border-rose-200'
                  : 'text-cyan-700 bg-cyan-50 border-cyan-200';

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 flex items-start gap-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <div
                    className={`p-2 rounded-xl border shrink-0 mt-0.5 ${badgeColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {log.title}
                      </h4>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono text-slate-400">
                          {log.time}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {log.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
