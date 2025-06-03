import axios from 'axios';
import Cookies from 'js-cookie';
import type { 
  LoginResponse, 
  User, 
  Challenge, 
  ChallengesResponse, 
  CreateChallengeDto, 
  UpdateChallengeDto, 
  CreateSubmissionDto, 
  Submission,
  ChallengeLeaderboardResponse,
  LeaderboardResponse,
  LeaderboardPeriod,
  LeaderboardCategory,
  SortBy,
  UserRankingInfo
} from './types';

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

export const challengesApi = {
  // Get all challenges with filtering and pagination
  getChallenges: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    creatorId?: number;
    includeExpired?: boolean;
    sortBy?: 'createdAt' | 'deadline' | 'prize';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ChallengesResponse> => {
    const response = await api.get('/challenges', { params });
    return response.data;
  },

  // Get challenge by ID
  getChallenge: async (id: number): Promise<Challenge> => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  // Create new challenge
  createChallenge: async (data: CreateChallengeDto): Promise<Challenge> => {
    const response = await api.post('/challenges', data);
    return response.data;
  },

  // Update challenge
  updateChallenge: async (id: number, data: UpdateChallengeDto): Promise<Challenge> => {
    const response = await api.patch(`/challenges/${id}`, data);
    return response.data;
  },

  // Delete challenge
  deleteChallenge: async (id: number): Promise<void> => {
    await api.delete(`/challenges/${id}`);
  },

  // Join challenge
  joinChallenge: async (id: number): Promise<void> => {
    await api.post(`/challenges/${id}/participate`);
  },

  // Leave challenge
  leaveChallenge: async (id: number): Promise<void> => {
    await api.delete(`/challenges/${id}/participate`);
  },

  // Get challenge leaderboard
  getLeaderboard: async (id: number): Promise<ChallengeLeaderboardResponse> => {
    const response = await api.get(`/challenges/${id}/leaderboard`);
    return response.data;
  },
};

export const submissionsApi = {
  // Create submission
  createSubmission: async (challengeId: number, data: CreateSubmissionDto): Promise<Submission> => {
    // Only send repoUrl, pitchDeck, and demoVideo - challengeId comes from URL parameter
    const response = await api.post(`/challenges/${challengeId}/submissions`, {
      repoUrl: data.repoUrl,
      pitchDeck: data.pitchDeck,
      demoVideo: data.demoVideo,
    });
    return response.data;
  },

  // Get user's submissions
  getMySubmissions: async (): Promise<Submission[]> => {
    const response = await api.get('/submissions/my-submissions');
    return response.data;
  },

  // Get submission by ID
  getSubmission: async (id: number): Promise<Submission> => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },

  // Update submission
  updateSubmission: async (id: number, data: Partial<CreateSubmissionDto>): Promise<Submission> => {
    const response = await api.patch(`/submissions/${id}`, data);
    return response.data;
  },

  // Delete submission
  deleteSubmission: async (id: number): Promise<void> => {
    await api.delete(`/submissions/${id}`);
  },
};

export const leaderboardApi = {
  // Get global leaderboard
  getGlobalLeaderboard: async (params?: {
    page?: number;
    limit?: number;
    period?: LeaderboardPeriod;
    category?: LeaderboardCategory;
    sortBy?: SortBy;
  }): Promise<LeaderboardResponse> => {
    const response = await api.get('/leaderboard/global', { params });
    return response.data;
  },

  // Get monthly leaderboard
  getMonthlyLeaderboard: async (params?: {
    page?: number;
    limit?: number;
    category?: LeaderboardCategory;
    sortBy?: SortBy;
  }): Promise<LeaderboardResponse> => {
    const response = await api.get('/leaderboard/monthly', { params });
    return response.data;
  },

  // Get category-specific leaderboard
  getCategoryLeaderboard: async (category: LeaderboardCategory, params?: {
    page?: number;
    limit?: number;
    period?: LeaderboardPeriod;
    sortBy?: SortBy;
  }): Promise<LeaderboardResponse> => {
    const response = await api.get(`/leaderboard/categories/${category}`, { params });
    return response.data;
  },

  // Get sponsor favorites
  getSponsorFavorites: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<LeaderboardResponse> => {
    const response = await api.get('/leaderboard/sponsor-favorites', { params });
    return response.data;
  },

  // Get user ranking info
  getUserRanking: async (userId?: number): Promise<UserRankingInfo> => {
    const url = userId ? `/leaderboard/user/${userId}/ranking` : '/leaderboard/my-ranking';
    const response = await api.get(url);
    return response.data;
  },

  // Get leaderboard stats
  getLeaderboardStats: async (): Promise<{
    totalUsers: number;
    totalSubmissions: number;
    avgCareerScore: number;
    topPerformers: number;
  }> => {
    const response = await api.get('/leaderboard/stats');
    return response.data;
  },
}; 