// !Legit(ファンサイト本体)の多言語対応の言語定義(plan/28)。
// 美辞学ナビの i18next 設定(src/i18n/config.ts)とは別物。言語は URL だけから決める。

export const SITE_LANGS = ["ja", "en", "zh-hant", "zh-hans", "ko"] as const;
export type SiteLang = (typeof SITE_LANGS)[number];

export const DEFAULT_LANG: SiteLang = "ja";

/** 実際にページを生成する言語(日本語以外)。段階的に追加する */
export const ENABLED_LANGS: SiteLang[] = ["en"];

/** hreflang / <html lang> に使う BCP47 の値 */
export const HTML_LANG: Record<SiteLang, string> = {
  ja: "ja",
  en: "en",
  "zh-hant": "zh-Hant",
  "zh-hans": "zh-Hans",
  ko: "ko",
};

export const OG_LOCALE: Record<SiteLang, string> = {
  ja: "ja_JP",
  en: "en_US",
  "zh-hant": "zh_TW",
  "zh-hans": "zh_CN",
  ko: "ko_KR",
};

/** 日付・数値の書式に使うロケール(ブラウザ既定に任せるとハイドレーション不一致になるため常に明示する) */
export const INTL_LOCALE: Record<SiteLang, string> = {
  ja: "ja-JP",
  en: "en-US",
  "zh-hant": "zh-TW",
  "zh-hans": "zh-CN",
  ko: "ko-KR",
};

/** 言語切り替えの表示名(各言語の自称) */
export const LANG_LABEL: Record<SiteLang, string> = {
  ja: "日本語",
  en: "English",
  "zh-hant": "繁體中文",
  "zh-hans": "简体中文",
  ko: "한국어",
};

export const isSiteLang = (value: unknown): value is SiteLang =>
  typeof value === "string" && (SITE_LANGS as readonly string[]).includes(value);
