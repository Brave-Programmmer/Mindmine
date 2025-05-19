import {
  useEditor,
  EditorContent,
  BubbleMenu,
  FloatingMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import type { Node as ProseMirrorNode } from "prosemirror-model";
import type { ReactNode } from "react";
import { useState, useCallback } from "react";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

interface BlockType {
  name: string;
  icon: ReactNode;
  command: (editor: any) => void;
  description: string;
  preview: ReactNode;
  category: "text" | "media" | "layout" | "interactive";
}

const BlockPreview = ({ type, content }: { type: string; content: string }) => {
  const getPreviewContent = () => {
    switch (type) {
      case "paragraph":
        return <p className="text-sm text-taupe">{content || "Start writing..."}</p>;
      case "heading":
        return <h3 className="text-lg font-bold text-rosewood">{content || "Heading"}</h3>;
      case "bulletList":
        return (
          <ul className="list-disc pl-4">
            <li className="text-sm text-taupe">List item</li>
          </ul>
        );
      case "orderedList":
        return (
          <ol className="list-decimal pl-4">
            <li className="text-sm text-taupe">List item</li>
          </ol>
        );
      case "taskList":
        return (
          <ul className="list-none pl-4">
            <li className="flex items-center gap-2">
              <input type="checkbox" className="rounded border-gold" />
              <span className="text-sm text-taupe">Task item</span>
            </li>
          </ul>
        );
      case "blockquote":
        return (
          <blockquote className="border-l-4 border-gold pl-4 italic text-taupe">
            Quote
          </blockquote>
        );
      case "codeBlock":
        return (
          <pre className="bg-gray-100 p-2 rounded text-sm font-mono">
            <code>Code block</code>
          </pre>
        );
      case "image":
        return (
          <div className="relative aspect-video bg-gray-100 rounded flex items-center justify-center">
            <span className="text-taupe">Image</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-2 bg-white rounded border border-gold">
      {getPreviewContent()}
    </div>
  );
};

const BlockInserter = ({
  editor,
  onClose,
}: {
  editor: any;
  onClose: () => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BlockType["category"]>("text");

  const blocks: BlockType[] = [
    {
      name: "Paragraph",
      icon: "¶",
      command: (editor) => editor.chain().focus().setParagraph().run(),
      description: "Start with a paragraph",
      preview: <BlockPreview type="paragraph" content="" />,
      category: "text",
    },
    {
      name: "Heading 1",
      icon: "H1",
      command: (editor) =>
        editor.chain().focus().toggleHeading({ level: 1 }).run(),
      description: "Large section heading",
      preview: <BlockPreview type="heading" content="Heading 1" />,
      category: "text",
    },
    {
      name: "Heading 2",
      icon: "H2",
      command: (editor) =>
        editor.chain().focus().toggleHeading({ level: 2 }).run(),
      description: "Medium section heading",
      preview: <BlockPreview type="heading" content="Heading 2" />,
      category: "text",
    },
    {
      name: "Heading 3",
      icon: "H3",
      command: (editor) =>
        editor.chain().focus().toggleHeading({ level: 3 }).run(),
      description: "Small section heading",
      preview: <BlockPreview type="heading" content="Heading 3" />,
      category: "text",
    },
    {
      name: "Bullet List",
      icon: "•",
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
      description: "Create a simple bullet list",
      preview: <BlockPreview type="bulletList" content="" />,
      category: "text",
    },
    {
      name: "Numbered List",
      icon: "1.",
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
      description: "Create a numbered list",
      preview: <BlockPreview type="orderedList" content="" />,
      category: "text",
    },
    {
      name: "Task List",
      icon: "☐",
      command: (editor) => editor.chain().focus().toggleTaskList().run(),
      description: "Create a task list",
      preview: <BlockPreview type="taskList" content="" />,
      category: "interactive",
    },
    {
      name: "Quote",
      icon: '"',
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
      description: "Add a quote",
      preview: <BlockPreview type="blockquote" content="" />,
      category: "text",
    },
    {
      name: "Code Block",
      icon: "</>",
      command: (editor) => editor.chain().focus().toggleCodeBlock().run(),
      description: "Add a code block",
      preview: <BlockPreview type="codeBlock" content="" />,
      category: "text",
    },
    {
      name: "Image",
      icon: "🖼️",
      command: (editor) => {
        const url = window.prompt("Enter image URL:");
        if (url) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      },
      description: "Add an image",
      preview: <BlockPreview type="image" content="" />,
      category: "media",
    },
  ];

  const filteredBlocks = blocks.filter(
    (block) =>
      (block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      block.category === selectedCategory
  );

  const categories: { id: BlockType["category"]; label: string }[] = [
    { id: "text", label: "Text" },
    { id: "media", label: "Media" },
    { id: "layout", label: "Layout" },
    { id: "interactive", label: "Interactive" },
  ];

  return (
    <div className="absolute z-50 bg-white rounded-lg shadow-xl border border-gold p-4 w-96">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search blocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood"
        />
      </div>
      <div className="flex gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedCategory === category.id
                ? "bg-rosewood text-white"
                : "bg-peach text-rosewood hover:bg-rosewood hover:text-white"
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filteredBlocks.map((block) => (
          <button
            key={block.name}
            onClick={() => {
              block.command(editor);
              onClose();
            }}
            className="w-full text-left p-4 hover:bg-peach rounded-lg flex items-start gap-4 group"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{block.icon}</span>
                <div className="font-medium text-rosewood">{block.name}</div>
              </div>
              <div className="text-sm text-taupe mb-2">{block.description}</div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {block.preview}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

const BlockControls = ({
  editor,
  node,
}: {
  editor: any;
  node: ProseMirrorNode;
}) => {
  if (!editor) return null;

  return (
    <div className="absolute -left-12 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        className="p-1 text-taupe hover:text-rosewood"
        onClick={() => editor.chain().focus().deleteNode(node.type.name).run()}
      >
        🗑️
      </button>
      <button
        className="p-1 text-taupe hover:text-rosewood cursor-move"
        draggable
      >
        ⋮⋮
      </button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [showBlockInserter, setShowBlockInserter] = useState(false);
  const [blockInserterPosition, setBlockInserterPosition] = useState({
    top: 0,
    left: 0,
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: "Type / to insert a block...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Color,
      Highlight,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none p-4 min-h-[300px] focus:outline-none",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "/" && !showBlockInserter) {
          const { top, left } = view.coordsAtPos(view.state.selection.from);
          setBlockInserterPosition({ top, left });
          setShowBlockInserter(true);
          return true;
        }
        return false;
      },
    },
  });

  return (
    <div className="border border-gold rounded-lg overflow-hidden relative">
      {editor && (
        <>
          <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <div className="flex gap-1 bg-white border border-gold rounded-lg shadow-lg p-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-peach ${
                  editor.isActive("bold") ? "bg-peach" : ""
                }`}
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-peach ${
                  editor.isActive("italic") ? "bg-peach" : ""
                }`}
              >
                <em>I</em>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-peach ${
                  editor.isActive("strike") ? "bg-peach" : ""
                }`}
              >
                <s>S</s>
              </button>
              <button
                onClick={() => {
                  const url = window.prompt("Enter URL:");
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`p-2 rounded hover:bg-peach ${
                  editor.isActive("link") ? "bg-peach" : ""
                }`}
              >
                🔗
              </button>
            </div>
          </BubbleMenu>

          <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
            <button
              onClick={() => {
                const { top, left } = editor.view.coordsAtPos(
                  editor.state.selection.from
                );
                setBlockInserterPosition({ top, left });
                setShowBlockInserter(true);
              }}
              className="bg-white border border-gold rounded-lg shadow-lg p-2 hover:bg-peach"
            >
              +
            </button>
          </FloatingMenu>

          {showBlockInserter && (
            <div
              className="fixed z-50"
              style={{
                top: blockInserterPosition.top,
                left: blockInserterPosition.left,
              }}
            >
              <BlockInserter
                editor={editor}
                onClose={() => setShowBlockInserter(false)}
              />
            </div>
          )}
        </>
      )}

      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
