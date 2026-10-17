const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// Called when a client goes over the limit - 429 Too Many Requests
const limitHandler = (req, res, next, options) => {
  logger.warn('Rate limit exceeded', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip
  });

  res.status(options.statusCode).json({
    success: false,
    status: options.statusCode,
    message: options.message
  });
};

// Login: max 10 attempts per IP every 15 minutes js to protect against password guessing
exports.loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  handler: limitHandler
});

// Signup: max 10 accounts per IP every 15 minutes protects against mass account creation
exports.signupLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many signup attempts. Please try again after 15 minutes.',
  handler: limitHandler
});

// General API traffic: max 200 requests per IP every 15 minutes
exports.apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many requests. Please try again later.',
  handler: limitHandler
});