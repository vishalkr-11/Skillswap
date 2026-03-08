// src/controllers/provider.controller.js
const providerService = require('../services/provider.service');
const { sendResponse } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/error.middleware');

const listProviders = asyncHandler(async (req, res) => {
  const result = await providerService.listProviders(req.query);
  sendResponse(res, 200, 'Providers fetched', result);
});

const getProvider = asyncHandler(async (req, res) => {
  // providerService.getProvider already returns { provider, ratingStats }
  // — spread directly so the response is data: { provider, ratingStats }
  const result = await providerService.getProvider(req.params.id);
  sendResponse(res, 200, 'Provider fetched', result);
});

const searchNearby = asyncHandler(async (req, res) => {
  const providers = await providerService.searchProviders(req.query);
  sendResponse(res, 200, 'Nearby providers fetched', { providers });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await providerService.updateProfile(req.user.id, req.body);
  sendResponse(res, 200, 'Profile updated', { user });
});

module.exports = { listProviders, getProvider, searchNearby, updateProfile };
