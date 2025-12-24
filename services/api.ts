
import axios, { AxiosHeaders } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000,
});

api.interceptors.request.use((config) => {
  const adminData = localStorage.getItem('admin');
  if (adminData) {
    try {
      const { token } = JSON.parse(adminData);
      if (typeof token === 'string' && token.trim().length > 0) {
        config.headers = config.headers ?? new AxiosHeaders();
        (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
      }
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      try {
        localStorage.removeItem('admin');
      } catch {}
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  }
);

export const orderService = {
  placeOrder: async (data: any) => {
    const res = await api.post('/orders', data);
    window.dispatchEvent(new Event('orderStatusChanged'));
    return res;
  },

  getById: async (id: string) => {
    return api.get(`/orders/${id}`);
  },

  getAll: async (filters: any) => {
    return api.get('/orders', { params: filters });
  },

  updateStatus: async (id: string, status: string) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    window.dispatchEvent(new Event('orderStatusChanged'));
    return res;
  },
};

export const menuService = {
  getAll: (includeUnavailable?: boolean) => api.get('/menu', { params: includeUnavailable ? { includeUnavailable: 'true' } : {} }),
  create: (payload: any) => api.post('/menu', payload),
  update: (id: string, payload: any) => api.patch(`/menu/${id}`, payload),
  remove: (id: string) => api.delete(`/menu/${id}`),
};

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
};

export const settingsService = {
  getRestaurant: () => api.get('/settings/restaurant'),
  updateRestaurant: (payload: any) => api.put('/settings/restaurant', payload),
};

export default api;
