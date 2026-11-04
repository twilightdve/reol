import React, { useCallback, useEffect, useRef, useState } from "react";
import ArticleCoverCard, { ArticleCoverCardProps } from "./ArticleCoverCard";

/**
 * 表紙付きの記事カードのカルーセル(plan/59)。
 * - 2026-11-04 ユーザー「カルーセル形式にしない？」「時間経過で自動で次を表示するようにしてね」
 * - 左右の矢印と下の点で切り替え、指で横にめくることもできる(scroll-snap)。
 * - AUTOPLAY_MS ごとに次へ送り、最後まで来たら先頭に戻る。
 * - 自動送りを止める時:
 *   - 触れている・マウスを載せている・キーボードで中にいる間
 *   - 画面の外にある時、タブが裏にある時
 *   - 「視差効果を減らす」の設定の時(この時は最初から送らない)
 *   - 一時停止ボタン(動き続けるものには止める手段が要る)
 *
 * layout:
 * - "home": どの幅でもカルーセル。スマホ1枚・sm 2枚・md 3枚ずつ見せる(HOME は10本)。
 * - "related": 記事の下の「その他の記事」(3本)。スマホだけカルーセルで、sm 以上は3列に並べる。
 */

type Item = ArticleCoverCardProps & { key: string };

const AUTOPLAY_MS = 5000;

// Tailwind がクラス名を拾えるよう、レイアウトごとのクラスは文字列のまま持つ
const LAYOUT_CLASS = {
  home: {
    track: "",
    slide: "w-full sm:w-[calc((100%-0.75rem)/2)] md:w-[calc((100%-1.5rem)/3)]",
    controls: "",
  },
  related: {
    track: "sm:grid sm:grid-cols-3 sm:overflow-visible",
    slide: "w-full sm:w-auto",
    controls: "sm:hidden",
  },
} as const;

const ArticleCarousel: React.FC<{ items: Item[]; layout: keyof typeof LAYOUT_CLASS; label: string; className?: string }> = ({
  items,
  layout,
  label,
  className = "",
}) => {
  const lc = LAYOUT_CLASS[layout];
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // 先頭に置ける位置の数(1画面に何枚見えるかで変わる。10本・3枚ずつなら8)
  const [positions, setPositions] = useState(items.length);
  const [paused, setPaused] = useState(false); // 一時停止ボタン
  const [holding, setHolding] = useState(false); // 触れている・マウスを載せている・フォーカスがある間
  const [visible, setVisible] = useState(false); // 画面に入っていて、タブが表にある
  const [reduceMotion, setReduceMotion] = useState(false);

  const slideLeft = (track: HTMLUListElement, slide: HTMLElement) => slide.offsetLeft - track.offsetLeft;

  // 今いちばん左にあるカードと、先頭に置ける位置の数を、カードの位置とスクロール量から決める
  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = Array.from(track.children) as HTMLElement[];
    if (slides.length === 0) return;
    const maxLeft = track.scrollWidth - track.clientWidth;
    const reachable = slides.filter((s) => slideLeft(track, s) <= maxLeft + 2).length;
    setPositions(Math.max(1, reachable));
    let nearest = 0;
    slides.forEach((s, i) => {
      if (Math.abs(slideLeft(track, s) - track.scrollLeft) < Math.abs(slideLeft(track, slides[nearest]) - track.scrollLeft)) nearest = i;
    });
    // 右端まで来ている時は最後の位置(1画面に複数枚ある時、最後のカードは左端に来ない)
    setIndex(track.scrollLeft >= maxLeft - 2 ? Math.max(0, reachable - 1) : Math.min(nearest, reachable - 1));
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      const slide = track?.children[i] as HTMLElement | undefined;
      if (!track || !slide) return;
      track.scrollTo({ left: slideLeft(track, slide), behavior: reduceMotion ? "auto" : "smooth" });
    },
    [reduceMotion]
  );

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, items.length]);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  // 画面に入っている間だけ送る(タブが裏にある時も止める)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let inView = false;
    const update = () => setVisible(inView && document.visibilityState === "visible");
    const io = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([e]) => { inView = e.isIntersecting; update(); }, { threshold: 0.5 })
      : null;
    io?.observe(root);
    document.addEventListener("visibilitychange", update);
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  // カルーセルとして動いている幅か(related は sm 以上で3列に並ぶので送らない)
  const isCarousel = () => controlsRef.current?.offsetParent != null;
  const autoplay = !paused && !holding && visible && !reduceMotion && positions > 1;
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => {
      if (isCarousel()) goTo(index + 1 >= positions ? 0 : index + 1);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, index, positions, goTo]);

  if (items.length === 0) return null;
  const arrow =
    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-bx-line text-bx-ink2 transition-colors hover:border-bx-yellow hover:text-bx-yellow disabled:opacity-30 disabled:hover:border-bx-line disabled:hover:text-bx-ink2";

  return (
    <div
      ref={rootRef}
      className={className}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      // マウスの時だけ(iPhone はタップでも mouseenter が来て、mouseleave が来ないまま止まり続けるため)
      onPointerEnter={(e) => e.pointerType === "mouse" && setHolding(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHolding(false)}
      onFocus={() => setHolding(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHolding(false);
      }}
      onTouchStart={() => setHolding(true)}
      onTouchEnd={() => setHolding(false)}
    >
      <ul
        ref={trackRef}
        onScroll={measure}
        // 自動で送っている間は読み上げで割り込まない(止めている時だけ変化を伝える)
        aria-live={autoplay ? "off" : "polite"}
        className={`flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${lc.track}`}
      >
        {items.map(({ key, ...card }, i) => (
          <li
            key={key}
            className={`flex-shrink-0 snap-start ${lc.slide}`}
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${items.length}`}
          >
            <ArticleCoverCard {...card} />
          </li>
        ))}
      </ul>
      {items.length > 1 && (
        <div ref={controlsRef} className={`mt-3 flex items-center gap-2 ${lc.controls}`}>
          <button type="button" className={arrow} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="前の記事">
            <span aria-hidden="true">←</span>
          </button>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center">
            {Array.from({ length: positions }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}本目から表示`}
                aria-current={i === index}
                className="flex h-6 w-5 items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className={`block h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-bx-yellow" : "w-1.5 bg-bx-ink3"}`}
                />
              </button>
            ))}
          </div>
          {!reduceMotion && (
            <button
              type="button"
              className={arrow}
              onClick={() => setPaused((p) => !p)}
              aria-pressed={paused}
              aria-label={paused ? "自動で送るのを再開" : "自動で送るのを止める"}
            >
              {paused ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M6.5 4.5h4v15h-4zM13.5 4.5h4v15h-4z" fill="currentColor" />
                </svg>
              )}
            </button>
          )}
          <button
            type="button"
            className={arrow}
            onClick={() => goTo(index + 1)}
            disabled={index >= positions - 1}
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
