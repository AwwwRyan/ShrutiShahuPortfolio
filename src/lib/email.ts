import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = 'onboarding@resend.dev';

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await resend.emails.send({
    from: FROM_ADDRESS,
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
 * The Resend SDK does NOT throw on API-level failures — it returns
 * `{ data, error }` — so we must check `error` explicitly and throw
 * ourselves, or a failed send would look identical to a successful one
 * to the caller (and the visitor would wrongly be told "message sent").
 */
export async function sendContactMessage(name: string, email: string, message: string) {
  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    throw new Error('ADMIN_EMAIL is not configured.');
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    replyTo: email,
    subject: `New contact form message from ${name}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    `,
  });

  if (error) {
    throw new Error(`Resend failed to send the contact message: ${error.message}`);
  }
}
