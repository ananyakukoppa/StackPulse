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
  name?: string | null;
  iat?: number;
  exp?: number;
}

export interface LanguageStat {
  language: string;
  bytes: number;
  percentage: number;
  color?: string;
}

export interface CommitActivitySummary {
  recentCommitsCount: number;
  lastPushedAt: string | null;
  activeRepositoriesCount: number;
  velocityScore: 'High' | 'Moderate' | 'Steady' | 'Low';
}

export interface DeveloperProfile {
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
  totalForks: number;
  languages: LanguageStat[];
  commitActivity: CommitActivitySummary;
  fetchedAt: Date | string;
  isCached: boolean;
  repositories: RepositorySummary[];
}

export interface RepositorySummary {
  id: string;
  developerId?: string;
  githubRepoId?: number | null;
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
  pushedAt: string | null;
  createdAt?: string;
  size?: number;
}

export interface ComparisonSummary {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date | string;
  developers: DeveloperProfile[];
}

export interface PinSummary {
  id: string;
  userId: string;
  repositoryId: string;
  note: string | null;
  tags: string[];
  createdAt: Date | string;
  repository?: RepositorySummary;
}
