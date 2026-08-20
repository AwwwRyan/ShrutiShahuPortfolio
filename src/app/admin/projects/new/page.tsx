import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProjectForm } from '@/components/ProjectForm';
import { listAllCategoriesFlat } from '@/lib/categories';
import { createProject } from '@/lib/projects';
import { parseProjectFields, uploadCoverImage, uploadGalleryImages } from '@/lib/projectFormData';

async function createProjectAction(formData: FormData) {
  'use server';

  const fields = parseProjectFields(formData);
  const [coverImage, gallery] = await Promise.all([
    uploadCoverImage(formData),
    uploadGalleryImages(formData),
  ]);

  await createProject({ ...fields, coverImage, gallery });

  redirect('/admin/categories');
}

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categoryId } = await searchParams;
  const categories = await listAllCategoriesFlat();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
      <p className="text-sm text-paper/60">
        <Link href="/admin/categories" className="hover:text-chartreuse hover:underline">
          ← Back to categories
        </Link>
      </p>
      <h1 className="mt-3 font-serif text-3xl text-paper">New Project</h1>
      <div className="mt-8">
        <ProjectForm
          action={createProjectAction}
          categories={categories}
          defaultCategoryId={typeof categoryId === 'string' ? categoryId : undefined}
          submitLabel="Create project"
        />
      </div>
    </main>
  );
}
