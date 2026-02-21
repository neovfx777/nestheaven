const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const path = require('path');
const env = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const { buildCorsOptions, apiLimiter, authLimiter, chatLimiter } = require('./middleware/security');
const routes = require('./routes');

// Route imports
const statusRoutes = require('./modules/apartments/status.routes');
const sellersRoutes = require('./modules/users/sellers.routes');

const app = express();

app.disable('x-powered-by');
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);
app.use(
  compression({
    level: 6,
    threshold: 1024,
  })
);
app.use(hpp());
app.use(cors(buildCorsOptions()));
app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: env.BODY_LIMIT }));

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/chat', chatLimiter);
app.use('/api', apiLimiter);

// Static files
app.use(
  '/uploads',
  express.static(path.join(process.cwd(), env.UPLOAD_DIR), {
    dotfiles: 'deny',
    index: false,
    maxAge: '1d',
    setHeaders(res) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

// IMPORTANT: Specific routes FIRST, then general routes
app.use('/api/users/sellers', sellersRoutes);
app.use('/api/apartment-status', statusRoutes);

// Then the main API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  });
});

// Error handler
app.use(errorHandler);

module.exports = app;
