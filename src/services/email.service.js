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
   * @param {string} studentName 
   * @param {string} studentEmail
   * @param {string} adminEmail
   * @param {number} requestID
   * @param {Array} borrowedItems
   * @param {Date} collectionDateTime  
   */

  sendBorrowRequestNotification: async (studentName, studentEmail, adminEmail, requestID, borrowedItems, collectionDateTime) => {
    // Build item list
    let itemDetails = '';
    for (const item of borrowedItems) {
      const equipName = item.Equipment ? item.Equipment.Name : 'Unknown Equipment';
      const qty = item.Quantity || 1;
      const desc = item.Description ? ` | Description: "${item.Description}"` : '';
      itemDetails += ` - ${equipName} (Qty: ${qty}${desc})\n`;
    }

    const mailOptionsStudent = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Submitted`,
      text: `Dear ${studentName},\n\nYour borrow request #${requestID} has been submitted with the following items:\n\n${itemDetails}\nYou will need to go to the fablab to collect them at the time you indicated in your request\nRegards,\nFabtrack`
    };

    let adminBody = `A new borrow request #${requestID} has been submitted by ${studentName} with the following items:\n\n${itemDetails}`;
    if (collectionDateTime) {
      adminBody += `Requested pick-up date/time: ${collectionDateTime}\n`;
    }
    adminBody += `Please prepare the component(s) for pickup by the pickup time and do not forgot to validate that the components have been given out\nRegards, \nFabtrack`;

    const mailOptionsAdmin = {
      from: process.env.EMAIL,
      to: adminEmail,
      subject: `New Borrow Request #${requestID}`,
      text: adminBody
    };

    await transporter.sendMail(mailOptionsStudent);
    await transporter.sendMail(mailOptionsAdmin);
  },

  /**
   * Called when Admin approves the Borrow Request. We now have final items,
   * some possibly removed or updated with serial numbers.
   */
  sendApprovalNotification: async (studentName, studentEmail, requestID, returnDate, approvedItems) => {
    let itemDetails = '';
    for (const item of approvedItems) {
      const equipName = item.Equipment ? item.Equipment.Name : 'Unknown Equipment';
      const qty = item.Quantity || 1;
      // If there's a serialNumber set, include it
      const sn = item.SerialNumber ? ` (SN: ${item.SerialNumber})` : '';
      const desc = item.Description ? ` | Description: "${item.Description}"` : '';
      itemDetails += ` - ${equipName} x${qty}${sn}${desc}\n`;
    }

    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Approved`,
      text: `Dear ${studentName},\n\nYour borrow request #${requestID} has been approved.\nReturn deadline: ${returnDate}\n\nApproved items:\n${itemDetails}\n Ensure to submit request on time.\nRegards,\nFabtrack`
    };

    await transporter.sendMail(mailOptions);
  },
  sendReturnConfirmation: async (studentName, studentEmail, requestID) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Returned`,
      text: `Dear ${studentName},\n\nYour borrow request #${requestID} has been marked as returned by the admin. If you have any questions, contact the lab staff.\n`
    };
    await transporter.sendMail(mailOptions);
  },

  sendReminder: async (studentName, studentEmail, requestID, returnDate) => {
    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: 'Equipment Return Reminder',
      text: `Dear ${studentName},\n\nThis is a reminder that your borrow request #${requestID} is due on ${returnDate}.\Regards,\nFabtrack`
    };

    await transporter.sendMail(mailOptions);
  },
  
};

module.exports = EmailService;
