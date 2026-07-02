import type { GatsbyConfig } from "gatsby";
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const siteUrl = "https://reol.twilightea.com";
const config: GatsbyConfig = {
  siteMetadata: {
    title: "!Legit｜Reol Unofficial Fansite",
    description:
      "Reol(れをる)の非公式ファンサイト。全楽曲のライブ演奏統計、歴代ライブのセットリスト、MVロケ地(聖地)マップ、ファンタイプ診断まで。10年分の活動を横断検索できます。",
    siteUrl,
  },
  graphqlTypegen: true,
  plugins: [
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-webfonts`,
      options: {
        fonts: {
          google: [
            {
              family: "Cormorant",
              variants: ["400", "500"]
            },
            {
              family: "Noto Serif JP",
              variants: ["400", "500"]
            }
          ]
        }
      }
    },
    {
      resolve: `gatsby-plugin-typescript`,
      options: {
        isTSX: true, // defaults to false
        jsxPragma: `jsx`, // defaults to "React"
        allExtensions: true, // defaults to false
      },
    },
    "gatsby-plugin-flow",
    "gatsby-plugin-typegen",
    "gatsby-plugin-postcss",
    {
      resolve: "gatsby-plugin-robots-txt",
      options: {
        host: siteUrl,
        sitemap: `${siteUrl}/sitemap.xml`,
        // /relive/ はローカル音源前提の私的再生室なのでクロール対象から外す。
        policy: [{ userAgent: "*", allow: "/", disallow: ["/relive/", "/relive"] }],
      },
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [process.env.GA_MEASUREMENT_ID],
        pluginConfig: {
          head: true,
        },
      },
    },
    {
      resolve: "gatsby-plugin-sitemap",
      options: {
        // /relive/ は noindex なのでサイトマップにも載せない。
        excludes: ["/relive/", "/relive"],
      },
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "!Legit｜Reol Unofficial Fansite",
        short_name: "!Legit",
        start_url: "/",
        background_color: "#ffffff",
        theme_color: "#27489b",
        display: "standalone",
        icon: "src/images/favicon.png",
      },
    },
    // PWA: オフライン対応（manifest の後に置く必要あり）
    "gatsby-plugin-offline",
    {
      resolve: "gatsby-plugin-react-redux",
      options: {
        pathToCreateStoreModule: "src/redux/store",
      },
    },
  ],
};

export default config;
