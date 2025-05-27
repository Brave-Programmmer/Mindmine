import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSound from "use-sound";
import { TypeAnimation } from "react-type-animation";
import flipSound from "/assets/page-flip.mp3";

type Chapter = {
  id: string;
  title: string;
  content: string;
  createdAt: any; // Ensure this is a Date or timestamp
};

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  synopsis: string;
  createdAt: string;
  totalChapters: number;
  views?: number;
  email: string;
}

type Props = {
  book: Book;
  chapters: Chapter[];
};

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    rotateY: direction < 0 ? -90 : 90,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeIn" },
  }),
};

const CustomBook: React.FC<Props> = ({ chapters, book }) => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const [closing, setClosing] = useState(false);
  const [playFlip] = useSound(flipSound, { volume: 0.5 });
  const bookRef = useRef<HTMLDivElement>(null);

  // Sort chapters by createdAt ascending
  const sortedChapters = [...chapters].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Load bookmark on mount
  useEffect(() => {
    const savedPage = localStorage.getItem(`bookmark-${book.id}`);
    if (savedPage) setPage(parseInt(savedPage));
  }, [book.id]);

  // Save bookmark on page change
  useEffect(() => {
    localStorage.setItem(`bookmark-${book.id}`, page.toString());
  }, [page, book.id]);

  const handlePageChange = (dir: number) => {
    playFlip();
    setDirection(dir);
    setPage((prev) => {
      const newPage = prev + dir;
      if (newPage >= 0 && newPage < sortedChapters.length) {
        return newPage;
      }
      return prev;
    });
  };

  // Handle exit book with animation
  const handleCloseBook = () => {
    playFlip();
    setClosing(true);
    setTimeout(() => {
      setShowCover(true);
      setClosing(false);
    }, 800);
  };

  // Fullscreen toggle
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      bookRef.current?.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Show cover
  if (showCover) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3eadd] px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-[#d5c5aa] border-[10px] border-[#c9b28a] w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-xl shadow-2xl flex flex-col justify-center items-center text-center p-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            📘 {book?.title}
          </h1>
          <h4 className="font-bold mb-2">By - {book?.author}</h4>
          <p className="text-sm text-[#5a3e2b]">
            Tap to open and start reading
          </p>
          <button
            onClick={() => {
              playFlip();
              setShowCover(false);
            }}
            className="mt-6 px-4 py-2 bg-[#7b5e45] text-white rounded-lg hover:bg-[#5a3e2b] transition"
          >
            Open Book
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      ref={bookRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 font-serif bg-[#f3eadd]"
    >
      <motion.div
        initial={{ opacity: closing ? 1 : 0, scale: closing ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6 }}
        className="
          relative
          rounded-xl
          border-[10px] border-[#c9b28a]
          shadow-2xl
          overflow-hidden
          flex
          bg-[#d5c5aa]
          w-full max-w-[620px] h-[480px]
          md:w-[620px] md:h-[480px]
        "
      >
        {/* Binding */}
        <div className="w-[5%] bg-[#4b2e2e] shadow-inner z-10 hidden md:block" />

        {/* Page */}
        <div className="flex-1 relative aged-paper text-[#3e2d20] fold-corner p-4 md:p-10">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <motion.div
              key={sortedChapters[page].id}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col justify-between"
            >
              <div className="overflow-auto max-h-[400px] md:max-h-[420px]">
                <h2 className="text-xl md:text-2xl font-bold underline text-center mb-4">
                  {sortedChapters[page].title}
                </h2>
                <TypeAnimation
                  sequence={[sortedChapters[page].content]}
                  wrapper="p"
                  speed={50}
                  style={{
                    fontSize: "15px",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.5",
                  }}
                  cursor={true}
                />
              </div>

              <div className="text-center text-xs md:text-sm mt-4 text-[#5a3e2b]">
                Page {page + 1} of {sortedChapters.length}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-[620px] mt-3 h-2 bg-[#e8dcc7] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#a37c4e] transition-all duration-300"
          style={{ width: `${((page + 1) / sortedChapters.length) * 100}%` }}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 mt-6 w-full max-w-[620px] md:flex-row md:justify-center md:gap-6">
        <button
          onClick={() => handlePageChange(-1)}
          disabled={page === 0}
          className="w-full md:w-auto px-5 py-2 bg-[#7b5e45] text-white rounded-lg shadow hover:bg-[#5a3e2b] transition disabled:opacity-40"
        >
          ⬅ Prev
        </button>
        <button
          onClick={() => handlePageChange(1)}
          disabled={page === sortedChapters.length - 1}
          className="w-full md:w-auto px-5 py-2 bg-[#7b5e45] text-white rounded-lg shadow hover:bg-[#5a3e2b] transition disabled:opacity-40"
        >
          Next ➡
        </button>
        <button
          onClick={handleCloseBook}
          className="w-full md:w-auto px-5 py-2 bg-red-400 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          ✖ Close Book
        </button>
        <button
          onClick={toggleFullScreen}
          className="w-full md:w-auto px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          🖵 Fullscreen
        </button>
      </div>
    </div>
  );
};

export default CustomBook;
