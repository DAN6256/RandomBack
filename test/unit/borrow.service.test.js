/**
 * @file borrow.service.test.js
 * Unit tests for the BorrowService using Jest.
 */

const BorrowService = require('../../src/services/borrow.service');
const { 
  BorrowRequest, 
  BorrowedItem, 
  Equipment, 
  User, 
  Reminder, 
  AuditLog 
} = require('../../src/models');

// We'll mock these model methods so they don't hit the DB
jest.mock('../../src/models', () => {
  const SequelizeMock = {
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn()
  };
  
  return {
    BorrowRequest: { 
      findByPk: SequelizeMock.findByPk, 
      create: SequelizeMock.create,
      findAll: SequelizeMock.findAll
    },
    BorrowedItem: {
      findByPk: SequelizeMock.findByPk,
      create: SequelizeMock.create,
      findAll: SequelizeMock.findAll,
      destroy: SequelizeMock.destroy,
      save: SequelizeMock.save
    },
    Equipment: {
      findByPk: SequelizeMock.findByPk
    },
    User: {
      findByPk: SequelizeMock.findByPk,
      findOne: SequelizeMock.findOne
    },
    Reminder: {
      create: SequelizeMock.create
    },
    AuditLog: {
      create: SequelizeMock.create
    }
  };
});

const EmailService = require('../../src/services/email.service');
jest.mock('../../src/services/email.service', () => ({
  sendBorrowRequestNotification: jest.fn(),
  sendApprovalNotification: jest.fn(),
  sendReminder: jest.fn()
}));

describe('BorrowService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('requestEquipment', () => {
    it('should create a new BorrowRequest and BorrowedItems, then send emails', async () => {
      // Mock user and admin
      User.findByPk.mockResolvedValueOnce({ UserID: 1, Role: 'Student', Email: 'student@example.com' });
      User.findOne.mockResolvedValueOnce({ Email: 'admin@example.com' });

      // Mock create BorrowRequest
      BorrowRequest.create.mockResolvedValueOnce({ RequestID: 100 });

      // Mock findByPk for Equipment
      Equipment.findByPk.mockResolvedValue({ EquipmentID: 5, Name: 'Motor' });

      // Mock BorrowedItem.create
      BorrowedItem.create.mockResolvedValue({ /* item data here */ });

      // Mock findAll for borrowedItems
      BorrowedItem.findAll.mockResolvedValue([
        {
          EquipmentID: 5,
          Equipment: { Name: 'Motor' },
          Quantity: 2
        }
      ]);

      // Call the service
      const items = [
        { equipmentID: 5, quantity: 2, description: 'A motor' }
      ];
      const result = await BorrowService.requestEquipment(1, items);

      expect(result.RequestID).toBe(100);

      // Check that BorrowRequest.create was called
      expect(BorrowRequest.create).toHaveBeenCalledWith({
        UserID: 1,
        BorrowDate: expect.any(Date),
        Status: 'Pending',
        ReturnDate: null
      });

      // Check that BorrowedItem.create was called for each item
      expect(BorrowedItem.create).toHaveBeenCalledWith({
        RequestID: 100,
        EquipmentID: 5,
        Description: 'A motor',
        SerialNumber: null,
        Quantity: 2
      });

      // Check that email was sent to both student & admin
      expect(EmailService.sendBorrowRequestNotification).toHaveBeenCalledWith(
        'student@example.com',
        'admin@example.com',
        100,
        expect.any(Array) // borrowedItems
      );
    });

    it('should throw if user is not a Student', async () => {
      User.findByPk.mockResolvedValueOnce({ UserID: 2, Role: 'Admin' });

      await expect(BorrowService.requestEquipment(2, []))
        .rejects
        .toThrow('Invalid student or role');
    });
  });

  describe('approveRequest', () => {
    it('should approve a pending request, keep allowed items, remove disallowed, then send email', async () => {
      // Mock request
      BorrowRequest.findByPk.mockResolvedValue({ RequestID: 100, Status: 'Pending', UserID: 1, save: jest.fn() });
      // Mock BorrowedItems
      BorrowedItem.findByPk.mockResolvedValue({ 
        borrowedItemID: 999, 
        RequestID: 100, 
        destroy: jest.fn(), 
        save: jest.fn() 
      });
      BorrowedItem.findAll.mockResolvedValue([
        {
          RequestID: 100,
          borrowedItemID: 999,
          Equipment: { Name: 'Motor' }
        }
      ]);
      // Mock user
      User.findByPk.mockResolvedValue({ Email: 'student@example.com' });

      const items = [
        { borrowedItemID: 999, allow: true, serialNumber: 'SN-ABC', description: 'Updated desc' }
      ];
      const result = await BorrowService.approveRequest(100, new Date('2025-08-01'), items);

      expect(result.Status).toBe('Approved');
      expect(EmailService.sendApprovalNotification).toHaveBeenCalledWith(
        'student@example.com',
        100,
        new Date('2025-08-01'),
        expect.any(Array)
      );
    });
  });

  // Additional tests for returnEquipment, sendReminderForDueReturns ...
});
