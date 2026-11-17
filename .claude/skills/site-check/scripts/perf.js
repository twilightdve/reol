// 速さ。Lighthouse を本番に 1 本ずつ当てて、中央値を取る。
// node perf.js [--pages /,/live/] [--origin https://…] [--mobile 3] [--desktop 1] [--summary-only]
// ・同時には回さない(CPU を取り合うと点が下がる)
// ・ローカルで配った物を測ると本番より点が低く出るので、既定は本番
// ・同じ日に途中で止まっても、出来ている分は飛ばして続きから回す
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { config, runDir, toolPath, slug, median, args, pagesArg, writeJson, writeSummary } = require("./lib");

const origin = typeof args.origin === "string" ? args.origin : config.origin;
const pages = pagesArg(config.perfPages);
const runs = { mobile: Number(args.mobile ?? config.perfRuns.mobile), desktop: Number(args.desktop ?? config.perfRuns.desktop) };
const dir = path.join(runDir, "lh");
fs.mkdirSync(dir, { recursive: true });

if (!args["summary-only"]) {
  const bin = toolPath(".bin", "lighthouse");
  for (const form of ["mobile", "desktop"]) {
    for (const p of pages) {
      for (let i = 1; i <= runs[form]; i++) {
        const out = path.join(dir, `${slug(p)}.${form}.${i}.json`);
        if (fs.existsSync(out)) continue;
        const a = [origin + p, "--output=json", `--output-path=${out}`, "--chrome-flags=--headless=new", "--quiet"];
        if (form === "desktop") a.push("--preset=desktop");
        const t = Date.now();
        const r = spawnSync(bin, a, { encoding: "utf8", timeout: 180000 });
        console.log(`${p} ${form} #${i} exit=${r.status} ${Math.round((Date.now() - t) / 1000)}s`);
        if (r.status !== 0 && fs.existsSync(out)) fs.unlinkSync(out);
      }
    }
  }
}

// ---- まとめ ----
const groups = {};
for (const f of fs.readdirSync(dir)) {
  const m = f.match(/^(.+)\.(mobile|desktop)\.(\d+)\.json$/);
  if (!m) continue;
  let j;
  try { j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); } catch (e) { console.log(`読めない結果: ${f}`); continue; }
  if (!j.categories?.performance || j.categories.performance.score === null) { console.log(`点の出ていない結果: ${f}${j.runtimeError ? " " + j.runtimeError.code : ""}`); continue; }
  (groups[m[1] + "|" + m[2]] = groups[m[1] + "|" + m[2]] || []).push(j);
}
const pathOf = Object.fromEntries(pages.map((p) => [slug(p), p]));
const rows = [];
let collect = 0;
const fails = {};
const details = [];
for (const [k, rs] of Object.entries(groups)) {
  const [s, form] = k.split("|");
  const num = (id) => median(rs.map((r) => r.audits[id]?.numericValue ?? 0));
  const cat = (id) => (rs[0].categories[id] ? median(rs.map((r) => Math.round((r.categories[id]?.score ?? 0) * 100))) : null);
  const perfs = rs.map((r) => Math.round(r.categories.performance.score * 100));
  for (const r of rs) collect += r.audits["network-requests"].details.items.filter((i) => /\/collect/.test(i.url)).length;
  // 中央値の回を代表にして、中身(LCP の要素など)を読む
  const rep = [...rs].sort((a, b) => a.categories.performance.score - b.categories.performance.score)[Math.floor(rs.length / 2)];
  const a = rep.audits;
  rows.push({
    page: pathOf[s] || s, form, n: rs.length, perf: median(perfs), perfMin: Math.min(...perfs), perfMax: Math.max(...perfs),
    a11y: cat("accessibility"), bp: cat("best-practices"), seo: cat("seo"),
    FCP: Math.round(num("first-contentful-paint")), LCP: Math.round(num("largest-contentful-paint")), TBT: Math.round(num("total-blocking-time")),
    CLS: Math.round(num("cumulative-layout-shift") * 1000) / 1000, SI: Math.round(num("speed-index")),
    kb: Math.round(num("total-byte-weight") / 1024), req: a["network-requests"].details.items.length,
    final: (() => { try { return new URL(rep.finalDisplayedUrl).pathname; } catch (e) { return null; } })(),
  });
  // 速さ以外で落ちた監査
  for (const [cid, c] of Object.entries(rep.categories)) {
    if (cid === "performance") continue;
    for (const ref of c.auditRefs) {
      const x = a[ref.id];
      if (x && x.score !== null && x.score < 1 && !["manual", "notApplicable", "informative"].includes(x.scoreDisplayMode)) { const key = `${cid} | ${ref.id} | ${x.title}`; (fails[key] = fails[key] || new Set()).add(pathOf[s] || s); }
    }
  }
  if (form === "mobile") {
    const lcpItems = a["lcp-breakdown-insight"]?.details?.items || [];
    const lcpNode = lcpItems.find((i) => i.type === "node") || a["largest-contentful-paint-element"]?.details?.items?.[0]?.items?.[0]?.node;
    const breakdown = lcpItems.find((i) => i.type === "table")?.items?.map((i) => `${i.label || i.subpart} ${Math.round(i.duration)}ms`);
    const cls = (a["cls-culprits-insight"]?.details?.items || []).flatMap((i) => i.items || []).filter((i) => i.node).slice(0, 4).map((i) => ({ el: (i.node.snippet || i.node.nodeLabel || "").slice(0, 140), score: i.score }));
    const reqs = a["network-requests"].details.items;
    const by = {}; const third = {};
    for (const r of reqs) {
      const t = r.resourceType || "other"; by[t] = by[t] || { n: 0, kb: 0 }; by[t].n++; by[t].kb += (r.transferSize || 0) / 1024;
      let h = ""; try { h = new URL(r.url).host; } catch (e) {}
      // 接続先の名前(プロジェクトの識別子)は残さない
      const name = h && h.replace(/^[a-z0-9-]+\.supabase\.co$/, "(Supabase)");
      if (h && h !== new URL(origin).host) third[name] = (third[name] || 0) + (r.transferSize || 0) / 1024;
    }
    details.push({
      page: pathOf[s] || s, perf: Math.round(rep.categories.performance.score * 100),
      lcpElement: (lcpNode?.snippet || "").slice(0, 200), lcpLabel: (lcpNode?.nodeLabel || "").slice(0, 60), lcpBreakdown: breakdown || null,
      lcpLazy: /loading="lazy"/.test(lcpNode?.snippet || ""),
      clsCulprits: cls,
      insights: Object.values(a).filter((x) => /-insight$/.test(x.id) && x.score !== null && x.score < 1).map((x) => x.id + (x.displayValue ? `(${x.displayValue})` : "")),
      transfer: Object.fromEntries(Object.entries(by).sort((x, y) => y[1].kb - x[1].kb).map(([t, v]) => [t, { n: v.n, kb: Math.round(v.kb) }])),
      thirdParty: Object.fromEntries(Object.entries(third).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([h, kb]) => [h, Math.round(kb)])),
    });
  }
}
rows.sort((a, b) => (a.form === b.form ? pages.indexOf(a.page) - pages.indexOf(b.page) : a.form === "mobile" ? -1 : 1));

if (!rows.length) { console.error("まとめる結果がありません。"); process.exit(1); }

const grade = (r) => ({ LCP: r.LCP <= 2500 ? "良" : r.LCP <= 4000 ? "要改善" : "悪い", CLS: r.CLS <= 0.1 ? "良" : r.CLS <= 0.25 ? "要改善" : "悪い", TBT: r.TBT <= 200 ? "良" : r.TBT <= 600 ? "要改善" : "悪い" });
console.log(`\n測った先: ${origin}   GA への送信(collect): ${collect} 件${collect ? " ← 計測が混ざっている。自動ブラウザの除外を確かめる" : ""}`);
console.log(["ページ", "形", "回", "点", "幅", "FCP", "LCP", "TBT", "CLS", "SI", "KB", "req", "a11y", "BP", "SEO"].join("\t"));
for (const r of rows) console.log([r.page, r.form, r.n, r.perf, r.perfMin + "-" + r.perfMax, r.FCP, r.LCP, r.TBT, r.CLS, r.SI, r.kb, r.req, r.a11y, r.bp, r.seo].join("\t"));
console.log("\nスマホの条件での中身");
for (const d of details) {
  console.log(`\n## ${d.page} (${d.perf})`);
  console.log(`  LCP の要素: ${d.lcpElement || "—"}${d.lcpLazy ? "  ← loading=lazy が付いている" : ""}`);
  if (d.lcpBreakdown) console.log(`  LCP の内訳: ${d.lcpBreakdown.join(" / ")}`);
  if (d.clsCulprits.length) console.log(`  ずれの元: ${d.clsCulprits.map((c) => `${c.el}${c.score !== undefined ? ` (${c.score})` : ""}`).join("\n            ")}`);
  console.log(`  指摘: ${d.insights.join(", ") || "なし"}`);
  console.log(`  転送: ${Object.entries(d.transfer).map(([t, v]) => `${t} ${v.n}件 ${v.kb}KB`).join(" / ")}`);
  console.log(`  他所: ${Object.entries(d.thirdParty).map(([h, kb]) => `${h} ${kb}KB`).join(" / ") || "なし"}`);
}
console.log("\n速さ以外で落ちた監査(Lighthouse)");
const failRows = Object.entries(fails).sort().map(([k, v]) => ({ audit: k, pages: [...v] }));
for (const f of failRows) console.log(`  ${f.audit} ← ${f.pages.length} ページ: ${f.pages.join(" ").slice(0, 200)}`);

writeJson("perf.json", { origin, rows, details, fails: failRows }, true);
const mob = rows.filter((r) => r.form === "mobile");
const desk = rows.filter((r) => r.form === "desktop");
writeSummary("perf", {
  origin, runs, gaCollect: collect,
  mobile: Object.fromEntries(mob.map((r) => [r.page, { perf: r.perf, range: [r.perfMin, r.perfMax], FCP: r.FCP, LCP: r.LCP, TBT: r.TBT, CLS: r.CLS, kb: r.kb, req: r.req, a11y: r.a11y, bp: r.bp, seo: r.seo, grade: grade(r) }])),
  desktop: Object.fromEntries(desk.map((r) => [r.page, { perf: r.perf, LCP: r.LCP, TBT: r.TBT, CLS: r.CLS }])),
  totals: {
    pages: mob.length,
    perfMedian: mob.length ? median(mob.map((r) => r.perf)) : null,
    perfMin: mob.length ? Math.min(...mob.map((r) => r.perf)) : null,
    lcpOver2500: mob.filter((r) => r.LCP > 2500).length,
    clsOver01: mob.filter((r) => r.CLS > 0.1).length,
    tbtOver200: mob.filter((r) => r.TBT > 200).length,
    lcpLazy: details.filter((d) => d.lcpLazy).length,
  },
});
console.log(`\n書き出し: ${path.join(runDir, "perf.json")}`);
