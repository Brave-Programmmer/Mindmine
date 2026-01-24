import React from "react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-32 mx-4 bg-gradient-to-r from-white/90 to-peach/30 backdrop-blur-xl rounded-3xl px-8 md:px-12 py-10 md:py-12 shadow-xl border border-gold/20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-10">
          {/* Brand */}
          <div className="space-y-3">
            <a
              href="/"
              className="inline-block text-2xl font-bold bg-gradient-to-r from-gold via-sienna to-taupe bg-clip-text text-transparent hover:from-sienna hover:via-gold hover:to-taupe transition-all duration-300"
            >
              mindMine
            </a>
            <p className="text-taupe/70 font-light text-sm leading-relaxed">
              Where stories come alive and authors find their voice.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="font-bold text-taupe text-lg">Explore</h3>
            <nav className="flex flex-col gap-2.5">
              <a
                href="/books"
                className="text-taupe/70 hover:text-sienna font-medium transition-colors text-sm"
              >
                📚 Browse Books
              </a>
              <a
                href="/about"
                className="text-taupe/70 hover:text-sienna font-medium transition-colors text-sm"
              >
                ℹ️ About Us
              </a>
            </nav>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h3 className="font-bold text-taupe text-lg">Community</h3>
            <nav className="flex flex-col gap-2.5">
              <a
                href="/login"
                className="text-taupe/70 hover:text-sienna font-medium transition-colors text-sm"
              >
                🤝 Join Us
              </a>
              <a
                href="/write"
                className="text-taupe/70 hover:text-sienna font-medium transition-colors text-sm"
              >
                ✍️ Write Stories
              </a>
            </nav>
          </div>
        </div>

        <div className="border-t border-gold/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-taupe/60">
          <p className="font-light">
            © {currentYear} mindMine. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
