// FILE: test/unit/email.service.test.js
const nodemailer = require('nodemailer');
const EmailService = require('../../src/services/email.service');

jest.mock('nodemailer');

describe('EmailService', () => {
  let sendMailMock;
  
  beforeAll(() => {
    sendMailMock = jest.fn().mockResolvedValue({});
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendBorrowRequestNotification', () => {
    it('should send two emails with proper content', async () => {
      const borrowedItems = [
        { Equipment: { Name: '3D Printer' }, Quantity: 2, Description: 'For project' },
        { Equipment: { Name: 'Laser Cutter' }, Quantity: 1 }
      ];
      await EmailService.sendBorrowRequestNotification(
        'Alice',
        'alice@example.com',
        'admin@example.com',
        101,
        borrowedItems,
        '2025-12-01T10:00:00Z'
      );
      expect(sendMailMock).toHaveBeenCalledTimes(2);
      const studentMail = sendMailMock.mock.calls[0][0];
      expect(studentMail.to).toBe('alice@example.com');
      expect(studentMail.subject).toBe('Borrow Request #101 Submitted');
      expect(studentMail.text).toContain('Dear Alice');
      expect(studentMail.text).toContain('3D Printer');
      expect(studentMail.text).toContain('For project');
      const adminMail = sendMailMock.mock.calls[1][0];
      expect(adminMail.to).toBe('admin@example.com');
      expect(adminMail.subject).toBe('New Borrow Request #101');
      expect(adminMail.text).toContain('Requested pick-up date/time: 2025-12-01T10:00:00Z');
    });
  });

  describe('sendApprovalNotification', () => {
    it('should send an approval email with item details', async () => {
      const approvedItems = [
        { Equipment: { Name: 'Motor' }, Quantity: 3, SerialNumber: 'SN123', Description: 'Robot motor' }
      ];
      await EmailService.sendApprovalNotification(
        'Alice',
        'alice@example.com',
        202,
        '2025-12-05T00:00:00Z',
        approvedItems
      );
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe('alice@example.com');
      expect(mailOptions.subject).toBe('Borrow Request #202 Approved');
      expect(mailOptions.text).toContain('SN: SN123');
      expect(mailOptions.text).toContain('Description: "Robot motor"');
    });
  });

  describe('sendReturnConfirmation', () => {
    it('should send a return confirmation email', async () => {
      await EmailService.sendReturnConfirmation('Alice', 'alice@example.com', 303);
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe('alice@example.com');
      expect(mailOptions.subject).toBe('Borrow Request #303 Returned');
      expect(mailOptions.text).toContain('Dear Alice');
    });
  });

  describe('sendReminder', () => {
    it('should send a reminder email with due date', async () => {
      await EmailService.sendReminder('Alice', 'alice@example.com', 404, '2025-12-10T00:00:00Z');
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe('alice@example.com');
      expect(mailOptions.subject).toBe('Equipment Return Reminder');
      expect(mailOptions.text).toContain('Dear Alice');
      expect(mailOptions.text).toContain('request #404 is due on 2025-12-10T00:00:00Z');
    });
  });
});
