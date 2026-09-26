import React, { useEffect, useState } from "react";
import type { FC, ReactNode } from "react";
import { graphql, useStaticQuery } from "gatsby";
// NOTE: Body は wrapRootElement 配下にあり Router の外側にいるため
// useLocation() は使えない (LocationContext.Provider not found エラー)。
// 代わりに globalHistory を直接購読してパスを取得する。
import { globalHistory } from "@gatsbyjs/reach-router";
import { Toaster } from "react-hot-toast";
import Layout from "./layout";
import TopHeader from "./header";
import PersistentMainVideo from "./persistentMainVideo";
import OfficialFooter from "./officialFooter";
import TrackingFooter from "./trackingFooter";
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
 * 相関図 (/cgraph) はフルスクリーンのグラフ描画ページ。ヘッダー/mainVideoは
 * 表示して遷移後も動画再生を継続できるようにするが、下部の送客フッター/
 * タブバーは可視領域を圧迫するため出さない。
 */
const isCGraphPath = (pathname: string): boolean => {
  if (!pathname) return false;
  return pathname === "/cgraph" || pathname.startsWith("/cgraph/");
};

/**
 * 開催地マップ (/live/heatmap 配下) もフルスクリーンのマップ表示。
 * isCGraphPath と同様、ヘッダー/mainVideoは表示し送客フッター/タブバーのみ出さない。
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

/**
 * デザインプレビュー (/design-preview 配下) はリデザインA/B案(plan/15)の
 * モックページで、ページ側が完全に独自のヘッダー・背景を持つため
 * ファンサイト側のテーマを被せない。
 */
const isDesignPreviewPath = (pathname: string): boolean => {
  if (!pathname) return false;
  return (
    pathname === "/design-preview" || pathname.startsWith("/design-preview/")
  );
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
  const isDesignPreview = isDesignPreviewPath(pathname);

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

  if (isReolTypeQuiz || isRelive || isDesignPreview) {
    // ファンタイプ診断 / Relive Player / デザインプレビューはページ内で独自の背景・レイアウトを持つため
    // ファンサイト側の背景・ヘッダー・動画を一切被せずそのまま表示する。
    return <Layout title={data.site.siteMetadata.title} children={children} />;
  }

  // 相関図 / 開催地マップはフルスクリーンのビジュアライゼーションのため、
  // 可視領域を圧迫する送客フッター/下部タブ/固定背景グローは出さない。
  // ただし TopHeader / PersistentMainVideo は「通常ページ」と全く同じ
  // JSXツリー上の位置に置き続けること。isCGraph/isLiveHeatmap によって
  // early return で別のフラグメントに分けてしまうと、Reactがこの2つを
  // 別コンポーネントとして扱い、HOME→/cgraph/のような遷移時に
  // PersistentMainVideo(ひいては再生中のiframe)がアンマウント→再マウント
  // され、遷移をまたいだ動画再生の継続が壊れる。
  const isFullscreenViz = isCGraph || isLiveHeatmap;

  return (
    <>
      {!isFullscreenViz && (
        <>
          {/*
            サイト全体の固定背景(B案リデザイン: plan/16)。
            ほぼ黒 bx-bg の上に、公式ブルー(#27489b)のラジアルグローを上部に敷く。
            ページ遷移しても再描画されないよう wrapRootElement に乗せた Body 内に置く。
          */}
          <div
            aria-hidden
            className="fixed inset-0 -z-20 bg-bx-bg pointer-events-none"
          />
          <div
            aria-hidden
            className="fixed inset-0 -z-10 pointer-events-none bx-hero-glow"
          />
        </>
      )}
      {/*
        ヘッダーと永続 MainVideo はページ遷移をまたいで位置/状態を保ちたいため
        ページ本体 (Layout > children) の上に出している。
        順序を TopHeader → PersistentMainVideo にして、ヘッダーが常に動画の上に位置するようにしている。
      */}
      <TopHeader title={data.site.siteMetadata.title} />
      <Toaster position="top-center" />
      <PersistentMainVideo />
      <div
        className={
          isFullscreenViz
            ? ""
            : "pb-[calc(3.5rem+env(safe-area-inset-bottom))]"
        }
      >
        <Layout title={data.site.siteMetadata.title} children={children} />
        {/* 公式送客フッター。フルスクリーン系ページ(quiz/cgraph/heatmap/relive)には出さない */}
        {!isFullscreenViz && <OfficialFooter />}
      </div>
      {/* 下部タブ常設(バッチ7e)。フルスクリーン系ページ(quiz/cgraph/heatmap/relive/design-preview/bijigaku-navi)には出さない */}
      {!isFullscreenViz && <TrackingFooter />}
    </>
  );
};

export default Body;
