// FILE: test/unit/email.service.test.js
const nodemailer = require('nodemailer');
const EmailService = require('../../src/services/email.service');

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let sendMailMock;

  beforeAll(() => {
    // Create a mock sendMail function that resolves to an empty object
    sendMailMock = jest.fn().mockResolvedValue({});
    // Ensure createTransport returns an object with our mocked sendMail
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendBorrowRequestNotification', () => {
    it('should send two emails: one to student and one to admin, including item details and collection date/time', async () => {
      const borrowedItems = [
        { 
          Equipment: { Name: '3D Printer' }, 
          Quantity: 2, 
          Description: 'For project' 
        },
        { 
          Equipment: { Name: 'Laser Cutter' }, 
          Quantity: 1 
        }
      ];
      const studentName = 'Alice';
      const studentEmail = 'alice@example.com';
      const adminEmail = 'admin@example.com';
      const requestID = 101;
      const collectionDateTime = '2025-12-01T10:00:00Z';

      await EmailService.sendBorrowRequestNotification(
        studentName,
        studentEmail,
        adminEmail,
        requestID,
        borrowedItems,
        collectionDateTime
      );

      // Expect sendMail to be called twice (student and admin emails)
      expect(sendMailMock).toHaveBeenCalledTimes(2);

      // Validate student email options
      const studentMailOptions = sendMailMock.mock.calls[0][0];
      expect(studentMailOptions.to).toBe(studentEmail);
      expect(studentMailOptions.subject).toBe(`Borrow Request #${requestID} Submitted`);
      expect(studentMailOptions.text).toContain(`Dear ${studentName}`);
      expect(studentMailOptions.text).toContain('3D Printer');
      expect(studentMailOptions.text).toContain('For project');

      // Validate admin email options
      const adminMailOptions = sendMailMock.mock.calls[1][0];
      expect(adminMailOptions.to).toBe(adminEmail);
      expect(adminMailOptions.subject).toBe(`New Borrow Request #${requestID}`);
      expect(adminMailOptions.text).toContain(`Submitted by ${studentName}`);
      expect(adminMailOptions.text).toContain('3D Printer');
      expect(adminMailOptions.text).toContain(`Requested pick-up date/time: ${collectionDateTime}`);
    });
  });

  describe('sendApprovalNotification', () => {
    it('should send an approval email to the student with approved items, including serial numbers and descriptions', async () => {
      const approvedItems = [
        { 
          Equipment: { Name: 'Motor' }, 
          Quantity: 3, 
          SerialNumber: 'SN123', 
          Description: 'Robot motor'
        }
      ];
      const studentName = 'Alice';
      const studentEmail = 'alice@example.com';
      const requestID = 202;
      const returnDate = '2025-12-05T00:00:00Z';

      await EmailService.sendApprovalNotification(
        studentName,
        studentEmail,
        requestID,
        returnDate,
        approvedItems
      );

      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe(studentEmail);
      expect(mailOptions.subject).toBe(`Borrow Request #${requestID} Approved`);
      expect(mailOptions.text).toContain(`Dear ${studentName}`);
      expect(mailOptions.text).toContain('Motor');
      expect(mailOptions.text).toContain('SN: SN123');
      expect(mailOptions.text).toContain('Description: "Robot motor"');
      expect(mailOptions.text).toContain(`Return deadline: ${returnDate}`);
    });
  });

  describe('sendReturnConfirmation', () => {
    it('should send a return confirmation email to the student', async () => {
      const studentName = 'Alice';
      const studentEmail = 'alice@example.com';
      const requestID = 303;

      await EmailService.sendReturnConfirmation(studentName, studentEmail, requestID);
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe(studentEmail);
      expect(mailOptions.subject).toBe(`Borrow Request #${requestID} Returned`);
      expect(mailOptions.text).toContain(`Dear ${studentName}`);
      expect(mailOptions.text).toContain('marked as returned by the admin');
    });
  });

  describe('sendReminder', () => {
    it('should send a reminder email with the due date', async () => {
      const studentName = 'Alice';
      const studentEmail = 'alice@example.com';
      const requestID = 404;
      const returnDate = '2025-12-10T00:00:00Z';

      await EmailService.sendReminder(studentName, studentEmail, requestID, returnDate);
      expect(sendMailMock).toHaveBeenCalledTimes(1);
      const mailOptions = sendMailMock.mock.calls[0][0];
      expect(mailOptions.to).toBe(studentEmail);
      expect(mailOptions.subject).toBe('Equipment Return Reminder');
      expect(mailOptions.text).toContain(`Dear ${studentName}`);
      expect(mailOptions.text).toContain(`request #${requestID} is due on ${returnDate}`);
    });
  });
});
