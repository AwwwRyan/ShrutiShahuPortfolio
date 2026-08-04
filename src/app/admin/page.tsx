import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session) {
    redirect('/admin/login');
  }

  return (
    <main>
      <h1>Admin Dashboard</h1>
      <p>Signed in as {session.user?.email}</p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/admin/login' });
        }}
      >
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
