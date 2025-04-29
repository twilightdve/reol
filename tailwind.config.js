/** @type {import('tailwindcss').Config} */
const colors = require("tailwindcss/colors");
// let topBubbles = {},
//   bottomBubbles = {};
// Array.from({ length: 30 }).map((i, index) => {
//   topBubbles[`topBubbles${index}`] = `topBubbles 1s ease-in-out ${
//     index / 10
//   }s infinite`;
//   bottomBubbles[`bottomBubbles${index}`] = `bottomBubbles ease-in-out ${
//     index / 10
//   }s infinite`;
// });

const config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      theme: "#D2AF57",
      letter: "#27489b",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    fontFamily: {
      display: [
        "Noto Serif JP",
        "YuMincho",
        "Hiragino Mincho ProN",
        "MS PMincho",
        "serif",
      ],
      body: [
        "Noto Serif JP",
        "YuMincho",
        "Hiragino Mincho ProN",
        "MS PMincho",
        "serif",
      ],
      icon: ["Cormorant", "serif"],
      tegaki: ["Klee One", "serif"],
      tegakifr: ["Niconne", "serif"],
      system: ["system-ui", "serif"],
    },
    extend: {
      colors: {
        ...colors,
      },
      spacing: {
        112: "28rem",
        128: "32rem",
        144: "36rem",
        160: "40rem",
        176: "44rem",
        192: "48rem",
        208: "52rem",
        224: "56rem",
        240: "60rem",
        256: "64rem",
        272: "68rem",
        288: "72rem",
        304: "76rem",
        320: "80rem",
        480: "120rem",
        640: "160rem",
        800: "200rem",
      },
      animation: {
        byeShutter: "byeShutter 4s ease-in-out forwards",
        shutterOpen: "shutterOpen 4s ease-in-out forwards",
        unbox: "unbox 4s ease-in-out forwards",
        unboxReverse: "unboxReverse 4s ease-in-out forwards",
        untape: "untape 4s ease-in-out forwards",
        turnAround: "turnAround 12s linear 0s infinite normal none running",
        fadeIn: "fadeIn 1.5s ease-in-out forwards",
        fadeInFast: "fadeIn 0.2s ease-in-out forwards",
        fadeOut: "fadeOut 3s ease-in-out 1s forwards",
        fadeInOut1: "fadeInOut 10s ease-in-out 0s forwards",
        fadeInOut2: "fadeInOut 10s ease-in-out 10s forwards",
        fadeInOut3: "fadeInOut 10s ease-in-out 20s forwards",
        blink: "blink 0.5s ease-in-out infinite normal none running",
        intro: "intro 4s ease-in-out forwards",
        topBubbles: "topBubbles 1s ease-out 1s infinite normal",
        bottomBubbles: "bottomBubbles 0.5s ease-out 1s infinite",
        cloud: "cloud 120s linear infinite",
      },
      keyframes: {
        byeShutter: {
          "70%": { opacity: "1" },
          "100%": { opacity: "0", display: "none" },
        },
        shutterOpen: {
          "0%": { width: "0", height: "1px" },
          "50%": { width: "100%", height: "1px" },
          "90%": { width: "100%", height: "100%" },
          "100%": { width: "100%", height: "100%" },
        },
        unbox: {
          "0%": {
            color: "#ea6000",
            backgroundColor: "#000",
            borderColor: "#ea6000",
            opacity: "1",
          },
          "50%": {
            color: "#000",
            backgroundColor: "#ea6000",
            borderColor: "#000",
            opacity: "1",
          },
          "70%": {
            color: "#000",
            backgroundColor: "#ea6000",
            borderColor: "#000",
            opacity: "0",
          },
          "100%": {
            color: "#000",
            backgroundColor: "#ea6000",
            borderColor: "#000",
            opacity: "0",
          },
        },
        unboxReverse: {
          "0%": {
            color: "#000",
            backgroundColor: "#ea6000",
            borderColor: "#000",
            opacity: "1",
          },
          "50%": {
            color: "#ea6000",
            backgroundColor: "#000",
            borderColor: "#ea6000",
            opacity: "1",
          },
          "70%": {
            color: "#ea6000",
            backgroundColor: "#000",
            borderColor: "#ea6000",
            opacity: "0",
          },
          "100%": {
            color: "#ea6000",
            backgroundColor: "#000",
            borderColor: "#ea6000",
            opacity: "0",
          },
        },
        turnAround: {
          "0%": {
            transform: "rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
          },
          "100%": {
            transform: "rotateX(360deg) rotateY(360deg) rotateZ(360deg)",
          },
        },
        fadeIn: {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
          },
        },
        fadeOut: {
          "0%": {
            opacity: 1,
          },
          "100%": {
            opacity: 0,
          },
        },
        fadeInOut: {
          "0%": {
            opacity: 0,
          },
          "25%": {
            opacity: 1,
          },
          "75%": {
            opacity: 1,
          },
          "100%": {
            opacity: 0,
          },
        },
        intro: {
          "0%": {
            opacity: 0,
          },
          "40%": {
            opacity: 1,
          },
          "80%": {
            opacity: 1,
          },
          "100%": {
            opacity: 0,
          },
        },
        blink: {
          "0%": {
            opacity: 1,
          },
          "100%": {
            opacity: 0,
          },
        },
        topBubbles: {
          "0%": {
            backgroundSize: "60% 60%, 40% 40%",
            backgroundPosition: "20% 20%, 20% 20%",
            opacity: 0,
          },
          "30%": {
            backgroundSize: "60% 60%, 40% 40%",
            backgroundPosition: "20% 20%, 20% 20%",
            opacity: 1,
          },
          "80%": {
            opacity: 1,
          },
          "100%": {
            backgroundSize: "0% 0%, 0% 0%",
            backgroundPosition: "20% 20%, 20% 20%",
            opacity: 0,
          },
        },
        cloud: {
          "0%": {
            backgroundPosition: "0px",
          },
          "100%": {
            backgroundPosition: "5440px",
          },
        },
      },
      width: {
        fill: "fill-available",
        "webkit-fill": "-webkit-fill-available",
        "moz-fill": "-moz-available",
      },
      height: {
        fill: "fill-available",
        "webkit-fill": "-webkit-fill-available",
        "moz-fill": "-moz-available",
      },
      maxWidth: {
        fill: "fill-available",
        "webkit-fill": "-webkit-fill-available",
        "moz-fill": "-moz-available",
      },
      maxHeight: {
        fill: "fill-available",
        "webkit-fill": "-webkit-fill-available",
        "moz-fill": "-moz-available",
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    require("flowbite/plugin"),
    require("@tailwindcss/aspect-ratio"),
    require("tailwindcss-3d"),
    ({ addUtilities }) => {
      const newUtilities = {
        ".text-shadow": {
          textShadow: "0px 2px 3px white",
        },
        ".text-shadow-md": {
          textShadow: "0px 3px 3px white",
        },
        ".text-shadow-lg": {
          textShadow: "0px 5px 3px white",
        },
        ".text-shadow-xl": {
          textShadow: "0px 7px 3px white",
        },
        ".text-shadow-2xl": {
          textShadow: "0px 10px 3px white",
        },
        ".text-shadow-none": {
          textShadow: "none",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
module.exports = config;
