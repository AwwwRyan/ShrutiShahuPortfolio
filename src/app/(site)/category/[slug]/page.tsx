import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoryBySlug as getCategoryBySlugUncached } from '@/lib/categories';
import { Card, CATEGORY_TILE_TONES } from '@/components/Card';
import { Motif } from '@/components/decor/Motif';

// Cached per-request so generateMetadata and the page component share one DB call.
const getCategoryBySlug = cache(getCategoryBySlugUncached);

type CategoryPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const view = await getCategoryBySlug(slug);

  if (!view) {
    return { title: 'Category not found' };
  }

  return {
    title: `${view.category.name} — Shruti Shahu`,
    description: `Explore Shruti Shahu's ${view.category.name} work — writing, editing, and content projects.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const view = await getCategoryBySlug(slug);

  if (!view) {
    notFound();
  }

  const { category, breadcrumbs, children, projects } = view;

  return (
    <main className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16">
      <Motif type="ring" tone="olive-sage" size={70} depth={1} opacity={0.3} className="top-8 right-4 hidden lg:block" />
      <nav aria-label="Breadcrumb" className="text-sm text-paper/60">
        <Link href="/" className="hover:text-chartreuse hover:underline">
          Home
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.id}>
            {' '}
            /{' '}
            <Link href={`/category/${crumb.slug}`} className="hover:text-chartreuse hover:underline">
              {crumb.name}
            </Link>
          </span>
        ))}
      </nav>

      <h1 className="mt-3 font-serif text-4xl text-paper sm:text-5xl">{category.name}</h1>

      {children.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-paper">Subcategories</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {children.map((child, index) => (
              <Card
                key={child.id}
                href={`/category/${child.slug}`}
                tone={CATEGORY_TILE_TONES[index % CATEGORY_TILE_TONES.length]}
              >
                <span className="font-serif text-2xl">{child.name}</span>
              </Card>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-paper">Projects</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Card
                key={project.id}
                href={`/project/${project.id}`}
                imageUrl={project.coverImage}
                tone={CATEGORY_TILE_TONES[index % CATEGORY_TILE_TONES.length]}
                className="min-h-[14rem]"
              >
                {project.featured && (
                  <span className="mb-2 inline-block w-fit rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-near-black-olive">
                    ★ Featured
                  </span>
                )}
                <span className="font-serif text-xl">{project.header}</span>
                {project.client && (
                  <span className="mt-1 block text-sm opacity-80">{project.client}</span>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {children.length === 0 && projects.length === 0 && (
        <p className="mt-12 text-paper/60">Nothing here yet.</p>
      )}
    </main>
  );
}
