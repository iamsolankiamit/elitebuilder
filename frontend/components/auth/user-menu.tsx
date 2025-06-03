'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  User, 
  LogOut, 
  Settings, 
  Trophy, 
  ExternalLink,
  ChevronDown 
} from 'lucide-react';

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3"
        disabled={isLoading}
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || user.username}
            className="h-6 w-6 rounded-full"
          />
        ) : (
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-3 w-3" />
          </div>
        )}
        <span className="hidden md:inline text-sm font-medium">
          {user.name || user.username}
        </span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg z-50 p-4">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || user.username}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {user.name || user.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Trophy className="h-3 w-3 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Score: {user.careerScore}
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-3 space-y-1">
              <Link 
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              
              <button className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
                <Settings className="h-4 w-4" />
                Settings
              </button>

              {user.githubUrl && (
                <a
                  href={user.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-2 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  GitHub Profile
                </a>
              )}
            </div>

            {/* Logout */}
            <div className="pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                disabled={isLoading}
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Signing out...' : 'Sign out'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 