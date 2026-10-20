import { UserModel, verifyPassword, generateToken } from '../models/userModel.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';

function normalizeRole(role) {
  const roleMap = {
    pendaftar: 'pendaftar',
    peserta: 'pendaftar',
    penilai: 'penilai',
    juri: 'penilai',
    admin: 'admin',
    panitia: 'admin'
  };
  return roleMap[role] || 'pendaftar';
}

export const authController = {
  register: async (req, res) => {
    try {
      const { nama, email, password, role, nip } = req.body || {};

      if (!nama || !nama.trim()) {
        return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
      }
      if (!email || !email.trim()) {
        return res.status(400).json({ success: false, message: 'Alamat email wajib diisi.' });
      }
      if (!password || password.length < 8) {
        return res.status(400).json({ success: false, message: 'Kata sandi minimal 8 karakter.' });
      }
      if (!/[A-Z]/.test(password)) {
        return res.status(400).json({ success: false, message: 'Kata sandi wajib mengandung minimal 1 huruf kapital (A-Z).' });
      }
      if (!/[0-9]/.test(password)) {
        return res.status(400).json({ success: false, message: 'Kata sandi wajib mengandung minimal 1 angka (0-9).' });
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        return res.status(400).json({ success: false, message: 'Kata sandi wajib mengandung minimal 1 karakter simbol khusus (!@#$%^&* dsb).' });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Alamat email sudah terdaftar. Silakan masuk.' });
      }

      // Pendaftaran publik otomatis mendaftar sebagai peserta/pendaftar (juri hanya dibuat oleh admin)
      const userRole = 'pendaftar';

      const result = await UserModel.create({
        nama,
        email,
        nip: nip || '',
        role: userRole,
        password
      });

      return res.status(201).json({
        success: true,
        message: 'Pendaftaran akun berhasil.',
        data: result
      });
    } catch (err) {
      console.error('[authController.register] Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal mendaftarkan akun: ' + err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email dan kata sandi wajib diisi.' });
      }

      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak sesuai.' });
      }

      const isValid = verifyPassword(password, user.password_hash, user.salt);
      if (!isValid) {
        return res.status(401).json({ success: false, message: 'Email atau kata sandi tidak sesuai.' });
      }

      const token = generateToken();
      await UserModel.updateToken(user.id, token);

      const safeUser = {
        id: user.id,
        nama: user.nama,
        email: user.email,
        nip: user.nip || '',
        role: normalizeRole(user.role)
      };

      loginLimiter.reset(req);

      return res.status(200).json({
        success: true,
        message: 'Login berhasil.',
        data: {
          user: safeUser,
          token
        }
      });
    } catch (err) {
      console.error('[authController.login] Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal memproses login: ' + err.message });
    }
  },

  me: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (req.query.token || '');

      if (!token) {
        return res.status(401).json({ success: false, message: 'Token otentikasi tidak ditemukan.' });
      }

      const user = await UserModel.findByToken(token);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Sesi tidak valid atau telah berakhir.' });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: {
            ...user,
            role: normalizeRole(user.role)
          }
        }
      });
    } catch (err) {
      console.error('[authController.me] Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal mengambil data profil: ' + err.message });
    }
  },

  logout: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (req.body?.token || '');

      if (token) {
        const user = await UserModel.findByToken(token);
        if (user) {
          await UserModel.updateToken(user.id, null);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Berhasil keluar (logout).'
      });
    } catch (err) {
      console.error('[authController.logout] Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal logout: ' + err.message });
    }
  },

  getUsers: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const requester = await UserModel.findByToken(token);

      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus Admin.' });
      }

      const users = await UserModel.getAllUsers();
      return res.status(200).json({ success: true, data: users });
    } catch (err) {
      console.error('[authController.getUsers] Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal mengambil daftar pengguna: ' + err.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const requester = await UserModel.findByToken(token);

      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus Admin.' });
      }

      const { nama, email, nip, role, password } = req.body || {};
      if (!nama || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nama, email, dan kata sandi wajib diisi.' });
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });
      }

      const validRole = ['admin', 'penilai', 'pendaftar'].includes(role) ? role : 'penilai';
      const created = await UserModel.create({
        nama,
        email,
        nip: nip || '',
        role: validRole,
        password
      });

      return res.status(201).json({
        success: true,
        message: `Pengguna dengan peran ${validRole} berhasil dibuat.`,
        data: created.user
      });
    } catch (err) {
      console.error('[authController.createUser] Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal membuat pengguna: ' + err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const requester = await UserModel.findByToken(token);

      if (!requester || requester.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Akses ditolak. Khusus Admin.' });
      }

      const targetId = req.params.id;
      if (requester.id === targetId) {
        return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun Anda sendiri.' });
      }

      const deleted = await UserModel.deleteUser(targetId);
      return res.status(200).json({ success: true, message: deleted ? 'Pengguna berhasil dihapus.' : 'Pengguna tidak ditemukan.' });
    } catch (err) {
      console.error('[authController.deleteUser] Error:', err);
      return res.status(500).json({ success: false, message: 'Gagal menghapus pengguna: ' + err.message });
    }
  }
};
