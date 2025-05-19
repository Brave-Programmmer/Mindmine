import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase";

type Chapter = {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  updatedAt?: any;
};

type Props = {
  bookId: string;
};

export const BookChaptersList = ({ bookId }: Props) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for editing
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // States for adding new chapter
  const [addingNew, setAddingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const chaptersRef = collection(db, "books", bookId, "chapters");
    const q = query(chaptersRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chaptersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Chapter[];
        setChapters(chaptersData);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading chapters:", err);
        setError("Failed to load chapters");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [bookId]);

  // Start editing a chapter
  const startEditing = (chapter: Chapter) => {
    setEditingChapterId(chapter.id);
    setEditTitle(chapter.title);
    setEditContent(chapter.content || "");
    setEditError(null);
  };

  // Cancel editing mode
  const cancelEditing = () => {
    setEditingChapterId(null);
    setEditTitle("");
    setEditContent("");
    setEditError(null);
  };

  // Save chapter edits
  const saveEdit = async () => {
    if (!editTitle.trim()) {
      setEditError("Chapter title cannot be empty.");
      return;
    }
    if (!editingChapterId) return;

    setIsSaving(true);
    setEditError(null);

    try {
      const chapterDocRef = doc(
        db,
        "books",
        bookId,
        "chapters",
        editingChapterId
      );
      await updateDoc(chapterDocRef, {
        title: editTitle.trim(),
        content: editContent,
        updatedAt: serverTimestamp(),
      });
      cancelEditing();
    } catch (error) {
      console.error("Failed to update chapter:", error);
      setEditError("Failed to save changes. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete chapter
  const deleteChapter = async (chapterId: string) => {
    const confirmed = confirm("Are you sure you want to delete this chapter?");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, "books", bookId, "chapters", chapterId));
    } catch (error) {
      console.error("Failed to delete chapter:", error);
      alert("Failed to delete the chapter.");
    }
  };

  // Start adding new chapter
  const startAddingNew = () => {
    setAddingNew(true);
    setNewTitle("");
    setNewContent("");
    setAddError(null);
  };

  // Cancel adding new chapter
  const cancelAddingNew = () => {
    setAddingNew(false);
    setNewTitle("");
    setNewContent("");
    setAddError(null);
  };

  // Save new chapter
  const saveNewChapter = async () => {
    if (!newTitle.trim()) {
      setAddError("Chapter title cannot be empty.");
      return;
    }
    setIsAdding(true);
    setAddError(null);

    try {
      const chaptersRef = collection(db, "books", bookId, "chapters");
      await addDoc(chaptersRef, {
        title: newTitle.trim(),
        content: newContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      cancelAddingNew();
    } catch (error) {
      console.error("Failed to add chapter:", error);
      setAddError("Failed to add chapter. Try again.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <p className="text-taupe">Loading chapters...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      {/* Add New Chapter Section */}
      {addingNew ? (
        <div className="border p-4 rounded bg-gray-50 shadow-sm">
          <h4 className="text-lg font-semibold mb-2">Add New Chapter</h4>
          <input
            type="text"
            placeholder="Chapter Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            disabled={isAdding}
            className="w-full mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
          <textarea
            placeholder="Chapter Content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            disabled={isAdding}
            rows={5}
            className="w-full mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-400 resize-y"
          />
          {addError && <p className="text-red-600 mb-2">{addError}</p>}
          <div className="flex gap-2">
            <button
              onClick={saveNewChapter}
              disabled={isAdding}
              className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={cancelAddingNew}
              disabled={isAdding}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startAddingNew}
          className="px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-700"
        >
          + Add New Chapter
        </button>
      )}

      {/* Chapters List */}
      {chapters.length === 0 && !addingNew && (
        <p className="text-taupe">
          No chapters yet. Add your first chapter above.
        </p>
      )}

      <ul className="space-y-3">
        {chapters.map((chapter) => (
          <li
            key={chapter.id}
            className="bg-gray-50 rounded p-4 shadow-sm flex flex-col md:flex-row md:items-start md:justify-between"
          >
            {editingChapterId === chapter.id ? (
              <div className="flex-grow flex flex-col">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isSaving}
                  className="mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-400"
                  aria-label="Edit chapter title"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  disabled={isSaving}
                  rows={5}
                  className="mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-400 resize-y"
                  aria-label="Edit chapter content"
                />
                {editError && <p className="text-red-600 mb-2">{editError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-rosewood">
                    {chapter.title}
                  </h4>
                  <p className="whitespace-pre-wrap mt-1 text-taupe">
                    {chapter.content}
                  </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 md:mt-0 md:ml-4">
                  <button
                    onClick={() => startEditing(chapter)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    aria-label={`Edit chapter titled ${chapter.title}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteChapter(chapter.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    aria-label={`Delete chapter titled ${chapter.title}`}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
