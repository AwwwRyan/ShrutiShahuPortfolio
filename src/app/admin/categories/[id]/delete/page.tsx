import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  CircularMoveError,
  MoveTargetRequiredError,
  deleteCategory,
  getCategoryWithCounts,
  listAllCategoriesFlat,
} from '@/lib/categories';
import { adminInputClasses, adminButtonSecondary, adminButtonDanger, adminAlertClasses } from '@/lib/adminStyles';

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
    <main className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
      <h1 className="font-serif text-3xl text-paper">
        Delete &ldquo;{category.name}&rdquo;
      </h1>

      {error === 'MoveTargetRequiredError' && (
        <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
          This category has projects directly in it — pick a target to move them into.
        </p>
      )}
      {error === 'CircularMoveError' && (
        <p role="alert" className={`mt-4 ${adminAlertClasses}`}>
          Can&apos;t move into itself or one of the children being relocated.
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-rust/30 bg-rust/5 p-6">
        {hasContents ? (
          <>
            <p className="text-paper/80">
              This category has {childCount} subcategor{childCount === 1 ? 'y' : 'ies'} and{' '}
              {projectCount} project{projectCount === 1 ? '' : 's'} directly in it.
            </p>

            <form action={deleteCategoryAction} className="mt-5">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="mode" value="cascade" />
              <button type="submit" className={adminButtonDanger}>
                Delete everything (category, subcategories, and projects)
              </button>
            </form>

            <form action={deleteCategoryAction} className="mt-4 space-y-2">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="mode" value="move" />
              <label className="block text-sm font-medium text-paper">
                Move subcategories/projects to
              </label>
              <select name="targetParentId" defaultValue="" required className={adminInputClasses}>
                <option value="" disabled>
                  Choose a category…
                </option>
                {moveTargets.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button type="submit" className={adminButtonSecondary}>
                Move contents here, then delete this category
              </button>
            </form>
          </>
        ) : (
          <form action={deleteCategoryAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="mode" value="cascade" />
            <p className="text-paper/80">This category is empty.</p>
            <button type="submit" className={`mt-4 ${adminButtonDanger}`}>
              Delete
            </button>
          </form>
        )}
      </div>

      <p className="mt-6">
        <Link href="/admin/categories" className="text-sm text-paper/70 underline underline-offset-4 hover:text-chartreuse">
          Cancel
        </Link>
      </p>
    </main>
  );
}
