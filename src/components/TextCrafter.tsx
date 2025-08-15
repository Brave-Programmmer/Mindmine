// TextCrafter.tsx
import React, { useEffect, useRef, useCallback, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import type { OutputData, BlockAPI } from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Code from "@editorjs/code";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import LinkTool from "@editorjs/link";
import Delimiter from "@editorjs/delimiter";
import Table from "@editorjs/table";
import { FiEye, FiEyeOff, FiSave, FiTrash2, FiLoader } from "react-icons/fi";
import edjsHTML from "editorjs-html";
import type { JSX } from "astro/jsx-runtime";

interface TextCrafterProps {
  value: string; // JSON stringified Editor.js data
  onChange: (value: string) => void;
  autoSave?: boolean;
  onSave?: (content: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (file: File) => Promise<string>;
  "aria-label"?: string;
  id?: string;
}

function getWordCharCount(data: OutputData | null): {
  words: number;
  chars: number;
} {
  if (!data) return { words: 0, chars: 0 };
  let text = data.blocks
    .map((block) => {
      if (
        block.type === "paragraph" ||
        block.type === "header" ||
        block.type === "quote"
      ) {
        // Editor.js stores HTML in some blocks; strip tags roughly for count
        const raw: string = block.data.text || "";
        return raw.replace(/<[^>]*>/g, " ");
      }
      if (block.type === "list") {
        return (block.data.items || []).join(" ");
      }
      if (block.type === "code") {
        return block.data.code || "";
      }
      return "";
    })
    .join(" ");
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const chars = text.length;
  return { words, chars };
}

export const TextCrafter: React.FC<TextCrafterProps> = ({
  value,
  onChange,
  autoSave = false,
  onSave,
  placeholder = "Start writing your chapter here...",
  className = "",
  onImageUpload,
  ...props
}) => {
  const editorRef = useRef<EditorJS | null>(null);
  const holderRef = useRef<HTMLDivElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editorData, setEditorData] = useState<OutputData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // debounce ref for saves
  const saveDebounceRef = useRef<number | null>(null);

  // parser for preview (editorjs-html)
  const edjsParserRef = useRef<any | null>(null);
  useEffect(() => {
    try {
      edjsParserRef.current = edjsHTML();
    } catch {
      edjsParserRef.current = null;
    }
  }, []);

  // Initialize Editor.js once
  useEffect(() => {
    if (!holderRef.current) return;
    if (editorRef.current) return;

    let isMounted = true;
    setIsLoading(true);

    editorRef.current = new EditorJS({
      holder: holderRef.current,
      placeholder,
      data: value ? JSON.parse(value) : undefined,
      autofocus: true,
      onReady: () => {
        // set initial data state (if provided)
        if (!isMounted) return;
        if (editorRef.current) {
          // attempt to read current data, but don't force save
          editorRef.current
            .save()
            .then((d) => {
              setEditorData(d);
            })
            .catch(() => {
              // ignore
            });
        }
        setIsLoading(false);
      },
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            placeholder: "Chapter heading...",
            levels: [2, 3, 4],
            defaultLevel: 2,
          },
        },
        list: {
          class: List,
          inlineToolbar: true,
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: "Write a memorable quote...",
            captionPlaceholder: "Quote author...",
          },
        },
        code: {
          class: Code,
          config: {
            placeholder: "Write code...",
          },
        },
        marker: Marker,
        inlineCode: InlineCode,
        linkTool: LinkTool,
        delimiter: Delimiter,
        table: Table,
        image: {
          class: ImageTool,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                if (onImageUpload) {
                  try {
                    const url = await onImageUpload(file);
                    return {
                      success: 1,
                      file: { url },
                    };
                  } catch (e) {
                    // better feedback when upload fails
                    window.alert("Image upload failed. Please try again.");
                    return { success: 0 };
                  }
                } else {
                  window.alert("No image uploader provided.");
                  return { success: 0 };
                }
              },
            },
            // Enable drag'n'drop
            draggable: true,
            // Add caption input
            captionPlaceholder: "Image caption...",
            // Add image adjustments
            actions: ['withBorder', 'stretched', 'withBackground'],
            // Add custom CSS classes for controls
            additionalRequestData: {},
            // Advanced image controls
            customControls: [
              {
                name: 'dimensions',
                icon: '<svg>...</svg>',
                title: 'Set dimensions',
                action: (block: any) => {
                  const width = prompt('Enter width (px):', block.data.width || '');
                  const height = prompt('Enter height (px):', block.data.height || '');
                  if (width !== null) block.data.width = parseInt(width) || undefined;
                  if (height !== null) block.data.height = parseInt(height) || undefined;
                  block.dispatchChange();
                }
              }
            ],
            // Configure image resizing
            minWidth: 100,
            maxWidth: 2000,
            minHeight: 100,
            maxHeight: 2000,
            // Configure alignment options
            alignment: ['left', 'center', 'right'],
            // Enable manual resizing
            enableResizing: true,
          },
        },
      },
      onChange: async () => {
        // debounced handler
        if (saveDebounceRef.current) {
          window.clearTimeout(saveDebounceRef.current);
        }
        saveDebounceRef.current = window.setTimeout(async () => {
          if (!editorRef.current) return;
          try {
            const data = await editorRef.current.save();
            setEditorData(data);
            // only call onChange prop with stringified data
            onChange(JSON.stringify(data));
            if (autoSave && onSave) {
              onSave(JSON.stringify(data));
            }
          } catch (err) {
            // ignore transient save errors
            // console.warn("Editor save failed", err);
          }
        }, 450); // 450ms debounce
      },
    });

    return () => {
      isMounted = false;
      if (saveDebounceRef.current) {
        window.clearTimeout(saveDebounceRef.current);
      }
      editorRef.current?.destroy();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep editor in sync with external `value` prop, but avoid stomping when content is same
  useEffect(() => {
    if (!editorRef.current) return;
    if (!value) return;

    try {
      const incoming = JSON.parse(value) as OutputData;
      // shallow compare by JSON - avoids render loop
      if (JSON.stringify(incoming) !== JSON.stringify(editorData)) {
        // render new content
        editorRef.current.render(incoming).then(() => {
          setEditorData(incoming);
        });
      }
    } catch (e) {
      // invalid json -> ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSave = useCallback(async () => {
    if (!editorRef.current || !onSave) return;
    setIsSaving(true);
    try {
      const data = await editorRef.current.save();
      setEditorData(data);
      onSave(JSON.stringify(data));
    } catch (e) {
      window.alert("Save failed. Try again.");
    } finally {
      // small delay for UX
      setTimeout(() => setIsSaving(false), 500);
    }
  }, [onSave]);

  const handleClear = useCallback(() => {
    if (!editorRef.current) return;
    try {
      editorRef.current.clear();
      const empty = { time: Date.now(), blocks: [] };
      setEditorData(null);
      onChange(JSON.stringify(empty));
      // optionally also call onSave if autoSave
      if (autoSave && onSave) onSave(JSON.stringify(empty));
    } catch (e) {
      // ignore
    }
  }, [onChange, autoSave, onSave]);

  // Keyboard shortcuts: Ctrl+S -> save, Escape -> close preview
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ctrl/cmd + s
      const isSave =
        (e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S");
      if (isSave) {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        if (showPreview) setShowPreview(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSave, showPreview]);

  // Manual preview renderer (fallback)
  const renderPreviewManual = (data: OutputData) => {
    return (
      <div className="prose max-w-none bg-gray-50 p-4 rounded-b shadow border border-gray-200 text-black">
        {data.blocks.map((block, idx) => {
          switch (block.type) {
            case "paragraph":
              return (
                <p
                  key={idx}
                  dangerouslySetInnerHTML={{ __html: block.data.text || "" }}
                />
              );
            case "header": {
              const level = Math.min(Math.max(block.data.level || 2, 1), 6);
              const tag = `h${level}` as keyof JSX.IntrinsicElements;
              return React.createElement(
                tag as string,
                {
                  key: idx,
                  dangerouslySetInnerHTML: { __html: block.data.text || "" },
                },
                null
              );
            }
            case "image":
              return (
                <img
                  key={idx}
                  src={block.data.file?.url}
                  alt={block.data.caption || "Image"}
                  className="max-w-full h-auto rounded my-2"
                />
              );
            case "list":
              if (block.data.style === "ordered") {
                return (
                  <ol key={idx} className="list-decimal ml-6">
                    {block.data.items.map((item: string, i: number) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ol>
                );
              } else {
                return (
                  <ul key={idx} className="list-disc ml-6">
                    {block.data.items.map((item: string, i: number) => (
                      <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                );
              }
            case "quote":
              return (
                <blockquote
                  key={idx}
                  className="border-l-4 border-blue-300 pl-4 italic text-gray-700"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: block.data.text || "" }}
                  />
                  {block.data.caption && (
                    <footer className="mt-2 text-xs text-gray-500">
                      — {block.data.caption}
                    </footer>
                  )}
                </blockquote>
              );
            case "code":
              return (
                <pre
                  key={idx}
                  className="bg-gray-100 rounded p-2 overflow-x-auto text-sm"
                >
                  <code>{block.data.code}</code>
                </pre>
              );
            case "marker":
              return (
                <mark
                  key={idx}
                  dangerouslySetInnerHTML={{ __html: block.data.text || "" }}
                />
              );
            case "inlineCode":
              return (
                <code key={idx} className="bg-gray-200 px-1 rounded text-sm">
                  {block.data.text}
                </code>
              );
            case "delimiter":
              return (
                <hr key={idx} className="my-4 border-t-2 border-gray-300" />
              );
            case "table":
              return (
                <table
                  key={idx}
                  className="table-auto border-collapse w-full my-4"
                >
                  <tbody>
                    {block.data.content.map((row: string[], rowIdx: number) => (
                      <tr key={rowIdx}>
                        {row.map((cell: string, cellIdx: number) => (
                          <td key={cellIdx} className="border px-2 py-1">
                            <div dangerouslySetInnerHTML={{ __html: cell }} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            default:
              return (
                <div key={idx} className="text-red-500">
                  [Unsupported block: {block.type}]
                </div>
              );
          }
        })}
      </div>
    );
  };

  const renderPreview = () => {
    if (!editorData)
      return (
        <div className="text-gray-400 italic p-4">Nothing to preview.</div>
      );

    // Try editorjs-html parser first
    if (edjsParserRef.current) {
      try {
        const parsed = edjsParserRef.current.parse(editorData) as string[]; // array of HTML strings or nodes
        return (
          <div className="prose max-w-none bg-gray-50 p-4 rounded-b shadow border border-gray-200 text-black">
            {parsed.map((html: string, i: number) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>
        );
      } catch (e) {
        // fallback to manual renderer below
      }
    }

    return renderPreviewManual(editorData);
  };

  const { words, chars } = getWordCharCount(editorData);

  return (
    <div
      className={`text-crafter-editor relative max-w-3xl mx-auto my-6 shadow-lg rounded-xl bg-white border border-gray-200 ${className}`}
      aria-label={props["aria-label"] || "Book chapter editor"}
      tabIndex={0}
      {...props}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center mb-0 p-2 bg-gray-50 border-b border-gray-200 rounded-t-xl gap-2">
        <div className="flex items-center space-x-2">
          {onSave && (
            <button
              onClick={handleSave}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
              title="Save Content (Ctrl+S)"
              aria-label="Save chapter"
              disabled={isSaving}
            >
              {isSaving ? (
                <FiLoader className="mr-1 animate-spin" />
              ) : (
                <FiSave className="mr-1" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
          <button
            onClick={() => setShowPreview((prev) => !prev)}
            className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            title="Toggle Preview (Esc to close)"
            aria-label="Toggle Preview"
          >
            {showPreview ? (
              <FiEyeOff className="mr-1" />
            ) : (
              <FiEye className="mr-1" />
            )}{" "}
            Preview
          </button>
          <button
            onClick={handleClear}
            className="flex items-center px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition focus:outline-none focus:ring-2 focus:ring-red-400"
            title="Clear Editor"
            aria-label="Clear Editor"
          >
            <FiTrash2 className="mr-1" /> Clear
          </button>
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {words} words &middot; {chars} chars
        </div>
      </div>

      {/* Editor area */}
      <div className="relative">
        <div
          ref={holderRef}
          className={`editorjs-holder min-h-[300px] bg-white rounded-b-xl focus:outline-none ${
            showPreview ? "pointer-events-none select-none opacity-40" : ""
          } editor-dragdrop`}
          tabIndex={0}
          aria-hidden={showPreview}
        />
        {/* Preview overlay */}
        {showPreview && (
          <div className="absolute inset-0 z-20 bg-gray-50 bg-opacity-95 rounded-b-xl overflow-auto border-t border-gray-200 shadow flex flex-col">
            {renderPreview()}
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-xl z-30">
            <FiLoader className="animate-spin text-3xl text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextCrafter;
