import Link from 'next/link';
import { listTopLevelCategories } from '@/lib/categories';
import { getSiteContent } from '@/lib/siteContent';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [siteContent, categories] = await Promise.all([
    getSiteContent(),
    listTopLevelCategories(),
  ]);

  return (
    <main>
      <h1>Shruti Shahu</h1>

      <section>
        <h2>About Me</h2>
        {siteContent?.profilePhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={siteContent.profilePhoto} alt="Shruti Shahu" />
        )}
        {siteContent?.aboutMe ? (
          <div dangerouslySetInnerHTML={{ __html: siteContent.aboutMe }} />
        ) : (
          <p>About me content coming soon.</p>
        )}
        {siteContent?.resumeUrl && <a href={siteContent.resumeUrl}>Download Resume</a>}
      </section>

      <section>
        <h2>Work</h2>
        {categories.length === 0 ? (
          <p>Categories coming soon.</p>
        ) : (
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/category/${category.slug}`}>{category.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p>
        <Link href="/contact">Contact</Link>
      </p>
    </main>
  );
}
