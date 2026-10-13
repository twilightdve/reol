/**
 * 楽曲記事「真空オールドローズ」(reol-song-057)の記事別デザイン。設計の根拠は plan/39。
 *
 * - 紙面全体を古い紙の地(クリーム色)に、ワイン色の文字。アクセントはくすんだ薔薇色(オールドローズ)とアルバムの深い赤。
 * - 表紙: ガラスの覆い(ベルジャー)に閉じ込められた一輪の薔薇(線画)。足もとから一筋の煙(イントロの ZIPPO と煙草)。
 * - 題名・見出し・本文は明朝体。段落が短いので、行間を広くとって一文ずつ置く。
 * - 「関係ない」の節の後: 断ち切ったはずの一本の線(真ん中で切れているが、細い糸が残ってつながっている)。
 * - 街の情景の節(観覧車の段落の後): 太陽の軌道の図(季節でずれる東西の弧、西に沈む太陽と夕焼け、地平線の下の午前二時、衛星都市と観覧車)。地図と同じく東を右に。
 * - 時が殺してくの節の後: 一枚ずつ薄れていく花びら。
 * - 甘すぎた匂いの節(「蓋をして」の段落の後): ガラスの覆いが薔薇にかぶさる(画面に入ると上から降りて閉じる)。
 * - 冒頭のリンクの行は本文のまま(小さな札の列)。『事実上』XFD は公式の埋め込み(クリックで読み込む)も表紙の下に置く。
 * - 歌詞は本文の外に出さない(図にも歌詞の言葉は書かない)。XFD の画面・装飾のアーチは使わない。
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
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./vacuumoldrose.css";

// 段落の位置(designManifest.ts の anchors と対応)
// 0 リンクの行 / 1〜2 冒頭 / 3 見出し「関係ない」 4〜7 / 8 見出し 街の情景 9〜21 / 22 見出し 時が殺してく 23〜30 /
// 31 見出し 甘すぎた匂い 32〜49(45 真空にして蓋をして、46〜49 結び)
const LINKS = 0;
const INTRO = 1;
const S1 = 3;
const S2 = 8;
const WHEEL = 19; // 観覧車の見立て(18)の後に太陽の軌道の図
const S3 = 22;
const S4 = 31;
const SEAL = 46; // 「真空にして、蓋をして」(45)の後にガラスの覆い

const SONG = "真空オールドローズ";

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

/** 一輪の薔薇(線画)。花の中心が原点、茎は下へ。オールドローズの、杯のような丸い花形 */
const Rose: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} className="a057-rose">
    {/* 茎・葉・棘 */}
    <path d="M0,36 C-4,70 6,104 2,150" className="a057-rose__stem" />
    <path d="M1,92 C18,78 36,80 44,88 C34,100 16,102 1,92 Z" className="a057-rose__leaf" />
    <path d="M1,92 C16,90 28,88 40,88" className="a057-rose__vein" />
    <path d="M-2,62 L-11,56 L-3,68 Z M4,120 L13,114 L5,127 Z M0,80 L-8,78 L-1,86 Z" className="a057-rose__thorn" />
    {/* 外側の花びら(杯の形) */}
    <path d="M-42,-2 C-46,-30 -22,-46 0,-44 C22,-46 46,-30 42,-2 C38,24 18,38 0,38 C-18,38 -38,24 -42,-2 Z" className="a057-rose__cup" />
    {/* 重なる花びらの縁 */}
    <path d="M-36,8 C-26,22 -12,28 0,28 C12,28 26,22 36,8" className="a057-rose__line" />
    <path d="M-40,-10 C-30,-2 -16,2 -4,2" className="a057-rose__line" />
    <path d="M40,-10 C30,-2 16,2 4,2" className="a057-rose__line" />
    {/* 中心の巻き */}
    <path
      d="M2,-8 C9,-9 11,2 4,7 C-6,13 -15,2 -11,-9 C-6,-21 12,-22 19,-10 C26,4 16,20 -2,21 C-20,22 -31,8 -28,-10 C-25,-27 -8,-34 8,-32"
      className="a057-rose__line a057-rose__heart"
    />
  </g>
);

/** ガラスの覆い(ベルジャー)。中心 cx、台の上面 y、幅 w、高さ h。台座も描く */
const BellJar: React.FC<{ cx: number; y: number; w: number; h: number; className?: string; withBase?: boolean }> = ({
  cx,
  y,
  w,
  h,
  className = "",
  withBase = true,
}) => {
  const l = cx - w / 2;
  const r = cx + w / 2;
  const top = y - h;
  return (
    <g className={className}>
      {withBase && (
        <g className="a057-jar__base">
          <ellipse cx={cx} cy={y + 4} rx={w / 2 + 22} ry={12} />
          <path d={`M${l - 22},${y + 4} L${l - 22},${y + 16} C${l - 22},${y + 30} ${r + 22},${y + 30} ${r + 22},${y + 16} L${r + 22},${y + 4}`} />
        </g>
      )}
      <g className="a057-jar__glass">
        <path d={`M${l},${y} L${l},${top + w / 2} C${l},${top - w * 0.08} ${r},${top - w * 0.08} ${r},${top + w / 2} L${r},${y}`} />
        <ellipse cx={cx} cy={y} rx={w / 2} ry={7} className="a057-jar__rim" />
        <circle cx={cx} cy={top - w * 0.02 - 8} r={8} className="a057-jar__knob" />
        <path d={`M${l + 12},${y - 14} L${l + 12},${top + w / 2} C${l + 12},${top + w * 0.16} ${cx - w * 0.12},${top + w * 0.06} ${cx - w * 0.06},${top + w * 0.04}`} className="a057-jar__shine" />
      </g>
    </g>
  );
};

/** 表紙の絵: 台の上のガラスの覆いと薔薇、足もとから立ちのぼる一筋の煙。装飾なので読み上げ対象外 */
const CoverArt: React.FC = () => (
  <svg className="a057-cover__art" viewBox="0 0 420 520" aria-hidden="true">
    <path
      d="M58,520 C40,470 86,440 66,396 C48,356 92,330 74,286 C58,248 96,224 84,180 C76,150 92,128 88,104"
      className="a057-smoke"
    />
    <path d="M70,520 C58,478 98,452 80,410 C64,374 102,350 90,312" className="a057-smoke a057-smoke--thin" />
    <BellJar cx={250} y={430} w={220} h={330} />
    <Rose x={250} y={240} s={1.15} />
    {/* 覆いの中を漂う花びら一枚 */}
    <path d="M196,372 C204,362 218,362 220,372 C214,380 202,382 196,372 Z" className="a057-petal" />
  </svg>
);

/** 断ち切ったはずの一本の線(「関係ない」の節の後)。真ん中で切れているが、細い糸が残ってつながっている */
const CutLine: React.FC = () => (
  <div className="a057-cut" aria-hidden="true">
    <svg viewBox="0 0 640 70">
      <line x1="20" y1="35" x2="270" y2="35" className="a057-cut__line" />
      <line x1="370" y1="35" x2="620" y2="35" className="a057-cut__line" />
      <path d="M270,35 C300,18 340,52 370,35" className="a057-cut__thread" />
      <path d="M270,35 C302,54 338,16 370,35" className="a057-cut__thread" />
      <path d="M270,35 C306,38 334,30 370,35" className="a057-cut__thread a057-cut__thread--faint" />
    </svg>
  </div>
);

/** 太陽の軌道の図(街の情景の節)。東西の弧が季節で少しずつずれ、西に沈む太陽、地平線の下に夜半の太陽、衛星都市と観覧車 */
const SunChart: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.4);
  const H = 190;
  // 東(右)から西(左)へ。地図と同じく東を右にする(2026-10-13 ユーザー「通常は東が右のはず」)。季節で高さと出入りの位置が変わる
  const arcs: [number, number, number][] = [
    [72, 568, 150],
    [92, 548, 112],
    [116, 524, 76],
  ];
  // 衛星都市と観覧車は図の中ほど(西に沈む太陽と重ならない位置)
  const houses: [number, number, number][] = [
    [250, 14, 18],
    [270, 22, 12],
    [284, 10, 20],
    [306, 18, 14],
    [322, 12, 16],
    [392, 26, 10],
    [404, 16, 18],
    [424, 20, 14],
  ];
  const wheel = { cx: 360, cy: H - 42, r: 36 };
  return (
    <div ref={ref} className={`a057-sun${className}`} aria-hidden="true">
      <svg viewBox="0 0 640 300">
        <defs>
          {/* 西(左)に沈む太陽から空へ広がる夕焼け。地平線に沿って横に長く、太陽の近くは琥珀色、遠くで薔薇色から紙の地へ */}
          <radialGradient
            id="a057-dusk"
            gradientUnits="userSpaceOnUse"
            cx={92}
            cy={H}
            r={660}
            gradientTransform={`translate(92 ${H}) scale(1 0.3) translate(-92 ${-H})`}
          >
            {/* 衛星都市と観覧車(図の中ほど)まで薔薇色がかかるよう広げる(2026-10-13 ユーザー指定) */}
            {/* 夕陽の色はオールドローズ色(#C08081、灰みのくすんだ薔薇色)に寄せる。太陽のすぐ近くだけ温かみを残す
                (2026-10-13 ユーザー「夕陽の色をオールドローズ色に近づけてみて」。それまでは橙色) */}
            <stop offset="0" stopColor="#d9907e" stopOpacity="0.9" />
            <stop offset="0.3" stopColor="#c8877f" stopOpacity="0.72" />
            <stop offset="0.5" stopColor="#c08081" stopOpacity="0.5" />
            <stop offset="0.72" stopColor="#cfa1a3" stopOpacity="0.28" />
            <stop offset="1" stopColor="#f4ece4" stopOpacity="0" />
          </radialGradient>
          <clipPath id="a057-above">
            <rect x="0" y="0" width="640" height={H} />
          </clipPath>
          {/* 図の左端(枠の端)でにじみが切れて見えないよう、左端だけ薄れさせる */}
          <linearGradient id="a057-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.12" stopColor="#fff" stopOpacity="1" />
          </linearGradient>
          <mask id="a057-edge-mask" maskContentUnits="objectBoundingBox">
            <rect x="0" y="0" width="1" height="1" fill="url(#a057-edge)" />
          </mask>
          <radialGradient id="a057-halo" gradientUnits="userSpaceOnUse" cx={92} cy={H} r={54}>
            <stop offset="0" stopColor="#e8b39c" stopOpacity="0.85" />
            <stop offset="1" stopColor="#e8b39c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="640" height={H} fill="url(#a057-dusk)" mask="url(#a057-edge-mask)" className="a057-sun__dusk" />
        <circle cx={92} cy={H} r={54} fill="url(#a057-halo)" clipPath="url(#a057-above)" className="a057-sun__dusk" />
        {arcs.map(([x0, x1, h], i) => (
          <path
            key={i}
            d={`M${x0},${H} C${x0 + 20},${H - h * 1.3} ${x1 - 20},${H - h * 1.3} ${x1},${H}`}
            className={`a057-sun__arc${i === 1 ? " a057-sun__arc--main" : ""}`}
            style={{ transitionDelay: `${i * 0.2}s` }}
            pathLength={1}
          />
        ))}
        {/* 地平線の下: 夜半の太陽の道(点線)と、見えない太陽 */}
        <path d={`M548,${H} C528,${H + 92} 112,${H + 92} 92,${H}`} className="a057-sun__night" />
        <circle cx={320} cy={H + 69} r={9} className="a057-sun__hidden" />
        {/* 衛星都市の家並みと観覧車 */}
        <g className="a057-sun__city">
          {houses.map(([x, h, w], i) => (
            <rect key={i} x={x} y={H - h} width={w} height={h} />
          ))}
          <line x1={wheel.cx - 14} y1={H} x2={wheel.cx} y2={wheel.cy} />
          <line x1={wheel.cx + 14} y1={H} x2={wheel.cx} y2={wheel.cy} />
          <circle cx={wheel.cx} cy={wheel.cy} r={wheel.r} className="a057-sun__wheel" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const x = wheel.cx + wheel.r * Math.cos(a);
            const y = wheel.cy + wheel.r * Math.sin(a);
            return (
              <g key={i}>
                <line x1={wheel.cx} y1={wheel.cy} x2={x} y2={y} className="a057-sun__spoke" />
                <circle cx={x} cy={y} r={2.6} className="a057-sun__cabin" />
              </g>
            );
          })}
        </g>
        <line x1="20" y1={H} x2="620" y2={H} className="a057-sun__horizon" />
        {/* 西(左)に沈む太陽(半分が地平線の下) */}
        <circle cx={92} cy={H} r={16} className="a057-sun__set" clipPath="url(#a057-above)" />
        <text x="72" y={H + 26} className="a057-sun__label" textAnchor="middle">西</text>
        <text x="568" y={H + 26} className="a057-sun__label" textAnchor="middle">東</text>
      </svg>
    </div>
  );
};

/** 一枚ずつ薄れていく花びら(時が殺してくの節の後) */
const FadingPetals: React.FC = () => (
  <div className="a057-petals" aria-hidden="true">
    <svg viewBox="0 0 420 60">
      {Array.from({ length: 7 }, (_, i) => {
        const x = 30 + i * 60;
        return (
          <path
            key={i}
            d={`M${x - 14},34 C${x - 10},18 ${x + 10},14 ${x + 16},26 C${x + 12},40 ${x - 4},44 ${x - 14},34 Z`}
            className="a057-petal"
            style={{ opacity: Math.max(0.06, 1 - i * 0.16), transform: `rotate(${i * 9 - 20}deg)`, transformOrigin: `${x}px 30px` }}
          />
        );
      })}
    </svg>
  </div>
);

/** ガラスの覆いが薔薇にかぶさる(甘すぎた匂いの節)。画面に入ると覆いが上から降りて閉じる */
const SealedRose: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.5);
  return (
    <div ref={ref} className={`a057-seal${className}`} aria-hidden="true">
      <svg viewBox="0 0 300 330">
        <g className="a057-jar__base">
          <ellipse cx={150} cy={284} rx={102} ry={12} />
          <path d="M48,284 L48,296 C48,310 252,310 252,296 L252,284" />
        </g>
        <Rose x={150} y={118} s={0.92} />
        <g className="a057-seal__jar">
          <BellJar cx={150} y={280} w={160} h={250} withBase={false} />
        </g>
      </svg>
    </div>
  );
};

const VacuumOldRoseDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  const body = (from: number, to: number, className = "a057-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「Reol「真空オールドローズ」――記憶を手放すまで」: 曲名だけ大きく組む(文言は変えない)
  // 括弧は曲名に添え、「Reol」/「真空オールドローズ」/「――記憶を手放すまで」の3段にする。曲名は「真空」と「オールドローズ」の間でだけ折り返す
  const at = title.indexOf(SONG);
  const pre = at > 0 ? title.slice(0, at) : "";
  const post = at >= 0 ? title.slice(at + SONG.length) : "";
  const openQ = pre.endsWith("「") ? "「" : "";
  const closeQ = post.startsWith("」") ? "」" : "";
  const tName = pre.slice(0, pre.length - openQ.length);
  const tSub = post.slice(closeQ.length);
  // 冒頭のリンクの行の YouTube(『事実上』XFD)を、公式の埋め込みにもする
  const linkBlock = blocks[LINKS];
  const xfdLink =
    linkBlock?.t === "p"
      ? linkBlock.children.find((n) => n.t === "link" && youtubeVideoId(n.href))
      : undefined;
  const xfd = xfdLink && xfdLink.t === "link" ? { id: youtubeVideoId(xfdLink.href) as string, href: xfdLink.href, text: inlineText(xfdLink.children) } : null;

  return (
    <main className="a057" lang="ja">
      <article>
        {/* 表紙: ガラスの覆いに閉じ込められた一輪の薔薇と、足もとから立ちのぼる煙 */}
        <header className="a057-cover" data-og-cover>
          <div className="a057-cover__top">
            <nav aria-label="パンくず" className="a057-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>真空オールドローズ</span>
            </nav>
          </div>
          <div className="a057-cover__body">
            <div className="a057-cover__text">
              <h1 className="a057-title">
                {at >= 0 ? (
                  <>
                    {tName && <span className="a057-title__pre">{tName}</span>}
                    <span className="a057-title__song">
                      <span className="a057-title__word">
                        {openQ && <span className="a057-title__q">{openQ}</span>}
                        真空
                      </span>
                      <wbr />
                      <span className="a057-title__word">
                        オールドローズ
                        {closeQ && <span className="a057-title__q">{closeQ}</span>}
                      </span>
                    </span>
                    {tSub && <span className="a057-title__post">{tSub}</span>}
                  </>
                ) : (
                  <span className="a057-title__song">{title}</span>
                )}
              </h1>
              <p className="a057-date">
                <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
              </p>
            </div>
            <CoverArt />
          </div>
        </header>

        <div className="a057-ground">
          <div className="a057-column">
            {/* 冒頭のリンクの行(本文のまま、札の列に) */}
            {body(LINKS, INTRO, "a057-text a057-links")}
            {xfd && (
              <figure className="a057-video">
                <figcaption className="a057-video__label">『事実上』XFD</figcaption>
                <OfficialMedia videoId={xfd.id} href={xfd.href} text={xfd.text} articleId={id} unstyled preferHighRes />
              </figure>
            )}

            {/* 冒頭。前にリリースの注記 */}
            <div className="a057-group">
              {firstRelease && (
                <aside className="a057-note">
                  <p className="a057-note__label">リリース</p>
                  <p>
                    <span className="a057-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『
                    {firstRelease.title}』
                  </p>
                </aside>
              )}
              {body(INTRO, S1, "a057-text a057-intro")}
            </div>

            {/* 「関係ない」。その後に、断ち切ったはずの一本の線 */}
            <section className="a057-section">{body(S1, S2)}</section>
            <CutLine />

            {/* 街の情景。観覧車の段落の後に、太陽の軌道の図 */}
            <section className="a057-section">
              {body(S2, WHEEL)}
              <SunChart />
              {body(WHEEL, S3)}
            </section>

            {/* 時が殺してく。その後に、薄れていく花びら */}
            <section className="a057-section">{body(S3, S4)}</section>
            <FadingPetals />

            {/* 甘すぎた匂い。「蓋をして」の段落の後に、ガラスの覆いが薔薇にかぶさる */}
            <section className="a057-section a057-section--last">
              {body(S4, SEAL)}
              <SealedRose />
              {body(SEAL, blocks.length, "a057-text a057-closing")}
            </section>
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a057-colophon">
            <dl className="a057-colophon__list">
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
                    <span className="a057-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a057-next">
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

export default VacuumOldRoseDesign;
