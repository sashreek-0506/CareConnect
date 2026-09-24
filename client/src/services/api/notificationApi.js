import axiosClient from './axiosClient';

export const notificationApi = {
  list: (params) => axiosClient.get('/notifications', { params }),
  markRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAllRead: () => axiosClient.patch('/notifications/read-all'),
};
