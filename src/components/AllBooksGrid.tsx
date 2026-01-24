import React, { useEffect, useState, memo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
import { FiBookOpen, FiSearch, FiX } from "react-icons/fi";

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

const FALLBACK_COVER = "/assets/fallback-cover.png";
const NEW_DAYS = 7;

const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const GENRE_ICONS: Record<string, React.ReactNode> = {
  Fantasy: <span>🧙‍♂️</span>,
  Romance: <span>💖</span>,
  Adventure: <span>🗺️</span>,
  Mystery: <span>🕵️‍♂️</span>,
  SciFi: <span>🚀</span>,
  Horror: <span>👻</span>,
  Biography: <span>👤</span>,
  Poetry: <span>📝</span>,
  // Add more as needed
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
        className={`w-full h-full transition-all duration-500 group-hover:scale-110 group-active:scale-95 ${coverImage}`}
        aria-label="Book cover"
      />
    ) : (
      <div
        className={`w-full h-full bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`}
      ></div>
    )}
  </>
);

const BookCardGenreBadge = ({ genre }: { genre: string }) => (
  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-taupe text-sm font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl z-10">
    {GENRE_ICONS[genre] || <FiBookOpen className="inline-block w-4 h-4" />}
    <span>{genre}</span>
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
  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm transform transition-all duration-300 group-hover:from-black/95">
    <h2 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-yellow-300 transition-colors">
      {title}
    </h2>
    <p className="text-sm text-stone-300 mb-2 truncate">by {author}</p>
    <p className="text-sm text-stone-300 mb-3 line-clamp-3">
      {synopsis || "No synopsis available."}
    </p>
    <div className="flex items-center justify-between text-sm text-stone-300 gap-3">
      <span className="flex items-center gap-2 truncate">
        <FiBookOpen className="w-4 h-4 flex-shrink-0" />
        <span className="truncate">{chapterCount} chapters</span>
      </span>
      <span className="flex items-center gap-2 flex-shrink-0">
        <span>👁️</span>
        <span className="truncate">{views || 0} views</span>
      </span>
    </div>
  </div>
);

const BookCard = memo(({ book }: { book: Book }) => {
  const chapterCount =
    typeof book.totalChapters === "number" ? book.totalChapters : "...";
  const [imgError, setImgError] = useState(false);
  const isNew = (() => {
    try {
      const created = new Date(book.createdAt);
      return (
        (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24) < NEW_DAYS
      );
    } catch {
      return false;
    }
  })();
  const gradientMap: Record<string, string> = {
    Romance: "from-pink-400 to-pink-200",
    "Science Fiction": "from-blue-400 to-blue-100",
    Fantasy: "from-purple-400 to-yellow-100",
    Adventure: "from-orange-300 to-yellow-100",
    Mystery: "from-gray-600 to-gray-200",
    Horror: "from-gray-800 to-red-200",
    Biography: "from-amber-400 to-amber-100",
    Poetry: "from-rose-300 to-rose-100",
  };
  const gradient = gradientMap[book.genre] || "from-peach to-blush";

  return (
    <a
      href={`/books/${book.id}`}
      className="group block w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-200 hover:shadow-2xl hover:border-gold/60 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 animate-fade-in"
      aria-label={`View details of ${book.title}`}
      tabIndex={0}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50">
        <BookCardImage
          coverImage={book.coverImage}
          imgError={imgError}
          setImgError={setImgError}
          gradient={gradient}
        />
        <BookCardGenreBadge genre={book.genre} />
        {isNew && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-110 z-10">
            ✨ New
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
  <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-xl border-2 border-gray-200 animate-pulse">
    <div className="aspect-[2/3] bg-gradient-to-br from-gray-300 to-gray-200 rounded-2xl sm:rounded-3xl animate-shimmer"></div>
    <div className="p-5 sm:p-6">
      <div className="h-6 sm:h-7 bg-gray-300 rounded mb-3 animate-shimmer"></div>
      <div className="h-4 sm:h-5 bg-gray-200 rounded mb-3 animate-shimmer"></div>
      <div className="h-4 sm:h-5 bg-gray-200 rounded mb-4 animate-shimmer"></div>
      <div className="flex justify-between gap-3">
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-28 animate-shimmer"></div>
        <div className="h-4 sm:h-5 bg-gray-200 rounded w-24 animate-shimmer"></div>
      </div>
    </div>
  </div>
);

const AllBooksGrid = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<"title" | "totalChapters" | "views">(
    "title",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 18; // Reduced items per page for larger cards

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
          }),
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
        book.author.toLowerCase().includes(term) ||
        book.genre.toLowerCase().includes(term);
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
    currentPage * pageSize,
  );
  const allGenres = Array.from(
    new Set(books.map((book) => book.genre).filter(Boolean)),
  ).sort();

  const toggleGenre = (genre: string) => {
    setCurrentPage(1);
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    );
  };

  const featuredViews = Math.ceil(books.length * 0.05);

  return (
    <div className="p-4 sm:p-5 md:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto font-sans font-inter text-taupe">
      {/* Search and Sort */}
      <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur-lg border-b-2 border-gold/30 p-4 sm:p-5 md:p-6 rounded-3xl shadow-lg mb-5 sm:mb-6 transition-all duration-300">
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1">
              <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-taupe/60 text-xl" />
              <input
                type="text"
                placeholder="Search by title, author, or genre..."
                value={searchTerm}
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchTerm(e.target.value);
                }}
                className="w-full pl-14 pr-14 py-4 sm:py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 bg-blush text-taupe placeholder-taupe/60 shadow-md hover:shadow-lg transition-all duration-300 text-base sm:text-lg border-2 border-gold/40 font-medium"
                aria-label="Search books"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 px-3 py-2 rounded-full bg-red-100 text-red-600 border border-red-300 shadow hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200"
                  aria-label="Clear search"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="flex-1 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 bg-blush text-taupe shadow-md hover:shadow-lg transition-all duration-300 text-base sm:text-lg border-2 border-gold/40 font-medium cursor-pointer"
              aria-label="Sort books"
            >
              <option value="title">📚 Sort by Title (A-Z)</option>
              <option value="totalChapters">
                📖 Sort by Chapters (High to Low)
              </option>
              <option value="views">👁️ Sort by Views (High to Low)</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedGenres([]);
                setSortKey("title");
              }}
              className="px-5 py-4 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 text-taupe font-semibold shadow-md hover:shadow-lg transition-all duration-300 text-base sm:text-lg border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 whitespace-nowrap"
              aria-label="Reset filters"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Genre Filters - Horizontal Scroll */}
      <div className="mb-6 sm:mb-7 md:mb-9 flex overflow-x-auto no-scrollbar gap-3 sm:gap-4 pb-4 sm:pb-5 -mx-4 sm:mx-0 px-4 sm:px-0">
        <button
          onClick={() => setSelectedGenres([])}
          className={`shrink-0 px-5 sm:px-6 py-3 rounded-2xl text-base sm:text-lg font-bold transition-all duration-300 touch-target focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 hover:scale-105 active:scale-95 whitespace-nowrap ${
            selectedGenres.length === 0
              ? "ring-2 ring-gold bg-gradient-to-r from-gold to-sienna text-white shadow-lg"
              : "bg-blush text-taupe hover:bg-peach border-2 border-gold/40 shadow-sm hover:shadow-md"
          }`}
          aria-pressed={selectedGenres.length === 0}
          aria-label="Show all genres"
        >
          ✨ All Genres
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`shrink-0 px-5 sm:px-6 py-3 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 touch-target whitespace-nowrap hover:scale-105 active:scale-95 flex items-center gap-3 ${
              selectedGenres.includes(genre)
                ? "bg-gradient-to-r from-gold to-sienna text-white ring-2 ring-gold shadow-lg"
                : "bg-blush text-taupe hover:bg-peach border-2 border-gold/40 shadow-sm hover:shadow-md"
            }`}
            aria-pressed={selectedGenres.includes(genre)}
            aria-label={`Filter by genre: ${genre}`}
            title={genre}
          >
            {GENRE_ICONS[genre] || (
              <FiBookOpen className="inline-block w-5 h-5" />
            )}
            <span>{genre}</span>
          </button>
        ))}
        {/* Clear Filters Button */}
        {selectedGenres.length > 0 && (
          <button
            onClick={() => setSelectedGenres([])}
            className="shrink-0 px-5 sm:px-6 py-3 rounded-2xl text-base sm:text-lg font-bold bg-red-100 text-red-600 border-2 border-red-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 touch-target whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3"
            aria-label="Clear genre filters"
          >
            <FiX className="w-5 h-5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="mb-5 sm:mb-6 text-base sm:text-lg text-sienna font-bold animate-fade-in flex items-center gap-3 px-3">
        <span>📊</span>
        <span>
          Showing {filteredBooks.length} book
          {filteredBooks.length !== 1 ? "s" : ""}
          {selectedGenres.length > 0 && (
            <span> in {selectedGenres.join(", ")}</span>
          )}
          {searchTerm && <span> matching "{searchTerm}"</span>}
        </span>
      </div>

      {/* Grid of books or loading/empty state - Responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 sm:gap-6 md:gap-7 lg:gap-8 animate-fade-in">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginatedBooks.length === 0 ? (
          <div className="col-span-full text-center py-16 sm:py-20 md:py-28 bg-gradient-to-br from-blush/40 to-peach/40 rounded-3xl border-2 border-dashed border-gold/50 animate-pulse">
            <div className="text-6xl sm:text-7xl md:text-8xl mb-5 sm:mb-6 md:mb-7 animate-bounce">
              📚
            </div>
            <h4 className="text-2xl sm:text-3xl md:text-4xl font-bold text-taupe mb-3 sm:mb-4">
              No books found
            </h4>
            <p className="text-lg sm:text-xl md:text-2xl text-sienna/90 px-5 max-w-lg mx-auto">
              Try adjusting your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedGenres([]);
              }}
              className="mt-8 px-7 py-4 bg-gradient-to-r from-gold to-sienna text-taupe font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-gold/50 text-lg"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          paginatedBooks.map((book, index) => (
            <div key={book.id} style={{ animationDelay: `${index * 0.05}s` }}>
              <BookCard book={book} />
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center mt-8 sm:mt-10 md:mt-12 gap-4 sm:gap-5 md:gap-6 animate-fade-in">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-2xl bg-gradient-to-r from-blush to-peach text-taupe hover:from-peach hover:to-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base sm:text-lg touch-target shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 hover:scale-105 active:scale-95 border-2 border-gold/40"
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <span className="px-6 sm:px-8 py-3.5 text-taupe font-bold text-base sm:text-lg bg-blush/60 rounded-2xl border-2 border-gold/40">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-full sm:w-auto px-6 sm:px-8 py-4 rounded-2xl bg-gradient-to-r from-blush to-peach text-taupe hover:from-peach hover:to-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-base sm:text-lg touch-target shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 hover:scale-105 active:scale-95 border-2 border-gold/40"
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default AllBooksGrid;

const styles = `
  .touch-target {
    min-height: 48px;
    min-width: 48px;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.7s ease-out forwards;
    opacity: 0;
  }

  .animate-shimmer {
    animation: shimmer 2s infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    .animate-fade-in,
    .animate-shimmer {
      animation: none;
      opacity: 1;
    }
    
    .group:hover .group-hover\\:scale-110 {
      transform: none;
    }
  }

  /* Better mobile touch targets */
  @media (max-width: 768px) {
    .touch-target {
      min-height: 52px;
      min-width: 52px;
    }
  }
`;
