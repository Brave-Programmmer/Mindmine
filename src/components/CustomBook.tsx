import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSound from "use-sound";
import flipSound from "/assets/page-flip.mp3"; // Ensure this path is correct for your project

type Chapter = {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date;
};

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  genre?: string;
  synopsis?: string;
  createdAt?: string;
  totalChapters?: number;
  views?: number;
  email?: string;
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
  const [closing, setClosing] = useState(false); // Consider if this state is still needed with the current exit animation
  const [playFlip] = useSound(flipSound, { volume: 0.5 });
  const bookRef = useRef<HTMLDivElement>(null);

  // Speech synthesis state
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1); // Speed
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // For highlighting text
  const [highlightedText, setHighlightedText] = useState<string[]>([]);

  // Sort chapters by createdAt ascending - memoized
  const sortedChapters = useMemo(() => {
    return [...chapters].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [chapters]);

  // Load bookmark on mount
  useEffect(() => {
    const savedPage = localStorage.getItem(`bookmark-${book.id}`);
    if (savedPage) {
      setPage(parseInt(savedPage, 10));
    }
  }, [book.id]);

  // Save bookmark on page change (debounced for potential future optimization, though not strictly needed here)
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem(`bookmark-${book.id}`, page.toString());
    }, 300); // Debounce by 300ms

    resetHighlight();
    return () => {
      clearTimeout(handler);
    };
  }, [page, book.id]);

  // Load voices once voiceschanged event fires (some browsers load voices async)
  useEffect(() => {
    const loadVoices = () => {
      const synthVoices = window.speechSynthesis.getVoices();
      setVoices(synthVoices);
      if (synthVoices.length > 0 && !selectedVoice) {
        // Try to select a default English voice if available
        const englishVoice = synthVoices.find(voice => voice.lang.startsWith('en-'));
        setSelectedVoice(englishVoice || synthVoices[0]);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Cleanup event listener
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]); // Dependency on selectedVoice ensures re-evaluation if selectedVoice changes from null

  // Stop reading function - memoized
  const stopReading = useCallback(() => {
    if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentWordIndex(null);
    setHighlightedText([]);
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current.onboundary = null;
    }
  }, []);

  // Reset highlight on page change or stop
  const resetHighlight = useCallback(() => {
    setCurrentWordIndex(null);
  }, []);

  // Play flip sound and change page - memoized
  const handlePageChange = useCallback((dir: number) => {
    stopReading(); // Stop reading before changing page
    playFlip();
    setDirection(dir);
    setPage((prev) => {
      const newPage = prev + dir;
      if (newPage >= 0 && newPage < sortedChapters.length) {
        return newPage;
      }
      return prev;
    });
  }, [playFlip, sortedChapters.length, stopReading]);

  // Close book animation - memoized
  const handleCloseBook = useCallback(() => {
    stopReading(); // Stop reading before closing
    playFlip();
    setClosing(true); // Retain closing state if needed for external animations
    setTimeout(() => {
      setShowCover(true);
      setClosing(false);
    }, 800);
  }, [playFlip, stopReading]);

  // Fullscreen toggle - memoized
  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      bookRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Start voice reading with word highlighting - memoized
  const startReading = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      alert("Sorry, your browser does not support speech synthesis.");
      return;
    }
    if (isSpeaking) return; // Already speaking

    const text = sortedChapters[page].content;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice; // selectedVoice can be null, handled by SpeechSynthesis API
    utterance.rate = rate;
    utterance.pitch = 1;

    const words = text.split(/\s+/).filter(word => word.length > 0); // Filter out empty strings from split
    setHighlightedText(words);
    setCurrentWordIndex(0);

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        // A more robust way to find the word index:
        // Find the word that starts at or after event.charIndex
        let charAccum = 0;
        let wordIndex = 0;
        for (let i = 0; i < words.length; i++) {
          // Include space after the word for boundary calculation
          const wordWithSpaceLength = words[i].length + (i < words.length - 1 ? 1 : 0);
          if (event.charIndex >= charAccum && event.charIndex < charAccum + wordWithSpaceLength) {
            wordIndex = i;
            break;
          }
          charAccum += wordWithSpaceLength;
        }
        setCurrentWordIndex(wordIndex);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentWordIndex(null);
      setHighlightedText([]);
      utteranceRef.current = null; // Clear ref on end
    };

    utterance.onerror = (e) => {
      console.error("Speech synthesis error:", e);
      setIsSpeaking(false);
      setCurrentWordIndex(null);
      setHighlightedText([]);
      utteranceRef.current = null; // Clear ref on error
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [page, sortedChapters, selectedVoice, rate, isSpeaking]);

  const pauseReading = useCallback(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsSpeaking(false);
    }
  }, []);

  const resumeReading = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
    }
  }, []);

  // Stop reading if page changes or component unmounts
  useEffect(() => {
    return () => {
      stopReading();
    };
  }, [stopReading]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePageChange(-1);
      } else if (event.key === "ArrowRight") {
        handlePageChange(1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePageChange]);

  // Render text with highlight on current word
  const renderHighlightedText = useCallback(() => {
    if (!highlightedText.length || currentWordIndex === null) {
      return <p className="whitespace-pre-wrap">{sortedChapters[page].content}</p>;
    }
    return (
      <p className="whitespace-pre-wrap text-justify leading-relaxed">
        {highlightedText.map((word, i) => (
          <span
            key={i}
            className={`inline-block ${i === currentWordIndex ? "bg-yellow-300 rounded px-1" : ""
              }`}
          >
            {word + " "}
          </span>
        ))}
      </p>
    );
  }, [highlightedText, currentWordIndex, page, sortedChapters]);

  // Show book cover screen
  if (showCover) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3eadd] px-6 py-12">
        <head>
          <title>Reading: {book.title}</title>
        </head>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-[#d5c5aa] border-8 border-[#c9b28a] w-72 h-96 md:w-96 md:h-[520px] rounded-2xl shadow-2xl flex flex-col justify-center items-center text-center p-6 select-none cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => {
            playFlip();
            setShowCover(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              playFlip();
              setShowCover(false);
            }
          }}
          aria-label={`Open the book titled ${book.title}`}
        >
          <h1 className="text-3xl font-extrabold mb-2 text-[#5a3e2b]">📘 {book.title}</h1>
          <h4 className="font-semibold mb-3 text-[#4a3520]">By {book.author}</h4>
          <p className="text-sm text-[#5a3e2b]">Tap or press Enter to open and start reading</p>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent the div's onClick from firing
              playFlip();
              setShowCover(false);
            }}
            className="mt-6 px-6 py-3 bg-[#7b5e45] text-white rounded-lg hover:bg-[#5a3e2b] transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-[#5a3e2b]"
          >
            Open Book
          </button>
        </motion.div>
      </div>
    );
  }

  // Main reading view
  return (
    <div
      ref={bookRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 py-12 font-serif bg-[#f3eadd]"
    >
      <motion.div
        initial={{ opacity: closing ? 1 : 0, scale: closing ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl border-8 border-[#c9b28a] shadow-2xl overflow-hidden flex flex-col md:flex-row bg-[#d5c5aa] w-full max-w-4xl h-[520px]"
      >
        {/* Book Binding */}
        <div className="w-6 bg-[#4b2e2e] shadow-inner hidden md:block" />

        {/* Page Content */}
        <div className="flex-1 relative aged-paper text-[#3e2d20] fold-corner p-6 md:p-10 flex flex-col overflow-hidden">
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
              <div className="overflow-auto max-h-[410px] md:max-h-[430px] pr-2">
                <h2 className="text-2xl md:text-3xl font-bold underline text-center mb-6 tracking-wide">
                  {sortedChapters[page].title}
                </h2>
                {renderHighlightedText()}
              </div>

              <div className="text-center text-xs md:text-sm mt-6 text-[#5a3e2b] font-medium">
                Page {page + 1} of {sortedChapters.length}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Progress bar */}
      <div className="w-full max-w-4xl mt-6 h-3 bg-[#e8dcc7] rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-[#a37c4e] transition-all duration-500 ease-in-out"
          style={{ width: `${((page + 1) / sortedChapters.length) * 100}%` }}
          aria-label={`Reading progress: ${Math.round(((page + 1) / sortedChapters.length) * 100)}%`}
          role="progressbar"
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap justify-center gap-4 mt-8 w-full max-w-4xl">
        <button
          onClick={() => handlePageChange(-1)}
          disabled={page === 0}
          className="flex-1 min-w-[120px] px-5 py-3 bg-[#7b5e45] text-white rounded-lg shadow hover:bg-[#5a3e2b] transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#5a3e2b]"
          aria-label="Previous page"
        >
          ⬅ Prev
        </button>

        <button
          onClick={() => handlePageChange(1)}
          disabled={page === sortedChapters.length - 1}
          className="flex-1 min-w-[120px] px-5 py-3 bg-[#7b5e45] text-white rounded-lg shadow hover:bg-[#5a3e2b] transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#5a3e2b]"
          aria-label="Next page"
        >
          Next ➡
        </button>

        {/* Voice Controls */}
        {!isSpeaking && !isPaused ? (
          <button
            onClick={startReading}
            className="flex-1 min-w-[120px] px-5 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-700"
            aria-label="Start voice reading"
          >
            🔊 Read Aloud
          </button>
        ) : (
          <>
            <button
              onClick={pauseReading}
              disabled={isPaused}
              className="flex-1 min-w-[120px] px-5 py-3 bg-yellow-500 text-white rounded-lg shadow hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-yellow-600"
              aria-label="Pause voice reading"
            >
              ⏸ Pause
            </button>
            <button
              onClick={resumeReading}
              disabled={isSpeaking}
              className="flex-1 min-w-[120px] px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-700"
              aria-label="Resume voice reading"
            >
              ▶ Resume
            </button>
            <button
              onClick={stopReading}
              className="flex-1 min-w-[120px] px-5 py-3 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-600"
              aria-label="Stop voice reading"
            >
              ⏹ Stop
            </button>
          </>
        )}

        <button
          onClick={handleCloseBook}
          className="flex-1 min-w-[120px] px-5 py-3 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-700"
          aria-label="Close book"
        >
          ✖ Close Book
        </button>

        <button
          onClick={toggleFullScreen}
          className="flex-1 min-w-[120px] px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-700"
          aria-label="Toggle fullscreen"
        >
          🖵 Fullscreen
        </button>
      </div>

      {/* Voice Settings: Voice Selector & Rate Slider */}
      <div className="mt-8 w-full max-w-4xl flex flex-col md:flex-row items-center gap-4 px-4 md:px-0">
        <label htmlFor="voiceSelect" className="flex-1 text-[#5a3e2b] font-semibold flex items-center">
          Voice:
          <select
            id="voiceSelect"
            className="ml-3 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5a3e2b] flex-grow"
            value={selectedVoice?.voiceURI || ""}
            onChange={(e) => {
              const voice = voices.find((v) => v.voiceURI === e.target.value);
              if (voice) setSelectedVoice(voice);
            }}
            disabled={isSpeaking}
            aria-label="Select voice"
          >
            {voices.length === 0 && <option>Loading voices...</option>}
            {voices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="rateRange" className="flex-1 text-[#5a3e2b] font-semibold flex items-center">
          Speed:
          <input
            id="rateRange"
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={rate}
            disabled={isSpeaking}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="mx-3 w-full accent-[#5a3e2b]"
            aria-label="Adjust speech speed"
          />
          <span className="min-w-[30px]">{rate.toFixed(1)}x</span>
        </label>
      </div>
    </div>
  );
};

export default CustomBook;