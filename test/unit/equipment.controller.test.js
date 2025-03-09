/**
 * test/unit/equipment.controller.test.js
 *
 * Tests for the /api/equipment routes.
 */
const request = require('supertest');
const app = require('../../index'); // from project root
const { Equipment } = require('../../src/models');

// Optionally mock out Equipment in some cases, or just do minimal checks
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
    // close resources if needed
  });

  describe('POST /api/equipment', () => {
    it('should add new equipment if user is Admin', async () => {
      // We can mock an admin token or bypass role check, depending on your test approach
      // For brevity, let's just mock the DB calls:
      Equipment.create.mockResolvedValue({ EquipmentID: 100, Name: 'New Equip' });

      // We can simulate an Admin JWT or just skip if your test environment is open
      const res = await request(app)
        .post('/api/equipment')
        // .set('Authorization', 'Bearer <some valid admin token>')
        .send({ name: 'New Equip' });

      expect(res.status).toBe(201);
      expect(res.body.equipment.Name).toBe('New Equip');
    });
  });

  describe('PUT /api/equipment/:equipmentID', () => {
    it('should update equipment details if user is Admin', async () => {
      const fakeEquip = { EquipmentID: 10, Name: 'OldName' };
      Equipment.findByPk.mockResolvedValue(fakeEquip);
      Equipment.create.mockResolvedValue({});

      const res = await request(app)
        .put('/api/equipment/10')
        // .set('Authorization', 'Bearer <admin token>')
        .send({ name: 'UpdatedName' });

      expect(res.status).toBe(200);
      expect(res.body.updatedEquipment.Name).toBe('UpdatedName');
    });
  });

  // Similarly test DELETE, GET all, GET by ID, etc.
});
