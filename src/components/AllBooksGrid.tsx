import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  coverImage: string; // Tailwind background classes
  totalChapters: number;
  createdAt: string;
  views?: number;
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
        const books = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(books as Book[]);
      } catch (err) {
        console.error("Error loading books:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, []);

  // Filtering by search (title or author) and selected genres
  const filteredBooks = books
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre =
        selectedGenres.length === 0 || selectedGenres.includes(book.genre);
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortKey === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortKey === "totalChapters") {
        return b.totalChapters - a.totalChapters;
      }
      if (sortKey === "views") {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Genre list (sorted)
  const allGenres = Array.from(
    new Set(books.map((book) => book.genre).filter(Boolean))
  ).sort();

  // Handler for multi-select genres toggle
  const toggleGenre = (genre: string) => {
    setCurrentPage(1);
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      {/* Search & Sort controls */}
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

      {/* Genre multi-select buttons (show first 4, rest hidden behind "More" dropdown) */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        {allGenres.length === 0 && (
          <p className="text-gray-500">No genres available.</p>
        )}
        {allGenres.slice(0, 4).map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition
              ${
                selectedGenres.includes(genre)
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
              aria-expanded="false"
            >
              More ▾
            </button>
            <div className="absolute z-50 hidden group-hover:block bg-white border border-gray-300 rounded-md shadow-md p-2 max-h-52 overflow-y-auto w-40">
              {allGenres.slice(4).map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`block w-full text-left px-2 py-1 rounded-md text-sm transition
                    ${
                      selectedGenres.includes(genre)
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

      {/* Books grid */}
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
          paginatedBooks.map((book) => (
            <a
              key={book.id}
              href={`/books/${book.id}`}
              className="relative group w-full aspect-[2/3] rounded-xl shadow-lg overflow-hidden bg-white border border-gray-200 hover:shadow-2xl transition-transform hover:scale-[1.05]"
              aria-label={`View details of ${book.title}`}
            >
              {/* Book Binding / Spine */}
              <div className="absolute left-0 top-0 h-full w-8 rounded-l-xl bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 border-r border-black/50 shadow-inner flex flex-col items-center justify-center z-30">
                {/* Curved vertical strips for texture */}
                <div className="w-1 h-full bg-black/10 rounded-l-full absolute left-1/2 top-0 -translate-x-1/2"></div>
                <div className="w-0.5 h-full bg-black/20 rounded-l-full absolute left-3 top-0"></div>
                <div className="w-0.5 h-full bg-black/20 rounded-l-full absolute left-5 top-0"></div>
                {/* Vertical stitches spaced evenly */}
                <div className="flex flex-col justify-between h-4/5">
                  {[...Array(8)].map((_, i) => (
                    <span
                      key={i}
                      className="block w-2 h-2 rounded-full bg-neutral-700 shadow-md"
                    />
                  ))}
                </div>
              </div>

              {/* Book Cover */}
              <div
                className={`${book.coverImage} h-full w-full rounded-r-3xl bg-cover bg-center relative z-20 flex flex-col justify-end shadow-inner`}
                style={{ alignItems: "center", justifyContent: "center" }}
              >
                {/* Title bar on cover
                <div className="bg-black/70 backdrop-blur-sm text-white px-4 py-2 font-bold text-sm md:text-base select-none rounded-tl-xl truncate max-w-full whitespace-nowrap overflow-hidden">
                  {book.title}
                </div> */}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 text-white duration-300 rounded-r-3xl p-4 flex flex-col justify-center items-center text-center select-none text-xs md:text-sm">
                  <h3 className="font-bold text-base md:text-lg mb-2 leading-tight truncate w-full">
                    {book.title}
                  </h3>
                  <p className="text-sm mb-1 truncate w-full">
                    By {book.author}
                  </p>
                  <p className="text-xs italic text-gray-300 line-clamp-3 mb-2 px-1 w-full">
                    {book.synopsis || "No synopsis available."}
                  </p>
                  <div className="flex justify-center gap-6 text-sm font-semibold mt-auto w-full px-4">
                    <span>📖 {book.totalChapters} chapters</span>
                    <span>👁 {book.views || 0} views</span>
                  </div>
                </div>
              </div>
            </a>
          ))
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
