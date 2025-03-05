// server/seedCompanies.js
require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const connectDB = require('./config/db');

const seedCompanies = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Clear the companies collection
    await Company.deleteMany({});

    // Define an array of company names
    const companyNames = [
      "Sky Transportation",
      "Big M Trucking",
      "Ledwell",
      "FedEx",
      "Melton Truck Lines",
      "TNTX Solutions"
    ];

    // Map the company names into objects to be inserted
    const companiesData = companyNames.map(name => ({ name }));

    // Insert companies into the database
    const companies = await Company.insertMany(companiesData);

    // Log the created companies with their IDs
    console.log('Test companies created:');
    companies.forEach(company => {
      console.log(`${company.name} - ${company._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
};

seedCompanies();
