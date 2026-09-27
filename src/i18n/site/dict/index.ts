import type { SiteLang } from "../langs";
import ja, { SiteDict } from "./ja";
import en from "./en";

// まだ辞書の無い言語は日本語にフォールバックする(ENABLED_LANGS に入れるまでページは生成されない)
const DICTS: Record<SiteLang, SiteDict> = {
  ja,
  en,
  "zh-hant": ja,
  "zh-hans": ja,
  ko: ja,
};

export const getDict = (lang: SiteLang): SiteDict => DICTS[lang] ?? ja;
export type { SiteDict };
