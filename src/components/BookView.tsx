import React, { useEffect, useState } from "react";
import { bookService } from "../services/firebase";
import type { Book, Chapter, BookPage } from "../types/book";

interface BookViewProps {
  bookId: string;
}

const BookView = ({ bookId }: BookViewProps) => {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [currentPage, setCurrentPage] = useState<BookPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const bookData = await bookService.getBook(bookId);
        setBook(bookData);
      } catch (err) {
        setError("Failed to load book");
        console.error("Error loading book:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  useEffect(() => {
    const loadChapters = async () => {
      if (!book) return;
      try {
        const chaps = await bookService.getChapters(book.id);
        setChapters(chaps);
        if (chaps.length > 0) {
          setSelectedChapter(chaps[0].id);
        }
      } catch (err) {
        setError("Failed to load chapters");
        console.error("Error loading chapters:", err);
      }
    };

    loadChapters();
  }, [book]);

  useEffect(() => {
    const loadPages = async () => {
      if (!selectedChapter) return;
      try {
        const pgs = await bookService.getPages(selectedChapter);
        setPages(pgs);
        if (pgs.length > 0) {
          setCurrentPage(pgs[0]);
        }
      } catch (err) {
        setError("Failed to load pages");
        console.error("Error loading pages:", err);
      }
    };

    loadPages();
  }, [selectedChapter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rosewood"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
          {error || "Book not found"}
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Book Header */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {book.coverImage && (
            <div className="w-full md:w-64 h-96 rounded-lg overflow-hidden shadow-lg">
              <img
                src={book.coverImage}
                alt={`Cover for ${book.title}`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-rosewood mb-4">{book.title}</h1>
            <p className="text-xl text-taupe mb-2">by {book.author}</p>
            <p className="text-taupe mb-4">{book.genre}</p>
            <p className="text-taupe mb-6">{book.synopsis}</p>
            <div className="flex gap-4 text-sm text-taupe">
              <span>{book.totalPages} pages</span>
              <span>•</span>
              <span>Created {new Date(book.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters and Content */}
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-8">
          {/* Chapter List */}
          <aside className="w-64 border-r border-gold/20 pr-4">
            <h2 className="text-xl font-bold text-rosewood mb-4">Chapters</h2>
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

          {/* Chapter Content */}
          <div className="flex-1">
            {currentPage ? (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-rosewood mb-4">
                  {chapters.find((c) => c.id === selectedChapter)?.title}
                </h2>
                <div dangerouslySetInnerHTML={{ __html: currentPage.content }} />
              </div>
            ) : (
              <div className="text-center text-taupe py-8">
                <p>No content available for this chapter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookView; 