import { STORAGE_KEY, TOTAL_ADMIN_ITEMS, BONUS_ITEMS } from '../utils/constants';
import { API_BASE } from '../config';
import { computeAssessment, formatScore } from '../utils/scoring';

export function createBlankAssessment() {
  return {
    id: null,
    ident: {
      nama: '',
      nip: '',
      unit: '',
      komunitas: '',
      program: '',
      lokasi: '',
      mulai: '',
      penerima: '',
      sdgs: '',
      pilar: 'Sosial',
      kategori: 'Individu',
      masalah: '',
      kegiatan: '',
      peran: '',
      dampak: '',
      keberlanjutan: '',
      inovasi: '',
      mitra: ''
    },
    admin: Array(TOTAL_ADMIN_ITEMS).fill(null),
    scores: {
      porto: Array(7).fill(null),
      final: Array(7).fill(null)
    },
    notes: {
      porto: Array(7).fill(''),
      final: Array(7).fill('')
    },
    bonus: Array(BONUS_ITEMS.length).fill(false),
    adminFiles: {},
    proposalFile: null,
    catatanAdmin: '',
    kekuatan: '',
    perbaikan: '',
    rekomendasi: '',
    juri: '',
    unsur: '',
    tanggal: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString()
  };
}

// Local cache reader
export function getLocalAssessments() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load assessments from localStorage:', err);
    return [];
  }
}

// Save to local cache
export function setLocalAssessments(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to set localStorage assessments:', err);
  }
}

// Fetch from API with local fallback
export async function fetchAllAssessments() {
  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setLocalAssessments(json.data);
        return json.data;
      }
    }
  } catch {
    // If backend is not started yet or offline, safely fall back to local storage
  }
  return getLocalAssessments();
}

// Synchronous helper for instant render
export function getAllAssessments() {
  return getLocalAssessments();
}

// Save assessment to API & local cache
export async function saveAssessmentRecord(assessment) {
  const dataToSave = {
    ...assessment,
    id: assessment.id || 'hero_' + Date.now(),
    updatedAt: new Date().toISOString()
  };

  // Immediate local update for instant reactivity
  const list = getLocalAssessments();
  const existingIndex = list.findIndex(item => item.id === dataToSave.id);
  if (existingIndex >= 0) {
    list[existingIndex] = dataToSave;
  } else {
    list.push(dataToSave);
  }
  setLocalAssessments(list);

  // Sync to backend API
  try {
    const res = await fetch(`${API_BASE}/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(dataToSave)
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return { success: true, item: json.data };
      }
    }
  } catch {
    // Backend offline, local save was already completed
  }

  return { success: true, item: dataToSave };
}

// Delete assessment
export async function deleteAssessmentRecord(id) {
  // Immediate local delete
  const list = getLocalAssessments();
  const filtered = list.filter(item => item.id !== id);
  setLocalAssessments(filtered);

  // Sync delete to backend API
  try {
    await fetch(`${API_BASE}/assessments/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
  } catch {
    // Handled locally
  }

  return true;
}

export function exportAssessmentsToCSV() {
  const list = getLocalAssessments();
  if (list.length === 0) return null;

  const headers = [
    'No',
    'Nama Pegawai / Penggerak',
    'NIP',
    'Unit / Bidang',
    'Kategori',
    'Nama Program',
    'Lokasi',
    'Pilar TJSL',
    'SDGs',
    'Status Administrasi',
    'Catatan Verifikator Administrasi',
    'Skor Portofolio (50%)',
    'Skor Wawancara (50%)',
    'Nilai Tambah',
    'Nilai Akhir',
    'Predikat',
    'Rekomendasi Juri',
    'Nama Juri',
    'Unsur Juri',
    'Tanggal Penilaian'
  ];

  const rows = list.map((item, index) => {
    const computed = computeAssessment(item);
    return [
      index + 1,
      `"${(item.ident?.nama || item.ident?.komunitas || '-').replace(/"/g, '""')}"`,
      `"${(item.ident?.nip || '-').replace(/"/g, '""')}"`,
      `"${(item.ident?.unit || '-').replace(/"/g, '""')}"`,
      `"${item.ident?.kategori || 'Individu'}"`,
      `"${(item.ident?.program || '-').replace(/"/g, '""')}"`,
      `"${(item.ident?.lokasi || '-').replace(/"/g, '""')}"`,
      `"${item.ident?.pilar || '-'}"`,
      `"${(item.ident?.sdgs || '-').replace(/"/g, '""')}"`,
      computed.adminStatus === 'ok' ? 'Lolos' : (computed.adminStatus === 'fail' ? 'Gugur' : 'Belum Lengkap'),
      `"${(item.catatanAdmin || '-').replace(/"/g, '""')}"`,
      formatScore(computed.stageScores.porto),
      formatScore(computed.stageScores.final),
      `+${computed.bonusTotal}`,
      formatScore(computed.finalScore),
      `"${computed.predicate}"`,
      `"${(item.rekomendasi || '-').replace(/"/g, '""')}"`,
      `"${(item.juri || '-').replace(/"/g, '""')}"`,
      `"${(item.unsur || '-').replace(/"/g, '""')}"`,
      item.tanggal || '-'
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  return csvContent;
}
