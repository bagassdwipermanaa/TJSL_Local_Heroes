import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/index.js';
import { getPool, isDbConnected } from '../config/database.js';

function ensureDataFile() {
  const dir = path.dirname(config.userDataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(config.userDataFile)) {
    fs.writeFileSync(config.userDataFile, JSON.stringify([], null, 2), 'utf-8');
  }
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  try {
    const testHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(testHash, 'hex'));
  } catch {
    return false;
  }
}

export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, salt, ...safeUser } = user;
  return safeUser;
}

export const UserModel = {
  findByEmail: async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
        if (rows.length > 0) return rows[0];
      } catch (err) {
        console.warn('[UserModel] DB Error findByEmail, falling back to JSON:', err.message);
      }
    }

    ensureDataFile();
    const data = JSON.parse(fs.readFileSync(config.userDataFile, 'utf-8'));
    return data.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  },

  findById: async (id) => {
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
        if (rows.length > 0) return sanitizeUser(rows[0]);
      } catch (err) {
        console.warn('[UserModel] DB Error findById, falling back to JSON:', err.message);
      }
    }

    ensureDataFile();
    const data = JSON.parse(fs.readFileSync(config.userDataFile, 'utf-8'));
    const user = data.find((u) => u.id === id);
    return sanitizeUser(user);
  },

  findByToken: async (token) => {
    if (!token) return null;
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT * FROM users WHERE token = ? LIMIT 1', [token]);
        if (rows.length > 0) return sanitizeUser(rows[0]);
      } catch (err) {
        console.warn('[UserModel] DB Error findByToken, falling back to JSON:', err.message);
      }
    }

    ensureDataFile();
    const data = JSON.parse(fs.readFileSync(config.userDataFile, 'utf-8'));
    const user = data.find((u) => u.token === token);
    return sanitizeUser(user);
  },

  create: async ({ nama, email, nip = '', role = 'pendaftar', password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const id = 'usr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const { hash, salt } = hashPassword(password);
    const token = generateToken();
    const now = new Date().toISOString();

    const userObj = {
      id,
      nama: nama.trim(),
      email: cleanEmail,
      nip: (nip || '').trim(),
      role: role || 'pendaftar',
      password_hash: hash,
      salt,
      token,
      created_at: now,
      updated_at: now
    };

    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query(
          `INSERT INTO users (id, nama, email, nip, role, password_hash, salt, token)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, userObj.nama, userObj.email, userObj.nip, userObj.role, userObj.password_hash, userObj.salt, userObj.token]
        );
        return { user: sanitizeUser(userObj), token };
      } catch (err) {
        console.warn('[UserModel] DB Error create, falling back to JSON:', err.message);
      }
    }

    ensureDataFile();
    const data = JSON.parse(fs.readFileSync(config.userDataFile, 'utf-8'));
    data.push(userObj);
    fs.writeFileSync(config.userDataFile, JSON.stringify(data, null, 2), 'utf-8');

    return { user: sanitizeUser(userObj), token };
  },

  updateToken: async (id, token) => {
    if (isDbConnected()) {
      try {
        const pool = getPool();
        await pool.query('UPDATE users SET token = ? WHERE id = ?', [token, id]);
        return;
      } catch (err) {
        console.warn('[UserModel] DB Error updateToken, falling back to JSON:', err.message);
      }
    }

    ensureDataFile();
    const data = JSON.parse(fs.readFileSync(config.userDataFile, 'utf-8'));
    const idx = data.findIndex((u) => u.id === id);
    if (idx !== -1) {
      data[idx].token = token;
      fs.writeFileSync(config.userDataFile, JSON.stringify(data, null, 2), 'utf-8');
    }
  },

  getAllUsers: async () => {
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [rows] = await pool.query('SELECT id, nama, email, nip, role, created_at FROM users ORDER BY created_at DESC');
        return rows;
      } catch (err) {
        console.warn('[UserModel] DB Error getAllUsers, falling back to JSON:', err.message);
      }
    }

    ensureDataFile();
    const data = JSON.parse(fs.readFileSync(config.userDataFile, 'utf-8'));
    return data.map(sanitizeUser);
  },

  deleteUser: async (id) => {
    if (isDbConnected()) {
      try {
        const pool = getPool();
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
        return result.affectedRows > 0;
      } catch (err) {
        console.warn('[UserModel] DB Error deleteUser, falling back to JSON:', err.message);
      }
    }

    ensureDataFile();
    const data = JSON.parse(fs.readFileSync(config.userDataFile, 'utf-8'));
    const next = data.filter((u) => u.id !== id);
    const deleted = next.length !== data.length;
    fs.writeFileSync(config.userDataFile, JSON.stringify(next, null, 2), 'utf-8');
    return deleted;
  }
};
