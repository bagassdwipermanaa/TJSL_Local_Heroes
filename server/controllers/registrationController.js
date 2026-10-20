import { RegistrationService } from '../services/registrationService.js';

export const RegistrationController = {
  getRegistrations: async (req, res) => {
    try {
      const data = await RegistrationService.getAll();
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getRegistrationById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await RegistrationService.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan.' });
      }
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  saveRegistration: async (req, res) => {
    try {
      const saved = await RegistrationService.upsert(req.body);
      return res.status(200).json({ success: true, data: saved });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  updateReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewStatus, reviewNotes } = req.body;
      const updated = await RegistrationService.updateReview(id, reviewStatus, reviewNotes);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan.' });
      }
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  deleteRegistration: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await RegistrationService.remove(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan.' });
      }
      return res.status(200).json({ success: true, message: 'Pendaftaran berhasil dihapus.' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getStats: async (req, res) => {
    try {
      const stats = await RegistrationService.getStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
