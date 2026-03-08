// src/repositories/message.repository.js
const mongoose = require('mongoose');
const Message  = require('../models/message.model');

class MessageRepository {
  async create(data) {
    const msg = await Message.create(data);
    return Message.findById(msg._id)
      .populate('senderId',   'name avatar _id')
      .populate('receiverId', 'name avatar _id')
      .lean();
  }

  async findByChatId(chatId, { page = 1, limit = 50 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Message.find({ chatId, isDeleted: false })
        .populate('senderId',   'name avatar _id')
        .populate('receiverId', 'name avatar _id')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Message.countDocuments({ chatId, isDeleted: false }),
    ]);
    return { data: data.reverse(), total };
  }

  async markRead(chatId, receiverId) {
    return Message.updateMany(
      { chatId, receiverId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUnreadCount(userId) {
    return Message.countDocuments({
      receiverId: new mongoose.Types.ObjectId(userId),
      isRead:     false,
    });
  }

  /**
   * Returns chat list for a user.
   * Each entry: { _id: chatId, lastMessage: { senderId, receiverId, content, ... }, unread, partner }
   * `partner` is always the OTHER person (not the requesting user).
   */
  async getUserChats(userId) {
    const oid = new mongoose.Types.ObjectId(userId);

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: oid }, { receiverId: oid }],
          isDeleted: false,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$chatId',
          lastMessage: { $first: '$$ROOT' },
          unread: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$receiverId', oid] },
                  { $eq: ['$isRead', false] },
                ]},
                1, 0,
              ],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
    ]);

    // Populate BOTH senderId and receiverId on lastMessage
    await Message.populate(chats, [
      { path: 'lastMessage.senderId',   select: 'name avatar _id', model: 'User' },
      { path: 'lastMessage.receiverId', select: 'name avatar _id', model: 'User' },
    ]);

    // Attach `partner` field — the person who is NOT the requesting user
    const userIdStr = userId.toString();
    return chats.map(chat => {
      const msg = chat.lastMessage;
      const senderIdStr   = msg.senderId?._id?.toString()   || msg.senderId?.toString();
      const receiverIdStr = msg.receiverId?._id?.toString() || msg.receiverId?.toString();

      // partner = the OTHER participant in this chat
      const partner = senderIdStr === userIdStr ? msg.receiverId : msg.senderId;

      return {
        ...chat,
        partner, // { _id, name, avatar }
      };
    });
  }

  async softDelete(id, senderId) {
    return Message.findOneAndUpdate(
      { _id: id, senderId },
      { isDeleted: true },
      { new: true }
    );
  }
}

module.exports = new MessageRepository();
