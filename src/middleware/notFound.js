const AppError = require('../utils/AppError');

// Handles any route that does not exist
const notFound = (req, res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;