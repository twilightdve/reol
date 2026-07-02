import React, { useEffect, useState } from "react";
import type { FC, ReactNode } from "react";
import { graphql, useStaticQuery } from "gatsby";
// NOTE: Body は wrapRootElement 配下にあり Router の外側にいるため
// useLocation() は使えない (LocationContext.Provider not found エラー)。
// 代わりに globalHistory を直接購読してパスを取得する。
import { globalHistory } from "@gatsbyjs/reach-router";
import Layout from "./layout";
import TopHeader from "./header";
import PersistentMainVideo from "./persistentMainVideo";
import OfficialFooter from "./officialFooter";
import CloudImage from "../../images/cloud.png";
import WashiBackgroundImage from "../../images/washi-background.png";

type Props = {
  children: ReactNode;
};

/**
 * 美辞学ナビ (/bijigaku-navi 配下) は和紙背景・独自ヘッダーを持つ実質別サイト。
 * Reol ファンサイト側のテーマ (空グラデ背景 / TopHeader / PersistentMainVideo) を
 * 適用しないよう、ここで pathname を見て出し分ける。
 */
const isBijigakuNaviPath = (pathname: string): boolean => {
  if (!pathname) return false;
  return pathname === "/bijigaku-navi" || pathname.startsWith("/bijigaku-navi/");
};

/**
 * Reol ファンタイプ診断 (/quiz/reol-type 配下) も独自デザインを持つため
 * ファンサイトヘッダー / 動画を表示しない。
 */
const isReolTypeQuizPath = (pathname: string): boolean => {
  if (!pathname) return false;
  return (
    pathname === "/quiz/reol-type" || pathname.startsWith("/quiz/reol-type/")
  );
};

/**
 * 相関図 (/cgraph) はフルスクリーンのグラフ描画ページのため
 * ファンサイトヘッダー / 動画を表示しない。
 */
const isCGraphPath = (pathname: string): boolean => {
  if (!pathname) return false;
  return pathname === "/cgraph" || pathname.startsWith("/cgraph/");
};

/**
 * 参戦地マップ (/live/heatmap 配下) もフルスクリーンのマップ表示のため
 * ファンサイトヘッダー / 動画を表示しない。
 */
const isLiveHeatmapPath = (pathname: string): boolean => {
  if (!pathname) return false;
  return (
    pathname === "/live/heatmap" || pathname.startsWith("/live/heatmap/")
  );
};

/**
 * Relive Player (/relive 配下) も独自レイアウトの私的再生室のため
 * ファンサイトヘッダー / 動画を表示しない。
 */
const isRelivePath = (pathname: string): boolean => {
  if (!pathname) return false;
  return pathname === "/relive" || pathname.startsWith("/relive/");
};

const getInitialPathname = (): string => {
  if (typeof window !== "undefined" && window.location) {
    return window.location.pathname;
  }
  return "";
};

const Body: FC<Props> = ({ children }) => {
  const data = useStaticQuery(graphql`
    query SiteTitle {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const [pathname, setPathname] = useState<string>(getInitialPathname);

  useEffect(() => {
    // ページ遷移ごとに pathname を更新してテーマの出し分けを再評価する
    const unlisten = globalHistory.listen(({ location }: { location: { pathname: string } }) => {
      setPathname(location.pathname);
    });
    // マウント直後にも一度同期 (SSR -> hydrate 直後にズレるケース対策)
    setPathname(window.location.pathname);
    return () => {
      unlisten();
    };
  }, []);

  const isBijigakuNavi = isBijigakuNaviPath(pathname);
  const isReolTypeQuiz = isReolTypeQuizPath(pathname);
  const isCGraph = isCGraphPath(pathname);
  const isLiveHeatmap = isLiveHeatmapPath(pathname);
  const isRelive = isRelivePath(pathname);

  if (isBijigakuNavi) {
    // 美辞学ナビは独自のテーマ・ヘッダーを ReolMapLayout 側で持っているので
    // ファンサイト側のヘッダー / 動画は出さず、
    // 背景には和紙テクスチャを敷いて別サイトの雰囲気を出す。
    return (
      <>
        <div
          aria-hidden
          style={{ backgroundImage: `url(${WashiBackgroundImage})` }}
          className="fixed inset-0 -z-20 bg-repeat bg-[length:400px_400px] pointer-events-none"
        />
        <Layout title={data.site.siteMetadata.title} children={children} />
        <OfficialFooter />
      </>
    );
  }

  if (isReolTypeQuiz || isCGraph || isLiveHeatmap || isRelive) {
    // ファンタイプ診断 / 相関図 / 参戦地マップ / Relive Player はページ内で独自の背景・レイアウトを持つため
    // ファンサイト側の背景・ヘッダー・動画を一切被せずそのまま表示する。
    return <Layout title={data.site.siteMetadata.title} children={children} />;
  }

  return (
    <>
      {/*
        サイト全体の固定背景。オープニング (opening.tsx) と同じ
        「letter (ゴールド) → sky-600 → white」のグラデーション上に
        cloud.png を animate-cloud でゆっくり横方向にパンさせる。
        ページ遷移しても再描画されないよう wrapRootElement に乗せた Body 内に置く。
      */}
      <div
        aria-hidden
        className="fixed inset-0 -z-20 bg-gradient-to-br from-letter from-20% via-sky-600 via-50% to-white pointer-events-none"
      />
      <div
        aria-hidden
        style={{ backgroundImage: `url(${CloudImage})` }}
        className="fixed inset-0 -z-10 bg-cover animate-cloud opacity-70 pointer-events-none"
      />
      {/*
        ヘッダーと永続 MainVideo はページ遷移をまたいで位置/状態を保ちたいため
        ページ本体 (Layout > children) の上に出している。
        順序を TopHeader → PersistentMainVideo にして、ヘッダーが常に動画の上に位置するようにしている。
      */}
      <TopHeader title={data.site.siteMetadata.title} />
      <PersistentMainVideo />
      <Layout title={data.site.siteMetadata.title} children={children} />
      {/* 公式送客フッター。フルスクリーン系ページ(quiz/cgraph/heatmap/relive)には出さない */}
      <OfficialFooter />
    </>
  );
};

export default Body;
