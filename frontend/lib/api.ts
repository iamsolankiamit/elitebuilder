import axios from 'axios';
import Cookies from 'js-cookie';
import type { LoginResponse, User } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized response
      Cookies.remove('auth-token');
      // Optionally redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  // GitHub OAuth login
  githubLogin: () => {
    window.location.href = `${API_BASE_URL}/auth/github`;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    Cookies.remove('auth-token');
  },

  // Handle OAuth callback (called from server-side)
  handleCallback: async (token: string): Promise<LoginResponse> => {
    Cookies.set('auth-token', token, { expires: 7 }); // 7 days
    const user = await authApi.getProfile();
    return { user, token };
  },
}; 