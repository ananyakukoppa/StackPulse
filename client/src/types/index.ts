// Client-side TypeScript definitions for StackPulse

export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Developer {
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
  fetchedAt: string;
  repositories?: Repository[];
}

export interface Repository {
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
  pushedAt: string | null;
}

export interface Comparison {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  developers: Developer[];
}

export interface Pin {
  id: string;
  userId: string;
  repositoryId: string;
  note: string | null;
  tags: string[];
  createdAt: string;
  repository?: Repository;
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
