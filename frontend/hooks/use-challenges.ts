import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { challengesApi, submissionsApi } from '@/lib/api';
import type { 
  Challenge, 
  CreateChallengeDto, 
  UpdateChallengeDto, 
  CreateSubmissionDto 
} from '@/lib/types';

// Challenges hooks
export function useChallenges(params?: {
  page?: number;
  limit?: number;
  search?: string;
  creatorId?: number;
  includeExpired?: boolean;
  sortBy?: 'createdAt' | 'deadline' | 'prize';
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: ['challenges', params],
    queryFn: () => challengesApi.getChallenges(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useChallenge(id: number) {
  return useQuery({
    queryKey: ['challenges', id],
    queryFn: () => challengesApi.getChallenge(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateChallengeDto) => challengesApi.createChallenge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateChallengeDto }) => 
      challengesApi.updateChallenge(id, data),
    onSuccess: (updatedChallenge) => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      queryClient.setQueryData(['challenges', updatedChallenge.id], updatedChallenge);
    },
  });
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => challengesApi.deleteChallenge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

export function useJoinChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => challengesApi.joinChallenge(id),
    onSuccess: (_, challengeId) => {
      queryClient.invalidateQueries({ queryKey: ['challenges', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

export function useLeaveChallenge() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => challengesApi.leaveChallenge(id),
    onSuccess: (_, challengeId) => {
      queryClient.invalidateQueries({ queryKey: ['challenges', challengeId] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
}

export function useLeaderboard(challengeId: number) {
  return useQuery({
    queryKey: ['leaderboard', challengeId],
    queryFn: () => challengesApi.getLeaderboard(challengeId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Submissions hooks
export function useCreateSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ challengeId, data }: { challengeId: number; data: CreateSubmissionDto }) => 
      submissionsApi.createSubmission(challengeId, data),
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: ['challenges', submission.challengeId] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', submission.challengeId] });
    },
  });
}

export function useMySubmissions() {
  return useQuery({
    queryKey: ['submissions', 'me'],
    queryFn: submissionsApi.getMySubmissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubmission(id: number) {
  return useQuery({
    queryKey: ['submissions', id],
    queryFn: () => submissionsApi.getSubmission(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateSubmissionDto> }) => 
      submissionsApi.updateSubmission(id, data),
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.setQueryData(['submissions', submission.id], submission);
      queryClient.invalidateQueries({ queryKey: ['challenges', submission.challengeId] });
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => submissionsApi.deleteSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
    },
  });
} 