/**
 * @file equipment.service.test.js
 */
const EquipmentService = require('../../src/services/equipment.service');
const { Equipment, AuditLog } = require('../../src/models');

jest.mock('../../src/models', () => ({
  Equipment: {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn()
  },
  AuditLog: {
    create: jest.fn()
  }
}));

describe('EquipmentService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addEquipment', () => {
    it('should create equipment and log to AuditLog', async () => {
      Equipment.create.mockResolvedValue({ EquipmentID: 101, Name: '3D Printer' });

      const result = await EquipmentService.addEquipment('3D Printer', 1);
      expect(Equipment.create).toHaveBeenCalledWith({ Name: '3D Printer' });
      expect(AuditLog.create).toHaveBeenCalled();
      expect(result).toEqual({ EquipmentID: 101, Name: '3D Printer' });
    });
  });

  describe('updateEquipment', () => {
    it('should update equipment name if found', async () => {
      const mockEquip = {
        EquipmentID: 200,
        Name: 'Old Name',
        save: jest.fn().mockResolvedValue(true)
      };
      Equipment.findByPk.mockResolvedValue(mockEquip);

      const updated = await EquipmentService.updateEquipment(200, 'New Name', 2);

      expect(updated.Name).toBe('New Name');
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw if equipment not found', async () => {
      Equipment.findByPk.mockResolvedValue(null);
      await expect(EquipmentService.updateEquipment(999, 'Anything', 2))
        .rejects.toThrow('Equipment not found');
    });
  });

  describe('deleteEquipment', () => {
    it('should delete equipment if found', async () => {
      const mockEquip = { EquipmentID: 300, Name: 'Laser' };
      Equipment.findByPk.mockResolvedValue(mockEquip);

      Equipment.destroy.mockResolvedValue(1);

      const result = await EquipmentService.deleteEquipment(300, 2);
      expect(result).toEqual({ message: 'Equipment deleted' });
      expect(AuditLog.create).toHaveBeenCalled();
    });

    it('should throw if equipment not found', async () => {
      Equipment.findByPk.mockResolvedValue(null);
      await expect(EquipmentService.deleteEquipment(999, 2))
        .rejects.toThrow('Equipment not found');
    });
  });

  describe('getAllEquipment', () => {
    it('should return a list of all equipment', async () => {
      Equipment.findAll.mockResolvedValue([{ EquipmentID: 1 }, { EquipmentID: 2 }]);
      const list = await EquipmentService.getAllEquipment();
      expect(list.length).toBe(2);
    });
  });

  describe('getEquipmentById', () => {
    it('should return equipment if found', async () => {
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 5, Name: 'Cutter' });
      const eq = await EquipmentService.getEquipmentById(5);
      expect(eq.Name).toBe('Cutter');
    });

    it('should throw if not found', async () => {
      Equipment.findByPk.mockResolvedValue(null);
      await expect(EquipmentService.getEquipmentById(9)).rejects.toThrow('Equipment not found');
    });
  });
});
