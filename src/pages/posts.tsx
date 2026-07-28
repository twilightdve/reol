/**
 * /posts/ — 新規コンテンツ案J「関連ポスト独立セクション」
 * (plan/legit-improvement-plan.md 5章)
 *
 * discography/live/liveItem に散らばる関連ポスト(X埋め込み)を1つの
 * 時系列インデックスとして横断表示する。データは gatsby-node.ts の
 * createPostsIndexNode が事前生成する static/data/posts-index.json。
 *
 * 投稿者の分類(本人/公式/メディア/ファン)はハンドル名ベースの
 * ヒューリスティックで、確認が取れたハンドルのみ「本人/公式/メディア」に
 * 分類される(gatsby-node.ts側のリストで管理)。それ以外は「ファン」扱い。
 */
import React, { useEffect, useMemo, useState } from "react";
import { HeadFC, Link } from "gatsby";
import { Tweet } from "react-twitter-widgets";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import { buildBreadcrumbList } from "../utils/jsonLd";
import LazyComponent from "../components/modules/LazyComponent";
import { useTheme } from "../hooks/useTheme";
import { trackFilterChange } from "../utils/analytics";

type PostCategory = "本人" | "公式" | "メディア" | "ファン";
type SourceType = "discography" | "live" | "liveItem";

type PostEntry = {
  id: string;
  handle: string | null;
  displayName: string | null;
  postedAt: string | null;
  category: PostCategory;
  sourceType: SourceType;
  sourceTitle: string;
  sourceSlug: string;
};

type PostsIndexData = { posts: PostEntry[] };

const fetchJson = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
};

const SOURCE_TYPE_LABELS: Record<"ALL" | SourceType, string> = {
  ALL: "すべて",
  discography: "楽曲",
  live: "ライブ",
  liveItem: "公演",
};
const SOURCE_TYPE_KEYS: ("ALL" | SourceType)[] = ["ALL", "discography", "live", "liveItem"];

const CATEGORY_KEYS: ("ALL" | PostCategory)[] = ["ALL", "本人", "公式", "メディア", "ファン"];

const PAGE_SIZE = 20;

const PostsPage: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<PostsIndexData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"ALL" | SourceType>("ALL");
  const [category, setCategory] = useState<"ALL" | PostCategory>("ALL");
  const [year, setYear] = useState<string>("ALL");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchJson<PostsIndexData>("/static/data/posts-index.json")
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  const years = useMemo(() => {
    if (!data) return [];
    const set = new Set<string>();
    for (const p of data.posts) {
      if (p.postedAt) set.add(p.postedAt.slice(0, 4));
    }
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.posts.filter((p) => {
      if (sourceType !== "ALL" && p.sourceType !== sourceType) return false;
      if (category !== "ALL" && p.category !== category) return false;
      if (year !== "ALL" && p.postedAt?.slice(0, 4) !== year) return false;
      if (q && !p.sourceTitle.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [data, sourceType, category, year, query]);

  const visiblePosts = filtered.slice(0, visibleCount);

  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  return (
    <Layout title="関連ポスト">
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-4">
          <Kicker color="text-bx-blue">POSTS</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            関連ポスト
          </h1>
          <p className="text-xs text-bx-ink3 leading-relaxed">
            楽曲・ライブ・各公演ページに掲載している関連ポストを、時系列で横断して見られるようにしたものです。
            投稿者の分類は簡易的なもので、確認できたハンドルのみ「本人/公式/メディア」に分類しています。
          </p>
        </header>

        {error && (
          <p className="text-sm text-red-400 mb-4">読み込みに失敗しました: {error}</p>
        )}

        {!data && !error && (
          <p className="text-xs text-bx-ink3 mb-4">読み込み中...</p>
        )}

        {data && (
          <>
            {/* フィルタ */}
            <div className="sticky top-0 z-20 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 bg-bx-bg/90 backdrop-blur border-b border-bx-line space-y-2 mb-4">
              <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="種別で絞り込み">
                {SOURCE_TYPE_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={sourceType === k}
                    onClick={() => {
                      setSourceType(k);
                      resetPaging();
                      trackFilterChange("posts", "source_type", k);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      sourceType === k
                        ? "bg-bx-blue text-bx-bg border-bx-blue"
                        : "bg-bx-surface/5 text-bx-ink border-bx-line hover:border-bx-blue"
                    }`}
                  >
                    {SOURCE_TYPE_LABELS[k]}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="分類で絞り込み">
                {CATEGORY_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={category === k}
                    onClick={() => {
                      setCategory(k);
                      resetPaging();
                      trackFilterChange("posts", "category", k);
                    }}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      category === k
                        ? "bg-bx-yellow text-bx-bg border-bx-yellow"
                        : "bg-bx-surface/5 text-bx-ink border-bx-line hover:border-bx-blue"
                    }`}
                  >
                    {k === "ALL" ? "すべて" : k}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    resetPaging();
                  }}
                  className="px-2 py-1.5 text-xs rounded-md border border-bx-line bg-bx-surface/5 text-bx-ink"
                >
                  <option value="ALL">全期間</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}年
                    </option>
                  ))}
                </select>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    resetPaging();
                  }}
                  placeholder="曲名・ライブ名で検索"
                  className="flex-1 min-w-0 px-3 py-1.5 text-xs rounded-md border border-bx-line bg-bx-surface/5 text-bx-ink"
                />
              </div>
              <p className="text-[11px] text-bx-ink3">{filtered.length}件</p>
            </div>

            {/* 一覧 */}
            {filtered.length === 0 ? (
              <p className="text-sm text-bx-ink3 py-8 text-center">
                該当する関連ポストが見つかりませんでした。
              </p>
            ) : (
              <ul className="space-y-4">
                {visiblePosts.map((p) => (
                  <li
                    key={`${p.sourceType}-${p.id}`}
                    className="rounded-lg border border-bx-line bg-bx-surface/5 p-3"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <Link
                        to={p.sourceSlug}
                        className="text-xs font-bold text-bx-blue hover:underline truncate"
                      >
                        {p.sourceTitle}
                      </Link>
                      <span className="flex-shrink-0 flex items-center gap-1.5">
                        {p.postedAt && (
                          <span className="text-[10px] text-bx-ink3 tabular-nums">
                            {p.postedAt}
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.category === "本人"
                              ? "bg-bx-yellow text-bx-bg"
                              : p.category === "公式" || p.category === "メディア"
                              ? "bg-bx-blue text-bx-bg"
                              : "border border-bx-line text-bx-ink3"
                          }`}
                        >
                          {p.category}
                        </span>
                      </span>
                    </div>
                    <LazyComponent>
                      <Tweet tweetId={p.id} options={{ theme }} />
                    </LazyComponent>
                  </li>
                ))}
              </ul>
            )}

            {visibleCount < filtered.length && (
              <div className="flex justify-center mt-6">
                <button
                  type="button"
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="px-6 py-2 text-sm font-bold rounded-lg border border-bx-line hover:border-bx-blue transition-colors"
                >
                  もっと見る ({filtered.length - visibleCount}件)
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </Layout>
  );
};

export default PostsPage;

export const Head: HeadFC = () => (
  <SEO
    title="関連ポスト"
    description="Reolに関する楽曲・ライブ・各公演の関連ポストを時系列で横断して見られる一覧ページです。"
    path="/posts/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "関連ポスト", path: "/posts/" },
    ])}
  />
);
