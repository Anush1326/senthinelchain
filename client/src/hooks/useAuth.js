import { useCallback } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

export const useAuth = () => {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

  const login = useCallback(async (credentials) => {
    try {
      // Mock login for frontend dev
      // const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      // setAuth(response.data.user, response.data.token);
      
      setAuth({ id: 1, name: 'Jane Doe', role: 'Investigator' }, 'mock-token-123');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [setAuth]);

  const register = useCallback(async (data) => {
    try {
      // const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
      // setAuth(response.data.user, response.data.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout
  };
};
