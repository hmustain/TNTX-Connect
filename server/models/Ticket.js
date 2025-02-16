// server/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      // Will come back later toadd logic (e.g., a pre-save hook or a counter collection)
      // to auto-generate sequential ticket numbers (e.g., "00001")
    },
    // Reference the logged-in driver (User model) so we can access driver details
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Reference the logged-in driver's company in the Company Model
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: [true, 'Please provide a company']
      },
    truckNumber: {
      type: String,
      required: [true, 'Please add the truck number']
    },
    vinLast8: {
      type: String,
      required: [true, 'Please add the last 8 characters of the VIN']
    },
    mileage: {
      type: Number,
      required: [true, 'Please add the mileage']
    },
    trailerNumber: {
      type: String,
      required: [true, 'Please add the trailer number']
    },
    loadStatus: {
        type: String,
        enum: ['empty', 'loaded'],
        required: [true, 'Please specify if the trailer is empty or loaded']
      },
      loadNumber: {
        type: String,
        validate: {
          validator: function(v) {
            // If the trailer is loaded, loadNumber must be provided
            if (this.loadStatus === 'loaded') {
              return v != null && v.trim().length > 0;
            }
            // If not loaded, it's fine for loadNumber to be empty
            return true;
          },
          message: 'Load number is required if the trailer is loaded.'
        }
      },      
    complaint: {
      type: String,
      required: [true, 'Please describe the complaint or issue']
    },
    currentLocation: {
      type: String,
      required: [true, 'Please provide the current location']
    },
    media: [
      {
        type: String // URL or path for any uploaded pictures
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
