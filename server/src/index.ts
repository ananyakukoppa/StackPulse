import { createApp } from './app';
import { config } from './config/environment';
import { checkDatabaseConnection, prisma } from './db/prisma';

const startServer = async () => {
  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 StackPulse API Server running on port ${config.port}`);
    console.log(`🔗 API Base URL: http://localhost:${config.port}/api`);
    console.log(`🏥 Health Endpoint: http://localhost:${config.port}/api/health`);
    console.log(`🌐 Allowed Client: ${config.clientUrl}`);
    console.log(`⚙️  Environment: ${config.nodeEnv}`);
    console.log(`=======================================================`);
  });

  // Verify database connection asynchronously
  checkDatabaseConnection().then((status) => {
    if (status.connected) {
      console.log(`✅ [Database] PostgreSQL connected successfully.`);
    } else {
      console.warn(`⚠️ [Database] ${status.message}`);
    }
  });

  // Graceful shutdown handling
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('🔒 HTTP server closed.');
      try {
        await prisma.$disconnect();
        console.log('🔌 Database connection closed.');
      } catch (err) {
        console.error('Error disconnecting database:', err);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

startServer().catch((error) => {
  console.error('Fatal error starting server:', error);
  process.exit(1);
});
