import React, { useEffect, useMemo, useState } from "react";
import { HeadFC } from "gatsby";
import Layout from "../components/modules/layout";
import SEO from "../components/SEO";
import { buildBreadcrumbList } from "../utils/jsonLd";
import { normalizeSongName } from "../utils/songMatcher";
import { trackEvent } from "../utils/analytics";
import { GlassCard, Kicker, GlassCardAccent } from "../components/redesign";

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

/** カテゴリごとの見出しラベル・GlassCardのhoverアクセント・バッジ配色(bx-blue/bx-yellow/bx-blueLight系) */
const KIND_META: Record<
  Hit["kind"],
  {
    label: string;
    badge: string;
    accent: GlassCardAccent;
    badgeClass: string;
    kickerClass: string;
  }
> = {
  song: {
    label: "楽曲",
    badge: "曲",
    accent: "blue",
    badgeClass: "border-bx-blue text-bx-blue",
    kickerClass: "text-bx-blue",
  },
  album: {
    label: "アルバム",
    badge: "盤",
    accent: "blueLight",
    badgeClass: "border-bx-blueLight text-bx-blueLight",
    kickerClass: "text-bx-blueLight",
  },
  live: {
    label: "LIVE",
    badge: "L",
    accent: "yellow",
    badgeClass: "border-bx-yellow text-bx-yellow",
    kickerClass: "text-bx-yellow",
  },
  place: {
    label: "ロケ地",
    badge: "地",
    accent: "blueDeep",
    badgeClass: "border-bx-blueDeep text-bx-blueDeep",
    kickerClass: "text-bx-blueDeep",
  },
};

const GROUP_ORDER: Hit["kind"][] = ["song", "album", "live", "place"];

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

  // songStats は代表曲(副題違い等を名寄せした後の最古リリース)のみを含むため、
  // 非代表songUuidはここに存在しない。songName でも引けるようフォールバック用の
  // マップを作っておく(discography/enhanced-timeline-item.tsx と同じ解決方式)。
  const songSlugByUuid = useMemo(() => {
    const byUuid = new Map<string, string>();
    const byName = new Map<string, string>();
    for (const s of songStats?.songStats ?? []) {
      if (s.songUuid && s.slug) byUuid.set(s.songUuid, s.slug);
      if (s.songName && s.slug) byName.set(s.songName, s.slug);
    }
    return { byUuid, byName };
  }, [songStats]);

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

    // Songs（disc 内 songs + songStats 両方をマージ。代表slugをキーにユニーク化）
    const seenSongSlugs = new Set<string>();
    for (const d of discography) {
      for (const s of d.songs ?? []) {
        const nameLower = s.songName.toLowerCase();
        const exact = nameLower === qLower;
        const partial = nameLower.includes(qLower);
        const norm = normalizeSongName(s.songName).includes(qNorm);
        if (!(exact || partial || (qNorm && norm))) continue;
        const stat = songStats.songStats.find((x) => x.songUuid === s.songUuid);
        // s.slug は収録盤ごとの生データのslug。楽曲詳細ページ(/songs/<slug>/)は
        // 代表曲(songStats、副題違い等の名寄せ後の最古リリース)にしか生成されない
        // ため、そのまま使うとライブ盤等の副次収録から404になる。songStatsには
        // 代表曲のみが載るため、非代表songUuidはuuid一致では引けず songName で
        // フォールバックする。songStatsの代表slugへ解決し、同一代表曲が複数収録に
        // 跨るケースの重複表示も防ぐ。
        const resolvedSlug =
          stat?.slug ??
          songSlugByUuid.byUuid.get(s.songUuid) ??
          songSlugByUuid.byName.get(s.songName) ??
          s.slug;
        if (seenSongSlugs.has(resolvedSlug)) continue;
        seenSongSlugs.add(resolvedSlug);
        results.push({
          kind: "song",
          songSlug: resolvedSlug,
          name: s.songName,
          subtitle: `${d.title}${
            stat ? ` / LIVE ${stat.totalPlays}回` : ""
          }`,
          score: exact ? 100 : partial ? 80 : 60,
        });
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
  }, [query, discography, lives, places, songStats, songSlugByUuid]);

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

  // 表示上限200件はカテゴリ見出しでグルーピングする前のフラットな件数に対して適用する
  const limited = filtered.slice(0, 200);
  const groupedLimited = GROUP_ORDER.map((kind) => ({
    kind,
    items: limited.filter((h) => h.kind === kind),
  })).filter((g) => g.items.length > 0);

  return (
    <Layout title="検索">
      <main className="container mx-auto px-3 sm:px-4 py-4 max-w-4xl text-bx-ink">
        <header className="mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 tracking-tight text-bx-ink">
            検索
          </h1>
          <p className="text-xs text-bx-ink3">
            楽曲・アルバム・LIVE・ロケ地を横断検索します
          </p>
        </header>

        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="例: 第六感 / 文明ココロミー / 武道館 / 2024"
          className="w-full px-3 py-2 mb-3 text-base sm:text-sm rounded bg-bx-surface/5 border border-bx-line text-bx-ink placeholder:text-bx-ink2 focus:outline-none focus:border-bx-blue focus:ring-1 focus:ring-bx-blue/40"
        />

        {error && (
          <p className="text-red-400 text-xs mb-2">読み込みエラー: {error}</p>
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
              className={`px-2 py-1 rounded border transition-colors ${
                tab === k
                  ? "border-bx-yellow text-bx-yellow bg-bx-surface/5"
                  : "border-bx-line text-bx-ink3 bg-bx-surface/5 hover:border-bx-blue"
              }`}
              onClick={() => setTab(k)}
            >
              {label}
            </button>
          ))}
        </nav>

        {!isLoaded && !error && (
          <div className="rounded-lg border border-bx-line bg-bx-surface/5 p-6 text-center">
            <div className="inline-block w-6 h-6 border-2 border-bx-line border-t-bx-yellow rounded-full animate-spin mb-2" />
            <p className="text-bx-ink2 text-sm">データを読み込み中…</p>
          </div>
        )}

        {/* 空状態: サンプルクエリで検索の使い方を提示する */}
        {isLoaded && !query.trim() && (
          <div className="rounded-lg border border-bx-line bg-bx-surface/5 p-4">
            <p className="text-xs text-bx-ink3 mb-2">
              曲名・アルバム名・公演名・会場名・年号などで検索できます。例:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="px-3 py-1 text-xs rounded-full border border-bx-line bg-bx-surface/5 text-bx-ink3 hover:border-bx-blue transition-colors"
                  onClick={() => setQuery(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {groupedLimited.map(({ kind, items }) => (
            <section key={kind}>
              <Kicker color={KIND_META[kind].kickerClass} className="mb-2">
                {KIND_META[kind].label}
              </Kicker>
              <ul className="space-y-2">
                {items.map((h, i) => (
                  <li key={`${h.kind}-${i}`}>
                    <ResultLink hit={h} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {query && filtered.length === 0 && discography && (
          <p className="text-bx-ink3 text-xs mt-3">該当なし</p>
        )}
        {filtered.length > 200 && (
          <p className="text-bx-ink3 text-xs mt-3">
            上位 200 件のみ表示中（全 {filtered.length} 件）
          </p>
        )}
      </main>
    </Layout>
  );
};

const KindBadge: React.FC<{ kind: Hit["kind"] }> = ({ kind }) => {
  const meta = KIND_META[kind];
  return (
    <span
      className={`inline-block w-6 text-center text-[10px] py-0.5 rounded-full border mr-2 ${meta.badgeClass}`}
    >
      {meta.badge}
    </span>
  );
};

const ResultLink: React.FC<{ hit: Hit }> = ({ hit }) => {
  const inner = (
    <div className="flex items-center px-2 py-1.5 text-xs">
      <KindBadge kind={hit.kind} />
      <span className="truncate">
        <span className="text-bx-ink">{hit.name}</span>
        {hit.subtitle && (
          <span className="ml-2 text-bx-ink3">{hit.subtitle}</span>
        )}
      </span>
    </div>
  );
  const accent = KIND_META[hit.kind].accent;
  if (hit.kind === "song") {
    return (
      <GlassCard to={`/songs/${hit.songSlug}/`} accent={accent} className="block">
        {inner}
      </GlassCard>
    );
  }
  if (hit.kind === "live") {
    const anchor = hit.liveItemSlug
      ? `live-item-${hit.liveItemSlug}`
      : `live-${hit.liveSlug}`;
    return (
      <GlassCard to={`/live/#${anchor}`} accent={accent} className="block">
        {inner}
      </GlassCard>
    );
  }
  if (hit.kind === "album") {
    return (
      <GlassCard to={`/discography/#disc-${hit.albumSlug}`} accent={accent} className="block">
        {inner}
      </GlassCard>
    );
  }
  // place
  return (
    <GlassCard to={`/place/#place-${hit.placeSlug}`} accent={accent} className="block">
      {inner}
    </GlassCard>
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
