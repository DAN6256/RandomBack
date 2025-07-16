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
    // Build item list for text version
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
        <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 12px; margin-bottom: 10px;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #007bff;">${equipName}</p>
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            <strong>Quantity:</strong> ${qty}
            ${desc ? `<br><strong>Description:</strong> ${desc}` : ''}
          </p>
        </div>
      `;
    }

    const studentHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 style="color: #007bff; margin: 0; font-size: 24px;">Borrow Request Submitted</h2>
          <div style="background-color: #e9ecef; padding: 8px 12px; border-radius: 4px; font-weight: bold; color: #495057; display: inline-block; margin: 10px 0;">
            Request ID: #${requestID}
          </div>
        </div>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <p>Your borrow request has been successfully submitted and is now being processed by our lab staff.</p>
        
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #495057; margin-top: 0;">Requested Items:</h4>
          ${itemDetailsHtml}
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong style="color: #856404;">📍 Important:</strong> You will need to go to the fablab to collect these items at the time you indicated in your request.</p>
        </div>
        
        <p>You will receive another email once your request has been reviewed and approved.</p>
        
        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
          <p>Best regards,<br>
          <strong style="color: #007bff;">Fabtrack Team</strong></p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 style="color: #007bff; margin: 0; font-size: 24px;">New Borrow Request</h2>
          <div style="background-color: #e9ecef; padding: 8px 12px; border-radius: 4px; font-weight: bold; color: #495057; display: inline-block; margin: 10px 0;">
            Request ID: #${requestID}
          </div>
        </div>
        
        <p>A new borrow request has been submitted by <strong>${studentName}</strong>.</p>
        
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #495057; margin-top: 0;">Requested Items:</h4>
          ${itemDetailsHtml}
        </div>
        
        ${collectionDateTime ? `
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong style="color: #856404;">📅 Requested Pick-up Date/Time:</strong> ${formatDate(collectionDateTime)}</p>
          </div>
        ` : ''}
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h4 style="color: #721c24; margin-top: 0;">Action Required:</h4>
          <ul style="margin: 0;">
            <li>Please prepare the component(s) for pickup by the pickup time</li>
            <li>Do not forget to validate that the components have been given out</li>
          </ul>
        </div>
        
        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
          <p>Best regards,<br>
          <strong style="color: #007bff;">Fabtrack System</strong></p>
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
        <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 4px; padding: 12px; margin-bottom: 10px;">
          <p style="margin: 0 0 5px 0; font-weight: bold; color: #007bff;">${equipName}</p>
          <p style="margin: 0; color: #6c757d; font-size: 14px;">
            <strong>Quantity:</strong> ${qty}
            ${sn ? `<br><strong>Serial Number:</strong> ${sn}` : ''}
            ${desc ? `<br><strong>Description:</strong> ${desc}` : ''}
          </p>
        </div>
      `;
    }

    const approvalHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 style="color: #007bff; margin: 0; font-size: 24px;">Request Approved! 🎉</h2>
          <div style="background-color: #e9ecef; padding: 8px 12px; border-radius: 4px; font-weight: bold; color: #495057; display: inline-block; margin: 10px 0;">
            Request ID: #${requestID}
          </div>
        </div>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 15px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p style="margin: 0;"><strong style="color: #155724;">✅ Great news!</strong> Your borrow request has been approved and is ready for collection.</p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong style="color: #856404;">📅 Return Deadline:</strong> ${formatDate(returnDate)}</p>
        </div>
        
        <div style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin: 20px 0;">
          <h4 style="color: #495057; margin-top: 0;">Approved Items:</h4>
          ${itemDetailsHtml}
        </div>
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="margin: 0;"><strong style="color: #721c24;">⚠️ Important:</strong> Please ensure to return all items on time to avoid any penalties.</p>
        </div>
        
        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
          <p>Best regards,<br>
          <strong style="color: #007bff;">Fabtrack Team</strong></p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 style="color: #007bff; margin: 0; font-size: 24px;">Items Returned Successfully</h2>
          <div style="background-color: #e9ecef; padding: 8px 12px; border-radius: 4px; font-weight: bold; color: #495057; display: inline-block; margin: 10px 0;">
            Request ID: #${requestID}
          </div>
        </div>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; border-radius: 4px; padding: 15px; margin: 20px 0; border-left: 4px solid #17a2b8;">
          <p style="margin: 0;"><strong style="color: #0c5460;">✅ Confirmed:</strong> Your borrow request has been marked as returned by the admin.</p>
        </div>
        
        <p>Thank you for returning the borrowed items. Your request has been successfully completed.</p>
        
        <p>If you have any questions or concerns, please don't hesitate to contact the lab staff.</p>
        
        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
          <p>Best regards,<br>
          <strong style="color: #007bff;">Fabtrack Team</strong></p>
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="border-bottom: 3px solid #007bff; padding-bottom: 20px; margin-bottom: 30px;">
          <h2 style="color: #007bff; margin: 0; font-size: 24px;">Equipment Return Reminder</h2>
          <div style="background-color: #e9ecef; padding: 8px 12px; border-radius: 4px; font-weight: bold; color: #495057; display: inline-block; margin: 10px 0;">
            Request ID: #${requestID}
          </div>
        </div>
        
        <p>Dear <strong>${studentName}</strong>,</p>
        
        <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <p style="margin: 0;"><strong style="color: #721c24;">⏰ Reminder:</strong> This is a friendly reminder that your borrow request is/was due for return.</p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0;"><strong style="color: #856404;">📅 Return Date:</strong> ${formatDate(returnDate)}</p>
        </div>
        
        <p>Please return the borrowed equipment as soon as possible to avoid any late fees or penalties.</p>
        
        <p>If you have already returned the items, please disregard this message.</p>
        
        <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; text-align: center; color: #6c757d; font-size: 14px;">
          <p>Best regards,<br>
          <strong style="color: #007bff;">Fabtrack Team</strong></p>
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