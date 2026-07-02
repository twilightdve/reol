import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import CGraphView from "./CGraphView";
import { buildCGraph, DiscographyEntry } from "./build-graph";
import {
  ALL_ROLE_KEYS,
  getRoleConfig,
  ROLE_CONFIG,
  ROLE_DEFAULT,
} from "./role-config";
import type {
  CGraphData,
  CGraphNode,
  RawRelationsArtist,
} from "./types";
import "./cgraph.css";

/**
 * ロールごとの簡易な説明文。
 * 選択したノードの種類 (artist / song / release …) によって主語が変わるので、
 * 「アーティスト視点」と「楽曲/その他視点」の 2 種類を用意する。
 */
const describeRelation = (
  role: string,
  nodeKind: CGraphNode["kind"]
): string => {
  const fromArtist = nodeKind === "artist";
  switch (role) {
    case "lyrics":
      return fromArtist ? "作詞を担当" : "の作詞者";
    case "music":
      return fromArtist ? "作曲を担当" : "の作曲者";
    case "arranger":
    case "instrument arranger":
      return fromArtist ? "編曲を担当" : "の編曲者";
    case "vocal":
      return fromArtist ? "ボーカル参加" : "のボーカル";
    case "producer":
      return fromArtist ? "プロデュース" : "のプロデューサー";
    case "mix":
      return fromArtist ? "ミックスを担当" : "のミックス";
    case "recording":
      return fromArtist ? "レコーディング担当" : "のレコーディング";
    case "instrument":
      return fromArtist ? "楽器を演奏" : "の演奏者";
    case "programming":
      return fromArtist ? "プログラミング担当" : "のプログラミング";
    case "remixer":
      return fromArtist ? "リミックスを担当" : "のリミキサー";
    case "performer":
      return fromArtist ? "release に参加" : "の参加アーティスト";
    case "phonographic copyright":
      return "© 原盤権";
    case "tieup":
      return "タイアップ";
    case "release":
      return "収録 / リリース";
    case "_anchor":
      return "Reol との関連";
    case "misc":
      return "その他のクレジット";
    default:
      return role;
  }
};

/** ノード種別を日本語の接頭ラベルに変換 (「楽曲「○○」」等の表記に使う)。 */
const prefixOfKind = (kind: CGraphNode["kind"]): string => {
  switch (kind) {
    case "song":
      return "楽曲";
    case "release":
      return "リリース";
    case "tieup":
      return "タイアップ";
    case "category":
      return "カテゴリ";
    case "artist":
    default:
      return "";
  }
};

/**
 * 「リンク元」ノードを文脈として、選択ノードがどう関わっているかを
 * 自然文で説明する。例: 「楽曲「第六感」で作曲を担当」「アルバム「Σ」に収録」。
 */
const describeRelationPhrase = (
  role: string,
  selectedKind: CGraphNode["kind"],
  prevKind: CGraphNode["kind"],
  prevName: string
): string => {
  const prefix = prefixOfKind(prevKind);
  const ctx = prefix ? `${prefix}「${prevName}」` : prevName;

  // 選択ノード = アーティスト (= 参加者)
  if (selectedKind === "artist") {
    switch (role) {
      case "music":
        return `${ctx}で作曲を担当`;
      case "lyrics":
        return `${ctx}で作詞を担当`;
      case "arranger":
      case "instrument arranger":
        return `${ctx}で編曲を担当`;
      case "vocal":
        return `${ctx}でボーカル参加`;
      case "producer":
        return `${ctx}でプロデュース`;
      case "mix":
        return `${ctx}でミックスを担当`;
      case "recording":
        return `${ctx}でレコーディングを担当`;
      case "instrument":
        return `${ctx}で楽器演奏`;
      case "programming":
        return `${ctx}でプログラミング`;
      case "remixer":
        return `${ctx}でリミックス`;
      case "phonographic copyright":
        return `${ctx}の原盤権`;
      case "tieup":
        return `${ctx}のタイアップに関与`;
      case "release":
        return `${ctx}に参加`;
      case "misc":
        return `${ctx}にクレジット`;
    }
  }
  // 選択ノード = 楽曲
  if (selectedKind === "song") {
    if (prevKind === "artist") {
      switch (role) {
        case "music":
          return `${ctx}が作曲`;
        case "lyrics":
          return `${ctx}が作詞`;
        case "arranger":
        case "instrument arranger":
          return `${ctx}が編曲`;
        case "vocal":
          return `${ctx}がボーカル`;
        case "producer":
          return `${ctx}がプロデュース`;
        case "mix":
          return `${ctx}がミックス`;
        case "recording":
          return `${ctx}がレコーディング`;
        case "instrument":
          return `${ctx}が演奏`;
        case "programming":
          return `${ctx}がプログラミング`;
        case "remixer":
          return `${ctx}がリミックス`;
        case "phonographic copyright":
          return `${ctx}が原盤権者`;
        case "misc":
          return `${ctx}がクレジット`;
      }
    }
    if (prevKind === "release" && role === "release") {
      return `${ctx}に収録`;
    }
    if (prevKind === "tieup" && role === "tieup") {
      return `${ctx}のタイアップ曲`;
    }
  }
  // 選択ノード = リリース
  if (selectedKind === "release") {
    if (prevKind === "artist" && role === "release") return `${ctx}のリリース`;
    if (prevKind === "song" && role === "release") return `${ctx}を収録`;
    if (prevKind === "category" && role === "release") return `${ctx}に分類`;
  }
  // 選択ノード = カテゴリ
  if (selectedKind === "category") {
    if (role === "release" || role === "tieup") return `${ctx}を含むカテゴリ`;
  }
  // 選択ノード = タイアップ
  if (selectedKind === "tieup") {
    if (role === "tieup") return `${ctx}のタイアップ`;
  }
  // fallback
  return `${ctx} ─ ${describeRelation(role, selectedKind)}`;
};

type Props = {
  /** Optional preloaded relations (otherwise fetched from /data/relations.json). */
  relations?: RawRelationsArtist[];
  /** Optional preloaded discography (otherwise fetched from /data/discography.json). */
  discography?: DiscographyEntry[];
};

const CGraphPage: FC<Props> = ({ relations, discography }) => {
  const [raw, setRaw] = useState<RawRelationsArtist[] | null>(
    relations ?? null
  );
  const [disc, setDisc] = useState<DiscographyEntry[] | null>(
    discography ?? null
  );
  const [error, setError] = useState<string | null>(null);
  // 再試行カウンタ。インクリメントで useEffect を再走させる。
  const [retryCount, setRetryCount] = useState<number>(0);
  // データファイルの Last-Modified ヘッダ (footer 表示用)。
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // URL search params から初期値を取り出す。SSR では空。
  const initialParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);
  // URL に書き出すための pending node id (graph 読込み後に解決)。
  const pendingNodeIdRef = useRef<string | null>(
    initialParams.get("node")
  );

  const [query, setQuery] = useState<string>(initialParams.get("q") ?? "");
  // フィルタは打鍵ごとに重い再計算が走るので 300ms debounce。
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);
  const [selected, setSelected] = useState<CGraphNode | null>(null);
  // 直前に選択していたノード ID。インスペクタで「リンク元との関係」だけを
  // 強調表示するために使う。
  const [prevSelectedId, setPrevSelectedId] = useState<string | null>(null);
  const handleSelect = useCallback(
    (node: CGraphNode | null) => {
      setSelected((cur) => {
        // 直前の選択を保持。null クリア時や同じノードを再選択した時は
        // prev を更新しない。
        if (node && cur && node.id !== cur.id) {
          setPrevSelectedId(cur.id);
        } else if (!node) {
          setPrevSelectedId(null);
        }
        return node;
      });
    },
    []
  );
  const [enabledRoles, setEnabledRoles] = useState<Set<string>>(
    () => new Set([...ALL_ROLE_KEYS, "release"])
  );
  const [yearRange, setYearRange] = useState<[number, number] | null>(() => {
    const y = initialParams.get("year");
    if (!y) return null;
    const m = y.match(/^(\d{4})-(\d{4})$/);
    if (!m) return null;
    return [parseInt(m[1], 10), parseInt(m[2], 10)];
  });
  const [showRelease, setShowRelease] = useState<boolean>(true);
  // 遠ノード (Reol BFS 距離 >=3 のアーティスト) を非表示にするトグル。
  const [hideFarNodes, setHideFarNodes] = useState<boolean>(false);
  // ヘッダー (検索・年・ロール・プリセット) を折りたたむフラグ。
  // スマホでインスペクタを開いた時にノードが見えなくなる問題対策。
  const [headerCollapsed, setHeaderCollapsed] = useState<boolean>(false);
  // ノード選択時、モバイル幅ならヘッダーを自動的に畳む。
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selected && window.innerWidth <= 640) {
      setHeaderCollapsed(true);
    } else if (!selected) {
      setHeaderCollapsed(false);
    }
  }, [selected]);
  // 初回オンボーディング表示フラグ。localStorage にて 1 回だけ表示。
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!window.localStorage.getItem("cgraph:onboarded")) {
        setShowOnboarding(true);
      }
    } catch {
      // ignore (Safari Private mode 等)
    }
  }, []);
  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    try {
      window.localStorage.setItem("cgraph:onboarded", "1");
    } catch {
      // ignore
    }
  }, []);
  // インスペクタ最小化フラグ。最小化時はヘッダ (ノード名) のみ表示し、
  // 復元ボタンで再展開できる。
  const [inspectorMinimized, setInspectorMinimized] = useState<boolean>(false);
  // モバイルではノード選択時に最小化を初期状態にして、グラフ領域を確保する。
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selected && window.innerWidth <= 640) {
      setInspectorMinimized(true);
    } else if (!selected) {
      setInspectorMinimized(false);
    }
  }, [selected]);
  // プリセットフィルタ。"all" 以外では Reol との関係性に基づいて
  // 表示アーティストを絞り込む (Reol 自身は常に含める)。
  type Preset = "all" | "core" | "tieup" | "vocal" | "producer";
  const [preset, setPreset] = useState<Preset>(() => {
    const p = initialParams.get("preset");
    if (p === "core" || p === "tieup" || p === "vocal" || p === "producer")
      return p;
    return "all";
  });

  // Fetch JSON data at runtime (avoids bloating the JS bundle).
  useEffect(() => {
    let cancelled = false;
    setError(null);
    const tasks: Promise<unknown>[] = [];
    if (!relations) {
      tasks.push(
        fetch("/data/relations.json")
          .then((r) => {
            if (!r.ok) throw new Error(`relations HTTP ${r.status}`);
            const lm = r.headers.get("Last-Modified");
            if (lm && !cancelled) setLastUpdated(lm);
            return r.json();
          })
          .then((json) => {
            if (!cancelled) setRaw(json);
          })
      );
    }
    if (!discography) {
      tasks.push(
        fetch("/data/discography.json")
          .then((r) => {
            if (!r.ok) throw new Error(`discography HTTP ${r.status}`);
            return r.json();
          })
          .then((json) => {
            if (!cancelled) setDisc(json);
          })
      );
    }
    Promise.all(tasks).catch((e) => {
      if (!cancelled) setError(String(e));
    });
    return () => {
      cancelled = true;
    };
  }, [relations, discography, retryCount]);

  const graph: CGraphData | null = useMemo(() => {
    if (!disc) return null;
    return buildCGraph({ discography: disc, relations: raw ?? undefined });
  }, [raw, disc]);

  // 選択アーティストに対する詳細 (楽曲 / 参加リリース / 関連タイアップ)。
  // グラフ自体はアーティストノードのみを持つので、楽曲・リリース・タイアップは
  // ここで初めて UI に出る。
  const selectedDetail = useMemo(() => {
    if (!graph || !selected || selected.kind !== "artist") return null;
    return graph.artistDetails?.[selected.id] ?? null;
  }, [graph, selected]);

  // プリセットでアーティストを絞り込んだ表示用グラフ。
  const displayGraph = useMemo(() => {
    if (!graph) return null;
    if (preset === "all") return graph;
    const REOL = "artist:Reol";
    const keep = new Set<string>([REOL]);
    for (const n of graph.nodes) {
      const d = graph.artistDetails?.[n.id];
      if (!d) continue;
      const rb = d.roleBreakdown ?? {};
      const co = d.reolCoCount ?? 0;
      let ok = false;
      if (preset === "core") ok = co >= 5;
      else if (preset === "tieup") ok = (d.tieupSongCount ?? 0) > 0;
      else if (preset === "vocal") ok = (rb.vocal ?? 0) > 0 && co >= 1;
      else if (preset === "producer")
        ok =
          ((rb.producer ?? 0) + (rb.music ?? 0) + (rb.arranger ?? 0) > 0) &&
          co >= 1;
      if (ok) keep.add(n.id);
    }
    const nodes = graph.nodes.filter((n) => keep.has(n.id));
    const links = graph.links.filter(
      (l) =>
        keep.has(l.source as string) && keep.has(l.target as string)
    );
    return { ...graph, nodes, links };
  }, [graph, preset]);

  // 選択ノードに対する隣接ノード一覧 (relation role でグループ化)。
  // 直前に選択していたノード ("リンク元") があれば、その 1 ノードとの関係だけを
  // 自然文で表示する。なければ (= 最初の選択) フィルタなしで全関係を出す。
  const prevNode = useMemo(
    () =>
      prevSelectedId
        ? graph?.nodes.find((n) => n.id === prevSelectedId) ?? null
        : null,
    [graph, prevSelectedId]
  );
  const neighborRelations = useMemo(() => {
    if (!graph || !selected) return [];
    const nameById = new Map(graph.nodes.map((n) => [n.id, n.name]));
    const byRole = new Map<string, Map<string, string>>();
    for (const l of graph.links) {
      if (l.role === "_anchor") continue;
      if (!enabledRoles.has(l.role)) continue;
      const sId = l.source as string;
      const tId = l.target as string;
      let neighborId: string | null = null;
      if (sId === selected.id) neighborId = tId;
      else if (tId === selected.id) neighborId = sId;
      if (!neighborId) continue;
      // リンク元との関係だけに絞り込む。
      if (prevNode && neighborId !== prevNode.id) continue;
      const name = nameById.get(neighborId) ?? neighborId;
      if (!byRole.has(l.role)) byRole.set(l.role, new Map());
      byRole.get(l.role)!.set(neighborId, name);
    }
    return Array.from(byRole.entries())
      .sort(
        (a, b) =>
          (ROLE_CONFIG[a[0]]?.order ?? ROLE_DEFAULT.order) -
          (ROLE_CONFIG[b[0]]?.order ?? ROLE_DEFAULT.order)
      )
      .map(([role, neighbors]) => {
        const cfg = getRoleConfig(role);
        const phrase = prevNode
          ? describeRelationPhrase(
              role,
              selected.kind,
              prevNode.kind,
              prevNode.name
            )
          : null;
        return {
          role,
          label: cfg.label,
          color: cfg.color,
          description: describeRelation(role, selected.kind),
          phrase,
          neighbors: Array.from(neighbors.values()),
        };
      });
  }, [graph, selected, enabledRoles, prevNode]);

  // Compute available roles (sorted) and year bounds from the graph.
  const { roleKeys, yearBounds } = useMemo(() => {
    if (!graph) return { roleKeys: [] as string[], yearBounds: null as null | [number, number] };
    const roles = new Set<string>();
    let minYear = Infinity;
    let maxYear = -Infinity;
    for (const l of graph.links) roles.add(l.role);
    for (const n of graph.nodes) {
      if (n.kind === "song" && n.year !== undefined) {
        if (n.year < minYear) minYear = n.year;
        if (n.year > maxYear) maxYear = n.year;
      }
    }
    const sorted = Array.from(roles).sort((a, b) => {
      const ca = ROLE_CONFIG[a]?.order ?? ROLE_DEFAULT.order;
      const cb = ROLE_CONFIG[b]?.order ?? ROLE_DEFAULT.order;
      return ca - cb;
    });
    return {
      roleKeys: sorted,
      yearBounds:
        Number.isFinite(minYear) && Number.isFinite(maxYear)
          ? ([minYear, maxYear] as [number, number])
          : null,
    };
  }, [graph]);

  // Initialise year slider once graph loads.
  useEffect(() => {
    if (yearBounds && !yearRange) {
      setYearRange(yearBounds);
    }
  }, [yearBounds, yearRange]);

  // Sync `release` role inclusion with toggle.
  useEffect(() => {
    setEnabledRoles((prev) => {
      const next = new Set(prev);
      if (showRelease) next.add("release");
      else next.delete("release");
      return next;
    });
  }, [showRelease]);

  // URL から渡された node id を、graph 読込み完了後に選択へ反映 (1 回のみ)。
  useEffect(() => {
    if (!graph || !pendingNodeIdRef.current) return;
    const id = pendingNodeIdRef.current;
    pendingNodeIdRef.current = null;
    const node = graph.nodes.find((n) => n.id === id);
    if (node) setSelected(node);
  }, [graph]);

  // 状態 → URL 書き戻し (history.replaceState で履歴汚染しない)。
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const set = (k: string, v: string | null | undefined) => {
      if (v == null || v === "") sp.delete(k);
      else sp.set(k, v);
    };
    set("q", debouncedQuery);
    set("preset", preset === "all" ? null : preset);
    set(
      "year",
      yearRange &&
        yearBounds &&
        (yearRange[0] !== yearBounds[0] || yearRange[1] !== yearBounds[1])
        ? `${yearRange[0]}-${yearRange[1]}`
        : null
    );
    set("node", selected?.id ?? null);
    const qs = sp.toString();
    const next = `${window.location.pathname}${qs ? "?" + qs : ""}${window.location.hash}`;
    if (next !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(null, "", next);
    }
  }, [debouncedQuery, preset, yearRange, yearBounds, selected]);

  const toggleRole = (role: string) => {
    setEnabledRoles((prev) => {
      const next = new Set(prev);
      if (next.has(role)) next.delete(role);
      else next.add(role);
      return next;
    });
  };

  return (
    <div className="cgraph-root">
      <header
        className={`cgraph-header${
          headerCollapsed ? " cgraph-header--collapsed" : ""
        }`}
      >
        <button
          type="button"
          className="cgraph-header-toggle"
          aria-expanded={!headerCollapsed}
          aria-label={headerCollapsed ? "検索・絞り込みを開く" : "検索・絞り込みを閉じる"}
          onClick={() => setHeaderCollapsed((v) => !v)}
        >
          {headerCollapsed ? "▼ 検索・絞り込み" : "▲ 折りたたむ"}
        </button>
        <div className="cgraph-title">
          <h1>Creator Relations</h1>
          <p>
            Reol を中心に楽曲クレジット（vocal / arrange / produce …）でつながる
            アーティストの相関図。ノードをドラッグして整え、ホバーで関係を強調、
            クリックで近傍にフォーカス、右クリックでサイト内検索へ。
          </p>
        </div>
        <div className="cgraph-controls">
          <input
            className="cgraph-search"
            type="search"
            placeholder="アーティスト名 / 楽曲名で絞り込み"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {yearBounds && yearRange && (
            <div className="cgraph-year">
              <label>
                年:{" "}
                <strong>
                  {yearRange[0]} – {yearRange[1]}
                </strong>
              </label>
              <input
                type="range"
                min={yearBounds[0]}
                max={yearBounds[1]}
                value={yearRange[0]}
                onChange={(e) =>
                  setYearRange([Number(e.target.value), yearRange[1]])
                }
              />
              <input
                type="range"
                min={yearBounds[0]}
                max={yearBounds[1]}
                value={yearRange[1]}
                onChange={(e) =>
                  setYearRange([yearRange[0], Number(e.target.value)])
                }
              />
              <button
                type="button"
                className="cgraph-mini-btn"
                onClick={() => setYearRange(yearBounds)}
              >
                Reset
              </button>
            </div>
          )}
          <button
            type="button"
            className="cgraph-mini-btn"
            onClick={() => {
              if (typeof document === "undefined") return;
              const canvas = document.querySelector(
                ".cgraph-canvas canvas"
              ) as HTMLCanvasElement | null;
              if (!canvas) return;
              canvas.toBlob((blob) => {
                if (!blob) return;
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `reol-cgraph-${new Date()
                  .toISOString()
                  .slice(0, 10)}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              }, "image/png");
            }}
          >
            PNG保存
          </button>
        </div>
        <div className="cgraph-roles">
          {roleKeys
            .filter((r) => r !== "release")
            .map((role) => {
              const cfg = getRoleConfig(role);
              const on = enabledRoles.has(role);
              return (
                <button
                  type="button"
                  key={role}
                  onClick={() => toggleRole(role)}
                  className={`cgraph-chip${on ? " cgraph-chip-on" : ""}`}
                  style={
                    on
                      ? { background: cfg.color, borderColor: cfg.color }
                      : { borderColor: cfg.color, color: cfg.color }
                  }
                >
                  {cfg.label}
                </button>
              );
            })}
          <label className="cgraph-release-toggle">
            <input
              type="checkbox"
              checked={showRelease}
              onChange={(e) => setShowRelease(e.target.checked)}
            />
            release 線を表示
          </label>
          <label className="cgraph-release-toggle">
            <input
              type="checkbox"
              checked={hideFarNodes}
              onChange={(e) => setHideFarNodes(e.target.checked)}
            />
            遠いノードを隠す
          </label>
        </div>
        <div className="cgraph-presets" role="tablist" aria-label="プリセット">
          {(
            [
              { id: "all", label: "全員" },
              { id: "core", label: "コア (Reol共演5+)" },
              { id: "tieup", label: "タイアップ作家" },
              { id: "vocal", label: "ボーカル系" },
              { id: "producer", label: "作曲・編曲系" },
            ] as { id: Preset; label: string }[]
          ).map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={preset === p.id}
              onClick={() => setPreset(p.id)}
              className={`cgraph-preset${
                preset === p.id ? " cgraph-preset--on" : ""
              }`}
            >
              {p.label}
            </button>
          ))}
          {displayGraph && (
            <span className="cgraph-preset-count">
              {displayGraph.nodes.length} 人
            </span>
          )}
        </div>
      </header>

      <main className="cgraph-main">
        {error && (
          <div className="cgraph-error" role="alert">
            <p>データの読み込みに失敗しました。</p>
            <p className="cgraph-error-detail">{error}</p>
            <button
              type="button"
              className="cgraph-error-retry"
              onClick={() => setRetryCount((c) => c + 1)}
            >
              再試行
            </button>
          </div>
        )}
        {!graph && !error && <div className="cgraph-loading">データ取得中…</div>}
        {graph && (
          <CGraphView
            data={displayGraph ?? graph}
            enabledRoles={enabledRoles}
            query={debouncedQuery}
            yearRange={yearRange}
            onNodeSelect={handleSelect}
            selectedNodeId={selected?.id ?? null}
            previousNodeId={prevSelectedId}
            hideFarNodes={hideFarNodes}
          />
        )}

        <div
          className="cgraph-sr-live"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {selected ? `選択中: ${selected.name}` : ""}
        </div>
        {selected && (
          <aside
            className={`cgraph-inspector${
              inspectorMinimized ? " cgraph-inspector--mini" : ""
            }`}
          >
            <header>
              {prevNode && (
                <button
                  type="button"
                  className="cgraph-back-btn"
                  title={`「${prevNode.name}」に戻る`}
                  onClick={() => handleSelect(prevNode)}
                >
                  ← {prevNode.name}
                </button>
              )}
              <strong>{selected.name}</strong>
              <button
                type="button"
                className="cgraph-inspector-toggle"
                aria-expanded={!inspectorMinimized}
                aria-label={
                  inspectorMinimized ? "詳細を開く" : "詳細を折りたたむ"
                }
                onClick={() => setInspectorMinimized((v) => !v)}
              >
                {inspectorMinimized ? "▼ 詳細を見る" : "▲ 折りたたむ"}
              </button>
              <button
                type="button"
                aria-label="close"
                className="cgraph-mini-btn"
                onClick={() => handleSelect(null)}
              >
                ×
              </button>
            </header>
            {!inspectorMinimized && (
              <>
                {(() => {
                  const isReolSelf = selected.id === "artist:Reol";
                  const reolSongs =
                    selectedDetail && !isReolSelf
                      ? selectedDetail.songs.filter((s) =>
                          s.coArtists.includes("Reol")
                        )
                      : [];
                  const otherSongs =
                    selectedDetail && !isReolSelf
                      ? selectedDetail.songs.filter(
                          (s) => !s.coArtists.includes("Reol")
                        )
                      : [];
                  // Reol 関連曲のみで role 内訳を再集計 (非 Reol アーティストのとき)。
                  const reolRoleBreakdown: Record<string, number> = {};
                  for (const s of reolSongs) {
                    for (const r of s.roles) {
                      reolRoleBreakdown[r] = (reolRoleBreakdown[r] ?? 0) + 1;
                    }
                  }
                  const renderSongList = (
                    list: typeof reolSongs,
                    keyPrefix: string,
                    markReol: boolean
                  ) => (
                    <ul className="cgraph-detail-list">
                      {list.map((s, i) => (
                        <li
                          key={`${keyPrefix}:${s.discographyUuid ?? "x"}:${
                            s.songUuid ?? i
                          }:${s.name}`}
                          className={
                            markReol ? "cgraph-detail-item--reol" : undefined
                          }
                        >
                          <div className="cgraph-detail-line">
                            {s.roles.map((r) => {
                              const cfg = getRoleConfig(r);
                              return (
                                <span
                                  key={r}
                                  className="cgraph-role-chip"
                                  style={{ backgroundColor: cfg.color }}
                                  title={cfg.label}
                                >
                                  {cfg.label}
                                </span>
                              );
                            })}
                            <span className="cgraph-detail-name">
                              {s.name}
                              {s.year !== undefined && (
                                <span className="cgraph-detail-year">
                                  ({s.year})
                                </span>
                              )}
                            </span>
                          </div>
                          {s.coArtists.length > 0 && (
                            <div className="cgraph-detail-sub">
                              with {s.coArtists.join("、")}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  );
                  return (
                    <>
                      {/* === Reol 関連情報 (最優先) === */}
                      {!isReolSelf &&
                        selectedDetail &&
                        (selectedDetail.reolCoCount ?? 0) > 0 && (
                          <div className="cgraph-detail-section cgraph-detail-section--reol">
                            <div className="cgraph-detail-title">
                              Reol との関係
                            </div>
                            <div className="cgraph-detail-stats">
                              <div className="cgraph-detail-stat">
                                <span className="cgraph-detail-stat-num">
                                  {selectedDetail.reolCoCount}
                                </span>
                                <span className="cgraph-detail-stat-label">
                                  共演曲
                                </span>
                              </div>
                              {selectedDetail.reolFirstYear !== undefined && (
                                <div className="cgraph-detail-stat">
                                  <span className="cgraph-detail-stat-num">
                                    {selectedDetail.reolFirstYear}
                                    {selectedDetail.reolLastYear !==
                                      undefined &&
                                      selectedDetail.reolLastYear !==
                                        selectedDetail.reolFirstYear &&
                                      `–${selectedDetail.reolLastYear}`}
                                  </span>
                                  <span className="cgraph-detail-stat-label">
                                    共演期間
                                  </span>
                                </div>
                              )}
                              {(selectedDetail.tieupSongCount ?? 0) > 0 && (
                                <div className="cgraph-detail-stat">
                                  <span className="cgraph-detail-stat-num">
                                    {selectedDetail.tieupSongCount}
                                  </span>
                                  <span className="cgraph-detail-stat-label">
                                    タイアップ
                                  </span>
                                </div>
                              )}
                            </div>
                            {Object.keys(reolRoleBreakdown).length > 0 && (
                              <div className="cgraph-detail-roles">
                                {Object.entries(reolRoleBreakdown)
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([role, count]) => {
                                    const cfg = getRoleConfig(role);
                                    return (
                                      <span
                                        key={role}
                                        className="cgraph-role-chip cgraph-role-chip--count"
                                        style={{ backgroundColor: cfg.color }}
                                        title={`${cfg.label} × ${count} (Reol曲)`}
                                      >
                                        {cfg.label}
                                        <span className="cgraph-role-chip-num">
                                          {count}
                                        </span>
                                      </span>
                                    );
                                  })}
                              </div>
                            )}
                            {reolSongs.length > 0 && (
                              <div className="cgraph-detail-subsection">
                                <div className="cgraph-detail-subtitle">
                                  Reol 共演曲 ({reolSongs.length})
                                </div>
                                {renderSongList(reolSongs, "reol", true)}
                              </div>
                            )}
                          </div>
                        )}

                      {/* Reol 本人: 全曲・スタッツを Reol 用パネルとして上に */}
                      {isReolSelf && selectedDetail && (
                        <div className="cgraph-detail-section cgraph-detail-section--reol">
                          <div className="cgraph-detail-title">Reol</div>
                          <div className="cgraph-detail-stats">
                            <div className="cgraph-detail-stat">
                              <span className="cgraph-detail-stat-num">
                                {selectedDetail.songs.length}
                              </span>
                              <span className="cgraph-detail-stat-label">
                                収録曲
                              </span>
                            </div>
                            {selectedDetail.reolFirstYear !== undefined && (
                              <div className="cgraph-detail-stat">
                                <span className="cgraph-detail-stat-num">
                                  {selectedDetail.reolFirstYear}
                                  {selectedDetail.reolLastYear !== undefined &&
                                    selectedDetail.reolLastYear !==
                                      selectedDetail.reolFirstYear &&
                                    `–${selectedDetail.reolLastYear}`}
                                </span>
                                <span className="cgraph-detail-stat-label">
                                  活動期間
                                </span>
                              </div>
                            )}
                            {(selectedDetail.tieupSongCount ?? 0) > 0 && (
                              <div className="cgraph-detail-stat">
                                <span className="cgraph-detail-stat-num">
                                  {selectedDetail.tieupSongCount}
                                </span>
                                <span className="cgraph-detail-stat-label">
                                  タイアップ
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* === その他の情報 (末尾) === */}
                      <details className="cgraph-detail-other" open>
                        <summary>その他の情報</summary>
                        <dl>
                          <dt>種類</dt>
                          <dd>
                            {selected.kind === "artist"
                              ? "アーティスト"
                              : selected.kind === "release"
                              ? "リリース"
                              : selected.kind === "category"
                              ? "カテゴリ"
                              : "楽曲"}
                          </dd>
                          {selected.year !== undefined && (
                            <>
                              <dt>初出年</dt>
                              <dd>{selected.year}</dd>
                            </>
                          )}
                          {selected.primaryArtist && (
                            <>
                              <dt>主アーティスト</dt>
                              <dd>{selected.primaryArtist}</dd>
                            </>
                          )}
                          <dt>接続数</dt>
                          <dd>{selected.degree ?? 0}</dd>
                        </dl>
                        {neighborRelations.length > 0 && (
                          <div className="cgraph-relations">
                            <div className="cgraph-relations-title">
                              {prevNode
                                ? `「${prevNode.name}」との関係`
                                : `関係 (${neighborRelations.reduce(
                                    (a, b) => a + b.neighbors.length,
                                    0
                                  )})`}
                            </div>
                            <ul className="cgraph-relations-list">
                              {neighborRelations.map((g) => (
                                <li key={g.role}>
                                  <span
                                    className="cgraph-role-chip"
                                    style={{ backgroundColor: g.color }}
                                    title={g.label}
                                  >
                                    {g.label}
                                  </span>
                                  {g.phrase ? (
                                    <span className="cgraph-rel-desc">
                                      {g.phrase}
                                    </span>
                                  ) : (
                                    <>
                                      <span className="cgraph-rel-desc">
                                        {g.description}
                                      </span>
                                      <span className="cgraph-rel-names">
                                        {g.neighbors.join("、")}
                                      </span>
                                    </>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {selectedDetail &&
                          (isReolSelf
                            ? selectedDetail.songs.length > 0
                            : otherSongs.length > 0) && (
                            <div className="cgraph-detail-section">
                              <div className="cgraph-detail-title">
                                {isReolSelf
                                  ? `楽曲 (${selectedDetail.songs.length})`
                                  : `その他の楽曲 (${otherSongs.length})`}
                              </div>
                              {renderSongList(
                                isReolSelf ? selectedDetail.songs : otherSongs,
                                "other",
                                false
                              )}
                            </div>
                          )}
                        {selectedDetail &&
                          selectedDetail.releases.length > 0 && (
                            <div className="cgraph-detail-section">
                              <div className="cgraph-detail-title">
                                参加リリース ({selectedDetail.releases.length})
                              </div>
                              <ul className="cgraph-detail-list">
                                {selectedDetail.releases.map((r) => (
                                  <li key={r.discographyUuid}>
                                    <span className="cgraph-detail-name">
                                      {r.title}
                                      {r.year !== undefined && (
                                        <span className="cgraph-detail-year">
                                          ({r.year})
                                        </span>
                                      )}
                                    </span>
                                    {r.category && (
                                      <span className="cgraph-detail-sub">
                                        {r.category}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        {selectedDetail &&
                          selectedDetail.tieups.length > 0 && (
                            <div className="cgraph-detail-section">
                              <div className="cgraph-detail-title">
                                関連タイアップ ({selectedDetail.tieups.length})
                              </div>
                              <ul className="cgraph-detail-list">
                                {selectedDetail.tieups.map((t, i) => (
                                  <li key={`${t.label}:${t.songName}:${i}`}>
                                    <span
                                      className="cgraph-detail-name"
                                      title={t.raw}
                                    >
                                      {t.label}
                                    </span>
                                    <span className="cgraph-detail-sub">
                                      ({t.songName})
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        <a
                          className="cgraph-link"
                          href={`/search?q=${encodeURIComponent(
                            selected.name
                          )}`}
                        >
                          サイト内で「{selected.name}」を検索 →
                        </a>
                      </details>
                    </>
                  );
                })()}
              </>
            )}
          </aside>
        )}
      </main>
      <footer className="cgraph-footer">
        <small>
          出典: MusicBrainz / 公式ディスコグラフィ
          {lastUpdated && (
            <>
              {" "}・ データ更新: {new Date(lastUpdated).toLocaleDateString("ja-JP")}
            </>
          )}
        </small>
      </footer>
      {showOnboarding && (
        <div
          className="cgraph-onboarding"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cgraph-onboarding-title"
        >
          <div className="cgraph-onboarding-card">
            <h2 id="cgraph-onboarding-title">使い方</h2>
            <ul>
              <li>ノードをタップ: 詳細を表示しフォーカス</li>
              <li>ダブルクリック / 長押し: 展開・関連ページへ移動</li>
              <li>Esc キー / 背景クリック: 選択解除</li>
              <li>検索: アーティスト名 / 楽曲名で絞り込み</li>
            </ul>
            <button
              type="button"
              className="cgraph-mini-btn"
              onClick={dismissOnboarding}
            >
              はじめる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CGraphPage;
