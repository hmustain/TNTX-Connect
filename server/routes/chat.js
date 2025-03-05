// server/routes/chat.js
const express = require('express');
const router = express.Router();
const {
  createChat,
  getChatsByTicket,
  getAllChats,
  getMyChats,
  getCompanyChats
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// All routes here require authentication
router.use(protect);

// Create a chat message
router.post('/', createChat);

// Get chat messages by ticket ID (accessible by authorized roles)
// Updated route: /api/chats/ticket/:ticketId
router.get('/ticket/:ticketId', getChatsByTicket);

// Additional endpoints for chat:
router.get('/all', getAllChats);          // Admins/Agents only
router.get('/mychats', getMyChats);         // Drivers only
router.get('/company', getCompanyChats);    // Company Users only

module.exports = router;
