// server/routes/chat.js
const express = require('express');
const router = express.Router();
const { createChat, getChatsByTicket } = require('../controllers/chatController');

// Create a chat message
router.post('/', createChat);

// Get chat messages by ticket ID
router.get('/ticket/:ticketId', getChatsByTicket);

module.exports = router;
