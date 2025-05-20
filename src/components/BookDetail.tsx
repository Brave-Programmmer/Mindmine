import React from "react";
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
const BookDetail = ({ book }: { book: Book }) => {
  return (
    <div className="mb-8">
   
      <h1 className="text-3xl font-bold mt-4">{book.title}</h1>
      <p className="text-lg text-gray-600">by {book.author}</p>
      <p className="text-sm text-gray-500 mt-2">Genre: {book.genre}</p>
      <p className="mt-4">{book.synopsis}</p>
    </div>
  );
};

export default BookDetail;
