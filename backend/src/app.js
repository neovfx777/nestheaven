const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

// YANGI: Status routes import qilamiz
const statusRoutes = require('./modules/apartments/status.routes');

const app = express();

const corsOptions = {
  origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

app.use('/api', routes);

// YANGI: Status routes ni qo'shamiz
app.use('/api/apartment-status', statusRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

module.exports = app;