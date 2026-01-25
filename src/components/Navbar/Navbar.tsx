import React, { useState, useCallback, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuthStore } from "../../store/authStore";
import useOutsideClick from "./useOutsideClick";
import NavLink from "./NavLink";
import ProfileAvatar from "./Avatar";

const NAVIGATION_LINKS = [
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
];

export const Navbar = () => {
  const { displayName, email, isAuthenticated, resetUser } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpenMobile, setProfileOpenMobile] = useState(false);
  const [profileOpenDesktop, setProfileOpenDesktop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const desktopProfileRef = useOutsideClick(() => setProfileOpenDesktop(false));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", mobileMenuOpen);
    return () => document.body.classList.remove("no-scroll");
  }, [mobileMenuOpen]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      resetUser();
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, [resetUser]);

  const closeAllMenus = useCallback(() => {
    setMobileMenuOpen(false);
    setProfileOpenMobile(false);
    setProfileOpenDesktop(false);
  }, []);

  // Simple SVG Icons
  const HamburgerIcon = () => (
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
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );

  const CloseIcon = () => (
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
  );

  const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
    <svg
      className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav
          className={`mx-auto px-4 md:px-8 py-3 md:py-4 backdrop-blur-lg transition-all duration-300 border-b ${
            isScrolled
              ? "bg-white/90 shadow-md border-gray-200"
              : "bg-white/80 border-gray-100"
          }`}
        >
          <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
            <a
              href="/"
              className="text-xl md:text-2xl font-bold text-taupe hover:text-sienna transition-colors flex-shrink-0"
            >
              mindMine
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              {NAVIGATION_LINKS.map(({ href, label }) => (
                <NavLink
                  key={href}
                  href={href}
                  className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm font-medium"
                >
                  {label}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <div className="relative" ref={desktopProfileRef}>
                  <button
                    onClick={() => setProfileOpenDesktop((prev) => !prev)}
                    className="flex items-center gap-2 text-taupe font-medium hover:text-sienna px-3 py-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                    aria-haspopup="true"
                    aria-expanded={profileOpenDesktop}
                  >
                    <ProfileAvatar displayName={displayName} />
                    <span className="max-w-24 truncate text-xs">
                      {displayName || "Profile"}
                    </span>
                    <ChevronIcon isOpen={profileOpenDesktop} />
                  </button>

                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg transition-all ${
                      profileOpenDesktop
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar displayName={displayName} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {displayName || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {email || "No Email"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <a
                        href="/write"
                        onClick={() => setProfileOpenDesktop(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      >
                        Write New Book
                      </a>

                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileOpenDesktop(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href="/login"
                  className="w-full group relative inline-flex items-center justify-center px-4 sm:px-4 py-3 sm:py-2 rounded-full font-semibold text-rosewood border-2 border-gold/60 hover:border-sienna transition-all duration-300 bg-cream/80 hover:bg-gold/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 min-h-[44px]"
                >
                  Login
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setProfileOpenMobile(false);
              }}
              className="md:hidden p-2 text-taupe hover:text-sienna rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <HamburgerIcon />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Overlay */}
      <div
        onClick={closeAllMenus}
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[45] transition-opacity ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } md:hidden`}
      />

      {/* Mobile Sidebar */}
      <aside
        id="mobile-menu"
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-[70] transform transition-transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <span className="text-lg font-bold text-gray-900">mindMine</span>
          <button
            onClick={closeAllMenus}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-col p-4 space-y-1">
          {NAVIGATION_LINKS.map(({ href, label }) => (
            <NavLink
              key={href}
              href={href}
              onClick={closeAllMenus}
              className="px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="px-3 py-2 mb-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ProfileAvatar displayName={displayName} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {email || "No Email"}
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="/write"
                onClick={closeAllMenus}
                className="block px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Write New Book
              </a>

              <button
                onClick={() => {
                  handleLogout();
                  closeAllMenus();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <a
                href="/login"
                onClick={closeAllMenus}
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-rosewood border-2 border-gold/60 hover:border-sienna transition-all duration-300 hover:scale-105 active:scale-95 bg-cream/80 hover:bg-gold/10 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 min-h-[44px]"
              >
                Login
              </a>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

// Styles moved to CSS file or global styles
const styles = `
  .no-scroll {
    overflow: hidden;
  }

  @media (max-width: 768px) {
    nav {
      font-size: 14px;
    }
    
    button {
      min-height: 44px;
      min-width: 44px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
