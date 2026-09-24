import axiosClient from './axiosClient';

export const providerApi = {
  list: (params) => axiosClient.get('/providers', { params }),
  listAll: (params) => axiosClient.get('/providers/admin/all', { params }),
  get: (id) => axiosClient.get(`/providers/${id}`),
  getMine: () => axiosClient.get('/providers/me'),
  updateMine: (payload) => axiosClient.patch('/providers/me', payload),
  setVerification: (id, payload) => axiosClient.patch(`/providers/${id}/verify`, payload),
};
