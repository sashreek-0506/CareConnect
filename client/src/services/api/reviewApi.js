import axiosClient from './axiosClient';

export const reviewApi = {
  create: (payload) => axiosClient.post('/reviews', payload),
  forProvider: (providerId) => axiosClient.get(`/reviews/provider/${providerId}`),
  respond: (id, response) => axiosClient.patch(`/reviews/${id}/response`, { response }),
};
