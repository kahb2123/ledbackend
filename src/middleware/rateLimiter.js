const rateLimit = require('express-rate-limit');

// Check environment
const isDevelopment = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Skip rate limiting in development/test
const shouldSkip = (req) => {
  return isDevelopment || isTest || req.user?.role === 'admin';
};

// Create custom limiter factory
const createLimiter = (windowMs, max, message, options = {}) => {
  return rateLimit({
    windowMs,
    max: isDevelopment ? max * 10 : max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // Use default key generator (handles IPv6 properly)
    skip: shouldSkip,
    handler: (req, res) => {
      res.status(429).json({
        error: message,
        retryAfter: Math.ceil(windowMs / 1000 / 60) + ' minutes'
      });
    },
    ...options
  });
};

// Authentication limiter
const authLimiter = createLimiter(
  15 * 60 * 1000, // 15 minutes
  5,
  'Too many login attempts, please try again later'
);

// Order creation limiter
const orderLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  50,
  'Too many orders created. Please wait before creating more.'
);

// Price calculation limiter
const priceCalcLimiter = createLimiter(
  60 * 1000, // 1 minute
  60,
  'Too many price calculations. Please wait a moment.'
);

// General API limiter
const apiLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  1000,
  'Too many requests, please try again later'
);

// Staff/Admin routes limiter
const staffLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  5000,
  'Too many requests'
);

// File upload limiter
const uploadLimiter = createLimiter(
  60 * 60 * 1000, // 1 hour
  100,
  'Too many uploads, please try again later'
);

module.exports = {
  authLimiter,
  orderLimiter,
  priceCalcLimiter,
  apiLimiter,
  staffLimiter,
  uploadLimiter
};
