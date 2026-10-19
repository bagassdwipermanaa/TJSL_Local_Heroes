import React, { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { History, X, Trash2, CheckCircle2, AlertTriangle, XCircle, Info, Filter } from 'lucide-react';

export default function AuditLogDrawer({ isOpen, onClose }) {
  const { auditLogs, clearAuditLogs, showNotification } = useNotification();
  const [filterType, setFilterType] = useState('all');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  const handleClear = () => {
    if (window.confirm('Bersihkan seluruh riwayat audit log?')) {
      clearAuditLogs();
      showNotification({
        type: 'info',
        title: 'Audit Log Dikosongkan',
        message: 'Seluruh riwayat aktivitas lokal telah dibersihkan.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-100 text-cyan-800">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Audit Log Aktivitas</h3>
              <p className="text-xs text-slate-500">Rekam jejak setiap interaksi & perubahan</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Filter & Clear */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
            <span className="text-slate-400 flex items-center gap-1 pl-1 pr-1.5 shrink-0">
              <Filter className="w-3 h-3" />
            </span>
            {['all', 'success', 'warning', 'error', 'info'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors shrink-0 ${
                  filterType === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {auditLogs.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-rose-50 transition-colors shrink-0"
              title="Kosongkan log"
            >
              <Trash2 className="w-3 h-3" />
              <span>Hapus</span>
            </button>
          )}
        </div>

        {/* Log List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 px-4 text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-medium">Belum ada aktivitas tercatat</p>
              <p className="text-[11px] text-slate-400 mt-1">Setiap aksi pengguna akan otomatis tercatat di sini</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              let Icon = Info;
              let iconColor = 'text-sky-600 bg-sky-50';

              if (log.type === 'success') {
                Icon = CheckCircle2;
                iconColor = 'text-emerald-600 bg-emerald-50';
              } else if (log.type === 'warning') {
                Icon = AlertTriangle;
                iconColor = 'text-amber-600 bg-amber-50';
              } else if (log.type === 'error') {
                Icon = XCircle;
                iconColor = 'text-rose-600 bg-rose-50';
              }

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3"
                >
                  <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {log.title || log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {log.formattedTime}
                      </span>
                    </div>
                    {log.message && (
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
                        {log.message}
                      </p>
                    )}
                    <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                      {log.formattedDate}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
