const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * @param {Object} payload - { userId, email, role }
 * @returns {string} JWT token
 */
function signToken(payload) {
  return jwt.sign(
    payload,
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * @param {string} token
 * @returns {Object} Decoded payload or null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, verifyToken };
