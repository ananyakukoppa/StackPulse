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
  rateLimitFallback?: boolean;
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

export interface ComparisonMatrixItem {
  developer: DeveloperProfile;
  isLeaderInStars: boolean;
  isLeaderInRepos: boolean;
  isLeaderInFollowers: boolean;
  isLeaderInForks: boolean;
}

export interface ComparisonMatrix {
  items: ComparisonMatrixItem[];
  commonLanguages: string[];
  totalCombinedStars: number;
  totalCombinedRepos: number;
}

export interface SavedComparison {
  id: string;
  name: string;
  description: string | null;
  developerUsernames: string[];
  createdAt: string;
}

export interface PinItem {
  id: string;
  userId: string;
  repositoryId: string;
  note: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  repository: {
    id: string;
    name: string;
    fullName: string;
    description: string | null;
    htmlUrl: string;
    stars: number;
    forks: number;
    primaryLanguage: string | null;
    developerUsername: string;
  };
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
