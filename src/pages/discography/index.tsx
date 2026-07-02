import React, { FC, useEffect } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import { buildBreadcrumbList } from "../../utils/jsonLd";
import TrackingFooter from "../../components/modules/trackingFooter";
import BackToTopButton from "../../components/common/BackToTopButton";
import { DiscographySection } from "../../components/index/sections";
import { DiscographyWithSongs } from "../../types/discography";
import { AppDispatch } from "../../redux/store";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";
import { useDeepLinkScroll } from "../../hooks/useDeepLinkScroll";

type DiscographyPageData = {
  site: { siteMetadata: { title: string; description: string; siteUrl: string } };
  discography: { discographyWithSongs: DiscographyWithSongs[] };
};

const DiscographyPage: FC<PageProps<DiscographyPageData>> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setRoute({ currentRoute: ROUTE_NAMES[1] }));
  }, [dispatch]);

  useDeepLinkScroll();

  const discographies = data.discography.discographyWithSongs;

  return (
    <>
      <main className="relative container mx-auto px-2 w-full">
        <DiscographySection discographies={discographies} />
      </main>
      <BackToTopButton />
      <TrackingFooter />
    </>
  );
};

export default DiscographyPage;

export const query = graphql`
  query DiscographyPageQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    discography {
      discographyWithSongs {
        discographyUuid
        slug
        title
        releaseDate
        name
        format
        siteUrl
        xfdUrl
        themeColorPrimary
        themeColorSecondary
        songs {
          songUuid
          slug
          discographyUuid
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
          discographyRepoUuid
          discographyUuid
          discographyReportName
          discographyReportUrl
        }
        posts {
          discographyPostUuid
          discographyUuid
          discographyPostId
          discographyPostHTML
        }
      }
    }
  }
`;

export const Head: HeadFC<DiscographyPageData> = () => (
  <SEO
    title="DISCOGRAPHY"
    description="Reol のこれまでのリリース情報や歌ってみた動画などを時間軸で掲載。各楽曲のリンクや楽曲解析情報も確認できます。"
    path="/discography/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "DISCOGRAPHY", path: "/discography/" },
    ])}
  />
);
