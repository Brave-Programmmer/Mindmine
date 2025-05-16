import React, { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "../store/authStore";
import { bookService } from "../services/firebase";
import RichTextEditor from "./RichTextEditor";
import type { Book, Chapter, BookPage } from "../types/book";

const WriteContent = () => {
  const { isAuthenticated, email } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentPage, setCurrentPage] = useState<BookPage | null>(null);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [bookForm, setBookForm] = useState({
    title: "",
    genre: "",
    synopsis: "",
  });
  const [creatingBook, setCreatingBook] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Wait for auth state to initialize
  useEffect(() => {
    const timer = setTimeout(() => setAuthLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
    } else if (!authLoading && isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Load user's book (for demo: just load the first book by this author)
  useEffect(() => {
    const loadBook = async () => {
      if (!email) return;
      setIsLoading(true);
      try {
        const allBooks = await bookService.getAllBooks();
        const userBook = allBooks.find((b) => b.author === email);
        if (userBook) {
          setBook(userBook);
        }
      } catch (err) {
        setError("Failed to load book");
      } finally {
        setIsLoading(false);
      }
    };
    loadBook();
  }, [email]);

  // Load chapters when book changes
  useEffect(() => {
    const loadChapters = async () => {
      if (!book) return;
      setIsLoading(true);
      try {
        const chaps = await bookService.getChapters(book.id);
        setChapters(chaps);
        if (chaps.length > 0) {
          setSelectedChapter(chaps[0].id);
        }
      } catch (err) {
        setError("Failed to load chapters");
      } finally {
        setIsLoading(false);
      }
    };
    loadChapters();
  }, [book]);

  // Load pages when chapter changes
  useEffect(() => {
    const loadPages = async () => {
      if (!selectedChapter || !book) return;
      setIsLoading(true);
      try {
        const pgs = await bookService.getPages(selectedChapter);
        setPages(pgs);
        if (pgs.length > 0) {
          setCurrentPage(pgs[0]);
        } else {
          setCurrentPage(null);
        }
      } catch (err) {
        setError("Failed to load pages");
      } finally {
        setIsLoading(false);
      }
    };
    loadPages();
  }, [selectedChapter, book]);

  // Book creation handler
  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;
    setCreatingBook(true);
    setError(null);

    try {
      const newBook = await bookService.createBook({
        title: bookForm.title,
        author: email,
        genre: bookForm.genre,
        synopsis: bookForm.synopsis,
        coverImage: "",
        totalPages: 0,
      });
      setBook(newBook);
    } catch (err) {
      setError("Failed to create book");
    } finally {
      setCreatingBook(false);
    }
  };

  // Add chapter
  const handleAddChapter = async () => {
    if (!book || !newChapterTitle.trim()) return;
    setIsLoading(true);
    try {
      const chapter = await bookService.addChapter(
        book.id,
        newChapterTitle,
        chapters.length
      );
      setChapters((prev) => [...prev, chapter]);
      setNewChapterTitle("");
      setSelectedChapter(chapter.id);
    } catch (err) {
      setError("Failed to add chapter");
    } finally {
      setIsLoading(false);
    }
  };

  // Add page
  const handleAddPage = async () => {
    if (!book || !selectedChapter) return;
    setIsLoading(true);
    try {
      const page = await bookService.addPage(
        selectedChapter,
        book.id,
        pages.length + 1
      );
      setPages((prev) => [...prev, page]);
      setCurrentPage(page);
    } catch (err) {
      setError("Failed to add page");
    } finally {
      setIsLoading(false);
    }
  };

  // Save page content
  const handlePageContentChange = async (content: string) => {
    if (!currentPage) return;
    setCurrentPage((prev) => (prev ? { ...prev, content } : null));
    await bookService.updatePage(currentPage.id, content);
    setPages((prev) =>
      prev.map((p) => (p.id === currentPage.id ? { ...p, content } : p))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosewood"></div>
      </div>
    );
  }

  if (!book) {
    // Book creation form
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg animate-fade-in mt-8">
        <h2 className="text-3xl font-bold text-rosewood mb-8 text-center">
          Create Your Book
        </h2>
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}
        <form onSubmit={handleCreateBook} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-taupe font-medium mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={bookForm.title}
              onChange={(e) =>
                setBookForm((f) => ({ ...f, title: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood transition-all"
              required
            />
          </div>
          <div>
            <label
              htmlFor="genre"
              className="block text-taupe font-medium mb-2"
            >
              Genre
            </label>
            <input
              type="text"
              id="genre"
              value={bookForm.genre}
              onChange={(e) =>
                setBookForm((f) => ({ ...f, genre: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood transition-all"
              required
            />
          </div>
          <div>
            <label
              htmlFor="synopsis"
              className="block text-taupe font-medium mb-2"
            >
              Synopsis
            </label>
            <textarea
              id="synopsis"
              value={bookForm.synopsis}
              onChange={(e) =>
                setBookForm((f) => ({ ...f, synopsis: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gold rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood transition-all"
              required
            />
          </div>
          <button
            type="submit"
            disabled={creatingBook}
            className="w-full bg-rosewood text-white py-3 rounded-lg hover:bg-sienna transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {creatingBook ? "Creating..." : "Create Book"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Sidebar: Chapters */}
      <aside className="w-64 border-r border-gold bg-peach/5 p-4 rounded-xl">
        <h2 className="text-xl font-bold text-rosewood mb-4">Chapters</h2>
        <div className="mb-4">
          <input
            type="text"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            placeholder="New Chapter Title"
            className="w-full px-3 py-2 border border-gold rounded-lg mb-2"
          />
          <button
            onClick={handleAddChapter}
            className="w-full px-4 py-2 bg-rosewood text-white rounded-lg hover:bg-rosewood/90 transition-colors"
          >
            Add Chapter
          </button>
        </div>
        <nav className="space-y-2">
          {chapters.map((chapter) => (
            <button
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter.id)}
              className={`w-full p-2 rounded-lg text-left transition-colors ${
                selectedChapter === chapter.id
                  ? "bg-rosewood text-white"
                  : "hover:bg-peach"
              }`}
            >
              {chapter.title}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1">
        {/* Page Navigation */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex flex-wrap gap-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  currentPage?.id === page.id
                    ? "bg-rosewood text-white"
                    : "bg-peach text-rosewood hover:bg-rosewood hover:text-white"
                }`}
              >
                {page.pageNumber}
              </button>
            ))}
          </div>
          <button
            onClick={handleAddPage}
            className="px-3 py-1 rounded-lg bg-gold text-white hover:bg-rosewood transition-colors"
          >
            + Page
          </button>
        </div>
        {/* Page Editor */}
        {currentPage ? (
          <div className="bg-white rounded-lg shadow-lg p-8 animate-fade-in">
            <h3 className="text-2xl font-bold text-rosewood mb-4">
              {chapters.find((c) => c.id === selectedChapter)?.title} - Page{" "}
              {currentPage.pageNumber}
            </h3>
            <RichTextEditor
              content={currentPage.content}
              onChange={handlePageContentChange}
            />
          </div>
        ) : (
          <div className="text-center p-8 border border-gold rounded-lg">
            <p className="text-taupe">
              No pages in this chapter. Click "+ Page" to start writing.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WriteContent;
