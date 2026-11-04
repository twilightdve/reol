import React, { useCallback, useRef, useState } from "react";
import ArticleCoverCard, { ArticleCoverCardProps } from "./ArticleCoverCard";

/**
 * 表紙付きの記事カードのカルーセル(plan/59。2026-11-04 ユーザー「カルーセル形式にしない？」)。
 * スマホ・タブレットは1枚ずつ見せ、左右の矢印と下の点で切り替える(指で横にめくることもできる)。
 * gridFrom 以上の幅では全部を3列に並べる(HOME と記事の下はどちらも3本なので、PC では一度に見える)。
 * 自動では送らない(読んでいる途中で動くと読みにくく、止める操作も要るため)。
 */

type Item = ArticleCoverCardProps & { key: string };

// Tailwind がクラス名を拾えるよう、幅ごとのクラスは文字列のまま持つ
const BREAKPOINT_CLASS = {
  sm: { track: "sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible", slide: "sm:w-auto", controls: "sm:hidden" },
  md: { track: "md:grid md:grid-cols-3 md:gap-3.5 md:overflow-visible", slide: "md:w-auto", controls: "md:hidden" },
} as const;

const ArticleCarousel: React.FC<{ items: Item[]; gridFrom: keyof typeof BREAKPOINT_CLASS; label: string; className?: string }> = ({
  items,
  gridFrom,
  label,
  className = "",
}) => {
  const bp = BREAKPOINT_CLASS[gridFrom];
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  // 今いちばん左にあるカードを、カードの位置とスクロール量から決める
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(track.children) as HTMLElement[];
    let nearest = 0;
    slides.forEach((s, i) => {
      if (Math.abs(s.offsetLeft - track.offsetLeft - track.scrollLeft) < Math.abs(slides[nearest].offsetLeft - track.offsetLeft - track.scrollLeft)) nearest = i;
    });
    setIndex(nearest);
  }, []);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const slide = track?.children[i] as HTMLElement | undefined;
    if (!track || !slide) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: reduce ? "auto" : "smooth" });
  };

  if (items.length === 0) return null;
  const arrow =
    "flex h-9 w-9 items-center justify-center rounded-full border border-bx-line text-bx-ink2 transition-colors hover:border-bx-yellow hover:text-bx-yellow disabled:opacity-30 disabled:hover:border-bx-line disabled:hover:text-bx-ink2";

  return (
    <div className={className} role="region" aria-roledescription="carousel" aria-label={label}>
      <ul
        ref={trackRef}
        onScroll={onScroll}
        className={`flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${bp.track}`}
      >
        {items.map(({ key, ...card }, i) => (
          <li
            key={key}
            className={`w-full flex-shrink-0 snap-start ${bp.slide}`}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${items.length}`}
          >
            <ArticleCoverCard {...card} />
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div className={`mt-3 flex items-center justify-between gap-3 ${bp.controls}`}>
          <button type="button" className={arrow} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="前の記事">
            <span aria-hidden="true">←</span>
          </button>
          <div className="flex items-center gap-2">
            {items.map((it, i) => (
              <button
                key={it.key}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}本目を表示`}
                aria-current={i === index}
                className="flex h-6 w-6 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-bx-yellow" : "w-1.5 bg-bx-ink3"}`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            className={arrow}
            onClick={() => goTo(index + 1)}
            disabled={index === items.length - 1}
            aria-label="次の記事"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleCarousel;
