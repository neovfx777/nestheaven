import { isDatabaseHealthy } from './config/db';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './modules/auth/auth.routes';

// API routes
app.use('/api/auth', authRoutes);
// app.use('/api/apartments', apartmentRoutes);
// app.use('/api/complexes', complexRoutes);
// app.use('/api/admin', adminRoutes);

// Health check endpoint
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
// Initialize Express application
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'nestheaven-api'
  });
});

// API routes will be mounted here
// app.use('/api/auth', authRoutes);
// app.use('/api/apartments', apartmentRoutes);
// app.use('/api/complexes', complexRoutes);
// app.use('/api/admin', adminRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware (will be enhanced later)
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export default app;