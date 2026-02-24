const env = require('../config/env');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'File too large',
    });
    return;
  }

  if (err.message && err.message.includes('Invalid file type')) {
    res.status(400).json({
      error: 'Bad Request',
      message: err.message,
    });
    return;
  }

  if (err.name === 'ZodError') {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors,
    });
    return;
  }

  if (err.code === 'P2002') {
    res.status(409).json({
      error: 'Conflict',
      message: 'A record with this value already exists',
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      error: 'Not Found',
      message: 'Record not found',
    });
    return;
  }

  if (err.statusCode) {
    res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
    });
    return;
  }

  if (env.NODE_ENV === 'production') {
    console.error('Unhandled error:', {
      method: req.method,
      path: req.originalUrl,
      message: err?.message || 'Unknown error',
      code: err?.code,
    });
  } else {
    console.error('Unhandled error:', err);
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

module.exports = { errorHandler };
