// src/controllers/review.controller.js
const reviewService = require('../services/review.service');
const { sendResponse } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/error.middleware');

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview({
    ...req.body,
    customerId: req.user.id,
  });
  sendResponse(res, 201, 'Review submitted', { review });
});

const getProviderReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getProviderReviews(req.params.id, req.query);
  sendResponse(res, 200, 'Reviews fetched', result);
});

const replyToReview = asyncHandler(async (req, res) => {
  const review = await reviewService.replyToReview(req.params.id, req.user.id, req.body.text);
  sendResponse(res, 200, 'Reply added', { review });
});

module.exports = { createReview, getProviderReviews, replyToReview };
