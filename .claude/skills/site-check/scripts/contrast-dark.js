// ダークテーマ: html に実際の地色を与えてから axe の color-contrast だけを回す(測定のための補正。サイトは変えない)
const fs = require("fs");
const { chromium } = require(process.env.REPO + "/node_modules/playwright");
const axeSrc = fs.readFileSync(__dirname + "/../evaltools/node_modules/axe-core/axe.min.js", "utf8");
const [origin, sampleFile, out] = process.argv.slice(2);
const paths = JSON.parse(fs.readFileSync(sampleFile, "utf8"));
(async () => {
  const b = await chromium.launch(); const res = [];
  for (const vp of [{ n: "sp", width: 390, height: 844, isMobile: true }, { n: "pc", width: 1280, height: 800 }]) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.isMobile, hasTouch: !!vp.isMobile });
    await ctx.addInitScript(() => { try { localStorage.setItem("reol-theme", "dark"); } catch (e) {} });
    for (const path of paths) {
      const p = await ctx.newPage();
      try {
        await p.goto(origin + path, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
        await p.addStyleTag({ content: "html{background-color:rgb(var(--bx-bg))!important}" });
        await p.evaluate(axeSrc);
        const r = await p.evaluate(async () => { const r = await axe.run(document, { runOnly: ["color-contrast"], iframes: false }); const f = (a) => a.flatMap((v) => v.nodes.map((n) => ({ html: n.html.slice(0, 160), d: (n.any[0] && n.any[0].data) || null, msg: (n.any[0] && n.any[0].message) || "" }))); return { v: f(r.violations), inc: f(r.incomplete).length, pass: r.passes.reduce((a, v) => a + v.nodes.length, 0) }; });
        res.push({ path, viewport: vp.n, ...r }); console.log(vp.n, path, "違反", r.v.length, "要確認", r.inc, "合格", r.pass);
      } catch (e) { console.log("ERR", path, e.message.slice(0, 100)); }
      await p.close();
    }
    await ctx.close();
  }
  await b.close(); fs.writeFileSync(out, JSON.stringify(res));
})();
