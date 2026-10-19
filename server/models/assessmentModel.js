import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';
import { getPool, isDbConnected } from '../config/database.js';

function ensureDataFile() {
  const dir = path.dirname(config.dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(config.dataFile)) {
    fs.writeFileSync(config.dataFile, JSON.stringify([], null, 2), 'utf-8');
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

function rowToAssessment(row) {
  return {
    id: row.id,
    ident: {
      nama: row.nama || '',
      nip: row.nip || '',
      unit: row.unit || '',
      komunitas: row.komunitas || '',
      kategori: row.kategori || 'Individu',
      program: row.program || '',
      lokasi: row.lokasi || '',
      mulai: row.mulai || '',
      penerima: row.penerima ?? '',
      sdgs: row.sdgs || '',
      pilar: row.pilar || 'Sosial'
    },
    admin: parseJSON(row.admin, []),
    scores: parseJSON(row.scores, { porto: Array(7).fill(null), lapangan: Array(7).fill(null), final: Array(7).fill(null) }),
    notes: parseJSON(row.notes, { porto: Array(7).fill(''), lapangan: Array(7).fill(''), final: Array(7).fill('') }),
    bonus: parseJSON(row.bonus, Array(4).fill(false)),
    adminFiles: parseJSON(row.admin_files, {}),
    proposalFile: parseJSON(row.proposal_file, null),
    catatanAdmin: row.catatan_admin || '',
    kekuatan: row.kekuatan || '',
    perbaikan: row.perbaikan || '',
    rekomendasi: row.rekomendasi || '',
    juri: row.juri || '',
    unsur: row.unsur || '',
    tanggal: row.tanggal || '',
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
  };
}

export const AssessmentModel = {
  findAll: async () => {
    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM assessments ORDER BY updated_at DESC');
        return rows.map(rowToAssessment);
      } catch (err) {
        console.error('MySQL findAll error, falling back to JSON:', err.message);
      }
    }

    // JSON fallback
    ensureDataFile();
    try {
      const content = fs.readFileSync(config.dataFile, 'utf-8');
      return JSON.parse(content || '[]');
    } catch {
      return [];
    }
  },

  findById: async (id) => {
    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        const [rows] = await pool.query('SELECT * FROM assessments WHERE id = ? LIMIT 1', [id]);
        if (rows.length > 0) {
          return rowToAssessment(rows[0]);
        }
        return null;
      } catch (err) {
        console.error('MySQL findById error:', err.message);
      }
    }

    const list = await AssessmentModel.findAll();
    return list.find(item => item.id === id) || null;
  },

  save: async (assessment) => {
    const id = assessment.id || 'hero_' + Date.now();
    const ident = assessment.ident || {};
    const updatedAt = new Date().toISOString();

    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        const sql = `
          INSERT INTO assessments (
            id, nama, nip, unit, komunitas, kategori, program, lokasi, mulai, penerima,
            sdgs, pilar, admin, scores, notes, bonus, admin_files, proposal_file,
            catatan_admin, kekuatan, perbaikan, rekomendasi, juri, unsur, tanggal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            nama = VALUES(nama),
            nip = VALUES(nip),
            unit = VALUES(unit),
            komunitas = VALUES(komunitas),
            kategori = VALUES(kategori),
            program = VALUES(program),
            lokasi = VALUES(lokasi),
            mulai = VALUES(mulai),
            penerima = VALUES(penerima),
            sdgs = VALUES(sdgs),
            pilar = VALUES(pilar),
            admin = VALUES(admin),
            scores = VALUES(scores),
            notes = VALUES(notes),
            bonus = VALUES(bonus),
            admin_files = VALUES(admin_files),
            proposal_file = VALUES(proposal_file),
            catatan_admin = VALUES(catatan_admin),
            kekuatan = VALUES(kekuatan),
            perbaikan = VALUES(perbaikan),
            rekomendasi = VALUES(rekomendasi),
            juri = VALUES(juri),
            unsur = VALUES(unsur),
            tanggal = VALUES(tanggal),
            updated_at = CURRENT_TIMESTAMP
        `;

        const values = [
          id,
          ident.nama || '',
          ident.nip || '',
          ident.unit || '',
          ident.komunitas || '',
          ident.kategori || 'Individu',
          ident.program || '',
          ident.lokasi || '',
          ident.mulai || '',
          parseInt(ident.penerima, 10) || 0,
          ident.sdgs || '',
          ident.pilar || 'Sosial',
          JSON.stringify(assessment.admin || []),
          JSON.stringify(assessment.scores || {}),
          JSON.stringify(assessment.notes || {}),
          JSON.stringify(assessment.bonus || []),
          JSON.stringify(assessment.adminFiles || {}),
          JSON.stringify(assessment.proposalFile || null),
          assessment.catatanAdmin || '',
          assessment.kekuatan || '',
          assessment.perbaikan || '',
          assessment.rekomendasi || '',
          assessment.juri || '',
          assessment.unsur || '',
          assessment.tanggal || null
        ];

        await pool.query(sql, values);
      } catch (err) {
        console.error('MySQL save error, syncing to JSON file:', err.message);
      }
    }

    // Also sync to JSON file as reliable local backup
    ensureDataFile();
    const list = await AssessmentModel.findAll();
    const toSave = {
      ...assessment,
      id,
      updatedAt
    };
    const idx = list.findIndex(item => item.id === toSave.id);
    if (idx >= 0) {
      list[idx] = toSave;
    } else {
      list.push(toSave);
    }
    fs.writeFileSync(config.dataFile, JSON.stringify(list, null, 2), 'utf-8');

    return toSave;
  },

  deleteById: async (id) => {
    let deleted = false;
    const pool = getPool();
    if (isDbConnected() && pool) {
      try {
        const [result] = await pool.query('DELETE FROM assessments WHERE id = ?', [id]);
        deleted = result.affectedRows > 0;
      } catch (err) {
        console.error('MySQL delete error:', err.message);
      }
    }

    // Delete from JSON file
    ensureDataFile();
    try {
      const list = JSON.parse(fs.readFileSync(config.dataFile, 'utf-8') || '[]');
      const filtered = list.filter(item => item.id !== id);
      if (filtered.length !== list.length) {
        deleted = true;
        fs.writeFileSync(config.dataFile, JSON.stringify(filtered, null, 2), 'utf-8');
      }
    } catch {
      // Ignore
    }

    return deleted;
  }
};
