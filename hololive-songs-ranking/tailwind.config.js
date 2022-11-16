/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    // colors: {
    //   holoblue: "#49c8f0",
    // },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      // xl: '1280px',
    },
    fontFamily: {
      display: ["Work Sans", "Hiragino Kaku Gothic Pro", "sans-serif"],
      body: ["Work Sans", "Hiragino Kaku Gothic Pro", "sans-serif"],
    },
    extend: {},
  },
  plugins: [],
};
