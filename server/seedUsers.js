// server/seedUsers.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const seedUsers = async () => {
  try {
    await connectDB();

    // Clear existing users
    await User.deleteMany({});

    // Array of users to seed
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
      { name: "Rhett Robbins", email: "rhett@example.com", password: "Test@1234", role: "driver"},
      { name: "Brodie Robbins", email: "brodie@example.com", password: "Test@1234", role: "driver"}
    ];

    const createdUsers = await User.insertMany(usersData);

    console.log("Seeded Users:");
    createdUsers.forEach(user => {
      console.log(`${user.name} (${user.role}) - ${user._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
