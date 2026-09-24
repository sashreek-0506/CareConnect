import axiosClient from './axiosClient';

export const categoryApi = {
  list: (params) => axiosClient.get('/categories', { params }),
  create: (payload) => axiosClient.post('/categories', payload),
  update: (id, payload) => axiosClient.patch(`/categories/${id}`, payload),
  remove: (id) => axiosClient.delete(`/categories/${id}`),
};
