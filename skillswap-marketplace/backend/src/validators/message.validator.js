const { body } = require('express-validator')

const sendMessageRules = [
  body('receiverId')
    .notEmpty().withMessage('receiverId is required')
    .isMongoId().withMessage('receiverId must be a valid ID'),
  body('content')
    .notEmpty().withMessage('Message content is required')
    .isLength({ max: 5000 }).withMessage('Message too long'),
  body('type')
    .optional()
    .isIn(['text', 'image', 'file', 'booking_ref'])
    .withMessage('Invalid message type'),
]

module.exports = { sendMessageRules }
