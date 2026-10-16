import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, checkDatabaseConnection } from '../db/prisma';
import { config } from '../config/environment';
import { AppError } from '../middleware/errorHandler';
import { AuthTokenPayload, UserPayload } from '../types';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

// Fallback in-memory store in case PostgreSQL is temporarily unavailable during offline testing
interface MemoryUser {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
const memoryUsers = new Map<string, MemoryUser>();

export class AuthService {
  /**
   * Generates a signed JWT authentication token for a given user.
   */
  public generateToken(user: { id: string; email: string; name?: string | null }): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name || null,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Registers a new user with hashed password and generates a session token.
   */
  public async register(input: RegisterInput): Promise<{ user: UserPayload; token: string }> {
    const { email, password, name } = input;
    const dbStatus = await checkDatabaseConnection();

    // Check if user already exists
    if (dbStatus.connected) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError('An account with this email address already exists', 409);
      }
    } else {
      if (memoryUsers.has(email)) {
        throw new AppError('An account with this email address already exists', 409);
      }
    }

    // Salt and hash password (10 rounds is industry standard)
    const passwordHash = await bcrypt.hash(password, 10);

    let createdUser: { id: string; email: string; name?: string | null };

    if (dbStatus.connected) {
      const dbUser = await prisma.user.create({
        data: {
          email,
          passwordHash,
          name: name || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });
      createdUser = dbUser;
    } else {
      const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const memUser: MemoryUser = {
        id,
        email,
        passwordHash,
        name: name || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryUsers.set(email, memUser);
      createdUser = { id, email, name: memUser.name };
    }

    const token = this.generateToken(createdUser);

    return {
      user: {
        id: createdUser.id,
        email: createdUser.email,
        name: createdUser.name,
      },
      token,
    };
  }

  /**
   * Validates user credentials and issues a new session token.
   */
  public async login(input: LoginInput): Promise<{ user: UserPayload; token: string }> {
    const { email, password } = input;
    const dbStatus = await checkDatabaseConnection();

    let userRecord: { id: string; email: string; passwordHash: string; name?: string | null } | null = null;

    if (dbStatus.connected) {
      userRecord = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, passwordHash: true, name: true },
      });
    } else {
      userRecord = memoryUsers.get(email) || null;
    }

    if (!userRecord) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, userRecord.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const user: UserPayload = {
      id: userRecord.id,
      email: userRecord.email,
      name: userRecord.name,
    };

    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Fetches user profile by ID without returning password hash.
   */
  public async getProfile(userId: string): Promise<UserPayload> {
    const dbStatus = await checkDatabaseConnection();

    if (dbStatus.connected) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });
      if (!user) {
        throw new AppError('User profile not found', 404);
      }
      return user;
    } else {
      for (const u of memoryUsers.values()) {
        if (u.id === userId) {
          return { id: u.id, email: u.email, name: u.name };
        }
      }
      throw new AppError('User profile not found', 404);
    }
  }
}

export const authService = new AuthService();
