import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api';
import type { User } from '@/lib/types';

export function useAuth() {
  const store = useAuthStore();
  const queryClient = useQueryClient();

  // Query for user profile (only runs if authenticated)
  const profileQuery = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authApi.getProfile,
    enabled: !!store.token,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      store.clearAuth();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Clear auth anyway on error
      store.clearAuth();
      queryClient.clear();
    },
  });

  // Login function
  const login = () => {
    store.setLoading(true);
    store.setError(null);
    authApi.githubLogin();
  };

  // Logout function
  const logout = () => {
    logoutMutation.mutate();
  };

  // Update user profile in cache
  const updateUser = (updatedUser: Partial<User>) => {
    if (store.user) {
      const newUser = { ...store.user, ...updatedUser };
      store.setUser(newUser);
      queryClient.setQueryData(['auth', 'profile'], newUser);
    }
  };

  return {
    // State
    user: store.user,
    token: store.token,
    isLoading: store.isLoading || profileQuery.isLoading || logoutMutation.isPending,
    isAuthenticated: !!store.user && !!store.token,
    error: store.error || profileQuery.error?.message || logoutMutation.error?.message,

    // Actions
    login,
    logout,
    updateUser,
    
    // Store actions
    setError: store.setError,
    clearAuth: store.clearAuth,
  };
} 