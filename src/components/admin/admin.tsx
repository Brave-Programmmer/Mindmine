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

  function handleGenreChange(event: ChangeEvent<HTMLSelectElement>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div>
      {/* Enhanced Create New Book Button */}
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
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-xl z-50 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold ${
          email
            ? "bg-gold hover:bg-sienna text-taupe font-semibold shadow-lg"
            : "bg-gray-400 cursor-not-allowed text-white"
        }`}
        aria-label="Add New Book"
        disabled={!email}
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">✚</span>
          <span className="hidden sm:inline">Create Book</span>
        </span>
      </button>

      {/* Enhanced Modal */}
      {isModalOpen && email && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gold/20">
            {/* Modal Header - Sticky */}
            <div className="flex-shrink-0 bg-gradient-to-r from-blush to-peach p-6 rounded-t-2xl border-b border-gold/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-taupe mb-1">
                    Create a New Book
                  </h2>
                  <p className="text-sienna/80 text-sm">
                    Share your story with the world
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-white/50 transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
                  aria-label="Close modal"
                >
                  <span className="text-2xl text-taupe">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title Input */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-taupe mb-2"
                >
                  Book Title *
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Enter your book title..."
                  value={newBook.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-blush/50 text-taupe placeholder-taupe/60 transition-all"
                  required
                />
              </div>

              {/* Author Input */}
              <div>
                <label
                  htmlFor="author"
                  className="block text-sm font-semibold text-taupe mb-2"
                >
                  Author
                </label>
                <input
                  id="author"
                  type="text"
                  name="author"
                  placeholder="Author name"
                  value={newBook.author}
                  disabled
                  className="w-full px-4 py-3 border border-gold/30 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-sienna/60 mt-1">
                  Author is automatically set from your profile
                </p>
              </div>

              {/* Genre Selection */}
              <div>
                <label
                  htmlFor="genre"
                  className="block text-sm font-semibold text-taupe mb-2"
                >
                  Genre *
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={newBook.genre}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-blush/50 text-taupe transition-all"
                  required
                >
                  <option value="">Select a genre...</option>
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
              <div>
                <label
                  htmlFor="synopsis"
                  className="block text-sm font-semibold text-taupe mb-2"
                >
                  Synopsis *
                </label>
                <textarea
                  id="synopsis"
                  name="synopsis"
                  placeholder="Write a brief description of your book..."
                  value={newBook.synopsis}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gold/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent bg-blush/50 text-taupe placeholder-taupe/60 resize-none transition-all"
                  required
                />
                <p className="text-xs text-sienna/60 mt-1">
                  {newBook.synopsis.length}/500 characters
                </p>
              </div>

              {/* Enhanced Cover Styles */}
              <div>
                <label className="block text-sm font-semibold text-taupe mb-3">
                  Choose Cover Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {coverStyles.map((style) => (
                    <div
                      key={style.label}
                      onClick={() => handleCoverImageChange(style.className)}
                      className={`relative cursor-pointer transform transition-all duration-300 rounded-xl overflow-hidden ${
                        newBook.coverImage === style.className
                          ? "scale-105 ring-2 ring-gold shadow-lg"
                          : "hover:scale-105 hover:shadow-md"
                      }`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleCoverImageChange(style.className);
                        }
                      }}
                      aria-label={`Select ${style.label} cover style`}
                    >
                      <div className="aspect-[2/3] relative w-full">
                        {/* Book spine */}
                        <div className="absolute left-0 top-0 h-full w-2 bg-sienna/80 shadow-inner z-10" />
                        {/* Cover */}
                        <div
                          className={`h-full w-full pl-2 ${style.className} shadow-md border border-gold/20 overflow-hidden flex flex-col justify-end`}
                        >
                          <div className="bg-white/90 backdrop-blur-sm p-3">
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
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="flex-shrink-0 p-6 border-t border-gold/20 bg-white rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-blush text-taupe rounded-xl font-semibold hover:bg-peach transition-colors focus:outline-none focus:ring-2 focus:ring-gold"
                  disabled={isLoading}
                >
                  Reset
                </button>
                <button
                  onClick={handleCreateBook}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gold text-sienna rounded-xl font-semibold hover:bg-sienna hover:text-gold transition-all focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-sienna border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </span>
                  ) : (
                    "Create Book"
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
