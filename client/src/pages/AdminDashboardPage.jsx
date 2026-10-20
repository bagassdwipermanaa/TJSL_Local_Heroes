import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users, Award, FileText, Plus, Trash2, CheckCircle2,
  Clock, ShieldCheck, Search, ExternalLink, X, RefreshCw,
  Menu, BarChart3, PieChart as PieIcon, ArrowUpRight,
  User, Mail, Hash, Shield, Lock, Eye, EyeOff, UserPlus, Check
} from 'lucide-react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { DonutChart, BarChart } from '../components/admin/AdminCharts';
import { API_BASE_URL } from '../config';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../hooks/useNotification';
import RekapPage from './RekapPage';
import AuditLogPage from './AuditLogPage';
import { REVIEW_STATUS_OPTIONS } from '../constants/registrationConstants';

export default function AdminDashboardPage({
  assessments: propAssessments = [],
  onOpenAssessment,
  onDeleteAssessment,
  onNewAssessment
}) {
  const { user, token } = useAuth();
  const { showNotification, auditLogs = [] } = useNotification();

  // Sidebar responsive states
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard' | 'pendaftaran' | 'users'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [registrations, setRegistrations] = useState([]);
  const [assessments, setAssessments] = useState(() => propAssessments || []);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pendaftaran filter & review modal
  const [searchReg, setSearchReg] = useState('');
  const [filterRegStatus, setFilterRegStatus] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [regReviewStatus, setRegReviewStatus] = useState('baru');
  const [regReviewNotes, setRegReviewNotes] = useState('');
  const [isSavingReview, setIsSavingReview] = useState(false);

  // User filter & create user modal
  const [searchUser, setSearchUser] = useState('');
  const [filterUserRole, setFilterUserRole] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    nama: '',
    email: '',
    nip: '',
    role: 'penilai',
    password: ''
  });
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const getAuthHeader = useCallback(() => {
    const activeToken = token || localStorage.getItem('pln_tjsl_auth_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${activeToken}`
    };
  }, [token]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = getAuthHeader();

      // 1. Registrations
      const regRes = await fetch(`${API_BASE_URL}/registrations`);
      if (regRes.ok) {
        const regJson = await regRes.json();
        setRegistrations(regJson.data || []);
      }

      // 2. Assessments
      const assessRes = await fetch(`${API_BASE_URL}/assessments`);
      if (assessRes.ok) {
        const assessJson = await assessRes.json();
        setAssessments(assessJson.data || []);
      }

      // 3. Users list (admin only)
      const activeToken = token || localStorage.getItem('pln_tjsl_auth_token');
      if (activeToken && user?.role === 'admin') {
        const usersRes = await fetch(`${API_BASE_URL}/auth/users`, { headers });
        if (usersRes.ok) {
          const usersJson = await usersRes.json();
          setUsersList(usersJson.data || []);
        }
      }
    } catch (err) {
      console.error('[AdminDashboard] Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeader, token, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Sidebar Menu Dispatcher
  const handleSelectMenu = (menuId) => {
    setActiveMenu(menuId);
  };

  // Handle Review Registration
  const handleSaveReview = async () => {
    if (!selectedReg) return;
    setIsSavingReview(true);
    try {
      const res = await fetch(`${API_BASE_URL}/registrations/${selectedReg.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewStatus: regReviewStatus,
          reviewNotes: regReviewNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotification({
          type: 'success',
          title: 'Status Berhasil Diperbarui',
          message: `Inisiatif "${selectedReg.data?.nama || ''}" diatur ke ${regReviewStatus}.`
        });
        setSelectedReg(null);
        fetchDashboardData();
      }
    } catch (err) {
      showNotification({ type: 'error', title: 'Gagal Menyimpan', message: err.message });
    } finally {
      setIsSavingReview(false);
    }
  };

  // Handle Delete Registration
  const handleDeleteRegistration = async (id, nama) => {
    if (!window.confirm(`Yakin ingin menghapus berkas pendaftaran "${nama}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/registrations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showNotification({
          type: 'success',
          title: 'Berkas Dihapus',
          message: 'Pendaftaran berhasil dihapus dari sistem.'
        });
        fetchDashboardData();
      }
    } catch (err) {
      showNotification({ type: 'error', title: 'Gagal Hapus', message: err.message });
    }
  };

  // Handle Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUser.nama || !newUser.email || !newUser.password) {
      showNotification({
        type: 'warning',
        title: 'Form Belum Lengkap',
        message: 'Nama, email, dan kata sandi wajib diisi.'
      });
      return;
    }

    setIsCreatingUser(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification({
          type: 'success',
          title: 'Akun Dibuat',
          message: `Akun ${newUser.role} "${newUser.nama}" berhasil dibuat.`
        });
        setIsAddUserOpen(false);
        setNewUser({ nama: '', email: '', nip: '', role: 'penilai', password: '' });
        fetchDashboardData();
      } else {
        showNotification({
          type: 'error',
          title: 'Gagal Membuat Akun',
          message: data.message || 'Terjadi kesalahan sistem.'
        });
      }
    } catch (err) {
      showNotification({ type: 'error', title: 'Koneksi Gagal', message: err.message });
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (id, nama) => {
    if (!window.confirm(`Hapus akun pengguna "${nama}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showNotification({ type: 'success', title: 'Pengguna Dihapus', message: 'Akun telah dihapus.' });
        fetchDashboardData();
      } else {
        showNotification({ type: 'error', title: 'Gagal Menghapus', message: data.message || 'Gagal menghapus.' });
      }
    } catch (err) {
      showNotification({ type: 'error', title: 'Gagal Hapus', message: err.message });
    }
  };

  // Filtered registrations
  const filteredRegs = useMemo(() => {
    return registrations.filter((r) => {
      const d = r.data || {};
      const q = searchReg.toLowerCase().trim();
      if (filterRegStatus && (r.status || 'draft') !== filterRegStatus) return false;
      if (q) {
        const hay = [d.nama, d.program, d.unit, d.nip, d.komunitas].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [registrations, searchReg, filterRegStatus]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const q = searchUser.toLowerCase().trim();
      if (filterUserRole && u.role !== filterUserRole) return false;
      if (q) {
        const hay = [u.nama, u.email, u.nip, u.role].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [usersList, searchUser, filterUserRole]);

  // Statistics & Charts Data Calculation
  const totalPendaftar = registrations.length;
  const terkirimCount = registrations.filter((r) => r.status === 'terkirim').length;
  const draftCount = registrations.filter((r) => r.status !== 'terkirim').length;
  const totalPenilaian = assessments.length;
  const totalUsers = usersList.length;

  const pegawaiCount = registrations.filter((r) => (r.data?.statuspeg || 'Pegawai') === 'Pegawai').length;
  const tadCount = registrations.filter((r) => r.data?.statuspeg === 'TAD').length;

  // Chart 1: Donut Status Pengiriman
  const statusChartData = [
    { label: 'Terkirim', value: terkirimCount, color: '#059669' },
    { label: 'Draf', value: draftCount, color: '#d97706' }
  ];

  // Chart 2: Donut Status Kepegawaian Peserta
  const statuspegChartData = [
    { label: 'Insan Pegawai', value: pegawaiCount, color: '#0891b2' },
    { label: 'Tenaga TAD', value: tadCount, color: '#4f46e5' }
  ];

  // Chart 3: Bar Status Review Panitia
  const reviewStats = useMemo(() => {
    const counts = { baru: 0, revisi: 0, lolos: 0, ditolak: 0 };
    registrations.forEach((r) => {
      const s = r.reviewStatus || 'baru';
      if (counts[s] !== undefined) counts[s]++;
      else counts.baru++;
    });
    return [
      { label: 'Baru', value: counts.baru, color: '#64748b' },
      { label: 'Lolos', value: counts.lolos, color: '#059669' },
      { label: 'Perlu Revisi', value: counts.revisi, color: '#d97706' },
      { label: 'Ditolak', value: counts.ditolak, color: '#e11d48' }
    ];
  }, [registrations]);

  // Chart 4: Donut Komposisi Pengguna Sistem
  const userCompositionData = useMemo(() => {
    const counts = { admin: 0, penilai: 0, pendaftar: 0 };
    usersList.forEach((u) => {
      const r = u.role || 'pendaftar';
      if (counts[r] !== undefined) counts[r]++;
      else counts.pendaftar++;
    });
    return [
      { label: 'Dewan Juri', value: counts.penilai, color: '#0f172a' },
      { label: 'Peserta', value: counts.pendaftar, color: '#0891b2' },
      { label: 'Admin', value: counts.admin, color: '#d97706' }
    ];
  }, [usersList]);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Responsive Collapsible Sidebar */}
      <AdminSidebar
        activeMenu={activeMenu}
        onSelectMenu={handleSelectMenu}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        auditLogCount={auditLogs.length}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Navbar Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 capitalize">
                {activeMenu === 'dashboard'
                  ? 'Dashboard Analitik & Pusat Kendali'
                  : activeMenu === 'pendaftaran'
                  ? 'Verifikasi Berkas Pendaftaran Peserta'
                  : activeMenu === 'users'
                  ? 'Manajemen Akun Pengguna & Dewan Juri'
                  : activeMenu === 'penilaian'
                  ? 'Rekapitulasi & Leaderboard Penilaian Juri'
                  : 'Audit Trail & Rekam Jejak Aktivitas'}
              </h2>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Sistem Seleksi TJSL Local Heroes PT PLN Electricity Services
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-600' : ''}`} />
              <span className="hidden sm:inline">Segarkan Data</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Tambah Akun Juri</span>
              <span className="sm:hidden">Tambah</span>
            </button>
          </div>
        </header>

        {/* Dynamic Body Content */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: DASHBOARD UTAMA & CHARTS */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Stat Metric Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Inisiatif Terdaftar</span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-700">
                      <FileText className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalPendaftar}</p>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{terkirimCount} Berkas Terkirim ({totalPendaftar > 0 ? Math.round((terkirimCount / totalPendaftar) * 100) : 0}%)</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Evaluasi Juri</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalPenilaian}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Nilai peserta masuk di rekap</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Akun Sistem</span>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalUsers}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Peserta, Juri, & Admin</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Tindakan Cepat</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setActiveMenu('penilaian')}
                      className="text-left text-xs font-semibold text-cyan-800 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Leaderboard Rekapitulasi Juri</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMenu('pendaftaran')}
                      className="text-left text-xs font-semibold text-slate-700 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Verifikasi Berkas Masuk</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Donut Status Pengiriman */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <PieIcon className="w-4 h-4 text-cyan-700" />
                        <span>Status Pengiriman Berkas Pendaftaran</span>
                      </h3>
                      <p className="text-xs text-slate-500">Perbandingan inisiatif final vs draf</p>
                    </div>
                  </div>
                  <DonutChart data={statusChartData} title="Berkas" />
                </div>

                {/* Chart 2: Bar Status Verifikasi Administrasi */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-cyan-700" />
                        <span>Status Verifikasi Administrasi Panitia</span>
                      </h3>
                      <p className="text-xs text-slate-500">Progres telaah kelayakan berkas</p>
                    </div>
                  </div>
                  <BarChart data={reviewStats} />
                </div>

                {/* Chart 3: Donut Distribusi Kategori Pengusul */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-700" />
                        <span>Komposisi Pengusul Pegawai vs TAD</span>
                      </h3>
                      <p className="text-xs text-slate-500">Distribusi peserta berdasarkan ikatan kerja</p>
                    </div>
                  </div>
                  <DonutChart data={statuspegChartData} title="Pengusul" />
                </div>

                {/* Chart 4: Donut Komposisi Pengguna Terdaftar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-cyan-700" />
                        <span>Distribusi Akun Resmi Pengguna</span>
                      </h3>
                      <p className="text-xs text-slate-500">Struktur hak akses pengguna di portal</p>
                    </div>
                  </div>
                  <DonutChart data={userCompositionData} title="Pengguna" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KELOLA PENDAFTARAN */}
          {activeMenu === 'pendaftaran' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-300">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchReg}
                    onChange={(e) => setSearchReg(e.target.value)}
                    placeholder="Cari nama pengusul, program, unit, NIP..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterRegStatus}
                    onChange={(e) => setFilterRegStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
                  >
                    <option value="">Semua Status Pengiriman</option>
                    <option value="terkirim">Terkirim</option>
                    <option value="draft">Draf</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Pengusul & Unit</th>
                      <th className="py-3 px-4">Nama Program Inisiatif</th>
                      <th className="py-3 px-4">Status Kirim</th>
                      <th className="py-3 px-4">Status Review</th>
                      <th className="py-3 px-4">Waktu</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRegs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-slate-400">
                          Tidak ada data pendaftaran yang sesuai kriteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRegs.map((item) => {
                        const d = item.data || {};
                        const isSent = item.status === 'terkirim';

                        return (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-slate-900">{d.nama || '(Tanpa Nama)'}</p>
                              <p className="text-[11px] text-slate-500">{d.unit || '-'} {d.nip ? `• NIP: ${d.nip}` : ''}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-800 line-clamp-1">{d.program || '(Judul belum diisi)'}</p>
                              <p className="text-[11px] text-slate-500">{d.komunitas || '-'}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                isSent
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {isSent ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                <span>{isSent ? 'Terkirim' : 'Draf'}</span>
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200 capitalize">
                                {item.reviewStatus || 'Baru'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-[11px] text-slate-500">
                              {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedReg(item);
                                    setRegReviewStatus(item.reviewStatus || 'baru');
                                    setRegReviewNotes(item.reviewNotes || '');
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                                >
                                  Review
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRegistration(item.id, d.nama || item.id)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Hapus Pendaftaran"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: KELOLA PENGGUNA & JURI */}
          {activeMenu === 'users' && (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-300">
              <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Cari nama, email, NIP..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filterUserRole}
                    onChange={(e) => setFilterUserRole(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 text-slate-700"
                  >
                    <option value="">Semua Peran</option>
                    <option value="admin">Administrator</option>
                    <option value="penilai">Dewan Juri</option>
                    <option value="pendaftar">Peserta</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setIsAddUserOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Tambah Juri</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Nama Lengkap</th>
                      <th className="py-3 px-4">Alamat Email</th>
                      <th className="py-3 px-4">NIP</th>
                      <th className="py-3 px-4">Peran (Role)</th>
                      <th className="py-3 px-4">Tanggal Daftar</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const isCurrent = user?.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                              u.role === 'admin' ? 'bg-amber-600' : u.role === 'penilai' ? 'bg-slate-800' : 'bg-cyan-800'
                            }`}>
                              {u.nama ? u.nama.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span>{u.nama}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-normal">
                                Anda
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{u.email}</td>
                          <td className="py-3 px-4 text-slate-500">{u.nip || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              u.role === 'admin'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : u.role === 'penilai'
                                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                            }`}>
                              {u.role === 'admin' ? 'Admin' : u.role === 'penilai' ? 'Dewan Juri' : 'Peserta / Pendaftar'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[11px] text-slate-500">
                            {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.nama)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Hapus Akun Pengguna"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PENILAIAN JURI & REKAPITULASI LEADERBOARD */}
          {activeMenu === 'penilaian' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <RekapPage
                assessments={assessments}
                onOpenAssessment={onOpenAssessment}
                onDeleteAssessment={onDeleteAssessment}
                onNewAssessment={onNewAssessment}
              />
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL & LOG AKTIVITAS */}
          {activeMenu === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <AuditLogPage />
            </div>
          )}
        </main>
      </div>

      {/* Modal Review Registration */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-800 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Review Berkas Pendaftaran</h3>
                  <p className="text-[11px] text-slate-500">Verifikasi kelayakan berkas inisiatif peserta</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <p className="text-[11px] text-slate-500 font-medium">Pengusul & Inisiatif:</p>
              <p className="text-xs font-bold text-slate-900">{selectedReg.data?.nama || '-'}</p>
              <p className="text-xs text-slate-600">{selectedReg.data?.program || '-'}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status Verifikasi Administrasi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <select
                  value={regReviewStatus}
                  onChange={(e) => setRegReviewStatus(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-cyan-800 text-slate-800"
                >
                  {REVIEW_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Panitia / Admin</label>
              <textarea
                rows={3}
                value={regReviewNotes}
                onChange={(e) => setRegReviewNotes(e.target.value)}
                placeholder="Tuliskan catatan verifikasi kelengkapan berkas..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-cyan-800 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Batal</span>
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                disabled={isSavingReview}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isSavingReview ? 'Menyimpan...' : 'Simpan Verifikasi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Create User */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-800 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Buat Akun Juri / Panitia</h3>
                  <p className="text-[11px] text-slate-500">Registrasi akun resmi internal oleh administrator</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newUser.nama}
                    onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                    placeholder="Contoh: Ir. Budi Santoso"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-cyan-800 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="juri@plnes.co.id"
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-cyan-800 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIP (Opsional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={newUser.nip}
                    onChange={(e) => setNewUser({ ...newUser, nip: e.target.value })}
                    placeholder="1987..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-cyan-800 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peran Akun (Role) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-cyan-800 text-slate-900"
                  >
                    <option value="penilai">Dewan Juri / Penilai</option>
                    <option value="admin">Administrator Sistem</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Awal *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showNewUserPassword ? 'text' : 'password'}
                    required
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Min. 8 karakter (kombinasi huruf, angka, simbol)"
                    className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-cyan-800 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewUserPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                    title={showNewUserPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  >
                    {showNewUserPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Batal</span>
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isCreatingUser ? 'Memproses...' : 'Simpan Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
