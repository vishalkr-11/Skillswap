// src/models/message.model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    index: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: 5000,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'booking_ref'],
    default: 'text',
  },
  attachmentUrl: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => { delete ret.__v; return ret; },
  },
});

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

// ── Static: build chatId from two user IDs ───────────
messageSchema.statics.buildChatId = function (id1, id2) {
  return [id1.toString(), id2.toString()].sort().join('_');
};

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
