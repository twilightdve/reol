/**
 * 楽曲記事「1LDK」(reol-song-076)の記事別デザイン。設計の根拠は plan/35。
 *
 * - 紙面全体を「暗い部屋から朝の光へ」: 表紙は灰色の暗い部屋、本文の地は上から下へ少しずつ明るくなり、結びで最も明るい
 *   (MV の終盤の白い光の廊下。音楽が明かりになる、という本文の芯)。
 * - 表紙: 奥へ連なる額縁(オリジナルの線画)。いちばん奥だけが光っている。
 * - 書き手自身の体験の段落(8〜9)は装飾を置かず、行間と余白を広げて静かに組む(書き手の家族の話を含むため)。
 * - 結び: 最後の段落の前に、壁に並ぶ空の額縁。最後の1つだけが光っている(本文版2: 憧れていた人が、書き手にとっての支えになっていた)。
 * - 松本公演の段落(6)の前に、その日の公演の注記(サイトの公演記録)。
 * - 冒頭のライヴ映像はサイトに登録された映像ではないので、埋め込みにせず本文のリンクのまま。
 * - 注記と奥付は、サイトの確認済みデータだけ。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import Phrased from "../../Phrased";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./oneldk.css";

// 段落の位置(designManifest.ts の anchors と対応)
// 本文版2(2026-10-11): 1 曲の芯 / 2〜4 歌詞の読み / 5〜7 ライヴでの変化(6 は松本公演) / 8〜9 書き手の体験 / 10〜11 結び
const LEDE = 1; // 冒頭(曲の芯。リリースの注記)
const LYRICS = 2; // 歌詞の読み(2〜4)
const LIVE = 5; // ライヴでの変化(5〜7)
const MATSUMOTO = 6; // 松本公演の MC(公演の注記)
const STORY = 8; // 書き手の体験(8〜9。装飾なし)
const CLOSING = 10; // 結び(10〜11)
const LAST = 11; // 最後の段落(この前に壁の額)

/** 奥へ連なる額縁。手前から奥へ縮みながら、少し右上の一点へ寄っていく。いちばん奥だけが光る。装飾なので読み上げ対象外 */
const FrameTunnel: React.FC = () => {
  const N = 9;
  const frames = Array.from({ length: N }, (_, k) => {
    const s = Math.pow(0.8, k);
    const w = 760 * s;
    const h = 470 * s;
    const cx = 400 + 130 * (1 - s);
    const cy = 250 - 40 * (1 - s);
    return { x: cx - w / 2, y: cy - h / 2, w, h, k };
  });
  const last = frames[N - 1];
  return (
    <svg className="a076-tunnel" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="a076-dawn" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0" stopColor="#fbf6ec" />
          <stop offset="0.55" stopColor="#ead7b8" />
          <stop offset="1" stopColor="#d4b193" />
        </radialGradient>
        <radialGradient id="a076-spill" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#d4b193" stopOpacity="0.32" />
          <stop offset="1" stopColor="#d4b193" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* 奥の光が部屋にこぼれる */}
      <ellipse cx={last.x + last.w / 2} cy={last.y + last.h / 2} rx={260} ry={170} fill="url(#a076-spill)" />
      {frames.map((f) => (
        <rect
          key={f.k}
          className="a076-tunnel__frame"
          x={f.x}
          y={f.y}
          width={f.w}
          height={f.h}
          style={{ opacity: 0.28 + 0.6 * (f.k / (N - 1)) }}
        />
      ))}
      <rect x={last.x + 2} y={last.y + 2} width={last.w - 4} height={last.h - 4} fill="url(#a076-dawn)" />
    </svg>
  );
};

/** 壁に並ぶ空の額縁。大きさと高さが少しずつ違い、最後の1つだけが光る。装飾なので読み上げ対象外 */
const WallOfFrames: React.FC = () => {
  // [x, y, 幅, 高さ]
  const frames: [number, number, number, number][] = [
    [8, 30, 74, 92],
    [104, 14, 112, 78],
    [238, 40, 62, 62],
    [322, 8, 96, 120],
    [440, 34, 80, 66],
    [544, 18, 88, 104],
  ];
  return (
    <svg className="a076-wall" viewBox="0 0 640 140" aria-hidden="true">
      <defs>
        <radialGradient id="a076-wall-light" cx="0.5" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor="#ead7b8" />
        </radialGradient>
      </defs>
      {frames.map(([x, y, w, h], i) => {
        const lit = i === frames.length - 1;
        return (
          <g key={i} className={`a076-wall__frame${lit ? " is-lit" : ""}`}>
            {lit && <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={18} className="a076-wall__glow" />}
            <rect x={x} y={y} width={w} height={h} className="a076-wall__outer" />
            <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} className="a076-wall__inner" fill={lit ? "url(#a076-wall-light)" : "none"} />
          </g>
        );
      })}
    </svg>
  );
};

const OneLdkDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, liveRefs, createdAt, updatedAt, preview } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const live = liveRefs[0] ?? null;
  const body = (from: number, to: number, className = "a076-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  const stats = songFacts.stats;
  // 一言はテキストだけの段落なら、句の切れ目でだけ折り返す(文言は変えない)。テキスト以外を含む場合は共通の描画
  const lede = blocks[LEDE];
  const ledeText =
    lede?.t === "p" && lede.children.every((n) => n.t === "text")
      ? lede.children.map((n) => (n.t === "text" ? n.v : "")).join("")
      : null;

  return (
    <main className="a076" lang="ja">
      <article>
        {/* 表紙: 暗い部屋に、奥へ連なる額縁。いちばん奥だけが光っている */}
        <header className="a076-cover">
          <FrameTunnel />
          <div className="a076-cover__top">
            <nav aria-label="パンくず" className="a076-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>1LDK</span>
            </nav>
            {preview && (
              <p className="a076-preview" role="status">
                プレビュー(未公開)
              </p>
            )}
          </div>
          <div className="a076-cover__body">
            <h1 className="a076-title">
              <Phrased text={title} />
            </h1>
            <p className="a076-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={0} to={LEDE} unstyled className="a076-cover__link" />
          </div>
        </header>

        {/* 本文: 地は上から下へ少しずつ明るくなる(朝へ) */}
        <div className="a076-ground">
          <div className="a076-column">
            {/* 冒頭(曲の芯)。前にリリースの注記 */}
            <div className="a076-row">
              {firstRelease && (
                <aside className="a076-note">
                  <p className="a076-note__label">リリース</p>
                  <p>
                    <span className="a076-note__strong">{dotDate(firstRelease.releaseDate)}</span>
                    <br />
                    {formatLabel(firstRelease.format)}『{firstRelease.title}』
                  </p>
                </aside>
              )}
              {ledeText ? (
                <div className="a076-lede">
                  <p>
                    <Phrased text={ledeText} />
                  </p>
                </div>
              ) : (
                body(LEDE, LEDE + 1, "a076-lede")
              )}
            </div>

            {/* 歌詞の読み */}
            <div className="a076-group">{body(LYRICS, LIVE)}</div>

            {/* ライヴでの変化。松本公演の段落の前に、その日の公演の注記 */}
            <div className="a076-group">
              {body(LIVE, MATSUMOTO)}
              {live && (
                <aside className="a076-note a076-note--inline">
                  <p className="a076-note__label">この日の公演</p>
                  <p>
                    <span className="a076-note__strong">{dotDate(live.date)}</span> {live.place}
                    <br />
                    {live.liveTitle}
                    {live.liveItemName ? ` ${live.liveItemName}公演` : ""}
                    <br />
                    <Link
                      to={live.path}
                      onClick={() => trackEvent("article_live_page_click", { category: "navigation", label: id })}
                    >
                      公演ページへ
                    </Link>
                  </p>
                </aside>
              )}
              {body(MATSUMOTO, STORY)}
            </div>

            {/* 書き手の体験: 装飾を置かず、余白をとって静かに */}
            {body(STORY, CLOSING, "a076-text a076-story")}

            {/* 結び。最後の段落の前に、壁に並ぶ空の額(最後の1つだけが光っている) */}
            <div className="a076-last">
              {body(CLOSING, LAST)}
              <WallOfFrames />
              {body(LAST, blocks.length)}
            </div>
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a076-colophon">
            <dl className="a076-colophon__list">
              <div>
                <dt>曲</dt>
                <dd>1LDK</dd>
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
                    <span className="a076-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a076-next">
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
        </div>
      </article>
    </main>
  );
};

export default OneLdkDesign;
