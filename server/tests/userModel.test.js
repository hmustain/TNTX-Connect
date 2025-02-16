// tests/userModel.test.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();
const connectDB = require('../config/db');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clean up the User collection before each test
  await User.deleteMany({});
});

describe('User Model Test', () => {
  it('create & save user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'Test@1234'
    };
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
  });

  it('should not save user without required field', async () => {
    const userWithoutRequiredField = new User({ name: 'Test User' });
    let err;
    try {
      await userWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.email).toBeDefined();
  });
});
