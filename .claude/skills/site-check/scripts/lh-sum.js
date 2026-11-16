const fs = require("fs"), path = require("path");
const dir = process.argv[2];
const groups = {};
for (const f of fs.readdirSync(dir)) { const m = f.match(/^(.+)\.(mobile|desktop)\.(\d)\.json$/); if (!m) continue; (groups[m[1] + "|" + m[2]] = groups[m[1] + "|" + m[2]] || []).push(JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))); }
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const rows = [];
let collect = 0;
for (const [k, runs] of Object.entries(groups)) {
  const [slug, form] = k.split("|");
  const num = (id) => med(runs.map((r) => r.audits[id].numericValue));
  const cat = (id) => med(runs.map((r) => Math.round((r.categories[id]?.score ?? 0) * 100)));
  const perfs = runs.map((r) => Math.round(r.categories.performance.score * 100));
  for (const r of runs) collect += r.audits["network-requests"].details.items.filter((i) => /\/collect/.test(i.url)).length;
  const r0 = runs[0];
  rows.push({ slug, form, n: runs.length, perf: med(perfs), perfRange: Math.min(...perfs) + "-" + Math.max(...perfs), a11y: cat("accessibility"), bp: cat("best-practices"), seo: cat("seo"), agentic: cat("agentic-browsing"),
    FCP: Math.round(num("first-contentful-paint")), LCP: Math.round(num("largest-contentful-paint")), TBT: Math.round(num("total-blocking-time")), CLS: Math.round(num("cumulative-layout-shift") * 1000) / 1000, SI: Math.round(num("speed-index")),
    kb: Math.round(num("total-byte-weight") / 1024), req: r0.audits["network-requests"].details.items.length, dom: r0.audits["dom-size"]?.numericValue ?? r0.audits["dom-size-insight"]?.numericValue ?? null, final: r0.finalDisplayedUrl.replace("https://reol.twilightea.com", "") });
}
rows.sort((a, b) => a.form.localeCompare(b.form) * -1 || a.slug.localeCompare(b.slug));
console.log("GA collect requests:", collect);
console.log(["page", "form", "n", "perf", "range", "a11y", "bp", "seo", "agent", "FCP", "LCP", "TBT", "CLS", "SI", "KB", "req"].join("\t"));
for (const r of rows) console.log([r.slug, r.form, r.n, r.perf, r.perfRange, r.a11y, r.bp, r.seo, r.agentic, r.FCP, r.LCP, r.TBT, r.CLS, r.SI, r.kb, r.req].join("\t"));
fs.writeFileSync(path.join(dir, "../lh-summary.json"), JSON.stringify(rows, null, 1));
