import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, '../uploads');

export const UploadController = {
  uploadSingle: (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada berkas yang diunggah.'
      });
    }

    const fileData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    };

    return res.status(200).json({
      success: true,
      message: 'Berkas berhasil diunggah.',
      data: fileData
    });
  },

  uploadMultiple: (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada berkas yang diunggah.'
      });
    }

    const filesData = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/${file.filename}`
    }));

    return res.status(200).json({
      success: true,
      message: `${filesData.length} berkas berhasil diunggah.`,
      data: filesData
    });
  },

  deleteFile: (req, res) => {
    const { filename } = req.params;
    // Prevent path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadDir, safeFilename);

    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return res.status(200).json({
          success: true,
          message: 'Berkas berhasil dihapus dari server.'
        });
      } catch (err) {
        return res.status(500).json({
          success: false,
          message: 'Gagal menghapus berkas: ' + err.message
        });
      }
    }

    return res.status(404).json({
      success: false,
      message: 'Berkas tidak ditemukan.'
    });
  }
};
