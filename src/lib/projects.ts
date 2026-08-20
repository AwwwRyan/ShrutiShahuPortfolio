import { prisma } from './prisma';

/** Number of label/url link slots the admin form renders. See ProjectForm. */
export const LINK_SLOTS = 6;

export class ProjectValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProjectValidationError';
  }
}

export type ProjectLinkInput = { label: string; url: string };

export type ProjectInput = {
  header: string;
  description: string;
  categoryId: string;
  coverImage?: string | null;
  gallery?: string[];
  videoUrl?: string | null;
  externalUrl?: string | null;
  client?: string | null;
  tags?: string[];
  featured?: boolean;
  links?: ProjectLinkInput[];
};

function validate(input: ProjectInput) {
  if (!input.header || input.header.trim().length === 0) {
    throw new ProjectValidationError('A project header is required.');
  }
  if (!input.categoryId) {
    throw new ProjectValidationError('A project must belong to a category.');
  }
}

export async function createProject(input: ProjectInput): Promise<string> {
  validate(input);

  // Count-of-siblings would collide with a surviving sibling's order once any
  // sibling in this category has ever been deleted — max+1 stays unique
  // regardless of deletion history. See moveProjectSibling for why that matters.
  const maxOrder = await prisma.project.aggregate({
    where: { categoryId: input.categoryId },
    _max: { order: true },
  });
  const nextOrder = (maxOrder._max.order ?? -1) + 1;
  const links = input.links?.filter((l) => l.label.trim() && l.url.trim()) ?? [];

  const project = await prisma.project.create({
    data: {
      header: input.header.trim(),
      description: input.description,
      categoryId: input.categoryId,
      coverImage: input.coverImage ?? null,
      gallery: input.gallery ?? [],
      videoUrl: input.videoUrl ?? null,
      externalUrl: input.externalUrl ?? null,
      client: input.client ?? null,
      tags: input.tags ?? [],
      featured: input.featured ?? false,
      order: nextOrder,
      links: {
        create: links.map((l, i) => ({ label: l.label.trim(), url: l.url.trim(), order: i })),
      },
    },
  });

  return project.id;
}

export async function updateProject(id: string, input: ProjectInput): Promise<void> {
  validate(input);

  const links = input.links?.filter((l) => l.label.trim() && l.url.trim()) ?? [];

  await prisma.$transaction([
    prisma.projectLink.deleteMany({ where: { projectId: id } }),
    prisma.project.update({
      where: { id },
      data: {
        header: input.header.trim(),
        description: input.description,
        categoryId: input.categoryId,
        coverImage: input.coverImage ?? null,
        gallery: input.gallery ?? [],
        videoUrl: input.videoUrl ?? null,
        externalUrl: input.externalUrl ?? null,
        client: input.client ?? null,
        tags: input.tags ?? [],
        featured: input.featured ?? false,
        links: {
          create: links.map((l, i) => ({ label: l.label.trim(), url: l.url.trim(), order: i })),
        },
      },
    }),
  ]);
}

export async function deleteProject(id: string): Promise<void> {
  await prisma.project.delete({ where: { id } });
}

export async function getProject(id: string) {
  return prisma.project.findUniqueOrThrow({
    where: { id },
    include: { links: { orderBy: { order: 'asc' } }, category: true },
  });
}

export async function listProjectsByCategory(categoryId: string) {
  return prisma.project.findMany({
    where: { categoryId },
    orderBy: { order: 'asc' },
    include: { links: true },
  });
}

export async function toggleFeatured(id: string): Promise<void> {
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  await prisma.project.update({ where: { id }, data: { featured: !project.featured } });
}

/**
 * Swaps a project with its previous/next sibling within the same category by
 * renumbering the whole sibling group to 0..N-1 — see moveSibling in
 * categories.ts for why a plain two-value swap silently no-ops once sibling
 * `order`s have any duplicates (which count-based assignment can produce).
 */
export async function moveProjectSibling(id: string, direction: 'up' | 'down'): Promise<void> {
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  const siblings = await prisma.project.findMany({
    where: { categoryId: project.categoryId },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });

  const index = siblings.findIndex((s) => s.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) {
    return;
  }

  const reordered = siblings.slice();
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

  await prisma.$transaction(
    reordered.map((s, i) => prisma.project.update({ where: { id: s.id }, data: { order: i } })),
  );
}
