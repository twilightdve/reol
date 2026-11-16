const fs = require("fs"), path = require("path");
const dir = process.argv[2];
const fails = {};
for (const f of fs.readdirSync(dir).filter((f) => /\.mobile\.2\.json$|\.desktop\.1\.json$/.test(f))) {
  const l = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  const slug = f.replace(/\.\d\.json$/, "");
  for (const [cid, c] of Object.entries(l.categories)) {
    if (cid === "performance") continue;
    for (const ref of c.auditRefs) { const a = l.audits[ref.id]; if (a && a.score !== null && a.score < 1 && a.scoreDisplayMode !== "manual" && a.scoreDisplayMode !== "notApplicable" && a.scoreDisplayMode !== "informative") { const k = cid + " | " + ref.id + " | " + a.title; (fails[k] = fails[k] || []).push(slug); } }
  }
  if (/mobile/.test(f)) {
    const a = l.audits;
    const lcpEl = a["lcp-breakdown-insight"]?.details?.items?.find((i) => i.type === "node") || a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node;
    const lcpNode = lcpEl?.node || lcpEl;
    const br = a["lcp-breakdown-insight"]?.details?.items?.find((i) => i.type === "table")?.items?.map((i) => `${i.label || i.subpart}:${Math.round(i.duration)}ms`).join(" ");
    const cls = (a["cls-culprits-insight"]?.details?.items || []).flatMap((i) => i.items || []).slice(0, 4).map((i) => (i.node?.snippet || i.node?.nodeLabel || JSON.stringify(i).slice(0, 80)).slice(0, 110) + (i.score !== undefined ? " score=" + i.score : ""));
    const shifts = (a["layout-shifts"]?.details?.items || []).slice(0, 3).map((i) => (i.node?.snippet || "").slice(0, 110) + " " + (i.score ?? ""));
    console.log(`\n## ${slug} perf=${Math.round(l.categories.performance.score * 100)} LCP=${a["largest-contentful-paint"].displayValue} CLS=${a["cumulative-layout-shift"].displayValue}`);
    console.log("  LCP要素:", (lcpNode?.snippet || "").slice(0, 160), "|", lcpNode?.nodeLabel?.slice(0, 50));
    if (br) console.log("  LCP内訳:", br);
    if (cls.length) console.log("  CLS:", cls.join("\n       "));
    if (shifts.length) console.log("  shifts:", shifts.join("\n       "));
    const ins = Object.values(a).filter((x) => /-insight$/.test(x.id) && x.score !== null && x.score < 1).map((x) => `${x.id}${x.displayValue ? "(" + x.displayValue + ")" : ""}`);
    console.log("  insights:", ins.join(", "));
    const diag = ["unused-javascript", "unused-css-rules", "render-blocking-insight", "total-byte-weight", "bootup-time", "mainthread-work-breakdown", "dom-size-insight", "uses-long-cache-ttl", "cache-insight"].filter((id) => a[id]).map((id) => `${id}=${a[id].displayValue || a[id].score}`);
    console.log("  diag:", diag.join(" ; "));
    const rs = a["resource-summary"]?.details?.items;
    const reqs = a["network-requests"].details.items; const by = {};
    for (const r of reqs) { const t = r.resourceType || "other"; by[t] = by[t] || { n: 0, kb: 0 }; by[t].n++; by[t].kb += (r.transferSize || 0) / 1024; }
    console.log("  転送:", Object.entries(by).sort((x, y) => y[1].kb - x[1].kb).map(([t, v]) => `${t} ${v.n}件 ${Math.round(v.kb)}KB`).join(" / "));
    const third = {}; for (const r of reqs) { const h = new URL(r.url).host; if (h !== "reol.twilightea.com") { third[h] = (third[h] || 0) + (r.transferSize || 0) / 1024; } }
    console.log("  他所:", Object.entries(third).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([h, kb]) => `${h} ${Math.round(kb)}KB`).join(" / "));
  }
}
console.log("\n# 落ちた監査(性能以外)");
for (const [k, v] of Object.entries(fails).sort()) console.log(k, "←", v.length, "件:", v.join(", ").slice(0, 300));
