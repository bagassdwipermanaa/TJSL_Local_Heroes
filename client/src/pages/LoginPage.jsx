import React, { useState } from 'react';
import { LogIn, Mail, Lock, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';

export default function LoginPage({ onNavigateRegister, onNavigateHome, onLoginSuccess }) {
  const { login } = useAuth();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState(() => {
    const savedEmail = localStorage.getItem('tjsl_remember_email') || '';
    return {
      email: savedEmail,
      password: ''
    };
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return Boolean(localStorage.getItem('tjsl_remember_email'));
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password) {
      setErrorMessage('Harap masukkan alamat email dan kata sandi Anda.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const user = await login(formData);

      // Handle remember me persistence
      if (rememberMe) {
        localStorage.setItem('tjsl_remember_email', formData.email.trim());
      } else {
        localStorage.removeItem('tjsl_remember_email');
      }

      showNotification({
        type: 'success',
        title: 'Login Berhasil',
        message: `Selamat datang kembali, ${user.nama}. Sesi Anda telah aktif.`
      });

      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      const msg = err.message || 'Email atau kata sandi tidak sesuai.';
      setErrorMessage(msg);
      showNotification({
        type: 'error',
        title: 'Login Gagal',
        message: msg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto">
      {/* Return to Home link */}
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </button>
        <span className="text-[11px] text-slate-400 font-medium">PLN ES Local Heroes</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with Logo */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 bg-slate-50/60 text-center">
          <img
            src="/logos/PLNES_logo.webp"
            alt="PLN Electricity Services"
            className="h-7 sm:h-8 w-auto object-contain mx-auto mb-2"
          />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Masuk ke Akun
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Pendaftar inisiatif, dewan juri penilai, & admin seleksi
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-3.5">
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@pln.co.id"
                autoComplete="email"
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-800 focus:ring-1 focus:ring-cyan-800 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 karakter"
                autoComplete="current-password"
                required
                className="w-full pl-9 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-800 focus:ring-1 focus:ring-cyan-800 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-cyan-800 focus:ring-cyan-800 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-xs font-medium text-slate-600">Ingat Saya</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Memverifikasi...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer info & switch to register */}
        <div className="px-5 py-3.5 sm:px-6 border-t border-slate-100 bg-slate-50/60 text-center text-xs text-slate-600">
          <span>Belum memiliki akun? </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-bold text-cyan-800 hover:text-cyan-900 underline transition-colors"
          >
            Daftar Akun Baru
          </button>
        </div>
      </div>
    </div>
  );
}
