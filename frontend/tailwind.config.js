/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // dark mode via classe .dark
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f0f6ff",
        foreground: "#171717",
        primary: "#2d85ff",
        "primary-light": "#5da8ff",
        "primary-dark": "#1d5fcc",
        "dark-background": "#1a1a1a",
        "dark-foreground": "#f5f5f5",
      },
    },
  },
  plugins: [],
};
