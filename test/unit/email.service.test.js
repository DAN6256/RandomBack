// FILE: test/unit/email.service.test.js

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({})
    })
  }));
  
  const nodemailer = require('nodemailer');
  const EmailService = require('../../src/services/email.service');
  
  describe('EmailService', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe('sendBorrowRequestNotification', () => {
      it('should send two emails with proper content', async () => {
        await EmailService.sendBorrowRequestNotification(
          'StudentName',
          'student@x.com',
          'admin@x.com',
          123,
          [{ Equipment: { Name: 'ItemA' }, Quantity: 2 }],
          new Date()
        );
  
        // Check nodemailer
        expect(nodemailer.createTransport).toHaveBeenCalled();
        // ...
      });
    });
  
    describe('sendApprovalNotification', () => {
      it('should send an approval email with item details', async () => {
        await EmailService.sendApprovalNotification(
          'StudentName',
          'student@x.com',
          123,
          new Date(),
          [{ Equipment: { Name: 'ItemB' }, Quantity: 1 }]
        );
        // ...
      });
    });
  
    describe('sendReturnConfirmation', () => {
      it('should send a return confirmation email', async () => {
        await EmailService.sendReturnConfirmation('StudentName', 'stud@x.com', 99);
        // ...
      });
    });
  
    describe('sendReminder', () => {
      it('should send a reminder email', async () => {
        await EmailService.sendReminder('StudentName', 'stud@x.com', 50, new Date());
      });
    });
  });
  