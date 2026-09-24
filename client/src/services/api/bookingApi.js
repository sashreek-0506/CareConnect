import axiosClient from './axiosClient';

export const bookingApi = {
  create: (payload) => axiosClient.post('/bookings', payload),
  mine: (params) => axiosClient.get('/bookings/mine', { params }),
  all: (params) => axiosClient.get('/bookings', { params }),
  get: (id) => axiosClient.get(`/bookings/${id}`),
  reschedule: (id, payload) => axiosClient.patch(`/bookings/${id}/reschedule`, payload),
  cancel: (id, payload) => axiosClient.post(`/bookings/${id}/cancel`, payload),
};
