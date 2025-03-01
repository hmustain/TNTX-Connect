// server/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      // Will come back later to add logic for sequential ticket numbers.
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Please provide a company'],
    },
    driverPhone: {
      type: String,
      required: [true, 'Please add the driver phone number'],
    },
    truckNumber: {
      type: String,
      required: [true, 'Please add the truck number'],
    },
    vinLast8: {
      type: String,
      required: [true, 'Please add the last 8 characters of the VIN'],
    },
    mileage: {
      type: Number,
      required: [true, 'Please add the mileage'],
    },
    trailerNumber: {
      type: String,
      required: [false, 'Please add the trailer number'],
    },
    loadStatus: {
      type: String,
      enum: ['empty', 'loaded'],
      required: [true, 'Please specify if the trailer is empty or loaded'],
    },
    loadNumber: {
      type: String,
      validate: {
        validator: function(v) {
          if (this.loadStatus === 'loaded') {
            return v != null && v.trim().length > 0;
          }
          return true;
        },
        message: 'Load number is required if the trailer is loaded.',
      },
    },
    unitAffected: {
      type: String,
      enum: ['tractor', 'trailer'],
      required: [true, 'Please specify if the unit affected is tractor or trailer'],
    },
    complaint: {
      type: String,
      required: [true, 'Please describe the complaint or issue'],
    },
    currentLocation: {
      type: String,
      required: [true, 'Please provide the current location'],
    },
    locationAddress: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    media: [
      {
        type: String, // URL or path for any uploaded pictures
      },
    ],
    // Add the status field as part of the schema fields
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
  },
  { timestamps: true } // Options object with timestamps
);

module.exports = mongoose.model('Ticket', ticketSchema);
