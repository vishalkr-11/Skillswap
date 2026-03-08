// src/controllers/message.controller.js
const messageService = require('../services/message.service');
const { sendResponse } = require('../utils/response.utils');
const { asyncHandler } = require('../middleware/error.middleware');

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage({
    ...req.body,
    senderId: req.user.id,
  });
  sendResponse(res, 201, 'Message sent', { message });
});

const getMessages = asyncHandler(async (req, res) => {
  const result = await messageService.getMessages(req.params.chatId, req.user.id, req.query);
  sendResponse(res, 200, 'Messages fetched', result);
});

const getUserChats = asyncHandler(async (req, res) => {
  const chats = await messageService.getUserChats(req.user.id);
  sendResponse(res, 200, 'Chats fetched', { chats });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await messageService.getUnreadCount(req.user.id);
  sendResponse(res, 200, 'Unread count', { unread: count });
});

module.exports = { sendMessage, getMessages, getUserChats, getUnreadCount };
