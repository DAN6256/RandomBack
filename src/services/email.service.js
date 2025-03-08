const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

const EmailService = {

  /**
   * Called when a Student has just created a new Borrow Request.
   * `borrowedItems` is an array of BorrowedItem objects, each with `Equipment` included.
   */
  sendBorrowRequestNotification: async (studentEmail, adminEmail, requestID, borrowedItems) => {
    // Build item list
    let itemDetails = '';
    for (const item of borrowedItems) {
      const equipName = item.Equipment ? item.Equipment.Name : 'Unknown Equipment';
      const qty = item.Quantity || 1;
      itemDetails += ` - ${equipName} (Qty: ${qty})\n`;
    }

    const mailOptionsStudent = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: 'Borrow Request Submitted',
      text: `Your borrow request #${requestID} has been submitted with the following items:\n\n${itemDetails}\nYou will be notified once it is approved.`
    };

    const mailOptionsAdmin = {
      from: process.env.EMAIL,
      to: adminEmail,
      subject: 'New Borrow Request',
      text: `A new borrow request #${requestID} has been submitted with the following items:\n\n${itemDetails}\nPlease review and approve it.`
    };

    await transporter.sendMail(mailOptionsStudent);
    await transporter.sendMail(mailOptionsAdmin);
  },

  /**
   * Called when Admin approves the Borrow Request. We now have final items,
   * some possibly removed or updated with serial numbers.
   */
  sendApprovalNotification: async (studentEmail, requestID, returnDate, approvedItems) => {
    let itemDetails = '';
    for (const item of approvedItems) {
      const equipName = item.Equipment ? item.Equipment.Name : 'Unknown Equipment';
      const qty = item.Quantity || 1;
      // If there's a serialNumber set, include it
      const sn = item.SerialNumber ? ` (SN: ${item.SerialNumber})` : '';
      itemDetails += ` - ${equipName} x${qty}${sn}\n`;
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: 'Borrow Request Approved',
      text: `Your borrow request #${requestID} has been approved. The return deadline is: ${returnDate}.\n\nApproved items:\n${itemDetails}`
    };

    await transporter.sendMail(mailOptions);
  },

  sendReminder: async (studentEmail, requestID, returnDate) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: 'Equipment Return Reminder',
      text: `This is a reminder that your borrow request #${requestID} is due on ${returnDate}. Please return it on time.`
    };

    await transporter.sendMail(mailOptions);
  }
};

module.exports = EmailService;
