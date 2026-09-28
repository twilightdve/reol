import React, { useMemo, useState } from "react";
import { CGraphData, CGraphNode } from "./types";
import { findShortestPath } from "./pathfinder";
import { getRoleConfig, ROLE_CONFIG } from "./role-config";
import { usePageDict } from "../../i18n/site/SiteLangContext";
import { cgraphDict } from "../../i18n/site/pages/cgraph";

interface SixDegreesPanelProps {
  graph: CGraphData;
  onSelectNode?: (node: CGraphNode) => void;
  onClose: () => void;
}

/** 入力欄1つぶんのアーティスト選択(ドロップダウン)。 */
const ArtistPicker: React.FC<{
  label: string;
  artists: CGraphNode[];
  value: CGraphNode | null;
  onChange: (node: CGraphNode | null) => void;
}> = ({ label, artists, value, onChange }) => {
  const t = usePageDict(cgraphDict);
  return (
    <div className="cgraph-sixdeg-field">
      <label htmlFor={`cgraph-sixdeg-${label}`}>{label}</label>
      <select
        id={`cgraph-sixdeg-${label}`}
        value={value?.id ?? ""}
        onChange={(e) => {
          const node = artists.find((a) => a.id === e.target.value) ?? null;
          onChange(node);
        }}
      >
        <option value="">{t.selectArtist}</option>
        {artists.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
            {typeof a.degree === "number" ? ` (${a.degree})` : ""}
          </option>
        ))}
      </select>
    </div>
  );
};

const SixDegreesPanel: React.FC<SixDegreesPanelProps> = ({
  graph,
  onSelectNode,
  onClose,
}) => {
  const t = usePageDict(cgraphDict);
  // つながりの数(degree)の降順。同数なら名前順で安定化。
  const artists = useMemo(
    () =>
      graph.nodes
        .filter((n) => n.kind === "artist")
        .sort(
          (a, b) =>
            (b.degree ?? 0) - (a.degree ?? 0) ||
            a.name.localeCompare(b.name, "ja")
        ),
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
          aria-label={t.close}
        >
          ✕
        </button>
      </header>
      <p className="cgraph-sixdeg-desc">
        {t.sixLead}
      </p>

      <div className="cgraph-sixdeg-fields">
        <ArtistPicker label="From" artists={artists} value={from} onChange={setFrom} />
        <ArtistPicker label="To" artists={artists} value={to} onChange={setTo} />
      </div>

      <button type="button" className="cgraph-mini-btn" onClick={pickRandomPair}>
        {t.random}
      </button>

      {from && to && (
        <div className="cgraph-sixdeg-result">
          {!result ? (
            <p className="cgraph-sixdeg-nopath">
              {t.notFound}
            </p>
          ) : result.hops.length === 0 ? (
            <p>{t.samePerson}</p>
          ) : (
            <>
              <p className="cgraph-sixdeg-count">
                {t.hops(result.hops.length)}
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
                            {t.roles[hop.link.role] ??
                              (ROLE_CONFIG[hop.link.role]
                                ? ROLE_CONFIG[hop.link.role].label
                                : t.otherRole)}
                          </span>
                          {hop.link.weight === undefined && (
                            <span className="cgraph-sixdeg-weak">
                              {t.noDirect}
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
