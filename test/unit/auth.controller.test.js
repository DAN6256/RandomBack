// FILE: test/unit/auth.controller.test.js
const request = require('supertest');
const app = require('../../index');
const { User } = require('../../src/models');

describe('AuthController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user if payload is valid', async () => {
      // Valid payload
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({ UserID: 1 });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'newuser@example.com',
          password: 'Password123',
          name: 'New User',
          role: 'Student'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userID', 1);
    });

    it('should return 400 if payload is missing a required field (e.g., email)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          password: 'Password123',
          name: 'New User',
          role: 'Student'
        });
      expect(res.status).toBe(400);
      // The validation error message comes from Joi (e.g., '"email" is required')
      expect(res.body.message).toMatch(/"email" is required/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return a token if payload is valid', async () => {
      jest.spyOn(User, 'unscoped').mockReturnValue({
        findOne: jest.fn().mockResolvedValue({
          UserID: 99,
          Email: 'valid@example.com',
          Password: 'hashedpassword',
          Role: 'Student'
        })
      });
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'valid@example.com',
          password: 'Password123'
        });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.message).toBe('Login successful');
    });

    it('should return 400 if payload is invalid (e.g., password too short)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'valid@example.com',
          password: 'short'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/"password" length must be at least 6 characters long/i);
    });
  });
});
