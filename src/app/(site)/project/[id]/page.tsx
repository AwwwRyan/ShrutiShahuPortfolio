import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject as getProjectUncached } from '@/lib/projects';
import { getCategoryBreadcrumbs } from '@/lib/categories';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { PhoneMockup } from '@/components/PhoneMockup';
import { DocumentLink } from '@/components/DocumentLink';
import { GalleryLightbox } from '@/components/GalleryLightbox';
import { Motif } from '@/components/decor/Motif';

// Cached per-request so generateMetadata and the page component share one DB call.
const getProject = cache(getProjectUncached);

type ProjectPageProps = { params: Promise<{ id: string }> };

function descriptionFrom(html: string, maxLength = 155): string {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const project = await getProject(id);
    return {
      title: `${project.header} — Shruti Shahu`,
      description: descriptionFrom(project.description) || `${project.header} — a project by Shruti Shahu.`,
    };
  } catch {
    return { title: 'Project not found' };
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  let project: Awaited<ReturnType<typeof getProject>>;
  try {
    project = await getProject(id);
  } catch {
    notFound();
  }

  const embedUrl = project.videoUrl ? getYouTubeEmbedUrl(project.videoUrl) : null;
  const breadcrumbs = await getCategoryBreadcrumbs(project.categoryId);

  return (
    <main className="relative mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <Motif type="sparkle" tone="chartreuse" size={36} depth={2} opacity={0.35} className="top-2 right-2" />
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

      <h1 className="mt-3 font-serif text-4xl text-paper sm:text-5xl">{project.header}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-paper/70">
        {project.featured && (
          <span className="rounded-full bg-chartreuse px-3 py-1 font-semibold text-near-black-olive">
            ★ Featured
          </span>
        )}
        {project.client && <span>{project.client}</span>}
        {project.tags.length > 0 && <span>{project.tags.join(' · ')}</span>}
      </div>

      {project.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.coverImage}
          alt={project.header}
          className="mt-8 max-h-96 w-full rounded-2xl object-cover shadow-sm"
        />
      )}

      <div
        className="rich-text mt-8 max-w-2xl text-base leading-relaxed text-paper/80 sm:text-lg"
        dangerouslySetInnerHTML={{ __html: project.description }}
      />

      {embedUrl && (
        <div className="mt-10">
          <PhoneMockup embedUrl={embedUrl} title={project.header} />
        </div>
      )}

      {project.gallery.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-paper">Gallery</h2>
          <GalleryLightbox images={project.gallery} title={project.header} />
        </section>
      )}

      {project.links.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-paper">Links</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {project.links.map((link) => (
              <li key={link.id}>
                <DocumentLink
                  href={link.url}
                  title={link.label}
                  className="inline-flex items-center gap-2 rounded-full border border-paper/15 bg-paper/[0.06] px-5 py-2.5 text-sm font-medium text-paper transition-colors hover:border-chartreuse hover:text-chartreuse motion-reduce:transition-none"
                >
                  {link.label}
                </DocumentLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
