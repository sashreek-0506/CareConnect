import axiosClient from './axiosClient';

export const userApi = {
  list: (params) => axiosClient.get('/users', { params }),
  update: (id, payload) => axiosClient.patch(`/users/${id}`, payload),
};
