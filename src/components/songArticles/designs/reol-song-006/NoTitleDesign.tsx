/**
 * 楽曲記事「No title」(reol-song-006)の記事別デザイン。設計の根拠は plan/31。
 *
 * - 紙面を「見上げる空」として扱う(Boy の「見下ろす床」と対)。
 * - 冒頭は縦書きの表紙: 群青から赤紫へ移る空に、縦書きの題名。MVは表紙の外(すぐ下)に16:9のまま置く。
 * - 縦書きは右から左へ読むので、軸を左右反転する。見出し(縦書き)と注記を右、本文をその左に置く。
 *   PCでは見出しを、その章を読んでいる間右端に留める(本の柱のように)。
 * - 見出し1の章(故郷の公演)の入口にウォータークラウン(MVで印象的な要素。オリジナルの線画)。琥珀色の一滴が群青の水面に落ち、
 *   そこから群青のグラデーションが広がる(水のイメージ。落ちる一滴だけ琥珀)。見出し2の章では、見出しから群青と琥珀の光と波紋が広がり、結びまで重なっていく。
 * - 締めは縦書きの奥付。サイトの確認済みデータ(作詞・作曲・初出の収録作)だけ。
 * - 注記は、段落に関係するサイトの確認済みデータ: 収録作、公演の日付と会場、その日のセットリストの終盤。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 * 琥珀の光は見出しの周りから差す(2026-10-09 ユーザー決定。章全体を染める案は採らなかった)。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleBody from "../../ArticleBody";
import {
  dotDate,
  formatArticleDate,
  formatLabel,
} from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { ArticleBlock } from "../../../../utils/songArticles/markdown";
import { inlineText } from "../../../../utils/songArticles/markdown";
import type { SongArticleDesign, SongArticlePageContext } from "../types";
import "./notitle.css";

// 段落の位置(designManifest.ts の anchors と対応)
const LEDE = 1; // 一言
const ORIGIN = 2; // 2014年の曲(収録作の注記)
const H_HOME = 3; // 見出し1「故郷で迎えた最終公演」
const SHOW = 4; // 公演(日付・会場の注記)
const SETLIST = 5; // この日のMCと曲(セットリストの注記)
const H_TWO = 7; // 見出し2「凱旋に重なる『僕』と『君』」
const LAST = 9; // 結び(二つの空が重なる)

type LiveRef = SongArticlePageContext["liveRefs"][number];

/** 縦書きの見出し。本文の h2 をそのまま縦に組む(文言は変えない) */
const VerticalHeading: React.FC<{ block: ArticleBlock | undefined }> = ({
  block,
}) =>
  block && block.t === "h" ? (
    <h2 className="a006-chapter__title">
      <span>{inlineText(block.children)}</span>
    </h2>
  ) : null;

/**
 * ウォータークラウン(王冠形のしぶき)。MVで印象的な要素(ユーザー指定)を、MVの絵をなぞらないオリジナルの線画で描く。
 * 琥珀色の一滴(2023年の公演)が群青の水面(2014年の曲)に落ち、しぶきと波紋が広がる。装飾なので読み上げ対象外。
 */
const WaterCrown: React.FC = () => (
  <svg className="a006-crown" viewBox="0 0 240 200" aria-hidden="true">
    <defs>
      <linearGradient id="a006-crown-wall" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#243084" stopOpacity="0.42" />
        <stop offset="0.55" stopColor="#3f6fc4" stopOpacity="0.2" />
        <stop offset="1" stopColor="#8fbaf0" stopOpacity="0.06" />
      </linearGradient>
    </defs>
    <g className="a006-crown__ripples">
      <ellipse cx={120} cy={166} rx={92} ry={15} />
      <ellipse cx={120} cy={166} rx={116} ry={20} />
    </g>
    <g className="a006-crown__splash">
      <path className="a006-crown__rim" d="M24 116 A96 12 0 0 1 216 116" />
      <path className="a006-crown__wall" d="M74 164 C66 146 30 126 24 116 C28.4 113.0 30.8 108.0 32 96 C33.2 108.0 37.0 116.0 43.0 119 C49.0 116.0 52.8 96.0 54 84 C55.2 96.0 59.6 116.0 66.5 119 C73.4 116.0 77.8 90.0 79 78 C80.2 90.0 85.1 119.0 92.5 122 C99.9 119.0 104.8 86.0 106 74 C107.2 86.0 112.3 119.0 120.0 122 C127.7 119.0 132.8 86.0 134 74 C135.2 86.0 140.1 119.0 147.5 122 C154.9 119.0 159.8 90.0 161 78 C162.2 90.0 166.6 116.0 173.5 119 C180.4 116.0 184.8 96.0 186 84 C187.2 96.0 190.9 116.0 197.0 119 C203.1 116.0 206.8 108.0 208 96 C209.2 108.0 211.6 113.0 216.0 116 C210 126 174 146 166 164 A46 9 0 0 1 74 164 Z" />
      <g className="a006-crown__drops">
          <circle className="a006-crown__drop" cx={25.0} cy={87} r={2.5} />
          <circle className="a006-crown__drop" cx={48.7} cy={75} r={2.5} />
          <circle className="a006-crown__drop" cx={75.7} cy={67} r={3.2} />
          <circle className="a006-crown__drop" cx={104.9} cy={63} r={3.2} />
          <circle className="a006-crown__drop" cx={135.1} cy={63} r={3.2} />
          <circle className="a006-crown__drop" cx={164.3} cy={67} r={3.2} />
          <circle className="a006-crown__drop" cx={191.3} cy={75} r={2.5} />
          <circle className="a006-crown__drop" cx={215.0} cy={87} r={2.5} />
      </g>
    </g>
    <path className="a006-crown__fall" d="M120 4 C125 14 127 19 127 23 A7 7 0 1 1 113 23 C113 19 115 14 120 4 Z" />
  </svg>
);

/**
 * 章が画面に入った時だけ動きを付ける(王冠が立ち上がる・波紋が見出しから広がる)。
 * JSなし・動きを減らす設定では完成状態のまま
 */
/** threshold: 要素のどれだけが画面に入ったら動かすか(画面より長い要素には小さい値を使う) */
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

const Note: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <aside className="a006-note">
    <p className="a006-note__label">{label}</p>
    <div className="a006-note__body">{children}</div>
  </aside>
);

/** 公演の注記(日付・会場・公演名、公演ページへの導線) */
const ShowNote: React.FC<{ live: LiveRef; articleId: string }> = ({
  live,
  articleId,
}) => (
  <Note label="この日の公演">
    <p className="a006-note__strong">{dotDate(live.date)}</p>
    {live.place && <p>{live.place}</p>}
    <p>
      {live.liveTitle}
      {live.liveItemName ? ` ${live.liveItemName}公演` : ""}
    </p>
    <p>
      <Link
        to={live.path}
        onClick={() =>
          trackEvent("article_live_page_click", {
            category: "navigation",
            label: articleId,
          })
        }
      >
        公演ページへ
      </Link>
    </p>
  </Note>
);

/**
 * セットリストの終盤。記事に合う曲だけを切り出さず、指定の曲順から最後までを載せる。
 * データには本編とアンコールの区切りがないので、区切りは示さない。
 */
const SetlistNote: React.FC<{ live: LiveRef; from: number }> = ({
  live,
  from,
}) => {
  const tail = live.setList.slice(from - 1);
  if (tail.length === 0) return null;
  return (
    <Note label={`この日の${from}曲目から最後まで`}>
      <ol className="a006-setlist" start={from}>
        {tail.map((s, i) => (
          <li key={i}>{s.name}</li>
        ))}
      </ol>
      <p className="a006-note__src">!Legit のセットリスト記録より</p>
    </Note>
  );
};

const NoTitleDesign: SongArticleDesign = (ctx) => {
  const {
    id,
    title,
    blocks,
    leadMedia,
    songPages,
    songFacts,
    liveRefs,
    publishedAt,
    updatedAt,
    preview,
  } = ctx;
  const splash = useRevealOnce<HTMLDivElement>(0.7);
  const wave = useRevealOnce<HTMLElement>(0.12);

  // H1 の文言はそのまま。縦書きで「松本凱旋から」「読み直すNo title」の2行に組む(文字は変えない・加工しない)
  const BREAK = "から";
  const breakAt = title.indexOf(BREAK);
  const titleLines =
    breakAt > 0
      ? [
          title.slice(0, breakAt + BREAK.length),
          title.slice(breakAt + BREAK.length),
        ]
      : [title];
  const published = formatArticleDate(publishedAt);
  const updated =
    updatedAt && updatedAt !== publishedAt
      ? formatArticleDate(updatedAt)
      : null;

  const firstYear = songFacts.releases[0]?.releaseDate?.slice(0, 4) ?? null;
  const originReleases = songFacts.releases.filter(
    (r) => firstYear && r.releaseDate?.startsWith(firstYear)
  );
  const firstRelease = songFacts.releases[0] ?? null;
  const live = liveRefs[0] ?? null;
  // 記事が触れている曲(ゆーれいずみー)の曲順から。見つからなければセットリストの注記は出さない
  const setlistFrom = live
    ? live.setList.findIndex((s) => s.name.startsWith("ゆーれいずみー")) + 1
    : 0;

  const notes: Record<number, React.ReactNode> = {};
  if (originReleases.length > 0) {
    notes[ORIGIN] = (
      <Note label="リリース">
        {originReleases.map((r) => (
          <p key={r.title}>
            <span className="a006-note__strong">{dotDate(r.releaseDate)}</span>
            <br />
            {formatLabel(r.format)}『{r.title}』
          </p>
        ))}
      </Note>
    );
  }
  if (live) notes[SHOW] = <ShowNote live={live} articleId={id} />;
  if (live && setlistFrom > 0)
    notes[SETLIST] = <SetlistNote live={live} from={setlistFrom} />;

  /** 本文の段落を1つずつ。注記があれば本文の右の列(スマートフォンでは段落の前)に添える */
  const paragraphs = (from: number, to: number) =>
    Array.from({ length: to - from }, (_, k) => from + k).map((i) => (
      <div
        key={i}
        className={`a006-para${i === LAST ? " a006-para--last" : ""}`}
      >
        {notes[i]}
        <ArticleBody
          blocks={blocks}
          leadMedia={leadMedia}
          articleId={id}
          from={i}
          to={i + 1}
          unstyled
          className="a006-para__text"
        />
      </div>
    ));

  return (
    <main className="a006" lang="ja">
      <article>
        {/* 縦書きの表紙: 群青から赤紫へ移る空 */}
        <header className="a006-cover">
          <div className="a006-cover__top">
            <nav aria-label="パンくず" className="a006-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>No title</span>
            </nav>
            {preview && (
              <p className="a006-preview" role="status">
                プレビュー(未公開)
              </p>
            )}
          </div>
          <div className="a006-cover__body">
            <div className="a006-cover__title">
              <div className="a006-cover__vertical">
                <h1 className="a006-title">
                  {titleLines.map((line, i) => (
                    <span key={i} className="a006-title__line">
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="a006-date">
                  {published ? (
                    <>
                      <time dateTime={publishedAt ?? undefined}>
                        {published}
                      </time>
                      公開
                      {updated && (
                        <>
                          {" ・ "}
                          <time dateTime={updatedAt ?? undefined}>
                            {updated}
                          </time>
                          更新
                        </>
                      )}
                    </>
                  ) : (
                    "公開日未定"
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* 見上げる空(淡い空色)。表紙のすぐ下にMV、続いて導入 */}
        <div className="a006-sky">
          <div className="a006-mv">
            <ArticleBody
              blocks={blocks}
              leadMedia={leadMedia}
              articleId={id}
              from={0}
              to={LEDE}
              unstyled
            />
          </div>
          <section className="a006-chapter a006-chapter--intro">
            <div className="a006-chapter__inner">
              <div className="a006-chapter__body">
                <ArticleBody
                  blocks={blocks}
                  leadMedia={leadMedia}
                  articleId={id}
                  from={LEDE}
                  to={LEDE + 1}
                  unstyled
                  className="a006-lede"
                />
                {paragraphs(ORIGIN, H_HOME)}
              </div>
            </div>
          </section>

          {/* 見出し1: 故郷で迎えた最終公演。空に琥珀の光が差す */}
          <section className="a006-chapter a006-chapter--home">
            {/* 章の入口: 2023年の公演という一滴が、2014年の曲に落ちる */}
            <div ref={splash.ref} className={`a006-crown-wrap${splash.className}`}>
              <WaterCrown />
            </div>
            <div className="a006-chapter__inner">
              <div className="a006-chapter__rail">
                <VerticalHeading block={blocks[H_HOME]} />
              </div>
              <div className="a006-chapter__body">
                {paragraphs(SHOW, H_TWO)}
              </div>
            </div>
          </section>

          {/* 見出し2: 凱旋に重なる「僕」と「君」。結びで二つの空が重なる */}
          {/* 見出し2の章: 見出しから群青と琥珀の波紋が広がり、結びまで重なっていく */}
          <section
            ref={wave.ref}
            className={`a006-chapter a006-chapter--two${wave.className}`}
          >
            <div className="a006-chapter__inner">
              <div className="a006-chapter__rail">
                <VerticalHeading block={blocks[H_TWO]} />
              </div>
              <div className="a006-chapter__body">
                {paragraphs(H_TWO + 1, blocks.length)}
              </div>
            </div>
          </section>
        </div>

        {/* 奥付(縦書き)。サイトの確認済みデータだけ */}
        <footer className="a006-colophon">
          <dl className="a006-colophon__box">
            <div>
              <dt>曲</dt>
              <dd>No title</dd>
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
            {/* 本の奥付の「初版」にならい、最初に収録された作品だけを載せる(収録作の一覧は曲ページへ) */}
            {firstRelease && (
              <div>
                <dt>初出</dt>
                <dd>
                  {dotDate(firstRelease.releaseDate)}
                  <br />
                  {formatLabel(firstRelease.format)}『{firstRelease.title}』
                </dd>
              </div>
            )}
          </dl>
          <ul className="a006-next">
            {songPages.map((p) => (
              <li key={p.slug}>
                <Link
                  to={`/songs/${p.slug}/`}
                  onClick={() =>
                    trackEvent("article_song_page_click", {
                      category: "navigation",
                      label: id,
                    })
                  }
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

export default NoTitleDesign;
