/**
 * 誕生日企画の入口(/letters/。plan/64)。2026-11-08 に承認された birthday-h.html(handoff)を移したもの。
 * Happy Birthday, Reol → 今年の音楽 → 手紙企画の案内(2026-11-08、年表より前へ)→ この一年の年表(ライヴ 29 公演・作品の発売・MV の公開と、当時のポスト(X 公式の埋め込み))。
 * 作品と MV は scripts/build-letters-year-releases.ts、ライヴの関連ポストは scripts/merge-letters-live-posts.ts で作る。
 * ポストは要約せず、X 公式の埋め込み(iframe)をそのまま HTML に出す(親の JS は高さの追従だけ)。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import liveYear from "../../utils/letters/live-year.json";
import yearReleases from "../../utils/letters/year-releases.json";
import { BIRTHDAY_ICON_DEFS, BIRTHDAY_ICONS } from "./birthdayIcons";
import { ScrollTopButton } from "./ScrollTopButton";
import { LETTERS_COPY, LETTERS_DEADLINE_ISO, LETTERS_MEMORY_PERIOD_LABEL, LETTERS_TITLE } from "../../utils/letters/constants";

type LivePost = { id: string; url: string; author: string; posted_at: string; posted_date: string; kind: string };
type Live = { id: string; date: string; city: string; venue: string; title: string; kind: string; sources: string[]; posts: LivePost[] };

type Release = { id: string; date: string; title: string; format: string; link: string | null; video: { videoId: string; caption: string } | null; posts: LivePost[] };
type Mv = { id: string; videoId: string; song: string; date: string };

const LIVES = liveYear as Live[];
const RELEASES = (yearReleases as { releases: Release[] }).releases;
const MVS = (yearReleases as { mvs: Mv[] }).mvs;
const POST_COUNT = LIVES.reduce((n, l) => n + l.posts.length, 0) + RELEASES.reduce((n, r) => n + r.posts.length, 0);

/** 年表の 1 行。同じ日は 作品 → MV → ライヴ の順 */
type Entry = { kind: "release"; date: string; release: Release } | { kind: "mv"; date: string; mv: Mv } | { kind: "live"; date: string; live: Live; index: number };
const KIND_ORDER = { release: 0, mv: 1, live: 2 } as const;
const ENTRIES: Entry[] = [
  ...RELEASES.map((release) => ({ kind: "release" as const, date: release.date, release })),
  ...MVS.map((mv) => ({ kind: "mv" as const, date: mv.date, mv })),
  ...LIVES.map((live, index) => ({ kind: "live" as const, date: live.date, live, index })),
].sort((a, b) => a.date.localeCompare(b.date) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
const MONTH_NAMES = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
const pad2 = (n: number) => String(n).padStart(2, "0");

/** 月ごとにまとめる(日付の順。ライヴの番号は通し) */
const MONTHS = (() => {
  const out: { key: string; year: string; month: number; entries: Entry[] }[] = [];
  for (const e of ENTRIES) {
    const key = e.date.slice(0, 7);
    let m = out.find((x) => x.key === key);
    if (!m) {
      m = { key, year: key.slice(0, 4), month: Number(key.slice(5, 7)), entries: [] };
      out.push(m);
    }
    m.entries.push(e);
  }
  return out;
})();

/** 締切(日本時間)を「2026.12.20」「23:59」に。DB と同じ LETTERS_DEADLINE_ISO(その瞬間に締める)の 1 分前 */
const deadlineJst = (() => {
  const d = new Date(Date.parse(LETTERS_DEADLINE_ISO) - 60_000 + 9 * 3600_000);
  return { date: `${d.getUTCFullYear()}.${pad2(d.getUTCMonth() + 1)}.${pad2(d.getUTCDate())}`, time: `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}` };
})();

/** 公演情報のリンクは公式サイトのものだけ(このサイトの page-data などは出さない) */
const officialSource = (l: Live) => l.sources.find((u) => u.startsWith("https://reol.jp/")) ?? null;

const embedId = (post: LivePost, rowKey: string, postIndex: number) => `live-tweet-${post.id}-${rowKey}-${pad2(postIndex + 1)}`;
const embedSrc = (post: LivePost, id: string) =>
  `https://platform.twitter.com/embed/Tweet.html?id=${post.id}&dnt=true&lang=ja&theme=light&hideThread=true&embedId=${encodeURIComponent(id)}`;

export const BirthdayLanding: React.FC = () => {
  const livesRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  /** いま読んでいる月(上に付いてくる月のリンクで印をつける) */
  const [currentMonth, setCurrentMonth] = useState<string | null>(null);
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".bd .live-month"));
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const key = (e.target as HTMLElement).id.replace("live-month-", "");
          if (e.isIntersecting) visible.add(key);
          else visible.delete(key);
        }
        const first = sections.map((el) => el.id.replace("live-month-", "")).find((k) => visible.has(k)) ?? null;
        setCurrentMonth(first);
      },
      { rootMargin: "-80px 0px -55% 0px" }
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  // スマホでは、いまの月のリンクが見えるところまで横に送る
  useEffect(() => {
    const nav = navRef.current;
    const a = currentMonth && nav?.querySelector<HTMLElement>(`a[href="#live-month-${currentMonth}"]`);
    if (!nav || !a) return;
    const left = a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [currentMonth]);

  // X 公式の埋め込みが送ってくる高さに合わせる(送り元・枠・embedId・高さの範囲を確かめる)
  useEffect(() => {
    const section = livesRef.current;
    if (!section) return;
    const frames = new Map<string, HTMLIFrameElement>();
    section.querySelectorAll<HTMLIFrameElement>("iframe.live-tweet-frame[data-embed-id]").forEach((f) => frames.set(f.dataset.embedId ?? "", f));
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://platform.twitter.com") return;
      const payload = event.data && typeof event.data === "object" && (event.data as Record<string, unknown>)["twttr.embed"];
      if (!payload || typeof payload !== "object") return;
      const p = payload as { jsonrpc?: string; id?: unknown; method?: string; params?: unknown };
      if (p.jsonrpc !== "2.0" || typeof p.id !== "string") return;
      const frame = frames.get(p.id);
      if (!frame || event.source !== frame.contentWindow) return;
      if (p.method !== "twttr.private.resize") return;
      const details = Array.isArray(p.params) ? (p.params[0] as { height?: unknown } | undefined) : undefined;
      const height = details?.height;
      if (typeof height !== "number" || !Number.isFinite(height) || height < 80 || height > 5000) return;
      frame.style.height = `${Math.ceil(height)}px`;
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="bd" lang="ja">
      <svg className="icon-defs" width="0" height="0" aria-hidden focusable="false" dangerouslySetInnerHTML={{ __html: BIRTHDAY_ICON_DEFS }} />
      <div className="page">
        <header className="header">
          <Link className="brand" to="/" style={{ textDecoration: "none" }}>
            <b>!</b>Legit
          </Link>
          <div className="header-label">
            !Legit による
            <br />
            非公式バースデー企画
          </div>
        </header>
        <main>
          <section className="hero" aria-labelledby="birthday-title">
            <div className="hero-mineral" aria-hidden>
              <img className="hero-stone" src="/letters/oya-stone.jpg" alt="" decoding="async" />
            </div>
            <div className="hero-top">
              <span>Reol / 2026</span>
              <span className="date">NOVEMBER 09</span>
            </div>
            <div className="hero-title">
              <h1 id="birthday-title">
                <span>
                  <em>Happy</em>
                </span>
                <span>Birthday,</span>
                <span className="name">Reol</span>
              </h1>
              <span className="year-mark" aria-hidden>
                2026
              </span>
              <p className="hero-message">
                Reol、お誕生日おめでとう
                <br />
                愛と感謝を込めて
              </p>
            </div>
            <div className="memories" aria-label="2026年の音楽とライヴ">
              <a className="memory-album" href="https://reol.jp/discography/detail/50/" target="_blank" rel="noopener noreferrer">
                <div className="memory-meta">
                  <span>2026.01.21</span>
                  <span>4TH ALBUM</span>
                </div>
                <div className="jp">美辞学</div>
                <div className="en">Rhetorica</div>
              </a>
              <a className="memory-cocoon" href="https://reol.jp/news/detail/565" target="_blank" rel="noopener noreferrer">
                <span className="curve" aria-hidden />
                <div className="memory-meta">
                  <span>DIGITAL SINGLE</span>
                </div>
                <div className="title">COCOON</div>
                <div className="date">2026.07.11</div>
              </a>
              <a className="memories-link" href="#year-lives">
                <span>{LIVES.length} LIVE DATES</span>
                <span>
                  この一年を振り返る <b aria-hidden>↘</b>
                </span>
              </a>
            </div>
            <div className="hero-bottom">
              <span>
                NOVEMBER 09, 2026
                <br />
                リスナーのみんなで。
              </span>
              <a href="#project">
                お祝いの手紙を贈る <span aria-hidden>↓</span>
              </a>
            </div>
          </section>

          <div className="year-strip">
            <span>2026 / LISTENING NOTES</span>
            <span className="latest">
              11.06 FILM　『夜露死駆★少女』
              <br />
              劇中歌 <b>天井の街</b>
            </span>
          </div>

          <section className="intro">
            <div className="birthday-ornaments" aria-hidden>
              {BIRTHDAY_ICONS.map((id) => (
                <svg key={id} className="birthday-icon" viewBox="0 0 64 64" focusable="false">
                  <use href={`#birthday-${id}`} />
                </svg>
              ))}
            </div>
            <div className="eyebrow">NOVEMBER 09, 2026</div>
            <h2>
              今年の音楽も、
              <br />
              今年のライヴも。
            </h2>
            <p>
              『美辞学』を聴いた日、会場で過ごした時間。
              <br />
              それぞれの記憶と一緒に、
              <br />
              Reolの誕生日をお祝いしよう。
            </p>
            <p className="listener">Reolの誕生日を、リスナーのみんなで。</p>
          </section>

          <section className="project" id="project">
            <div className="project-label">BIRTHDAY PROJECT</div>
            <h2 aria-label={LETTERS_TITLE}>
              件名のない
              <br />
              ふくろう便
              <svg className="bd-owl" viewBox="0 0 48 52" aria-hidden focusable="false">
                <path d="M12 9 15 3 19 10C21 9 27 9 29 10L33 3 36 9C41 14 42 22 41 30 40 41 33 48 24 48 15 48 8 41 7 30 6 22 7 14 12 9Z" fill="#fffdf8" stroke="#576047" strokeWidth="1.4" strokeLinejoin="round" />
                <circle cx="17.5" cy="20" r="6" fill="#fff" stroke="#576047" strokeWidth="1.2" />
                <circle cx="30.5" cy="20" r="6" fill="#fff" stroke="#576047" strokeWidth="1.2" />
                <circle cx="18" cy="20.5" r="2.4" fill="#2d3932" />
                <circle cx="30" cy="20.5" r="2.4" fill="#2d3932" />
                <path d="M22 25.5 24 29 26 25.5Z" fill="#c9a55a" />
                <path d="M14 31C17 34 19 37 19 42M34 31C31 34 29 37 29 42" fill="none" stroke="#919b89" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M21 35.5c1 .8 2 .8 3 0 1 .8 2 .8 3 0M20 39.5c1.2.8 2.6.8 4 0 1.4.8 2.8.8 4 0" fill="none" stroke="#c9ccbd" strokeWidth="1" strokeLinecap="round" />
                <path d="M19 48v2.5M22 48v2.5M26 48v2.5M29 48v2.5" stroke="#95753e" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </h2>
            <div className="project-body">
              <p className="copy">
                {LETTERS_COPY.split("、").map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <>
                        、<br />
                      </>
                    )}
                  </React.Fragment>
                ))}
              </p>
              <div className="letter-period">
                <span>思い出の期間</span>
                <b>{LETTERS_MEMORY_PERIOD_LABEL}</b>
              </div>
              <p className="detail">
                去年の誕生日から、今年の誕生日の前日まで。
                <br />
                この一年に聴いた音楽、心に残ったライヴ、忘れられない言葉。それぞれの思い出と一緒に、Reolへお祝いの手紙を書こう。
                <br />
                <br />
                集まった手紙は一冊のファンレターブックにまとめて、年内の発送を目指すよ。
              </p>
            </div>
            <div className="deadline">
              <span className="deadline-label">メッセージ受付締切</span>
              <span className="deadline-value">
                {deadlineJst.date}
                <small>{deadlineJst.time}まで ／ 日本時間</small>
              </span>
            </div>
            <div className="actions">
              <a className="action primary" href="/letters/write/" target="_blank" rel="noopener" aria-label="お祝いの手紙を書く(別のタブで開きます)">
                <span>お祝いの手紙を書く</span>
                <span aria-hidden>↗</span>
              </a>
              <Link className="action" to="/letters/read/">
                <span>届いた手紙を読む</span>
                <span aria-hidden>↗</span>
              </Link>
            </div>
          </section>

          <section className="year-lives" id="year-lives" aria-labelledby="year-lives-title" ref={livesRef}>
            <header className="live-section-header">
              <p className="live-section-eyebrow">2025.11.09 — 2026.11.08</p>
              <h2 id="year-lives-title">
                あの日の音楽、
                <br />
                その日の言葉。
              </h2>
              <p className="live-section-copy">
                去年の誕生日から、今年の誕生日へ。
                <br />
                あの日のポストと一緒に、ライヴと新しい音楽の記憶をたどろう。
              </p>
              <div className="live-section-meta">
                <span>
                  {LIVES.length}公演 <span aria-hidden>／</span> {RELEASES.length}作品 <span aria-hidden>／</span> MV {MVS.length}本 <span aria-hidden>／</span> {POST_COUNT}ポスト
                </span>
                <a href="/letters/write/" target="_blank" rel="noopener">
                  お祝いの手紙を書く <span aria-hidden>↗</span>
                </a>
              </div>
            </header>
            <nav className="live-month-nav" aria-label="月から探す" ref={navRef}>
              {MONTHS.map((m) => (
                <a key={m.key} href={`#live-month-${m.key}`} className={currentMonth === m.key ? "is-current" : undefined} aria-current={currentMonth === m.key ? "true" : undefined}>
                  {m.key.replace("-", ".")}
                </a>
              ))}
            </nav>
            <div className="live-months">
              {MONTHS.map((m) => (
                <section key={m.key} className="live-month" id={`live-month-${m.key}`} aria-labelledby={`live-month-title-${m.key}`}>
                  <h3 id={`live-month-title-${m.key}`}>
                    <span>{m.year}</span> {MONTH_NAMES[m.month - 1]}
                  </h3>
                  <ol className="live-event-list">
                    {m.entries.map((e) => {
                      if (e.kind === "release") {
                        const r = e.release;
                        return (
                          <li key={r.id} className="live-entry is-release" id={r.id}>
                            <div className="live-entry-heading">
                              <div className="live-entry-number">RELEASE</div>
                              <time className="live-entry-date" dateTime={r.date}>
                                {r.date.slice(5).replace("-", ".")}
                              </time>
                              <h4>{r.title}</h4>
                              <p className="live-entry-title">{r.format}</p>
                              {r.link && (
                                <a className="live-entry-source" href={r.link} target="_blank" rel="noopener noreferrer">
                                  作品情報 <span aria-hidden>↗</span>
                                </a>
                              )}
                              {r.video && (
                                <a className="live-entry-source" href={`https://www.youtube.com/watch?v=${r.video.videoId}`} target="_blank" rel="noopener noreferrer">
                                  YouTubeで見る <span aria-hidden>↗</span>
                                </a>
                              )}
                            </div>
                            {r.video && (
                              <div className="live-posts-block">
                                <MvPlayer videoId={r.video.videoId} title={r.title} />
                                <p className="live-posts-count" style={{ marginTop: 8 }}>
                                  {r.video.caption}
                                </p>
                              </div>
                            )}
                            {r.posts.length > 0 && <PostsRow posts={r.posts} rowKey={r.id.slice(-8)} label={`${r.title}の関連ポスト`} />}
                          </li>
                        );
                      }
                      if (e.kind === "mv") {
                        const mv = e.mv;
                        return (
                          <li key={mv.id} className="live-entry is-mv" id={mv.id}>
                            <div className="live-entry-heading">
                              <div className="live-entry-number">MUSIC VIDEO</div>
                              <time className="live-entry-date" dateTime={mv.date}>
                                {mv.date.slice(5).replace("-", ".")}
                              </time>
                              <h4>{mv.song}</h4>
                              <p className="live-entry-title">MV公開</p>
                              <a className="live-entry-source" href={`https://www.youtube.com/watch?v=${mv.videoId}`} target="_blank" rel="noopener noreferrer">
                                YouTubeで見る <span aria-hidden>↗</span>
                              </a>
                            </div>
                            <div className="live-posts-block">
                              <MvPlayer videoId={mv.videoId} title={mv.song} />
                            </div>
                          </li>
                        );
                      }
                      const { live, index } = e;
                      const source = officialSource(live);
                      return (
                        <li key={live.id} className="live-entry" id={`live-${live.date}-${pad2(index + 1)}`}>
                          <div className="live-entry-heading">
                            <div className="live-entry-number">
                              LIVE {pad2(index + 1)} <span aria-hidden>／</span> {LIVES.length}
                            </div>
                            <time className="live-entry-date" dateTime={live.date}>
                              {live.date.slice(5).replace("-", ".")}
                            </time>
                            <h4>{live.city}</h4>
                            <p className="live-entry-title">{live.title}</p>
                            <p className="live-entry-venue">{live.venue}</p>
                            {source && (
                              <a className="live-entry-source" href={source} target="_blank" rel="noopener noreferrer">
                                公演情報 <span aria-hidden>↗</span>
                              </a>
                            )}
                          </div>
                          <PostsRow posts={live.posts} rowKey={pad2(index + 1)} label={`${live.date} ${live.city}の関連ポスト`} />
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
            <div className="live-section-end">
              <a href="#year-lives">
                一年のはじめへ <span aria-hidden>↑</span>
              </a>
              <a href="/letters/write/" target="_blank" rel="noopener">
                お祝いの手紙を書く <span aria-hidden>↗</span>
              </a>
            </div>
          </section>

        </main>
        <footer className="foot">
          <p>
            !Legit による非公式のファン企画です。
            <br />
            Reol本人および所属事務所とは関係ありません。
          </p>
          <p className="credits">
            Oya stone:{" "}
            <a href="https://commons.wikimedia.org/wiki/File:Tuff_ohyaishi01.jpg" target="_blank" rel="noopener noreferrer">
              Miya.m / Wikimedia Commons
            </a>{" "}
            ／{" "}
            <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">
              CC BY-SA 3.0
            </a>
            <br />
            大谷石の写真は上記ライセンスで提供。表示時にトリミング・色調調整
          </p>
          <p className="sources">
            <a href="https://reol.jp/discography/detail/50/" target="_blank" rel="noopener noreferrer">
              美辞学
            </a>
            <a href="https://reol.jp/feature/bijigaku" target="_blank" rel="noopener noreferrer">
              2026 TOUR
            </a>
            <a href="https://reol.jp/news/list/1/5/?range=past&sort=desc" target="_blank" rel="noopener noreferrer">
              出演履歴
            </a>
            <Link to="/live/">ライヴ記録・関連ポスト</Link>
            <a href="https://reol.jp/news/detail/565" target="_blank" rel="noopener noreferrer">
              COCOON
            </a>
            <a href="https://reol.jp/news/detail/585" target="_blank" rel="noopener noreferrer">
              天井の街
            </a>
            <a href="https://otanjoubi.jp/select.php?month=11&day=09" target="_blank" rel="noopener noreferrer">
              誕生モチーフの参考
            </a>
          </p>
          <p className="sources">
            <Link to="/letters/edit/">書いた手紙を直す・取り下げる</Link>
            <Link to="/privacy/">プライバシーポリシー</Link>
          </p>
        </footer>
      </div>
      <ScrollTopButton className="bd-totop" hideWhileVisible="#project .actions" />
    </div>
  );
};

/** 当時のポストの横並び(X 公式の埋め込み。要約に置き換えない) */
const PostsRow: React.FC<{ posts: LivePost[]; rowKey: string; label: string }> = ({ posts, rowKey, label }) => (
  <div className="live-posts-block">
    <p className="live-posts-count">
      この日の関連ポスト <span>{posts.length}</span>
    </p>
    <div className="live-posts" role="list" aria-label={label} tabIndex={0}>
      {posts.map((post, pi) => {
        const id = embedId(post, rowKey, pi);
        return (
          <article key={post.id} className="live-post-card" role="listitem" data-tweet-id={post.id} data-post-url={post.url}>
            <iframe
              className="live-tweet-frame"
              id={id}
              data-embed-id={id}
              src={embedSrc(post, id)}
              title={`Xのポスト（${post.author} ${post.posted_date}）`}
              width={330}
              height={560}
              loading="lazy"
              scrolling="auto"
              frameBorder={0}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
            <a className="live-post-link" href={post.url} target="_blank" rel="noopener noreferrer">
              Xで開く <span aria-hidden>↗</span>
            </a>
          </article>
        );
      })}
    </div>
  </div>
);

/** MV は押した時に YouTube を読み込む(サイトのほかの所と同じ。それまでは YouTube のサムネイルだけ) */
const MvPlayer: React.FC<{ videoId: string; title: string }> = ({ videoId, title }) => {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="bd-mv">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1`}
          title={`${title}(YouTube)`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          frameBorder={0}
        />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`${title}の映像を再生する(YouTubeを読み込みます)`}>
          <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
          <span className="bd-mv-play" aria-hidden />
        </button>
      )}
    </div>
  );
};
