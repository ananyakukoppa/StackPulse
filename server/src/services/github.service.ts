import axios, { AxiosInstance } from 'axios';
import { config } from '../config/environment';
import { AppError } from '../middleware/errorHandler';

export interface GitHubUserResponse {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepoResponse {
  id: number;
  name: string;
  full_name: string;
  owner?: {
    login: string;
    id?: number;
    avatar_url?: string;
  };
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  default_branch: string;
  fork: boolean;
  pushed_at: string | null;
  created_at: string;
  size: number;
}

export class GitHubService {
  private client: AxiosInstance;

  constructor() {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'StackPulse-Developer-Platform/1.0',
    };

    if (config.github.token) {
      headers.Authorization = `Bearer ${config.github.token}`;
    }

    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers,
      timeout: 12000,
    });
  }

  /**
   * Fetches public GitHub user profile.
   */
  public async getUser(username: string): Promise<GitHubUserResponse> {
    try {
      const response = await this.client.get<GitHubUserResponse>(`/users/${encodeURIComponent(username)}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new AppError(`GitHub developer '@${username}' not found`, 404);
      }
      if (error.response?.status === 403) {
        const resetHeader = error.response.headers['x-ratelimit-reset'];
        const resetMinutes = resetHeader
          ? Math.ceil((parseInt(resetHeader, 10) * 1000 - Date.now()) / 60000)
          : 60;
        throw new AppError(
          `GitHub API rate limit exceeded. Rate limit resets in approx ${resetMinutes} minutes. Add a GITHUB_TOKEN in .env for 5,000 req/hr.`,
          429
        );
      }
      throw new AppError(
        `Failed to fetch GitHub profile for '${username}': ${error.response?.data?.message || error.message}`,
        error.response?.status || 502
      );
    }
  }

  /**
   * Fetches public repositories for a developer, sorted by pushed date.
   */
  public async getUserRepos(username: string, perPage = 100): Promise<GitHubRepoResponse[]> {
    try {
      const response = await this.client.get<GitHubRepoResponse[]>(
        `/users/${encodeURIComponent(username)}/repos`,
        {
          params: {
            per_page: perPage,
            sort: 'pushed',
            direction: 'desc',
          },
        }
      );
      return response.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      if (error.response?.status === 403 || error.response?.status === 429) {
        const resetHeader = error.response.headers?.['x-ratelimit-reset'];
        const resetMinutes = resetHeader
          ? Math.ceil((parseInt(resetHeader, 10) * 1000 - Date.now()) / 60000)
          : 60;
        throw new AppError(
          `GitHub API rate limit exceeded. Rate limit resets in approx ${resetMinutes} minutes. Add a GITHUB_TOKEN in .env for 5,000 req/hr.`,
          429
        );
      }
      throw new AppError(
        `Failed to fetch repositories for '${username}': ${error.response?.data?.message || error.message}`,
        error.response?.status || 502
      );
    }
  }

  /**
   * Fetches language bytes breakdown for a specific repository.
   */
  public async getRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      const response = await this.client.get<Record<string, number>>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`
      );
      return response.data || {};
    } catch {
      // Non-critical: return empty if repository languages cannot be fetched
      return {};
    }
  }

  /**
   * Fetches commit count for recent repository activity.
   */
  public async getRecentCommitCount(owner: string, repo: string): Promise<number> {
    try {
      const response = await this.client.get<any[]>(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits`,
        {
          params: { per_page: 20 },
        }
      );
      return Array.isArray(response.data) ? response.data.length : 0;
    } catch {
      return 0;
    }
  }
}

export const githubService = new GitHubService();
