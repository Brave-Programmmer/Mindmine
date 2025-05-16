import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthStore } from "../store/authStore";
import "../css/style.css";

export const Navbar = () => {
  const { isAuthenticated, resetUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      resetUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="fixed top-4 left-4 right-4 z-50">
      <nav className="container mx-auto bg-white/30 backdrop-blur-sm rounded-2xl shadow-lg px-6 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand + Mobile Button */}
          <div className="flex justify-between items-center w-full md:w-auto">
            <a
              href="/"
              className="text-2xl font-bold text-rosewood hover:text-sienna transition-colors"
            >
              Livre
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-rosewood hover:text-sienna transition-colors p-2"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <a href="/books" className="hover:text-rosewood transition-colors">
              Books
            </a>
            <a href="/authors" className="hover:text-rosewood transition-colors">
              Authors
            </a>
            <a href="/write" className="hover:text-rosewood transition-colors">
              Write
            </a>
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="bg-rosewood/80 text-white px-4 py-2 rounded-full hover:bg-sienna transition-colors"
              >
                Logout
              </button>
            ) : (
              <a
                href="/login"
                className="bg-rosewood/80 text-white px-4 py-2 rounded-full hover:bg-sienna transition-colors"
              >
                Login
              </a>
            )}
          </div>

          {/* Mobile Menu */}
          <div
            className={`${
              mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            } md:hidden w-full overflow-hidden transition-all duration-300 ease-in-out`}
          >
            <div className="flex flex-col space-y-4 pt-4">
              <a href="/books" className="hover:text-rosewood transition-colors">
                Books
              </a>
              <a href="/authors" className="hover:text-rosewood transition-colors">
                Authors
              </a>
              <a href="/write" className="hover:text-rosewood transition-colors">
                Write
              </a>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="bg-rosewood/80 text-white px-4 py-2 rounded-full hover:bg-sienna transition-colors text-center"
                >
                  Logout
                </button>
              ) : (
                <a
                  href="/login"
                  className="bg-rosewood/80 text-white px-4 py-2 rounded-full hover:bg-sienna transition-colors text-center"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
