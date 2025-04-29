import React, { FC } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import type { IndexPageQuery } from "../gatsby-types";
import { DiscographyWithSongs } from "../types/discography";
import IndexContents from "../components/index/contents";
import { LiveInfo } from "../types/live";
import ogImage from "../images/ogimage.png";
import { Recommend } from "../types/recommend";
import { Place } from "../types/places";
import TopHeader from "../components/modules/header";
import { FaXTwitter } from "react-icons/fa6";
import { GoLinkExternal } from "react-icons/go";

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
          lyricUrl
          spotifyTrackId
          lyricMember
          musicMember
          produceMember
          etcMember
          feature {
            spotifyTrackId
            songName
            popularity
            danceability
            energy
            key
            loudness
            mode
            speechiness
            acousticness
            instrumentalness
            liveness
            valence
            tempo
            durationMs
            timeSignature
          }
        }
        reports {
          discographyId
          discographyRepoNo
          discographyReportName
          discographyReportUrl
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
        spotifyPlaylistId
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
          spotifyPlaylistId
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
    place {
      places {
        placeId
        type
        title
        url
        zoom
        items {
          placeId
          placeItemId
          name
          memo
          needsCost
          needsPermission
          placeUrl
          address
          mapsUrl
          mapsEmbedUrl
          lat
          lng
          zoom
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
  const places: Place[] = data.place.places;
  return (
    <>
      <TopHeader title={data.site.siteMetadata.title} />
      <main className="relative bg-gray-100 mx-auto inset-auto w-screen">
        <IndexContents
          discographies={discographies}
          recommend={recommend}
          liveInfos={liveInfos}
          places={places}
        />
      </main>
      <footer className="relative bg-theme text-white pt-5 h-40">
        <ul className="flex justify-around py-3">
          <li>
            <a
              href="https://twitter.com/twilightplc"
              target="_blank"
              className="flex justify-between items-end"
            >
              <FaXTwitter className="font-bold text-xl" />
              <p className="flex items-center ml-2 text-sm">
                <span>(非公式ファンサイト運営)</span>
                <GoLinkExternal className="ml-1 font-bold" />
              </p>
            </a>
          </li>
        </ul>
        <div className="text-center py-3 text-[#27489b]">
          <p className="text-xs">&copy;&nbsp;2023&nbsp;Pochi</p>
        </div>
      </footer>
    </>
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
      <body />
    </>
  );
};
