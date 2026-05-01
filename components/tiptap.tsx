"use client";

import { useEditor, EditorContent, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { Button } from "./ui/button";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function Tiptap({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor?.isActive("bold"),
      isItalic: editor?.isActive("italic"),
    }),
  });

  return (
    <div className="relative">
      <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring">
        <div className="flex gap-1 border-b p-2">
          <Button
            variant={editorState?.isBold ? "default" : "ghost"}
            size="icon"
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </Button>

          <Button
            variant={editorState?.isItalic ? "default" : "ghost"}
            size={"icon"}
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </Button>
        </div>
        <EditorContent editor={editor} className="p-3" />
      </div>
    </div>
  );
}
