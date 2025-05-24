import React from "react";

export const Footer = () => {
  return (
    <footer className="pt-4 pb-4 mb-5 mt-24 mx-4 bg-white/40 backdrop-blur-md rounded-2xl px-6 py-3 shadow-md flex flex-col md:flex-row justify-between items-center text-sm text-rosewood">
      <span>© {new Date().getFullYear()} Livre</span>
      <div className="space-x-4 mt-2 md:mt-0">
        <a href="/books" className="hover:text-sienna transition-colors">
          Books
        </a>
        <a href="/authors" className="hover:text-sienna transition-colors">
          Authors
        </a>
        <a href="/write" className="hover:text-sienna transition-colors">
          Write
        </a>
      </div>
    </footer>
  );
};
