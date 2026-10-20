import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { changeUserPassword } from '../../services/authService';
import { useNotification } from '../../hooks/useNotification';

export default function ChangePasswordForm() {
  const { showNotification } = useNotification();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword) {
      showNotification({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Kata sandi saat ini wajib diisi.'
      });
      return;
    }

    if (newPassword.length < 6) {
      showNotification({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Kata sandi baru minimal 6 karakter.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification({
        type: 'error',
        title: 'Validasi Gagal',
        message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await changeUserPassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      showNotification({
        type: 'success',
        title: 'Kata Sandi Diperbarui',
        message: 'Kata sandi akun Anda berhasil diganti.'
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showNotification({
        type: 'error',
        title: 'Gagal Mengganti Kata Sandi',
        message: err.message || 'Terjadi kesalahan saat mengganti kata sandi.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <KeyRound className="w-5 h-5 text-cyan-800" />
        <h3 className="text-base font-bold text-slate-900">Ganti Kata Sandi</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kata Sandi Saat Ini <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan kata sandi lama Anda"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 transition-colors"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Kata Sandi Baru <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 transition-colors"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Gunakan kombinasi huruf, angka, atau simbol untuk keamanan optimal.</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Perbarui Kata Sandi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
