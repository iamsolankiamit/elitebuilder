'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Github } from 'lucide-react';

interface LoginButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'pill';
  className?: string;
}

export function LoginButton({ 
  variant = 'glass', 
  size = 'default',
  className 
}: LoginButtonProps) {
  const { login, isLoading } = useAuth();

  return (
    <Button
      onClick={login}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
      ) : (
        <Github className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Connecting...' : 'Continue with GitHub'}
    </Button>
  );
} 