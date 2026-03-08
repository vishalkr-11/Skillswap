// src/controllers/ai.controller.js
const aiService = require('../services/ai.service');
const { sendResponse } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/error.middleware');

const recommend = asyncHandler(async (req, res) => {
  const result = await aiService.recommend(req.body);
  sendResponse(res, 200, 'AI recommendations generated', result);
});

module.exports = { recommend };
