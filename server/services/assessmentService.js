import { AssessmentModel } from '../models/assessmentModel.js';

export const AssessmentService = {
  getAll: async () => {
    return await AssessmentModel.findAll();
  },

  getById: async (id) => {
    return await AssessmentModel.findById(id);
  },

  upsert: async (assessmentData) => {
    if (!assessmentData.ident || (!assessmentData.ident.nama && !assessmentData.ident.komunitas)) {
      throw new Error('Nama peserta atau komunitas wajib diisi.');
    }
    return await AssessmentModel.save(assessmentData);
  },

  remove: async (id) => {
    return await AssessmentModel.deleteById(id);
  },

  getStats: async () => {
    const list = await AssessmentModel.findAll();
    return {
      total: list.length,
      updatedAt: new Date().toISOString()
    };
  }
};
