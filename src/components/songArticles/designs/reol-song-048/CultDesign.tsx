/**
 * 楽曲記事「カルト」(reol-song-048)の記事別デザイン。設計の根拠は plan/44。
 *
 * - 主役は一本のろうそくの炎。表紙は闇の中の小さなろうそく。炎がゆらぎ、周りがほのかに明るい。
 * - 紙面は闇の黒に、ろうそくの金と、じごくを思わせる深紅。
 * - 段落2の後: 語源の図。colere から cult(カルト)と culture(カルチャー)へ枝分かれする。
 * - 段落12の後: 静けさとハイトーン。低く静かな波形が、途中で一気に高く鋭く跳ね上がる。
 * - 段落17(収録作)の後: 『虚構集』XFD をカルトの場面(1:48)から。
 * - 段落25の後: 八卦の輪(8つの卦が一つずつ浮かび上がる)。
 * - 文字が続く所の区切りに、節の要になる短い一文(段落27・35・44・50・66。本文のまま)を大きな明朝で見せる。
 * - 段落49の後: 光背が消える。炎のまわりの光の輪が薄れて消え、小さな炎だけが残る(神聖な仮面を外す)。
 * - 結び(段落75の後): 「信仰」と「芸術」のあいだの境界線が、ぼやけて消えていく(冒頭の語源の図と対)。
 * - 歌詞は本文の外に出さない。ライヴ映像・XFD の画面は複製しない。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import OfficialMedia from "../../OfficialMedia";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./cult.css";

// 段落の位置(designManifest.ts の anchors と対応)
const SPOTIFY = 0;
const INTRO = 1;
const ETYMO_FIG = 3; // 段落2(カルトとカルチャーは同じ語源)の後
const S_RITUAL = 5;
const WAVE_FIG = 13; // 段落12(むき出しの感情が一気に解き放たれる)の後
const S_FACE = 16;
const XFD_AT = 18; // 段落17(収録作)の後
const HAKKE_FIG = 26; // 段落25(八卦は易に用いられ…)の後に、八卦の輪
// 文字が続く所の区切りに、節の要になる短い一文(本文のまま)を大きく見せる(2026-10-15 ユーザー「ちょっと文字が多いから何か工夫して」)
const PULL_ORDER = 27; // そして、繰り返される「見ろ」という命令。
const PULL_BOTH = 35; // 教えを説く側でありながら、同時に救いを求める側でもある。
const PULL_HOLY = 44; // その姿は神のように仰ぎたくなるほど神聖で、美しい。
const PULL_BEAUTY = 50; // その矛盾が、たまらなく美しい。
const PULL_WISH = 66; // わかってほしい。信じたい。それでも、赦すことはできない。
const S_CONFESS = 37;
const HALO_FIG = 50; // 段落49(神聖な仮面を外してしまう)の後
const S_FAREWELL = 51;
const S_BORDER = 62;
const BORDER_FIG = 76; // 段落75(信仰と芸術の境界が曖昧になる)の後

// MV の無い曲なので、アルバム『虚構集』の公式 XFD(サイト登録済み)をカルトの場面から再生する。1:48 はユーザー指定(2026-10-13)
const XFD = { id: "18AQGiLKVs4", start: 108, text: "『虚構集』XFD の「カルト」(1:48〜)を観る" };

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
  return { ref, state, className: state === "static" ? "" : state === "armed" ? " is-armed" : " is-armed is-visible" };
};

/** ろうそく(炎・芯・ろう)。炎のゆらぎは CSS(動きを減らす設定では止まる) */
const Candle: React.FC<{ idPrefix: string; halo?: boolean }> = ({ idPrefix, halo = false }) => (
  <svg className="a048-candle" viewBox="0 0 200 320" aria-hidden="true">
    <defs>
      <radialGradient id={`${idPrefix}-glow`}>
        <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
        <stop offset="0.45" stopColor="#f3a64a" stopOpacity="0.16" />
        <stop offset="1" stopColor="#f3a64a" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${idPrefix}-flame`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#fff7e0" />
        <stop offset="0.45" stopColor="#ffd06a" />
        <stop offset="1" stopColor="#e8631f" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-wax`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#d9cdb6" />
        <stop offset="0.5" stopColor="#f3ead8" />
        <stop offset="1" stopColor="#b9ab92" />
      </linearGradient>
    </defs>
    <circle cx="100" cy="112" r="96" fill={`url(#${idPrefix}-glow)`} className="a048-candle__glow" />
    {halo && <circle cx="100" cy="112" r="58" className="a048-candle__halo" />}
    {/* ろう: 上の縁が少し溶けている */}
    <path d="M78,160 C84,155 90,162 96,157 C102,152 110,160 122,156 L122,300 L78,300 Z" fill={`url(#${idPrefix}-wax)`} />
    <line x1="100" y1="156" x2="100" y2="140" className="a048-candle__wick" />
    <g className="a048-candle__flame">
      <path d="M100,92 C110,108 114,122 110,134 C107,142 93,142 90,134 C86,122 90,108 100,92 Z" fill={`url(#${idPrefix}-flame)`} />
      <path d="M100,116 C104,124 105,130 102,135 C100,138 97,137 97,133 C96,128 97,122 100,116 Z" className="a048-candle__core" />
    </g>
  </svg>
);

/** 語源の図: colere から cult(カルト)と culture(カルチャー)へ */
const Etymology: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a048-etymo${className}`} aria-hidden="true">
      <svg viewBox="0 0 520 210">
        <text x="260" y="40" textAnchor="middle" className="a048-etymo__root">
          colere
        </text>
        <text x="260" y="62" textAnchor="middle" className="a048-etymo__note">
          ラテン語
        </text>
        <path d="M260,74 C260,110 140,110 140,140" className="a048-etymo__branch" pathLength={1} />
        <path d="M260,74 C260,110 380,110 380,140" className="a048-etymo__branch" pathLength={1} />
        <g className="a048-etymo__leaf">
          <text x="140" y="172" textAnchor="middle" className="a048-etymo__word">
            cult
          </text>
          <text x="140" y="196" textAnchor="middle" className="a048-etymo__ja">
            カルト
          </text>
        </g>
        <g className="a048-etymo__leaf is-second">
          <text x="380" y="172" textAnchor="middle" className="a048-etymo__word">
            culture
          </text>
          <text x="380" y="196" textAnchor="middle" className="a048-etymo__ja">
            カルチャー
          </text>
        </g>
      </svg>
    </div>
  );
};

/** 静けさとハイトーン: 低く静かな波形が、途中で一気に高く鋭く跳ね上がる */
const WAVE_POINTS = (() => {
  const pts: string[] = [];
  for (let x = 0; x <= 600; x += 6) {
    const loud = x > 380;
    const amp = loud ? 70 - Math.max(0, x - 520) * 0.4 : 5 + Math.sin(x / 37) * 2;
    const y = 100 + (x % 12 === 0 ? -1 : 1) * amp * (0.55 + 0.45 * Math.abs(Math.sin(x * 1.7)));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return pts.join(" ");
})();
const HighTone: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a048-wave${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 200">
        <line x1="0" y1="100" x2="600" y2="100" className="a048-wave__axis" />
        <polyline points={WAVE_POINTS} className="a048-wave__line" pathLength={1} />
        <text x="12" y="186" className="a048-wave__label">
          静けさ
        </text>
        <text x="588" y="186" textAnchor="end" className="a048-wave__label is-loud">
          ハイトーン
        </text>
      </svg>
    </div>
  );
};

/** 八卦の輪: 8つの卦(陽 = 一本の線、陰 = 切れた線)を円に並べ、一つずつ浮かび上がる。内側の線が卦の一番下 */
const TRIGRAMS: { name: string; lines: [number, number, number] }[] = [
  { name: "乾", lines: [1, 1, 1] },
  { name: "巽", lines: [0, 1, 1] },
  { name: "坎", lines: [0, 1, 0] },
  { name: "艮", lines: [0, 0, 1] },
  { name: "坤", lines: [0, 0, 0] },
  { name: "震", lines: [1, 0, 0] },
  { name: "離", lines: [1, 0, 1] },
  { name: "兌", lines: [1, 1, 0] },
];
const Hakke: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className={`a048-hakke${className}`} aria-hidden="true">
      <svg viewBox="0 0 320 320">
        <circle cx="160" cy="160" r="40" className="a048-hakke__center" />
        <text x="160" y="168" textAnchor="middle" className="a048-hakke__mid">
          八卦
        </text>
        {TRIGRAMS.map((t, i) => (
          <g key={t.name} transform={`rotate(${i * 45} 160 160)`} className="a048-hakke__item" style={{ transitionDelay: `${0.25 + i * 0.18}s` }}>
            {t.lines.map((yang, j) => {
              const y = 96 - j * 12; // 内側(下の爻)から外側へ
              return yang ? (
                <rect key={j} x="136" y={y} width="48" height="6" rx="1" className="a048-hakke__bar" />
              ) : (
                <g key={j}>
                  <rect x="136" y={y} width="20" height="6" rx="1" className="a048-hakke__bar" />
                  <rect x="164" y={y} width="20" height="6" rx="1" className="a048-hakke__bar" />
                </g>
              );
            })}
            <text x="160" y="52" textAnchor="middle" className="a048-hakke__name" transform={`rotate(${-i * 45} 160 48)`}>
              {t.name}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

/** 光背が消える: 炎のまわりの光の輪が薄れて消え、小さな炎だけが残る */
const HaloOff: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a048-halo${className}`} aria-hidden="true">
      <Candle idPrefix="a048-halo" halo />
    </div>
  );
};

/** 信仰と芸術の境界: あいだの線がぼやけて消えていく */
const Border: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a048-border${className}`} aria-hidden="true">
      <span className="a048-border__word">信仰</span>
      <span className="a048-border__line" />
      <span className="a048-border__word">芸術</span>
    </div>
  );
};

const CultDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  const body = (from: number, to: number, className = "a048-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 節の要になる短い一文を、大きく見せる(本文の文言のまま)
  const pull = (i: number) => body(i, i + 1, "a048-text a048-pull");
  // 題名「カルト　信仰と芸術の境界」: 曲名を大きく、副題を下に(文言は変えない)
  const SONG = "カルト";
  const tSub = title.startsWith(SONG) ? title.slice(SONG.length).trim() : "";

  return (
    <main className="a048" lang="ja">
      <article>
        {/* 表紙: 闇の中の一本のろうそく */}
        <header className="a048-cover" data-og-cover>
          <div className="a048-cover__art">
            <Candle idPrefix="a048-cover" />
          </div>
          <div className="a048-cover__top">
            <nav aria-label="パンくず" className="a048-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>カルト</span>
            </nav>
          </div>
          <div className="a048-cover__body">
            <h1 className="a048-title">
              {tSub ? (
                <>
                  <span className="a048-title__song">{SONG}</span>
                  <span className="a048-title__sub">{tSub}</span>
                </>
              ) : (
                <span className="a048-title__song">{title}</span>
              )}
            </h1>
            <p className="a048-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a048-ground">
          <div className="a048-column">
            {body(SPOTIFY, INTRO, "a048-text a048-listen")}

            {/* 冒頭。前にリリースの注記。段落2の後に語源の図 */}
            <div className="a048-section">
              {firstRelease && (
                <aside className="a048-note">
                  <p className="a048-note__label">リリース</p>
                  <p>
                    <span className="a048-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『
                    {firstRelease.title}』
                  </p>
                </aside>
              )}
              {body(INTRO, ETYMO_FIG, "a048-text a048-intro")}
              <Etymology />
              {body(ETYMO_FIG, S_RITUAL)}
            </div>

            {/* ろうそくの炎から始まる儀式。段落12の後に静けさとハイトーン */}
            <section className="a048-section">
              {body(S_RITUAL, WAVE_FIG)}
              <HighTone />
              {body(WAVE_FIG, S_FACE)}
            </section>

            {/* 表の顔と裏の顔。収録作の段落の後に XFD */}
            <section className="a048-section">
              {body(S_FACE, XFD_AT)}
              <figure className="a048-video">
                <figcaption className="a048-video__label">『虚構集』XFD</figcaption>
                <OfficialMedia
                  videoId={XFD.id}
                  href={`https://www.youtube.com/watch?v=${XFD.id}&t=${XFD.start}s`}
                  text={XFD.text}
                  articleId={id}
                  unstyled
                  preferHighRes
                  start={XFD.start}
                />
              </figure>
              {body(XFD_AT, HAKKE_FIG)}
              <Hakke />
              {body(HAKKE_FIG, PULL_ORDER)}
              {pull(PULL_ORDER)}
              {body(PULL_ORDER + 1, PULL_BOTH)}
              {pull(PULL_BOTH)}
              {body(PULL_BOTH + 1, S_CONFESS)}
            </section>

            {/* 裏側の告白を表で歌う。段落49の後に光背が消える */}
            <section className="a048-section">
              {body(S_CONFESS, PULL_HOLY)}
              {pull(PULL_HOLY)}
              {body(PULL_HOLY + 1, HALO_FIG)}
              <HaloOff />
              {pull(PULL_BEAUTY)}
            </section>

            <section className="a048-section">{body(S_FAREWELL, S_BORDER)}</section>

            {/* 信仰と芸術の境界。段落75の後に、境界線がぼやけて消える */}
            <section className="a048-section a048-section--last">
              {body(S_BORDER, PULL_WISH)}
              {pull(PULL_WISH)}
              {body(PULL_WISH + 1, BORDER_FIG)}
              <Border />
              {body(BORDER_FIG, blocks.length, "a048-text a048-closing")}
            </section>
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a048-colophon">
            <dl className="a048-colophon__list">
              <div>
                <dt>曲</dt>
                <dd>{ctx.songTitle}</dd>
              </div>
              {songFacts.lyricMember && (
                <div>
                  <dt>作詞</dt>
                  <dd>{songFacts.lyricMember}</dd>
                </div>
              )}
              {songFacts.musicMember && (
                <div>
                  <dt>作曲</dt>
                  <dd>{songFacts.musicMember.replace(/\s*,\s*/g, "、")}</dd>
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
              {stats && stats.totalPlays > 0 && (
                <div>
                  <dt>演奏記録</dt>
                  <dd>
                    {stats.totalPlays}回
                    {stats.lastPlayedDate && <>(最新 {dotDate(stats.lastPlayedDate)})</>}
                    <span className="a048-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a048-next">
              {songPages.map((p) => (
                <li key={p.slug}>
                  <Link to={`/songs/${p.slug}/`} onClick={() => trackEvent("article_song_page_click", { category: "navigation", label: id })}>
                    {p.songName} — 演奏統計・MV・配信リンク
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/articles/">読みもの一覧へ</Link>
              </li>
            </ul>
          </footer>
        </div>
      </article>
    </main>
  );
};

export default CultDesign;
