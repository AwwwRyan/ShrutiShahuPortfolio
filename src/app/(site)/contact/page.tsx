import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { buildMailtoHref, getSiteContent, parseSocialLinks } from '@/lib/siteContent';
import { ContactValidationError, validateContactForm } from '@/lib/contact';
import { sendContactMessage } from '@/lib/email';
import { Motif } from '@/components/decor/Motif';
import { SERVICE_INQUIRY_TEMPLATES } from '@/lib/serviceInquiryTemplates';
import { ContactSubmitButton } from '@/components/ContactSubmitButton';

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

  const siteContent = await getSiteContent();
  const to = siteContent?.contactEmail;
  if (!to) {
    redirect('/contact?error=send_failed');
  }

  try {
    await sendContactMessage(input.name, input.email, input.message, to);
  } catch {
    // Deliberately NOT a false "message sent" — a visitor who thinks their
    // message went through when it didn't is worse than a visible error.
    redirect('/contact?error=send_failed');
  }

  redirect('/contact?sent=1');
}

const inputClasses =
  'w-full rounded-lg border border-paper/15 bg-paper/[0.06] px-4 py-3 text-paper placeholder:text-paper/40 focus:border-chartreuse focus:outline-none';

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [siteContent, { sent, error, service }] = await Promise.all([getSiteContent(), searchParams]);
  const socialLinks = parseSocialLinks(siteContent?.socialLinks);
  const prefilledMessage =
    typeof service === 'string' ? SERVICE_INQUIRY_TEMPLATES[service] : undefined;

  return (
    <main className="relative mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Motif type="blob" tone="chartreuse" size={110} depth={2} opacity={0.15} className="top-0 -right-10 hidden sm:block" />
      <p className="text-sm text-paper/60">
        <Link href="/" className="hover:text-chartreuse hover:underline">
          Home
        </Link>
      </p>

      <h1 className="mt-3 font-serif text-4xl text-paper sm:text-5xl">Get in touch</h1>

      <div className="mt-6 space-y-2">
        {siteContent?.contactEmail && (
          <p>
            <a
              href={buildMailtoHref(siteContent.contactEmail)}
              className="text-paper underline underline-offset-4 hover:text-chartreuse"
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-paper underline underline-offset-4 hover:text-chartreuse"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        {!siteContent?.contactEmail && socialLinks.length === 0 && (
          <p className="text-paper/60">Contact info coming soon.</p>
        )}
      </div>

      <h2 className="mt-12 font-serif text-2xl text-paper">Send a message</h2>

      {sent && (
        <div
          role="status"
          className="mt-4 flex items-start gap-4 rounded-2xl border border-chartreuse/30 bg-chartreuse/10 px-5 py-5 animate-[banner-in_0.45s_ease-out] sm:items-center"
        >
          <span className="blob-mask flex h-12 w-12 shrink-0 items-center justify-center bg-chartreuse text-near-black-olive">
            <MailCheck className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div>
            <p className="font-serif text-lg text-paper">Got it — thank you!</p>
            <p className="mt-1 text-sm text-paper/70">
              Your message just landed in my inbox. I read every one myself, so expect to hear back soon.
            </p>
          </div>
        </div>
      )}
      {error === 'validation' && (
        <p role="alert" className="mt-4 rounded-lg bg-paper px-4 py-3 text-near-black-olive">
          Please fill in your name, a valid email, and a message.
        </p>
      )}
      {error === 'send_failed' && (
        <p role="alert" className="mt-4 rounded-lg bg-paper px-4 py-3 text-near-black-olive">
          Something went wrong sending your message. Please try again later, or email directly if
          the problem persists.
        </p>
      )}

      <form action={submitContactFormAction} className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-paper">
            Name
          </label>
          <input type="text" id="name" name="name" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-paper">
            Email
          </label>
          <input type="email" id="email" name="email" required className={inputClasses} />
        </div>
        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-paper">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={prefilledMessage ? 9 : 5}
            defaultValue={prefilledMessage}
            className={inputClasses}
          />
        </div>
        <ContactSubmitButton />
      </form>
    </main>
  );
}
