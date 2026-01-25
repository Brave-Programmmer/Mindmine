import React, { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Bounce, ToastContainer } from "react-toastify";
import { useAuthStore } from "../../store/authStore";
import { useNotification } from "../Notification";
import { NotificationProvider } from "../Notification";

// Enhanced cover styles with better gradients and descriptions
const coverStyles = [
  {
    label: "Sunset Horizon",
    className: "bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400",
    description: "Warm, romantic vibes",
    icon: "🌅",
  },
  {
    label: "Forest Calm",
    className: "bg-gradient-to-br from-green-300 via-green-500 to-teal-700",
    description: "Nature and adventure",
    icon: "🌲",
  },
  {
    label: "Ocean Depth",
    className: "bg-gradient-to-tr from-blue-200 via-blue-400 to-indigo-700",
    description: "Mystery and depth",
    icon: "🌊",
  },
  {
    label: "Dusk Glow",
    className: "bg-gradient-to-br from-purple-300 via-pink-400 to-rose-500",
    description: "Fantasy and magic",
    icon: "✨",
  },
  {
    label: "Sand & Sky",
    className: "bg-gradient-to-tr from-yellow-100 via-white to-blue-200",
    description: "Clean and modern",
    icon: "☁️",
  },
  {
    label: "Golden Hour",
    className: "bg-gradient-to-br from-gold via-mauve to-sienna",
    description: "Elegant and timeless",
    icon: "🌟",
  },
];

const initialBookState = {
  title: "",
  author: "",
  genre: "",
  synopsis: "",
  coverImage: coverStyles[0].className,
  totalChapters: 0,
  email: "",
};

const genreOptions = [
  "Romance",
  "Fantasy",
  "Mystery",
  "Science Fiction",
  "Historical Fiction",
  "Thriller",
  "Horror",
  "Adventure",
  "Biography",
  "Self-Help",
  "Poetry",
  "Young Adult",
  "Children",
  "Non-Fiction",
  "Dystopian",
  "Graphic Novel",
  "Classic",
  "Humor",
];

const AdminComponent = () => {
  const email = useAuthStore((state) => state.email);
  const setUser = useAuthStore((state) => state.setUser);
  const { addNotification } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newBook, setNewBook] = useState(initialBookState);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setNewBook((prev) => ({
          ...prev,
          author: user.displayName || "",
          email: user.email || "",
        }));
        // Keep global auth store in sync so other components (Create button) work
        try {
          setUser(user.email || "", user.displayName || "", true);
        } catch (e) {
          // ignore if store not available
        }
      }
    });
    return unsubscribe;
  }, []);

  // Unified input handler
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverImageChange = (className: string) => {
    setNewBook((prev) => ({ ...prev, coverImage: className }));
  };

  const validateForm = () => {
    if (!newBook.title.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter a book title",
      });
      return false;
    }
    if (!newBook.genre) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please select a genre",
      });
      return false;
    }
    if (!newBook.synopsis.trim()) {
      addNotification({
        type: "error",
        title: "Validation Error",
        message: "Please enter a synopsis",
      });
      return false;
    }
    return true;
  };

  const handleCreateBook = async () => {
    if (!email) {
      addNotification({
        type: "error",
        title: "Authentication Required",
        message: "You must be logged in to create a book.",
      });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const bookToCreate = {
        ...newBook,
        createdAt: new Date().toISOString(),
        views: 0,
        email,
      };

      await addDoc(collection(db, "books"), bookToCreate);

      setNewBook({
        title: "",
        author: "",
        genre: "",
        synopsis: "",
        coverImage: coverStyles[0].className,
        totalChapters: 0,
        email: "",
      });

      addNotification({
        type: "success",
        title: "Book Created",
        message: "🎉 Book created successfully!",
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create book:", err);
      addNotification({
        type: "error",
        title: "Creation Failed",
        message: "Failed to create book. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewBook((prev) => ({
      ...initialBookState,
      author: prev.author,
      email: prev.email,
    }));
  };


  return (
    <div>
      {/* Enhanced Create New Book Button - Centered */}
      <button
        onClick={() => {
          if (!email) {
            addNotification({
              type: "warning",
              title: "Login Required",
              message: "Please log in to create a book.",
            });
            return;
          }
          setIsModalOpen(true);
        }}
        className={`fixed left-1/2 bottom-8 transform -translate-x-1/2 px-5 sm:px-7 md:px-8 py-3 sm:py-4 md:py-4 rounded-full shadow-2xl z-50 transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-offset-2 font-bold text-sm sm:text-base md:text-lg touch-target group relative overflow-hidden flex items-center justify-center gap-2 sm:gap-3 ${
          email
            ? "bg-gradient-to-br from-gold via-sienna to-red-500 hover:from-sienna hover:via-gold hover:to-sienna text-white shadow-3xl cursor-pointer hover:shadow-4xl focus:ring-gold"
            : "bg-gray-400 cursor-not-allowed text-white opacity-60"
        }`}
        aria-label="Add New Book"
        disabled={!email}
        title={email ? "Create a new book" : "Log in to create a book"}
      >
        {/* Animated background */}
        <span className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
        
        {/* Content */}
        <span className="relative text-xl sm:text-2xl md:text-2xl transform group-hover:rotate-12 transition-transform duration-300">
          ✨
        </span>
        
        {/* Text */}
        <span className="relative font-semibold">New Book</span>
      </button>

      {/* Enhanced Modal */}
      {isModalOpen && email && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-gold/20 overflow-hidden transform transition-all duration-300 scale-100 animate-fade-in">
            {/* Modal Header - Sticky with glassmorphism */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blush via-peach to-gold p-4 sm:p-8 rounded-t-2xl sm:rounded-t-3xl border-b-2 border-gold/30 shadow-lg relative overflow-hidden">
              {/* Background animation */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute w-40 h-40 bg-white rounded-full mix-blend-overlay animate-pulse" style={{ top: '-20px', left: '-20px' }} />
              </div>

              <div className="relative flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-4xl animate-bounce" style={{ animationDelay: '0s' }}>✨</span>
                    <h2 className="text-2xl sm:text-4xl font-black text-taupe drop-shadow">
                      Create a New Book
                    </h2>
                  </div>
                  <p className="text-sienna/90 text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <span>📖</span>
                    <span>Share your story with the world</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/40 active:bg-white/60 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 flex-shrink-0 touch-target hover:scale-110 active:scale-95"
                  aria-label="Close modal"
                >
                  <span className="text-2xl sm:text-3xl text-taupe font-bold">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 bg-gradient-to-b from-white via-blush/5 to-peach/10">
              {/* Title Input */}
              <div className="space-y-3">
                <label
                  htmlFor="title"
                  className="block text-sm font-black text-taupe flex items-center gap-2"
                >
                  <span className="text-xl">📖</span>
                  <span>Book Title *</span>
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Enter your book title..."
                  value={newBook.title}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gold/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-white/95 text-taupe placeholder-taupe/40 transition-all duration-300 hover:border-gold/60 shadow-sm hover:shadow-lg font-semibold text-lg focus:bg-white"
                  required
                />
                {newBook.title && (
                  <p className="text-xs text-gold font-semibold flex items-center gap-1">
                    <span>✓</span>
                    <span>Title looks good!</span>
                  </p>
                )}
              </div>

              {/* Author Input */}
              <div className="space-y-3">
                <label
                  htmlFor="author"
                  className="block text-sm font-black text-taupe flex items-center gap-2"
                >
                  <span className="text-xl">👤</span>
                  <span>Author</span>
                </label>
                <div className="relative">
                  <input
                    id="author"
                    type="text"
                    name="author"
                    placeholder="Author name"
                    value={newBook.author}
                    disabled
                    className="w-full px-5 py-4 border-2 border-gold/20 rounded-2xl bg-gradient-to-br from-gold/10 to-peach/10 text-taupe/80 cursor-not-allowed italic font-semibold shadow-inner"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg">
                    ✓
                  </span>
                </div>
                <p className="text-xs text-sienna/70 flex items-center gap-2 font-semibold">
                  <span>ℹ️</span>
                  <span>Automatically set from your profile</span>
                </p>
              </div>

              {/* Genre Selection */}
              <div className="space-y-3">
                <label
                  htmlFor="genre"
                  className="block text-sm font-black text-taupe flex items-center gap-2"
                >
                  <span className="text-xl">🏷️</span>
                  <span>Genre *</span>
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={newBook.genre}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gold/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-white/95 text-taupe transition-all duration-300 hover:border-gold/60 shadow-sm hover:shadow-lg appearance-none cursor-pointer font-bold text-base focus:bg-white"
                  required
                >
                  <option value="">📚 Select a genre...</option>
                  {[
                    "Romance",
                    "Fantasy",
                    "Mystery",
                    "Science Fiction",
                    "Historical Fiction",
                    "Thriller",
                    "Horror",
                    "Adventure",
                    "Biography",
                    "Self-Help",
                    "Poetry",
                    "Young Adult",
                    "Children",
                    "Non-Fiction",
                    "Dystopian",
                    "Graphic Novel",
                    "Classic",
                    "Humor",
                  ].map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Synopsis */}
              <div className="space-y-3">
                <label
                  htmlFor="synopsis"
                  className="block text-sm font-black text-taupe flex items-center gap-2"
                >
                  <span className="text-xl">📝</span>
                  <span>Synopsis *</span>
                </label>
                <textarea
                  id="synopsis"
                  name="synopsis"
                  placeholder="Write a brief description of your book..."
                  value={newBook.synopsis}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={500}
                  className="w-full px-5 py-4 border-2 border-gold/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold bg-white/95 text-taupe placeholder-taupe/40 resize-none transition-all duration-300 hover:border-gold/60 shadow-sm hover:shadow-lg font-medium text-base focus:bg-white"
                  required
                />
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-sienna/70 font-bold flex items-center gap-2">
                    <span>📊</span>
                    <span>{newBook.synopsis.length}/500</span>
                  </span>
                  {newBook.synopsis.length > 0 && (
                    <div className="w-24 h-2 bg-gold/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-gold to-sienna transition-all duration-300 rounded-full"
                        style={{ width: `${(newBook.synopsis.length / 500) * 100}%` }}
                      />
                    </div>
                  )}
                  {newBook.synopsis.length > 450 && (
                    <span className="text-xs text-orange-600 font-bold animate-pulse">⚠️ Getting close</span>
                  )}
                </div>
              </div>

              {/* Enhanced Cover Styles */}
              <div className="space-y-4">
                <label className="block text-sm font-black text-taupe flex items-center gap-2">
                  <span className="text-xl">🎨</span>
                  <span>Choose Cover Style</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {coverStyles.map((style, index) => (
                    <div
                      key={style.label}
                      onClick={() => handleCoverImageChange(style.className)}
                      className={`relative cursor-pointer transform transition-all duration-300 rounded-2xl overflow-hidden group shadow-md hover:shadow-xl ${
                        newBook.coverImage === style.className
                          ? "scale-105 ring-4 ring-gold shadow-2xl"
                          : "hover:scale-105 hover:ring-2 hover:ring-gold/50"
                      }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleCoverImageChange(style.className);
                        }
                      }}
                      aria-label={`Select ${style.label} cover style`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="aspect-[2/3] relative w-full">
                        {/* Book spine */}
                        <div className="absolute left-0 top-0 h-full w-2 bg-sienna/80 shadow-inner z-10" />
                        {/* Cover */}
                        <div
                          className={`h-full w-full pl-2 ${style.className} shadow-md border border-gold/20 overflow-hidden flex flex-col justify-end group-hover:brightness-110 transition-all duration-300`}
                        >
                          <div className="bg-white/95 backdrop-blur-sm p-3 shadow-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{style.icon}</span>
                              <p className="font-bold text-taupe text-sm line-clamp-1">
                                {style.label}
                              </p>
                            </div>
                            <p className="text-xs text-sienna/80 line-clamp-2">
                              {style.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      {newBook.coverImage === style.className && (
                        <div className="absolute top-2 right-2 bg-gold text-taupe w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm shadow-lg animate-pulse">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 px-4 sm:px-8 py-4 sm:py-6 md:py-8 border-t-2 border-gold/20 bg-gradient-to-r from-white via-blush/30 to-peach/20 rounded-b-2xl sm:rounded-b-3xl shadow-inner">
              <div className="flex gap-2 sm:gap-3 md:gap-4 flex-col sm:flex-row">
                <button
                  onClick={resetForm}
                  className="px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-white border-2 border-gold/40 text-taupe rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:bg-blush hover:border-gold transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold active:scale-95 text-xs sm:text-sm md:text-base touch-target transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  🔄 Reset
                </button>
                <button
                  onClick={handleCreateBook}
                  disabled={isLoading}
                  className="flex-1 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-gradient-to-br from-gold via-sienna to-red-500 text-white rounded-lg sm:rounded-xl md:rounded-2xl font-bold hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 text-xs sm:text-sm md:text-base touch-target flex items-center justify-center gap-2 shadow-lg hover:from-sienna hover:via-gold hover:to-sienna transition-all duration-300 transform hover:scale-105 group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/20 rounded-lg transform scale-0 group-hover:scale-100 transition-transform duration-300 origin-center" />
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 sm:border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">✨</span>
                      <span>Create Book</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

// Export the wrapped component
export const Admin = () => {
  return (
    <NotificationProvider>
      <AdminComponent />
    </NotificationProvider>
  );
};

export default Admin;
