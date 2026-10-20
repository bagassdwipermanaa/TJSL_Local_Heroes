import React from 'react';
import { Mail, Shield, Hash, CheckCircle2 } from 'lucide-react';

export default function ProfileInfoCard({ user }) {
  if (!user) return null;

  const roleLabel = user.role === 'admin'
    ? 'Administrator Sistem'
    : user.role === 'penilai'
    ? 'Dewan Juri / Penilai'
    : 'Peserta / Pengusul Inisiatif';

  const roleBadgeStyle = user.role === 'admin'
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : user.role === 'penilai'
    ? 'bg-slate-800 text-white border-slate-700'
    : 'bg-cyan-100 text-cyan-900 border-cyan-200';

  const initial = user.nama ? user.nama.charAt(0).toUpperCase() : 'U';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-800 to-cyan-600 text-white flex items-center justify-center text-3xl font-extrabold shadow-sm shrink-0">
          {initial}
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
            <h2 className="text-xl font-bold text-slate-900 truncate">
              {user.nama}
            </h2>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeStyle}`}>
              <Shield className="w-3 h-3" />
              <span>{roleLabel}</span>
            </span>
          </div>

          <p className="text-xs text-slate-500 mb-4 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>{user.email}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Hash className="w-4 h-4 text-cyan-700 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Nomor Induk Pegawai (NIP)</span>
                <span className="font-semibold text-slate-800 truncate">{user.nip || 'Belum diisi'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="truncate">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status Akun</span>
                <span className="font-semibold text-emerald-700">Aktif & Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
