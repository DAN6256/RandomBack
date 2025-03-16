/**
 * @file equipment.integration.test.js
 * Integration tests for equipment endpoints.
 */
const request = require('supertest');
const app = require('../../index');
const { sequelize } = require('../../src/models');

describe('Equipment Integration', () => {
  let adminToken;

  beforeAll(async () => {
    // Optionally sync the DB
    // await sequelize.sync({ force: true });

    // create an admin user, then login
    await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'equipadmin@int.com',
        password: 'AdminPass1',
        name: 'Admin Equip',
        role: 'Admin',
        major: 'NA',
        yearGroup: 2023
      });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'equipadmin@int.com', password: 'AdminPass1' });

    adminToken = loginRes.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  let equipmentID;

  describe('POST /api/equipment', () => {
    it('Admin can add new equipment', async () => {
      const res = await request(app)
        .post('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '3D Printer' })
        .expect(201);

      expect(res.body.message).toBe('Equipment added successfully');
      equipmentID = res.body.equipment.EquipmentID;
    });
  });

  describe('GET /api/equipment', () => {
    it('can retrieve list of equipment', async () => {
      const res = await request(app)
        .get('/api/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.equipmentList)).toBe(true);
    });
  });

  describe('GET /api/equipment/:id', () => {
    it('returns 200 if found', async () => {
      const res = await request(app)
        .get(`/api/equipment/${equipmentID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.equipment.EquipmentID).toBe(equipmentID);
    });

    it('returns 404 if not found', async () => {
      const res = await request(app)
        .get('/api/equipment/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(res.body.message).toMatch(/not found/i);
    });
  });

  describe('PUT /api/equipment/:id', () => {
    it('can update equipment name', async () => {
      const res = await request(app)
        .put(`/api/equipment/${equipmentID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Printer' })
        .expect(200);

      expect(res.body.message).toBe('Equipment updated successfully');
      expect(res.body.updatedEquipment.Name).toBe('Updated Printer');
    });
  });

  describe('DELETE /api/equipment/:id', () => {
    it('can delete equipment', async () => {
      const res = await request(app)
        .delete(`/api/equipment/${equipmentID}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('Equipment deleted successfully');
    });
  });
});
