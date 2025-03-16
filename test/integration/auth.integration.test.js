

const request = require('supertest');
const app = require('../../index');    // your Express app
const { sequelize } = require('../../src/models'); // the Sequelize instance

describe('Auth Integration (In-Memory)', () => {
  beforeAll(async () => {
    // Force-sync all tables in an in-memory DB
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close DB connection
    await sequelize.close();
  });

  let token;
  let userID;

  describe('POST /api/auth/signup', () => {
    it('signs up a new user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.integration@auth.com',
          password: 'Password123',
          name: 'TestUser',
          role: 'Student',
          major: 'CS',
          yearGroup: 2025
        })
        .expect(201);

      expect(res.body.message).toBe('User registered successfully');
      expect(res.body).toHaveProperty('userID');
      userID = res.body.userID;
    });

    it('fails if email is taken', async () => {
      await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test.integration@auth.com', // same as above
          password: 'DifferentPass',
          name: 'Somebody Else',
          role: 'Student',
          major: 'Engineering',
          yearGroup: 2026
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('logins successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test.integration@auth.com', password: 'Password123' })
        .expect(200);

      expect(res.body.message).toBe('Login successful');
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      token = res.body.token;
    });

    it('fails with invalid password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'test.integration@auth.com', password: 'WrongPass' })
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('logs out (just returns success)', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.message).toBe('Logged out successfully');
    });
  });

  describe('PUT /api/auth/edit', () => {
    it('edits user details with valid token', async () => {
      const res = await request(app)
        .put('/api/auth/edit')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'UpdatedName', major: 'NewMajor', yearGroup: 2027 })
        .expect(200);

      expect(res.body.message).toBe('User details updated successfully');
      expect(res.body.user.Name).toBe('UpdatedName');
      expect(res.body.user.major).toBe('NewMajor');
      expect(res.body.user.yearGroup).toBe(2027);
    });

    it('fails with no token', async () => {
      await request(app)
        .put('/api/auth/edit')
        .send({ name: 'No Token' })
        .expect(401);
    });
  });
});
