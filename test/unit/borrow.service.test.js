/**
 * test/unit/borrow.service.test.js
 */
const BorrowService = require('../../src/services/borrow.service');
const { BorrowRequest, BorrowedItem, Equipment, User, AuditLog } = require('../../src/models');

jest.mock('../../src/models', () => {
  const actual = jest.requireActual('../../src/models');
  return {
    ...actual,
    BorrowRequest: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn()
    },
    BorrowedItem: {
      create: jest.fn(),
      findByPk: jest.fn(),
      findAll: jest.fn(),
      destroy: jest.fn()
    },
    User: {
      findByPk: jest.fn(),
      findOne: jest.fn()
    },
    Equipment: {
      findByPk: jest.fn()
    },
    AuditLog: {
      create: jest.fn()
    }
  };
});

describe('BorrowService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requestEquipment', () => {
    it('should throw if user is not Student', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Admin' });
      await expect(BorrowService.requestEquipment(1, [], new Date()))
        .rejects.toThrow('Invalid student or role');
    });

    it('should create a BorrowRequest and BorrowedItems', async () => {
      User.findByPk.mockResolvedValue({ Role: 'Student' });
      User.findOne.mockResolvedValue({ Email: 'admin@example.com' }); // the Admin
      BorrowRequest.create.mockResolvedValue({ RequestID: 101 });
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 55 });
      BorrowedItem.create.mockResolvedValue({});

      const result = await BorrowService.requestEquipment(2, [
        { equipmentID: 55, quantity: 2 }
      ], new Date('2025-10-01T00:00:00Z'));

      expect(result.RequestID).toBe(101);
      expect(BorrowedItem.create).toHaveBeenCalled();
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ Action: 'Borrow' })
      );
    });
  });

  describe('approveRequest', () => {
    it('should throw if request not found or not pending', async () => {
      BorrowRequest.findByPk.mockResolvedValue(null);
      await expect(BorrowService.approveRequest(999, new Date(), []))
        .rejects.toThrow('Request not found or already processed');
    });

    it('should approve request and update BorrowedItems', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ RequestID: 50, Status: 'Pending', save: jest.fn() });
      BorrowedItem.findByPk.mockResolvedValue({
        RequestID: 50,
        save: jest.fn(),
        destroy: jest.fn()
      });
      BorrowedItem.findAll.mockResolvedValue([{ EquipmentID: 55 }]);
      User.findByPk.mockResolvedValue({ Email: 'student@example.com', Role: 'Student' });

      await BorrowService.approveRequest(50, new Date(), [
        { borrowedItemID: 1, allow: true, description: 'desc', serialNumber: 'SN123' }
      ]);

      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ Action: 'Approve' })
      );
    });
  });

  describe('returnEquipment', () => {
    it('should throw if request not approved', async () => {
      BorrowRequest.findByPk.mockResolvedValue({ Status: 'Pending' });
      await expect(BorrowService.returnEquipment(10))
        .rejects.toThrow('Invalid request or not in approved state');
    });

    it('should mark request as Returned and log it', async () => {
      BorrowRequest.findByPk.mockResolvedValue({
        RequestID: 11,
        Status: 'Approved',
        save: jest.fn()
      });
      User.findByPk.mockResolvedValue({ Name: 'StudentName' });

      const req = await BorrowService.returnEquipment(11);
      expect(req.Status).toBe('Returned');
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ Action: 'Return' })
      );
    });
  });

  describe('sendReminderForDueReturns', () => {
    it('should send reminder if request is due in 2 days', async () => {
      BorrowRequest.findAll.mockResolvedValue([{ RequestID: 7, UserID: 3 }]);
      User.findByPk.mockResolvedValue({ Name: 'StudentName', Email: 'stud@example.com' });

      const count = await BorrowService.sendReminderForDueReturns();
      expect(count).toBe(1);
      expect(AuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({ Action: 'Notify' })
      );
    });
  });
});
