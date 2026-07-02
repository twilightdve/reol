import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { navigate } from "gatsby";
import { AppDispatch } from "../redux/store";
import { setRoute } from "../redux/slices/routeSlice";

interface NavigationOptions {
  scrollToTop?: boolean;
  updateHistory?: boolean;
}

// 一部のルートはハッシュではなく独立した URL を持つ。
// 該当ルートが追加されたら、このマップにエントリを追加することで
// TrackingFooter などの既存ナビゲーションから遷移できるようになる。
const ROUTE_PATHS: Record<string, string> = {
  DISCOGRAPHY: "/discography/",
  LIVE: "/live/",
  PLACE: "/place/",
  PHOTO: "/photos/",
};

export const useNavigation = (options: NavigationOptions = {}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { scrollToTop = true, updateHistory = true } = options;

  const navigateToRoute = useCallback(
    (route: string) => {
      try {
        // 独立ページに切り出されたルートは Gatsby の navigate を使う
        const dedicatedPath = ROUTE_PATHS[route];
        if (dedicatedPath) {
          if (scrollToTop) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          dispatch(setRoute({ currentRoute: route }));
          if (location.pathname !== dedicatedPath) {
            navigate(dedicatedPath);
          }
          return;
        }

        const url = route === "HOME" ? "/" : `/#${route}`;

        if ("/" === location.pathname || location.pathname.startsWith("/#")) {
          if (scrollToTop) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          dispatch(setRoute({ currentRoute: route }));

          if (updateHistory) {
            history.pushState(null, "!Legit｜Reol Unofficial Fansite", url);
          }
        } else {
          // 他のパス（例: /live/）から HOME/PHOTO 等を押した場合は
          // Gatsby の navigate でハッシュ付きトップへ遷移する
          if (scrollToTop) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          // 遷移先で currentRoute が前のページのもののままだと
          // IndexContents が該当セクションを描画できないため、ここで更新する
          dispatch(setRoute({ currentRoute: route }));
          navigate(url);
        }
      } catch (error) {
        console.error("Navigation error:", error);
        throw error; // Re-throw for error boundary
      }
    },
    [dispatch, scrollToTop, updateHistory]
  );

  return { navigateToRoute };
};
