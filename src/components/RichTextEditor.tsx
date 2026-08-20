'use client';

import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Heading2, List } from 'lucide-react';

const toolbarButtonClasses = (active: boolean) =>
  `inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
    active ? 'bg-chartreuse text-near-black-olive' : 'text-paper/70 hover:text-paper'
  }`;

export function RichTextEditor({
  name,
  defaultValue = '',
}: {
  name: string;
  defaultValue?: string;
}) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue,
    immediatelyRender: false,
    // onTransaction (not just onUpdate) fires on selection-only changes too, not just
    // content edits — needed so the toolbar buttons' isActive() checks below reflect the
    // cursor position live (e.g. clicking into already-bold text highlights Bold
    // immediately, without needing to type first).
    onTransaction: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div className="mb-2 flex w-fit items-center gap-1 rounded-lg border border-paper/15 bg-paper/[0.06] p-1">
        <button
          type="button"
          aria-label="Bold"
          aria-pressed={editor?.isActive('bold') ?? false}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={toolbarButtonClasses(editor?.isActive('bold') ?? false)}
        >
          <Bold className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Italic"
          aria-pressed={editor?.isActive('italic') ?? false}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={toolbarButtonClasses(editor?.isActive('italic') ?? false)}
        >
          <Italic className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Heading"
          aria-pressed={editor?.isActive('heading', { level: 2 }) ?? false}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarButtonClasses(editor?.isActive('heading', { level: 2 }) ?? false)}
        >
          <Heading2 className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Bullet list"
          aria-pressed={editor?.isActive('bulletList') ?? false}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={toolbarButtonClasses(editor?.isActive('bulletList') ?? false)}
        >
          <List className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <EditorContent
        editor={editor}
        className="rich-text min-h-[10rem] rounded-lg border border-paper/15 bg-paper/[0.06] px-4 py-3 text-paper focus-within:border-chartreuse [&_.tiptap]:outline-none"
      />
    </div>
  );
}
