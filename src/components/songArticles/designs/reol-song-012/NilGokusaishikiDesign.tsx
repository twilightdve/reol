/**
 * 楽曲記事「-nil-／極彩色」(reol-song-012)の記事別デザイン。設計の根拠は plan/49。
 *
 * - 紙面は白(無)。色は水彩のにじみだけで入れる。地の白と墨の文字は最後まで同じで、節ごとに見出しのにじみの色が一つずつ増える(静的)。
 * - 表紙: 白い紙の真ん中で鼓動の輪が二度広がり、そこから水彩の色がにじみ広がる。題名は墨。
 * - 段落1: 「極彩色」公式MV(冒頭リンクが Spotify なので自分で置く)。段落5の後: 灰色の鼓動が切れ目なく色の帯へ変わる。
 * - 段落12の後: 『極彩色』16曲の輪。点の色は、歌詞と構成から拾った曲ごとの色と明暗(公式のイメージカラーではない。歌詞の無い -orderly- は塗らない)。
 * - 段落24(歌詞ではない文)を大きく。段落30の後: 四人の表現の四つのにじみが重なる。段落46の後: 名義の年表。
 * - 武道館の節: 武道館の「極彩色」ライヴ映像(サイトのセットリストに登録済み)、段落64の後に二つの輪(終わりを次の始まりへ)。
 * - 段落70の後: 本文に出る色の言葉の色見本。結び: 色が引いて白に戻る鼓動の輪。
 * - 歌詞は本文の外に出さない。ジャケット・MV・ライヴ映像の画面は複製しない(蝶も描かない)。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import OfficialMedia from "../../OfficialMedia";
import { inlineText } from "../../../../utils/songArticles/markdown";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./nil-gokusaishiki.css";

// 段落の位置(designManifest.ts の anchors と対応)
const SPOTIFY = 0;
const MV = 1;
const INTRO = 2;
const SEAM_FIG = 6; // 段落5(二曲の境界をほとんど感じさせない)の後
const S_CYCLE = 9;
const RING_FIG = 13; // 段落12(この流れを人生にも重ねていた)の後
const S_SELF = 16;
const PULL_SELF = 24; // 迷いをなくすのではなく、迷っていても自分を見捨てない。…
const S_FOUR = 28;
const FOUR_FIG = 31; // 段落30(ギガの音楽、望月けいのイラスト、お菊の映像、…)の後
const S_BETWEEN = 43;
const YEARS_FIG = 47; // 段落46(REOL・解散・Reol)の後
const S_BUDOKAN = 55;
const LIVE_AT = 58; // 段落57(その最初に歌われたのが「極彩色」)の後
const LOOPS_FIG = 65; // 段落64(-Ending- から始まり -Opening- で終わる武道館。染から -nil- へ戻る)の後
const S_COLORS = 67;
const SWATCH_FIG = 71; // 段落70(水底游歩道・Syrup・ラ・タタンの色)の後
const S_RETURN = 76;

// 公式MV(管理表 official_mv)と、武道館の「極彩色」(サイトの武道館のセットリストに登録済み)。どちらも見ていない
const MV_ID = "5vebKoO__8A";
// 本文の出典のうち、何度も出てくる音楽ナタリーの特集(本文からはリンクを外し、奥付に一度だけ)
const NATALIE = { url: "https://natalie.mu/music/pp/reol", text: "音楽ナタリー「れをる『極彩色』特集」" };
const LIVE = { id: "38zFT05sqfE", text: "日本武道館「No title」(2024)の「極彩色」を観る" };

// 色見本と輪で使う色(水底游歩道・Syrup・ラ・タタンは色見本と同じ色)
const C = {
  blue: "#2f64a8",
  white: "#ffffff",
  gray: "#9b9ea3",
  black: "#1b1c1f",
  pink: "#f2b8c4",
  red: "#c9343f",
  ao: "#2a6f8c",
  orange: "#e8893a",
  // 色の名前ではなく手がかりから選んだ色: 青写真の深い青、色素の混ぜ色、背伸びして塗る大人びた色
  blueprint: "#1d4f7a",
  pigment: "#c8a6b8",
  bordeaux: "#7a2e3f",
  // 明暗は色ではなく、灰色の濃さで描く
  light: "#ece6d4",
  shade: "#8d939a",
  dark: "#2b2d32",
};
const RAINBOW = ["#e9566a", "#f2a541", "#f4dc5a", "#5cc08a", "#4f9fd8", "#8d6cc9"];
const TWILIGHT = ["#2c2f63", "#8c5a8f", "#ec9a63"];

/**
 * 『極彩色』の曲順(サイトの discography)。記事のある曲は記事へ。
 * 色は、歌詞と構成から拾った色と明暗(ユーザーの「曲ごとの色彩対応表」、2026-10-22)。公式のイメージカラーではない。
 * 生命線・ハルシアンは色の名前ではなく手がかりから色を選ぶ。歌詞の無い -orderly- だけ塗らない(colors が空)。
 * 色の説明は書かない(ユーザー、2026-10-23)。lines は輪の外に書く曲名の改行(スマートフォン幅で収めるため)
 */
const TRACKS: { name: string; article?: string; colors: string[]; lines?: string[] }[] = [
  { name: "-nil-", colors: [] },
  { name: "極彩色", colors: RAINBOW },
  { name: "生命線", article: "seimei-sen", colors: [C.blueprint, C.pigment] },
  { name: "水底游歩道", article: "minasoko-yuu-hodou", colors: [C.blue, C.white, C.gray, C.black] },
  { name: "ハルシアン", article: "harushian", colors: [C.bordeaux] },
  { name: "ロジックエージェント", colors: [C.light, C.shade], lines: ["ロジック", "エージェント"] },
  { name: "-orderly-", colors: [] },
  { name: "mede:mede", colors: [C.white, C.light] },
  { name: "Syrup", colors: [C.pink, C.pink, C.pink, RAINBOW[0], RAINBOW[2], RAINBOW[4]] },
  { name: "ラ・タタン", colors: [C.white, C.black, ...TWILIGHT] },
  { name: "ミッドナイトストロウラ", colors: [C.light, C.dark, C.shade], lines: ["ミッドナイト", "ストロウラ"] },
  { name: "Behind The Night", colors: [C.light, C.dark, C.shade], lines: ["Behind", "The Night"] },
  { name: "ROXY", colors: [C.red] },
  { name: "約束の蒼", colors: [C.ao] },
  { name: "MONSTER", article: "monster", colors: [C.red, C.dark, C.shade] },
  { name: "染", colors: [C.orange, C.shade] },
];

/** 輪の点: 色を等分した扇形。12時から時計回り */
const Wedges: React.FC<{ cx: number; cy: number; r: number; colors: string[] }> = ({ cx, cy, r, colors }) => {
  if (colors.length === 1) return <circle cx={cx} cy={cy} r={r} fill={colors[0]} />;
  const at = (k: number) => {
    const a = (k / colors.length) * Math.PI * 2 - Math.PI / 2;
    return `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`;
  };
  return (
    <>
      {colors.map((c, k) => (
        <path key={k} d={`M${cx} ${cy}L${at(k)}A${r} ${r} 0 0 1 ${at(k + 1)}Z`} fill={c} />
      ))}
    </>
  );
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

/** 水彩のにじみ: 中は淡く、縁に色が溜まる(水彩の乾いた跡)。縁は WashDefs のフィルターで崩す */
const gradId = (color: string) => `a012-g-${color.replace("#", "")}`;
const Bloom: React.FC<{ cx: number; cy: number; r: number; color: string; className?: string }> = ({ cx, cy, r, color, className = "" }) => (
  <circle cx={cx} cy={cy} r={r} fill={`url(#${gradId(color)})`} className={`a012-bloom ${className}`} filter="url(#a012-wash)" />
);

/** にじみの縁を崩すフィルターと、色ごとのにじみのグラデーション(SVG ごとに置く。id が重なっても同じ定義) */
const WashDefs: React.FC<{ colors: string[] }> = ({ colors }) => (
  <>
    <filter id="a012-wash" x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="7" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="warped" />
      <feGaussianBlur in="warped" stdDeviation="0.8" />
    </filter>
    {[...new Set(colors)].map((c) => (
      <radialGradient key={c} id={gradId(c)} cx="0.46" cy="0.44" r="0.56">
        <stop offset="0" stopColor={c} stopOpacity="0.22" />
        <stop offset="0.72" stopColor={c} stopOpacity="0.42" />
        <stop offset="0.93" stopColor={c} stopOpacity="0.62" />
        <stop offset="1" stopColor={c} stopOpacity="0.5" />
      </radialGradient>
    ))}
  </>
);

/** 表紙: 鼓動の輪が二度広がり、そこから色が散らばってにじむ */
const COVER_BLOOMS: { cx: number; cy: number; r: number; color: string }[] = [
  { cx: 300, cy: 300, r: 104, color: "#6fa1ce" },
  { cx: 418, cy: 214, r: 74, color: "#e0607e" },
  { cx: 192, cy: 206, r: 62, color: "#f2b544" },
  { cx: 176, cy: 380, r: 82, color: "#3fb3a3" },
  { cx: 428, cy: 404, r: 90, color: "#8d6cc9" },
  { cx: 318, cy: 126, r: 38, color: "#e9713f" },
  { cx: 282, cy: 484, r: 52, color: "#b78a61" },
  { cx: 532, cy: 296, r: 20, color: "#e0607e" },
  { cx: 78, cy: 288, r: 16, color: "#6fa1ce" },
  { cx: 506, cy: 532, r: 14, color: "#f2b544" },
  { cx: 120, cy: 512, r: 11, color: "#8d6cc9" },
  { cx: 468, cy: 92, r: 12, color: "#3fb3a3" },
];
const CoverArt: React.FC = () => (
  <svg className="a012-cover__art" viewBox="0 0 600 600" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
    <defs>
      <WashDefs colors={COVER_BLOOMS.map((b) => b.color)} />
    </defs>
    <g className="a012-cover__blooms">
      {COVER_BLOOMS.map((b, i) => (
        <Bloom key={i} {...b} className={`is-${Math.min(i + 1, 7)}`} />
      ))}
    </g>
    <circle cx="300" cy="300" r="40" className="a012-cover__pulse is-1" />
    <circle cx="300" cy="300" r="40" className="a012-cover__pulse is-2" />
  </svg>
);

/** 段落5の後: 灰色の鼓動(-nil-)が、切れ目なく色の帯(極彩色)へ変わる */
const Seam: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  // 音の波形: 静かな線に、鼓動(どくん、どくん)の山が3回
  const bars = Array.from({ length: 40 }, (_, i) => {
    const x = 12 + i * 6;
    const phase = (x - 12) % 80;
    const h = phase < 6 ? 30 : phase >= 12 && phase < 18 ? 18 : phase >= 6 && phase < 12 ? 12 : 3;
    return { x, h };
  });
  return (
    <figure ref={ref} className={`a012-seam${className}`} aria-label="-nil- の鼓動から、切れ目なく「極彩色」の色へ">
      <svg viewBox="0 0 600 120" aria-hidden="true">
        <defs>
          <linearGradient id="a012-seam-band" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#9aa0a6" />
            <stop offset="0.28" stopColor="#9aa0a6" />
            <stop offset="0.45" stopColor="#6fa1ce" />
            <stop offset="0.6" stopColor="#3fb3a3" />
            <stop offset="0.72" stopColor="#f2b544" />
            <stop offset="0.86" stopColor="#e0607e" />
            <stop offset="1" stopColor="#8d6cc9" />
          </linearGradient>
          <linearGradient id="a012-seam-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="a012-seam-mask">
            <rect x="0" y="0" width="600" height="120" fill="url(#a012-seam-fade)" />
          </mask>
        </defs>
        <g className="a012-seam__pulse">
          {bars.map((b) => (
            <line key={b.x} x1={b.x} y1={60 - b.h / 2} x2={b.x} y2={60 + b.h / 2} />
          ))}
        </g>
        {/* 鼓動の線が太くなりながら、そのまま色の帯になる */}
        <path d="M200,60 C260,60 280,40 330,40 L590,40 L590,80 L330,80 C280,80 260,60 200,60 Z" fill="url(#a012-seam-band)" mask="url(#a012-seam-mask)" className="a012-seam__band" />
        <text x="10" y="108" className="a012-seam__label">-nil-</text>
        <text x="590" y="108" textAnchor="end" className="a012-seam__label">極彩色</text>
      </svg>
    </figure>
  );
};

/** 段落12の後: 『極彩色』16曲の輪。曲名は輪の外側に。-nil- と染に鼓動の印 */
const Ring: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.4);
  const n = TRACKS.length;
  const W = 360;
  const c = W / 2;
  const R = 100;
  const L = R + 14; // 曲名を置く距離
  const FS = 12;
  const LH = 14;
  const angle = (i: number) => (i / n) * Math.PI * 2;
  const at = (i: number, r: number) => ({ x: c + Math.sin(angle(i)) * r, y: c - Math.cos(angle(i)) * r });
  return (
    <figure ref={ref} className={`a012-ring${className}`}>
      <svg viewBox={`0 0 ${W} ${W}`} className="a012-ring__svg" role="group" aria-label="『極彩色』の16曲">
        <circle cx={c} cy={c} r={R} className="a012-ring__track" />
        {TRACKS.map((t, i) => {
          const p = at(i, R);
          const q = at(i, L);
          const sin = Math.sin(angle(i));
          const cos = Math.cos(angle(i));
          const anchor = Math.abs(sin) < 0.2 ? "middle" : sin > 0 ? "start" : "end";
          const lines = t.lines ?? [t.name];
          // 上は文字の下端を、下は上端を点に寄せ、横は点の高さに中心をそろえる
          const top = cos > 0.9 ? q.y - (lines.length - 1) * LH - 2 : cos < -0.9 ? q.y + FS : q.y - ((lines.length - 1) * LH) / 2 + FS * 0.36;
          const beat = i === 0 || i === n - 1;
          const label = (
            <text x={q.x} y={top} textAnchor={anchor} className={`a012-ring__name${i <= 1 ? " is-here" : ""}`}>
              {lines.map((line, k) => (
                <tspan key={line} x={q.x} dy={k === 0 ? 0 : LH}>
                  {line}
                </tspan>
              ))}
            </text>
          );
          return (
            <g key={t.name} className="a012-ring__dot" style={{ animationDelay: `${i * 70}ms` }}>
              {beat && <circle cx={p.x} cy={p.y} r="14" className="a012-ring__beat" />}
              {t.colors.length > 0 && <Wedges cx={p.x} cy={p.y} r={9} colors={t.colors} />}
              <circle cx={p.x} cy={p.y} r="9" className={t.colors.length > 0 ? "a012-ring__edge" : i === 0 ? "a012-ring__nil" : "a012-ring__blank"} />
              {t.article ? (
                <Link to={`/articles/${t.article}/`} className="a012-ring__link" onClick={() => trackEvent("article_related_click", { category: "navigation", label: `reol-song-012->${t.article}` })}>
                  {label}
                </Link>
              ) : (
                label
              )}
            </g>
          );
        })}
        <text x={c} y={c - 4} textAnchor="middle" className="a012-ring__center">
          『極彩色』
        </text>
        <text x={c} y={c + 16} textAnchor="middle" className="a012-ring__centerSub">
          16曲
        </text>
      </svg>
    </figure>
  );
};

/**
 * 段落30の後: 四人の表現が重なる四つのにじみ。
 * 色は四人それぞれに決まっている色(ユーザー、2026-10-23): れをる 群青、ギガ 深い緑、お菊 赤に近いピンク、望月けい くすんだゴールド(生姜のような)
 */
const MEMBER = { reol: "#2f4fa2", giga: "#1e5c45", okiku: "#e0405e", kei: "#b38a45" };
const FOUR = [
  { cx: 220, cy: 150, r: 112, color: MEMBER.giga, what: "音楽", who: "ギガ", lx: 120, ly: 64 },
  { cx: 380, cy: 150, r: 112, color: MEMBER.kei, what: "イラスト", who: "望月けい", lx: 480, ly: 64 },
  { cx: 220, cy: 270, r: 112, color: MEMBER.okiku, what: "映像", who: "お菊", lx: 120, ly: 384 },
  { cx: 380, cy: 270, r: 112, color: MEMBER.reol, what: "言葉と歌声", who: "れをる", lx: 480, ly: 384 },
];
const Four: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  return (
    <figure ref={ref} className={`a012-four${className}`} aria-label="音楽 ギガ、イラスト 望月けい、映像 お菊、言葉と歌声 れをる。四つが重なって『極彩色』">
      <svg viewBox="0 0 600 420" aria-hidden="true">
        <defs>
          <WashDefs colors={FOUR.map((f) => f.color)} />
        </defs>
        {FOUR.map((f, i) => (
          <Bloom key={f.what} cx={f.cx} cy={f.cy} r={f.r} color={f.color} className={`is-${i + 1}`} />
        ))}
        {FOUR.map((f) => (
          <g key={`${f.what}-label`} className="a012-four__label">
            <text x={f.lx} y={f.ly} textAnchor="middle" className="a012-four__what">
              {f.what}
            </text>
            <text x={f.lx} y={f.ly + 22} textAnchor="middle" className="a012-four__who">
              {f.who}
            </text>
          </g>
        ))}
        <text x="300" y="216" textAnchor="middle" className="a012-four__center">
          『極彩色』
        </text>
      </svg>
    </figure>
  );
};

/** 段落46の後: 名義の年表(本文の事実だけ)。2015 だけ色 */
const YEARS: { year: string; who: string; work?: string; article?: string; here?: boolean }[] = [
  { year: "2014", who: "あにょすぺにょすゃゃ", work: "『No title』", article: "no-title" },
  { year: "2015", who: "れをる", work: "『極彩色』", here: true },
  { year: "2016", who: "REOL", work: "『Σ』" },
  { year: "2017", who: "ユニット解散" },
  { year: "2018", who: "Reol", work: "ソロで再始動" },
];
const Years: React.FC = () => (
  <ol className="a012-years" aria-label="名義の移り変わり">
    {YEARS.map((y) => (
      <li key={y.year} className={y.here ? "is-here" : undefined}>
        <span className="a012-years__year">{y.year}</span>
        <span className="a012-years__who">{y.who}</span>
        {y.work &&
          (y.article ? (
            <Link
              to={`/articles/${y.article}/`}
              className="a012-years__work"
              onClick={() => trackEvent("article_related_click", { category: "navigation", label: `reol-song-012->${y.article}` })}
            >
              {y.work}
            </Link>
          ) : (
            <span className="a012-years__work">{y.work}</span>
          ))}
      </li>
    ))}
  </ol>
);

/**
 * 段落64の後: 終わりを次の始まりへつなぐ二つの線。
 * 武道館は「-Ending-」で始まり「-Opening-」で終わる(その先へ続く)。『極彩色』は染のあと -nil- へ戻る(輪)
 */
const Loop: React.FC<{ label: string; from: string; to: string; back: string; tone: "budokan" | "album" }> = ({ label, from, to, back, tone }) => (
  <div className={`a012-loops__row is-${tone}`}>
    <p className="a012-loops__label">{label}</p>
    <svg viewBox="0 0 600 120" aria-hidden="true">
      {tone === "album" && (
        <defs>
          {/* -nil- の白から、染の深い色へ */}
          <linearGradient id="a012-loops-album" x1="60" y1="0" x2="540" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#c9ccd1" />
            <stop offset="0.3" stopColor="#6fa1ce" />
            <stop offset="0.55" stopColor="#3fb3a3" />
            <stop offset="0.75" stopColor="#e0607e" />
            <stop offset="1" stopColor="#3b3270" />
          </linearGradient>
        </defs>
      )}
      <path d="M60,40 L540,40" className="a012-loops__line" style={tone === "album" ? { stroke: "url(#a012-loops-album)" } : undefined} />
      {tone === "album" ? (
        <path d="M540,40 C600,40 600,100 540,100 L60,100 C0,100 0,40 60,40" className="a012-loops__return" />
      ) : (
        <path d="M540,40 L596,40" className="a012-loops__return" />
      )}
      <circle cx="60" cy="40" r="7" className="a012-loops__dot is-start" />
      <circle cx="540" cy="40" r="7" className="a012-loops__dot is-end" />
      <text x="60" y="24" textAnchor="middle" className="a012-loops__name">
        {from}
      </text>
      <text x="540" y="24" textAnchor="middle" className="a012-loops__name">
        {to}
      </text>
      <text x="300" y="34" textAnchor="middle" className="a012-loops__mid">
        …
      </text>
      <text x="300" y={tone === "album" ? 94 : 76} textAnchor="middle" className="a012-loops__back">
        {back}
      </text>
    </svg>
  </div>
);
const Loops: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  return (
    <figure
      ref={ref}
      className={`a012-loops${className}`}
      aria-label="武道館は -Ending- から始まり -Opening- で終わる。『極彩色』は -nil- から始まり、染のあと再び -nil- へ"
    >
      <Loop label="日本武道館「No title」(2024)" from="-Ending-" to="-Opening-" back="終わりで始まり、始まりで終わる" tone="budokan" />
      <Loop label="『極彩色』(2015)" from="-nil-" to="染" back="染のあと、再び -nil- へ" tone="album" />
    </figure>
  );
};

/** 段落70の後: 本文に出てくる色の言葉を、色見本に */
const SWATCHES: { song: string; colors: { name: string; bg: string }[] }[] = [
  {
    song: "水底游歩道",
    colors: [
      { name: "青", bg: C.blue },
      { name: "白", bg: C.white },
      { name: "灰", bg: C.gray },
      { name: "黒", bg: C.black },
    ],
  },
  {
    song: "Syrup",
    colors: [
      { name: "薄紅", bg: C.pink },
      { name: "虹色", bg: `linear-gradient(90deg, ${RAINBOW.join(", ")})` },
    ],
  },
  {
    song: "ラ・タタン",
    colors: [
      { name: "白黒", bg: "linear-gradient(90deg, #ffffff 50%, #1b1c1f 50%)" },
      { name: "トワイライト", bg: `linear-gradient(90deg, ${TWILIGHT.join(", ")})` },
    ],
  },
];
const Swatches: React.FC = () => (
  <figure className="a012-swatches">
    <dl>
      {SWATCHES.map((s) => (
        <div key={s.song} className="a012-swatches__row">
          <dt>{s.song}</dt>
          <dd>
            {s.colors.map((c) => (
              <span key={c.name} className="a012-swatches__chip">
                <span className="a012-swatches__color" style={{ background: c.bg }} aria-hidden="true" />
                {c.name}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
    <figcaption className="a012-caption">本文に出てくる色の言葉から。色見本はこの記事でのイメージです。</figcaption>
  </figure>
);

/** 結び: 色が引いて、白に戻る鼓動の輪 */
const EndMark: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.8);
  return (
    <div ref={ref} className={`a012-endmark${className}`} aria-hidden="true">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="34" className="a012-endmark__color" />
        <circle cx="60" cy="60" r="18" className="a012-endmark__ring is-1" />
        <circle cx="60" cy="60" r="18" className="a012-endmark__ring is-2" />
        <circle cx="60" cy="60" r="6" className="a012-endmark__heart" />
      </svg>
    </div>
  );
};

const NilGokusaishikiDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  // 収録作は日付順。いちばん古いもの(『極彩色』)を初出にする(武道館のライヴ盤も対応する曲に入っているため)
  const firstRelease = songFacts.releases[0] ?? null;
  const body = (from: number, to: number, className = "a012-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「-nil-／極彩色　無から極彩色への染」: 曲名と副題を分ける(文言は変えない)
  const [tMain, ...tRest] = title.split("　");
  const tSub = tRest.join("　").trim();
  const [tNil, tGoku] = tMain.includes("／") ? tMain.split("／") : [null, tMain];
  const mvBlock = blocks[MV];
  const mvText = mvBlock && mvBlock.t === "p" ? inlineText(mvBlock.children) : "「極彩色」公式MVを観る";

  return (
    <main className="a012" lang="ja">
      <article>
        {/* 表紙: 白い紙に鼓動の輪、そこから水彩の色がにじみ広がる */}
        <header className="a012-cover" data-og-cover>
          <CoverArt />
          <div className="a012-cover__top">
            <nav aria-label="パンくず" className="a012-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>-nil-／極彩色</span>
            </nav>
          </div>
          <div className="a012-cover__body">
            <h1 className="a012-title">
              {tNil !== null && (
                <span className="a012-title__nil">
                  {tNil}
                  <span className="a012-title__slash">／</span>
                </span>
              )}
              <span className="a012-title__song">{tGoku}</span>
              {tSub && <span className="a012-title__sub">{tSub}</span>}
            </h1>
            <p className="a012-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a012-ground">
          <div className="a012-column">
            {body(SPOTIFY, MV, "a012-text a012-listen")}
            <figure className="a012-video">
              <figcaption className="a012-video__label">極彩色 MV</figcaption>
              <OfficialMedia videoId={MV_ID} href={`https://www.youtube.com/watch?v=${MV_ID}`} text={mvText} articleId={id} unstyled preferHighRes />
            </figure>

            {/* 冒頭。前にリリースの注記。段落5の後に境目の帯 */}
            <div className="a012-section a012-section--0">
              {firstRelease && (
                <aside className="a012-note">
                  <p className="a012-note__label">リリース</p>
                  <p>
                    <span className="a012-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『{firstRelease.title}』1曲目「-nil-」・2曲目「極彩色」
                  </p>
                </aside>
              )}
              {body(INTRO, SEAM_FIG, "a012-text")}
              <Seam />
              {body(SEAM_FIG, S_CYCLE)}
            </div>

            {/* 無から生まれ、無へ戻る。段落12の後に16曲の輪 */}
            <section className="a012-section a012-section--1">
              {body(S_CYCLE, RING_FIG)}
              <Ring />
              {body(RING_FIG, S_SELF)}
            </section>

            {/* 君だけは君自身の味方であれ。要の一文(歌詞ではない文)を大きく */}
            <section className="a012-section a012-section--2">
              {body(S_SELF, PULL_SELF)}
              {body(PULL_SELF, PULL_SELF + 1, "a012-text a012-pull")}
              {body(PULL_SELF + 1, S_FOUR)}
            </section>

            {/* 4人の表現が重なって生まれる極彩色。段落30の後に四つのにじみ */}
            <section className="a012-section a012-section--3">
              {body(S_FOUR, FOUR_FIG)}
              <Four />
              {body(FOUR_FIG, S_BETWEEN)}
            </section>

            {/* れをるからREOLへ。段落46の後に名義の年表 */}
            <section className="a012-section a012-section--4">
              {body(S_BETWEEN, YEARS_FIG)}
              <Years />
              {body(YEARS_FIG, S_BUDOKAN)}
            </section>

            {/* 武道館の一曲目に。段落57の後にライヴ映像、段落64の後に二つの輪 */}
            <section className="a012-section a012-section--5">
              {body(S_BUDOKAN, LIVE_AT)}
              <figure className="a012-video">
                <figcaption className="a012-video__label">日本武道館「No title」2024.08.17</figcaption>
                <OfficialMedia videoId={LIVE.id} href={`https://www.youtube.com/watch?v=${LIVE.id}`} text={LIVE.text} articleId={id} unstyled preferHighRes />
              </figure>
              {body(LIVE_AT, LOOPS_FIG)}
              <Loops />
              {body(LOOPS_FIG, S_COLORS)}
            </section>

            {/* アルバム全体を染める色。段落70の後に色見本 */}
            <section className="a012-section a012-section--6">
              {body(S_COLORS, SWATCH_FIG)}
              <Swatches />
              {body(SWATCH_FIG, S_RETURN)}
            </section>

            {/* 再び「-nil-」へ。最後に、色が引いて白に戻る鼓動 */}
            <section className="a012-section a012-section--7 a012-section--last">
              {body(S_RETURN, blocks.length, "a012-text a012-closing")}
              <EndMark />
            </section>
          </div>

          {/* 奥付。サイトの確認済みデータだけ(作詞作曲は曲ごと。-nil- はインストゥルメンタル) */}
          <footer className="a012-colophon">
            <dl className="a012-colophon__list">
              <div>
                <dt>曲</dt>
                <dd>{ctx.songTitle}</dd>
              </div>
              <div>
                <dt>-nil-</dt>
                <dd>作曲 ギガ(インストゥルメンタル)</dd>
              </div>
              <div>
                <dt>極彩色</dt>
                <dd>作詞 れをる / 作曲 ギガ</dd>
              </div>
              {firstRelease && (
                <div>
                  <dt>初出</dt>
                  <dd>
                    {dotDate(firstRelease.releaseDate)} {formatLabel(firstRelease.format)}『{firstRelease.title}』
                  </dd>
                </div>
              )}
              {/* 本文の発言の多くはこの特集から。本文の中で毎回リンクせず、ここに一度だけ置く(ユーザー、2026-10-23) */}
              <div>
                <dt>参考</dt>
                <dd>
                  <a href={NATALIE.url} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("article_source_click", { category: "outbound", label: "reol-song-012->natalie" })}>
                    {NATALIE.text}
                  </a>
                  (全3ページ。れをる・ギガ・お菊の発言の多くはここから)
                </dd>
              </div>
            </dl>
            <ul className="a012-next">
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

export default NilGokusaishikiDesign;
