// src/routes/message.routes.js
const router = require('express').Router();
const messageController = require('../controllers/message.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/',                          messageController.getConversations);
router.get('/unread',                    messageController.getUnreadCount);
router.get('/:userId',                   messageController.getConversation);
router.post('/:userId',                  messageController.sendMessage);

module.exports = router;