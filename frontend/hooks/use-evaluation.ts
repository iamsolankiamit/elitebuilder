import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface EvaluationStatus {
  submissionId: number;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  position?: number;
  estimatedTime?: number;
  logs?: string;
  error?: string;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
}

// Get evaluation status for a specific submission
export function useEvaluationStatus(submissionId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['evaluation-status', submissionId],
    queryFn: async (): Promise<EvaluationStatus> => {
      const response = await api.get(`/evaluation/status/${submissionId}`);
      return response.data;
    },
    enabled,
    refetchInterval: (data) => {
      // Refetch every 5 seconds if evaluation is in progress
      if (data?.state?.data?.status === 'waiting' || data?.state?.data?.status === 'active') {
        return 5000;
      }
      return false;
    },
  });
}

// Get queue statistics
export function useQueueStats() {
  return useQuery({
    queryKey: ['queue-stats'],
    queryFn: async (): Promise<QueueStats> => {
      const response = await api.get('/evaluation/queue/stats');
      return response.data;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

// Retry evaluation for a submission
export function useRetryEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: number) => {
      const response = await api.post(`/evaluation/retry/${submissionId}`);
      return response.data;
    },
    onSuccess: (_, submissionId) => {
      // Invalidate evaluation status and queue stats
      queryClient.invalidateQueries({ queryKey: ['evaluation-status', submissionId] });
      queryClient.invalidateQueries({ queryKey: ['queue-stats'] });
      // Also invalidate submissions to update status
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['submission', submissionId] });
    },
  });
} 