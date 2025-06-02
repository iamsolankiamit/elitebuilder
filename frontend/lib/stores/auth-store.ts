import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { User, AuthState } from '../types';
import { authApi } from '../api';

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: () => void;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user: User) => set({ user }),
      
      setToken: (token: string) => {
        Cookies.set('auth-token', token, { expires: 7 });
        set({ token });
      },
      
      setLoading: (isLoading: boolean) => set({ isLoading }),
      
      setError: (error: string | null) => set({ error }),

      login: () => {
        set({ isLoading: true, error: null });
        authApi.githubLogin();
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authApi.logout();
          get().clearAuth();
        } catch (error) {
          console.error('Logout error:', error);
          // Clear auth anyway
          get().clearAuth();
        }
      },

      initializeAuth: async () => {
        const token = Cookies.get('auth-token');
        if (!token) {
          set({ isLoading: false });
          return;
        }

        try {
          set({ isLoading: true, token });
          const user = await authApi.getProfile();
          set({ user, isLoading: false, error: null });
        } catch (error) {
          console.error('Auth initialization error:', error);
          get().clearAuth();
          set({ isLoading: false, error: 'Failed to authenticate' });
        }
      },

      clearAuth: () => {
        Cookies.remove('auth-token');
        set({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
); 