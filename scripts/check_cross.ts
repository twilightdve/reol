import * as fs from "fs";
import { buildCGraph } from "../src/features/cgraph/build-graph";
const disc = JSON.parse(fs.readFileSync("./static/data/discography.json", "utf-8"));
const rel = JSON.parse(fs.readFileSync("./static/data/relations.json", "utf-8"));
const g = buildCGraph({ discography: disc, relations: rel });
const idByName = new Map<string, string>();
for (const n of g.nodes) idByName.set(n.name, n.id);

const targets = ["ケンモチヒデフミ", "初音ミク", "ななひら", "かめりあ", "kradness", "水曜日のカンパネラ"];
console.log("Reol id:", idByName.get("Reol"));
for (const t of targets) {
  const id = idByName.get(t);
  const dist = id ? g.nodes.find(n=>n.id===id)?.reolDistance : "(no node)";
  console.log(`${t} id=${id} dist=${dist}`);
}

// All Reol pair-links grouped by partner
const reolId = idByName.get("Reol");
const partners = new Map<string, {role:string,weight:number}[]>();
for (const l of g.links) {
  const s = typeof l.source === "object" ? (l.source as any).id : l.source;
  const t = typeof l.target === "object" ? (l.target as any).id : l.target;
  let other: string | null = null;
  if (s === reolId) other = t as string;
  else if (t === reolId) other = s as string;
  if (!other) continue;
  if (!partners.has(other)) partners.set(other, []);
  partners.get(other)!.push({ role: l.role, weight: l.weight ?? 1 });
}
console.log("\nReol partner count:", partners.size);
// Sort by max weight
const rows = [...partners.entries()].map(([id, arr]) => {
  const totalW = arr.reduce((a,b)=>a+b.weight,0);
  const name = g.nodes.find(n=>n.id===id)?.name ?? id;
  return { name, id, totalW, roles: arr.map(r=>`${r.role}:${r.weight}`).join(",") };
}).sort((a,b)=>b.totalW-a.totalW);
console.log("\nTop 20 Reol partners by total weight:");
for (const r of rows.slice(0,20)) console.log(r.totalW, r.name, r.roles);

console.log("\nLooking specifically:");
for (const t of targets) {
  const id = idByName.get(t);
  if (!id) continue;
  const row = rows.find(r=>r.id===id);
  if (row) console.log(`  Reol-${t}: w=${row.totalW} ${row.roles}`);
  else console.log(`  Reol-${t}: NO LINK`);
}
