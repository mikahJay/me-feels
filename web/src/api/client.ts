import axios from 'axios';

const serviceUrl = import.meta.env.VITE_SERVICE_URL ?? '/api';

export const apiClient = axios.create({
  baseURL: serviceUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
