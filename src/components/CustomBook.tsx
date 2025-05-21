import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSound from "use-sound";
import flipSound from "../assets/page-flip.mp3";

type Chapter = {
  id: string;
  title: string;
  content: string;
};

type Props = {
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

const CustomBook: React.FC<Props> = ({ chapters }) => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [playFlip] = useSound(flipSound, { volume: 0.5 });

  const handlePageChange = (dir: number) => {
    playFlip();
    setDirection(dir);
    setPage((prev) => {
      const newPage = prev + dir;
      if (newPage >= 0 && newPage < chapters.length) {
       
        return newPage;
      }
      return prev;
    });
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 font-serif bg-[#f3eadd]">
      <div
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
              key={chapters[page].id}
              custom={direction}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 flex flex-col justify-between"
            >
              <div className="overflow-auto max-h-[400px] md:max-h-[420px]">
                <h2 className="text-xl md:text-2xl font-bold underline text-center mb-4">
                  {chapters[page].title}
                </h2>
                <p className="text-[14px] md:text-[15px] whitespace-pre-wrap leading-relaxed">
                  {chapters[page].content}
                </p>
              </div>

              <div className="text-center text-xs md:text-sm mt-4 text-[#5a3e2b]">
                Page {page + 1} of {chapters.length}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[620px] mt-3 h-2 bg-[#e8dcc7] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#a37c4e] transition-all duration-300"
          style={{ width: `${((page + 1) / chapters.length) * 100}%` }}
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
          disabled={page === chapters.length - 1}
          className="w-full md:w-auto px-5 py-2 bg-[#7b5e45] text-white rounded-lg shadow hover:bg-[#5a3e2b] transition disabled:opacity-40"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
};

export default CustomBook;
