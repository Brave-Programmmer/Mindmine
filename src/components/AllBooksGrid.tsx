import React, { useEffect, useState, memo, useMemo, useCallback } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
import {
  FiBookOpen,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
} from "react-icons/fi";

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

const NEW_DAYS = 7;

const GENRE_ICONS: Record<string, React.ReactNode> = {
  Fantasy: <span>🧙‍♂️</span>,
  Romance: <span>💖</span>,
  Adventure: <span>🗺️</span>,
  Mystery: <span>🕵️‍♂️</span>,
  SciFi: <span>🚀</span>,
  Horror: <span>👻</span>,
  Biography: <span>👤</span>,
  Poetry: <span>📝</span>,
};

const GRADIENT_MAP: Record<string, string> = {
  Romance: "from-pink-400 to-pink-200",
  "Science Fiction": "from-blue-400 to-blue-100",
  SciFi: "from-blue-400 to-blue-100",
  Fantasy: "from-purple-400 to-yellow-100",
  Adventure: "from-orange-300 to-yellow-100",
  Mystery: "from-gray-600 to-gray-200",
  Horror: "from-gray-800 to-red-200",
  Biography: "from-amber-400 to-amber-100",
  Poetry: "from-rose-300 to-rose-100",
};

// BookCard subcomponents
const BookCardImage = ({
  coverImage,
  imgError,
  setImgError,
  gradient,
}: {
  coverImage: string;
  imgError: boolean;
  setImgError: (v: boolean) => void;
  gradient: string;
}) => (
  <>
    {coverImage && !imgError ? (
      <div
        className={`${coverImage}w-full h-full object-cover transition-all duration-500 group-hover:scale-105`}
        onError={() => setImgError(true)}
      ></div>
    ) : (
      <div
        className={`w-full h-full bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`}
      ></div>
    )}
  </>
);

const BookCardGenreBadge = ({ genre }: { genre: string }) => (
  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-taupe text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 z-10">
    {GENRE_ICONS[genre] || <FiBookOpen className="inline-block w-3 h-3" />}
    <span className="truncate">{genre}</span>
  </div>
);

const BookCardOverlay = ({
  title,
  author,
  synopsis,
  chapterCount,
  views,
}: {
  title: string;
  author: string;
  synopsis: string;
  chapterCount: number | string;
  views?: number;
}) => (
  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm">
    <h2 className="text-sm font-bold text-white mb-1 line-clamp-2">{title}</h2>
    <p className="text-xs text-stone-300 mb-1 truncate">by {author}</p>
    <div className="flex items-center justify-between text-xs text-stone-300">
      <span className="flex items-center gap-1">
        <FiBookOpen className="w-3 h-3" />
        <span>{chapterCount} ch.</span>
      </span>
      <span className="flex items-center gap-1">
        <span>👁️</span>
        <span>{views || 0} views</span>
      </span>
    </div>
  </div>
);

const BookCard = memo(({ book }: { book: Book }) => {
  const chapterCount =
    typeof book.totalChapters === "number" ? book.totalChapters : "...";
  const [imgError, setImgError] = useState(false);
  const isNew = useMemo(() => {
    try {
      const created = new Date(book.createdAt);
      return (
        (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24) < NEW_DAYS
      );
    } catch {
      return false;
    }
  }, [book.createdAt]);
  const gradient = GRADIENT_MAP[book.genre] || "from-gray-200 to-gray-100";

  return (
    <a
      href={`/books/${book.id}`}
      className="group block w-full bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
      aria-label={`View details of ${book.title}`}
      tabIndex={0}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-50">
        <BookCardImage
          coverImage={book.coverImage}
          imgError={imgError}
          setImgError={setImgError}
          gradient={gradient}
        />
        <BookCardGenreBadge genre={book.genre} />
        {isNew && (
          <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-sm">
            New
          </div>
        )}
        <BookCardOverlay
          title={book.title}
          author={book.author}
          synopsis={book.synopsis}
          chapterCount={chapterCount}
          views={book.views}
        />
      </div>
    </a>
  );
});

const SkeletonCard = () => (
  <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 animate-pulse">
    <div className="aspect-[2/3] bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl"></div>
    <div className="p-3">
      <div className="h-4 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 bg-gray-100 rounded mb-3 w-3/4"></div>
      <div className="flex justify-between">
        <div className="h-3 bg-gray-100 rounded w-16"></div>
        <div className="h-3 bg-gray-100 rounded w-16"></div>
      </div>
    </div>
  </div>
);

const AllBooksGrid = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<"title" | "totalChapters" | "views">(
    "title",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 24;

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setError(null);
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
          }),
        );
        setBooks(booksWithChapters);
      } catch (err) {
        console.error("Error loading books:", err);
        setError("Failed to load books. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, []);

  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const term = searchTerm.toLowerCase();
        const matchesSearch =
          book.title.toLowerCase().includes(term) ||
          book.author.toLowerCase().includes(term) ||
          book.genre.toLowerCase().includes(term);
        const matchesGenre =
          selectedGenres.length === 0 || selectedGenres.includes(book.genre);
        return matchesSearch && matchesGenre;
      })
      .sort((a, b) => {
        if (sortKey === "title") return a.title.localeCompare(b.title);
        if (sortKey === "totalChapters")
          return b.totalChapters - a.totalChapters;
        if (sortKey === "views") return (b.views || 0) - (a.views || 0);
        return 0;
      });
  }, [books, searchTerm, selectedGenres, sortKey]);

  const totalPages = useMemo(
    () => Math.ceil(filteredBooks.length / pageSize),
    [filteredBooks.length],
  );
  const paginatedBooks = useMemo(
    () =>
      filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredBooks, currentPage],
  );
  const allGenres = useMemo(
    () =>
      Array.from(
        new Set(books.map((book) => book.genre).filter(Boolean)),
      ).sort(),
    [books],
  );

  const toggleGenre = useCallback((genre: string) => {
    setCurrentPage(1);
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  }, []);

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedGenres([]);
    setSortKey("title");
    setCurrentPage(1);
  }, []);

  return (
    <div className="p-4 w-full max-w-screen-2xl mx-auto font-sans text-taupe">
      {/* Search and Sort */}
      <div className="sticky top-16 z-100 bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 rounded-xl shadow-sm mb-5">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-2xl">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, or genre..."
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold border border-gray-300 text-sm"
              aria-label="Search books"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={sortKey}
              onChange={(e) =>
                setSortKey(
                  e.target.value as "title" | "totalChapters" | "views",
                )
              }
              className="px-3 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold text-sm w-full sm:w-48"
              aria-label="Sort books"
            >
              <option value="title">Sort by Title (A-Z)</option>
              <option value="totalChapters">Chapters (High to Low)</option>
              <option value="views">Views (High to Low)</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium border border-gray-300 hover:bg-gray-200 transition-colors text-sm flex items-center justify-center gap-2"
              aria-label="Reset filters"
            >
              <FiFilter className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Genre Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedGenres([])}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedGenres.length === 0
              ? "bg-gold text-taupe"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Genres
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              selectedGenres.includes(genre)
                ? "bg-gold text-taupe"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            aria-label={`Filter by genre: ${genre}`}
            title={genre}
          >
            {GENRE_ICONS[genre] || (
              <FiBookOpen className="inline-block w-3 h-3" />
            )}
            <span>{genre}</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
        <span>
          Showing {filteredBooks.length} book
          {filteredBooks.length !== 1 ? "s" : ""}
        </span>
        {selectedGenres.length > 0 && (
          <span>in {selectedGenres.join(", ")}</span>
        )}
        {searchTerm && <span>matching "{searchTerm}"</span>}
      </div>

      {error && (
        <div className="mb-4 text-center text-red-600 font-medium">{error}</div>
      )}

      {/* Grid of books or loading/empty state */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginatedBooks.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="text-5xl mb-4">📚</div>
            <h4 className="text-xl font-bold text-gray-700 mb-2">
              No books found
            </h4>
            <p className="text-gray-600 mb-5">
              Try adjusting your search or filters
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2 bg-gold text-taupe font-medium rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          paginatedBooks.map((book) => <BookCard key={book.id} book={book} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <FiChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum =
                currentPage <= 3
                  ? i + 1
                  : currentPage >= totalPages - 2
                    ? totalPages - 4 + i
                    : currentPage - 2 + i;

              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md ${
                      currentPage === pageNum
                        ? "bg-gold text-taupe font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <span>Next</span>
            <FiChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AllBooksGrid;
