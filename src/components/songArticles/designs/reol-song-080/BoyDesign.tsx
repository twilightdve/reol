/**
 * 楽曲記事「Boy」(reol-song-080)の記事別デザイン。設計の根拠は plan/30。
 *
 * - 冒頭は黒地の中に題名とMVが入った「映画の始まりの1画面」。そこから記事の床(真上から見た床)へ切り替わる。
 * - 床の色は段落の中では変えず、話の転換点の帯(第5段落の前・結びの前)でだけ「冬の昼」から「夕景」へ移す。
 * - 帯には手拍子の「拍」を置き、結びの前では拍に「声」の線が重なる(装飾。読み上げ対象外)。
 * - PCでは、題名・MV・一言・欄外の注記を左の軸に、本文をMVの右端にそろえた列に置く(左右非対称)。
 *   欄外の注記は、段落に関係するサイトの確認済みデータ(収録作・演奏記録)だけ。スマートフォンでは段落の前に置く。
 * - 結びは読点の位置で句に分けて組み、句の途中で行が分かれないようにする(文言は変えない)。
 * - 締めは映画のエンドクレジットのように、サイトの確認済みデータだけを並べる。
 *
 * 本文の段落位置に依存するため、designManifest.ts の本文版・ハッシュと一致した時だけ使われる。
 * 配色はA案(淡いコンクリート)に決定(2026-10-09)。床の質感は比較中: a=画像なしのノイズ、w=写真(使い込まれた床)、
 * t=写真(こて跡)。切り替えはプレビュー時(?v=a|w|t)だけ。写真は Poly Haven の CC0 素材(plan/30 8章)。
 */
import React, { useEffect, useRef, useState } from "react";
import { Link } from "gatsby";
import ArticleBody from "../../ArticleBody";
import { formatArticleDate, splitAfterComma } from "../../../../utils/songArticles/format";
import { trackEvent } from "../../../../utils/analytics";
import type { ArticleInline } from "../../../../utils/songArticles/markdown";
import type { SongArticleDesign, SongArticlePageContext } from "../types";
import "./boy.css";

type Variant = "a" | "w" | "t";
const DEFAULT_VARIANT: Variant = "a";
const VARIANTS: { key: Variant; label: string }[] = [
  { key: "a", label: "A ノイズ" },
  { key: "w", label: "写真1 使い込まれた床" },
  { key: "t", label: "写真2 こて跡" },
];
const isVariant = (v: string | null): v is Variant => v === "a" || v === "w" || v === "t";

// 段落の位置(designManifest.ts の anchors と対応)
const LEDE = 1; // 一言
const RELEASE_NOTE = 2; // 曲の成り立ち(収録作の注記)
const LIVE = 5; // ライヴの記憶の始まり(帯1・演奏記録の注記)
const CODA = 8; // 結び(帯2)

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
type Release = SongArticlePageContext["songFacts"]["releases"][number];
const formatLabel = (r: Release) => (r.format ? FORMAT_LABEL[r.format] ?? r.format : null);
const dotDate = (d: string | null) => (d ? d.replace(/-/g, ".") : null);
const formatRelease = (r: Release) =>
  [formatLabel(r), `『${r.title}』`, dotDate(r.releaseDate)].filter(Boolean).join(" ");

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

/** 欄外の注記(PCは段落の左、スマートフォンは段落の前) */
const Note: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <aside className="a080-note">
    <p className="a080-note__label">{label}</p>
    <div className="a080-note__body">{children}</div>
  </aside>
);

/**
 * 結びの段落を読点ごとの句に分けて組む。文字列は変えず、テキストを「、」の直後で区切って
 * 句ごとの span にするだけ(句の途中で行が分かれにくくする)。リンク等のテキスト以外はそのまま。
 */
const ClauseText: React.FC<{ nodes: ArticleInline[] }> = ({ nodes }) => {
  const clauses: React.ReactNode[][] = [[]];
  nodes.forEach((n, i) => {
    if (n.t !== "text") {
      // 結びにテキスト以外が来た場合は、装飾なしの共通描画に任せる(呼び出し側で判定)
      return;
    }
    const parts = splitAfterComma(n.v);
    parts.forEach((part, j) => {
      if (j > 0) clauses.push([]);
      clauses[clauses.length - 1].push(<React.Fragment key={`${i}-${j}`}>{part}</React.Fragment>);
    });
  });
  return (
    <>
      {clauses.map((c, k) => (
        <span key={k} className="a080-clause">
          {c}
        </span>
      ))}
    </>
  );
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
    if (isVariant(v)) setVariant(v);
  }, [preview]);

  // H1 の文言はそのまま。「Reol Boy」と見出しの本体を分けて組む(文字は変えない・装飾を重ねない)
  const NAME = "Reol Boy ";
  const hasName = title.startsWith(NAME);
  const published = formatArticleDate(publishedAt);
  const updated = updatedAt && updatedAt !== publishedAt ? formatArticleDate(updatedAt) : null;

  // 曲が出た年の収録作だけを、曲の成り立ちの段落に添える
  const firstYear = songFacts.releases[0]?.releaseDate?.slice(0, 4) ?? null;
  const originReleases = songFacts.releases.filter((r) => firstYear && r.releaseDate?.startsWith(firstYear));
  const stats = songFacts.stats;
  const songPage = songPages[0] ?? null;

  const notes: Record<number, React.ReactNode> = {};
  if (originReleases.length > 0) {
    notes[RELEASE_NOTE] = (
      <Note label="リリース">
        {originReleases.map((r) => (
          <p key={r.title}>
            <span className="a080-note__strong">{dotDate(r.releaseDate)}</span>
            <span>
              {formatLabel(r)}『{r.title}』
            </span>
          </p>
        ))}
      </Note>
    );
  }
  // 演奏記録はライヴの記憶が始まる段落の横に1つにまとめる。特定の公演の段落の横には置かない
  // (最新の演奏日はライヴのたびに変わり、段落の内容と関係があるように読めてしまうため)。
  // 数値はサイトのセットリスト記録による(曲ページと同じ)ことを明記する
  if (stats && stats.totalPlays > 0) {
    notes[LIVE] = (
      <Note label="ライヴでの演奏">
        <p>
          <span className="a080-note__strong a080-note__big">{stats.totalPlays.toLocaleString("ja-JP")}</span>
          <span>回(通算)</span>
        </p>
        {stats.firstPlayedDate && (
          <p>
            <span>初披露</span>
            <span className="a080-note__strong">{dotDate(stats.firstPlayedDate)}</span>
          </p>
        )}
        {stats.lastPlayedDate && (
          <p>
            <span>最新</span>
            <span className="a080-note__strong">{dotDate(stats.lastPlayedDate)}</span>
          </p>
        )}
        <p className="a080-note__src">
          <span>!Legit のセットリスト記録より</span>
          {songPage && (
            <Link
              to={`/songs/${songPage.slug}/`}
              onClick={() => trackEvent("article_song_page_click", { category: "navigation", label: `${id}:note` })}
            >
              演奏履歴を見る
            </Link>
          )}
        </p>
      </Note>
    );
  }

  /** 本文の段落を1つずつ、注記があれば左(スマートフォンでは前)に添えて並べる */
  const rows = (from: number, to: number) =>
    Array.from({ length: to - from }, (_, k) => from + k).map((i) => (
      <div key={i} className={`a080-row${notes[i] ? " a080-row--noted" : ""}`}>
        {notes[i]}
        <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={i} to={i + 1} unstyled className="a080-row__text" />
      </div>
    ));

  const coda = blocks[CODA];
  const codaIsPlainText = coda?.t === "p" && coda.children.every((n) => n.t === "text");

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

      <article className="a080-article">
        {/* 映画の始まりの1画面: 黒地に題名とMV */}
        <div className="a080-opening">
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
          <div className="a080-screen">
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={0} to={LEDE} unstyled mediaFormat="cinemascope" />
          </div>
        </div>

        {/* 床と帯をまとめた地面。コンクリートの質感はこの1枚に重ね、区画の境目で模様がずれないようにする */}
        <div className="a080-ground">
          {/* 床(冬の昼) */}
          <div className="a080-floor a080-floor--1">
            <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={LEDE} to={LEDE + 1} unstyled className="a080-lede" />
            <div className="a080-rows">{rows(LEDE + 1, LIVE)}</div>
          </div>

          {/* 転換点1: 曲の成り立ちから、ライヴの記憶へ。手拍子の拍 */}
          <div ref={band1.ref} className={`a080-band a080-band--1${band1.className}`}>
            <Beats />
          </div>

          <div className="a080-floor a080-floor--2">
            <div className="a080-rows">{rows(LIVE, CODA)}</div>
          </div>

          {/* 転換点2: 結びの前。拍に声が重なる */}
          <div ref={band2.ref} className={`a080-band a080-band--2${band2.className}`}>
            <Beats withVoice />
          </div>

          <div className="a080-floor a080-floor--3">
            {codaIsPlainText && coda.t === "p" ? (
              <div className="a080-coda">
                <p>
                  <ClauseText nodes={coda.children} />
                </p>
              </div>
            ) : (
              <ArticleBody blocks={blocks} leadMedia={leadMedia} articleId={id} from={CODA} to={blocks.length} unstyled className="a080-coda" />
            )}
          </div>
        </div>
      </article>

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
