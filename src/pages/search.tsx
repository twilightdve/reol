import React, { useEffect, useMemo, useState } from "react";
import { HeadFC, Link } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { normalizeSongName } from "../utils/songMatcher";
import { trackEvent } from "../utils/analytics";

/** 空状態で提示するサンプルクエリ(placeholderの例と揃える) */
const SAMPLE_QUERIES = ["第六感", "文明ココロミー", "武道館", "2024"];

// ----- types -----
type DiscographyEntry = {
  discographyUuid: string;
  slug: string;
  title: string;
  name?: string;
  releaseDate?: string;
  format?: string;
  songs?: { songUuid: string; slug: string; songName: string }[];
};
type LiveEntry = {
  liveUuid: string;
  slug: string;
  title: string;
  name?: string;
  date?: string;
  items?: {
    liveItemUuid: string;
    slug: string;
    liveItemName: string | null;
    date: string;
    place: string | null;
    setList?: {
      liveItemSongName: string;
      songUuid?: string | null;
    }[];
  }[];
};
type Place = {
  placeUuid: string;
  slug: string;
  type?: string;
  title: string;
  url?: string;
  items?: { placeItemUuid: string; name: string; address?: string }[];
};
type SongStatEntry = {
  songUuid: string;
  slug: string;
  songName: string;
  discographyUuid: string | null;
  totalPlays: number;
  firstPlayedDate: string | null;
  lastPlayedDate: string | null;
};
type SongStatsPayload = { songStats: SongStatEntry[] };

// 検索カテゴリ
type Tab = "all" | "songs" | "albums" | "lives" | "places";

// 共通の結果アイテム
type Hit =
  | { kind: "song"; songSlug: string; name: string; subtitle: string; score: number }
  | { kind: "album"; albumSlug: string; name: string; subtitle: string; score: number }
  | { kind: "live"; liveSlug: string; liveItemSlug?: string; name: string; subtitle: string; score: number }
  | { kind: "place"; placeSlug: string; name: string; subtitle: string; score: number };

const fetchJson = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url}: ${r.status}`);
  return r.json();
};

const SearchPage: React.FC = () => {
  const [discography, setDiscography] = useState<DiscographyEntry[] | null>(null);
  const [lives, setLives] = useState<LiveEntry[] | null>(null);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [songStats, setSongStats] = useState<SongStatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  // URL ?q= 対応
  useEffect(() => {
    if (typeof window === "undefined") return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);

  // オープニングが付与したスクロールロックを解除（クライアントナビ時の保険）
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.classList.remove("overflow-hidden");
    document.documentElement.style.overflow = "";
  }, []);

  useEffect(() => {
    Promise.all([
      fetchJson<DiscographyEntry[]>("/static/data/discography.json"),
      fetchJson<LiveEntry[]>("/static/data/live.json"),
      fetchJson<Place[]>("/static/data/places.json"),
      fetchJson<SongStatsPayload>("/static/data/songStats.json"),
    ])
      .then(([discArr, liveArr, placeArr, stats]) => {
        setDiscography(discArr);
        setLives(liveArr);
        setPlaces(placeArr);
        setSongStats(stats);
      })
      .catch((e) => setError(String(e)));
  }, []);

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim();
    if (!q || !discography || !lives || !places || !songStats) return [];
    const qNorm = normalizeSongName(q);
    const qLower = q.toLowerCase();

    const results: Hit[] = [];

    // Albums
    for (const d of discography) {
      const title = d.title ?? "";
      const titleLower = title.toLowerCase();
      if (titleLower.includes(qLower)) {
        results.push({
          kind: "album",
          albumSlug: d.slug,
          name: title,
          subtitle: `${d.format ?? ""} ${d.releaseDate ?? ""}`.trim(),
          score: titleLower === qLower ? 100 : 70,
        });
      }
    }

    // Songs（disc 内 songs + songStats 両方をマージ。songUuid をキーにユニーク化）
    const seenSongIds = new Set<string>();
    for (const d of discography) {
      for (const s of d.songs ?? []) {
        if (seenSongIds.has(s.songUuid)) continue;
        const nameLower = s.songName.toLowerCase();
        const exact = nameLower === qLower;
        const partial = nameLower.includes(qLower);
        const norm = normalizeSongName(s.songName).includes(qNorm);
        if (exact || partial || (qNorm && norm)) {
          seenSongIds.add(s.songUuid);
          const stat = songStats.songStats.find((x) => x.songUuid === s.songUuid);
          results.push({
            kind: "song",
            songSlug: s.slug,
            name: s.songName,
            subtitle: `${d.title}${
              stat ? ` / LIVE ${stat.totalPlays}回` : ""
            }`,
            score: exact ? 100 : partial ? 80 : 60,
          });
        }
      }
    }

    // Lives
    for (const l of lives) {
      const title = l.title ?? "";
      const titleLower = title.toLowerCase();
      const dateHit = (l.date ?? "").includes(qLower);
      if (titleLower.includes(qLower) || dateHit) {
        results.push({
          kind: "live",
          liveSlug: l.slug,
          name: title,
          subtitle: l.date ?? "",
          score: titleLower === qLower ? 100 : 75,
        });
      }
      // セトリ内検索: 部分一致だけ
      for (const item of l.items ?? []) {
        const placeMatch = item.place?.toLowerCase().includes(qLower);
        const itemNameMatch = item.liveItemName?.toLowerCase().includes(qLower);
        // セトリスト内の曲名一致
        const songMatch = (item.setList ?? []).some((sg) => {
          const n = sg.liveItemSongName?.toLowerCase() ?? "";
          if (!n) return false;
          return n.includes(qLower) || (qNorm && normalizeSongName(sg.liveItemSongName).includes(qNorm));
        });
        if (placeMatch || itemNameMatch || songMatch) {
          results.push({
            kind: "live",
            liveSlug: l.slug,
            liveItemSlug: item.slug,
            name: `${title}${item.liveItemName ? ` / ${item.liveItemName}` : ""}`,
            subtitle: `${item.date}${item.place ? `＠${item.place}` : ""}${songMatch ? " ／ セトリ内ヒット" : ""}`,
            score: songMatch ? 70 : 65,
          });
        }
      }
    }

    // Places (MV/PV ロケ地DB)
    for (const p of places) {
      const name = p.title ?? "";
      const nameLower = name.toLowerCase();
      const itemHit = (p.items ?? []).find(
        (it) =>
          it.name?.toLowerCase().includes(qLower) ||
          it.address?.toLowerCase().includes(qLower)
      );
      if (nameLower.includes(qLower) || itemHit) {
        results.push({
          kind: "place",
          placeSlug: p.slug,
          name: `${p.type ? `[${p.type}] ` : ""}${name}`,
          subtitle: itemHit
            ? `${itemHit.name}${itemHit.address ? ` / ${itemHit.address}` : ""}`
            : `${(p.items ?? []).length} ロケ地`,
          score: nameLower === qLower ? 100 : 65,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }, [query, discography, lives, places, songStats]);

  const filtered = useMemo<Hit[]>(() => {
    if (tab === "all") return hits;
    const map: Record<Tab, Hit["kind"] | "all"> = {
      all: "all",
      songs: "song",
      albums: "album",
      lives: "live",
      places: "place",
    };
    return hits.filter((h) => h.kind === map[tab]);
  }, [hits, tab]);

  const tabCount = (k: Hit["kind"]) => hits.filter((h) => h.kind === k).length;

  const isLoaded = !!(discography && lives && places && songStats);
  // 件数はデータロード完了かつクエリ入力後のみ表示する。
  // 初期表示で「すべて(0)」と並ぶと"データがないサイト"に見えてしまうため。
  const showCounts = isLoaded && query.trim().length > 0;
  const tabLabel = (base: string, count: number) =>
    showCounts ? `${base}(${count})` : base;

  // 検索クエリの計測(入力が落ち着いてから送信。0件クエリも需要調査のため記録)
  useEffect(() => {
    const q = query.trim();
    if (!q || !isLoaded) return;
    const timer = setTimeout(() => {
      trackEvent("search_query", {
        category: "search",
        label: q,
        result_count: hits.length,
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [query, isLoaded, hits.length]);

  return (
    <Layout title="検索">
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-4xl text-gray-800">
        <header className="mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-gray-900">
            検索
          </h1>
          <p className="text-xs text-gray-600">
            楽曲・アルバム・LIVE・ロケ地を横断検索します
          </p>
        </header>

        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: 第六感 / 文明ココロミー / 武道館 / 2024"
          className="w-full px-3 py-2 mb-3 text-base sm:text-sm rounded bg-white border border-gray-400 text-gray-900 shadow-sm"
        />

        {error && (
          <p className="text-red-600 text-xs mb-2">読み込みエラー: {error}</p>
        )}

        <nav className="flex gap-1 mb-3 text-xs">
          {(
            [
              ["all", tabLabel("すべて", hits.length)],
              ["songs", tabLabel("楽曲", tabCount("song"))],
              ["albums", tabLabel("アルバム", tabCount("album"))],
              ["lives", tabLabel("LIVE", tabCount("live"))],
              ["places", tabLabel("ロケ地", tabCount("place"))],
            ] as [Tab, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={`px-2 py-1 rounded border ${
                tab === k
                  ? "border-amber-500 text-amber-700 bg-amber-50"
                  : "border-gray-300 text-gray-700 bg-white hover:border-gray-500"
              }`}
              onClick={() => setTab(k)}
            >
              {label}
            </button>
          ))}
        </nav>

        {!isLoaded && !error && (
          <div className="rounded-lg border border-gray-300 bg-white/80 p-6 text-center">
            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-amber-500 rounded-full animate-spin mb-2" />
            <p className="text-gray-700 text-sm">データを読み込み中…</p>
          </div>
        )}

        {/* 空状態: サンプルクエリで検索の使い方を提示する */}
        {isLoaded && !query.trim() && (
          <div className="rounded-lg border border-gray-300 bg-white/80 p-4">
            <p className="text-xs text-gray-600 mb-2">
              曲名・アルバム名・公演名・会場名・年号などで検索できます。例:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="px-3 py-1 text-xs rounded-full border border-amber-400 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                  onClick={() => setQuery(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <ul className="space-y-1">
          {filtered.slice(0, 200).map((h, i) => (
            <li
              key={`${h.kind}-${i}`}
              className="rounded border border-gray-300 bg-white hover:border-gray-500 shadow-sm"
            >
              <ResultLink hit={h} />
            </li>
          ))}
        </ul>

        {query && filtered.length === 0 && discography && (
          <p className="text-gray-600 text-xs mt-3">該当なし</p>
        )}
        {filtered.length > 200 && (
          <p className="text-gray-600 text-xs mt-3">
            上位 200 件のみ表示中（全 {filtered.length} 件）
          </p>
        )}
      </main>
    </Layout>
  );
};

const KindBadge: React.FC<{ kind: Hit["kind"] }> = ({ kind }) => {
  const labels: Record<Hit["kind"], string> = {
    song: "曲",
    album: "盤",
    live: "L",
    place: "地",
  };
  const colors: Record<Hit["kind"], string> = {
    song: "bg-emerald-600 text-white",
    album: "bg-purple-600 text-white",
    live: "bg-amber-600 text-white",
    place: "bg-sky-600 text-white",
  };
  return (
    <span
      className={`inline-block w-6 text-center text-[10px] py-0.5 rounded mr-2 ${colors[kind]}`}
    >
      {labels[kind]}
    </span>
  );
};

const ResultLink: React.FC<{ hit: Hit }> = ({ hit }) => {
  const inner = (
    <div className="flex items-center px-2 py-1.5 text-xs">
      <KindBadge kind={hit.kind} />
      <span className="truncate">
        <span className="text-gray-900">{hit.name}</span>
        {hit.subtitle && (
          <span className="ml-2 text-gray-500">{hit.subtitle}</span>
        )}
      </span>
    </div>
  );
  if (hit.kind === "song") {
    return (
      <Link
        to={`/songs/stats/?songSlug=${hit.songSlug}#song-${hit.songSlug}`}
        className="block hover:bg-amber-50/70"
      >
        {inner}
      </Link>
    );
  }
  if (hit.kind === "live") {
    const anchor = hit.liveItemSlug
      ? `live-item-${hit.liveItemSlug}`
      : `live-${hit.liveSlug}`;
    return (
      <Link to={`/live/#${anchor}`} className="block hover:bg-amber-50/70">
        {inner}
      </Link>
    );
  }
  if (hit.kind === "album") {
    return (
      <Link
        to={`/discography/#disc-${hit.albumSlug}`}
        className="block hover:bg-amber-50/70"
      >
        {inner}
      </Link>
    );
  }
  // place
  return (
    <Link
      to={`/place/#place-${hit.placeSlug}`}
      className="block hover:bg-amber-50/70"
    >
      {inner}
    </Link>
  );
};

export default SearchPage;

export const Head: HeadFC = () => (
  <SEO
    title="検索"
    description="Reolの楽曲・アルバム・LIVE・ロケ地を横断検索。曲名・公演名・会場名・年号からReolの活動を探せます。"
    path="/search/"
    jsonLd={buildBreadcrumbList([
      { name: "ホーム", path: "/" },
      { name: "検索", path: "/search/" },
    ])}
  />
);
