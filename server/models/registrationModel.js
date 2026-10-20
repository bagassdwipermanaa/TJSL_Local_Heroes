import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { getPool, isDbConnected } from '../config/database.js';

function ensureDataFile() {
  const dir = path.dirname(config.registrationDataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(config.registrationDataFile)) {
    fs.writeFileSync(config.registrationDataFile, JSON.stringify([], null, 2), 'utf-8');
  }
}

function parseJSON(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function rowToRegistration(row) {
  return {
    id: row.id,
    data: {
      nama: row.nama || '',
      statuspeg: row.statuspeg || 'Pegawai',
      nip: row.nip || '',
      jabatan: row.jabatan || '',
      unit: row.unit || '',
      email: row.email || '',
      hp: row.hp || '',
      atasan: row.atasan || '',
      kategori: row.kategori || 'Individu',
      komunitas: row.komunitas || '',
      anggota: row.anggota || '',
      program: row.program || '',
      desa: row.desa || '',
      kecamatan: row.kecamatan || '',
      kabkota: row.kabkota || '',
      provinsi: row.provinsi || '',
      mulai: row.mulai || '',
      frekuensi: row.frekuensi || 'Mingguan',
      pilar: row.pilar || 'Sosial',
      penerima: row.penerima ?? '',
      masalah: row.masalah || '',
      kegiatan: row.kegiatan || '',
      peran: row.peran || '',
      dampak: row.dampak || '',
      keberlanjutan: row.keberlanjutan || '',
      inovasi: row.inovasi || '',
      mitra: row.mitra || ''
    },
    sdgs: parseJSON(row.sdgs, []),
    files: parseJSON(row.files, {}),
    links: parseJSON(row.links, {}),
    decl: parseJSON(row.decl, Array(5).fill(false)),
    status: row.status || 'draft',
    reviewStatus: row.review_status || 'baru',
    reviewNotes: row.review_notes || '',
    submittedAt: row.submitted_at || null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

export const RegistrationModel = {
  findAll: async () => {
    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM registrations ORDER BY updated_at DESC');
        return rows.map(rowToRegistration);
      } catch (err) {
        console.warn(`[Database] Gagal query MySQL registrations (${err.message}). Menggunakan berkas JSON cadangan.`);
      }
    }

    ensureDataFile();
    try {
      const content = fs.readFileSync(config.registrationDataFile, 'utf-8');
      return JSON.parse(content || '[]');
    } catch {
      return [];
    }
  },

  findById: async (id) => {
    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM registrations WHERE id = ? LIMIT 1', [id]);
        if (rows.length > 0) {
          return rowToRegistration(rows[0]);
        }
        return null;
      } catch (err) {
        console.warn(`[Database] Gagal query MySQL registrations (${err.message}). Menggunakan berkas JSON cadangan.`);
      }
    }

    ensureDataFile();
    const content = fs.readFileSync(config.registrationDataFile, 'utf-8');
    const list = JSON.parse(content || '[]');
    return list.find((item) => item.id === id) || null;
  },

  save: async (reg) => {
    const id = reg.id || `REG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const d = reg.data || {};
    const nowIso = new Date().toISOString();
    const status = reg.status || 'draft';
    const submittedAt = status === 'terkirim' ? (reg.submittedAt || nowIso) : (reg.submittedAt || null);

    const record = {
      id,
      nama: d.nama || '',
      statuspeg: d.statuspeg || 'Pegawai',
      nip: d.nip || '',
      jabatan: d.jabatan || '',
      unit: d.unit || '',
      email: d.email || '',
      hp: d.hp || '',
      atasan: d.atasan || '',
      kategori: d.kategori || 'Individu',
      komunitas: d.komunitas || '',
      anggota: parseInt(d.anggota, 10) || 0,
      program: d.program || '',
      desa: d.desa || '',
      kecamatan: d.kecamatan || '',
      kabkota: d.kabkota || '',
      provinsi: d.provinsi || '',
      mulai: d.mulai || '',
      frekuensi: d.frekuensi || 'Mingguan',
      pilar: d.pilar || 'Sosial',
      penerima: parseInt(d.penerima, 10) || 0,
      sdgs: JSON.stringify(reg.sdgs || []),
      masalah: d.masalah || '',
      kegiatan: d.kegiatan || '',
      peran: d.peran || '',
      dampak: d.dampak || '',
      keberlanjutan: d.keberlanjutan || '',
      inovasi: d.inovasi || '',
      mitra: d.mitra || '',
      files: JSON.stringify(reg.files || {}),
      links: JSON.stringify(reg.links || {}),
      decl: JSON.stringify(reg.decl || Array(5).fill(false)),
      status,
      review_status: reg.reviewStatus || 'baru',
      review_notes: reg.reviewNotes || '',
      submitted_at: submittedAt
    };

    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        const query = `
          INSERT INTO registrations (
            id, nama, statuspeg, nip, jabatan, unit, email, hp, atasan,
            kategori, komunitas, anggota, program, desa, kecamatan, kabkota, provinsi,
            mulai, frekuensi, pilar, penerima, sdgs, masalah, kegiatan, peran, dampak,
            keberlanjutan, inovasi, mitra, files, links, decl, status, review_status,
            review_notes, submitted_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            nama = VALUES(nama),
            statuspeg = VALUES(statuspeg),
            nip = VALUES(nip),
            jabatan = VALUES(jabatan),
            unit = VALUES(unit),
            email = VALUES(email),
            hp = VALUES(hp),
            atasan = VALUES(atasan),
            kategori = VALUES(kategori),
            komunitas = VALUES(komunitas),
            anggota = VALUES(anggota),
            program = VALUES(program),
            desa = VALUES(desa),
            kecamatan = VALUES(kecamatan),
            kabkota = VALUES(kabkota),
            provinsi = VALUES(provinsi),
            mulai = VALUES(mulai),
            frekuensi = VALUES(frekuensi),
            pilar = VALUES(pilar),
            penerima = VALUES(penerima),
            sdgs = VALUES(sdgs),
            masalah = VALUES(masalah),
            kegiatan = VALUES(kegiatan),
            peran = VALUES(peran),
            dampak = VALUES(dampak),
            keberlanjutan = VALUES(keberlanjutan),
            inovasi = VALUES(inovasi),
            mitra = VALUES(mitra),
            files = VALUES(files),
            links = VALUES(links),
            decl = VALUES(decl),
            status = VALUES(status),
            review_status = VALUES(review_status),
            review_notes = VALUES(review_notes),
            submitted_at = VALUES(submitted_at);
        `;

        await pool.query(query, [
          record.id, record.nama, record.statuspeg, record.nip, record.jabatan, record.unit,
          record.email, record.hp, record.atasan, record.kategori, record.komunitas, record.anggota,
          record.program, record.desa, record.kecamatan, record.kabkota, record.provinsi,
          record.mulai, record.frekuensi, record.pilar, record.penerima, record.sdgs,
          record.masalah, record.kegiatan, record.peran, record.dampak, record.keberlanjutan,
          record.inovasi, record.mitra, record.files, record.links, record.decl, record.status,
          record.review_status, record.review_notes, record.submitted_at
        ]);
      } catch (err) {
        console.warn(`[Database] Gagal upsert MySQL registrations (${err.message}). Menggunakan berkas JSON cadangan.`);
      }
    }

    // Always mirror to local file
    ensureDataFile();
    const content = fs.readFileSync(config.registrationDataFile, 'utf-8');
    let list = [];
    try {
      list = JSON.parse(content || '[]');
    } catch {
      list = [];
    }

    const savedPayload = {
      ...reg,
      id,
      status,
      submittedAt,
      updatedAt: nowIso
    };

    const idx = list.findIndex((item) => item.id === id);
    if (idx >= 0) {
      list[idx] = savedPayload;
    } else {
      list.unshift(savedPayload);
    }

    fs.writeFileSync(config.registrationDataFile, JSON.stringify(list, null, 2), 'utf-8');
    return savedPayload;
  },

  updateReview: async (id, reviewStatus, reviewNotes) => {
    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        await pool.query(
          'UPDATE registrations SET review_status = ?, review_notes = ? WHERE id = ?',
          [reviewStatus, reviewNotes || '', id]
        );
      } catch (err) {
        console.warn(`[Database] Gagal update review MySQL registrations (${err.message}).`);
      }
    }

    ensureDataFile();
    const content = fs.readFileSync(config.registrationDataFile, 'utf-8');
    let list = [];
    try {
      list = JSON.parse(content || '[]');
    } catch {
      list = [];
    }

    const target = list.find((item) => item.id === id);
    if (target) {
      target.reviewStatus = reviewStatus;
      target.reviewNotes = reviewNotes || '';
      target.updatedAt = new Date().toISOString();
      fs.writeFileSync(config.registrationDataFile, JSON.stringify(list, null, 2), 'utf-8');
      return target;
    }
    return null;
  },

  deleteById: async (id) => {
    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        await pool.query('DELETE FROM registrations WHERE id = ?', [id]);
      } catch (err) {
        console.warn(`[Database] Gagal delete MySQL registrations (${err.message}).`);
      }
    }

    ensureDataFile();
    const content = fs.readFileSync(config.registrationDataFile, 'utf-8');
    let list = [];
    try {
      list = JSON.parse(content || '[]');
    } catch {
      list = [];
    }

    const filtered = list.filter((item) => item.id !== id);
    if (filtered.length !== list.length) {
      fs.writeFileSync(config.registrationDataFile, JSON.stringify(filtered, null, 2), 'utf-8');
      return true;
    }
    return false;
  }
};
