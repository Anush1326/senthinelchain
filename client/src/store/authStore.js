import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true, error: null });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      get().setAuth(data, data.token);
      set({ loading: false });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Login failed';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  register: async (name, email, password, role = 'viewer', walletAddress = '') => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/register', { name, email, password, role, walletAddress });
      const { data } = response.data;
      get().setAuth(data, data.token);
      set({ loading: false });
      return { success: true, data };
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/forgot-password', { email });
      set({ loading: false });
      return { success: true, message: response.data.message, resetToken: response.data.resetToken };
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset request failed';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Password reset failed';
      set({ loading: false, error: message });
      return { success: false, message };
    }
  },

  fetchProfile: async () => {
    if (!get().token) return;
    try {
      const response = await api.get('/auth/me');
      get().setUser(response.data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        get().logout();
      }
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isAuthenticated: false, error: null });
    }
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;

