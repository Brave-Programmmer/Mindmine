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

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const docRef = doc(db, "books", id);
        const docSnapPromise = getDoc(docRef);
        const chaptersSnapshotPromise = getDocs(collection(db, "books", id, "chapters"));

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
            (a, b) =>
              (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)
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

  if (error) {
    return (
      <section className="text-center py-20 text-gray-600">
        <h1 className="text-4xl font-bold mb-4">📚 Book Not Found</h1>
        <p>{error}</p>
      </section>
    );
  }

  if (!book) {
    return (
      <section className="text-center py-20 text-gray-500">
        <p>Loading book...</p>
      </section>
    );
  }

  return <CustomBook book={book} chapters={chapters} />;
}
