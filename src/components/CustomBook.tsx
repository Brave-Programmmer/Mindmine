import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useSound from "use-sound";
import flipSound from "/assets/page-flip.mp3";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiList, 
  FiVolume2, 
  FiVolumeX, 
  FiPause, 
  FiPlay, 
  FiX, 
  FiMaximize2, 
  FiBookOpen,
  FiHome,
  FiSettings,
  FiBookmark,
  FiShare2,
  FiMoon,
  FiSun
} from "react-icons/fi";

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

const CustomBook: React.FC<Props> = ({ chapters, book }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [showCover, setShowCover] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [playFlip] = useSound(flipSound, { volume: 0.3 });
  
  // Speech synthesis
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speechRate, setSpeechRate] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const bookRef = useRef<HTMLDivElement>(null);

  // Sort chapters by creation date
  const sortedChapters = useMemo(() => {
    return [...chapters].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [chapters]);

  // Load bookmark
  useEffect(() => {
    const savedPage = localStorage.getItem(`bookmark-${book.id}`);
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
  }, [book.id]);

  // Save bookmark
  useEffect(() => {
    localStorage.setItem(`bookmark-${book.id}`, currentPage.toString());
  }, [currentPage, book.id]);

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        const englishVoice = availableVoices.find(voice => voice.lang.startsWith('en-'));
        setSelectedVoice(englishVoice || availableVoices[0]);
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [selectedVoice]);

  // Speech functions
  const startReading = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis not supported in your browser.");
      return;
    }
    
    const text = sortedChapters[currentPage].content;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = speechRate;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [currentPage, sortedChapters, selectedVoice, speechRate]);

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

  const stopReading = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  // Navigation functions
  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < sortedChapters.length) {
      stopReading();
      playFlip();
      setCurrentPage(page);
    }
  }, [sortedChapters.length, stopReading, playFlip]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    console.log('Toggle fullscreen clicked, current state:', !!document.fullscreenElement);
    if (!document.fullscreenElement) {
      console.log('Attempting to enter fullscreen...');
      bookRef.current?.requestFullscreen().catch((err) => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      console.log('Attempting to exit fullscreen...');
      document.exitFullscreen().catch((err) => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "Escape") {
        if (showChapterList) setShowChapterList(false);
        if (showSettings) setShowSettings(false);
        if (isFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(console.error);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [prevPage, nextPage, showChapterList, showSettings, isFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopReading();
  }, [stopReading]);

  // Markdown to HTML conversion
  // Enhanced: Render Editor.js JSON blocks (including images)
  const renderContent = useCallback((content: string) => {
    if (!content) return "";
    let data;
    try {
      data = JSON.parse(content);
    } catch {
      // fallback to old markdown logic
      return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
        .replace(/\n/g, '<br/>');
    }
    if (!data || !Array.isArray(data.blocks)) return "";
    return data.blocks.map((block, idx) => {
      switch (block.type) {
        case "paragraph":
          return `<p>${block.data.text || ""}</p>`;
        case "header":
          return `<h${block.data.level || 2}>${block.data.text || ""}</h${block.data.level || 2}>`;
        case "image":
          if (block.data.file && block.data.file.url) {
            const style = [
              block.data.stretched ? "width:100%" : "",
              block.data.withBorder ? "border:1px solid #e2e8f0;border-radius:8px;" : "",
              block.data.withBackground ? "background:#f7fafc;padding:1rem;" : ""
            ].join("");
            return `<div style="text-align:center;margin:1.5em 0;"><img src="${block.data.file.url}" alt="${block.data.caption || ''}" style="max-width:100%;height:auto;${style}" />${block.data.caption ? `<div style='font-size:0.95em;color:#888;margin-top:0.5em;'>${block.data.caption}</div>` : ""}</div>`;
          }
          return "";
        case "list":
          if (block.data.style === "ordered") {
            return `<ol>${(block.data.items || []).map((item) => `<li>${item}</li>`).join("")}</ol>`;
          } else {
            return `<ul>${(block.data.items || []).map((item) => `<li>${item}</li>`).join("")}</ul>`;
          }
        case "quote":
          return `<blockquote style='border-left:4px solid #cbd5e1;padding-left:1em;color:#555;font-style:italic;'>${block.data.text}${block.data.caption ? `<footer style='margin-top:0.5em;font-size:0.9em;color:#888;'>— ${block.data.caption}</footer>` : ""}</blockquote>`;
        case "code":
          return `<pre style='background:#f3f4f6;padding:1em;border-radius:6px;overflow-x:auto;'><code>${block.data.code}</code></pre>`;
        case "delimiter":
          return `<hr style='margin:2em 0;'/>`;
        case "table":
          return `<table style='width:100%;border-collapse:collapse;margin:1em 0;'>${(block.data.content || []).map((row) => `<tr>${row.map((cell) => `<td style='border:1px solid #e2e8f0;padding:0.5em;'>${cell}</td>`).join("")}</tr>`).join("")}</table>`;
        default:
          return "";
      }
    }).join("");
  }, []);

  // Cover page
  if (showCover) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
          : 'bg-gradient-to-br from-blush/30 to-peach/30'
      }`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={() => setShowCover(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur rounded-xl hover:bg-white transition-all text-taupe font-semibold"
              >
                <FiHome size={20} />
                <span>Start Reading</span>
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log('Cover page dark mode toggle clicked, current state:', darkMode);
                    setDarkMode(!darkMode);
                  }}
                  className="p-2 rounded-lg bg-white/80 backdrop-blur hover:bg-white transition-all text-taupe"
                >
                  {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
                </button>
                <button
                  onClick={() => {
                    console.log('Cover page fullscreen button clicked, current state:', isFullscreen);
                    toggleFullscreen();
                  }}
                  className={`p-2 rounded-lg backdrop-blur transition-all text-taupe ${
                    isFullscreen 
                      ? 'bg-gold/80 hover:bg-gold' 
                      : 'bg-white/80 hover:bg-white'
                  }`}
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <FiX size={20} /> : <FiMaximize2 size={20} />}
                </button>
              </div>
            </div>

            {/* Book Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`backdrop-blur rounded-3xl shadow-2xl overflow-hidden border ${
                darkMode 
                  ? 'bg-gray-800/90 border-gray-600' 
                  : 'bg-white/90 border-gold/20'
              }`}
            >
              <div className="p-8 md:p-12">
                <div className="text-center">
                  <div className="w-24 h-32 mx-auto mb-6 bg-gradient-to-br from-gold via-sienna to-taupe rounded-lg shadow-lg flex items-center justify-center">
                    <FiBookOpen size={40} className="text-white" />
                  </div>
                  
                  <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
                    darkMode ? 'text-gray-200' : 'text-taupe'
                  }`}>
                    {book.title}
                  </h1>
                  
                  <p className={`text-xl mb-6 ${
                    darkMode ? 'text-gray-400' : 'text-sienna'
                  }`}>
                    by {book.author}
                  </p>
                  
                  {book.synopsis && (
                    <p className={`max-w-2xl mx-auto mb-8 leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-taupe/80'
                    }`}>
                      {book.synopsis}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold">{sortedChapters.length}</div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-sienna'
                      }`}>Chapters</div>
                    </div>
                    {book.genre && (
                      <div className="text-center">
                        <div className={`text-sm font-medium ${
                          darkMode ? 'text-gray-400' : 'text-sienna'
                        }`}>Genre</div>
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-taupe'
                        }`}>{book.genre}</div>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowCover(false)}
                    className="px-8 py-4 bg-gradient-to-r from-gold to-sienna text-taupe rounded-xl font-semibold hover:from-sienna hover:to-gold transition-all shadow-lg hover:shadow-xl"
                  >
                    Begin Reading
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Main reading interface
  return (
    <div 
      ref={bookRef}
      className={`min-h-screen ${
        isFullscreen ? 'p-4' : ''
      } ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
          : 'bg-gradient-to-br from-blush/20 to-peach/20'
      }`}
      style={{
        ...(isFullscreen && {
          backgroundColor: darkMode ? '#1f2937' : '#F9E4E0',
          backgroundImage: darkMode 
            ? 'linear-gradient(to bottom right, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.8))'
            : 'linear-gradient(to bottom right, rgba(249, 228, 224, 0.2), rgba(252, 238, 234, 0.2))'
        })
      }}
    >
      {/* Fullscreen Indicator */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 z-60 bg-gold/90 text-taupe px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
          Fullscreen Mode
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className={`sticky top-0 z-50 backdrop-blur border-b ${
        darkMode 
          ? 'bg-gray-800/95 border-gray-600' 
          : 'bg-white/95 border-gold/20'
      } ${isFullscreen ? 'bg-opacity-98' : 'bg-opacity-95'}`}>
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCover(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-200' 
                    : 'hover:bg-blush/50 text-taupe'
                }`}
              >
                <FiHome size={18} />
                <span className="hidden sm:inline">Cover</span>
              </button>
              
              <div className="hidden md:block">
                <h1 className={`font-semibold text-lg ${
                  darkMode ? 'text-gray-200' : 'text-taupe'
                }`}>{book.title}</h1>
                <p className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-sienna'
                }`}>by {book.author}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowChapterList(true)}
                className={`p-2 rounded-lg transition-all ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-200' 
                    : 'hover:bg-blush/50 text-taupe'
                }`}
                title="Chapter List"
              >
                <FiList size={20} />
              </button>
              
              <button
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-lg transition-all ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-200' 
                    : 'hover:bg-blush/50 text-taupe'
                }`}
                title="Settings"
              >
                <FiSettings size={20} />
              </button>
              
              <button
                onClick={() => {
                  console.log('Dark mode toggle clicked, current state:', darkMode);
                  setDarkMode(!darkMode);
                }}
                className={`p-2 rounded-lg transition-all ${
                  darkMode 
                    ? 'hover:bg-gray-700 text-gray-200' 
                    : 'hover:bg-blush/50 text-taupe'
                }`}
                title="Toggle Dark Mode"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>
              
              <button
                onClick={() => {
                  console.log('Fullscreen button clicked, current state:', isFullscreen);
                  toggleFullscreen();
                }}
                className={`p-2 rounded-lg transition-all ${
                  isFullscreen 
                    ? darkMode 
                      ? 'bg-gold/30 hover:bg-gold/50 text-gray-200' 
                      : 'bg-gold/50 hover:bg-gold/70 text-taupe'
                    : darkMode 
                      ? 'hover:bg-gray-700 text-gray-200' 
                      : 'hover:bg-blush/50 text-taupe'
                }`}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <FiX size={20} /> : <FiMaximize2 size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${
              darkMode ? 'text-gray-200' : 'text-taupe'
            }`}>
              Chapter {currentPage + 1} of {sortedChapters.length}
            </span>
            <span className={`text-sm ${
              darkMode ? 'text-gray-400' : 'text-sienna'
            }`}>
              {Math.round(((currentPage + 1) / sortedChapters.length) * 100)}%
            </span>
          </div>
          <div className={`w-full rounded-full h-2 ${
            darkMode ? 'bg-gray-700' : 'bg-gold/30'
          }`}>
            <div 
              className="bg-gradient-to-r from-gold to-sienna h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentPage + 1) / sortedChapters.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Chapter Content */}
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`backdrop-blur rounded-2xl shadow-lg p-8 mb-8 border ${
            darkMode 
              ? 'bg-gray-800/95 border-gray-600' 
              : 'bg-white/95 border-gold/20'
          }`}
        >
          <h2 className={`text-2xl md:text-3xl font-bold mb-6 text-center ${
            darkMode ? 'text-gray-200' : 'text-taupe'
          }`}>
            {sortedChapters[currentPage].title}
          </h2>
          
          <div 
            className={`prose prose-lg max-w-none leading-relaxed ${
              darkMode ? 'prose-invert text-gray-200' : 'text-taupe'
            }`}
            dangerouslySetInnerHTML={{ 
              __html: renderContent(sortedChapters[currentPage].content) 
            }}
          />
        </motion.div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-taupe font-medium"
          >
            <FiChevronLeft size={20} />
            <span>Previous</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowChapterList(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blush/50 rounded-lg hover:bg-blush/70 transition-all text-taupe font-medium"
            >
              <FiList size={18} />
              <span>Chapters</span>
            </button>
            
            <button
              onClick={() => {/* TODO: Implement bookmark */}}
              className="flex items-center gap-2 px-4 py-2 bg-blush/50 rounded-lg hover:bg-blush/70 transition-all text-taupe font-medium"
            >
              <FiBookmark size={18} />
              <span>Bookmark</span>
            </button>
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage === sortedChapters.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-sienna text-taupe rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <span>Next</span>
            <FiChevronRight size={20} />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6 border border-gold/20">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {!isSpeaking && !isPaused ? (
              <button
                onClick={startReading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gold to-sienna text-taupe rounded-xl hover:from-sienna hover:to-gold transition-all font-semibold shadow-md hover:shadow-lg"
              >
                <FiVolume2 size={20} />
                <span>Read Aloud</span>
              </button>
            ) : (
              <>
                <button
                  onClick={isPaused ? resumeReading : pauseReading}
                  className="flex items-center gap-2 px-6 py-3 bg-mauve text-taupe rounded-xl hover:bg-gold transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  {isPaused ? <FiPlay size={20} /> : <FiPause size={20} />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                
                <button
                  onClick={stopReading}
                  className="flex items-center gap-2 px-6 py-3 bg-rosewood text-white rounded-xl hover:bg-sienna transition-all font-semibold shadow-md hover:shadow-lg"
                >
                  <FiVolumeX size={20} />
                  <span>Stop</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chapter List Modal */}
      <AnimatePresence>
        {showChapterList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowChapterList(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden border border-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-taupe">Chapters</h3>
                <button
                  onClick={() => setShowChapterList(false)}
                  className="p-2 rounded-lg hover:bg-blush/50 transition-all text-taupe"
                  title="Close Chapter List"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {sortedChapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => {
                      goToPage(index);
                      setShowChapterList(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      index === currentPage
                        ? 'bg-gold text-taupe font-semibold'
                        : 'hover:bg-blush/50 text-taupe'
                    }`}
                  >
                    <div className="font-medium">Chapter {index + 1}</div>
                    <div className="text-sm text-sienna truncate">
                      {chapter.title}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gold/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-taupe">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 rounded-lg hover:bg-blush/50 transition-all text-taupe"
                  title="Close Settings"
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-taupe">Voice</label>
                  <select
                    value={selectedVoice?.voiceURI || ""}
                    onChange={(e) => {
                      const voice = voices.find(v => v.voiceURI === e.target.value);
                      setSelectedVoice(voice || null);
                    }}
                    className="w-full p-3 border border-gold/30 rounded-lg bg-white text-taupe focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    {voices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-taupe">
                    Speech Rate: {speechRate}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-gold"
                    title="Adjust speech rate"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-taupe">Dark Mode</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      darkMode ? 'bg-gold' : 'bg-mauve'
                    }`}
                    title="Toggle Dark Mode"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomBook;