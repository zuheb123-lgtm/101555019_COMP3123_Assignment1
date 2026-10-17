const express = require('express');
const userController = require('../controllers/userController');
const { signupRules, loginRules } = require('../validators/userValidators');
const validate = require('../middleware/validate');
const { signupLimiter, loginLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Order: rate limit -> validation rules -> check validation result -> controller
router.post('/signup', signupLimiter, signupRules, validate, userController.signup);
router.post('/login', loginLimiter, loginRules, validate, userController.login);

module.exports = router;