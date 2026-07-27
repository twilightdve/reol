import { CGraphData, CGraphLink, CGraphNode } from "./types";

/**
 * 新規コンテンツ案A「Six Degrees of Reol」(plan/legit-improvement-plan.md 5章)。
 *
 * CGraphData.links は relations グラフの「絞り込み前」の完全なアーティスト間リンク
 * (build-graph.ts の pairLinkList) であることが前提。CGraphPage.tsx の
 * displayGraph (プリセット/ロール/年代で絞り込んだ表示用サブセット) を渡すと
 * 経路が見つからない・不自然に長くなるため、必ず絞り込み前の graph を渡すこと。
 */

export type PathHop = {
  from: CGraphNode;
  to: CGraphNode;
  link: CGraphLink;
};

export type PathResult = {
  nodes: CGraphNode[];
  hops: PathHop[];
};

/** BFS による最短経路探索(重み無視、辺数最小)。到達不能なら null。 */
export const findShortestPath = (
  graph: CGraphData,
  fromId: string,
  toId: string
): PathResult | null => {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const fromNode = nodeById.get(fromId);
  const toNode = nodeById.get(toId);
  if (!fromNode || !toNode) return null;

  if (fromId === toId) {
    return { nodes: [fromNode], hops: [] };
  }

  const adj = new Map<string, CGraphLink[]>();
  for (const l of graph.links) {
    const s = l.source as string;
    const t = l.target as string;
    if (!adj.has(s)) adj.set(s, []);
    if (!adj.has(t)) adj.set(t, []);
    adj.get(s)!.push(l);
    adj.get(t)!.push(l);
  }

  const prev = new Map<string, { via: string; link: CGraphLink }>();
  const visited = new Set<string>([fromId]);
  const queue: string[] = [fromId];
  let qi = 0;
  while (qi < queue.length) {
    const cur = queue[qi++];
    if (cur === toId) break;
    for (const link of adj.get(cur) ?? []) {
      const s = link.source as string;
      const t = link.target as string;
      const nb = s === cur ? t : s;
      if (visited.has(nb)) continue;
      visited.add(nb);
      prev.set(nb, { via: cur, link });
      queue.push(nb);
    }
  }
  if (!visited.has(toId)) return null;

  const pathIds: string[] = [toId];
  const hopLinks: CGraphLink[] = [];
  let cur = toId;
  while (cur !== fromId) {
    const p = prev.get(cur);
    if (!p) return null;
    hopLinks.unshift(p.link);
    pathIds.unshift(p.via);
    cur = p.via;
  }

  const nodes = pathIds
    .map((id) => nodeById.get(id))
    .filter((n): n is CGraphNode => !!n);
  if (nodes.length !== pathIds.length) return null;

  const hops: PathHop[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    hops.push({ from: nodes[i], to: nodes[i + 1], link: hopLinks[i] });
  }
  return { nodes, hops };
};
