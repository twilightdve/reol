import React, { useCallback, memo, useMemo } from "react";
import { useSelector } from "react-redux";
import { RouteState } from "../../redux/store";
import { FaMusic, FaCompactDisc } from "react-icons/fa6";
import { BsSpeakerFill } from "react-icons/bs";
import { ROUTE_NAMES } from "../../types/common";
import { TbMapPinHeart } from "react-icons/tb";
import { FaPhotoVideo } from "react-icons/fa";
import { useNavigation } from "../../hooks/useNavigation";

const TrackingFooter: React.FC = () => {
  const { navigateToRoute } = useNavigation();
  const currentRoute = useSelector(
    (state: RouteState) => state.route.currentRoute
  );

  // アイコンマッピングをuseMemoで最適化
  const iconMap = useMemo(() => {
    const iconProps = {
      className: "text-sm mb-1",
      "aria-hidden": "true" as const,
    };

    return {
      [ROUTE_NAMES[0]]: <FaMusic {...iconProps} />,
      [ROUTE_NAMES[1]]: <FaCompactDisc {...iconProps} />,
      [ROUTE_NAMES[2]]: <BsSpeakerFill {...iconProps} />,
      [ROUTE_NAMES[3]]: <TbMapPinHeart {...iconProps} />,
      [ROUTE_NAMES[4]]: <FaPhotoVideo {...iconProps} />,
    };
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
        className="fixed bottom-0 z-[50] w-full bg-bx-bg/95 border-t border-bx-line backdrop-blur"
        role="navigation"
        aria-label="Main navigation"
      >
        <ul className="flex list-none w-full" role="tablist">
          {ROUTE_NAMES.map((route: string, index: number) => (
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
                      ? (index - 1 + ROUTE_NAMES.length) % ROUTE_NAMES.length
                      : (index + 1) % ROUTE_NAMES.length;
                  const nextRoute = ROUTE_NAMES[nextIndex];
                  handleNavigation(nextRoute)();
                }
              }}
              className={`relative flex flex-col items-center justify-center text-center m-auto py-2 sm:py-3 px-1 sm:px-2 w-1/6 cursor-pointer transition-all duration-200 hover:bg-white/5 active:bg-white/10 focus:outline-none focus:ring-2 focus:ring-bx-blue focus:ring-inset ${
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
