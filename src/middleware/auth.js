const User = require('../models/User');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { verifyToken } = require('../services/tokenService');

// Protects routes: requires a valid "Authorization: Bearer <jwt>" header.
// On success, the logged-in user's identity is attached to req.user.
const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      logger.warn('Auth failed: missing token', { method: req.method, path: req.originalUrl, ip: req.ip });
      throw new AppError(401, 'Authentication required. Missing token.');
    }

    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      logger.warn('Auth failed: bad authorization header format', { path: req.originalUrl, ip: req.ip });
      throw new AppError(401, 'Invalid authorization header. Use: Bearer <token>');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logger.warn('Auth failed: expired token', { path: req.originalUrl, ip: req.ip });
        throw new AppError(401, 'Token has expired. Please log in again.');
      }
      logger.warn('Auth failed: invalid token', { path: req.originalUrl, ip: req.ip });
      throw new AppError(401, 'Invalid token.');
    }

    // Make sure the user in the token still exists in the database
    const user = await User.findById(payload.sub);
    if (!user) {
      logger.warn('Auth failed: user in token no longer exists', { path: req.originalUrl, ip: req.ip });
      throw new AppError(401, 'User for this token no longer exists.');
    }

    // The owner ID always comes from the verified token never from the client
    req.user = { id: user._id.toString(), username: user.username };
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;