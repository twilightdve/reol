import type { GatsbyConfig } from "gatsby";
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const siteUrl = "https://reol.twilightea.com";
const config: GatsbyConfig = {
  siteMetadata: {
    title: "!Legit｜Reol Unofficial Fansite",
    description:
      "当サイトは、アーティスト「Reol(REOL/あにょすぺにょすゃゃ/れをる)」の非公式ファンサイトです。自己満足的な推し活の一環として独自にReolに関する情報を発信していきますので、内容に偏りや間違いなどあるかもしれませんが、もしご興味あればご覧ください。",
    siteUrl,
  },
  graphqlTypegen: true,
  plugins: [
    `gatsby-plugin-sass`,
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
        policy: [{ userAgent: "*", allow: "/" }],
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
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/favicon.png",
      },
    },
    {
      resolve: "gatsby-plugin-react-redux",
      options: {
        pathToCreateStoreModule: "src/redux/store",
      },
    },
  ],
};

export default config;
