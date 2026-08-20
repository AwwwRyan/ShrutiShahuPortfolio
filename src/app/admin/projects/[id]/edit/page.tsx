import { redirect } from 'next/navigation';
import { ProjectForm } from '@/components/ProjectForm';
import { listAllCategoriesFlat } from '@/lib/categories';
import { getProject, updateProject } from '@/lib/projects';
import { parseProjectFields, uploadCoverImage, uploadGalleryImages } from '@/lib/projectFormData';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, categories] = await Promise.all([getProject(id), listAllCategoriesFlat()]);

  async function updateProjectAction(formData: FormData) {
    'use server';

    const fields = parseProjectFields(formData);
    const [newCoverImage, newGalleryImages] = await Promise.all([
      uploadCoverImage(formData),
      uploadGalleryImages(formData),
    ]);

    const removedGallery = new Set(formData.getAll('removeGallery').map(String));
    const keptGallery = project.gallery.filter((url) => !removedGallery.has(url));

    await updateProject(id, {
      ...fields,
      coverImage: newCoverImage ?? project.coverImage,
      gallery: [...keptGallery, ...newGalleryImages],
    });

    redirect('/admin/categories');
  }

  return (
    <main>
      <h1>Edit Project</h1>
      <p>
        <a href="/admin/categories">Back to categories</a>
      </p>
      <ProjectForm
        action={updateProjectAction}
        categories={categories}
        defaultCategoryId={project.categoryId}
        existingGallery={project.gallery}
        defaults={{
          header: project.header,
          description: project.description,
          client: project.client ?? undefined,
          videoUrl: project.videoUrl ?? undefined,
          externalUrl: project.externalUrl ?? undefined,
          tags: project.tags,
          featured: project.featured,
          links: project.links,
          coverImage: project.coverImage,
        }}
        submitLabel="Save changes"
      />
    </main>
  );
}
