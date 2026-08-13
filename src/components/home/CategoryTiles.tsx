import { Card, CATEGORY_TILE_TONES } from '@/components/Card';

type Category = { id: string; name: string; slug: string };

export function CategoryTiles({ categories }: { categories: Category[] }) {
  return (
    <section id="categories" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-20">
      <h2 className="font-serif text-3xl text-ink sm:text-4xl">Work</h2>

      {categories.length === 0 ? (
        <p className="mt-6 text-ink/60">Categories coming soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              href={`/category/${category.slug}`}
              tone={CATEGORY_TILE_TONES[index % CATEGORY_TILE_TONES.length]}
              className="min-h-[12rem]"
            >
              <span className="font-serif text-2xl sm:text-3xl">{category.name}</span>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
