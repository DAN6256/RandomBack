const request = require('supertest');
const app = require('../../index'); // Our Express app
const { sequelize, User } = require('../../src/models');

describe('Auth Routes (Integration)', () => {
  beforeAll(async () => {
    // Set test environment DB, sync with force to clear data
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    // Close DB connection when tests are done
    await sequelize.close();
  });

  test('POST /api/auth/signup - should create a new user', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'student1@ashesi.edu.gh',
        password: 'Password123',
        name: 'Student One',
        role: 'Student'
      });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
    expect(res.body).toHaveProperty('userID');
  });

  test('POST /api/auth/login - should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student1@ashesi.edu.gh',
        password: 'Password123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /api/auth/login - fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student1@ashesi.edu.gh',
        password: 'WrongPassword'
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });
});
