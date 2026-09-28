// Reolファン16タイプ診断の多言語化(plan/28 第3弾)。
// 言語は他のページと同じく URL だけで決める(美辞学ナビの i18next / localStorage には依存しない)。
// 中国語・韓国語の型データと全言語の質問文は診断ページからだけ import される(types.ts を使う他ページに載せない)。
// 曲名と歌詞の一節(quote)は原文のまま。
import { useMemo } from "react";
import { useSiteLang } from "../../../i18n/site/SiteLangContext";
import type { SiteLang } from "../../../i18n/site/langs";
import { reolTypeUi, type ReolTypeUiKey } from "../../../i18n/site/pages/reolType";
import {
  axisLabels,
  getLocalizedAxisLabels,
  getLocalizedType,
  getLocalizedTypeGroup,
  type GroupCode,
  type ReolType,
  type TypeCode,
  type TypeGroup,
} from "../types";
import { questions, type Question } from "../questions";
import { questionTranslations } from "./questions";
import * as zhHant from "./types-zh-hant";
import * as zhHans from "./types-zh-hans";
import * as ko from "./types-ko";

const TRANSLATIONS = { "zh-hant": zhHant, "zh-hans": zhHans, ko } as const;

type Vars = Record<string, string | number | null | undefined>;

/** i18next と同じ `{{name}}` 形式の差し込み */
const interpolate = (text: string, vars?: Vars): string =>
  text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => (vars?.[key] ?? "").toString());

/** `t("reolType.title")` の形で引ける翻訳関数(従来の i18next の呼び出しと互換) */
export const quizT =
  (lang: SiteLang) =>
  (key: string, vars?: Vars): string => {
    const k = key.replace(/^reolType\./, "") as ReolTypeUiKey;
    const text = reolTypeUi[lang]?.[k] ?? reolTypeUi.ja[k] ?? key;
    return interpolate(text, vars);
  };

/** 診断ページ用: URL の言語で翻訳関数を返す */
export const useQuizT = () => {
  const lang = useSiteLang();
  const t = useMemo(() => quizT(lang), [lang]);
  return { t, lang };
};

const songLabelFor = (song: string, lang: SiteLang): string => {
  if (lang === "en") return `${song} type`;
  if (lang === "ko") return `${song}형`;
  return `${song}型`;
};

export const getQuizType = (code: TypeCode, lang: SiteLang): ReolType => {
  if (lang === "ja") return getLocalizedType(code, "ja");
  const base = lang === "en" ? getLocalizedType(code, "en") : getLocalizedType(code, "ja");
  const tr = lang === "en" ? null : TRANSLATIONS[lang].types[code];
  return {
    ...base,
    ...(tr ? { name: tr.name, summary: tr.summary, sections: tr.sections } : {}),
    songLabel: songLabelFor(base.song, lang),
  };
};

export const getQuizGroup = (code: GroupCode, lang: SiteLang): TypeGroup => {
  if (lang === "ja" || lang === "en") return getLocalizedTypeGroup(code, lang);
  const base = getLocalizedTypeGroup(code, "ja");
  return { ...base, ...TRANSLATIONS[lang].groups[code] };
};

export const getQuizAxisLabels = (lang: SiteLang) => {
  if (lang === "ja" || lang === "en") return getLocalizedAxisLabels(lang);
  const tr = TRANSLATIONS[lang].axes;
  const pick = (axis: keyof typeof axisLabels) => ({
    left: { ...axisLabels[axis].left, label: tr[axis].left },
    right: { ...axisLabels[axis].right, label: tr[axis].right },
    name: tr[axis].name,
  });
  return { FB: pick("FB"), GE: pick("GE"), SQ: pick("SQ"), AI: pick("AI") };
};

export const getQuizQuestions = (lang: SiteLang): Question[] => {
  const tr = questionTranslations[lang];
  if (!tr) return questions;
  return questions.map((q, i) => ({
    ...q,
    text: tr[i][0],
    optionA: { ...q.optionA, text: tr[i][1] },
    optionB: { ...q.optionB, text: tr[i][2] },
  }));
};
