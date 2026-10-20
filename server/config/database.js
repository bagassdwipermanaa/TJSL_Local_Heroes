import mysql from 'mysql2/promise';
import { config } from './index.js';

let pool = null;
let isConnected = false;

export async function initDatabase() {
  try {
    // 1. Try connecting to server to ensure database exists (optional, if user has permission)
    try {
      const rootConn = await mysql.createConnection({
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        port: config.db.port,
        connectTimeout: 5000
      });

      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\`;`);
      await rootConn.end();
    } catch (_dbCreateErr) {
      // Ignored if user lacks global/CREATE DATABASE privileges and connects directly to existing db
    }

    // 2. Create Connection Pool pointing to target database
    pool = mysql.createPool({
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 3. Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id VARCHAR(100) PRIMARY KEY,
        nama VARCHAR(255),
        nip VARCHAR(100),
        unit VARCHAR(255),
        komunitas VARCHAR(255),
        kategori VARCHAR(50) DEFAULT 'Individu',
        program VARCHAR(255),
        lokasi TEXT,
        mulai VARCHAR(50),
        penerima INT DEFAULT 0,
        sdgs VARCHAR(255),
        pilar VARCHAR(100),
        admin JSON,
        scores JSON,
        notes JSON,
        bonus JSON,
        admin_files JSON,
        proposal_file JSON,
        catatan_admin TEXT,
        kekuatan TEXT,
        perbaikan TEXT,
        rekomendasi VARCHAR(255),
        juri VARCHAR(255),
        unsur VARCHAR(255),
        tanggal VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Create registrations table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id VARCHAR(100) PRIMARY KEY,
        nama VARCHAR(255),
        statuspeg VARCHAR(50) DEFAULT 'Pegawai',
        nip VARCHAR(100),
        jabatan VARCHAR(255),
        unit VARCHAR(255),
        email VARCHAR(255),
        hp VARCHAR(100),
        atasan VARCHAR(255),
        kategori VARCHAR(50) DEFAULT 'Individu',
        komunitas VARCHAR(255),
        anggota INT DEFAULT 0,
        program VARCHAR(255),
        desa VARCHAR(255),
        kecamatan VARCHAR(255),
        kabkota VARCHAR(255),
        provinsi VARCHAR(255),
        mulai VARCHAR(50),
        frekuensi VARCHAR(100),
        pilar VARCHAR(100),
        penerima INT DEFAULT 0,
        sdgs JSON,
        masalah TEXT,
        kegiatan TEXT,
        peran TEXT,
        dampak TEXT,
        keberlanjutan TEXT,
        inovasi TEXT,
        mitra TEXT,
        files JSON,
        links JSON,
        decl JSON,
        status VARCHAR(50) DEFAULT 'draft',
        review_status VARCHAR(50) DEFAULT 'baru',
        review_notes TEXT,
        submitted_at VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 5. Create users table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        nama VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        nip VARCHAR(100),
        role VARCHAR(50) DEFAULT 'peserta',
        password_hash VARCHAR(255) NOT NULL,
        salt VARCHAR(100) NOT NULL,
        token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    isConnected = true;
    console.log(`[Database] Terhubung ke MySQL ${config.db.host}:${config.db.port}/${config.db.database}`);
    return pool;
  } catch (err) {
    isConnected = false;
    console.warn(`[Database] Peringatan: Tidak dapat terhubung ke MySQL (${err.message}). Menggunakan penyimpanan lokal file JSON sebagai cadangan.`);
    return null;
  }
}

export function getPool() {
  return pool;
}

export function isDbConnected() {
  return isConnected;
}
