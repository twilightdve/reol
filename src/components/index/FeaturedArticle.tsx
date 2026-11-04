import React from "react";
import { Link } from "gatsby";
import { trackEvent } from "../../utils/analytics";
import { formatArticleDate } from "../../utils/songArticles/format";
import { showSongKicker, splitTitleBySong } from "../../utils/songArticles/series";
import type { HomeArticle } from "./sections/HomeSection";

/**
 * HOME のいちばん上に大きく出す、いちばん新しい読みもの(plan/59 段3)。
 * スマホは表紙を全幅で上に、PC(md 以上)は表紙 3/5・題名 2/5 の横並び。
 * 表紙は記事ごとの独自デザインなので、加工せずそのままの比率で出す。歌詞が混じらないよう要約は出さない。
 */
const FeaturedArticle: React.FC<{ article: HomeArticle }> = ({ article: a }) => {
  const parts = splitTitleBySong(a.title, a.songTitle);
  const [, afterLead = "", afterBody = ""] = /^(\s*)([\s\S]*)$/.exec(parts?.after ?? "") ?? [];
  const date = formatArticleDate(a.publishedAt ?? null);
  const src = a.ogImage ?? a.cover;
  const srcSet = [a.cover ? `${a.cover} 800w` : null, a.ogImage ? `${a.ogImage} 1200w` : null].filter(Boolean).join(", ");
  return (
    <Link
      to={`/articles/${a.slug}/`}
      onClick={() => trackEvent("home_reading_click", { category: "navigation", label: `featured:${a.slug}` })}
      className="group grid overflow-hidden rounded-xl border border-bx-line transition-colors hover:border-bx-yellow md:grid-cols-[3fr_2fr]"
    >
      <span className="relative block aspect-[40/21] overflow-hidden bg-bx-line/40">
        {src ? (
          <img
            src={src}
            srcSet={srcSet || undefined}
            sizes="(min-width: 1024px) 600px, (min-width: 768px) 60vw, 100vw"
            alt=""
            width={1200}
            height={630}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center px-6 text-center text-3xl font-extrabold text-bx-ink3">
            {a.songTitle}
          </span>
        )}
      </span>
      <span className="flex flex-col justify-center gap-2.5 border-t border-bx-line p-5 md:border-l md:border-t-0 md:p-6">
        <span className="text-[10px] font-extrabold tracking-[0.3em] text-bx-yellow">NEW</span>
        {showSongKicker(a.title, a.songTitle) && (
          <span className="text-[11px] font-extrabold tracking-[0.2em] text-bx-ink3 [overflow-wrap:anywhere]">{a.songTitle}</span>
        )}
        <h3 className="text-[20px] font-bold leading-snug text-bx-ink2 sm:text-[22px] [overflow-wrap:anywhere]">
          {parts ? (
            <>
              {parts.before}
              <strong className="font-extrabold text-[1.12em] text-bx-ink">{parts.song}</strong>
              {/* 副題はひとまとまりで折り返す(「舌打/ち」のように途中で切れないように) */}
              {/* 先頭の空白は外に出す(折り返した時に2行目の頭が字下げのように見えないように) */}
              {afterLead}
              {afterBody && <span className="inline-block max-w-full">{afterBody}</span>}
            </>
          ) : (
            a.title
          )}
        </h3>
        {date && (
          <span className="text-[12px] text-bx-ink3">
            <time dateTime={a.publishedAt ?? undefined}>{date}</time> 公開
          </span>
        )}
        <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-bx-yellow px-4 py-1.5 text-[13px] font-extrabold text-bx-bg transition-opacity group-hover:opacity-90">
          読む <span aria-hidden="true">→</span>
        </span>
      </span>
    </Link>
  );
};

export default FeaturedArticle;
