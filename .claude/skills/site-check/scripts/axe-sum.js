const fs = require("fs");
for (const theme of ["dark", "light"]) {
  const d = JSON.parse(fs.readFileSync(`${__dirname}/axe-${theme}.json`, "utf8"));
  console.log(`\n===== ${theme}: ${d.length} 画面 =====`);
  const rules = {};
  for (const r of d) for (const v of r.violations) { const k = v.id; rules[k] = rules[k] || { impact: v.impact, tags: v.tags.filter((t) => /wcag\d{3,}|best/.test(t)).join(","), help: v.help, pages: new Set(), nodes: 0, ex: [] }; rules[k].pages.add(r.path); rules[k].nodes += v.nodes; if (rules[k].ex.length < 3) rules[k].ex.push(`[${r.viewport} ${r.path}] ${v.examples[0].html.slice(0, 130)} :: ${v.examples[0].summary.replace(/\s+/g, " ").slice(0, 170)}`); }
  for (const [id, v] of Object.entries(rules).sort((a, b) => b[1].pages.size - a[1].pages.size)) { console.log(`\n- ${id} [${v.impact}] ${v.tags} — ${v.pages.size}ページ/${v.nodes}か所 — ${v.help}`); for (const e of v.ex) console.log("    " + e); if (v.pages.size <= 6) console.log("    pages: " + [...v.pages].join(" ")); }
  const clean = d.filter((r) => r.violations.length === 0).length;
  console.log(`\n違反なしの画面: ${clean}/${d.length}`);
  const inc = {}; for (const r of d) for (const v of r.incomplete) inc[v.id] = (inc[v.id] || 0) + v.nodes; console.log("人の確認が要る(incomplete):", JSON.stringify(inc));
  if (theme === "dark") {
    const c = d.map((r) => ({ p: r.path, v: r.viewport, ...r.custom }));
    console.log("\n-- 独自チェック(dark) --");
    console.log("lang:", JSON.stringify(c.reduce((o, r) => { const k = r.p.split("/")[1]; const l = /^(en|ko|zh-hant|zh-hans)$/.test(k) ? k : "ja"; o[l + "→" + r.lang] = (o[l + "→" + r.lang] || 0) + 1; return o; }, {})));
    console.log("h1≠1:", c.filter((r) => r.h1 !== 1 && r.v === "sp").map((r) => `${r.p}(${r.h1})`).join(" "));
    console.log("見出しの飛び:", c.filter((r) => r.headingSkips > 0 && r.v === "sp").map((r) => `${r.p}(${r.headingSkips})`).join(" "));
    console.log("main≠1:", c.filter((r) => r.landmarks.main !== 1 && r.v === "sp").map((r) => `${r.p}(${r.landmarks.main})`).join(" "));
    console.log("スキップリンクあり:", c.filter((r) => r.skipLink).length, "/", c.length, c.find((r) => r.skipLink)?.skipLink || "");
    console.log("横はみ出し:", c.filter((r) => r.overflowX > 0).map((r) => `${r.v}${r.p}(${r.overflowX})`).join(" ") || "なし");
    const sp = c.filter((r) => r.v === "sp");
    console.log("24px未満の押す所(sp): 合計", sp.reduce((a, r) => a + r.targetLt24, 0), "/ 押す所", sp.reduce((a, r) => a + r.interactive, 0), " 44px未満:", sp.reduce((a, r) => a + r.targetLt44, 0));
    console.log(sp.filter((r) => r.targetLt24 > 0).sort((a, b) => b.targetLt24 - a.targetLt24).slice(0, 12).map((r) => `  ${r.p}: ${r.targetLt24} 例 ${r.targetLt24Examples.slice(0, 3).join(" / ")}`).join("\n"));
    console.log("alt無しimg:", sp.reduce((a, r) => a + r.imgNoAlt, 0), " 寸法無しimg:", sp.reduce((a, r) => a + r.imgNoSize, 0), "/", sp.reduce((a, r) => a + r.imgs, 0), " title無しiframe:", sp.reduce((a, r) => a + r.iframeNoTitle, 0), "/", sp.reduce((a, r) => a + r.iframes, 0));
    console.log("ページエラー:", d.filter((r) => r.pageErrors && r.pageErrors.length).map((r) => `${r.viewport}${r.path}: ${r.pageErrors[0]}`).join("\n  ") || "なし");
  }
}
