import nodemailer from 'nodemailer';

const sendVerificationEmail = async (toEmail, otp) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"AT7Store" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: 'Your AT7Store Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: #0f0f0f; color: #fff; border-radius: 12px;">
        <h2 style="color: #c9a96e; text-align: center;">AT7Store Email Verification</h2>
        <p style="text-align: center; color: #aaa;">Use the code below to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 40px; font-weight: bold; letter-spacing: 10px; color: #fff; background: #1a1a1a; padding: 15px 30px; border-radius: 8px; border: 1px solid #333;">
            ${otp}
          </span>
        </div>
        <p style="text-align: center; color: #aaa; font-size: 13px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
};

export default sendVerificationEmail;
