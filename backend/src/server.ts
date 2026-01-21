import { env } from './config/env';
import app from './app';

const startServer = async () => {
  try {
    // Validate environment variables
    console.log('✅ Environment variables validated');
    
    // Start the server
    const server = app.listen(env.PORT, () => {
      console.log(`
🚀 Server running in ${env.NODE_ENV} mode
📡 API available at http://localhost:${env.PORT}
🔗 Health check: http://localhost:${env.PORT}/health
🕐 Started at: ${new Date().toISOString()}
      `);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('🛑 Received shutdown signal, closing server...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Only start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { startServer };