import React from 'react';
import { useNotification } from '../../hooks/useNotification';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed z-50 flex flex-col gap-2.5 pointer-events-none transition-all duration-300
        bottom-4 left-1/2 -translate-x-1/2 w-[92vw] max-w-sm
        sm:bottom-6 sm:right-6 sm:left-auto sm:translate-x-0 sm:w-96"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {notifications.map((toast) => {
        let borderClass = 'border-slate-200';
        let bgIconClass = 'bg-blue-50 text-blue-600';
        let Icon = Info;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-200 bg-white shadow-emerald-900/5';
          bgIconClass = 'bg-emerald-50 text-emerald-600';
          Icon = CheckCircle2;
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-200 bg-white shadow-amber-900/5';
          bgIconClass = 'bg-amber-50 text-amber-600';
          Icon = AlertTriangle;
        } else if (toast.type === 'error') {
          borderClass = 'border-rose-200 bg-white shadow-rose-900/5';
          bgIconClass = 'bg-rose-50 text-rose-600';
          Icon = XCircle;
        } else {
          borderClass = 'border-sky-200 bg-white shadow-sky-900/5';
          bgIconClass = 'bg-sky-50 text-sky-600';
          Icon = Info;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border bg-white shadow-lg shadow-slate-200/50 transition-all duration-200 transform translate-y-0 opacity-100 ${borderClass}`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${bgIconClass}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              {toast.title && (
                <h4 className="text-xs font-bold text-slate-900 tracking-tight leading-snug">
                  {toast.title}
                </h4>
              )}
              {toast.message && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeNotification(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
