import { SkillChip } from '@/components/SkillChip';
import { Motif } from '@/components/decor/Motif';

const SKILL_GROUPS = [
  {
    label: 'Editorial',
    tools: ['Grammarly', 'QuillBot', 'Hemingway Editor', 'Wordtune'],
  },
  {
    label: 'CMS / Productivity',
    tools: ['ClickUp', 'Monday.com', 'Notion', 'Google Workspace', 'MS Office', 'Teams'],
  },
  {
    label: 'SEO',
    tools: ['Semrush', 'Surfer', 'Ahrefs', 'AdHeart', 'Meta (FB) Ad Library', 'Meta Business Suite'],
  },
  {
    label: 'AI',
    tools: ['ChatGPT', 'Copilot', 'Gemini', 'Perplexity', 'Claude', 'Copy.ai', 'Creatify'],
  },
] as const;

export function SkillsSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <Motif type="sparkle" tone="paper" size={40} depth={2} opacity={0.4} className="top-6 right-6" />
      <Motif type="dots" tone="chartreuse" size={70} depth={1} opacity={0.2} className="right-16 bottom-4 hidden lg:block" />
      <h2 className="font-serif text-3xl text-paper sm:text-4xl">Skills & Tools</h2>

      <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-2">
        {SKILL_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className="font-sans text-sm font-semibold tracking-wide text-chartreuse uppercase">
              {group.label}
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {group.tools.map((tool) => (
                <SkillChip key={tool}>{tool}</SkillChip>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
