import { PrismaClient } from '@prisma/client';
import { config } from '../config/environment';

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

export const prisma =
  global.globalPrisma ||
  new PrismaClient({
    log: config.isProduction ? ['error'] : ['warn', 'error'],
  });

if (!config.isProduction) {
  global.globalPrisma = prisma;
}

export async function checkDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, message: 'Database connection established successfully' };
  } catch (error: any) {
    const errorMsg = error?.message || 'Unknown database error';
    return {
      connected: false,
      message: `Database unreachable (${errorMsg.substring(0, 100)}...). Please ensure PostgreSQL is running and DATABASE_URL is configured.`,
    };
  }
}

export default prisma;
