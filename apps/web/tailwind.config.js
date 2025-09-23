// apps/web/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],  // ✅ src 전체 스캔
  theme: { extend: {} },
  plugins: [],
};