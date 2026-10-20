import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Save, Send
} from 'lucide-react';
import PersyaratanAccordion from '../components/pendaftaran/PersyaratanAccordion';
import RegistrationProgressBar from '../components/pendaftaran/RegistrationProgressBar';
import SectionPengusul from '../components/pendaftaran/SectionPengusul';
import SectionProgram from '../components/pendaftaran/SectionProgram';
import SectionUraian from '../components/pendaftaran/SectionUraian';
import SectionDokumen from '../components/pendaftaran/SectionDokumen';
import SectionPernyataan from '../components/pendaftaran/SectionPernyataan';
import {
  createBlankRegistration,
  getLocalDraft,
  saveLocalDraft,
  saveRegistrationToServer,
  checkRegistrationCompleteness
} from '../services/registrationService';
import { useNotification } from '../hooks/useNotification';
import { useAuth } from '../hooks/useAuth';

export default function PendaftaranPage({ onNavigateLogin }) {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [registration, setRegistration] = useState(() => {
    return getLocalDraft() || createBlankRegistration();
  });
  const [isSaving, setIsSaving] = useState(false);

  // Jika pengguna baru saja login/register, sinkronkan nama, email, dan NIP akun ke field yang masih kosong
  useEffect(() => {
    if (!user) return;
    setRegistration((prev) => {
      const d = prev.data || {};
      const needsUpdate = (!d.nama && user.nama) || (!d.email && user.email) || (!d.nip && user.nip);
      if (!needsUpdate) return prev;

      const next = {
        ...prev,
        data: {
          ...d,
          nama: d.nama || user.nama || '',
          email: d.email || user.email || '',
          nip: d.nip || user.nip || ''
        },
        userId: user.id || prev.userId,
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(next);
      return next;
    });
  }, [user]);

  const completeness = checkRegistrationCompleteness(registration);

  const handleFieldChange = (field, value) => {
    setRegistration((prev) => {
      const next = {
        ...prev,
        data: {
          ...prev.data,
          [field]: value
        },
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(next);
      return next;
    });
  };

  const handleToggleSdg = (sdgNum) => {
    setRegistration((prev) => {
      const current = prev.sdgs || [];
      const updated = current.includes(sdgNum)
        ? current.filter((n) => n !== sdgNum)
        : [...current, sdgNum].sort((a, b) => a - b);
      const next = {
        ...prev,
        sdgs: updated,
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(next);
      return next;
    });
  };

  const handleAddFile = (docKey, fileData) => {
    setRegistration((prev) => {
      const currentFiles = prev.files || {};
      const list = currentFiles[docKey] || [];
      const next = {
        ...prev,
        files: {
          ...currentFiles,
          [docKey]: [...list, fileData]
        },
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(next);
      return next;
    });
  };

  const handleRemoveFile = (docKey, fileIndex) => {
    setRegistration((prev) => {
      const currentFiles = prev.files || {};
      const list = [...(currentFiles[docKey] || [])];
      list.splice(fileIndex, 1);
      const next = {
        ...prev,
        files: {
          ...currentFiles,
          [docKey]: list
        },
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(next);
      return next;
    });
  };

  const handleChangeLink = (docKey, linkValue) => {
    setRegistration((prev) => {
      const next = {
        ...prev,
        links: {
          ...(prev.links || {}),
          [docKey]: linkValue
        },
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(next);
      return next;
    });
  };

  const handleToggleDecl = (index) => {
    setRegistration((prev) => {
      const current = [...(prev.decl || [])];
      current[index] = !current[index];
      const next = {
        ...prev,
        decl: current,
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(next);
      return next;
    });
  };

  const handleCheckAllDecl = () => {
    setRegistration((prev) => {
      const current = prev.decl || [];
      const allTrue = current.length === 5 && current.every(Boolean);
      const next = {
        ...prev,
        decl: Array(5).fill(!allTrue),
        updatedAt: new Date().toISOString()
      };
      saveLocalDraft(next);
      return next;
    });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const saved = await saveRegistrationToServer({
        ...registration,
        status: registration.status === 'terkirim' ? 'terkirim' : 'draft'
      });
      setRegistration(saved);
      await loadRegistrationsList();
      showNotification({
        type: 'info',
        title: 'Draf Tersimpan',
        message: 'Perubahan data formulir pendaftaran berhasil disimpan.'
      });
    } catch (err) {
      showNotification({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.message || 'Terjadi kesalahan saat menyimpan draf.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      showNotification({
        type: 'warning',
        title: 'Harap Masuk Akun',
        message: 'Silakan masuk atau daftar akun terlebih dahulu untuk mengirimkan berkas pendaftaran.'
      });
      if (onNavigateLogin) {
        onNavigateLogin();
      }
      return;
    }

    if (!completeness.isReady) {
      showNotification({
        type: 'warning',
        title: 'Isian Belum Lengkap',
        message: 'Mohon lengkapi seluruh isian bertanda bintang (*), berkas pendukung, dan centang pernyataan integritas.'
      });

      // Find first uncompleted section and scroll to it
      const uncompletedId = Object.keys(completeness.sections).find(
        (key) => !completeness.sections[key]
      );
      if (uncompletedId) {
        scrollToSection(uncompletedId);
      }
      return;
    }

    if (completeness.months != null && completeness.months < 6) {
      showNotification({
        type: 'error',
        title: 'Syarat Waktu Belum Memenuhi',
        message: 'Kegiatan minimal sudah berjalan 6 bulan secara berkesinambungan.'
      });
      scrollToSection('program');
      return;
    }

    setIsSaving(true);
    try {
      const nowIso = new Date().toISOString();
      const payload = {
        ...registration,
        status: 'terkirim',
        submittedAt: registration.submittedAt || nowIso,
        updatedAt: nowIso
      };

      const saved = await saveRegistrationToServer(payload);
      setRegistration(saved);

      showNotification({
        type: 'success',
        title: 'Pendaftaran Berhasil Dikirim',
        message: `Terima kasih! Pendaftaran inisiatif "${payload.data?.program}" telah terkirim ke panitia.`
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      showNotification({
        type: 'error',
        title: 'Pengiriman Gagal',
        message: err.message || 'Terjadi kesalahan saat mengirim pendaftaran.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const scrollToSection = (secId) => {
    const el = document.getElementById(`sec-${secId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase tracking-wider">
                Kompetisi Pegawai & TAD
              </span>
              <span className="text-xs text-slate-400">PLN Electricity Services</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pendaftaran PLN ES TJSL Local Heroes
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Program apresiasi bagi pegawai/TAD yang secara sukarela menjadi penggerak inisiatif sosial kemasyarakatan, selaras dengan Tujuan Pembangunan Berkelanjutan (SDGs).
            </p>
          </div>
        </div>
      </div>

      {/* Formulir Pendaftaran */}
      <div className="space-y-6">
          {/* Persyaratan Accordion */}
          <PersyaratanAccordion />

          {/* Notice if already submitted */}
          {registration.status === 'terkirim' && (
            <div className="p-4 sm:p-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 flex items-start gap-3.5 shadow-2xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 text-xs sm:text-sm">
                <h4 className="font-bold text-emerald-900">
                  Pendaftaran Anda Sudah Terkirim ke Panitia
                </h4>
                <p className="text-emerald-800 mt-0.5 leading-relaxed">
                  Berkas terkirim pada{' '}
                  <strong>
                    {registration.submittedAt
                      ? new Date(registration.submittedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : '–'}
                  </strong>
                  . Anda tetap dapat memperbarui isian atau melengkapi dokumen pendukung dan mengirim ulang revisi.
                </p>
              </div>
            </div>
          )}

          {/* Form Layout: Left Sections + Right Sticky Progress */}
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 min-w-0 space-y-6">
              {/* Section 1: Pengusul */}
              <SectionPengusul
                data={registration.data || {}}
                onChangeField={handleFieldChange}
              />

              {/* Section 2: Program */}
              <SectionProgram
                data={registration.data || {}}
                sdgs={registration.sdgs || []}
                onChangeField={handleFieldChange}
                onToggleSdg={handleToggleSdg}
              />

              {/* Section 3: Uraian */}
              <SectionUraian
                data={registration.data || {}}
                onChangeField={handleFieldChange}
              />

              {/* Section 4: Dokumen */}
              <SectionDokumen
                files={registration.files || {}}
                links={registration.links || {}}
                onAddFile={handleAddFile}
                onRemoveFile={handleRemoveFile}
                onChangeLink={handleChangeLink}
              />

              {/* Section 5: Pernyataan */}
              <SectionPernyataan
                decl={registration.decl || []}
                onToggleDecl={handleToggleDecl}
                onCheckAll={handleCheckAllDecl}
              />

              {/* Floating / Bottom Action Reminder */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-500">
                  {completeness.isReady
                    ? 'Seluruh isian telah lengkap dan siap dikirim.'
                    : `Lengkapi ${5 - completeness.completedCount} bagian lagi sebelum mengirim.`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 text-slate-500" />
                    <span>Simpan Draf</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-cyan-700 text-white hover:bg-cyan-800 transition-colors shadow-xs active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>{registration.status === 'terkirim' ? 'Kirim Ulang' : 'Kirim Pendaftaran'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sticky Kelengkapan Sidebar */}
            <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0 lg:sticky lg:top-24 z-10">
              <RegistrationProgressBar
                completeness={completeness}
                status={registration.status}
                updatedAt={registration.updatedAt}
                submittedAt={registration.submittedAt}
                isSaving={isSaving}
                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmit}
                onScrollToSection={scrollToSection}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
