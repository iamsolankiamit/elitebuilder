export interface User {
  id: number;
  email: string;
  name?: string;
  username: string;
  avatar?: string;
  githubId?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  careerScore: number;
  isSponsor: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Challenge types
export interface Challenge {
  id: number;
  title: string;
  description: string;
  dataset?: string;
  rubric: string;
  deadline: string;
  prize?: number;
  createdAt: string;
  updatedAt: string;
  creatorId: number;
  creator: {
    id: number;
    name?: string;
    username: string;
    avatar?: string;
  };
  participants?: User[];
  submissions?: Submission[];
  _count: {
    participants: number;
    submissions: number;
  };
  isParticipating?: boolean;
  hasSubmitted?: boolean;
  isExpired?: boolean;
}

export interface Submission {
  id: number;
  repoUrl: string;
  pitchDeck: string;
  demoVideo: string;
  score?: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'SCORED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  userId: number;
  challengeId: number;
  user: {
    id: number;
    name?: string;
    username: string;
    avatar?: string;
  };
}

export interface CreateChallengeDto {
  title: string;
  description: string;
  dataset?: string;
  rubric: string;
  deadline: string;
  prize?: number;
}

export interface UpdateChallengeDto {
  title?: string;
  description?: string;
  dataset?: string;
  rubric?: string;
  deadline?: string;
  prize?: number;
}

export interface CreateSubmissionDto {
  repoUrl: string;
  pitchDeck: string;
  demoVideo: string;
}

export interface ChallengesResponse {
  challenges: Challenge[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: number;
    name?: string;
    username: string;
    avatar?: string;
  };
  score: number;
  submittedAt: string;
}

export interface LeaderboardResponse {
  challenge: {
    id: number;
    title: string;
    deadline: string;
  };
  leaderboard: LeaderboardEntry[];
} 