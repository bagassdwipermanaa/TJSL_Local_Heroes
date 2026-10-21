import React, { useState } from 'react';
import { UserPlus, User, Mail, Lock, Building, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';

export default function RegisterPage({ onNavigateLogin, onRegisterSuccess }) {
  const { register } = useAuth();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    email: '',
    role: 'pendaftar',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const passRules = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[^A-Za-z0-9]/.test(formData.password)
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      setErrorMessage('Harap isi nama lengkap Anda.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('Harap isi alamat email resmi.');
      return;
    }
    if (!passRules.length) {
      setErrorMessage('Kata sandi harus minimal 8 karakter.');
      return;
    }
    if (!passRules.upper) {
      setErrorMessage('Kata sandi wajib mengandung minimal 1 huruf kapital (A-Z).');
      return;
    }
    if (!passRules.number) {
      setErrorMessage('Kata sandi wajib mengandung minimal 1 angka (0-9).');
      return;
    }
    if (!passRules.symbol) {
      setErrorMessage('Kata sandi wajib mengandung minimal 1 simbol / karakter khusus (!@#$%^&* dsb).');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const user = await register({
        nama: formData.nama,
        nip: formData.nip,
        email: formData.email,
        role: formData.role,
        password: formData.password
      });

      showNotification({
        type: 'success',
        title: 'Registrasi Berhasil',
        message: `Akun atas nama ${user.nama} berhasil dibuat. Sesi Anda langsung aktif.`
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(user);
      }
    } catch (err) {
      const msg = err.message || 'Gagal mendaftar akun. Silakan coba kembali.';
      setErrorMessage(msg);
      showNotification({
        type: 'error',
        title: 'Pendaftaran Gagal',
        message: msg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg mx-auto">
      {/* Header Info */}
      <div className="mb-2.5 flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-cyan-900 bg-cyan-50 border border-cyan-200/80 px-2.5 py-0.5 rounded-full">
          Portal Pendaftaran Akun
        </span>
        <span className="text-[11px] text-slate-400 font-medium">PLN ES Local Heroes</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Header */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/60 text-center">
          <img
            src="/logos/PLNES_logo.webp"
            alt="PLN Electricity Services"
            className="h-7 sm:h-8 w-auto object-contain mx-auto mb-1.5"
          />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Pendaftaran Akun Baru
          </h2>
          <p className="text-[11px] text-slate-500">
            Pendaftaran akun pengusul inisiatif TJSL (akun dewan juri disiapkan oleh admin)
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-2.5">
          {errorMessage && (
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs leading-relaxed">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  placeholder="Budi Santoso"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-800 focus:ring-1 focus:ring-cyan-800 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                NIP Pegawai
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  onChange={handleChange}
                  placeholder="92142019ZY"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-800 focus:ring-1 focus:ring-cyan-800 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Alamat Email <span className="text-rose-500">*</span>
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
                placeholder="nama@email.com"
                autoComplete="email"
                required
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-800 focus:ring-1 focus:ring-cyan-800 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kata Sandi <span className="text-rose-500">*</span>
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
                  autoComplete="new-password"
                  required
                  className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-800 focus:ring-1 focus:ring-cyan-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Konfirmasi Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi sandi"
                  autoComplete="new-password"
                  required
                  className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-cyan-800 focus:ring-1 focus:ring-cyan-800 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  title={showConfirmPassword ? 'Sembunyikan konfirmasi sandi' : 'Lihat konfirmasi sandi'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Ketentuan Password Live Indicator */}
          <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Ketentuan Kata Sandi
              </span>
              <span className={`text-[10px] font-semibold ${
                passRules.length && passRules.upper && passRules.number && passRules.symbol
                  ? 'text-emerald-700'
                  : 'text-slate-500'
              }`}>
                {[passRules.length, passRules.upper, passRules.number, passRules.symbol].filter(Boolean).length}/4 Terpenuhi
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
              <div className={`flex items-center gap-1 transition-colors ${passRules.length ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                <Check className={`w-3 h-3 shrink-0 ${passRules.length ? 'text-emerald-600 stroke-[3]' : 'text-slate-300'}`} />
                <span>Min. 8 Karakter</span>
              </div>
              <div className={`flex items-center gap-1 transition-colors ${passRules.upper ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                <Check className={`w-3 h-3 shrink-0 ${passRules.upper ? 'text-emerald-600 stroke-[3]' : 'text-slate-300'}`} />
                <span>Huruf Kapital (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1 transition-colors ${passRules.number ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                <Check className={`w-3 h-3 shrink-0 ${passRules.number ? 'text-emerald-600 stroke-[3]' : 'text-slate-300'}`} />
                <span>Angka (0-9)</span>
              </div>
              <div className={`flex items-center gap-1 transition-colors ${passRules.symbol ? 'text-emerald-700 font-semibold' : 'text-slate-400'}`}>
                <Check className={`w-3 h-3 shrink-0 ${passRules.symbol ? 'text-emerald-600 stroke-[3]' : 'text-slate-300'}`} />
                <span>Simbol Khusus (!@#)</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-1.5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Mendaftarkan...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Buat Akun Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch to login */}
        <div className="px-5 py-3 sm:px-6 border-t border-slate-100 bg-slate-50/60 text-center text-xs text-slate-600">
          <span>Sudah memiliki akun? </span>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="font-bold text-cyan-800 hover:text-cyan-900 underline transition-colors"
          >
            Masuk ke Akun
          </button>
        </div>
      </div>
    </div>
  );
}
