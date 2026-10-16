const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

// Centralized error handler- evrgy wrror is here
// and is returned as a consistent JSON response

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details;

  if (err instanceof AppError) {
    // Errors i created on purpose (400, 401, 403, 404, 409..)
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err.type === 'entity.parse.failed') {
    // Malformed JSON body
    statusCode = 400;
    message = 'Malformed JSON in request body';
  } else if (err.type === 'entity.too.large') {
    statusCode = 413;
    message = 'Request body is too large';
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation error
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    // Invalid MongoDB ObjectId or wrong data type
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    // Duplicate key (a unique index) error from MongoDB
    statusCode = 409;
    const fields = Object.keys(err.keyPattern || {}).filter((f) => f !== 'user');
    message = `${fields.join(', ') || 'Resource'} already exists`;
  }

  const logMeta = {
    method: req.method,
    path: req.originalUrl,
    status: statusCode,
    userId: req.user ? req.user.id : undefined,
    ip: req.ip
  };

  if (details) {
    // Only field names are logged, never the submitted values 
    logMeta.fields = details.map((d) => d.field);
  }

  if (statusCode >= 500) {
    // Full error details go to the local log file only - not to the client
    logger.error(`Server error: ${err.message}`, { ...logMeta, stack: err.stack });
  } else {
    logger.warn(message, logMeta);
  }

  const body = { success: false, status: statusCode, message };
  if (details) body.errors = details;

  res.status(statusCode).json(body);
};

module.exports = errorHandler;