/**
 * 楽曲記事「drop pop candy」(reol-song-004)の記事別デザイン。設計の根拠は plan/37。
 *
 * - 紙面全体を「灰色の雨が、キャンディの色になる」: 表紙は低気圧の灰色の空に細い雨。題名のまわりで雨粒が丸いキャンディ
 *   (MV の色: 青緑・からし色・くすんだ青・橙・紫)に変わる。本文の地は淡い炭酸水の色で、灰色は表紙にしか出てこない。
 * - 雨と遊ぶ段落(2〜3)の後に、しずくが一粒ずつキャンディに変わる列。
 * - 掛け合いの段落(4)の後に「二本の線」: 二色の粒が上下の段を交互に行き来し、最後に並んで一つになる。
 * - 景色が広がる段落(5)の後に「ひとっ飛び」の帯: 足元の水たまりから、地平線を越えて夜空の星へ、一粒のキャンディが弧を描いて昇る。
 * - 楽しいだけではない段落(6〜7)は装飾を置かない。
 * - 踊ってみた・ライヴの段落(8〜13)の前に、閉じた傘の線画(傘は差さずに手に持つもの)。ライヴの段落の前に演奏記録の注記。
 * - 結び(14): 色の粒がやわらかく降る。
 * - MV は表紙の下にクリックで読み込む形。本文中の踊ってみた動画は、サイトに登録された映像ではないので本文のリンクのまま。
 * - 歌詞・MV の画面・題字は使わない(色と、丸い太字に影をずらす考え方だけを借りる)。
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
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./droppopcandy.css";

// 段落の位置(designManifest.ts の anchors と対応)
// 0 MVへのリンク / 1 一言 / 2〜3 雨と遊ぶ / 4 掛け合い / 5 景色の広がり / 6〜7 日々への愛情・楽しいだけではない /
// 8〜11 踊ってみた(9 は動画へのリンク) / 12〜13 ライヴ / 14 結び
const LEDE = 1;
const RAIN = 2;
const DUET = 4;
const LEAP = 5;
const DAYS = 6;
const DANCE = 8;
const DANCE_LINK = 9;
const LIVE = 12;
const CLOSING = 14;

const SONG = "drop pop candy";
const TOUR = "新式浪漫";

const C = {
  teal: "#3f9f80",
  mustard: "#d6b726",
  slate: "#3d6888",
  orange: "#c8774a",
  violet: "#6a5da6",
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

/** 五芒星(外径 r)。MV にも星が散っているが、形は一般的な星形 */
const starPath = (cx: number, cy: number, r: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
};

/** キャンディ一粒(丸・少しずらした影・小さな光) */
const Candy: React.FC<{ x: number; y: number; r: number; color: string; className?: string; style?: React.CSSProperties }> = ({
  x,
  y,
  r,
  color,
  className,
  style,
}) => (
  <g className={className} style={style}>
    <circle cx={x + r * 0.22} cy={y + r * 0.22} r={r} className="a004-candy__shadow" />
    <circle cx={x} cy={y} r={r} fill={color} />
    <ellipse cx={x - r * 0.35} cy={y - r * 0.38} rx={r * 0.32} ry={r * 0.2} className="a004-candy__glint" transform={`rotate(-30 ${x - r * 0.35} ${y - r * 0.38})`} />
  </g>
);

// 表紙の雨(細い線)とキャンディの配置(固定。毎回同じ見た目にする)
const RAIN_LINES: [number, number, number][] = Array.from({ length: 64 }, (_, i) => {
  const x = (i * 97 + (i % 7) * 31) % 1240;
  const y = ((i * 53) % 420) - 40;
  const len = 26 + ((i * 13) % 22);
  return [x, y, len];
});
const COVER_CANDIES: { x: number; y: number; r: number; c: string }[] = [
  { x: 760, y: 360, r: 22, c: C.mustard },
  { x: 880, y: 430, r: 15, c: C.teal },
  { x: 1010, y: 340, r: 26, c: C.orange },
  { x: 1120, y: 470, r: 18, c: C.violet },
  { x: 940, y: 560, r: 24, c: C.slate },
  { x: 1070, y: 620, r: 13, c: C.mustard },
  { x: 690, y: 520, r: 12, c: C.violet },
  { x: 820, y: 640, r: 17, c: C.teal },
  { x: 1170, y: 300, r: 11, c: C.teal },
  { x: 600, y: 715, r: 9, c: C.orange },
];
const COVER_STARS: [number, number, number][] = [
  [700, 300, 9],
  [960, 470, 7],
  [1150, 560, 10],
  [870, 330, 6],
  [1050, 700, 8],
];

/** 表紙: 灰色の空に細い雨。雨は題名のまわり(右下)でキャンディに変わる。装飾なので読み上げ対象外 */
const CoverRain: React.FC = () => (
  <svg className="a004-cover__art" viewBox="0 0 1240 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g className="a004-rain">
      {RAIN_LINES.map(([x, y, len], i) => (
        <line key={i} x1={x} y1={y} x2={x - len * 0.22} y2={y + len} />
      ))}
    </g>
    {COVER_CANDIES.map((k, i) => (
      <Candy key={i} x={k.x} y={k.y} r={k.r} color={k.c} className="a004-cover__candy" style={{ animationDelay: `${0.25 + i * 0.07}s` }} />
    ))}
    {COVER_STARS.map(([x, y, r], i) => (
      <path key={i} d={starPath(x, y, r)} className="a004-star" />
    ))}
  </svg>
);

/** しずくが一粒ずつキャンディに変わる列(雨と遊ぶ段落の後) */
const DropsToCandy: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  const colors = [null, null, C.teal, C.mustard, C.orange, C.violet, C.slate];
  return (
    <div ref={ref} className={`a004-drops${className}`} aria-hidden="true">
      <svg viewBox="0 0 400 60">
        {colors.map((c, i) => {
          const x = 30 + i * 56;
          return c ? (
            <Candy key={i} x={x} y={34} r={11} color={c} className="a004-drops__item" style={{ transitionDelay: `${i * 0.12}s` }} />
          ) : (
            <path
              key={i}
              className="a004-drops__item a004-drops__rain"
              style={{ transitionDelay: `${i * 0.12}s` }}
              d={`M${x},14 C${x + 6},26 ${x + 10},31 ${x + 10},37 A10,10 0 1,1 ${x - 10},37 C${x - 10},31 ${x - 6},26 ${x},14Z`}
            />
          );
        })}
      </svg>
    </div>
  );
};

/** 二本の線(掛け合いの段落の後): 二色の粒が上下の段を交互に行き来し、最後に並んで一つになる */
const Duet: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  const steps = 8;
  const pts = Array.from({ length: steps }, (_, i) => ({ x: 34 + i * 70, y: i % 2 === 0 ? 30 : 90, c: i % 2 === 0 ? C.teal : C.mustard }));
  const end = { x: 34 + steps * 70 + 10, y: 60 };
  const d = `M${pts.map((p) => `${p.x},${p.y}`).join(" L")} L${end.x - 16},${end.y}`;
  return (
    <div ref={ref} className={`a004-duet${className}`} aria-hidden="true">
      <svg viewBox="0 0 640 120">
        <path d={d} className="a004-duet__line" pathLength={1} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={9} fill={p.c} className="a004-duet__dot" style={{ transitionDelay: `${0.1 + i * 0.1}s` }} />
        ))}
        <g className="a004-duet__dot" style={{ transitionDelay: `${0.1 + steps * 0.1}s` }}>
          <Candy x={end.x - 9} y={end.y} r={14} color={C.teal} />
          <Candy x={end.x + 9} y={end.y} r={14} color={C.mustard} />
        </g>
      </svg>
    </div>
  );
};

/** ひとっ飛び(景色が広がる段落の後): 足元の水たまりから、地平線を越えて夜空の星へ。紙面の幅いっぱいの帯。
 *  横長の画面と狭い画面で、水たまりとキャンディが両方見えるよう配置を変える(CSS でどちらかを出す) */
type LeapLayout = {
  w: number;
  puddle: [number, number, number];
  trail: string;
  candy: [number, number, number];
  stars: [number, number, number][];
};
const LEAP_WIDE: LeapLayout = {
  w: 1200,
  puddle: [190, 282, 120],
  trail: "M190,272 C330,120 640,60 940,86",
  candy: [952, 86, 18],
  stars: [
    [620, 40, 9],
    [760, 70, 6],
    [880, 34, 11],
    [990, 92, 7],
    [1100, 50, 9],
    [540, 96, 5],
    [700, 130, 5],
    [1160, 128, 6],
    [430, 60, 6],
    [1030, 20, 5],
  ],
};
const LEAP_NARROW: LeapLayout = {
  w: 400,
  puddle: [74, 282, 58],
  trail: "M74,272 C120,150 210,84 300,92",
  candy: [312, 92, 15],
  stars: [
    [190, 44, 7],
    [262, 30, 9],
    [350, 60, 6],
    [372, 140, 5],
    [140, 90, 5],
    [230, 130, 4],
  ],
};
const LeapArt: React.FC<{ layout: LeapLayout; className: string }> = ({ layout: l, className }) => (
  <svg className={className} viewBox={`0 0 ${l.w} 320`} preserveAspectRatio="xMidYMid slice">
    <line x1="0" y1="250" x2={l.w} y2="250" className="a004-leap__horizon" />
    <ellipse cx={l.puddle[0]} cy={l.puddle[1]} rx={l.puddle[2]} ry={l.puddle[2] / 8.5} className="a004-leap__puddle" />
    {l.stars.map(([x, y, r], i) => (
      <path key={i} d={starPath(x, y, r)} className="a004-star a004-leap__star" style={{ transitionDelay: `${0.6 + i * 0.06}s` }} />
    ))}
    <path d={l.trail} className="a004-leap__trail" pathLength={1} />
    <Candy x={l.candy[0]} y={l.candy[1]} r={l.candy[2]} color={C.mustard} className="a004-leap__candy" />
  </svg>
);
const Leap: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className={`a004-leap${className}`} aria-hidden="true">
      <LeapArt layout={LEAP_WIDE} className="a004-leap__wide" />
      <LeapArt layout={LEAP_NARROW} className="a004-leap__narrow" />
    </div>
  );
};

/** 閉じた傘の線画(踊ってみた・ライヴの段落の前)。差さずに手に持つ傘。まわりで雨粒がはねる */
const Umbrella: React.FC = () => (
  <div className="a004-umbrella" aria-hidden="true">
    <svg viewBox="0 0 220 150">
      <g transform="rotate(-24 110 75)">
        <path d="M104,16 L116,16 L124,104 L96,104 Z" className="a004-umbrella__canopy" />
        <path d="M110,16 L110,104 M104,30 L100,104 M116,30 L120,104" className="a004-umbrella__rib" />
        <path d="M108,104 L120,104 L117,112 L111,112 Z" className="a004-umbrella__tie" />
        <path d="M110,8 L110,16" className="a004-umbrella__rib" />
        <path d="M110,112 L110,132 C110,142 124,142 124,132" className="a004-umbrella__handle" />
      </g>
      <Candy x={40} y={112} r={7} color={C.teal} />
      <Candy x={176} y={42} r={6} color={C.orange} />
      <Candy x={190} y={118} r={5} color={C.violet} />
      <path d={starPath(54, 40, 6)} className="a004-star a004-star--ink" />
    </svg>
  </div>
);

const DropPopCandyDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, liveRefs, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  const body = (from: number, to: number, className = "a004-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名は「低気圧の日に聴きたい」+ 曲名。曲名だけ大きく組む(文言は変えない)
  const songAt = title.lastIndexOf(SONG);
  const titlePre = songAt > 0 ? title.slice(0, songAt) : null;
  const titleSong = songAt > 0 ? title.slice(songAt) : title;
  // 一言はテキストだけの段落なら、句の切れ目でだけ折り返す
  const lede = blocks[LEDE];
  const ledeText =
    lede?.t === "p" && lede.children.every((n) => n.t === "text")
      ? lede.children.map((n) => (n.t === "text" ? n.v : "")).join("")
      : null;
  // 演奏記録の注記: 新式浪漫ツアーの公演と、その前の演奏(サイトのセットリスト記録。designManifest の liveItemUuids)
  const tour = liveRefs.filter((l) => l.liveTitle.includes(TOUR)).sort((a, b) => a.date.localeCompare(b.date));
  const before = liveRefs
    .filter((l) => !l.liveTitle.includes(TOUR) && tour.length > 0 && l.date < tour[0].date)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  const mv = leadMedia;

  return (
    <main className="a004" lang="ja">
      <article>
        {/* 表紙: 低気圧の灰色の空に細い雨。題名のまわりで雨粒がキャンディに変わる */}
        <header className="a004-cover" data-og-cover>
          <CoverRain />
          <div className="a004-cover__top">
            <nav aria-label="パンくず" className="a004-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>drop pop candy</span>
            </nav>
          </div>
          <div className="a004-cover__body">
            <h1 className="a004-title">
              {titlePre && (
                <span className="a004-title__pre">
                  <Phrased text={titlePre} />
                </span>
              )}
              <span className="a004-title__song">{titleSong}</span>
            </h1>
            <p className="a004-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a004-ground">
          <div className="a004-column">
            {/* MV: 表紙の下。クリックした時だけ YouTube を読み込む */}
            {mv ? (
              <figure className="a004-video">
                <figcaption className="a004-video__label">MV</figcaption>
                <OfficialMedia videoId={mv.videoId} href={mv.href} text={mv.text} articleId={id} unstyled />
              </figure>
            ) : (
              // 登録済みの MV と一致しない時は、本文の冒頭のリンクのまま
              body(0, LEDE)
            )}

            {/* 一言。前にリリースの注記 */}
            <div className="a004-row">
              {firstRelease && (
                <aside className="a004-note">
                  <p className="a004-note__label">リリース</p>
                  <p>
                    <span className="a004-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『
                    {firstRelease.title}』
                  </p>
                </aside>
              )}
              {ledeText ? (
                <div className="a004-lede">
                  <p>
                    <Phrased text={ledeText} />
                  </p>
                </div>
              ) : (
                body(LEDE, LEDE + 1, "a004-lede")
              )}
            </div>

            {/* 雨と遊ぶ。その後に、しずくが一粒ずつキャンディに変わる列 */}
            <div className="a004-group">{body(RAIN, DUET)}</div>
            <DropsToCandy />

            {/* 掛け合い。その後に二本の線 */}
            <div className="a004-group">{body(DUET, LEAP)}</div>
            <Duet />

            {/* 景色の広がり */}
            <div className="a004-group a004-group--tight">{body(LEAP, DAYS)}</div>
          </div>

          {/* ひとっ飛び: 紙面の幅いっぱい */}
          <Leap />

          <div className="a004-column">
            {/* 日々への愛情・楽しいだけではない: 装飾を置かない */}
            <div className="a004-group">{body(DAYS, DANCE)}</div>

            <Umbrella />

            {/* 踊ってみた。動画へのリンクは本文のまま(サイトに登録された映像ではない) */}
            <div className="a004-group">
              {body(DANCE, DANCE_LINK)}
              {body(DANCE_LINK, DANCE_LINK + 1, "a004-text a004-extlink")}
              {body(DANCE_LINK + 1, LIVE)}
            </div>

            {/* ライヴ。前に演奏記録の注記 */}
            <div className="a004-group">
              {tour.length > 0 && (
                <aside className="a004-note a004-note--inline">
                  <p className="a004-note__label">演奏記録</p>
                  <p>
                    {tour[0].liveTitle}
                    <br />
                    <span className="a004-note__strong">
                      {dotDate(tour[0].date)}〜{dotDate(tour[tour.length - 1].date)}
                    </span>{" "}
                    の全{tour.length}公演で演奏
                    {before && (
                      <>
                        <br />
                        その前の演奏: <span className="a004-note__strong">{dotDate(before.date)}</span> {before.liveTitle}
                        {before.liveItemName ? ` ${before.liveItemName}` : ""}
                      </>
                    )}
                    <br />
                    <Link
                      to={tour[0].path}
                      onClick={() => trackEvent("article_live_page_click", { category: "navigation", label: id })}
                    >
                      ツアー初日の公演ページへ
                    </Link>
                  </p>
                </aside>
              )}
              {body(LIVE, CLOSING)}
            </div>
          </div>

          {/* 結び: 色の粒がやわらかく降る */}
          <div className="a004-last">
            <div className="a004-column">{body(CLOSING, blocks.length, "a004-text a004-closing")}</div>
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a004-colophon">
            <dl className="a004-colophon__list">
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
                    <span className="a004-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a004-next">
              {songPages.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/songs/${p.slug}/`}
                    onClick={() => trackEvent("article_song_page_click", { category: "navigation", label: id })}
                  >
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

export default DropPopCandyDesign;
