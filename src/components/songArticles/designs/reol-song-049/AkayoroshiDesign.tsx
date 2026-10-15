/**
 * 楽曲記事「あ可よろし」(reol-song-049)の記事別デザイン。設計の根拠は plan/45。
 *
 * - 『虚構集』のほかの四記事(灰・濃い青・夜・闇)のあとに差し込む光として、この記事だけ明るい紙面(生成りの紙に墨、朱と金)。
 * - 表紙: 左上の夜の紺から右へ明けていく空に、光の筋が差し込む。右に赤短の短冊(題名を縦に)。
 * - 段落5の後: 『虚構集』の五曲の並び(文字だけの曲順。四曲は各記事へのリンク、五曲目だけ朱)。
 * - 段落9(収録作)の後: 『虚構集』XFD をあ可よろしの場面(2:24)から。
 * - 段落11の後: 花札「梅に赤短」の札(梅の枝と花・斜めの朱の短冊を自前で描く)。横に「明らかに宜しい」説(諸説あり)の注。
 * - 段落28の後: 彼岸花の赤を抜けて光へ。赤い彼岸花が並ぶ暗い地平から、空がゆっくり明けていく。
 * - 後半: 要の一文(段落41・75)を大きな明朝の朱で、段落63の後に 2018 → 2025 の線(かすれた細い線が力強い朱の線へ)、最後に梅の花をひとつ。
 * - 歌詞は本文の外に出さない。XFD・映像の画面は複製しない。花札も特定の絵を写さず自前で描く。
 * - 縦書きは WebKit で幅が 0 になる不具合があるため、短冊の文字は SVG で一文字ずつ縦に並べる。
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
import "./akayoroshi.css";

// 段落の位置(designManifest.ts の anchors と対応)
const SPOTIFY = 0;
const INTRO = 1;
const TRACKS_FIG = 6; // 段落5(暗中模索の四曲を経て、最後に光が差し込む)の後
const S_HOPE = 8;
const XFD_AT = 10; // 段落9(収録作)の後
const TANZAKU_FIG = 12; // 段落11(「明らかに宜しい」説)の後
const S_FICTION = 19;
const HIGAN_FIG = 29; // 段落28(彼岸花の赤が彩る世界を抜けて、光が差し込む)の後
const S_DIRECTION = 32;
const S_SORROW = 48;
const S_SAVED = 68;
// 後半の区切り(2026-10-16 ユーザー「後半ほとんど文章だけ」)
const PULL_FRONT = 41; // 自分が向いているその先を、前だと言い切っていい。
const YEARS_FIG = 64; // 段落63(7年の時を経て、力強く響かせようとしている)の後に、2018→2025の線
const PULL_KINDNESS = 75; // 満身創痍の中で、…搾り出した優しさなのだ。

// MV の無い曲なので、アルバム『虚構集』の公式 XFD(サイト登録済み)をあ可よろしの場面から再生する。2:24 はユーザー指定(2026-10-13)
const XFD = { id: "18AQGiLKVs4", start: 144, text: "『虚構集』XFD の「あ可よろし」(2:24〜)を観る" };

// 『虚構集』の曲順。ほかの四曲は、このサイトの記事へ
const TRACKS: { no: number; name: string; slug: string | null }[] = [
  { no: 1, name: "エンド", slug: "endo" },
  { no: 2, name: "平面鏡", slug: "heimenkyou" },
  { no: 3, name: "ミッシング", slug: "misshingu" },
  { no: 4, name: "カルト", slug: "karuto" },
  { no: 5, name: "あ可よろし", slug: null },
];

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

/** 赤短の短冊(朱の地に、題名を一文字ずつ縦に) */
const Tanzaku: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`a049-tanzaku ${className}`} viewBox="0 0 80 300" aria-hidden="true">
    <rect x="2" y="2" width="76" height="296" rx="3" className="a049-tanzaku__paper" />
    <rect x="8" y="8" width="64" height="284" rx="2" className="a049-tanzaku__edge" />
    {["あ", "可", "よ", "ろ", "し"].map((ch, i) => (
      <text key={ch} x="40" y={66 + i * 50} textAnchor="middle" className="a049-tanzaku__char">
        {ch}
      </text>
    ))}
  </svg>
);

/**
 * 五曲の並び: 曲順の文字だけの一覧(2026-10-16 ユーザー「アニメーションもイマイチ」で、札・光・動きをやめた)。
 * 四曲は各記事へのリンク、五曲目(この曲)だけ朱
 */
const Tracks: React.FC = () => {
  return (
    <nav aria-label="『虚構集』の曲順" className="a049-tracks">
      <p className="a049-tracks__title">『虚構集』</p>
      <ol>
        {TRACKS.map((t) => (
          <li key={t.no} className={t.slug ? "is-dark" : "is-light"}>
            <span className="a049-tracks__no">{t.no}</span>
            {t.slug ? (
              <Link to={`/articles/${t.slug}/`} onClick={() => trackEvent("article_related_click", { category: "navigation", label: `reol-song-049->${t.slug}` })}>
                {t.name}
              </Link>
            ) : (
              <span className="a049-tracks__here">{t.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

/** 梅の花(五弁)。中心に白いしべ */
const Plum: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: 5 }, (_, i) => {
      const a = (i * 72 - 90) * (Math.PI / 180);
      return <circle key={i} cx={Math.cos(a) * r * 0.62} cy={Math.sin(a) * r * 0.62} r={r * 0.52} className="a049-ume__petal" />;
    })}
    <circle r={r * 0.32} className="a049-ume__heart" />
  </g>
);

/**
 * 梅に赤短の札(2026-10-16 ユーザー「あ可よろしの札は梅の方で」)。
 * 特定の花札の絵を写さず、梅の枝と花・斜めに掛かった朱の短冊を自前で描いて、札の形にまとめる
 */
const UmeCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={`a049-ume ${className}`} viewBox="0 0 200 320" aria-hidden="true">
    <rect x="2" y="2" width="196" height="316" rx="12" className="a049-ume__frame" />
    <rect x="12" y="12" width="176" height="296" rx="6" className="a049-ume__field" />
    {/* 梅の枝 */}
    <path d="M24,300 C60,250 70,210 96,180 C120,152 150,140 176,96" className="a049-ume__branch" />
    <path d="M96,180 C88,150 92,120 112,96" className="a049-ume__branch is-thin" />
    <path d="M140,148 C160,150 172,160 182,176" className="a049-ume__branch is-thin" />
    <Plum x={112} y={92} r={16} />
    <Plum x={176} y={92} r={14} />
    <Plum x={70} y={226} r={15} />
    <Plum x={150} y={140} r={12} />
    <Plum x={182} y={178} r={11} />
    <Plum x={40} y={278} r={12} />
    {/* 斜めに掛かった朱の短冊 */}
    <g transform="rotate(-24 100 150)">
      <rect x="74" y="40" width="52" height="196" rx="3" className="a049-ume__ribbon" />
      <rect x="79" y="45" width="42" height="186" rx="2" className="a049-ume__ribbonEdge" />
      {["あ", "可", "よ", "ろ", "し"].map((ch, i) => (
        <text key={ch} x="100" y={82 + i * 35} textAnchor="middle" className="a049-ume__char">
          {ch}
        </text>
      ))}
    </g>
  </svg>
);

/** 赤短(梅)と、語源の説の注 */
const RedRibbon: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className={`a049-ribbon${className}`}>
      <UmeCard className="a049-ribbon__card" />
      <p className="a049-ribbon__note">
        <span className="a049-ribbon__label">花札「梅に赤短」</span>
        「明らかに宜しい」が転じたとする説も(語源は諸説)
      </p>
    </div>
  );
};

/**
 * 2018 → 2025: かすれた細い線(悲壮感を求めた2018年の音)が、7年をかけて力強い朱の線(2025年の新しいアレンジ)へ変わっていく。
 * 年表の文字は本文の事実だけ
 */
const Years: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a049-years${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 120">
        <defs>
          <linearGradient id="a049-years-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8f8578" stopOpacity="0.6" />
            <stop offset="1" stopColor="#c23a2b" stopOpacity="1" />
          </linearGradient>
        </defs>
        {/* 細い(かすれた)ところから太い(力強い)ところへ */}
        <path d="M40,64 L560,58 L560,70 L40,66 Z" fill="url(#a049-years-line)" className="a049-years__line" />
        <circle cx="40" cy="65" r="5" className="a049-years__dot is-past" />
        <circle cx="560" cy="64" r="9" className="a049-years__dot is-now" />
        <text x="40" y="40" className="a049-years__year">2018</text>
        <text x="40" y="96" className="a049-years__what">『虚構集』</text>
        <text x="560" y="40" textAnchor="end" className="a049-years__year is-now">2025</text>
        <text x="560" y="96" textAnchor="end" className="a049-years__what">横浜アリーナ『無題』</text>
        <text x="300" y="40" textAnchor="middle" className="a049-years__span">7年</text>
      </svg>
    </div>
  );
};

/** 彼岸花の赤を抜けて光へ: 暗い空が、彼岸花の並ぶ地平からゆっくり明けていく */
const HIGAN = [40, 105, 160, 230, 300, 360, 430, 495, 560].map((x, i) => ({ x, h: 46 + ((i * 37) % 30), s: 0.8 + ((i * 13) % 5) / 10 }));
const SpiderLily: React.FC<{ x: number; h: number; s: number }> = ({ x, h, s }) => {
  const top = 200 - h;
  const petals = Array.from({ length: 6 }, (_, k) => {
    const a = (-150 + k * 24) * (Math.PI / 180);
    const ex = Math.cos(a) * 26 * s;
    const ey = Math.sin(a) * 20 * s;
    return `M${x},${top} q${(ex * 0.5).toFixed(1)},${(ey - 10 * s).toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
  });
  return (
    <g className="a049-higan__flower">
      <line x1={x} y1="200" x2={x} y2={top} className="a049-higan__stem" />
      <path d={petals.join(" ")} className="a049-higan__petal" />
      <circle cx={x} cy={top} r={4 * s} className="a049-higan__heart" />
    </g>
  );
};
const Higanbana: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className={`a049-higan${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 220">
        <defs>
          <linearGradient id="a049-higan-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d1b2b" />
            <stop offset="1" stopColor="#3a1f22" />
          </linearGradient>
          {/* 地平から明けていく光(夜明け) */}
          <radialGradient id="a049-higan-dawn" cx="0.5" cy="1" r="0.9" fx="0.5" fy="1">
            <stop offset="0" stopColor="#ffe9bf" stopOpacity="1" />
            <stop offset="0.35" stopColor="#f6c48a" stopOpacity="0.75" />
            <stop offset="1" stopColor="#f6c48a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="600" height="220" fill="url(#a049-higan-sky)" />
        <rect x="0" y="0" width="600" height="200" fill="url(#a049-higan-dawn)" className="a049-higan__dawn" />
        <rect x="0" y="196" width="600" height="24" className="a049-higan__ground" />
        {HIGAN.map((f) => (
          <SpiderLily key={f.x} {...f} />
        ))}
      </svg>
    </div>
  );
};

const AkayoroshiDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  const body = (from: number, to: number, className = "a049-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 節の要になる短い一文を、大きく見せる(本文の文言のまま)
  const pull = (i: number) => body(i, i + 1, "a049-text a049-pull");
  // 題名「あ可よろし　苦しくても、前だと言い切るために」: 曲名を大きく、副題を下に(文言は変えない)
  const SONG = "あ可よろし";
  const tSub = title.startsWith(SONG) ? title.slice(SONG.length).trim() : "";

  return (
    <main className="a049" lang="ja">
      <article>
        {/* 表紙: 夜の紺から明けていく空に差し込む光と、赤短の短冊 */}
        <header className="a049-cover" data-og-cover>
          <div className="a049-cover__rays" aria-hidden="true" />
          <div className="a049-cover__card">
            <Tanzaku />
          </div>
          <div className="a049-cover__top">
            <nav aria-label="パンくず" className="a049-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>あ可よろし</span>
            </nav>
          </div>
          <div className="a049-cover__body">
            <h1 className="a049-title">
              {tSub ? (
                <>
                  <span className="a049-title__song">{SONG}</span>
                  <span className="a049-title__sub">{tSub}</span>
                </>
              ) : (
                <span className="a049-title__song">{title}</span>
              )}
            </h1>
            <p className="a049-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a049-ground">
          <div className="a049-column">
            {body(SPOTIFY, INTRO, "a049-text a049-listen")}

            {/* 冒頭。前にリリースの注記。段落5の後に五曲の並び */}
            <div className="a049-section">
              {firstRelease && (
                <aside className="a049-note">
                  <p className="a049-note__label">リリース</p>
                  <p>
                    <span className="a049-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『
                    {firstRelease.title}』
                  </p>
                </aside>
              )}
              {body(INTRO, TRACKS_FIG, "a049-text a049-intro")}
              <Tracks />
              {body(TRACKS_FIG, S_HOPE)}
            </div>

            {/* 最後に残したかった希望。収録作の段落の後に XFD、段落11の後に赤短 */}
            <section className="a049-section">
              {body(S_HOPE, XFD_AT)}
              <figure className="a049-video">
                <figcaption className="a049-video__label">『虚構集』XFD</figcaption>
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
              {body(XFD_AT, TANZAKU_FIG)}
              <RedRibbon />
              {body(TANZAKU_FIG, S_FICTION)}
            </section>

            {/* いつか、虚構になるように。段落28の後に、彼岸花の赤を抜けて光へ */}
            <section className="a049-section">
              {body(S_FICTION, HIGAN_FIG)}
              <Higanbana />
              {body(HIGAN_FIG, S_DIRECTION)}
            </section>

            {/* 自分が向いている方角こそ。要の一文を大きく */}
            <section className="a049-section">
              {body(S_DIRECTION, PULL_FRONT)}
              {pull(PULL_FRONT)}
              {body(PULL_FRONT + 1, S_SORROW)}
            </section>

            {/* 悲壮感の中にある希望。段落63の後に 2018 → 2025 の線 */}
            <section className="a049-section">
              {body(S_SORROW, YEARS_FIG)}
              <Years />
              {body(YEARS_FIG, S_SAVED)}
            </section>

            {/* 何年経っても、救われる歌。要の一文を大きく、最後に梅の花をひとつ */}
            <section className="a049-section a049-section--last">
              {body(S_SAVED, PULL_KINDNESS)}
              {pull(PULL_KINDNESS)}
              {body(PULL_KINDNESS + 1, blocks.length, "a049-text a049-closing")}
              <div className="a049-endmark" aria-hidden="true">
                <svg viewBox="-20 -20 40 40">
                  <Plum x={0} y={0} r={16} />
                </svg>
              </div>
            </section>
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a049-colophon">
            <dl className="a049-colophon__list">
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
                    <span className="a049-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a049-next">
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

export default AkayoroshiDesign;
