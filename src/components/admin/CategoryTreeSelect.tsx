'use client';

import { useCallback, useMemo, useState } from 'react';
import { adminInputClasses, adminLabelClasses } from '@/lib/adminStyles';

type CategoryOption = { id: string; name: string; parentId: string | null; order: number };

/**
 * Two-step category picker: a "Section" select (top-level categories only)
 * scopes a "Category" select to that section's own subtree. Prevents the
 * flat single-list picker's real failure mode — silently reassigning a
 * project to an unrelated category via one misclick, since every category
 * and subcategory site-wide used to sit in one same-looking alphabetical
 * list with no indication of where anything actually lived. Changing the
 * Section select is the deliberate, visible action needed to move a
 * project into a different top-level tree.
 */
export function CategoryTreeSelect({
  categories,
  defaultCategoryId,
}: {
  categories: CategoryOption[];
  defaultCategoryId?: string;
}) {
  const byId = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const rootOf = useCallback(
    (id: string): string => {
      let current = byId.get(id);
      const seen = new Set<string>();
      while (current?.parentId && byId.has(current.parentId) && !seen.has(current.id)) {
        seen.add(current.id);
        current = byId.get(current.parentId);
      }
      return current?.id ?? id;
    },
    [byId],
  );

  const depthOf = useCallback(
    (id: string): number => {
      let depth = 0;
      let current = byId.get(id);
      const seen = new Set<string>();
      while (current?.parentId && byId.has(current.parentId) && !seen.has(current.id)) {
        seen.add(current.id);
        depth += 1;
        current = byId.get(current.parentId);
      }
      return depth;
    },
    [byId],
  );

  const roots = useMemo(
    () => categories.filter((c) => c.parentId === null).sort((a, b) => a.order - b.order),
    [categories],
  );

  const initialLeaf = defaultCategoryId && byId.has(defaultCategoryId) ? defaultCategoryId : (roots[0]?.id ?? '');
  const initialRoot = initialLeaf ? rootOf(initialLeaf) : '';

  const [selectedRoot, setSelectedRoot] = useState(initialRoot);

  const optionsForRoot = useMemo(
    () =>
      categories
        .filter((c) => rootOf(c.id) === selectedRoot)
        .sort((a, b) => depthOf(a.id) - depthOf(b.id) || a.order - b.order),
    [categories, selectedRoot, rootOf, depthOf],
  );

  // Preserve the project's exact original subcategory when the Section
  // select still matches its original tree; reset to the tree's top level
  // when the user has actively picked a different section.
  const leafDefaultValue = selectedRoot === initialRoot ? initialLeaf : selectedRoot;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="categorySection" className={adminLabelClasses}>
          Section
        </label>
        <select
          id="categorySection"
          value={selectedRoot}
          onChange={(e) => setSelectedRoot(e.target.value)}
          className={adminInputClasses}
        >
          {roots.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="categoryId" className={adminLabelClasses}>
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          key={selectedRoot}
          defaultValue={leafDefaultValue}
          required
          className={adminInputClasses}
        >
          {optionsForRoot.map((c) => (
            <option key={c.id} value={c.id}>
              {depthOf(c.id) > 0 ? `${'—'.repeat(depthOf(c.id))} ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
