/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zoom: {
          blue: "#0E71EB",
          "blue-hover": "#0050C8",
          orange: "#F26D21",
          "orange-hover": "#D95610",
          green: "#23D160",
          red: "#E02828",
          "red-hover": "#B71C1C",
          "dark-bg": "#12161A",
          "panel-bg": "#1A1D20",
        },
      },
    },
  },
  plugins: [],
};
