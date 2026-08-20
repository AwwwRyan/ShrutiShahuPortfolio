import { prisma } from './prisma';

/**
 * Every project cover/gallery image URL, deduped — used to warm the browser's cache
 * from the homepage (see MediaPreloader) so images don't pop in with a visible delay
 * the first time a visitor reaches a category/project page that uses them. Deliberately
 * excludes the profile photo — it's already rendered directly on the homepage itself
 * (via Hero), so prefetching it again here would just be a redundant, lower-priority
 * duplicate of a fetch that's already happening at full priority.
 */
export async function getAllImageUrls(): Promise<string[]> {
  const projects = await prisma.project.findMany({ select: { coverImage: true, gallery: true } });

  const urls = new Set<string>();
  for (const project of projects) {
    if (project.coverImage) urls.add(project.coverImage);
    for (const image of project.gallery) urls.add(image);
  }

  return Array.from(urls);
}

const DOC_EXTENSIONS = ['.pdf', '.doc', '.docx'];

/**
 * Every actual document file the site links to — the resume plus any project link
 * that points at a real .pdf/.doc/.docx, not an arbitrary external URL (e.g. a
 * project's `externalUrl`, or a "read the original" reference link to someone else's
 * site) — those aren't files we host, so there's nothing worth prefetching there.
 */
export async function getAllDocUrls(): Promise<string[]> {
  const [links, siteContent] = await Promise.all([
    prisma.projectLink.findMany({ select: { url: true } }),
    prisma.siteContent.findUnique({ where: { id: 'singleton' }, select: { resumeUrl: true } }),
  ]);

  const isDoc = (url: string) => DOC_EXTENSIONS.some((ext) => url.toLowerCase().endsWith(ext));

  const urls = new Set<string>();
  for (const link of links) {
    if (isDoc(link.url)) urls.add(link.url);
  }
  if (siteContent?.resumeUrl && isDoc(siteContent.resumeUrl)) urls.add(siteContent.resumeUrl);

  return Array.from(urls);
}
