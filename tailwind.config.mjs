/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "./node_modules/easymde/dist/easymde.min.css",
  ],
  theme: {
    extend: {
      colors: {
        blush: "#F9E4E0",
        rosewood: "#C36C5D",
        taupe: "#4E3B36",
        peach: "#FCEEEA",
        white: "#FFFFFF",
        sienna: "#A35641",
        gold: "#D9BFA3",
        mauve: "#EECFC5",
        cream: "#FEFCF8",
        sage: "#A8B5A0",
        coral: "#E8A692",
        "warm-gray": "#8B7D6B",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        "slide-down": "slideDown 0.6s ease-out",
        "bounce-soft": "bounceSoft 2s ease-in-out infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
      },
      boxShadow: {
        "glow-gold": "0 0 20px rgba(217, 191, 163, 0.3)",
        "glow-sienna": "0 0 20px rgba(163, 86, 65, 0.3)",
      },
      transitionTimingFunction: {
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};
