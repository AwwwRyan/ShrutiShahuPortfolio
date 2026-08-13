import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject as getProjectUncached } from '@/lib/projects';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
import { PhoneMockup } from '@/components/PhoneMockup';

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

  return (
    <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink/60">
        <Link href="/" className="hover:text-ink hover:underline">
          Home
        </Link>{' '}
        /{' '}
        <Link
          href={`/category/${project.category.slug}`}
          className="hover:text-ink hover:underline"
        >
          {project.category.name}
        </Link>
      </nav>

      <h1 className="mt-3 font-serif text-4xl text-ink sm:text-5xl">{project.header}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-ink/70">
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
          className="mt-8 w-full rounded-2xl object-cover shadow-sm"
        />
      )}

      <div
        className="rich-text mt-8 max-w-2xl text-base leading-relaxed text-ink/80 sm:text-lg"
        dangerouslySetInnerHTML={{ __html: project.description }}
      />

      {embedUrl && (
        <div className="mt-10">
          <PhoneMockup embedUrl={embedUrl} title={project.header} />
        </div>
      )}

      {project.gallery.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-ink">Gallery</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {project.gallery.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={`${project.header} — gallery image ${index + 1}`}
                className="aspect-square w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {project.links.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl text-ink">Links</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {project.links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-navy-teal hover:text-navy-teal motion-reduce:transition-none"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
