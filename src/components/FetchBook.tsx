import { useEffect, useState, useRef } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase";
import CustomBook from "./CustomBook";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiBookOpen,
  FiAlertCircle,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  email: string;
  coverImage: string;
  totalChapters: number;
  createdAt: any;
};

type Chapter = {
  id: string;
  title: string;
  content: string;
  createdAt: any;
};

export default function FetchBook({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [showTableOfContents, setShowTableOfContents] =
    useState<boolean>(false);
  const [isChapterLoading, setIsChapterLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const goBack = () => window.history.back();

  const openChapter = async (chapter: Chapter, index: number) => {
    setIsChapterLoading(true);
    setShowTableOfContents(false);

    setTimeout(() => {
      setSelectedChapter(chapter);
      setCurrentChapterIndex(index);
      setIsChapterLoading(false);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }, 200);
  };

  const toggleTableOfContents = () => {
    setShowTableOfContents(!showTableOfContents);
  };

  const closeChapter = () => {
    setSelectedChapter(null);
    if (isFullscreen) {
      exitFullscreen();
    }
  };

  const navigateChapter = async (direction: "prev" | "next") => {
    if (!chapters.length) return;

    let newIndex = currentChapterIndex;
    if (direction === "prev" && currentChapterIndex > 0) {
      newIndex = currentChapterIndex - 1;
    } else if (
      direction === "next" &&
      currentChapterIndex < chapters.length - 1
    ) {
      newIndex = currentChapterIndex + 1;
    }

    if (newIndex !== currentChapterIndex) {
      setIsChapterLoading(true);

      setTimeout(() => {
        setCurrentChapterIndex(newIndex);
        setSelectedChapter(chapters[newIndex]);
        setIsChapterLoading(false);

        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      }, 150);
    }
  };

  // Fullscreen functions
  const enterFullscreen = () => {
    if (fullscreenRef.current) {
      if (fullscreenRef.current.requestFullscreen) {
        fullscreenRef.current.requestFullscreen();
      } else if ((fullscreenRef.current as any).webkitRequestFullscreen) {
        (fullscreenRef.current as any).webkitRequestFullscreen();
      } else if ((fullscreenRef.current as any).msRequestFullscreen) {
        (fullscreenRef.current as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement;

      setIsFullscreen(!!fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
      document.removeEventListener(
        "MSFullscreenChange",
        handleFullscreenChange,
      );
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showTableOfContents && event.key === "Escape") {
        setShowTableOfContents(false);
        return;
      }

      if (!selectedChapter) return;

      if (event.key === "ArrowLeft") {
        navigateChapter("prev");
      } else if (event.key === "ArrowRight") {
        navigateChapter("next");
      } else if (event.key === "Escape") {
        closeChapter();
      } else if (event.key === "f" || event.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    selectedChapter,
    currentChapterIndex,
    chapters,
    showTableOfContents,
    isFullscreen,
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const docRef = doc(db, "books", id);
        const docSnapPromise = getDoc(docRef);
        const chaptersSnapshotPromise = getDocs(
          collection(db, "books", id, "chapters"),
        );

        const [docSnap, chaptersSnapshot] = await Promise.all([
          docSnapPromise,
          chaptersSnapshotPromise,
        ]);

        if (!docSnap.exists()) {
          if (isMounted) setError("Book not found.");
          return;
        }

        const bookData = docSnap.data() as Omit<Book, "id">;
        if (isMounted) setBook({ id, ...bookData });

        const chaptersData = chaptersSnapshot.docs
          .map((doc) => {
            const data = doc.data() as Omit<Chapter, "id">;
            return { id: doc.id, ...data };
          })
          .sort(
            (a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0),
          );

        if (isMounted) setChapters(chaptersData);

        await updateDoc(docRef, { views: increment(1) });
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load book.");
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-br from-blush via-peach to-gold px-4 py-8 sm:py-12">
      <div className="w-full max-w-4xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center gap-3 px-6 py-3 mb-6 sm:mb-8 rounded-2xl bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm border-2 border-rosewood/20 text-rosewood font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl hover:border-rosewood/40"
          aria-label="Back to Library"
        >
          <FiArrowLeft className="text-lg sm:text-xl" />
          <span>Back to Library</span>
        </button>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.section
              key="error"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="text-center py-16 sm:py-24 text-taupe bg-white/90 rounded-3xl shadow-2xl flex flex-col items-center border border-rosewood backdrop-blur-lg px-4"
            >
              <FiAlertCircle className="text-5xl sm:text-6xl text-rosewood mb-4 animate-pulse" />
              <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4">
                Book Not Found
              </h1>
              <p className="mb-2 text-base sm:text-lg">{error}</p>
              <button
                onClick={goBack}
                className="mt-6 px-6 py-3 rounded-2xl bg-rosewood text-white hover:bg-sienna shadow-lg focus:outline-none focus:ring-2 focus:ring-gold transition-all duration-200 text-base font-medium"
              >
                Back to Library
              </button>
            </motion.section>
          ) : !book ? (
            <motion.section
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20 sm:py-32 text-taupe bg-white/90 rounded-3xl shadow-2xl border border-rosewood backdrop-blur-lg px-4"
            >
              <div className="relative">
                <span className="animate-spin mb-6 block">
                  <FiBookOpen className="text-5xl sm:text-6xl text-gold" />
                </span>
                <div className="absolute inset-0 animate-ping">
                  <FiBookOpen className="text-5xl sm:text-6xl text-gold/30" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-semibold mb-2">
                Loading book...
              </p>
              <p className="text-base sm:text-lg text-center max-w-md">
                Please wait while we fetch your story and prepare the reading
                experience.
              </p>
            </motion.section>
          ) : (
            <motion.div
              key="book"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-white rounded-3xl shadow-2xl border-4 border-gold/30 overflow-hidden"
              ref={fullscreenRef}
            >
              {/* Book Header - Like a book cover - Only show when not reading a chapter */}
              {!selectedChapter && (
                <div className="relative bg-gradient-to-r from-rosewood/90 to-sienna/90 p-4 sm:p-6 md:p-8 text-white">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-white/20 to-transparent"></div>
                  </div>

                  <div className="relative z-10 max-w-3xl">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-20 h-28 sm:w-28 sm:h-40 rounded-lg shadow-xl border-2 border-white/30 ${book.coverImage} bg-cover bg-center`}
                        ></div>
                      </div>

                      <div className="flex-1">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs sm:text-sm font-medium mb-2">
                          {book.genre}
                        </span>
                        <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
                          {book.title}
                        </h1>
                        <p className="text-base sm:text-lg text-gold font-medium mb-1">
                          by {book.author}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                            <span>📖</span>
                            <span className="text-sm">
                              {chapters.length} Chapters
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-full">
                            <span>📅</span>
                            <span className="text-sm">
                              {new Date(book.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </div>
                          {selectedChapter && (
                            <button
                              onClick={() =>
                                openChapter(
                                  selectedChapter,
                                  currentChapterIndex,
                                )
                              }
                              className="flex items-center gap-1.5 bg-gold px-4 py-1.5 rounded-full text-rosewood font-medium text-sm hover:bg-gold/80 transition-colors"
                            >
                              <span>📖</span>
                              <span>Continue Reading</span>
                            </button>
                          )}
                          <button
                            onClick={toggleTableOfContents}
                            className="flex items-center gap-1.5 bg-white/20 px-4 py-1.5 rounded-full text-white font-medium text-sm hover:bg-white/30 transition-colors"
                          >
                            <span>📚</span>
                            <span>Table of Contents</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Book Content - Only show when not reading a chapter */}
              {!selectedChapter && (
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="max-w-3xl mx-auto">
                    {/* Synopsis Section */}
                    <div className="mb-10 sm:mb-14 pb-6 border-b border-gold/20">
                      <h2 className="text-xl sm:text-2xl font-bold text-rosewood mb-4 flex items-center gap-2">
                        <span className="text-2xl">📋</span>
                        About This Book
                      </h2>
                      <div className="bg-gradient-to-br from-white to-blush/10 p-6 rounded-2xl border border-gold/20">
                        <p className="text-base sm:text-lg text-taupe/90 leading-relaxed">
                          {book.synopsis}
                        </p>
                      </div>
                    </div>

                    {/* Chapters Section */}
                    <div>
                      <div className="text-center py-8 sm:py-12">
                        <div className="text-6xl mb-4 animate-bounce">📖</div>
                        <h3 className="text-xl sm:text-2xl font-bold text-taupe mb-3">
                          Ready to Start Reading?
                        </h3>
                        <p className="text-sienna/80 mb-6 text-base sm:text-lg max-w-2xl mx-auto">
                          Click "Table of Contents" above to browse and read
                          chapters, or use the button below to explore all
                          available chapters.
                        </p>
                        {chapters.length > 0 && (
                          <button
                            onClick={toggleTableOfContents}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gold to-sienna text-white rounded-2xl hover:from-sienna hover:to-gold transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 text-lg"
                          >
                            <span className="text-2xl">📚</span>
                            <span>Browse Chapters</span>
                            <span className="text-xl">→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chapter Reading View */}
              {selectedChapter && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-3xl shadow-2xl border-4 border-gold/30 overflow-hidden"
                >
                  {/* Chapter Header */}
                  <div className="bg-gradient-to-r from-rosewood to-sienna p-6 sm:p-8 text-white relative">
                    <button
                      onClick={closeChapter}
                      className="absolute top-4 right-16 sm:top-6 sm:right-24 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 text-sm font-medium hover:scale-105 active:scale-95"
                      aria-label="Back to book overview"
                    >
                      <span>←</span>
                      <span className="hidden sm:inline">Back to Overview</span>
                      <span className="sm:hidden">Back</span>
                    </button>

                    <button
                      onClick={toggleFullscreen}
                      className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                      aria-label={
                        isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                      }
                    >
                      {isFullscreen ? (
                        <FiMinimize className="text-xl" />
                      ) : (
                        <FiMaximize className="text-xl" />
                      )}
                    </button>

                    <div className="max-w-3xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                          {currentChapterIndex + 1}
                        </div>
                        <span className="text-gold text-sm font-medium">
                          Chapter {currentChapterIndex + 1} of {chapters.length}
                        </span>
                      </div>

                      {/* Reading Progress */}
                      <div className="mb-6">
                        <div className="flex justify-between text-xs text-gold/80 mb-2">
                          <span>Book Progress</span>
                          <span>
                            {Math.round(
                              ((currentChapterIndex + 1) / chapters.length) *
                                100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="bg-gold h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                              width: `${((currentChapterIndex + 1) / chapters.length) * 100}%`,
                            }}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${((currentChapterIndex + 1) / chapters.length) * 100}%`,
                            }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <h1 className="text-2xl sm:text-4xl font-bold mb-4 leading-tight text-white">
                        {selectedChapter.title}
                      </h1>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gold/90">
                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                          <span>📅</span>
                          <span>
                            {new Date(
                              selectedChapter.createdAt?.seconds * 1000 ||
                                selectedChapter.createdAt,
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                          <span>📝</span>
                          <span>
                            {selectedChapter.content
                              ?.split(/\s+/)
                              .filter(Boolean).length || 0}{" "}
                            words
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full">
                          <span>⏱️</span>
                          <span>
                            {Math.ceil(
                              (selectedChapter.content
                                ?.split(/\s+/)
                                .filter(Boolean).length || 0) / 200,
                            )}{" "}
                            min read
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chapter Content */}
                  <div className="relative">
                    {isChapterLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center"
                      >
                        <div className="text-center">
                          <div className="animate-spin w-8 h-8 border-4 border-gold border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p className="text-taupe font-medium">
                            Loading chapter...
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <div className="p-6 sm:p-8 md:p-12">
                      <div className="max-w-4xl mx-auto">
                        <div
                          className="prose prose-xl prose-rose max-w-none text-taupe leading-relaxed prose-headings:text-rosewood prose-headings:font-bold prose-p:text-base prose-p:leading-8 prose-p:mb-6 prose-strong:text-rosewood prose-strong:font-semibold prose-em:text-sienna prose-blockquote:border-l-4 prose-blockquote:border-gold prose-blockquote:bg-gold/5 prose-blockquote:p-4 prose-blockquote:rounded-r-lg prose-blockquote:font-medium prose-li:text-base prose-li:leading-7"
                          dangerouslySetInnerHTML={{
                            __html: selectedChapter.content || "",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Chapter Navigation */}
                  <div className="bg-gradient-to-r from-rosewood/5 to-sienna/5 p-6 border-t border-gold/20">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
                      <button
                        onClick={() => navigateChapter("prev")}
                        disabled={currentChapterIndex === 0 || isChapterLoading}
                        className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-blush/20 rounded-2xl border-2 border-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-rosewood hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-sm hover:shadow-md"
                      >
                        <span className="text-lg">←</span>
                        <div className="text-left">
                          <div className="text-sm font-bold">Previous</div>
                          {currentChapterIndex > 0 && (
                            <div className="text-xs text-sienna/70 truncate max-w-32">
                              {chapters[currentChapterIndex - 1]?.title}
                            </div>
                          )}
                        </div>
                      </button>

                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-2 text-sm text-taupe/70 bg-white/50 px-4 py-2 rounded-full">
                          <span className="font-bold text-rosewood">
                            {currentChapterIndex + 1}
                          </span>
                          <span>of</span>
                          <span className="font-bold text-rosewood">
                            {chapters.length}
                          </span>
                        </div>
                        <div className="text-xs text-sienna/60">
                          {Math.round(
                            ((currentChapterIndex + 1) / chapters.length) * 100,
                          )}
                          % complete
                        </div>
                      </div>

                      <button
                        onClick={() => navigateChapter("next")}
                        disabled={
                          currentChapterIndex === chapters.length - 1 ||
                          isChapterLoading
                        }
                        className="flex items-center gap-3 px-6 py-3 bg-white hover:bg-blush/20 rounded-2xl border-2 border-gold/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-rosewood hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-sm hover:shadow-md"
                      >
                        <div className="text-right">
                          <div className="text-sm font-bold">Next</div>
                          {currentChapterIndex < chapters.length - 1 && (
                            <div className="text-xs text-sienna/70 truncate max-w-32">
                              {chapters[currentChapterIndex + 1]?.title}
                            </div>
                          )}
                        </div>
                        <span className="text-lg">→</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Book Footer */}
              <div className="bg-gradient-to-r from-rosewood/5 to-sienna/5 p-6 text-center text-taupe/70 text-sm border-t border-gold/20">
                © {new Date().getFullYear()} {book.title} by {book.author} •
                Published on MindMine
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table of Contents Bottom Bar */}
        <AnimatePresence>
          {showTableOfContents && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setShowTableOfContents(false)}
              />

              {/* Bottom Bar */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{
                  type: "spring",
                  damping: 30,
                  stiffness: 300,
                  duration: 0.4,
                }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-hidden border-t-4 border-gold/30"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-rosewood to-sienna p-4 sm:p-6 text-white relative">
                  <button
                    onClick={() => setShowTableOfContents(false)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200"
                    aria-label="Close Table of Contents"
                  >
                    <span className="text-lg">✕</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📚</span>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold">
                        Table of Contents
                      </h2>
                      <p className="text-gold/90 text-sm">
                        {chapters.length} Chapters • Click to read
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chapters List */}
                <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
                  {chapters.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">📖</div>
                      <h3 className="text-xl font-bold text-taupe mb-2">
                        No Chapters Published Yet
                      </h3>
                      <p className="text-sienna/80">
                        This book is still being written. Check back later!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {chapters.map((chapter, index) => (
                        <div
                          key={chapter.id}
                          onClick={() => openChapter(chapter, index)}
                          className={`group p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer touch-manipulation ${
                            selectedChapter?.id === chapter.id
                              ? "bg-gold/10 border-gold shadow-lg ring-2 ring-gold/20"
                              : "bg-gradient-to-r from-white to-blush/20 border-gold/20 hover:shadow-lg hover:border-gold/40 hover:bg-gradient-to-r hover:from-gold/5 hover:to-sienna/5"
                          } hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gold/50`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openChapter(chapter, index);
                            }
                          }}
                          aria-label={`Read chapter ${index + 1}: ${chapter.title}`}
                        >
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div
                              className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                                selectedChapter?.id === chapter.id
                                  ? "bg-gold shadow-gold/50"
                                  : "bg-gradient-to-br from-gold to-sienna group-hover:from-sienna group-hover:to-gold"
                              }`}
                            >
                              {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3
                                className={`text-base sm:text-lg font-bold mb-2 transition-colors line-clamp-2 ${
                                  selectedChapter?.id === chapter.id
                                    ? "text-gold"
                                    : "text-rosewood group-hover:text-sienna"
                                }`}
                              >
                                {chapter.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-sienna/80 mb-3">
                                <span className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                                  <span>📅</span>
                                  <span>
                                    {new Date(
                                      chapter.createdAt?.seconds * 1000 ||
                                        chapter.createdAt,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </span>
                                <span className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                                  <span>📝</span>
                                  <span>
                                    {chapter.content
                                      ?.split(/\s+/)
                                      .filter(Boolean).length || 0}{" "}
                                    words
                                  </span>
                                </span>
                                <span className="flex items-center gap-1 bg-white/60 px-2 py-1 rounded-full">
                                  <span>⏱️</span>
                                  <span>
                                    {Math.ceil(
                                      (chapter.content
                                        ?.split(/\s+/)
                                        .filter(Boolean).length || 0) / 200,
                                    )}{" "}
                                    min
                                  </span>
                                </span>
                              </div>

                              <p className="text-taupe/80 text-sm leading-relaxed line-clamp-3">
                                {chapter.content
                                  ? chapter.content
                                      .replace(/<[^>]*>/g, "")
                                      .substring(0, 150) +
                                    (chapter.content.replace(/<[^>]*>/g, "")
                                      .length > 150
                                      ? "..."
                                      : "")
                                  : ""}
                              </p>

                              <div
                                className={`mt-3 flex items-center text-sm font-medium transition-colors ${
                                  selectedChapter?.id === chapter.id
                                    ? "text-gold"
                                    : "text-gold group-hover:text-sienna"
                                }`}
                              >
                                <span>Tap to read chapter</span>
                                <span className="ml-2 group-hover:translate-x-1 transition-transform">
                                  →
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Custom styles for enhanced UX
const customStyles = `
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .touch-manipulation {
    touch-action: manipulation;
  }

  .prose {
    font-feature-settings: "kern" 1, "liga" 1;
    text-rendering: optimizeLegibility;
  }

  button:focus-visible,
  [role="button"]:focus-visible {
    outline: 2px solid #d97706;
    outline-offset: 2px;
  }
`;

// Inject styles on component mount
if (typeof document !== "undefined") {
  const existingStyle = document.getElementById("fetch-book-styles");
  if (!existingStyle) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "fetch-book-styles";
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);
  }
}
