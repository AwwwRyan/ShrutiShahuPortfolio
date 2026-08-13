import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import { getSiteContent, updateSiteContent } from './siteContent';

// SiteContent is a genuine singleton (fixed id "singleton") destined to hold
// real production content — this suite snapshots whatever state it finds
// the row in and restores it exactly afterward, rather than permanently
// mutating live data.
describe('siteContent', () => {
  let originalSnapshot: Awaited<ReturnType<typeof prisma.siteContent.findUnique>> = null;

  beforeAll(async () => {
    originalSnapshot = await prisma.siteContent.findUnique({ where: { id: 'singleton' } });
  });

  afterAll(async () => {
    if (originalSnapshot) {
      await prisma.siteContent.update({
        where: { id: 'singleton' },
        data: {
          aboutMe: originalSnapshot.aboutMe,
          profilePhoto: originalSnapshot.profilePhoto,
          resumeUrl: originalSnapshot.resumeUrl,
          contactEmail: originalSnapshot.contactEmail,
          socialLinks: originalSnapshot.socialLinks as never,
        },
      });
    } else {
      await prisma.siteContent.delete({ where: { id: 'singleton' } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('getSiteContent', () => {
    it('reflects whatever state the singleton is currently in', async () => {
      const direct = await prisma.siteContent.findUnique({ where: { id: 'singleton' } });
      const viaHelper = await getSiteContent();
      expect(viaHelper?.id ?? null).toBe(direct?.id ?? null);
    });
  });

  describe('updateSiteContent', () => {
    it('creates the singleton when none exists, and updates it thereafter', async () => {
      const created = await updateSiteContent({
        aboutMe: '<p>Test bio</p>',
        contactEmail: 'test@example.com',
        socialLinks: [{ label: 'LinkedIn', url: 'https://linkedin.com/in/test' }],
        profilePhoto: 'https://example.com/photo.jpg',
        resumeUrl: 'https://example.com/resume.pdf',
      });

      expect(created.aboutMe).toBe('<p>Test bio</p>');
      expect(created.socialLinks).toEqual([
        { label: 'LinkedIn', url: 'https://linkedin.com/in/test' },
      ]);

      const updated = await updateSiteContent({
        aboutMe: '<p>Updated bio</p>',
        contactEmail: 'new@example.com',
        socialLinks: [],
        profilePhoto: null,
        resumeUrl: 'https://example.com/resume.pdf',
      });

      expect(updated.aboutMe).toBe('<p>Updated bio</p>');
      expect(updated.contactEmail).toBe('new@example.com');
      expect(updated.socialLinks).toEqual([]);
      expect(updated.profilePhoto).toBeNull();
      expect(updated.resumeUrl).toBe('https://example.com/resume.pdf');
    });

    it('filters out social link rows with a blank label or url', async () => {
      const result = await updateSiteContent({
        aboutMe: 'x',
        contactEmail: null,
        socialLinks: [
          { label: 'Real', url: 'https://example.com' },
          { label: '', url: '' },
          { label: 'No url', url: '' },
        ],
        profilePhoto: null,
        resumeUrl: null,
      });

      expect(result.socialLinks).toEqual([{ label: 'Real', url: 'https://example.com' }]);
    });
  });
});
