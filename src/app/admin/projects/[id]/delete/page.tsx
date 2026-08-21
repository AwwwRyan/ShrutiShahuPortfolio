import Link from 'next/link';
import { redirect } from 'next/navigation';
import { deleteProject, getProject } from '@/lib/projects';
import { adminButtonDanger } from '@/lib/adminStyles';
import { AdminSubmitButton } from '@/components/admin/AdminSubmitButton';

export default async function DeleteProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);

  async function deleteProjectAction() {
    'use server';
    await deleteProject(id);
    redirect('/admin/categories');
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:px-8">
      <h1 className="font-serif text-3xl text-paper">
        Delete &ldquo;{project.header}&rdquo;
      </h1>

      <div className="mt-6 rounded-2xl border border-rust/30 bg-rust/5 p-6">
        <p className="text-paper/80">This cannot be undone.</p>
        <form action={deleteProjectAction} className="mt-4">
          <AdminSubmitButton className={adminButtonDanger}>Delete project</AdminSubmitButton>
        </form>
      </div>

      <p className="mt-6">
        <Link href="/admin/categories" className="text-sm text-paper/70 underline underline-offset-4 hover:text-chartreuse">
          Cancel
        </Link>
      </p>
    </main>
  );
}
