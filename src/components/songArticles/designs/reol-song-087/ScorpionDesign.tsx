/**
 * 楽曲記事「SCORPION」(reol-song-087)の記事別デザイン。設計の根拠は plan/34。
 *
 * - 紙面を「文字のポスター」として組む(MV は歌詞を大きな文字で次々に見せる映像。手法だけ借り、組むのは記事自身の言葉)。
 *   色はサイトのテーマ色(深い赤 #85313B・紺黒 #0F1923)と生成り。VALORANT の赤・ロゴ・キャラクターは使わない。
 * - 表紙: 紺黒にマス目。題名の曲名を輪郭だけの大きな文字で、「――」以下を極太で重ねる。
 * - 本文版2(2026-10-11): 冒頭は大きめに、引用の二行は本文の引用として赤の縦線で(歌詞なので装飾文字にはしない)、
 *   冒頭の段落(自信の根拠はこれまでやってきたこと)の右に「サソリ」(全身。尾は節が積み重なって背中の上で前へ巻き、針が前を向く。
 *   2026-10-11 ユーザー指定で、尾だけから全身に)。
 *   中盤の3段落は、紺黒のカード・赤の短い線で段落ごとに抑揚をつける。
 * - 結び(聴いて気持ちが高まる)は深い赤の帯に。後ろに輪郭だけの曲名を反復させる(装飾。読み上げ対象外)。
 *   画面に入った時に一度だけ、節が根元から順に積み上がる。JSなし・動きを減らす設定では完成状態のまま。
 * - 注記と奥付は、サイトの確認済みデータだけ(リリース、タイアップ、作詞・作曲、演奏記録)。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import Phrased from "../../Phrased";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./scorpion.css";

// 段落の位置(designManifest.ts の anchors と対応。本文版2)
const LEDE = 1; // 冒頭(強気な言葉には理由がある。大きめに。右にサソリ)
const INTRO = 2; // 二行の紹介(リリースの注記)
const QUOTE = 3; // 引用の二行(本文の引用として。装飾文字にはしない)
const PAST = 4; // 積み重ねたことへの信頼
const PLAYER = 5; // 「プレイヤー」の意味(紺黒のカード)
const CREATE = 6; // 感情を創造へ(赤の短い線から)
const FINALE = 7; // 結び(赤の帯。聴いて気持ちが高まる)

/**
 * サソリの全身(オリジナルの線画)を斜め上から見た姿(2026-10-11 ユーザー「断面図よりは斜めから見たような見た目の方がいい」)。
 * .articles-local/research/scorpion/scorpion3q.py で生成。胴は斜めに伸び、節の境目は前へふくらむ弧(立体感)。
 * 脚は手前4本・奥4本、はさみは手前(大)・奥(小)。奥側は淡くして奥行きを出す。
 */
const SC = {
  body: "M142.8 161.8 L145.5 161.6 L148.1 161.4 L150.7 161.3 L153.4 161.2 L156.0 161.1 L158.6 161.1 L161.2 161.1 L163.8 161.1 L166.4 161.2 L168.9 161.3 L171.5 161.4 L174.1 161.6 L176.6 161.8 L179.2 162.0 L181.7 162.3 L184.3 162.6 L186.8 162.9 L189.3 163.3 L191.9 163.7 L194.4 164.1 L196.9 164.6 L199.4 165.1 L201.9 165.7 L204.3 166.3 L206.8 166.9 L209.3 167.6 L211.7 168.3 L214.2 169.0 L216.6 169.8 L219.1 170.6 L221.5 171.4 L223.9 172.3 L226.4 173.2 L228.8 174.1 L231.2 175.1 L233.6 176.1 L236.0 177.1 L238.4 178.2 L240.7 179.3 L243.1 180.4 L245.5 181.6 L247.8 182.8 L250.2 184.0 L252.5 185.3 L256.1 180.7 L258.4 181.8 L260.8 183.0 L263.2 184.2 L265.5 185.3 L267.9 186.5 L270.3 187.7 L272.6 188.8 L275.0 190.0 L277.4 191.2 L279.7 192.4 L282.1 193.5 L284.5 194.7 L286.8 195.9 L289.2 197.0 L291.6 198.2 Q 304.2 212.9 287.5 218.6 L287.5 218.6 L284.8 219.2 L282.1 219.7 L279.3 220.3 L276.6 220.9 L273.9 221.5 L271.2 222.1 L268.5 222.6 L265.8 223.2 L263.0 223.8 L260.3 224.4 L257.6 225.0 L254.9 225.5 L252.2 226.1 L249.5 226.7 L246.7 227.3 L245.9 218.4 L243.2 219.2 L240.4 219.9 L237.7 220.6 L235.0 221.2 L232.3 221.7 L229.6 222.1 L226.9 222.6 L224.2 222.9 L221.6 223.2 L218.9 223.5 L216.3 223.7 L213.6 223.8 L211.0 223.9 L208.4 224.0 L205.8 224.0 L203.2 223.9 L200.6 223.8 L198.1 223.6 L195.5 223.3 L193.0 223.0 L190.5 222.7 L187.9 222.3 L185.4 221.8 L182.9 221.3 L180.5 220.7 L178.0 220.0 L175.5 219.3 L173.1 218.6 L170.6 217.8 L168.2 216.9 L165.8 216.0 L163.4 215.0 L161.0 213.9 L158.6 212.8 L156.3 211.7 L153.9 210.5 L151.6 209.2 L149.2 207.9 L146.9 206.6 L144.6 205.1 L142.3 203.7 L140.0 202.2 L137.7 200.6 L135.4 198.9 Z",
  seams: ["M161.7 161.1 Q 164.3 187.1 152.0 209.5", "M180.2 162.1 Q 182.1 191.5 169.2 217.2", "M198.4 164.9 Q 200.1 195.4 186.9 222.1", "M216.2 169.6 Q 218.2 198.6 205.3 223.9", "M233.6 176.1 Q 236.3 201.3 224.2 222.9", "M254.6 180.0 Q 257.3 205.6 245.1 227.6"],
  legsNear: ["M218.5 220.5 L 202.2 237.6 L 187.8 265.6", "M234.4 218.8 L 226.4 237.6 L 221.6 265.6", "M248.9 224.1 L 249.1 244.5 L 253.9 272.5", "M265.1 221.3 L 273.5 243.4 L 288.0 271.4"],
  legsFar: ["M227.4 175.6 L 220.7 155.9 L 208.3 171.9", "M241.9 181.5 L 242.0 163.2 L 237.8 179.2", "M257.1 183.1 L 264.1 166.1 L 268.2 182.1", "M271.4 189.7 L 285.2 174.1 L 297.6 190.1"],
  armNear: "M284.6 217.2 L 312.6 227.2 L 338.6 223.2",
  armFar: "M289.0 195.6 L 309.0 179.6 L 329.0 169.6",
};
/** 尾の節 [中心x, 中心y, 向き(度), 長さ, 太さ]。根元(胴の後ろ)から針へ */
const TAIL: [number, number, number, number, number][] = [
  [131.6, 158.3, -122.3, 42, 30],
  [117.9, 122.1, -99.0, 40, 28],
  [119.3, 85.4, -76.5, 38, 26],
  [133.6, 53.7, -54.7, 36, 24],
  [157.1, 30.8, -33.9, 34, 22],
  [185.1, 17.7, -16.4, 32, 20],
];

/** はさみの手(楕円の手と、先で合わさる2本の指) */
const Hand: React.FC<{ at: [number, number, number, number] }> = ({ at: [x, y, rot, scale] }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
    <ellipse cx={0} cy={0} rx={22} ry={15} />
    <path d="M10 -12 C 28 -22 44 -18 48 -6 C 38 -10 26 -8 14 -2 Z" />
    <path d="M12 12 C 30 16 44 10 48 -2 C 40 6 26 6 14 6 Z" />
  </g>
);

/**
 * サソリの全身。尾 = 積み重ねた節(これまでやってきたこと)の先に針(今の武器)。装飾なので読み上げ対象外。
 * 画面に入った時に一度だけ、脚・胴 → はさみ → 尾の節(根元から順に) → 針 の順に現れる(--i が順番)。
 */
const Scorpion: React.FC = () => {
  const order = (i: number) => ({ "--i": i }) as React.CSSProperties;
  return (
    <svg className="a087-scorpion" viewBox="90 -6 332 290" aria-hidden="true">
      {/* 奥側(淡く) */}
      <g className="a087-sc__far a087-sc__part" style={order(0)}>
        {SC.legsFar.map((d, i) => (
          <path key={i} className="a087-sc__leg" d={d} />
        ))}
        <path className="a087-sc__arm a087-sc__arm--far" d={SC.armFar} />
        <g className="a087-sc__fill">
          <Hand at={[341.1, 169.6, -26, 0.76]} />
        </g>
      </g>
      {/* 手前の脚と胴 */}
      <g className="a087-sc__part" style={order(0)}>
        {SC.legsNear.map((d, i) => (
          <path key={i} className="a087-sc__leg a087-sc__leg--near" d={d} />
        ))}
        <path className="a087-sc__fill" d={SC.body} />
        {SC.seams.map((d, i) => (
          <path key={i} className="a087-sc__seam" d={d} />
        ))}
      </g>
      {/* 手前のはさみ */}
      <g className="a087-sc__part" style={order(1)}>
        <path className="a087-sc__arm" d={SC.armNear} />
        <g className="a087-sc__fill">
          <Hand at={[354.6, 223.2, -6, 1.0]} />
        </g>
      </g>
      {/* 尾(根元から順に)と針 */}
      {TAIL.map(([x, y, a, l, w], i) => (
        <rect
          key={i}
          className="a087-sc__seg a087-sc__part"
          style={order(i + 2)}
          x={-l / 2}
          y={-w / 2}
          width={l}
          height={w}
          rx={w * 0.36}
          transform={`translate(${x} ${y}) rotate(${a})`}
        />
      ))}
      <g className="a087-sc__fill a087-sc__part" style={order(TAIL.length + 2)} transform="translate(211.7 13.1) rotate(-3.8)">
        <ellipse cx={2} cy={0} rx={17} ry={12} />
        <path d="M-4 2 C 22 3 34 20 30 40 C 26 30 18 24 -4 13 Z" />
      </g>
    </svg>
  );
};

/** 画面に入った時に一度だけ動きを付ける。JSなし・動きを減らす設定・最初から画面内なら完成状態のまま */
const useRevealOnce = <T extends HTMLElement>(threshold: number) => {
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

const Note: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <aside className="a087-note">
    <p className="a087-note__label">{label}</p>
    <div className="a087-note__body">{children}</div>
  </aside>
);

const ScorpionDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt, preview } = ctx;
  const tail = useRevealOnce<HTMLDivElement>(0.4);

  // H1 の文言はそのまま。「――」の前の曲名を輪郭だけの大きな文字で、後ろを極太で組む(文字は変えない)
  const dash = title.indexOf("――");
  const titleSong = dash > 0 ? title.slice(0, dash) : title;
  const titleRest = dash > 0 ? title.slice(dash) : "";
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  // 冒頭がテキストだけの段落なら、句の切れ目でだけ折り返す(文言は変えない)
  const lede = blocks[LEDE];
  const ledeText =
    lede?.t === "p" && lede.children.every((n) => n.t === "text")
      ? lede.children.map((n) => (n.t === "text" ? n.v : "")).join("")
      : null;
  const body = (from: number, to: number, className = "a087-row__text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );

  return (
    <main className="a087" lang="ja">
      <article>
        {/* 表紙: 紺黒にマス目。曲名を輪郭だけの大きな文字で、副題を極太で */}
        <header className="a087-cover">
          <div className="a087-cover__top">
            <nav aria-label="パンくず" className="a087-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>SCORPION</span>
            </nav>
            {preview && (
              <p className="a087-preview" role="status">
                プレビュー(未公開)
              </p>
            )}
          </div>
          <div className="a087-cover__body">
            <h1 className="a087-title">
              <span className="a087-title__song">{titleSong}</span>
              {titleRest && (
                <span className="a087-title__head">
                  <Phrased text={titleRest} />
                </span>
              )}
            </h1>
            <p className="a087-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
            <div className="a087-cover__media">{body(0, LEDE, "")}</div>
          </div>
        </header>

        <div className="a087-ground">
          {/* 冒頭: 大きめに。右にサソリ(尾 = 積み重ねた節の先に針。自信の根拠は、これまでやってきたこと) */}
          <div className="a087-row a087-row--lede">
            <div ref={tail.ref} className={`a087-tail-wrap${tail.className}`}>
              <Scorpion />
            </div>
            {ledeText ? (
              <div className="a087-lede">
                <p>
                  <Phrased text={ledeText} />
                </p>
              </div>
            ) : (
              body(LEDE, LEDE + 1, "a087-lede")
            )}
          </div>

          <section className="a087-row">
            {body(INTRO, INTRO + 1)}
            {(firstRelease || songFacts.tieup) && (
              <Note label="リリース">
                {firstRelease && (
                  <p>
                    <span className="a087-note__strong">{dotDate(firstRelease.releaseDate)}</span>
                    <br />
                    {formatLabel(firstRelease.format)}『{firstRelease.title}』
                  </p>
                )}
                {songFacts.tieup && <p className="a087-note__tieup">{songFacts.tieup}</p>}
              </Note>
            )}
          </section>

          {/* 引用の二行: 本文の引用として、赤の縦線で示す */}
          <div className="a087-row">{body(QUOTE, QUOTE + 1, "a087-quote")}</div>

          {/* 積み重ね → プレイヤー → 感情を創造へ。同じ組み方の段落が続かないよう、段落ごとに抑揚をつける */}
          <section className="a087-row a087-row--past">
            <div className="a087-past">
              {body(PAST, PAST + 1)}
              {/* 「プレイヤー」の段落は紺黒のカードに(四隅にかぎ形の印) */}
              <div className="a087-player">{body(PLAYER, PLAYER + 1, "a087-row__text a087-player__text")}</div>
              <div className="a087-create">{body(CREATE, FINALE)}</div>
            </div>
          </section>
        </div>

        {/* 結び: 深い赤の帯。後ろに輪郭だけの曲名を反復させる(気分が上がる) */}
        <section className="a087-band">
          <div className="a087-band__echo" aria-hidden="true">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i}>SCORPION SCORPION SCORPION</span>
            ))}
          </div>
          {body(FINALE, blocks.length, "a087-finale")}
        </section>

        {/* 奥付(紺黒)。サイトの確認済みデータだけ */}
        <footer className="a087-colophon">
          <dl className="a087-colophon__list">
            <div>
              <dt>曲</dt>
              <dd>SCORPION</dd>
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
                  <span className="a087-colophon__src">!Legit のセットリスト記録より</span>
                </dd>
              </div>
            )}
          </dl>
          <ul className="a087-next">
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
      </article>
    </main>
  );
};

export default ScorpionDesign;
