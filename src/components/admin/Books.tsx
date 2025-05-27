import React, { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  addDoc,
  serverTimestamp,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { TextCrafter } from "../TextCrafter";
import { useAuthStore } from "../../store/authStore"; // adjust the path if different

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  coverImage: string;
  totalChapters: number;
  createdAt: string;
  email: string;
};

type Chapter = {
  id: string;
  title: string;
  content: string;
  createdAt: any;
};

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const userEmail = useAuthStore((state) => state.email);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [createChapterError, setCreateChapterError] = useState<string | null>(
    null
  );

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !userEmail) {

      setBooks([]);
      setIsLoading(false);
      window.location.href = '/login'

      return;
    }

    const q = query(collection(db, "books"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const booksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Book[];
        const userBooks = booksData.filter((book) => book.email === userEmail);
        setBooks(userBooks);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error loading books:", error);
        setError("Failed to load books");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userEmail, isAuthenticated]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Saved successfully!");
    } catch (err) {
      alert("Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const loadChapters = async (bookId: string) => {
    const chapterSnapshot = await getDocs(
      collection(db, "books", bookId, "chapters")
    );
    const chaptersData = chapterSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chapter[];
    setChapters(chaptersData);
  };

  const deleteCollection = async (collectionRef: any) => {
    const querySnapshot = await getDocs(collectionRef);
    if (querySnapshot.empty) return;
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(docSnap.ref)
    );
    await Promise.all(deletePromises);
  };

  const handleDelete = async (bookId: string) => {
    const confirmed = confirm("Are you sure you want to delete this book?");
    if (!confirmed) return;
    try {
      const bookDocRef = doc(db, "books", bookId);
      const chaptersCollectionRef = collection(bookDocRef, "chapters");
      await deleteCollection(chaptersCollectionRef);
      await deleteDoc(bookDocRef);
      setBooks((prev) => prev.filter((book) => book.id !== bookId));
    } catch (err) {
      console.error("Failed to delete book:", err);
      alert("Failed to delete the book.");
    }
  };

  const openModal = async (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
    setNewChapterTitle("");
    setNewChapterContent("");
    setCreateChapterError(null);
    setChapters([]);
    await loadChapters(book.id);
  };

  const closeModal = () => {
    setSelectedBook(null);
    setIsModalOpen(false);
    setChapters([]);
    setEditingChapterId(null);
    setEditingContent("");
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) return;

    if (!newChapterTitle.trim()) {
      setCreateChapterError("Chapter title cannot be empty.");
      return;
    }

    setIsCreatingChapter(true);
    setCreateChapterError(null);

    try {
      const chaptersRef = collection(db, "books", selectedBook.id, "chapters");
      await addDoc(chaptersRef, {
        title: newChapterTitle.trim(),
        content: newChapterContent.trim(),
        createdAt: serverTimestamp(),
      });
      setNewChapterTitle("");
      setNewChapterContent("");
      await loadChapters(selectedBook.id);
    } catch (error) {
      console.error("Error creating chapter:", error);
      setCreateChapterError("Failed to create chapter. Try again.");
    } finally {
      setIsCreatingChapter(false);
    }
  };

  const startEditingChapter = (chapterId: string, currentContent: string) => {
    setEditingChapterId(chapterId);
    setEditingContent(currentContent);
  };

  const saveEditedChapter = async (chapterId: string) => {
    if (!selectedBook) return;
    try {
      const chapterRef = doc(
        db,
        "books",
        selectedBook.id,
        "chapters",
        chapterId
      );
      await updateDoc(chapterRef, { content: editingContent });
      setEditingChapterId(null);
      setEditingContent("");
      await loadChapters(selectedBook.id);
    } catch (error) {
      console.error("Error updating chapter:", error);
      alert("Failed to save chapter content.");
    }
  };

  return (
    <div>
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-rosewood mb-8 text-center">
          My Books
        </h1>

        {isLoading ? (
          <p className="text-center text-taupe">Loading books...</p>
        ) : books.length === 0 ? (
          <div className="text-center text-taupe">
            <p className="text-xl">No books available yet.</p>
            <p className="mt-2">Start by creating your first book!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 items-center justify-center">
            {books.map((book) => (
              <div
                key={book.id}
                className="w-full md:w-4/5 bg-white rounded-xl shadow-lg hover:shadow-xl transition p-4 md:p-6"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  {/* Book Cover with Spine */}
                  <div className="relative w-24 md:w-36 aspect-[2/3] flex-shrink-0 group">
                    {/* Spine */}
                    <div className="absolute left-0 top-0 h-full w-4 bg-neutral-800 rounded-l-md shadow-inner z-10"></div>

                    {/* Front Cover */}
                    <div
                      className={`h-full w-full pl-4 rounded-r-md ${book.coverImage} shadow-inner border border-black/10`}
                      role="img"
                    ></div>

                    {/* Optional title overlay on cover (for style) */}
                    <div className="absolute bottom-0 left-4 right-0 bg-black/40 text-white text-xs px-2 py-1 rounded-tr-md">
                      {book.title}
                    </div>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold text-rosewood mb-1">
                      {book.title}
                    </h2>
                    <p className="text-taupe mb-1">by {book.author}</p>
                    <p className="text-taupe mb-1">{book.genre}</p>
                    <p className="text-taupe text-sm mb-3 line-clamp-3">
                      {book.synopsis}
                    </p>
                    <p className="text-sm text-taupe border-t border-gold/20 pt-2">
                      {new Date(book.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex justify-center md:justify-end gap-2 mt-4">
                      <button
                        onClick={() => openModal(book)}
                        className="px-4 py-2 text-sm bg-rose-100 text-rose-700 rounded hover:bg-rose-200 transition"
                      >
                        🡪 View
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div>
              <h2 className="text-2xl font-bold mb-2 text-rosewood">
                {selectedBook.title}
              </h2>
              <p className="text-taupe mb-1">Author: {selectedBook.author}</p>
              <p className="text-taupe mb-1">Genre: {selectedBook.genre}</p>
              <p className="text-taupe mb-3">{selectedBook.synopsis}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-rosewood mb-2">
                Create New Chapter
              </h3>
              <form
                onSubmit={handleCreateChapter}
                className="flex flex-col gap-2"
              >
                <input
                  type="text"
                  placeholder="Chapter Title"
                  className="border border-gray-300 rounded px-3 py-2"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  disabled={isCreatingChapter}
                />
                <TextCrafter
                  value={newChapterContent}
                  onChange={setNewChapterContent}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
                {createChapterError && (
                  <p className="text-red-600 text-sm">{createChapterError}</p>
                )}
                <button
                  type="submit"
                  className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600 transition"
                  disabled={isCreatingChapter}
                >
                  {isCreatingChapter ? "Creating..." : "Add Chapter"}
                </button>
              </form>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-rosewood mb-2">
                Chapters
              </h3>
              {chapters.length === 0 ? (
                <p className="text-taupe text-sm">No chapters yet.</p>
              ) : (
                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className="border border-gray-200 p-4 rounded"
                    >
                      <h4 className="font-semibold text-rosewood">
                        {chapter.title}
                      </h4>
                      {editingChapterId === chapter.id ? (
                        <>
                          <TextCrafter
                            value={editingContent}
                            onChange={setEditingContent}
                            onSave={handleSave}
                            isSaving={isSaving}
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded"
                              onClick={() => saveEditedChapter(chapter.id)}
                            >
                              Save
                            </button>
                            <button
                              className="bg-gray-300 px-3 py-1 rounded"
                              onClick={() => setEditingChapterId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <div
                          className="prose max-w-none mt-2"
                          dangerouslySetInnerHTML={{ __html: chapter.content }}
                        />
                      )}
                      {editingChapterId !== chapter.id && (
                        <button
                          className="mt-2 text-sm text-blue-600 hover:underline"
                          onClick={() =>
                            startEditingChapter(chapter.id, chapter.content)
                          }
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
