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

/** シート由来のフォーマット名(配信SG・fullAL 等)を表示用に訳す。対応が無ければ原文のまま */
export const formatLabel = (dict: SiteDict, format: string): string => dict.formats[format] ?? format;
