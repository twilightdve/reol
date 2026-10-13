/**
 * 楽曲記事「平面鏡」(reol-song-045)の記事別デザイン。設計の根拠は plan/41。
 *
 * - 主役は「平面鏡」そのもの。表紙は濃い青の照明の闇に、一本の縦の鏡の線。題名「平面鏡」と、鏡の向こうの左右反転した像。
 * - 紙面は濃い紺の地に白い文字。リンクと図は淡い青(テーマ色)。
 * - 新しい始まりの節(段落15の後): ダーツの的。外側の輪がぼやけ、中心だけがくっきり残る(凝視すると周囲がぼやける)。
 * - 平面鏡が映す節(段落33の後): 三面鏡。角度の付いた三面鏡が開いて平らな3枚になり、左右が消えて正面の一面だけが残る(三面から一面へ)。
 * - 2018年のライヴ映像は段落5(このライヴ映像がたまらなく好きだ)の後、2025年の映像は「無題」の節の段落51の後。どちらもクリックで読み込む。
 * - 「無題」の節の見出しの下に細い市松模様の帯。
 * - 呪いとじごくの節(段落74の後): 三つの年の曲順。「平面鏡」の札だけ淡い青で、入口の位置が動いていく。
 * - 歌詞は本文の外に出さない。ライヴ映像の画面・人物は複製しない。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import OfficialMedia from "../../OfficialMedia";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { inlineText, youtubeVideoId } from "../../../../utils/songArticles/markdown";
import type { ArticleBlock } from "../../../../utils/songArticles/markdown";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./heimenkyou.css";

// 段落の位置(designManifest.ts の anchors と対応)
const LIVE_2018 = 0; // MADE IN FACTION のライヴ映像へのリンク
const LIVE_2025 = 1; // 横浜アリーナ『無題』のライヴ映像へのリンク
const SPOTIFY = 2;
const INTRO = 3;
const VIDEO_2018_AT = 6; // 段落5(このライヴ映像がたまらなく好きだ)の後
const S_CURSE = 12;
const DART_FIG = 16; // 段落15(ダーツの的を凝視すると周囲がぼやける)の後
const S_MIRROR = 26;
const TRIPTYCH_FIG = 34; // 段落33(三面から一面へ)の後
const S_CULT = 36;
const S_MUDAI = 47;
const VIDEO_2025_AT = 52; // 段落51(公演に「美辞学」という名前を与えた)の後
const S_JIGOKU = 68;
const ORDER_FIG = 75; // 段落74(同じ曲が何度も新しい物語の入口に置かれている)の後

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

/** ダーツの的: 外側の輪がぼやけて中心だけがくっきり残り(視界が狭まる)、その後で矢が中心に刺さる。ぼやけた輪とくっきりした輪を重ね、透明度を入れ替える(WebKit は SVG 要素の CSS filter が効かないため) */
const Dartboard: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  const outer = [96, 80, 64, 48];
  const rings = (cls: string) =>
    outer.map((r, i) => <circle key={r} cx="120" cy="120" r={r} className={`${cls} ${i % 2 === 0 ? "is-dark" : "is-light"}`} />);
  return (
    <div ref={ref} className={`a045-dart${className}`} aria-hidden="true">
      <svg viewBox="0 0 240 240">
        <defs>
          <filter id="a045-dart-blur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g className="a045-dart__sharp">{rings("a045-dart__ring")}</g>
        <g className="a045-dart__blur" filter="url(#a045-dart-blur)">
          {rings("a045-dart__ring")}
        </g>
        {/* 中心(凝視している所)は最後までくっきり */}
        <circle cx="120" cy="120" r="32" className="a045-dart__ring is-dark" />
        <circle cx="120" cy="120" r="16" className="a045-dart__ring is-light" />
        <circle cx="120" cy="120" r="5" className="a045-dart__bull" />
        {/* ダーツの矢: 視界が狭まった後、右上から飛んできて中心に刺さる。矢の向きの座標(先端が原点、尾が -x)で描いて、中心へ置く */}
        <g transform="translate(120 120) rotate(135) scale(0.62)">
          <g className="a045-dart__arrow">
            <path d="M0,0 L-16,-2.2 L-16,2.2 Z" className="a045-dart__tip" />
            <rect x="-46" y="-4.5" width="30" height="9" rx="3" className="a045-dart__barrel" />
            <rect x="-74" y="-1.6" width="28" height="3.2" className="a045-dart__shaft" />
            <path d="M-70,0 L-96,-17 L-100,-17 L-92,0 Z" className="a045-dart__flight" />
            <path d="M-70,0 L-96,17 L-100,17 L-92,0 Z" className="a045-dart__flight" />
          </g>
        </g>
      </svg>
    </div>
  );
};

/** 三面鏡: 左右の鏡が蝶番で角度を付けて手前に出た三面鏡が、開ききって平らな3枚になり、左右の2枚が消えて正面の一面だけが残る */
const Triptych: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a045-triptych${className}`} aria-hidden="true">
      <div className="a045-triptych__stage">
        <span className="a045-triptych__wing a045-triptych__wing--l" />
        <span className="a045-triptych__face" />
        <span className="a045-triptych__wing a045-triptych__wing--r" />
      </div>
    </div>
  );
};

/** 三つの年の曲順: 「平面鏡」の札だけ淡い青。前に置かれるか後ろに置かれるかで、入口の位置が動いていくのが見える */
const ORDER: { year: string; place: string; songs: [string, string] }[] = [
  { year: "2018", place: "MADE IN FACTION", songs: ["平面鏡", "カルト"] },
  { year: "2025", place: "横浜アリーナ『無題』", songs: ["平面鏡", "十中八九"] },
  { year: "2026", place: "『美辞学』", songs: ["うつくしじごく", "平面鏡"] }, // ツアーファイナルだけの曲順ではないので、ツアー名だけ(2026-10-13 ユーザー指摘)
];
const SetOrder: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.4);
  return (
    <div ref={ref} className={`a045-order${className}`} aria-hidden="true">
      {ORDER.map((row) => (
        <div key={row.year} className="a045-order__row">
          <p className="a045-order__when">
            <span className="a045-order__year">{row.year}</span>
            <span className="a045-order__place">{row.place}</span>
          </p>
          <p className="a045-order__songs">
            <span className={`a045-order__song${row.songs[0] === "平面鏡" ? " is-mirror" : ""}`}>{row.songs[0]}</span>
            <span className="a045-order__arrow">→</span>
            <span className={`a045-order__song${row.songs[1] === "平面鏡" ? " is-mirror" : ""}`}>{row.songs[1]}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

/** 段落のリンク(YouTube)から、埋め込み用の動画を取り出す */
const videoFrom = (block: ArticleBlock | undefined) => {
  if (!block || block.t !== "p") return null;
  for (const n of block.children) {
    const vid = n.t === "link" ? youtubeVideoId(n.href) : null;
    if (n.t === "link" && vid) return { id: vid, href: n.href, text: inlineText(n.children) };
  }
  return null;
};

const HeimenkyouDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  const body = (from: number, to: number, className = "a045-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「平面鏡　あまりにも美しい呪いの歌」: 曲名を鏡の線の両側に、副題を下に(文言は変えない)
  const SONG = "平面鏡";
  const tSub = title.startsWith(SONG) ? title.slice(SONG.length).trim() : "";
  const live2018 = videoFrom(blocks[LIVE_2018]);
  const live2025 = videoFrom(blocks[LIVE_2025]);

  return (
    <main className="a045" lang="ja">
      <article>
        {/* 表紙: 濃い青の闇に縦の鏡の線。題名と、その反転像 */}
        <header className="a045-cover" data-og-cover>
          <div className="a045-cover__light" aria-hidden="true" />
          <div className="a045-cover__top">
            <nav aria-label="パンくず" className="a045-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>平面鏡</span>
            </nav>
          </div>
          <div className="a045-cover__body">
            <h1 className="a045-title">
              {tSub ? (
                <>
                  <span className="a045-title__pair">
                    <span className="a045-title__song">{SONG}</span>
                    <span className="a045-title__glass" aria-hidden="true" />
                    <span className="a045-title__mirror" aria-hidden="true">
                      {SONG}
                    </span>
                  </span>
                  <span className="a045-title__sub">{tSub}</span>
                </>
              ) : (
                <span className="a045-title__song">{title}</span>
              )}
            </h1>
            <p className="a045-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a045-ground">
          <div className="a045-column">
            {/* 映像へのリンク(段落0・1)は、本文の流れの中で埋め込みにする。取り出せない時だけリンクのまま */}
            {(!live2018 || !live2025) && body(LIVE_2018, SPOTIFY)}
            {body(SPOTIFY, INTRO, "a045-text a045-listen")}

            {/* 冒頭。前にリリースの注記。段落5の後に2018年のライヴ映像 */}
            <div className="a045-section">
              {firstRelease && (
                <aside className="a045-note">
                  <p className="a045-note__label">リリース</p>
                  <p>
                    <span className="a045-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『
                    {firstRelease.title}』
                  </p>
                </aside>
              )}
              {body(INTRO, VIDEO_2018_AT, "a045-text a045-intro")}
              {live2018 && live2025 && (
                <figure className="a045-video">
                  <figcaption className="a045-video__label">
                    <span className="a045-video__year">2018</span> LIVE — MADE IN FACTION
                  </figcaption>
                  <OfficialMedia videoId={live2018.id} href={live2018.href} text={live2018.text} articleId={id} unstyled preferHighRes />
                </figure>
              )}
              {body(VIDEO_2018_AT, S_CURSE)}
            </div>

            {/* 新しい始まりに選んだ呪いの歌。段落15の後にダーツの的 */}
            <section className="a045-section">
              {body(S_CURSE, DART_FIG)}
              <Dartboard />
              {body(DART_FIG, S_MIRROR)}
            </section>

            {/* 平面鏡が映す、一つの姿。段落33の後に三面鏡 */}
            <section className="a045-section">
              {body(S_MIRROR, TRIPTYCH_FIG)}
              <Triptych />
              {body(TRIPTYCH_FIG, S_CULT)}
            </section>

            <section className="a045-section">{body(S_CULT, S_MUDAI)}</section>

            {/* 「無題」で変わった行き先。見出しの下に市松の帯、段落51の後に2025年のライヴ映像 */}
            <section className="a045-section a045-mudai">
              {body(S_MUDAI, S_MUDAI + 1)}
              <div className="a045-checker" aria-hidden="true" />
              {body(S_MUDAI + 1, VIDEO_2025_AT)}
              {live2018 && live2025 && (
                <figure className="a045-video">
                  <figcaption className="a045-video__label">
                    <span className="a045-video__year">2025</span> LIVE — 横浜アリーナ『無題』
                  </figcaption>
                  <OfficialMedia videoId={live2025.id} href={live2025.href} text={live2025.text} articleId={id} unstyled preferHighRes />
                </figure>
              )}
              {body(VIDEO_2025_AT, S_JIGOKU)}
            </section>

            {/* 呪いとじごくに向き合う物語。段落74の後に三つの年の曲順 */}
            <section className="a045-section a045-section--last">
              {body(S_JIGOKU, ORDER_FIG)}
              <SetOrder />
              {body(ORDER_FIG, blocks.length, "a045-text a045-closing")}
            </section>
            {/* 結び: 表紙と同じ縦の鏡の線を短く */}
            <div className="a045-endglass" aria-hidden="true" />
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a045-colophon">
            <dl className="a045-colophon__list">
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
                    <span className="a045-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a045-next">
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

export default HeimenkyouDesign;
