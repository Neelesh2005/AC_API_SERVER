import { formatResponse } from '../src/utils/responseFormatter.js';

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('🚨 Error occurred:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : 'Stack hidden in production',
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    user: req.user?.id || 'anonymous'
  });

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      formatResponse('unauthorized', 'Invalid token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      formatResponse('unauthorized', 'Token expired')
    );
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return res.status(400).json(
      formatResponse('bad_request', message)
    );
  }

  // Supabase/PostgreSQL errors
  if (err.code) {
    let message = 'Database error';
    let statusCode = 500;

    switch (err.code) {
      case 'PGRST116':
        message = 'Resource not found';
        statusCode = 404;
        break;
      case 'PGRST202':
        message = 'Invalid request format';
        statusCode = 400;
        break;
      case '23505': // Unique constraint violation
        message = 'Resource already exists';
        statusCode = 409;
        break;
      case '23503': // Foreign key violation
        message = 'Referenced resource not found';
        statusCode = 400;
        break;
      case '42P01': // Table doesn't exist
        message = 'Service temporarily unavailable';
        statusCode = 503;
        break;
      default:
        message = err.message || 'Database error';
        statusCode = err.statusCode || 500;
    }

    return res.status(statusCode).json(
      formatResponse('error', message)
    );
  }

  // Default to 500 server error
  const statusCode = error.statusCode || err.status || 500;
  let message = error.message || 'Internal Server Error';

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Something went wrong on our end. Please try again later.';
  }

  res.status(statusCode).json(
    formatResponse('error', message, process.env.NODE_ENV === 'development' ? {
      stack: err.stack,
      details: error
    } : null)
  );
};

export default errorHandler;