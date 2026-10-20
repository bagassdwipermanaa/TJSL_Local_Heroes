import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, getPool } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Generate standard, 100% valid PDF-1.4 file with exact object byte offsets
function createValidPdf(title, subtitle, note = 'Dokumen berkas resmi terverifikasi Program TJSL Local Heroes PLN ES.') {
  const header = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  
  // PDF stream with title, subtitle, and verification text
  const cleanTitle = title.replace(/[()\\]/g, '');
  const cleanSubtitle = subtitle.replace(/[()\\]/g, '');
  const cleanNote = note.replace(/[()\\]/g, '');

  const streamContent = `BT
/F1 18 Tf
50 750 Td
(${cleanTitle}) Tj
0 -32 Td
/F1 12 Tf
(${cleanSubtitle}) Tj
0 -26 Td
/F1 10 Tf
(${cleanNote}) Tj
0 -20 Td
(Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}) Tj
ET`;

  const streamLen = Buffer.byteLength(streamContent, 'latin1');

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n';
  const obj4 = '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n';
  const obj5 = `5 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

  const objs = [obj1, obj2, obj3, obj4, obj5];
  let curr = Buffer.byteLength(header, 'latin1');
  const offsets = [0];
  for (const obj of objs) {
    offsets.push(curr);
    curr += Buffer.byteLength(obj, 'latin1');
  }

  const xrefOffset = curr;
  let xref = 'xref\r\n0 6\r\n0000000000 65535 f \r\n';
  for (let i = 1; i <= 5; i++) {
    xref += String(offsets[i]).padStart(10, '0') + ' 00000 n \r\n';
  }

  const trailer = `trailer\r\n<< /Size 6 /Root 1 0 R >>\r\nstartxref\r\n${xrefOffset}\r\n%%EOF\r\n`;

  return Buffer.from(header + objs.join('') + xref + trailer, 'latin1');
}

// Valid minimal 1x1 JPEG buffer
const validJpeg = Buffer.from('/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=', 'base64');

const sampleFiles = [
  { name: 'rekom-agi.pdf', title: 'Surat Rekomendasi Pimpinan Unit', sub: 'Peserta: Agi (NIP: 8408189Z) - Unit Layanan Kantor Pusat' },
  { name: 'logbook-agi.pdf', title: 'Logbook Pelaksanaan Inisiatif', sub: 'Inisiator: Agi - Program Lingkungan & Edukasi Kelistrikan' },
  { name: 'rekomendasi-ahmad.pdf', title: 'Surat Rekomendasi Pimpinan Unit', sub: 'Peserta: Ahmad Fauzi (NIP: 8812345Z)' },
  { name: 'logbook-ahmad.pdf', title: 'Catatan Logbook Inisiatif Kopi', sub: 'Inisiator: Ahmad Fauzi' },
  { name: 'rekom-siti.pdf', title: 'Surat Rekomendasi Pimpinan Unit', sub: 'Peserta: Siti Rahmawati (NIP: 9215678Z)' },
  { name: 'logbook-siti.pdf', title: 'Catatan Logbook Sentra Nelayan', sub: 'Inisiator: Siti Rahmawati' },
  { name: 'rekom-budi.pdf', title: 'Surat Rekomendasi Koordinator Wilayah', sub: 'Peserta: Budi Pratama (NIP: TAD-2023-0042)' },
  { name: 'logbook-budi.pdf', title: 'Catatan Logbook Bank Jelantah', sub: 'Inisiator: Budi Pratama' }
];

const imgFiles = ['dok-agi.jpg', 'dok-ahmad.jpg', 'dok-siti.jpg', 'dok-budi.jpg'];

for (const s of sampleFiles) {
  fs.writeFileSync(path.join(uploadDir, s.name), createValidPdf(s.title, s.sub));
}

for (const img of imgFiles) {
  fs.writeFileSync(path.join(uploadDir, img), validJpeg);
}

console.log('Valid sample PDF and JPG files generated successfully in:', uploadDir);

// Update database & registrations.json with explicit url field
async function syncUrls() {
  const jsonPath = path.resolve(__dirname, 'data/registrations.json');
  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      for (const reg of data) {
        if (reg.files) {
          for (const key of Object.keys(reg.files)) {
            if (Array.isArray(reg.files[key])) {
              reg.files[key] = reg.files[key].map(f => ({
                ...f,
                url: f.url || (f.filename ? `/uploads/${f.filename}` : '')
              }));
            }
          }
        }
      }
      fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      console.log('data/registrations.json updated with url fields.');
    } catch (e) {
      console.warn('Failed updating json:', e.message);
    }
  }

  await initDatabase();
  const pool = getPool();
  if (pool) {
    try {
      const [rows] = await pool.query('SELECT id, files FROM registrations');
      for (const row of rows) {
        let files = typeof row.files === 'string' ? JSON.parse(row.files) : row.files;
        if (files) {
          let changed = false;
          for (const key of Object.keys(files)) {
            if (Array.isArray(files[key])) {
              files[key] = files[key].map(f => {
                if (!f.url && f.filename) {
                  changed = true;
                  return { ...f, url: `/uploads/${f.filename}` };
                }
                return f;
              });
            }
          }
          if (changed) {
            await pool.query('UPDATE registrations SET files = ? WHERE id = ?', [JSON.stringify(files), row.id]);
          }
        }
      }
      console.log('MySQL registrations table updated with explicit url fields.');
    } catch (err) {
      console.warn('MySQL update warning:', err.message);
    }
  }
}

syncUrls().then(() => {
  console.log('Done.');
  process.exit(0);
});
