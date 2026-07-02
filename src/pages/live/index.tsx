import React, { FC, useEffect } from "react";
import { graphql, HeadFC, PageProps } from "gatsby";
import { useDispatch } from "react-redux";
import SEO from "../../components/SEO";
import TrackingFooter from "../../components/modules/trackingFooter";
import BackToTopButton from "../../components/common/BackToTopButton";
import { LiveSection } from "../../components/index/sections";
import { LiveInfo } from "../../types/live";
import { AppDispatch } from "../../redux/store";
import { setRoute } from "../../redux/slices/routeSlice";
import { ROUTE_NAMES } from "../../types/common";
import { useDeepLinkScroll } from "../../hooks/useDeepLinkScroll";

type LivePageData = {
  site: { siteMetadata: { title: string; description: string; siteUrl: string } };
  live: { liveInfos: LiveInfo[] };
};

const LivePage: FC<PageProps<LivePageData>> = ({ data }) => {
  const dispatch = useDispatch<AppDispatch>();

  // TrackingFooter で LIVE タブをアクティブ表示にするため Redux ルートを更新
  useEffect(() => {
    dispatch(setRoute({ currentRoute: ROUTE_NAMES[2] }));
  }, [dispatch]);

  // #live-N / #live-item-N-M のディープリンク対応
  useDeepLinkScroll();

  const liveInfos = data.live.liveInfos;

  return (
    <>
      <main className="relative container mx-auto px-2 w-full">
        <LiveSection liveInfos={liveInfos} />
      </main>
      <BackToTopButton />
      <TrackingFooter />
    </>
  );
};

export default LivePage;

export const query = graphql`
  query LivePageQuery {
    site {
      siteMetadata {
        title
        description
        siteUrl
      }
    }
    live {
      liveInfos {
        liveUuid
        slug
        type
        title
        name
        date
        siteUrl
        spotifyPlaylistId
        themeColorPrimary
        themeColorSecondary
        reports {
          liveReportUuid
          liveUuid
          liveReportName
          liveReportUrl
        }
        posts {
          livePostUuid
          liveUuid
          livePostId
          livePostHTML
        }
        items {
          liveItemUuid
          slug
          liveUuid
          liveItemName
          date
          place
          placeSite
          address
          googleMapsUrl
          spotifyPlaylistId
          setList {
            liveItemSongUuid
            liveItemUuid
            songUuid
            liveItemSongName
            type
          }
          posts {
            liveItemPostUuid
            liveItemUuid
            liveItemPostId
            liveItemPostHTML
          }
        }
      }
    }
  }
`;

export const Head: HeadFC<LivePageData> = () => (
  <SEO
    title="LIVE"
    description="Reol が過去に出演したワンマンライヴ・ツアー・フェスなどの情報。各ライヴごとのセトリ、レポート、関連ポストを掲載しています。"
    path="/live/"
  />
);
