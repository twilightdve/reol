import React from "react";
import { Link } from "gatsby";
import { trackEvent } from "../../utils/analytics";
import { seriesPath, tagFilterPath } from "../../utils/songArticles/series";

/**
 * 記事の末尾に置く分類(シリーズとタグ)。記事別デザインの外(下)に、サイト共通の配色で置く(plan/33)。
 * シリーズのページと、タグで絞り込んだ一覧へ進める。
 */
const ArticleTaxonomy: React.FC<{
  articleId: string;
  series: { slug: string; name: string };
  tags: string[];
}> = ({ articleId, series, tags }) => (
  <nav aria-label="この記事の分類" className="border-t border-bx-line bg-bx-bg text-bx-ink">
    <div className="container mx-auto max-w-3xl px-4 sm:px-6 py-8 text-[13px]">
      <p>
        <span className="mr-2 text-[11px] font-extrabold tracking-[0.16em] text-bx-ink3">シリーズ</span>
        <Link
          to={seriesPath(series.slug)}
          onClick={() => trackEvent("article_series_click", { category: "navigation", label: articleId })}
          className="font-bold underline underline-offset-4 hover:text-bx-blue"
        >
          {series.name}
        </Link>
      </p>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[11px] font-extrabold tracking-[0.16em] text-bx-ink3">タグ</span>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {tags.map((t) => (
              <li key={t}>
                <Link
                  to={tagFilterPath(t)}
                  onClick={() => trackEvent("article_tag_click", { category: "navigation", label: t })}
                  className="text-bx-ink2 underline underline-offset-4 hover:text-bx-blue"
                >
                  #{t}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </nav>
);

export default ArticleTaxonomy;
