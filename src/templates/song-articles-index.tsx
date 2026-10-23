/**
 * /articles/ — 読みものの一覧。plan/29・plan/33
 * gatsby-node.ts が記事が1件以上ある時だけ作る(公開記事0件のビルドではページ自体が無い)。
 *
 * 分類はシリーズ+タグ(2026-10-10 ユーザー決定)。
 * - /articles/ はシリーズごとに分けて並べる。/articles/series/<slug>/ はそのシリーズだけ(同じテンプレート)。
 * - タグは ?tag=<タグ> で絞り込む(記事のタグのリンクから)。静的HTMLは全件で、JSが動いた後に絞り込む(JSなしでも全件を読める)。
 *   一覧の上の「タグで絞り込む」ボタン群は置かない(2026-10-11 ユーザー指定)。
 * - アルバム(初出の作品)で絞り込める(2026-10-13 ユーザー指定)。?album=<作品名>。静的HTMLは全件で、JSが動いた後に絞り込む。
 * - 記事ごとのいいね数を表示し、「新着順」「いいねが多い順」で並べ替えられる(2026-10-12 ユーザー指定)。
 *   いいね数は JS が動いた後に Supabase からまとめて読む(静的HTMLは新着順・数なし)。読めない時は数を出さず、いいね順は選べない。
 *   並べ替えは ?sort=likes で共有できる(?tag= と併用可)。
 * - 記事ごとの表示回数(GA4)を出し、「よく読まれている順」でも並べ替えられる(2026-10-18 ユーザー指定。plan/46)。
 *   数はデプロイの前に GA から取ってページ情報に入れる(静的HTMLにも出る)。変わるのはデプロイの時だけ。?sort=views。
 */
import React, { useEffect, useMemo, useState } from "react";
import { HeadFC, Link, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { trackEvent } from "../utils/analytics";
import { formatArticleDate } from "../utils/songArticles/format";
import { ArticleSeries, seriesPath, showSongKicker, splitTitleBySong, tagFilterPath } from "../utils/songArticles/series";
import { fetchArticleLikeCounts } from "../services/articleLikeService";
import { isReleased, useNow } from "../utils/songArticles/schedule";
import { useAuth } from "../contexts/AuthContext";
import { OWNER_USER_ID } from "../constants/owner";
import { ARTICLES_FEED_PATH, ARTICLES_FEED_TITLE } from "../utils/songArticles/feed";

type IndexEntry = {
  /** 記事ID(いいね数の問い合わせに使う) */
  id: string;
  slug: string;
  title: string;
  songTitle: string;
  versionLabel: string | null;
  summary: string | null;
  /** 作成日(公開日時の無い記事のカードに出す) */
  createdAt: string | null;
  publishedAt: string | null;
  seriesSlug: string;
  tags: string[];
  /** 初出の作品(アルバムの絞り込みに使う) */
  album: { title: string; releaseDate: string | null } | null;
  /** カードの表紙の画像(記事の表紙を撮ったもの。npm run articles:og)。無ければ null */
  cover?: string | null;
  preview: boolean;
  /** 限定公開(plan/43)。運営のログイン時だけ一覧に出す */
  unlisted?: boolean;
  /** 公開日以降の表示回数(GA4。plan/46)。取れていない時・限定公開は null */
  pageViews?: number | null;
};

/** 運営向けの公開状態の札(2026-10-13 ユーザー指定: 運営者にのみ、一覧に公開ステータスを表示) */
type OwnerBadge = { label: string; tone: "live" | "unlisted" | "scheduled" | "preview" };
const jstShort = (iso: string) =>
  new Date(iso).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
const jstDate = (iso: string) => new Date(iso).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo", month: "long", day: "numeric" });
const ownerBadge = (a: IndexEntry, now: number): OwnerBadge => {
  if (a.preview) return { label: "確認中(ローカルのプレビュー)", tone: "preview" };
  if (a.unlisted) return { label: "限定公開(URL を知っている人だけ)", tone: "unlisted" };
  if (a.publishedAt && !isReleased(a.publishedAt, now)) return { label: `予約公開 ${jstShort(a.publishedAt)} に公開`, tone: "scheduled" };
  return { label: a.publishedAt ? `公開中(${jstShort(a.publishedAt)} 公開)` : "公開中", tone: "live" };
};
const BADGE_CLASS: Record<OwnerBadge["tone"], string> = {
  live: "border border-bx-line text-bx-ink2",
  unlisted: "bg-bx-yellow text-bx-bg",
  scheduled: "bg-bx-blue text-white",
  preview: "bg-bx-ink3 text-bx-bg",
};

interface SongArticlesIndexContext {
  articles: IndexEntry[];
  series: ArticleSeries[];
  /** シリーズのページなら、そのシリーズ。/articles/ なら null */
  seriesSlug: string | null;
  noindex: boolean;
  /** ビルド時刻。予約公開の記事は公開日時を過ぎるまで出さない(plan/43) */
  builtAt?: number;
  /** 表示回数を GA から取った日時(plan/46)。取れていない時は null */
  pageViewsAt?: string | null;
}

type SortKey = "new" | "likes" | "views";
const SORT_KEYS: readonly SortKey[] = ["new", "likes", "views"];

const DESCRIPTION = "Reolの曲やライヴについての読みもの。";
const NOTE =
  "ここに書いているのは、ファンのひとりとしての個人的な解釈です。正解を示すものではありません。読んだあとにもう一度曲を聴き直すときの、たたき台にしてもらえたらうれしいです。";

const ArticleItem: React.FC<{ a: IndexEntry; activeTag: string | null; likes: number | null; badge?: OwnerBadge | null; now: number }> = ({
  a,
  activeTag,
  likes,
  badge,
  now,
}) => {
  // 一覧は公開日時の新しい順(2026-10-13 ユーザー指定)なので、カードの日付も公開日にそろえる。
  // 公開日時の無い記事(限定公開・プレビュー)と公開前の予約は作成日
  const published = !a.unlisted && a.publishedAt != null && isReleased(a.publishedAt, now);
  const dateIso = published ? a.publishedAt : a.createdAt;
  const date = formatArticleDate(dateIso);
  const kicker = [showSongKicker(a.title, a.songTitle) ? a.songTitle : null, a.versionLabel].filter(Boolean).join(" — ");
  const parts = splitTitleBySong(a.title, a.songTitle);
  // カード型(2026-10-23 ユーザー「記事の表紙デザインを反映させたカード型のアイテムにしたい」)。上に記事の表紙の画像
  return (
    <li className="flex">
      <article className="group flex w-full flex-col overflow-hidden rounded-lg border border-bx-line transition-colors hover:border-bx-blue">
        <Link
          to={`/articles/${a.slug}/`}
          onClick={() => trackEvent("article_list_click", { category: "navigation", label: a.slug })}
          className="block"
        >
          <div className="relative aspect-[40/21] overflow-hidden border-b border-bx-line bg-bx-line/40">
            {a.cover ? (
              <img
                src={a.cover}
                alt=""
                width={800}
                height={420}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            ) : (
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center px-6 text-center text-2xl font-extrabold text-bx-ink3">
                {a.songTitle}
              </span>
            )}
          </div>
          <div className="px-4 pt-4 pb-2">
        {badge && (
          <p className="mb-2">
            <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-extrabold ${BADGE_CLASS[badge.tone]}`}>{badge.label}</span>
          </p>
        )}
        {/* 題名にもう曲名が入っている時は曲名を出さない(版の名前だけは残す) */}
        {kicker && (
          <p className="mb-2 text-[11px] font-extrabold tracking-[0.2em] text-bx-blue [overflow-wrap:anywhere]">{kicker}</p>
        )}
        <h3 className="text-[16px] sm:text-[17px] font-semibold leading-snug text-bx-ink2 group-hover:text-bx-blue transition-colors [overflow-wrap:anywhere]">
          {/* 曲名の文字だけ強調する(題名の文字はそのまま。2026-10-13 ユーザー指定) */}
          {parts ? (
            <>
              {parts.before}
              <strong className="font-extrabold text-[1.12em] text-bx-ink group-hover:text-bx-blue">{parts.song}</strong>
              {parts.after}
            </>
          ) : (
            a.title
          )}
        </h3>
        {a.summary && <p className="mt-2 text-[13px] leading-relaxed text-bx-ink2 line-clamp-3">{a.summary}</p>}
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-bx-ink3">
          {date && (
            <span>
              <time dateTime={dateIso ?? undefined}>{date}</time> {published ? "公開" : "作成"}
            </span>
          )}
          {a.pageViews != null && (
            <span className="inline-flex items-center gap-1" aria-label={`表示 ${a.pageViews}回`} title="表示回数">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="tabular-nums">{a.pageViews.toLocaleString("ja-JP")}</span>
            </span>
          )}
          {likes !== null && (
            <span className="inline-flex items-center gap-1" aria-label={`いいね ${likes}`}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 3 5 6.6 5c2.1 0 3.6 1.2 4.4 2.6h2c.8-1.4 2.3-2.6 4.4-2.6C21 5 23 8.6 21.6 11.8 19.5 16.4 12 21 12 21z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="tabular-nums">{likes}</span>
            </span>
          )}
        </p>
          </div>
        </Link>
      {a.tags.length > 0 && (
        <ul className="mt-auto flex flex-wrap gap-x-3 gap-y-1 px-4 pt-1 pb-4 text-[12px]" aria-label="タグ">
          {a.tags.map((t) => (
            <li key={t}>
              <Link
                to={tagFilterPath(t)}
                className={`underline underline-offset-4 ${t === activeTag ? "text-bx-ink font-bold" : "text-bx-ink2 hover:text-bx-blue"}`}
              >
                #{t}
              </Link>
            </li>
          ))}
        </ul>
      )}
      </article>
    </li>
  );
};

const SongArticlesIndexPage: React.FC<PageProps<object, SongArticlesIndexContext>> = ({
  pageContext,
  location,
}) => {
  const { articles: allArticles, series, seriesSlug, builtAt, pageViewsAt } = pageContext;
  // 予約公開(plan/43): 公開日時を過ぎた記事だけ。静的HTMLはビルド時刻、JS が動いた後は今の時刻で判定する
  const now = useNow(builtAt);
  // 運営のログイン時は、限定公開・公開日時前の記事も出す(静的HTMLとブラウザでの最初の描画はログイン前なので出ない)
  const { user } = useAuth();
  const isOwner = user?.id === OWNER_USER_ID;
  const articles = useMemo(
    () => allArticles.filter((a) => isOwner || (!a.unlisted && isReleased(a.publishedAt, now))),
    [allArticles, now, isOwner]
  );
  const current = seriesSlug ? series.find((s) => s.slug === seriesSlug) ?? null : null;

  // タグの絞り込みは JS が動いた後だけ(静的HTMLとの食い違いを避ける)
  const [activeTag, setActiveTag] = useState<string | null>(null);
  useEffect(() => {
    const tag = new URLSearchParams(location.search).get("tag");
    setActiveTag(tag && articles.some((a) => a.tags.includes(tag)) ? tag : null);
  }, [location.search, articles]);

  // いいね数(JS が動いた後にまとめて読む)。読めない時は null のまま
  const [likeCounts, setLikeCounts] = useState<Map<string, number> | null>(null);
  useEffect(() => {
    let alive = true;
    fetchArticleLikeCounts(articles.map((a) => a.id))
      .then((m) => alive && setLikeCounts(m))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [articles]);

  // 並べ替え: 新着順(既定。静的HTMLと同じ)/ いいねが多い順 / よく読まれている順(どちらも同数なら新着順)
  const [sort, setSort] = useState<SortKey>("new");
  useEffect(() => {
    const q = new URLSearchParams(location.search).get("sort");
    setSort(SORT_KEYS.find((k) => k === q) ?? "new");
  }, [location.search]);
  const chooseSort = (next: SortKey) => {
    setSort(next);
    trackEvent("article_list_sort", { category: "navigation", label: next });
    // ?sort= を URL に残す(共有・戻る用)。?tag= はそのまま
    const params = new URLSearchParams(window.location.search);
    if (next !== "new") params.set("sort", next);
    else params.delete("sort");
    const q = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
  };
  const hasViews = articles.some((a) => a.pageViews != null);
  const sortable: Record<SortKey, boolean> = { new: true, likes: likeCounts !== null, views: hasViews };
  const activeSort: SortKey = sortable[sort] ? sort : "new";

  // アルバム(初出の作品)の一覧。発売日の古い順。記事の数も添える
  const albums = useMemo(() => {
    const m = new Map<string, { title: string; releaseDate: string | null; count: number }>();
    for (const a of articles) {
      if (!a.album) continue;
      const cur = m.get(a.album.title);
      if (cur) cur.count += 1;
      else m.set(a.album.title, { ...a.album, count: 1 });
    }
    return [...m.values()].sort((x, y) => (x.releaseDate ?? "").localeCompare(y.releaseDate ?? ""));
  }, [articles]);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  useEffect(() => {
    const album = new URLSearchParams(location.search).get("album");
    setActiveAlbum(album && albums.some((x) => x.title === album) ? album : null);
  }, [location.search, albums]);
  const chooseAlbum = (next: string | null) => {
    setActiveAlbum(next);
    trackEvent("article_list_album", { category: "navigation", label: next ?? "all" });
    const params = new URLSearchParams(window.location.search);
    if (next) params.set("album", next);
    else params.delete("album");
    const q = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
  };

  const visible = useMemo(() => {
    const byTag = activeTag ? articles.filter((a) => a.tags.includes(activeTag)) : articles;
    const filtered = activeAlbum ? byTag.filter((a) => a.album?.title === activeAlbum) : byTag;
    // Array.prototype.sort は安定なので、同数は元の新着順のまま
    if (activeSort === "likes" && likeCounts) return [...filtered].sort((x, y) => (likeCounts.get(y.id) ?? 0) - (likeCounts.get(x.id) ?? 0));
    if (activeSort === "views") return [...filtered].sort((x, y) => (y.pageViews ?? 0) - (x.pageViews ?? 0));
    return filtered;
  }, [articles, activeTag, activeAlbum, activeSort, likeCounts]);
  const basePath = current ? seriesPath(current.slug) : "/articles/";
  const groups = (current ? [current] : series)
    .map((s) => ({ s, items: visible.filter((a) => a.seriesSlug === s.slug) }))
    .filter((g) => g.items.length > 0);

  return (
    <Layout title={current ? `${current.name}|読みもの` : "読みもの"}>
      <main lang="ja" className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl text-bx-ink">
        <nav aria-label="パンくず" className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-bx-ink3">
          <Link to="/" className="hover:text-bx-blue transition-colors">
            HOME
          </Link>
          <span aria-hidden>/</span>
          {current ? (
            <>
              <Link to="/articles/" className="hover:text-bx-blue transition-colors">
                読みもの
              </Link>
              <span aria-hidden>/</span>
              <span className="text-bx-ink">{current.name}</span>
            </>
          ) : (
            <span className="text-bx-ink">読みもの</span>
          )}
        </nav>
        <header className="mt-6 mb-6 max-w-3xl">
          <Kicker color="text-bx-blue">{current ? "SERIES" : "READING"}</Kicker>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-tight">{current ? current.name : "読みもの"}</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-bx-ink2">{current ? current.description : DESCRIPTION}</p>
          {/* 断り書き(2026-10-13 ユーザー「あくまで個人の解釈であることで、曲をもう一度聴き直す叩き台にしてほしい旨を記載」) */}
          <p className="mt-4 border-l-2 border-bx-line pl-3 text-[13px] leading-relaxed text-bx-ink3">{NOTE}</p>
          {/* RSS フィード(2026-10-23 ユーザー「記事のRSSフィードを設定できるようにしたい」)。リーダーに登録する URL */}
          <p className="mt-3 text-[13px] text-bx-ink3">
            <a href={ARTICLES_FEED_PATH} className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-bx-blue">
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="currentColor">
                <circle cx="3" cy="13" r="2" />
                <path d="M1 6.5a8.5 8.5 0 0 1 8.5 8.5h-2.2A6.3 6.3 0 0 0 1 8.7z" />
                <path d="M1 1.5A13.5 13.5 0 0 1 14.5 15h-2.2A11.3 11.3 0 0 0 1 3.7z" />
              </svg>
              RSS フィード
            </a>
          </p>
        </header>

        {/* タグの絞り込み(記事のタグのリンクから ?tag= で来た時だけ)。絞り込みのボタン群は置かない(2026-10-11 ユーザー「タグで絞り込むは不要になった」) */}
        {activeTag && (
          <p className="mb-8 text-[13px] text-bx-ink2" role="status">
            「#{activeTag}」の記事 {visible.length}件
            <Link to={basePath} className="ml-3 underline underline-offset-4 hover:text-bx-blue">
              すべて表示
            </Link>
          </p>
        )}

        {/* アルバムで絞り込む(初出の作品。発売日の古い順) */}
        {albums.length > 1 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px]">
            <label htmlFor="article-album" className="mr-1 font-extrabold tracking-[0.16em] text-bx-ink3">
              アルバム
            </label>
            <select
              id="article-album"
              value={activeAlbum ?? ""}
              onChange={(e) => chooseAlbum(e.target.value || null)}
              className="max-w-full rounded-full border border-bx-line bg-bx-bg px-3 py-1 font-bold text-bx-ink focus:border-bx-blue"
            >
              <option value="">すべて({articles.length})</option>
              {albums.map((x) => (
                <option key={x.title} value={x.title}>
                  {x.title}
                  {x.releaseDate ? `(${x.releaseDate.slice(0, 4)})` : ""} — {x.count}本
                </option>
              ))}
            </select>
            {activeAlbum && (
              <button type="button" onClick={() => chooseAlbum(null)} className="text-bx-ink2 underline underline-offset-4 hover:text-bx-blue">
                解除
              </button>
            )}
          </div>
        )}

        {/* 並べ替え。いいね数が読めない時はいいね順を、表示回数が無い時はよく読まれている順を選べない */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-[12px]" role="group" aria-label="並べ替え">
          <span className="mr-1 font-extrabold tracking-[0.16em] text-bx-ink3">並べ替え</span>
          {(
            [
              ["new", "新着順"],
              ["likes", "いいねが多い順"],
              ["views", "よく読まれている順"],
            ] as const
          ).map(([key, label]) => {
            if (key === "views" && !hasViews) return null;
            const active = key === activeSort;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                disabled={!sortable[key]}
                onClick={() => chooseSort(key)}
                className={`rounded-full border px-3 py-1 font-bold transition-colors disabled:opacity-50 ${
                  active ? "border-bx-blue bg-bx-blue text-bx-bg" : "border-bx-line text-bx-ink2 hover:border-bx-blue hover:text-bx-blue"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
        {hasViews && pageViewsAt && (
          <p className="-mt-4 mb-6 text-[11px] text-bx-ink3">
            表示回数は公開日からの数で、{jstDate(pageViewsAt)}時点のものです(計測されない閲覧もあります)。
          </p>
        )}

        {groups.map(({ s, items }) => (
          <section key={s.slug} className="mb-12" aria-labelledby={`series-${s.slug}`}>
            {!current && (
              <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h2 id={`series-${s.slug}`} className="text-[13px] font-extrabold tracking-[0.16em] text-bx-ink">
                  シリーズ「{s.name}」
                </h2>
                <Link to={seriesPath(s.slug)} className="text-[12px] text-bx-ink2 underline underline-offset-4 hover:text-bx-blue">
                  このシリーズだけを見る
                </Link>
              </header>
            )}
            {current && <h2 id={`series-${s.slug}`} className="sr-only">{s.name}の記事</h2>}
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((a) => (
                <ArticleItem
                  key={a.slug}
                  a={a}
                  activeTag={activeTag}
                  likes={likeCounts ? likeCounts.get(a.id) ?? 0 : null}
                  badge={isOwner ? ownerBadge(a, now) : null}
                  now={now}
                />
              ))}
            </ul>
          </section>
        ))}
      </main>
    </Layout>
  );
};

export const Head: HeadFC<object, SongArticlesIndexContext> = ({ pageContext }) => {
  const current = pageContext.seriesSlug ? pageContext.series.find((s) => s.slug === pageContext.seriesSlug) ?? null : null;
  const path = current ? seriesPath(current.slug) : "/articles/";
  return (
    <>
      <SEO
        title={current ? `${current.name}|読みもの` : "読みもの"}
        description={current ? current.description : DESCRIPTION}
        path={path}
        jsonLd={buildBreadcrumbList(
          current
            ? [{ name: "ホーム", path: "/" }, { name: "読みもの", path: "/articles/" }, { name: current.name }]
            : [{ name: "ホーム", path: "/" }, { name: "読みもの" }]
        )}
      />
      {pageContext.noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="alternate" type="application/rss+xml" title={ARTICLES_FEED_TITLE} href={ARTICLES_FEED_PATH} />
    </>
  );
};

export default SongArticlesIndexPage;
