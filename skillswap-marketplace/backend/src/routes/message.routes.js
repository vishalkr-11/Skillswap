// src/routes/message.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/message.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { sendMessageRules } = require('../validators/message.validator');

// All message routes require auth

// GET  /api/messages/chats  (user's chat list)
router.get('/chats', authenticate, ctrl.getUserChats);

// GET  /api/messages/unread  (unread count)
router.get('/unread', authenticate, ctrl.getUnreadCount);

// GET  /api/messages/:chatId  (conversation history)
router.get('/:chatId', authenticate, ctrl.getMessages);

// POST /api/messages  (send message)
router.post('/', authenticate, sendMessageRules, validate, ctrl.sendMessage);

module.exports = router;
