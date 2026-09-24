import axiosClient from './axiosClient';

export const disputeApi = {
  create: (payload) => axiosClient.post('/disputes', payload),
  list: (params) => axiosClient.get('/disputes', { params }),
  get: (id) => axiosClient.get(`/disputes/${id}`),
  addNote: (id, note) => axiosClient.post(`/disputes/${id}/notes`, { note }),
  resolve: (id, payload) => axiosClient.post(`/disputes/${id}/resolve`, payload),
};
