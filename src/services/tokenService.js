const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

// Creates a signed JWT containing the user's ID and username
exports.signToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), username: user.username },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
};

// Verifies the signature and expiry of a JWT - throws if invalid or expired
exports.verifyToken = (token) => {
  return jwt.verify(token, jwtSecret);
};