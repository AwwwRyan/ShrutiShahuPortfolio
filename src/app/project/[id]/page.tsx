import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject } from '@/lib/projects';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let project: Awaited<ReturnType<typeof getProject>>;
  try {
    project = await getProject(id);
  } catch {
    notFound();
  }

  const embedUrl = project.videoUrl ? getYouTubeEmbedUrl(project.videoUrl) : null;

  return (
    <main>
      <nav aria-label="Breadcrumb">
        <Link href="/">Home</Link> /{' '}
        <Link href={`/category/${project.category.slug}`}>{project.category.name}</Link>
      </nav>

      <h1>{project.header}</h1>
      {project.featured && <p>★ Featured</p>}
      {project.client && <p>Client: {project.client}</p>}
      {project.tags.length > 0 && <p>Tags: {project.tags.join(', ')}</p>}

      {project.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.coverImage} alt={project.header} />
      )}

      <div dangerouslySetInnerHTML={{ __html: project.description }} />

      {embedUrl && (
        <iframe
          src={embedUrl}
          title={project.header}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}

      {project.gallery.length > 0 && (
        <section>
          <h2>Gallery</h2>
          {project.gallery.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" />
          ))}
        </section>
      )}

      {project.links.length > 0 && (
        <section>
          <h2>Links</h2>
          <ul>
            {project.links.map((link) => (
              <li key={link.id}>
                <a href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
