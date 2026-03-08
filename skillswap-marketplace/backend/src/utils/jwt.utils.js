// src/utils/jwt.utils.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = () => process.env.JWT_SECRET;
const JWT_EXPIRES_IN = () => process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_SECRET = () => process.env.JWT_REFRESH_SECRET;
const REFRESH_EXPIRES_IN = () => process.env.JWT_REFRESH_EXPIRES_IN || '30d';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET(), { expiresIn: JWT_EXPIRES_IN() });
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET(), { expiresIn: REFRESH_EXPIRES_IN() });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET());
}

function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_SECRET());
}

function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
};
