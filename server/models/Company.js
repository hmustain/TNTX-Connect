// server/models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a company name']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Company', companySchema);
