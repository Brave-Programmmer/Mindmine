import React from "react";

export const Footer = () => {
  return (
    <footer className="mt-24 mx-4 bg-white/60 backdrop-blur-md rounded-2xl px-6 py-6 shadow-md flex flex-col md:flex-row justify-between items-center text-sm text-rosewood">
      <div className="flex items-center gap-4">
        <span className="font-semibold">mindMine</span>
        <span className="text-muted">© {new Date().getFullYear()}</span>
      </div>

      <nav className="flex items-center gap-3 mt-3 md:mt-0">
        <a href="/books" className="btn btn-ghost px-4 py-2 rounded-full">
          Books
        </a>
        <a href="/about" className="btn btn-ghost px-4 py-2 rounded-full">
          About
        </a>
        <a href="/write" className="btn btn-primary px-4 py-2 rounded-full">
          Write
        </a>
      </nav>
    </footer>
  );
};
