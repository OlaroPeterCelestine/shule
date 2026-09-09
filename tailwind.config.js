/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        ink: "#14213D",
        inkdeep: "#0D1730",
        canvas: "#F4F6F8",
        paper: "#FFFFFF",
        primary: "#0E7C61",
        primarydark: "#0A5C48",
        gold: "#C68A1A",
        maroon: "#8A2E3B",
        slate2: "#3B4A5A",
        line: "#E1E5EA",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
