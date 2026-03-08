// src/services/auth.service.js
const userRepo = require('../repositories/user.repository');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils');
const { ApiError } = require('../utils/response.utils');

// Safely serialise user for API response — always include both id and _id
function serializeUser(user) {
  return {
    _id:    user._id,
    id:     user._id,           // frontend normalises around both
    name:   user.name,
    email:  user.email,
    role:   user.role,
    avatar: user.avatar || null,
    bio:    user.bio   || '',
    skillsOffered: user.skillsOffered || [],
    rating: user.rating || { average: 0, count: 0 },
    location: user.location || null,
    isVerified: user.isVerified || false,
  };
}

class AuthService {
  async register({ name, email, password, role = 'customer' }) {
    const exists = await userRepo.exists(email);
    if (exists) throw ApiError.conflict('Email already registered');

    if (!['customer', 'provider'].includes(role)) {
      throw ApiError.badRequest('Role must be customer or provider');
    }

    const user = await userRepo.create({ name, email, password, role });

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken  = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepo.updateRefreshToken(user._id, refreshToken);

    return { user: serializeUser(user), accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await userRepo.findByEmail(email, true);
    if (!user) throw ApiError.unauthorized('Invalid email or password');
    if (!user.isActive) throw ApiError.forbidden('Account deactivated. Contact support.');

    const valid = await user.comparePassword(password);
    if (!valid) throw ApiError.unauthorized('Invalid email or password');

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken  = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepo.updateRefreshToken(user._id, refreshToken);

    return { user: serializeUser(user), accessToken, refreshToken };
  }

  async refresh(token) {
    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const user = await userRepo.findById(decoded.id, '+refreshToken');
    if (!user || user.refreshToken !== token) {
      throw ApiError.unauthorized('Refresh token revoked');
    }

    const payload = { id: user._id.toString(), role: user.role };
    const accessToken  = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await userRepo.updateRefreshToken(user._id, refreshToken);
    return { accessToken, refreshToken };
  }

  async logout(userId) {
    await userRepo.updateRefreshToken(userId, null);
  }

  async getMe(userId) {
    const user = await userRepo.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return serializeUser(user);
  }
}

module.exports = new AuthService();
