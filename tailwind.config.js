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
      // デフォルトのTailwind色を維持
      ...colors,
      // カスタム色を追加
      // 背景に空グラデーション (青) を敷くため、UI のテーマカラーは
      // 補色側のゴールドを採用し、その上に載せる文字色は青 (letter) にする。
      theme: "#D2AF57",
      letter: "#27489b",
      // B案リデザイン(plan/16)の確定トークン。公式カラーセット(reol.jp)由来:
      // 黄 #e2bf57 / 青 #27489b(黒背景ではアクセント用に明度調整版 #6b8ce0 を使う)
      // ライトモード対応のため CSS 変数 (RGB channel-triplet) 経由にしている。
      // `bg-bx-bg/95` のような opacity 修飾子を壊さないよう、必ず
      // `rgb(var(--bx-*) / <alpha-value>)` 形式にすること (単純な var() 代入は不可)。
      // 実体は src/styles/global.scss の :root (dark) / .light で定義。
      bx: {
        bg: "rgb(var(--bx-bg) / <alpha-value>)", // ベース(ほぼ黒)
        ink: "rgb(var(--bx-ink) / <alpha-value>)", // 文字(純白でなく僅かに温度)
        ink2: "rgb(var(--bx-ink2) / <alpha-value>)", // 弱い文字(大きめ専用)。小さい文字は bx-ink3 を使う
        ink3: "rgb(var(--bx-ink3) / <alpha-value>)", // 小さめ文字用(コントラスト確保)
        line: "rgb(var(--bx-line) / <alpha-value>)", // 罫線・カード枠
        blue: "rgb(var(--bx-blue) / <alpha-value>)", // 公式ブルー明度調整版: 構造・リンク・見出し
        blueDeep: "rgb(var(--bx-blue-deep) / <alpha-value>)", // 公式ブルー原色: グロー・面
        blueLight: "rgb(var(--bx-blue-light) / <alpha-value>)", // 第3アクセント
        yellow: "rgb(var(--bx-yellow) / <alpha-value>)", // 公式イエロー: CTA・ハイライト・「現在」
        surface: "rgb(var(--bx-surface) / <alpha-value>)", // カード等の淡いオーバーレイ面 (旧 bg-white/5 相当)
      },
      // CSS変数を使用した動的カラー
      "dynamic-primary": "var(--color-primary)",
      "dynamic-secondary": "var(--color-secondary)",
      "dynamic-accent": "var(--color-accent)",
      "dynamic-background": "var(--color-background)",
      "dynamic-text": "var(--color-text)",
      "temp-primary": "var(--temp-color-primary)",
      "temp-secondary": "var(--temp-color-secondary)",
      "temp-accent": "var(--temp-color-accent)",
      "temp-background": "var(--temp-color-background)",
      "temp-text": "var(--temp-color-text)",
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    fontFamily: {
      sans: [
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        '"Noto Sans JP"',
        '"Hiragino Sans"',
        '"Hiragino Kaku Gothic ProN"',
        '"Yu Gothic"',
        "Meiryo",
        "sans-serif",
      ],
      display: [
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        '"Noto Sans JP"',
        '"Hiragino Sans"',
        '"Hiragino Kaku Gothic ProN"',
        '"Yu Gothic"',
        "Meiryo",
        "sans-serif",
      ],
      body: [
        "system-ui",
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        '"Noto Sans JP"',
        '"Hiragino Sans"',
        '"Hiragino Kaku Gothic ProN"',
        '"Yu Gothic"',
        "Meiryo",
        "sans-serif",
      ],
      icon: ["Cormorant", "serif"],
      tegaki: ["Klee One", "serif"],
      tegakifr: ["Niconne", "serif"],
      system: ["system-ui", "sans-serif"],
    },
    extend: {
      colors: {
        ...colors,
        // 美辞学ナビ用カラー
        bijigaku: {
          header: '#977c30',
          card: 'rgba(216, 217, 195, 0.9)',
        },
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
        untape: "untape 4s ease-in-out forwards",
        fadeIn: "fadeIn 1.5s ease-in-out forwards",
        fadeInFast: "fadeIn 0.2s ease-in-out forwards",
        fadeInOut1: "fadeInOut 10s ease-in-out 0s forwards",
        fadeInOut2: "fadeInOut 10s ease-in-out 10s forwards",
        fadeInOut3: "fadeInOut 10s ease-in-out 20s forwards",
        topBubbles: "topBubbles 1s ease-out 1s infinite normal",
        bottomBubbles: "bottomBubbles 0.5s ease-out 1s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: 0,
          },
          "100%": {
            opacity: 1,
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
        /* 美辞学ナビ: 会場ページ用テキストシャドウ */
        ".text-shadow-venue": {
          textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
        },
        ".text-shadow-venue-strong": {
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
        },
        ".text-shadow-venue-light": {
          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
        },
        /* 美辞学ナビ: アイコン用ドロップシャドウ */
        ".icon-shadow": {
          filter: "drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
module.exports = config;
