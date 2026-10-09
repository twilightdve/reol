/**
 * 楽曲記事「SCORPION」(reol-song-087)の記事別デザイン。設計の根拠は plan/34。
 *
 * - 紙面を「文字のポスター」として組む(MV は歌詞を大きな文字で次々に見せる映像。手法だけ借り、組むのは記事自身の言葉)。
 *   色はサイトのテーマ色(深い赤 #85313B・紺黒 #0F1923)と生成り。VALORANT の赤・ロゴ・キャラクターは使わない。
 * - 表紙: 紺黒にマス目。題名の「過去を力に変える」を極太で、「SCORPION」を輪郭だけの大きな文字で重ねる。
 * - 一言は深い赤の帯に、生成りの極太で。後ろに輪郭だけの曲名を反復させる(装飾。読み上げ対象外)。
 * - 最後の段落(過去が力になる)の横に「サソリの尾」: 節が下から積み重なって上で前へ巻き、針が前を向く(積み重ねた過去が今の武器になる)。
 *   画面に入った時に一度だけ、節が根元から順に積み上がる。JSなし・動きを減らす設定では完成状態のまま。
 * - 注記と奥付は、サイトの確認済みデータだけ(リリース、タイアップ、作詞・作曲、演奏記録)。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import { dotDate, formatLabel, splitAfterComma } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./scorpion.css";

// 段落の位置(designManifest.ts の anchors と対応)
const LEDE = 1; // 一言(赤の帯)
const SOUND = 2; // 音とタイアップ(リリースの注記)
const PAST = 3; // 過去が力になる(サソリの尾)

/** サソリの尾の節 [中心x, 中心y, 向き(度), 長さ, 太さ]。根元(下)から先端へ。.articles-local/tmp/tail.py で生成 */
const SEGMENTS: [number, number, number, number, number][] = [
  [60.3, 385.2, -95.8, 64, 50],
  [56.3, 325.4, -91.8, 60, 47],
  [56.7, 269.4, -87.4, 56, 44],
  [61.2, 217.6, -82.3, 52, 41],
  [70.2, 170.0, -75.9, 49, 38],
  [84.5, 126.8, -66.4, 46, 35],
  [106.6, 90.7, -47.9, 43, 32],
  [140.6, 73.1, 0.5, 40, 29],
  [172.9, 88.1, 43.1, 37, 26],
];

/** サソリの尾(オリジナルの線画)。積み重ねた節(過去)の先に針(今の武器)。装飾なので読み上げ対象外 */
const ScorpionTail: React.FC = () => (
  <svg className="a087-tail" viewBox="0 0 240 420" aria-hidden="true">
    {SEGMENTS.map(([x, y, a, l, w], i) => (
      <rect
        key={i}
        className="a087-tail__seg"
        style={{ "--i": i } as React.CSSProperties}
        x={-l / 2}
        y={-w / 2}
        width={l}
        height={w}
        rx={w * 0.36}
        transform={`translate(${x} ${y}) rotate(${a})`}
      />
    ))}
    <g className="a087-tail__sting" style={{ "--i": SEGMENTS.length } as React.CSSProperties} transform="translate(192.7 112.6) rotate(57.5)">
      <ellipse cx={2} cy={0} rx={22} ry={16} />
      <path d="M-6 2 C 30 4 46 26 40 52 C 34 38 22 30 -6 16 Z" />
    </g>
  </svg>
);

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

  // H1 の文言はそのまま。「SCORPION」の前で2行に分け、曲名は輪郭だけの大きな文字で組む(文字は変えない)
  const at = title.lastIndexOf("SCORPION");
  const titleHead = at > 0 ? title.slice(0, at) : title;
  const titleSong = at > 0 ? title.slice(at) : "";
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  // 一言はテキストだけの段落なら、読点の直後で句に分け、句の途中で折り返さないように組む(文言は変えない。
  // Safari は word-break: auto-phrase に対応していないため)。テキスト以外を含む場合は共通の描画
  const lede = blocks[LEDE];
  const ledeText =
    lede?.t === "p" && lede.children.every((n) => n.t === "text")
      ? lede.children.map((n) => (n.t === "text" ? n.v : "")).join("")
      : null;

  return (
    <main className="a087" lang="ja">
      <article>
        {/* 表紙: 紺黒にマス目。題名を極太と輪郭で重ねる */}
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
              <span className="a087-title__head">{titleHead}</span>
              {titleSong && <span className="a087-title__song">{titleSong}</span>}
            </h1>
            <p className="a087-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
            <div className="a087-cover__media">
              <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={0} to={LEDE} unstyled />
            </div>
          </div>
        </header>

        {/* 一言: 深い赤の帯。後ろに輪郭だけの曲名を反復させる */}
        <section className="a087-band">
          <div className="a087-band__echo" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>SCORPION SCORPION SCORPION</span>
            ))}
          </div>
          {ledeText ? (
            <div className="a087-lede">
              <p>
                {splitAfterComma(ledeText).map((part, i) => (
                  <span key={i} className="a087-clause">
                    {part}
                  </span>
                ))}
              </p>
            </div>
          ) : (
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={LEDE} to={LEDE + 1} unstyled className="a087-lede" />
          )}
        </section>

        <div className="a087-ground">
          <section className="a087-row">
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={SOUND} to={SOUND + 1} unstyled className="a087-row__text" />
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

          {/* 過去が力になる: 横にサソリの尾(積み重ねた節の先に針) */}
          <section className="a087-row a087-row--past">
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={PAST} to={blocks.length} unstyled className="a087-row__text" />
            <div ref={tail.ref} className={`a087-tail-wrap${tail.className}`}>
              <ScorpionTail />
            </div>
          </section>
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
