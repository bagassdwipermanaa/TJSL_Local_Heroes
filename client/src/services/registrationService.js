import { API_BASE_URL } from '../config';
import { REGISTRATION_DOCS, REGISTRATION_DECLARATIONS } from '../constants/registrationConstants';

const LOCAL_DRAFT_KEY = 'tjsl-reg-draft-v1';
const LOCAL_REGISTRATIONS_KEY = 'tjsl_local_heroes_registrations_v1';

export function createBlankRegistration() {
  return {
    id: `REG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    data: {
      nama: '',
      statuspeg: 'Pegawai',
      nip: '',
      jabatan: '',
      unit: '',
      email: '',
      hp: '',
      atasan: '',
      kategori: 'Individu',
      komunitas: '',
      anggota: '',
      program: '',
      desa: '',
      kecamatan: '',
      kabkota: '',
      provinsi: '',
      mulai: '',
      frekuensi: 'Mingguan',
      pilar: 'Sosial',
      penerima: '',
      masalah: '',
      kegiatan: '',
      peran: '',
      dampak: '',
      keberlanjutan: '',
      inovasi: '',
      mitra: ''
    },
    sdgs: [],
    files: {},
    links: {},
    decl: Array(REGISTRATION_DECLARATIONS.length).fill(false),
    status: 'draft',
    reviewStatus: 'baru',
    reviewNotes: '',
    submittedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function calculateMonthsSince(monthStr) {
  if (!monthStr) return null;
  const [y, m] = monthStr.split('-').map(Number);
  if (!y || !m) return null;
  const now = new Date();
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
}

export function checkRegistrationCompleteness(reg) {
  const d = reg?.data || {};
  const isKomunitas = d.kategori === 'Komunitas';

  // Section 1: Pengusul
  const secPengusul = Boolean(
    d.nama?.trim() &&
    d.statuspeg?.trim() &&
    d.nip?.trim() &&
    d.jabatan?.trim() &&
    d.unit?.trim() &&
    d.email?.trim() &&
    d.hp?.trim() &&
    d.atasan?.trim() &&
    (!isKomunitas || d.komunitas?.trim())
  );

  // Section 2: Program
  const months = calculateMonthsSince(d.mulai);
  const secProgram = Boolean(
    d.program?.trim() &&
    d.desa?.trim() &&
    d.kecamatan?.trim() &&
    d.kabkota?.trim() &&
    d.provinsi?.trim() &&
    d.mulai?.trim() &&
    months != null && months >= 6 &&
    d.frekuensi?.trim() &&
    d.pilar?.trim() &&
    String(d.penerima || '').trim() &&
    (reg.sdgs || []).length > 0
  );

  // Section 3: Uraian Kegiatan
  const secUraian = Boolean(
    d.masalah?.trim() &&
    d.kegiatan?.trim() &&
    d.peran?.trim() &&
    d.dampak?.trim() &&
    d.keberlanjutan?.trim()
  );

  // Section 4: Dokumen Pendukung
  const files = reg?.files || {};
  const links = reg?.links || {};
  const secDokumen = REGISTRATION_DOCS.every(doc => {
    if (!doc.required) return true;
    const hasFile = Array.isArray(files[doc.key]) && files[doc.key].length > 0;
    const hasLink = Boolean(links[doc.key]?.trim());
    return hasFile || hasLink;
  });

  // Section 5: Pernyataan
  const declList = reg?.decl || [];
  const secPernyataan = declList.length === 5 && declList.every(Boolean);

  const sections = {
    pengusul: secPengusul,
    program: secProgram,
    uraian: secUraian,
    dokumen: secDokumen,
    pernyataan: secPernyataan
  };

  const isReady = Object.values(sections).every(Boolean);

  return {
    sections,
    isReady,
    months,
    completedCount: Object.values(sections).filter(Boolean).length,
    totalCount: 5
  };
}

export function getLocalDraft() {
  try {
    const raw = localStorage.getItem(LOCAL_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalDraft(regData) {
  try {
    const copy = { ...regData, updatedAt: new Date().toISOString() };
    localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify(copy));
    return true;
  } catch {
    return false;
  }
}

export function clearLocalDraft() {
  try {
    localStorage.removeItem(LOCAL_DRAFT_KEY);
    return true;
  } catch {
    return false;
  }
}

function getStoredLocalList() {
  try {
    const raw = localStorage.getItem(LOCAL_REGISTRATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredLocalList(list) {
  try {
    localStorage.setItem(LOCAL_REGISTRATIONS_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export async function fetchAllRegistrations() {
  try {
    const res = await fetch(`${API_BASE_URL}/registrations`);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        saveStoredLocalList(json.data);
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[RegistrationService] Server unreachable, using local storage cache:', err.message);
  }
  return getStoredLocalList();
}

export async function saveRegistrationToServer(regData) {
  // Save local draft copy first
  saveLocalDraft(regData);

  try {
    const res = await fetch(`${API_BASE_URL}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData)
    });

    if (res.ok) {
      const json = await res.json();
      const saved = json.data;

      // Update local storage cache
      const list = getStoredLocalList();
      const idx = list.findIndex(r => r.id === saved.id);
      if (idx >= 0) list[idx] = saved;
      else list.unshift(saved);
      saveStoredLocalList(list);

      return saved;
    }
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.message || 'Gagal menyimpan pendaftaran ke server.');
  } catch (err) {
    console.warn('[RegistrationService] Server failed, saving to local list:', err.message);
    const list = getStoredLocalList();
    const idx = list.findIndex(r => r.id === regData.id);
    if (idx >= 0) list[idx] = regData;
    else list.unshift(regData);
    saveStoredLocalList(list);
    return regData;
  }
}

export async function updateRegistrationReview(id, reviewStatus, reviewNotes) {
  try {
    const res = await fetch(`${API_BASE_URL}/registrations/${id}/review`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewStatus, reviewNotes })
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[RegistrationService] Server review update failed:', err.message);
  }

  // Fallback to local
  const list = getStoredLocalList();
  const target = list.find(r => r.id === id);
  if (target) {
    target.reviewStatus = reviewStatus;
    target.reviewNotes = reviewNotes || '';
    target.updatedAt = new Date().toISOString();
    saveStoredLocalList(list);
    return target;
  }
  return null;
}

export async function deleteRegistrationRecord(id) {
  try {
    await fetch(`${API_BASE_URL}/registrations/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[RegistrationService] Server delete failed:', err.message);
  }
  const list = getStoredLocalList().filter(r => r.id !== id);
  saveStoredLocalList(list);
  return true;
}
