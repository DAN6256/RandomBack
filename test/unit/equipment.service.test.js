const EquipmentService = require('../../src/services/equipment.service');
const { Equipment, AuditLog } = require('../../src/models');

jest.mock('../../src/models', () => {
  const SequelizeMock = {
    create: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn()
  };

  return {
    Equipment: {
      create: SequelizeMock.create,
      findByPk: SequelizeMock.findByPk,
      findAll: SequelizeMock.findAll,
      destroy: SequelizeMock.destroy
    },
    AuditLog: {
      create: SequelizeMock.create
    }
  };
});

describe('EquipmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addEquipment', () => {
    it('should create equipment and log audit', async () => {
      Equipment.create.mockResolvedValueOnce({ EquipmentID: 1, Name: '3D Printer' });
      AuditLog.create.mockResolvedValueOnce({ LogID: 100 });

      const result = await EquipmentService.addEquipment('3D Printer', 99);

      expect(result).toEqual({ EquipmentID: 1, Name: '3D Printer' });
      expect(Equipment.create).toHaveBeenCalledWith({ Name: '3D Printer' });
      expect(AuditLog.create).toHaveBeenCalledWith({
        UserID: 99,
        Action: 'Create',
        Details: 'Equipment added: 3D Printer',
        Timestamp: expect.any(Date)
      });
    });
  });

  describe('updateEquipment', () => {
    it('should update equipment name and log audit', async () => {
      const mockEquip = { EquipmentID: 1, Name: 'Old Name', save: jest.fn() };
      Equipment.findByPk.mockResolvedValueOnce(mockEquip);

      await EquipmentService.updateEquipment(1, 'New Name', 99);

      expect(mockEquip.Name).toBe('New Name');
      expect(mockEquip.save).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalledWith({
        UserID: 99,
        Action: 'Update',
        Details: 'Equipment 1 updated',
        Timestamp: expect.any(Date)
      });
    });

    it('should throw error if equipment not found', async () => {
      Equipment.findByPk.mockResolvedValueOnce(null);

      await expect(EquipmentService.updateEquipment(999, 'Nope', 99))
        .rejects
        .toThrow('Equipment not found');
    });
  });

  // Similar tests for deleteEquipment, getAllEquipment, getEquipmentById...
});
