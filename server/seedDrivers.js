// server/seedDrivers.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedDrivers = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Clear the drivers from the collection
    // Option 1: Clear all users with role 'driver'
    await User.deleteMany({ role: 'driver' });
    // Option 2: Alternatively, if you want to only clear test drivers with a specific email pattern, use:
    // await User.deleteMany({ email: { $regex: '^hunter|amy|barrett|romy|bruce|rosemary|levi|brooks' } });

    // Array of driver names
    const drivers = [
      "Hunter Mustain",
      "Amy Mustain",
      "Barrett Mustain",
      "Romy Mustain",
      "Bruce Mustain",
      "Rosemary Mustain",
      "Levi Mustain",
      "Brooks Mustain"
    ];

    // Map each driver name to a user object
    const driverData = drivers.map(name => {
      // Generate a simple email by removing spaces and lowercasing the name
      const email = name.toLowerCase().replace(/\s+/g, '') + "@example.com";
      return {
        name,
        email,
        password: "Test@1234",
        role: "driver"
      };
    });

    // Insert the drivers into the database
    const createdDrivers = await User.insertMany(driverData);
    console.log("Test drivers created:");
    createdDrivers.forEach(driver => {
      console.log(`${driver.name} - ${driver._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding drivers:", error);
    process.exit(1);
  }
};

seedDrivers();
