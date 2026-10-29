/**
 * 楽曲記事「ハルシアン」(reol-song-016)の記事別デザイン。設計の根拠は plan/55。
 *
 * - 主役は「背伸び」。紙面は学校の方眼ノート(購買・部活・期末テストの側)に、背伸びして塗る大人びたボルドー
 *   (『-nil-／極彩色』の16曲の輪で「ハルシアン」に当てた色、012)を差す。題名・見出し・図の文字は丸ゴシック。
 * - 表紙: 題名の左に身長を測る目盛り。点線が本当の背の高さ、ボルドーの線が背伸びして届いた高さ。題名はその差の分だけ浮いている。
 * - 段落9の後: 「甘えること」と「対等でいること」を両端に載せたシーソー。どちらにも落ち着かず揺れ続ける。
 * - 段落12の引用(本文の一部): ボルドーのペンで引いたような線を下に。段落16(結局、子どもなのは自分だ。)を大きく。
 * - 段落15の後: 表紙の目盛りで「埋まらない差」。自分の印が背伸びで上がっても、彼の印には届かない。
 * - 段落20の後: 文字の図。「舌打ち」の最後の「ち」が、舌打ちの音(はじける形)に置き換わる。
 * - 段落22から(本文版4で加わった、曲名「Halcyon」と振り返る視点): 同じノートをあとから開いたページ。紙が少し黄ばみ、方眼が薄くなる。
 *   見出しは足さない(本文を変えない)。
 * - 段落23の後(本文版6): ハル・シアンは春・青。下に「青春」、上に入れ替わった「春」「青」を置き、交差する矢印で結ぶ。
 *   春はボルドー、青はシアンの色。命名意図ではないと本文(段落24)が断る読みとして、文字の並びだけを示す。結び(段落25)の終わりに、舌打ちの図と同じはじける形を小さく置く。
 * - 歌詞は本文の外に出さない(引用は本文の段落12だけ)。図の言葉は本文の地の文から。ジャケット・映像は複製しない。
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
import "./harushian.css";

// 本文の段落位置(blocks の添字)
const LISTEN = 0; // 「ハルシアン」をSpotifyで聴く
const OPENING = 1; // 背伸びをして大学生の彼氏と付き合っている、高校二年生の女の子
const INTRO = 2;
const S_SWEET = 4; // 見出し「甘えたいけど、甘く見られたくない」
const S_GAP = 10; // 見出し「言い負かしても、埋まらない差」(直前に段落9の後のシーソー)
const QUOTE = 12; // 本文の引用(段落11の次)
const SOURCE = 13; // 引用の出典
const GAP_FIG = 16; // 段落15の後
const PULL = 16; // 結局、子どもなのは自分だ。
const S_CLICK = 19; // 見出し「言葉が、そのまま舌打ちになる」
const CLICK_FIG = 21; // 段落20の後
const LATER = 22; // この曲の英語表記は「Halcyon」。ここから、あとから開いたページ
const REV_FIG = 24; // 段落23(ハル・シアンは春・青)の後
const LAST = 26; // 結び(あの舌打ちには)

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
  return {
    ref,
    className:
      state === "static"
        ? ""
        : state === "armed"
        ? " is-armed"
        : " is-armed is-visible",
  };
};

/** 身長を測る目盛り(表紙と「埋まらない差」の図で同じ形)。y0〜y1 の間に、5ごとに長い目盛り */
const Ruler: React.FC<{ x: number; y0: number; y1: number; step: number }> = ({
  x,
  y0,
  y1,
  step,
}) => {
  const ticks: number[] = [];
  for (let y = y1, i = 0; y >= y0; y -= step, i++) ticks.push(i);
  return (
    <g className="a016-ruler">
      <line x1={x} y1={y0} x2={x} y2={y1} />
      {ticks.map((i) => (
        <line
          key={i}
          x1={x}
          y1={y1 - i * step}
          x2={x + (i % 5 === 0 ? 16 : 8)}
          y2={y1 - i * step}
        />
      ))}
    </g>
  );
};

/** 表紙: 題名の左の目盛り。印(点線が本当の背、ボルドーの線が背伸びして届いた高さ)は題名の側で描き、題名の頭にそろえる */
const CoverRuler: React.FC = () => (
  <svg className="a016-cover__ruler" viewBox="0 0 120 400" aria-hidden="true">
    <Ruler x={20} y0={10} y1={390} step={10} />
  </svg>
);

/** 段落9の後: 甘えることと、対等でいること。両端に載せたシーソーは、どちらにも落ち着かない */
const Seesaw: React.FC = () => (
  <figure
    className="a016-seesaw"
    aria-label="甘えることと、対等でいること。その両方を求めて、どちらにも落ち着かない"
  >
    <svg viewBox="0 0 560 220" aria-hidden="true">
      <g className="a016-seesaw__beam">
        <line x1="40" y1="120" x2="520" y2="120" />
        <text x="70" y="96" className="a016-seesaw__word">
          甘えること
        </text>
        <text
          x="490"
          y="96"
          textAnchor="end"
          className="a016-seesaw__word is-even"
        >
          対等でいること
        </text>
      </g>
      <path d="M280 124 L 250 184 H 310 Z" className="a016-seesaw__pivot" />
      <line
        x1="200"
        y1="186"
        x2="360"
        y2="186"
        className="a016-seesaw__ground"
      />
    </svg>
  </figure>
);

/** 段落15の後: 埋まらない差。自分の印が背伸びで上がっても、彼の印には届かない */
const GapFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.45);
  return (
    <figure
      ref={ref}
      className={`a016-gap${className}`}
      aria-label="背伸びをしても、彼との差は埋まらない"
    >
      <svg viewBox="0 0 560 300" aria-hidden="true">
        <Ruler x={60} y0={20} y1={290} step={10} />
        <line x1="60" y1="60" x2="480" y2="60" className="a016-mark is-him" />
        <text x="490" y="66" className="a016-gap__label">
          彼
        </text>
        <line
          x1="60"
          y1="170"
          x2="480"
          y2="170"
          className="a016-mark is-real"
        />
        <g className="a016-gap__self">
          <line
            x1="60"
            y1="120"
            x2="480"
            y2="120"
            className="a016-mark is-tiptoe"
          />
          <text x="490" y="126" className="a016-gap__label is-self">
            自分
          </text>
        </g>
        <path d="M300 64 V 116" className="a016-gap__space" />
        <text x="314" y="96" className="a016-gap__note">
          埋まらない差
        </text>
      </svg>
    </figure>
  );
};

/** 段落20の後: 「舌打ち」の最後の「ち」が、舌打ちの音に置き換わる */
const BURST =
  "M0 -30 L7 -10 L28 -14 L12 2 L24 22 L3 13 L-8 30 L-10 9 L-30 4 L-12 -6 L-20 -26 L-3 -12 Z";
const ClickFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.5);
  return (
    <figure
      ref={ref}
      className={`a016-click${className}`}
      aria-label="「舌打ち」の最後の「ち」が、本当の舌打ちの音に置き換わる"
    >
      <p className="a016-click__word" aria-hidden="true">
        <span>舌打</span>
        <span className="a016-click__slot">
          <span className="a016-click__chi">ち</span>
          <svg className="a016-click__burst" viewBox="-34 -34 68 68">
            <path d={BURST} />
          </svg>
        </span>
      </p>
      <figcaption className="a016-click__cap">
        「ち」が、本当の舌打ちの音に
      </figcaption>
    </figure>
  );
};

/**
 * 段落23の後: ハル・シアンは春・青。「青春」の二文字が、逆の順番に並ぶ(ひっくり返った青春)。
 * 春はボルドー、青はシアンの色。動きのある環境では、「青春」の順から二文字が入れ替わる
 */
const ReverseFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.5);
  return (
    <figure
      ref={ref}
      className={`a016-rev${className}`}
      aria-label="ハル・シアンは、春・青。青春の二文字が逆の順番に並ぶ"
    >
      <div className="a016-rev__grid" aria-hidden="true">
        <span className="a016-rev__kana is-haru">ハル</span>
        <span className="a016-rev__kana is-cyan">シアン</span>
        <span className="a016-rev__kanji is-haru">春</span>
        <span className="a016-rev__kanji is-cyan">青</span>
        <svg className="a016-rev__cross" viewBox="0 0 340 80">
          <path
            d="M85 72 L 255 10 M 236 12 L 255 10 L 241 26"
            className="is-cyan"
          />
          <path
            d="M255 72 L 85 10 M 104 12 L 85 10 L 99 26"
            className="is-haru"
          />
        </svg>
        <span className="a016-rev__small is-cyan">青</span>
        <span className="a016-rev__small is-haru">春</span>
      </div>
      <figcaption className="a016-rev__cap">
        ハル・シアンは、春・青。青春が逆に並ぶ
      </figcaption>
    </figure>
  );
};

const HarushianDesign: SongArticleDesign = (ctx) => {
  const {
    id,
    title,
    blocks,
    leadMedia,
    songPages,
    songFacts,
    createdAt,
    updatedAt,
  } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const body = (from: number, to: number, className = "a016-text") => (
    <ArticleBody
      blocks={blocks}
      leadMedia={leadMedia}
      articleId={id}
      from={from}
      to={to}
      unstyled
      className={className}
    />
  );
  // 題名「ハルシアン　青春に舌打ち」: 曲名と副題を分ける(文言は変えない)
  const [tMain, ...tRest] = title.split("　");
  const tSub = tRest.join("　").trim();
  const pages = songPages.filter(
    (p, i) => songPages.findIndex((q) => q.songName === p.songName) === i
  );
  const credit =
    songFacts.lyricMember && songFacts.lyricMember === songFacts.musicMember
      ? `作詞・作曲 ${songFacts.lyricMember}`
      : [
          songFacts.lyricMember && `作詞 ${songFacts.lyricMember}`,
          songFacts.musicMember && `作曲 ${songFacts.musicMember}`,
        ]
          .filter(Boolean)
          .join(" / ");

  return (
    <main className="a016" lang="ja">
      <article>
        <header className="a016-cover" data-og-cover>
          <div className="a016-cover__top">
            <nav aria-label="パンくず" className="a016-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>{ctx.songTitle}</span>
            </nav>
          </div>
          <div className="a016-cover__body">
            <CoverRuler />
            <div className="a016-cover__text">
              <h1 className="a016-title">
                <span className="a016-title__song">{tMain}</span>
                {tSub && <span className="a016-title__sub">{tSub}</span>}
              </h1>
              <p className="a016-date">
                <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
              </p>
            </div>
          </div>
        </header>

        <div className="a016-ground">
          <div className="a016-column">
            {body(LISTEN, OPENING, "a016-text a016-listen")}
            {body(OPENING, INTRO, "a016-text a016-opening")}
            {firstRelease && (
              <aside className="a016-note">
                <p className="a016-note__label">リリース</p>
                <p>
                  <span className="a016-note__strong">
                    {dotDate(firstRelease.releaseDate)}
                  </span>{" "}
                  {formatLabel(firstRelease.format)}『{firstRelease.title}』
                </p>
              </aside>
            )}
            {body(INTRO, S_SWEET)}

            <section className="a016-section">
              {body(S_SWEET, S_GAP)}
              <Seesaw />
            </section>

            <section className="a016-section">
              {body(S_GAP, QUOTE)}
              {body(QUOTE, SOURCE, "a016-text a016-quote")}
              {body(SOURCE, SOURCE + 1, "a016-text a016-source")}
              {body(SOURCE + 1, GAP_FIG)}
              <GapFig />
              {body(PULL, PULL + 1, "a016-text a016-pull")}
              {body(PULL + 1, S_CLICK)}
            </section>

            <section className="a016-section a016-section--last">
              {body(S_CLICK, CLICK_FIG)}
              <ClickFig />
              {body(CLICK_FIG, LATER)}
            </section>
          </div>

          {/* 同じノートを、あとから開いたページ */}
          <div className="a016-later">
            <div className="a016-column">
              {body(LATER, REV_FIG)}
              <ReverseFig />
              {body(REV_FIG, LAST)}
              {body(LAST, blocks.length, "a016-text a016-last")}
            </div>

            <footer className="a016-colophon">
              <dl className="a016-colophon__list">
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
                      {dotDate(firstRelease.releaseDate)}{" "}
                      {formatLabel(firstRelease.format)}『{firstRelease.title}』
                    </dd>
                  </div>
                )}
                {songFacts.stats && songFacts.stats.totalPlays > 0 && (
                  <div>
                    <dt>ライヴ</dt>
                    <dd>
                      サイトの記録で{songFacts.stats.totalPlays}公演
                      {songFacts.stats.lastPlayedDate &&
                        `(最後は ${dotDate(songFacts.stats.lastPlayedDate)})`}
                    </dd>
                  </div>
                )}
              </dl>
              <ul className="a016-next">
                {pages.map((p) => (
                  <li key={p.slug}>
                    <Link
                      to={`/songs/${p.slug}/`}
                      onClick={() =>
                        trackEvent("article_song_page_click", {
                          category: "navigation",
                          label: id,
                        })
                      }
                    >
                      {p.songName} — 演奏統計・配信リンク
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/articles/">読みもの一覧へ</Link>
                </li>
              </ul>
            </footer>
          </div>
        </div>
      </article>
    </main>
  );
};

export default HarushianDesign;
