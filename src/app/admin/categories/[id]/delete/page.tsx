import { redirect } from 'next/navigation';
import {
  CircularMoveError,
  MoveTargetRequiredError,
  deleteCategory,
  getCategoryWithCounts,
  listAllCategoriesFlat,
} from '@/lib/categories';

async function deleteCategoryAction(formData: FormData) {
  'use server';

  const id = formData.get('id');
  const mode = formData.get('mode');
  const targetParentId = formData.get('targetParentId');

  if (typeof id !== 'string') {
    return;
  }

  try {
    if (mode === 'cascade') {
      await deleteCategory(id, { mode: 'cascade' });
    } else {
      await deleteCategory(id, {
        mode: 'move',
        targetParentId: typeof targetParentId === 'string' && targetParentId ? targetParentId : null,
      });
    }
  } catch (error) {
    if (error instanceof MoveTargetRequiredError || error instanceof CircularMoveError) {
      redirect(`/admin/categories/${id}/delete?error=${error.name}`);
    }
    throw error;
  }

  redirect('/admin/categories');
}

export default async function DeleteCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const { category, childCount, projectCount } = await getCategoryWithCounts(id);
  const hasContents = childCount > 0 || projectCount > 0;

  const allCategories = await listAllCategoriesFlat();
  const directChildren = allCategories.filter((c) => c.parentId === id);
  const moveTargets = allCategories.filter(
    (c) => c.id !== id && !directChildren.some((child) => child.id === c.id),
  );

  return (
    <main>
      <h1>Delete &ldquo;{category.name}&rdquo;</h1>
      {error === 'MoveTargetRequiredError' && (
        <p role="alert">This category has projects directly in it — pick a target to move them into.</p>
      )}
      {error === 'CircularMoveError' && (
        <p role="alert">Can&apos;t move into itself or one of the children being relocated.</p>
      )}

      {hasContents ? (
        <>
          <p>
            This category has {childCount} subcategor{childCount === 1 ? 'y' : 'ies'} and{' '}
            {projectCount} project{projectCount === 1 ? '' : 's'} directly in it.
          </p>

          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="mode" value="cascade" />
            <button type="submit">Delete everything (category, subcategories, and projects)</button>
          </form>

          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="mode" value="move" />
            <label>
              Move subcategories/projects to
              <select name="targetParentId" defaultValue="" required>
                <option value="" disabled>
                  Choose a category…
                </option>
                {moveTargets.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Move contents here, then delete this category</button>
          </form>
        </>
      ) : (
        <form action={deleteCategoryAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="mode" value="cascade" />
          <p>This category is empty.</p>
          <button type="submit">Delete</button>
        </form>
      )}

      <p>
        <a href="/admin/categories">Cancel</a>
      </p>
    </main>
  );
}
