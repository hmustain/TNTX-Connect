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

    // Ensure all allowed companies and the admin company exist in the DB.
    // Get all companies from the DB.
    let companies = await Company.find({});
    
    // Ensure admin company exists.
    let adminCompany = companies.find(c => c.name === adminCompanyName);
    if (!adminCompany) {
      adminCompany = await Company.create({ name: adminCompanyName });
      companies.push(adminCompany);
    }
    
    // Ensure each allowed company exists.
    const companyMap = {};
    for (const name of allowedCompanyNames) {
      let comp = companies.find(c => c.name === name);
      if (!comp) {
        comp = await Company.create({ name });
        companies.push(comp);
      }
      companyMap[name] = comp;
    }
    
    const createdUsers = [];

    // Create the admin user (Hunter Mustain)
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

   // For each allowed company, create 5 drivers and 1 company user.
for (const companyName of allowedCompanyNames) {
  const comp = companyMap[companyName];
  
  // Create 5 drivers for this company
  for (let i = 1; i <= 5; i++) {
    const driverData = {
      name: `${companyName.split(" ")[0]} Driver ${i}`,
      email: `${companyName.split(" ")[0].toLowerCase()}driver${i}@example.com`,
      password: "Test@1234",
      role: "driver",
      company: comp._id
    };
    const driver = new User(driverData);
    await driver.save();
    createdUsers.push(driver);
  }
  
  // Create 1 company user for this company
  const companyUserData = {
    name: `${companyName.split(" ")[0]} User 1`,
    email: `${companyName.split(" ")[0].toLowerCase()}user1@example.com`,
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
