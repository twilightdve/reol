import React, { FC } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import type { Fs20240817PageQuery } from "../../../gatsby-types";
import ogImage from "../../images/ogimage.png";
import { fs20240817 } from "../../components/fs/20240817";

type siteMetadata = {
  title: string;
  descriptiion: string;
  siteUrl: string;
};

export const query = graphql`
  query Fs20240817Page {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
  }
`;

const Fs20240817Page: FC<PageProps<Fs20240817PageQuery>> = ({ data }) => {
  return fs20240817();
};

export default Fs20240817Page;

export const Head: HeadFC<PageProps<Fs20240817PageQuery>> = ({ data }) => {
  const siteMetadata: siteMetadata = data.site.siteMetadata;
  return (
    <>
      <html lang="ja" />
      <title>{siteMetadata.title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content={siteMetadata.title} />
      <meta property="og:description" content={siteMetadata.descriptiion} />
      <meta property="og:image" content={siteMetadata.siteUrl + ogImage} />
      <meta property="og:url" content={siteMetadata.siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteMetadata.title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@twilightplc" />
      <link rel="canonical" href={siteMetadata.siteUrl} />
      <body />
    </>
  );
};
