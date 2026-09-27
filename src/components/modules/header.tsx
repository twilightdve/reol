import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import UtilityService from "../../services/UtilityService";
import { Link } from "gatsby";
import { FiSearch, FiSun, FiMoon, FiUser, FiGlobe } from "react-icons/fi";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../contexts/AuthContext";
import { MyPageMenu } from "../auth/MyPageMenu";
import { GuestMenu } from "../auth/GuestMenu";
import { LangLink, useDict, useSiteLang } from "../../i18n/site/SiteLangContext";
import { DEFAULT_LANG, ENABLED_LANGS, LANG_LABEL, SiteLang } from "../../i18n/site/langs";
import { isLocalizedRoute, localizePath, stripLangPrefix } from "../../utils/i18nRoutes";

type Props = {
  title: string;
  /** 現在のパス(言語切り替えの遷移先を決めるため Body から渡す) */
  pathname: string;
};

/**
 * 言語切り替えの遷移先。いまのページに翻訳があればその言語版へ、無ければその言語のトップへ。
 * どちらも無い言語は null(選択肢に出さない)。
 */
const langTarget = (basePath: string, lang: SiteLang): string | null => {
  if (lang === DEFAULT_LANG) return basePath;
  if (isLocalizedRoute(basePath)) return localizePath(basePath, lang);
  if (isLocalizedRoute("/")) return localizePath("/", lang);
  return null;
};

const LanguageSwitcher: React.FC<{ pathname: string }> = ({ pathname }) => {
  const current = useSiteLang();
  const dict = useDict();
  const [open, setOpen] = useState(false);
  const basePath = stripLangPrefix(pathname || "/").path;
  const options = ([DEFAULT_LANG, ...ENABLED_LANGS] as SiteLang[])
    .map((lang) => ({ lang, to: langTarget(basePath, lang) }))
    .filter((o): o is { lang: SiteLang; to: string } => o.to !== null);
  if (options.length <= 1) return null;
  return (
    <div className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-bx-ink2 hover:text-bx-ink transition-colors"
        aria-label={dict.header.language}
        aria-expanded={open}
        title={dict.header.language}
      >
        <FiGlobe className="text-xl" />
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 min-w-[8rem] rounded-md border border-bx-line bg-bx-bg shadow-lg py-1 z-50">
          {options.map((o) => (
            <li key={o.lang}>
              <Link
                to={o.to}
                hrefLang={o.lang}
                onClick={() => setOpen(false)}
                className={`block px-3 py-1.5 text-xs whitespace-nowrap hover:bg-bx-surface/10 ${
                  o.lang === current ? "text-bx-yellow font-bold" : "text-bx-ink2"
                }`}
              >
                {LANG_LABEL[o.lang]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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

const TopHeader: React.FC<Props> = ({ title, pathname }) => {
  const dict = useDict();
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
          <LangLink to="/" className="flex items-baseline gap-2.5 flex-shrink min-w-0">
            <span className="self-center text-2xl sm:text-3xl font-icon font-medium whitespace-nowrap text-bx-ink">
              !Legit
            </span>
            <span className="text-[10px] font-bold tracking-[0.24em] hidden sm:inline text-bx-ink2">
              REOL UNOFFICIAL FANSITE
            </span>
          </LangLink>

          <div className="flex items-center gap-4 sm:gap-5 flex-shrink-0">
            <nav className="hidden md:flex items-center gap-4 sm:gap-5">
              {NAV_ITEMS.map((item) => (
                <LangLink
                  key={item.label}
                  to={item.to}
                  className="text-[11.5px] font-bold tracking-widest whitespace-nowrap text-bx-ink2 hover:text-bx-blue transition-colors"
                >
                  {item.label}
                </LangLink>
              ))}
            </nav>
            {/* 統合検索 */}
            <LangLink
              to="/search/"
              className="flex items-center px-2 sm:px-3 py-1 text-xs bg-bx-yellow text-bx-bg rounded-full hover:opacity-90 transition-opacity whitespace-nowrap font-medium"
              title={dict.header.searchTitle}
              aria-label={dict.header.search}
            >
              <FiSearch className="text-sm sm:mr-1" />
              <span className="hidden sm:inline">{dict.header.search}</span>
            </LangLink>
            <LanguageSwitcher pathname={pathname} />
            <button
              type="button"
              onClick={toggleTheme}
              className="flex-shrink-0 text-bx-ink2 hover:text-bx-ink transition-colors"
              aria-label={theme === "light" ? dict.header.toDark : dict.header.toLight}
              title={theme === "light" ? dict.header.toDark : dict.header.toLight}
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
                title={user ? dict.header.myPage : dict.header.menu}
                aria-label={user ? dict.header.myPage : dict.header.menu}
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
