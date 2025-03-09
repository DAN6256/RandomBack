/**
 * test/unit/email.service.test.js
 *
 * Unit tests for email.service.js
 * We mock nodemailer to verify sendMail calls.
 */
const nodemailer = require('nodemailer');
const EmailService = require('../../src/services/email.service');

jest.mock('nodemailer');

describe('EmailService', () => {
  let sendMailMock;

  beforeAll(() => {
    // mock createTransport to return an object with sendMail
    sendMailMock = jest.fn().mockResolvedValue({});
    nodemailer.createTransport.mockReturnValue({
      sendMail: sendMailMock
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendBorrowRequestNotification', () => {
    it('should send two emails: one to student, one to admin', async () => {
      const borrowedItems = [
        { Equipment: { Name: '3D Printer' }, Quantity: 2, Description: 'For project' },
        { Equipment: { Name: 'Laser Cutter' }, Quantity: 1 }
      ];
      await EmailService.sendBorrowRequestNotification(
        'StudentName',
        'student@example.com',
        'admin@example.com',
        101,
        borrowedItems,
        '2025-12-01T10:00:00Z'
      );

      expect(sendMailMock).toHaveBeenCalledTimes(2);

      // First call = student mail
      const [studentMailOptions] = sendMailMock.mock.calls[0];
      expect(studentMailOptions.to).toBe('student@example.com');
      expect(studentMailOptions.subject).toBe('Borrow Request #101 Submitted');
      expect(studentMailOptions.text).toMatch(/StudentName/);
      expect(studentMailOptions.text).toMatch(/3D Printer/);
      expect(studentMailOptions.text).toMatch(/Laser Cutter/);

      // Second call = admin mail
      const [adminMailOptions] = sendMailMock.mock.calls[1];
      expect(adminMailOptions.to).toBe('admin@example.com');
      expect(adminMailOptions.subject).toBe('New Borrow Request #101');
      expect(adminMailOptions.text).toMatch(/pick-up date\/time: 2025-12-01T10:00:00Z/);
    });
  });

  describe('sendApprovalNotification', () => {
    it('should send an email to the student with approved items', async () => {
      const approvedItems = [
        { Equipment: { Name: 'Motor' }, Quantity: 3, SerialNumber: 'SN123', Description: 'Robot motor' }
      ];

      await EmailService.sendApprovalNotification(
        'StudentName',
        'student@example.com',
        202,
        '2025-12-05T00:00:00Z',
        approvedItems
      );

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const [mailOptions] = sendMailMock.mock.calls[0];
      expect(mailOptions.to).toBe('student@example.com');
      expect(mailOptions.subject).toBe('Borrow Request #202 Approved');
      expect(mailOptions.text).toMatch(/SN: SN123/);
      expect(mailOptions.text).toMatch(/Description: "Robot motor"/);
    });
  });

  describe('sendReturnConfirmation', () => {
    it('should inform the student that the request was returned', async () => {
      await EmailService.sendReturnConfirmation(
        'StudentName',
        'student@example.com',
        303
      );
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const [mailOptions] = sendMailMock.mock.calls[0];
      expect(mailOptions.to).toBe('student@example.com');
      expect(mailOptions.subject).toBe('Borrow Request #303 Returned');
      expect(mailOptions.text).toMatch(/marked as returned/);
    });
  });

  describe('sendReminder', () => {
    it('should send a reminder about due date', async () => {
      await EmailService.sendReminder(
        'StudentName',
        'student@example.com',
        404,
        '2025-12-10T00:00:00Z'
      );
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const [mailOptions] = sendMailMock.mock.calls[0];
      expect(mailOptions.subject).toBe('Equipment Return Reminder');
      expect(mailOptions.text).toMatch(/Dear StudentName/);
      expect(mailOptions.text).toMatch(/request #404 is due on 2025-12-10T00:00:00Z/);
    });
  });
});
