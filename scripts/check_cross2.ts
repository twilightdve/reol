import * as fs from "fs";
import { buildCGraph } from "../src/features/cgraph/build-graph";
const disc = JSON.parse(fs.readFileSync("./static/data/discography.json", "utf-8"));
const rel = JSON.parse(fs.readFileSync("./static/data/relations.json", "utf-8"));
const g = buildCGraph({ discography: disc, relations: rel });
const idByName = new Map<string, string>();
for (const n of g.nodes) idByName.set(n.name, n.id);
const REOL = idByName.get("Reol")!;

const pairs: [string,string][] = [
  ["ケンモチヒデフミ","初音ミク"],
  ["ケンモチヒデフミ","かめりあ"],
  ["初音ミク","かめりあ"],
  ["初音ミク","Giga"],
  ["ケンモチヒデフミ","Giga"],
  ["かめりあ","kradness"],
  ["Giga","kradness"],
];
for (const [a,b] of pairs) {
  const aid = idByName.get(a);
  const bid = idByName.get(b);
  if (!aid||!bid) { console.log(`${a}-${b}: missing node`); continue; }
  const ls = g.links.filter(l=>{
    const s = typeof l.source==="object"?(l.source as any).id:l.source;
    const t = typeof l.target==="object"?(l.target as any).id:l.target;
    return (s===aid&&t===bid)||(s===bid&&t===aid);
  });
  console.log(`${a}-${b}:`, ls.map(l=>`${l.role}:${l.weight}`).join(",") || "(none)");
}

// All cross-links (both endpoints != Reol)
const cross = g.links.filter(l => {
  const s = typeof l.source==="object"?(l.source as any).id:l.source;
  const t = typeof l.target==="object"?(l.target as any).id:l.target;
  return s!==REOL && t!==REOL && l.role!=="__anchor__";
});
console.log("\ntotal non-Reol artist↔artist links:", cross.length);
// Group by pair
const byPair = new Map<string, {role:string,weight:number}[]>();
for (const l of cross) {
  const s = typeof l.source==="object"?(l.source as any).id:l.source as string;
  const t = typeof l.target==="object"?(l.target as any).id:l.target as string;
  const [a,b] = s<t ? [s,t]:[t,s];
  const key = `${a}|${b}`;
  if (!byPair.has(key)) byPair.set(key, []);
  byPair.get(key)!.push({role:l.role, weight:l.weight??1});
}
console.log("unique non-Reol pairs:", byPair.size);
// Top 10 cross pairs by total weight
const rows = [...byPair.entries()].map(([k, arr]) => {
  const [a,b] = k.split("|");
  const na = g.nodes.find(n=>n.id===a)?.name ?? a;
  const nb = g.nodes.find(n=>n.id===b)?.name ?? b;
  return { pair:`${na}↔${nb}`, total:arr.reduce((s,r)=>s+r.weight,0) };
}).sort((a,b)=>b.total-a.total);
console.log("\nTop 15 cross-pairs by weight:");
for (const r of rows.slice(0,15)) console.log(r.total, r.pair);
