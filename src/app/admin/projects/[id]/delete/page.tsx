import { redirect } from 'next/navigation';
import { deleteProject, getProject } from '@/lib/projects';

export default async function DeleteProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  async function deleteProjectAction() {
    'use server';
    await deleteProject(id);
    redirect('/admin/categories');
  }

  return (
    <main>
      <h1>Delete &ldquo;{project.header}&rdquo;</h1>
      <p>This cannot be undone.</p>
      <form action={deleteProjectAction}>
        <button type="submit">Delete project</button>
      </form>
      <p>
        <a href="/admin/categories">Cancel</a>
      </p>
    </main>
  );
}
