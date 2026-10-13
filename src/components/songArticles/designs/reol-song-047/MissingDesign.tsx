/**
 * 楽曲記事「ミッシング」(reol-song-047)の記事別デザイン。設計の根拠は plan/42。
 *
 * - 主役は環状線の輪とタクシーの灯。表紙は夜の闇に閉じた輪(実際の地図ではない)、その上を灯が尾を引いて回り続ける。
 * - 紙面は夜のアスファルトの黒紺の地に、ナトリウム灯の橙と、タクシーの表示の赤。
 * - 段落5の後: タクシーメーター。走行距離は増え続けるのに、出発地からの距離は 0 のまま。
 * - 段落9の後: 追い越される。自分の灯の横を、ほかの灯が次々と追い越していく。
 * - 段落12(収録作)の後: 『虚構集』XFD をミッシングの場面から(クリックで読み込む)。
 * - 段落20の後: 四十九の灯の輪。一つずつ点き、最後の一つだけ赤い。
 * - 結び: 表紙と同じ輪を小さく。灯は回り続ける。
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
// 開始位置はプレビュー画像のタイトルカードからの推定(1:24)。ユーザー確認待ち(plan/42)
const XFD = { id: "18AQGiLKVs4", start: 84, text: "『虚構集』XFD の「ミッシング」(1:24〜)を観る" };

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
// 表紙の夜の街の灯(輪の内外に散らばる窓明かり)。描画ごとに変わらないよう、決まった計算で並べる
const CITY_LIGHTS = Array.from({ length: 90 }, (_, i) => {
  const x = (i * 137.5) % 640 - 20;
  const y = (i * 71.3 + (i % 7) * 23) % 420 - 10;
  return { x, y, r: i % 5 === 0 ? 1.8 : 1.1, warm: i % 3 !== 0, o: 0.25 + ((i * 37) % 50) / 100 };
});

const RingRoad: React.FC<{ className?: string; idPrefix: string; city?: boolean }> = ({ className = "", idPrefix, city = false }) => {
  const motion = useMotionAllowed();
  const tail = [0, 0.06, 0.12, 0.18, 0.24, 0.3];
  return (
    <svg className={`a047-ring ${className}`} viewBox="0 0 600 400" aria-hidden="true">
      <defs>
        <path id={`${idPrefix}-loop`} d={LOOP_PATH} />
        <radialGradient id={`${idPrefix}-glow`}>
          <stop offset="0" stopColor="#ffd08a" stopOpacity="1" />
          <stop offset="1" stopColor="#f2a03d" stopOpacity="0" />
        </radialGradient>
      </defs>
      {city &&
        CITY_LIGHTS.map((l, i) => (
          <circle key={i} cx={l.x} cy={l.y} r={l.r} className={l.warm ? "a047-city is-warm" : "a047-city"} style={{ opacity: l.o }} />
        ))}
      {/* 道路の帯と、点線の車線 */}
      <path d={LOOP_PATH} className="a047-ring__road" />
      <path d={LOOP_PATH} className="a047-ring__lane" />
      {/* タクシーの灯(先頭が明るく、尾が薄れる)。止まっている時は輪の右下に置く */}
      {tail.map((lag, i) => (
        <g key={lag} style={{ opacity: 1 - i * 0.15 }}>
          {motion ? (
            <circle r={i === 0 ? 7 : 5 - i * 0.5} className={i === 0 ? "a047-ring__head" : "a047-ring__tail"}>
              <animateMotion dur="7s" repeatCount="indefinite" begin={`-${lag + 2}s`} rotate="auto">
                <mpath href={`#${idPrefix}-loop`} />
              </animateMotion>
            </circle>
          ) : (
            i === 0 && <circle cx="470" cy="296" r="7" className="a047-ring__head" />
          )}
        </g>
      ))}
      {motion ? (
        <circle r="34" fill={`url(#${idPrefix}-glow)`} className="a047-ring__glow">
          <animateMotion dur="7s" repeatCount="indefinite" begin="-2s">
            <mpath href={`#${idPrefix}-loop`} />
          </animateMotion>
        </circle>
      ) : (
        <circle cx="470" cy="296" r="34" fill={`url(#${idPrefix}-glow)`} className="a047-ring__glow" />
      )}
    </svg>
  );
};

/** タクシーメーター: 走行距離は増え続けるのに、出発地からの距離は 0 のまま */
const Meter: React.FC = () => {
  const { ref, state, className } = useRevealOnce<HTMLDivElement>(0.6);
  const FINAL = 48.6;
  const [km, setKm] = useState(FINAL);
  useEffect(() => {
    if (state === "armed") setKm(0);
    if (state !== "visible") return;
    let raf = 0;
    const t0 = performance.now();
    const DUR = 3200;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / DUR);
      setKm(FINAL * (1 - Math.pow(1 - p, 2)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);
  return (
    <div ref={ref} className={`a047-meter${className}`} aria-hidden="true">
      <div className="a047-meter__lamp">賃走</div>
      <dl className="a047-meter__rows">
        <div>
          <dt>走行距離</dt>
          <dd>
            <span className="a047-meter__num">{km.toFixed(1)}</span> km
          </dd>
        </div>
        <div className="is-still">
          <dt>出発地から</dt>
          <dd>
            <span className="a047-meter__num">0.0</span> km
          </dd>
        </div>
      </dl>
    </div>
  );
};

/** 追い越される: 自分の灯(橙)の横を、ほかの灯(白)が次々と追い越していく */
const Overtaken: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  const others = [
    { lane: 0, delay: 0.2 },
    { lane: 2, delay: 0.7 },
    { lane: 0, delay: 1.3 },
    { lane: 2, delay: 1.8 },
    { lane: 0, delay: 2.4 },
  ];
  return (
    <div ref={ref} className={`a047-pass${className}`} aria-hidden="true">
      <div className="a047-pass__road">
        <span className="a047-pass__line a047-pass__line--1" />
        <span className="a047-pass__line a047-pass__line--2" />
        {others.map((o, i) => (
          <span
            key={i}
            className={`a047-pass__car a047-pass__car--lane${o.lane}`}
            style={{ animationDelay: `${o.delay}s`, ["--i" as string]: i } as React.CSSProperties}
          />
        ))}
        <span className="a047-pass__me" />
      </div>
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
          <div className="a047-cover__art">
            <RingRoad idPrefix="a047-cover" city />
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

            {/* 結び: 表紙と同じ輪を小さく。灯は回り続ける */}
            <div className="a047-end">
              <RingRoad idPrefix="a047-end" />
            </div>
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
