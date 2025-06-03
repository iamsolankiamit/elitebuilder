'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi } from '@/lib/api';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  const { setUser, setToken, setError: setAuthError } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          throw new Error(errorParam);
        }

        if (!token) {
          throw new Error('No authentication token received');
        }

        // Set the token and fetch user profile
        setToken(token);
        const user = await authApi.getProfile();
        
        setUser(user);
        setStatus('success');

        // Redirect to home or intended page after a short delay
        setTimeout(() => {
          const returnTo = sessionStorage.getItem('auth-return-to') || '/';
          sessionStorage.removeItem('auth-return-to');
          router.replace(returnTo);
        }, 1500);

      } catch (err) {
        console.error('Authentication callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
        setAuthError(errorMessage);
        setStatus('error');

        // Redirect to home after error
        setTimeout(() => {
          router.replace('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, setUser, setToken, setAuthError]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md px-4">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Completing sign in...</h2>
            <p className="text-muted-foreground">
              Please wait while we finish setting up your account.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Welcome to EliteBuilders!</h2>
            <p className="text-muted-foreground">
              You've successfully signed in. Redirecting you now...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Authentication Failed</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'Something went wrong during sign in. Please try again.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you back to the home page...
            </p>
          </>
        )}
      </div>
    </div>
  );
} 