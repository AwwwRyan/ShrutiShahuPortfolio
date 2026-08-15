import nodemailer from 'nodemailer';

// Gmail SMTP via a Google App Password (requires 2-Step Verification on the sending
// account) — chosen over Resend's free tier because that tier only delivers to the
// Resend account owner's own email without a verified sending domain, which silently
// blocked contact-form messages from ever reaching the admin's inbox. See memory.md.
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD must be configured to send email.');
  }
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Reset your admin password',
    html: `
      <p>Someone requested a password reset for the Shruti Shahu Portfolio admin panel.</p>
      <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour and can only be used once.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    `,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Sends a contact-form submission to the site's admin address.
 * `transporter.sendMail` rejects on failure (unlike the Resend SDK, which returned
 * `{ data, error }` and required an explicit check) — a thrown error here propagates
 * to the caller, which is what stops the visitor from wrongly being told "message sent".
 */
export async function sendContactMessage(name: string, email: string, message: string) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    throw new Error('ADMIN_EMAIL is not configured.');
  }

  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
  });
}
