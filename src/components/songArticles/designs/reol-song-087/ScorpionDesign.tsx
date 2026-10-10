/**
 * 楽曲記事「SCORPION」(reol-song-087)の記事別デザイン。設計の根拠は plan/34。
 *
 * - 紙面を「文字のポスター」として組む(MV は歌詞を大きな文字で次々に見せる映像。手法だけ借り、組むのは記事自身の言葉)。
 *   色はサイトのテーマ色(深い赤 #85313B・紺黒 #0F1923)と生成り。VALORANT の赤・ロゴ・キャラクターは使わない。
 * - 表紙: 紺黒にマス目。題名の曲名を輪郭だけの大きな文字で、「――」以下を極太で重ねる。
 * - 本文版2(2026-10-11): 冒頭は大きめに、引用の二行は本文の引用として赤の縦線で(歌詞なので装飾文字にはしない)、
 *   積み重ねたことへの信頼を語る段落の下、横中央に、大きなはさみ2つと尾だけの記号のサソリ(胴・腕はなし。尾は節が積み重なって
 *   前へ巻き、針が前を向く。2026-10-11 ユーザー指定)。
 *   中盤の3段落は、紺黒のカード・赤の短い線で段落ごとに抑揚をつける。
 * - 長い段落を色の面(紺黒・赤)に丸ごと入れると重く、まとまりなく見えるため(2026-10-11 ユーザー指摘)、段落は地の文のまま、
 *   特徴的な一文だけを抜き出して色の面に大きく置く: 「プレイヤー」の段落の一文は紺黒のカードに、結びの一文は深い赤の締めの帯に。
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
const LEDE = 1; // 冒頭(強気な言葉には理由がある。大きめに)
const INTRO = 2; // 二行の紹介(リリースの注記)
const QUOTE = 3; // 引用の二行(本文の引用として。装飾文字にはしない)
const PAST = 4; // 積み重ねたことへの信頼(下に記号のサソリ)
const PLAYER = 5; // 「プレイヤー」の意味(紺黒のカード)
const CREATE = 6; // 感情を創造へ(赤の短い線から)
const FINALE = 7; // 結び(赤の帯。聴いて気持ちが高まる)

/**
 * サソリの記号(オリジナル): 胴も腕もなく、大きな尾と、大きな手とはさみ2つだけ。尾とはさみは離して置く(2026-10-11 ユーザー「デフォルメしすぎ。
 * はさみと尾をもっと大きく。胴体部分は無くして大丈夫」「尾とハサミははなして」「腕の部分はいらない。尾と手とはさみだけのこして」)。
 * .articles-local/research/scorpion/emblem2.py で生成。尾 = 積み重ねた節(これまでやってきたこと)の先に針(今の武器)。
 */
/** 尾の節 [中心x, 中心y, 向き(度), 長さ, 太さ]。根元から針へ */
const TAIL: [number, number, number, number, number][] = [
  [99.7, 175.9, -139.1, 45, 34],
  [75.2, 141.1, -111.1, 43, 32],
  [69.5, 100.9, -84.7, 41, 30],
  [82.1, 64.4, -56.8, 39, 28],
  [108.9, 39.3, -30.2, 37, 26],
  [141.5, 27.2, -11.3, 35, 24],
];

/** はさみの手(ふくらんだ手と、先で合わさる2本の指) */
const Hand: React.FC<{ x: number; y: number; rot: number }> = ({ x, y, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(1.45)`}>
    <ellipse cx={0} cy={0} rx={24} ry={16} />
    <path d="M10 -12 C 28 -24 46 -20 52 -6 C 40 -10 28 -8 14 -2 Z" />
    <path d="M12 12 C 30 18 46 12 52 -2 C 42 6 28 6 14 6 Z" />
  </g>
);

/**
 * 記号のサソリ。装飾なので読み上げ対象外。
 * 画面に入った時に一度だけ、はさみ → 尾の節(根元から順に) → 針 の順に現れる(--i が順番)。
 */
const Scorpion: React.FC = () => {
  const order = (i: number) => ({ "--i": i }) as React.CSSProperties;
  return (
    <svg className="a087-scorpion" viewBox="30 -6 380 272" aria-hidden="true">
      <g className="a087-sc__part" style={order(0)}>
        {/* はさみは尾から離して置き、腕は描かない(2026-10-11 ユーザー「尾とハサミははなして」「腕の部分はいらない。尾と手とはさみだけ」) */}
        <g className="a087-sc__fill">
          <Hand x={266} y={128} rot={-22} />
          <Hand x={270} y={222} rot={16} />
        </g>
      </g>
      {TAIL.map(([x, y, a, l, w], i) => (
        <rect
          key={i}
          className="a087-sc__seg a087-sc__part"
          style={order(i + 1)}
          x={-l / 2}
          y={-w / 2}
          width={l}
          height={w}
          rx={w * 0.36}
          transform={`translate(${x} ${y}) rotate(${a})`}
        />
      ))}
      <g className="a087-sc__fill a087-sc__part" style={order(TAIL.length + 1)} transform="translate(170.4 24.4) rotate(-0.2) scale(1.3)">
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
  /**
   * 段落から一文を抜き出す(抜き出し引用。文言は変えない)。テキストだけの段落で、その番号の文がある時だけ。
   * 段落の内容は designManifest.ts の段落ハッシュで固定されているので、改稿されたら共通テンプレートに戻る
   */
  const sentenceOf = (i: number, k: number): string | null => {
    const b = blocks[i];
    if (!b || b.t !== "p" || !b.children.every((n) => n.t === "text")) return null;
    const text = b.children.map((n) => (n.t === "text" ? n.v : "")).join("");
    const sentences = text.split("。").filter((x) => x !== "").map((x) => `${x}。`);
    return sentences[k] ?? null;
  };
  // 「プレイヤー」の段落の2文目と、結びの3文目(どちらも書き手の言葉。歌詞は抜き出さない)
  const playerPull = sentenceOf(PLAYER, 1);
  const finalePull = sentenceOf(FINALE, 2);
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
          {/* 冒頭: 大きめに */}
          <div className="a087-row a087-row--lede">
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
              {/* 積み重ねたことへの信頼を語る段落の下に、記号のサソリ(尾 = 積み重ねた節の先に針)。2026-10-11 ユーザー指定 */}
              <div ref={tail.ref} className={`a087-tail-wrap${tail.className}`}>
                <Scorpion />
              </div>
              {/* 「プレイヤー」の段落: 段落は地の文のまま、特徴的な一文だけを紺黒のカードに抜き出す(PCは右の列、スマートフォンは段落の後)。
                  抜き出しは本文の繰り返しなので読み上げ対象外 */}
              <div className="a087-player">
                {body(PLAYER, PLAYER + 1)}
                {playerPull && (
                  <p className="a087-pull" aria-hidden="true">
                    <Phrased text={playerPull} />
                  </p>
                )}
              </div>
              <div className="a087-create">{body(CREATE, FINALE)}</div>
            </div>
          </section>

          {/* 結び: 地の色のまま少し大きく */}
          <div className="a087-row">{body(FINALE, blocks.length, "a087-finale")}</div>
        </div>

        {/* 締めの帯: 深い赤に、結びから抜き出した一文を大きく。後ろに輪郭だけの曲名の反復(本文の繰り返しと装飾なので読み上げ対象外) */}
        <div className="a087-band" aria-hidden="true">
          <div className="a087-band__echo">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>SCORPION SCORPION SCORPION</span>
            ))}
          </div>
          {finalePull && (
            <p className="a087-band__quote">
              <Phrased text={finalePull} />
            </p>
          )}
        </div>

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
