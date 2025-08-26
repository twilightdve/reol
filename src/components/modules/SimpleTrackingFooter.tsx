import React, { memo } from "react";
import { FaMusic, FaCompactDisc } from "react-icons/fa6";
import { BsSpeakerFill } from "react-icons/bs";
import { TbMapPinHeart } from "react-icons/tb";
import { FaPhotoVideo, FaCalendarAlt } from "react-icons/fa";

const ROUTE_NAMES = [
  "HOME",
  "DISCOGRAPHY",
  "LIVE",
  "PLACE",
  "PHOTO",
  "TIMELINE",
];

type Props = {
  currentRoute: string;
  onNavigate: (route: string) => void;
};

const SimpleTrackingFooter: React.FC<Props> = ({
  currentRoute,
  onNavigate,
}) => {
  const iconMap: { [key: string]: JSX.Element } = {
    HOME: <FaMusic className="text-sm mb-1" />,
    DISCOGRAPHY: <FaCompactDisc className="text-sm mb-1" />,
    LIVE: <BsSpeakerFill className="text-sm mb-1" />,
    PLACE: <TbMapPinHeart className="text-sm mb-1" />,
    PHOTO: <FaPhotoVideo className="text-sm mb-1" />,
    TIMELINE: <FaCalendarAlt className="text-sm mb-1" />,
  };

  const renderIcon = (route: string): JSX.Element | null => {
    return iconMap[route] || null;
  };

  const handleNavigation = (route: string) => () => {
    onNavigate(route);
  };

  return (
    <nav
      className="fixed bottom-0 z-[50] w-full shadow-[0px_-1px_6px_0px_rgba(0,0,0,0.3)]"
      role="navigation"
      aria-label="Main navigation"
    >
      <ul className="flex list-none w-full" role="tablist">
        {ROUTE_NAMES.map((route: string) => (
          <li
            key={`route-${route}`}
            role="tab"
            aria-selected={currentRoute === route}
            aria-label={`Navigate to ${route} section`}
            onClick={handleNavigation(route)}
            className={`flex flex-col items-center justify-center text-center m-auto py-2 sm:py-3 px-1 sm:px-2 w-1/6 cursor-pointer transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset ${
              currentRoute === route
                ? "bg-theme text-white shadow-inner"
                : "bg-white text-gray-800"
            }`}
          >
            {renderIcon(route)}
            <span className="text-[0.6rem] leading-4">{route}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default memo(SimpleTrackingFooter);
