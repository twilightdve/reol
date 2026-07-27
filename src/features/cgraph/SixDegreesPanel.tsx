import React, { useEffect, useMemo, useState } from "react";
import { CGraphData, CGraphNode } from "./types";
import { findShortestPath } from "./pathfinder";
import { getRoleConfig } from "./role-config";

interface SixDegreesPanelProps {
  graph: CGraphData;
  onSelectNode?: (node: CGraphNode) => void;
  onClose: () => void;
}

/** 入力欄1つぶんのアーティスト検索(タイプアヘッド)。 */
const ArtistPicker: React.FC<{
  label: string;
  artists: CGraphNode[];
  value: CGraphNode | null;
  onChange: (node: CGraphNode | null) => void;
}> = ({ label, artists, value, onChange }) => {
  const [query, setQuery] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);

  // ランダム選択など、親から value が外部的に変わった場合も表示を追従させる。
  useEffect(() => {
    if (value) setQuery(value.name);
  }, [value]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return artists.filter((a) => a.name.toLowerCase().includes(q)).slice(0, 8);
  }, [artists, query]);

  return (
    <div className="cgraph-sixdeg-field">
      <label>{label}</label>
      <input
        type="text"
        value={query}
        placeholder="アーティスト名"
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (value) onChange(null);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && suggestions.length > 0 && (
        <ul className="cgraph-sixdeg-suggest">
          {suggestions.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(a);
                  setQuery(a.name);
                  setOpen(false);
                }}
              >
                {a.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SixDegreesPanel: React.FC<SixDegreesPanelProps> = ({
  graph,
  onSelectNode,
  onClose,
}) => {
  const artists = useMemo(
    () =>
      graph.nodes
        .filter((n) => n.kind === "artist")
        .sort((a, b) => a.name.localeCompare(b.name, "ja")),
    [graph]
  );

  const [from, setFrom] = useState<CGraphNode | null>(null);
  const [to, setTo] = useState<CGraphNode | null>(null);

  const result = useMemo(() => {
    if (!from || !to) return null;
    return findShortestPath(graph, from.id, to.id);
  }, [graph, from, to]);

  const pickRandomPair = () => {
    // 孤立ノード(degree 0)はほぼ確実に経路が無いので除外する
    const pool = artists.filter((a) => (a.degree ?? 0) > 0);
    if (pool.length < 2) return;
    const a = pool[Math.floor(Math.random() * pool.length)];
    let b = a;
    while (b.id === a.id) {
      b = pool[Math.floor(Math.random() * pool.length)];
    }
    setFrom(a);
    setTo(b);
  };

  return (
    <aside className="cgraph-sixdeg" role="dialog" aria-label="Six Degrees of Reol">
      <header>
        <h2>Six Degrees</h2>
        <button
          type="button"
          className="cgraph-back-btn"
          onClick={onClose}
          aria-label="閉じる"
        >
          ✕
        </button>
      </header>
      <p className="cgraph-sixdeg-desc">
        2人のアーティストを選ぶと、クレジットのつながりで何手で繋がるかを探索します。
      </p>

      <div className="cgraph-sixdeg-fields">
        <ArtistPicker label="From" artists={artists} value={from} onChange={setFrom} />
        <ArtistPicker label="To" artists={artists} value={to} onChange={setTo} />
      </div>

      <button type="button" className="cgraph-mini-btn" onClick={pickRandomPair}>
        ランダムな2人で試す
      </button>

      {from && to && (
        <div className="cgraph-sixdeg-result">
          {!result ? (
            <p className="cgraph-sixdeg-nopath">
              つながりが見つかりませんでした。
            </p>
          ) : result.hops.length === 0 ? (
            <p>同一人物です。</p>
          ) : (
            <>
              <p className="cgraph-sixdeg-count">
                {result.hops.length}手で繋がっています
              </p>
              <ol className="cgraph-sixdeg-steps">
                {result.nodes.map((node, i) => {
                  const hop = result.hops[i - 1];
                  return (
                    <li key={node.id}>
                      {hop && (
                        <div className="cgraph-sixdeg-hop">
                          <span
                            className="cgraph-chip cgraph-chip-on"
                            style={{
                              background: getRoleConfig(hop.link.role).color,
                              borderColor: getRoleConfig(hop.link.role).color,
                            }}
                          >
                            {getRoleConfig(hop.link.role).label}
                          </span>
                          {hop.link.weight === undefined && (
                            <span className="cgraph-sixdeg-weak">
                              (直接的な共演は未確認)
                            </span>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        className="cgraph-sixdeg-node"
                        onClick={() => onSelectNode?.(node)}
                      >
                        {node.name}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>
      )}
    </aside>
  );
};

export default SixDegreesPanel;
