import type { SiteLang } from "../langs";
import ja, { SiteDict } from "./ja";
import en from "./en";
import zhHant from "./zh-hant";
import zhHans from "./zh-hans";
import ko from "./ko";

const DICTS: Record<SiteLang, SiteDict> = {
  ja,
  en,
  "zh-hant": zhHant,
  "zh-hans": zhHans,
  ko,
};

export const getDict = (lang: SiteLang): SiteDict => DICTS[lang] ?? ja;
export type { SiteDict };

/** シート由来のフォーマット名(配信SG・fullAL 等)を表示用に訳す。対応が無ければ原文のまま */
export const formatLabel = (dict: SiteDict, format: string): string => dict.formats[format] ?? format;
