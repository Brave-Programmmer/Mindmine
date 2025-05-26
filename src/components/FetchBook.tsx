import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
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
    async function fetchData() {
      try {
        const docRef = doc(db, "books", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const bookData = docSnap.data() as Omit<Book, "id">;
          setBook({ id, ...bookData });

          const chaptersSnapshot = await getDocs(
            collection(db, "books", id, "chapters")
          );
          const chaptersData = chaptersSnapshot.docs
            .map((doc) => {
              const data = doc.data() as Omit<Chapter, "id">;
              return {
                id: doc.id,
                ...data,
              };
            })
            .sort(
              (a, b) =>
                (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0)
            );
          setChapters(chaptersData);
        } else {
          setError("Book not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load book.");
      }
    }

    fetchData();
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
