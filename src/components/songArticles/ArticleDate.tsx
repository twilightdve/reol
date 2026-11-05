import React from "react";
import { formatArticleDate } from "../../utils/songArticles/format";

/**
 * 楽曲記事の日付。表示するのは公開日と、公開後に本文を差し替えた更新日(同じ日なら更新は出さない)。
 * 2026-11-05 から作成日(原稿の Google ドキュメントの作成日)はやめた。原稿は 10/1〜10/4 にまとめて作ったため、
 * どの記事もほぼ同じ日付になる(ユーザー指摘「全ての記事が作成日10/2になってるのはおかしい」)。一覧のカードと同じ公開日に揃える。
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

const ArticleDate: React.FC<{ publishedAt: string | null; updatedAt: string | null; kanji?: boolean }> = ({
  publishedAt,
  updatedAt,
  kanji = false,
}) => {
  const fmt = (iso: string | null) => {
    const t = formatArticleDate(iso);
    return t && kanji ? toKanjiDate(t) : t;
  };
  const published = fmt(publishedAt);
  const updated = updatedAt ? fmt(updatedAt) : null;
  // 限定公開・プレビューの記事は公開日がまだ無い
  if (!published) return <>公開前</>;
  return (
    <>
      <time dateTime={publishedAt ?? undefined}>{published}</time> 公開
      {updated && updated !== published && (
        <>
          {" ・ "}
          <time dateTime={updatedAt ?? undefined}>{updated}</time> 更新
        </>
      )}
    </>
  );
};

export default ArticleDate;
