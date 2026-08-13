import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  ProjectValidationError,
  createProject,
  deleteProject,
  getProject,
  listProjectsByCategory,
  moveProjectSibling,
  toggleFeatured,
  updateProject,
} from './projects';

const RUN = `test-proj-${Date.now()}`;

async function makeCategory(suffix: string) {
  return prisma.category.create({ data: { name: `${RUN} ${suffix}`, slug: `${RUN}-${suffix}` } });
}

describe('project CRUD logic', () => {
  afterAll(async () => {
    await prisma.category.deleteMany({ where: { name: { startsWith: RUN } } });
    await prisma.$disconnect();
  });

  it('requires a header', async () => {
    const category = await makeCategory('needs-header');
    await expect(
      createProject({ header: '', description: 'x', categoryId: category.id }),
    ).rejects.toThrow(ProjectValidationError);
  });

  it('requires a category', async () => {
    await expect(
      createProject({ header: 'A project', description: 'x', categoryId: '' }),
    ).rejects.toThrow(ProjectValidationError);
  });

  it('creates a project with gallery, tags, videoUrl, client, and multiple links', async () => {
    const category = await makeCategory('full-fields');

    const id = await createProject({
      header: 'Digital News Roundup',
      description: '<p>A carousel-style series.</p>',
      categoryId: category.id,
      coverImage: 'https://blob.example.com/cover.jpg',
      gallery: ['https://blob.example.com/1.jpg', 'https://blob.example.com/2.jpg'],
      videoUrl: 'https://youtube.com/shorts/abc',
      client: 'Self',
      tags: ['news', 'social'],
      featured: true,
      links: [
        { label: 'Original post', url: 'https://example.com/post' },
        { label: 'Download PDF', url: 'https://example.com/doc.pdf' },
      ],
    });

    const project = await getProject(id);

    expect(project.header).toBe('Digital News Roundup');
    expect(project.gallery).toEqual(['https://blob.example.com/1.jpg', 'https://blob.example.com/2.jpg']);
    expect(project.tags).toEqual(['news', 'social']);
    expect(project.videoUrl).toBe('https://youtube.com/shorts/abc');
    expect(project.client).toBe('Self');
    expect(project.featured).toBe(true);
    expect(project.links).toHaveLength(2);
    expect(project.links.map((l) => l.label)).toEqual(['Original post', 'Download PDF']);
  });

  it('drops link rows where the label or url is blank', async () => {
    const category = await makeCategory('blank-links');
    const id = await createProject({
      header: 'x',
      description: 'x',
      categoryId: category.id,
      links: [
        { label: 'Real link', url: 'https://example.com' },
        { label: '', url: '' },
        { label: 'No url', url: '' },
      ],
    });

    const project = await getProject(id);
    expect(project.links).toHaveLength(1);
    expect(project.links[0].label).toBe('Real link');
  });

  it('updates a project and replaces its links wholesale', async () => {
    const category = await makeCategory('update');
    const id = await createProject({
      header: 'Original',
      description: 'x',
      categoryId: category.id,
      links: [{ label: 'Old link', url: 'https://example.com/old' }],
    });

    await updateProject(id, {
      header: 'Updated',
      description: 'y',
      categoryId: category.id,
      links: [{ label: 'New link', url: 'https://example.com/new' }],
    });

    const project = await getProject(id);
    expect(project.header).toBe('Updated');
    expect(project.links).toHaveLength(1);
    expect(project.links[0].label).toBe('New link');
  });

  it('toggles featured', async () => {
    const category = await makeCategory('featured');
    const id = await createProject({ header: 'x', description: 'x', categoryId: category.id });

    let project = await getProject(id);
    expect(project.featured).toBe(false);

    await toggleFeatured(id);
    project = await getProject(id);
    expect(project.featured).toBe(true);
  });

  it('reorders projects within a category via moveProjectSibling', async () => {
    const category = await makeCategory('reorder');
    const aId = await createProject({ header: 'A', description: 'x', categoryId: category.id });
    const bId = await createProject({ header: 'B', description: 'x', categoryId: category.id });
    const cId = await createProject({ header: 'C', description: 'x', categoryId: category.id });

    await moveProjectSibling(cId, 'up');

    const projects = await listProjectsByCategory(category.id);
    expect(projects.map((p) => p.id)).toEqual([aId, cId, bId]);
  });

  it('deletes a project', async () => {
    const category = await makeCategory('delete');
    const id = await createProject({ header: 'x', description: 'x', categoryId: category.id });

    await deleteProject(id);
    await expect(getProject(id)).rejects.toThrow();
  });
});
