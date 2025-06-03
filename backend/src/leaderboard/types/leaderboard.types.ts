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
    createdAt: Date;
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
  lastUpdated: Date;
}

export interface UserRankingInfo {
  globalRank: number;
  monthlyRank: number;
  categoryRank: number;
  totalUsers: number;
  careerScore: number;
  percentile: number;
} 