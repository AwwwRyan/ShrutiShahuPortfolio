import { afterAll, describe, expect, it } from 'vitest';
import { prisma } from './prisma';
import {
  CircularMoveError,
  MoveTargetRequiredError,
  createCategory,
  deleteCategory,
  getCategoryBreadcrumbs,
  getCategoryBySlug,
  listCategoryTree,
  listTopLevelCategories,
  moveCategory,
  moveSibling,
  renameCategory,
  wouldCreateCycle,
} from './categories';

const RUN = `test-cat-${Date.now()}`;

describe('category tree logic', () => {
  afterAll(async () => {
    await prisma.category.deleteMany({ where: { name: { startsWith: RUN } } });
    await prisma.$disconnect();
  });

  it('creates a subcategory nested correctly under its parent', async () => {
    const parentId = await createCategory(`${RUN} Marketing`, null);
    const childId = await createCategory(`${RUN} Video Scripts`, parentId);

    const tree = await listCategoryTree();
    const parentNode = tree.find((n) => n.id === parentId);

    expect(parentNode).toBeDefined();
    expect(parentNode!.children).toHaveLength(1);
    expect(parentNode!.children[0].id).toBe(childId);
  });

  it('supports 3 levels of nesting and reports project counts', async () => {
    const l1 = await createCategory(`${RUN} L1`, null);
    const l2 = await createCategory(`${RUN} L2`, l1);
    const l3 = await createCategory(`${RUN} L3`, l2);

    const tree = await listCategoryTree();
    const node1 = tree.find((n) => n.id === l1)!;
    const node2 = node1.children.find((n) => n.id === l2)!;
    const node3 = node2.children.find((n) => n.id === l3)!;

    expect(node3.id).toBe(l3);
    expect(node3.projectCount).toBe(0);
  });

  it('detects that moving a category under its own descendant would cycle', async () => {
    const parentId = await createCategory(`${RUN} CycleParent`, null);
    const childId = await createCategory(`${RUN} CycleChild`, parentId);

    await expect(wouldCreateCycle(parentId, childId)).resolves.toBe(true);
    await expect(wouldCreateCycle(childId, parentId)).resolves.toBe(false);

    await expect(moveCategory(parentId, childId)).rejects.toThrow(CircularMoveError);
  });

  it('rejects moving a category under itself', async () => {
    const id = await createCategory(`${RUN} SelfMove`, null);
    await expect(moveCategory(id, id)).rejects.toThrow(CircularMoveError);
  });

  it('reorders siblings via moveSibling up/down', async () => {
    const parentId = await createCategory(`${RUN} ReorderParent`, null);
    const aId = await createCategory(`${RUN} A`, parentId);
    const bId = await createCategory(`${RUN} B`, parentId);
    const cId = await createCategory(`${RUN} C`, parentId);

    // Initial order: A(0), B(1), C(2). Move C up -> A(0), C(1), B(2).
    await moveSibling(cId, 'up');

    const tree = await listCategoryTree();
    const parentNode = tree.find((n) => n.id === parentId)!;
    const ordered = [...parentNode.children].sort((a, b) => a.order - b.order).map((c) => c.id);

    expect(ordered).toEqual([aId, cId, bId]);
  });

  it('renames a category without changing its slug', async () => {
    const id = await createCategory(`${RUN} Original Name`, null);
    const before = await prisma.category.findUniqueOrThrow({ where: { id } });

    await renameCategory(id, `${RUN} Renamed`);

    const after = await prisma.category.findUniqueOrThrow({ where: { id } });
    expect(after.name).toBe(`${RUN} Renamed`);
    expect(after.slug).toBe(before.slug);
  });

  it('deletes a category with cascade mode, removing its children and projects', async () => {
    const parentId = await createCategory(`${RUN} CascadeParent`, null);
    const childId = await createCategory(`${RUN} CascadeChild`, parentId);
    const project = await prisma.project.create({
      data: { header: 'x', description: 'x', categoryId: parentId },
    });

    await deleteCategory(parentId, { mode: 'cascade' });

    expect(await prisma.category.findUnique({ where: { id: parentId } })).toBeNull();
    expect(await prisma.category.findUnique({ where: { id: childId } })).toBeNull();
    expect(await prisma.project.findUnique({ where: { id: project.id } })).toBeNull();
  });

  it('deletes a category with move mode, relocating children and projects to the target', async () => {
    const parentId = await createCategory(`${RUN} MoveParent`, null);
    const targetId = await createCategory(`${RUN} MoveTarget`, null);
    const childId = await createCategory(`${RUN} MoveChild`, parentId);
    const project = await prisma.project.create({
      data: { header: 'x', description: 'x', categoryId: parentId },
    });

    await deleteCategory(parentId, { mode: 'move', targetParentId: targetId });

    expect(await prisma.category.findUnique({ where: { id: parentId } })).toBeNull();

    const movedChild = await prisma.category.findUniqueOrThrow({ where: { id: childId } });
    expect(movedChild.parentId).toBe(targetId);

    const movedProject = await prisma.project.findUniqueOrThrow({ where: { id: project.id } });
    expect(movedProject.categoryId).toBe(targetId);
  });

  it('requires a move target when the category being deleted has direct projects', async () => {
    const parentId = await createCategory(`${RUN} NeedsTargetParent`, null);
    await prisma.project.create({
      data: { header: 'x', description: 'x', categoryId: parentId },
    });

    await expect(deleteCategory(parentId, { mode: 'move', targetParentId: null })).rejects.toThrow(
      MoveTargetRequiredError,
    );
  });

  it('rejects moving contents into one of the very children being relocated', async () => {
    const parentId = await createCategory(`${RUN} SelfTargetParent`, null);
    const childId = await createCategory(`${RUN} SelfTargetChild`, parentId);

    await expect(
      deleteCategory(parentId, { mode: 'move', targetParentId: childId }),
    ).rejects.toThrow(CircularMoveError);

    // Nothing should have been mutated by the rejected attempt.
    const stillThere = await prisma.category.findUnique({ where: { id: parentId } });
    expect(stillThere).not.toBeNull();
  });

  it('builds a breadcrumb trail from root to a 3-level-deep category', async () => {
    const l1 = await createCategory(`${RUN} BreadcrumbL1`, null);
    const l2 = await createCategory(`${RUN} BreadcrumbL2`, l1);
    const l3 = await createCategory(`${RUN} BreadcrumbL3`, l2);

    const trail = await getCategoryBreadcrumbs(l3);

    expect(trail.map((t) => t.id)).toEqual([l1, l2, l3]);
    expect(trail.map((t) => t.name)).toEqual([
      `${RUN} BreadcrumbL1`,
      `${RUN} BreadcrumbL2`,
      `${RUN} BreadcrumbL3`,
    ]);
  });

  it('only returns categories with no parent from listTopLevelCategories', async () => {
    const topId = await createCategory(`${RUN} TopOnly`, null);
    await createCategory(`${RUN} ChildOnly`, topId);

    const topLevel = await listTopLevelCategories();
    const ids = topLevel.map((c) => c.id);

    expect(ids).toContain(topId);
    expect(ids.every((id) => id !== undefined)).toBe(true);
    // None of the returned categories should have a parent.
    for (const c of topLevel) {
      expect(c.parentId).toBeNull();
    }
  });

  it('getCategoryBySlug returns null for an unknown slug', async () => {
    const result = await getCategoryBySlug(`${RUN}-does-not-exist`);
    expect(result).toBeNull();
  });

  it('getCategoryBySlug returns breadcrumbs, children, and featured-first sorted projects', async () => {
    const parentId = await createCategory(`${RUN} SlugParent`, null);
    await createCategory(`${RUN} SlugChild`, parentId);

    const parent = await prisma.category.findUniqueOrThrow({ where: { id: parentId } });

    const regular = await prisma.project.create({
      data: { header: 'Regular', description: 'x', categoryId: parentId, order: 0 },
    });
    const featured = await prisma.project.create({
      data: { header: 'Featured', description: 'x', categoryId: parentId, order: 1, featured: true },
    });

    const view = await getCategoryBySlug(parent.slug);

    expect(view).not.toBeNull();
    expect(view!.breadcrumbs.map((b) => b.id)).toEqual([parentId]);
    expect(view!.children).toHaveLength(1);
    expect(view!.projects.map((p) => p.id)).toEqual([featured.id, regular.id]);
  });
});
