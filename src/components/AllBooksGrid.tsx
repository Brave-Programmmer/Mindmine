import React, { useEffect, useState } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";

type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  synopsis: string;
  coverImage: string; // Tailwind background classes
  totalChapters: number;
  createdAt: string;
};

const AllBooksGrid = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const q = query(collection(db, "books"));
        const querySnapshot = await getDocs(q);
        const books = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBooks(books as Book[]);
      } catch (err) {
        console.error("Error loading books:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadBooks();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8 text-center text-rosewood">
        📚 All Books from All Authors
      </h2>

      {isLoading ? (
        <div className="text-center text-gray-500">Loading books...</div>
      ) : books.length === 0 ? (
        <div className="text-center text-gray-500">No books found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 justify-items-center">
          {books.map((book) => (
            <a
              key={book.id}
              href={`/books/${book.id}`}
              className="relative group w-36 md:w-44 aspect-[2/3] rounded-xl transition-transform hover:scale-105 shadow-xl block"
              aria-label={`View details of ${book.title}`}
            >
              {/* Book Spine / Binding */}
              <div className="absolute left-0 top-0 h-full w-5 bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 rounded-l-2xl shadow-inner border-r border-black/30 z-20 flex flex-col justify-center items-center">
                {/* Simulated stitches/dots on spine */}
                <div className="space-y-1">
                  {[...Array(6)].map((_, i) => (
                    <span
                      key={i}
                      className="block w-1.5 h-1.5 rounded-full bg-neutral-700 shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Book Cover */}
              <div
                className={`h-full w-full rounded-r-xl overflow-hidden ${book.coverImage} bg-cover bg-center flex flex-col justify-end relative z-10 shadow-lg`}
                role="img"
                aria-label={`Cover of ${book.title}`}
                style={{
                  transformOrigin: "left center",
                  transform: "skewY(-1deg)",
                  marginLeft: "20px", // push cover right so spine is visible
                }}
              >
                {/* Glassy Title Bar */}
                <div className="backdrop-blur-md bg-black/50 text-white text-xs md:text-sm text-center py-1 px-2 font-semibold rounded-tr-xl rounded-br-xl select-none">
                  {book.title}
                </div>

                {/* Hover Overlay Info - inside the cover div */}
                <div className="absolute inset-0 bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-xl p-4 flex flex-col justify-center items-center text-center select-none">
                  <h3 className="text-sm md:text-base font-bold mb-1 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs md:text-sm">By {book.author}</p>
                  <p className="text-xs md:text-sm mt-1">{book.genre}</p>
                  <p className="text-xs md:text-sm mt-1">
                    📖 {book.totalChapters} chapters
                  </p>
                  {/* <p className="text-xs md:text-sm mt-2 italic text-gray-300 line-clamp-3">
                    {book.synopsis}
                  </p> */}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllBooksGrid;
