import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({ baseURL });

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function flushQueue(error, token) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
}

axiosClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('cc_refresh_token');

      try {
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;
        localStorage.setItem('cc_access_token', newToken);
        flushQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        localStorage.removeItem('cc_access_token');
        localStorage.removeItem('cc_refresh_token');
        localStorage.removeItem('cc_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
