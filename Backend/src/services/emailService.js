import nodemailer from 'nodemailer';

const EMAIL_USER = process.env.GMAIL_EMAIL;
const EMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

let transporter = null;
if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    logger: process.env.NODE_ENV === 'production',
    debug: process.env.NODE_ENV === 'production',
  });
  console.log(`[Email] Transporter configured for ${EMAIL_USER}`);
} else {
  console.warn('[Email] EMAIL_USER or EMAIL_PASS not set — OTP emails will be logged to console');
}

export const sendOtpEmail = async ({ to, otp }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2 style="color:#111">Your verification code</h2>
      <p>Use the code below to verify your email address. It expires in 5 minutes.</p>
      <div style="font-size:20px; font-weight:700; background:#f4f4f4; padding:10px; display:inline-block; border-radius:6px;">${otp}</div>
      <p style="color:#666; font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  if (!transporter) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email transporter is not configured. Cannot send OTP.');
    }
    console.log(`[Email disabled] OTP email would be sent to: ${to}`);
    return;
  }

  const mailOptions = {
    from: EMAIL_USER,
    to,
    subject: 'Your verification code',
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  // nodemailer returns info; you can log it in debug mode
  if (!info.accepted || info.accepted.length === 0) {
    throw new Error('Failed to send OTP email');
  }
};

export default { sendOtpEmail };
