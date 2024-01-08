import React, { FC } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import type { IndexPageQuery } from "../gatsby-types";
import { DiscographyWithSongs } from "../types/discography";
import { News } from "../types/news";
import IndexContents from "../components/index/index-contents";
import { LiveInfo } from "../types/live";
import ogImage from "../images/ogimage.png";
import { Recommend } from "../types/recommend";

type siteMetadata = {
  title: string;
  descriptiion: string;
  siteUrl: string;
};

export const query = graphql`
  query IndexPage {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    recommend {
      recommend {
        no
        id
      }
    }
    discography {
      discographyWithSongs {
        discographyId
        title
        releaseDate
        name
        format
        siteUrl
        xfdUrl
        songs {
          songId
          discographyId
          discographyTitle
          songNo
          songName
          tieupDescription
          downloadUrl
          musicVideoUrl
          lyricVideoUrl
          liveVideoUrl
        }
        posts {
          discographyId
          discographyPostNo
          discographyPostId
          discographyPostHTML
        }
      }
    }
    live {
      liveInfos {
        liveId
        type
        title
        name
        date
        siteUrl
        reports {
          liveId
          liveReportNo
          liveReportName
          liveReportUrl
        }
        posts {
          liveId
          livePostNo
          livePostId
          livePostHTML
        }
        items {
          liveId
          liveItemNo
          liveItemName
          date
          place
          placeSite
          address
          googleMapsUrl
          setList {
            liveId
            liveItemNo
            liveItemSongNo
            liveItemSongName
          }
          posts {
            liveId
            liveItemNo
            liveItemPostNo
            liveItemPostId
            liveItemPostHTML
          }
        }
      }
    }
  }
`;

const IndexPage: FC<PageProps<IndexPageQuery>> = ({ data }) => {
  const discographies: DiscographyWithSongs[] =
    data.discography.discographyWithSongs;
  const recommend: Recommend[] = data.recommend.recommend;
  const liveInfos: LiveInfo[] = data.live.liveInfos;
  return (
    <IndexContents
      discographies={discographies}
      recommend={recommend}
      liveInfos={liveInfos}
    />
  );
};

export default IndexPage;

export const Head: HeadFC<PageProps<IndexPageQuery>> = ({ data }) => {
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
    </>
  );
};
