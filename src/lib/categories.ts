import { prisma } from './prisma';
import { slugify } from './slugify';

export type CategoryTreeProject = {
  id: string;
  header: string;
  featured: boolean;
  order: number;
};

export type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  order: number;
  parentId: string | null;
  projectCount: number;
  projects: CategoryTreeProject[];
  children: CategoryTreeNode[];
};

async function getUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || 'category';
  let candidate = base;
  let suffix = 2;

  while (
    await prisma.category.findFirst({
      where: { slug: candidate, ...(excludeId ? { id: { not: excludeId } } : {}) },
    })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function listCategoryTree(): Promise<CategoryTreeNode[]> {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { projects: true } },
      projects: {
        orderBy: { order: 'asc' },
        select: { id: true, header: true, featured: true, order: true },
      },
    },
    orderBy: { order: 'asc' },
  });

  const byId = new Map<string, CategoryTreeNode>(
    categories.map((c) => [
      c.id,
      {
        id: c.id,
        name: c.name,
        slug: c.slug,
        order: c.order,
        parentId: c.parentId,
        projectCount: c._count.projects,
        projects: c.projects,
        children: [],
      },
    ]),
  );

  const roots: CategoryTreeNode[] = [];
  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function createCategory(name: string, parentId: string | null): Promise<string> {
  const slug = await getUniqueSlug(name);
  const siblingCount = await prisma.category.count({ where: { parentId } });

  const category = await prisma.category.create({
    data: { name, slug, parentId, order: siblingCount },
  });

  return category.id;
}

export async function renameCategory(id: string, name: string): Promise<void> {
  await prisma.category.update({ where: { id }, data: { name } });
}

/**
 * True if moving `id` under `candidateParentId` would create a cycle —
 * i.e. `candidateParentId` is `id` itself, or a descendant of `id`.
 * Walks upward from candidateParentId toward the root, which is cheaper
 * than walking every descendant of `id` and gives the same answer.
 */
export async function wouldCreateCycle(id: string, candidateParentId: string): Promise<boolean> {
  let current: string | null = candidateParentId;

  while (current) {
    if (current === id) {
      return true;
    }
    const parent: { parentId: string | null } | null = await prisma.category.findUnique({
      where: { id: current },
      select: { parentId: true },
    });
    current = parent?.parentId ?? null;
  }

  return false;
}

export class CircularMoveError extends Error {
  constructor() {
    super('Cannot move a category under itself or one of its own subcategories.');
    this.name = 'CircularMoveError';
  }
}

export async function moveCategory(id: string, newParentId: string | null): Promise<void> {
  if (newParentId === id) {
    throw new CircularMoveError();
  }
  if (newParentId && (await wouldCreateCycle(id, newParentId))) {
    throw new CircularMoveError();
  }

  const siblingCount = await prisma.category.count({ where: { parentId: newParentId } });
  await prisma.category.update({
    where: { id },
    data: { parentId: newParentId, order: siblingCount },
  });
}

export async function reorderCategories(parentId: string | null, orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({ where: { id, parentId }, data: { order: index } }),
    ),
  );
}

/** Swaps a category's order with its previous/next sibling under the same parent. */
export async function moveSibling(id: string, direction: 'up' | 'down'): Promise<void> {
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  const siblings = await prisma.category.findMany({
    where: { parentId: category.parentId },
    orderBy: { order: 'asc' },
  });

  const index = siblings.findIndex((s) => s.id === id);
  const swapIndex = direction === 'up' ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) {
    return; // already at the edge, nothing to do
  }

  const other = siblings[swapIndex];
  await prisma.$transaction([
    prisma.category.update({ where: { id: category.id }, data: { order: other.order } }),
    prisma.category.update({ where: { id: other.id }, data: { order: category.order } }),
  ]);
}

export type CategoryDeleteOptions =
  | { mode: 'cascade' }
  | { mode: 'move'; targetParentId: string | null };

export class MoveTargetRequiredError extends Error {
  constructor() {
    super('This category has projects directly in it — pick a category to move them into.');
    this.name = 'MoveTargetRequiredError';
  }
}

export async function deleteCategory(id: string, options: CategoryDeleteOptions): Promise<void> {
  if (options.mode === 'cascade') {
    await prisma.category.delete({ where: { id } });
    return;
  }

  const directProjectCount = await prisma.project.count({ where: { categoryId: id } });
  if (directProjectCount > 0 && !options.targetParentId) {
    throw new MoveTargetRequiredError();
  }

  const directChildren = await prisma.category.findMany({
    where: { parentId: id },
    select: { id: true },
  });

  if (
    options.targetParentId &&
    (options.targetParentId === id || directChildren.some((c) => c.id === options.targetParentId))
  ) {
    // The target is the category itself or one of the very children being
    // relocated — moving into it would make it (or a child) its own parent.
    throw new CircularMoveError();
  }

  await prisma.category.updateMany({
    where: { parentId: id },
    data: { parentId: options.targetParentId },
  });

  if (options.targetParentId) {
    await prisma.project.updateMany({
      where: { categoryId: id },
      data: { categoryId: options.targetParentId },
    });
  }

  await prisma.category.delete({ where: { id } });
}

export async function getCategoryWithCounts(id: string) {
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  const childCount = await prisma.category.count({ where: { parentId: id } });
  const projectCount = await prisma.project.count({ where: { categoryId: id } });
  return { category, childCount, projectCount };
}

export async function listAllCategoriesFlat() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export type Breadcrumb = { id: string; name: string; slug: string };

/** Ancestor chain from the root down to (and including) the given category. */
export async function getCategoryBreadcrumbs(categoryId: string): Promise<Breadcrumb[]> {
  const trail: Breadcrumb[] = [];
  let current: { id: string; name: string; slug: string; parentId: string | null } | null =
    await prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true, name: true, slug: true, parentId: true },
    });

  while (current) {
    trail.unshift({ id: current.id, name: current.name, slug: current.slug });
    current = current.parentId
      ? await prisma.category.findUnique({
          where: { id: current.parentId },
          select: { id: true, name: true, slug: true, parentId: true },
        })
      : null;
  }

  return trail;
}

export async function listTopLevelCategories() {
  return prisma.category.findMany({ where: { parentId: null }, orderBy: { order: 'asc' } });
}

/**
 * Public category view model: the category itself, its breadcrumb trail,
 * its direct subcategories, and its direct projects (featured first, then
 * by manual order) — everything the category page needs in one call.
 */
export async function getCategoryBySlug(slug: string) {
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    return null;
  }

  const [breadcrumbs, children, projects] = await Promise.all([
    getCategoryBreadcrumbs(category.id),
    prisma.category.findMany({ where: { parentId: category.id }, orderBy: { order: 'asc' } }),
    prisma.project.findMany({ where: { categoryId: category.id } }),
  ]);

  const sortedProjects = projects
    .slice()
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);

  return { category, breadcrumbs, children, projects: sortedProjects };
}
