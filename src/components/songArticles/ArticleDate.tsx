import React from "react";
import { formatArticleDate } from "../../utils/songArticles/format";

/**
 * 楽曲記事の日付。表示するのは作成日(原稿の作成日)と、公開後に本文を差し替えた更新日(2026-10-10 ユーザー決定)。
 * 公開日は表示しない(構造化データと一覧の並び順にだけ使う)。
 */
/** 縦書き用に、算用数字を漢数字にする(年は一字ずつ「二〇二六」、月日は「十月一日」) */
const KANJI = "〇一二三四五六七八九";
const toKanjiDate = (text: string): string =>
  text.replace(/(\d+)(年|月|日)/g, (_, num: string, unit: string) => {
    if (unit === "年") return [...num].map((d) => KANJI[Number(d)]).join("") + unit;
    const n = Number(num);
    const tens = Math.floor(n / 10);
    const ones = n % 10;
    return (tens > 1 ? KANJI[tens] : "") + (tens > 0 ? "十" : "") + (ones > 0 ? KANJI[ones] : "") + unit;
  });

const ArticleDate: React.FC<{ createdAt?: string | null; updatedAt: string | null; kanji?: boolean }> = ({
  createdAt,
  updatedAt,
  kanji = false,
}) => {
  const fmt = (iso: string | null) => {
    const t = formatArticleDate(iso);
    return t && kanji ? toKanjiDate(t) : t;
  };
  const created = fmt(createdAt ?? null);
  const updated = updatedAt ? fmt(updatedAt) : null;
  if (!created) return <>作成日未記録</>;
  return (
    <>
      <time dateTime={createdAt ?? undefined}>{created}</time> 作成
      {updated && updated !== created && (
        <>
          {" ・ "}
          <time dateTime={updatedAt ?? undefined}>{updated}</time> 更新
        </>
      )}
    </>
  );
};

export default ArticleDate;
