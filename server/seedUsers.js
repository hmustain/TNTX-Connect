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

    // Allowed companies based on Trimble customer keys
    const allowedCustomerKeys = [
      "MELTON",
      "104376",
      "ROYAL",
      "HODGES",
      "SMT",
      "CCT",
      "BIGM",
      "WATKINS",
      "WILSON",
      "MC EXPRESS",
      "SKY",
    ];
    
    // Special company for admin/agent users
    const adminCompanyName = "TNTX Solutions";

    // Get all companies from the DB.
    let companies = await Company.find({});

    // Ensure admin company exists.
    let adminCompany = companies.find(c => c.name === adminCompanyName);
    if (!adminCompany) {
      adminCompany = await Company.create({ name: adminCompanyName });
      companies.push(adminCompany);
    }

    // Ensure each allowed company exists, using trimbleCode as identifier.
    const companyMap = {};
    for (const key of allowedCustomerKeys) {
      // Try to find the company by trimbleCode
      let comp = companies.find(c => c.trimbleCode === key);
      if (!comp) {
        // Create the company with trimbleCode and name (using key as name here)
        comp = await Company.create({ trimbleCode: key, name: key });
        companies.push(comp);
      }
      companyMap[key] = comp;
    }

    const createdUsers = [];

    // Create the admin user (TNTX Solutions)
    const adminUserData = {
      name: "Hunter Mustain",
      email: "hunter@example.com",
      password: "Test@1234",
      role: "admin",
      company: adminCompany._id
    };
    const adminUser = new User(adminUserData);
    await adminUser.save();
    createdUsers.push(adminUser);

    // For each allowed company, create 1 company_user.
    for (const key of allowedCustomerKeys) {
      const comp = companyMap[key];

      const companyUserData = {
        name: `${comp.name} User 1`,
        email: `${comp.name.toLowerCase().replace(/\s+/g, '')}user1@example.com`,
        password: "Test@1234",
        role: "company_user",
        company: comp._id
      };
      const companyUser = new User(companyUserData);
      await companyUser.save();
      createdUsers.push(companyUser);
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
