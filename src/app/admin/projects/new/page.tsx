import { redirect } from 'next/navigation';
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
    <main>
      <h1>New Project</h1>
      <p>
        <a href="/admin/categories">Back to categories</a>
      </p>
      <ProjectForm
        action={createProjectAction}
        categories={categories}
        defaultCategoryId={typeof categoryId === 'string' ? categoryId : undefined}
        submitLabel="Create project"
      />
    </main>
  );
}
