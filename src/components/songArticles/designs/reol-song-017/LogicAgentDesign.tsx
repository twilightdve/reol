/**
 * 楽曲記事「ロジックエージェント」(reol-song-017)の記事別デザイン。設計の根拠は plan/61。
 *
 * - 主役は「同じ声が、二つの高さで並んで進む」。色は『-nil-／極彩色』の16曲の輪で「ロジックエージェント」に当てた
 *   光(#ece6d4)と影(#8d939a)だけ。012 の方針どおり色ではなく灰色の濃さで描く。地は影の濃い灰。
 * - 題名と見出しには、少し下にずれた影の写しを重ねる(同じ声の、別の高さのハモリ)。
 * - 表紙: 上から差す光の中に題名。下に公式MV(押すとサイト全体のプレイヤーで流れる)と、本文の聴く・観るリンク(段落0)。
 * - 段落8の後: 同じ形の線が、光と影の二本で、高さを変えて並んで進む。
 * - 段落12の後: 2014年の別々の音源(れをる版・ボーカロイド版)から、2024年の武道館で一つに交わる二本の線。
 * - 見出し「巻き戻される景色の中へ」: 下に、右から左へ戻る再生位置の線。
 * - 段落17の後: 円柱状の空間を奥へ通り抜ける。四角いパネルを並べた輪が奥から手前へ流れ、長い筋が奥の一点へ集まる(MV の画面は複製しない)。
 * - 段落24の後: 「君の記憶にいる僕」(影)と「今ここにいる僕」(光)。重なっていた二つが、ずれたまま並ぶ。
 * - 段落27の後: 見る側の視線。ファインダーの角が、奥の影の「僕」へ寄っていく。
 * - 結び(段落35)の後: 段落8の後の二本の線が、交わってはまた離れる(そのたびに出会い直す)。
 * - 歌詞は本文の外に出さない。図の言葉は本文の地の文から。MV・ジャケットは複製しない(MV は未視聴。本文の記述だけを使う)。
 * - 歌ネットの同じ歌詞ページへのリンク(段落7・18・30)は本文から外し、奥付の「参考」に一度だけ置く。
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
import "./logic-agent.css";

// 本文の段落位置(blocks の添字)
const LISTEN = 0; // 「ロジックエージェント」のMVを観る / Spotifyで聴く
const OPENING = 1; // 『極彩色』の中でいちばん好きな曲
const INTRO = 2;
const S_VOICE = 6; // 見出し「重なる声と、パラレル仕様」
const VOICE_FIG = 9; // 段落8の後
const MEET_FIG = 13; // 段落12の後
const S_REWIND = 13; // 見出し「巻き戻される景色の中へ」
const TUNNEL_FIG = 18; // 段落17の後
const S_TWO = 20; // 見出し「君が覚えている僕と、今の僕」
const TWO_FIG = 25; // 段落24の後
const GAZE_FIG = 28; // 段落27の後
const S_FIND = 29; // 見出し「変わっていく僕を、見つけてほしい」
const LAST = 35; // 結び

// 公式MV(曲データの MV と同じ動画)。段落0は MV と Spotify の二つのリンクを一つの段落に持つため、
// 共通の「冒頭リンクを埋め込みにする」処理(リンクが一つの時だけ)には乗らない。ここで置き、段落0はリンクのまま残す
const MV = {
  videoId: "WwX5E63wGF4",
  href: "https://www.youtube.com/watch?v=WwX5E63wGF4",
  text: "「ロジックエージェント」のMVを観る",
};
// 段落7・18・30 に3回あった歌詞の出典。本文から外し、奥付の「参考」に一度だけ置く
const UTANET = {
  url: "https://www.uta-net.com/song/190968/",
  text: "「ロジックエージェント」の歌詞(歌ネット)",
};

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

// 声の線(段落8の後と結びで同じ形)。ゆるく上下しながら進む旋律の輪郭
const CONTOUR =
  "M20 120 C 70 120, 80 70, 130 70 S 190 110, 230 100 S 290 40, 340 40 S 400 90, 440 80 S 500 30, 540 30";

/** 段落8の後: 同じ人の声が、異なる音の高さで並んで進む */
const VoiceFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.45);
  return (
    <figure ref={ref} className={`a017-voice${className}`} aria-label="同じ人の声が、異なる音の高さで並んで進んでいく">
      <svg viewBox="0 0 560 190" aria-hidden="true">
        <path d={CONTOUR} className="a017-line is-light" pathLength={1} />
        <path d={CONTOUR} transform="translate(0 46)" className="a017-line is-shade" pathLength={1} />
      </svg>
      <figcaption className="a017-cap">同じ声が、異なる高さで並んで進む</figcaption>
    </figure>
  );
};

/** 段落12の後: 2014年に別々の音源にあった二つの声が、2024年に同じステージで交わる */
const MeetFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.4);
  return (
    <figure
      ref={ref}
      className={`a017-meet${className}`}
      aria-label="2014年には別々の音源にあった声が、十年後、2024年の武道館で同じステージで交わる"
    >
      <div className="a017-meet__head" aria-hidden="true">
        <p className="a017-meet__year">2014</p>
        <p className="a017-meet__src is-light">
          れをる版
          <br />
          『No title−』
        </p>
        <p className="a017-meet__src is-shade">
          ボーカロイド版
          <br />
          『No title＋』
        </p>
      </div>
      <svg className="a017-meet__lanes" viewBox="0 0 320 220" preserveAspectRatio="none" aria-hidden="true">
        <path d="M80 0 V 110 C 80 170, 160 160, 160 210" className="a017-line is-light" pathLength={1} />
        <path d="M240 0 V 110 C 240 170, 160 160, 160 210" className="a017-line is-shade" pathLength={1} />
      </svg>
      <div className="a017-meet__foot" aria-hidden="true">
        <span className="a017-meet__dot" />
        <p className="a017-meet__year">2024</p>
        <p className="a017-meet__stage">武道館「No title」</p>
      </div>
      <figcaption className="a017-cap">別々の音源にあった声が、十年後に同じステージで交わる</figcaption>
    </figure>
  );
};

/**
 * 段落17の後: 円柱状の空間を、奥へ通り抜けていく。筒の内側を正面から見た形で、壁は四角いパネルを輪に並べたもの
 * (ところどころ欠けている)と、奥の一点へ集まる長い筋。パネルの輪が奥から手前へ流れてくる(進んでいく)。
 * MV の画面は複製せず、本文の記述(円柱状の空間・ワームホール)と MV の筒の作りから描いた抽象
 */
const TUNNEL_PANELS = 12;
const TUNNEL_RINGS = 6;
const panelPath = (k: number, rOut: number, rIn: number) => {
  const step = (Math.PI * 2) / TUNNEL_PANELS;
  const a0 = k * step + step * 0.08;
  const a1 = (k + 1) * step - step * 0.08;
  const pt = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(1)} ${(r * Math.sin(a)).toFixed(1)}`;
  return `M${pt(rOut, a0)} A${rOut} ${rOut} 0 0 1 ${pt(rOut, a1)} L${pt(rIn, a1)} A${rIn} ${rIn} 0 0 0 ${pt(rIn, a0)} Z`;
};
// 輪ごとに欠けるパネル(決まった並び。毎回同じ形にする)
const missing = (ring: number, k: number) => (k * 7 + ring * 5) % 9 === 0 || (k + ring * 3) % 11 === 0;
const RAILS = Array.from({ length: 16 }, (_, i) => (i * Math.PI * 2) / 16 + 0.1);
const TunnelFig: React.FC = () => (
  <figure className="a017-tunnel" aria-label="円柱状の空間を通り抜けていく。場所だけでなく、時間の中を移動しているように">
    <svg viewBox="-200 -112 400 224" aria-hidden="true">
      {RAILS.map((a, i) => (
        <line
          key={i}
          x1={(16 * Math.cos(a)).toFixed(1)}
          y1={(16 * Math.sin(a)).toFixed(1)}
          x2={(260 * Math.cos(a)).toFixed(1)}
          y2={(260 * Math.sin(a)).toFixed(1)}
          className="a017-tunnel__rail"
        />
      ))}
      {Array.from({ length: TUNNEL_RINGS }, (_, ring) => (
        <g key={ring} className="a017-tunnel__ring" style={{ animationDelay: `${-ring}s` }}>
          <g transform={`rotate(${ring * 13})`}>
            {Array.from({ length: TUNNEL_PANELS }, (_, k) =>
              missing(ring, k) ? null : <path key={k} d={panelPath(k, 100, 82)} className={k % 3 === 0 ? "is-lit" : undefined} />
            )}
          </g>
        </g>
      ))}
    </svg>
    <figcaption className="a017-cap">円柱状の空間を、時間の中を進むように通り抜ける</figcaption>
  </figure>
);

/** 段落24の後: 君の記憶にいる僕(影)と、今ここにいる僕(光)。重なっていた二つが、ずれたまま並ぶ */
const TwoFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.5);
  return (
    <figure ref={ref} className={`a017-two${className}`} aria-label="君の記憶にいる僕と、今ここにいる僕。過去と今の二つの姿が、ずれたまま存在している">
      <div className="a017-two__stage" aria-hidden="true">
        <span className="a017-two__boku is-shade">僕</span>
        <span className="a017-two__boku is-light">僕</span>
        <span className="a017-two__label is-shade">君の記憶にいる僕</span>
        <span className="a017-two__label is-light">今ここにいる僕</span>
      </div>
      <figcaption className="a017-cap">過去と今の二つの姿が、ずれたまま</figcaption>
    </figure>
  );
};

/** 段落27の後: カメラは呼びかけを受け取る君の目になる。ファインダーの角が、奥の影の「僕」へ寄っていく */
const GazeFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.5);
  return (
    <figure ref={ref} className={`a017-gaze${className}`} aria-label="カメラは、呼びかけを受け取る君の目になる。記憶の奥にある姿へ近づいていく">
      <div className="a017-gaze__view" aria-hidden="true">
        <span className="a017-gaze__boku">僕</span>
        <span className="a017-gaze__corner is-tl" />
        <span className="a017-gaze__corner is-tr" />
        <span className="a017-gaze__corner is-bl" />
        <span className="a017-gaze__corner is-br" />
      </div>
      <figcaption className="a017-cap">カメラは、呼びかけを受け取る君の目になる</figcaption>
    </figure>
  );
};

/** 結びの後: 二本の声の線が、交わってはまた離れる。そのたびに、今の自分と出会い直す */
const AGAIN_LIGHT = "M20 95 C 80 20, 130 20, 170 95 S 260 170, 300 95 S 390 20, 430 95 S 500 150, 540 110";
const AGAIN_SHADE = "M20 95 C 80 170, 130 170, 170 95 S 260 20, 300 95 S 390 170, 430 95 S 500 40, 540 80";
const AgainFig: React.FC = () => {
  const { ref, className } = useRevealOnce<HTMLElement>(0.45);
  return (
    <figure ref={ref} className={`a017-again${className}`} aria-label="変わりながら、そのたびに今の自分と出会い直す">
      <svg viewBox="0 0 560 190" aria-hidden="true">
        <path d={AGAIN_SHADE} className="a017-line is-shade" pathLength={1} />
        <path d={AGAIN_LIGHT} className="a017-line is-light" pathLength={1} />
        {[170, 300, 430].map((x) => (
          <circle key={x} cx={x} cy="95" r="5" className="a017-again__meet" />
        ))}
      </svg>
      <figcaption className="a017-cap">そのたびに、今の自分と出会い直す</figcaption>
    </figure>
  );
};

const LogicAgentDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, createdAt, updatedAt } = ctx;
  const body = (from: number, to: number, className = "a017-text") => (
    <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={from} to={to} unstyled className={className} />
  );
  // 題名「ロジックエージェント　変わる僕を、その目に」: 曲名と副題を分ける(文言は変えない)
  const [tMain, ...tRest] = title.split("　");
  const tSub = tRest.join("　").trim();
  // 曲名は「ロジック」「エージェント」で折り返せるように(狭い画面で1文字だけ落ちないよう)
  const titleParts = tMain === "ロジックエージェント" ? ["ロジック", "エージェント"] : [tMain];
  const pages = songPages.filter((p, i) => songPages.findIndex((q) => q.songName === p.songName) === i);
  const credit =
    songFacts.lyricMember && songFacts.lyricMember === songFacts.musicMember
      ? `作詞・作曲 ${songFacts.lyricMember}`
      : [songFacts.lyricMember && `作詞 ${songFacts.lyricMember}`, songFacts.musicMember && `作曲 ${songFacts.musicMember}`]
          .filter(Boolean)
          .join(" / ");

  return (
    <main className="a017" lang="ja">
      <article>
        <header className="a017-cover" data-og-cover>
          <div className="a017-cover__top">
            <nav aria-label="パンくず" className="a017-crumbs">
              <Link to="/">HOME</Link>
              <span aria-hidden>/</span>
              <Link to="/articles/">読みもの</Link>
              <span aria-hidden>/</span>
              <span>{ctx.songTitle}</span>
            </nav>
          </div>
          <div className="a017-cover__body">
            <h1 className="a017-title">
              <span className="a017-title__song">
                {titleParts.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </span>
              {tSub && <span className="a017-title__sub">{tSub}</span>}
            </h1>
            <p className="a017-date">
              <ArticleDate createdAt={createdAt} updatedAt={updatedAt} />
            </p>
            {/* 公式MV(押した時だけ読み込む)と、本文の観る・聴くリンク(OGP の撮影では __media ごと隠れる) */}
            <div className="a017-cover__media">
              <p className="a017-cover__label">MUSIC VIDEO</p>
              <OfficialMedia {...MV} articleId={id} unstyled preferHighRes />
              {body(LISTEN, OPENING, "a017-text a017-listen")}
            </div>
          </div>
        </header>

        <div className="a017-ground">
          <div className="a017-column">
            {body(OPENING, INTRO, "a017-text a017-opening")}
            {body(INTRO, S_VOICE)}

            <section className="a017-section">
              {body(S_VOICE, VOICE_FIG)}
              <VoiceFig />
              {body(VOICE_FIG, MEET_FIG)}
              <MeetFig />
            </section>

            <section className="a017-section">
              {body(S_REWIND, S_REWIND + 1, "a017-text a017-rewind")}
              {body(S_REWIND + 1, TUNNEL_FIG)}
              <TunnelFig />
              {body(TUNNEL_FIG, S_TWO)}
            </section>

            <section className="a017-section">
              {body(S_TWO, TWO_FIG)}
              <TwoFig />
              {body(TWO_FIG, GAZE_FIG)}
              <GazeFig />
              {body(GAZE_FIG, S_FIND)}
            </section>

            <section className="a017-section">
              {body(S_FIND, LAST)}
              {body(LAST, blocks.length, "a017-text a017-last")}
              <AgainFig />
            </section>
          </div>

          <footer className="a017-colophon">
            <dl className="a017-colophon__list">
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
              {songFacts.releases.length > 0 && (
                <div>
                  <dt>収録</dt>
                  <dd>
                    {songFacts.releases.map((r) => (
                      <span key={`${r.title}-${r.releaseDate}`} className="a017-colophon__release">
                        {dotDate(r.releaseDate)} {formatLabel(r.format)}『{r.title}』
                      </span>
                    ))}
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
              <div>
                <dt>参考</dt>
                <dd>
                  <a
                    href={UTANET.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("article_source_click", { category: "outbound", label: `${id}->uta-net` })}
                  >
                    {UTANET.text}
                  </a>
                </dd>
              </div>
            </dl>
            <ul className="a017-next">
              {pages.map((p) => (
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

export default LogicAgentDesign;
