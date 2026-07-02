import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// d3-force ships without bundled type declarations; the runtime API used here
// is a single function so the implicit-any is acceptable.
// @ts-expect-error -- no @types/d3-force installed; minimal runtime usage only.
import { forceCollide, forceRadial } from "d3-force";
import type { CGraphData, CGraphLink, CGraphNode } from "./types";
import { getRoleConfig } from "./role-config";

/** Stable id of the Reol artist node (centre of the graph). */
const REOL_ID = "artist:Reol";
/** Synthetic role used to anchor collapsed non-Reol artists to Reol. */
const ANCHOR_ROLE = "_anchor";

/** "#rrggbb" or "rgb(...)" / "rgba(...)" を任意 alpha の rgba() に変換。 */
const withAlpha = (color: string, alpha: number): string => {
  const a = Math.max(0, Math.min(1, alpha));
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const h =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const parts = m[1].split(",").map((s) => s.trim());
    const [r, g, b] = parts;
    return `rgba(${r},${g},${b},${a})`;
  }
  return color;
};

type Props = {
  data: CGraphData;
  /** Names of artists whose links should be highlighted. */
  enabledRoles: Set<string>;
  /** Substring search over node names (case-insensitive). */
  query: string;
  yearRange: [number, number] | null;
  /** Min year and max year of all songs, for fixing pinned nodes. */
  onNodeSelect?: (node: CGraphNode | null) => void;
  /** Externally-controlled selected node id (e.g. parent inspector × button clears it). */
  selectedNodeId?: string | null;
  /** 遷移元ノード ID。選択ノードとは別にリングでマークし、
   * どこからジャンプしてきたかを視覚的に示す。 */
  previousNodeId?: string | null;
  /** Hide artist nodes far from Reol (BFS distance >= 3). */
  hideFarNodes?: boolean;
};

type ForceGraph2DLike = React.ComponentType<any>;

/**
 * SSR-safe loader: react-force-graph-2d uses the DOM, so we import it on the
 * client only. While loading we render a placeholder.
 */
const useForceGraph2D = (): ForceGraph2DLike | null => {
  const [Comp, setComp] = useState<ForceGraph2DLike | null>(null);
  useEffect(() => {
    let cancelled = false;
    import("react-force-graph-2d").then((m) => {
      if (!cancelled) setComp(() => m.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return Comp;
};

const CGraphView: FC<Props> = ({
  data,
  enabledRoles,
  query,
  yearRange,
  onNodeSelect,
  selectedNodeId,
  previousNodeId,
  hideFarNodes = false,
}) => {
  const ForceGraph2D = useForceGraph2D();
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 800, h: 600 });
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Sync external (parent-controlled) selection state into internal state.
  // Used so the inspector × button can clear the in-graph highlight.
  useEffect(() => {
    if (selectedNodeId === undefined) return;
    setSelectedId(selectedNodeId);
  }, [selectedNodeId]);
  // Timestamp of the most recent node click. Used to suppress spurious
  // `onBackgroundClick` events that react-force-graph can fire when the
  // parent layout shifts (inspector aside opens → CGraphView container
  // resizes → ForceGraph re-mounts pointer handlers mid-animation).
  const lastNodeClickAtRef = useRef<number>(0);
  // Release-collapse: tracks user-expanded release node ids. Default empty =>
  // all releases collapsed (their songs are hidden and credit edges aggregate
  // onto the release node).
  const [expandedReleases, setExpandedReleases] = useState<Set<string>>(
    () => new Set()
  );

  const toggleRelease = useCallback((id: string) => {
    setExpandedReleases((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // 単発クリックで使う "展開のみ" 用バリアント。
  // ハイライト中にコラプスして実リンクがアンカーリンクへ置き換わるのを避ける。
  const expandRelease = useCallback((id: string) => {
    setExpandedReleases((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Non-Reol artists default to "collapsed": their incident credit edges are
  // hidden and the node sits attached to Reol via a thin synthetic anchor.
  // Clicking the node toggles expansion.
  const [expandedArtists, setExpandedArtists] = useState<Set<string>>(
    () => new Set()
  );

  const toggleArtist = useCallback((id: string) => {
    setExpandedArtists((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandArtist = useCallback((id: string) => {
    setExpandedArtists((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // Category-collapse: tracks user-expanded category node ids. Default empty
  // => all categories collapsed (their releases and songs are hidden; only
  // the category hubs remain attached to Reol).
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set()
  );

  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandCategory = useCallback((id: string) => {
    setExpandedCategories((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // 情報量が多いので初期表示はアーティストノードだけ展開し、
  // release / category は折りたたんでおく。
  // ユーザーが操作した後は尊重したいので、初回データロード時だけ実行する。
  const initializedExpansionRef = useRef(false);
  useEffect(() => {
    if (initializedExpansionRef.current) return;
    if (!data.nodes.length) return;
    const artists: string[] = [];
    for (const n of data.nodes) {
      if (n.kind === "artist" && n.id !== REOL_ID) artists.push(n.id);
    }
    setExpandedArtists(new Set(artists));
    initializedExpansionRef.current = true;
  }, [data]);

  // release id -> child song ids, plus reverse index.
  const releaseChildren = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of data.links) {
      if (l.role !== "release") continue;
      const s = l.source as string;
      const t = l.target as string;
      if (typeof s !== "string" || typeof t !== "string") continue;
      if (s.startsWith("release:") && t.startsWith("song:")) {
        if (!m.has(s)) m.set(s, new Set());
        m.get(s)!.add(t);
      }
    }
    return m;
  }, [data]);

  const songToRelease = useMemo(() => {
    const m = new Map<string, string>();
    for (const [rel, songs] of releaseChildren) {
      for (const s of songs) m.set(s, rel);
    }
    return m;
  }, [releaseChildren]);

  // MB-only な楽曲 (release ノードを持たず、artist→song の "release" リンクで
  // 直接アーティストにぶら下がっているもの) を所有アーティストへ畳むための索引。
  // 初期表示で「アーティスト以外は全部畳む」ためには、release 親を持たない
  // 楽曲も非表示化したいので、その remap 先として使う。
  const songToOwnerArtist = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of data.links) {
      if (l.role !== "release") continue;
      const s = l.source as string;
      const t = l.target as string;
      if (typeof s !== "string" || typeof t !== "string") continue;
      if (s.startsWith("artist:") && t.startsWith("song:")) {
        if (!m.has(t)) m.set(t, s);
      }
    }
    return m;
  }, [data]);

  // category id -> child release ids, plus reverse index.
  const categoryChildren = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of data.links) {
      if (l.role !== "release") continue;
      const s = l.source as string;
      const t = l.target as string;
      if (typeof s !== "string" || typeof t !== "string") continue;
      if (s.startsWith("category:") && t.startsWith("release:")) {
        if (!m.has(s)) m.set(s, new Set());
        m.get(s)!.add(t);
      }
    }
    return m;
  }, [data]);

  const releaseToCategory = useMemo(() => {
    const m = new Map<string, string>();
    for (const [cat, rels] of categoryChildren) {
      for (const r of rels) m.set(r, cat);
    }
    return m;
  }, [categoryChildren]);

  // タイアップカテゴリ → tieup hub の親子関係。`category:タイアップ` を折り
  // たためる対象として扱うために、release 階層と同じ形でインデックス化する。
  const categoryTieupChildren = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of data.links) {
      if (l.role !== "tieup") continue;
      const s = l.source as string;
      const t = l.target as string;
      if (typeof s !== "string" || typeof t !== "string") continue;
      if (s.startsWith("category:") && t.startsWith("tieup:")) {
        if (!m.has(s)) m.set(s, new Set());
        m.get(s)!.add(t);
      }
    }
    return m;
  }, [data]);

  const tieupToCategory = useMemo(() => {
    const m = new Map<string, string>();
    for (const [cat, tieups] of categoryTieupChildren) {
      for (const t of tieups) m.set(t, cat);
    }
    return m;
  }, [categoryTieupChildren]);

  // Track container size for canvas dimensions.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Apply filters (year, role, release-collapse) to produce the rendered subgraph.
  const filteredBase = useMemo<CGraphData>(() => {
    const lq = query.trim().toLowerCase();
    const nodesById = new Map(data.nodes.map((n) => [n.id, n]));

    // ---- (0) Release-collapse: hide songs whose release is not expanded. ----
    // Auto-expand any release that contains a search-matched song so search hits
    // remain visible.
    const effectiveExpanded = new Set(expandedReleases);
    if (lq) {
      for (const n of data.nodes) {
        if (n.kind === "song" && n.name.toLowerCase().includes(lq)) {
          const rel = songToRelease.get(n.id);
          if (rel) effectiveExpanded.add(rel);
        }
      }
    }
    const hiddenSongs = new Set<string>();
    for (const [relId, songs] of releaseChildren) {
      if (effectiveExpanded.has(relId)) continue;
      for (const s of songs) hiddenSongs.add(s);
    }
    // release 親を持たない MB-only 楽曲は、所有アーティストが展開されていても
    // 楽曲ノード自体は隠して owner にまとめる (検索ヒット時のみ可視化)。
    for (const [songId, ownerId] of songToOwnerArtist) {
      if (songToRelease.has(songId)) continue;
      if (lq) {
        const node = nodesById.get(songId);
        if (node && node.name.toLowerCase().includes(lq)) continue;
      }
      hiddenSongs.add(songId);
      // remap で owner にたどり着けるよう songToRelease を借りずに直接使えるよう、
      // 念のため songToOwnerArtist 参照は remap 側で行う。
      void ownerId;
    }

    // ---- (0a) Category-collapse: hide releases whose category is not expanded.
    // Auto-expand a category when its name, any of its releases, or any
    // descendant song matches the search query.
    const effectiveExpandedCategories = new Set(expandedCategories);
    if (lq) {
      // Direct category name match.
      for (const n of data.nodes) {
        if (n.kind === "category" && n.name.toLowerCase().includes(lq)) {
          effectiveExpandedCategories.add(n.id);
        }
      }
      // Release / song descendant match.
      for (const n of data.nodes) {
        if (!n.name.toLowerCase().includes(lq)) continue;
        let relId: string | undefined;
        if (n.kind === "release") relId = n.id;
        else if (n.kind === "song") relId = songToRelease.get(n.id);
        if (relId) {
          const cat = releaseToCategory.get(relId);
          if (cat) effectiveExpandedCategories.add(cat);
        }
      }
      // タイアップ子孫 (tieup hub) のヒットでもカテゴリを自動展開する。
      for (const n of data.nodes) {
        if (n.kind !== "tieup") continue;
        if (!n.name.toLowerCase().includes(lq)) continue;
        const cat = tieupToCategory.get(n.id);
        if (cat) effectiveExpandedCategories.add(cat);
      }
    }
    const hiddenReleases = new Set<string>();
    for (const [catId, rels] of categoryChildren) {
      if (effectiveExpandedCategories.has(catId)) continue;
      for (const r of rels) hiddenReleases.add(r);
    }
    // タイアップカテゴリが折りたたみ状態なら、配下の tieup hub を全て隠す。
    // release と同じ remap 経路でカテゴリノードへ畳む。
    const hiddenTieups = new Set<string>();
    for (const [catId, tieups] of categoryTieupChildren) {
      if (effectiveExpandedCategories.has(catId)) continue;
      for (const t of tieups) hiddenTieups.add(t);
    }
    // When a release is hidden, its child songs collapse onto the category
    // (skipping the now-hidden release). Otherwise hidden songs collapse onto
    // their release as before.
    const remap = (id: string): string => {
      if (hiddenSongs.has(id)) {
        const rel = songToRelease.get(id);
        if (rel && hiddenReleases.has(rel)) {
          return releaseToCategory.get(rel) ?? rel;
        }
        if (rel) return rel;
        // release を持たない MB-only 楽曲 → owner artist に畳む。
        const owner = songToOwnerArtist.get(id);
        return owner ?? id;
      }
      if (hiddenReleases.has(id)) {
        return releaseToCategory.get(id) ?? id;
      }
      if (hiddenTieups.has(id)) {
        return tieupToCategory.get(id) ?? id;
      }
      return id;
    };

    // ---- (0b) Determine collapsed non-Reol artists. ----
    // Search auto-expands any artist whose name matches the query so search
    // hits surface their connections.
    const effectiveExpandedArtists = new Set(expandedArtists);
    if (lq) {
      for (const n of data.nodes) {
        if (
          n.kind === "artist" &&
          n.id !== REOL_ID &&
          n.name.toLowerCase().includes(lq)
        ) {
          effectiveExpandedArtists.add(n.id);
        }
      }
    }
    // NOTE: artist-only グラフ (build-graph 側で artist のみのペアリンクに
    // 集約済み) になって以降、非 Reol アーティスト同士を anchor 線に置換する
    // この "artist-collapse" 機構はクロスリンク (例: かめりあ↔kradness) を
    // 不要に隠してしまう。今は常に空集合扱いにして、すべての pair link を
    // そのまま描画する。
    void effectiveExpandedArtists;
    const collapsedArtists = new Set<string>();

    // ---- (1) Filter links by enabled role & remap collapsed endpoints. ----
    const dedup = new Set<string>();
    const linksFiltered: CGraphLink[] = [];
    // Track which collapsed artists actually had a (role-enabled) incident
    // credit link in the underlying data, so we only anchor those to Reol.
    const anchorNeeded = new Set<string>();
    for (const l of data.links) {
      if (!enabledRoles.has(l.role)) continue;
      const s = remap(l.source as string);
      const t = remap(l.target as string);
      if (s === t) continue; // self-loop after collapse
      // Drop release→song links whose song was collapsed (already represented
      // by the release node existing).
      if (l.role === "release" && hiddenSongs.has(l.target as string)) continue;
      // Drop category→release links whose release is hidden (release collapses
      // into the category node).
      if (
        l.role === "release" &&
        hiddenReleases.has(l.target as string) &&
        typeof l.source === "string" &&
        (l.source as string).startsWith("category:")
      )
        continue;
      // Drop category→tieup links whose tieup is hidden (tieup collapses into
      // the タイアップ category node).
      if (
        l.role === "tieup" &&
        hiddenTieups.has(l.target as string) &&
        typeof l.source === "string" &&
        (l.source as string).startsWith("category:")
      )
        continue;
      // Drop any link incident to a collapsed non-Reol artist; remember so we
      // can synthesize a single anchor link below.
      if (collapsedArtists.has(s) || collapsedArtists.has(t)) {
        if (collapsedArtists.has(s)) anchorNeeded.add(s);
        if (collapsedArtists.has(t)) anchorNeeded.add(t);
        continue;
      }
      const key = `${s}|${t}|${l.role}`;
      if (dedup.has(key)) continue;
      dedup.add(key);
      linksFiltered.push({ source: s, target: t, role: l.role, weight: l.weight });
    }
    // Synthesize a thin anchor link from each collapsed artist to Reol so
    // their nodes remain visible but uncluttered.
    for (const aid of anchorNeeded) {
      linksFiltered.push({ source: aid, target: REOL_ID, role: ANCHOR_ROLE });
    }

    // Filter songs by year range. Artists / tieups / releases of unknown year
    // are kept regardless.
    const passesYear = (node: CGraphNode | undefined): boolean => {
      if (!node) return false;
      if (
        node.kind === "artist" ||
        node.kind === "tieup" ||
        node.kind === "category"
      )
        return true;
      if (!yearRange) return true;
      if (node.year === undefined) return true; // missing year → keep
      return node.year >= yearRange[0] && node.year <= yearRange[1];
    };

    // Determine which nodes survive: must have at least one surviving incident link.
    const incident = new Map<string, number>();
    const kept: CGraphLink[] = [];
    for (const l of linksFiltered) {
      const sNode = nodesById.get(l.source as string);
      const tNode = nodesById.get(l.target as string);
      if (!passesYear(sNode) || !passesYear(tNode)) continue;
      kept.push(l);
      incident.set(l.source as string, (incident.get(l.source as string) ?? 0) + 1);
      incident.set(l.target as string, (incident.get(l.target as string) ?? 0) + 1);
    }

    let nodes = data.nodes.filter(
      (n) =>
        (incident.get(n.id) ?? 0) > 0 &&
        !hiddenSongs.has(n.id) &&
        !hiddenReleases.has(n.id) &&
        !hiddenTieups.has(n.id)
    );

    // Search filter: keep matched nodes + their immediate neighbours.
    if (lq) {
      const matchIds = new Set(
        nodes.filter((n) => n.name.toLowerCase().includes(lq)).map((n) => n.id)
      );
      if (matchIds.size === 0) {
        return { nodes: [], links: [] };
      }
      const neighbours = new Set<string>(matchIds);
      for (const l of kept) {
        if (matchIds.has(l.source as string)) neighbours.add(l.target as string);
        if (matchIds.has(l.target as string)) neighbours.add(l.source as string);
      }
      nodes = nodes.filter((n) => neighbours.has(n.id));
      const nodeSet = new Set(nodes.map((n) => n.id));
      const linksOut = kept.filter(
        (l) => nodeSet.has(l.source as string) && nodeSet.has(l.target as string)
      );
      return { nodes, links: linksOut };
    }

    return { nodes, links: kept };
  }, [
    data,
    enabledRoles,
    query,
    yearRange,
    expandedReleases,
    expandedArtists,
    expandedCategories,
    releaseChildren,
    songToRelease,
    songToOwnerArtist,
    categoryChildren,
    releaseToCategory,
    categoryTieupChildren,
    tieupToCategory,
  ]);

  // 遠ノード隠しトグル: アーティストで Reol からの BFS 距離が >=3 のもの
  // と、その先にしか繋がらないリンクを除外する。Reol 自身は常に残す。
  const filtered = useMemo<CGraphData>(() => {
    if (!hideFarNodes) return filteredBase;
    const keepIds = new Set<string>();
    for (const n of filteredBase.nodes) {
      const dn: any = n;
      if (dn.kind === "artist" && n.id !== "artist:Reol") {
        const d = typeof dn.reolDistance === "number" ? dn.reolDistance : Infinity;
        if (d >= 3) continue;
      }
      keepIds.add(n.id);
    }
    const nodes = filteredBase.nodes.filter((n) => keepIds.has(n.id));
    const links = filteredBase.links.filter(
      (l) => keepIds.has(l.source as string) && keepIds.has(l.target as string)
    );
    return { nodes, links };
  }, [filteredBase, hideFarNodes]);

  // Adjacency for hover/selection highlighting.
  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of filtered.links) {
      const s = l.source as string;
      const t = l.target as string;
      if (!m.has(s)) m.set(s, new Set());
      if (!m.has(t)) m.set(t, new Set());
      m.get(s)!.add(t);
      m.get(t)!.add(s);
    }
    return m;
  }, [filtered]);

  // ペアの集約 weight (id → 相手 id → weight 合計)。
  // 強調表示と focus 再配置の重み付けに使う。
  const pairWeight = useMemo(() => {
    const m = new Map<string, Map<string, number>>();
    for (const l of filtered.links) {
      if (l.role === ANCHOR_ROLE) continue;
      const s = (typeof l.source === "object" ? (l.source as any).id : l.source) as string;
      const t = (typeof l.target === "object" ? (l.target as any).id : l.target) as string;
      const w = l.weight ?? 1;
      if (!m.has(s)) m.set(s, new Map());
      if (!m.has(t)) m.set(t, new Map());
      const ms = m.get(s)!;
      const mt = m.get(t)!;
      ms.set(t, (ms.get(t) ?? 0) + w);
      mt.set(s, (mt.get(s) ?? 0) + w);
    }
    return m;
  }, [filtered]);

  // Reol からの距離 (artist のみ持つ) を ID から引けるようにする。
  // distance ≥ 3 もしくは未定義のノードは「Reol との関係が薄い」として常時フェード。
  const reolDistanceById = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of filtered.nodes) {
      if (typeof n.reolDistance === "number") m.set(n.id, n.reolDistance);
    }
    return m;
  }, [filtered]);

  // Pin Reol at center.
  useEffect(() => {
    const reol = filtered.nodes.find((n) => n.id === "artist:Reol") as any;
    if (reol) {
      reol.fx = 0;
      reol.fy = 0;
    }
  }, [filtered]);

  // Configure d3 forces once the graph is rendered.
  // Tuning goals: more breathing room between low-degree song nodes, longer
  // chains for release/tieup, hub artists stay readable.
  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    if (!fg.d3Force) return;

    const charge = fg.d3Force("charge");
    if (charge) {
      // Stronger repulsion + distanceMax avoids the whole graph clumping in
      // the centre once node count grows.
      charge.strength(-260).distanceMax(420);
    }

    const link = fg.d3Force("link");
    if (link) {
      // Per-role link distance: release/tieup/credit lines splay further so
      // sibling songs sharing the same release don't pile on top of each other.
      link.distance((l: CGraphLink) => {
        switch (l.role) {
          case "release":
            return 90;
          case "tieup":
            return 70;
          case "music":
          case "lyrics":
          case "producer":
            return 55;
          case ANCHOR_ROLE:
            return 120; // collapsed artists orbit further out
          default:
            return 45;
        }
      });
      // Lower strength keeps long chains from snapping back into the hub.
      link.strength(0.35);
    }

    // Collision force prevents node overlap. Radii scale with kind/degree.
    fg.d3Force(
      "collide",
      forceCollide((n: any) => {
        if (n.kind === "artist")
          return Math.max(10, Math.sqrt(n.degree ?? 1) * 2 + 6);
        if (n.kind === "category") return 16;
        if (n.kind === "release") return 12;
        if (n.kind === "tieup") return 10;
        return 6;
      }).iterations(2)
    );

    // Mind-map style concentric layout: pin each node to a target radius from
    // Reol (center) based on Reol との hop 距離。
    //   center  : Reol (0)
    //   ring 1  : 直接共演者 (distance 1)
    //   ring 2  : 共演者の共演者 (distance 2)
    //   ring 3+ : それ以外 / 未到達
    // これにより「Reol→直接→共通コラボレータ」という構造がそのまま同心円に
    // なり、外周同士を結ぶ弦としてクロスリンク (例: かめりあ↔kradness) が
    // 視覚的に浮かび上がる。
    const radiusFor = (n: any): number => {
      if (n.id === REOL_ID) return 0;
      if (n.kind === "category") return 140;
      if (n.kind === "release") return 260;
      if (n.kind === "tieup") return 360;
      if (n.kind === "song") return 380;
      if (n.kind === "artist") {
        const d = n.reolDistance;
        if (d === 1) return 260;
        if (d === 2) return 460;
        return 600; // dist >=3 / 未到達
      }
      return 320;
    };
    fg.d3Force(
      "radial",
      forceRadial((n: any) => radiusFor(n), 0, 0).strength((n: any) => {
        if (n.id === REOL_ID) return 0;
        // 距離別 ring を強めに固定して同心円構造を見せる。
        if (n.kind === "artist") return 0.32;
        return 0.18;
      })
    );
    // Disable the default center force; the radial force already provides
    // positional pull and we want Reol (pinned at 0,0) to be the single anchor.
    if (fg.d3Force("center")) fg.d3Force("center", null);

    if ((fg as any).d3ReheatSimulation) (fg as any).d3ReheatSimulation();
  }, [ForceGraph2D, filtered]);

  // ---- Focus-mode re-layout ----
  // selectedId が立っている間、フォーカスノードを画面中央寄りに固定し、
  // その隣人を周囲に円形配置して三角構造を見やすくする。
  // フォーカスを外したら元の fx/fy を復元してシミュレーションを再開する。
  const focusSnapshotRef = useRef<Map<string, { fx?: number; fy?: number }>>(
    new Map()
  );
  const lastFocusedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!fgRef.current) return;
    const fg = fgRef.current;
    // シミュレーションが握っているノード配列を直接参照する (filtered.nodes と同一参照)。
    const nodes: any[] = filtered.nodes as any[];
    const prev = lastFocusedIdRef.current;

    // 1) フォーカス解除 / 切り替え: ただし Reol ピンは保護して復元。
    if (focusSnapshotRef.current.size > 0 && prev !== selectedId) {
      for (const n of nodes) {
        if (n.id === REOL_ID) continue;
        const snap = focusSnapshotRef.current.get(n.id);
        if (snap) {
          n.fx = snap.fx;
          n.fy = snap.fy;
        }
      }
      focusSnapshotRef.current.clear();
    }

    if (selectedId && selectedId !== REOL_ID) {
      const focusNode = nodes.find((n) => n.id === selectedId);
      if (!focusNode) {
        lastFocusedIdRef.current = selectedId;
        return;
      }
      // 新しいフォーカスセッション開始時のみスナップショットを取り直す。
      // (filtered 変更で effect が再走しても元位置は失わない)
      if (prev !== selectedId) {
        for (const n of nodes) {
          focusSnapshotRef.current.set(n.id, { fx: n.fx, fy: n.fy });
        }
      }
      const cx = typeof focusNode.x === "number" ? focusNode.x : 0;
      const cy = typeof focusNode.y === "number" ? focusNode.y : 0;
      focusNode.fx = cx;
      focusNode.fy = cy;
      const neigh = adjacency.get(selectedId);
      if (neigh && neigh.size > 0) {
        const list = Array.from(neigh);
        const wMap = pairWeight.get(selectedId) ?? new Map<string, number>();
        // 強い共演相手 (weight 大) ほど focus に近く、弱い相手は外周に。
        // log スケールで内 R_IN〜外 R_OUT を補間。
        const R_IN = 140;
        const R_OUT = Math.max(260, Math.min(440, 120 + list.length * 7));
        const ws = list.map((id) => Math.log10((wMap.get(id) ?? 1) + 1));
        const wMax = Math.max(...ws, 0.0001);
        const wMin = Math.min(...ws);
        const withAngle = list.map((id, i) => {
          const n = nodes.find((x) => x.id === id);
          const dx = (n?.x ?? 0) - cx;
          const dy = (n?.y ?? 0) - cy;
          // 半径: weight 最大→R_IN, 最小→R_OUT
          const t = wMax === wMin ? 0.5 : 1 - (ws[i] - wMin) / (wMax - wMin);
          const radius = R_IN + (R_OUT - R_IN) * t;
          return { id, n, angle: Math.atan2(dy, dx), radius };
        });
        withAngle.sort((a, b) => a.angle - b.angle);
        const step = (Math.PI * 2) / withAngle.length;
        withAngle.forEach(({ n, radius }, i) => {
          if (!n) return;
          if (n.id === REOL_ID) return; // Reol は中心ピンを崩さない
          const a = -Math.PI / 2 + step * i;
          n.fx = cx + Math.cos(a) * radius;
          n.fy = cy + Math.sin(a) * radius;
        });
      }
      // Reol は常に (0,0) にピンされたまま。
      const reol = nodes.find((n) => n.id === REOL_ID);
      if (reol) {
        reol.fx = 0;
        reol.fy = 0;
      }
    }

    lastFocusedIdRef.current = selectedId;
    if ((fg as any).d3ReheatSimulation) (fg as any).d3ReheatSimulation();
  }, [selectedId, adjacency, filtered, pairWeight]);

  // Clicked selection wins over transient hover so the highlight persists
  // even after the post-click centerAt/zoom animation shifts the cursor onto
  // a neighboring node.
  const highlightId = selectedId ?? hoverId;

  const isNeighbor = useCallback(
    (id: string): boolean => {
      if (!highlightId) return false;
      if (id === highlightId) return false;
      const neigh = adjacency.get(highlightId);
      return !!(neigh && neigh.has(id));
    },
    [highlightId, adjacency]
  );

  const isDimmed = useCallback(
    (id: string): boolean => {
      if (!highlightId) return false;
      if (id === highlightId) return false;
      const neigh = adjacency.get(highlightId);
      return !(neigh && neigh.has(id));
    },
    [highlightId, adjacency]
  );

  const linkColor = useCallback(
    (link: CGraphLink) => {
      // Synthetic anchor links for collapsed artists: thin gray, always faded.
      if (link.role === ANCHOR_ROLE) return "rgba(148,163,184,0.25)";
      const base = getRoleConfig(link.role).color;
      const s = link.source as any;
      const t = link.target as any;
      const sId = typeof s === "object" ? s.id : s;
      const tId = typeof t === "object" ? t.id : t;
      // 遷移元 ↔ 選択ノードを結ぶリンクは黄色で最優先に強調。
      if (
        previousNodeId &&
        highlightId &&
        ((sId === previousNodeId && tId === highlightId) ||
          (tId === previousNodeId && sId === highlightId))
      ) {
        return "rgba(234,179,8,0.95)";
      }
      if (highlightId) {
        const touches = sId === highlightId || tId === highlightId;
        if (touches) {
          // weight が大きいほど不透明に。log スケールで 0.55〜1.0。
          const w = link.weight ?? 1;
          const a = Math.min(1, 0.55 + Math.log10(w + 1) * 0.22);
          return withAlpha(base, a);
        }
        // 近傍同士を結ぶクロスリンクも weight に応じて見せ方を変える。
        const neigh = adjacency.get(highlightId);
        if (neigh && neigh.has(sId) && neigh.has(tId)) {
          const w = link.weight ?? 1;
          const a = Math.min(0.85, 0.25 + Math.log10(w + 1) * 0.22);
          return withAlpha(base, a);
        }
        return "rgba(150,150,150,0.04)";
      }
      // 距離ティアによるトーンダウン:
      //   両端とも distance >= 3 / 未定義   → 強くフェード
      //   両端とも distance >= 2 (孫レベル) → 中フェード
      //   いずれかが distance <= 1          → 通常色
      const sd = reolDistanceById.get(sId);
      const td = reolDistanceById.get(tId);
      const minD = Math.min(sd ?? Infinity, td ?? Infinity);
      const maxD = Math.max(sd ?? Infinity, td ?? Infinity);
      if (!Number.isFinite(maxD) || maxD >= 3) return "rgba(150,150,150,0.06)";
      if (minD >= 2) return "rgba(150,150,150,0.2)";
      return base;
    },
    [highlightId, reolDistanceById, adjacency, previousNodeId]
  );

  const linkWidth = useCallback(
    (link: CGraphLink) => {
      if (link.role === ANCHOR_ROLE) return 0.3;
      const w = link.weight ?? 1;
      // log scale: 1 -> ~0.6, 10 -> ~1.6, 100 -> ~2.6
      const base = 0.4 + Math.log10(w + 1) * 1.1;
      const s = link.source as any;
      const t = link.target as any;
      const sId = typeof s === "object" ? s.id : s;
      const tId = typeof t === "object" ? t.id : t;
      // 遷移元 ↔ 選択ノードのリンクは最も太く強調。
      if (
        previousNodeId &&
        highlightId &&
        ((sId === previousNodeId && tId === highlightId) ||
          (tId === previousNodeId && sId === highlightId))
      ) {
        return base + 3.5;
      }
      if (highlightId) {
        if (sId === highlightId || tId === highlightId) {
          // focus に触れるリンクは weight で連続的に太く: log(w+1) * 1.6
          return base + 0.8 + Math.log10(w + 1) * 1.6;
        }
        const neigh = adjacency.get(highlightId);
        if (neigh && neigh.has(sId) && neigh.has(tId)) {
          // 近傍同士のクロスリンクも weight で見やすく
          return Math.max(0.4, base * 0.7 + Math.log10(w + 1) * 0.6);
        }
        return 0.25;
      }
      const sd = reolDistanceById.get(sId);
      const td = reolDistanceById.get(tId);
      const minD = Math.min(sd ?? Infinity, td ?? Infinity);
      const maxD = Math.max(sd ?? Infinity, td ?? Infinity);
      if (!Number.isFinite(maxD) || maxD >= 3) return 0.2;
      if (minD >= 2) return 0.35;
      return base;
    },
    [highlightId, reolDistanceById, adjacency, previousNodeId]
  );

  // prefers-reduced-motion: アニメーション (particle / centerAt easing) 抑制。
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Animated highlight particles travel along neighbor links so the eye can follow them.
  const linkParticles = useCallback(
    (link: CGraphLink) => {
      if (reducedMotion) return 0;
      const s = link.source as any;
      const t = link.target as any;
      const sId = typeof s === "object" ? s.id : s;
      const tId = typeof t === "object" ? t.id : t;
      // 遷移元 ↔ 選択ノードのリンクは強めの粒子で「ここから来た」を示す。
      if (
        previousNodeId &&
        highlightId &&
        ((sId === previousNodeId && tId === highlightId) ||
          (tId === previousNodeId && sId === highlightId))
      ) {
        return 6;
      }
      if (!highlightId) return 0;
      return sId === highlightId || tId === highlightId ? 2 : 0;
    },
    [highlightId, reducedMotion, previousNodeId]
  );

  // クロスリンク (Reol を端点に持たない artist↔artist の pair link) は、
  // Reol からのスポークと重なって視認しづらいので Bezier で湾曲させる。
  // 同じ pair で複数 role がある時は role 順で curvature を少しずつずらし、
  // 並行リンクが重ならないようにする。
  const linkCurvatureMap = useMemo(() => {
    const m = new Map<CGraphLink, number>();
    const links = filtered.links;
    const pairRoles = new Map<string, CGraphLink[]>();
    for (const l of links) {
      if (l.role === ANCHOR_ROLE) continue;
      const sId = (typeof l.source === "object" ? (l.source as any).id : l.source) as string;
      const tId = (typeof l.target === "object" ? (l.target as any).id : l.target) as string;
      if (sId === REOL_ID || tId === REOL_ID) continue;
      const [a, b] = sId < tId ? [sId, tId] : [tId, sId];
      const key = `${a}|${b}`;
      if (!pairRoles.has(key)) pairRoles.set(key, []);
      pairRoles.get(key)!.push(l);
    }
    for (const [, group] of pairRoles) {
      group.sort((x, y) => x.role.localeCompare(y.role));
      const n = group.length;
      // Spread curvature gently so arcs don't bow out wildly.
      const lo = 0.06;
      const hi = 0.18;
      group.forEach((l, i) => {
        const c = n === 1 ? (lo + hi) / 2 : lo + ((hi - lo) * i) / (n - 1);
        m.set(l, c);
      });
    }
    return m;
  }, [filtered]);

  const linkCurvature = useCallback(
    (link: CGraphLink) => linkCurvatureMap.get(link) ?? 0,
    [linkCurvatureMap]
  );

  const nodeCanvasObject = useCallback(
    (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const isArtist = node.kind === "artist";
      const isRelease = node.kind === "release";
      const isTieup = node.kind === "tieup";
      const isCategory = node.kind === "category";
      const baseSize = isArtist
        ? node.id === "artist:Reol"
          ? 32
          : Math.max(
              4,
              Math.min(30, 4 + Math.sqrt(node.reolCoCount ?? 0) * 2.4)
            )
        : isRelease
        ? Math.max(5, Math.min(12, Math.sqrt(node.degree ?? 1) * 1.3))
        : isTieup
        ? Math.max(4, Math.min(10, Math.sqrt(node.degree ?? 1) * 1.4))
        : isCategory
        ? 11
        : 3;
      const dimmed = isDimmed(node.id);
      const neighbor = isNeighbor(node.id);
      const isFocus = node.id === highlightId;
      // Reol からの距離による漀添え量:
      //   distance 0/1 = 直接共演         → そのまま (alpha 1)
      //   distance 2   = 「直接共演者の共演者」 → わずかにフェード
      //   distance >= 3 / 未到達                 → 強くフェード
      // ホバー/選択中は距離に関わらず focus/neighbor を優先させる。
      const dist = node.reolDistance;
      let distAlpha = 1;
      if (isArtist && !isFocus && !neighbor) {
        if (dist === undefined || dist >= 3) distAlpha = 0.25;
        else if (dist === 2) distAlpha = 0.7;
      }
      ctx.globalAlpha = dimmed ? 0.12 : distAlpha;

      // Halo: focused node (large pink) + neighbors (medium pink ring).
      if (isFocus) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseSize + 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(236, 72, 153, 0.22)";
        ctx.fill();
      } else if (neighbor) {
        // weight が大きい隣人ほどハローを大きく濃く。
        const w = highlightId ? pairWeight.get(highlightId)?.get(node.id) ?? 1 : 1;
        const lw = Math.log10(w + 1);
        const haloR = baseSize + 3 + Math.min(8, lw * 4);
        const haloA = Math.min(0.5, 0.14 + lw * 0.12);
        ctx.beginPath();
        ctx.arc(node.x, node.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236, 72, 153, ${haloA})`;
        ctx.fill();
      }

      // 遷移元ノード: 大きく脈動する黄色グロー + 太いリングで強調。
      if (previousNodeId && node.id === previousNodeId) {
        const t = Date.now() / 600;
        const pulse = 0.5 + 0.5 * Math.sin(t); // 0..1
        ctx.save();
        ctx.globalAlpha = 1;
        // 外側ソフトグロー
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseSize + 10 + pulse * 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234, 179, 8, ${0.18 + pulse * 0.18})`;
        ctx.fill();
        // 太いリング
        ctx.beginPath();
        ctx.arc(node.x, node.y, baseSize + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(234, 179, 8, 1)";
        ctx.lineWidth = 3 / globalScale;
        ctx.stroke();
        ctx.restore();
      }

      // Node shape per kind: artist = circle, song = small circle, release = square, tieup = diamond, category = rounded pill (hexagon).
      const drawSize = neighbor ? baseSize + 1 : baseSize;
      ctx.beginPath();
      if (isRelease) {
        ctx.rect(
          node.x - drawSize,
          node.y - drawSize,
          drawSize * 2,
          drawSize * 2
        );
      } else if (isTieup) {
        // diamond
        ctx.moveTo(node.x, node.y - drawSize);
        ctx.lineTo(node.x + drawSize, node.y);
        ctx.lineTo(node.x, node.y + drawSize);
        ctx.lineTo(node.x - drawSize, node.y);
        ctx.closePath();
      } else if (isCategory) {
        // hexagon
        const r = drawSize;
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          const x = node.x + r * Math.cos(a);
          const y = node.y + r * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      } else {
        ctx.arc(node.x, node.y, drawSize, 0, Math.PI * 2);
      }
      ctx.fillStyle = isArtist
        ? node.id === "artist:Reol"
          ? "#7dd3fc"
          : node.dominantRole
          ? getRoleConfig(node.dominantRole).color
          : "#0f172a"
        : isRelease
        ? "#7c3aed"
        : isTieup
        ? "#14b8a6"
        : isCategory
        ? "#0891b2"
        : "#fbbf24";
      // Reol からの距離が遠いアーティストは色も desaturate して
      // 「直接共演者」をパッと見で区別できるようにする。
      // ただし dist=2 はアーティスト同士のクラスターを読み取りたいので
      // 色は薄めるだけで dominantRole の色相は残す。
      if (isArtist && !isFocus && !neighbor) {
        if (dist === undefined || dist >= 3) ctx.fillStyle = "#334155"; // very dim slate
      }
      ctx.fill();
      ctx.lineWidth = isFocus ? 2.5 : neighbor ? 1.4 : 0.5;
      ctx.strokeStyle = isFocus
        ? "#ec4899"
        : neighbor
        ? "#ec4899"
        : isArtist && !isFocus && !neighbor && (dist === undefined || dist >= 3)
        ? "rgba(148,163,184,0.4)"
        : "#ffffff";
      ctx.stroke();

      // Label visibility: always for focus/neighbor; otherwise gated by kind & zoom.
      const importantKind = isArtist || isRelease || isTieup || isCategory;
      // Reol との関係が極めて薄い (distance >= 3 / 到達不能) アーティストは
      // ラベルも控えめに。dist=2 は通常通り表示する。
      const distFarArtist =
        isArtist &&
        !isFocus &&
        !neighbor &&
        (dist === undefined || dist >= 3);
      const showLabel =
        isFocus ||
        neighbor ||
        (importantKind &&
          !distFarArtist &&
          ((node.degree ?? 0) >= 4 || globalScale > 1.2)) ||
        // 遠いアーティストはズームインしたときだけ表示。
        (distFarArtist && globalScale > 2.2);
      const showSongLabel =
        !importantKind && (isFocus || neighbor || globalScale > 2.5);
      if (showLabel || showSongLabel) {
        const label = node.name as string;
        // Reol との関係が薄い (Reol 自身でなく、直接共演 dist<=1 でもない)
        // アーティストは、フォーカス対象や隣人になっていてもラベルだけは
        // 通常スタイル (細字・暗色) に戻す。
        const farFromReol =
          isArtist &&
          node.id !== "artist:Reol" &&
          (typeof dist !== "number" || dist > 1);
        const emphasize = (isFocus || neighbor) && !farFromReol;
        const fontSize = Math.max(
          (emphasize ? 12 : 10) / globalScale,
          importantKind ? 4 : 3
        );
        ctx.font = `${emphasize ? "bold " : ""}${fontSize}px sans-serif`;
        const textWidth = ctx.measureText(label).width;
        const pad = emphasize ? 2 : 1;
        ctx.fillStyle = emphasize
          ? "rgba(255, 240, 246, 0.95)"
          : farFromReol
          ? "rgba(226,232,240,0.45)"
          : "rgba(255,255,255,0.85)";
        ctx.fillRect(
          node.x - textWidth / 2 - pad,
          node.y + baseSize + 1,
          textWidth + pad * 2,
          fontSize + pad * 2
        );
        ctx.fillStyle = emphasize
          ? "#9d174d"
          : farFromReol
          ? "#64748b"
          : "#111827";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(label, node.x, node.y + baseSize + 1 + pad);
      }

      // Release node: draw expand/collapse glyph + child-count badge.
      if (isRelease) {
        const expanded = expandedReleases.has(node.id);
        const childCount = releaseChildren.get(node.id)?.size ?? 0;
        const glyphSize = Math.max(8 / globalScale, 4);
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${glyphSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          expanded ? "−" : `+${childCount}`,
          node.x,
          node.y
        );
      }

      // Non-Reol artist: 中心に Reol との共演曲数を表示 (0 は省略)。
      if (isArtist && node.id !== REOL_ID) {
        const co = node.reolCoCount ?? 0;
        if (co > 0) {
          const glyphSize = Math.max(
            Math.min(drawSize * 0.95, 9) / Math.max(globalScale, 0.6),
            3.5
          );
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${glyphSize}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(co), node.x, node.y);
        }
      }

      // Category node: child release count badge ("−" when expanded).
      if (isCategory) {
        const expanded = expandedCategories.has(node.id);
        const childCount = categoryChildren.get(node.id)?.size ?? 0;
        const glyphSize = Math.max(8 / globalScale, 4);
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${glyphSize}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(expanded ? "−" : `+${childCount}`, node.x, node.y);
      }

      ctx.globalAlpha = 1;
    },
    [
      isDimmed,
      isNeighbor,
      highlightId,
      pairWeight,
      previousNodeId,
      expandedReleases,
      releaseChildren,
      expandedArtists,
      expandedCategories,
      categoryChildren,
    ]
  );

  const handleNodeClick = useCallback(
    (node: any) => {
      // クリックは「選択 (ハイライト) + 展開」。
      // コラプスは行わない (実リンクがアンカーリンクに化けて見えなくなるため)。
      // コラプスはダブルクリック側で行う。
      if (node.kind === "release") {
        expandRelease(node.id);
      } else if (node.kind === "artist" && node.id !== REOL_ID) {
        expandArtist(node.id);
      } else if (node.kind === "category") {
        expandCategory(node.id);
      }
      setSelectedId(node.id);
      lastNodeClickAtRef.current = Date.now();
      onNodeSelect?.(node as CGraphNode);
      // Smoothly center on node (zoom はユーザーの現在倍率を尊重し、変更しない)。
      if (fgRef.current?.centerAt && typeof node.x === "number") {
        const ms = reducedMotion ? 0 : 800;
        fgRef.current.centerAt(node.x, node.y, ms);
      }
    },
    [onNodeSelect, expandRelease, expandArtist, expandCategory, reducedMotion]
  );

  const handleNodeDoubleClick = useCallback(
    (node: any) => {
      // 展開・折りたたみ可能なノードはダブルクリックでトグル。
      if (node.kind === "release") {
        toggleRelease(node.id);
        return;
      }
      if (node.kind === "artist" && node.id !== REOL_ID) {
        toggleArtist(node.id);
        return;
      }
      if (node.kind === "category") {
        toggleCategory(node.id);
        return;
      }
      if (typeof window === "undefined") return;
      // リリース / 楽曲ノードで discographySlug がわかるものは、ディスコグラフィページの該当位置へ。
      if (
        (node.kind === "song" || node.kind === "release") &&
        typeof node.discographySlug === "string"
      ) {
        window.open(`/discography/#disc-${node.discographySlug}`, "_self");
        return;
      }
      // それ以外（アーティスト / タイアップ / 楽曲名のみ）はサイト内検索へ。
      const q = encodeURIComponent(node.name);
      window.open(`/search?q=${q}`, "_self");
    },
    [toggleRelease, toggleArtist, toggleCategory]
  );

  const handleBackgroundClick = useCallback(() => {
    // クリック直後の偶発的な onBackgroundClick (カンバスリサイズ伴う)
    // を遮避するため、直近ノードクリックから 300ms 以内は無視。
    if (Date.now() - lastNodeClickAtRef.current < 300) return;
    setSelectedId(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // モバイル長押し (>=500ms) でダブルクリック相当 (展開/外部遷移) を発火。
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let timer: number | null = null;
    let startX = 0;
    let startY = 0;
    const cancel = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        cancel();
        return;
      }
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      const rect = el.getBoundingClientRect();
      const cx = startX - rect.left;
      const cy = startY - rect.top;
      cancel();
      timer = window.setTimeout(() => {
        const fg = fgRef.current;
        if (!fg || typeof fg.screen2GraphCoords !== "function") return;
        const { x: gx, y: gy } = fg.screen2GraphCoords(cx, cy);
        // 近傍ノード探索 (半径 12 単位以内)。
        let best: any = null;
        let bestD = 12 * 12;
        for (const n of filtered.nodes) {
          const nx = (n as any).x;
          const ny = (n as any).y;
          if (typeof nx !== "number" || typeof ny !== "number") continue;
          const d = (nx - gx) * (nx - gx) + (ny - gy) * (ny - gy);
          if (d < bestD) {
            bestD = d;
            best = n;
          }
        }
        if (best) {
          // 触覚フィードバック (対応端末のみ)。
          if (typeof navigator !== "undefined" && (navigator as any).vibrate) {
            (navigator as any).vibrate(20);
          }
          handleNodeDoubleClick(best);
        }
      }, 500);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        cancel();
        return;
      }
      const t = e.touches[0];
      if (Math.abs(t.clientX - startX) > 8 || Math.abs(t.clientY - startY) > 8) {
        cancel();
      }
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", cancel, { passive: true });
    el.addEventListener("touchcancel", cancel, { passive: true });
    return () => {
      cancel();
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", cancel);
      el.removeEventListener("touchcancel", cancel);
    };
  }, [filtered, handleNodeDoubleClick]);

  // Esc キーで focus 解除。入力欄にフォーカスがある時は無視。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      setSelectedId((cur) => {
        if (cur === null) return cur;
        onNodeSelect?.(null);
        return null;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNodeSelect]);

  return (
    <div ref={containerRef} className="cgraph-canvas">
      {!ForceGraph2D && (
        <div className="cgraph-loading">グラフを読み込み中…</div>
      )}
      {ForceGraph2D && filtered.nodes.length === 0 && (
        <div className="cgraph-loading">該当ノードがありません</div>
      )}
      {ForceGraph2D && filtered.nodes.length > 0 && (
        <ForceGraph2D
          ref={fgRef}
          graphData={filtered}
          width={size.w}
          height={size.h}
          backgroundColor="#fafaf5"
          nodeId="id"
          nodeRelSize={4}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
            const r = node.kind === "artist" ? 10 : 6;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            ctx.fill();
          }}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkCurvature={linkCurvature}
          linkDirectionalParticles={linkParticles}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.006}
          linkDirectionalArrowLength={(link: any) => {
            if (!previousNodeId || !selectedId) return 0;
            const s = link.source;
            const t = link.target;
            const sId = typeof s === "object" ? s.id : s;
            const tId = typeof t === "object" ? t.id : t;
            return (sId === previousNodeId && tId === selectedId) ||
              (tId === previousNodeId && sId === selectedId)
              ? 10
              : 0;
          }}
          linkDirectionalArrowRelPos={1}
          linkDirectionalArrowColor={() => "rgba(234,179,8,1)"}
          autoPauseRedraw={!previousNodeId}
          cooldownTicks={120}
          onNodeHover={(n: any) => setHoverId(n ? n.id : null)}
          onNodeClick={handleNodeClick}
          onNodeDragEnd={(node: any) => {
            // After manual drag, pin where the user dropped it.
            node.fx = node.x;
            node.fy = node.y;
          }}
          onBackgroundClick={handleBackgroundClick}
          // d3-force-2d type doesn't declare onNodeRightClick uniformly across versions
          onNodeRightClick={handleNodeDoubleClick}
        />
      )}
    </div>
  );
};

export default CGraphView;
