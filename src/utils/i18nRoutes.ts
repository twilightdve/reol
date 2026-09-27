// 多言語ページのルート定義(plan/28)。gatsby-node とクライアントの両方から使う。
// 「どのルートが翻訳済みか」はここだけで管理する。未翻訳のルートへのリンクは日本語URLになる。

import { DEFAULT_LANG, ENABLED_LANGS, SITE_LANGS, SiteLang } from "../i18n/site/langs";

/** 翻訳済みのルート(完全一致)。段階的に追加する */
const LOCALIZED_EXACT = new Set<string>([
  "/",
  "/discography/",
  "/live/",
  "/songs/stats/",
  // 第2弾
  "/place/",
  "/about/data/",
  "/photos/",
  "/search/",
  "/welcome/",
  "/timemachine/",
]);

/** 翻訳済みのルート(パターン)。例: 曲詳細 /^\/songs\/[^/]+\/$/ */
const LOCALIZED_PATTERNS: RegExp[] = [
  /^\/songs\/[^/]+\/$/, // 曲詳細
  /^\/live\/[^/]+\/$/, // 公演詳細(ツール系ページは LOCALIZED_EXCLUDED で除外)
];

/** パターンに一致しても翻訳対象外のルート */
const LOCALIZED_EXCLUDED = new Set<string>([
  "/live/guide/",
]);

const withTrailingSlash = (pathname: string): string =>
  pathname.endsWith("/") ? pathname : `${pathname}/`;

/** "/a/b/?x=1#y" を パス部分とそれ以外(クエリ・ハッシュ)に分ける */
const splitSuffix = (path: string): { pathname: string; suffix: string } => {
  const idx = path.search(/[?#]/);
  if (idx === -1) return { pathname: path, suffix: "" };
  return { pathname: path.slice(0, idx), suffix: path.slice(idx) };
};

/** 先頭の言語プレフィックス(/en/ など)を取り除き、言語と日本語側のパスを返す */
export const stripLangPrefix = (pathname: string): { lang: SiteLang; path: string } => {
  const match = pathname.match(/^\/([a-z]{2}(?:-[a-z]{4})?)(\/.*|$)/);
  if (match) {
    const lang = match[1] as SiteLang;
    if (lang !== DEFAULT_LANG && (SITE_LANGS as readonly string[]).includes(lang)) {
      return { lang, path: match[2] || "/" };
    }
  }
  return { lang: DEFAULT_LANG, path: pathname || "/" };
};

/** 日本語側のパスが翻訳済みのルートか */
export const isLocalizedRoute = (basePath: string): boolean => {
  const path = withTrailingSlash(basePath);
  if (LOCALIZED_EXCLUDED.has(path)) return false;
  if (LOCALIZED_EXACT.has(path)) return true;
  return LOCALIZED_PATTERNS.some((re) => re.test(path));
};

/**
 * 内部リンクを指定の言語のURLにする。翻訳済みのルートなら /<lang>/... を、
 * 未翻訳のルートなら日本語URLを返す。外部URL(/ 以外で始まる)はそのまま返す。
 */
export const localizePath = (path: string, lang: SiteLang): string => {
  if (!path.startsWith("/")) return path;
  const { pathname, suffix } = splitSuffix(path);
  const base = stripLangPrefix(pathname).path;
  if (lang === DEFAULT_LANG || !ENABLED_LANGS.includes(lang) || !isLocalizedRoute(base)) {
    return `${base}${suffix}`;
  }
  return `/${lang}${base}${suffix}`;
};

/** 日本語側のパスについて、実際にページが存在する言語の一覧 */
export const availableLangsFor = (basePath: string): SiteLang[] =>
  isLocalizedRoute(basePath) ? [DEFAULT_LANG, ...ENABLED_LANGS] : [DEFAULT_LANG];
