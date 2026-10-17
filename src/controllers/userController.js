const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const { signToken } = require('../services/tokenService');
const { jwtExpiresIn } = require('../config/env');

// POST /api/v1/user/signup  ->  201 Created
exports.signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check for duplicates first so we can say exactly which field is taken (409 Conflict)
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) {
    const field = existing.username === username ? 'Username' : 'Email';
    logger.warn('Signup rejected: duplicate user', { field: field.toLowerCase(), ip: req.ip });
    throw new AppError(409, `${field} already exists`);
  }

  // Password is hashed automatically by the pre-save hook in the User model
  const user = await User.create({ username, email, password });

  logger.info('User signed up', { userId: user._id.toString(), username: user.username });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: user.toJSON()
  });
});

// POST /api/v1/user/login  ->  200 OK + JWT
exports.login = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Login with email if provided, otherwise with username
  const query = email ? { email } : { username };
  const loginType = email ? 'email' : 'username';

  // Password hash is hidden by default, so we explicitly select it here to compare
  const user = await User.findOne(query).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    logger.warn('Login failed: invalid credentials', { loginType, ip: req.ip });
    throw new AppError(401, 'Invalid username/email or password');
  }

  const token = signToken(user);

  logger.info('Login successful', { userId: user._id.toString(), username: user.username, loginType });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    token_type: 'Bearer',
    expires_in: jwtExpiresIn,
    user: user.toJSON()
  });
});