// Shared TypeScript definitions for StackPulse Server

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface UserPayload {
  id: string;
  email: string;
  name?: string | null;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface DeveloperSummary {
  id: string;
  githubUsername: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  followers: number;
  following: number;
  publicRepos: number;
  publicGists: number;
  totalStars: number;
  fetchedAt: Date;
}

export interface RepositorySummary {
  id: string;
  developerId: string;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  primaryLanguage: string | null;
  defaultBranch: string;
  isFork: boolean;
  pushedAt: Date | null;
}

export interface ComparisonSummary {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
  developers: DeveloperSummary[];
}

export interface PinSummary {
  id: string;
  userId: string;
  repositoryId: string;
  note: string | null;
  tags: string[];
  createdAt: Date;
  repository?: RepositorySummary;
}
