import { listTopLevelCategories } from '@/lib/categories';
import { getSiteContent } from '@/lib/siteContent';
import { Hero } from '@/components/home/Hero';
import { StatsBar } from '@/components/home/StatsBar';
import { CategoryTiles } from '@/components/home/CategoryTiles';
import { ServicesSection } from '@/components/home/ServicesSection';
import { SkillsSection } from '@/components/home/SkillsSection';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [siteContent, categories] = await Promise.all([
    getSiteContent(),
    listTopLevelCategories(),
  ]);

  return (
    <main>
      <Hero
        aboutMeHtml={siteContent?.aboutMe ?? null}
        profilePhoto={siteContent?.profilePhoto ?? null}
        resumeUrl={siteContent?.resumeUrl ?? null}
      />
      <StatsBar />
      <CategoryTiles categories={categories} />
      <ServicesSection />
      <SkillsSection />
    </main>
  );
}
