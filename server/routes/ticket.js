// server/routes/ticket.js
const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTicketById,
  updateTicket,
  deleteTicket,
  getMyTickets,
  getAllTickets,
  getCompanyTickets,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

// Unified endpoint for ticket creation (supports breakdown fields)
router.post('/', upload.array('photos', 10), createTicket);

// Other endpoints remain unchanged
router.get('/', getAllTickets);
router.get('/mytickets', getMyTickets);
router.get('/company', getCompanyTickets);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);
router.delete('/:id', deleteTicket);

module.exports = router;
