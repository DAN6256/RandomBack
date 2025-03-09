// FILE: test/unit/equipment.controller.test.js
const request = require('supertest');
const app = require('../../index');
const { Equipment } = require('../../src/models');

jest.mock('../../src/models', () => {
  const actual = jest.requireActual('../../src/models');
  return {
    ...actual,
    Equipment: {
      create: jest.fn(),
      findByPk: jest.fn(),
      destroy: jest.fn(),
      findAll: jest.fn()
    }
  };
});

describe('EquipmentController', () => {
  afterAll(async () => {
    // Close connections if needed
  });

  describe('POST /api/equipment', () => {
    it('should add new equipment if user is Admin', async () => {
      Equipment.create.mockResolvedValue({ EquipmentID: 100, Name: 'New Equip' });
      const res = await request(app)
        .post('/api/equipment')
        // Bypass auth/role middleware if needed by setting a valid token header.
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'New Equip' });
      expect(res.status).toBe(201);
      expect(res.body.equipment.Name).toBe('New Equip');
    });
  });

  describe('PUT /api/equipment/:equipmentID', () => {
    it('should update equipment details if user is Admin', async () => {
      const fakeEquip = { EquipmentID: 10, Name: 'OldName', save: jest.fn().mockResolvedValue() };
      Equipment.findByPk.mockResolvedValue(fakeEquip);
      const res = await request(app)
        .put('/api/equipment/10')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ name: 'UpdatedName' });
      expect(res.status).toBe(200);
      expect(res.body.updatedEquipment.Name).toBe('UpdatedName');
    });
  });

  // Additional tests for DELETE, GET all, and GET by ID can be added similarly.
});
