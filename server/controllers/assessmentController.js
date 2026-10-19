import { AssessmentService } from '../services/assessmentService.js';

export const AssessmentController = {
  getAssessments: async (req, res) => {
    try {
      const data = await AssessmentService.getAll();
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getAssessmentById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await AssessmentService.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Data peserta tidak ditemukan' });
      }
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  saveAssessment: async (req, res) => {
    try {
      const saved = await AssessmentService.upsert(req.body);
      return res.status(200).json({ success: true, data: saved });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  },

  deleteAssessment: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await AssessmentService.remove(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Data peserta tidak ditemukan' });
      }
      return res.status(200).json({ success: true, message: 'Data berhasil dihapus' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  },

  getStats: async (req, res) => {
    try {
      const stats = await AssessmentService.getStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
};
