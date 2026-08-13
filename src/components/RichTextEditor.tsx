'use client';

import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

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
    onUpdate: ({ editor }) => {
      setHtml(editor.getHTML());
    },
  });

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div>
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          Heading
        </button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>
          Bullet list
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
