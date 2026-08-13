/** Shared icon-badge-style chip reused across all four Skills/tools groups. */
export function SkillChip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-ink/15 bg-white px-4 py-2 font-sans text-sm text-ink shadow-sm">
      {children}
    </span>
  );
}
