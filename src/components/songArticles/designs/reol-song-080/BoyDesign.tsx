/**
 * 楽曲記事「Boy」(reol-song-080)の記事別デザイン。設計の根拠は plan/30。
 *
 * - 紙面を「真上から見た床」として扱い、上下を映画の黒帯(シネマスコープ)で挟む。
 * - 床の色は段落の中では変えず、話の転換点の帯(第5段落の前・結びの前)でだけ「冬の昼」から「夕景」へ移す。
 * - 帯には手拍子の「拍」を置き、結びの前では拍に「声」の線が重なる(装飾。読み上げ対象外)。
 * - 締めは映画のエンドクレジットのように、サイトの確認済みデータだけを並べる。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 * 配色は比較用に3案(A/B/C)。切り替えはプレビュー時(?v=a|b|c)だけ。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleBody from "../../ArticleBody";
import { formatArticleDate } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { SongArticleDesign } from "../types";
import "./boy.css";

type Variant = "a" | "b" | "c";
const DEFAULT_VARIANT: Variant = "a";
const VARIANTS: { key: Variant; label: string }[] = [
  { key: "a", label: "A 淡いコンクリート" },
  { key: "b", label: "B トンネル" },
  { key: "c", label: "C 一定の床" },
];

// 帯を置く段落(designManifest.ts の anchors と対応)
const LEDE = 1; // 一言
const LIVE = 5; // ライヴの記憶の始まり
const CODA = 8; // 結び

/** 手拍子の拍。等間隔の短い縦線。withVoice で「声」の線が重なる */
const Beats: React.FC<{ withVoice?: boolean }> = ({ withVoice }) => (
  <svg className="a080-beats" viewBox="0 0 320 48" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    {Array.from({ length: 8 }, (_, i) => (
      <line key={i} className="a080-beat" x1={20 + i * 40} x2={20 + i * 40} y1={12} y2={36} />
    ))}
    {withVoice && (
      <path
        className="a080-voice"
        d="M0 30 C 30 30, 40 14, 60 14 S 90 34, 100 34 S 130 12, 140 12 S 170 36, 180 36 S 210 10, 220 10 S 250 36, 260 36 S 290 18, 320 18"
      />
    )}
  </svg>
);

// シートの形態の略記を、読者向けの言葉にする(知らない略記はそのまま出す)
const FORMAT_LABEL: Record<string, string> = {
  配信SG: "配信シングル",
  SG: "シングル",
  miniAL: "ミニアルバム",
  AL: "アルバム",
};
const formatRelease = (r: { title: string; format: string | null; releaseDate: string | null }) =>
  [r.format ? FORMAT_LABEL[r.format] ?? r.format : null, `『${r.title}』`, r.releaseDate?.replace(/-/g, ".")]
    .filter(Boolean)
    .join(" ");

/** 帯が画面に入った時だけ動きを付ける(JSなしでは静止状態のまま) */
const useRevealOnce = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"static" | "armed" | "visible">("static");
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // すでに画面内にある帯は、最初から完成状態で見せる(読み込み直後の点滅を避ける)
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
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const className = state === "static" ? "" : state === "armed" ? " is-armed" : " is-armed is-visible";
  return { ref, className };
};

const BoyDesign: SongArticleDesign = (ctx) => {
  const { id, title, blocks, leadMedia, songPages, songFacts, publishedAt, updatedAt, preview } = ctx;
  const [variant, setVariant] = useState<Variant>(DEFAULT_VARIANT);
  const band1 = useRevealOnce();
  const band2 = useRevealOnce();

  // 配色案の切り替えはプレビューだけ(公開ビルドでは常に既定の案)
  useEffect(() => {
    if (!preview) return;
    const v = new URLSearchParams(window.location.search).get("v");
    if (v === "a" || v === "b" || v === "c") setVariant(v);
  }, [preview]);

  // H1 の文言はそのまま。「Reol Boy」と見出しの本体を分けて組む(文字は変えない・装飾を重ねない)
  const NAME = "Reol Boy ";
  const hasName = title.startsWith(NAME);
  const published = formatArticleDate(publishedAt);
  const updated = updatedAt && updatedAt !== publishedAt ? formatArticleDate(updatedAt) : null;

  return (
    <main className="a080" data-variant={variant} lang="ja">
      {/* 上の黒帯 */}
      <div className="a080-bar a080-bar--top">
        <nav aria-label="パンくず" className="a080-crumbs">
          <Link to="/">HOME</Link>
          <span aria-hidden>/</span>
          <Link to="/articles/">読みもの</Link>
          <span aria-hidden>/</span>
          <span>Boy</span>
        </nav>
        {preview && (
          <div className="a080-preview" role="status">
            <span>プレビュー(未公開)</span>
            <span className="a080-preview__variants">
              {VARIANTS.map((v) => (
                <a
                  key={v.key}
                  href={`?v=${v.key}`}
                  aria-current={variant === v.key ? "true" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    setVariant(v.key);
                    window.history.replaceState(null, "", `?v=${v.key}`);
                  }}
                >
                  {v.label}
                </a>
              ))}
            </span>
          </div>
        )}
      </div>

      <div className="a080-floor a080-floor--1">
        <header className="a080-hero">
          <Beats />
          <h1 className="a080-title">
            {hasName ? (
              <>
                <span className="a080-title__name">{NAME.trim()}</span>{" "}
                <span className="a080-title__main">{title.slice(NAME.length)}</span>
              </>
            ) : (
              <span className="a080-title__main">{title}</span>
            )}
          </h1>
          <p className="a080-date">
            {published ? (
              <>
                <time dateTime={publishedAt ?? undefined}>{published}</time> 公開
                {updated && (
                  <>
                    {" ・ "}
                    <time dateTime={updatedAt ?? undefined}>{updated}</time> 更新
                  </>
                )}
              </>
            ) : (
              "公開日未定"
            )}
          </p>
        </header>

        <article className="a080-article">
          {/* 冒頭のMV(シネマスコープ比)と、一言 */}
          <div className="a080-screen">
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={0} to={LEDE} unstyled mediaFormat="cinemascope" />
          </div>
          <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={LEDE} to={LEDE + 1} unstyled className="a080-lede" />
          <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={LEDE + 1} to={LIVE} unstyled className="a080-body" />
        </article>
      </div>

      {/* 転換点1: 曲の成り立ちから、ライヴの記憶へ。手拍子の拍 */}
      <div ref={band1.ref} className={`a080-band a080-band--1${band1.className}`}>
        <Beats />
      </div>

      <div className="a080-floor a080-floor--2">
        <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={LIVE} to={CODA} unstyled className="a080-body" />
      </div>

      {/* 転換点2: 結びの前。拍に声が重なる */}
      <div ref={band2.ref} className={`a080-band a080-band--2${band2.className}`}>
        <Beats withVoice />
      </div>

      <div className="a080-floor a080-floor--3">
        <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={CODA} to={blocks.length} unstyled className="a080-coda" />
      </div>

      {/* 下の黒帯: エンドクレジット(サイトの確認済みデータだけ) */}
      <footer className="a080-bar a080-bar--credits">
        <dl className="a080-credits">
          <div>
            <dt>曲</dt>
            <dd>Boy</dd>
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
              <dd>{songFacts.musicMember.replace(/\s*,\s*/g, ", ")}</dd>
            </div>
          )}
          {songFacts.releases.length > 0 && (
            <div>
              <dt>収録</dt>
              <dd>
                {songFacts.releases.map((r) => (
                  <span key={r.title} className="a080-credits__release">
                    {formatRelease(r)}
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
        <ul className="a080-next">
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
    </main>
  );
};

export default BoyDesign;
