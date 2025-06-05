import React, { useState, useCallback, useEffect, useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuthStore } from "../store/authStore";
import "../css/style.css";

// Constants for better maintainability
const NAVIGATION_LINKS = [
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
];

const MOBILE_NAVIGATION_LINKS = [
  { href: "/books", label: "Books" },
  { href: "/about", label: "About" },
];

// Custom hook for handling outside clicks
const useOutsideClick = (handler: () => void) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handler]);

  return ref;
};

// Optimized Icon components to reduce re-renders
const HamburgerIcon = React.memo(({ isOpen }: { isOpen: boolean }) => (
  <svg
    className="w-6 h-6 transition-transform duration-200"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    {isOpen ? (
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
));

const ChevronIcon = React.memo(({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`w-4 h-4 transform transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"
      }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 9l-7 7-7-7" />
  </svg>
));

const CloseIcon = React.memo(() => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
));

// Profile Avatar Component
const ProfileAvatar = React.memo(({ displayName }: { displayName?: string }) => {
  const initials = displayName
    ? displayName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="w-8 h-8 bg-gradient-to-br from-rosewood to-sienna rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
      {initials}
    </div>
  );
});

export const Navbar = () => {
  // Auth state
  const { displayName, email, isAuthenticated, resetUser } = useAuthStore();

  // Menu states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpenMobile, setProfileOpenMobile] = useState(false);
  const [profileOpenDesktop, setProfileOpenDesktop] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Refs for outside click detection
  const desktopProfileRef = useOutsideClick(() => setProfileOpenDesktop(false));

  // Scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Optimized handlers with useCallback
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      resetUser();
      window.location.href = "/login";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [resetUser]);

  const closeAllMenus = useCallback(() => {
    setMobileMenuOpen(false);
    setProfileOpenMobile(false);
    setProfileOpenDesktop(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    setProfileOpenMobile(false);
  }, []);

  const toggleDesktopProfile = useCallback(() => {
    setProfileOpenDesktop(prev => !prev);
  }, []);

  const toggleMobileProfile = useCallback(() => {
    setProfileOpenMobile(prev => !prev);
  }, []);

  // Navigation link component
  const NavLink = React.memo(({ href, children, onClick, className = "" }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }) => (
    <a
      href={href}
      className={`text-rosewood font-medium hover:text-sienna transition-colors duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </a>
  ));

  return (
    <>
      <header className="fixed top-4 left-4 right-4 z-50">
        <nav className={`container mx-auto backdrop-blur-md rounded-2xl shadow-lg px-6 py-4 transition-all duration-300 ${isScrolled
            ? 'bg-white/60 shadow-xl'
            : 'bg-white/40 shadow-lg'
          }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Brand + Mobile Button */}
            <div className="flex justify-between items-center w-full md:w-auto">
              <a
                href="/"
                className="text-2xl font-extrabold bg-gradient-to-r from-rosewood to-sienna bg-clip-text text-transparent hover:from-sienna hover:to-rosewood transition-all duration-300"
              >
                mindMine
              </a>

              <button
                onClick={toggleMobileMenu}
                className="md:hidden text-rosewood hover:text-sienna transition-colors duration-200 p-2 rounded-lg hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-rosewood/50"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                <HamburgerIcon isOpen={mobileMenuOpen} />
              </button>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {NAVIGATION_LINKS.map(({ href, label }) => (
                <NavLink key={href} href={href}>
                  {label}
                </NavLink>
              ))}

              {isAuthenticated ? (
                <div className="relative" ref={desktopProfileRef}>
                  <button
                    onClick={toggleDesktopProfile}
                    className="flex items-center space-x-3 text-rosewood font-semibold hover:text-sienna transition-colors duration-200 p-2 rounded-lg hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-rosewood/50"
                    aria-haspopup="true"
                    aria-expanded={profileOpenDesktop}
                  >
                    <ProfileAvatar displayName={displayName} />
                    <span className="max-w-32 truncate">{displayName || "Profile"}</span>
                    <ChevronIcon isOpen={profileOpenDesktop} />
                  </button>

                  {/* Desktop Profile Dropdown */}
                  <div
                    className={`absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 overflow-hidden transition-all duration-300 ${profileOpenDesktop
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                      }`}
                    style={{
                      boxShadow: "0 10px 40px rgba(195, 108, 93, 0.2)",
                    }}
                  >
                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <ProfileAvatar displayName={displayName} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-rosewood truncate">
                            {displayName || "User"}
                          </p>
                          <p className="text-sm text-sienna truncate">
                            {email || "No Email"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <a
                        href="/write"
                        className="flex items-center px-4 py-2 text-rosewood hover:bg-peach/50 transition-colors duration-200"
                        onClick={() => setProfileOpenDesktop(false)}
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        Write
                      </a>
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileOpenDesktop(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-left text-rosewood hover:bg-red-50 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href="/login"
                  className="bg-gradient-to-r from-rosewood to-sienna text-white px-6 py-2.5 rounded-full hover:from-sienna hover:to-rosewood transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      {/* Overlay */}
      <div
        onClick={closeAllMenus}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
          } md:hidden`}
      />

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-80 bg-white/95 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-out z-50 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:hidden`}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <a
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-rosewood to-sienna bg-clip-text text-transparent"
            onClick={closeAllMenus}
          >
            mindMine
          </a>
          <button
            onClick={closeAllMenus}
            aria-label="Close menu"
            className="text-rosewood hover:text-sienna p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-rosewood/50"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-6 py-6 space-y-4">
          {MOBILE_NAVIGATION_LINKS.map(({ href, label }) => (
            <NavLink
              key={href}
              href={href}
              onClick={closeAllMenus}
              className="hover:bg-peach/30 rounded-lg px-4 py-3 transition-colors duration-200 font-medium"
            >
              {label}
            </NavLink>
          ))}

          {/* Mobile Profile Section */}
          {isAuthenticated ? (
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={toggleMobileProfile}
                className="w-full flex justify-between items-center hover:bg-peach/30 rounded-lg px-4 py-3 transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-rosewood/50"
              >
                <div className="flex items-center space-x-3">
                  <ProfileAvatar displayName={displayName} />
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-rosewood truncate">{displayName || "Profile"}</p>
                    <p className="text-xs text-sienna truncate">
                      {email || "No Email"}
                    </p>
                  </div>
                </div>
                <ChevronIcon isOpen={profileOpenMobile} />
              </button>

              {/* Mobile Profile Menu */}
              <div
                className={`overflow-hidden transition-all duration-300 ${profileOpenMobile ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
                  }`}
              >
                <div className="flex flex-col space-y-2 mt-3 ml-4">
                  <a
                    href="/write"
                    className="flex items-center hover:bg-peach/30 rounded-lg px-4 py-2 transition-colors duration-200 font-medium text-rosewood"
                    onClick={closeAllMenus}
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Write
                  </a>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeAllMenus();
                    }}
                    className="flex items-center bg-gradient-to-r from-sienna to-rosewood hover:from-rosewood hover:to-sienna text-white rounded-lg px-4 py-2 transition-all duration-200 font-semibold"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-gray-100">
              <a
                href="/login"
                className="block bg-gradient-to-r from-sienna to-rosewood text-white rounded-lg px-6 py-3 text-center hover:from-rosewood hover:to-sienna transition-all duration-300 font-semibold shadow-md"
                onClick={closeAllMenus}
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