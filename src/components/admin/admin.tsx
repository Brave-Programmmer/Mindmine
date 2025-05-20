import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase";
import { Bounce, ToastContainer, toast } from "react-toastify";

// Cover styles with gradients and particle-like effects
const coverStyles: { label: string; className: string }[] = [
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    genre: "",
    synopsis: "",
    coverImage: coverStyles[0].className,
    totalChapters: 0,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewBook({ ...newBook, [e.target.name]: e.target.value });
  };

  const handleCoverImageChange = (className: string) => {
    setNewBook({ ...newBook, coverImage: className });
  };

  const handleCreateBook = async () => {
    try {
      const createdAt = new Date().toISOString();
      const bookToCreate = { ...newBook, createdAt };
      await addDoc(collection(db, "books"), bookToCreate);
      setNewBook({
        title: "",
        author: "",
        genre: "",
        synopsis: "",
        coverImage: coverStyles[0].className,
        totalChapters: 0,
      });
      toast.success("New Book Added!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Bounce,
      });
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create book:", err);
      alert("Something went wrong while creating the book.");
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-6 right-6 bg-rosewood/80 hover:bg-sienna text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 z-50"
        aria-label="Add New Book"
      >
        ✚ Create New Book
      </button>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
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
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                name="genre"
                placeholder="Genre"
                value={newBook.genre}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <textarea
                name="synopsis"
                placeholder="Synopsis"
                value={newBook.synopsis}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={4}
              />
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Choose Cover Style
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {coverStyles.map((style) => (
                    <div
                      key={style.label}
                      className={`relative h-36 w-28 cursor-pointer transform transition-transform ${
                        newBook.coverImage === style.className
                          ? "scale-105 ring-2 ring-rosewood"
                          : "hover:scale-105"
                      }`}
                      onClick={() => handleCoverImageChange(style.className)}
                    >
                      {/* Spine */}
                      <div className="absolute left-0 top-0 h-full w-4 bg-neutral-800 rounded-l-md shadow-inner z-10"></div>

                      {/* Cover */}
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
