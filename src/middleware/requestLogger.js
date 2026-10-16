const logger = require('../utils/logger');

// Logs every request after the response is sent;
// timestamp, method, path, status, duration, IP and user ID.
// Headers and bodies are NOT logged, so passwords and JWT tokens never reach the log file
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const status = res.statusCode;
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';

    logger.log(level, 'HTTP request', {
      method: req.method,
      path: req.originalUrl,
      status,
      duration_ms: Date.now() - start,
      ip: req.ip,
      userId: req.user ? req.user.id : undefined
    });
  });

  next();
};

module.exports = requestLogger;