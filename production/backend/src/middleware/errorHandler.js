/**
 * Central error handler
 */
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'File too large',
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Bad Request',
      message: err.message,
    });
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors,
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Not Found',
      message: 'Record not found',
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
    });
  }

  // Log full error details for debugging
  console.error('Unhandled error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    code: err.code,
    meta: err.meta,
  });

  // Ensure response hasn't been sent
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  } else {
    // If headers already sent, try to end the response
    res.end();
  }
}

module.exports = { errorHandler };
