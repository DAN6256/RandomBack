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

// Helper function to format dates in human-readable format
const formatDate = (date) => {
  if (!date) return '';
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  };
  return new Date(date).toLocaleDateString('en-US', options);
};

// Common CSS styles for all emails
const getEmailStyles = () => `
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .email-container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      border-bottom: 3px solid #007bff;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #007bff;
      margin: 0;
      font-size: 24px;
    }
    .request-id {
      background-color: #e9ecef;
      padding: 8px 12px;
      border-radius: 4px;
      font-weight: bold;
      color: #495057;
      display: inline-block;
      margin: 10px 0;
    }
    .items-list {
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 20px;
      margin: 20px 0;
    }
    .items-list h3 {
      margin-top: 0;
      color: #495057;
      font-size: 18px;
    }
    .item {
      background-color: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .item:last-child {
      margin-bottom: 0;
    }
    .item-name {
      font-weight: bold;
      color: #007bff;
    }
    .item-details {
      color: #6c757d;
      font-size: 14px;
      margin-top: 5px;
    }
    .date-info {
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      padding: 15px;
      margin: 20px 0;
    }
    .date-info strong {
      color: #856404;
    }
    .footer {
      border-top: 1px solid #dee2e6;
      padding-top: 20px;
      margin-top: 30px;
      text-align: center;
      color: #6c757d;
      font-size: 14px;
    }
    .signature {
      color: #007bff;
      font-weight: bold;
    }
    .status-approved {
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      color: #155724;
      padding: 10px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .status-returned {
      background-color: #d1ecf1;
      border: 1px solid #bee5eb;
      color: #0c5460;
      padding: 10px;
      border-radius: 4px;
      margin: 15px 0;
    }
    .reminder-alert {
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 15px;
      border-radius: 4px;
      margin: 15px 0;
    }
  </style>
`;

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

    // Build HTML item list
    let itemDetailsHtml = '';
    for (const item of borrowedItems) {
      const equipName = item.Equipment ? item.Equipment.Name : 'Unknown Equipment';
      const qty = item.Quantity || 1;
      const desc = item.Description ? item.Description : '';
      
      itemDetailsHtml += `
        <div class="item">
          <div class="item-name">${equipName}</div>
          <div class="item-details">
            <strong>Quantity:</strong> ${qty}
            ${desc ? `<br><strong>Description:</strong> ${desc}` : ''}
          </div>
        </div>
      `;
    }

    const studentHtml = `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="header">
          <h1>Borrow Request Submitted</h1>
          <div class="request-id">Request ID: #${requestID}</div>
        </div>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Your borrow request has been successfully submitted and is now being processed by our lab staff.</p>
        
        <div class="items-list">
          <h3>Requested Items:</h3>
          ${itemDetailsHtml}
        </div>
        
        <div class="date-info">
          <strong>📍 Important:</strong> You will need to go to the fablab to collect these items at the time you indicated in your request.
        </div>
        
        <p>You will receive another email once your request has been reviewed and approved.</p>
        
        <div class="footer">
          <p>Best regards,<br>
          <span class="signature">Fabtrack Team</span></p>
        </div>
      </div>
    `;

    const mailOptionsStudent = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Submitted`,
      text: `Dear ${studentName},\n\nYour borrow request #${requestID} has been submitted with the following items:\n\n${itemDetails}\nYou will need to go to the fablab to collect them at the time you indicated in your request\nRegards,\nFabtrack`,
      html: studentHtml
    };

    let adminBody = `A new borrow request #${requestID} has been submitted by ${studentName} with the following items:\n\n${itemDetails}`;
    if (collectionDateTime) {
      adminBody += `Requested pick-up date/time: ${formatDate(collectionDateTime)}\n`;
    }
    adminBody += `Please prepare the component(s) for pickup by the pickup time and do not forgot to validate that the components have been given out\nRegards, \nFabtrack`;

    const adminHtml = `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="header">
          <h1>New Borrow Request</h1>
          <div class="request-id">Request ID: #${requestID}</div>
        </div>
        
        <p>A new borrow request has been submitted by <strong>${studentName}</strong>.</p>
        
        <div class="items-list">
          <h3>Requested Items:</h3>
          ${itemDetailsHtml}
        </div>
        
        ${collectionDateTime ? `
          <div class="date-info">
            <strong>📅 Requested Pick-up Date/Time:</strong> ${formatDate(collectionDateTime)}
          </div>
        ` : ''}
        
        <div class="reminder-alert">
          <strong>⚠️ Action Required:</strong> Please prepare the component(s) for pickup by the pickup time and do not forget to validate that the components have been given out.
        </div>
        
        <div class="footer">
          <p>Best regards,<br>
          <span class="signature">Fabtrack System</span></p>
        </div>
      </div>
    `;

    const mailOptionsAdmin = {
      from: process.env.EMAIL,
      to: adminEmail,
      subject: `New Borrow Request #${requestID}`,
      text: adminBody,
      html: adminHtml
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

    // Build HTML item list
    let itemDetailsHtml = '';
    for (const item of approvedItems) {
      const equipName = item.Equipment ? item.Equipment.Name : 'Unknown Equipment';
      const qty = item.Quantity || 1;
      const sn = item.SerialNumber ? item.SerialNumber : '';
      const desc = item.Description ? item.Description : '';
      
      itemDetailsHtml += `
        <div class="item">
          <div class="item-name">${equipName}</div>
          <div class="item-details">
            <strong>Quantity:</strong> ${qty}
            ${sn ? `<br><strong>Serial Number:</strong> ${sn}` : ''}
            ${desc ? `<br><strong>Description:</strong> ${desc}` : ''}
          </div>
        </div>
      `;
    }

    const approvalHtml = `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="header">
          <h1>Request Approved! 🎉</h1>
          <div class="request-id">Request ID: #${requestID}</div>
        </div>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <div class="status-approved">
          <strong>✅ Great news!</strong> Your borrow request has been approved and is ready for collection.
        </div>
        
        <div class="date-info">
          <strong>📅 Return Deadline:</strong> ${formatDate(returnDate)}
        </div>
        
        <div class="items-list">
          <h3>Approved Items:</h3>
          ${itemDetailsHtml}
        </div>
        
        <div class="reminder-alert">
          <strong>⚠️ Important:</strong> Please ensure to return all items on time to avoid any penalties.
        </div>
        
        <div class="footer">
          <p>Best regards,<br>
          <span class="signature">Fabtrack Team</span></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Approved`,
      text: `Dear ${studentName},\n\nYour borrow request #${requestID} has been approved.\nReturn deadline: ${formatDate(returnDate)}\n\nApproved items:\n${itemDetails}\n Ensure to submit request on time.\nRegards,\nFabtrack`,
      html: approvalHtml
    };

    await transporter.sendMail(mailOptions);
  },

  sendReturnConfirmation: async (studentName, studentEmail, requestID) => {
    const confirmationHtml = `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="header">
          <h1>Items Returned Successfully</h1>
          <div class="request-id">Request ID: #${requestID}</div>
        </div>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <div class="status-returned">
          <strong>✅ Confirmed:</strong> Your borrow request has been marked as returned by the admin.
        </div>
        
        <p>Thank you for returning the borrowed items on time. Your request has been successfully completed.</p>
        
        <p>If you have any questions or concerns, please don't hesitate to contact the lab staff.</p>
        
        <div class="footer">
          <p>Best regards,<br>
          <span class="signature">Fabtrack Team</span></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: `Borrow Request #${requestID} Returned`,
      text: `Dear ${studentName},\n\nYour borrow request #${requestID} has been marked as returned by the admin. If you have any questions, contact the lab staff.\n`,
      html: confirmationHtml
    };
    
    await transporter.sendMail(mailOptions);
  },

  sendReminder: async (studentName, studentEmail, requestID, returnDate) => {
    const reminderHtml = `
      ${getEmailStyles()}
      <div class="email-container">
        <div class="header">
          <h1>Equipment Return Reminder</h1>
          <div class="request-id">Request ID: #${requestID}</div>
        </div>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <div class="reminder-alert">
          <strong>⏰ Reminder:</strong> This is a friendly reminder that your borrow request is/was due for return.
        </div>
        
        <div class="date-info">
          <strong>📅 Return Date:</strong> ${formatDate(returnDate)}
        </div>
        
        <p>Please return the borrowed equipment as soon as possible to avoid any late fees or penalties.</p>
        
        <p>If you have already returned the items, please disregard this message.</p>
        
        <div class="footer">
          <p>Best regards,<br>
          <span class="signature">Fabtrack Team</span></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL,
      to: studentEmail,
      subject: 'Equipment Return Reminder',
      text: `Dear ${studentName},\n\nThis is a reminder that your borrow request #${requestID} is/was due on ${formatDate(returnDate)}.\nRegards,\nFabtrack`,
      html: reminderHtml
    };

    await transporter.sendMail(mailOptions);
  },
  
};

module.exports = EmailService;