const { validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

// Runs after the validation rules - if any rule failed, stop and return 400 with the details
const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array({ onlyFirstError: true }).map((e) => {
    if (e.type === 'unknown_fields') {
      return {
        field: e.fields.map((f) => f.path).join(', '),
        message: e.msg
      };
    }
    return { field: e.path, message: e.msg };
  });

  next(new AppError(400, 'Validation failed', errors));
};

module.exports = validate;