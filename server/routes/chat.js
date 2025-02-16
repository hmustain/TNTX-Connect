// server/routes/chat.js
const express = require('express');
const router = express.Router();
const { createChat, getChatsByTicket } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Create a chat message
router.post('/', protect, createChat);

// Get chat messages by ticket ID
router.get('/ticket/:ticketId', protect, getChatsByTicket);

module.exports = router;
