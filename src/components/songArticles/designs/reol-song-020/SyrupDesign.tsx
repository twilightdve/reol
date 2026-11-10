/**
 * 楽曲記事「Syrup」(reol-song-020)の記事別デザイン。設計の根拠は plan/65。
 *
 * - 地は深い夜の色(いちばん眠りが深いところ。段落1)。差し色は『-nil-／極彩色』の16曲の輪で Syrup に当てた薄紅と虹(012 と同じ値)。
 * - 表紙: 題名「Syrup」の下半分が、薄紅のシロップの層に沈む(「半分」。段落7・11)。面には細い虹の照り。
 *   下(広い画面では右)に『極彩色』XFD と、本文の聴くリンク(段落0)。
 * - 段落8の後: 言葉が澄んでいく三つの層(感じたばかり → 時間を置いて → 澄んだ後味。言葉は段落8の地の文から)。
 * - 段落11の後: 二つの「半分」。夜に隠す半分(段落7)と、声に溶かす半分(段落11)。表紙の題名と同じ形の言葉で。
 * - 結びの後: 夜の地が、薄紅を通って朝の色に混ざる(段落12)。奥付は朝の色の上。
 * - 段落1の後に「水底游歩道」、段落5の後に『-nil-／極彩色』の記事への注記。奥付に前の曲「mede:mede」。
 * - 歌詞は本文の外に出さない。本文が歌詞から言い換えた景色(花・星・クジラ・翅)は図にしない。
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
import "./syrup.css";

// 本文の段落位置(blocks の添字)
const LISTEN = 0; // 「Syrup」を聴く(AWA)
const OPENING = 1; // 深夜のいちばん眠りが深いところ。「水底游歩道」との比較
const INTRO = 2; // 『極彩色』の9曲目
const S_DREAM = 3; // 見出し「夢の中を泳ぐ翅」
const NIL_NOTE = 6; // 段落5(表題曲「極彩色」の MV の蝶)の後
const S_SOUP = 6; // 見出し「言葉を煮込む」
const CLEAR_FIG = 9; // 段落8(時間を置いて、澄んだ後味になるまで)の後
const S_HALF = 10; // 見出し「声に溶けた半分」
const HALF_FIG = 12; // 段落11(本当の気持ちの半分を声に溶かす)の後
const LAST = 12; // 結び(夜が明ける)

/** 段落8の後: 言葉が澄んでいく三つの層。言葉は段落8の地の文から */
const CLEAR_STEPS = [
  { key: "raw", label: "感じたばかり" },
  { key: "rest", label: "時間を置いて" },
  { key: "clear", label: "澄んだ後味" },
] as const;

const ClearFig: React.FC = () => (
  <figure className="a020-clear" aria-label="言葉が澄んでいく三つの層。感じたばかり、時間を置いて、澄んだ後味">
    <ol className="a020-clear__row" aria-hidden="true">
      {CLEAR_STEPS.map((s) => (
        <li key={s.key} className={`a020-clear__step is-${s.key}`}>
          <span className="a020-clear__glass">
            <span className="a020-clear__liquid" />
            <span className="a020-clear__grain" />
          </span>
          <span className="a020-clear__label">{s.label}</span>
        </li>
      ))}
    </ol>
  </figure>
);

/** 段落11の後: 二つの「半分」 */
const HalfFig: React.FC = () => (
  <figure className="a020-half" aria-label="二つの半分。願いの半分を夜に隠す。本当の気持ちの半分を声に溶かす">
    <div className="a020-half__row" aria-hidden="true">
      <div className="a020-half__item">
        <span className="a020-half__word is-hide">
          <span className="a020-half__whole">半分</span>
        </span>
        <span className="a020-half__label">夜に隠す</span>
      </div>
      <div className="a020-half__item">
        <span className="a020-half__word is-melt">
          <span className="a020-half__top">半分</span>
          <span className="a020-half__bottom">半分</span>
        </span>
        <span className="a020-half__label">声に溶かす</span>
      </div>
    </div>
  </figure>
);

const SyrupDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, publishedAt, modifiedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const xfd = gokusaishikiXfd("Syrup");
  const body = (from: number, to: number, className = "a020-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「Syrup　言葉を煮込む夜」: 曲名と副題を分ける(文言は変えない)
  const [tMain, ...tRest] = title.split("　");
  const tSub = tRest.join("　").trim();
  const pages = songPages.filter((p, i) => songPages.findIndex((q) => q.songName === p.songName) === i);
  const credit =
    songFacts.lyricMember && songFacts.lyricMember === songFacts.musicMember
      ? `作詞・作曲 ${songFacts.lyricMember}`
      : [songFacts.lyricMember && `作詞 ${songFacts.lyricMember}`, songFacts.musicMember && `作曲 ${songFacts.musicMember}`]
          .filter(Boolean)
          .join(" / ");
  const related = (to: string, target: string, text: string) => (
    <Link to={to} onClick={() => trackEvent("article_related_click", { category: "navigation", label: `${id}->${target}` })}>
      {text}
    </Link>
  );

  return (
    <main className="a020" lang="ja">
      <article>
        <header className="a020-cover" data-og-cover>
          <div className="a020-cover__top">
            <nav aria-label="パンくず" className="a020-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>{ctx.songTitle}</span>
            </nav>
          </div>
          <div className="a020-cover__body">
            <div className="a020-cover__text">
              <h1 className="a020-title">
                {/* 上半分は夜の上に、下半分はシロップの層に沈む(同じ文字を2枚重ねて上下で切る) */}
                <span className="a020-title__song">
                  <span className="a020-title__above">{tMain}</span>
                  <span className="a020-title__below" aria-hidden="true">
                    {tMain}
                  </span>
                  <span className="a020-title__sheen" aria-hidden="true" />
                </span>
                {tSub && <span className="a020-title__sub">{tSub}</span>}
              </h1>
              <p className="a020-date">
                <ArticleDate publishedAt={publishedAt} updatedAt={modifiedAt} />
              </p>
            </div>
            {/* XFD と本文の聴くリンク(OGP の撮影では __media ごと隠れる) */}
            <div className="a020-cover__media">
              <OfficialMedia {...xfd} articleId={id} unstyled preferHighRes />
              {body(LISTEN, OPENING, "a020-text a020-listen")}
            </div>
          </div>
        </header>

        <div className="a020-ground">
          <div className="a020-column">
            {body(OPENING, INTRO, "a020-text a020-opening")}
            <aside className="a020-note is-inline">
              <p className="a020-note__label">読みもの</p>
              <p>{related("/articles/minasoko-yuu-hodou/", "reol-song-015", "「水底游歩道」")}</p>
            </aside>
            {firstRelease && (
              <aside className="a020-note">
                <p className="a020-note__label">リリース</p>
                <p>
                  <span className="a020-note__strong">{dotDate(firstRelease.releaseDate)}</span>{" "}
                  {formatLabel(firstRelease.format)}『{firstRelease.title}』9曲目
                </p>
              </aside>
            )}
            {body(INTRO, S_DREAM)}

            <section className="a020-section">
              {body(S_DREAM, NIL_NOTE)}
              <aside className="a020-note is-inline">
                <p className="a020-note__label">読みもの</p>
                <p>{related("/articles/nil-gokusaishiki/", "reol-song-012", "「-nil-／極彩色」")}</p>
              </aside>
            </section>

            <section className="a020-section">
              {body(S_SOUP, CLEAR_FIG)}
              <ClearFig />
              {body(CLEAR_FIG, S_HALF)}
            </section>

            <section className="a020-section">
              {body(S_HALF, HALF_FIG)}
              <HalfFig />
              {body(LAST, blocks.length, "a020-text a020-last")}
            </section>
          </div>
        </div>

        {/* 結びの後: 夜が、薄紅を通って朝の色に混ざる */}
        <div className="a020-dawn" aria-hidden="true" />

        <footer className="a020-colophon">
          <dl className="a020-colophon__list">
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
                {related("/articles/medemede/", "reol-song-019", "「mede:mede」")}
                (『極彩色』8曲目)
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
          <ul className="a020-next">
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
      </article>
    </main>
  );
};

export default SyrupDesign;
