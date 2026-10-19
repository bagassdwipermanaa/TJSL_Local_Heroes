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
import { useNotification } from './hooks/useNotification';
import {
  createBlankAssessment,
  getAllAssessments,
  fetchAllAssessments,
  saveAssessmentRecord,
  deleteAssessmentRecord
} from './services/assessmentService';

export default function App() {
  const { showNotification, auditLogs } = useNotification();
  const [currentAssessment, setCurrentAssessment] = useState(() => createBlankAssessment());
  const [assessments, setAssessments] = useState(() => getAllAssessments());
  const [activeStep, setActiveStep] = useState('identitas');
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

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

  // Attach uploaded proof file for admin item
  const handleAttachAdminFile = (index, fileData) => {
    setCurrentAssessment(prev => ({
      ...prev,
      adminFiles: {
        ...(prev.adminFiles || {}),
        [index]: fileData
      }
    }));
  };

  // Remove uploaded proof file
  const handleRemoveAdminFile = (index) => {
    setCurrentAssessment(prev => {
      const nextFiles = { ...(prev.adminFiles || {}) };
      delete nextFiles[index];
      return {
        ...prev,
        adminFiles: nextFiles
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
        message: 'Mohon lengkapi nama peserta atau komunitas terlebih dahulu pada tab Identitas.'
      });
      setActiveStep('identitas');
      return;
    }

    const result = await saveAssessmentRecord(currentAssessment);
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
    setActiveStep('identitas');
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

  // Open existing assessment
  const handleOpenAssessment = (id) => {
    const list = getAllAssessments();
    const found = list.find(item => item.id === id);
    if (found) {
      setCurrentAssessment(found);
      setActiveStep('identitas');
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      {/* Top Navbar */}
      <Navbar
        onNewAssessment={handleNewAssessment}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
        auditLogCount={auditLogs.length}
      />

      {/* Step Navigation Bar */}
      <StepTabs
        activeStep={activeStep}
        onSelectStep={setActiveStep}
        savedCount={assessments.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 no-print">
        {activeStep === 'rekap' ? (
          // Full-width leaderboard page
          <RekapPage
            assessments={assessments}
            onOpenAssessment={handleOpenAssessment}
            onDeleteAssessment={handleDeleteAssessment}
            onNewAssessment={handleNewAssessment}
          />
        ) : (
          // Editorial grid: Left form page + Right sticky score summary
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 space-y-6">
              {activeStep === 'identitas' && (
                <IdentitasPage
                  assessment={currentAssessment}
                  onChangeIdent={handleIdentChange}
                  onNext={() => setActiveStep('admin')}
                />
              )}

              {activeStep === 'admin' && (
                <AdministrasiPage
                  assessment={currentAssessment}
                  onChangeAdminItem={handleAdminChange}
                  onAttachAdminFile={handleAttachAdminFile}
                  onRemoveAdminFile={handleRemoveAdminFile}
                  onChangeField={handleFieldChange}
                  onNext={() => setActiveStep('nilai')}
                  onPrev={() => setActiveStep('identitas')}
                />
              )}

              {activeStep === 'nilai' && (
                <PenilaianPage
                  assessment={currentAssessment}
                  onChangeScore={handleScoreChange}
                  onChangeCriterionNote={handleCriterionNoteChange}
                  onToggleBonus={handleToggleBonus}
                  onNext={() => setActiveStep('rekom')}
                  onPrev={() => setActiveStep('admin')}
                />
              )}

              {activeStep === 'rekom' && (
                <RekomendasiPage
                  assessment={currentAssessment}
                  onChangeField={handleFieldChange}
                  onSave={handleSave}
                  onPrev={() => setActiveStep('nilai')}
                  onGoToRekap={() => setActiveStep('rekap')}
                />
              )}
            </div>

            <div className="lg:col-span-4 relative h-full">
              <ScoreSidebar
                assessment={currentAssessment}
                onSave={handleSave}
                onReset={handleResetForm}
                onGoToStep={setActiveStep}
              />
            </div>
          </div>
        )}
      </main>

      {/* Print View for window.print() */}
      <PrintView assessment={currentAssessment} />

      {/* Toast Notification Container (floating bottom-right / bottom-center) */}
      <ToastContainer />

      {/* Audit Log Drawer */}
      <AuditLogDrawer
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />
    </div>
  );
}
