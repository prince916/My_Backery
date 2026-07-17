const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Email templates
const templates = {
  welcome: ({ name, verifyUrl }) => ({
    subject: `Welcome to My Bakery, ${name}! 🍰`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fffbf7;">
        <div style="text-align:center;padding:30px 0;">
          <h1 style="color:#c8601a;font-size:32px;margin:0;">🍰 My Bakery</h1>
          <p style="color:#888;margin-top:5px;">Freshly Baked with Love</p>
        </div>
        <div style="background:white;border-radius:12px;padding:30px;box-shadow:0 2px 15px rgba(0,0,0,0.08);">
          <h2 style="color:#2d2d2d;">Welcome, ${name}! 🎉</h2>
          <p style="color:#555;line-height:1.6;">Thank you for joining My Bakery. We're thrilled to have you with us!</p>
          <p style="color:#555;line-height:1.6;">Please verify your email address to get started:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${verifyUrl}" style="background:#c8601a;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">Verify Email</a>
          </div>
          <p style="color:#888;font-size:13px;">This link expires in 24 hours.</p>
        </div>
        <div style="text-align:center;padding:20px;color:#aaa;font-size:12px;">
          <p>© ${new Date().getFullYear()} My Bakery. All rights reserved.</p>
        </div>
      </div>
    `,
  }),

  resetPassword: ({ name, resetUrl }) => ({
    subject: 'My Bakery — Password Reset Request',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fffbf7;">
        <div style="text-align:center;padding:30px 0;">
          <h1 style="color:#c8601a;font-size:32px;">🍰 My Bakery</h1>
        </div>
        <div style="background:white;border-radius:12px;padding:30px;box-shadow:0 2px 15px rgba(0,0,0,0.08);">
          <h2 style="color:#2d2d2d;">Reset Your Password</h2>
          <p style="color:#555;">Hi ${name},</p>
          <p style="color:#555;line-height:1.6;">We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${resetUrl}" style="background:#c8601a;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">Reset Password</a>
          </div>
          <p style="color:#888;font-size:13px;">This link expires in 15 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: ({ name, order }) => ({
    subject: `Order Confirmed — ${order.orderNumber} 🍰`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fffbf7;">
        <div style="text-align:center;padding:30px 0;">
          <h1 style="color:#c8601a;font-size:32px;">🍰 My Bakery</h1>
        </div>
        <div style="background:white;border-radius:12px;padding:30px;box-shadow:0 2px 15px rgba(0,0,0,0.08);">
          <h2 style="color:#2d2d2d;">Thank you for your order, ${name}! 🎉</h2>
          <p style="color:#555;">Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
          <div style="background:#fffbf7;border-radius:8px;padding:15px;margin:20px 0;">
            <p style="margin:5px 0;color:#555;"><strong>Total:</strong> ₹${order.totalPrice}</p>
            <p style="margin:5px 0;color:#555;"><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
            ${order.deliveryDate ? `<p style="margin:5px 0;color:#555;"><strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>` : ''}
          </div>
          <p style="color:#555;">You can track your order in your dashboard. We'll keep you updated!</p>
        </div>
        <div style="text-align:center;padding:20px;color:#aaa;font-size:12px;">
          <p>© ${new Date().getFullYear()} My Bakery. All rights reserved.</p>
        </div>
      </div>
    `,
  }),
};

/**
 * Send email using a named template
 * @param {object} options - { to, subject, template, data }
 */
const sendEmail = async ({ to, subject, template, data, html }) => {
  let emailContent;
  if (template && templates[template]) {
    emailContent = templates[template](data);
  } else {
    emailContent = { subject, html };
  }

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject: emailContent.subject || subject,
    html:    emailContent.html    || html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
