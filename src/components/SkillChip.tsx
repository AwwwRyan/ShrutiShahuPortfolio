/** Shared icon-badge-style chip reused across all four Skills/tools groups. */
export function SkillChip({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-paper/15 bg-paper/[0.06] px-4 py-2 font-sans text-sm text-paper shadow-sm">
      {children}
    </span>
  );
}
