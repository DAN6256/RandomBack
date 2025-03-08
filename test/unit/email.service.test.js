const EmailService = require('../../src/services/email.service');

// We'll spy on nodemailer
jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue('Mail sent')
    })
  };
});

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send borrow request notification to student and admin', async () => {
    const items = [
      { Equipment: { Name: 'Motor' }, Quantity: 2 }
    ];
    await EmailService.sendBorrowRequestNotification(
      'student@example.com',
      'admin@example.com',
      101,
      items
    );

    // Because we mocked createTransport above, we can check calls
    const nodemailer = require('nodemailer');
    expect(nodemailer.createTransport).toHaveBeenCalled();

    // Check if sendMail was called multiple times
    const transportInstance = nodemailer.createTransport.mock.results[0].value;
    expect(transportInstance.sendMail).toHaveBeenCalledTimes(2);

    // Check one call for student, one for admin
    expect(transportInstance.sendMail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        to: 'student@example.com',
        subject: expect.stringContaining('Borrow Request #101')
      })
    );
    expect(transportInstance.sendMail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        to: 'admin@example.com',
        subject: expect.stringContaining('New Borrow Request #101')
      })
    );
  });
});
