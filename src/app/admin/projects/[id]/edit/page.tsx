import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ProjectForm } from '@/components/ProjectForm';
import { listAllCategoriesFlat } from '@/lib/categories';
import { getProject, updateProject } from '@/lib/projects';
import { parseProjectFields, uploadCoverImage, uploadExternalDoc, uploadGalleryImages } from '@/lib/projectFormData';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [project, categories] = await Promise.all([getProject(id), listAllCategoriesFlat()]);

  async function updateProjectAction(formData: FormData) {
    'use server';

    const fields = parseProjectFields(formData);
    const [newCoverImage, newGalleryImages, newExternalDoc] = await Promise.all([
      uploadCoverImage(formData),
      uploadGalleryImages(formData),
      uploadExternalDoc(formData),
    ]);

    const removedGallery = new Set(formData.getAll('removeGallery').map(String));
    const keptGallery = project.gallery.filter((url) => !removedGallery.has(url));

    await updateProject(id, {
      ...fields,
      externalUrl: newExternalDoc ?? fields.externalUrl,
      coverImage: newCoverImage ?? project.coverImage,
      gallery: [...keptGallery, ...newGalleryImages],
    });

    redirect('/admin/categories');
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
      <p className="text-sm text-paper/60">
        <Link href="/admin/categories" className="hover:text-chartreuse hover:underline">
          ← Back to categories
        </Link>
      </p>
      <h1 className="mt-3 font-serif text-3xl text-paper">Edit Project</h1>
      <div className="mt-8">
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
            showDescriptionPage: project.showDescriptionPage,
            tags: project.tags,
            featured: project.featured,
            links: project.links,
            coverImage: project.coverImage,
          }}
          submitLabel="Save changes"
        />
      </div>
    </main>
  );
}
