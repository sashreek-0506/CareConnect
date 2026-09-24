import axiosClient from './axiosClient';

export const quoteApi = {
  create: (payload) => axiosClient.post('/quotes', payload),
  mine: (params) => axiosClient.get('/quotes/mine', { params }),
  forRequest: (requestId) => axiosClient.get(`/quotes/request/${requestId}`),
  withdraw: (id) => axiosClient.post(`/quotes/${id}/withdraw`),
};
