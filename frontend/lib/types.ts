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

// Badge types
export enum BadgeType {
  TOP_10_PERCENT = 'TOP_10_PERCENT',
  CATEGORY_WINNER = 'CATEGORY_WINNER', 
  SPONSOR_FAVORITE = 'SPONSOR_FAVORITE',
  FIRST_SUBMISSION = 'FIRST_SUBMISSION',
  PERFECT_SCORE = 'PERFECT_SCORE',
  SEASON_CHAMPION = 'SEASON_CHAMPION',
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  type: BadgeType;
  userId: number;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    name: string | null;
    avatar: string | null;
  };
}

export interface BadgeStats {
  totalBadges: number;
  badgesByType: Record<BadgeType, number>;
  recentBadges: Badge[];
}

export interface SponsorBadgeActivity {
  badgeId: number;
  badge: Badge;
  awardedBy: {
    id: number;
    name: string;
    username: string;
  };
  awardedTo: {
    id: number;
    name: string;
    username: string;
  };
  challengeId?: number;
  challenge?: {
    id: number;
    title: string;
  };
  reason?: string;
  createdAt: string;
}

export interface SponsorFavorite {
  rank: number;
  badge: Badge;
  user: {
    id: number;
    username: string;
    name: string | null;
    avatar: string | null;
    location: string | null;
    githubUrl: string | null;
    careerScore: number;
  };
}

export interface UserBadgeProfile {
  badges: Badge[];
  stats: {
    totalBadges: number;
    badgesByType: Record<BadgeType, number>;
  };
}

export interface BadgesResponse {
  badges: Badge[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateBadgeDto {
  name: string;
  description: string;
  imageUrl: string;
  type: BadgeType;
  userId: number;
}

export interface AwardSponsorBadgeDto {
  userId: number;
  challengeId?: number;
  reason?: string;
  customName?: string;
  customDescription?: string;
}

export interface BadgeQueryParams {
  page?: number;
  limit?: number;
  userId?: number;
  type?: BadgeType;
  search?: string;
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

// Leaderboard types
export enum LeaderboardPeriod {
  ALL_TIME = 'all-time',
  YEARLY = 'yearly',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
}

export enum LeaderboardCategory {
  OVERALL = 'overall',
  AI_ML = 'ai-ml',
  WEB_DEV = 'web-dev',
  MOBILE = 'mobile',
  DATA_SCIENCE = 'data-science',
  DEVOPS = 'devops',
  BLOCKCHAIN = 'blockchain',
}

export enum SortBy {
  CAREER_SCORE = 'careerScore',
  SUBMISSION_COUNT = 'submissionCount',
  AVERAGE_SCORE = 'averageScore',
  WIN_RATE = 'winRate',
  RECENT_ACTIVITY = 'recentActivity',
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: number;
    username: string;
    name: string | null;
    avatar: string | null;
    location: string | null;
    githubUrl: string | null;
  };
  careerScore: number;
  submissionCount: number;
  averageScore: number;
  winRate: number;
  badges: {
    id: number;
    name: string;
    type: string;
    imageUrl: string;
  }[];
  recentSubmissions: {
    id: number;
    challengeTitle: string;
    score: number | null;
    createdAt: string;
  }[];
  monthlyScore?: number;
  weeklyScore?: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  period: LeaderboardPeriod;
  category: LeaderboardCategory;
  lastUpdated: string;
}

export interface UserRankingInfo {
  globalRank: number;
  monthlyRank: number;
  categoryRank: number;
  totalUsers: number;
  careerScore: number;
  percentile: number;
}

// Legacy leaderboard interface for challenge-specific leaderboards
export interface ChallengeLeaderboardEntry {
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

export interface ChallengeLeaderboardResponse {
  challenge: {
    id: number;
    title: string;
    deadline: string;
  };
  leaderboard: ChallengeLeaderboardEntry[];
} 