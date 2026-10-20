import { RegistrationModel } from '../models/registrationModel.js';

export const RegistrationService = {
  getAll: async () => {
    return await RegistrationModel.findAll();
  },

  getById: async (id) => {
    return await RegistrationModel.findById(id);
  },

  upsert: async (registrationData) => {
    const d = registrationData.data || {};
    if (!d.nama && !d.program) {
      throw new Error('Nama pengusul atau nama program wajib diisi.');
    }
    return await RegistrationModel.save(registrationData);
  },

  updateReview: async (id, reviewStatus, reviewNotes) => {
    if (!id) throw new Error('ID pendaftaran diperlukan.');
    return await RegistrationModel.updateReview(id, reviewStatus, reviewNotes);
  },

  remove: async (id) => {
    return await RegistrationModel.deleteById(id);
  },

  getStats: async () => {
    const list = await RegistrationModel.findAll();
    const sent = list.filter((r) => r.status === 'terkirim');
    const pegawai = list.filter((r) => (r.data?.statuspeg || 'Pegawai') === 'Pegawai');
    const tad = list.filter((r) => r.data?.statuspeg === 'TAD');

    return {
      total: list.length,
      sentCount: sent.length,
      draftCount: list.length - sent.length,
      pegawaiCount: pegawai.length,
      tadCount: tad.length,
      updatedAt: new Date().toISOString()
    };
  }
};
