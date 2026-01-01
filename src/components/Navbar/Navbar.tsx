import React, { useState, useCallback, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useAuthStore } from "../../store/authStore";
import useOutsideClick from "./useOutsideClick";
import NavLink from "./NavLink";
import ProfileAvatar from "./Avatar";
import { HamburgerIcon, CloseIcon, ChevronIcon } from "./Icons";

const NAVIGATION_LINKS = [
  { href: "/books", label: "Books", icon: "📚" },
  { href: "/about", label: "About", icon: "ℹ️" },
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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 safe-area-inset-top">
        <nav
          className={`mx-auto px-3 md:px-6 py-3 md:py-4 backdrop-blur-md transition-all duration-300 ${
            isScrolled
              ? "bg-white/90 shadow-xl border-b border-gold/20"
              : "bg-white/80 shadow-lg"
          }`}
          style={{
            borderBottomLeftRadius: isScrolled ? "0" : "20px",
            borderBottomRightRadius: isScrolled ? "0" : "20px",
          }}
        >
          <div className="flex justify-between items-center w-full">
            <a
              href="/"
              className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-gold via-sienna to-taupe bg-clip-text text-transparent hover:from-sienna hover:via-gold hover:to-taupe transition-all duration-300 flex-shrink-0"
            >
              mindMine
            </a>

            {/* Mobile Menu Button */}
            <button
              onClick={() => {
                setMobileMenuOpen((prev) => !prev);
                setProfileOpenMobile(false);
              }}
              className="md:hidden p-2 text-taupe hover:text-sienna hover:bg-blush/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold transition-all touch-target"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <HamburgerIcon isOpen={mobileMenuOpen} />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-8">
              {NAVIGATION_LINKS.map(({ href, label, icon }) => (
                <NavLink key={href} href={href}>
                  <span className="mr-2 text-lg">{icon}</span>
                  <span className="hidden lg:inline">{label}</span>
                </NavLink>
              ))}

              {isAuthenticated ? (
                <div className="relative" ref={desktopProfileRef}>
                  <button
                    onClick={() => setProfileOpenDesktop((prev) => !prev)}
                    className="flex items-center gap-2 text-taupe font-semibold hover:text-sienna px-2 py-2 md:px-3 md:py-2 rounded-xl hover:bg-blush/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all touch-target"
                    aria-haspopup="true"
                    aria-expanded={profileOpenDesktop}
                  >
                    <ProfileAvatar displayName={displayName} />
                    <span className="max-w-24 md:max-w-32 truncate text-xs md:text-sm">
                      {displayName || "Profile"}
                    </span>
                    <ChevronIcon isOpen={profileOpenDesktop} />
                  </button>

                  <div
                    className={`absolute right-0 mt-3 w-48 md:w-64 bg-white/95 backdrop-blur-md rounded-2xl border border-gold/20 shadow-2xl overflow-hidden transition-all duration-300 ${
                      profileOpenDesktop
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gold/10 bg-gradient-to-r from-blush/50 to-peach/50">
                      <div className="flex items-center gap-2 md:gap-3">
                        <ProfileAvatar displayName={displayName} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-taupe truncate text-sm">
                            {displayName || "User"}
                          </p>
                          <p className="text-xs text-sienna/80 truncate">
                            {email || "No Email"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1 md:py-2">
                      <a
                        href="/write"
                        onClick={() => setProfileOpenDesktop(false)}
                        className="flex items-center px-4 md:px-6 py-2 md:py-3 text-taupe hover:bg-blush/50 transition-colors font-medium text-sm md:text-base touch-target"
                      >
                        <span className="mr-2 md:mr-3">✍️</span>
                        Write New Book
                      </a>

                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileOpenDesktop(false);
                        }}
                        className="w-full text-left flex items-center px-4 md:px-6 py-2 md:py-3 text-taupe hover:bg-red-50 transition-colors font-medium text-sm md:text-base touch-target"
                      >
                        <span className="mr-2 md:mr-3">🚪</span>
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href="/login"
                  className="bg-gradient-to-r from-gold to-sienna text-taupe px-3 md:px-6 py-2 md:py-3 rounded-xl hover:from-sienna hover:to-gold transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm md:text-base touch-target"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Overlay */}
      <div
        onClick={closeAllMenus}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } md:hidden`}
      />

      {/* Mobile Sidebar - Full height, safe area aware */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 sm:w-80 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-transform ease-in-out duration-500 overflow-y-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden safe-area-inset-left safe-area-inset-bottom`}
      >
        <div className="flex justify-between items-center px-4 sm:px-6 py-4 sm:py-5 border-b border-gold/10 bg-gradient-to-r from-blush/50 to-peach/50 sticky top-0">
          <a
            href="/"
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gold via-sienna to-taupe bg-clip-text text-transparent"
            onClick={closeAllMenus}
          >
            mindMine
          </a>
          <button
            onClick={closeAllMenus}
            className="text-taupe hover:text-sienna p-2 rounded-xl hover:bg-blush/50 focus:outline-none focus:ring-2 focus:ring-gold transition-all touch-target"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-col px-4 sm:px-6 py-5 sm:py-6 space-y-2">
          {NAVIGATION_LINKS.map(({ href, label, icon }) => (
            <NavLink
              key={href}
              href={href}
              onClick={closeAllMenus}
              className="flex items-center px-4 py-3 rounded-xl hover:bg-blush/50 transition-all text-sm sm:text-base touch-target"
            >
              <span className="mr-3 text-lg">{icon}</span>
              {label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <div className="border-t border-gold/10 pt-4 mt-4">
              <div className="px-4 py-3 mb-4 bg-blush/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <ProfileAvatar displayName={displayName} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-taupe truncate text-sm">
                      {displayName || "User"}
                    </p>
                    <p className="text-xs text-sienna/80 truncate">
                      {email || "No Email"}
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="/write"
                onClick={closeAllMenus}
                className="flex items-center px-4 py-3 text-taupe hover:bg-blush/50 rounded-xl transition-colors font-medium text-sm touch-target"
              >
                <span className="mr-3">✍️</span>
                Write New Book
              </a>
              <a
                href="/admin"
                onClick={closeAllMenus}
                className="flex items-center px-4 py-3 text-taupe hover:bg-blush/50 rounded-xl transition-colors font-medium text-sm touch-target"
              >
                <span className="mr-3">📚</span>
                My Books
              </a>
              <button
                onClick={() => {
                  handleLogout();
                  closeAllMenus();
                }}
                className="w-full text-left flex items-center px-4 py-3 text-taupe hover:bg-red-50 rounded-xl transition-colors font-medium text-sm touch-target"
              >
                <span className="mr-3">🚪</span>
                Logout
              </button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="border-t border-gold/10 pt-4 mt-4">
              <a
                href="/login"
                onClick={closeAllMenus}
                className="w-full bg-gradient-to-r from-gold to-sienna text-taupe px-6 py-3 rounded-xl hover:from-sienna hover:to-gold transition-all font-semibold shadow-lg text-center block text-sm touch-target"
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

const styles = `
  .touch-target {
    min-height: 44px;
    min-width: 44px;
  }

  .safe-area-inset-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-area-inset-left {
    padding-left: env(safe-area-inset-left);
  }

  .safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  /* Modern button styles */
  button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  button:active {
    transform: scale(0.98);
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    nav {
      font-size: 14px;
    }

    button {
      min-height: 44px;
    }
  }

  /* Smooth transitions for menu */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
