import { buildMailtoHref, getSiteContent, parseSocialLinks } from '@/lib/siteContent';
import { Pill } from './Pill';

export async function Footer() {
  const siteContent = await getSiteContent();
  const socialLinks = parseSocialLinks(siteContent?.socialLinks);

  return (
    <footer className="mt-auto border-t border-paper/10 bg-navy-teal/30">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-serif text-lg text-paper">Shruti Shahu</p>
          {siteContent?.contactEmail && (
            <a
              href={buildMailtoHref(siteContent.contactEmail)}
              className="mt-1 block text-sm text-paper/70 hover:text-chartreuse"
            >
              {siteContent.contactEmail}
            </a>
          )}
          {socialLinks.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {socialLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-paper/70 underline underline-offset-4 hover:text-chartreuse"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Pill href="/contact" tone="dark">
          Want to know more? Let&apos;s talk
        </Pill>
      </div>
    </footer>
  );
}
