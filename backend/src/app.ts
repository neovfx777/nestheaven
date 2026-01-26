import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env } from './config/env';
import { isDatabaseHealthy } from './config/db';

// Routes
import authRoutes from './modules/auth/auth.routes';
import adminRoutes from './modules/admin/admin.routes';
import apartmentRoutes from './modules/apartments/apartment.routes';
import complexRoutes from './modules/complexes/complex.routes';
import userRoutes from './modules/users/user.routes';
import { analyticsRoutes } from './modules/analytics/analytics.routes';

// Initialize Express application
const app = express();

/* =========================
   Security & Core Middleware
   ========================= */

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

/* =========================
   Static Files
   ========================= */

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

/* =========================
   API Routes
   ========================= */

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/complexes', complexRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes); // MOVED HERE with other routes!

/* =========================
   Health Check
   ========================= */

app.get('/health', async (req, res) => {
  const dbHealthy = await isDatabaseHealthy();
  const status = dbHealthy ? 200 : 503;

  res.status(status).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    service: 'nestheaven-api',
    database: dbHealthy ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

/* =========================
   404 Handler
   ========================= */

app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

/* =========================
   Global Error Handler
   ========================= */

app.use((
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  console.error(err.stack);

  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong'
  });
});

export default app;