import axiosClient from './axiosClient';

export const availabilityApi = {
  listMine: () => axiosClient.get('/availability/me'),
  addSlot: (payload) => axiosClient.post('/availability/me', payload),
  deleteSlot: (id) => axiosClient.delete(`/availability/me/${id}`),
  listForProvider: (providerId) => axiosClient.get(`/availability/provider/${providerId}`),
};
