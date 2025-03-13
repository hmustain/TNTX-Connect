// server/models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    trimbleCode: {  // e.g., "BIGM"
      type: String,
      required: true,
      unique: true
    },
    name: { // "BIG M TRANSPORTATION INC"
      type: String,
      required: true,
    },
    address1: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    zipcode: {
      type: String,
    },
    mainPhone: {
      type: String,
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', companySchema);
