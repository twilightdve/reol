/**
 * 楽曲記事「水底游歩道」(reol-song-015)の記事別デザイン。設計の根拠は plan/54。
 *
 * - 記事を読み進めることが、水の底へ下りていくことになる。地は節ごとに沈む: 表紙の水面近くの明るさ → 青 → 灰を帯びた深い色 → 黒。
 *   色は『-nil-／極彩色』の16曲の輪で「水底游歩道」に当てた 青・白・灰・黒(012)だけ。
 * - 表紙: 明朝の題名が一文字ずつ少しずつ沈み、水面からの光の筋が差す。題名の下から、点線の道(游歩道)が水底へ下りていく。
 * - 段落5の後: 光の差す中を、月が白・灰・黒と色を変えながら深く沈む(本文「月の色も白から灰、黒へ」)。
 * - 段落11の後: 水面の近くまで浮かんでは、また深く潜る一本の線(本文「夢と覚醒の間を行き来する」)。
 * - 段落13の後: 手紙の行が右へ行くほど途切れ、ほどけた欠片が沈んでいく(本文「言葉や手紙も、水に濡れ、滲み、やがて溶かされていく」)。
 *   012 の水彩のにじみ・色見本とは別の表現にするため、ぼかしは使わず、線の切れ目と沈みで描く。
 * - 段落27(要の一文)を大きく。結びの後、水底に点線の道が横へ続く。
 * - 歌詞は本文の外に出さない。図の言葉は本文の地の文から。ジャケット・映像は複製しない。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./minasoko.css";

// 本文の段落位置(blocks の添字)
const LISTEN = 0; // 「水底游歩道」をSpotifyで聴く
const OPENING = 1; // 水の底に道があり、そこを歩いていく。
const INTRO = 2;
const S_REAL = 4; // 見出し「夢の中へ差し込む現実」
const MOON_FIG = 6; // 段落5(日差しと月の色)の後
const DRIFT_FIG = 12; // 段落11(夢と覚醒の間を行き来する)の後 = 次の見出しの直前
const S_UNKNOWN = 12; // 見出し「わからないまま、そこにいる」
const LETTER_FIG = 14; // 段落13(言葉や手紙が溶かされていく)の後
const S_DEEP = 19; // 見出し「現実から離れて、自分の奥へ」
const PULL = 27; // 要の一文

// 歌詞の出典(本文では毎回リンクせず、奥付に一度だけ。plan/54)
const UTANET = { url: "https://www.uta-net.com/song/190970/", text: "歌ネット「水底游歩道」" };

/** 画面に入った時に一度だけ動きを付ける。JSなし・動きを減らす設定・最初から画面内なら完成状態のまま */
const useRevealOnce = <T extends Element>(threshold: number) => {
  const ref = useRef<T>(null);
  const [state, setState] = useState<"static" | "armed" | "visible">("static");
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    setState("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("visible");
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, className: state === "static" ? "" : state === "armed" ? " is-armed" : " is-armed is-visible" };
};

/** 決まった並びの疑似乱数(描画のたびに形が変わらないように) */
const seeded = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

/** 水面から斜めに差す光の筋(表紙と月の図で使う)。x は上端の位置、w は幅、tilt は下端のずれ */
const RAYS = [
  { x: 8, w: 7, tilt: 10 },
  { x: 22, w: 4, tilt: 12 },
  { x: 37, w: 10, tilt: 9 },
  { x: 58, w: 5, tilt: 13 },
  { x: 71, w: 8, tilt: 10 },
  { x: 88, w: 4, tilt: 12 },
];
// 光の筋は水面で明るく、深くなるほど消える(縦のグラデーション)。id は表紙と図で別にする
const Rays: React.FC<{ className: string; id: string }> = ({ className, id }) => (
  <svg className={className} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.35" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
    {RAYS.map((r, i) => (
      <polygon key={i} fill={`url(#${id})`} points={`${r.x},0 ${r.x + r.w},0 ${r.x + r.w + r.tilt * 1.6},100 ${r.x + r.tilt},100`} style={{ animationDelay: `${-i * 1.7}s` }} />
    ))}
  </svg>
);

/** 表紙: 題名の下から水底へ下りていく点線の道 */
const CoverPath: React.FC = () => (
  <svg className="a015-cover__path" viewBox="0 0 400 220" preserveAspectRatio="xMinYMin meet" aria-hidden="true">
    <path d="M6 4 C 60 60, 150 40, 190 110 S 300 200, 396 214" pathLength={1} />
    <circle cx="396" cy="214" r="4" />
  </svg>
);

/** 段落5の後: 光の差す中を、月が白・灰・黒と色を変えながら沈む */
const MOONS = [
  { cx: 120, cy: 70, tone: "white" },
  { cx: 320, cy: 150, tone: "gray" },
  { cx: 520, cy: 236, tone: "black" },
] as const;
const MoonFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.35);
  return (
    <figure ref={ref} className={`a015-moons${className}`} aria-label="差し込む光が青く染まり、月は白から灰、黒へと色を変えながら深く沈んでいく">
      <Rays className="a015-moons__rays" id="a015-rays-moons" />
      <svg className="a015-moons__svg" viewBox="0 0 640 300" aria-hidden="true">
        <line x1="0" y1="8" x2="640" y2="8" className="a015-moons__surface" />
        {MOONS.map((m, i) => (
          <g key={m.tone} className={`a015-moon is-${m.tone}`} style={{ animationDelay: `${0.15 + i * 0.35}s` }}>
            <circle cx={m.cx} cy={m.cy} r="30" />
          </g>
        ))}
      </svg>
    </figure>
  );
};

/**
 * 段落11の後: 水面(覚醒)の近くまで浮かんでは、もう一度深く潜る線。浮かぶたびに水面から遠くなり、全体は深くなっていく。
 * 言葉は本文の地の文から(「夢と覚醒の間を行き来する」)
 */
const DRIFT_PATH = "M0 150 C 50 150, 70 40, 110 34 S 160 170, 210 176 S 270 66, 310 62 S 370 210, 420 214 S 480 112, 520 110 S 590 250, 640 254";
const DriftFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.4);
  return (
    <figure ref={ref} className={`a015-drift${className}`} aria-label="目覚めかけては、もう一度夢の奥へ潜っていく。行き来しながら、少しずつ深くなる">
      <svg viewBox="0 -20 640 300" aria-hidden="true">
        <line x1="0" y1="20" x2="640" y2="20" className="a015-drift__surface" />
        <path d={DRIFT_PATH} className="a015-drift__line" pathLength={1} />
        <circle cx="640" cy="254" r="5" className="a015-drift__end" />
        <text x="640" y="8" textAnchor="end" className="a015-drift__label">覚醒</text>
        <text x="610" y="262" textAnchor="end" className="a015-drift__label">夢</text>
      </svg>
    </figure>
  );
};

/**
 * 段落13の後: 手紙の行が右へ行くほど途切れ、ほどけた欠片が沈んでいく。文字は描かず、手書きの行のような線だけ。
 * 1行を短い区間に分け、右の区間ほど短く・間が広く・下へずれ・薄くする(固定の種なので毎回同じ形)
 */
const LETTER_LINES = 6;
const LETTER_SEGS = 16;
const LETTER = (() => {
  const rnd = seeded(15);
  const lines: { x: number; y: number; len: number; sink: number; fade: number; delay: number }[][] = [];
  for (let l = 0; l < LETTER_LINES; l++) {
    const row: (typeof lines)[number] = [];
    const end = 0.82 + rnd() * 0.18; // 行の長さ(手紙の行は揃わない)
    for (let s = 0; s < LETTER_SEGS; s++) {
      const t = s / LETTER_SEGS;
      if (t > end) break;
      const melt = Math.max(0, (t - 0.32) / 0.68); // 左3分の1はほぼそのまま、右へ行くほど溶ける
      const span = 1 / LETTER_SEGS;
      row.push({
        x: 40 + t * 400,
        y: 52 + l * 34 + (melt > 0 ? (rnd() - 0.5) * 4 * melt : 0),
        len: span * 400 * (1 - melt * (0.55 + rnd() * 0.35)),
        sink: melt * melt * (30 + rnd() * 70),
        fade: 1 - melt * (0.5 + rnd() * 0.4),
        delay: 0.2 + t * 1.2 + rnd() * 0.2,
      });
    }
    lines.push(row);
  }
  return lines;
})();
const LetterFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.35);
  return (
    <figure ref={ref} className={`a015-letter${className}`} aria-label="手紙の行が、右へ行くほど途切れ、ほどけて沈んでいく">
      <svg viewBox="0 0 480 330" aria-hidden="true">
        {/* 便箋の輪郭: 左辺と上下の左側だけ残し、右側は消えていく */}
        <path d="M200 20 H 24 V 268 H 200" className="a015-letter__paper" />
        <path d="M200 20 H 456" className="a015-letter__paper is-melting" />
        <path d="M200 268 H 456" className="a015-letter__paper is-melting" />
        {LETTER.map((row, l) =>
          row.map((s, i) => (
            <line
              key={`${l}-${i}`}
              x1={s.x}
              y1={s.y}
              x2={s.x + s.len}
              y2={s.y}
              className="a015-letter__ink"
              style={{ "--sink": `${s.sink}px`, "--fade": s.fade, animationDelay: `${s.delay}s` } as React.CSSProperties}
            />
          ))
        )}
      </svg>
    </figure>
  );
};

/** 結びの後: 水底に横へ続く点線の道 */
const FloorPath: React.FC = () => (
  <div className="a015-floor" aria-hidden="true">
    <svg viewBox="0 0 640 60" preserveAspectRatio="none">
      <path d="M0 34 C 120 30, 200 40, 320 36 S 520 30, 640 34" />
    </svg>
    <span className="a015-floor__light" />
  </div>
);

const MinasokoDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const body = (from: number, to: number, className = "a015-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「水底游歩道　滲む言葉と、水底の夢」: 曲名と副題を分ける(文言は変えない)
  const [tMain, ...tRest] = title.split("　");
  const tSub = tRest.join("　").trim();
  const pages = songPages.filter((p, i) => songPages.findIndex((q) => q.songName === p.songName) === i);
  const credit =
    songFacts.lyricMember && songFacts.lyricMember === songFacts.musicMember
      ? `作詞・作曲 ${songFacts.lyricMember}`
      : [songFacts.lyricMember && `作詞 ${songFacts.lyricMember}`, songFacts.musicMember && `作曲 ${songFacts.musicMember}`].filter(Boolean).join(" / ");

  return (
    <main className="a015" lang="ja">
      <article>
        <header className="a015-cover" data-og-cover>
          <Rays className="a015-cover__rays" id="a015-rays-cover" />
          <div className="a015-cover__top">
            <nav aria-label="パンくず" className="a015-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>{ctx.songTitle}</span>
            </nav>
          </div>
          <div className="a015-cover__body">
            <h1 className="a015-title">
              {/* 一文字ずつ少しずつ沈む(水の底へ下りていく) */}
              <span className="a015-title__song">
                {[...tMain].map((c, i) => (
                  <span key={i} className="a015-title__char" style={{ "--i": i } as React.CSSProperties}>
                    {c}
                  </span>
                ))}
              </span>
              {tSub && <span className="a015-title__sub">{tSub}</span>}
            </h1>
            <CoverPath />
            <p className="a015-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a015-ground">
          <div className="a015-layer is-shallow">
            <div className="a015-column">
              {body(LISTEN, OPENING, "a015-text a015-listen")}
              {body(OPENING, INTRO, "a015-text a015-opening")}
              {firstRelease && (
                <aside className="a015-note">
                  <p className="a015-note__label">リリース</p>
                  <p>
                    <span className="a015-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『{firstRelease.title}』
                  </p>
                </aside>
              )}
              {body(INTRO, S_REAL)}
            </div>
          </div>

          <section className="a015-layer is-blue">
            <div className="a015-column">
              {body(S_REAL, MOON_FIG)}
              <MoonFig />
              {body(MOON_FIG, DRIFT_FIG)}
              <DriftFig />
            </div>
          </section>

          <section className="a015-layer is-gray">
            <div className="a015-column">
              {body(S_UNKNOWN, LETTER_FIG)}
              <LetterFig />
              {body(LETTER_FIG, S_DEEP)}
            </div>
          </section>

          <section className="a015-layer is-floor">
            <div className="a015-column">
              {body(S_DEEP, PULL)}
              {body(PULL, PULL + 1, "a015-text a015-pull")}
              {body(PULL + 1, blocks.length)}
            </div>
            <FloorPath />

            <footer className="a015-colophon">
              <dl className="a015-colophon__list">
                <div>
                  <dt>曲</dt>
                  <dd>{ctx.songTitle}</dd>
                </div>
                {credit && (
                  <div>
                    <dt>クレジット</dt>
                    <dd>{credit}</dd>
                  </div>
                )}
                {firstRelease && (
                  <div>
                    <dt>初出</dt>
                    <dd>
                      {dotDate(firstRelease.releaseDate)} {formatLabel(firstRelease.format)}『{firstRelease.title}』
                    </dd>
                  </div>
                )}
                {songFacts.stats && songFacts.stats.totalPlays > 0 && (
                  <div>
                    <dt>ライヴ</dt>
                    <dd>
                      サイトの記録で{songFacts.stats.totalPlays}公演
                      {songFacts.stats.lastPlayedDate && `(最後は ${dotDate(songFacts.stats.lastPlayedDate)})`}
                    </dd>
                  </div>
                )}
                <div>
                  <dt>参考</dt>
                  <dd>
                    <a href={UTANET.url} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("article_source_click", { category: "outbound", label: `${id}->uta-net` })}>
                      {UTANET.text}
                    </a>
                  </dd>
                </div>
              </dl>
              <ul className="a015-next">
                {pages.map((p) => (
                  <li key={p.slug}>
                    <Link to={`/songs/${p.slug}/`} onClick={() => trackEvent("article_song_page_click", { category: "navigation", label: id })}>
                      {p.songName} — 演奏統計・配信リンク
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/articles/">読みもの一覧へ</Link>
                </li>
              </ul>
            </footer>
          </section>
        </div>
      </article>
    </main>
  );
};

export default MinasokoDesign;
