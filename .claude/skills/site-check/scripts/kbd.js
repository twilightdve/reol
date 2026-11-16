// キーボード操作の確認: Tab で順に進み、フォーカスの見え方・固定バーに隠れないか・本文までの回数を見る。
// REPO=<repo> node kbd.js <origin> <out.json> <path...>
const path = require("path");
const fs = require("fs");
const { chromium, webkit } = require(path.join(process.env.REPO, "node_modules/playwright"));
const [origin, outFile, ...pages] = process.argv.slice(2);
const MAX_TABS = 60;
(async () => {
  const out = [];
  for (const [bname, btype] of [["chromium", chromium]]) {
    const browser = await btype.launch();
    for (const vp of [{ name: "pc", width: 1280, height: 800 }, { name: "sp", width: 390, height: 844 }]) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, locale: "ja-JP" });
      for (const p of pages) {
        const page = await ctx.newPage();
        await page.goto(origin + p, { waitUntil: "load" });
        await page.waitForTimeout(2500);
        // フォーカス前の見た目を控える
        await page.evaluate(() => {
          const sig = (el) => { const s = getComputedStyle(el); return [s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.borderColor, s.backgroundColor, s.color, s.textDecorationLine].join("|"); };
          window.__sig = sig;
          document.querySelectorAll("a[href],button,input,select,textarea,[tabindex],summary").forEach((el) => { el.__before = sig(el); });
        });
        const stops = [];
        let reachedMainAt = null;
        for (let i = 1; i <= MAX_TABS; i++) {
          await page.keyboard.press("Tab");
          const info = await page.evaluate(() => {
            const el = document.activeElement;
            if (!el || el === document.body) return null;
            const s = getComputedStyle(el);
            const r = el.getBoundingClientRect();
            const after = window.__sig(el);
            const hasOutline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
            const changed = el.__before !== undefined && el.__before !== after;
            // フォーカスした要素の中心・四隅に、別の要素(固定バーなど)が重なっていないか
            const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2], [r.right - 2, r.bottom - 2]];
            let covered = 0, coverer = null;
            for (const [x, y] of pts) {
              if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { covered++; coverer = coverer || "画面の外"; continue; }
              const top = document.elementFromPoint(x, y);
              if (top && !(top === el || el.contains(top) || top.contains(el))) { covered++; coverer = coverer || (top.tagName.toLowerCase() + (top.className && typeof top.className === "string" ? "." + top.className.split(" ").slice(0, 2).join(".") : "")); }
            }
            return {
              tag: el.tagName.toLowerCase(), text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 30),
              inMain: !!el.closest("main,[role=main]"), inIframe: el.tagName === "IFRAME",
              hasOutline, changed, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, shadow: s.boxShadow.slice(0, 60),
              coveredPts: covered, coverer, w: Math.round(r.width), h: Math.round(r.height),
            };
          });
          if (!info) continue;
          if (info.inMain && reachedMainAt === null) reachedMainAt = i;
          stops.push(info);
          if (info.inIframe) break; // iframe の中へ入ると戻れないので止める
        }
        const rec = {
          browser: bname, viewport: vp.name, path: p, tabs: stops.length, reachedMainAt,
          noIndicator: stops.filter((s) => !s.hasOutline && !s.changed && !s.inIframe).length,
          noIndicatorExamples: stops.filter((s) => !s.hasOutline && !s.changed && !s.inIframe).slice(0, 5).map((s) => `${s.tag} "${s.text}"`),
          outlineOnly: stops.filter((s) => s.hasOutline).length,
          fullyCovered: stops.filter((s) => s.coveredPts === 3).length,
          partlyCovered: stops.filter((s) => s.coveredPts > 0 && s.coveredPts < 3).length,
          coveredExamples: stops.filter((s) => s.coveredPts > 0).slice(0, 5).map((s) => `${s.tag} "${s.text}" ← ${s.coverer} (${s.coveredPts}/3)`),
          firstStops: stops.slice(0, 6).map((s) => `${s.tag} "${s.text}"`),
          outlines: [...new Set(stops.map((s) => s.outline))].slice(0, 4),
        };
        out.push(rec);
        console.log(JSON.stringify(rec));
        await page.close();
      }
      await ctx.close();
    }
    await browser.close();
  }
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1));
})();
