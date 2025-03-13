// server/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    // Trimble identifiers
    trimbleOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    ticketNumber: { // Mapped from "orderNumber"
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'], // based on Trimble "status"
      default: 'OPEN',
    },
    openedDate: {
      type: Date,
    },
    closedDate: {
      type: Date,
    },
    // Vendor information (if needed)
    vendor: {
      code: String,
      name: String,
      phone: String,
      city: String,
      state: String,
    },
    // Unit Number and its details
    unitNumber: {
      value: String,
      details: {
        UnitNumber: String,
        UnitType: String,
        Make: String,
        Model: String,
        ModelYear: String,
        SerialNo: String,
        NameCustomer: String,
      }
    },
    // Customer information, mapped to Company if applicable
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    // Road call details
    roadCallId: {
      type: String,
    },
    roadCallNum: {
      type: String,
    },
    roadCallLink: {
      type: String,
    },
    // If any other fields are still relevant, they can be kept or removed based on your needs
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
