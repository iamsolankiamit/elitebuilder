import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { badgesApi } from '@/lib/api';
import { useAuth } from './use-auth';
import type { 
  Badge, 
  BadgeStats, 
  SponsorBadgeActivity, 
  SponsorFavorite, 
  UserBadgeProfile, 
  BadgesResponse,
  AwardSponsorBadgeDto,
  CreateBadgeDto,
  BadgeQueryParams 
} from '@/lib/types';

export function useBadges(params?: BadgeQueryParams) {
  return useQuery({
    queryKey: ['badges', params],
    queryFn: () => badgesApi.getBadges(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBadgeStats() {
  return useQuery({
    queryKey: ['badges', 'stats'],
    queryFn: badgesApi.getBadgeStats,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSponsorFavorites(limit?: number) {
  return useQuery({
    queryKey: ['badges', 'sponsor-favorites', limit],
    queryFn: () => badgesApi.getSponsorFavorites(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSponsorBadgeActivity(limit?: number) {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['badges', 'sponsor-activity', limit],
    queryFn: () => badgesApi.getSponsorBadgeActivity(limit),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUserBadges(userId: number) {
  return useQuery({
    queryKey: ['badges', 'user', userId],
    queryFn: () => badgesApi.getUserBadges(userId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAwardSponsorBadge() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: AwardSponsorBadgeDto) => badgesApi.awardSponsorBadge(data),
    onSuccess: (newBadge, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      queryClient.invalidateQueries({ queryKey: ['badges', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['badges', 'sponsor-favorites'] });
      queryClient.invalidateQueries({ queryKey: ['badges', 'sponsor-activity'] });
      queryClient.invalidateQueries({ queryKey: ['badges', 'user', variables.userId] });
      
      // Update leaderboard queries that might show badges
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

export function useCreateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBadgeDto) => badgesApi.createBadge(data),
    onSuccess: (newBadge, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      queryClient.invalidateQueries({ queryKey: ['badges', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['badges', 'user', variables.userId] });
    },
  });
}

export function useDeleteBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (badgeId: number) => badgesApi.deleteBadge(badgeId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      queryClient.invalidateQueries({ queryKey: ['badges', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}

// Custom hooks for specific use cases
export function useMyBadges() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['badges', 'my-badges', user?.id],
    queryFn: () => user ? badgesApi.getUserBadges(user.id) : null,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBadgeSearch(searchTerm: string, type?: string) {
  const params: BadgeQueryParams = {
    search: searchTerm,
    ...(type && { type: type as any }),
    limit: 20,
  };

  return useQuery({
    queryKey: ['badges', 'search', searchTerm, type],
    queryFn: () => badgesApi.getBadges(params),
    enabled: searchTerm.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecentBadges(limit: number = 10) {
  return useQuery({
    queryKey: ['badges', 'recent', limit],
    queryFn: () => badgesApi.getBadges({ limit, page: 1 }),
    staleTime: 1 * 60 * 1000, // 1 minute for recent badges
  });
} 