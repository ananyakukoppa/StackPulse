import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// Also try loading from root directory if running from server subdir
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/stackpulse?schema=public',
  jwt: {
    secret: process.env.JWT_SECRET || 'stackpulse_default_jwt_secret_dev_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  github: {
    token: process.env.GITHUB_TOKEN || '',
    cacheTtlMs: parseInt(process.env.DEVELOPER_CACHE_TTL_MS || '3600000', 10), // 1 hour default
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 200, // limit each IP to 200 requests per windowMs
  },
};
