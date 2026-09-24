const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, jwtRefreshSecret, jwtRefreshExpiresIn } = require('../config/env');

function generateAccessToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user._id }, jwtRefreshSecret, { expiresIn: jwtRefreshExpiresIn });
}

module.exports = { generateAccessToken, generateRefreshToken };
