// server/seedUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Company = require('./models/Company');

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});

    // Define your users to seed
    const usersData = [
      { name: "Hunter Mustain", email: "hunter@example.com", password: "Test@1234", role: "admin" },
      { name: "Amy Mustain", email: "amy@example.com", password: "Test@1234", role: "agent" },
      { name: "Barrett Mustain", email: "barrett@example.com", password: "Test@1234", role: "driver" },
      { name: "Romy Mustain", email: "romy@example.com", password: "Test@1234", role: "driver" },
      { name: "Bruce Mustain", email: "bruce@example.com", password: "Test@1234", role: "company_user" },
      { name: "Rosemary Mustain", email: "rosemary@example.com", password: "Test@1234", role: "company_user" },
      { name: "Levi Mustain", email: "levi@example.com", password: "Test@1234", role: "driver" },
      { name: "Brooks Mustain", email: "brooks@example.com", password: "Test@1234", role: "agent" },
      { name: "Shelby Robbins", email: "shelby@example.com", password: "Test@1234", role: "agent" },
      { name: "Duncan Robbins", email: "duncan@example.com", password: "Test@1234", role: "agent" },
      { name: "Rhett Robbins", email: "rhett@example.com", password: "Test@1234", role: "driver" },
      { name: "Brodie Robbins", email: "brodie@example.com", password: "Test@1234", role: "driver"}
    ];

    // Predefined companies for non-admin/agent users
    const allowedCompanyNames = [
      "Sky Transportation",
      "Big M Trucking",
      "Ledwell",
      "FedEx",
      "Melton Truck Lines"
    ];
    // Special company for admin/agent users
    const adminCompanyName = "TNTX Solutions";

    // Fetch all companies currently seeded
    let companies = await Company.find({});
    
    // Find the admin company; if it doesn't exist, create it.
    let adminCompany = companies.find(c => c.name === adminCompanyName);
    if (!adminCompany) {
      adminCompany = await Company.create({ name: adminCompanyName });
      companies.push(adminCompany);
    }

    // Filter companies for non-admin roles (those in allowedCompanyNames)
    const allowedCompanies = companies.filter(c => allowedCompanyNames.includes(c.name));

    const createdUsers = [];

    for (const data of usersData) {
      let companyId;
      if (data.role === "admin" || data.role === "agent") {
        // For admin and agent roles, assign the TNTX Solutions company
        companyId = adminCompany._id;
      } else {
        // For other roles, randomly assign one of the allowed companies
        const randomIndex = Math.floor(Math.random() * allowedCompanies.length);
        companyId = allowedCompanies[randomIndex]._id;
      }
      // Create the user using save() to trigger pre-save middleware (for password hashing)
      const user = new User({ ...data, company: companyId });
      await user.save();
      createdUsers.push(user);
    }

    console.log("Seeded Users:");
    createdUsers.forEach(user => {
      console.log(`${user.name} (${user.role}) - ${user._id} | Company: ${user.company}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
