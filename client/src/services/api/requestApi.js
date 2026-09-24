import axiosClient from './axiosClient';

export const requestApi = {
  create: (payload) => axiosClient.post('/requests', payload),
  mine: (params) => axiosClient.get('/requests/mine', { params }),
  matching: (params) => axiosClient.get('/requests/matching', { params }),
  all: (params) => axiosClient.get('/requests', { params }),
  get: (id) => axiosClient.get(`/requests/${id}`),
  update: (id, payload) => axiosClient.patch(`/requests/${id}`, payload),
  cancel: (id) => axiosClient.post(`/requests/${id}/cancel`),
  classifyPreview: (description) => axiosClient.post('/requests/classify-preview', { description }),
  rankedProviders: (id) => axiosClient.get(`/requests/${id}/ranked-providers`),
};
