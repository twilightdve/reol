/**
 * 楽曲記事「mede:mede」(reol-song-019)の記事別デザイン。設計の根拠は plan/63。
 *
 * - 色は『-nil-／極彩色』の16曲の輪で mede:mede に当てた白と光(#ece6d4)だけ。白い地に、斜めに差し込む光の形を置く。
 *   文字は真っ黒ではなく、暖かい焦げ茶(018 の白黒とは違う、朝の部屋の明るさ)。
 * - 題名: 曲名の後ろの「mede」だけ、輪郭が少しにじむ(はっきり言い切らない発音、曖昧な意識。段落16〜17)。
 * - 表紙: 題名の上に光の形。下(広い画面では右)に『極彩色』XFD と、本文の聴くリンク(段落0)。
 * - 段落20の後: 本文の問い(段落13・20の地の文)が円を描いて回り続ける。円の片側を通る間だけ文字がにじむ。
 * - 段落27の後: 1K と 1LDK の間取り。1K は寝起き・音楽・先行きを考えることが一つの部屋に(段落25)、
 *   1LDK は寝室と別に過ごす場所がある(段落27)。1LDK は記事へ。
 * - 結びの後: 小さな光の形が、ゆっくり明るくなっては戻る(体温)。
 * - 段落10の後: 『No title』の記事への注記。
 * - 歌詞は本文の外に出さない(段落2の暮らしの品々・段落6の引用も図にしない)。図の言葉は本文の地の文から。
 *   間取りは図としての抽象で、実際に住んでいた部屋ではない(本文のとおり)。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import OfficialMedia from "../../OfficialMedia";
import { gokusaishikiXfd } from "../gokusaishikiXfd";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./mede-mede.css";

// 本文の段落位置(blocks の添字)
const LISTEN = 0; // 「mede:mede」をSpotifyで聴く
const OPENING = 1; // れをるの歌詞の中でも、等身大の姿が率直に映し出されている(第4版)
const INTRO = 2;
const S_LIFE = 4; // 見出し「手応えと、先の見えない暮らし」
const NOTITLE_NOTE = 11; // 段落10(前年のコミックマーケットで『No title』)の後
const S_BLUR = 15; // 見出し「はっきりした言葉と、曖昧な意識」
const LOOP_FIG = 21; // 段落20(ぐるぐる回っている)の後
const S_ROOM = 21; // 見出し「1LDKよりも、1K」
const ROOM_FIG = 28; // 段落27(1LDKには、少し距離を取れる余地)の後
const LAST = 32; // 結び

// 段落20の後に回る言葉。歌詞の2行(2026-11-06 ユーザーから。原文の括弧は外す)。行の切れ目は全角の空き
const LOOP_TEXT = "巡る巡る 見えた世界が霞む\u3000end ぐるぐる もう終止符を打つ?";

/** 斜めに差し込む光の形(窓は描かない) */
const Light: React.FC<{ className: string }> = ({ className }) => <span className={className} aria-hidden="true" />;

/** 段落20の後: 歌詞の2行が円を描いて回る。同じ円を2枚重ね、片側だけにじんだ方を見せる */
const LoopCircle: React.FC<{ id: string }> = ({ id }) => (
  <svg viewBox="0 0 300 300" className="a019-loop__svg">
    <defs>
      <path id={id} d="M150,150 m-118,0 a118,118 0 1,1 236,0 a118,118 0 1,1 -236,0" />
    </defs>
    <g className="a019-loop__turn">
      <text className="a019-loop__text">
        {/* 字の幅はブラウザで違うので、字間で円周(約741)の一周に揃える。継ぎ目に一字分空ける */}
        <textPath href={`#${id}`} textLength={720} lengthAdjust="spacing">
          {LOOP_TEXT}
        </textPath>
      </text>
    </g>
  </svg>
);
const LoopFig: React.FC = () => (
  <figure className="a019-loop" aria-label={`歌詞より: ${LOOP_TEXT}`}>
    <div className="a019-loop__stage" aria-hidden="true">
      <div className="a019-loop__layer is-sharp">
        <LoopCircle id="a019-loop-a" />
      </div>
      <div className="a019-loop__layer is-blur">
        <LoopCircle id="a019-loop-b" />
      </div>
    </div>
  </figure>
);

/** 段落27の後: 1K と 1LDK の間取り(図としての抽象) */
const RoomFig: React.FC<{ articleId: string }> = ({ articleId }) => (
  <figure className="a019-rooms">
    <div className="a019-rooms__row">
      <div className="a019-room">
        <svg viewBox="0 0 240 250" className="a019-room__plan" role="img" aria-label="1K。寝起きするのも、音楽を作るのも、暮らしの先行きを考えるのも、一つの部屋">
          <polygon className="a019-room__light" points="40,40 120,40 170,150 90,150" />
          {/* 外壁。玄関の扉の分だけ開ける */}
          <path className="a019-room__wall" d="M160,240 H230 V10 H10 V240 H120" />
          {/* 洋室とキッチンの仕切り。扉の分だけ開ける */}
          <path className="a019-room__inner" d="M10,170 H110 M150,170 H230" />
          <text x="120" y="70" className="a019-room__name">洋室</text>
          <text x="120" y="112" className="a019-room__act">寝る</text>
          <text x="82" y="136" className="a019-room__act">作る</text>
          <text x="158" y="136" className="a019-room__act">考える</text>
          <text x="80" y="212" className="a019-room__name is-small">K</text>
          <text x="190" y="212" className="a019-room__name is-small">玄関</text>
        </svg>
        <p className="a019-room__label">1K</p>
      </div>
      <div className="a019-room">
        <svg viewBox="0 0 240 250" className="a019-room__plan" role="img" aria-label="1LDK。寝室とは別に過ごす場所がある">
          <polygon className="a019-room__light" points="130,40 196,40 226,130 160,130" />
          <path className="a019-room__wall" d="M160,240 H230 V10 H10 V240 H120" />
          {/* 洋室と LDK の仕切り、LDK と玄関の仕切り(1K と同じ右下に玄関)。どちらも扉の分だけ開ける */}
          <path className="a019-room__inner" d="M110,10 V100 M110,140 V240 M150,170 H230" />
          <text x="60" y="80" className="a019-room__name">洋室</text>
          <text x="60" y="122" className="a019-room__act">寝る</text>
          <text x="170" y="70" className="a019-room__name">LDK</text>
          <text x="150" y="122" className="a019-room__act">作る</text>
          <text x="186" y="150" className="a019-room__act">考える</text>
          <text x="190" y="212" className="a019-room__name is-small">玄関</text>
        </svg>
        <p className="a019-room__label">
          <Link
            to="/articles/1ldk/"
            onClick={() => trackEvent("article_related_click", { category: "navigation", label: `${articleId}->reol-song-076` })}
          >
            1LDK
          </Link>
        </p>
      </div>
    </div>
  </figure>
);

const MedeMedeDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, publishedAt, modifiedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const xfd = gokusaishikiXfd("mede:mede");
  const body = (from: number, to: number, className = "a019-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「mede:mede　諦めきれない日々を愛でる」: 曲名と副題を分ける(文言は変えない)
  const [tMain, ...tRest] = title.split("　");
  const tSub = tRest.join("　").trim();
  // 曲名の後ろの「mede」だけをにじませる(コロンの後)
  const colon = tMain.indexOf(":");
  const [tHead, tTail] = colon >= 0 ? [tMain.slice(0, colon + 1), tMain.slice(colon + 1)] : [tMain, ""];
  const pages = songPages.filter((p, i) => songPages.findIndex((q) => q.songName === p.songName) === i);
  const credit =
    songFacts.lyricMember && songFacts.lyricMember === songFacts.musicMember
      ? `作詞・作曲 ${songFacts.lyricMember}`
      : [songFacts.lyricMember && `作詞 ${songFacts.lyricMember}`, songFacts.musicMember && `作曲 ${songFacts.musicMember}`]
          .filter(Boolean)
          .join(" / ");

  return (
    <main className="a019" lang="ja">
      <article>
        <header className="a019-cover" data-og-cover>
          <Light className="a019-cover__light" />
          <div className="a019-cover__top">
            <nav aria-label="パンくず" className="a019-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>{ctx.songTitle}</span>
            </nav>
          </div>
          <div className="a019-cover__body">
            <div className="a019-cover__text">
              <h1 className="a019-title">
                <span className="a019-title__song">
                  {tHead}
                  {tTail && <span className="a019-title__echo">{tTail}</span>}
                </span>
                {tSub && <span className="a019-title__sub">{tSub}</span>}
              </h1>
              <p className="a019-date">
                <ArticleDate publishedAt={publishedAt} updatedAt={modifiedAt} />
              </p>
            </div>
            {/* XFD と本文の聴くリンク(OGP の撮影では __media ごと隠れる) */}
            <div className="a019-cover__media">
              <OfficialMedia {...xfd} articleId={id} unstyled preferHighRes />
              {body(LISTEN, OPENING, "a019-text a019-listen")}
            </div>
          </div>
        </header>

        <div className="a019-ground">
          <div className="a019-column">
            {body(OPENING, INTRO, "a019-text a019-opening")}
            {firstRelease && (
              <aside className="a019-note">
                <p className="a019-note__label">リリース</p>
                <p>
                  <span className="a019-note__strong">{dotDate(firstRelease.releaseDate)}</span>{" "}
                  {formatLabel(firstRelease.format)}『{firstRelease.title}』8曲目
                </p>
              </aside>
            )}
            {body(INTRO, S_LIFE)}

            <section className="a019-section">
              {body(S_LIFE, NOTITLE_NOTE)}
              <aside className="a019-note is-inline">
                <p className="a019-note__label">読みもの</p>
                <p>
                  <Link
                    to="/articles/no-title/"
                    onClick={() => trackEvent("article_related_click", { category: "navigation", label: `${id}->reol-song-006` })}
                  >
                    「No title」
                  </Link>
                </p>
              </aside>
              {body(NOTITLE_NOTE, S_BLUR)}
            </section>

            <section className="a019-section">
              {body(S_BLUR, LOOP_FIG)}
              <LoopFig />
            </section>

            <section className="a019-section">
              {body(S_ROOM, ROOM_FIG)}
              <RoomFig articleId={id} />
              {body(ROOM_FIG, LAST)}
              {body(LAST, blocks.length, "a019-text a019-last")}
              <Light className="a019-end" />
            </section>
          </div>

          <footer className="a019-colophon">
            <dl className="a019-colophon__list">
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
              <div>
                <dt>前の曲</dt>
                <dd>
                  <Link
                    to="/articles/orderly/"
                    onClick={() => trackEvent("article_related_click", { category: "navigation", label: `${id}->reol-song-018` })}
                  >
                    「-orderly-」
                  </Link>
                  (『極彩色』7曲目)
                </dd>
              </div>
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
            <ul className="a019-next">
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

export default MedeMedeDesign;
