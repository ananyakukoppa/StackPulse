import fs from 'fs';
import path from 'path';
import { prisma, checkDatabaseConnection } from '../db/prisma';
import { config } from '../config/environment';
import { githubService, GitHubRepoResponse, GitHubUserResponse } from './github.service';
import { DeveloperProfile, LanguageStat, RepositorySummary, CommitActivitySummary } from '../types';
import { developerSnapshots } from '../data/developerSnapshots';

// Canonical GitHub language colors for professional visual presentation
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  'C#': '#178600',
  C: '#555555',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Shell: '#89e051',
  Vue: '#41b883',
  Jupyter: '#DA5B0B',
  R: '#198CE7',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Lua: '#000080',
};

// File-persisted local developer cache for seamless offline and rate-limit resilience
const cacheDir = path.resolve(__dirname, '../../.cache');
const cacheFilePath = path.join(cacheDir, 'devs.json');

function initLocalCache(): Map<string, DeveloperProfile> {
  const map = new Map<string, DeveloperProfile>();
  try {
    if (fs.existsSync(cacheFilePath)) {
      const content = fs.readFileSync(cacheFilePath, 'utf-8');
      const data = JSON.parse(content);
      for (const [k, v] of Object.entries(data)) {
        map.set(k.toLowerCase(), v as DeveloperProfile);
      }
    }
  } catch (err) {
    console.warn('[DeveloperService] Could not read local file cache:', err);
  }
  return map;
}

const memoryDevCache = initLocalCache();

function persistLocalCache(key: string, profile: DeveloperProfile) {
  memoryDevCache.set(key.toLowerCase(), profile);
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    const serialized: Record<string, DeveloperProfile> = {};
    for (const [k, v] of memoryDevCache.entries()) {
      serialized[k] = v;
    }
    fs.writeFileSync(cacheFilePath, JSON.stringify(serialized, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DeveloperService] Could not persist local file cache:', err);
  }
}

export class DeveloperService {
  /**
   * Retrieves a developer profile with computed aggregates and repository list.
   * Leverages PostgreSQL caching with TTL; falls back to GitHub API on cache miss/stale.
   */
  public async getDeveloperProfile(
    rawUsername: string,
    forceRefresh = false
  ): Promise<DeveloperProfile> {
    const username = rawUsername.trim().toLowerCase();
    const dbStatus = await checkDatabaseConnection();
    const now = Date.now();

    // 1. Check PostgreSQL cache if DB is reachable
    if (dbStatus.connected && !forceRefresh) {
      try {
        const cachedDev = await prisma.developer.findUnique({
          where: { githubUsername: username },
          include: {
            repositories: {
              include: { languages: true },
              orderBy: { stars: 'desc' },
            },
          },
        });

        if (cachedDev) {
          const cacheAgeMs = now - cachedDev.fetchedAt.getTime();
          if (cacheAgeMs < config.github.cacheTtlMs) {
            return this.formatCachedProfile(cachedDev);
          }
        }
      } catch (err) {
        console.warn(`[DeveloperService] Error checking DB cache for ${username}:`, err);
      }
    } else if (!dbStatus.connected && !forceRefresh && memoryDevCache.has(username)) {
      const cached = memoryDevCache.get(username)!;
      const cacheAgeMs = now - new Date(cached.fetchedAt).getTime();
      if (cacheAgeMs < config.github.cacheTtlMs) {
        return { ...cached, isCached: true };
      }
    }

    // 2. Fetch live data from GitHub API with rate limit and offline fallbacks
    let user: GitHubUserResponse;
    let repos: GitHubRepoResponse[];

    try {
      [user, repos] = await Promise.all([
        githubService.getUser(username),
        githubService.getUserRepos(username, 100),
      ]);
    } catch (fetchError: any) {
      console.warn(`[DeveloperService] Live fetch failed for @${username}: ${fetchError.message}`);

      // Fallback A: Check if any stale PostgreSQL record exists
      if (dbStatus.connected) {
        try {
          const staleDev = await prisma.developer.findUnique({
            where: { githubUsername: username },
            include: {
              repositories: {
                include: { languages: true },
                orderBy: { stars: 'desc' },
              },
            },
          });
          if (staleDev) {
            return { ...this.formatCachedProfile(staleDev), rateLimitFallback: true };
          }
        } catch {}
      }

      // Fallback B: Check if any memory or file cache record exists
      if (memoryDevCache.has(username)) {
        return { ...memoryDevCache.get(username)!, isCached: true, rateLimitFallback: true };
      }

      // Fallback C: Check pre-seeded showcase snapshot
      if (developerSnapshots[username]) {
        const snapshot = { ...developerSnapshots[username], rateLimitFallback: true };
        persistLocalCache(username, snapshot);
        return snapshot;
      }

      // If no fallback is available, rethrow error
      throw fetchError;
    }

    // 3. Compute Aggregates: Total Stars & Forks
    const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

    // 4. Sample top repositories for detailed language breakdown (top 5 to preserve rate limits)
    const topRepos = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6);
    const languageByteTotals: Record<string, number> = {};

    await Promise.all(
      topRepos.map(async (r) => {
        try {
          const breakdown = await githubService.getRepoLanguages(r.owner?.login || username, r.name);
          for (const [lang, bytes] of Object.entries(breakdown)) {
            languageByteTotals[lang] = (languageByteTotals[lang] || 0) + bytes;
          }
        } catch {
          // Fall back to primary language if breakdown fails
          if (r.language) {
            languageByteTotals[r.language] = (languageByteTotals[r.language] || 0) + (r.size || 100) * 1024;
          }
        }
      })
    );

    // If no language bytes gathered, fallback to primary languages across all repos
    if (Object.keys(languageByteTotals).length === 0) {
      for (const r of repos) {
        if (r.language) {
          languageByteTotals[r.language] = (languageByteTotals[r.language] || 0) + 1000;
        }
      }
    }

    const totalBytes = Object.values(languageByteTotals).reduce((sum, b) => sum + b, 0);
    const languages: LanguageStat[] = Object.entries(languageByteTotals)
      .map(([language, bytes]) => ({
        language,
        bytes,
        percentage: totalBytes > 0 ? parseFloat(((bytes / totalBytes) * 100).toFixed(1)) : 0,
        color: LANGUAGE_COLORS[language] || '#94a3b8',
      }))
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 8);

    // 5. Compute Commit Activity & Velocity Summary
    const nowTs = Date.now();
    const ninetyDaysAgo = nowTs - 90 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = nowTs - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = nowTs - 30 * 24 * 60 * 60 * 1000;

    let mostRecentPush: number | null = null;
    let activeReposCount = 0;

    for (const r of repos) {
      if (r.pushed_at) {
        const pushTs = new Date(r.pushed_at).getTime();
        if (!mostRecentPush || pushTs > mostRecentPush) {
          mostRecentPush = pushTs;
        }
        if (pushTs >= ninetyDaysAgo) {
          activeReposCount++;
        }
      }
    }

    let velocityScore: 'High' | 'Moderate' | 'Steady' | 'Low' = 'Low';
    if (mostRecentPush && mostRecentPush >= sevenDaysAgo && activeReposCount >= 2) {
      velocityScore = 'High';
    } else if (mostRecentPush && mostRecentPush >= thirtyDaysAgo) {
      velocityScore = 'Moderate';
    } else if (mostRecentPush && mostRecentPush >= ninetyDaysAgo) {
      velocityScore = 'Steady';
    }

    const commitActivity: CommitActivitySummary = {
      recentCommitsCount: activeReposCount * 5, // Estimated recent commits across active repos
      lastPushedAt: mostRecentPush ? new Date(mostRecentPush).toISOString() : null,
      activeRepositoriesCount: activeReposCount,
      velocityScore,
    };

    // 6. Map Repositories
    const formattedRepos: RepositorySummary[] = repos.map((r) => ({
      id: `gh_${r.id}`,
      githubRepoId: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description,
      htmlUrl: r.html_url,
      stars: r.stargazers_count,
      forks: r.forks_count,
      watchers: r.watchers_count,
      openIssues: r.open_issues_count,
      primaryLanguage: r.language,
      defaultBranch: r.default_branch,
      isFork: r.fork,
      pushedAt: r.pushed_at,
      size: r.size,
    }));

    // 7. Persist to PostgreSQL if connected
    let devId = `dev_${user.id}`;
    if (dbStatus.connected) {
      try {
        const savedDev = await prisma.developer.upsert({
          where: { githubUsername: username },
          update: {
            name: user.name,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            company: user.company,
            location: user.location,
            blog: user.blog,
            twitterUsername: user.twitter_username,
            followers: user.followers,
            following: user.following,
            publicRepos: user.public_repos,
            publicGists: user.public_gists,
            totalStars,
            fetchedAt: new Date(),
          },
          create: {
            githubUsername: username,
            name: user.name,
            avatarUrl: user.avatar_url,
            bio: user.bio,
            company: user.company,
            location: user.location,
            blog: user.blog,
            twitterUsername: user.twitter_username,
            followers: user.followers,
            following: user.following,
            publicRepos: user.public_repos,
            publicGists: user.public_gists,
            totalStars,
            fetchedAt: new Date(),
          },
        });

        devId = savedDev.id;

        // Upsert top repositories in background
        await Promise.all(
          formattedRepos.slice(0, 50).map(async (r) => {
            const existingRepo = await prisma.repository.findFirst({
              where: { developerId: devId, name: r.name },
            });

            if (existingRepo) {
              await prisma.repository.update({
                where: { id: existingRepo.id },
                data: {
                  stars: r.stars,
                  forks: r.forks,
                  watchers: r.watchers,
                  openIssues: r.openIssues,
                  primaryLanguage: r.primaryLanguage,
                  pushedAt: r.pushedAt ? new Date(r.pushedAt) : null,
                },
              });
            } else {
              await prisma.repository.create({
                data: {
                  developerId: devId,
                  githubRepoId: r.githubRepoId,
                  name: r.name,
                  fullName: r.fullName,
                  description: r.description,
                  htmlUrl: r.htmlUrl,
                  stars: r.stars,
                  forks: r.forks,
                  watchers: r.watchers,
                  openIssues: r.openIssues,
                  primaryLanguage: r.primaryLanguage,
                  defaultBranch: r.defaultBranch,
                  isFork: r.isFork,
                  pushedAt: r.pushedAt ? new Date(r.pushedAt) : null,
                },
              });
            }
          })
        );
      } catch (dbErr) {
        console.warn(`[DeveloperService] PostgreSQL persistence warning for ${username}:`, dbErr);
      }
    }

    const profile: DeveloperProfile = {
      id: devId,
      githubUsername: username,
      name: user.name,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      company: user.company,
      location: user.location,
      blog: user.blog,
      twitterUsername: user.twitter_username,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      publicGists: user.public_gists,
      totalStars,
      totalForks,
      languages,
      commitActivity,
      fetchedAt: new Date().toISOString(),
      isCached: false,
      repositories: formattedRepos,
    };

    // Cache in memory and local file store for persistent retrieval
    persistLocalCache(username, profile);

    return profile;
  }

  /**
   * Filters and sorts repositories for a developer.
   */
  public async getDeveloperRepos(
    username: string,
    options: {
      query?: string;
      language?: string;
      sortBy?: 'stars' | 'pushed' | 'name';
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ): Promise<{ repositories: RepositorySummary[]; totalCount: number; page: number; totalPages: number }> {
    const profile = await this.getDeveloperProfile(username);
    let repos = [...profile.repositories];

    // Filter by search query
    if (options.query) {
      const q = options.query.toLowerCase();
      repos = repos.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.description && r.description.toLowerCase().includes(q))
      );
    }

    // Filter by programming language
    if (options.language && options.language !== 'all') {
      const lang = options.language.toLowerCase();
      repos = repos.filter((r) => r.primaryLanguage && r.primaryLanguage.toLowerCase() === lang);
    }

    // Sort
    const sortBy = options.sortBy || 'stars';
    const order = options.order || 'desc';

    repos.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'stars') comparison = a.stars - b.stars;
      else if (sortBy === 'pushed') {
        const timeA = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
        const timeB = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      }
      return order === 'desc' ? -comparison : comparison;
    });

    const totalCount = repos.length;
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const totalPages = Math.ceil(totalCount / limit);
    const paginatedRepos = repos.slice((page - 1) * limit, page * limit);

    return {
      repositories: paginatedRepos,
      totalCount,
      page,
      totalPages,
    };
  }

  private formatCachedProfile(cachedDev: any): DeveloperProfile {
    const repos = (cachedDev.repositories || []).map((r: any) => ({
      id: r.id,
      developerId: r.developerId,
      githubRepoId: r.githubRepoId,
      name: r.name,
      fullName: r.fullName,
      description: r.description,
      htmlUrl: r.htmlUrl,
      stars: r.stars,
      forks: r.forks,
      watchers: r.watchers,
      openIssues: r.openIssues,
      primaryLanguage: r.primaryLanguage,
      defaultBranch: r.defaultBranch,
      isFork: r.isFork,
      pushedAt: r.pushedAt ? r.pushedAt.toISOString() : null,
    }));

    // Aggregate languages from repositories
    const langCounts: Record<string, number> = {};
    for (const r of repos) {
      if (r.primaryLanguage) {
        langCounts[r.primaryLanguage] = (langCounts[r.primaryLanguage] || 0) + 1;
      }
    }
    const totalLangRepos = Object.values(langCounts).reduce((s, c) => s + c, 0);
    const languages: LanguageStat[] = Object.entries(langCounts)
      .map(([lang, count]) => ({
        language: lang,
        bytes: count * 1000,
        percentage: totalLangRepos > 0 ? parseFloat(((count / totalLangRepos) * 100).toFixed(1)) : 0,
        color: LANGUAGE_COLORS[lang] || '#94a3b8',
      }))
      .sort((a, b) => b.percentage - a.percentage);

    const commitActivity: CommitActivitySummary = {
      recentCommitsCount: 15,
      lastPushedAt: repos[0]?.pushedAt || null,
      activeRepositoriesCount: Math.min(repos.length, 5),
      velocityScore: 'Steady',
    };

    return {
      id: cachedDev.id,
      githubUsername: cachedDev.githubUsername,
      name: cachedDev.name,
      avatarUrl: cachedDev.avatarUrl,
      bio: cachedDev.bio,
      company: cachedDev.company,
      location: cachedDev.location,
      blog: cachedDev.blog,
      twitterUsername: cachedDev.twitterUsername,
      followers: cachedDev.followers,
      following: cachedDev.following,
      publicRepos: cachedDev.publicRepos,
      publicGists: cachedDev.publicGists,
      totalStars: cachedDev.totalStars,
      totalForks: repos.reduce((sum: number, r: any) => sum + r.forks, 0),
      languages,
      commitActivity,
      fetchedAt: cachedDev.fetchedAt.toISOString(),
      isCached: true,
      repositories: repos,
    };
  }
}

export const developerService = new DeveloperService();
