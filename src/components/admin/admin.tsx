import React, { useState, useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Bounce, ToastContainer, toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";

// Cover styles
const coverStyles = [
  {
    label: "Sunset Horizon",
    className: "bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400",
  },
  {
    label: "Forest Calm",
    className: "bg-gradient-to-br from-green-300 via-green-500 to-teal-700",
  },
  {
    label: "Ocean Depth",
    className: "bg-gradient-to-tr from-blue-200 via-blue-400 to-indigo-700",
  },
  {
    label: "Dusk Glow",
    className: "bg-gradient-to-br from-purple-300 via-pink-400 to-rose-500",
  },
  {
    label: "Sand & Sky",
    className: "bg-gradient-to-tr from-yellow-100 via-white to-blue-200",
  },
];

const Admin = () => {
  const email = useAuthStore((state) => state.email);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    synopsis: "",
    coverImage: coverStyles[0].className,
    totalChapters: 0,
    email: "",
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBook((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverImageChange = (className: string) => {
    setNewBook((prev) => ({ ...prev, coverImage: className }));
  };

  const handleCreateBook = async () => {
    if (!email) {
      toast.error("You must be logged in to create a book.", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

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

      toast.success("New Book Added!", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create book:", err);
      alert("Something went wrong while creating the book.");
    }
  };

  return (
    <div>
      {/* Create New Book Button */}
      <button
        onClick={() => {
          if (!email) {
            toast.warn("Please log in to create a book.");
            return;
          }
          setIsModalOpen(true);
        }}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-50 transition ${email
            ? "bg-rosewood/80 hover:bg-sienna text-white"
            : "bg-gray-400 cursor-not-allowed text-white"
          }`}
        aria-label="Add New Book"
        disabled={!email}
      >
        ✚ Create New Book
      </button>

      {/* Modal */}
      {isModalOpen && email && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-rosewood mb-4">
              Create a New Book
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={newBook.title}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                name="author"
                placeholder="Author"
                value={newBook.author}
                disabled
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <select
                name="genre"
                value={newBook.genre}
                onChange={handleGenreChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Genre</option>
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

              <textarea
                name="synopsis"
                placeholder="Synopsis"
                value={newBook.synopsis}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />

              {/* Cover Styles */}
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Choose Cover Style
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {coverStyles.map((style) => (
                    <div
                      key={style.label}
                      onClick={() => handleCoverImageChange(style.className)}
                      className={`relative h-36 w-28 cursor-pointer transform transition ${newBook.coverImage === style.className
                          ? "scale-105 ring-2 ring-rosewood"
                          : "hover:scale-105"
                        }`}
                    >
                      <div className="absolute left-0 top-0 h-full w-4 bg-neutral-800 rounded-l-md shadow-inner z-10"></div>
                      <div
                        className={`h-full w-full pl-4 rounded-r-md ${style.className} shadow-md border border-black/10 overflow-hidden flex flex-col justify-end`}
                      >
                        <div className="bg-black/40 text-white text-xs p-2">
                          <p className="font-semibold line-clamp-2">
                            {style.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateBook}
                className="w-full bg-rosewood text-white py-2 px-4 rounded hover:bg-sienna transition"
              >
                Create Book
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Admin;
