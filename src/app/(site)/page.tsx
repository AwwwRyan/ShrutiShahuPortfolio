import { listTopLevelCategories } from '@/lib/categories';
import { getSiteContent } from '@/lib/siteContent';
import { getAllImageUrls, getAllDocUrls } from '@/lib/media';
import { Hero } from '@/components/home/Hero';
import { StatsBar } from '@/components/home/StatsBar';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { ServicesSection } from '@/components/home/ServicesSection';
import { SkillsSection } from '@/components/home/SkillsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { MediaPreloader } from '@/components/MediaPreloader';
import { DocPreloadQueue } from '@/components/DocPreloadQueue';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [siteContent, categories, imageUrls, docUrls] = await Promise.all([
    getSiteContent(),
    listTopLevelCategories(),
    getAllImageUrls(),
    getAllDocUrls(),
  ]);

  return (
    <main>
      <MediaPreloader urls={imageUrls} />
      <DocPreloadQueue urls={docUrls} />
      <Hero
        aboutMeHtml={siteContent?.aboutMe ?? null}
        profilePhoto={siteContent?.profilePhoto ?? null}
        resumeUrl={siteContent?.resumeUrl ?? null}
      />
      <StatsBar />
      <SkillsSection />
      <CategoryTiles categories={categories} />
      <ServicesSection />
      <TestimonialsSection />
    </main>
  );
}
