import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import CustomBook from "./CustomBook";

type Chapter = {
  id: string;
  title: string;
  content: string;
};

type Props = {
  bookId: string;
};

const BookReader: React.FC<Props> = ({ bookId }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChapters = async () => {
      const snapshot = await getDocs(
        collection(db, "books", bookId, "chapters")
      );
      const list: Chapter[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title ?? "Untitled",
        content: doc.data().content ?? "[No content]",
      }));
      setChapters(list.sort((a, b) => a.title.localeCompare(b.title)));
      setLoading(false);
    };
    loadChapters();
  }, [bookId]);

  if (loading || !chapters.length)
    return <p className="text-center mt-20">Loading Book...</p>;

  return <CustomBook chapters={chapters} />;
};

export default BookReader;
