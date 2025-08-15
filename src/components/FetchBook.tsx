import { useEffect, useState } from "react";
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
import { FiArrowLeft, FiBookOpen, FiAlertCircle } from "react-icons/fi";

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
  const goBack = () => window.history.back();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const docRef = doc(db, "books", id);
        const docSnapPromise = getDoc(docRef);
        const chaptersSnapshotPromise = getDocs(
          collection(db, "books", id, "chapters")
        );

        // Await both promises concurrently
        const [docSnap, chaptersSnapshot] = await Promise.all([
          docSnapPromise,
          chaptersSnapshotPromise,
        ]);

        if (!docSnap.exists()) {
          if (isMounted) setError("Book not found.");
          return;
        }

        // Set book
        const bookData = docSnap.data() as Omit<Book, "id">;
        if (isMounted) setBook({ id, ...bookData });

        // Set chapters
        const chaptersData = chaptersSnapshot.docs
          .map((doc) => {
            const data = doc.data() as Omit<Chapter, "id">;
            return { id: doc.id, ...data };
          })
          .sort(
            (a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)
          );

        if (isMounted) setChapters(chaptersData);

        // Increment view count
        await updateDoc(docRef, { views: increment(1) });
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Failed to load book.");
      }
    };

    fetchData();

    // Cleanup to avoid memory leaks
    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blush via-peach to-gold px-2 py-10">
      <div className="w-full max-w-3xl mx-auto">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-6 py-2 mb-10 rounded-2xl bg-white/70 hover:bg-white/90 shadow-xl backdrop-blur border border-rosewood text-rosewood font-semibold text-base focus:outline-none focus:ring-2 focus:ring-gold transition-all duration-200"
          aria-label="Back to Library"
        >
          <FiArrowLeft className="text-lg" />
          <span className="hidden sm:inline">Back to Library</span>
        </button>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.section
              key="error"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="text-center py-20 text-taupe bg-white/80 rounded-3xl shadow-2xl flex flex-col items-center border border-rosewood backdrop-blur-lg"
            >
              <FiAlertCircle className="text-6xl text-rosewood mb-4 animate-pulse" />
              <h1 className="text-4xl font-bold mb-4">Book Not Found</h1>
              <p className="mb-2">{error}</p>
              <button
                onClick={goBack}
                className="mt-4 px-4 py-2 rounded-2xl bg-rosewood text-white hover:bg-sienna shadow focus:outline-none focus:ring-2 focus:ring-gold transition"
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
              className="flex flex-col items-center justify-center py-24 text-taupe bg-white/80 rounded-3xl shadow-2xl border border-rosewood backdrop-blur-lg"
            >
              <span className="animate-spin mb-6">
                <FiBookOpen className="text-6xl text-gold" />
              </span>
              <p className="text-xl font-semibold mb-2">Loading book...</p>
              <p className="text-sm">Please wait while we fetch your story.</p>
            </motion.section>
          ) : (
            <motion.div
              key="book"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="w-full bg-white/90 rounded-3xl shadow-2xl border border-gold backdrop-blur-lg p-2 sm:p-8"
            >
              <CustomBook book={book} chapters={chapters} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
