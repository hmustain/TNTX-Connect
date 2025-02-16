// server/routes/ticket.js
const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');

// Create a ticket
router.post('/', createTicket);

// Get all tickets
router.get('/', getTickets);

// Get single ticket by ID
router.get('/:id', getTicketById);

// Update ticket by ID
router.put('/:id', updateTicket);

// Delete ticket by ID
router.delete('/:id', deleteTicket);

module.exports = router;
