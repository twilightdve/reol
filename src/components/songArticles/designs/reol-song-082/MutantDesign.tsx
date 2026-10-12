/**
 * 楽曲記事「ミュータント」(reol-song-082)の記事別デザイン。設計の根拠は plan/38。
 *
 * - 紙面全体を夜の海に: 地は深い夜の青、本文は明るい文字。結びに向かって海の深い青緑へ沈む。
 * - 表紙: 夜の湾。地平線の街の灯、海を渡る吊り橋の光の線、手前に螺旋を描くループ橋(いずれもオリジナルの線画)。
 *   題名の下に、題名が水面に映って溶けていく(反転・ぼかし・下へ消える。装飾なので読み上げ対象外)。
 * - 題名・一言・引用は明朝体(詩の朗読のような歌い方)。本文はゴシック。
 * - 題名の意味の段落(5)の後に二重の螺旋(DNA)。場所の段落(6〜11)の後に夜の湾の帯(螺旋の道から海の向こうの霧へ伸びる橋)。
 *   REOL→Reol の段落(14〜19)の後に世界線の移り変わり(上の線から下の線へ、螺旋を描いて移る)。
 * - 動画は2本とも公式の埋め込み(クリックで読み込む)。冒頭の動画はサイトに MV として登録されていないので、段落0のリンクから埋め込む。
 * - 歌詞は本文の引用(7・9)だけ。動画の画面・手書きの歌詞は使わない。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import OfficialMedia from "../../OfficialMedia";
import Phrased from "../../Phrased";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { inlineText, youtubeVideoId } from "../../../../utils/songArticles/markdown";
import type { ArticleBlock } from "../../../../utils/songArticles/markdown";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./mutant.css";

// 段落の位置(designManifest.ts の anchors と対応)
// 0 動画へのリンク / 1 一言 / 2〜3 漂う・夜のドライブ / 4 作り / 5 題名の意味 / 6〜11 場所(7・9 は歌詞の引用) /
// 12 動画の埠頭 / 13 『虚構集』XFD へのリンク / 14〜19 REOL から Reol へ / 20〜21 結び
const LEAD_LINK = 0;
const LEDE = 1;
const DRIFT = 2;
const MAKING = 4;
const MEANING = 5;
const PLACE = 6;
const PIER = 12;
const XFD_LINK = 13;
const SHIFT = 14;
const CLOSING = 20;

/** 段落の中の YouTube リンク(埋め込みに使う) */
const videoLinkOf = (block: ArticleBlock | undefined) => {
  if (!block || block.t !== "p") return null;
  const link = block.children.find((n) => n.t === "link");
  if (!link || link.t !== "link") return null;
  const id = youtubeVideoId(link.href);
  return id ? { id, href: link.href, text: inlineText(link.children) } : null;
};

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

/** 螺旋(ループ橋)を斜め上から見た線。中心 cx、下端 y0 から上端 y1 へ turns 回転して昇る */
const helixPath = (cx: number, y0: number, y1: number, rx: number, ry: number, turns: number) => {
  const n = Math.round(turns * 48);
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * turns * Math.PI * 2;
    const x = cx + rx * Math.cos(t);
    const y = y0 + (y1 - y0) * (i / n) + ry * Math.sin(t);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
};

/** 吊り橋(主塔2本・主ケーブル・吊り材・橋桁の灯)。x0〜x1、橋桁の高さ deck、主塔の高さ h */
const Bridge: React.FC<{ x0: number; x1: number; deck: number; h: number; className?: string }> = ({ x0, x1, deck, h, className }) => {
  const w = x1 - x0;
  const t1 = x0 + w * 0.28;
  const t2 = x0 + w * 0.72;
  const top = deck - h;
  // 中央の径間の主ケーブル: 主塔の頂から、橋桁の少し上まで垂れる(2次ベジェ。制御点は最も低い点の高さから逆算)
  const low = deck - h * 0.1;
  const ctrl = 2 * low - top;
  const side = deck - h * 0.3;
  const cable = `M${x0},${deck - 4} Q${(x0 + t1) / 2},${2 * side - (deck + top) / 2} ${t1},${top} Q${(t1 + t2) / 2},${ctrl} ${t2},${top} Q${(t2 + x1) / 2},${2 * side - (deck + top) / 2} ${x1},${deck - 4}`;
  const hangers = Array.from({ length: 13 }, (_, i) => (i + 1) / 14);
  const cableY = (u: number) => (1 - u) * (1 - u) * top + 2 * u * (1 - u) * ctrl + u * u * top;
  return (
    <g className={className}>
      <path d={cable} className="a082-bridge__cable" />
      {hangers.map((u, i) => {
        const x = t1 + (t2 - t1) * u;
        return <line key={i} x1={x} y1={cableY(u)} x2={x} y2={deck} className="a082-bridge__hanger" />;
      })}
      <path d={`M${t1 - 5},${deck} L${t1 - 3},${top} M${t1 + 5},${deck} L${t1 + 3},${top} M${t2 - 5},${deck} L${t2 - 3},${top} M${t2 + 5},${deck} L${t2 + 3},${top}`} className="a082-bridge__tower" />
      <line x1={x0 - 40} y1={deck} x2={x1 + 40} y2={deck} className="a082-bridge__deck" />
      {Array.from({ length: 24 }, (_, i) => (
        <circle key={i} cx={x0 + (w * (i + 0.5)) / 24} cy={deck + 3} r={1.6} className="a082-light" />
      ))}
    </g>
  );
};

// 地平線の街の灯(固定配置)
const SKYLINE: [number, number, number][] = Array.from({ length: 46 }, (_, i) => {
  const x = (i * 29 + ((i * 7) % 11) * 3) % 1240;
  const hgt = 8 + ((i * 37) % 46);
  const w = 10 + ((i * 13) % 14);
  return [x, hgt, w];
});

/** 表紙の上の段: 夜の湾。地平線の街、海を渡る吊り橋、橋のたもとで螺旋を描いて昇るループ橋。
 *  下端(y=520)から下は表紙の海(CSS)に続き、題名はその海に浮かぶ */
const CoverBay: React.FC = () => {
  const HORIZON = 440;
  // ループ橋: 手前の岸(下)から2周して昇り、右端で橋桁につながる
  const loop = helixPath(612, 506, 432, 86, 15, 2);
  return (
    <svg className="a082-cover__art" viewBox="0 0 1240 520" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="a082-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#02070b" />
          <stop offset="1" stopColor="#0b202b" />
        </linearGradient>
        <linearGradient id="a082-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#10313d" />
          <stop offset="1" stopColor="#0d2733" />
        </linearGradient>
        <filter id="a082-glow" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="0" y="0" width="1240" height={HORIZON} fill="url(#a082-sky)" />
      {/* 地平線の街(暗い影と、ところどころの灯) */}
      <g className="a082-skyline">
        {SKYLINE.map(([x, hgt, w], i) => (
          <rect key={i} x={x} y={HORIZON - hgt} width={w} height={hgt} />
        ))}
      </g>
      {SKYLINE.filter((_, i) => i % 2 === 0).map(([x, hgt], i) => (
        <circle key={i} cx={x + 4} cy={HORIZON - hgt + 6} r={1.4} className={i % 5 === 0 ? "a082-light a082-light--warm" : "a082-light"} />
      ))}
      {/* 海 */}
      <rect x="0" y={HORIZON} width="1240" height={520 - HORIZON} fill="url(#a082-sea)" />
      {/* 灯の映り込み(縦の細い光) */}
      {Array.from({ length: 18 }, (_, i) => {
        const x = 730 + i * 30;
        const len = 20 + ((i * 17) % 50);
        return <line key={i} x1={x} y1={HORIZON + 8} x2={x} y2={HORIZON + 8 + len} className="a082-reflect" />;
      })}
      {/* 海を渡る吊り橋(右へ、海の向こうへ) */}
      <Bridge x0={698} x1={1320} deck={430} h={118} className="a082-bridge" />
      {/* 橋のたもとのループ橋。支柱を立てて、高架の道に見せる */}
      {Array.from({ length: 9 }, (_, i) => {
        const turns = 2;
        const u = (i + 0.5) / 9;
        const t = u * turns * Math.PI * 2;
        const x = 612 + 86 * Math.cos(t);
        const y = 506 + (432 - 506) * u + 15 * Math.sin(t);
        return <line key={i} x1={x} y1={y + 2} x2={x} y2={518} className="a082-loop__pillar" />;
      })}
      <path d={loop} className="a082-loop" filter="url(#a082-glow)" />
    </svg>
  );
};

/** 二重の螺旋(題名の意味の段落の後)。画面に入ると線が描かれる */
const DoubleHelix: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  const W = 640;
  const wave = (phase: number) => {
    const pts: string[] = [];
    for (let x = 0; x <= W; x += 8) pts.push(`${x},${(60 + 34 * Math.sin((x / W) * Math.PI * 4 + phase)).toFixed(1)}`);
    return `M${pts.join(" L")}`;
  };
  const rungs = Array.from({ length: 16 }, (_, i) => (i + 0.5) * (W / 16));
  return (
    <div ref={ref} className={`a082-helix${className}`} aria-hidden="true">
      <svg viewBox={`0 -4 ${W} 128`}>
        {rungs.map((x, i) => {
          const y = 34 * Math.sin((x / W) * Math.PI * 4);
          return <line key={i} x1={x} y1={60 + y} x2={x} y2={60 - y} className="a082-helix__rung" style={{ transitionDelay: `${0.6 + i * 0.04}s` }} />;
        })}
        <path d={wave(0)} className="a082-helix__strand a082-helix__strand--a" pathLength={1} />
        <path d={wave(Math.PI)} className="a082-helix__strand a082-helix__strand--b" pathLength={1} />
      </svg>
    </div>
  );
};

/** 夜の湾の帯(場所の段落の後): 螺旋の道(ループ橋)から、海の向こうの霧の中へ伸びる橋。紙面の幅いっぱい。
 *  横長の画面と狭い画面で配置を変える(どちらも螺旋と橋が見えるように。CSS でどちらかを出す) */
type BayLayout = { w: number; cx: number; rx: number; ry: number; bridgeX0: number; bridgeX1: number; h: number };
const BAY_WIDE: BayLayout = { w: 1200, cx: 260, rx: 110, ry: 20, bridgeX0: 380, bridgeX1: 1280, h: 118 };
const BAY_NARROW: BayLayout = { w: 420, cx: 92, rx: 62, ry: 13, bridgeX0: 160, bridgeX1: 600, h: 96 };
const BAY_HORIZON = 222;
const BAY_DECK = 214;
const BayArt: React.FC<{ l: BayLayout; className: string }> = ({ l, className }) => {
  const y0 = 300;
  const turns = 2;
  const loop = helixPath(l.cx, y0, BAY_DECK + 2, l.rx, l.ry, turns);
  return (
    <svg className={className} viewBox={`0 0 ${l.w} 360`} preserveAspectRatio="xMidYMid slice">
      <line x1="0" y1={BAY_HORIZON} x2={l.w} y2={BAY_HORIZON} className="a082-bay__horizon" />
      <Bridge x0={l.bridgeX0} x1={l.bridgeX1} deck={BAY_DECK} h={l.h} className="a082-bridge a082-bay__bridge" />
      {Array.from({ length: 9 }, (_, i) => {
        const u = (i + 0.5) / 9;
        const t = u * turns * Math.PI * 2;
        const x = l.cx + l.rx * Math.cos(t);
        const y = y0 + (BAY_DECK + 2 - y0) * u + l.ry * Math.sin(t);
        return <line key={i} x1={x} y1={y + 2} x2={x} y2={y0 + l.ry + 14} className="a082-loop__pillar a082-bay__pillar" />;
      })}
      <path d={loop} className="a082-loop a082-bay__draw" pathLength={1} />
      <path d={`M${l.cx + l.rx},${BAY_DECK + 2} L${l.bridgeX0},${BAY_DECK}`} className="a082-bay__road a082-bay__draw" pathLength={1} />
    </svg>
  );
};
const Bay: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.35);
  return (
    <div ref={ref} className={`a082-bay${className}`} aria-hidden="true">
      <BayArt l={BAY_WIDE} className="a082-bay__wide" />
      <BayArt l={BAY_NARROW} className="a082-bay__narrow" />
    </div>
  );
};

/** 世界線の移り変わり(REOL→Reol の段落の後): 上の線(REOL)から下の線(Reol)へ、螺旋を描いて移る一本の線。二本の線の間はあいている */
const WorldLines: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className={`a082-lines${className}`} aria-hidden="true">
      <svg viewBox="0 0 640 210">
        <line x1="20" y1="50" x2="300" y2="50" className="a082-lines__old" />
        <line x1="300" y1="50" x2="620" y2="50" className="a082-lines__old a082-lines__old--fade" />
        <line x1="20" y1="160" x2="330" y2="160" className="a082-lines__new a082-lines__new--fade" />
        <line x1="330" y1="160" x2="620" y2="160" className="a082-lines__new" />
        <text x="20" y="34" className="a082-lines__label">REOL</text>
        <text x="620" y="188" className="a082-lines__label a082-lines__label--new" textAnchor="end">
          Reol
        </text>
        {/* 上の線から離れ、一度輪を描いて、下の線へ */}
        <path
          d="M220,50 C290,50 330,70 330,105 C330,135 290,140 280,118 C268,92 320,80 350,110 C372,132 380,160 430,160"
          className="a082-lines__shift"
          pathLength={1}
        />
        <circle cx="430" cy="160" r="4.5" className="a082-lines__dot" />
      </svg>
    </div>
  );
};

const Video: React.FC<{ label: string; v: { id: string; href: string; text: string }; articleId: string; className?: string }> = ({
  label,
  v,
  articleId,
  className = "",
}) => (
  <figure className={`a082-video ${className}`}>
    <figcaption className="a082-video__label">{label}</figcaption>
    <OfficialMedia videoId={v.id} href={v.href} text={v.text} articleId={articleId} unstyled format="cinemascope" />
  </figure>
);

const MutantDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  const body = (from: number, to: number, className = "a082-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  const lead = videoLinkOf(blocks[LEAD_LINK]);
  const xfd = videoLinkOf(blocks[XFD_LINK]);
  const lede = blocks[LEDE];
  const ledeText =
    lede?.t === "p" && lede.children.every((n) => n.t === "text") ? lede.children.map((n) => (n.t === "text" ? n.v : "")).join("") : null;

  return (
    <main className="a082" lang="ja">
      <article>
        {/* 表紙: 夜の湾。題名は水面に映って溶けていく */}
        <header className="a082-cover" data-og-cover>
          <div className="a082-cover__top">
            <nav aria-label="パンくず" className="a082-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>ミュータント</span>
            </nav>
          </div>
          <CoverBay />
          {/* 海: 題名が浮かび、その下で水面に映って溶けていく */}
          <div className="a082-cover__body">
            <h1 className="a082-title">
              <Phrased text={title} />
            </h1>
            <p className="a082-title a082-title--reflect" aria-hidden="true">
              <Phrased text={title} />
            </p>
            <p className="a082-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a082-ground">
          <div className="a082-column">
            {/* 冒頭の動画: 表紙の下。クリックした時だけ読み込む */}
            {lead ? <Video label="VIDEO" v={lead} articleId={id} /> : body(LEAD_LINK, LEDE)}

            {/* 一言 */}
            <div className="a082-lede">
              {ledeText ? (
                <p>
                  <Phrased text={ledeText} />
                </p>
              ) : (
                body(LEDE, DRIFT, "a082-lede__body")
              )}
            </div>

            {/* 漂う・夜のドライブ */}
            <div className="a082-group">{body(DRIFT, MAKING)}</div>

            {/* 作り。前にリリースの注記 */}
            <div className="a082-group">
              {firstRelease && (
                <aside className="a082-note">
                  <p className="a082-note__label">リリース</p>
                  <p>
                    <span className="a082-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『
                    {firstRelease.title}』
                  </p>
                </aside>
              )}
              {body(MAKING, MEANING)}
            </div>

            {/* 題名の意味。その後に二重の螺旋 */}
            <div className="a082-group a082-group--tight">{body(MEANING, PLACE)}</div>
            <DoubleHelix />

            {/* 場所(歌詞の引用を含む) */}
            <div className="a082-group a082-group--tight">{body(PLACE, PIER)}</div>
          </div>

          {/* 夜の湾の帯: 螺旋の道から、海の向こうへ伸びる橋 */}
          <Bay />

          <div className="a082-column">
            {/* 動画の埠頭・『虚構集』XFD */}
            <div className="a082-group">
              {body(PIER, XFD_LINK)}
              {xfd ? <Video label="『虚構集』XFD" v={xfd} articleId={id} className="a082-video--inline" /> : body(XFD_LINK, SHIFT)}
            </div>

            {/* REOL から Reol へ。その後に世界線の移り変わり */}
            <div className="a082-group a082-group--tight">{body(SHIFT, CLOSING)}</div>
            <WorldLines />
          </div>

          {/* 結び: 海の深い青緑へ沈んでいく */}
          <div className="a082-last">
            <div className="a082-column">{body(CLOSING, blocks.length, "a082-text a082-closing")}</div>
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a082-colophon">
            <dl className="a082-colophon__list">
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
                    <span className="a082-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a082-next">
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

export default MutantDesign;
