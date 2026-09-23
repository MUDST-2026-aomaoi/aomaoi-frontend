import { adminRepository } from '../repository/adminRepository';

export const adminService = {
  getAllAdmins: async () => {
    return await adminRepository.getAll();
  },

  addAdmin: async (adminData) => {
    return await adminRepository.add(adminData);
  },

  updateAdmin: async (id, adminData) => {
    return await adminRepository.update(id, adminData);
  },

  deleteAdmin: async (id) => {
    return await adminRepository.delete(id);
  }
};
