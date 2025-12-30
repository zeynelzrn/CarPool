const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessagesByRide,
  getConversations
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.post('/', protect, sendMessage);
router.get('/ride/:rideId', protect, getMessagesByRide);
router.get('/conversations', protect, getConversations);

module.exports = router;

