import React, { useCallback, memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { RouteState } from "../../redux/store";
import { FaMusic, FaCompactDisc, FaBookOpen } from "react-icons/fa6";
import { BsSpeakerFill } from "react-icons/bs";
import { ROUTE_NAMES } from "../../types/common";
import { TbMapPinHeart } from "react-icons/tb";
import { useNavigation } from "../../hooks/useNavigation";
import { useSiteLang } from "../../i18n/site/SiteLangContext";
import { DEFAULT_LANG } from "../../i18n/site/langs";
import { stripLangPrefix } from "../../utils/i18nRoutes";

type Props = {
  /** 今のパス。読みもの(/articles/ 以下)を開いている時は READING を選択中にする */
  pathname?: string;
};

const TrackingFooter: React.FC<Props> = ({ pathname = "" }) => {
  const { navigateToRoute } = useNavigation();
  const selectedRoute = useSelector(
    (state: RouteState) => state.route.currentRoute
  );
  // 読みものは日本語だけなので、ほかの言語ではタブを出さない(plan/59)
  const lang = useSiteLang();
  const routes = useMemo(
    () => ROUTE_NAMES.filter((r) => r !== "READING" || lang === DEFAULT_LANG),
    [lang]
  );
  // 記事のページは Redux の currentRoute を更新しないので、パスで決める
  const currentRoute = stripLangPrefix(pathname || "/").path.startsWith("/articles/")
    ? "READING"
    : selectedRoute;

  // アイコンマッピングをuseMemoで最適化
  const iconMap = useMemo(() => {
    const iconProps = {
      className: "text-sm mb-1",
      "aria-hidden": "true" as const,
    };

    const icons: Record<string, JSX.Element> = {
      HOME: <FaMusic {...iconProps} />,
      READING: <FaBookOpen {...iconProps} />,
      DISCOGRAPHY: <FaCompactDisc {...iconProps} />,
      LIVE: <BsSpeakerFill {...iconProps} />,
      PLACE: <TbMapPinHeart {...iconProps} />,
    };
    return icons;
  }, []);

  const renderIcon = useCallback(
    (route: string): JSX.Element | null => {
      return iconMap[route] || null;
    },
    [iconMap]
  );

  const handleNavigation = useCallback(
    (route: string) => () => {
      try {
        navigateToRoute(route);
      } catch (error) {
        console.error("Navigation error:", error);
        // エラーを再スローしてエラーバウンダリーに委ねる
        throw error;
      }
    },
    [navigateToRoute]
  );

  try {
    return (
      <nav
        className="fixed bottom-0 z-[50] w-full md:hidden bg-bx-bg/95 border-t border-bx-line backdrop-blur pb-[env(safe-area-inset-bottom)]"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* 各タブの幅は文字の長さ+余りを等分(flex-auto)。同じ幅だと DISCOGRAPHY だけ長く、ほかの間が空いて見える。
            PHOTO を外してタブが 5 つになったので、短縮表示(DISCO)はやめて DISCOGRAPHY に戻した(2026-11-14 ユーザー指定) */}
        <ul className="flex list-none w-full" role="tablist">
          {routes.map((route: string, index: number) => (
            <li
              key={`route-${route}`}
              role="tab"
              tabIndex={currentRoute === route ? 0 : -1}
              aria-selected={currentRoute === route}
              aria-label={`Navigate to ${route} section`}
              onClick={handleNavigation(route)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNavigation(route)();
                } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault();
                  const nextIndex =
                    e.key === "ArrowLeft"
                      ? (index - 1 + routes.length) % routes.length
                      : (index + 1) % routes.length;
                  const nextRoute = routes[nextIndex];
                  handleNavigation(nextRoute)();
                }
              }}
              className={`relative flex flex-col items-center justify-center text-center py-2 sm:py-3 px-1 sm:px-2 flex-auto cursor-pointer transition-all duration-200 hover:bg-bx-surface/5 active:bg-bx-surface/10 focus:outline-none focus:ring-2 focus:ring-bx-blue focus:ring-inset ${
                currentRoute === route
                  ? "text-bx-yellow before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:bg-bx-yellow"
                  : "text-bx-ink2"
              }`}
            >
              {renderIcon(route)}
              <span className="text-[0.6rem] leading-4">{route}</span>
            </li>
          ))}
        </ul>
      </nav>
    );
  } catch (error) {
    console.error("TrackingFooter render error:", error);
    return (
      <nav className="fixed bottom-0 z-[50] w-full bg-red-100 p-2">
        <p className="text-center text-red-600 text-sm">
          Navigation error occurred. Please refresh the page.
        </p>
      </nav>
    );
  }
};

export default memo(TrackingFooter);
