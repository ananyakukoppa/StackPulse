import { prisma, checkDatabaseConnection } from '../db/prisma';
import { developerService } from './developer.service';
import { DeveloperProfile } from '../types';
import { AppError } from '../middleware/errorHandler';

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

interface SavedComparisonRecord {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  developerUsernames: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Memory fallback store when PostgreSQL is offline
const memorySavedComparisons = new Map<string, SavedComparisonRecord>();

export class ComparisonService {
  /**
   * Compares 2 to 5 developers side-by-side with computed comparative metrics.
   */
  public async getComparisonMatrix(rawUsernames: string[]): Promise<ComparisonMatrix> {
    const cleaned = Array.from(
      new Set(
        rawUsernames
          .map((u) => u.trim().toLowerCase())
          .filter((u) => u.length > 0)
      )
    );

    if (cleaned.length < 2) {
      throw new AppError('Comparison requires at least 2 distinct GitHub developers', 400);
    }

    if (cleaned.length > 5) {
      throw new AppError('Comparison supports up to 5 developers simultaneously', 400);
    }

    // Fetch all profiles in parallel using developerService
    const profiles = await Promise.all(
      cleaned.map(async (username) => {
        try {
          return await developerService.getDeveloperProfile(username);
        } catch (err: any) {
          throw new AppError(`Could not load developer '@${username}' for comparison: ${err.message}`, 404);
        }
      })
    );

    // Determine highest values across developers
    let maxStars = -1;
    let maxRepos = -1;
    let maxFollowers = -1;
    let maxForks = -1;

    for (const p of profiles) {
      if (p.totalStars > maxStars) maxStars = p.totalStars;
      if (p.publicRepos > maxRepos) maxRepos = p.publicRepos;
      if (p.followers > maxFollowers) maxFollowers = p.followers;
      if (p.totalForks > maxForks) maxForks = p.totalForks;
    }

    const items: ComparisonMatrixItem[] = profiles.map((p) => ({
      developer: p,
      isLeaderInStars: p.totalStars === maxStars && maxStars > 0,
      isLeaderInRepos: p.publicRepos === maxRepos && maxRepos > 0,
      isLeaderInFollowers: p.followers === maxFollowers && maxFollowers > 0,
      isLeaderInForks: p.totalForks === maxForks && maxForks > 0,
    }));

    // Find common languages shared by multiple developers
    const languageFrequency: Record<string, number> = {};
    for (const p of profiles) {
      const devLangs = new Set(p.languages.map((l) => l.language));
      for (const lang of devLangs) {
        languageFrequency[lang] = (languageFrequency[lang] || 0) + 1;
      }
    }

    const commonLanguages = Object.entries(languageFrequency)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);

    const totalCombinedStars = profiles.reduce((sum, p) => sum + p.totalStars, 0);
    const totalCombinedRepos = profiles.reduce((sum, p) => sum + p.publicRepos, 0);

    return {
      items,
      commonLanguages,
      totalCombinedStars,
      totalCombinedRepos,
    };
  }

  /**
   * Saves a named comparison associated with the authenticated user.
   */
  public async saveComparison(
    userId: string,
    name: string,
    description: string | undefined,
    developerUsernames: string[]
  ): Promise<{ id: string; name: string; description: string | null; developerUsernames: string[]; createdAt: Date }> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new AppError('Comparison name cannot be empty', 400);
    }

    const uniqueUsernames = Array.from(
      new Set(developerUsernames.map((u) => u.trim().toLowerCase()).filter((u) => u.length > 0))
    );

    if (uniqueUsernames.length < 2) {
      throw new AppError('A comparison must contain at least 2 developers', 400);
    }

    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      // Ensure developers exist in database
      const devRecords = await Promise.all(
        uniqueUsernames.map((u) => developerService.getDeveloperProfile(u))
      );

      const comparison = await prisma.comparison.create({
        data: {
          userId,
          name: trimmedName,
          description: description?.trim() || null,
          developers: {
            create: devRecords.map((d) => ({
              developerId: d.id,
            })),
          },
        },
        include: {
          developers: {
            include: { developer: true },
          },
        },
      });

      return {
        id: comparison.id,
        name: comparison.name,
        description: comparison.description,
        developerUsernames: comparison.developers.map((cd) => cd.developer.githubUsername),
        createdAt: comparison.createdAt,
      };
    } else {
      const id = `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const record: SavedComparisonRecord = {
        id,
        userId,
        name: trimmedName,
        description: description?.trim() || null,
        developerUsernames: uniqueUsernames,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memorySavedComparisons.set(id, record);

      return {
        id: record.id,
        name: record.name,
        description: record.description || null,
        developerUsernames: record.developerUsernames,
        createdAt: record.createdAt,
      };
    }
  }

  /**
   * Lists all saved comparisons for a specific user.
   */
  public async getUserComparisons(userId: string): Promise<Array<{
    id: string;
    name: string;
    description: string | null;
    developerUsernames: string[];
    createdAt: Date;
  }>> {
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      const list = await prisma.comparison.findMany({
        where: { userId },
        include: {
          developers: {
            include: { developer: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return list.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        developerUsernames: c.developers.map((cd) => cd.developer.githubUsername),
        createdAt: c.createdAt,
      }));
    } else {
      const results: Array<{
        id: string;
        name: string;
        description: string | null;
        developerUsernames: string[];
        createdAt: Date;
      }> = [];

      for (const record of memorySavedComparisons.values()) {
        if (record.userId === userId) {
          results.push({
            id: record.id,
            name: record.name,
            description: record.description || null,
            developerUsernames: record.developerUsernames,
            createdAt: record.createdAt,
          });
        }
      }

      return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * Deletes a saved comparison owned by the user.
   */
  public async deleteComparison(userId: string, comparisonId: string): Promise<void> {
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      const comparison = await prisma.comparison.findFirst({
        where: { id: comparisonId, userId },
      });

      if (!comparison) {
        throw new AppError('Saved comparison not found or access denied', 404);
      }

      await prisma.comparison.delete({
        where: { id: comparisonId },
      });
    } else {
      const record = memorySavedComparisons.get(comparisonId);
      if (!record || record.userId !== userId) {
        throw new AppError('Saved comparison not found or access denied', 404);
      }
      memorySavedComparisons.delete(comparisonId);
    }
  }
}

export const comparisonService = new ComparisonService();
