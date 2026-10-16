// Wraps async route handlers, any thrown error is passed to the centralized error handler 
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;