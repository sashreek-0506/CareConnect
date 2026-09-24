import axiosClient from './axiosClient';

export const jobApi = {
  addUpdate: (bookingId, payload) => axiosClient.post(`/jobs/${bookingId}/updates`, payload),
  addEvidence: (bookingId, payload) => axiosClient.post(`/jobs/${bookingId}/evidence`, payload),
  confirm: (bookingId) => axiosClient.post(`/jobs/${bookingId}/confirm`),
};
