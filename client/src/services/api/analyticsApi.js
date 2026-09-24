import axiosClient from './axiosClient';

export const analyticsApi = {
  summary: () => axiosClient.get('/analytics/summary'),
};
