import React, { useState, useRef, useEffect } from "react";

interface TextCrafterProps {
  value: string;
  onChange: (value: string) => void;
}

const fontSizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px"];

// Simple markdown-to-HTML converter for **bold** and *italic*
const markdownToHtml = (markdown: string) => {
  if (!markdown) return "";
  let html = markdown
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\*(.+?)\*/g, "<em>$1</em>"); // italic
  // Convert line breaks to <br/>
  html = html.replace(/\n/g, "<br/>");
  return html;
};

export const TextCrafter: React.FC<TextCrafterProps> = ({
  value,
  onChange,
}) => {
  const [fontSize, setFontSize] = useState("16px");
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update toggle button states based on cursor selection in textarea
  const updateToggleStates = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;

    // Check if selection is wrapped with **
    const before = value.substring(selectionStart - 2, selectionStart);
    const after = value.substring(selectionEnd, selectionEnd + 2);
    setIsBoldActive(before === "**" && after === "**");

    // Check if selection is wrapped with *
    const beforeI = value.substring(selectionStart - 1, selectionStart);
    const afterI = value.substring(selectionEnd, selectionEnd + 1);
    setIsItalicActive(beforeI === "*" && afterI === "*");
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handler = () => updateToggleStates();
    textarea.addEventListener("select", handler);
    textarea.addEventListener("keyup", handler);

    return () => {
      textarea.removeEventListener("select", handler);
      textarea.removeEventListener("keyup", handler);
    };
  }, [value]);

  const toggleFormat = (tag: "**" | "*") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);

    let newText = value;
    if (tag === "**") {
      if (isBoldActive) {
        // Remove bold tags
        newText =
          value.substring(0, start - 2) +
          selected +
          value.substring(end + 2);
        textarea.selectionStart = start - 2;
        textarea.selectionEnd = end - 2;
        setIsBoldActive(false);
      } else {
        // Add bold tags
        newText =
          value.substring(0, start) +
          "**" +
          selected +
          "**" +
          value.substring(end);
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = end + 2;
        setIsBoldActive(true);
      }
    } else if (tag === "*") {
      if (isItalicActive) {
        // Remove italic tags
        newText =
          value.substring(0, start - 1) +
          selected +
          value.substring(end + 1);
        textarea.selectionStart = start - 1;
        textarea.selectionEnd = end - 1;
        setIsItalicActive(false);
      } else {
        // Add italic tags
        newText =
          value.substring(0, start) +
          "*" +
          selected +
          "*" +
          value.substring(end);
        textarea.selectionStart = start + 1;
        textarea.selectionEnd = end + 1;
        setIsItalicActive(true);
      }
    }
    onChange(newText);
    setTimeout(() => textarea.focus(), 0);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFontSize(e.target.value);
  };

  const wordCount = value.trim()
    ? value.trim().split(/\s+/).length
    : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex gap-3 items-center">
        <button
          type="button"
          aria-pressed={isBoldActive}
          onClick={() => toggleFormat("**")}
          className={`px-3 py-1 rounded border ${isBoldActive ? "bg-rose-500 text-white border-rose-600" : "border-gray-300"
            }`}
          title="Bold (Wrap selected text with **)"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          aria-pressed={isItalicActive}
          onClick={() => toggleFormat("*")}
          className={`px-3 py-1 rounded border ${isItalicActive ? "bg-rose-500 text-white border-rose-600" : "border-gray-300"
            }`}
          title="Italic (Wrap selected text with *)"
        >
          <em>I</em>
        </button>

        <label className="flex items-center gap-2 text-sm">
          Font Size:
          <select
            value={fontSize}
            onChange={handleFontSizeChange}
            className="border rounded px-2 py-1"
          >
            {fontSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="w-full border border-gray-300 rounded p-3 resize-y font-sans"
        style={{ fontSize }}
        rows={12}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing your chapter here..."
      />

      {/* Word count */}
      <div className="text-right text-sm text-gray-500">
        Word count: {wordCount}
      </div>

      {/* Markdown Preview */}
      <div className="border border-gray-300 rounded p-3 bg-gray-50 max-h-60 overflow-auto prose prose-sm prose-rose">
        <h3 className="mb-2 font-semibold">Preview</h3>
        <div
          dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }}
        />
      </div>
    </div>
  );
};
