import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: {
    email: string;
    username: string;
    password: string;
  }) => api.post('/auth/register', data),
  
  getProfile: () => api.get('/auth/me'),
};

export const camerasAPI = {
  getAll: (params?: any) => api.get('/cameras', { params }),
  getById: (id: string) => api.get(`/cameras/${id}`),
  create: (data: any) => api.post('/cameras', data),
  update: (id: string, data: any) => api.put(`/cameras/${id}`, data),
  delete: (id: string) => api.delete(`/cameras/${id}`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
};

export const reportsAPI = {
  getAll: (params?: any) => api.get('/reports', { params }),
  create: (data: { reason: string; cameraId: string }) =>
    api.post('/reports', data),
  updateStatus: (id: string, status: string) =>
    api.put(`/reports/${id}/status`, { status }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role`, { role }),
};