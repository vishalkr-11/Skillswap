// src/config/socket.js
const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt.utils');
const logger = require('../utils/logger');

let io = null;

// In-memory map: userId → socketId(s)
const onlineUsers = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: (process.env.ALLOWED_ORIGINS || '').split(','),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // ── Auth middleware ────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = verifyToken(token);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info(`Socket connected: userId=${userId} socketId=${socket.id}`);

    // Track user
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    // Broadcast online status
    socket.broadcast.emit('user_online', { userId });

    // ── Join personal room ─────────────────────────
    socket.join(`user:${userId}`);

    // ── Join conversation room ─────────────────────
    socket.on('join_chat', ({ chatId }) => {
      socket.join(`chat:${chatId}`);
    });

    socket.on('leave_chat', ({ chatId }) => {
      socket.leave(`chat:${chatId}`);
    });

    // ── Typing indicator ───────────────────────────
    socket.on('typing', ({ chatId, receiverId }) => {
      socket.to(`user:${receiverId}`).emit('user_typing', {
        chatId,
        senderId: userId,
      });
    });

    socket.on('stop_typing', ({ chatId, receiverId }) => {
      socket.to(`user:${receiverId}`).emit('user_stop_typing', {
        chatId,
        senderId: userId,
      });
    });

    // ── Disconnect ─────────────────────────────────
    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          socket.broadcast.emit('user_offline', { userId });
        }
      }
      logger.info(`Socket disconnected: userId=${userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
}

// Emit to a specific user across all their sockets
function emitToUser(userId, event, data) {
  if (io) io.to(`user:${userId}`).emit(event, data);
}

// Emit to all participants in a chat room
function emitToChat(chatId, event, data) {
  if (io) io.to(`chat:${chatId}`).emit(event, data);
}

module.exports = { initSocket, getIO, emitToUser, emitToChat, onlineUsers };
