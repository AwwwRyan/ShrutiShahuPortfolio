import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSiteContent } from '@/lib/siteContent';
import { ContactValidationError, validateContactForm } from '@/lib/contact';
import { sendContactMessage } from '@/lib/email';

// No dynamic API usage of its own — force per-request rendering so contact
// info changes (via the future Stage 9 admin UI) don't need a rebuild.
export const dynamic = 'force-dynamic';

type SocialLink = { label: string; url: string };

function parseSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(
    (item): item is SocialLink =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as SocialLink).label === 'string' &&
      typeof (item as SocialLink).url === 'string',
  );
}

async function submitContactFormAction(formData: FormData) {
  'use server';

  const input = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
  };

  try {
    validateContactForm(input);
  } catch (error) {
    if (error instanceof ContactValidationError) {
      redirect('/contact?error=validation');
    }
    throw error;
  }

  try {
    await sendContactMessage(input.name, input.email, input.message);
  } catch {
    // Deliberately NOT a false "message sent" — a visitor who thinks their
    // message went through when it didn't is worse than a visible error.
    redirect('/contact?error=send_failed');
  }

  redirect('/contact?sent=1');
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [siteContent, { sent, error }] = await Promise.all([getSiteContent(), searchParams]);
  const socialLinks = parseSocialLinks(siteContent?.socialLinks);

  return (
    <main>
      <h1>Contact</h1>
      <p>
        <Link href="/">Home</Link>
      </p>

      {siteContent?.contactEmail && (
        <p>
          Email: <a href={`mailto:${siteContent.contactEmail}`}>{siteContent.contactEmail}</a>
        </p>
      )}

      {socialLinks.length > 0 && (
        <ul>
          {socialLinks.map((link) => (
            <li key={link.url}>
              <a href={link.url}>{link.label}</a>
            </li>
          ))}
        </ul>
      )}

      {!siteContent?.contactEmail && socialLinks.length === 0 && (
        <p>Contact info coming soon.</p>
      )}

      <h2>Send a message</h2>

      {sent && <p role="status">Thanks — your message has been sent.</p>}
      {error === 'validation' && (
        <p role="alert">Please fill in your name, a valid email, and a message.</p>
      )}
      {error === 'send_failed' && (
        <p role="alert">
          Something went wrong sending your message. Please try again later, or email directly if
          the problem persists.
        </p>
      )}

      <form action={submitContactFormAction}>
        <label>
          Name
          <input type="text" name="name" required />
        </label>
        <label>
          Email
          <input type="email" name="email" required />
        </label>
        <label>
          Message
          <textarea name="message" required />
        </label>
        <button type="submit">Send</button>
      </form>
    </main>
  );
}
