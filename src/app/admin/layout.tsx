import { AdminHeader } from '@/components/admin/AdminHeader';

/**
 * Dark theme scoped via `.admin-shell` — a sibling of the public site's `.site-shell`,
 * not the same class reused, so the site-shell comments elsewhere ("public site only")
 * stay true. Same palette, deliberately none of the public site's decorative motion
 * (cat cursor, scroll-drawn line, parallax motifs) — this is a working tool, not a
 * portfolio page. Auth redirects stay in src/proxy.ts; this layout just renders.
 */
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="admin-shell flex min-h-full flex-1 flex-col bg-near-black-olive text-paper">
      <AdminHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
