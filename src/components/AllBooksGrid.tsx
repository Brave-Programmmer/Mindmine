import React, { useEffect, useState, memo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
import { FiBookOpen } from "react-icons/fi";

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
      <div className={`w-full h-full bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-110`}></div>
    )}
  </>
);

const BookCardGenreBadge = ({ genre }: { genre: string }) => (
  <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-white/95 backdrop-blur-md text-gray-700 text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg flex items-center gap-1 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl z-10">
    {GENRE_ICONS[genre] || <FiBookOpen className="inline-block w-3 h-3" />}
    <span className="hidden sm:inline">{genre}</span>
    <span className="sm:hidden text-xs">{genre.slice(0, 1)}</span>
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
  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm transform transition-all duration-300 group-hover:from-black/90">
    <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5 sm:mb-1 line-clamp-2 group-hover:text-yellow-300 transition-colors">
      {title}
    </h3>
    <p className="text-xs text-gray-200 mb-0.5 truncate">by {author}</p>
    <p className="text-xs text-gray-300 mb-1 sm:mb-2 line-clamp-2">
      {synopsis || "No synopsis available."}
    </p>
    <div className="flex items-center justify-between text-xs text-gray-300 gap-1">
      <span className="flex items-center gap-0.5 sm:gap-1 truncate">
        <FiBookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        <span className="truncate">{chapterCount}</span>
      </span>
      <span className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
        <span className="truncate">{views || 0}</span>
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
      className="group block w-full bg-white rounded-lg sm:rounded-xl shadow-md border-2 border-gray-200 hover:shadow-2xl hover:border-gold/50 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 animate-fade-in"
      aria-label={`View details of ${book.title}`}
      tabIndex={0}
    >
      <div className="relative aspect-[2/3] sm:aspect-[3/4] overflow-hidden rounded-t-lg sm:rounded-t-xl bg-gradient-to-br from-gray-100 to-gray-50">
        <BookCardImage
          coverImage={book.coverImage}
          imgError={imgError}
          setImgError={setImgError}
          gradient={gradient}
        />
        <BookCardGenreBadge genre={book.genre} />
        {isNew && (
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-lg transform transition-all duration-300 group-hover:scale-110 z-10">
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
  <div className="w-full bg-white rounded-lg sm:rounded-xl shadow-md border-2 border-gray-200 animate-pulse">
    <div className="aspect-[2/3] sm:aspect-[3/4] bg-gradient-to-br from-gray-300 to-gray-200 rounded-t-lg sm:rounded-t-xl animate-shimmer"></div>
    <div className="p-3 sm:p-4">
      <div className="h-5 sm:h-6 bg-gray-300 rounded mb-2 animate-shimmer"></div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2 animate-shimmer"></div>
      <div className="h-3 sm:h-4 bg-gray-200 rounded mb-3 animate-shimmer"></div>
      <div className="flex justify-between gap-2">
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-20 animate-shimmer"></div>
        <div className="h-3 sm:h-4 bg-gray-200 rounded w-16 animate-shimmer"></div>
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

  const featuredViews = Math.ceil(books.length * 0.05);

  return (
    <div className="p-2 sm:p-4 md:p-6 lg:p-8 w-full max-w-screen-2xl mx-auto font-sans font-inter text-taupe">
      {/* Search and Sort */}
      <div className="sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur-lg border-b-2 border-gold/20 p-2 sm:p-3 md:p-4 rounded-b-lg shadow-lg mb-3 sm:mb-4 transition-all duration-300">
        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              placeholder="🔍 Search by title or author..."
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="w-full px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 bg-blush text-taupe placeholder-taupe/60 shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base border-2 border-gold/30 font-medium"
              aria-label="Search books"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="ml-1 px-2 py-2 rounded-full bg-red-100 text-red-600 border border-red-300 shadow hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="w-full sm:w-auto px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 bg-blush text-taupe shadow-md hover:shadow-lg transition-all duration-300 text-sm sm:text-base border-2 border-gold/30 font-medium cursor-pointer"
            aria-label="Sort books"
          >
            <option value="title">📚 Sort by Title (A-Z)</option>
            <option value="totalChapters">📖 Sort by Chapters (desc)</option>
            <option value="views">👁️ Sort by Views (desc)</option>
          </select>
        </div>
      </div>

      {/* Genre Filters - Horizontal Scroll */}
      <div className="mb-4 sm:mb-6 md:mb-8 flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 pb-2 sm:pb-3 -mx-2 sm:mx-0 px-2 sm:px-0">
        <button
          onClick={() => setSelectedGenres([])}
          className={`shrink-0 px-2.5 sm:px-3 md:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 touch-target focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 hover:scale-105 active:scale-95 ${
            selectedGenres.length === 0
              ? "ring-2 ring-gold bg-gradient-to-r from-gold to-sienna text-white shadow-lg"
              : "bg-blush text-taupe hover:bg-peach border-2 border-gold/30 shadow-sm hover:shadow-md"
          }`}
          aria-pressed={selectedGenres.length === 0}
          aria-label="Show all genres"
        >
          ✨ All
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`shrink-0 px-2.5 sm:px-3 md:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 touch-target whitespace-nowrap hover:scale-105 active:scale-95 flex items-center gap-1 ${
              selectedGenres.includes(genre)
                ? "bg-gradient-to-r from-gold to-sienna text-white ring-2 ring-gold shadow-lg"
                : "bg-blush text-taupe hover:bg-peach border-2 border-gold/30 shadow-sm hover:shadow-md"
            }`}
            aria-pressed={selectedGenres.includes(genre)}
            aria-label={`Filter by genre: ${genre}`}
            title={genre}
          >
            {GENRE_ICONS[genre] || <FiBookOpen className="inline-block w-3 h-3" />}
            <span className="hidden sm:inline">{genre}</span>
            <span className="sm:hidden text-xs">{genre.slice(0, 1)}</span>
          </button>
        ))}
        {/* Clear Filters Button */}
        {selectedGenres.length > 0 && (
          <button
            onClick={() => setSelectedGenres([])}
            className="shrink-0 px-2.5 sm:px-3 md:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-red-100 text-red-600 border-2 border-red-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 touch-target whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-300"
            aria-label="Clear genre filters"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-sienna font-bold animate-fade-in flex items-center gap-2">
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
      <div className="grid grid-cols-2 sm:grid-cols-2.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3 lg:gap-4 animate-fade-in">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginatedBooks.length === 0 ? (
          <div className="col-span-full text-center py-8 sm:py-12 md:py-24 bg-gradient-to-br from-blush/30 to-peach/30 rounded-2xl border-2 border-dashed border-gold/40 animate-pulse">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 md:mb-4 animate-bounce">📚</div>
            <h4 className="text-base sm:text-lg md:text-xl font-bold text-taupe mb-1 sm:mb-2">
              No books found
            </h4>
            <p className="text-xs sm:text-sm md:text-base text-sienna/90 px-4">
              Try adjusting your search or filters.
            </p>
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
        <div className="flex flex-col sm:flex-row justify-center items-center mt-4 sm:mt-6 md:mt-8 gap-2 sm:gap-3 md:gap-4 animate-fade-in">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-gradient-to-r from-blush to-peach text-taupe hover:from-peach hover:to-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-xs sm:text-sm touch-target shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 hover:scale-105 active:scale-95 border-2 border-gold/30"
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <span className="px-3 sm:px-4 py-1 sm:py-2 text-taupe font-bold text-xs sm:text-sm bg-blush/50 rounded-full border-2 border-gold/30">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full bg-gradient-to-r from-blush to-peach text-taupe hover:from-peach hover:to-gold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold text-xs sm:text-sm touch-target shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 hover:scale-105 active:scale-95 border-2 border-gold/30"
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
    min-height: 44px;
    min-width: 44px;
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
      transform: translateY(10px);
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
    animation: fadeIn 0.5s ease-out forwards;
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
  }
`;
