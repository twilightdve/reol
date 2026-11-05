/**
 * 楽曲記事「-orderly-」(reol-song-018)の記事別デザイン。設計の根拠は plan/62。
 *
 * - 主役は「繰り返すメロディーの軸と、そこに加わっていく音」。『-nil-／極彩色』の16曲の輪で、-orderly- だけは塗っていない(012)。
 *   その方針どおり色は使わず、白い地に黒一色。音の点(パッド)は16の升目に整然と並べる(orderly)。
 * - 表紙: 16升×5段のループ。真ん中の段(軸のメロディー)は毎回同じで、ループが一周するたびに上下の段の音が一つずつ加わる。
 *   まだ鳴っていない升は空の枠のまま待っている(次に加わる音への予感)。広い画面では右、狭い画面では題名の下。
 *   その下(広い画面では右下)に、『極彩色』XFD と Spotify で聴くリンク。本文に聴くリンクの段落が無いので、サイトの曲データの Spotify から置く。
 * - 段落2の後: 同じループの小さな見取り図を横に4つ、5つ目は空の枠(控えめに。本文1行ほどの大きさ)。
 * - 段落3の後: 横一本の軸(同じフレーズの繰り返し)に、形の違う音が上下から寄って、軸の上で受け止められる。
 * - 段落4の後: 『極彩色』の6〜8曲目。ロジックエージェント(記事へ)→ -orderly- → mede:mede。
 * - 結び(段落5)の後: 軸の段が一周し、その先に空の升が続いていく。カーソルが次の升で待つ。
 * - 升の並び(どの升で鳴るか)は図としての抽象で、曲の譜面ではない(音源は未聴。本文の記述だけを使う)。図の言葉は本文の地の文から。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import OfficialMedia from "../../OfficialMedia";
import { gokusaishikiXfd } from "../gokusaishikiXfd";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./orderly.css";

// 本文の段落位置(blocks の添字)
const OPENING = 0; // 「-orderly-」を聴くと、ワクワクする。
const INTRO = 1; // 『極彩色』の7曲目に収録された、ギガによるインストゥルメンタル
const PASS_FIG = 3; // 段落2(シンプルなメロディーがループし)の後
const AXIS_FIG = 4; // 段落3(「orderly」には)の後
const TRACK_FIG = 5; // 段落4(そして、アルバムは次の「mede:mede」へ)の後
const LAST = 5; // 結び

// サイトの曲データ(discography)の Spotify。本文に聴くリンクが無いので、デザインで置く
const SPOTIFY = {
  url: "https://open.spotify.com/track/6Onx9jbhBqzG6noNtyrTD4",
  text: "「-orderly-」をSpotifyで聴く",
};

const STEPS = 16;
type Voice = { key: string; shape: "bar" | "dot" | "square" | "diamond" | "tick"; steps: number[]; join: number };
/**
 * 上から下への段。真ん中が軸のメロディー(1周目から)。join は何周目から加わるか。
 * どの升で鳴るかは図としての抽象(曲の譜面ではない)
 */
const VOICES: Voice[] = [
  { key: "v4", shape: "diamond", steps: [5, 13], join: 4 },
  { key: "v2", shape: "dot", steps: [2, 6, 10, 14], join: 2 },
  { key: "axis", shape: "bar", steps: [0, 3, 4, 7, 8, 11, 12, 15], join: 1 },
  { key: "v3", shape: "square", steps: [0, 4, 8, 12], join: 3 },
  { key: "v5", shape: "tick", steps: [1, 7, 9, 11], join: 5 },
];
const AXIS = VOICES[2];

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
  return {
    ref,
    className: state === "static" ? "" : state === "armed" ? " is-armed" : " is-armed is-visible",
  };
};

/** 升の中の音の形(段ごとに違う電子音) */
const Pad: React.FC<{ shape: Voice["shape"] }> = ({ shape }) => <i className={`a018-pad is-${shape}`} />;

/**
 * 表紙のループ。16升×5段。鳴る升は、再生位置が通るたびに光る。
 * 動きのある環境では、一周ごとに段が一つずつ加わる(5周で一巡)。動きを減らす設定・JSなしでは全段が鳴っている完成状態
 */
const CoverLoop: React.FC = () => (
  <div className="a018-loop" aria-hidden="true">
    {VOICES.map((v) => (
      <div key={v.key} className={`a018-loop__row is-join${v.join}${v === AXIS ? " is-axis" : ""}`}>
        {Array.from({ length: STEPS }, (_, s) => (
          <span key={s} className="a018-loop__cell">
            {v.steps.includes(s) && (
              <span className="a018-loop__hit" style={{ "--a018-step": s } as React.CSSProperties}>
                <Pad shape={v.shape} />
              </span>
            )}
          </span>
        ))}
      </div>
    ))}
    <span className="a018-loop__head" />
  </div>
);

/**
 * 段落2の後: 同じループの小さな見取り図を4つ、横に。周を重ねるごとに音が増え、5つ目は空の枠だけ。
 * 大げさにしない(2026-11-05 ユーザー「こんな大層に表現しなくていい」)。番号・説明は付けず、本文の一行ほどの大きさ
 */
const PassFig: React.FC = () => (
  <figure className="a018-passes" aria-label="同じメロディーが繰り返され、そのたびに音が加わる。その次は、まだ空いている">
    {[1, 2, 3, 4, 5].map((pass) => (
      <span key={pass} className={`a018-pass${pass === 5 ? " is-next" : ""}`} aria-hidden="true">
        {pass < 5 &&
          VOICES.flatMap((v, row) =>
            v.join <= pass
              ? v.steps.map((s) => (
                  <i key={`${v.key}${s}`} className="a018-pass__dot" style={{ gridRow: row + 1, gridColumn: s + 1 }} />
                ))
              : []
          )}
      </span>
    ))}
  </figure>
);

/** 段落3の後: 同じフレーズを繰り返す横一本の軸に、形の違う音が上下から寄って受け止められる */
const AXIS_MARKS: { x: number; side: -1 | 1; shape: Voice["shape"] }[] = [
  { x: 1, side: -1, shape: "dot" },
  { x: 3, side: 1, shape: "square" },
  { x: 6, side: -1, shape: "diamond" },
  { x: 8, side: 1, shape: "tick" },
  { x: 10, side: -1, shape: "square" },
  { x: 13, side: 1, shape: "dot" },
  { x: 15, side: -1, shape: "tick" },
];
const AxisFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.45);
  return (
    <figure ref={ref} className={`a018-axis${className}`}>
      <div className="a018-axis__stage" aria-hidden="true">
        <div className="a018-axis__line">
          {Array.from({ length: STEPS }, (_, s) => (
            <span key={s} className={`a018-axis__beat${AXIS.steps.includes(s) ? " is-on" : ""}`} />
          ))}
        </div>
        {AXIS_MARKS.map((m, i) => (
          <span
            key={i}
            className={`a018-axis__mark ${m.side < 0 ? "is-above" : "is-below"}`}
            style={{ "--a018-x": m.x, "--a018-i": i } as React.CSSProperties}
          >
            <Pad shape={m.shape} />
          </span>
        ))}
      </div>
      <figcaption className="a018-cap">繰り返すメロディーが、さまざまな音を受け止める軸になる</figcaption>
    </figure>
  );
};

/** 段落4の後: 『極彩色』の6〜8曲目。ロジックエージェント → -orderly- → mede:mede */
const TrackFig: React.FC<{ articleId: string }> = ({ articleId }) => (
  <nav className="a018-tracks" aria-label="『極彩色』の6曲目から8曲目">
    <ol>
      <li>
        <span className="a018-tracks__no">06</span>
        <Link
          to="/articles/rojikkuejento/"
          onClick={() => trackEvent("article_related_click", { category: "navigation", label: `${articleId}->reol-song-017` })}
        >
          ロジックエージェント
        </Link>
      </li>
      <li className="is-here" aria-current="true">
        <span className="a018-tracks__no">07</span>
        <span>-orderly-</span>
      </li>
      <li className="is-next">
        <span className="a018-tracks__no">08</span>
        <span>mede:mede</span>
      </li>
    </ol>
  </nav>
);

/** 結びの後: 軸の段が一周し、その先に空の升が続いていく。カーソルが次の升で待つ */
const EndFig: React.FC = () => (
  <div className="a018-end" aria-hidden="true">
    {Array.from({ length: STEPS }, (_, s) => (
      <span key={s} className="a018-end__cell">
        {AXIS.steps.includes(s) && <Pad shape="bar" />}
      </span>
    ))}
    <span className="a018-end__cell is-cursor" />
    {Array.from({ length: 7 }, (_, s) => (
      <span key={`n${s}`} className="a018-end__cell is-ahead" style={{ "--a018-i": s } as React.CSSProperties} />
    ))}
  </div>
);

const OrderlyDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, publishedAt, modifiedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const xfd = gokusaishikiXfd("-orderly-");
  const body = (from: number, to: number, className = "a018-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「-orderly-　繰り返しの先にある予感」: 曲名と副題を分ける(文言は変えない)
  const [tMain, ...tRest] = title.split("　");
  const tSub = tRest.join("　").trim();
  const pages = songPages.filter((p, i) => songPages.findIndex((q) => q.songName === p.songName) === i);
  const credit = songFacts.musicMember ? `作曲 ${songFacts.musicMember}` : null;

  return (
    <main className="a018" lang="ja">
      <article>
        <header className="a018-cover" data-og-cover>
          <div className="a018-cover__top">
            <nav aria-label="パンくず" className="a018-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>{ctx.songTitle}</span>
            </nav>
          </div>
          <div className="a018-cover__body">
            <div className="a018-cover__text">
              <h1 className="a018-title">
                <span className="a018-title__song">{tMain}</span>
                {tSub && <span className="a018-title__sub">{tSub}</span>}
              </h1>
              <p className="a018-date">
                <ArticleDate publishedAt={publishedAt} updatedAt={modifiedAt} />
              </p>
            </div>
            <div className="a018-cover__loop">
              <CoverLoop />
            </div>
            {/* XFD と聴くリンク(OGP の撮影では __media ごと隠れる) */}
            <div className="a018-cover__media">
              <OfficialMedia {...xfd} articleId={id} unstyled preferHighRes />
              <p className="a018-listen">
                <a
                  href={SPOTIFY.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("article_source_click", { category: "outbound", label: `${id}->spotify` })}
                >
                  {SPOTIFY.text}
                </a>
              </p>
            </div>
          </div>
        </header>

        <div className="a018-ground">
          <div className="a018-column">
            {body(OPENING, INTRO, "a018-text a018-opening")}
            {firstRelease && (
              <aside className="a018-note">
                <p className="a018-note__label">リリース</p>
                <p>
                  <span className="a018-note__strong">{dotDate(firstRelease.releaseDate)}</span>{" "}
                  {formatLabel(firstRelease.format)}『{firstRelease.title}』
                </p>
              </aside>
            )}
            {body(INTRO, PASS_FIG)}
            <PassFig />
            {body(PASS_FIG, AXIS_FIG)}
            <AxisFig />
            {body(AXIS_FIG, TRACK_FIG)}
            <TrackFig articleId={id} />
            {body(LAST, blocks.length, "a018-text a018-last")}
            <EndFig />
          </div>

          <footer className="a018-colophon">
            <dl className="a018-colophon__list">
              <div>
                <dt>曲</dt>
                <dd>{ctx.songTitle}(インストゥルメンタル)</dd>
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
            </dl>
            <ul className="a018-next">
              {pages.map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/songs/${p.slug}/`}
                    onClick={() => trackEvent("article_song_page_click", { category: "navigation", label: id })}
                  >
                    {p.songName} — 演奏統計・配信リンク
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

export default OrderlyDesign;
