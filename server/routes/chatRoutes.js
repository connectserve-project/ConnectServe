const express = require('express');
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', upload.single('media'), sendMessage);

module.exports = router;
