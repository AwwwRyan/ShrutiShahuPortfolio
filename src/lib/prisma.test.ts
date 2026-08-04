import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';

// Unique-per-run prefix so this test never collides with real/seed data,
// and so cleanup can find everything it created without tracking every id.
const RUN = `test-${Date.now()}`;

describe('Prisma schema CRUD (against the real dev database)', () => {
  afterAll(async () => {
    // Deleting top-level categories cascades to their children and projects
    // (and projects cascade to their links), per the schema's onDelete: Cascade.
    await prisma.category.deleteMany({ where: { slug: { startsWith: RUN } } });
    await prisma.adminUser.deleteMany({ where: { email: { startsWith: RUN } } });
    await prisma.siteContent.deleteMany({ where: { id: `${RUN}-singleton` } });
    await prisma.$disconnect();
  });

  it('creates a category and a nested subcategory', async () => {
    const parent = await prisma.category.create({
      data: { name: 'Marketing', slug: `${RUN}-marketing`, order: 0 },
    });
    const child = await prisma.category.create({
      data: {
        name: 'Video/UGC Scripts',
        slug: `${RUN}-marketing-video`,
        order: 0,
        parentId: parent.id,
      },
    });

    const parentWithChildren = await prisma.category.findUniqueOrThrow({
      where: { id: parent.id },
      include: { children: true },
    });

    expect(parentWithChildren.children).toHaveLength(1);
    expect(parentWithChildren.children[0].id).toBe(child.id);
    expect(child.parentId).toBe(parent.id);
  });

  it('creates a project with gallery, tags, videoUrl, and multiple links, then reads it back', async () => {
    const category = await prisma.category.create({
      data: { name: 'Digital Journalism', slug: `${RUN}-digital-journalism` },
    });

    const project = await prisma.project.create({
      data: {
        header: 'Digital News Roundup',
        description: 'A carousel-style news graphic series.',
        gallery: ['img-49.jpg', 'img-50.jpg', 'img-51.jpg'],
        tags: ['news', 'social'],
        featured: true,
        categoryId: category.id,
        links: {
          create: [
            { label: 'Original post', url: 'https://example.com/post', order: 0 },
            { label: 'Download PDF', url: 'https://example.com/doc.pdf', order: 1 },
          ],
        },
      },
    });

    const found = await prisma.project.findUniqueOrThrow({
      where: { id: project.id },
      include: { links: true, category: true },
    });

    expect(found.header).toBe('Digital News Roundup');
    expect(found.gallery).toEqual(['img-49.jpg', 'img-50.jpg', 'img-51.jpg']);
    expect(found.tags).toEqual(['news', 'social']);
    expect(found.featured).toBe(true);
    expect(found.links).toHaveLength(2);
    expect(found.category.slug).toBe(`${RUN}-digital-journalism`);
  });

  it('updates a category name and a project header', async () => {
    const category = await prisma.category.create({
      data: { name: 'Writing', slug: `${RUN}-writing` },
    });
    const project = await prisma.project.create({
      data: { header: 'Draft title', description: 'x', categoryId: category.id },
    });

    const updatedCategory = await prisma.category.update({
      where: { id: category.id },
      data: { name: 'Writing (updated)' },
    });
    const updatedProject = await prisma.project.update({
      where: { id: project.id },
      data: { header: 'Final title' },
    });

    expect(updatedCategory.name).toBe('Writing (updated)');
    expect(updatedProject.header).toBe('Final title');
  });

  it('cascades deletes: removing a parent category removes its subcategory, project, and links', async () => {
    const parent = await prisma.category.create({
      data: { name: 'Editing', slug: `${RUN}-editing` },
    });
    const child = await prisma.category.create({
      data: { name: 'Academic', slug: `${RUN}-editing-academic`, parentId: parent.id },
    });
    const project = await prisma.project.create({
      data: {
        header: 'Sample edit',
        description: 'x',
        categoryId: child.id,
        links: { create: [{ label: 'Doc', url: 'https://example.com/doc' }] },
      },
    });
    const link = await prisma.projectLink.findFirstOrThrow({ where: { projectId: project.id } });

    await prisma.category.delete({ where: { id: parent.id } });

    expect(await prisma.category.findUnique({ where: { id: child.id } })).toBeNull();
    expect(await prisma.project.findUnique({ where: { id: project.id } })).toBeNull();
    expect(await prisma.projectLink.findUnique({ where: { id: link.id } })).toBeNull();
  });

  it('creates an admin user with a password reset token, and cascades on delete', async () => {
    const admin = await prisma.adminUser.create({
      data: { email: `${RUN}-shruti@example.com`, passwordHash: 'hashed' },
    });
    const token = await prisma.passwordResetToken.create({
      data: {
        tokenHash: `${RUN}-token-hash`,
        adminUserId: admin.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    expect(token.usedAt).toBeNull();

    await prisma.adminUser.delete({ where: { id: admin.id } });
    expect(await prisma.passwordResetToken.findUnique({ where: { id: token.id } })).toBeNull();
  });

  it('upserts the SiteContent singleton', async () => {
    const id = `${RUN}-singleton`;
    const created = await prisma.siteContent.create({
      data: { id, aboutMe: 'Hello, I am Shruti.' },
    });
    expect(created.aboutMe).toBe('Hello, I am Shruti.');

    const updated = await prisma.siteContent.update({
      where: { id },
      data: { aboutMe: 'Updated bio.', resumeUrl: 'https://example.com/resume.pdf' },
    });
    expect(updated.aboutMe).toBe('Updated bio.');
    expect(updated.resumeUrl).toBe('https://example.com/resume.pdf');
  });
});
