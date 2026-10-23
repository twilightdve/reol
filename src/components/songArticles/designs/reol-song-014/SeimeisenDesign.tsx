/**
 * 楽曲記事「生命線」(reol-song-014)の記事別デザイン。設計の根拠は plan/50。
 *
 * - 一本の線の記事。細かく区切られた断片(言葉と音)が、サビで一本の線に開ける(本文 段落1・5〜10)。
 * - 地は深い青、文字は白。色は『-nil-／極彩色』の16曲の輪で「生命線」に当てた深い青と淡い藤色だけ。
 * - 表紙: 題名を一文字ずつ縦に積み、すぐ右に手相の生命線を円弧に抽象化した線(右の手のひらの向き。左上から右下へ)。前半は短い断片が詰まって並び、後半は一本の線になって手首へ伸びる。題名はゴシックで太く。
 * - 本文の左に、記事を貫く一本の線。見出しはその線の上の節目。
 * - 段落10の後: 四角い断片(助詞の少ない、漢字の多い短い言葉)が詰まって並び、サビで一本の線になる。
 * - 段落25の後: 表紙と同じ生命線に、細かな傷の刻みと淡い色が同じ場所に重なる(文字は置かない)。
 * - 段落29(歌詞ではない文)を大きく。
 * - 歌詞は本文の外に出さない。ジャケット・映像は複製しない。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent, trackOfficialLinkClick } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./seimeisen.css";

// 本文の段落位置(blocks の添字)
const INTRO = 0;
const S_CHOP = 4; // 見出し「細かく刻まれる言葉と、サビの開放感」
const CHOP_FIG = 11; // 段落10の後: 断片から一本の線へ
const S_SIDES = 12; // 見出し「嫌いなところも、好きなところも」
const S_LINE = 23; // 見出し「感性へのプライドが、生命線になる」
const LINE_FIG = 26; // 段落25の後: 傷と色が同じ線に重なる
const PULL = 29; // 要の一文(歌詞ではない文)

// 本文に聴くリンクが無いため、デザイン側で置く(サイトの曲データの Spotify トラック。plan/50)
const SPOTIFY_TRACK = "4YDnmsQW2lnZL4Cju7EPMT";
// 歌詞の出典(本文では毎回リンクせず、奥付に一度だけ。ユーザー、2026-10-23)
const UTANET = { url: "https://www.uta-net.com/song/190971/", text: "歌ネット「生命線」" };

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

/**
 * 手相の生命線(右の手のひらを見た向き。左から右へ読めるように): 親指と人差し指の間(左上)から、
 * 親指の付け根を囲むように斜め右下へ弧を描き、手首(下)へ向かう。表紙と段落25の後の図で同じ形を使う
 */
// 手相そのままだと生々しいので、曲率の一定な円弧に抽象化する(中心 (100, 430)、半径 330、-70°〜60°)
const LIFE_LINE = "M213 120 A330 330 0 0 1 265 716";
// 表紙で内側に添える細い円弧(同じ中心、半径 290)
const ECHO_LINE = "M199 157 A290 290 0 0 1 245 681";
// 表紙: 線の前半は不揃いな断片(細かく区切られた言葉と音)、後半は一本の線(サビで開ける)。値は線の長さを1とした割合
const SPLIT = 0.46;
const COVER_BITS = (() => {
  const rnd = seeded(14);
  const bits: { from: number; len: number }[] = [];
  let t = 0;
  while (t < SPLIT - 0.02) {
    const len = Math.min(0.012 + rnd() * 0.03, SPLIT - t);
    bits.push({ from: t, len });
    t += len + 0.008 + rnd() * 0.012;
  }
  return bits;
})();

/** 表紙: 題名の右に置く生命線の円弧。前半は断片が刻むように並び、後半は一本の線になる */
const CoverArt: React.FC = () => (
  <svg className="a014-cover__art" viewBox="180 100 270 640" aria-hidden="true">
    <g className="a014-cover__bits">
      {COVER_BITS.map((b, i) => (
        <path key={i} d={LIFE_LINE} pathLength={1} strokeDasharray={`0 ${b.from} ${b.len} 2`} style={{ animationDelay: `${0.2 + i * 0.05}s` }} />
      ))}
    </g>
    <path className="a014-cover__echo" d={ECHO_LINE} />
    <path className="a014-cover__open" d={LIFE_LINE} pathLength={1} strokeDasharray={`0 ${SPLIT} ${1 - SPLIT} 2`} />
    <circle cx="265" cy="716" r="16" className="a014-cover__node" />
  </svg>
);

/** 段落10の後: 四角い断片(漢字の多い短い言葉)が詰まって並び、サビで一本の線になる */
const CHOP_ROWS = (() => {
  const rnd = seeded(5);
  return [0, 1, 2].map(() => {
    const cells: number[] = [];
    let x = 0;
    while (x < 300) {
      const n = 1 + Math.floor(rnd() * 3); // 2〜3文字ほどの塊
      for (let k = 0; k < n && x < 300; k++) {
        cells.push(x);
        x += 15;
      }
      x += 4 + Math.round(rnd() * 5);
    }
    return cells;
  });
})();
const Chop: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.5);
  return (
    <figure ref={ref} className={`a014-chop${className}`} aria-label="細かく区切られた言葉と音が、サビで大きく広がる">
      <svg viewBox="0 0 600 150" aria-hidden="true">
        {CHOP_ROWS.map((row, r) =>
          row.map((x, i) => <rect key={`${r}-${i}`} x={20 + x} y={30 + r * 36} width="12" height="12" className="a014-chop__cell" style={{ animationDelay: `${(r * row.length + i) * 12}ms` }} />)
        )}
        <line x1="340" y1="18" x2="340" y2="132" className="a014-chop__seam" />
        <path d="M352 72 C 420 72, 450 70, 500 52 S 560 22, 590 20" className="a014-chop__line" pathLength={1} />
        <path d="M352 72 C 420 72, 450 74, 500 92 S 560 122, 590 124" className="a014-chop__line is-2" pathLength={1} />
      </svg>
      <div className="a014-chop__labels" aria-hidden="true">
        <span>細かく区切られた言葉と音</span>
        <span>サビで大きく広がる音</span>
      </div>
    </figure>
  );
};

/** 段落25の後: 手のひらの線のような一本の曲線。細かな刻みと淡い色が、同じ線の同じ場所に重なる */
const PALM = LIFE_LINE;
const NICKS = [0.08, 0.15, 0.21, 0.3, 0.37, 0.45, 0.52, 0.6, 0.66, 0.74, 0.81, 0.9];
const Palm: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.45);
  const pathRef = useRef<SVGPathElement>(null);
  const [nicks, setNicks] = useState<{ x: number; y: number; a: number }[]>([]);
  // 刻みは線に直交させる(線の向きは描画後でないと分からないので、マウント後に置く)
  useEffect(() => {
    const p = pathRef.current;
    if (!p || typeof p.getTotalLength !== "function") return;
    const L = p.getTotalLength();
    setNicks(
      NICKS.map((t) => {
        const a = p.getPointAtLength(L * t);
        const b = p.getPointAtLength(Math.min(L, L * t + 1));
        return { x: a.x, y: a.y, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90 };
      })
    );
  }, []);
  return (
    <figure ref={ref} className={`a014-palm${className}`} aria-label="傷も、大切に思う気持ちも、同じ一本の線の上にある">
      <svg viewBox="150 90 330 660" aria-hidden="true">
        <path d={PALM} className="a014-palm__glow" />
        <path ref={pathRef} d={PALM} className="a014-palm__line" pathLength={1} />
        {nicks.map((n, i) => (
          <line key={i} x1={n.x} y1={n.y - 11} x2={n.x} y2={n.y + 11} transform={`rotate(${n.a - 90} ${n.x} ${n.y}) rotate(${i % 2 ? 18 : -14} ${n.x} ${n.y})`} className="a014-palm__nick" style={{ animationDelay: `${0.9 + i * 0.06}s` }} />
        ))}
      </svg>
    </figure>
  );
};

const SeimeisenDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const body = (from: number, to: number, className = "a014-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「生命線　自分を支える、この感性」: 曲名と副題を分ける(文言は変えない)
  const [tMain, ...tRest] = title.split("　");
  const tSub = tRest.join("　").trim();
  // 曲ページは同じ曲名で武道館のライヴ盤のページもあり得るので、曲名ごとに一つだけ出す
  const pages = songPages.filter((p, i) => songPages.findIndex((q) => q.songName === p.songName) === i);
  const credit = songFacts.lyricMember && songFacts.lyricMember === songFacts.musicMember ? `作詞・作曲 ${songFacts.lyricMember}` : [songFacts.lyricMember && `作詞 ${songFacts.lyricMember}`, songFacts.musicMember && `作曲 ${songFacts.musicMember}`].filter(Boolean).join(" / ");

  return (
    <main className="a014" lang="ja">
      <article>
        <header className="a014-cover" data-og-cover>
          <div className="a014-cover__top">
            <nav aria-label="パンくず" className="a014-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>{ctx.songTitle}</span>
            </nav>
          </div>
          <div className="a014-cover__body">
            <h1 className="a014-title">
              {/* 題名は一文字ずつ縦に積み、生命線の円弧をそのすぐ右に置く(ユーザー、2026-10-23)。
                  writing-mode の縦書きは WebKit で幅が0になる不具合があるため使わない */}
              <span className="a014-title__row">
                <span className="a014-title__song">
                  {[...tMain].map((c, i) => (
                    <span key={i} className="a014-title__char">
                      {c}
                    </span>
                  ))}
                </span>
                <CoverArt />
              </span>
              {tSub && <span className="a014-title__sub">{tSub}</span>}
            </h1>
            <p className="a014-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a014-ground">
          <div className="a014-column">
            <p className="a014-listen">
              <a href={`https://open.spotify.com/track/${SPOTIFY_TRACK}`} target="_blank" rel="noopener noreferrer" onClick={() => trackOfficialLinkClick("spotify")}>
                Spotifyで「生命線」を聴く
              </a>
            </p>

            <div className="a014-section a014-section--0">
              {firstRelease && (
                <aside className="a014-note">
                  <p className="a014-note__label">リリース</p>
                  <p>
                    <span className="a014-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『{firstRelease.title}』3曲目
                  </p>
                </aside>
              )}
              {body(INTRO, S_CHOP)}
            </div>

            <section className="a014-section">
              {body(S_CHOP, CHOP_FIG)}
              <Chop />
              {body(CHOP_FIG, S_SIDES)}
            </section>

            <section className="a014-section">{body(S_SIDES, S_LINE)}</section>

            <section className="a014-section a014-section--last">
              {body(S_LINE, LINE_FIG)}
              <Palm />
              {body(LINE_FIG, PULL)}
              {body(PULL, PULL + 1, "a014-text a014-pull")}
              {body(PULL + 1, blocks.length)}
              <div className="a014-endmark" aria-hidden="true" />
            </section>
          </div>

          <footer className="a014-colophon">
            <dl className="a014-colophon__list">
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
            <ul className="a014-next">
              {pages.map((p) => (
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

export default SeimeisenDesign;
