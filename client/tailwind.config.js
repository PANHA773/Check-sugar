/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3faf7",
          100: "#d7efe3",
          500: "#138a5a",
          600: "#0f6f48"
        }
      }
    }
  },
  plugins: []
};

