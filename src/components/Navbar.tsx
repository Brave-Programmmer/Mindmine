import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthStore } from "../store/authStore";
import "../css/style.css";

export const Navbar = () => {
  const { isAuthenticated, resetUser } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpenMobile, setProfileOpenMobile] = useState(false);
  const [profileOpenDesktop, setProfileOpenDesktop] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      resetUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    setProfileOpenMobile(false);
    setProfileOpenDesktop(false);
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
          <div className="hidden md:flex items-center space-x-6 relative">
            <a href="/books" className="hover:text-rosewood transition-colors">
              Books
            </a>
            <a href="/authors" className="hover:text-rosewood transition-colors">
              Authors
            </a>

            {isAuthenticated ? (
              <>
               

                {/* Profile dropdown collapsible */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpenDesktop(!profileOpenDesktop)}
                    className="flex items-center space-x-1 text-rosewood font-semibold hover:text-sienna transition-colors focus:outline-none"
                    aria-haspopup="true"
                    aria-expanded={profileOpenDesktop}
                  >
                    <span>Profile</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-300 ${
                        profileOpenDesktop ? "rotate-180" : "rotate-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-40 bg-blush rounded-lg shadow-lg overflow-hidden transition-max-height duration-300 ${
                      profileOpenDesktop
                        ? "max-h-48 opacity-100"
                        : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                    style={{
                      boxShadow: "0 4px 10px rgba(195, 108, 93, 0.3)", // subtle rosewood shadow
                    }}
                  >
                    <a
                      href="/write"
                      className="block px-4 py-2 text-rosewood hover:bg-peach transition-colors"
                      onClick={() => setProfileOpenDesktop(false)}
                    >
                      Write
                    </a>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileOpenDesktop(false);
                      }}
                      className="w-full text-left px-4 py-2 text-rosewood hover:bg-peach transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <a
                href="/login"
                className="bg-rosewood/80 text-white px-4 py-2 rounded-full hover:bg-sienna transition-colors"
              >
                Login
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {/* Overlay */}
      <div
        onClick={closeMenu}
        className={`fixed inset-0 bg-blush/90 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } md:hidden`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-blush backdrop-blur-md shadow-lg transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:hidden
        `}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-mauve/50">
          <a
            href="/"
            className="text-xl font-bold text-rosewood hover:text-sienna transition-colors"
            onClick={closeMenu}
          >
            Livre
          </a>
          <button
            onClick={closeMenu}
            aria-label="Close menu"
            className="text-rosewood hover:text-sienna p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col text-rosewood px-6 py-6 space-y-6">
          <a
            href="/books"
            className="hover:bg-peach rounded-md px-3 py-2 transition-colors"
            onClick={closeMenu}
          >
            Books
          </a>
          <a
            href="/authors"
            className="hover:bg-peach rounded-md px-3 py-2 transition-colors"
            onClick={closeMenu}
          >
            Authors
          </a>

          {/* Profile section collapsible */}
          {isAuthenticated ? (
            <div>
              <button
                onClick={() => setProfileOpenMobile(!profileOpenMobile)}
                className="w-full flex justify-between items-center hover:bg-peach rounded-md px-3 py-2 transition-colors focus:outline-none"
              >
                <span>Profile</span>
                <svg
                  className={`w-5 h-5 transform transition-transform duration-300 ${
                    profileOpenMobile ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                style={{
                  maxHeight: profileOpenMobile ? "100px" : "0px",
                  transition: "max-height 0.3s ease",
                  overflow: "hidden",
                }}
                className="flex flex-col space-y-3 mt-3"
              >
                <a
                  href="/write"
                  className="pl-4 hover:bg-peach rounded-md px-3 py-2 transition-colors"
                  onClick={closeMenu}
                >
                  Write
                </a>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="pl-4 bg-sienna hover:bg-blush hover:text-sienna text-white rounded-md px-3 py-2 transition-colors text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <a
              href="/login"
              className="bg-sienna text-white rounded-md px-4 py-2 text-center hover:bg-blush hover:text-sienna transition-colors"
              onClick={closeMenu}
            >
              Login
            </a>
          )}
        </nav>
      </aside>
    </header>
  );
};
