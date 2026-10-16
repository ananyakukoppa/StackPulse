// Client-side TypeScript definitions for StackPulse

export interface User {
  id: string;
  email: string;
  name?: string | null;
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
  fetchedAt: string;
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
  size?: number;
}

export interface Comparison {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  developers: DeveloperProfile[];
}

export interface Pin {
  id: string;
  userId: string;
  repositoryId: string;
  note: string | null;
  tags: string[];
  createdAt: string;
  repository?: RepositorySummary;
}

export interface HealthResponse {
  service: string;
  version: string;
  increment: string;
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  environment: string;
  database: {
    provider: string;
    connected: boolean;
    details: string;
  };
}
