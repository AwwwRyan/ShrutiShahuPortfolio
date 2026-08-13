import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/lib/categories';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = await getCategoryBySlug(slug);

  if (!view) {
    notFound();
  }

  const { category, breadcrumbs, children, projects } = view;

  return (
    <main>
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.id}>
            {' '}
            / <Link href={`/category/${crumb.slug}`}>{crumb.name}</Link>
          </span>
        ))}
      </nav>

      <h1>{category.name}</h1>

      {children.length > 0 && (
        <section>
          <h2>Subcategories</h2>
          <ul>
            {children.map((child) => (
              <li key={child.id}>
                <Link href={`/category/${child.slug}`}>{child.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {projects.length > 0 && (
        <section>
          <h2>Projects</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                {project.featured && <strong>★ </strong>}
                <Link href={`/project/${project.id}`}>{project.header}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children.length === 0 && projects.length === 0 && <p>Nothing here yet.</p>}
    </main>
  );
}
