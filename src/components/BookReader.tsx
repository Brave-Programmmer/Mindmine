import React, { useState, useEffect } from "react";
import HTMLFlipBook from "react-pageflip";
import { collection, getDocs } from "firebase/firestore";
import aged_page from "../assets/aged-paper.png";
import useSound from "use-sound";
import flipSound from "../assets/page-flip.mp3"; // You'll need a flip sound file
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { db } from "../firebase";
import '../css/style.css'
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
  const [playFlip] = useSound(flipSound, { volume: 0.5 });

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

  const particlesInit = async (main: any) => {
    await loadFull(main);
  };

  if (loading || chapters.length === 0)
    return <p className="text-center mt-20">Loading Book...</p>;

  return (
    <div className="relative min-h-screen bg-[#fef9f2]">
      {/* Background Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#fef9f2" } },
          fpsLimit: 60,
          particles: {
            color: { value: "#d1a561" },
            move: { enable: true, speed: 0.3 },
            number: { value: 30 },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 3 } },
          },
        }}
        className="absolute inset-0 z-0"
      />

      <div className="relative z-10 flex justify-center pt-16 pb-10">
        <HTMLFlipBook
          width={400}
          height={600}
          flippingTime={800}
          showCover={true}
          className="shadow-2xl"
          onFlip={playFlip}
          style={{ borderRadius: "12px", overflow: "hidden" }}
          {...({} as any)} // 👈 force bypass (temporary)
        >
          {chapters.map((chapter) => (
            <div
              style={{ backgroundImage: `url(${aged_page})` }}
              key={chapter.id}
              className="page bg-[url('/aged-paper.png')] bg-cover text-black p-6 font-serif"
            >
              <h2 className="text-xl font-bold text-center underline">
                {chapter.title}
              </h2>
              <div className="mt-4 text-sm whitespace-pre-wrap leading-relaxed">
                {chapter.content}
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  );
};

export default BookReader;
