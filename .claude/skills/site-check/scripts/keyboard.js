// キーボード操作。Tab で順に進み、フォーカスの見え方・固定バーに隠れないか・本文までの回数を見る。
// node keyboard.js [--pages /,/live/] [--tabs 60]
// 機械で分かるのは「印が出るか」「隠れるか」まで。順番が筋の通ったものかは人が見る。
const { config, repoRequire, localOrigin, args, pagesArg, requireLocal, newContext, openPage, sum, writeJson, writeSummary } = require("./lib");

const pages = pagesArg(config.keyboardPages);
const MAX_TABS = Number(args.tabs || 60);

(async () => {
  await requireLocal();
  const { chromium } = repoRequire("playwright");
  const browser = await chromium.launch();
  const out = [];
  for (const vp of config.viewports) {
    // キーボードの確かめなので、スマホ幅でもタッチの扱いにはしない
    const ctx = await newContext(browser, { ...vp, isMobile: false, hasTouch: false }, "dark");
    for (const p of pages) {
      const rec = { viewport: vp.name, path: p };
      try {
        const { page } = await openPage(ctx, localOrigin, p);
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
            const hasOutline = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0;
            const changed = el.__before !== undefined && el.__before !== window.__sig(el);
            // フォーカスした要素の中心と角に、別の要素(固定バーなど)が重なっていないか
            const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2], [r.right - 2, r.bottom - 2]];
            let covered = 0, coverer = null;
            for (const [x, y] of pts) {
              if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { covered++; coverer = coverer || "画面の外"; continue; }
              const top = document.elementFromPoint(x, y);
              if (top && !(top === el || el.contains(top) || top.contains(el))) { covered++; coverer = coverer || top.tagName.toLowerCase() + (typeof top.className === "string" && top.className ? "." + top.className.split(" ").slice(0, 2).join(".") : ""); }
            }
            const where = el.closest("header") ? "header" : el.closest("nav") ? "nav" : el.closest("main,[role=main]") ? "main" : el.closest("footer") ? "footer" : "他";
            return { desc: `${el.tagName.toLowerCase()}(${where})`, inMain: !!el.closest("main,[role=main]"), inIframe: el.tagName === "IFRAME", hasOutline, changed, outline: `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`, coveredPts: covered, coverer };
          });
          if (!info) continue;
          if (info.inMain && reachedMainAt === null) reachedMainAt = i;
          stops.push(info);
          if (info.inIframe) break; // iframe の中へ入ると戻れないので止める
        }
        const none = stops.filter((s) => !s.hasOutline && !s.changed && !s.inIframe);
        Object.assign(rec, {
          tabs: stops.length, reachedMainAt,
          noIndicator: none.length, noIndicatorExamples: [...new Set(none.map((s) => s.desc))].slice(0, 5),
          fullyCovered: stops.filter((s) => s.coveredPts === 3).length,
          partlyCovered: stops.filter((s) => s.coveredPts > 0 && s.coveredPts < 3).length,
          coveredExamples: [...new Set(stops.filter((s) => s.coveredPts > 0).map((s) => `${s.desc} ← ${s.coverer} (${s.coveredPts}/3)`))].slice(0, 5),
          firstStops: stops.slice(0, 6).map((s) => s.desc),
          outlines: [...new Set(stops.map((s) => s.outline))].slice(0, 4),
        });
        await page.close();
      } catch (e) { rec.error = String(e).slice(0, 300); }
      out.push(rec);
      console.log(rec.error ? `${vp.name} ${p} ERR ${rec.error}` : `${vp.name} ${p}  止まった数 ${rec.tabs}  本文まで ${rec.reachedMainAt ?? "届かず"}  印なし ${rec.noIndicator}  全部隠れる ${rec.fullyCovered}  一部隠れる ${rec.partlyCovered}${rec.coveredExamples.length ? "\n    " + rec.coveredExamples.join("\n    ") : ""}`);
    }
    await ctx.close();
  }
  await browser.close();
  writeJson("keyboard.json", out, true);
  const ok = out.filter((r) => !r.error);
  const by = (vp) => { const d = ok.filter((r) => r.viewport === vp); const reach = d.map((r) => r.reachedMainAt).filter((n) => n !== null); return { pages: d.length, stops: sum(d, (r) => r.tabs), noIndicator: sum(d, (r) => r.noIndicator), fullyCovered: sum(d, (r) => r.fullyCovered), partlyCovered: sum(d, (r) => r.partlyCovered), reachedMainMin: reach.length ? Math.min(...reach) : null, reachedMainMax: reach.length ? Math.max(...reach) : null, neverReachedMain: d.filter((r) => r.reachedMainAt === null).map((r) => r.path) }; };
  const summary = { maxTabs: MAX_TABS, errors: out.filter((r) => r.error).map((r) => `${r.viewport}${r.path}`), ...Object.fromEntries(config.viewports.map((v) => [v.name, by(v.name)])) };
  console.log("\nまとめ:", JSON.stringify(summary, null, 1));
  writeSummary("keyboard", summary);
})();
