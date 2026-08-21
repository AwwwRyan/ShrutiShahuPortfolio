import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronUp, ChevronDown, Star } from 'lucide-react';
import {
  type CategoryTreeNode,
  createCategory,
  listAllCategoriesFlat,
  listCategoryTree,
  moveCategory,
  moveSibling,
  renameCategory,
  CircularMoveError,
} from '@/lib/categories';
import { moveProjectSibling, toggleFeatured } from '@/lib/projects';
import {
  adminInputClasses,
  adminButtonPrimary,
  adminButtonSecondary,
  adminIconButtonClasses,
  adminButtonDangerGhost,
  adminAlertClasses,
} from '@/lib/adminStyles';
import { AdminSubmitButton } from '@/components/admin/AdminSubmitButton';

// This page has no dynamic API usage (no auth()/searchParams) of its own,
// so Next.js would otherwise statically prerender it at build time and
// serve stale category data to every visitor — force per-request rendering.
export const dynamic = 'force-dynamic';

async function createCategoryAction(formData: FormData) {
  'use server';
  const name = formData.get('name');
  const parentId = formData.get('parentId');
  if (typeof name !== 'string' || name.trim().length === 0) {
    redirect('/admin/categories?error=EmptyName');
  }
  await createCategory(name.trim(), typeof parentId === 'string' && parentId ? parentId : null);
  revalidatePath('/admin/categories');
}

async function renameCategoryAction(formData: FormData) {
  'use server';
  const id = formData.get('id');
  const name = formData.get('name');
  if (typeof id !== 'string' || typeof name !== 'string' || name.trim().length === 0) {
    redirect('/admin/categories?error=EmptyName');
  }
  await renameCategory(id, name.trim());
  revalidatePath('/admin/categories');
}

async function moveCategoryAction(formData: FormData) {
  'use server';
  const id = formData.get('id');
  const newParentId = formData.get('newParentId');
  if (typeof id !== 'string') {
    return;
  }
  try {
    await moveCategory(id, typeof newParentId === 'string' && newParentId ? newParentId : null);
  } catch (error) {
    if (error instanceof CircularMoveError) {
      redirect('/admin/categories?error=CircularMove');
    }
    throw error;
  }
  revalidatePath('/admin/categories');
}

async function moveSiblingAction(formData: FormData) {
  'use server';
  const id = formData.get('id');
  const direction = formData.get('direction');
  if (typeof id !== 'string' || (direction !== 'up' && direction !== 'down')) {
    return;
  }
  await moveSibling(id, direction);
  revalidatePath('/admin/categories');
}

async function moveProjectSiblingAction(formData: FormData) {
  'use server';
  const id = formData.get('id');
  const direction = formData.get('direction');
  if (typeof id !== 'string' || (direction !== 'up' && direction !== 'down')) {
    return;
  }
  await moveProjectSibling(id, direction);
  revalidatePath('/admin/categories');
}

async function toggleFeaturedAction(formData: FormData) {
  'use server';
  const id = formData.get('id');
  if (typeof id !== 'string') {
    return;
  }
  await toggleFeatured(id);
  revalidatePath('/admin/categories');
}

const smallInputClasses = `${adminInputClasses} px-3 py-1.5 text-sm`;

function CategoryNode({
  node,
  allCategories,
}: {
  node: CategoryTreeNode;
  allCategories: { id: string; name: string }[];
}) {
  const moveTargets = allCategories.filter((c) => c.id !== node.id);

  return (
    <li className="rounded-2xl border border-paper/10 bg-paper/[0.06] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg text-paper">{node.name}</span>
          <span className="text-sm text-paper/50">
            ({node.projectCount} project{node.projectCount === 1 ? '' : 's'})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <form action={moveSiblingAction}>
            <input type="hidden" name="id" value={node.id} />
            <input type="hidden" name="direction" value="up" />
            <AdminSubmitButton ariaLabel="Move up" className={adminIconButtonClasses}>
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
            </AdminSubmitButton>
          </form>
          <form action={moveSiblingAction}>
            <input type="hidden" name="id" value={node.id} />
            <input type="hidden" name="direction" value="down" />
            <AdminSubmitButton ariaLabel="Move down" className={adminIconButtonClasses}>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </AdminSubmitButton>
          </form>
          <Link href={`/admin/projects/new?categoryId=${node.id}`} className={adminButtonSecondary}>
            Add project
          </Link>
          <Link href={`/admin/categories/${node.id}/delete`} className={adminButtonDangerGhost}>
            Delete
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <form action={renameCategoryAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={node.id} />
          <input type="text" name="name" defaultValue={node.name} required className={smallInputClasses} />
          <AdminSubmitButton className={adminButtonSecondary}>Rename</AdminSubmitButton>
        </form>
        <form action={moveCategoryAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={node.id} />
          <select name="newParentId" defaultValue="" className={smallInputClasses}>
            <option value="">— Top level —</option>
            {moveTargets.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <AdminSubmitButton className={adminButtonSecondary}>Move here</AdminSubmitButton>
        </form>
        <form action={createCategoryAction} className="flex items-center gap-2">
          <input type="hidden" name="parentId" value={node.id} />
          <input
            type="text"
            name="name"
            placeholder="New subcategory name"
            required
            className={smallInputClasses}
          />
          <AdminSubmitButton className={adminButtonSecondary}>Add subcategory</AdminSubmitButton>
        </form>
      </div>

      {node.projects.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-paper/10 pt-4">
          {node.projects
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((project) => (
              <li key={project.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-paper">{project.header}</span>
                <div className="flex items-center gap-1.5">
                  <form action={moveProjectSiblingAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <input type="hidden" name="direction" value="up" />
                    <AdminSubmitButton ariaLabel="Move up" className={adminIconButtonClasses}>
                      <ChevronUp className="h-4 w-4" aria-hidden="true" />
                    </AdminSubmitButton>
                  </form>
                  <form action={moveProjectSiblingAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <input type="hidden" name="direction" value="down" />
                    <AdminSubmitButton ariaLabel="Move down" className={adminIconButtonClasses}>
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </AdminSubmitButton>
                  </form>
                  <form action={toggleFeaturedAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <AdminSubmitButton
                      ariaLabel={project.featured ? 'Unfeature' : 'Feature'}
                      ariaPressed={project.featured}
                      className={adminIconButtonClasses}
                    >
                      <Star
                        className={`h-4 w-4 ${project.featured ? 'fill-chartreuse text-chartreuse' : ''}`}
                        aria-hidden="true"
                      />
                    </AdminSubmitButton>
                  </form>
                  <Link href={`/admin/projects/${project.id}/edit`} className={adminButtonSecondary}>
                    Edit
                  </Link>
                  <Link href={`/admin/projects/${project.id}/delete`} className={adminButtonDangerGhost}>
                    Delete
                  </Link>
                </div>
              </li>
            ))}
        </ul>
      )}

      {node.children.length > 0 && (
        <ul className="mt-4 ml-3 space-y-3 border-l border-paper/10 pl-6">
          {node.children
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((child) => (
              <CategoryNode key={child.id} node={child} allCategories={allCategories} />
            ))}
        </ul>
      )}
    </li>
  );
}

export default async function CategoriesAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [tree, flat, { error }] = await Promise.all([listCategoryTree(), listAllCategoriesFlat(), searchParams]);
  const sortedTree = tree.slice().sort((a, b) => a.order - b.order);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12 sm:px-8">
      <h1 className="font-serif text-3xl text-paper">Categories</h1>

      {error === 'EmptyName' && (
        <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
          Category name can&apos;t be empty.
        </p>
      )}
      {error === 'CircularMove' && (
        <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
          Can&apos;t move a category under itself or one of its own subcategories.
        </p>
      )}

      <form action={createCategoryAction} className="mt-6 flex flex-wrap items-center gap-2">
        <input type="hidden" name="parentId" value="" />
        <input
          type="text"
          name="name"
          placeholder="New top-level category name"
          required
          className={`max-w-sm ${adminInputClasses}`}
        />
        <AdminSubmitButton className={adminButtonPrimary}>Add top-level category</AdminSubmitButton>
      </form>

      {sortedTree.length === 0 ? (
        <p className="mt-8 text-paper/60">No categories yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {sortedTree.map((node) => (
            <CategoryNode key={node.id} node={node} allCategories={flat} />
          ))}
        </ul>
      )}
    </main>
  );
}
