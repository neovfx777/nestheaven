const nodemailer = require('nodemailer');
const env = require('../config/env');

let cachedTransporter = null;

function isMailerConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return cachedTransporter;
}

async function sendVerificationEmail({ to, verifyUrl }) {
  if (!isMailerConfigured()) {
    if (env.EMAIL_REQUIRE_VERIFICATION) {
      const err = new Error('SMTP is not configured for email verification');
      err.statusCode = 500;
      throw err;
    }

    // In non-required mode, we keep registration flow working for environments without SMTP.
    console.warn('[mailer] SMTP not configured. Verification email was skipped for:', to);
    return { skipped: true };
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'NestHeaven email verification',
    text: `Please verify your email by opening this link: ${verifyUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>NestHeaven email verification</h2>
        <p>Accountingizni faollashtirish uchun quyidagi tugmani bosing:</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px">
            Emailni tasdiqlash
          </a>
        </p>
        <p>Agar tugma ishlamasa, ushbu linkni brauzerga qo'ying:</p>
        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      </div>
    `,
  });

  return { skipped: false };
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  if (!isMailerConfigured()) {
    if (env.EMAIL_REQUIRE_VERIFICATION) {
      const err = new Error('SMTP is not configured for password reset');
      err.statusCode = 500;
      throw err;
    }

    console.warn('[mailer] SMTP not configured. Password reset email was skipped for:', to);
    return { skipped: true };
  }

  const transporter = getTransporter();
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject: 'NestHeaven password reset',
      text: `Reset your password by opening this link: ${resetUrl}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
          <h2>NestHeaven password reset</h2>
          <p>Parolni yangilash uchun quyidagi tugmani bosing:</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px">
              Parolni yangilash
            </a>
          </p>
          <p>Agar tugma ishlamasa, ushbu linkni brauzerga qo'ying:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
        </div>
      `,
    });
  } catch (error) {
    if (env.EMAIL_REQUIRE_VERIFICATION) {
      throw error;
    }

    console.warn('[mailer] Password reset email failed and was skipped:', to);
    return { skipped: true };
  }

  return { skipped: false };
}

module.exports = {
  isMailerConfigured,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
