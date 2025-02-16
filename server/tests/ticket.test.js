const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); 
const User = require('../models/User');
const Company = require('../models/Company');
require('dotenv').config();
const connectDB = require('../config/db');

let token, testUser, testCompany;

beforeAll(async () => {
  await connectDB();
  
  // Create a test user and get a token
  const userResponse = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Protected Test User',
      email: `protected_${Date.now()}@example.com`,
      password: 'Test@1234'
    });
  token = userResponse.body.token;
  testUser = userResponse.body.data;

  // Create a test company
  testCompany = await Company.create({ name: 'Protected Test Company' });
});

beforeEach(async () => {
  // Cleanup tickets before each test if needed
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Protected Ticket Endpoints', () => {
  it('should create a new ticket when authenticated', async () => {
    const ticketData = {
      user: testUser._id,
      company: testCompany._id,
      truckNumber: 'TX1001',
      vinLast8: 'VIN12345',
      mileage: 120000,
      trailerNumber: 'TR1001',
      loadStatus: 'loaded',
      loadNumber: 'LOAD1001',
      complaint: 'Brake failure',
      currentLocation: 'Houston, TX'
    };

    const res = await request(app)
      .post('/api/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send(ticketData);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.ticketNumber).toMatch(/^\d{5}$/);
  });
});
