/* empty css                                      */
import { c as createAstro, a as createComponent, b as renderComponent, e as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_Cdtk5z3h.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_o7msmbgn.mjs';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { d as db } from '../../chunks/firebase_BJ45oOlh.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { TypeAnimation } from 'react-type-animation';
export { renderers } from '../../renderers.mjs';

const flipSound = "/_astro/page-flip.Bv9NNsps.mp3";

const pageVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    rotateY: direction > 0 ? -90 : 90,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    rotateY: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    rotateY: direction < 0 ? -90 : 90,
    opacity: 0,
    transition: { duration: 0.6, ease: "easeIn" }
  })
};
const CustomBook = ({ chapters, book }) => {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showCover, setShowCover] = useState(true);
  const [closing, setClosing] = useState(false);
  const [playFlip] = useSound(flipSound, { volume: 0.5 });
  const bookRef = useRef(null);
  const sortedChapters = [...chapters].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  useEffect(() => {
    const savedPage = localStorage.getItem(`bookmark-${book.id}`);
    if (savedPage) setPage(parseInt(savedPage));
  }, [book.id]);
  useEffect(() => {
    localStorage.setItem(`bookmark-${book.id}`, page.toString());
  }, [page, book.id]);
  const handlePageChange = (dir) => {
    playFlip();
    setDirection(dir);
    setPage((prev) => {
      const newPage = prev + dir;
      if (newPage >= 0 && newPage < sortedChapters.length) {
        return newPage;
      }
      return prev;
    });
  };
  const handleCloseBook = () => {
    playFlip();
    setClosing(true);
    setTimeout(() => {
      setShowCover(true);
      setClosing(false);
    }, 800);
  };
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      bookRef.current?.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${err.message}`
        );
      });
    } else {
      document.exitFullscreen();
    }
  };
  if (showCover) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex flex-col items-center justify-center bg-[#f3eadd] px-4 py-10", children: /* @__PURE__ */ jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.7 },
        className: "bg-[#d5c5aa] border-[10px] border-[#c9b28a] w-[300px] h-[400px] md:w-[400px] md:h-[500px] rounded-xl shadow-2xl flex flex-col justify-center items-center text-center p-6",
        children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl md:text-3xl font-bold mb-1", children: [
            "📘 ",
            book?.title
          ] }),
          /* @__PURE__ */ jsxs("h4", { className: "font-bold mb-2", children: [
            "By - ",
            book?.author
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-[#5a3e2b]", children: "Tap to open and start reading" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => {
                playFlip();
                setShowCover(false);
              },
              className: "mt-6 px-4 py-2 bg-[#7b5e45] text-white rounded-lg hover:bg-[#5a3e2b] transition",
              children: "Open Book"
            }
          )
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      ref: bookRef,
      className: "min-h-screen flex flex-col items-center justify-center px-4 py-10 font-serif bg-[#f3eadd]",
      children: [
        /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: closing ? 1 : 0, scale: closing ? 1 : 0.98 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
            transition: { duration: 0.6 },
            className: "\r\n          relative\r\n          rounded-xl\r\n          border-[10px] border-[#c9b28a]\r\n          shadow-2xl\r\n          overflow-hidden\r\n          flex\r\n          bg-[#d5c5aa]\r\n          w-full max-w-[620px] h-[480px]\r\n          md:w-[620px] md:h-[480px]\r\n        ",
            children: [
              /* @__PURE__ */ jsx("div", { className: "w-[5%] bg-[#4b2e2e] shadow-inner z-10 hidden md:block" }),
              /* @__PURE__ */ jsx("div", { className: "flex-1 relative aged-paper text-[#3e2d20] fold-corner p-4 md:p-10", children: /* @__PURE__ */ jsx(AnimatePresence, { custom: direction, initial: false, mode: "wait", children: /* @__PURE__ */ jsxs(
                motion.div,
                {
                  custom: direction,
                  variants: pageVariants,
                  initial: "enter",
                  animate: "center",
                  exit: "exit",
                  className: "absolute inset-0 flex flex-col justify-between",
                  children: [
                    /* @__PURE__ */ jsxs("div", { className: "overflow-auto max-h-[400px] md:max-h-[420px]", children: [
                      /* @__PURE__ */ jsx("h2", { className: "text-xl md:text-2xl font-bold underline text-center mb-4", children: sortedChapters[page].title }),
                      /* @__PURE__ */ jsx(
                        TypeAnimation,
                        {
                          sequence: [sortedChapters[page].content],
                          wrapper: "p",
                          speed: 50,
                          style: {
                            fontSize: "15px",
                            whiteSpace: "pre-wrap",
                            lineHeight: "1.5"
                          },
                          cursor: true
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "text-center text-xs md:text-sm mt-4 text-[#5a3e2b]", children: [
                      "Page ",
                      page + 1,
                      " of ",
                      sortedChapters.length
                    ] })
                  ]
                },
                sortedChapters[page].id
              ) }) })
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "w-full max-w-[620px] mt-3 h-2 bg-[#e8dcc7] rounded-full overflow-hidden", children: /* @__PURE__ */ jsx(
          "div",
          {
            className: "h-full bg-[#a37c4e] transition-all duration-300",
            style: { width: `${(page + 1) / sortedChapters.length * 100}%` }
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 mt-6 w-full max-w-[620px] md:flex-row md:justify-center md:gap-6", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(-1),
              disabled: page === 0,
              className: "w-full md:w-auto px-5 py-2 bg-[#7b5e45] text-white rounded-lg shadow hover:bg-[#5a3e2b] transition disabled:opacity-40",
              children: "⬅ Prev"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handlePageChange(1),
              disabled: page === sortedChapters.length - 1,
              className: "w-full md:w-auto px-5 py-2 bg-[#7b5e45] text-white rounded-lg shadow hover:bg-[#5a3e2b] transition disabled:opacity-40",
              children: "Next ➡"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleCloseBook,
              className: "w-full md:w-auto px-5 py-2 bg-red-400 text-white rounded-lg shadow hover:bg-red-600 transition",
              children: "✖ Close Book"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: toggleFullScreen,
              className: "w-full md:w-auto px-5 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 transition",
              children: "🖵 Fullscreen"
            }
          )
        ] })
      ]
    }
  );
};

const $$Astro = createAstro("https://livre.com");
async function getStaticPaths() {
  const booksSnapshot = await getDocs(collection(db, "books"));
  return booksSnapshot.docs.map((doc2) => ({
    params: { id: doc2.id }
  }));
}
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  const { id } = Astro2.params;
  let book = null;
  let chapters = [];
  try {
    const docRef = doc(db, "books", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const bookData = docSnap.data();
      book = { id, ...bookData };
      const chaptersSnapshot = await getDocs(
        collection(db, "books", id, "chapters")
      );
      chapters = chaptersSnapshot.docs.map((doc2) => {
        const data = doc2.data();
        return {
          id: doc2.id,
          ...data
        };
      }).sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
    }
  } catch (err) {
    console.error("Error loading book:", err);
  }
  console.log(book);
  return renderTemplate`${book ? renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": book.title }, { "default": async ($$result2) => renderTemplate`${renderComponent($$result2, "CustomBook", CustomBook, { "chapters": chapters, "book": book, "client:load": true, "client:component-hydration": "load", "client:component-path": "D:/projects/scriptora/CURSORAI/scriptora/src/components/CustomBook", "client:component-export": "default" })}` })}` : renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Book Not Found" }, { "default": async ($$result2) => renderTemplate`${maybeRenderHead()}<section class="text-center py-20 text-gray-600"><h1 class="text-4xl font-bold mb-4">📚 Book Not Found</h1><p>The requested book does not exist or has been deleted.</p></section>` })}`}`;
}, "D:/projects/scriptora/CURSORAI/scriptora/src/pages/books/[id].astro", void 0);

const $$file = "D:/projects/scriptora/CURSORAI/scriptora/src/pages/books/[id].astro";
const $$url = "/books/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  getStaticPaths,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
