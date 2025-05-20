import React from "react";
type Chapter = {
  id: string;
  title: string;
  content: string;
  createdAt: any;
};

const ChapterList = ({ chapters }: { chapters: Chapter[] }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Chapters</h2>
      <ul className="space-y-2">
        {chapters.map((chapter) => (
          <li key={chapter.id} className="border p-4 rounded shadow-sm">
            <h3 className="text-lg font-bold">{chapter.title}</h3>
            <p className="text-sm text-gray-500">
              {chapter.createdAt?.seconds
                ? new Date(chapter.createdAt.seconds * 1000).toLocaleDateString()
                : "Unknown date"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChapterList;
