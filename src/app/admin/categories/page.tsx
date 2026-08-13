import { revalidatePath } from 'next/cache';
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

// This page has no dynamic API usage (no auth()/searchParams) of its own,
// so Next.js would otherwise statically prerender it at build time and
// serve stale category data to every visitor — force per-request rendering.
export const dynamic = 'force-dynamic';

async function createCategoryAction(formData: FormData) {
  'use server';
  const name = formData.get('name');
  const parentId = formData.get('parentId');
  if (typeof name !== 'string' || name.trim().length === 0) {
    return;
  }
  await createCategory(name.trim(), typeof parentId === 'string' && parentId ? parentId : null);
  revalidatePath('/admin/categories');
}

async function renameCategoryAction(formData: FormData) {
  'use server';
  const id = formData.get('id');
  const name = formData.get('name');
  if (typeof id !== 'string' || typeof name !== 'string' || name.trim().length === 0) {
    return;
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
      // Swallowed intentionally: the UI just won't reflect the move. Good
      // enough at this stage — a visible error banner is a design-pass concern.
      return;
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

function CategoryNode({
  node,
  allCategories,
}: {
  node: CategoryTreeNode;
  allCategories: { id: string; name: string }[];
}) {
  const moveTargets = allCategories.filter((c) => c.id !== node.id);

  return (
    <li>
      <strong>{node.name}</strong> ({node.projectCount} project
      {node.projectCount === 1 ? '' : 's'})
      <form action={moveSiblingAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={node.id} />
        <input type="hidden" name="direction" value="up" />
        <button type="submit">↑</button>
      </form>
      <form action={moveSiblingAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={node.id} />
        <input type="hidden" name="direction" value="down" />
        <button type="submit">↓</button>
      </form>
      <form action={renameCategoryAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={node.id} />
        <input type="text" name="name" defaultValue={node.name} required />
        <button type="submit">Rename</button>
      </form>
      <form action={moveCategoryAction} style={{ display: 'inline' }}>
        <input type="hidden" name="id" value={node.id} />
        <select name="newParentId" defaultValue="">
          <option value="">— Top level —</option>
          {moveTargets.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit">Move here</button>
      </form>
      <form action={createCategoryAction} style={{ display: 'inline' }}>
        <input type="hidden" name="parentId" value={node.id} />
        <input type="text" name="name" placeholder="New subcategory name" required />
        <button type="submit">Add subcategory</button>
      </form>
      <a href={`/admin/categories/${node.id}/delete`}>Delete</a>
      <a href={`/admin/projects/new?categoryId=${node.id}`}>Add project</a>
      {node.projects.length > 0 && (
        <ul>
          {node.projects
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((project) => (
              <li key={project.id}>
                {project.header} {project.featured ? '★' : ''}
                <form action={moveProjectSiblingAction} style={{ display: 'inline' }}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit">↑</button>
                </form>
                <form action={moveProjectSiblingAction} style={{ display: 'inline' }}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit">↓</button>
                </form>
                <form action={toggleFeaturedAction} style={{ display: 'inline' }}>
                  <input type="hidden" name="id" value={project.id} />
                  <button type="submit">{project.featured ? 'Unfeature' : 'Feature'}</button>
                </form>
                <a href={`/admin/projects/${project.id}/edit`}>Edit</a>{' '}
                <a href={`/admin/projects/${project.id}/delete`}>Delete</a>
              </li>
            ))}
        </ul>
      )}
      {node.children.length > 0 && (
        <ul>
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

export default async function CategoriesAdminPage() {
  const [tree, flat] = await Promise.all([listCategoryTree(), listAllCategoriesFlat()]);
  const sortedTree = tree.slice().sort((a, b) => a.order - b.order);

  return (
    <main>
      <h1>Categories</h1>
      <p>
        <a href="/admin">Back to dashboard</a>
      </p>
      <form action={createCategoryAction}>
        <input type="hidden" name="parentId" value="" />
        <input type="text" name="name" placeholder="New top-level category name" required />
        <button type="submit">Add top-level category</button>
      </form>
      {sortedTree.length === 0 ? (
        <p>No categories yet.</p>
      ) : (
        <ul>
          {sortedTree.map((node) => (
            <CategoryNode key={node.id} node={node} allCategories={flat} />
          ))}
        </ul>
      )}
    </main>
  );
}
