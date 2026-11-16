// axe-core と、機械で見られる範囲の独自チェック。
// REPO=<repo> node a11y.js <origin> <sample.json> <out.json> [theme]
const path = require("path");
const fs = require("fs");
const { chromium } = require(path.join(process.env.REPO, "node_modules/playwright"));
const AXE = fs.readFileSync(path.join(__dirname, "../evaltools/node_modules/axe-core/axe.min.js"), "utf8");
const [origin, sampleFile, outFile, theme = "dark"] = process.argv.slice(2);
const pages = JSON.parse(fs.readFileSync(sampleFile, "utf8"));
const VIEWPORTS = [
  { name: "sp", width: 390, height: 844, isMobile: true, hasTouch: true },
  { name: "pc", width: 1280, height: 800 },
];

(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: !!vp.isMobile,
      hasTouch: !!vp.hasTouch,
      locale: "ja-JP",
    });
    await ctx.addInitScript((t) => {
      try { localStorage.setItem("reol-theme", t); } catch (e) {}
    }, theme);
    for (const p of pages) {
      const page = await ctx.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
      const rec = { path: p, viewport: vp.name, theme };
      try {
        const res = await page.goto(origin + p, { waitUntil: "load", timeout: 45000 });
        rec.status = res && res.status();
        await page.waitForTimeout(2500);
        await page.addScriptTag({ content: AXE });
        const r = await page.evaluate(async () => {
          // iframe の中(YouTube・Spotify・地図)は他所のものなので見ない
          return await window.axe.run(document, {
            iframes: false,
            runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
            resultTypes: ["violations", "incomplete"],
          });
        });
        const slim = (list) => list.map((v) => ({
          id: v.id, impact: v.impact, tags: v.tags.filter((t) => /^wcag|best/.test(t)), help: v.help, nodes: v.nodes.length,
          examples: v.nodes.slice(0, 3).map((n) => ({ target: n.target.join(" "), html: n.html.slice(0, 200), summary: (n.failureSummary || "").slice(0, 240) })),
        }));
        rec.violations = slim(r.violations);
        rec.incomplete = slim(r.incomplete).map((v) => ({ id: v.id, nodes: v.nodes }));
        rec.custom = await page.evaluate(() => {
          const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
          const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(vis).map((h) => Number(h.tagName[1]));
          let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skips++;
          const inter = [...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=link],summary")].filter(vis);
          // 2.5.8 の例外のうち機械で分かるもの: 文の中のリンク(inline)は除く
          const inlineInText = (el) => getComputedStyle(el).display.startsWith("inline") && el.parentElement && [...el.parentElement.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
          const small = inter.filter((el) => { const r = el.getBoundingClientRect(); return (r.width < 24 || r.height < 24) && !inlineInText(el); });
          const lt44 = inter.filter((el) => { const r = el.getBoundingClientRect(); return (r.width < 44 || r.height < 44) && !inlineInText(el); });
          const desc = (el) => { const r = el.getBoundingClientRect(); return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 24)}" ${Math.round(r.width)}x${Math.round(r.height)}`; };
          const first = inter[0];
          return {
            lang: document.documentElement.lang,
            title: document.title,
            h1: hs.filter((n) => n === 1).length,
            headings: hs.length,
            headingSkips: skips,
            landmarks: { main: document.querySelectorAll("main,[role=main]").length, nav: document.querySelectorAll("nav,[role=navigation]").length, header: document.querySelectorAll("header,[role=banner]").length, footer: document.querySelectorAll("footer,[role=contentinfo]").length },
            skipLink: !!first && /^#/.test(first.getAttribute("href") || "") ? (first.textContent || "").trim().slice(0, 30) : null,
            interactive: inter.length,
            targetLt24: small.length,
            targetLt24Examples: small.slice(0, 6).map(desc),
            targetLt44: lt44.length,
            overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            imgs: document.images.length,
            imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
            imgNoSize: [...document.images].filter((i) => !(i.getAttribute("width") && i.getAttribute("height"))).length,
            iframes: document.querySelectorAll("iframe").length,
            iframeNoTitle: [...document.querySelectorAll("iframe")].filter((f) => !f.title).length,
          };
        });
        rec.pageErrors = errors;
      } catch (e) {
        rec.error = String(e).slice(0, 300);
      }
      out.push(rec);
      console.log(vp.name, p, rec.status, rec.error ? "ERR" : `violations=${rec.violations.length}`);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
})();
