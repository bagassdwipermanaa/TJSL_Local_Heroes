import React, { useState, useCallback, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import StepTabs from './components/layout/StepTabs';
import ScoreSidebar from './components/layout/ScoreSidebar';
import PrintView from './components/layout/PrintView';
import ToastContainer from './components/toast/ToastContainer';
import AuditLogDrawer from './components/audit-log/AuditLogDrawer';
import IdentitasPage from './pages/IdentitasPage';
import AdministrasiPage from './pages/AdministrasiPage';
import PenilaianPage from './pages/PenilaianPage';
import RekomendasiPage from './pages/RekomendasiPage';
import RekapPage from './pages/RekapPage';
import PendaftaranPage from './pages/PendaftaranPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { useNotification } from './hooks/useNotification';
import { useRouter } from './hooks/useRouter';
import { useAuth } from './hooks/useAuth';
import { getStoredUser } from './services/authService';
import {
  createBlankAssessment,
  getAllAssessments,
  fetchAllAssessments,
  saveAssessmentRecord,
  deleteAssessmentRecord
} from './services/assessmentService';
import { API_BASE_URL } from './config';
import { SDGS_OPTIONS, TOTAL_ADMIN_ITEMS } from './utils/constants';
import { REGISTRATION_SDGS } from './constants/registrationConstants';

export default function App() {
  const { user, updateUser } = useAuth();
  const { showNotification, auditLogs } = useNotification();
  const { route, navigate } = useRouter();
  const { appMode, activeStep } = route;
  const [currentAssessment, setCurrentAssessment] = useState(() => createBlankAssessment());
  const [assessments, setAssessments] = useState(() => getAllAssessments());
  const [registrations, setRegistrations] = useState([]);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  const handleSelectAppMode = useCallback((mode, targetUser) => {
    const activeUser = targetUser || user || getStoredUser();
    if (mode === 'dashboard') {
      if (!activeUser || activeUser.role !== 'admin') {
        showNotification({
          type: 'error',
          title: 'Akses Ditolak',
          message: 'Dashboard Administrator hanya dapat diakses oleh akun Admin.'
        });
        return;
      }
    } else if (mode === 'penilaian') {
      if (!activeUser) {
        navigate('login');
        showNotification({
          type: 'warning',
          title: 'Akses Dibatasi',
          message: 'Silakan masuk dengan akun dewan juri atau admin untuk mengakses penilaian.'
        });
        return;
      }
      if (activeUser.role === 'pendaftar') {
        showNotification({
          type: 'error',
          title: 'Akses Ditolak',
          message: 'Akun peserta/pendaftar hanya dapat mengakses formulir pendaftaran inisiatif.'
        });
        return;
      }
    } else if (mode === 'pendaftaran') {
      if (activeUser && activeUser.role === 'penilai') {
        showNotification({
          type: 'info',
          title: 'Mode Juri Aktif',
          message: 'Akun dewan juri difokuskan pada lembar evaluasi penilaian.'
        });
        return;
      }
    } else if (mode === 'profile') {
      if (!activeUser) {
        navigate('login');
        showNotification({
          type: 'warning',
          title: 'Perlu Masuk',
          message: 'Silakan masuk untuk mengakses halaman profil Anda.'
        });
        return;
      }
    }
    navigate(mode, mode === 'penilaian' ? 'identitas' : undefined);
  }, [navigate, user, showNotification]);

  // Strict Role Route Guards (Redirects if URL does not match role or unauthenticated)
  useEffect(() => {
    const activeUser = user || getStoredUser();

    if (!activeUser) {
      // Belum login: arahkan ke halaman login atau register
      if (appMode !== 'login' && appMode !== 'register') {
        navigate('login', undefined, true);
      }
      return;
    }

    if (appMode === 'login' || appMode === 'register') {
      // Jika sudah login, arahkan ke halaman sesuai peran pengguna
      if (activeUser.role === 'admin') {
        navigate('dashboard', undefined, true);
      } else if (activeUser.role === 'penilai') {
        navigate('penilaian', 'identitas', true);
      } else {
        navigate('pendaftaran', undefined, true);
      }
      return;
    }

    if (appMode === 'profile') {
      return;
    }

    if (activeUser.role === 'admin') {
      // If admin lands on /pendaftaran default, redirect to /dashboard
      if (appMode === 'pendaftaran') {
        navigate('dashboard', undefined, true);
      }
    } else if (activeUser.role === 'pendaftar') {
      if (appMode === 'penilaian' || appMode === 'dashboard') {
        navigate('pendaftaran', undefined, true);
      }
    } else if (activeUser.role === 'penilai') {
      if (appMode === 'pendaftaran' || appMode === 'dashboard') {
        navigate('penilaian', 'identitas', true);
      }
    }
  }, [user, appMode, navigate, showNotification]);

  const handleSelectStep = useCallback((step) => {
    navigate('penilaian', step);
  }, [navigate]);

  // Silent sync helper
  const refreshList = useCallback(async () => {
    const data = await fetchAllAssessments();
    if (data && Array.isArray(data)) {
      setAssessments(data);
    }
  }, []);

  // Background Live Polling (3 detik) & Focus / Visibility Sync (no-manual-refresh.md)
  useEffect(() => {
    let isMounted = true;

    const silentSync = async () => {
      const data = await fetchAllAssessments();
      if (isMounted && data && Array.isArray(data)) {
        setAssessments(data);
      }
      try {
        const regRes = await fetch(`${API_BASE_URL}/registrations`);
        if (regRes.ok) {
          const regJson = await regRes.json();
          if (isMounted && regJson.data && Array.isArray(regJson.data)) {
            setRegistrations(regJson.data);
          }
        }
      } catch {
        // silent
      }
    };

    // Initial background fetch
    silentSync();

    const interval = setInterval(silentSync, 3000);

    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible') {
        silentSync();
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
    };
  }, []);

  // Update identification fields
  const handleIdentChange = (field, value) => {
    setCurrentAssessment(prev => ({
      ...prev,
      ident: {
        ...prev.ident,
        [field]: value
      }
    }));
  };

  // Update administrative checklist items
  const handleAdminChange = (index, value) => {
    setCurrentAssessment(prev => {
      const nextAdmin = [...(prev.admin || [])];
      // Toggle if clicking same value
      nextAdmin[index] = nextAdmin[index] === value ? null : value;
      return {
        ...prev,
        admin: nextAdmin
      };
    });
  };



  // Update criterion score in a stage
  const handleScoreChange = (stageKey, criterionIndex, scoreValue) => {
    setCurrentAssessment(prev => {
      const stageScores = [...(prev.scores?.[stageKey] || Array(7).fill(null))];
      // Toggle if clicking same score
      stageScores[criterionIndex] = stageScores[criterionIndex] === scoreValue ? null : scoreValue;

      return {
        ...prev,
        scores: {
          ...prev.scores,
          [stageKey]: stageScores
        }
      };
    });
  };

  // Update criterion note
  const handleCriterionNoteChange = (stageKey, criterionIndex, noteValue) => {
    setCurrentAssessment(prev => {
      const stageNotes = [...(prev.notes?.[stageKey] || Array(7).fill(''))];
      stageNotes[criterionIndex] = noteValue;

      return {
        ...prev,
        notes: {
          ...prev.notes,
          [stageKey]: stageNotes
        }
      };
    });
  };

  // Toggle bonus item
  const handleToggleBonus = (bonusIndex) => {
    setCurrentAssessment(prev => {
      const nextBonus = [...(prev.bonus || [])];
      nextBonus[bonusIndex] = !nextBonus[bonusIndex];
      return {
        ...prev,
        bonus: nextBonus
      };
    });
  };

  // Update generic root fields (kekuatan, perbaikan, rekomendasi, juri, dll)
  const handleFieldChange = (field, value) => {
    setCurrentAssessment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save current assessment
  const handleSave = async () => {
    const participantName = currentAssessment.ident?.nama || currentAssessment.ident?.komunitas;
    if (!participantName) {
      showNotification({
        type: 'warning',
        title: 'Nama Peserta Belum Diisi',
        message: 'Mohon lengkapi nama peserta terlebih dahulu pada tab Identitas.'
      });
      handleSelectStep('identitas');
      return;
    }

    const dataToSave = {
      ...currentAssessment,
      juri: currentAssessment.juri || user?.nama || 'Dewan Juri',
      juriEmail: user?.email || '',
      juriRole: user?.role || ''
    };

    const result = await saveAssessmentRecord(dataToSave);
    if (result.success) {
      setCurrentAssessment(result.item);
      await refreshList();
      showNotification({
        type: 'success',
        title: 'Penilaian Berhasil Disimpan',
        message: `Data penilaian untuk "${participantName}" berhasil disimpan ke sistem.`
      });
    } else {
      showNotification({
        type: 'error',
        title: 'Gagal Menyimpan Data',
        message: result.error || 'Terjadi kesalahan teknis saat menyimpan data.'
      });
    }
  };

  // Create new assessment
  const handleNewAssessment = () => {
    setCurrentAssessment(createBlankAssessment());
    handleSelectStep('identitas');
    showNotification({
      type: 'info',
      title: 'Form Baru Siap',
      message: 'Formulir telah dikosongkan untuk penilaian peserta baru.'
    });
  };

  // Reset form with confirmation
  const handleResetForm = () => {
    if (window.confirm('Kosongkan semua isian pada formulir peserta saat ini?')) {
      setCurrentAssessment(createBlankAssessment());
      showNotification({
        type: 'warning',
        title: 'Formulir Dikosongkan',
        message: 'Seluruh nilai dan data pada form saat ini telah direset.'
      });
    }
  };

  // Link participant registration to current assessment
  const handleSelectRegistrationForAssessment = useCallback((reg, silent = false) => {
    if (!reg) {
      setCurrentAssessment(createBlankAssessment());
      return;
    }
    const d = reg.data || {};

    // Check if an assessment already exists for this registration
    const existing = assessments.find(a => 
      (a.registrationId && a.registrationId === reg.id) ||
      (a.ident?.nama && d.nama && a.ident.nama.toLowerCase().trim() === d.nama.toLowerCase().trim())
    );

    const loc = [d.desa, d.kecamatan, d.kabkota, d.provinsi].filter(Boolean).join(', ') || d.lokasi || '';

    // Map SDGs correctly whether stored at root (reg.sdgs) or in data (d.sdgs)
    const rawSdgs = Array.isArray(reg.sdgs) ? reg.sdgs : (Array.isArray(d.sdgs) ? d.sdgs : []);
    let sdgText = '';
    if (rawSdgs.length > 0) {
      sdgText = rawSdgs.map(idx => {
        return SDGS_OPTIONS.find(s => s.startsWith(`${idx}.`)) || (REGISTRATION_SDGS[idx - 1] ? `${idx}. ${REGISTRATION_SDGS[idx - 1]}` : `SDG ${idx}`);
      }).join(', ');
    } else if (typeof d.sdgs === 'string') {
      sdgText = d.sdgs;
    }

    // Auto map uploaded registration files to adminFiles & checklist
    const regFiles = reg.files || d.files || {};
    const adminFiles = {};
    const admin = Array(TOTAL_ADMIN_ITEMS).fill(null);

    // adm-0: Pegawai / TAD aktif (terverifikasi dari data kepegawaian & NIP)
    if (d.statuspeg || d.nip) {
      admin[0] = true;
    }

    // adm-1: Surat rekomendasi pimpinan unit
    if (regFiles.rekomendasi && regFiles.rekomendasi.length > 0) {
      const f = regFiles.rekomendasi[0];
      adminFiles[1] = { ...f, url: f.url || (f.filename ? `/uploads/${f.filename}` : '') };
      admin[1] = true;
    }

    // adm-2 s/d adm-6: Pernyataan Integritas & Keaslian Dokumen (5 butir dari Bagian 5)
    if (Array.isArray(reg.decl)) {
      reg.decl.forEach((val, idx) => {
        if (idx < 5) {
          admin[2 + idx] = Boolean(val);
        }
      });
    }

    const mergedIdent = {
      nama: d.nama || '',
      nip: d.nip || '',
      jabatan: d.jabatan || '',
      unit: d.unit || '',
      atasan: d.atasan || '',
      email: d.email || '',
      hp: d.hp || '',
      komunitas: d.komunitas || d.nama_komunitas || '',
      program: d.program || '',
      lokasi: loc,
      mulai: d.mulai || '',
      frekuensi: d.frekuensi || '',
      penerima: d.penerima_jiwa || d.penerima || '',
      sdgs: sdgText,
      pilar: d.pilar || 'Sosial',
      statuspeg: d.statuspeg || (d.nip?.startsWith('TAD') ? 'TAD' : 'Pegawai'),
      kategori: d.kategori || (d.statuspeg === 'TAD' ? 'TAD' : 'Individu'),
      peran: d.peran || '',
      kegiatan: d.kegiatan || '',
      masalah: d.masalah || '',
      dampak: d.dampak || '',
      keberlanjutan: d.keberlanjutan || '',
      inovasi: d.inovasi || '',
      mitra: d.mitra || ''
    };

    try {
      localStorage.setItem('active_assessment_reg_id', reg.id);
    } catch {
      // silent
    }

    if (existing) {
      setCurrentAssessment({
        ...existing,
        registrationId: reg.id,
        regData: d,
        regFiles,
        decl: reg.decl || existing.decl || [],
        admin: existing.admin || admin,
        adminFiles: { ...adminFiles, ...(existing.adminFiles || {}) },
        ident: {
          ...mergedIdent,
          ...(existing.ident || {})
        }
      });
      if (!silent) {
        showNotification({
          type: 'info',
          title: 'Penilaian Dimuat',
          message: `Memuat lembar penilaian tersimpan untuk "${d.nama || 'Peserta'}".`
        });
      }
      return;
    }

    const newAssessment = {
      ...createBlankAssessment(),
      registrationId: reg.id,
      ident: mergedIdent,
      regData: d,
      regFiles,
      admin,
      adminFiles,
      decl: reg.decl || [],
      juri: user?.nama || '',
      updatedAt: new Date().toISOString()
    };

    setCurrentAssessment(newAssessment);
    if (!silent) {
      showNotification({
        type: 'success',
        title: 'Peserta Terpilih',
        message: `Data peserta "${d.nama || 'Inisiatif'}" berhasil dimuat ke lembar penilaian.`
      });
    }
  }, [assessments, user, showNotification]);

  // Auto-connect registration if currentAssessment is blank or lacks registrationId in penilaian mode
  useEffect(() => {
    if (appMode !== 'penilaian') return;
    if (!Array.isArray(registrations) || registrations.length === 0) return;
    if (currentAssessment?.registrationId && currentAssessment?.ident?.nama) return;

    let target = null;
    const savedRegId = localStorage.getItem('active_assessment_reg_id');
    if (savedRegId) {
      target = registrations.find(r => r.id === savedRegId);
    }
    if (!target) {
      const activeUser = user || getStoredUser();
      if (activeUser?.nip || activeUser?.email) {
        target = registrations.find(r => 
          (activeUser.nip && r.data?.nip === activeUser.nip) ||
          (activeUser.email && r.data?.email === activeUser.email) ||
          (activeUser.id && r.userId === activeUser.id)
        );
      }
    }
    if (!target) {
      target = registrations.find(r => r.status === 'terkirim') || registrations[0];
    }

    if (target) {
      handleSelectRegistrationForAssessment(target, true);
    }
  }, [appMode, registrations, currentAssessment, user, handleSelectRegistrationForAssessment]);

  // Open existing assessment
  const handleOpenAssessment = (id) => {
    const list = getAllAssessments();
    const found = list.find(item => item.id === id);
    if (found) {
      setCurrentAssessment(found);
      handleSelectStep('identitas');
      showNotification({
        type: 'info',
        title: 'Data Peserta Dibuka',
        message: `Membuka data penilaian "${found.ident?.nama || found.ident?.komunitas || 'Peserta'}".`
      });
    }
  };

  // Delete assessment
  const handleDeleteAssessment = async (id) => {
    const list = getAllAssessments();
    const target = list.find(item => item.id === id);
    const targetName = target?.ident?.nama || target?.ident?.komunitas || 'Peserta ini';

    if (window.confirm(`Hapus seluruh penilaian untuk ${targetName}?`)) {
      await deleteAssessmentRecord(id);
      await refreshList();
      if (currentAssessment.id === id) {
        setCurrentAssessment(createBlankAssessment());
      }
      showNotification({
        type: 'warning',
        title: 'Penilaian Dihapus',
        message: `Data penilaian "${targetName}" telah dihapus secara permanen.`
      });
    }
  };

  // Fullscreen 100% viewport for Login & Register (no navbar, no scroll)
  if (appMode === 'login' || appMode === 'register') {
    return (
      <div className="h-screen w-full flex items-center justify-center p-3 sm:p-4 bg-slate-100/70 overflow-hidden no-print">
        {appMode === 'login' ? (
          <LoginPage
            onNavigateRegister={() => handleSelectAppMode('register')}
            onLoginSuccess={(u) => {
              if (u?.role === 'admin') {
                navigate('dashboard');
              } else if (u?.role === 'penilai') {
                navigate('penilaian', 'identitas');
              } else {
                navigate('pendaftaran');
              }
            }}
          />
        ) : (
          <RegisterPage
            onNavigateLogin={() => handleSelectAppMode('login')}
            onRegisterSuccess={(u) => {
              if (u?.role === 'admin') {
                navigate('dashboard');
              } else if (u?.role === 'penilai') {
                navigate('penilaian', 'identitas');
              } else {
                navigate('pendaftaran');
              }
            }}
          />
        )}
        <ToastContainer />
      </div>
    );
  }

  if (appMode === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <AdminDashboardPage
          assessments={assessments}
          currentAssessment={currentAssessment}
          onOpenAssessment={handleOpenAssessment}
          onDeleteAssessment={handleDeleteAssessment}
          onNewAssessment={handleNewAssessment}
        />
        {/* Toast Notification Container */}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      {/* Top Navbar */}
      <Navbar
        onOpenAuditLog={() => {
          if (user?.role === 'admin') {
            setIsAuditLogOpen(true);
          }
        }}
        auditLogCount={auditLogs.length}
        appMode={appMode}
        onSelectAppMode={handleSelectAppMode}
      />

      {/* Step Navigation Bar (only active in Penilaian Juri mode) */}
      {appMode === 'penilaian' && (
        <StepTabs
          activeStep={activeStep}
          onSelectStep={handleSelectStep}
          savedCount={assessments.length}
          onSwitchToPendaftaran={user?.role === 'admin' ? () => handleSelectAppMode('dashboard') : undefined}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 no-print">
        {appMode === 'profile' ? (
          <ProfilePage
            user={user}
            onProfileUpdated={(updated) => {
              if (updateUser) updateUser(updated);
            }}
            onBack={() => {
              if (user?.role === 'admin') handleSelectAppMode('dashboard');
              else if (user?.role === 'penilai') handleSelectAppMode('penilaian');
              else handleSelectAppMode('pendaftaran');
            }}
          />
        ) : appMode === 'pendaftaran' ? (
          <PendaftaranPage onNavigateLogin={() => handleSelectAppMode('login')} />
        ) : activeStep === 'rekap' ? (
          // Full-width leaderboard page
          <RekapPage
            assessments={assessments}
            onOpenAssessment={handleOpenAssessment}
            onDeleteAssessment={handleDeleteAssessment}
            onNewAssessment={handleNewAssessment}
          />
        ) : (
          // Editorial layout: Left form page + Right sticky score summary
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 min-w-0 space-y-6">
              {activeStep === 'identitas' && (
                <IdentitasPage
                  assessment={currentAssessment}
                  onChangeIdent={handleIdentChange}
                  onNext={() => handleSelectStep('admin')}
                  registrations={registrations}
                  onSelectRegistration={handleSelectRegistrationForAssessment}
                />
              )}

              {activeStep === 'admin' && (
                <AdministrasiPage
                  assessment={currentAssessment}
                  onChangeAdminItem={handleAdminChange}
                  onChangeField={handleFieldChange}
                  onNext={() => handleSelectStep('nilai')}
                  onPrev={() => handleSelectStep('identitas')}
                />
              )}

              {activeStep === 'nilai' && (
                <PenilaianPage
                  assessment={currentAssessment}
                  onChangeScore={handleScoreChange}
                  onChangeCriterionNote={handleCriterionNoteChange}
                  onToggleBonus={handleToggleBonus}
                  onNext={() => handleSelectStep('rekom')}
                  onPrev={() => handleSelectStep('admin')}
                />
              )}

              {activeStep === 'rekom' && (
                <RekomendasiPage
                  assessment={currentAssessment}
                  onChangeField={handleFieldChange}
                  onSave={handleSave}
                  onPrev={() => handleSelectStep('nilai')}
                  onGoToRekap={() => handleSelectStep('rekap')}
                />
              )}
            </div>

            <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0 lg:sticky lg:top-24 z-10">
              <ScoreSidebar
                assessment={currentAssessment}
                registrations={registrations}
                onSelectRegistration={handleSelectRegistrationForAssessment}
                onSave={handleSave}
                onReset={handleResetForm}
                onGoToStep={handleSelectStep}
              />
            </div>
          </div>
        )}
      </main>

      {/* Print View for window.print() */}
      <PrintView assessment={currentAssessment} />

      {/* Toast Notification Container (floating bottom-right / bottom-center) */}
      <ToastContainer />

      {/* Audit Log Drawer (Hanya Admin) */}
      {user?.role === 'admin' && (
        <AuditLogDrawer
          isOpen={isAuditLogOpen}
          onClose={() => setIsAuditLogOpen(false)}
        />
      )}
    </div>
  );
}
