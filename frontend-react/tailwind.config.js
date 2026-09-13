/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        float: "0 14px 36px rgba(15, 23, 42, 0.06)",
        active: "0 6px 18px rgba(15, 23, 42, 0.07), inset 0 0 0 1px rgba(226, 232, 240, 0.7)"
      }
    }
  },
  plugins: []
};
