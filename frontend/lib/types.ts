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