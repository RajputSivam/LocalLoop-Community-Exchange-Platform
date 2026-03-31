const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { messageController: c } = require('../controllers/allControllers');
router.get('/', protect, c.getConversations);
router.get('/:chatId', protect, c.getChatMessages);
router.post('/', protect, c.sendMessage);
module.exports = router;
