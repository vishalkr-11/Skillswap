// src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const { sendResponse } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/error.middleware');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendResponse(res, 201, 'Registration successful', result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendResponse(res, 200, 'Login successful', result);
});

const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);
  sendResponse(res, 200, 'Token refreshed', result);
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  sendResponse(res, 200, 'Logged out successfully');
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  sendResponse(res, 200, 'Profile fetched', { user });
});

module.exports = { register, login, refresh, logout, getMe };
