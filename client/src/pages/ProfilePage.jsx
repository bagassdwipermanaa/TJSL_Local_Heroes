import React from 'react';
import { ArrowLeft, UserCircle2 } from 'lucide-react';
import ProfileInfoCard from '../components/profile/ProfileInfoCard';
import ProfileEditForm from '../components/profile/ProfileEditForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';

export default function ProfilePage({ user, onProfileUpdated, onBack }) {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <UserCircle2 className="w-5 h-5 text-cyan-800" />
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Profil & Pengaturan Akun
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola informasi pribadi, nomor induk pegawai, dan keamanan kata sandi akun Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Overview Card */}
      <ProfileInfoCard user={user} />

      {/* Forms Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileEditForm user={user} onProfileUpdated={onProfileUpdated} />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
