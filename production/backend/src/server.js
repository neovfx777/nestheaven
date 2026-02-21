const app = require('./app');
const env = require('./config/env');

let server;

function logFatal(label, error) {
  if (env.NODE_ENV === 'production') {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${label}: ${message}`);
    return;
  }
  console.error(label, error);
}

function shutdown(exitCode = 0) {
  if (!server) {
    process.exit(exitCode);
    return;
  }

  server.close(() => {
    process.exit(exitCode);
  });

  setTimeout(() => process.exit(exitCode), 10000).unref();
}

process.on('unhandledRejection', (reason) => {
  logFatal('Unhandled Rejection', reason);
  shutdown(1);
});

process.on('uncaughtException', (error) => {
  logFatal('Uncaught Exception', error);
  shutdown(1);
});

server = app.listen(env.PORT, env.HOST, () => {
  console.log(`Server running on ${env.HOST}:${env.PORT} (${env.NODE_ENV})`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.PORT} is already in use`);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  shutdown(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  shutdown(0);
});

module.exports = server;
