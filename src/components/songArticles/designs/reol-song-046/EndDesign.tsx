/**
 * 楽曲記事「エンド」(reol-song-046)の記事別デザイン。設計の根拠は plan/40。
 *
 * - 主役は「終止符」(黒い丸)。表紙は曇った灰色の海の水平線に、大きな黒い丸が一つ沈んでいる。
 * - 紙面は色を抜いた灰色の地に墨の文字。結びの節だけ、地が『虚構集』の淡い氷の色へ明るくなる。
 * - エンドレスからエンドへの節(段落12の後): 文字の図。「エンドレス」の「エンド」の直後に終止符が打たれ、その先の「レス」が薄れて切り離される。
 * - 自分自身の葬式の節: 節全体を黒枠(訃報の黒い縁取り)で囲む。
 * - 届かない電話の節(段落60の後): かける側の点から点線が伸びるが、相手の点に届く前に途切れる。
 * - 君が大嫌いの節(段落26の後): 本文の「相手」と「自分」の間を黒い点が行き来し、どちらにも止まらず真ん中で止まる(嫌っているのはどちらか決められない)。
 * - 大丈夫ではないまま歌うの節の終わり: 線に終止符が打たれ、その先に細い点線が続く(歌うことで終わらないものを残す)。
 * - 葬式の節(段落50の後): 黒枠の中に、白いカーネーションの献花(MV は十字架のある葬式で、白い花束が置かれる)。花びらが開く。
 * - 結びの節(段落72の後): 届かない電話と対になる図。線が最後まで伸びて黒い点に届き、淡い光に包まれる。
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
const UNDECIDED_FIG = 27; // 段落26(嫌っているのは本当に相手なのか)の後
const S_OK = 32;
const S_FUNERAL = 44; // 段落43(歌うことで終わらないものを残す)の後に、終止符の先へ続く点線
const FLOWER_FIG = 51; // 段落50(見送ることでもある)の後に献花
const S_PHONE = 57;
const PHONE_FIG = 61; // 段落60(通話できないことを示す音で終わる)の後
const S_SOMEDAY = 68;
const REACH_FIG = 73; // 段落72(今は愛を受け取ることを歌っている)の後に、届く線

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

/** 決められない(君が大嫌いの節): 本文の「相手」と「自分」の間を、黒い点が行き来して、どちらにも止まらず真ん中で止まる */
const Undecided: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a046-undecided${className}`} aria-hidden="true">
      <span className="a046-undecided__word">相手</span>
      <span className="a046-undecided__track">
        <span className="a046-undecided__dot" />
      </span>
      <span className="a046-undecided__word">自分</span>
    </div>
  );
};

/** 終止符の先へ続く点線(大丈夫ではないまま歌うの節の終わり): 線に終止符が打たれても、その先に細い点線が続く */
const BeyondTheStop: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a046-beyond${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 60">
        <defs>
          <linearGradient id="a046-beyond-fade" gradientUnits="userSpaceOnUse" x1="372" y1="0" x2="590" y2="0">
            <stop offset="0" stopColor="#17181b" stopOpacity="0.8" />
            <stop offset="1" stopColor="#17181b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="20" y1="30" x2="330" y2="30" className="a046-beyond__line" pathLength={1} />
        <circle cx="348" cy="30" r="9" className="a046-dot a046-beyond__stop" />
        <line x1="372" y1="30" x2="590" y2="30" stroke="url(#a046-beyond-fade)" className="a046-beyond__after" />
      </svg>
    </div>
  );
};

/** カーネーションの花びらの層: 中心(80, 86)から扇形に、縁をぎざぎざにした形 */
function frill(r: number, from: number, to: number, teeth: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= teeth * 2; i++) {
    const t = (from + ((to - from) * i) / (teeth * 2)) * (Math.PI / 180);
    const rr = i % 2 === 0 ? r : r - 7;
    pts.push(`${(80 + rr * Math.cos(t)).toFixed(1)},${(86 + rr * Math.sin(t)).toFixed(1)}`);
  }
  return `M80,90 L${pts.join(" L")} Z`;
}

/** 献花(葬式の節): 白いカーネーションを一輪。画面に入ると、萼(がく)から花びらが開く */
const Flower: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  const layers = [frill(50, -178, -2, 15), frill(42, -165, -15, 12), frill(32, -150, -30, 9)];
  return (
    <div ref={ref} className={`a046-flower${className}`} aria-hidden="true">
      <svg viewBox="0 0 160 220">
        <path d="M80,110 C78,150 84,184 80,216" className="a046-flower__stem" />
        <path d="M80,168 C94,156 110,156 118,162 C108,172 92,174 80,168 Z" className="a046-flower__leaf" />
        {layers.map((d, i) => (
          <path key={i} d={d} className="a046-flower__petal" style={{ transitionDelay: `${0.25 * i}s` }} />
        ))}
        <path d="M73,114 L71,90 Q80,85 89,90 L87,114 Z" className="a046-flower__calyx" />
      </svg>
    </div>
  );
};

/** 届く線(結びの節): 届かない電話と対になる図。線が最後まで伸びて黒い点に届き、黒い点が淡い光に包まれる */
const Reaching: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLDivElement>(0.6);
  return (
    <div ref={ref} className={`a046-reach${className}`} aria-hidden="true">
      <svg viewBox="0 0 600 100">
        <defs>
          <radialGradient id="a046-reach-light">
            <stop offset="0" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="560" cy="50" r="60" fill="url(#a046-reach-light)" className="a046-reach__light" />
        <circle cx="40" cy="50" r="9" className="a046-reach__from" />
        <line x1="58" y1="50" x2="538" y2="50" className="a046-reach__line" pathLength={1} />
        <circle cx="560" cy="50" r="12" className="a046-dot" />
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
  // 題名「エンド　愛した過去に打つ終止符」(旧: 「Reol「エンド」　…」): 「エンド」を大きく、副題を下に(文言は変えない)。
  // 「Reol「」」付きの旧い題名でも組めるようにしておく(括弧がある時だけ括弧を添える)
  const SONG = "エンド";
  const quoted = title.match(/^(.*?)「(.+?)」\s*(.*)$/);
  const m = quoted
    ? { pre: quoted[1].trim(), song: quoted[2], sub: quoted[3].trim(), q: true }
    : title.startsWith(SONG)
      ? { pre: "", song: SONG, sub: title.slice(SONG.length).trim(), q: false }
      : null;
  const tPre = m ? m.pre : "";
  const tSong = m ? m.song : title;
  const tSub = m ? m.sub : "";

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
                    {m.q && <span className="a046-title__q">「</span>}
                    {tSong}
                    {m.q && <span className="a046-title__q">」</span>}
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

            {/* 君が大嫌い。嫌っているのは本当に相手なのか自分なのか、の段落の後に、どちらにも決められない点 */}
            <section className="a046-section">
              {body(S_HATE, UNDECIDED_FIG)}
              <Undecided />
              {body(UNDECIDED_FIG, S_OK)}
            </section>

            {/* 大丈夫ではないまま歌う。節の終わりに、終止符の先へ続く点線 */}
            <section className="a046-section">
              {body(S_OK, S_FUNERAL)}
              <BeyondTheStop />
            </section>

            {/* 自分自身の葬式: 節全体を黒枠で囲む。見送ることでもある、の段落の後に献花 */}
            <section className="a046-section a046-funeral">
              {body(S_FUNERAL, FLOWER_FIG)}
              <Flower />
              {body(FLOWER_FIG, S_PHONE)}
            </section>

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
              <section className="a046-section a046-section--last">
                {body(S_SOMEDAY, REACH_FIG)}
                <Reaching />
                {body(REACH_FIG, blocks.length, "a046-text a046-closing")}
              </section>
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
