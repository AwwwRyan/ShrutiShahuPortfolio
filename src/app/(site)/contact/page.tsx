import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSiteContent, parseSocialLinks } from '@/lib/siteContent';
import { ContactValidationError, validateContactForm } from '@/lib/contact';
import { sendContactMessage } from '@/lib/email';

// No dynamic API usage of its own — force per-request rendering so contact
// info changes (via the future Stage 9 admin UI) don't need a rebuild.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact — Shruti Shahu',
  description: 'Get in touch with Shruti Shahu — send a message, or find contact and social links.',
};

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

const inputClasses =
  'w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-navy-teal focus:outline-none';

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [siteContent, { sent, error }] = await Promise.all([getSiteContent(), searchParams]);
  const socialLinks = parseSocialLinks(siteContent?.socialLinks);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <p className="text-sm text-ink/60">
        <Link href="/" className="hover:text-ink hover:underline">
          Home
        </Link>
      </p>

      <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">Get in touch</h1>

      <div className="mt-6 space-y-2">
        {siteContent?.contactEmail && (
          <p>
            <a
              href={`mailto:${siteContent.contactEmail}`}
              className="text-ink underline underline-offset-4 hover:text-navy-teal"
            >
              {siteContent.contactEmail}
            </a>
          </p>
        )}

        {socialLinks.length > 0 && (
          <ul className="flex flex-wrap gap-4">
            {socialLinks.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  className="text-ink underline underline-offset-4 hover:text-navy-teal"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {!siteContent?.contactEmail && socialLinks.length === 0 && (
          <p className="text-ink/60">Contact info coming soon.</p>
        )}
      </div>

      <h2 className="mt-12 font-serif text-2xl text-ink">Send a message</h2>

      {sent && (
        <p role="status" className="mt-4 rounded-lg bg-olive-sage/20 px-4 py-3 text-ink">
          Thanks — your message has been sent.
        </p>
      )}
      {error === 'validation' && (
        <p role="alert" className="mt-4 rounded-lg bg-chartreuse/30 px-4 py-3 text-ink">
          Please fill in your name, a valid email, and a message.
        </p>
      )}
      {error === 'send_failed' && (
        <p role="alert" className="mt-4 rounded-lg bg-chartreuse/30 px-4 py-3 text-ink">
          Something went wrong sending your message. Please try again later, or email directly if
          the problem persists.
        </p>
      )}

      <form action={submitContactFormAction} className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <input type="text" id="name" name="name" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            Email
          </label>
          <input type="email" id="email" name="email" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">
            Message
          </label>
          <textarea id="message" name="message" required rows={5} className={inputClasses} />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-near-black-olive px-6 py-3 font-sans text-sm font-semibold tracking-wide text-paper transition-colors duration-200 hover:bg-navy-teal motion-reduce:transition-none"
        >
          Send
        </button>
      </form>
    </main>
  );
}
