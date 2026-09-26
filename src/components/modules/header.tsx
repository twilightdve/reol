import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import UtilityService from "../../services/UtilityService";
import { Link } from "gatsby";
import { FiSearch, FiSun, FiMoon, FiUser } from "react-icons/fi";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../contexts/AuthContext";
import { MyPageMenu } from "../auth/MyPageMenu";
import { GuestMenu } from "../auth/GuestMenu";

type Props = {
  title: string;
};

const NAV_ITEMS = [
  { label: "DISCOGRAPHY", to: "/discography/" },
  { label: "LIVE", to: "/live/" },
  { label: "PLACE", to: "/place/" },
  { label: "PHOTO", to: "/photos/" },
];

// スマホ幅のヘッダーでも収まるよう、ニックネームは8文字を超えたら切って...を付ける
// (検索アイコン・テーマ切替・ユーザーアイコンと並ぶため、確保できる横幅が狭いため)
const NICKNAME_MAX_LENGTH = 8;
const truncateNickname = (name: string): string =>
  name.length > NICKNAME_MAX_LENGTH ? `${name.slice(0, NICKNAME_MAX_LENGTH)}...` : name;

const TopHeader: React.FC<Props> = ({ title }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  // マイページ/メニューはSSR時のHTMLに含めない。マウント後にbody直下へ
  // portalで描画する。
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="relative z-40 h-16">
      <nav className="bg-bx-bg/80 backdrop-blur border-b border-bx-line">
        <div className="w-full flex items-center justify-between mx-auto p-4">
          <Link to="/" className="flex items-baseline gap-2.5 flex-shrink min-w-0">
            <span className="self-center text-2xl sm:text-3xl font-icon font-medium whitespace-nowrap text-bx-ink">
              !Legit
            </span>
            <span className="text-[10px] font-bold tracking-[0.24em] hidden sm:inline text-bx-ink2">
              REOL UNOFFICIAL FANSITE
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-5 flex-shrink-0">
            <nav className="hidden md:flex items-center gap-4 sm:gap-5">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-[11.5px] font-bold tracking-widest whitespace-nowrap text-bx-ink2 hover:text-bx-blue transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            {/* 統合検索 */}
            <Link
              to="/search/"
              className="flex items-center px-2 sm:px-3 py-1 text-xs bg-bx-yellow text-bx-bg rounded-full hover:opacity-90 transition-opacity whitespace-nowrap font-medium"
              title="楽曲・LIVE・ロケ地を横断検索"
              aria-label="検索"
            >
              <FiSearch className="text-sm sm:mr-1" />
              <span className="hidden sm:inline">検索</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex-shrink-0 text-bx-ink2 hover:text-bx-ink transition-colors"
              aria-label={theme === "light" ? "ダークモードに切替" : "ライトモードに切替"}
              title={theme === "light" ? "ダークモードに切替" : "ライトモードに切替"}
            >
              {theme === "light" ? (
                <FiMoon className="text-xl" />
              ) : (
                <FiSun className="text-xl" />
              )}
            </button>
            {mounted && (
              <button
                type="button"
                onClick={() => setShowMenu(true)}
                className="flex items-center gap-1 flex-shrink-0 text-bx-ink2 hover:text-bx-ink transition-colors"
                title={user ? "マイページ" : "メニュー"}
                aria-label={user ? "マイページ" : "メニュー"}
              >
                {user && (
                  <span className="text-[11.5px] font-bold tracking-widest whitespace-nowrap">
                    {truncateNickname(user.username)}
                  </span>
                )}
                <FiUser className="text-xl" />
              </button>
            )}
          </div>
          {mounted &&
            showMenu &&
            typeof document !== "undefined" &&
            createPortal(
              user ? (
                <MyPageMenu onClose={() => setShowMenu(false)} />
              ) : (
                <GuestMenu onClose={() => setShowMenu(false)} />
              ),
              document.body
            )}
        </div>
      </nav>
    </header>
  );
};

export default TopHeader;
