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

// Convert Editor.js output to an HTML string using the parser instance
const renderEditorJsToHtml = (parser: any, data: OutputData): string => {
  if (!parser) return "";
  try {
    const htmlArray = parser.parse(data);
    if (Array.isArray(htmlArray)) return htmlArray.join("");
    if (typeof htmlArray === "string") return htmlArray;
    return String(htmlArray);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to convert Editor.js data to HTML:", error);
    return "";
  }
};

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
              // generate HTML and call callbacks with HTML string
              const htmlContent = renderEditorJsToHtml(edjsParserRef.current, data);
              onChange(htmlContent);
              if (autoSave && onSave) {
                onSave(htmlContent);
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
      // Before unmounting, attempt final save when autoSave is enabled
      (async () => {
        try {
          if (autoSave && editorRef.current && onSave) {
            const finalData = await (editorRef.current.save?.() as Promise<OutputData>);
            if (finalData && onSave) onSave(JSON.stringify(finalData));
          }
        } catch (e) {
          // ignore final save errors
        } finally {
          try {
            if (editorRef.current && typeof (editorRef.current as any).destroy === "function") {
              (editorRef.current as any).destroy();
            }
          } catch (e) {
            // ignore destroy errors
          }
          editorRef.current = null;
        }
      })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep editor in sync with external `value` prop, but avoid stomping when content is same
  useEffect(() => {
    if (!editorRef.current) return;
    // If value is empty string, clear editor
    const empty = { time: Date.now(), blocks: [] } as OutputData;
    if (!value || value === "" || value === "null") {
      const tryRenderEmpty = async () => {
        try {
          if (typeof (editorRef.current as any).render === "function") {
            await (editorRef.current as any).render(empty);
          } else if ((editorRef.current as any).blocks && typeof (editorRef.current as any).blocks.render === "function") {
            await (editorRef.current as any).blocks.render(empty.blocks || []);
          } else if (typeof (editorRef.current as any).clear === "function") {
            (editorRef.current as any).clear();
          }
        } catch (err) {
          // ignore
        } finally {
          setEditorData(null);
        }
      };
      tryRenderEmpty();
      return;
    }

    try {
      const incoming = JSON.parse(value) as OutputData;
      // shallow compare by JSON - avoids render loop
      if (JSON.stringify(incoming) !== JSON.stringify(editorData)) {
        const tryRender = async () => {
          try {
            if (typeof (editorRef.current as any).render === "function") {
              await (editorRef.current as any).render(incoming);
            } else if ((editorRef.current as any).blocks && typeof (editorRef.current as any).blocks.render === "function") {
              await (editorRef.current as any).blocks.render(incoming.blocks || []);
            }
            setEditorData(incoming);
          } catch (err) {
            // ignore render errors
          }
        };
        tryRender();
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
      const htmlContent = renderEditorJsToHtml(edjsParserRef.current, data);
      onSave(htmlContent);
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
      // Some EditorJS builds don't clear UI reliably; render an empty dataset instead
      const empty = { time: Date.now(), blocks: [] } as OutputData;
      if (typeof (editorRef.current as any).render === "function") {
        (editorRef.current as any).render(empty).catch(() => {});
      } else if ((editorRef.current as any).blocks && typeof (editorRef.current as any).blocks.render === "function") {
        (editorRef.current as any).blocks.render(empty.blocks || []).catch(() => {});
      } else if (typeof (editorRef.current as any).clear === "function") {
        (editorRef.current as any).clear();
      }
      setEditorData(null);
      // Emit empty HTML string when clearing
      onChange("");
      // optionally also call onSave if autoSave
      if (autoSave && onSave) onSave("");
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
                  className="border-l-4 border-blue-300 pl-4 italic text-taupe"
                >
                  <div
                    dangerouslySetInnerHTML={{ __html: block.data.text || "" }}
                  />
                  {block.data.caption && (
                    <footer className="mt-2 text-xs text-taupe/70">
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
        <div className="text-taupe/60 italic p-4">Nothing to preview.</div>
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
      className={`text-crafter-editor relative w-full md:max-w-3xl md:mx-auto md:my-6 shadow-lg rounded-xl bg-white border border-gray-200 ${className}`}
      aria-label={props["aria-label"] || "Book chapter editor"}
      tabIndex={0}
      {...props}
    >
      {/* Toolbar - Mobile responsive */}
      <div className="flex flex-col md:flex-row md:flex-wrap justify-between md:items-center mb-0 p-1 md:p-2 bg-gray-50 border-b border-gray-200 rounded-t-xl gap-1 md:gap-2">
        <div className="flex flex-row items-center gap-1 md:gap-2 w-full md:w-auto">
          {onSave && (
            <button
              onClick={handleSave}
              className="flex-1 md:flex-none flex items-center justify-center md:justify-start px-2 md:px-3 py-2 md:py-1 text-xs md:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
              title="Save Content (Ctrl+S)"
              aria-label="Save chapter"
              disabled={isSaving}
            >
              {isSaving ? (
                <FiLoader className="mr-1 animate-spin" />
              ) : (
                <FiSave className="mr-1" />
              )}
              <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save"}</span>
              <span className="sm:hidden">{isSaving ? "..." : "Save"}</span>
            </button>
          )}
          <button
            onClick={() => setShowPreview((prev) => !prev)}
            className="flex-1 md:flex-none flex items-center justify-center md:justify-start px-2 md:px-3 py-2 md:py-1 text-xs md:text-sm bg-taupe/10 text-taupe rounded hover:bg-taupe/20 transition focus:outline-none focus:ring-2 focus:ring-taupe/50"
            title="Toggle Preview (Esc to close)"
            aria-label="Toggle Preview"
          >
            {showPreview ? (
              <FiEyeOff className="mr-1" />
            ) : (
              <FiEye className="mr-1" />
            )}
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={handleClear}
            className="flex-1 md:flex-none flex items-center justify-center md:justify-start px-2 md:px-3 py-2 md:py-1 text-xs md:text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition focus:outline-none focus:ring-2 focus:ring-red-400"
            title="Clear Editor"
            aria-label="Clear Editor"
          >
            <FiTrash2 className="mr-1" /> <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
        <div className="text-xs md:text-xs text-taupe/70 font-mono w-full md:w-auto text-center md:text-right">
          {words} words &middot; {chars} chars
        </div>
      </div>

      {/* Editor area - Mobile responsive height */}
      <div className="relative h-auto md:h-auto flex flex-col">
        <div
          ref={holderRef}
          className={`editorjs-holder min-h-[250px] sm:min-h-[300px] md:min-h-[400px] bg-white rounded-b-xl focus:outline-none text-sm sm:text-base overflow-y-auto ${
            showPreview ? "pointer-events-none select-none opacity-40" : ""
          } editor-dragdrop`}
          tabIndex={0}
          aria-hidden={showPreview}
          style={{
            WebkitTextSizeAdjust: "100%",
            WebkitTouchCallout: "none",
          } as React.CSSProperties}
        />
        {/* Preview overlay - Mobile optimized */}
        {showPreview && (
          <div className="fixed inset-0 md:absolute md:inset-0 z-40 md:z-20 bg-white md:bg-gray-50 md:bg-opacity-95 md:rounded-b-xl overflow-auto border-t border-gray-200 shadow flex flex-col md:flex-col p-4 md:p-0">
            <div className="md:hidden flex justify-between items-center mb-4 pb-4 border-b border-gray-300">
              <h3 className="font-semibold text-taupe">Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-taupe/70 hover:text-taupe text-2xl"
                aria-label="Close preview"
              >
                ×
              </button>
            </div>
            <div className="md:p-4">
              {renderPreview()}
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-xl z-30 pointer-events-none">
            <FiLoader className="animate-spin text-2xl md:text-3xl text-blue-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TextCrafter;
