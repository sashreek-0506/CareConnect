import axiosClient from './axiosClient';

export const auditLogApi = {
  list: (params) => axiosClient.get('/audit-logs', { params }),
};
