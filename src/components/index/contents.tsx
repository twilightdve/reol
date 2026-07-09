import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { navigate } from "gatsby";
import { Recommend } from "../../types/recommend";
import BackToTopButton from "../common/BackToTopButton";
import { AppDispatch, RouteState } from "../../redux/store";
import { ROUTE_NAMES } from "../../types/common";
import { setRoute } from "../../redux/slices/routeSlice";
import { trackSectionView } from "../../utils/analytics";
import { HomeSection, TimelineSection } from "./sections";
import { SiteStats } from "./sections/HomeSection";

interface IndexContentsProps {
  recommend: Recommend[];
  siteStats: SiteStats;
}

const IndexContents: React.FC<IndexContentsProps> = ({
  recommend,
  siteStats,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentRoute } = useSelector((state: RouteState) => state.route);

  useEffect(() => {
    if (location.hash.length > 0) {
      const raw = location.hash.replace("#", "");

      // セクションは独立ページに切り出されたためハッシュアクセスをリダイレクト
      const sectionRedirects: Record<string, string> = {
        DISCOGRAPHY: "/discography/",
        LIVE: "/live/",
        PLACE: "/place/",
        PHOTO: "/photos/",
        PHOTOS: "/photos/",
      };
      if (sectionRedirects[raw]) {
        navigate(sectionRedirects[raw], { replace: true });
        return;
      }

      // ディープリンク: #disc-<slug> / #live-<slug> / #live-item-<slug> / #place-<slug> も独立ページへ
      if (/^live-(item-)?[\w-]+/.test(raw)) {
        navigate(`/live/#${raw}`, { replace: true });
        return;
      }
      if (/^disc-[\w-]+/.test(raw)) {
        navigate(`/discography/#${raw}`, { replace: true });
        return;
      }
      if (/^place-[\w-]+/.test(raw)) {
        navigate(`/place/#${raw}`, { replace: true });
        return;
      }

      // ここに来るのは独立ページに切り出されていないハッシュ（HOME など）
      dispatch(setRoute({ currentRoute: raw }));
    } else {
      // ハッシュ無しで / に来た場合は HOME 表示にフォールバック
      // （他ページからのナビゲーション直後に前ページの currentRoute が
      //  残ったままだと renderCurrentContents が null を返し白画面になる）
      dispatch(setRoute({ currentRoute: ROUTE_NAMES[0] }));
    }
  }, [dispatch]);

  // \u30bb\u30af\u30b7\u30e7\u30f3\u5207\u308a\u66ff\u3048\u3092\u30a2\u30ca\u30ea\u30c6\u30a3\u30af\u30b9\u3078\u8a18\u9332
  useEffect(() => {
    if (currentRoute) {
      trackSectionView(currentRoute);
    }
  }, [currentRoute]);

  const renderCurrentContents = (route: string) => {
    switch (route) {
      case ROUTE_NAMES[0]:
        return <HomeSection recommend={recommend} siteStats={siteStats} />;
      case ROUTE_NAMES[5]:
        return <TimelineSection />;
      // DISCOGRAPHY / LIVE / PLACE / PHOTO は独立ページに切り出し済み。
      // ハッシュアクセスは contents.tsx 上部の useEffect でリダイレクトされる。
      default:
        return null;
    }
  };

  return (
    <>
      <main className="relative container mx-auto px-2 w-full">
        {renderCurrentContents(currentRoute)}
      </main>
      <BackToTopButton />
    </>
  );
};

export default IndexContents;
