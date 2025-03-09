// FILE: test/unit/auth.controller.test.js
const request = require('supertest');
const app = require('../../index');
const { User } = require('../../src/models');

describe('AuthController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should register a new user if email is not taken', async () => {
      // Mock User.findOne to return null (email not taken)
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      // Mock User.create to return a new user object with a UserID
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

    it('should return 400 if email is already taken', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ Email: 'existing@example.com' });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'existing@example.com',
          password: 'Password123',
          name: 'Existing User',
          role: 'Admin'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email already taken');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return a token if credentials are valid', async () => {
      // Mock unscoped findOne to include the Password field
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

    it('should return 401 if credentials are invalid', async () => {
      jest.spyOn(User, 'unscoped').mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ Password: 'hashedpassword' })
      });
      const bcrypt = require('bcrypt');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'WrongPassword'
        });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
