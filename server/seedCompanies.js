// server/seedCompanies.js
require('dotenv').config();
const mongoose = require('mongoose');
const Company = require('./models/Company');
const connectDB = require('./config/db');

const seedCompanies = async () => {
  try {
    await connectDB();

    // Clear the companies collection
    await Company.deleteMany({});

    // Define an array of companies with their Trimble data
    const companiesData = [
      // TNTX Solutions with full details
      {
        trimbleCode: "TNTXSOL",
        name: "TNTX SOLUTIONS",
        address1: "2501 HUGHES ROAD",
        city: "GRAPVE",
        state: "TX",
        zipcode: "76051",
        mainPhone: "888-600-1365"
      },
      // Allowed companies (update names as needed)
      {
        trimbleCode: "MELTON",
        name: "Melton Truck Lines"
      },
      {
        trimbleCode: "104376",
        name: "FedEx"
      },
      {
        trimbleCode: "ROYAL",
        name: "Royal Transportation"
      },
      {
        trimbleCode: "HODGES",
        name: "Hodges Transportation"
      },
      {
        trimbleCode: "SMT",
        name: "Southwestern Motor Transport"
      },
      {
        trimbleCode: "CCT",
        name: "CCT Transportation"
      },
      {
        trimbleCode: "BIGM",
        name: "Big M Trucking"
      },
      {
        trimbleCode: "WATKINS",
        name: "Watkins Transportation"
      },
      {
        trimbleCode: "WILSON",
        name: "Wilson Transport"
      },
      {
        trimbleCode: "MC EXPRESS",
        name: "MC EXPRESS"
      },
      {
        trimbleCode: "SKY",
        name: "Sky Transportation"
      }
    ];

    // Insert companies into the database
    const companies = await Company.insertMany(companiesData);

    // Log the created companies with their IDs
    console.log('Companies seeded:');
    companies.forEach(company => {
      console.log(`${company.name} (${company.trimbleCode}) - ${company._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding companies:', error);
    process.exit(1);
  }
};

seedCompanies();
