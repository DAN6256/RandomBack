/**
 * @file auth.integration.test.js
 * Integration tests for Auth endpoints (signup, login, logout, editUser).
 * We omit forgot/reset password as requested.
 */
const request = require('supertest');
const app = require('../../index');
const { sequelize } = require('../../src/models'); // or wherever your Sequelize instance is

describe('Auth Integration', () => {
  beforeAll(async () => {
    // Optionally sync or migrate test DB
    // await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // close DB if needed
    await sequelize.close();
  });

  let token; // to store JWT after login
  let userID; // store the created user

  describe('POST /api/auth/signup', () => {
    it('should successfully sign up a user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'testuser@integration.com',
          password: 'Password123',
          name: 'Test User',
          role: 'Student',
          major: 'Computer Science',
          yearGroup: 2025
        })
        .expect(201);

      expect(res.body).toHaveProperty('userID');
      expect(res.body.message).toBe('User registered successfully');
      userID = res.body.userID; // store for later
    });

    it('should fail if email is taken', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'testuser@integration.com', // same as above
          password: 'AnotherPass',
          name: 'Tester 2',
          role: 'Student',
          major: 'Engineering',
          yearGroup: 2026
        })
        .expect(400);

      expect(res.body.message).toMatch(/already taken/i);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@integration.com',
          password: 'Password123'
        })
        .expect(200);

      expect(res.body.message).toBe('Login successful');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      token = res.body.token; 
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@integration.com',
          password: 'WrongPassword'
        })
        .expect(401);

      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully (just returns success)', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('PUT /api/auth/edit', () => {
    it('should edit user details with valid token', async () => {
      const res = await request(app)
        .put('/api/auth/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          major: 'Updated Major',
          yearGroup: 2026
        })
        .expect(200);

      expect(res.body.message).toBe('User details updated successfully');
      expect(res.body.user.Name).toBe('Updated Name');
      expect(res.body.user.major).toBe('Updated Major');
      expect(res.body.user.yearGroup).toBe(2026);
    });

    it('should fail if no token is provided', async () => {
      const res = await request(app)
        .put('/api/auth/edit')
        .send({ name: 'No Token Name' })
        .expect(401);

      expect(res.body).toHaveProperty('message');
    });
  });
});
