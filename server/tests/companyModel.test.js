// tests/companyModel.test.js
const mongoose = require('mongoose');
const Company = require('../models/Company');
const connectDB = require('../config/db');
require('dotenv').config();

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Company Model Test', () => {
  it('should create & save company successfully', async () => {
    const companyData = { name: 'Test Company' };
    const company = new Company(companyData);
    const savedCompany = await company.save();

    expect(savedCompany._id).toBeDefined();
    expect(savedCompany.name).toBe(companyData.name);
  });

  it('should not save company without required field', async () => {
    const companyWithoutRequiredField = new Company({});
    let err;
    try {
      await companyWithoutRequiredField.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.name).toBeDefined();
  });
});
