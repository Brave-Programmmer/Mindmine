import React, { useEffect, useState, memo } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";
import { FiHeart, FiBookOpen } from "react-icons/fi";

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
const BookCardImage = ({ coverImage, imgError, setImgError, gradient }: { coverImage: string; imgError: boolean; setImgError: (v: boolean) => void; gradient: string }) => (
  <>
    {coverImage && !imgError ? (
      <div
        className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${coverImage}`}
        aria-label="Book cover"
      />
    ) : (
      <div className={`w-full h-full bg-gradient-to-br ${gradient}`}></div>
    )}
  </>
);

const BookCardGenreBadge = ({ genre }: { genre: string }) => (
  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
    {GENRE_ICONS[genre] || <FiBookOpen className="inline-block w-3 h-3" />}
    {genre}
  </div>
);

const BookCardOverlay = ({ title, author, synopsis, chapterCount, views }: { title: string; author: string; synopsis: string; chapterCount: number | string; views?: number }) => (
  <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-sm">
    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-gold transition-colors">
      {title}
    </h3>
    <p className="text-xs text-gray-700 mb-1 truncate">by {author}</p>
    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
      {synopsis || "No synopsis available."}
    </p>
    <div className="flex items-center justify-between text-xs text-gray-500">
      <span className="flex items-center gap-1">
        <FiBookOpen className="w-4 h-4" />
        {chapterCount} chapters
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
        {views || 0} views
      </span>
    </div>
  </div>
);

const BookCard = memo(
  ({ book }: { book: Book }) => {
    const chapterCount = typeof book.totalChapters === "number" ? book.totalChapters : "...";
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
        className="group block w-full bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
        aria-label={`View details of ${book.title}`}
        tabIndex={0}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
          <BookCardImage coverImage={book.coverImage} imgError={imgError} setImgError={setImgError} gradient={gradient} />
          <BookCardGenreBadge genre={book.genre} />
          {isNew && (
            <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
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
  }
);

const SkeletonCard = () => (
  <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 animate-pulse">
    <div className="aspect-[3/4] bg-gray-200 rounded-t-lg"></div>
    <div className="p-4">
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-3"></div>
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="flex justify-between">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
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
    <div className="p-4 sm:p-6 md:p-8 w-full max-w-screen-2xl mx-auto font-sans font-inter text-taupe">
      {/* Search and Sort */}
      <div className="sticky top-16 md:top-20 z-40 bg-white/90 backdrop-blur-md border-b border-peach/20 p-3 sm:p-4 rounded-b-lg shadow-sm mb-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => {
              setCurrentPage(1);
              setSearchTerm(e.target.value);
            }}
            className="w-full px-4 sm:px-5 py-2 sm:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-gold bg-blush text-taupe placeholder-taupe/60 shadow-sm text-sm sm:text-base"
            aria-label="Search books"
          />
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
            className="w-full sm:w-48 px-4 py-2 sm:py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-gold bg-blush text-taupe shadow-sm text-sm sm:text-base"
            aria-label="Sort books"
          >
            <option value="title">Sort by Title (A-Z)</option>
            <option value="totalChapters">Sort by Chapters (desc)</option>
            <option value="views">Sort by Views (desc)</option>
          </select>
        </div>
      </div>

      {/* Genre Filters - Horizontal Scroll */}
      <div className="mb-6 sm:mb-8 flex overflow-x-auto no-scrollbar gap-2 pb-3">
        <button
          onClick={() => setSelectedGenres([])}
          className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition touch-target focus:outline-none focus:ring-2 focus:ring-gold ${
            selectedGenres.length === 0 ? "ring-2 ring-gold bg-gold/20" : "bg-blush text-taupe hover:bg-peach"
          }`}
          aria-pressed={selectedGenres.length === 0}
          aria-label="Show all genres"
        >
          All
        </button>
        {allGenres.map((genre) => (
          <button
            key={genre}
            onClick={() => toggleGenre(genre)}
            className={`shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-gold touch-target ${
              selectedGenres.includes(genre)
                ? "bg-gold text-sienna font-bold ring-2 ring-gold"
                : "bg-blush text-taupe hover:bg-peach"
            }`}
            aria-pressed={selectedGenres.includes(genre)}
            aria-label={`Filter by genre: ${genre}`}
          >
            🏷️ {genre}
          </button>
        ))}
        {/* Clear Filters Button */}
        {selectedGenres.length > 0 && (
          <button
            onClick={() => setSelectedGenres([])}
            className="shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-red-100 text-red-600 border border-red-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 touch-target"
            aria-label="Clear genre filters"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 text-xs sm:text-sm text-sienna/70 font-medium">
        Showing {filteredBooks.length} book
        {filteredBooks.length !== 1 ? "s" : ""}
        {selectedGenres.length > 0 && (
          <span> in {selectedGenres.join(", ")}</span>
        )}
        {searchTerm && <span> matching "{searchTerm}"</span>}
      </div>

      {/* Grid of books or loading/empty state - Responsive columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginatedBooks.length === 0 ? (
          <div className="col-span-full text-center py-12 sm:py-24 bg-gradient-to-br from-blush/20 to-peach/20 rounded-2xl border-2 border-dashed border-gold/30">
            <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📚</div>
            <h4 className="text-lg sm:text-xl font-bold text-taupe mb-2">
              No books found
            </h4>
            <p className="text-sm sm:text-base text-sienna/80">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          paginatedBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center mt-6 sm:mt-8 gap-2 sm:gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-blush text-taupe hover:bg-peach disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm touch-target"
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <span className="px-3 py-2 text-taupe font-bold text-sm">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-full sm:w-auto px-4 py-2 rounded-full bg-blush text-taupe hover:bg-peach disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold text-sm touch-target"
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
`;
