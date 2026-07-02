import * as fs from "fs";
import { buildCGraph } from "../src/features/cgraph/build-graph";

const disc = JSON.parse(fs.readFileSync("./static/data/discography.json", "utf-8"));
const rel = JSON.parse(fs.readFileSync("./static/data/relations.json", "utf-8"));
const g = buildCGraph({ discography: disc, relations: rel });

const idByName = new Map<string, string>();
for (const n of g.nodes) idByName.set(n.name, n.id);

const REOL = "artist:Reol";
const kame = idByName.get("かめりあ") ?? idByName.get("Camellia");
const krad = idByName.get("kradness");
console.log("nodes:", g.nodes.length, "links:", g.links.length);
console.log("kame=", kame, "krad=", krad);
const cross = g.links.filter(l => {
  const s = l.source as string; const t = l.target as string;
  return (s === kame && t === krad) || (s === krad && t === kame);
});
console.log("kame<->krad links:", cross);

const hist: Record<string, number> = {};
for (const n of g.nodes) { const k = String(n.reolDistance); hist[k] = (hist[k] ?? 0) + 1; }
console.log("dist hist:", hist);

let xc = 0;
for (const l of g.links) { if (l.source !== REOL && l.target !== REOL) xc++; }
console.log("non-Reol pair links:", xc, "of total", g.links.length);

// kame's neighbors
if (kame) {
  const neigh = new Set<string>();
  for (const l of g.links) {
    if (l.source === kame) neigh.add(l.target as string);
    else if (l.target === kame) neigh.add(l.source as string);
  }
  console.log("kame neighbors:", neigh.size, [...neigh].slice(0, 10));
}
