import * as fs from "fs";
import { buildCGraph } from "../src/features/cgraph/build-graph";
const disc = JSON.parse(fs.readFileSync("./static/data/discography.json", "utf-8"));
const rel = JSON.parse(fs.readFileSync("./static/data/relations.json", "utf-8"));
const g = buildCGraph({ discography: disc, relations: rel });
const idByName = new Map<string, string>();
for (const n of g.nodes) idByName.set(n.name, n.id);
const a = idByName.get("かめりあ");
const b = idByName.get("ななひら");
console.log("kame=", a, "nana=", b);
const dista = g.nodes.find(n=>n.id===a)?.reolDistance;
const distb = g.nodes.find(n=>n.id===b)?.reolDistance;
console.log("dist kame=", dista, "dist nana=", distb);
const pair = g.links.filter(l => {
  const s = l.source as string; const t = l.target as string;
  return (s===a && t===b) || (s===b && t===a);
});
console.log("pair links:", pair);
// Reol-nana
const rn = g.links.filter(l => {
  const s=l.source as string; const t=l.target as string;
  return (s==="artist:Reol" && t===b) || (t==="artist:Reol" && s===b);
});
console.log("Reol-nana:", rn.length, "links");
