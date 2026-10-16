import { prisma, checkDatabaseConnection } from '../db/prisma';
import { developerService } from './developer.service';
import { AppError } from '../middleware/errorHandler';

export interface PinItem {
  id: string;
  userId: string;
  repositoryId: string;
  note: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
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

interface MemoryPinRecord {
  id: string;
  userId: string;
  repositoryId: string;
  note: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
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

const memoryPins = new Map<string, MemoryPinRecord>();

export class PinService {
  /**
   * Pins or updates a repository for an authenticated user with note and tags.
   */
  public async pinRepository(
    userId: string,
    repoData: {
      fullName: string;
      name: string;
      htmlUrl: string;
      developerUsername: string;
      description?: string | null;
      stars?: number;
      forks?: number;
      primaryLanguage?: string | null;
    },
    note?: string,
    tags?: string[]
  ): Promise<PinItem> {
    const cleanTags = Array.isArray(tags)
      ? Array.from(new Set(tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)))
      : [];

    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      // 1. Ensure developer exists in database
      const devProfile = await developerService.getDeveloperProfile(repoData.developerUsername);

      // 2. Find or create repository record
      let repo = await prisma.repository.findFirst({
        where: {
          developerId: devProfile.id,
          fullName: repoData.fullName,
        },
      });

      if (!repo) {
        repo = await prisma.repository.create({
          data: {
            developerId: devProfile.id,
            name: repoData.name,
            fullName: repoData.fullName,
            description: repoData.description || null,
            htmlUrl: repoData.htmlUrl,
            stars: repoData.stars || 0,
            forks: repoData.forks || 0,
            primaryLanguage: repoData.primaryLanguage || null,
          },
        });
      }

      // 3. Upsert pin for the user
      const pin = await prisma.pin.upsert({
        where: {
          userId_repositoryId: {
            userId,
            repositoryId: repo.id,
          },
        },
        update: {
          note: note !== undefined ? note : undefined,
          tags: JSON.stringify(cleanTags),
        },
        create: {
          userId,
          repositoryId: repo.id,
          note: note || null,
          tags: JSON.stringify(cleanTags),
        },
        include: {
          repository: {
            include: { developer: true },
          },
        },
      });

      let parsedTags: string[] = [];
      try {
        parsedTags = JSON.parse(pin.tags);
      } catch {
        parsedTags = [];
      }

      return {
        id: pin.id,
        userId: pin.userId,
        repositoryId: pin.repositoryId,
        note: pin.note,
        tags: parsedTags,
        createdAt: pin.createdAt,
        updatedAt: pin.updatedAt,
        repository: {
          id: pin.repository.id,
          name: pin.repository.name,
          fullName: pin.repository.fullName,
          description: pin.repository.description,
          htmlUrl: pin.repository.htmlUrl,
          stars: pin.repository.stars,
          forks: pin.repository.forks,
          primaryLanguage: pin.repository.primaryLanguage,
          developerUsername: pin.repository.developer.githubUsername,
        },
      };
    } else {
      // Memory fallback implementation
      const existingKey = `${userId}_${repoData.fullName}`;
      let existingPin: MemoryPinRecord | undefined;

      for (const p of memoryPins.values()) {
        if (p.userId === userId && p.repository.fullName === repoData.fullName) {
          existingPin = p;
          break;
        }
      }

      if (existingPin) {
        existingPin.note = note !== undefined ? note : existingPin.note;
        existingPin.tags = cleanTags;
        existingPin.updatedAt = new Date();
        return existingPin;
      }

      const id = `pin_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const newPin: MemoryPinRecord = {
        id,
        userId,
        repositoryId: `repo_${repoData.fullName}`,
        note: note || null,
        tags: cleanTags,
        createdAt: new Date(),
        updatedAt: new Date(),
        repository: {
          id: `repo_${repoData.fullName}`,
          name: repoData.name,
          fullName: repoData.fullName,
          description: repoData.description || null,
          htmlUrl: repoData.htmlUrl,
          stars: repoData.stars || 0,
          forks: repoData.forks || 0,
          primaryLanguage: repoData.primaryLanguage || null,
          developerUsername: repoData.developerUsername,
        },
      };

      memoryPins.set(id, newPin);
      return newPin;
    }
  }

  /**
   * Retrieves all pinned repositories for a specific user, with optional tag/search filtering.
   */
  public async getUserPins(userId: string, filter?: { tag?: string; search?: string }): Promise<PinItem[]> {
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      const pins = await prisma.pin.findMany({
        where: { userId },
        include: {
          repository: {
            include: { developer: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      let items: PinItem[] = pins.map((p) => {
        let parsedTags: string[] = [];
        try {
          parsedTags = JSON.parse(p.tags);
        } catch {
          parsedTags = [];
        }

        return {
          id: p.id,
          userId: p.userId,
          repositoryId: p.repositoryId,
          note: p.note,
          tags: parsedTags,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          repository: {
            id: p.repository.id,
            name: p.repository.name,
            fullName: p.repository.fullName,
            description: p.repository.description,
            htmlUrl: p.repository.htmlUrl,
            stars: p.repository.stars,
            forks: p.repository.forks,
            primaryLanguage: p.repository.primaryLanguage,
            developerUsername: p.repository.developer.githubUsername,
          },
        };
      });

      if (filter?.tag) {
        const targetTag = filter.tag.toLowerCase();
        items = items.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(targetTag));
      }

      if (filter?.search) {
        const q = filter.search.toLowerCase();
        items = items.filter(
          (p) =>
            p.repository.name.toLowerCase().includes(q) ||
            p.repository.fullName.toLowerCase().includes(q) ||
            (p.note && p.note.toLowerCase().includes(q))
        );
      }

      return items;
    } else {
      let items: PinItem[] = [];
      for (const p of memoryPins.values()) {
        if (p.userId === userId) {
          items.push(p);
        }
      }

      if (filter?.tag) {
        const targetTag = filter.tag.toLowerCase();
        items = items.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(targetTag));
      }

      if (filter?.search) {
        const q = filter.search.toLowerCase();
        items = items.filter(
          (p) =>
            p.repository.name.toLowerCase().includes(q) ||
            p.repository.fullName.toLowerCase().includes(q) ||
            (p.note && p.note.toLowerCase().includes(q))
        );
      }

      return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }

  /**
   * Returns a list of full repository names pinned by the user (for quick UI badge lookups).
   */
  public async getPinnedRepoFullNames(userId: string): Promise<string[]> {
    const pins = await this.getUserPins(userId);
    return pins.map((p) => p.repository.fullName);
  }

  /**
   * Updates note and tags for a pin owned by the user.
   */
  public async updatePin(
    userId: string,
    pinId: string,
    data: { note?: string | null; tags?: string[] }
  ): Promise<PinItem> {
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      const pin = await prisma.pin.findFirst({
        where: { id: pinId, userId },
      });

      if (!pin) {
        throw new AppError('Pin not found or unauthorized', 404);
      }

      const cleanTags = Array.isArray(data.tags)
        ? Array.from(new Set(data.tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)))
        : undefined;

      const updated = await prisma.pin.update({
        where: { id: pinId },
        data: {
          note: data.note !== undefined ? data.note : undefined,
          tags: cleanTags !== undefined ? JSON.stringify(cleanTags) : undefined,
        },
        include: {
          repository: {
            include: { developer: true },
          },
        },
      });

      let parsedTags: string[] = [];
      try {
        parsedTags = JSON.parse(updated.tags);
      } catch {
        parsedTags = [];
      }

      return {
        id: updated.id,
        userId: updated.userId,
        repositoryId: updated.repositoryId,
        note: updated.note,
        tags: parsedTags,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
        repository: {
          id: updated.repository.id,
          name: updated.repository.name,
          fullName: updated.repository.fullName,
          description: updated.repository.description,
          htmlUrl: updated.repository.htmlUrl,
          stars: updated.repository.stars,
          forks: updated.repository.forks,
          primaryLanguage: updated.repository.primaryLanguage,
          developerUsername: updated.repository.developer.githubUsername,
        },
      };
    } else {
      const pin = memoryPins.get(pinId);
      if (!pin || pin.userId !== userId) {
        throw new AppError('Pin not found or unauthorized', 404);
      }

      if (data.note !== undefined) pin.note = data.note;
      if (data.tags !== undefined) {
        pin.tags = Array.from(new Set(data.tags.map((t) => t.trim().toLowerCase()).filter((t) => t.length > 0)));
      }
      pin.updatedAt = new Date();
      return pin;
    }
  }

  /**
   * Deletes a pin owned by the user.
   */
  public async deletePin(userId: string, pinId: string): Promise<void> {
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      const pin = await prisma.pin.findFirst({
        where: { id: pinId, userId },
      });

      if (!pin) {
        throw new AppError('Pin not found or unauthorized', 404);
      }

      await prisma.pin.delete({
        where: { id: pinId },
      });
    } else {
      const pin = memoryPins.get(pinId);
      if (!pin || pin.userId !== userId) {
        throw new AppError('Pin not found or unauthorized', 404);
      }
      memoryPins.delete(pinId);
    }
  }

  /**
   * Deletes a pin by repository full name for the user.
   */
  public async unpinByFullName(userId: string, fullName: string): Promise<void> {
    const pins = await this.getUserPins(userId);
    const target = pins.find((p) => p.repository.fullName.toLowerCase() === fullName.toLowerCase());
    if (target) {
      await this.deletePin(userId, target.id);
    }
  }
}

export const pinService = new PinService();
