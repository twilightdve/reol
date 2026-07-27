/**
 * /collection/ — 新規コンテンツ案C「コレクション台帳」(plan/legit-improvement-plan.md 5章)
 *
 * DISCOGRAPHY に全リリースが揃っているが、「自分が何を持っているか/聴いたか」を
 * 記録する場所が無い。所有(視聴済み)登録をlocalStorageだけで完結させ、
 * アカウント・モデレーション無しでコンプ率を可視化する。
 */
import React, { useEffect, useMemo, useState } from "react";
import { graphql, HeadFC, Link, PageProps } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { Kicker } from "../components/redesign";
import { buildBreadcrumbList } from "../utils/jsonLd";

type DiscographyRow = {
  discographyUuid: string;
  title: string;
  slug: string;
  releaseDate: string | null;
  format: string | null;
  siteUrl: string | null;
  songs: { downloadUrl: string | null }[];
};

type CollectionPageData = {
  discography: {
    discographyWithSongs: DiscographyRow[];
  };
};

type Group = "album" | "single" | "video" | "other";

const GROUP_LABEL: Record<Group, string> = {
  album: "アルバム",
  single: "シングル",
  video: "映像",
  other: "その他",
};

const groupOf = (format: string | null): Group => {
  switch (format) {
    case "fullAL":
    case "miniAL":
    case "EP":
    case "LP":
      return "album";
    case "SG":
    case "配信SG":
      return "single";
    case "DVD/BD":
      return "video";
    default:
      return "other";
  }
};

const STORAGE_KEY = "reol-collection-owned";

const loadOwned = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
};

const saveOwned = (owned: Set<string>) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(Array.from(owned))
    );
  } catch {
    // ignore (Safari Private mode 等)
  }
};

const formatDate = (iso: string | null): string => {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : iso;
};

const CollectionPage: React.FC<PageProps<CollectionPageData>> = ({ data }) => {
  const releases = useMemo(
    () =>
      [...data.discography.discographyWithSongs].sort((a, b) =>
        (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "")
      ),
    [data]
  );

  // マウント前(SSR/初回描画)はlocalStorageを読めないため空集合。
  // マウント後に読み込み、hydration mismatchを避ける(他ページのパターンに準拠)。
  const [mounted, setMounted] = useState(false);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  useEffect(() => {
    setOwned(loadOwned());
    setMounted(true);
  }, []);

  const toggleOwned = (uuid: string) => {
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      saveOwned(next);
      return next;
    });
  };

  const [groupFilter, setGroupFilter] = useState<Group | "all">("all");

  const grouped = useMemo(() => {
    const m = new Map<Group, DiscographyRow[]>();
    for (const r of releases) {
      const g = groupOf(r.format);
      const list = m.get(g) ?? [];
      list.push(r);
      m.set(g, list);
    }
    return m;
  }, [releases]);

  const visibleReleases = useMemo(
    () =>
      groupFilter === "all"
        ? releases
        : releases.filter((r) => groupOf(r.format) === groupFilter),
    [releases, groupFilter]
  );

  const totalOwned = releases.filter((r) => owned.has(r.discographyUuid)).length;
  const totalRate =
    releases.length > 0 ? Math.round((totalOwned / releases.length) * 100) : 0;

  return (
    <Layout title="コレクション台帳">
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-2xl text-bx-ink">
        <header className="mb-5">
          <Kicker color="text-bx-blue">COLLECTION</Kicker>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            コレクション台帳
          </h1>
          <p className="text-xs text-bx-ink3">
            持っている/聴いたリリースにチェックを付けて、コンプ率を確認できます。
            記録はこの端末のブラウザ内(localStorage)だけに保存され、送信されません。
          </p>
        </header>

        <section className="mb-5 rounded-lg border border-bx-line bg-bx-surface/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-bx-ink3">全体コンプ率</span>
            <span className="text-sm font-bold text-bx-blue tabular-nums">
              {totalOwned} / {releases.length} ・ {totalRate}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-bx-line/50 overflow-hidden">
            <div
              className="h-full bg-bx-blue transition-all"
              style={{ width: `${totalRate}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {(Object.keys(GROUP_LABEL) as Group[]).map((g) => {
              const list = grouped.get(g) ?? [];
              const ownedCount = list.filter((r) =>
                owned.has(r.discographyUuid)
              ).length;
              const rate =
                list.length > 0
                  ? Math.round((ownedCount / list.length) * 100)
                  : 0;
              return (
                <div key={g} className="text-center">
                  <div className="text-[10px] text-bx-ink3">
                    {GROUP_LABEL[g]}
                  </div>
                  <div className="text-xs font-bold text-bx-ink tabular-nums">
                    {ownedCount}/{list.length} ・ {rate}%
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "すべて" },
              { id: "album", label: GROUP_LABEL.album },
              { id: "single", label: GROUP_LABEL.single },
              { id: "video", label: GROUP_LABEL.video },
              { id: "other", label: GROUP_LABEL.other },
            ] as { id: Group | "all"; label: string }[]
          ).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setGroupFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                groupFilter === f.id
                  ? "bg-bx-ink text-bx-bg"
                  : "bg-bx-bg text-bx-ink3 border border-bx-line hover:bg-bx-surface/5"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {visibleReleases.map((r) => {
            const isOwned = mounted && owned.has(r.discographyUuid);
            const listenUrl = r.songs.find((s) => s.downloadUrl)?.downloadUrl;
            return (
              <li
                key={r.discographyUuid}
                className={`rounded-lg border p-3 flex items-center gap-3 transition-colors ${
                  isOwned
                    ? "border-bx-blue bg-bx-blue/5"
                    : "border-bx-line bg-bx-surface/5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleOwned(r.discographyUuid)}
                  aria-pressed={isOwned}
                  aria-label={
                    isOwned
                      ? `${r.title} を未所持に戻す`
                      : `${r.title} を所持済みにする`
                  }
                  className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-colors ${
                    isOwned
                      ? "border-bx-blue bg-bx-blue text-bx-bg"
                      : "border-bx-line text-transparent hover:border-bx-blue"
                  }`}
                >
                  ✓
                </button>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-bx-ink truncate">
                    {r.title}
                  </div>
                  <div className="text-[11px] text-bx-ink3">
                    {r.format ?? "その他"}
                    {r.releaseDate && ` ・ ${formatDate(r.releaseDate)}`}
                  </div>
                </div>
                {!isOwned && (r.siteUrl || listenUrl) && (
                  <a
                    href={r.siteUrl ?? listenUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 text-[11px] font-bold text-bx-blueLight hover:text-bx-blue whitespace-nowrap"
                  >
                    {r.siteUrl ? "公式で見る" : "視聴する"} →
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-xs text-bx-ink2">
          <Link
            to="/discography/"
            className="underline underline-offset-2 hover:text-bx-blue"
          >
            ディスコグラフィ一覧へ →
          </Link>
        </p>
      </main>
    </Layout>
  );
};

export default CollectionPage;

export const query = graphql`
  query CollectionPageData {
    discography {
      discographyWithSongs {
        discographyUuid
        title
        slug
        releaseDate
        format
        siteUrl
        songs {
          downloadUrl
        }
      }
    }
  }
`;

export const Head: HeadFC = () => (
  <SEO
    title="コレクション台帳"
    description="Reolのリリースを所有/視聴済みチェックで記録し、コンプ率を確認できます。記録は端末内のみに保存されます。"
    path="/collection/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "コレクション台帳", path: "/collection/" },
    ])}
  />
);
