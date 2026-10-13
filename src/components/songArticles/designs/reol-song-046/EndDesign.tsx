/**
 * 楽曲記事「エンド」(reol-song-046)の記事別デザイン。設計の根拠は plan/40。
 *
 * - 主役は「終止符」(黒い丸)。表紙は曇った灰色の海の水平線に、大きな黒い丸が一つ沈んでいる。
 * - 紙面は色を抜いた灰色の地に墨の文字。結びの節だけ、地が『虚構集』の淡い氷の色へ明るくなる。
 * - エンドレスからエンドへの節(段落12の後): 文字の図。「エンドレス」の「エンド」の直後に終止符が打たれ、その先の「レス」が薄れて切り離される。
 * - 自分自身の葬式の節: 節全体を黒枠(訃報の黒い縁取り)で囲む。
 * - 届かない電話の節(段落60の後): かける側の点から点線が伸びるが、相手の点に届く前に途切れる。
 * - 結び(最後の段落の後): 表紙の黒い丸が、淡い光の輪(繭)に包まれて置かれる。
 * - 公式MVは表紙の下にクリックで読み込む形。Spotify のリンクは本文のまま札に。
 * - 歌詞は本文の外に出さない。MV の画面・十字架・棺は描かない。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleDate from "../../ArticleDate";
import ArticleBody from "../../ArticleBody";
import OfficialMedia from "../../OfficialMedia";
import { dotDate, formatLabel } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./end.css";

// 段落の位置(designManifest.ts の anchors と対応)
const SPOTIFY = 1;
const INTRO = 2;
const S_ENDLESS = 9;
const ENDLESS_FIG = 13; // 段落12「永遠を願った…終止符を打つ「エンド」へ。」の後
const S_HATE = 18;
const S_OK = 32;
const S_FUNERAL = 44;
const S_PHONE = 57;
const PHONE_FIG = 61; // 段落60(通話できないことを示す音で終わる)の後
const S_SOMEDAY = 68;

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

/** 表紙の絵: 曇った灰色の空と海。水平線に大きな黒い丸(終止符)が半分沈み、海に銀色の光の筋。装飾なので読み上げ対象外 */
const CoverSea: React.FC = () => (
  <svg className="a046-cover__art" viewBox="0 0 1200 760" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="a046-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5d6168" />
        <stop offset="1" stopColor="#a9adb2" />
      </linearGradient>
      <linearGradient id="a046-sea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7d8288" />
        <stop offset="1" stopColor="#3e4247" />
      </linearGradient>
      <filter id="a046-soft" x="-30%" y="-200%" width="160%" height="500%">
        <feGaussianBlur stdDeviation="22" />
      </filter>
      <clipPath id="a046-above-sea">
        <rect x="0" y="0" width="1200" height="520" />
      </clipPath>
    </defs>
    <rect x="0" y="0" width="1200" height="520" fill="url(#a046-sky)" />
    <rect x="0" y="520" width="1200" height="240" fill="url(#a046-sea)" />
    {/* 雲の帯(ぼんやりした明暗) */}
    <g filter="url(#a046-soft)">
      <ellipse cx="300" cy="160" rx="420" ry="40" className="a046-cloud" />
      <ellipse cx="900" cy="250" rx="380" ry="34" className="a046-cloud" />
      <ellipse cx="620" cy="400" rx="520" ry="26" className="a046-cloud a046-cloud--low" />
    </g>
    {/* 終止符: 水平線に半分沈む黒い丸 */}
    <circle cx="860" cy="520" r="92" className="a046-dot" clipPath="url(#a046-above-sea)" />
    {/* 海の銀色の光の筋 */}
    {Array.from({ length: 9 }, (_, i) => {
      const y = 540 + i * 22;
      const w = 220 - i * 18;
      return <line key={i} x1={860 - w / 2} y1={y} x2={860 + w / 2} y2={y} className="a046-glint" style={{ opacity: 0.55 - i * 0.05 }} />;
    })}
    <line x1="0" y1="520" x2="1200" y2="520" className="a046-horizon" />
  </svg>
);

/** 文字の図「エンドレス → エンド。」: 「レス」が薄れて消え、句点が打たれる */
const EndlessToEnd: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a046-endless${className}`} aria-hidden="true">
      <span className="a046-endless__word">
        {/* 「エンド」の直後に終止符を打ち、その先の「レス」は薄れて切り離される */}
        エンド
        <span className="a046-endless__stop" />
        <span className="a046-endless__less">レス</span>
      </span>
    </div>
  );
};

/** 届かない電話: かける側の点から点線が伸びるが、相手の点に届く前に途切れる */
const UnreachedCall: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a046-call${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 80">
        <circle cx="40" cy="40" r="11" className="a046-call__me" />
        <line x1="62" y1="40" x2="430" y2="40" className="a046-call__line" pathLength={1} />
        <circle cx="560" cy="40" r="11" className="a046-call__you" />
      </svg>
    </div>
  );
};

/** 結び: 表紙の終止符が、淡い光の輪(繭)に包まれて置かれる */
const Cocoon: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a046-cocoon${className}`} aria-hidden="true">
      <svg viewBox="0 0 200 200">
        <defs>
          <radialGradient id="a046-cocoon-light">
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="0.4" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* 輪郭線は描かない(目玉のように見えるため)。淡い光だけで包む */}
        <circle cx="100" cy="100" r="96" fill="url(#a046-cocoon-light)" className="a046-cocoon__light" />
        <circle cx="100" cy="100" r="14" className="a046-dot" />
      </svg>
    </div>
  );
};

const EndDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const firstRelease = songFacts.releases[0] ?? null;
  const stats = songFacts.stats;
  const body = (from: number, to: number, className = "a046-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「Reol「エンド」　愛した過去に打つ終止符」: 「エンド」を大きく、副題を下に(文言は変えない)
  const m = title.match(/^(.*?)「(.+?)」\s*(.*)$/);
  const tPre = m ? m[1].trim() : "";
  const tSong = m ? m[2] : title;
  const tSub = m ? m[3].trim() : "";

  return (
    <main className="a046" lang="ja">
      <article>
        {/* 表紙: 曇った海の水平線に、終止符の黒い丸 */}
        <header className="a046-cover" data-og-cover>
          <CoverSea />
          <div className="a046-cover__top">
            <nav aria-label="パンくず" className="a046-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>エンド</span>
            </nav>
          </div>
          <div className="a046-cover__body">
            <h1 className="a046-title">
              {m ? (
                <>
                  {tPre && <span className="a046-title__pre">{tPre}</span>}
                  <span className="a046-title__song">
                    <span className="a046-title__q">「</span>
                    {tSong}
                    <span className="a046-title__q">」</span>
                  </span>
                  {tSub && <span className="a046-title__sub">{tSub}</span>}
                </>
              ) : (
                <span className="a046-title__song">{title}</span>
              )}
            </h1>
            <p className="a046-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
          </div>
        </header>

        <div className="a046-ground">
          <div className="a046-column">
            {/* 公式MV(登録済み)。クリックした時だけ読み込む */}
            {leadMedia ? (
              <figure className="a046-video">
                <figcaption className="a046-video__label">MUSIC VIDEO</figcaption>
                <OfficialMedia videoId={leadMedia.videoId} href={leadMedia.href} text={leadMedia.text} articleId={id} unstyled preferHighRes />
              </figure>
            ) : (
              body(0, SPOTIFY)
            )}
            {body(SPOTIFY, INTRO, "a046-text a046-listen")}

            {/* 冒頭。前にリリースの注記 */}
            <div className="a046-section">
              {firstRelease && (
                <aside className="a046-note">
                  <p className="a046-note__label">リリース</p>
                  <p>
                    <span className="a046-note__strong">{dotDate(firstRelease.releaseDate)}</span> {formatLabel(firstRelease.format)}『
                    {firstRelease.title}』
                  </p>
                </aside>
              )}
              {body(INTRO, S_ENDLESS, "a046-text a046-intro")}
            </div>

            {/* エンドレスからエンドへ。段落12の後に文字の図 */}
            <section className="a046-section">
              {body(S_ENDLESS, ENDLESS_FIG)}
              <EndlessToEnd />
              {body(ENDLESS_FIG, S_HATE)}
            </section>

            <section className="a046-section">{body(S_HATE, S_OK)}</section>
            <section className="a046-section">{body(S_OK, S_FUNERAL)}</section>

            {/* 自分自身の葬式: 節全体を黒枠で囲む */}
            <section className="a046-section a046-funeral">{body(S_FUNERAL, S_PHONE)}</section>

            {/* 届かない電話。段落60の後に、届かない点線 */}
            <section className="a046-section">
              {body(S_PHONE, PHONE_FIG)}
              <UnreachedCall />
              {body(PHONE_FIG, S_SOMEDAY)}
            </section>
          </div>

          {/* 結び: 地が淡い氷の色へ明るくなり、最後に繭に包まれた終止符 */}
          <div className="a046-last">
            <div className="a046-column">
              <section className="a046-section a046-section--last">{body(S_SOMEDAY, blocks.length, "a046-text a046-closing")}</section>
              <Cocoon />
            </div>
          </div>

          {/* 奥付。サイトの確認済みデータだけ */}
          <footer className="a046-colophon">
            <dl className="a046-colophon__list">
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
                    <span className="a046-colophon__src">!Legit のセットリスト記録より</span>
                  </dd>
                </div>
              )}
            </dl>
            <ul className="a046-next">
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

export default EndDesign;
