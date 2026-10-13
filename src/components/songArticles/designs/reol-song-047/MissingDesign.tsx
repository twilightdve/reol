/**
 * 楽曲記事「ミッシング」(reol-song-047)の記事別デザイン。設計の根拠は plan/42。
 *
 * - 主役は環状線の輪とタクシー。表紙は夜の街並み(ビルの影と窓の明かり)の上に閉じた輪(実際の地図ではない)、その上をタクシー(上から見た車)が赤いテールランプの尾を引いて回り続ける。
 * - 紙面は夜のアスファルトの黒紺の地に、ナトリウム灯の橙と、タクシーの表示の赤。
 * - 段落5の後: タクシーメーター。運賃(100円ずつ)と走行距離は上がり続けるのに、出発地からの距離は 0 のまま。
 * - 段落9の後: 追い越される。上から見た道路。白線が流れ、自分のタクシー(表紙と同じ橙の車)の横を、速い白い車が次々と追い越していく。
 * - 段落12(収録作)の後: 『虚構集』XFD をミッシングの場面から(クリックで読み込む)。
 * - 段落20の後: 四十九の灯の輪。一つずつ点き、最後の一つだけ赤い。
 * - 結び: タクシーが速度を上げて画面の外へ走り抜け、いなくなる(ミッシング)。誰もいない道路だけが残る。
 * - 歌詞は本文の外に出さない。XFD の画面は複製しない。
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
import "./missing.css";

// 段落の位置(designManifest.ts の anchors と対応)
const SPOTIFY = 0;
const INTRO = 1;
const BODY = 2;
const METER_FIG = 6; // 段落5(どれだけ走ったかはわかるのに、どこまで進んだかはわからない)の後
const PASS_FIG = 10; // 段落9(世界のほうが先へ進んでしまう)の後
const XFD_AT = 13; // 段落12(収録作)の後
const RING_FIG = 21; // 段落20(四十九日・中陰)の後

// MV の無い曲なので、アルバム『虚構集』の公式 XFD(サイト登録済み)をミッシングの場面から再生する。
// 開始位置 1:14 はユーザー指定(2026-10-13)
const XFD = { id: "18AQGiLKVs4", start: 74, text: "『虚構集』XFD の「ミッシング」(1:14〜)を観る" };

// 環状線を抽象化した、角の丸い閉じた輪(実際の地図ではない)
const LOOP_PATH =
  "M300,60 C400,58 470,92 500,150 C528,206 512,262 470,296 C424,334 352,344 290,340 C214,336 150,318 118,272 C84,224 92,160 128,118 C168,72 226,62 300,60 Z";

/** 動きを減らす設定かどうか(初回描画と JS なしでは動かさない) */
const useMotionAllowed = () => {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    setAllowed(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  return allowed;
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
  return { ref, state, className: state === "static" ? "" : state === "armed" ? " is-armed" : " is-armed is-visible" };
};

/** 環状線の輪と、尾を引いて回り続けるタクシーの灯。動きを減らす設定では灯は止まったまま */
// 表紙の下の夜の街並み: ビルの影と、点いている窓。描画ごとに変わらないよう、決まった計算で並べる(実在の街並みではない)
const hash = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const BUILDINGS = (() => {
  const list: { x: number; w: number; h: number; windows: { x: number; y: number; warm: boolean }[] }[] = [];
  let x = -10;
  let i = 0;
  while (x < 1210) {
    const w = 34 + Math.floor(hash(i + 1) * 46);
    // 中央より左右の端を高く(手前のビル)、ところどころに高いビル
    const h = 60 + Math.floor(hash(i + 7) * 120) + (hash(i + 3) > 0.82 ? 110 : 0);
    const windows: { x: number; y: number; warm: boolean }[] = [];
    for (let cy = 400 - h + 10; cy < 392; cy += 13) {
      for (let cx = x + 6; cx < x + w - 6; cx += 10) {
        const k = cx * 7.1 + cy * 3.3;
        if (hash(k) < 0.24) windows.push({ x: cx, y: cy, warm: hash(k + 1) < 0.7 });
      }
    }
    list.push({ x, w, h, windows });
    x += w + 2;
    i++;
  }
  return list;
})();

/** 表紙の下の夜の街並み(装飾) */
const NightCity: React.FC = () => (
  <svg className="a047-city" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="a047-city-haze" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f2a03d" stopOpacity="0" />
        <stop offset="1" stopColor="#f2a03d" stopOpacity="0.22" />
      </linearGradient>
    </defs>
    {/* 街の明かりで地平が橙に霞む */}
    <rect x="0" y="160" width="1200" height="240" fill="url(#a047-city-haze)" />
    {BUILDINGS.map((bd, i) => (
      <g key={i}>
        <rect x={bd.x} y={400 - bd.h} width={bd.w} height={bd.h} className="a047-city__bldg" />
        {bd.windows.map((wd, j) => (
          <rect key={j} x={wd.x} y={wd.y} width="4" height="5" className={wd.warm ? "a047-city__win is-warm" : "a047-city__win"} />
        ))}
      </g>
    ))}
  </svg>
);

const RingRoad: React.FC<{ className?: string; idPrefix: string }> = ({ className = "", idPrefix }) => {
  const motion = useMotionAllowed();
  const tail = [0, 0.06, 0.12, 0.18, 0.24, 0.3];
  return (
    <svg className={`a047-ring ${className}`} viewBox="0 0 600 400" aria-hidden="true">
      <defs>
        <path id={`${idPrefix}-loop`} d={LOOP_PATH} />
        <linearGradient id={`${idPrefix}-beam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff2c6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff2c6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* 道路の帯と、点線の車線 */}
      <path d={LOOP_PATH} className="a047-ring__road" />
      <path d={LOOP_PATH} className="a047-ring__lane" />
      {/* テールランプの残光(赤い尾)。タクシーより少し遅れて同じ道をなぞる */}
      {motion &&
        [0.12, 0.22, 0.32, 0.42].map((lag, i) => (
          <circle key={lag} r={3.2 - i * 0.5} className="a047-ring__trail" style={{ opacity: 0.8 - i * 0.18 }}>
            <animateMotion dur="12s" repeatCount="indefinite" begin={`-${2 - lag}s`} rotate="auto">
              <mpath href={`#${idPrefix}-loop`} />
            </animateMotion>
          </circle>
        ))}
      {/* タクシー(上から見た車。屋根に表示灯、前にヘッドライトの光)。画面からはみ出す輪を回り、画面に出入りする。止まっている時は輪の上 */}
      {motion ? (
        <g>
          <animateMotion dur="12s" repeatCount="indefinite" begin="-2s" rotate="auto">
            <mpath href={`#${idPrefix}-loop`} />
          </animateMotion>
          <g transform="scale(0.6)">
            <Taxi beamId={`${idPrefix}-beam`} />
          </g>
        </g>
      ) : (
        <g transform="translate(300 60) scale(0.6)">
          <Taxi beamId={`${idPrefix}-beam`} />
        </g>
      )}
    </svg>
  );
};

/**
 * タクシーメーター: 走るほど運賃(100円ずつ)と走行距離は上がっていくのに、出発地からの距離は 0 のまま。
 * 数字は図のためのもの(運賃は、初乗り約1km 500円・以降約255mごとに100円で計算)
 */
const FARE_FIRST_KM = 1.096;
const FARE_STEP_KM = 0.255;
const fareFor = (km: number) => (km <= FARE_FIRST_KM ? 500 : 500 + Math.ceil((km - FARE_FIRST_KM) / FARE_STEP_KM) * 100);
// 走行距離は 49 km で止める(四十九日に重ねる。2026-10-13 ユーザー提案)
const METER_FINAL_KM = 49;
const Meter: React.FC = () => {
  const { ref, state, className } = useRevealOnce<HTMLDivElement>(0.6);
  const [km, setKm] = useState(METER_FINAL_KM);
  useEffect(() => {
    if (state === "armed") setKm(0);
    if (state !== "visible") return;
    let raf = 0;
    const t0 = performance.now();
    const DUR = 5200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DUR);
      // 走り出しはゆっくり、途中から速く(速度を上げていく)
      setKm(METER_FINAL_KM * p * p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);
  const fare = fareFor(km);
  return (
    <div ref={ref} className={`a047-meter${className}`} aria-hidden="true">
      <div className="a047-meter__head">
        <span className="a047-meter__lamp">賃走</span>
        <span className="a047-meter__off">割増</span>
        <span className="a047-meter__off">迎車</span>
      </div>
      <div className="a047-meter__fare">
        <span className="a047-meter__label">運賃</span>
        {/* 運賃が上がるたびに数字を光らせる(key を変えて動きをやり直す) */}
        <span key={fare} className="a047-meter__yen">
          {fare.toLocaleString("ja-JP")}
          <small>円</small>
        </span>
      </div>
      <div className="a047-meter__rows">
        <div className="a047-meter__row">
          <span className="a047-meter__label">走行距離</span>
          <span className="a047-meter__num">
            {km.toFixed(1)}
            <small>km</small>
          </span>
        </div>
        <div className="a047-meter__row is-still">
          <span className="a047-meter__label">出発地から</span>
          <span className="a047-meter__num">
            0.0
            <small>km</small>
          </span>
        </div>
      </div>
    </div>
  );
};

/** 表紙と「追い越される」の図のタクシー(右向き)。上から見た車に、屋根の表示灯 */
const Taxi: React.FC<{ beamId: string }> = ({ beamId }) => (
  <g className="a047-car is-me">
    <path d="M28,-9 L76,-18 L76,18 L28,9 Z" fill={`url(#${beamId})`} className="a047-car__beam" />
    <rect x="-28" y="-11" width="56" height="22" rx="6" className="a047-car__body" />
    <rect x="4" y="-8" width="11" height="16" rx="2" className="a047-car__glass" />
    <rect x="-20" y="-8" width="9" height="16" rx="2" className="a047-car__glass" />
    <rect x="-8" y="-5" width="10" height="10" rx="2" className="a047-car__roof" />
    <rect x="24" y="-9" width="4" height="5" rx="1" className="a047-car__light" />
    <rect x="24" y="4" width="4" height="5" rx="1" className="a047-car__light" />
    <rect x="-29" y="-9" width="3" height="5" rx="1" className="a047-car__tail" />
    <rect x="-29" y="4" width="3" height="5" rx="1" className="a047-car__tail" />
  </g>
);

/** 上から見た車(右向き)。前にヘッドライトの光 */
const Car: React.FC<{ className: string; x: number; y: number; beamId: string }> = ({ className, x, y, beamId }) => (
  <g className={className} transform={`translate(${x} ${y})`}>
    <path d="M28,-9 L76,-18 L76,18 L28,9 Z" fill={`url(#${beamId})`} className="a047-car__beam" />
    <rect x="-28" y="-11" width="56" height="22" rx="6" className="a047-car__body" />
    <rect x="4" y="-8" width="11" height="16" rx="2" className="a047-car__glass" />
    <rect x="-20" y="-8" width="9" height="16" rx="2" className="a047-car__glass" />
    <rect x="24" y="-9" width="4" height="5" rx="1" className="a047-car__light" />
    <rect x="24" y="4" width="4" height="5" rx="1" className="a047-car__light" />
    <rect x="-29" y="-9" width="3" height="5" rx="1" className="a047-car__tail" />
    <rect x="-29" y="4" width="3" height="5" rx="1" className="a047-car__tail" />
  </g>
);

/**
 * 追い越される: 上から見た道路。白線が流れて、自分(真ん中の車線のタクシー)も走っているのがわかる。
 * それより速い車が、後ろから次々と追い越していく。動きを減らす設定・JS なしでは、追い越された後の位置で止まる
 */
const Overtaken: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  const others = [
    { lane: 46, delay: 0, dur: 2.2, rest: 300 },
    { lane: 134, delay: 0.8, dur: 1.9, rest: 380 },
    { lane: 46, delay: 1.6, dur: 2.1, rest: 450 },
  ];
  return (
    <div ref={ref} className={`a047-pass${className}`} aria-hidden="true">
      <svg viewBox="0 0 520 180">
        <defs>
        <linearGradient id="a047-pass-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff2c6" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff2c6" stopOpacity="0" />
        </linearGradient>
        </defs>
        <rect x="0" y="0" width="520" height="180" className="a047-pass__asphalt" />
        <line x1="0" y1="6" x2="520" y2="6" className="a047-pass__edge" />
        <line x1="0" y1="174" x2="520" y2="174" className="a047-pass__edge" />
        {/* 車線の白線(流れる) */}
        <g className="a047-pass__dashes">
          <line x1="-60" y1="62" x2="580" y2="62" className="a047-pass__dash" />
          <line x1="-60" y1="118" x2="580" y2="118" className="a047-pass__dash" />
        </g>
        {/* 自分: 真ん中の車線の橙のタクシー(表紙と同じ車。札は付けない) */}
        <g className="a047-pass__me">
          <g transform="translate(170 90)">
            <Taxi beamId="a047-pass-beam" />
          </g>
        </g>
        {/* 追い越していく車 */}
        {others.map((o, i) => (
          <g
            key={i}
            className="a047-pass__other"
            style={{ animationDelay: `${o.delay}s`, animationDuration: `${o.dur}s`, ["--rest" as string]: `${o.rest}px` } as React.CSSProperties}
          >
            <Car className="a047-car" x={0} y={o.lane} beamId="a047-pass-beam" />
          </g>
        ))}
      </svg>
    </div>
  );
};

/**
 * 結び: タクシーが速度を上げて画面の外へ走り抜け、いなくなる(ミッシング)。残るのは誰もいない道路だけ。
 * JS なし・動きを減らす設定・最初から画面内なら、もう走り去った後(道路だけ)
 */
const Exit: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.7);
  return (
    <div ref={ref} className={`a047-exit${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 120">
        <defs>
          <linearGradient id="a047-exit-beam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff2c6" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff2c6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="a047-exit-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff4a3a" stopOpacity="0" />
            <stop offset="1" stopColor="#ff4a3a" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <rect x="0" y="20" width="600" height="80" className="a047-exit__road" />
        <line x1="0" y1="24" x2="600" y2="24" className="a047-exit__edge" />
        <line x1="0" y1="96" x2="600" y2="96" className="a047-exit__edge" />
        <line x1="-20" y1="60" x2="620" y2="60" className="a047-exit__dash" />
        {/* 走り去るタクシーと、テールランプの残光 */}
        <g className="a047-exit__car">
          <rect x="-150" y="54" width="122" height="12" rx="6" fill="url(#a047-exit-trail)" className="a047-exit__trail" />
          <g transform="translate(0 60)">
            <Taxi beamId="a047-exit-beam" />
          </g>
        </g>
      </svg>
    </div>
  );
};

/** 四十九の灯の輪: 一つずつ点き、最後の一つ(四十九日目)だけ赤い */
const FortyNine: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  const N = 49;
  return (
    <div ref={ref} className={`a047-49${className}`} aria-hidden="true">
      <svg viewBox="0 0 240 240">
        {Array.from({ length: N }, (_, i) => {
          const a = ((i / N) * 360 - 90) * (Math.PI / 180);
          return (
            <circle
              key={i}
              cx={120 + 96 * Math.cos(a)}
              cy={120 + 96 * Math.sin(a)}
              r={i === N - 1 ? 5.5 : 3.6}
              className={`a047-49__day${i === N - 1 ? " is-last" : ""}`}
              style={{ transitionDelay: `${0.06 * i}s` }}
            />
          );
        })}
        <text x="120" y="128" textAnchor="middle" className="a047-49__label">
          四十九日
        </text>
      </svg>
    </div>
  );
};

const MissingDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  const body = (from: number, to: number, className = "a047-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「ミッシング　行き先のない逃避行」: 曲名を大きく、副題を下に(文言は変えない)
  const SONG = "ミッシング";
  const tSub = title.startsWith(SONG) ? title.slice(SONG.length).trim() : "";

  return (
    <main className="a047" lang="ja">
      <article>
        {/* 表紙: 夜の環状線と、回り続けるタクシーの灯 */}
        <header className="a047-cover" data-og-cover>
          <NightCity />
          <div className="a047-cover__art">
            <RingRoad idPrefix="a047-cover" />
          </div>
          <div className="a047-cover__top">
            <nav aria-label="パンくず" className="a047-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>ミッシング</span>
            </nav>
          </div>
          <div className="a047-cover__body">
            <h1 className="a047-title">
              {tSub ? (
                <>
                  <span className="a047-title__song">{SONG}</span>
                  <span className="a047-title__sub">{tSub}</span>
                </>
              ) : (
                <span className="a047-title__song">{title}</span>
              )}
            </h1>
            <p className="a047-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a047-ground">
          <div className="a047-column">
            {body(SPOTIFY, INTRO, "a047-text a047-listen")}

            <div className="a047-section">
              {firstRelease && (
                <aside className="a047-note">
                  <p className="a047-note__label">リリース</p>
                  <p>
                    <span className="a047-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『
                    {firstRelease.title}』
                  </p>
                </aside>
              )}
              {body(INTRO, BODY, "a047-text a047-intro")}
            </div>

            {/* 環状線とタクシー。段落5の後にメーター、段落9の後に追い越される図 */}
            <section className="a047-section">
              {body(BODY, METER_FIG)}
              <Meter />
              {body(METER_FIG, PASS_FIG)}
              <Overtaken />
              {body(PASS_FIG, XFD_AT)}
              {/* 収録作の段落の後に、アルバムの XFD をミッシングの場面から */}
              <figure className="a047-video">
                <figcaption className="a047-video__label">『虚構集』XFD</figcaption>
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
              {body(XFD_AT, RING_FIG)}
              <FortyNine />
              {body(RING_FIG, blocks.length, "a047-text a047-closing")}
            </section>

            {/* 結び: タクシーが画面の外へ走り抜けて、いなくなる */}
            <Exit />
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a047-colophon">
            <dl className="a047-colophon__list">
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
                    <span className="a047-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a047-next">
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

export default MissingDesign;
