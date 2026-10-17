const { body, checkExact } = require('express-validator');

const UNKNOWN_FIELDS_MSG = 'Unknown field(s) in request';

// POST /api/v1/user/signup
exports.signupRules = checkExact(
  [
    body('username')
      .exists({ values: 'falsy' }).withMessage('Username is required').bail()
      .isString().withMessage('Username must be a string').bail()
      .trim()
      .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
      .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Username can only contain letters, numbers, dots, underscores and hyphens'),

    body('email')
      .exists({ values: 'falsy' }).withMessage('Email is required').bail()
      .isString().withMessage('Email must be a string').bail()
      .trim()
      .isEmail().withMessage('Email must be a valid email address')
      .isLength({ max: 100 }).withMessage('Email must be at most 100 characters')
      .toLowerCase(),

    body('password')
      .exists({ values: 'falsy' }).withMessage('Password is required').bail()
      .isString().withMessage('Password must be a string').bail()
      .isLength({ min: 8, max: 64 }).withMessage('Password must be between 8 and 64 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
  ],
  { message: UNKNOWN_FIELDS_MSG }
);

// POST /api/v1/user/login  (username + password  OR  email + password)
exports.loginRules = checkExact(
  [
    body('username')
      .custom((value, { req }) => {
        if (!value && !req.body.email) {
          throw new Error('Username or email is required');
        }
        return true;
      }),

    body('username')
      .optional({ values: 'falsy' })
      .isString().withMessage('Username must be a string').bail()
      .trim()
      .isLength({ max: 30 }).withMessage('Username must be at most 30 characters'),

    body('email')
      .optional({ values: 'falsy' })
      .isString().withMessage('Email must be a string').bail()
      .trim()
      .isEmail().withMessage('Email must be a valid email address')
      .toLowerCase(),

    body('password')
      .exists({ values: 'falsy' }).withMessage('Password is required').bail()
      .isString().withMessage('Password must be a string')
      .isLength({ max: 64 }).withMessage('Password must be at most 64 characters')
  ],
  { message: UNKNOWN_FIELDS_MSG }
);