import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async ({ to, otp }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2 style="color:#111">Your verification code</h2>
      <p>Use the code below to verify your email address. It expires in 5 minutes.</p>
      <div style="font-size:20px; font-weight:700; background:#f4f4f4; padding:10px; display:inline-block; border-radius:6px;">${otp}</div>
      <p style="color:#666; font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: "AI Fitness <noreply@mail.arjunbuilds.me>",
    to,
    subject: "Your verification code",
    html,
  });

  if (error) {
    console.error("OTP email failed:", error);
    throw new Error("Failed to send verification email.");
  }

  return data;
  };

export default { sendOtpEmail };
