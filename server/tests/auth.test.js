// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server'); 
const User = require('../models/User');
require('dotenv').config();
const connectDB = require('../config/db');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

// Clear users between tests
beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test@1234'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.token).toBeDefined();
  });

  it('should login an existing user', async () => {
    // First register a user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: `testuser_${Date.now()}@example.com`,
        password: 'Test@1234'
      });

    // Then login with the same credentials
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: registerRes.body.data.email,
        password: 'Test@1234'
      });
    expect(loginRes.statusCode).toEqual(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data).toHaveProperty('_id');
    expect(loginRes.body.token).toBeDefined();
  });

  it('should return error for login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
  it('should get the current user profile', async () => {
    // First, register a user to get a token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Profile Test User',
        email: `profile_${Date.now()}@example.com`,
        password: 'Test@1234'
      });
    const token = registerRes.body.token;
  
    // Now, retrieve the current user profile
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
  
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    expect(res.body.data.email).toBe(registerRes.body.data.email);
  });  
});
