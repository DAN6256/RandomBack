// FILE: test/unit/auth.controller.test.js
const request = require('supertest');
const app = require('../../index');
const { User } = require('../../src/models');
const bcrypt = require('bcrypt');

// To bypass middleware, you might set a valid token manually if needed.
// For these tests, we assume the routes are directly accessible.

describe('AuthController', () => {
  afterAll(async () => {
    // Close resources if needed.
  });

  describe('POST /api/auth/signup', () => {
    it('should return 201 if user is created', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'create').mockResolvedValue({ UserID: 1 });
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'new@example.com',
          password: 'Password123',
          name: 'NewUser',
          role: 'Student'
        });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('userID', 1);
    });

    it('should return 400 if email is already taken', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValue({ Email: 'test@example.com' });
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          name: 'Duplicate',
          role: 'Admin'
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('Email already taken');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 and token if credentials valid', async () => {
      jest.spyOn(User, 'unscoped').mockReturnValue({
        findOne: jest.fn().mockResolvedValue({
          UserID: 99,
          Email: 'valid@example.com',
          Password: 'hashedstuff',
          Role: 'Student'
        })
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'valid@example.com',
          password: 'CorrectPass'
        });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.message).toBe('Login successful');
    });

    it('should return 401 if credentials are invalid', async () => {
      jest.spyOn(User, 'unscoped').mockReturnValue({
        findOne: jest.fn().mockResolvedValue({ Password: 'somehash' })
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
