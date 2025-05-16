import { useState, useCallback } from "react";
import RichTextEditor from "./RichTextEditor";

interface BookPageEditorProps {
  content: string;
  onChange: (content: string) => void;
  pageNumber: number;
  chapterTitle: string;
  onSave?: () => Promise<void>;
  onDelete?: () => Promise<void>;
}

const BookPageEditor = ({
  content,
  onChange,
  pageNumber,
  chapterTitle,
  onSave,
  onDelete,
}: BookPageEditorProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave();
    } catch (error) {
      console.error("Failed to save page:", error);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  const handleDelete = useCallback(async () => {
    if (!onDelete) return;
    
    if (!confirm("Are you sure you want to delete this page?")) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Failed to delete page:", error);
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gold pb-4">
        <div>
          <h3 className="text-lg font-medium text-rosewood">{chapterTitle}</h3>
          <p className="text-sm text-taupe">Page {pageNumber}</p>
        </div>
        <div className="flex gap-2">
          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-rosewood text-white rounded-lg hover:bg-rosewood/90 disabled:opacity-50 transition-colors"
              title="Save changes"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
              title="Delete page"
            >
              {isDeleting ? "Deleting..." : "Delete Page"}
            </button>
          )}
        </div>
      </header>

      {/* Editor */}
      <main className="min-h-[500px]">
        <RichTextEditor 
          content={content} 
          onChange={onChange}
        />
      </main>

      {/* Status Bar */}
      <footer className="text-sm text-taupe text-right">
        {isSaving ? "Saving changes..." : "Changes saved automatically"}
      </footer>
    </div>
  );
};

export default BookPageEditor; 