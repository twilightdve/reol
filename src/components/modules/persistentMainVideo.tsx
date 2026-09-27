import React from "react";
import { graphql, useStaticQuery } from "gatsby";
import MainVideo from "./mainVideo";
import { DiscographyWithSongs } from "../../types/discography";

/**
 * ページ遷移をまたいで MainVideo を維持するためのラッパー。
 * `gatsby-browser.tsx` / `gatsby-ssr.tsx` の `wrapPageElement` から
 * 一度だけマウントされる。
 *
 * MainVideo は xfdUrl 付き discographies のみを必要とするため、
 * 必要最小限のフィールドだけを useStaticQuery で取得する。
 */
type Props = {
  /** 初回描画時のパス。静的HTML生成時と hydrate 時で同じ画面にするため Body から渡す */
  initialPathname?: string;
};

const PersistentMainVideo: React.FC<Props> = ({ initialPathname }) => {
  const data = useStaticQuery(graphql`
    query PersistentMainVideoPlaylist {
      discography {
        discographyWithSongs {
          discographyUuid
          title
          xfdUrl
        }
      }
    }
  `);

  const playlist: DiscographyWithSongs[] = (
    data?.discography?.discographyWithSongs ?? []
  ).filter((item: DiscographyWithSongs) => item?.xfdUrl);

  return <MainVideo playlist={playlist} initialPathname={initialPathname} />;
};

export default PersistentMainVideo;
