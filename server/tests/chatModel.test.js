// tests/chatModel.test.js
const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Company = require('../models/Company');
const connectDB = require('../config/db');
require('dotenv').config();

let testUser;
let testCompany;
let testTicket;

beforeAll(async () => {
  await connectDB();

  // Create a test user
  testUser = new User({
    name: 'Chat Tester',
    email: `chattester_${Date.now()}@example.com`,
    password: 'Test@1234'
  });
  await testUser.save();

  // Create a test company
  testCompany = new Company({ name: 'Chat Test Company' });
  await testCompany.save();
});

beforeEach(async () => {
  // Clear out Tickets and Chats before each test to avoid duplicate key errors.
  await Ticket.deleteMany({});
  await Chat.deleteMany({});

  // Create a new test ticket for each test in this file.
  testTicket = new Ticket({
    ticketNumber: '00002',
    user: testUser._id,
    company: testCompany._id,
    truckNumber: 'TX5678',
    vinLast8: 'XYZ98765',
    mileage: 75000,
    trailerNumber: 'TR5678',
    loadStatus: 'empty',
    complaint: 'Flat tire',
    currentLocation: 'Los Angeles, CA'
  });
  await testTicket.save();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Chat Model Test', () => {
  it('should create & save chat successfully', async () => {
    const chatData = {
      ticket: testTicket._id,
      sender: testUser._id,
      message: 'This is a test chat message'
    };

    const chat = new Chat(chatData);
    const savedChat = await chat.save();

    expect(savedChat._id).toBeDefined();
    expect(savedChat.message).toBe(chatData.message);
  });

  it('should not save chat without required fields', async () => {
    const chatWithoutRequiredFields = new Chat({});
    let err;
    try {
      await chatWithoutRequiredFields.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.ticket).toBeDefined();
    expect(err.errors.sender).toBeDefined();
    expect(err.errors.message).toBeDefined();
  });
});
