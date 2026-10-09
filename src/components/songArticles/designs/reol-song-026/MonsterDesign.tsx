/**
 * 楽曲記事「MONSTER」(reol-song-026)の記事別デザイン。設計の根拠は plan/32。
 *
 * - 怪物を「内側から湧き上がり、膨らみ続ける黒い積乱雲」として描く(2025年のライブで後ろに映る、黒く速く進む積乱雲とカラスから。
 *   ユーザー指摘 2026-10-09)。ライブ映像は複製しない。カラスはオリジナルの図形。
 * - 表紙: 実際の積乱雲の写真(CC0。Wikimedia Commons「Amassed」Nicholas A. Tonelli、2015-08-24)を記事の色に作り替えたもの。
 *   空は舞台の照明の深い青、雲の本体は黒、光を受けた塔だけが赤(ライブ映像で雲が赤に変わる一瞬)。題名は空の側に白で大きく。
 *   冒頭の公式配信音源はジャケットが正方形なので、正方形に切り抜いて見せる。
 * - 本文の地は嵐の前の明るい灰色。第2段落と第3段落の間をカラスの群れが横切る。
 * - 結び(第4段落)で嵐が追いつく: 表紙と同じ積乱雲(空を透明にした切り抜き)が明るい地へ下から湧き上がり、
 *   結び・参照資料・奥付は雲の中(暗い地に明るい文字)で読む。
 * - 注記と奥付は、サイトの確認済みデータだけ(収録作、作詞・作曲、2025-02-02 の公演、演奏記録)。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./monster.css";

// 段落の位置(designManifest.ts の anchors と対応)
const LEDE = 1; // 怪物は「僕ら」(一言)
const ORIGIN = 2; // 収録作・作家(収録作の注記)
const BITE = 3; // 不安が足に噛み付く(この前をカラスの群れが横切る)
const LAST = 4; // 結び(嵐が追いつく)

// サイトの discography データで MONSTER に登録されているライブ映像(liveVideoUrl)
const LIVE_VIDEO_URL = "https://youtu.be/Zovrx5rpj5I";

/** カラス(オリジナルの単純な影絵)。左へ飛ぶ */
const Crow: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg className={`a026-crow${className ? ` ${className}` : ""}`} style={style} viewBox="0 0 100 56" aria-hidden="true">
    <path d="M22 30 C26 26 30 25 34 26 C38 18 46 9 58 4 L56 10 L64 6 L60 13 L70 10 L64 17 L75 16 C66 21 58 25 52 30 C60 31 70 34 82 40 L72 40 L78 46 C68 44 58 40 50 38 C46 40 40 41 34 39 L26 44 L28 37 C25 35 22 33 18 33 Z" />
  </svg>
);

const Note: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <aside className="a026-note">
    <p className="a026-note__label">{label}</p>
    <div className="a026-note__body">{children}</div>
  </aside>
);

const MonsterDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, liveRefs, createdAt, updatedAt, preview } = ctx;

  // H1 の文言はそのまま。最初の空白で「MONSTER」と副題の2行に組む(文字は変えない)
  const sp = title.indexOf(" ");
  const titleHead = sp > 0 ? title.slice(0, sp) : title;
  const titleRest = sp > 0 ? title.slice(sp + 1) : "";
  const firstRelease = songFacts.releases[0] ?? null;
  const live = liveRefs[0] ?? null;
  const stats = songFacts.stats;
  // 結びはテキストだけの段落なら、最後の6文字を途中で折り返さない一まとまりにして描く(最終行が2文字だけになるのを避ける。
  // 文言は変えない。2026-10-10 ユーザー指摘)。テキスト以外を含む場合は共通の描画に任せる
  const lastBlock = blocks[LAST];
  const lastText =
    lastBlock?.t === "p" && lastBlock.children.every((n) => n.t === "text")
      ? lastBlock.children.map((n) => (n.t === "text" ? n.v : "")).join("")
      : null;
  const KEEP = 6;

  const notes: Record<number, React.ReactNode> = {};
  if (songFacts.releases.length > 0) {
    notes[ORIGIN] = (
      <Note label="収録">
        {songFacts.releases.map((r) => (
          <p key={r.title}>
            <span className="a026-note__strong">{dotDate(r.releaseDate)}</span>
            <br />
            {formatLabel(r.format)}『{r.title}』
          </p>
        ))}
      </Note>
    );
  }

  /** 本文の段落。注記があれば本文の右の列(スマートフォンでは段落の前)に添える */
  const paragraph = (i: number, extra = "") => (
    <div key={i} className={`a026-row${extra}`}>
      <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={i} to={i + 1} unstyled className="a026-row__text" />
      {notes[i]}
    </div>
  );

  return (
    <main className="a026" lang="ja">
      <article>
        {/* 表紙: 深い青の空に、黒く湧き上がり、塔だけが赤く光る積乱雲(写真は CSS の背景) */}
        <header className="a026-cover">
          <div className="a026-cover__light" aria-hidden="true" />
          <div className="a026-cover__crows" aria-hidden="true">
            <Crow className="a026-crow--c1" />
            <Crow className="a026-crow--c2" />
            <Crow className="a026-crow--c3" />
          </div>
          <div className="a026-cover__top">
            <nav aria-label="パンくず" className="a026-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>MONSTER</span>
            </nav>
            {preview && (
              <p className="a026-preview" role="status">
                プレビュー(未公開)
              </p>
            )}
          </div>
          <div className="a026-cover__body">
            <div className="a026-cover__title">
              <h1 className="a026-title">
                <span className="a026-title__head">{titleHead}</span>
                {titleRest && (
                  <>
                    {" "}
                    <span className="a026-title__rest">{titleRest}</span>
                  </>
                )}
              </h1>
              <p className="a026-date">
                <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
              </p>
            </div>
            <div className="a026-cover__media">
              <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={0} to={LEDE} unstyled mediaFormat="square" />
            </div>
          </div>
        </header>

        {/* 嵐の前の明るい地 */}
        <div className="a026-ground">
          <section className="a026-section">
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={LEDE} to={LEDE + 1} unstyled className="a026-lede" />
            {paragraph(ORIGIN)}
          </section>

          {/* カラスの群れが横切る(止まれずに進む) */}
          <div className="a026-flock" aria-hidden="true">
            {[
              // [左 %, 上 %, 幅 px]。手前(大きい)から奥(小さい)まで混ぜ、右上へ抜けていく群れ
              [4, 46, 84], [16, 22, 40], [24, 62, 30], [31, 30, 58], [41, 56, 26], [47, 12, 36],
              [55, 40, 48], [63, 66, 22], [70, 20, 30], [77, 48, 38], [85, 10, 20], [91, 34, 26],
            ].map(([x, y, w], i) => (
              <Crow key={i} style={{ left: `${x}%`, top: `${y}%`, width: `${w}px` }} />
            ))}
          </div>

          <section className="a026-section">{paragraph(BITE)}</section>
        </div>

        {/* 結び: 嵐が追いつく。雲の中(暗い地)で結び・参照資料・奥付を読む */}
        <div className="a026-storm">
          {/* 結びの上端: 表紙と同じ積乱雲(空を透明にした切り抜き)が、明るい地へ下から湧き上がる */}
          <div className="a026-storm__rise" aria-hidden="true" />
          <section className="a026-section a026-section--last">
            {lastText && lastText.length > KEEP ? (
              <div className="a026-last">
                <p>
                  {lastText.slice(0, -KEEP)}
                  <span className="a026-nobreak">{lastText.slice(-KEEP)}</span>
                </p>
              </div>
            ) : (
              <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={LAST} to={LAST + 1} unstyled className="a026-last" />
            )}
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={LAST + 1} to={blocks.length} unstyled className="a026-refs" />
          </section>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a026-colophon">
            <dl className="a026-colophon__list">
              <div>
                <dt>曲</dt>
                <dd>MONSTER</dd>
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
                    <span className="a026-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
              {live && (
                <div>
                  <dt>ライブ</dt>
                  <dd>
                    {dotDate(live.date)} {live.liveTitle}
                    {live.place && <>({live.place})</>}
                    <span className="a026-colophon__links">
                      <Link
                        to={live.path}
                        onClick={() => trackEvent("article_live_page_click", { category: "navigation", label: id })}
                      >
                        公演ページへ
                      </Link>
                      <a
                        href={LIVE_VIDEO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackEvent("article_live_video_click", { category: "engagement", label: id })}
                      >
                        ライブ映像(YouTube)
                      </a>
                    </span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a026-next">
              {songPages.map((p) => (
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

export default MonsterDesign;
