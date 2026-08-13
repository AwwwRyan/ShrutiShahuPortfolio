import { prisma } from './prisma';

export async function getSiteContent() {
  return prisma.siteContent.findUnique({ where: { id: 'singleton' } });
}

export type SocialLink = { label: string; url: string };

export function parseSocialLinks(value: unknown): SocialLink[] {
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

/** Number of label/url social link slots the admin form renders. */
export const SOCIAL_LINK_SLOTS = 6;

export type SocialLinkInput = { label: string; url: string };

export type SiteContentInput = {
  aboutMe: string;
  contactEmail: string | null;
  socialLinks: SocialLinkInput[];
  profilePhoto: string | null;
  resumeUrl: string | null;
};

/**
 * Upserts the SiteContent singleton. Callers are responsible for merging
 * "keep the existing file" logic (e.g. profilePhoto/resumeUrl unchanged
 * when no new upload was provided) before calling this — same convention
 * as updateProject's coverImage handling.
 */
export async function updateSiteContent(input: SiteContentInput) {
  const socialLinks = input.socialLinks.filter((l) => l.label.trim() && l.url.trim());

  return prisma.siteContent.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...input, socialLinks },
    update: { ...input, socialLinks },
  });
}
