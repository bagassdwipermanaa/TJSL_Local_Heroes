import React, { useState } from 'react';
import { User, Hash, Mail, Shield, Save, Loader2 } from 'lucide-react';
import { updateUserProfile } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';

export default function ProfileEditForm({ user, onProfileUpdated }) {
  const { showNotification } = useNotification();
  const [nama, setNama] = useState(user?.nama || '');
  const [nip, setNip] = useState(user?.nip || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama.trim()) {
      showNotification({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Nama lengkap tidak boleh kosong.'
      });
      return;
    }

    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile({
        nama: nama.trim(),
        nip: nip.trim()
      });

      showNotification({
        type: 'success',
        title: 'Profil Diperbarui',
        message: 'Data profil Anda berhasil disimpan.'
      });

      if (onProfileUpdated) {
        onProfileUpdated(updatedUser);
      }
    } catch (err) {
      showNotification({
        type: 'error',
        title: 'Gagal Memperbarui Profil',
        message: err.message || 'Terjadi kesalahan saat menyimpan perubahan profil.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <User className="w-5 h-5 text-cyan-800" />
        <h3 className="text-base font-bold text-slate-900">Ubah Biodata Pengguna</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              required
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nomor Induk Pegawai (NIP) / ID Tenaga Alih Daya
          </label>
          <div className="relative">
            <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="Contoh: 8408189Z atau TAD-2023-0042"
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Alamat Email (Akun Utama)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 cursor-not-allowed select-none"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Email terikat sebagai identitas login utama.</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Peran Pengguna (Role)
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={user?.role === 'admin' ? 'Administrator' : user?.role === 'penilai' ? 'Dewan Juri' : 'Pendaftar Inisiatif'}
                disabled
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 cursor-not-allowed select-none capitalize"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Peran ditentukan oleh panitia pusat.</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-cyan-800 hover:bg-cyan-900 transition-all shadow-xs disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
