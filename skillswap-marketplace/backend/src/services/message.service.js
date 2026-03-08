// src/services/message.service.js
const messageRepo = require('../repositories/message.repository');
const Message = require('../models/message.model');
const { emitToUser, emitToChat } = require('../config/socket');
const { ApiError, buildPaginationMeta } = require('../utils/response.utils');

class MessageService {
  async sendMessage({ senderId, receiverId, content, type = 'text', attachmentUrl }) {
    if (senderId.toString() === receiverId.toString()) {
      throw ApiError.badRequest('Cannot send message to yourself');
    }

    const chatId = Message.buildChatId(senderId, receiverId);

    const message = await messageRepo.create({
      chatId,
      senderId,
      receiverId,
      content,
      type,
      attachmentUrl,
    });

    // ── Real-time delivery ───────────────────────────
    try {
      emitToUser(receiverId.toString(), 'new_message', {
        message,
        chatId,
      });
      emitToChat(chatId, 'new_message', { message });
    } catch { /* non-critical */ }

    return message;
  }

  async getMessages(chatId, requesterId, { page = 1, limit = 50 } = {}) {
    // Verify requester is part of this chat
    const [id1, id2] = chatId.split('_');
    if (![id1, id2].includes(requesterId.toString())) {
      throw ApiError.forbidden('Access denied to this conversation');
    }

    const { data, total } = await messageRepo.findByChatId(chatId, { page: Number(page), limit: Number(limit) });

    // Mark as read for receiver
    await messageRepo.markRead(chatId, requesterId);

    return {
      messages: data,
      meta: buildPaginationMeta(total, page, limit),
    };
  }

  async getUserChats(userId) {
    return messageRepo.getUserChats(userId);
  }

  async getUnreadCount(userId) {
    return messageRepo.getUnreadCount(userId);
  }
}

module.exports = new MessageService();
