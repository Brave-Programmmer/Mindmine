import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase"; // Assuming `db` is already initialized and exported

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  coverImage: string;
  totalChapters: number;
  createdAt: string;
  views?: number;
};

const BookCard = ({ book }: { book: Book }) => {
  return (
    <a
      href={`/books/${book.id}`}
      className="block relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-lg transform transition-all duration-300
       hover:scale-[1.03] hover:shadow-2xl group cursor-pointer border border-gray-200 bg-white"
      aria-label={`View details of ${book.title} by ${book.author}`}
    >
      <div
        className={`${book.coverImage} absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105`}
      ></div>

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300
        flex flex-col justify-end p-4 text-white text-center"
      >
        <h3 className="text-lg md:text-xl font-bold mb-1 leading-tight line-clamp-2">
          {book.title}
        </h3>
        <p className="text-sm md:text-base font-medium text-gray-200 mb-2 line-clamp-1">
          By {book.author}
        </p>
        <p className="text-xs md:text-sm italic text-gray-300 line-clamp-3 mb-3">
          {book.synopsis || "No synopsis available for this book."}
        </p>
        <div className="flex justify-center gap-4 text-xs md:text-sm font-semibold mt-auto">
          <span className="flex items-center gap-1">
            📖 {book.totalChapters} chapters
          </span>
          <span className="flex items-center gap-1">
            👁 {book.views || 0} views
          </span>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white
        transition-opacity duration-300 group-hover:opacity-0"
      >
        <p className="text-sm font-bold truncate">{book.title}</p>
        <p className="text-xs truncate text-gray-300">{book.author}</p>
      </div>
    </a>
  );
};

const AllBooksGrid = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<"title" | "totalChapters" | "views">(
    "title"
  );
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 20;

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const q = query(collection(db, "books"));
        const querySnapshot = await getDocs(q);

        const booksWithChapters = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const chaptersRef = collection(db, "books", doc.id, "chapters");
            const chaptersSnapshot = await getDocs(chaptersRef);
            return {
              id: doc.id,
              ...doc.data(),
              totalChapters: chaptersSnapshot.size,
            } as Book;
          })
        );

        setBooks(booksWithChapters);
      } catch (err) {
        console.error("Error loading books:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, []);

  const filteredBooks = books
    .filter((book) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term);
      const matchesGenre =
        selectedGenres.length === 0 || selectedGenres.includes(book.genre);
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortKey === "title") return a.title.localeCompare(b.title);
      if (sortKey === "totalChapters") return b.totalChapters - a.totalChapters;
      if (sortKey === "views") return (b.views || 0) - (a.views || 0);
      return 0;
    });

  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const allGenres = Array.from(
    new Set(books.map((book) => book.genre).filter(Boolean))
  ).sort();

  const toggleGenre = (genre: string) => {
    setCurrentPage(1);
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto font-inter">
      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTerm(e.target.value);
          }}
          className="w-full md:w-72 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          aria-label="Search books by title or author"
        />

        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as any)}
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500 transition"
          aria-label="Sort books"
        >
          <option value="title">Sort by Title (A-Z)</option>
          <option value="totalChapters">Sort by Chapters (desc)</option>
          <option value="views">Sort by Views (desc)</option>
        </select>
      </div>

      {/* Genre Filters */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        {allGenres.length === 0 && (
          <p className="text-gray-500">No genres available.</p>
        )}
        {allGenres.slice(0, 4).map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition
              ${selectedGenres.includes(genre)
                ? "bg-rose-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            aria-pressed={selectedGenres.includes(genre)}
          >
            {genre} ({books.filter((b) => b.genre === genre).length})
          </button>
        ))}

        {allGenres.length > 4 && (
          <div className="relative group">
            <button
              className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm font-medium"
              aria-haspopup="true"
            >
              More ▾
            </button>
            <div className="absolute z-50 hidden group-hover:block bg-white border border-gray-300 rounded-md shadow-md p-2 max-h-52 overflow-y-auto w-40">
              {allGenres.slice(4).map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`block w-full text-left px-2 py-1 rounded-md text-sm transition
                    ${selectedGenres.includes(genre)
                      ? "bg-rose-600 text-white"
                      : "hover:bg-gray-100"
                    }`}
                  aria-pressed={selectedGenres.includes(genre)}
                >
                  {genre} ({books.filter((b) => b.genre === genre).length})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {isLoading ? (
          <p className="col-span-full text-center text-gray-500">
            Loading books...
          </p>
        ) : paginatedBooks.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">
            No books found.
          </p>
        ) : (
          paginatedBooks.map((book) => <BookCard key={book.id} book={book} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="mt-8 flex justify-center gap-3 select-none"
          aria-label="Pagination"
        >
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="px-3 py-1 rounded-md bg-rose-600 text-white font-semibold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
};

export default AllBooksGrid;
