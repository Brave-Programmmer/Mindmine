import { useState } from "react";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activetab, setActivetab] = useState("manage_books");
  return (
    <aside
      className={`fixed  transition-all duration-300 mt-8 h-[80vh] bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg flex flex-col overflow-hidden ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 border-b border-gold">
        <span className="font-bold text-rosewood text-xl">
          {isOpen ? "Admin" : "A"}
        </span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-rosewood focus:outline-none text-lg"
        >
          {isOpen ? "←" : "→"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col space-y-2 p-4 text-sm font-medium text-taupe flex-grow admin-navbar">
        <a
          onClick={() => setActivetab("manage_books")}
          className="hover:bg-rosewood text-rosewood px-3 py-2 rounded transition flex items-center"
        >
          📚{" "}
          {isOpen && (
            <span className="ml-2 whitespace-nowrap overflow-hidden">
              Manage Books
            </span>
          )}
        </a>
        <a
          onClick={() => setActivetab("manage_chapters")}
          className="hover:bg-rosewood text-rosewood px-3 py-2 rounded transition flex items-center"
        >
          ✏️{" "}
          {isOpen && (
            <span className="ml-2 whitespace-nowrap overflow-hidden">
              Manage Chapters
            </span>
          )}
        </a>
        <a
          onClick={() => setActivetab("manage_users")}
          className="hover:bg-rosewood text-rosewood px-3 py-2 rounded transition flex items-center"
        >
          👥{" "}
          {isOpen && (
            <span className="ml-2 whitespace-nowrap overflow-hidden">
              Manage Users
            </span>
          )}
        </a>
        <a
          onClick={() => setActivetab("back_to_site")}
          className="hover:bg-rosewood text-rosewood px-3 py-2 rounded transition flex items-center mt-auto"
        >
          🏠{" "}
          {isOpen && (
            <span className="ml-2 whitespace-nowrap overflow-hidden ">
              Back to Site
            </span>
          )}
        </a>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
